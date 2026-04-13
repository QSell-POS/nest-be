import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Purchase } from "./purchase.entity";
import { Product } from "./product.entity";

@Entity("purchase_items")
export class PurchaseItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  purchaseId: string;

  @ManyToOne(() => Purchase, (purchase) => purchase.items, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "purchaseId" })
  purchase: Purchase;

  @ManyToOne(() => Product, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "productId" })
  product: Product;

  @Column()
  productId: string;

  @Column("int")
  quantity: number;

  @Column("decimal", { precision: 10, scale: 2 })
  costPrice: number;

  @Column("decimal", { precision: 10, scale: 2 })
  total: number;
}
