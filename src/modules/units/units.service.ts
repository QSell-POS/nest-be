import { InjectRepository } from '@nestjs/typeorm';
import { Unit } from './entities/unit.entity';
import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUnitDto, UpdateUnitDto } from './dto/unit.dto';

@Injectable()
export class UnitsService {
  constructor(@InjectRepository(Unit) private repo: Repository<Unit>) {}

  findAll(shopId: string) {
    return this.repo.find({ where: { shopId }, order: { name: 'ASC' } });
  }

  async findOne(id: string, shopId: string) {
    const u = await this.repo.findOne({ where: { id, shopId } });
    if (!u) throw new NotFoundException('Unit not found');
    return u;
  }

  create(dto: CreateUnitDto, shopId: string) {
    return this.repo.save(this.repo.create({ ...dto, shopId }));
  }

  async update(id: string, dto: UpdateUnitDto, shopId: string) {
    const u = await this.findOne(id, shopId);
    return this.repo.save(Object.assign(u, dto));
  }

  async remove(id: string, shopId: string) {
    const u = await this.findOne(id, shopId);
    if (!u) throw new NotFoundException('Unit not found');
    await this.repo.softDelete(id);
    return { message: 'Unit deleted' };
  }
}
