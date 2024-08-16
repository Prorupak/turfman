import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RolesService } from 'src/modules/roles/roles.service';

@Injectable()
export class RolesInterceptor implements NestInterceptor {
  constructor(
    private rolesService: RolesService,
    // private dashboardGateway: DashboardGateway,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(async (data) => {
        const roles = Array.isArray(data)
          ? data
          : await this.rolesService.findAll();

        console.log({ roles });

        // this.dashboardGateway.namespace.emit(
        //   `${EVENTS.LISTENER}:${SOCKET_EVENTS.DASHBOARD_EVENTS.LIST_ROLE}`,
        //   {
        //     roles,
        //   },
        // );

        return data;
      }),
    );
  }
}
