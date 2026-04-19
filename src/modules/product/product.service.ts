import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";
import { Shop } from "src/entities/shop.entity";
import { Product } from "src/entities/product.entity";
import { Repository, DataSource } from "typeorm";
import { ProductDto } from "./product.dto";
import { StockType } from "src/entities/inventory.entity";

@Injectable()
export class ProductService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Shop)
    private shops: Repository<Shop>,
    @InjectRepository(Product)
    private products: Repository<Product>,
  ) {}

  async getProducts() {
    const products = await this.products.find({
      relations: ["baseUnit", "inventory"],
    });
    return products.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      description: product.description,
      barcode: product.barcode,
      sellingPrice: product.sellingPrice,
      stockThreshold: product.stockThreshold,
      isActive: product.isActive,
      baseUnitName: product.baseUnit.name,
      baseUnitCode: product.baseUnit.code,
      stockInBaseUnit: product.inventory
        ? product.inventory.stockInBaseUnit
        : 0,
    }));
  }

  async getProductById(id: string) {
    const product = await this.products.findOne({
      where: { id },
      relations: ["shop", "brand", "category"],
    });
    if (!product) throw new NotFoundException("Product not found");
    return product;
  }

  async create(data: ProductDto) {
    try {
      const { costPrice, quantity = 0, ...rest } = data;
      return await this.dataSource.transaction(async (manager) => {
        // Create product
        const product = manager.create(Product, rest);
        await manager.save(product);

        // Initialize inventory
        const inventory = manager.create("Inventory", {
          shopId: data.shopId,
          productId: product.id,
          stockInBaseUnit: quantity || 0,
        });
        await manager.save(inventory);

        // Log inventory ledger if initial quantity is provided
        if (quantity > 0) {
          const log = manager.create("InventoryLedger", {
            shopId: data.shopId,
            productId: product.id,
            type: StockType.OPENING,
            quantityChange: quantity,
            description: `Initial stock with cost price ${costPrice}`,
          });

          await manager.save(log);
        }
        return product;
      });
    } catch (error: any) {
      if (error.code === "23503") {
        throw new BadRequestException("Shop does not exist");
      }

      if (error.code === "23505") {
        throw new ConflictException(error.detail);
      }
      throw error;
    }
  }

  async deleteProduct(id: string) {
    try {
      const result = await this.products.softDelete(id);
      if (result.affected === 0) {
        throw new NotFoundException("Product not found");
      }
      return {
        message: "Product deleted successfully",
      };
    } catch (error) {
      throw error;
    }
  }
}
