import moment from 'moment'
import Axios from 'axios'
import {
  pluck,
  flatten,
  pipe,
  pick,
  map,
  uniqBy,
  prop,
  sortBy,
  contains,
} from 'ramda'
import { mapTaskFromApi } from '../views/Task/utils'

// action types
export const GET_TASKS = 'getTasks'
export const GET_CALENDAR_TASKS = 'getCalendarTasks'
export const UPDATE_SELECTED_DATE_AND_TASKS = 'updateSelectedDateAndTasks'

// mutation types
export const UPDATE_SELECTED_DATE = 'updateSelectedDate'
export const UPDATE_CALENDAR_TASKS = 'updateCalendarTasks'
export const UPDATE_TASKS = 'updateTasks'
export const UPDATE_LOAD_TASKS = 'updateLoadTasks'
export const UPDATE_SELECTED_USER_ID = 'updateSelectedUserId'
export const UPDATE_SEARCH_QUERY = 'updateSearchQuery'
export const REMOVE_TASKS_BY_ID = 'removeTasksById'
export const UPDATE_TASKS_BY_ID = 'updateTasksById'
export const ADD_TASK = 'addTask'

const filterTaskWithSearchQuery = (tasks, query) => {
  if (!query) {
    return tasks
  }

  return tasks.filter(
    task =>
      task.name.toLowerCase().includes(query.toLowerCase()) ||
      (task.description &&
        task.description.toLowerCase().includes(query.toLowerCase())) ||
      task.location.toLowerCase().includes(query.toLowerCase())
  )
}

const state = {
  selectedUserId: 0,
  searchQuery: '',
  selectedDate: new Date(),
  tasks: [],
  calendarTasks: [],
  loadTask: false,
}

const getters = {
  tasksUsers(state) {
    const mapUsers = pipe(
      pluck('members'),
      flatten,
      map(pick(['id', 'name'])),
      uniqBy(prop('id')),
      sortBy(prop('name'))
    )

    return [{ id: 0, name: 'Semua' }, ...mapUsers(state.tasks)]
  },
  tasks(state) {
    if (!parseInt(state.selectedUserId, 10)) {
      return filterTaskWithSearchQuery(state.tasks, state.searchQuery)
    }

    const tasks = state.tasks.filter(task =>
      contains(parseInt(state.selectedUserId, 10), pluck('id', task.members))
    )
    return filterTaskWithSearchQuery(tasks, state.searchQuery)
  },
}

const actions = {
  async [UPDATE_SELECTED_DATE_AND_TASKS]({ commit, dispatch }, date) {
    commit(UPDATE_SELECTED_DATE, date)
    dispatch(GET_TASKS)
  },
  async [GET_TASKS]({ commit, rootState, state }) {
    const date = moment(state.selectedDate).format('YYYY-MM-DD')

    commit(UPDATE_LOAD_TASKS, true)
    try {
      const { data } = await Axios.get(
        `/api/v2/tasks?start=${date}&end=${date}&members=true&user_id=${rootState.auth.user.id}&managed=true&created=true&member=true&search=${state.searchQuery}&user_task_goal=true&assignor=true&attachments=true`
      )

      commit(UPDATE_TASKS, data.map(mapTaskFromApi))
    } catch (error) {
      console.log(error)
    }
    commit(UPDATE_LOAD_TASKS, false)
  },
  async [GET_CALENDAR_TASKS]({ commit, rootState }, page) {
    const selectedMonth = moment(
      `${page.year}-${page.month < 10 ? '0' : ''}${page.month}-01`
    )

    try {
      const { data } = await Axios.get(
        `${
          process.env.VUE_APP_CENDANA_API_URL
        }/api/v2/tasks?start=${selectedMonth
          .startOf('month')
          .format('YYYY-MM-DD')}&end=${selectedMonth
          .endOf('month')
          .format('YYYY-MM-DD')}&groupByDate=true&user_id=${
          rootState.auth.user.id
        }&managed=true&created=true&member=true`
      )
      commit(UPDATE_CALENDAR_TASKS, [
        {
          dot: 'red',
          dates: data
            .filter(x => x.status === 'cancelled')
            .map(x => ({
              start: new Date(x.start),
              end: new Date(x.end),
            })),
        },
        {
          dot: 'orange',
          dates: data
            .filter(x => x.status === 'ongoing')
            .map(x => ({
              start: new Date(x.start),
              end: new Date(x.end),
            })),
        },
        {
          dot: 'green',
          dates: data
            .filter(x => x.status === 'completed')
            .map(x => ({
              start: new Date(x.start),
              end: new Date(x.end),
            })),
        },
      ])
    } catch (error) {
      console.log(error)
    }
  },
}

const mutations = {
  [UPDATE_SELECTED_USER_ID](state, selectedUserId) {
    state.selectedUserId = selectedUserId
  },
  [UPDATE_SEARCH_QUERY](state, query) {
    state.searchQuery = query
  },
  [UPDATE_SELECTED_DATE](state, selectedDate) {
    state.selectedDate = selectedDate
  },
  [UPDATE_TASKS](state, tasks) {
    state.tasks = tasks
  },
  [REMOVE_TASKS_BY_ID](state, id) {
    const index = state.tasks.findIndex(x => x.id === id)
    state.tasks.splice(index, 1)
  },
  [UPDATE_TASKS_BY_ID](state, task) {
    const index = state.tasks.findIndex(x => x.id === task.id)
    state.tasks.splice(index, 1, task)
  },
  [ADD_TASK](state, task) {
    console.log(task)
    state.tasks.push(task)
  },
  [UPDATE_LOAD_TASKS](state, status) {
    state.loadTask = status
  },
  [UPDATE_CALENDAR_TASKS](state, tasks) {
    state.calendarTasks = tasks
  },
}

export default {
  state,
  actions,
  mutations,
  getters,
}
