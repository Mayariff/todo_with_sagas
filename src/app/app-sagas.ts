import {call, put, takeEvery} from "redux-saga/effects";
import {authAPI, ResponseType} from "../api/todolists-api";
import {setIsLoggedInAC} from "../features/Login/auth-reducer";
import {setAppInitializedAC} from "./app-reducer";
import {tasksWatcherSaga} from "../features/TodolistsList/tasks-sagas";
import {AxiosResponse} from "axios";

export function* initializeAppWorkerSaga(){

    const res:ResponseType<{id: number; email: string; login: string}> =  yield call(authAPI.me)

    if (res.resultCode === 0) {
        yield put(setIsLoggedInAC(true));
    }

    yield put(setAppInitializedAC(true));
}

export const initializedApp =()=>({type:'APP/INITIALIZED-APP'})

export function*  appWatcherSaga(){
    yield  takeEvery('APP/INITIALIZED-APP', initializeAppWorkerSaga)
}