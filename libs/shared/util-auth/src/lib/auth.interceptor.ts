import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenService } from './token.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const tokenService = inject(TokenService);

  const accessToken = tokenService.getAccessToken();
  const tenant = tokenService.tenant();

  let authenticatedReq = req;

  if (accessToken) {
    authenticatedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  if (tenant) {
    authenticatedReq = authenticatedReq.clone({
      setHeaders: {
        'X-Tenant-ID': tenant.id,
      },
    });
  }

  return next(authenticatedReq);
};
