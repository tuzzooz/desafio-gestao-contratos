import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Department } from "@/types/employee";
import { toUTC } from "@/utils/dateUtils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const employeeSchema = z
  .object({
    fullName: z.string().trim().min(1, "Nome é obrigatório.").max(100, "Máximo de 100 caracteres."),
    email: z.string().trim().email("E-mail inválido.").max(255, "Máximo de 255 caracteres."),
    jobTitle: z.string().trim().min(1, "Cargo é obrigatório.").max(100, "Máximo de 100 caracteres."),
    department: z.nativeEnum(Department, { errorMap: () => ({ message: "Selecione um departamento." }) }),
    startDate: z.string().min(1, "Data de início é obrigatória."),
    expirationDate: z.string().min(1, "Data de expiração é obrigatória."),
    phone: z.string().trim().max(20, "Máximo de 20 caracteres.").optional().or(z.literal("")),
    notes: z.string().trim().max(500, "Máximo de 500 caracteres.").optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.expirationDate) return true;
      return new Date(data.expirationDate) > new Date(data.startDate);
    },
    {
      message: "A data de expiração deve ser posterior à data de início.",
      path: ["expirationDate"],
    }
  );

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  onSubmit: (data: Omit<import("@/types/employee").Employee, "id">) => import("@/types/employee").Employee | null;
  isLoading: boolean;
}

export function EmployeeForm({ onSubmit, isLoading }: EmployeeFormProps) {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      fullName: "",
      email: "",
      jobTitle: "",
      department: undefined,
      startDate: "",
      expirationDate: "",
      phone: "",
      notes: "",
    },
  });

  const onFormSubmit = (values: EmployeeFormValues) => {
    const result = onSubmit({
      fullName: values.fullName,
      email: values.email,
      jobTitle: values.jobTitle,
      department: values.department,
      startDate: toUTC(new Date(values.startDate)),
      expirationDate: toUTC(new Date(values.expirationDate)),
      phone: values.phone || undefined,
      notes: values.notes || undefined,
    });

    if (result) {
      reset();
      toast({
        title: "Funcionário cadastrado!",
        description: `${result.fullName} foi adicionado com sucesso.`,
      });
    }
  };

  const fieldClass = "flex flex-col gap-1.5";
  const errorClass = "text-sm text-destructive font-medium";

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="grid gap-4 sm:grid-cols-2">
      <div className={fieldClass}>
        <Label htmlFor="fullName">Nome completo</Label>
        <Input id="fullName" placeholder="João da Silva" {...register("fullName")} />
        {errors.fullName && <p className={errorClass}>{errors.fullName.message}</p>}
      </div>

      <div className={fieldClass}>
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" placeholder="joao@empresa.com" {...register("email")} />
        {errors.email && <p className={errorClass}>{errors.email.message}</p>}
      </div>

      <div className={fieldClass}>
        <Label htmlFor="jobTitle">Cargo</Label>
        <Input id="jobTitle" placeholder="Desenvolvedor" {...register("jobTitle")} />
        {errors.jobTitle && <p className={errorClass}>{errors.jobTitle.message}</p>}
      </div>

      <div className={fieldClass}>
        <Label htmlFor="department">Departamento</Label>
        <Select
          onValueChange={(val) => setValue("department", val as Department, { shouldValidate: true })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            {Object.values(Department).map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.department && <p className={errorClass}>{errors.department.message}</p>}
      </div>

      <div className={fieldClass}>
        <Label htmlFor="startDate">Data de início</Label>
        <Input id="startDate" type="date" {...register("startDate")} />
        {errors.startDate && <p className={errorClass}>{errors.startDate.message}</p>}
      </div>

      <div className={fieldClass}>
        <Label htmlFor="expirationDate">Data de expiração</Label>
        <Input id="expirationDate" type="date" {...register("expirationDate")} />
        {errors.expirationDate && (
          <p className={errorClass}>{errors.expirationDate.message}</p>
        )}
      </div>

      <div className={fieldClass}>
        <Label htmlFor="phone">Telefone (opcional)</Label>
        <Input id="phone" placeholder="(11) 99999-0000" {...register("phone")} />
        {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="notes">Observações (opcional)</Label>
        <Textarea id="notes" placeholder="Notas adicionais..." {...register("notes")} />
        {errors.notes && <p className={errorClass}>{errors.notes.message}</p>}
      </div>

      <div className="sm:col-span-2 flex justify-end pt-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar"
          )}
        </Button>
      </div>
    </form>
  );
}
