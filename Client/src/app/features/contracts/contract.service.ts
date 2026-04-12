import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ContractLine {
  product: string | { _id: string; name: string; description?: string; category?: { _id: string; name: string } };
  quantity: number;
  buyPrice: number;
  sellPrice: number;
  subtotal?: number;
  provider?: string;
}

export interface Contract {
  _id: string;
  branch: string | { _id: string; name: string; location?: string };
  manager: string | { _id: string; name: string; email?: string };
  products: ContractLine[];
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  paymentStatus?: string;
  totalQuantity?: number;
  totalAmount: number;
  paymentMethod?: string;
  expectedDeliveryDate?: string;
  deliveryDate?: string;
  description?: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ContractService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/contracts`;

  list(params?: { page?: number; limit?: number; status?: string; branch?: string }): Observable<{
    status: string;
    results: number;
    total: number;
    page: number;
    pages: number;
    data: { contracts: Contract[] };
  }> {
    const p: Record<string, string> = {};
    if (params?.page != null) p['page'] = String(params.page);
    if (params?.limit != null) p['limit'] = String(params.limit);
    if (params?.status) p['status'] = params.status;
    if (params?.branch) p['branch'] = params.branch;
    return this.http.get<{
      status: string;
      results: number;
      total: number;
      page: number;
      pages: number;
      data: { contracts: Contract[] };
    }>(`${this.base}`, { params: p });
  }

  getById(id: string): Observable<{ data: { contract: Contract } }> {
    return this.http.get<{ data: { contract: Contract } }>(`${this.base}/${id}`);
  }

  create(body: {
    branch: string;
    products: { product: string; quantity: number; buyPrice: number; sellPrice: number }[];
    paymentMethod?: string;
    expectedDeliveryDate?: string;
    description?: string;
  }): Observable<{ data: { contract: Contract } }> {
    return this.http.post<{ data: { contract: Contract } }>(`${this.base}`, body);
  }

  update(id: string, body: unknown): Observable<{ data: { contract: Contract } }> {
    return this.http.patch<{ data: { contract: Contract } }>(`${this.base}/${id}`, body);
  }

  approve(id: string, body?: { deliveryDate?: string }): Observable<{ data: { contract: Contract } }> {
    return this.http.patch<{ data: { contract: Contract } }>(`${this.base}/${id}/approve`, body ?? {});
  }

  cancel(id: string): Observable<{ data: { contract: Contract } }> {
    return this.http.patch<{ data: { contract: Contract } }>(`${this.base}/${id}/cancel`, {});
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
