import axios, {AxiosPromise, AxiosResponse} from 'axios'

const settings = {
    withCredentials: true,
    headers: {
        'API-KEY': 'db794384-dee3-4cf5-8ceb-d18f4dd3b92a'
    }
}
const instance = axios.create({
    baseURL: 'https://social-network.samuraijs.com/api/1.1/',
    ...settings
})

// api
export const todolistsAPI = {
    getTodolists():Promise<TodolistType[]> {
        const promise = instance.get<TodolistType[]>('todo-lists');
        return promise.then(res=>res.data);
    },
    createTodolist(title: string):Promise<ResponseType<{ item: TodolistType }>>  {
        const promise = instance.post<ResponseType<{ item: TodolistType }>>('todo-lists', {title: title});
        return promise.then(res=>res.data);
    },
    deleteTodolist(id: string){
        const promise = instance.delete<ResponseType>(`todo-lists/${id}`);
        return promise.then(res=>res.data);
    },
    updateTodolist(id: string, title: string):Promise<AxiosResponse<ResponseType>> {
        const promise = instance.put<ResponseType>(`todo-lists/${id}`, {title: title});
        return promise;
    },


    getTasks(todolistId: string) {
        return instance.get<GetTasksResponse>(`todo-lists/${todolistId}/tasks`)
            .then(res=>res.data);
    },
    deleteTask(todolistId: string, taskId: string):Promise<AxiosResponse<ResponseType>>  {
        return instance.delete<ResponseType>(`todo-lists/${todolistId}/tasks/${taskId}`);
    },
    createTask(todolistId: string, taskTitile: string)/*:Promise<ResponseType<{ item: TaskType}>> */ {
        return instance.post<ResponseType<{ item: TaskType}>>(`todo-lists/${todolistId}/tasks`, {title: taskTitile})
            .then(res=>res.data);
    },
    updateTask(todolistId: string, taskId: string, model: UpdateTaskModelType):Promise<ResponseType<TaskType>>  {
        return instance.put<ResponseType<TaskType>>(`todo-lists/${todolistId}/tasks/${taskId}`, model).then(res=>res.data);
    }
}


export type LoginParamsType = {
    email: string
    password: string
    rememberMe: boolean
    captcha?: string
}

export const authAPI = {
    login(data: LoginParamsType):Promise<ResponseType<{userId?: number}>> {
        const promise = instance.post<ResponseType<{userId?: number}>>('auth/login', data);
        return promise.then(res=>res.data);
    },
    logout():Promise<ResponseType<{userId?: number}>> {
        const promise = instance.delete<ResponseType<{userId?: number}>>('auth/login');
        return promise.then(res=>res.data);
    },
    me(){
       const promise =  instance.get<ResponseType<{id: number; email: string; login: string}>>('auth/me');
       return promise.then(res=>res.data)
    }
}

// types
export type TodolistType = {
    id: string
    title: string
    addedDate: string
    order: number
}
export type ResponseType<D = {}> = {
    resultCode: number
    messages: Array<string>
    data: D
}
export enum TaskStatuses {
    New = 0,
    InProgress = 1,
    Completed = 2,
    Draft = 3
}
export enum TaskPriorities {
    Low = 0,
    Middle = 1,
    Hi = 2,
    Urgently = 3,
    Later = 4
}
export type TaskType = {
    description: string
    title: string
    status: TaskStatuses
    priority: TaskPriorities
    startDate: string
    deadline: string
    id: string
    todoListId: string
    order: number
    addedDate: string
}
export type UpdateTaskModelType = {
    title: string
    description: string
    status: TaskStatuses
    priority: TaskPriorities
    startDate: string
    deadline: string
    todoListId:string
    addedDate: string
    id: string,
    order: number
}
export type GetTasksResponse = {
    error: string | null
    totalCount: number
    items: TaskType[]
}
