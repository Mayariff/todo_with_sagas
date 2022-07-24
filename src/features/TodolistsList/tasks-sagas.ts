import {call, put, select, takeEvery} from "redux-saga/effects";
import {setAppStatusAC} from "../../app/app-reducer";
import {AxiosResponse} from "axios";
import {
    GetTasksResponse,
    ResponseType,
    TaskType,
    todolistsAPI,
    TodolistType,
    UpdateTaskModelType
} from "../../api/todolists-api";
import {
    addTaskAC,
    removeTaskAC,
    setTasksAC,
    TasksStateType,
    UpdateDomainTaskModelType,
    updateTaskAC
} from "./tasks-reducer";
import {handleServerAppErrorSaga, handleServerNetworkErrorSaga} from "../../utils/error-utils";
import {AppRootStateType} from "../../app/store";
import {useSelector} from "react-redux";


export const _fetchTasks = (todolistId: string) => ({type: 'TASKS/SET-TASKS', todolistId})
export const _removeTask = (taskId: string, todolistId: string) => ({type: 'TASKS/REMOVE-TASK', taskId, todolistId})
export const _addTask = (title: string, todolistId: string) => ({type: 'TASKS/ADD-TASK', title, todolistId})
export const _updateTask = (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string) => ({
    type: 'TASKS/UPDATE-TASK',
    taskId,
    domainModel,
    todolistId
})

export function* fetchTasksWorkerSaga(action: ReturnType<typeof _fetchTasks>) {
    yield put(setAppStatusAC('loading'));
    const res: GetTasksResponse = yield call(todolistsAPI.getTasks, action.todolistId)
    const tasks = res.items
    yield put(setTasksAC(tasks, action.todolistId))
    yield put(setAppStatusAC('succeeded'))
}

export function* removeTaskWorkerSaga(action: ReturnType<typeof _removeTask>) {
    yield call(todolistsAPI.deleteTask, action.todolistId, action.taskId)
    yield put(removeTaskAC(action.taskId, action.todolistId))
}

export function* addTaskWorkerSaga(action: ReturnType<typeof _addTask>) {
    yield put(setAppStatusAC('loading'))
    try {
        const res:ResponseType<{ item: TaskType}> = yield call(todolistsAPI.createTask, action.todolistId, action.title)
        if (res.resultCode === 0) {
            const task = res.data.item
            yield put(addTaskAC(task))
            yield put(setAppStatusAC('succeeded'))
        } else {
            yield* handleServerAppErrorSaga(res);
        }
    } catch (error) {
        yield* handleServerNetworkErrorSaga(error)
    }
}

export const selectorTask = (state:AppRootStateType) => state.tasks
export function* updateTaskWorkerSaga(action: ReturnType<typeof _updateTask>) {
    const tasks: TasksStateType = yield select(selectorTask);
    const task: TaskType | undefined = tasks[action.todolistId].find(t => t.id === action.taskId)
    if (!task) {
        //throw new Error("task not found in the state");
        console.warn('task not found in the state')
        return
    }

    const apiModel: UpdateTaskModelType = {
        deadline: task.deadline,
        description: task.description,
        priority: task.priority,
        startDate: task.startDate,
        title: task.title,
        status: task.status,
        todoListId: task.todoListId,
        addedDate: task.addedDate,
        id: task.id,
        order:task.order,
        ...action.domainModel
    }
    try {
        const res: ResponseType<TaskType> = yield call(todolistsAPI.updateTask, action.todolistId, action.taskId, apiModel)
        if (res.resultCode === 0) {
            yield put(updateTaskAC(action.taskId, action.domainModel, action.todolistId))

        } else {
            yield* handleServerAppErrorSaga(res);
        }
    } catch (error) {
        yield* handleServerNetworkErrorSaga(error);
    }

}


export function* tasksWatcherSaga() {
    yield  takeEvery('TASKS/SET-TASKS', fetchTasksWorkerSaga);
    yield  takeEvery('TASKS/REMOVE-TASK', removeTaskWorkerSaga);
    yield  takeEvery('TASKS/ADD-TASK', addTaskWorkerSaga);
    yield  takeEvery('TASKS/UPDATE-TASK', updateTaskWorkerSaga);
}