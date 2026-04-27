import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockTransfer, StockTransferItem, TransferStatus } from './entities/stock-transfer.entity';
import { CreateStockTransferDto, ReceiveTransferDto, StockTransferFilterDto } from './dto/stock-transfer.dto';
import { buildPaginationMeta } from 'src/common/dto/pagination.dto';

@Injectable()
export class StockTransferService {
  constructor(
    @InjectRepository(StockTransfer)
    private readonly repo: Repository<StockTransfer>,
    @InjectRepository(StockTransferItem)
    private readonly itemRepo: Repository<StockTransferItem>,
  ) {}

  async create(dto: CreateStockTransferDto, fromShopId: string, userId: string) {
    if (dto.toShopId === fromShopId) {
      throw new BadRequestException('Source and destination shops cannot be the same');
    }

    const ref = `TRF-${Date.now()}`;
    const transfer = this.repo.create({
      fromShopId,
      toShopId: dto.toShopId,
      referenceNumber: ref,
      transferredBy: userId,
      notes: dto.notes,
      status: TransferStatus.PENDING,
    });
    const saved = await this.repo.save(transfer);

    const items = dto.items.map((i) =>
      this.itemRepo.create({
        transferId: saved.id,
        productId: i.productId,
        quantity: i.quantity,
        notes: i.notes,
      }),
    );
    await this.itemRepo.save(items);

    const result = await this.findOne(saved.id, fromShopId);
    return { data: result.data, message: 'Stock transfer created' };
  }

  async send(id: string, shopId: string) {
    const t = await this.repo.findOne({
      where: { id, fromShopId: shopId, status: TransferStatus.PENDING },
    });
    if (!t) throw new NotFoundException('Transfer not found or not in PENDING status');

    await this.repo.update(id, { status: TransferStatus.IN_TRANSIT, sentAt: new Date() });
    return { data: null, message: 'Transfer sent' };
  }

  async receive(id: string, dto: ReceiveTransferDto, toShopId: string, userId: string) {
    const t = await this.repo.findOne({
      where: { id, toShopId, status: TransferStatus.IN_TRANSIT },
      relations: ['items'],
    });
    if (!t) throw new NotFoundException('Transfer not found or not in IN_TRANSIT status');

    for (const recv of dto.items) {
      await this.itemRepo.update(recv.transferItemId, {
        receivedQuantity: recv.receivedQuantity,
      });
    }

    await this.repo.update(id, {
      status: TransferStatus.RECEIVED,
      receivedAt: new Date(),
      receivedBy: userId,
      ...(dto.notes ? { notes: dto.notes } : {}),
    });

    return { data: null, message: 'Transfer received' };
  }

  async cancel(id: string, shopId: string) {
    const t = await this.repo.findOne({
      where: { id, fromShopId: shopId },
    });
    if (!t) throw new NotFoundException('Transfer not found');

    if (t.status === TransferStatus.RECEIVED) {
      throw new BadRequestException('Cannot cancel a received transfer');
    }
    if (t.status === TransferStatus.CANCELLED) {
      throw new BadRequestException('Transfer is already cancelled');
    }

    await this.repo.update(id, { status: TransferStatus.CANCELLED });
    return { data: null, message: 'Transfer cancelled' };
  }

  async findAll(shopId: string, filters: StockTransferFilterDto) {
    const { page = 1, limit = 20, status, startDate, endDate } = filters;

    const qb = this.repo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.items', 'items')
      .where('(t.fromShopId = :shopId OR t.toShopId = :shopId)', { shopId });

    if (status) qb.andWhere('t.status = :status', { status });
    if (startDate) qb.andWhere('t.createdAt >= :startDate', { startDate });
    if (endDate) qb.andWhere('t.createdAt <= :endDate', { endDate });

    const total = await qb.getCount();
    const data = await qb
      .orderBy('t.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data,
      message: 'Stock transfers retrieved successfully',
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async findOne(id: string, shopId: string) {
    const t = await this.repo.findOne({
      where: [
        { id, fromShopId: shopId },
        { id, toShopId: shopId },
      ],
      relations: ['items'],
    });
    if (!t) throw new NotFoundException('Transfer not found');
    return { data: t, message: 'Stock transfer retrieved successfully' };
  }
}
