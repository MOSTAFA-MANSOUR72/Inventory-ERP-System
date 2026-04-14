import { CommonModule, CurrencyPipe, PercentPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ReportsService } from './reports.service';
import { ButtonComponent, CardComponent, StatCardComponent } from '../../shared/components/ui';

@Component({
  standalone: true,
  selector: 'app-manager-overview-report',
  imports: [CommonModule, FormsModule, TranslateModule, ButtonComponent, CardComponent, StatCardComponent, CurrencyPipe, PercentPipe],
  template: `
    <div class="manager-overview-report print-container">

      <!-- Header -->
      <header class="report-header no-print">
        <div class="report-header__left">
          <div class="report-brand">
            <span class="report-brand__dot"></span>
            <span class="report-brand__label">{{ 'REPORTS.MANAGER_OVERVIEW_TITLE' | translate }}</span>
          </div>
          <p class="report-header__sub">{{ 'REPORTS.MANAGER_OVERVIEW_SUBTITLE' | translate }}</p>
        </div>
        <div class="report-header__actions">
          <div class="date-filter">
            <input type="date" class="date-input" [(ngModel)]="startDate" (change)="loadData()">
            <span class="date-sep">—</span>
            <input type="date" class="date-input" [(ngModel)]="endDate" (change)="loadData()">
          </div>
          <button appButton (click)="print()" variant="secondary" outline size="sm">
            <i class="bi bi-printer me-2"></i>{{ 'REPORTS.PRINT' | translate }}
          </button>
        </div>
      </header>

      <div class="report-content" *ngIf="reportData">

        <!-- KPI Cards -->
        <div class="kpi-grid">
          <div class="kpi-card kpi-card--blue">
            <span class="kpi-card__label">{{ 'REPORTS.TOTAL_REVENUE' | translate }}</span>
            <span class="kpi-card__value">{{ reportData.aggregate.totalRevenue | currency:'USD' }}</span>
            <i class="bi bi-cash-coin kpi-card__icon"></i>
          </div>
          <div class="kpi-card kpi-card--green">
            <span class="kpi-card__label">{{ 'REPORTS.TOTAL_PROFIT' | translate }}</span>
            <span class="kpi-card__value">{{ reportData.aggregate.totalProfit | currency:'USD' }}</span>
            <i class="bi bi-piggy-bank kpi-card__icon"></i>
          </div>
          <div class="kpi-card kpi-card--amber">
            <span class="kpi-card__label">{{ 'REPORTS.TOTAL_RECEIPTS' | translate }}</span>
            <span class="kpi-card__value">{{ reportData.aggregate.receiptsCount || '0' }}</span>
            <i class="bi bi-receipt kpi-card__icon"></i>
          </div>
        </div>

        <!-- Branch Comparison Table -->
        <div class="report-section">
          <div class="report-section__header">
            <h3 class="report-section__title">{{ 'REPORTS.BRANCH_COMPARISON' | translate }}</h3>
            <span class="report-section__count">{{ reportData.branchComparison.length }} {{ 'REPORTS.BRANCHES' | translate }}</span>
          </div>
          <div class="table-responsive">
            <table class="report-table">
              <thead>
                <tr>
                  <th class="col-branch">{{ 'REPORTS.BRANCH' | translate }}</th>
                  <th class="col-num">{{ 'REPORTS.REVENUE' | translate }}</th>
                  <th class="col-num">{{ 'REPORTS.PROFIT' | translate }}</th>
                  <th class="col-center">{{ 'REPORTS.RECEIPTS' | translate }}</th>
                  <th class="col-perf">{{ 'REPORTS.PERFORMANCE' | translate }}</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let br of reportData.branchComparison; let i = index">
                  <td class="col-branch">
                    <span class="rank-badge"
                      [class.rank-badge--gold]="i === 0"
                      [class.rank-badge--silver]="i === 1"
                      [class.rank-badge--bronze]="i === 2">{{ i + 1 }}</span>
                    {{ br.name }}
                  </td>
                  <td class="col-num">{{ br.revenue | currency:'USD' }}</td>
                  <td class="col-num"><span class="profit-value">{{ br.profit | currency:'USD' }}</span></td>
                  <td class="col-center">{{ br.receiptsCount }}</td>
                  <td class="col-perf">
                    <div class="perf-cell">
                      <div class="perf-bar-track">
                        <div class="perf-bar-fill"
                          [style.width.%]="(br.revenue / (reportData.aggregate.totalRevenue || 1)) * 100">
                        </div>
                      </div>
                      <span class="perf-pct">
                        {{ (br.revenue / (reportData.aggregate.totalRevenue || 1)) | percent:'1.1-1' }}
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Report Footer -->
        <div class="report-footer">
          <span class="report-footer__note">{{ 'REPORTS.MANAGER_OVERVIEW_TITLE' | translate }} — {{ 'REPORTS.MANAGER_OVERVIEW_SUBTITLE' | translate }}</span>
          <span class="report-footer__ref">{{ startDate }} — {{ endDate }}</span>
        </div>

      </div>
    </div>
  `,
  styles: [`
    /* ── Layout ─────────────────────────────────────────── */
    .manager-overview-report {
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

    /* ── KPI Grid ────────────────────────────────────────── */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
      margin-bottom: 20px;
    }
    .kpi-card {
      position: relative;
      background: #fff;
      border: 0.5px solid #E2E8F0;
      border-left-width: 3px;
      border-radius: 12px;
      padding: 20px 20px 18px;
      overflow: hidden;
    }
    .kpi-card--blue  { border-left-color: #185FA5; }
    .kpi-card--green { border-left-color: #3B6D11; }
    .kpi-card--amber { border-left-color: #BA7517; }

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
      font-size: 22px;
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

    /* ── Branch Comparison Section ───────────────────────── */
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
    .report-table thead th.col-branch  { text-align: left; padding-left: 0; }
    .report-table thead th.col-num     { text-align: right; }
    .report-table thead th.col-center  { text-align: center; }
    .report-table thead th.col-perf    { text-align: right; min-width: 160px; }

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
      font-weight: 600;
      padding-left: 0;
    }
    .report-table tbody td.col-num    { text-align: right; }
    .report-table tbody td.col-center { text-align: center; color: #64748B; }
    .report-table tbody td.col-perf   { text-align: right; }

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
      margin-right: 8px;
      flex-shrink: 0;
    }
    .rank-badge--gold   { background: #FAEEDA; color: #854F0B; }
    .rank-badge--silver { background: #F1F5F9; color: #444441; }
    .rank-badge--bronze { background: #FFF0E7; color: #7C3D1A; }

    .profit-value {
      font-weight: 700;
      color: #3B6D11;
    }

    /* ── Performance Bar ─────────────────────────────────── */
    .perf-cell {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
    }
    .perf-bar-track {
      width: 90px;
      height: 5px;
      border-radius: 3px;
      background: #F1F5F9;
      overflow: hidden;
      flex-shrink: 0;
    }
    .perf-bar-fill {
      height: 100%;
      border-radius: 3px;
      background: #185FA5;
      transition: width 0.4s ease;
    }
    .perf-pct {
      font-size: 12px;
      font-weight: 700;
      color: #64748B;
      min-width: 38px;
      text-align: right;
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
      .report-section,
      .kpi-card { border: 0.5px solid #E2E8F0 !important; box-shadow: none !important; }
      .report-table tbody tr:hover { background: transparent; }
      .perf-bar-fill { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
  `]
})
export class ManagerOverviewReportComponent implements OnInit {
  private readonly reportsService = inject(ReportsService);

  startDate: string = '';
  endDate: string = '';
  reportData: any = null;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.reportsService.getManagerOverview(this.startDate, this.endDate).subscribe({
      next: (res) => {
        this.reportData = res.data;
      }
    });
  }

  print(): void {
    window.print();
  }
}