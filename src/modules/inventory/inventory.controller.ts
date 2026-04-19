import { Controller, Get, UseGuards } from "@nestjs/common";
import { InventoryService } from "./inventory.service";
import { AuthGuard } from "@nestjs/passport";

@Controller("inventory")
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @UseGuards(AuthGuard("jwt"))
  async getInventory() {
    const inventory = await this.inventoryService.getInventory();
    return {
      message: "Inventory list retrieved",
      data: inventory,
    };
  }
}
