import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModeratorPortal } from './entities/moderator-portal.entity';
import { ModeratorPortalService } from './moderator-portal.service';

@Module({
  imports: [TypeOrmModule.forFeature([ModeratorPortal])],
  providers: [ModeratorPortalService],
  exports: [ModeratorPortalService],
})
export class ModeratorPortalModule {}
