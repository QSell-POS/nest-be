import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';

import { Product } from 'src/modules/products/entities/product.entity';
import { PriceType, ProductPrice } from './entities/product-price.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { CreateProductDto, ProductFilterDto, UpdateProductDto, UpdateProductPriceDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductPrice)
    private priceRepository: Repository<ProductPrice>,
    @InjectRepository(InventoryItem)
    private inventoryRepository: Repository<InventoryItem>,
    private dataSource: DataSource,
  ) {}

  async findAll(filters: ProductFilterDto, shopId: string) {
    const { search, categoryId, brandId, status, lowStock, page = 1, limit = 20 } = filters;

    const qb = this.productRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.brand', 'brand')
      .leftJoinAndSelect('p.category', 'category')
      .leftJoinAndSelect('p.unit', 'unit')
      .leftJoinAndSelect('p.prices', 'price', 'price.isCurrent = true AND price.priceType = :retailType', { retailType: PriceType.RETAIL })
      .leftJoinAndSelect('p.inventoryItems', 'inv')
      .where('p.shopId = :shopId', { shopId })
      .andWhere('p.deletedAt IS NULL');

    if (search) {
      qb.andWhere('(p.name ILIKE :search OR p.sku ILIKE :search OR p.barcode ILIKE :search)', { search: `%${search}%` });
    }
    if (categoryId) qb.andWhere('p.categoryId = :categoryId', { categoryId });
    if (brandId) qb.andWhere('p.brandId = :brandId', { brandId });
    if (status) qb.andWhere('p.status = :status', { status });
    if (lowStock) {
      qb.andWhere('inv.quantityAvailable <= p.minStockLevel');
    }

    const total = await qb.getCount();
    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('p.createdAt', 'DESC')
      .getMany();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, shopId: string) {
    const product = await this.productRepository.findOne({
      where: { id, shopId },
      relations: ['brand', 'category', 'unit', 'prices', 'inventoryItems'],
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findByBarcode(barcode: string, shopId: string) {
    const product = await this.productRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.brand', 'brand')
      .leftJoinAndSelect('p.unit', 'unit')
      .leftJoinAndSelect('p.prices', 'price', 'price.isCurrent = true AND price.priceType = :retailType', { retailType: PriceType.RETAIL })
      .leftJoinAndSelect('p.inventoryItems', 'inv')
      .where('p.barcode = :barcode AND p.shopId = :shopId', { barcode, shopId })
      .getOne();

    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async getPriceHistory(productId: string, shopId: string) {
    return this.priceRepository.find({
      where: { productId, shopId },
      order: { createdAt: 'DESC' },
    });
  }

  async getCurrentPrice(productId: string, priceType: PriceType, shopId: string): Promise<number> {
    const price = await this.priceRepository.findOne({
      where: { productId, priceType, isCurrent: true, shopId },
    });
    return price?.price ?? 0;
  }

  async create(dto: CreateProductDto, shopId: string, userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create product
      const product = queryRunner.manager.create(Product, {
        ...dto,
        shopId,
      });
      const saved = await queryRunner.manager.save(Product, product);

      // Create retail price
      const prices: Partial<ProductPrice>[] = [];
      prices.push({
        productId: saved.id,
        priceType: PriceType.RETAIL,
        price: dto.retailPrice,
        costPrice: dto.purchasePrice,
        isCurrent: true,
        changedBy: userId,
        shopId,
      });

      if (dto.purchasePrice) {
        prices.push({
          productId: saved.id,
          priceType: PriceType.PURCHASE,
          price: dto.purchasePrice,
          isCurrent: true,
          changedBy: userId,
          shopId,
        });
      }

      if (dto.wholesalePrice) {
        prices.push({
          productId: saved.id,
          priceType: PriceType.WHOLESALE,
          price: dto.wholesalePrice,
          isCurrent: true,
          changedBy: userId,
          shopId,
        });
      }

      await queryRunner.manager.save(ProductPrice, prices);

      // Create inventory item
      if (dto.type !== 'service' && dto.type !== 'digital') {
        await queryRunner.manager.save(InventoryItem, {
          productId: saved.id,
          shopId,
          quantityOnHand: 0,
          quantityAvailable: 0,
          quantityReserved: 0,
        });
      }

      await queryRunner.commitTransaction();
      return this.findOne(saved.id, shopId);
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: string, dto: UpdateProductDto, shopId: string) {
    const product = await this.findOne(id, shopId);
    console.log(product, dto);
    Object.assign(product, dto);
    return this.productRepository.save(product);
  }

  async updatePrice(productId: string, dto: UpdateProductPriceDto, shopId: string, userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Expire current price
      await queryRunner.manager.update(
        ProductPrice,
        { productId, priceType: dto.priceType, isCurrent: true, shopId },
        { isCurrent: false, effectiveTo: new Date() },
      );

      // Insert new price
      const newPrice = queryRunner.manager.create(ProductPrice, {
        productId,
        priceType: dto.priceType,
        price: dto.price,
        costPrice: dto.costPrice,
        isCurrent: true,
        changedBy: userId,
        reason: dto.reason,
        shopId,
      });
      await queryRunner.manager.save(ProductPrice, newPrice);
      await queryRunner.commitTransaction();

      return newPrice;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string, shopId: string) {
    const product = await this.findOne(id, shopId);
    if (!product) throw new NotFoundException('Product not found');
    await this.productRepository.softDelete(id);
    return { message: 'Product deleted' };
  }
}
