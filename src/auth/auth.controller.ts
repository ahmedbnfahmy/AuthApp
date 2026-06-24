import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { userId: string, email: string, tenantId: string, role: string }) {
    // In production, you would only accept email/password here.
    // For now, we accept all fields directly to easily generate tokens and test the TenantGuard!
    return this.authService.login(body.userId, body.email, body.tenantId, body.role);
  }
}
