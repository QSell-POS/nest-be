import {
  Column,
  Entity,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Product } from "./product.entity";

export enum StockType {
  PURCHASE = "PURCHASE",
  SALE = "SALE",
  PURCHASE_RETURN = "PURCHASE_RETURN",
  SALE_RETURN = "SALE_RETURN",
  ADJUSTMENT = "ADJUSTMENT",
  DAMAGE = "DAMAGE",
  OPENING = "OPENING",
}

@Entity()
@Unique(["shopId", "productId"])
export class Inventory {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  shopId: string;

  @Column()
  productId: string;

  @OneToOne(() => Product, (product) => product.inventory, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "productId" })
  product: Product;

  @Column({ type: "int", default: 0 })
  stockInBaseUnit: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity("inventory_ledger")
export class InventoryLedger {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  shopId: string;

  @Column()
  productId: string;

  @Column({ type: "enum", enum: StockType })
  type: StockType;

  @Column({ type: "int" })
  quantityChange: number;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;
}
