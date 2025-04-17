import axios from "redaxios";
import { API_BASE_URL } from "./config";
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";

export type Todo = { id: string } & z.TypeOf<typeof FormSchema>;

export const FormSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.string(),
  expiredAt: z.date(),
});

export class TodoNotFoundError extends Error {}

export const single = async (id: string) => {
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

export const list = async () => {
  console.info("Fetching todos...");
  return axios
    .get<Array<Todo>>(`${API_BASE_URL}/todo`)
    .then((r) => r.data)
    .catch((err) => {
      throw new Error(`Failed to fetch todos: ${err.message}`);
    });
};

export const create = async (todo: Partial<Todo>) => {
  console.info(`Creating todo...`);
  return axios
    .post<Todo>(`${API_BASE_URL}/todo`, todo)
    .then((r) => r.data)
    .catch((err) => {
      throw new Error(`Failed to create todo: ${err.message}`);
    });
};

export const update = async (id: string, partial: Partial<Todo>) => {
  console.info(`Updating todo with id ${id}...`);
  return axios
    .put<Todo>(`${API_BASE_URL}/todo/${id}`, partial)
    .then((r) => r.data)
    .catch((err) => {
      throw new Error(`Failed to update todo: ${err.message}`);
    });
};

export const remove = async (id: string) => {
  console.info(`Removing todo with id ${id}...`);
  return axios
    .delete<Todo>(`${API_BASE_URL}/todo/${id}`)
    .then((r) => r.data)
    .catch((err) => {
      throw new Error(`Failed to remove todo: ${err.message}`);
    });
};

export const todoQueryOptions = (todoId: string) =>
  queryOptions({
    queryKey: ["todos", { todoId }],
    queryFn: () => single(todoId),
  });

export const todosQueryOptions = queryOptions({
  queryKey: ["todos"],
  queryFn: () => list(),
});
