import {
    ErrorComponent,
    createFileRoute,
    useRouter,
} from '@tanstack/react-router'
import {
    useQueryErrorResetBoundary,
    useSuspenseQuery,
} from '@tanstack/react-query'
import { TodoNotFoundError, todoQueryOptions } from '../todos'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/todo/$todoId')({
    loader: ({ context: { queryClient }, params: { todoId } }) => {
        return queryClient.ensureQueryData(todoQueryOptions(todoId))
    },
    errorComponent: TodoErrorComponent,
    component: TodoComponent,
})

export function TodoErrorComponent({ error }: ErrorComponentProps) {
    const router = useRouter()
    if (error instanceof TodoNotFoundError) {
        return <div>{error.message}</div>
    }
    const queryErrorResetBoundary = useQueryErrorResetBoundary()

    useEffect(() => { queryErrorResetBoundary.reset() }, [queryErrorResetBoundary])

    return (
        <div>
            <button onClick={() => { router.invalidate() }}>
                retry
            </button>
            <ErrorComponent error={error} />
        </div>
    )
}

function TodoComponent() {
    const todoId = Route.useParams().todoId;
    const { data: todo } = useSuspenseQuery(todoQueryOptions(todoId));

    // Local state for editing
    const [title, setTitle] = useState(todo.title);
    const [description, setDescription] = useState(todo.description);
    const [status, setStatus] = useState(todo.status);

    const handleSave = () => {
        // Logic to save the edited todo (e.g., API call)
        console.log({ title, description, status });
    };

    return (
        <div className="space-y-2">
            <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
            />
            <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
            />
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="complete">Complete</option>
                <option value="pending">Pending</option>
                <option value="in progress">In Progress</option>
            </select>
            <Button onClick={handleSave}>Save</Button>
        </div>
    );
}