import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ReportSummary {
  totalRevenue: number;
  totalProfit: number;
  totalCost: number;
  receiptsCount: number;
  totalItemsSold: number;
}

export interface PaymentBreakdown {
  _id: string;
  count: number;
  amount: number;
}

export interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
  profit: number;
}

export interface TrendData {
  _id: string;
  revenue: number;
  profit: number;
}

export interface BranchReportResponse {
  status: string;
  data: {
    summary: ReportSummary;
    paymentMethodBreakdown: PaymentBreakdown[];
    topProducts: TopProduct[];
    dailyTrend: TrendData[];
  };
}

export interface ManagerOverviewResponse {
  status: string;
  data: {
    aggregate: {
      totalRevenue: number;
      totalProfit: number;
      receiptsCount: number;
    };
    branchComparison: Array<{
      _id: string;
      name: string;
      revenue: number;
      profit: number;
      receiptsCount: number;
    }>;
  };
}

export interface ProductRankingResponse {
  status: string;
  data: {
    ranking: Array<{
      _id: string;
      totalQty: number;
      totalRevenue: number;
      totalProfit: number;
      productInfo: {
        _id: string;
        name: string;
        image?: string;
      };
      categoryInfo?: {
        name: string;
      };
      branchPerformance: Array<{ branch: string; qty: number }>;
    }>;
  };
}

export interface ProductDetailReportResponse {
  status: string;
  data: {
    branchBreakdown: Array<{
      _id: string;
      qty: number;
      revenue: number;
      profit: number;
      branchInfo: {
        name: string;
        location: string;
      };
    }>;
    timeTrend: Array<{
      _id: string; // YYYY-WW
      revenue: number;
      profit: number;
    }>;
  };
}

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/reports`;

  private getParams(startDate?: string, endDate?: string): HttpParams {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return params;
  }

  getBranchReport(branchId: string, startDate?: string, endDate?: string): Observable<BranchReportResponse> {
    return this.http.get<BranchReportResponse>(`${this.base}/branch/${branchId}`, {
      params: this.getParams(startDate, endDate),
    });
  }

  getManagerOverview(startDate?: string, endDate?: string): Observable<ManagerOverviewResponse> {
    return this.http.get<ManagerOverviewResponse>(`${this.base}/manager-overview`, {
      params: this.getParams(startDate, endDate),
    });
  }

  getProductsRanking(startDate?: string, endDate?: string): Observable<ProductRankingResponse> {
    return this.http.get<ProductRankingResponse>(`${this.base}/products`, {
      params: this.getParams(startDate, endDate),
    });
  }

  getProductDetailReport(productId: string, startDate?: string, endDate?: string): Observable<ProductDetailReportResponse> {
    return this.http.get<ProductDetailReportResponse>(`${this.base}/products/${productId}`, {
      params: this.getParams(startDate, endDate),
    });
  }
}
