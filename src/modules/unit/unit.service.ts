import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Repository } from "typeorm";
import { UpdateUnitDto } from "./unit.dto";
import { Unit } from "src/entities/unit.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class UnitService {
  constructor(
    @InjectRepository(Unit)
    private units: Repository<Unit>,
  ) {}

  async fetch(params: any) {
    return this.units.find({
      where: params,
    });
  }

  async fetchOne(id: string) {
    const unit = await this.units.findOne({
      where: { id },
      relations: ["shop"],
    });
    if (!unit) throw new NotFoundException("Unit not found");

    return unit;
  }

  async create(data: Partial<Unit>) {
    try {
      const unit = this.units.create(data);
      return await this.units.save(unit);
    } catch (error: any) {
      if (error.code === "23503") {
        throw new BadRequestException("Shop does not exist");
      }
      if (error.code === "23505") {
        throw new ConflictException("Unit already exists in this shop");
      }
      throw error;
    }
  }

  async update(id: string, data: UpdateUnitDto) {
    const brand = await this.units.update(id, data);
    if (brand.affected === 0) {
      throw new NotFoundException("Unit not found");
    }
    return { message: "Unit updated successfully" };
  }

  async delete(id: string) {
    const brand = await this.units.findOne({ where: { id } });
    if (!brand) throw new NotFoundException("Unit not found");

    return this.units.remove(brand);
  }
}
