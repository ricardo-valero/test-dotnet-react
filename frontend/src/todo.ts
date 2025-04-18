import axios from "redaxios";
import { API_BASE_URL } from "./config";
import { QueryClient, queryOptions, useMutation } from "@tanstack/react-query";
import { z } from "zod";

const TodoSchema = z.object({
  id: z
    .number()
    .int()
    .transform((int) => `${int}`),
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.string().transform((str) => statusList.parse(str)),
  expiredAt: z.string().transform((str) => new Date(str)),
});

export type Todo = z.infer<typeof TodoSchema>;

export const statusList = z.enum(["pending", "in-progress", "complete"]);

export const FormSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: statusList,
  expiredAt: z.date(),
});

export class TodoNotFoundError extends Error {}

const single = async (id: string) => {
  console.info(`Fetching todo with id ${id}...`);
  return axios
    .get<Todo>(`${API_BASE_URL}/todo/${id}`)
    .then((r) => r.data)
    .catch((err) => {
      if (err.status === 404) {
        throw new TodoNotFoundError(`Todo with id "${id}" not found!`);
      }
      throw err;
    });
};

const list = async (): Promise<Todo[]> => {
  console.info("Fetching todos...");
  return axios
    .get(`${API_BASE_URL}/todo`) // Mark as unknown since we'll validate
    .then((r) => z.array(TodoSchema).parse(r.data))
    .catch((err) => {
      if (err instanceof z.ZodError) {
        console.error("Data validation failed:", err.errors);
        throw new Error(`Invalid data received from API: ${err.message}`);
      }
      throw new Error(`Failed to fetch todos: ${err.message}`);
    });
};

const create = async ({ data }: { data: Partial<Todo> }) => {
  console.info(`Creating todo...`);
  return axios
    .post<Todo>(`${API_BASE_URL}/todo`, data)
    .then((r) => r.data)
    .catch((err) => {
      throw new Error(`Failed to create todo: ${err.message}`);
    });
};

const update = async ({
  id,
  partial,
}: {
  id: string;
  partial: Partial<Todo>;
}) => {
  console.info(`Updating todo with id ${id}...`);
  return axios
    .put<Todo>(`${API_BASE_URL}/todo/${id}`, partial)
    .then((r) => r.data)
    .catch((err) => {
      throw new Error(`Failed to update todo: ${err.message}`);
    });
};

const remove = async ({ id }: { id: string }) => {
  console.info(`Removing todo with id ${id}...`);
  return axios
    .delete<Todo>(`${API_BASE_URL}/todo/${id}`)
    .then((r) => r.data)
    .catch((err) => {
      throw new Error(`Failed to remove todo: ${err.message}`);
    });
};

export const todoQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["todo", { id }],
    queryFn: () => single(id),
  });

export const todosQueryOptions = queryOptions({
  queryKey: ["todo"],
  queryFn: () => list(),
});

export const useCreate = (queryClient: QueryClient) => () =>
  useMutation({
    mutationKey: ["todo", "create"],
    mutationFn: create,
    onSuccess: () => queryClient.invalidateQueries(),
  });

export const useUpdate = (queryClient: QueryClient) => (id: string) =>
  useMutation({
    mutationKey: ["todo", "update", id],
    mutationFn: update,
    onSuccess: () => queryClient.invalidateQueries(),
  });

export const useRemove = (queryClient: QueryClient) => (id: string) =>
  useMutation({
    mutationKey: ["todo", "remove", id],
    mutationFn: remove,
    onSuccess: () => queryClient.invalidateQueries(),
  });
