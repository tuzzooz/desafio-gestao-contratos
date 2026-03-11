import { useEmployees } from "@/hooks/useEmployees";
import { EmployeeForm } from "@/components/employee-form";
import { EmployeeTable } from "@/components/employee-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

const Index = () => {
  const { employees, isLoading, error, addEmployee } = useEmployees();

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container flex items-center gap-3 h-16">
          <div className="rounded-lg bg-primary p-2">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground leading-tight">Gestão de Contratos</h1>
            <p className="text-xs text-muted-foreground">Controle de funcionários e vencimentos</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container py-6 space-y-6">
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Novo Funcionário</CardTitle>
          </CardHeader>
          <CardContent>
            <EmployeeForm onSubmit={addEmployee} isLoading={isLoading} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Funcionários Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            <EmployeeTable employees={employees} isLoading={isLoading} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Index;