import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Receipt {
  _id: string;
  receiptNumber?: string;
  totalAmount: number;
  totalProfit?: number;
  status?: string;
  paymentMethod?: string;
  notes?: string;
  createdAt?: string;
  branch?: unknown;
  cashier?: unknown;
  items?: unknown[];
}

export interface InventoryProduct {
  _id: string;
  product: {
    _id: string;
    name: string;
    category?: unknown;
    image?: string;
  };
  quantity: number;
  sellPrice: number;
  buyPrice: number;
  branch: string;
}

@Injectable({ providedIn: 'root' })
export class SalesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/sales`;

  createSale(body: {
    items: { inventoryProduct: string; quantity: number }[];
    paymentMethod: string;
    notes?: string;
  }): Observable<{ data: { receipt: Receipt } }> {
    return this.http.post<{ data: { receipt: Receipt } }>(`${this.base}`, body);
  }

  getInventory(): Observable<{ data: { inventory: InventoryProduct[] } }> {
    return this.http.get<{ data: { inventory: InventoryProduct[] } }>(`${this.base}/inventory`);
  }


  listReceipts(params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    paymentMethod?: string;
    status?: string;
  }): Observable<{
    status: string;
    results: number;
    total: number;
    page: number;
    pages: number;
    data: { receipts: Receipt[] };
  }> {
    const p: Record<string, string> = {};
    if (params?.page != null) p['page'] = String(params.page);
    if (params?.limit != null) p['limit'] = String(params.limit);
    if (params?.startDate) p['startDate'] = params.startDate;
    if (params?.endDate) p['endDate'] = params.endDate;
    if (params?.paymentMethod) p['paymentMethod'] = params.paymentMethod;
    if (params?.status) p['status'] = params.status;
    return this.http.get<{
      status: string;
      results: number;
      total: number;
      page: number;
      pages: number;
      data: { receipts: Receipt[] };
    }>(`${this.base}`, { params: p });
  }

  getReceipt(id: string): Observable<{ data: { receipt: Receipt } }> {
    return this.http.get<{ data: { receipt: Receipt } }>(`${this.base}/${id}`);
  }

  branchSummary(params?: { startDate?: string; endDate?: string }): Observable<{
    data: { summary: Record<string, number>; dateRange?: unknown };
  }> {
    const p: Record<string, string> = {};
    if (params?.startDate) p['startDate'] = params.startDate;
    if (params?.endDate) p['endDate'] = params.endDate;
    return this.http.get<{ data: { summary: Record<string, number>; dateRange?: unknown } }>(
      `${this.base}/summary`,
      { params: p }
    );
  }

  dailyReport(date: string): Observable<{ data: { report: unknown } }> {
    return this.http.get<{ data: { report: unknown } }>(`${this.base}/daily-report`, { params: { date } });
  }

  topProducts(params?: { limit?: number; startDate?: string; endDate?: string }): Observable<{
    data: { topProducts: unknown[] };
  }> {
    const p: Record<string, string> = {};
    if (params?.limit != null) p['limit'] = String(params.limit);
    if (params?.startDate) p['startDate'] = params.startDate!;
    if (params?.endDate) p['endDate'] = params.endDate!;
    return this.http.get<{ data: { topProducts: unknown[] } }>(`${this.base}/top-products`, { params: p });
  }

  refund(id: string, body: { reason?: string }): Observable<{ data: { receipt: Receipt } }> {
    return this.http.patch<{ data: { receipt: Receipt } }>(`${this.base}/${id}/refund`, body);
  }
}
