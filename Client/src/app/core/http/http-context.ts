import { HttpContextToken } from '@angular/common/http';

/** Skip Bearer header and 401 refresh handling (login, signup, refresh). */
export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);
