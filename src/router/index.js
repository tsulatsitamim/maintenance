import Vue from 'vue'
import VueRouter from 'vue-router'
import { isHasAccess } from 'metronic-vue'

import Location from '../views/Location/Location.vue'
import LocationAsset from '../views/Location/Asset/Asset.vue'
import LocationLogbook from '../views/Location/Logbook.vue'
import AssetType from '../views/AssetType/AssetType.vue'
import Symbol from '../views/Symbol/Symbol.vue'
import Logbook from '../views/Logbook/Logbook.vue'
import LogbookCrud from '../views/Logbook/LogbookCrud.vue'

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
    path: '/locations/:id/logbooks',
    name: 'Daftar Logbook Lokasi',
    component: LocationLogbook,
  },
  {
    path: '/locations/:id/assets',
    name: 'Daftar Aset Lokasi',
    component: LocationAsset,
  },
  {
    path: '/locations/:locationId/logbooks/:id',
    name: 'Logbook Lokasi Item',
    component: LogbookCrud,
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
  {
    path: '/logbooks/:id',
    name: 'Logbook Item',
    component: LogbookCrud,
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
