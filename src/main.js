import Vue from 'vue'
import {
  MetronicVue,
  ADD_BODY_CLASSNAME,
  REMOVE_BODY_CLASSNAME,
} from 'metronic-vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { InlineSvgPlugin } from 'vue-inline-svg'
import PerfectScrollbar from 'vue2-perfect-scrollbar'
import PortalVue from 'portal-vue'
import Toast from './utils/toast'
import './utils/echo'

import PS from 'perfect-scrollbar'
import { UPDATE_USER } from './store/auth.module'
import Axios from 'axios'
window.PerfectScrollbar = PS

Vue.config.productionTip = false

const config = {
  self: {
    layout: 'default',
    logo: 'MONMAS',
    title: 'MONMAS - Monitoring Network Management System',
  },
  aside: {
    self: {
      display: true,
      minimize: {
        default: true,
      },
    },
  },
  loader: {
    type: 'spinner',
    logo: 'public/logo.png', // process.env.BASE_URL,
    message: 'Please wait...',
  },
}

Vue.use(PerfectScrollbar)
Vue.use(InlineSvgPlugin)
Vue.use(PortalVue)
Vue.use(Toast)
Vue.use(MetronicVue, { store, config })

Vue.prototype.$baseUrl = process.env.BASE_URL

// Get auth user
;(async () => {
  store.dispatch(ADD_BODY_CLASSNAME, 'page-loading')

  try {
    const { data } = await Axios.get(
      `${process.env.VUE_APP_CENDANA_API_URL}/user`
    )
    store.dispatch(UPDATE_USER, data)
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      return (window.location.href = '/')
    }
  }

  new Vue({
    router,
    store,
    render: h => h(App),
  }).$mount('#app')

  store.dispatch(REMOVE_BODY_CLASSNAME, 'page-loading')
})()
