import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantUser } from '../tenant-user/entities/tenant-user.entity';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, TenantUser])],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
