import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string | { _id: string; name: string };
  manager?: string | { _id: string; name: string; email?: string };
  createdAt?: string;
}

export interface ProductListResponse {
  status: string;
  results: number;
  total: number;
  page: number;
  pages: number;
  data: { products: Product[] };
}

export interface ProductOneResponse {
  status: string;
  data: { product: Product };
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/products`;

  list(params: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }): Observable<ProductListResponse> {
    let p = new HttpParams();
    if (params.page != null) p = p.set('page', String(params.page));
    if (params.limit != null) p = p.set('limit', String(params.limit));
    if (params.category) p = p.set('category', params.category);
    if (params.search) p = p.set('search', params.search);
    return this.http.get<ProductListResponse>(this.base, { params: p });
  }

  getById(id: string): Observable<ProductOneResponse> {
    return this.http.get<ProductOneResponse>(`${this.base}/${id}`);
  }

  create(formData: FormData): Observable<ProductOneResponse> {
    return this.http.post<ProductOneResponse>(this.base, formData);
  }

  update(id: string, formData: FormData): Observable<ProductOneResponse> {
    return this.http.patch<ProductOneResponse>(`${this.base}/${id}`, formData);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
