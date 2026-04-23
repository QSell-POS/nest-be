import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Shop } from 'src/modules/shops/entities/shop.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateShopDto, UpdateShopDto } from './dto/shop.dto';

@Injectable()
export class ShopsService {
  constructor(@InjectRepository(Shop) private shops: Repository<Shop>) {}

  findAll() {
    return this.shops.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const s = await this.shops.findOne({ where: { id } });
    if (!s) throw new NotFoundException('Shop not found');
    return s;
  }

  async create(dto: CreateShopDto, ownerId: string) {
    const shop = this.shops.create({ ...dto, ownerId });
    return this.shops.save(shop);
  }

  async update(id: string, dto: UpdateShopDto) {
    const s = await this.findOne(id);
    return this.shops.save(Object.assign(s, dto));
  }

  getMyShop(shopId: string) {
    return this.findOne(shopId);
  }
}
