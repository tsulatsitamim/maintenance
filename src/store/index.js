import Vue from 'vue'
import Vuex from 'vuex'
import auth from './auth.module'
import task from './task.module'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: { auth, task },
})
