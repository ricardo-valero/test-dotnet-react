import {
  ErrorComponent,
  createFileRoute,
  useRouter,
} from "@tanstack/react-router";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { FormSchema, statusList, TodoNotFoundError, useCreate } from "@/todo";
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
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  CalendarIcon,
  CircleCheck,
  CircleDashed,
  CircleDot,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

export const Route = createFileRoute("/todo/new")({
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
  const { queryClient } = Route.useRouteContext();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const mutation = useCreate(queryClient)();

  function onSubmit(data: z.infer<typeof FormSchema>) {
    mutation.mutate({ data });
  }

  return (
    <div className="space-y-2">
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        New Todo
      </h2>
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
                  value={field.value}
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
                  value={field.value}
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
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {statusList.options.map((option) =>
                      option === "pending" ? (
                        <SelectItem value={option}>
                          <CircleDot className="text-yellow-600" /> {option}
                        </SelectItem>
                      ) : option === "in-progress" ? (
                        <SelectItem value={option}>
                          <CircleDashed className="text-blue-600" /> {option}
                        </SelectItem>
                      ) : option === "complete" ? (
                        <SelectItem value={option}>
                          <CircleCheck className="text-green-600" /> {option}
                        </SelectItem>
                      ) : (
                        <SelectItem value={option}>{option}</SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="expiredAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expires</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
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
