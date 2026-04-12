import { UserRole } from '../models/user.model';

export const ALL_ROLES: UserRole[] = ['admin', 'manager', 'cashier'];

export function roleLabel(role: UserRole): string {
  const map: Record<UserRole, string> = {
    admin: 'Admin',
    manager: 'Manager',
    cashier: 'Cashier',
  };
  return map[role];
}
