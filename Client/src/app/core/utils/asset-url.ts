import { environment } from '../../../environments/environment';

/** Resolves Express static paths like `/images/...` for `<img src>`. */
export function assetUrl(path: string | undefined | null): string {
  if (!path) {
    return '';
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${environment.assetBaseUrl}${path}`;
}
