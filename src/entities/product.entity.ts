import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Shop } from "./shop.entity";

@Entity("products")
@Index(["shopId", "sku"], { unique: true })
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  shopId: string;

  @ManyToOne(() => Shop, (shop) => shop.products, { onDelete: "CASCADE" })
  @JoinColumn({ name: "shopId" })
  shop: Shop;

  @Column()
  name: string;

  @Column()
  sku: string;

  description?: string;
  barcode?: string;

  @Column({ default: "pcs" })
  unit: string;

  @Column({ type: "int", default: 0 })
  lowStockAlert: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
