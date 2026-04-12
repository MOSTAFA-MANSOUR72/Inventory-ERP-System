import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function matchField(field: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const parent = control.parent;
    if (!parent) {
      return null;
    }
    const other = parent.get(field);
    if (!other) {
      return null;
    }
    return control.value === other.value ? null : { mismatch: true };
  };
}
