import {call, put} from "redux-saga/effects";
import {setAppErrorAC, setAppStatusAC} from "../../app/app-reducer";
import {authAPI, ResponseType} from "../../api/todolists-api";
import {loginWorkerSaga, logoutWorkerSaga} from "./auth-sagas";
import {setIsLoggedInAC} from "./auth-reducer";

test('loginWorkerSaga success flow', () => {
    let action = {
        type: 'login/LOGGED-IN',
        data: {email: 'xxx@yandex.ru', password: '111', rememberMe: true}
    }
    const gen = loginWorkerSaga(action)
    expect(gen.next().value).toEqual(put(setAppStatusAC('loading')))
    expect(gen.next().value).toEqual(call(authAPI.login, action.data))
    const response: ResponseType<{ userId?: number }> = {
        resultCode: 0,
        messages: [],
        data: {userId: 1 as number | undefined}
    }
    expect(gen.next(response).value).toEqual(put(setIsLoggedInAC(true)))
    expect(gen.next().value).toEqual(put(setAppStatusAC('succeeded')))
})

test('loginWorkerSaga unsuccess flow', () => {
    let action = {
        type: 'login/LOGGED-IN',
        data: {email: 'xxx@yandex.ru', password: '111', rememberMe: true}
    }
    const gen = loginWorkerSaga(action)
    expect(gen.next().value).toEqual(put(setAppStatusAC('loading')))
    expect(gen.next().value).toEqual(call(authAPI.login, action.data))

    expect(gen.throw({message: 'error'}).value).toEqual(put(setAppErrorAC('error')))
    expect(gen.next().value).toEqual(put(setAppStatusAC('failed')))
})

test('logoutWorkerSaga success flow', () => {
    let action = {type: 'login/LOGGED-IN'}
    const gen = logoutWorkerSaga()
    expect(gen.next().value).toEqual(put(setAppStatusAC('loading')))
    expect(gen.next().value).toEqual(call(authAPI.logout))
    const response: ResponseType<{ userId?: number }> = {
        resultCode: 0,
        messages: [],
        data: {}
    }
    expect(gen.next(response).value).toEqual(put(setIsLoggedInAC(false)))
    expect(gen.next().value).toEqual(put(setAppStatusAC('succeeded')))
})

test('logoutWorkerSaga unsuccess flow', () => {
    let action = {type: 'login/LOGGED-IN'}
    const gen = logoutWorkerSaga()
    expect(gen.next().value).toEqual(put(setAppStatusAC('loading')))
    expect(gen.next().value).toEqual(call(authAPI.logout))
    expect(gen.throw({message: 'error'}).value).toEqual(put(setAppErrorAC('error')))
    expect(gen.next().value).toEqual(put(setAppStatusAC('failed')))
})