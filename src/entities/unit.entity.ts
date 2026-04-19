import { Product } from "./product.entity";
import { Shop } from "./shop.entity";
import {
  Column,
  Entity,
  Unique,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
} from "typeorm";

@Entity("units")
@Unique(["name", "shopId"])
export class Unit {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 10 })
  code: string;

  @Column({ length: 50 })
  name: string;

  @Column()
  shopId: string;

  @Column({ type: "float", default: 1 })
  baseMultiplier: number;

  @ManyToOne(() => Shop, (shop) => shop.units, { onDelete: "CASCADE" })
  @JoinColumn({ name: "shopId" })
  shop: Shop;

  @OneToMany(() => Product, (product) => product.baseUnit)
  products: Product[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
