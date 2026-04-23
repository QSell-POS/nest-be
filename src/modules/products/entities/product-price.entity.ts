import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { TenantBaseEntity } from "src/common/entities/base.entity";
import { Product } from "./product.entity";

export enum PriceType {
  RETAIL = "retail",
  WHOLESALE = "wholesale",
  PURCHASE = "purchase",
  SPECIAL = "special",
}

@Entity("product_prices")
export class ProductPrice extends TenantBaseEntity {
  @Column({ name: "product_id" })
  productId: string;

  @Column({
    type: "enum",
    enum: PriceType,
    default: PriceType.RETAIL,
    name: "price_type",
  })
  priceType: PriceType;

  @Column({ type: "decimal", precision: 12, scale: 2 })
  price: number;

  @Column({
    type: "decimal",
    precision: 12,
    scale: 2,
    nullable: true,
    name: "cost_price",
  })
  costPrice: number;

  @Column({ default: true, name: "is_current" })
  isCurrent: boolean;

  @Column({
    name: "effective_from",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  effectiveFrom: Date;

  @Column({ name: "effective_to", type: "timestamp", nullable: true })
  effectiveTo: Date;

  @Column({ name: "changed_by", nullable: true })
  changedBy: string;

  @Column({ nullable: true, type: "text" })
  reason: string;

  @ManyToOne(() => Product, (product) => product.prices)
  @JoinColumn({ name: "product_id" })
  product: Product;
}
