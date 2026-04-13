import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ProductService } from "./product.service";
import { AuthGuard } from "@nestjs/passport";
import { ProductDto } from "./product.dto";

@Controller("product")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getProducts() {
    const products = await this.productService.getProducts();
    return {
      message: "Product list retrieved successfully",
      data: products,
    };
  }

  @Post("")
  @UseGuards(AuthGuard("jwt"))
  createProduct(@Body() body: ProductDto, @Req() req: any) {
    return this.productService.create(body);
  }

  @Delete(":id")
  @UseGuards(AuthGuard("jwt"))
  deleteProduct(@Req() req: any) {
    console.log(req.params.id);
    return this.productService.deleteProduct(req.params.id);
  }
}
