import axios from 'redaxios'
import { API_BASE_URL } from './config'
import { queryOptions } from '@tanstack/react-query'

export type Todo = {
  id: string,
  title: string,
  description: string,
  status: string,
  expiredAt: string,
}

export class TodoNotFoundError extends Error { }

export const fetchTodo = async (todoId: string) => {
  console.info(`Fetching todo with id ${todoId}...`)
  await new Promise((r) => setTimeout(r, 500))
  const todo = await axios
    .get<Todo>(`${API_BASE_URL}/todo/${todoId}`)
    .then((r) => r.data)
    .catch((err) => {
      if (err.status === 404) {
        throw new TodoNotFoundError(`Todo with id "${todoId}" not found!`)
      }
      throw err
    })

  return todo
}

export const fetchTodos = async () => {
  console.info('Fetching todos...')
  await new Promise((r) => setTimeout(r, 500))
  return axios
    .get<Array<Todo>>(`${API_BASE_URL}/todo`).then((r) => r.data)
}

export const todoQueryOptions = (todoId: string) =>
  queryOptions({
    queryKey: ['todos', { todoId }],
    queryFn: () => fetchTodo(todoId),
  })

export const todosQueryOptions = queryOptions({
  queryKey: ['todos'],
  queryFn: () => fetchTodos(),
})