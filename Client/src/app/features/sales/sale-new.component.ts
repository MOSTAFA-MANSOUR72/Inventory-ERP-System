import { CommonModule, NgForOf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router'; // Added RouterLink
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { SalesService, InventoryProduct } from './sales.service';
import { SALE_PAYMENT_METHODS } from './sale-payment.constants';
import { ButtonComponent, CardComponent, InputComponent } from '../../shared/components/ui';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-sale-new',
  imports: [
    CommonModule,
    NgForOf,
    ReactiveFormsModule,
    RouterLink, // Essential for the 'Back' buttons
    MatStepperModule,
    MatButtonModule,
    MatSnackBarModule,
    InputComponent,
    ButtonComponent,
    CardComponent,
    TranslateModule,
  ],
  templateUrl: './sale-new.component.html',
  styleUrl: './sale-new.component.scss',
})
export class SaleNewComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly salesApi = inject(SalesService);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);

  readonly paymentMethods = SALE_PAYMENT_METHODS;
  inventoryItems: InventoryProduct[] = [];
  inventoryLoading = false;

  paymentForm = this.fb.nonNullable.group({
    paymentMethod: ['cash', Validators.required],
    notes: [''],
  });

  lines = this.fb.array<FormGroup>([]);
  serverError: string | null = null;

  constructor() {
    this.addLine();
  }

  ngOnInit(): void {
    this.fetchInventory();
  }

  fetchInventory(): void {
    this.inventoryLoading = true;
    this.salesApi.getInventory().subscribe({
      next: (res) => {
        this.inventoryItems = res.data.inventory;
        this.inventoryLoading = false;
      },
      error: () => {
        this.snack.open('Error: Terminal disconnected from inventory ledger', 'Dismiss');
        this.inventoryLoading = false;
      }
    });
  }

  /** * Dynamic Calculation for the Header Widget
   * Calculates total based on selected product prices and quantities
   */
  calculateTotal(): number {
    return this.lines.controls.reduce((acc, line) => {
      const productId = line.get('inventoryProduct')?.value;
      const quantity = line.get('quantity')?.value || 0;
      const item = this.getInventoryItem(productId);
      return acc + (item ? item.sellPrice * quantity : 0);
    }, 0);
  }

  getInventoryItem(id: string): InventoryProduct | undefined {
    return this.inventoryItems.find(i => i._id === id);
  }

  isQuantityValid(i: number): boolean {
    const line = this.lines.at(i);
    const productId = line.get('inventoryProduct')?.value;
    const quantity = line.get('quantity')?.value || 0;
    const item = this.getInventoryItem(productId);
    if (!item || !productId) return true;
    return quantity <= item.quantity;
  }

  get canContinue(): boolean {
    if (this.lines.invalid || this.lines.length === 0) return false;
    // Check all lines for stock conflict
    return this.lines.controls.every((_, i) => this.isQuantityValid(i));
  }

  private lineGroup(): FormGroup {
    return this.fb.nonNullable.group({
      inventoryProduct: ['', [Validators.required, Validators.pattern(/^[a-f\d]{24}$/i)]],
      quantity: [1, [Validators.required, Validators.min(1)]],
    });
  }

  addLine(): void {
    this.lines.push(this.lineGroup());
  }

  removeLine(i: number): void {
    if (this.lines.length > 1) {
      this.lines.removeAt(i);
    } else {
      this.lines.at(0).reset({ quantity: 1 });
    }
  }

  submit(): void {
    if (this.lines.invalid || this.paymentForm.invalid) {
      this.lines.markAllAsTouched();
      this.paymentForm.markAllAsTouched();
      this.snack.open('Please review item quantities and payment fields', 'OK', { duration: 3000 });
      return;
    }

    const items = this.lines.getRawValue().map((l) => ({
      inventoryProduct: l['inventoryProduct'] as string,
      quantity: Number(l['quantity']),
    }));

    const pay = this.paymentForm.getRawValue();

    this.serverError = null;
    this.salesApi
      .createSale({
        items,
        paymentMethod: pay.paymentMethod,
        notes: pay.notes || undefined,
      })
      .subscribe({
        next: (res) => {
          this.snack.open('Sale Processed Successfully', 'Success');
          void this.router.navigate(['/sales', res.data.receipt._id]);
        },
        error: (e) => {
          this.serverError = e?.error?.message || 'Critical: Transaction Failed. Please check inventory levels.';
          this.snack.open('Transaction Failed', 'Dismiss');
        }
      });
  }
}