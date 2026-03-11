import type { Employee } from "@/types/employee";

const STORAGE_KEY = "employees";

function getAll(): Employee[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveAll(employees: Employee[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
}

export function listEmployees(): Employee[] {
  return getAll();
}

export function createEmployee(
  data: Omit<Employee, "id">
): Employee {
  const employees = getAll();
  const newEmployee: Employee = {
    ...data,
    id: crypto.randomUUID(),
  };
  employees.push(newEmployee);
  saveAll(employees);
  return newEmployee;
}

export function updateEmployee(
  id: string,
  data: Partial<Omit<Employee, "id">>
): Employee | null {
  const employees = getAll();
  const index = employees.findIndex((e) => e.id === id);
  if (index === -1) return null;

  employees[index] = { ...employees[index], ...data };
  saveAll(employees);
  return employees[index];
}

export function deleteEmployee(id: string): boolean {
  const employees = getAll();
  const filtered = employees.filter((e) => e.id !== id);
  if (filtered.length === employees.length) return false;

  saveAll(filtered);
  return true;
}
