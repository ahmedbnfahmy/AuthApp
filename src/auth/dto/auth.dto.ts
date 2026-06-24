import { IsEmail, IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { TenantRole } from '../../common/enums/tenant-role.enum';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;
}

export class CreatePortalDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase letters, numbers, and hyphens',
  })
  slug: string;

  @IsEmail()
  moderatorEmail: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  moderatorPassword: string;
}

export class AddMemberDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password?: string;

  @IsEnum(TenantRole)
  role: TenantRole;
}

export class UpdateMemberRoleDto {
  @IsEnum(TenantRole)
  role: TenantRole;
}
