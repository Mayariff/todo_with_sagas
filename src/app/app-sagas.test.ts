import {initializeAppWorkerSaga} from "./app-sagas";
import {authAPI, ResponseType} from "../api/todolists-api";
import {call, put} from "redux-saga/effects";
import {setIsLoggedInAC} from "../features/Login/auth-reducer";
import {setAppInitializedAC} from "./app-reducer";

let meResponse: ResponseType<{id: number; email: string; login: string}>
beforeEach(()=>{
    meResponse ={
     resultCode:0,
        messages:[],
        data:{
        id: 12,
        email:' ',
        login: ' '
    }
}})


test('initialize is success',()=>{
  const gen = initializeAppWorkerSaga()
    let res = gen.next()
    expect(res.value).toEqual(call(authAPI.me))

    res = gen.next(meResponse)
    expect(res.value).toEqual(put(setIsLoggedInAC(true)))

    res = gen.next()
    expect(res.value).toEqual(put(setAppInitializedAC(true)))
})

test('initialize is failed',()=>{
    const gen = initializeAppWorkerSaga()
    let res = gen.next()
    expect(res.value).toEqual(call(authAPI.me))

    meResponse.resultCode=1
    res = gen.next(meResponse)
    expect(res.value).toEqual(put(setAppInitializedAC(true)))
})