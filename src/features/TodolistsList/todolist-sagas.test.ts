import {fetchTasksWorkerSaga} from "./tasks-sagas";
import {call, put} from "redux-saga/effects";
import {setAppErrorAC, setAppStatusAC} from "../../app/app-reducer";
import {
    GetTasksResponse,
    ResponseType,
    TaskPriorities,
    TaskStatuses,
    todolistsAPI,
    TodolistType
} from "../../api/todolists-api";
import {setTasksAC} from "./tasks-reducer";
import {
    addTodolistWorkerSaga,
    changeTodolistWorkerSaga,
    fetchTodolistsWorkerSaga,
    removeTodolistWorkerSaga
} from "./todolists-sagas";
import {
    addTodolistAC,
    changeTodolistEntityStatusAC,
    changeTodolistTitleAC,
    removeTodolistAC,
    setTodolistsAC
} from "./todolists-reducer";


test('fetchTodolistsWorkerSaga success flow', () => {
    let action = ({type: 'TODO/SET-TODOLISTS'})
    const gen = fetchTodolistsWorkerSaga()
    expect(gen.next().value).toEqual(put(setAppStatusAC('loading')))

    expect(gen.next().value).toEqual(call(todolistsAPI.getTodolists))
    const fakeResponse:TodolistType[]= [
        {id: "todolistId1", title: 'What to learn',   addedDate: '', order: 0},
            {id: "todolistId2", title: 'What to buy',  addedDate: '', order: 0}
        ]
    expect(gen.next(fakeResponse).value).toEqual(put(setTodolistsAC(fakeResponse)))
    expect(gen.next().value).toEqual(put(setAppStatusAC('succeeded')))
})
test('fetchTodolistsWorkerSaga unsuccess flow', () => {
    const gen = fetchTodolistsWorkerSaga()
    expect(gen.next().value).toEqual(put(setAppStatusAC('loading')))

    expect(gen.next().value).toEqual(call(todolistsAPI.getTodolists))

    expect(gen.throw({message: 'error'}).value).toEqual(put(setAppErrorAC(  'error')))
    expect(gen.next().value).toEqual( put(setAppStatusAC('failed')))
})

test('removeTodolistWorkerSaga success flow', () => {
    let action = {
        type: 'TODO/REMOVE-TODOLISTS', todolistId: "todolistId1"
    }

    const gen = removeTodolistWorkerSaga(action)
    expect(gen.next().value).toEqual(put(setAppStatusAC('loading')))
    expect(gen.next().value).toEqual(put(changeTodolistEntityStatusAC(action.todolistId, 'loading')))

    expect(gen.next().value).toEqual(call(todolistsAPI.deleteTodolist, action.todolistId))
    expect(gen.next().value).toEqual(put(removeTodolistAC(action.todolistId)))
    expect(gen.next().value).toEqual(put(setAppStatusAC('succeeded')))
})
test('removeTodolistWorkerSaga unsuccess flow', () => {
    let action = {
        type: 'TODO/REMOVE-TODOLISTS', todolistId: "todolistId1"
    }

    const gen = removeTodolistWorkerSaga(action)
    expect(gen.next().value).toEqual(put(setAppStatusAC('loading')))
    expect(gen.next().value).toEqual(put(changeTodolistEntityStatusAC(action.todolistId, 'loading')))

    expect(gen.next().value).toEqual(call(todolistsAPI.deleteTodolist, action.todolistId))
    expect(gen.throw({message: 'error'}).value).toEqual(put(setAppErrorAC(  'error')))
    expect(gen.next().value).toEqual( put(setAppStatusAC('failed')))
})

test('addTodolistWorkerSaga success flow', () => {
    let action = {type: 'TODO/ADD-TODOLISTS', title:'new title'}
    const gen = addTodolistWorkerSaga(action)
    expect(gen.next().value).toEqual(put(setAppStatusAC('loading')))

    expect(gen.next().value).toEqual(call(todolistsAPI.createTodolist, action.title))
    const fakeResponse: ResponseType<{ item: TodolistType }> = {
        resultCode: 0,
        messages: [],
        data: {item:{id: '1', title: 'title', addedDate: ' ', order: 0}
        }
    }
    expect(gen.next(fakeResponse).value).toEqual(put(addTodolistAC(fakeResponse.data.item)))
    expect(gen.next().value).toEqual(put(setAppStatusAC('succeeded')))
})
test('addTodolistWorkerSaga unsuccess flow', () => {
    let action = {type: 'TODO/ADD-TODOLISTS', title:'new title'}
    const gen = addTodolistWorkerSaga(action)
    expect(gen.next().value).toEqual(put(setAppStatusAC('loading')))

    expect(gen.next().value).toEqual(call(todolistsAPI.createTodolist, action.title))
    expect(gen.throw({message: 'error'}).value).toEqual(put(setAppErrorAC(  'error')))
    expect(gen.next().value).toEqual( put(setAppStatusAC('failed')))
})

test('changeTodolistWorkerSaga success flow', () => {
    let action = {type: 'TODO/CHANGE-TODOLISTS',id:'1', title:'new title'}
    const gen = changeTodolistWorkerSaga(action)
    expect(gen.next().value).toEqual(put(setAppStatusAC('loading')))

    expect(gen.next().value).toEqual(call(todolistsAPI.updateTodolist, action.id, action.title))
    expect(gen.next().value).toEqual(put(changeTodolistTitleAC(action.id, action.title)))
    expect(gen.next().value).toEqual(put(setAppStatusAC('succeeded')))
})
test('changeTodolistWorkerSaga unsuccess flow', () => {
    let action = {type: 'TODO/CHANGE-TODOLISTS',id:'1', title:'new title'}
    const gen = changeTodolistWorkerSaga(action)
    expect(gen.next().value).toEqual(put(setAppStatusAC('loading')))

    expect(gen.next().value).toEqual(call(todolistsAPI.updateTodolist, action.id, action.title))
    expect(gen.throw({message: 'error'}).value).toEqual(put(setAppErrorAC(  'error')))
    expect(gen.next().value).toEqual( put(setAppStatusAC('failed')))
})