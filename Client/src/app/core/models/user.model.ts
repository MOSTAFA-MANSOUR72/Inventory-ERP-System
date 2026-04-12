export type UserRole = 'admin' | 'manager' | 'cashier';

export interface BranchRef {
  _id: string;
  name: string;
  location?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  branch?: string | BranchRef | null;
  manager?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
