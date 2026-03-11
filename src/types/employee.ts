export enum Department {
  TI = "TI",
  RH = "RH",
  Marketing = "Marketing",
  Vendas = "Vendas",
}

export interface Employee {
  id: string;
  fullName: string;
  email: string;
  jobTitle: string;
  department: Department;
  startDate: string; // ISO UTC
  expirationDate: string; // ISO UTC
  phone?: string;
  notes?: string;
}

export type EmployeeStatus = "Active" | "Expiring Soon" | "Expired";
