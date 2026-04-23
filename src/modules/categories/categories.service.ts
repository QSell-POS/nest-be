import { TreeRepository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categories: TreeRepository<Category>,
  ) {}

  findAll(shopId: string) {
    return this.categories.findTrees();
  }

  findFlat(shopId: string, search?: string) {
    const qb = this.categories.createQueryBuilder('c').leftJoinAndSelect('c.parent', 'parent').where('c.shopId = :shopId', { shopId });
    if (search) qb.andWhere('c.name ILIKE :search', { search: `%${search}%` });
    return qb.orderBy('c.name', 'ASC').getMany();
  }

  async findOne(id: string, shopId: string) {
    const c = await this.categories.findOne({ where: { id }, relations: ['parent', 'children'] });
    if (!c) throw new NotFoundException('Category not found');
    return c;
  }

  async create(dto: CreateCategoryDto, shopId: string) {
    const category = this.categories.create({ ...dto, shopId });
    if (dto.parentId) {
      const parent = await this.categories.findOne({ where: { id: dto.parentId } });
      if (parent) category.parent = parent;
    }
    return this.categories.save(category);
  }

  async update(id: string, dto: UpdateCategoryDto, shopId: string) {
    const c = await this.findOne(id, shopId);
    return this.categories.save(Object.assign(c, dto));
  }

  async remove(id: string, shopId: string) {
    await this.findOne(id, shopId);
    await this.categories.softDelete(id);
    return { message: 'Category deleted' };
  }
}
