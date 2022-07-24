import {
    GetTasksResponse,
    ResponseType,
    TaskPriorities,
    TaskStatuses,
    TaskType,
    todolistsAPI
} from "../../api/todolists-api";
import {call, put, select} from "redux-saga/effects";
import {setAppErrorAC, setAppStatusAC} from "../../app/app-reducer";
import {
    addTaskWorkerSaga,
    fetchTasksWorkerSaga,
    removeTaskWorkerSaga,
    selectorTask,
    updateTaskWorkerSaga
} from "./tasks-sagas";
import {addTaskAC, removeTaskAC, setTasksAC, TasksStateType, updateTaskAC} from "./tasks-reducer";

let getTasksResponseData: GetTasksResponse
beforeEach(() => {
    getTasksResponseData = {
        error: null,
        totalCount: 1,
        items: [{
            id: "1", title: "CSS", status: TaskStatuses.New, todoListId: "todolistId1", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low
        }]
    }
})


test('fetchTasksWorkerSaga success flow', () => {
    let fetchTasksAction = {
        type: 'TASKS/SET-TASKS', todolistId: "todolistId1"
    }

    const gen = fetchTasksWorkerSaga(fetchTasksAction)
    expect(gen.next().value).toEqual(put(setAppStatusAC('loading')))
    expect(gen.next(getTasksResponseData).value).toEqual(call(todolistsAPI.getTasks, fetchTasksAction.todolistId))
    const fakeResponse: GetTasksResponse = getTasksResponseData
    expect(gen.next(fakeResponse).value).toEqual(put(setTasksAC(fakeResponse.items, fetchTasksAction.todolistId)))
    expect(gen.next().value).toEqual(put(setAppStatusAC('succeeded')))
    expect(gen.next().done).toEqual(true)
})

test('removeTaskWorkerSaga success flow', () => {
    let action = {
        type: 'TASKS/REMOVE-TASK', taskId: '1', todolistId: "todolistId1"
    }
    const gen = removeTaskWorkerSaga(action)
    expect(gen.next().value).toEqual(call(todolistsAPI.deleteTask, action.todolistId, action.taskId))
    expect(gen.next().value).toEqual(put(removeTaskAC(action.taskId, action.todolistId)))
})

test(' addTaskWorkerSaga success flow', () => {
    let action = {type: 'TASKS/ADD-TASK', title: '111', todolistId: "todolistId1"}
    const gen = addTaskWorkerSaga(action)
    expect(gen.next().value).toEqual(put(setAppStatusAC('loading')))
    expect(gen.next().value).toEqual(call(todolistsAPI.createTask, action.todolistId, action.title))
    const response :ResponseType<{ item: TaskType}>  = {
        resultCode: 0,
        messages: [],
        data:{
            item: {id: "1", title: "CSS", status: TaskStatuses.New, todoListId: "todolistId1", description: '',
                        startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low
                    }}
    }

    expect(gen.next(response).value).toEqual(put(addTaskAC(response.data.item)))
    expect(gen.next().value).toEqual(put(setAppStatusAC('succeeded')))
})
test(' addTaskWorkerSaga unsuccess flow', () => {
    let action = {type: 'TASKS/ADD-TASK', title: '111', todolistId: "todolistId1"}
    const gen = addTaskWorkerSaga(action)
    expect(gen.next().value).toEqual(put(setAppStatusAC('loading')))
    expect(gen.next().value).toEqual(call(todolistsAPI.createTask, action.todolistId, action.title))


    expect(gen.throw({message: 'error'}).value).toEqual(put(setAppErrorAC(  'error')))
    expect(gen.next().value).toEqual( put(setAppStatusAC('failed')))
})

test('updateTaskWorkerSaga success flow', () => {
    let action = {
        type: 'TASKS/UPDATE-TASK',
        taskId: '1',
        domainModel: {title: 'new Title'},
        todolistId: "todolistId1"
    }

    const gen = updateTaskWorkerSaga(action)
    expect(gen.next().value).toEqual(select(selectorTask))

    const task= {
        addedDate: "",
        deadline: "",
        description: "",
        id: "1",
        order: 0,
        priority: 0,
        startDate: "",
        status: 0,
        title: "title",
        todoListId: "todolistId1"
    }

    const tasks: TasksStateType = {["todolistId1"]: [task]}
    let apiModel = {...task, ...action.domainModel}

    // @ts-ignore
    expect(gen.next(tasks).value).toEqual(call(todolistsAPI.updateTask, action.todolistId, action.taskId, apiModel))
    const result = {resultCode: 0, messages: [], data: apiModel}
    // @ts-ignore
    expect(gen.next(result).value).toEqual(put(updateTaskAC(action.taskId, action.domainModel, action.todolistId)))
})
test('updateTaskWorkerSaga unsuccess flow', () => {
    let action = {
        type: 'TASKS/UPDATE-TASK',
        taskId: '1',
        domainModel: {title: 'new Title'},
        todolistId: "todolistId1"
    }

    const gen = updateTaskWorkerSaga(action)
    expect(gen.next().value).toEqual(select(selectorTask))

    const task= {
        addedDate: "",
        deadline: "",
        description: "",
        id: "1",
        order: 0,
        priority: 0,
        startDate: "",
        status: 0,
        title: "title",
        todoListId: "todolistId1"
    }

    const tasks: TasksStateType = {["todolistId1"]: [task]}
    let apiModel = {...task, ...action.domainModel}
    // @ts-ignore
    expect(gen.next(tasks).value).toEqual(call(todolistsAPI.updateTask, action.todolistId, action.taskId, apiModel))

    expect(gen.throw({message: 'error'}).value).toEqual(put(setAppErrorAC(  'error')))
    expect(gen.next().value).toEqual( put(setAppStatusAC('failed')))
})