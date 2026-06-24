import { Body, Controller, Post } from '@nestjs/common';
import { res } from '../common/utils/res.util';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const data = await this.authService.register(dto);
    return res.created(data, 'Registration successful');
  }

  @Post('login')
  async login(
    @Body() body: { userId: string; email: string; tenantId: string; role: string },
  ) {
    const data = await this.authService.login(
      body.userId,
      body.email,
      body.tenantId,
      body.role,
    );

    return res.ok(data, 'Login successful');
  }
}
