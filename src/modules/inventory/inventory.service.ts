import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Inventory, InventoryLedger } from "src/entities/inventory.entity";

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private inventory: Repository<Inventory>,

    @InjectRepository(InventoryLedger)
    private inventoryLedger: Repository<InventoryLedger>,
  ) {}

  async getInventory() {
    const list = await this.inventory.find({
      relations: [
        "product",
        "product.brand",
        "product.category",
        "product.baseUnit",
      ],
    });

    return list.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      brandName: item.product.brand.name,
      categoryName: item.product.category.name,
      baseUnit: item.product.baseUnit.name,
      stockInBaseUnit: item.stockInBaseUnit,
    }));
  }
}
