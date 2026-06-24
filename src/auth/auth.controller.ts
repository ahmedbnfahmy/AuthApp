import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TenantRole } from '../common/enums/tenant-role.enum';
import type { RequestWithContext } from '../common/types/request-context';
import { res } from '../common/utils/res.util';
import { RequireTenantGuard } from '../tenant/guards/require-tenant.guard';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { TenantGuard } from './guards/tenant.guard';
import { AuthService } from './auth.service';
import {
  AddMemberDto,
  CreatePortalDto,
  LoginDto,
  UpdateMemberRoleDto,
} from './dto/auth.dto';
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
  @UseGuards(RequireTenantGuard)
  async login(@Body() dto: LoginDto, @Req() req: RequestWithContext) {
    const data = await this.authService.login(
      dto,
      req.tenant!,
      req.portal ?? null,
    );
    return res.ok(data, 'Login successful');
  }

  @Post('portals')
  @UseGuards(RequireTenantGuard, TenantGuard, RolesGuard)
  @Roles(TenantRole.Admin)
  async createPortal(
    @Body() dto: CreatePortalDto,
    @Req() req: RequestWithContext,
  ) {
    if (req.portal) {
      throw new BadRequestException(
        'Portals can only be created on the tenant root host',
      );
    }
    const data = await this.authService.createPortal(dto, req.tenant!);
    return res.created(data, 'Moderator portal created');
  }

  @Get('portals')
  @UseGuards(RequireTenantGuard, TenantGuard, RolesGuard)
  @Roles(TenantRole.Admin)
  async listPortals(@Req() req: RequestWithContext) {
    if (req.portal) {
      throw new BadRequestException(
        'Portals can only be listed on the tenant root host',
      );
    }
    const data = await this.authService.listPortals(req.tenant!);
    return res.ok(data, 'Portals retrieved');
  }

  @Post('members')
  @UseGuards(RequireTenantGuard, TenantGuard, RolesGuard)
  @Roles(TenantRole.Admin, TenantRole.Moderator)
  async addMember(@Body() dto: AddMemberDto, @Req() req: RequestWithContext) {
    const data = await this.authService.addMember(
      dto,
      req.user!.role,
      req.tenant!,
      req.portal ?? null,
    );
    return res.created(data, 'Member added');
  }

  @Patch('members/:userId/role')
  @UseGuards(RequireTenantGuard, TenantGuard, RolesGuard)
  @Roles(TenantRole.Admin, TenantRole.Moderator)
  async updateMemberRole(
    @Param('userId') userId: string,
    @Body() dto: UpdateMemberRoleDto,
    @Req() req: RequestWithContext,
  ) {
    const data = await this.authService.updateMemberRole(
      userId,
      dto,
      req.user!.role,
      req.tenant!,
      req.portal ?? null,
    );
    return res.ok(data, 'Member role updated');
  }
}
