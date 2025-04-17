import {
  ErrorComponent,
  createFileRoute,
  useRouter,
} from "@tanstack/react-router";
import {
  useQueryErrorResetBoundary,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  FormSchema,
  TodoNotFoundError,
  todoQueryOptions,
  updateTodo,
} from "@/todos";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";

export const Route = createFileRoute("/todo/$todoId")({
  loader: ({ context: { queryClient }, params: { todoId } }) => {
    return queryClient.ensureQueryData(todoQueryOptions(todoId));
  },
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
      <Button
        onClick={() => {
          router.invalidate();
        }}
      >
        retry
      </Button>
      <ErrorComponent error={error} />
    </div>
  );
}

export function TodoComponent() {
  const todoId = Route.useParams().todoId;
  const { data: todo } = useSuspenseQuery(todoQueryOptions(todoId));

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: todo,
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    updateTodo(todoId, data);
    console.log({ data });
  }

  return (
    <div className="space-y-2">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Edit Todo
      </h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-2/3 space-y-6"
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <Input
                  onChange={field.onChange}
                  defaultValue={field.value}
                  placeholder="Title"
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <Input
                  onChange={field.onChange}
                  defaultValue={field.value}
                  placeholder="Title"
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="complete">Complete</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in progress">In Progress</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
}
