import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Category {
  _id: string;
  name: string;
}

export interface CategoryListResponse {
  status: string;
  results: number;
  total: number;
  page: number;
  pages: number;
  data: { categories: Category[] };
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/categories`;

  list(params?: { page?: number; limit?: number }): Observable<CategoryListResponse> {
    const p: Record<string, string> = {};
    if (params?.page != null) p['page'] = String(params.page);
    if (params?.limit != null) p['limit'] = String(params.limit);
    return this.http.get<CategoryListResponse>(this.base, { params: p });
  }

  create(body: { name: string }): Observable<{ data: { category: Category } }> {
    return this.http.post<{ data: { category: Category } }>(`${this.base}`, body);
  }

  update(id: string, body: { name: string }): Observable<{ data: { category: Category } }> {
    return this.http.put<{ data: { category: Category } }>(`${this.base}/${id}`, body);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
