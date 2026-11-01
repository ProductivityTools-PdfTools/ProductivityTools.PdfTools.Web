import { HttpErrorResponse, HttpEventType, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { StatusService } from './status.service';

/**
 * Reports every HTTP call in the session bar: "POST images-to-pdf..." while
 * pending and "POST images-to-pdf completed" / "... failed (500)" with duration.
 */
export const statusInterceptor: HttpInterceptorFn = (req, next) => {
  const status = inject(StatusService);
  const name = `${req.method} ${endpointName(req.url)}`;
  const id = status.start(`${name}...`);
  let finished = false;

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event.type === HttpEventType.Response) {
          finished = true;
          status.success(id, `${name} completed`);
        }
      },
      error: (err: unknown) => {
        finished = true;
        const code = err instanceof HttpErrorResponse && err.status ? ` (${err.status})` : '';
        status.error(id, `${name} failed${code}`);
      },
      finalize: () => {
        if (!finished) {
          status.warn(`${name} cancelled`);
        }
      },
    })
  );
};

function endpointName(url: string): string {
  const path = url.split('?')[0];
  const apiIndex = path.indexOf('/api/');
  return apiIndex >= 0 ? path.substring(apiIndex + 5) : path;
}
