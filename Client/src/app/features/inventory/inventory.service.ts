import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InventoryListResponse } from '../../core/models/inventory.model';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/inventory`;

  list(params: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    branch?: string;
  }): Observable<InventoryListResponse> {
    let p = new HttpParams();
    if (params.page != null) p = p.set('page', String(params.page));
    if (params.limit != null) p = p.set('limit', String(params.limit));
    if (params.category) p = p.set('category', params.category);
    if (params.search) p = p.set('search', params.search);
    if (params.branch) p = p.set('branch', params.branch);
    return this.http.get<InventoryListResponse>(this.base, { params: p });
  }

  getById(id: string): Observable<{ data: { inventoryProduct: import('../../core/models/inventory.model').InventoryProduct } }> {
    return this.http.get<{ data: { inventoryProduct: import('../../core/models/inventory.model').InventoryProduct } }>(`${this.base}/${id}`);
  }
}
