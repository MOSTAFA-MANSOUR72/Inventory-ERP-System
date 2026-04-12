import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Branch {
  _id: string;
  name: string;
  location: string;
  manager?: string;
}

@Injectable({ providedIn: 'root' })
export class BranchService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/branches`;

  list(params?: { page?: number; limit?: number }): Observable<{ data: { branches: Branch[] }, results: number, total: number, page: number, pages: number }> {
    const p: Record<string, string> = {};
    if (params?.page != null) p['page'] = String(params.page);
    if (params?.limit != null) p['limit'] = String(params.limit);
    return this.http.get<{ data: { branches: Branch[] }, results: number, total: number, page: number, pages: number }>(`${this.base}`, { params: p });
  }

  listMine(params?: { page?: number; limit?: number }): Observable<{ data: { branches: Branch[] }, results: number, total: number, page: number, pages: number }> {
    const p: Record<string, string> = {};
    if (params?.page != null) p['page'] = String(params.page);
    if (params?.limit != null) p['limit'] = String(params.limit);
    return this.http.get<{ data: { branches: Branch[] }, results: number, total: number, page: number, pages: number }>(`${this.base}/manager`, { params: p });
  }

  getById(id: string): Observable<{ data: { branch: Branch } }> {
    return this.http.get<{ data: { branch: Branch } }>(`${this.base}/${id}`);
  }

  create(body: { name: string; location: string }): Observable<{ data: { branch: Branch } }> {
    return this.http.post<{ data: { branch: Branch } }>(`${this.base}`, body);
  }

  update(id: string, body: { name?: string; location?: string }): Observable<{ data: { branch: Branch } }> {
    return this.http.put<{ data: { branch: Branch } }>(`${this.base}/${id}`, body);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
