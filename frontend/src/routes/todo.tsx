import {
  useQueryErrorResetBoundary,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  createFileRoute,
  ErrorComponent,
  Link,
  Outlet,
  useRouter,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import {
  TodoNotFoundError,
  todosQueryOptions,
  useRemove,
  type Todo,
} from "@/todo";
import { useEffect } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  CircleCheck,
  CircleDashed,
  CircleDot,
  CircleHelp,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/main";
import { format } from "date-fns";

export const Route = createFileRoute("/todo")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(todosQueryOptions),
  errorComponent: TodoErrorComponent,
  component: TodoComponent,
});

export function TodoErrorComponent({ error }: ErrorComponentProps) {
  const router = useRouter();
  if (error instanceof TodoNotFoundError) {
    return <div>{error.message}</div>;
  }
  const queryErrorResetBoundary = useQueryErrorResetBoundary();

  useEffect(() => {
    queryErrorResetBoundary.reset();
  }, [queryErrorResetBoundary]);

  return (
    <div>
      <Button onClick={() => router.invalidate()}>retry</Button>
      <ErrorComponent error={error} />
    </div>
  );
}

export const columns: ColumnDef<Todo>[] = [
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const value = row.original.status;
      const Icon = () =>
        value === "pending" ? (
          <CircleDot className="text-yellow-600" />
        ) : value === "in-progress" ? (
          <CircleDashed className="text-blue-600" />
        ) : value === "complete" ? (
          <CircleCheck className="text-green-600" />
        ) : (
          <CircleHelp />
        );
      return (
        <Button variant="ghost">
          <Icon /> {value}
        </Button>
      );
    },
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Title
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => <div className="lowercase">{row.getValue("title")}</div>,
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Description
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="lowercase">{row.getValue("description")}</div>
    ),
  },
  {
    accessorKey: "expiredAt",
    header: "Expires",
    cell: ({ row }) => <div>{format(row.getValue("expiredAt"), "PPP")}</div>,
  },
  {
    id: "edit",
    enableHiding: false,
    cell: ({ row }) => {
      const todo = row.original;
      const mutation = useRemove(queryClient)(todo.id);
      return (
        <div className="flex gap-2">
          <Link to="/todo/$id" params={{ id: todo.id }}>
            <Button variant="outline" size="sm">
              <Pencil className="text-gray-600" /> Edit
            </Button>
          </Link>
          <Button
            size="sm"
            variant="outline"
            onClick={() => mutation.mutate({ id: todo.id })}
          >
            <Trash2 className="text-red-600" /> Remove
          </Button>
        </div>
      );
    },
  },
];

export function TodoComponent() {
  const { data } = useSuspenseQuery(todosQueryOptions);
  return (
    <div>
      <div className="flex justify-between gap-1">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Todos
        </h1>
        <Link to="/todo/new">
          <Button size="lg">
            <Plus /> New
          </Button>
        </Link>
      </div>
      <DataTable columns={columns} data={data} />
      <Outlet />
    </div>
  );
}
