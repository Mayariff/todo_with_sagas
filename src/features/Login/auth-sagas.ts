import {authAPI, LoginParamsType, ResponseType} from "../../api/todolists-api";
import {setAppStatusAC} from "../../app/app-reducer";
import {handleServerAppErrorSaga, handleServerNetworkErrorSaga} from "../../utils/error-utils";
import {setIsLoggedInAC} from "./auth-reducer";
import {call, put, takeEvery} from "redux-saga/effects";
import {AxiosResponse} from "axios";

export const _login = (data: LoginParamsType) => ({type: 'login/LOGGED-IN', data})
export const _logout = () => ({type: 'login/LOGGED-OUT'})

export function* loginWorkerSaga(action: ReturnType<typeof _login>) {
    yield put(setAppStatusAC('loading'))
    try {
        const res: ResponseType<{ userId?: number }> = yield call(authAPI.login, action.data)
        if (res.resultCode === 0) {
            yield put(setIsLoggedInAC(true))
            yield put(setAppStatusAC('succeeded'))
        } else {
            yield* handleServerAppErrorSaga(res)
        }
    } catch (error) {
        yield*  handleServerNetworkErrorSaga(error)
    }
}

export function* logoutWorkerSaga() {
    yield put(setAppStatusAC('loading'))
    try {
        const res: ResponseType<{ userId?: number }> = yield call(authAPI.logout)
        if (res.resultCode === 0) {
            yield put(setIsLoggedInAC(false))
            yield put(setAppStatusAC('succeeded'))
        } else {
            yield* handleServerAppErrorSaga(res)
        }
    } catch (error) {
        yield* handleServerNetworkErrorSaga(error)
    }
}


export function* authWatcherSaga() {
    yield takeEvery('login/LOGGED-IN', loginWorkerSaga)
    yield takeEvery('login/LOGGED-OUT', logoutWorkerSaga)
}