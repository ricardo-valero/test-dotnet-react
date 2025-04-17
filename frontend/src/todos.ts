import axios from "redaxios";
import { API_BASE_URL } from "./config";
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";

export type Todo = {
  id: string;
  title: string;
  description: string;
  status: string;
  expiredAt: string;
};

export class TodoNotFoundError extends Error {}

export const fetchTodo = async (todoId: string) => {
  console.info(`Fetching todo with id ${todoId}...`);
  await new Promise((r) => setTimeout(r, 500));
  const todo = await axios
    .get<Todo>(`${API_BASE_URL}/todo/${todoId}`)
    .then((r) => r.data)
    .catch((err) => {
      if (err.status === 404) {
        throw new TodoNotFoundError(`Todo with id "${todoId}" not found!`);
      }
      throw err;
    });

  return todo;
};

export const fetchTodos = async () => {
  console.info("Fetching todos...");
  await new Promise((r) => setTimeout(r, 500));
  return axios.get<Array<Todo>>(`${API_BASE_URL}/todo`).then((r) => r.data);
};

export const FormSchema = z.object({
  title: z
    .string({
      required_error: "Title is required",
    })
    .min(1, "Title is required"),

  description: z
    .string({
      required_error: "Description is required",
    })
    .min(1, "Description is required"),

  status: z.string({
    required_error: "Please select a status",
  }),

  // expiredAt: z
  //   .string({
  //     required_error: "Expiration date is required",
  //   })
  //   .refine(
  //     (val) => {
  //       return !isNaN(Date.parse(val));
  //     },
  //     {
  //       message: "Invalid date format",
  //     },
  //   ),
});

export const updateTodo = async (
  todoId: string,
  updatedTodo: Partial<Todo>,
) => {
  console.info(`Updating todo with id ${todoId}...`);
  const response = await axios
    .put<Todo>(`${API_BASE_URL}/todo/${todoId}`, updatedTodo)
    .then((r) => r.data)
    .catch((err) => {
      throw new Error(`Failed to update todo: ${err.message}`);
    });

  return response;
};

export const createTodo = async (todo: Partial<Todo>) => {
  console.info(`Creating todo...`);
  const response = await axios
    .post<Todo>(`${API_BASE_URL}/todo`, todo)
    .then((r) => r.data)
    .catch((err) => {
      throw new Error(`Failed to update todo: ${err.message}`);
    });

  return response;
};

export const todoQueryOptions = (todoId: string) =>
  queryOptions({
    queryKey: ["todos", { todoId }],
    queryFn: () => fetchTodo(todoId),
  });

export const todosQueryOptions = queryOptions({
  queryKey: ["todos"],
  queryFn: () => fetchTodos(),
});
