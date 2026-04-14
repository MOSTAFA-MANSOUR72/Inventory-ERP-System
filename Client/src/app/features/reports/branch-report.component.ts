import { CommonModule, CurrencyPipe, DatePipe, PercentPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ReportsService, BranchReportResponse } from './reports.service';
import { ButtonComponent, CardComponent, StatCardComponent } from '../../shared/components/ui';

@Component({
  standalone: true,
  selector: 'app-branch-report',
  imports: [CommonModule, FormsModule, TranslateModule, ButtonComponent, CardComponent, StatCardComponent, CurrencyPipe, DatePipe, PercentPipe],
  template: `
    <div class="branch-report print-container">

      <!-- Report Header -->
      <header class="report-header no-print">
        <div class="report-header__left">
          <div class="report-brand">
            <span class="report-brand__dot"></span>
            <span class="report-brand__label">{{ 'REPORTS.BRANCH_DETAIL_TITLE' | translate }}</span>
          </div>
          <p class="report-header__sub">{{ 'REPORTS.BRANCH_DETAIL_SUBTITLE' | translate }}</p>
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

      <!-- Print-only heading -->
      <div class="print-only report-print-header">
        <div class="report-brand">
          <span class="report-brand__dot"></span>
          <span class="report-brand__label">{{ 'REPORTS.BRANCH_DETAIL_TITLE' | translate }}</span>
        </div>
        <p class="report-header__sub">{{ 'REPORTS.BRANCH_DETAIL_SUBTITLE' | translate }}</p>
      </div>

      <div class="report-content" *ngIf="reportData">

        <!-- KPI Cards -->
        <div class="kpi-grid">
          <div class="kpi-card kpi-card--blue">
            <span class="kpi-card__label">{{ 'REPORTS.REVENUE' | translate }}</span>
            <span class="kpi-card__value">{{ reportData.summary.totalRevenue | currency:'USD' }}</span>
            <i class="bi bi-cash-coin kpi-card__icon"></i>
          </div>
          <div class="kpi-card kpi-card--green">
            <span class="kpi-card__label">{{ 'REPORTS.PROFIT' | translate }}</span>
            <span class="kpi-card__value">{{ reportData.summary.totalProfit | currency:'USD' }}</span>
            <i class="bi bi-piggy-bank kpi-card__icon"></i>
          </div>
          <div class="kpi-card kpi-card--amber">
            <span class="kpi-card__label">{{ 'REPORTS.RECEIPTS' | translate }}</span>
            <span class="kpi-card__value">{{ reportData.summary.receiptsCount || '0' }}</span>
            <i class="bi bi-receipt kpi-card__icon"></i>
          </div>
          <div class="kpi-card kpi-card--teal">
            <span class="kpi-card__label">{{ 'REPORTS.MARGIN' | translate }}</span>
            <span class="kpi-card__value">{{ reportData.summary.totalProfit / (reportData.summary.totalRevenue || 1) | percent:'1.2-2' }}</span>
            <i class="bi bi-percent kpi-card__icon"></i>
          </div>
        </div>

        <!-- Main Content Row -->
        <div class="report-body">

          <!-- Top Products -->
          <div class="report-section report-section--wide">
            <div class="report-section__header">
              <h3 class="report-section__title">{{ 'REPORTS.TOP_PRODUCTS' | translate }}</h3>
            </div>
            <div class="table-responsive">
              <table class="report-table">
                <thead>
                  <tr>
                    <th class="col-product">{{ 'REPORTS.PRODUCT' | translate }}</th>
                    <th class="col-num">{{ 'REPORTS.QTY' | translate }}</th>
                    <th class="col-num">{{ 'REPORTS.REVENUE' | translate }}</th>
                    <th class="col-num">{{ 'REPORTS.PROFIT' | translate }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of reportData.topProducts; let i = index">
                    <td class="col-product">
                      <span class="rank-badge" [class.rank-badge--gold]="i === 0" [class.rank-badge--silver]="i === 1" [class.rank-badge--bronze]="i === 2">{{ i + 1 }}</span>
                      {{ item.name }}
                    </td>
                    <td class="col-num text-muted">{{ item.quantity }}</td>
                    <td class="col-num">{{ item.revenue | currency:'USD' }}</td>
                    <td class="col-num">
                      <span class="profit-value">{{ item.profit | currency:'USD' }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Payment Breakdown -->
          <div class="report-section report-section--narrow">
            <div class="report-section__header">
              <h3 class="report-section__title">{{ 'REPORTS.PAYMENT_METHODS' | translate }}</h3>
            </div>

            <div class="pm-list">
              <div *ngFor="let pm of reportData.paymentMethodBreakdown" class="pm-item">
                <div class="pm-item__left">
                  <span class="pm-item__method">{{ pm._id | uppercase }}</span>
                  <span class="pm-item__count">{{ pm.count }} {{ 'REPORTS.TRANSACTIONS' | translate }}</span>
                </div>
                <div class="pm-item__right">
                  <span class="pm-item__amount">{{ pm.amount | currency:'USD' }}</span>
                  <span class="pm-item__pct">{{ pm.amount / (reportData.summary.totalRevenue || 1) | percent:'1.0-0' }}</span>
                </div>
              </div>
            </div>

            <div class="export-hint no-print">
              <h3 class="export-hint__title">{{ 'REPORTS.EXPORT_OPTIONS' | translate }}</h3>
              <p class="export-hint__body">{{ 'REPORTS.PRINT_GUIDE' | translate }}</p>
            </div>
          </div>

        </div>

        <!-- Report Footer -->
        <div class="report-footer">
          <span class="report-footer__note">{{ 'REPORTS.BRANCH_DETAIL_TITLE' | translate }} — {{ 'REPORTS.BRANCH_DETAIL_SUBTITLE' | translate }}</span>
          <span class="report-footer__ref">ID: {{ branchId }}</span>
        </div>

      </div>
    </div>
  `,
  styles: [`
    /* ── Layout ─────────────────────────────────────────── */
    .branch-report {
      max-width: 960px;
      margin: 0 auto;
      padding: 24px 20px;
      font-family: inherit;
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
      font-weight: 600;
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
      font-size: 13px;
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

    /* ── KPI Grid ────────────────────────────────────────── */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 14px;
      margin-bottom: 20px;
    }
    .kpi-card {
      position: relative;
      background: #fff;
      border: 0.5px solid #E2E8F0;
      border-radius: 12px;
      padding: 20px 20px 18px;
      overflow: hidden;
      border-left-width: 3px;
    }
    .kpi-card--blue   { border-left-color: #185FA5; }
    .kpi-card--green  { border-left-color: #3B6D11; }
    .kpi-card--amber  { border-left-color: #BA7517; }
    .kpi-card--teal   { border-left-color: #0F6E56; }

    .kpi-card__label {
      display: block;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #94A3B8;
      margin-bottom: 10px;
    }
    .kpi-card__value {
      display: block;
      font-size: 20px;
      font-weight: 700;
      color: #0F172A;
      line-height: 1.1;
    }
    .kpi-card__icon {
      position: absolute;
      bottom: 14px;
      right: 16px;
      font-size: 18px;
      color: #E2E8F0;
    }

    /* ── Report Body ─────────────────────────────────────── */
    .report-body {
      display: grid;
      grid-template-columns: minmax(0, 1.8fr) minmax(0, 1fr);
      gap: 16px;
      margin-bottom: 16px;
    }
    .report-section {
      background: #fff;
      border: 0.5px solid #E2E8F0;
      border-radius: 14px;
      padding: 24px;
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

    /* ── Products Table ──────────────────────────────────── */
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
    .report-table thead th.col-product { text-align: left; padding-left: 0; }
    .report-table thead th.col-num     { text-align: right; }

    .report-table tbody tr {
      border-bottom: 0.5px solid #F8FAFC;
      transition: background 0.15s;
    }
    .report-table tbody tr:last-child { border-bottom: none; }
    .report-table tbody tr:hover      { background: #F8FAFC; }

    .report-table tbody td {
      font-size: 13px;
      padding: 11px 8px;
      color: #1E293B;
      vertical-align: middle;
    }
    .report-table tbody td.col-product {
      font-weight: 600;
      padding-left: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .report-table tbody td.col-num  { text-align: right; }
    .report-table tbody td.text-muted { color: #94A3B8; }

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

    .profit-value {
      font-weight: 700;
      color: #3B6D11;
    }

    /* ── Payment Methods ─────────────────────────────────── */
    .pm-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 20px;
    }
    .pm-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 14px;
      border-radius: 10px;
      border: 0.5px solid #F1F5F9;
      background: #F8FAFC;
      transition: border-color 0.15s;
    }
    .pm-item:hover { border-color: #CBD5E1; }
    .pm-item__left  { display: flex; flex-direction: column; gap: 2px; }
    .pm-item__right { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }

    .pm-item__method {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: #1E293B;
    }
    .pm-item__count {
      font-size: 11px;
      color: #94A3B8;
    }
    .pm-item__amount {
      font-size: 14px;
      font-weight: 700;
      color: #0F172A;
    }
    .pm-item__pct {
      font-size: 11px;
      color: #94A3B8;
    }

    /* ── Export Hint ─────────────────────────────────────── */
    .export-hint {
      padding: 14px 16px;
      background: #F8FAFC;
      border-radius: 10px;
      border: 0.5px solid #F1F5F9;
    }
    .export-hint__title {
      font-size: 12px;
      font-weight: 700;
      color: #475569;
      margin: 0 0 4px;
    }
    .export-hint__body {
      font-size: 12px;
      color: #94A3B8;
      margin: 0;
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
    .print-only { display: none; }

    @media print {
      .no-print   { display: none !important; }
      .print-only { display: block !important; }
      .print-container {
        padding: 0 !important;
        margin: 0 !important;
      }
      .report-header,
      .kpi-card,
      .report-section {
        border: 0.5px solid #E2E8F0 !important;
        box-shadow: none !important;
      }
      .report-table tbody tr:hover { background: transparent; }
      .kpi-grid { grid-template-columns: repeat(4, 1fr); }
      .report-body { grid-template-columns: 1.8fr 1fr; }
    }
  `]
})
export class BranchReportComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly reportsService = inject(ReportsService);

  branchId: string = '';
  startDate: string = '';
  endDate: string = '';
  reportData: any = null;

  ngOnInit(): void {
    this.branchId = this.route.snapshot.params['id'];
    this.loadData();
  }

  loadData(): void {
    this.reportsService.getBranchReport(this.branchId, this.startDate, this.endDate).subscribe({
      next: (res) => {
        this.reportData = res.data;
      }
    });
  }

  print(): void {
    window.print();
  }
}