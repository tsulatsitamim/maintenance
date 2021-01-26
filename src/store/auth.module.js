// action types
export const UPDATE_USER = 'updateUser'

// mutation types
export const SET_USER = 'setUser'

const state = {
  user: {},
  isAuthenticated: false,
}

const getters = {
  authUser({ user }) {
    return {
      id: user.id,
      name: user.name,
      position_id: user.department_position_id,
      role_ids: user.roles.map(x => x.name),
    }
  },
  isAuthenticated(state) {
    return state.isAuthenticated
  },
}

const actions = {
  [UPDATE_USER](context, payload) {
    context.commit(SET_USER, payload)
  },
}

const mutations = {
  [SET_USER](state, user) {
    state.isAuthenticated = true
    state.user = { ...user }
  },
}

export default {
  state,
  actions,
  mutations,
  getters,
}
