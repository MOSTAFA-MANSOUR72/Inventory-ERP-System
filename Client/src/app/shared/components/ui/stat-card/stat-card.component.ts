import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div 
      class="group relative bg-white border-2 border-slate-100 rounded-[3rem] p-10 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:-translate-y-1"
      [class.ring-4]="alert"
      [class.ring-rose-50]="alert"
    >
      <!-- Header Area -->
      <div class="flex items-start justify-between mb-8">
        <div class="relative">
          <div 
            class="w-14 h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl flex items-center justify-center text-slate-900 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-300"
            [class.shimmer]="loading"
          >
            <ng-content select="[icon]" *ngIf="!loading"></ng-content>
          </div>
          @if (pulse && !loading) {
            <span class="absolute -top-1 -right-1 flex h-4 w-4">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-4 w-4 bg-indigo-600 border-2 border-white"></span>
            </span>
          }
        </div>

        @if (trend && !loading) {
          <div [class]="'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ' + (trend.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600')">
            @if (trend.isPositive) {
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
            } @else {
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
            }
            {{ trend.value }}
          </div>
        } @else if (loading) {
          <div class="w-16 h-6 rounded-full shimmer"></div>
        }
      </div>

      <!-- Content Area -->
      <div class="space-y-1">
        <p class="text-[11px] font-bold text-slate-500 uppercase tracking-[0.1em]" [class.shimmer]="loading" [class.w-24]="loading" [class.h-3]="loading">
          <span *ngIf="!loading">{{ title }}</span>
        </p>
        <p 
          class="text-4xl font-extrabold text-slate-800 tracking-tighter" 
          [class.shimmer]="loading" 
          [class.w-full]="loading" 
          [class.h-10]="loading"
        >
          <span *ngIf="!loading">{{ value }}</span>
        </p>
      </div>

      <!-- Progress Area -->
      @if (progress !== null && !loading) {
        <div class="mt-8 space-y-2">
          <div class="flex justify-between items-center text-[10px] font-bold text-slate-400">
            <span>{{ 'COMMON.PROGRESS_TARGET' | translate }}</span>
            <span class="text-indigo-600">{{ progress }}%</span>
          </div>
          <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              class="h-full bg-indigo-600 rounded-full transition-all duration-1000 ease-out"
              [style.width.%]="progress"
            ></div>
          </div>
        </div>
      } @else if (loading) {
        <div class="mt-10 h-2 w-full bg-slate-100 rounded-full shimmer"></div>
      }
      
      <!-- Alert Overlay (Subtle) -->
      @if (alert && !loading) {
        <div class="absolute top-4 right-4 text-rose-500 animate-pulse">
           <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
      }
    </div>
  `,
})
export class StatCardComponent {
  @Input() title: string = '';
  @Input() value: string | number = 0;
  @Input() trend?: { value: string; isPositive: boolean };
  @Input() alert = false;
  @Input() progress: number | null = null;
  @Input() pulse = false;
  @Input() loading = false;
}
