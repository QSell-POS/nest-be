import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from "@nestjs/common";

@Catch(BadRequestException)
export class ValidationFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const res = exception.getResponse() as any;

    const formattedErrors: Record<string, string> = {};

    if (Array.isArray(res.message)) {
      res.message.forEach((msg: string) => {
        const field = msg.split(" ")[0];
        formattedErrors[field] = msg;
      });
    }

    response.status(400).json({
      statusCode: 400,
      message: "Bad Request",
      errors: formattedErrors,
    });
  }
}
