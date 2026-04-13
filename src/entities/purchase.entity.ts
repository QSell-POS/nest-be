import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Shop } from "./shop.entity";
import { PurchaseItem } from "./purchase-item.entity";

@Entity("purchases")
export class Purchase {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  shopId: string;

  @ManyToOne(() => Shop, (shop) => shop.purchases, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "shopId" })
  shop: Shop;

  @Column({ nullable: true })
  supplierName: string;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ default: "pending" })
  status: "pending" | "paid" | "partial";

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => PurchaseItem, (item) => item.purchase, {
    cascade: true,
  })
  items: PurchaseItem[];
}
