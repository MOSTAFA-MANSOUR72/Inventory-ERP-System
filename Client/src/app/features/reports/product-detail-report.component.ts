import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ReportsService } from './reports.service';
import { ButtonComponent, CardComponent, StatCardComponent } from '../../shared/components/ui';

@Component({
  standalone: true,
  selector: 'app-product-detail-report',
  imports: [CommonModule, FormsModule, TranslateModule, ButtonComponent, CardComponent, StatCardComponent, CurrencyPipe],
  template: `
    <div class="product-detail-report print-container">

      <!-- Header -->
      <header class="report-header no-print">
        <div class="report-header__left">
          <div class="report-brand">
            <span class="report-brand__dot"></span>
            <span class="report-brand__label">{{ 'REPORTS.PRODUCT_ANALYSIS_TITLE' | translate }}</span>
          </div>
          <p class="report-header__sub">{{ 'REPORTS.PRODUCT_ANALYSIS_SUBTITLE' | translate }}</p>
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

      <div class="report-content" *ngIf="reportData">

        <!-- Per-Branch Breakdown -->
        <div class="report-section">
          <div class="report-section__header">
            <h3 class="report-section__title">{{ 'REPORTS.PER_BRANCH_BREAKDOWN' | translate }}</h3>
            <span class="report-section__count">{{ reportData.branchBreakdown.length }} {{ 'REPORTS.BRANCHES' | translate }}</span>
          </div>
          <div class="table-responsive">
            <table class="report-table">
              <thead>
                <tr>
                  <th class="col-branch">{{ 'REPORTS.BRANCH' | translate }}</th>
                  <th class="col-center">{{ 'REPORTS.QTY_SOLD' | translate }}</th>
                  <th class="col-num">{{ 'REPORTS.REVENUE' | translate }}</th>
                  <th class="col-num">{{ 'REPORTS.PROFIT' | translate }}</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let br of reportData.branchBreakdown; let i = index">
                  <td class="col-branch">
                    <span class="rank-badge"
                      [class.rank-badge--gold]="i === 0"
                      [class.rank-badge--silver]="i === 1"
                      [class.rank-badge--bronze]="i === 2">{{ i + 1 }}</span>
                    <div class="branch-info">
                      <span class="branch-info__name">{{ br.branchInfo.name }}</span>
                      <span class="branch-info__location">{{ br.branchInfo.location }}</span>
                    </div>
                  </td>
                  <td class="col-center">{{ br.qty }}</td>
                  <td class="col-num">{{ br.revenue | currency:'USD' }}</td>
                  <td class="col-num"><span class="profit-value">{{ br.profit | currency:'USD' }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Weekly Trend -->
        <div class="report-section">
          <div class="report-section__header">
            <h3 class="report-section__title">{{ 'REPORTS.WEEKLY_TREND' | translate }}</h3>
            <span class="report-section__count">{{ reportData.timeTrend.length }} {{ 'REPORTS.WEEKS' | translate }}</span>
          </div>
          <div class="trend-list">
            <div *ngFor="let week of reportData.timeTrend" class="trend-row">
              <div class="trend-row__label">
                {{ 'REPORTS.WEEK' | translate }} {{ week._id.split('-')[1] }}
                <span class="trend-row__year">{{ week._id.split('-')[0] }}</span>
              </div>
              <div class="trend-row__bars">
                <div class="trend-bar-group">
                  <div class="trend-bar-track trend-bar-track--revenue">
                    <div class="trend-bar-fill trend-bar-fill--revenue"
                      [style.width.%]="(week.revenue / (maxRevenue || 1)) * 100">
                    </div>
                  </div>
                  <span class="trend-bar-value trend-bar-value--revenue">{{ week.revenue | currency:'USD' }}</span>
                </div>
                <div class="trend-bar-group">
                  <div class="trend-bar-track trend-bar-track--profit">
                    <div class="trend-bar-fill trend-bar-fill--profit"
                      [style.width.%]="(week.profit / (maxRevenue || 1)) * 100">
                    </div>
                  </div>
                  <span class="trend-bar-value trend-bar-value--profit">{{ week.profit | currency:'USD' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Legend -->
          <div class="trend-legend">
            <span class="trend-legend__item trend-legend__item--revenue">{{ 'REPORTS.REVENUE' | translate }}</span>
            <span class="trend-legend__item trend-legend__item--profit">{{ 'REPORTS.PROFIT' | translate }}</span>
          </div>
        </div>

        <!-- Report Footer -->
        <div class="report-footer">
          <span class="report-footer__note">{{ 'REPORTS.PRODUCT_ANALYSIS_TITLE' | translate }} — {{ 'REPORTS.PRODUCT_ANALYSIS_SUBTITLE' | translate }}</span>
          <span class="report-footer__ref">ID: {{ productId }}</span>
        </div>

      </div>
    </div>
  `,
  styles: [`
    /* ── Layout ─────────────────────────────────────────── */
    .product-detail-report {
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
    .report-table thead th.col-branch { text-align: left; padding-left: 0; }
    .report-table thead th.col-num    { text-align: right; }
    .report-table thead th.col-center { text-align: center; }

    .report-table tbody tr {
      border-bottom: 0.5px solid #F8FAFC;
      transition: background 0.15s;
    }
    .report-table tbody tr:last-child { border-bottom: none; }
    .report-table tbody tr:hover      { background: #F8FAFC; }

    .report-table tbody td {
      font-size: 13px;
      padding: 12px 8px;
      color: #1E293B;
      vertical-align: middle;
    }
    .report-table tbody td.col-branch {
      padding-left: 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .report-table tbody td.col-num    { text-align: right; }
    .report-table tbody td.col-center { text-align: center; color: #64748B; font-weight: 600; }

    /* ── Branch Info Cell ────────────────────────────────── */
    .branch-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .branch-info__name {
      font-size: 13px;
      font-weight: 600;
      color: #0F172A;
    }
    .branch-info__location {
      font-size: 11px;
      color: #94A3B8;
    }

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

    .profit-value {
      font-weight: 700;
      color: #3B6D11;
    }

    /* ── Weekly Trend ────────────────────────────────────── */
    .trend-list {
      display: flex;
      flex-direction: column;
      gap: 0;
    }
    .trend-row {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 12px 0;
      border-bottom: 0.5px solid #F8FAFC;
    }
    .trend-row:last-child { border-bottom: none; }
    .trend-row__label {
      font-size: 12px;
      font-weight: 700;
      color: #475569;
      min-width: 72px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .trend-row__year {
      font-size: 10px;
      font-weight: 600;
      color: #94A3B8;
    }
    .trend-row__bars {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .trend-bar-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .trend-bar-track {
      flex: 1;
      border-radius: 4px;
      overflow: hidden;
      background: #F1F5F9;
    }
    .trend-bar-track--revenue { height: 10px; }
    .trend-bar-track--profit  { height: 6px; }

    .trend-bar-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.4s ease;
    }
    .trend-bar-fill--revenue { background: #185FA5; }
    .trend-bar-fill--profit  { background: #3B6D11; }

    .trend-bar-value {
      font-weight: 700;
      min-width: 80px;
      text-align: right;
      flex-shrink: 0;
    }
    .trend-bar-value--revenue { font-size: 12px; color: #1E293B; }
    .trend-bar-value--profit  { font-size: 11px; color: #3B6D11; }

    /* ── Trend Legend ────────────────────────────────────── */
    .trend-legend {
      display: flex;
      gap: 20px;
      margin-top: 16px;
      padding-top: 14px;
      border-top: 0.5px solid #F1F5F9;
    }
    .trend-legend__item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 600;
      color: #64748B;
    }
    .trend-legend__item::before {
      content: '';
      display: inline-block;
      width: 20px;
      border-radius: 2px;
      flex-shrink: 0;
    }
    .trend-legend__item--revenue::before { height: 10px; background: #185FA5; }
    .trend-legend__item--profit::before  { height: 6px;  background: #3B6D11; }

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
      .report-table tbody tr:hover { background: transparent; }
      .trend-bar-fill { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
  `]
})
export class ProductDetailReportComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly reportsService = inject(ReportsService);

  productId: string = '';
  startDate: string = '';
  endDate: string = '';
  reportData: any = null;
  maxRevenue: number = 0;

  ngOnInit(): void {
    this.productId = this.route.snapshot.params['id'];
    this.loadData();
  }

  loadData(): void {
    this.reportsService.getProductDetailReport(this.productId, this.startDate, this.endDate).subscribe({
      next: (res) => {
        this.reportData = res.data;
        this.calculateMax();
      }
    });
  }

  calculateMax(): void {
    if (this.reportData && this.reportData.timeTrend.length > 0) {
      this.maxRevenue = Math.max(...this.reportData.timeTrend.map((t: any) => t.revenue));
    } else {
      this.maxRevenue = 1000;
    }
  }

  print(): void {
    window.print();
  }
}