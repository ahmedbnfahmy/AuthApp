import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(userId: string, email: string, tenantId: string, role: string) {
    // In a real scenario, you'd verify passwords and database relations here first!
    
    const payload = { 
      sub: userId, 
      email: email, 
      tenant_id: tenantId, 
      role: role 
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
