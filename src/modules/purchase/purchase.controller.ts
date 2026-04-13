import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { PurchaseDto } from "./purchase.dto";
import { PurchaseService } from "./purchase.service";

@Controller("purchase")
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Get()
  @UseGuards(AuthGuard("jwt"))
  async getPurchases(@Req() req) {
    return this.purchaseService.getPurchases(req.user.shopId);
  }

  @Get(":id")
  @UseGuards(AuthGuard("jwt"))
  async getPurchase(@Req() req) {
    const purchases = await this.purchaseService.getSinglePurchase(
      req.params.purchaseId,
    );
    if (!purchases) {
      throw new NotFoundException("Purchase not found");
    }
    return purchases;
  }

  @Post()
  @UseGuards(AuthGuard("jwt"))
  async createPurchase(@Body() purchaseDto: PurchaseDto) {
    return this.purchaseService.createPurchase(purchaseDto);
  }
}
