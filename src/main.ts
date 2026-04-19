import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ValidationFilter } from "./common/validationFilter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // for parsing cookies in incoming requests
  app.use(cookieParser());

  app.useGlobalFilters(new ValidationFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
