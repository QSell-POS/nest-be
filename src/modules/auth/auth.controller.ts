import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async register(@Body() body: { email: string; password: string }) {
    return this.authService.createUser(body.email, body.password);
  }

  @Post('signin')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.authenticateUser(body.email, body.password);
  }

  @Get('user/:id')
  async getUser(@Param('id') id: string) {
    return this.authService.getUser(id);
  }
}