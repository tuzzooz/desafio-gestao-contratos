import { useState, useCallback, useEffect } from "react";
import type { Employee } from "@/types/employee";
import {
  listEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "@/services/employeeService";

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = useCallback(() => {
    setIsLoading(true);
    setError(null);
    try {
      const data = listEmployees();
      setEmployees(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar funcionários.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addEmployee = useCallback((data: Omit<Employee, "id">) => {
    setIsLoading(true);
    setError(null);
    try {
      const created = createEmployee(data);
      setEmployees((prev) => [...prev, created]);
      return created;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao adicionar funcionário.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const editEmployee = useCallback((id: string, data: Partial<Omit<Employee, "id">>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = updateEmployee(id, data);
      if (!updated) {
        setError("Funcionário não encontrado.");
        return null;
      }
      setEmployees((prev) => prev.map((e) => (e.id === id ? updated : e)));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao editar funcionário.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeEmployee = useCallback((id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const success = deleteEmployee(id);
      if (!success) {
        setError("Funcionário não encontrado.");
        return false;
      }
      setEmployees((prev) => prev.filter((e) => e.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover funcionário.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return {
    employees,
    isLoading,
    error,
    fetchEmployees,
    addEmployee,
    editEmployee,
    removeEmployee,
  };
}
