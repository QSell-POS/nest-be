import { TenantBaseEntity } from 'src/common/entities/base.entity';
import { Product } from 'src/modules/products/entities/product.entity';
import { Entity, Column, OneToMany, JoinColumn, Tree, TreeChildren, TreeParent } from 'typeorm';

@Entity('categories')
@Tree('closure-table')
export class Category extends TenantBaseEntity {
  @Column({ length: 100 })
  name: string;

  @Column({ nullable: true, length: 500 })
  description: string;

  @Column({ nullable: true, length: 255 })
  image: string;

  @Column({ nullable: true, name: 'parent_id' })
  parentId: string;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @TreeParent()
  @JoinColumn({ name: 'parent_id' })
  parent: Category;

  @TreeChildren()
  children: Category[];

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
