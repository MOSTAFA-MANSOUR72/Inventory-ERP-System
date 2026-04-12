import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, UserRole } from '../../core/models/user.model';

export interface UserListResponse {
  status: string;
  results: number;
  total: number;
  page: number;
  pages: number;
  data: { users: User[] };
}

@Injectable({ providedIn: 'root' })
export class UserAdminService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/users`;

  list(params?: { page?: number; limit?: number }): Observable<UserListResponse> {
    const p: Record<string, string> = {};
    if (params?.page != null) p['page'] = String(params.page);
    if (params?.limit != null) p['limit'] = String(params.limit);
    return this.http.get<UserListResponse>(this.base, { params: p });
  }

  listByManager(params?: { page?: number; limit?: number }): Observable<UserListResponse> {
    const p: Record<string, string> = {};
    if (params?.page != null) p['page'] = String(params.page);
    if (params?.limit != null) p['limit'] = String(params.limit);
    return this.http.get<UserListResponse>(`${this.base}/manager`, { params: p });
  }

  getById(id: string): Observable<{ data: { user: User } }> {
    return this.http.get<{ data: { user: User } }>(`${this.base}/${id}`);
  }

  create(body: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role?: UserRole;
    branch?: string;
  }): Observable<{ data: { user: User } }> {
    return this.http.post<{ data: { user: User } }>(`${this.base}`, body);
  }

  update(id: string, body: Partial<User>): Observable<{ data: { user: User } }> {
    return this.http.put<{ data: { user: User } }>(`${this.base}/${id}`, body);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
