import Vue from 'vue'
import VueRouter from 'vue-router'
import { isHasAccess } from 'metronic-vue'

import Location from '../views/Location/Location.vue'
import AssetType from '../views/AssetType/AssetType.vue'
import Symbol from '../views/Symbol/Symbol.vue'
import Logbook from '../views/Logbook/Logbook.vue'

import store from '../store/index'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/locations',
  },
  {
    path: '/locations',
    name: 'Daftar Lokasi',
    component: Location,
  },
  {
    path: '/asset-types',
    name: 'Daftar Jenis Aset',
    component: AssetType,
  },
  {
    path: '/symbols',
    name: 'Simbol',
    component: Symbol,
  },
  {
    path: '/logbooks',
    name: 'Logbook',
    component: Logbook,
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

router.beforeEach(async (to, from, next) => {
  if (isHasAccess(store.getters.authUser, to.meta)) {
    return next()
  }

  window.location.href = '/assignment'
})

export default router
