import { Controller, Get } from '@nestjs/common';

@Controller('product')
export class ProductController {
    @Get()
    getAllProducts() {
        return {
            message: "Product API working 🚀",
            data: []
        };
    }

    @Get('test')
    testApi() {
        return {
            status: "ok",
            time: new Date()
        };
    }
}
