import Vue from 'vue'
import VueRouter from 'vue-router'
import { isHasAccess } from 'metronic-vue'
import Task from '../views/Task/Task.vue'

import Location from '../views/Location/Location.vue'
import AssetType from '../views/AssetType/AssetType.vue'

import Chart from '../views/StaffChart/Chart.vue'
import OfficeSummary from '../views/OfficeSummary/Summary.vue'
import OfficeChart from '../views/OfficeChart/Chart.vue'
import Contract from '../views/Contract/Contract.vue'
import Review from '../views/Review/Review.vue'
import ReviewContract from '../views/Review/Contract.vue'

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
    path: '/task',
    name: 'Task',
    component: Task,
  },
  {
    path: '/staff-summary-chart',
    name: 'StaffSummaryChart',
    component: Chart,
  },
  {
    path: '/office-summary',
    name: 'OfficeSummary',
    component: OfficeSummary,
    meta: {
      position_ids: [1, 2, 3, 4, 5],
    },
  },
  {
    path: '/office-summary-chart',
    name: 'OfficeSummaryChart',
    component: OfficeChart,
    meta: {
      position_ids: [1, 2, 3, 4, 5],
    },
  },
  {
    path: '/contract',
    name: 'Contract',
    component: Contract,
  },
  {
    path: '/review',
    name: 'Review',
    component: Review,
    meta: {
      position_ids: [1, 2, 3, 4, 5],
    },
  },
  {
    path: '/review/:id',
    name: 'ReviewContract',
    component: ReviewContract,
    meta: {
      position_ids: [1, 2, 3, 4, 5],
    },
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
