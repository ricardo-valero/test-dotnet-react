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
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/main";

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
      const mutation = useRemove(queryClient)(todo.id);
      return (
        <div className="flex gap-2">
          <Link to="/todo/$id" params={{ id: todo.id }}>
            <Button>Edit</Button>
          </Link>
          <Button onClick={() => mutation.mutate({ id: todo.id })}>
            Remove
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
          <Button size="lg">New</Button>
        </Link>
      </div>
      <DataTable columns={columns} data={data} />
      <Outlet />
    </div>
  );
}
