import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from "@nestjs/common";

import { Repository } from "typeorm";
import { PurchaseDto } from "./purchase.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Purchase } from "src/entities/purchase.entity";
import { PurchaseItem } from "src/entities/purchase-item.entity";

@Injectable()
export class PurchaseService {
  constructor(
    @InjectRepository(Purchase)
    private purchases: Repository<Purchase>,
    @InjectRepository(PurchaseItem)
    private purchaseItems: Repository<PurchaseItem>,
  ) {}

  async getPurchases(shopId: string) {
    return await this.purchases.find({
      where: { shopId },
      relations: ["items"],
    });
  }

  async getSinglePurchase(purchaseId: string) {
    return await this.purchases.findOne({
      where: { id: purchaseId },
      relations: ["items", "items.product"],
    });
  }

  async createPurchase(purchaseDto: PurchaseDto) {
    try {
      const items = purchaseDto.items.map((item) =>
        this.purchaseItems.create({
          productId: item.productId,
          quantity: item.quantity,
          costPrice: item.costPrice,
          total: item.total || item.quantity * item.costPrice,
        }),
      );

      const totalAmount = items.reduce(
        (sum, item) => sum + Number(item.total),
        0,
      );

      const purchase = this.purchases.create({
        shopId: purchaseDto.shopId,
        supplierName: purchaseDto.supplierName,
        totalAmount,
        items,
      });

      return await this.purchases.save(purchase);
    } catch (error: any) {
      if (error.code === "23503") {
        throw new BadRequestException(
          "Invalid productId or shopId. One or more references do not exist",
        );
      }

      if (error.code === "23502") {
        throw new BadRequestException("Missing required purchase data");
      }

      throw new InternalServerErrorException("Failed to create purchase");
    }
  }
}
