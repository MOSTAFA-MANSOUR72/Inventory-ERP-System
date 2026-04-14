import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '../../shared/components/ui';
import { BranchService } from '../branches/branch.service';
import { Observable, map } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-reports-dashboard',
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule, ButtonComponent],
  template: `
    <div class="reports-dashboard animate-fade-in">

      <!-- Page Header -->
      <header class="dash-header">
        <div class="dash-header__icon">
          <i class="bi bi-bar-chart-line-fill"></i>
        </div>
        <div class="dash-header__text">
          <h1 class="dash-header__title">{{ 'REPORTS.TITLE' | translate }}</h1>
          <p class="dash-header__sub">{{ 'REPORTS.SUBTITLE' | translate }}</p>
        </div>
      </header>

      <!-- Grid -->
      <div class="dashboard-grid">

        <!-- Scope Selector Card -->
        <div class="scope-card">
          <div class="scope-card__top">
            <div class="scope-card__icon">
              <i class="bi bi-diagram-3-fill"></i>
            </div>
            <div>
              <h2 class="scope-card__title">{{ 'REPORTS.SELECT_SCOPE_TITLE' | translate }}</h2>
              <p class="scope-card__desc">{{ 'REPORTS.SELECT_SCOPE_DESC' | translate }}</p>
            </div>
          </div>

          <div class="scope-divider"></div>

          <label class="scope-label">{{ 'REPORTS.CHOOSE_BRANCH_OR_GLOBAL' | translate }}</label>
          <div class="scope-select-wrap">
            <i class="bi bi-building scope-select__prefix-icon"></i>
            <select class="scope-select" [(ngModel)]="selectedScope">
              <option [value]="null" disabled selected>{{ 'REPORTS.SELECT_BRANCH' | translate }}</option>
              <option value="global">{{ 'REPORTS.GLOBAL_REPORT_OPTION' | translate }}</option>
              <optgroup label="{{ 'REPORTS.BRANCHES' | translate }}">
                <option *ngFor="let branch of branches$ | async" [value]="branch._id">{{ branch.name }}</option>
              </optgroup>
            </select>
            <i class="bi bi-chevron-down scope-select__chevron"></i>
          </div>

          <button
            appButton
            [routerLink]="getReportRoute()"
            [disabled]="!selectedScope || selectedScope === 'null'"
            variant="default"
            size="lg"
            class="scope-card__btn">
            <i class="bi bi-arrow-right-circle-fill me-2"></i>
            {{ 'REPORTS.VIEW_REPORT' | translate }}
          </button>

          <div class="scope-card__strip"></div>
        </div>

        <!-- Right Column -->
        <div class="side-col">

          <!-- Products Ranking Card -->
          <div class="quick-card quick-card--amber" [routerLink]="['products']">
            <div class="quick-card__inner">
              <div class="quick-card__icon">
                <i class="bi bi-trophy-fill"></i>
              </div>
              <div class="quick-card__body">
                <h3 class="quick-card__title">{{ 'REPORTS.PRODUCTS_RANKING' | translate }}</h3>
                <p class="quick-card__desc">{{ 'REPORTS.PRODUCTS_RANKING_DESC' | translate }}</p>
              </div>
            </div>
            <div class="quick-card__footer">
              <span class="quick-card__link">
                {{ 'REPORTS.VIEW_REPORT' | translate }}
                <i class="bi bi-arrow-right rtl-flip"></i>
              </span>
            </div>
          </div>

          <!-- Tip Card -->
          <div class="tip-card">
            <i class="bi bi-printer tip-card__icon"></i>
            <div>
              <div class="tip-card__title">{{ 'REPORTS.EXPORT_OPTIONS' | translate }}</div>
              <div class="tip-card__body">{{ 'REPORTS.PRINT_GUIDE' | translate }}</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ── Layout ─────────────────────────────────────────── */
    .reports-dashboard {
      max-width: 1280px;
      margin: 0 auto;
      padding: 36px 28px;
    }

    /* ── Page Header ─────────────────────────────────────── */
    .dash-header {
      display: flex;
      align-items: center;
      gap: 20px;
      background: #fff;
      border: 0.5px solid #E2E8F0;
      border-radius: 18px;
      padding: 28px 32px;
      margin-bottom: 24px;
    }
    .dash-header__icon {
      width: 60px;
      height: 60px;
      border-radius: 14px;
      background: #EBF2FA;
      color: #185FA5;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      flex-shrink: 0;
    }
    .dash-header__title {
      font-size: 24px;
      font-weight: 800;
      color: #0F172A;
      margin: 0 0 4px;
      line-height: 1.2;
    }
    .dash-header__sub {
      font-size: 14px;
      color: #94A3B8;
      margin: 0;
    }

    /* ── Dashboard Grid ──────────────────────────────────── */
    .dashboard-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
      gap: 24px;
      align-items: start;
    }

    /* ── Scope Card ──────────────────────────────────────── */
    .scope-card {
      position: relative;
      background: #fff;
      border: 0.5px solid #E2E8F0;
      border-radius: 18px;
      padding: 32px 32px 44px;
      overflow: hidden;
      transition: box-shadow 0.2s ease, transform 0.2s ease;
    }
    .scope-card:hover {
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
      transform: translateY(-2px);
    }
    .scope-card__top {
      display: flex;
      align-items: flex-start;
      gap: 18px;
      margin-bottom: 26px;
    }
    .scope-card__icon {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      background: #EBF2FA;
      color: #185FA5;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .scope-card__title {
      font-size: 20px;
      font-weight: 800;
      color: #0F172A;
      margin: 0 0 6px;
    }
    .scope-card__desc {
      font-size: 14px;
      color: #94A3B8;
      line-height: 1.7;
      margin: 0;
    }
    .scope-divider {
      height: 0.5px;
      background: #F1F5F9;
      margin-bottom: 26px;
    }

    /* ── Scope Select ────────────────────────────────────── */
    .scope-label {
      display: block;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #64748B;
      margin-bottom: 10px;
    }
    .scope-select-wrap {
      position: relative;
      margin-bottom: 20px;
    }
    .scope-select__prefix-icon {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 16px;
      color: #185FA5;
      pointer-events: none;
      z-index: 1;
    }
    .scope-select {
      width: 100%;
      height: 60px;
      padding: 0 48px 0 46px;
      font-size: 15px;
      font-weight: 600;
      color: #1E3A5F;
      background: #EBF2FA;
      border: 1.5px solid #BFDBF7;
      border-left: 4px solid #185FA5;
      border-radius: 14px;
      appearance: none;
      cursor: pointer;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    }
    .scope-select option {
      background: #fff;
      color: #1E293B;
    }
    .scope-select optgroup {
      background: #F0F7FF;
      color: #475569;
    }
    .scope-select:hover {
      background: #DBEAFE;
      border-color: #93C5FD;
    }
    .scope-select:focus {
      background: #DBEAFE;
      border-color: #185FA5;
      border-left-color: #185FA5;
      box-shadow: 0 0 0 4px rgba(24, 95, 165, 0.12);
    }
    .scope-select__chevron {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 13px;
      color: #185FA5;
      pointer-events: none;
    }
    .scope-card__btn {
      width: 100%;
      height: 52px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 700;
    }
    .scope-card__strip {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 5px;
      background: linear-gradient(to right, #185FA5, #0F6E56, #BA7517);
    }

    /* ── Side Column ─────────────────────────────────────── */
    .side-col {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    /* ── Quick Card ──────────────────────────────────────── */
    .quick-card {
      background: #fff;
      border: 0.5px solid #E2E8F0;
      border-radius: 18px;
      overflow: hidden;
      cursor: pointer;
      transition: box-shadow 0.2s ease, transform 0.2s ease;
    }
    .quick-card:hover {
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
      transform: translateY(-2px);
    }
    .quick-card__inner {
      display: flex;
      align-items: flex-start;
      gap: 18px;
      padding: 28px 26px 22px;
    }
    .quick-card__icon {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      flex-shrink: 0;
      transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
    }
    .quick-card--amber .quick-card__icon {
      background: #FFF7ED;
      color: #BA7517;
    }
    .quick-card--amber:hover .quick-card__icon {
      background: #BA7517;
      color: #fff;
      transform: scale(1.08);
    }
    .quick-card__title {
      font-size: 16px;
      font-weight: 800;
      color: #0F172A;
      margin: 0 0 6px;
    }
    .quick-card__desc {
      font-size: 13px;
      color: #94A3B8;
      line-height: 1.6;
      margin: 0;
    }
    .quick-card__footer {
      padding: 14px 26px 20px;
      border-top: 0.5px solid #F1F5F9;
    }
    .quick-card__link {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 700;
      transition: gap 0.2s ease;
    }
    .quick-card--amber .quick-card__link { color: #BA7517; }
    .quick-card:hover .quick-card__link  { gap: 14px; }

    /* ── Tip Card ────────────────────────────────────────── */
    .tip-card {
      background: #F8FAFC;
      border: 0.5px solid #E2E8F0;
      border-radius: 18px;
      padding: 22px 24px;
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }
    .tip-card__icon {
      font-size: 20px;
      color: #94A3B8;
      margin-top: 2px;
      flex-shrink: 0;
    }
    .tip-card__title {
      font-size: 14px;
      font-weight: 700;
      color: #475569;
      margin-bottom: 4px;
    }
    .tip-card__body {
      font-size: 13px;
      color: #94A3B8;
      line-height: 1.6;
    }

    /* ── RTL ─────────────────────────────────────────────── */
    html[dir="rtl"] .scope-select {
      padding-left: 44px;
      padding-right: 44px;
    }
    html[dir="rtl"] .scope-select__prefix-icon {
      left: auto;
      right: 16px;
    }
    html[dir="rtl"] .scope-select__chevron {
      right: auto;
      left: 16px;
    }
    html[dir="rtl"] .rtl-flip {
      transform: rotate(180deg);
    }

    /* ── Responsive ──────────────────────────────────────── */
    @media (max-width: 768px) {
      .dashboard-grid { grid-template-columns: 1fr; }
    }

    /* ── Print ───────────────────────────────────────────── */
    @media print {
      .reports-dashboard { padding: 0; }
      .scope-card:hover,
      .quick-card:hover { transform: none; box-shadow: none; }
    }
  `]
})
export class ReportsDashboardComponent implements OnInit {
  private readonly branchService = inject(BranchService);

  branches$: Observable<any[]> = this.branchService.listMine().pipe(
    map(res => res.data.branches)
  );
  selectedScope: string | null = null;

  ngOnInit(): void {}

  getReportRoute(): any[] {
    if (!this.selectedScope || this.selectedScope === 'null') {
      return [];
    }
    if (this.selectedScope === 'global') {
      return ['manager-overview'];
    }
    return ['branch', this.selectedScope];
  }
}