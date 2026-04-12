import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { ProviderService } from './provider.service';
import { PageStateComponent } from '../../shared/components/page-state/page-state.component';

@Component({
  standalone: true,
  selector: 'app-provider-detail',
  imports: [CommonModule, MatCardModule, PageStateComponent],
  template: `
    <div class="app-page">
      <app-page-state [loading]="loading" [error]="error" (retry)="fetch()">
        @if (p) {
          <h1>{{ p.name }}</h1>
          <mat-card>
            <p><strong>Email:</strong> {{ p.email }}</p>
            <p><strong>Phone:</strong> {{ p.phone }}</p>
            @if (p.address) {
              <p><strong>Address:</strong> {{ p.address }}</p>
            }
          </mat-card>
        }
      </app-page-state>
    </div>
  `,
})
export class ProviderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ProviderService);

  p: import('./provider.service').Provider | null = null;
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Missing id';
      this.loading = false;
      return;
    }
    this.loading = true;
    this.api.getById(id).subscribe({
      next: (res) => {
        this.p = res.data.provider;
        this.loading = false;
      },
      error: (e) => {
        this.error = e?.error?.message || 'Failed';
        this.loading = false;
      },
    });
  }
}
