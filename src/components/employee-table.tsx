import { useMemo, useState } from "react";
import { ArrowUpDown, Search, Users } from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";
import { useDebounce } from "@/hooks/useDebounce";
import { getEmployeeStatus } from "@/utils/dateUtils";
import { Department, type Employee, type EmployeeStatus } from "@/types/employee";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type SortKey = "fullName" | "expirationDate";
type SortDir = "asc" | "desc";

const STATUS_BADGE: Record<EmployeeStatus, "success" | "warning" | "expired"> = {
  Active: "success",
  "Expiring Soon": "warning",
  Expired: "expired",
};

const STATUS_LABEL: Record<EmployeeStatus, string> = {
  Active: "Ativo",
  "Expiring Soon": "Expirando",
  Expired: "Expirado",
};

const PAGE_SIZE = 10;

export function EmployeeTable() {
  const { employees, isLoading } = useEmployees();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [department, setDepartment] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("fullName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return employees.filter((e) => {
      const matchesSearch =
        !q || e.fullName.toLowerCase().includes(q) || e.email.toLowerCase().includes(q);
      const matchesDept = department === "all" || e.department === department;
      return matchesSearch && matchesDept;
    });
  }, [employees, debouncedSearch, department]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "fullName") {
        cmp = a.fullName.localeCompare(b.fullName);
      } else {
        cmp = new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Reset page when filters change
  useMemo(() => setPage(1), [debouncedSearch, department]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.values(Department).map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table or Empty */}
      {sorted.length === 0 ? (
        <EmptyState hasFilters={!!debouncedSearch || department !== "all"} />
      ) : (
        <>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <SortableHead label="Nome" sortKey="fullName" current={sortKey} dir={sortDir} onToggle={toggleSort} />
                  <TableHead>E-mail</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Depto.</TableHead>
                  <SortableHead label="Vencimento" sortKey="expirationDate" current={sortKey} dir={sortDir} onToggle={toggleSort} />
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((emp) => {
                  const status = getEmployeeStatus(emp.expirationDate);
                  return (
                    <TableRow key={emp.id}>
                      <TableCell className="font-medium">{emp.fullName}</TableCell>
                      <TableCell>{emp.email}</TableCell>
                      <TableCell>{emp.jobTitle}</TableCell>
                      <TableCell>{emp.department}</TableCell>
                      <TableCell>{new Date(emp.expirationDate).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_BADGE[status]}>{STATUS_LABEL[status]}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Mostrando {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, sorted.length)} de {sorted.length}
              </span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>
                  Anterior
                </Button>
                <Button variant="outline" size="sm" disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)}>
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SortableHead({
  label,
  sortKey,
  current,
  dir,
  onToggle,
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: SortDir;
  onToggle: (k: SortKey) => void;
}) {
  const active = current === sortKey;
  return (
    <TableHead>
      <button
        type="button"
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
        onClick={() => onToggle(sortKey)}
      >
        {label}
        <ArrowUpDown className={`h-3.5 w-3.5 ${active ? "text-foreground" : "text-muted-foreground/50"}`} />
        {active && <span className="sr-only">{dir === "asc" ? "crescente" : "decrescente"}</span>}
      </button>
    </TableHead>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Users className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">
        {hasFilters ? "Nenhum resultado encontrado" : "Nenhum funcionário cadastrado"}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        {hasFilters
          ? "Tente ajustar os filtros de busca ou departamento."
          : "Comece adicionando o primeiro funcionário usando o formulário acima."}
      </p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-[180px]" />
      </div>
      <div className="rounded-lg border overflow-hidden">
        <div className="p-1 space-y-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
