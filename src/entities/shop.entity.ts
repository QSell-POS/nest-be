import { Unit } from "./unit.entity"
import { Brand } from "./brand.entity";
import { Product } from "./product.entity";
import { Purchase } from "./purchase.entity";
import { Category } from "./category.entity";
import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";

@Entity("shops")
export class Shop {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  ownerId: string;

  @Column({ default: "" })
  name: string;

  @OneToMany(() => Product, (product) => product.shop)
  products: Product[];

  @OneToMany(() => Purchase, (purchase) => purchase.shop)
  purchases: Purchase[];

  @OneToMany(() => Brand, (brand) => brand.shop)
  brands: Brand[];

  @OneToMany(() => Category, (category) => category.shop)
  categories: Category[];

  @OneToMany(() => Unit, (unit) => unit.shop)
  units: Unit[];
}
