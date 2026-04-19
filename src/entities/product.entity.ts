import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Shop } from "./shop.entity";
import { Unit } from "./unit.entity";
import { Brand } from "./brand.entity";
import { Category } from "./category.entity";
import { Inventory } from "./inventory.entity";

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
  brandId: string;

  @ManyToOne(() => Brand, (brand) => brand.products, { onDelete: "CASCADE" })
  @JoinColumn({ name: "brandId" })
  brand: Brand;

  @Column()
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "categoryId" })
  category: Category;

  @OneToOne(() => Inventory, (inventory) => inventory.product, {
    onDelete: "CASCADE",
  })
  inventory: Inventory;

  @Column()
  name: string;

  @Column()
  sku: string;

  description?: string;
  barcode?: string;

  @Column()
  baseUnitId: string;

  @ManyToOne(() => Unit, (unit) => unit.products, { onDelete: "CASCADE" })
  baseUnit: Unit;

  @Column({ type: "int", default: 0 })
  stockThreshold: number;

  @Column("decimal", { precision: 10, scale: 2 })
  sellingPrice: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
