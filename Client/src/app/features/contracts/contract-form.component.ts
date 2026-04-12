import { CommonModule, NgForOf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { InputComponent } from '../../shared/components/ui';
import { ProductService } from '../products/product.service';
import { ContractService } from './contract.service';
import { AuthService } from '../../core/services/auth.service';
import { BranchService, Branch } from '../branches/branch.service';

@Component({
  standalone: true,
  selector: 'app-contract-form',
  imports: [
    CommonModule,
    NgForOf,
    ReactiveFormsModule,
    InputComponent,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './contract-form.component.html',
  styleUrl: './contract-form.component.scss',
})
export class ContractFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productsApi = inject(ProductService);
  private readonly contractsApi = inject(ContractService);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);
  readonly auth = inject(AuthService);
  private readonly branchesApi = inject(BranchService);

  currentStep = 1;
  branch: Branch | null = null;
  productOptions: { _id: string; name: string }[] = [];
  
  headerForm = this.fb.nonNullable.group({
    paymentMethod: ['cash' as 'cash' | 'check' | 'credit' | 'bank_transfer'],
    description: [''],
  });

  lines = this.fb.array<FormGroup>([]);

  ngOnInit(): void {
    this.productsApi.list({ limit: 100, page: 1 }).subscribe({
      next: (res) => {
        this.productOptions = res.data.products.map((p) => ({ _id: p._id, name: p.name }));
      },
    });

    const branchId = typeof this.auth.user?.branch === 'object' ? (this.auth.user?.branch as any)?._id : this.auth.user?.branch;
    if (branchId) {
       const id = typeof branchId === 'string' ? branchId : (branchId as any)._id;
       if (id) {
         this.branchesApi.getById(id).subscribe({
           next: (res) => this.branch = res.data.branch
         });
       }
    }

    this.addLine();
  }

  private createLine(): FormGroup {
    return this.fb.nonNullable.group({
      product: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      buyPrice: [0, [Validators.required, Validators.min(0)]],
      sellPrice: [0, [Validators.required, Validators.min(0)]],
    });
  }

  addLine(): void {
    this.lines.push(this.createLine());
  }

  removeLine(i: number): void {
    if (this.lines.length > 1) {
      this.lines.removeAt(i);
    }
  }

  get totals() {
    return this.lines.controls.reduce((acc, ctrl) => {
      const v = ctrl.value;
      const qty = v.quantity || 0;
      acc.cost += (v.buyPrice || 0) * qty;
      acc.revenue += (v.sellPrice || 0) * qty;
      acc.items += qty;
      return acc;
    }, { cost: 0, revenue: 0, items: 0 });
  }

  get profitMargin(): number {
    const t = this.totals;
    if (t.revenue === 0) return 0;
    return ((t.revenue - t.cost) / t.revenue) * 100;
  }

  nextStep(): void {
    if (this.currentStep === 1 && this.headerForm.valid) {
      this.currentStep = 2;
    } else if (this.currentStep === 2 && this.lines.valid && this.lines.length > 0) {
      this.currentStep = 3;
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) this.currentStep--;
  }

  getProductName(id: string): string {
    return this.productOptions.find(p => p._id === id)?.name || 'Unknown Product';
  }

  submit(): void {
    if (this.headerForm.invalid || this.lines.length === 0 || this.lines.invalid) {
      this.snack.open('Please fix the errors in the form', 'OK', { duration: 3000 });
      return;
    }

    const h = this.headerForm.getRawValue();
    const products = this.lines.getRawValue().map((l) => ({
      product: l['product'] as string,
      quantity: l['quantity'] as number,
      buyPrice: l['buyPrice'] as number,
      sellPrice: l['sellPrice'] as number,
    }));
    
    const b = this.auth.user?.branch;
    const branchId = typeof b === 'object' && b && '_id' in b ? String(b['_id']) : String(b || '');
    
    this.contractsApi
      .create({
        branch: branchId,
        products,
        paymentMethod: h.paymentMethod,
        description: h.description || undefined,
      })
      .subscribe({
        next: (res) => void this.router.navigate(['/contracts', res.data.contract._id]),
        error: (e) =>
          this.snack.open(e?.error?.message || 'Could not create contract', 'OK', { duration: 8000 }),
      });
  }
}
