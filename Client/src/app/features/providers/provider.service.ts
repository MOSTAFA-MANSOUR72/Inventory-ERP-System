import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Provider {
  _id: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  manager?: string;
}

@Injectable({ providedIn: 'root' })
export class ProviderService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/providers`;

  list(params?: { page?: number; limit?: number }): Observable<{ data: { providers: Provider[] }; results: number; total: number; page: number; pages: number }> {
    const p: Record<string, string> = {};
    if (params?.page != null) p['page'] = String(params.page);
    if (params?.limit != null) p['limit'] = String(params.limit);
    return this.http.get<{ data: { providers: Provider[] }; results: number; total: number; page: number; pages: number }>(`${this.base}`, { params: p });
  }

  getById(id: string): Observable<{ data: { provider: Provider } }> {
    return this.http.get<{ data: { provider: Provider } }>(`${this.base}/${id}`);
  }

  create(body: { name: string; phone: string; email: string; address?: string }): Observable<{ data: { provider: Provider } }> {
    return this.http.post<{ data: { provider: Provider } }>(`${this.base}`, body);
  }

  update(id: string, body: Partial<Provider>): Observable<{ data: { provider: Provider } }> {
    return this.http.patch<{ data: { provider: Provider } }>(`${this.base}/${id}`, body);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
