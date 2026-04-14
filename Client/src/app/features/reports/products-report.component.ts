import { CommonModule, CurrencyPipe, SlicePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ReportsService } from './reports.service';
import { ButtonComponent, CardComponent } from '../../shared/components/ui';

@Component({
  standalone: true,
  selector: 'app-products-report',
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule, ButtonComponent, CardComponent, CurrencyPipe, SlicePipe],
  template: `
    <div class="products-report print-container">

      <!-- Header -->
      <header class="report-header no-print">
        <div class="report-header__left">
          <div class="report-brand">
            <span class="report-brand__dot"></span>
            <span class="report-brand__label">{{ 'REPORTS.PRODUCTS_RANKING_TITLE' | translate }}</span>
          </div>
          <p class="report-header__sub">{{ 'REPORTS.PRODUCTS_RANKING_SUBTITLE' | translate }}</p>
        </div>
        <div class="report-header__actions">
          <div class="date-filter">
            <input type="date" class="date-input" [(ngModel)]="startDate" (change)="loadData()">
            <span class="date-sep">—</span>
            <input type="date" class="date-input" [(ngModel)]="endDate" (change)="loadData()">
          </div>
          <button (click)="print()" appButton variant="secondary" outline size="sm">
            <i class="bi bi-printer me-2"></i>{{ 'REPORTS.PRINT' | translate }}
          </button>
        </div>
      </header>

      <!-- Ranking Table -->
      <div class="report-section" *ngIf="rankingData">
        <div class="report-section__header">
          <h3 class="report-section__title">{{ 'REPORTS.PRODUCTS_RANKING_TITLE' | translate }}</h3>
          <span class="report-section__count">{{ rankingData.length }} {{ 'REPORTS.PRODUCTS' | translate }}</span>
        </div>
        <div class="table-responsive">
          <table class="report-table">
            <thead>
              <tr>
                <th class="col-rank">#</th>
                <th class="col-product">{{ 'REPORTS.PRODUCT' | translate }}</th>
                <th class="col-category">{{ 'REPORTS.CATEGORY' | translate }}</th>
                <th class="col-center">{{ 'REPORTS.QTY_SOLD' | translate }}</th>
                <th class="col-num">{{ 'REPORTS.REVENUE' | translate }}</th>
                <th class="col-num">{{ 'REPORTS.PROFIT' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of rankingData; let i = index"
                  class="report-table__row--clickable"
                  [routerLink]="['/reports/product', item._id]">
                <td class="col-rank">
                  <span class="rank-badge"
                    [class.rank-badge--gold]="i === 0"
                    [class.rank-badge--silver]="i === 1"
                    [class.rank-badge--bronze]="i === 2">{{ i + 1 }}</span>
                </td>
                <td class="col-product">{{ item.productInfo.name }}</td>
                <td class="col-category">
                  <span class="category-badge">{{ item.categoryInfo?.name || 'N/A' }}</span>
                </td>
                <td class="col-center">{{ item.totalQty }}</td>
                <td class="col-num revenue-value">{{ item.totalRevenue | currency:'USD' }}</td>
                <td class="col-num"><span class="profit-value">{{ item.totalProfit | currency:'USD' }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Report Footer -->
      <div class="report-footer" *ngIf="rankingData">
        <span class="report-footer__note">{{ 'REPORTS.PRODUCTS_RANKING_TITLE' | translate }} — {{ 'REPORTS.PRODUCTS_RANKING_SUBTITLE' | translate }}</span>
        <span class="report-footer__ref">{{ startDate }} — {{ endDate }}</span>
      </div>

    </div>
  `,
  styles: [`
    /* ── Layout ─────────────────────────────────────────── */
    .products-report {
      max-width: 960px;
      margin: 0 auto;
      padding: 24px 20px;
    }

    /* ── Report Header ───────────────────────────────────── */
    .report-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      background: #fff;
      border: 0.5px solid #E2E8F0;
      border-radius: 14px;
      padding: 24px 28px;
      margin-bottom: 20px;
    }
    .report-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }
    .report-brand__dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #185FA5;
      flex-shrink: 0;
    }
    .report-brand__label {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: #64748B;
    }
    .report-header__sub {
      font-size: 13px;
      color: #94A3B8;
      margin: 0;
    }
    .report-header__actions {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 10px;
    }
    .date-filter {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .date-sep {
      font-size: 12px;
      color: #CBD5E1;
    }
    .date-input {
      font-size: 12px;
      font-weight: 600;
      padding: 8px 14px;
      border-radius: 10px;
      border: 1.5px solid #BFDBF7;
      border-left: 4px solid #185FA5;
      background: #EBF2FA;
      color: #1E3A5F;
      cursor: pointer;
      outline: none;
      transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    }
    .date-input:hover {
      background: #DBEAFE;
      border-color: #93C5FD;
    }
    .date-input:focus {
      background: #DBEAFE;
      border-color: #185FA5;
      box-shadow: 0 0 0 3px rgba(24, 95, 165, 0.12);
    }

    /* ── Report Section ──────────────────────────────────── */
    .report-section {
      background: #fff;
      border: 0.5px solid #E2E8F0;
      border-radius: 14px;
      padding: 24px;
      margin-bottom: 16px;
    }
    .report-section__header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding-bottom: 14px;
      margin-bottom: 16px;
      border-bottom: 0.5px solid #F1F5F9;
    }
    .report-section__title {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #64748B;
      margin: 0;
    }
    .report-section__count {
      font-size: 11px;
      color: #94A3B8;
    }

    /* ── Report Table ────────────────────────────────────── */
    .report-table {
      width: 100%;
      border-collapse: collapse;
    }
    .report-table thead th {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: #94A3B8;
      padding: 0 8px 10px;
      border-bottom: 0.5px solid #F1F5F9;
      white-space: nowrap;
    }
    .report-table thead th.col-rank     { text-align: center; width: 52px; }
    .report-table thead th.col-product  { text-align: left; }
    .report-table thead th.col-category { text-align: left; }
    .report-table thead th.col-center   { text-align: center; }
    .report-table thead th.col-num      { text-align: right; }

    .report-table tbody tr {
      border-bottom: 0.5px solid #F8FAFC;
      transition: background 0.15s;
    }
    .report-table tbody tr:last-child { border-bottom: none; }
    .report-table__row--clickable {
      cursor: pointer;
    }
    .report-table__row--clickable:hover td { background: #F8FAFC; }
    .report-table__row--clickable:hover .col-product {
      color: #185FA5;
    }

    .report-table tbody td {
      font-size: 13px;
      padding: 12px 8px;
      color: #1E293B;
      vertical-align: middle;
      transition: background 0.15s;
    }
    .report-table tbody td.col-rank     { text-align: center; }
    .report-table tbody td.col-product  { font-weight: 600; color: #0F172A; }
    .report-table tbody td.col-category { }
    .report-table tbody td.col-center   { text-align: center; color: #64748B; font-weight: 600; }
    .report-table tbody td.col-num      { text-align: right; }

    /* ── Rank Badge ──────────────────────────────────────── */
    .rank-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      font-size: 10px;
      font-weight: 700;
      background: #F1F5F9;
      color: #94A3B8;
      flex-shrink: 0;
    }
    .rank-badge--gold   { background: #FAEEDA; color: #854F0B; }
    .rank-badge--silver { background: #F1F5F9; color: #444441; }
    .rank-badge--bronze { background: #FFF0E7; color: #7C3D1A; }

    /* ── Category Badge ──────────────────────────────────── */
    .category-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 6px;
      background: #F1F5F9;
      color: #475569;
      white-space: nowrap;
    }

    /* ── Value Cells ─────────────────────────────────────── */
    .revenue-value {
      color: #185FA5;
      font-weight: 600;
    }
    .profit-value {
      font-weight: 700;
      color: #3B6D11;
    }

    /* ── Report Footer ───────────────────────────────────── */
    .report-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 20px;
      background: #F8FAFC;
      border: 0.5px solid #E2E8F0;
      border-radius: 10px;
    }
    .report-footer__note {
      font-size: 11px;
      color: #94A3B8;
    }
    .report-footer__ref {
      font-size: 11px;
      font-weight: 600;
      color: #64748B;
    }

    /* ── Print ───────────────────────────────────────────── */
    @media print {
      .no-print { display: none !important; }
      .print-container { padding: 0 !important; margin: 0 !important; }
      .report-section { border: 0.5px solid #E2E8F0 !important; box-shadow: none !important; }
      .report-table__row--clickable:hover td { background: transparent; }
      .report-table__row--clickable { cursor: default; }
    }
  `]
})
export class ProductsReportComponent implements OnInit {
  private readonly reportsService = inject(ReportsService);

  startDate: string = '';
  endDate: string = '';
  rankingData: any[] = [];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.reportsService.getProductsRanking(this.startDate, this.endDate).subscribe({
      next: (res) => {
        this.rankingData = res.data.ranking;
      }
    });
  }

  print(): void {
    window.print();
  }
}