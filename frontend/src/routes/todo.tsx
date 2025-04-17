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
import { TodoNotFoundError, todosQueryOptions, type Todo } from "@/todo";
import { useEffect } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";

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
      <button
        onClick={() => {
          router.invalidate();
        }}
      >
        retry
      </button>
      <ErrorComponent error={error} />
    </div>
  );
}

export const columns: ColumnDef<Todo>[] = [
  {
    accessorKey: "expiredAt",
    header: "Expires",
    cell: ({ row }) => <div>{row.getValue("expiredAt")}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge className="capitalize">{row.getValue("status")}</Badge>
    ),
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue("title")}</div>,
  },
  {
    accessorKey: "description",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Description
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="lowercase">{row.getValue("description")}</div>
    ),
  },
  {
    id: "edit",
    enableHiding: false,
    cell: ({ row }) => {
      const todo = row.original;
      return (
        <Link
          to="/todo/$todoId"
          params={{ todoId: todo.id }}
          className="text-blue-600 hover:opacity-75"
          activeProps={{ className: "font-bold underline" }}
        >
          <Button>Edit</Button>
        </Link>
      );
    },
  },
];

export function TodoComponent() {
  const { data: todos } = useSuspenseQuery(todosQueryOptions);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Todo List</h1>
      <Link
        to="/todo"
        className="text-blue-600 hover:opacity-75"
        activeProps={{ className: "font-bold underline" }}
      >
        <Button variant="outline">New</Button>
      </Link>
      <DataTable columns={columns} data={todos} />
      <Outlet />
    </div>
  );
}
