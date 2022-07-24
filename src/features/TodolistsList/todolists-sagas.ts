import {call, put, takeEvery} from "redux-saga/effects";
import {setAppStatusAC} from "../../app/app-reducer";
import {ResponseType, todolistsAPI, TodolistType} from "../../api/todolists-api";
import {handleServerNetworkErrorSaga} from "../../utils/error-utils";
import {
    addTodolistAC,
    changeTodolistEntityStatusAC,
    changeTodolistTitleAC,
    removeTodolistAC,
    setTodolistsAC
} from "./todolists-reducer";


export const _fetchTodolists = () => ({type: 'TODO/SET-TODOLISTS'})
export const _removeTodolist = (todolistId: string) => ({type: 'TODO/REMOVE-TODOLISTS', todolistId})
export const _addTodolist = (title: string) => ({type: 'TODO/ADD-TODOLISTS', title})
export const _changeTodolist = (id: string, title: string) => ({type: 'TODO/CHANGE-TODOLISTS', id, title})

export function* fetchTodolistsWorkerSaga() {
    yield put(setAppStatusAC('loading'))
    try {
        const res: TodolistType[] = yield call(todolistsAPI.getTodolists)
        yield put(setTodolistsAC(res))
        yield put(setAppStatusAC('succeeded'))
    } catch (error) {
        yield* handleServerNetworkErrorSaga(error);
    }
}

export function* removeTodolistWorkerSaga(action: ReturnType<typeof _removeTodolist>) {
    yield put(setAppStatusAC('loading'))
    yield put(changeTodolistEntityStatusAC(action.todolistId, 'loading'))
    try {
        yield call(todolistsAPI.deleteTodolist, action.todolistId)
        yield put(removeTodolistAC(action.todolistId))
        yield put(setAppStatusAC('succeeded'))
    } catch (error) {
        yield* handleServerNetworkErrorSaga(error);
    }
}

export function* addTodolistWorkerSaga(action: ReturnType<typeof _addTodolist>) {
    yield put(setAppStatusAC('loading'))
    try {
        const res:ResponseType<{ item: TodolistType }> = yield call(todolistsAPI.createTodolist, action.title)
        yield put(addTodolistAC(res.data.item))
        yield put(setAppStatusAC('succeeded'))
    } catch (error) {
        yield* handleServerNetworkErrorSaga(error);
    }
}

export function* changeTodolistWorkerSaga(action: ReturnType<typeof _changeTodolist>) {
    yield put(setAppStatusAC('loading'))
    try {
        const res: ResponseType = yield call(todolistsAPI.updateTodolist, action.id, action.title)
        yield put(changeTodolistTitleAC(action.id, action.title))
        yield put(setAppStatusAC('succeeded'))
    } catch (error) {
        yield* handleServerNetworkErrorSaga(error);
    }
}


export function* todolistWatcherSaga() {
    yield takeEvery('TODO/SET-TODOLISTS', fetchTodolistsWorkerSaga);
    yield takeEvery('TODO/REMOVE-TODOLISTS', removeTodolistWorkerSaga);
    yield takeEvery('TODO/ADD-TODOLISTS', addTodolistWorkerSaga);
    yield takeEvery('TODO/CHANGE-TODOLISTS', changeTodolistWorkerSaga);
}