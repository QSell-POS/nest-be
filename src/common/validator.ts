import { BadRequestException, ParseUUIDPipe } from '@nestjs/common';

export class UuidParamPipe extends ParseUUIDPipe {
  constructor(paramName = 'id') {
    super({
      version: '4',
      exceptionFactory: () => {
        return new BadRequestException(`${paramName} must be a valid UUID (v4)`);
      },
    });
  }
}
