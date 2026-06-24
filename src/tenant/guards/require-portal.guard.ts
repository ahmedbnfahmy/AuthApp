import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RequestWithContext } from '../../common/types/request-context';

@Injectable()
export class RequirePortalGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithContext>();
    if (!request.tenant || !request.portal) {
      throw new NotFoundException('Moderator portal not found for this host');
    }
    return true;
  }
}
