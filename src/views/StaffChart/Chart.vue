<template>
  <MVContent>
    <template v-slot:subheader>
      <MVSubheader title="Grafik Kinerja Pegawai">
        <MVButtonDaterangePicker
          v-model="date"
          class="d-none d-lg-block"
        ></MVButtonDaterangePicker>
        <div
          class="input-group input-group-sm input-group-solid max-w-175px my-1 mr-2 d-none d-lg-flex"
        >
          <input
            v-model="filter"
            type="text"
            class="form-control pl-4"
            placeholder="Search..."
            @input="getTasksDelay"
          />
          <div class="input-group-append">
            <span class="input-group-text">
              <span class="svg-icon svg-icon-md">
                <inline-svg
                  :src="`${$baseUrl}media/svg/icons/General/Search.svg`"
                >
                </inline-svg>
              </span>
            </span>
          </div>
        </div>
        <div class="min-w-175px mr-2 d-none d-lg-block">
          <MVSelect2
            v-model="selectedUserId"
            :items="staffs"
            class="form-group-sm form-group-solid"
            liveSearch
            last
          ></MVSelect2>
        </div>
        <TaskFilter
          :staffs="staffs"
          :selectedUserId="selectedUserId"
          :date="date"
          @selected-user-id="selectedUserId = $event"
          @search="filter = $event"
          @date-changed="date = $event"
        ></TaskFilter>
      </MVSubheader>
    </template>
    <div class="home">
      <div class="row">
        <div
          class="mb-8"
          :class="
            alwaysFullWidth || barOptions.xAxis.data.length > 10
              ? 'col-12'
              : 'col-lg-6'
          "
        >
          <b-card no-body class="pb-5 pt-8">
            <v-chart :options="barOptions" style="width: 100%;" autoresize />
          </b-card>
        </div>
        <div
          class="mb-8"
          :class="
            alwaysFullWidth || barOptions.xAxis.data.length > 10
              ? 'col-12'
              : 'col-lg-6'
          "
        >
          <b-card no-body class="pb-5 pt-8">
            <v-chart
              ref="taskChart"
              :options="pieOptions"
              style="width: 100%;"
              autoresize
            />
          </b-card>
        </div>
        <div class="mb-8 col-12">
          <b-card no-body class="pb-5 pt-8">
            <v-chart
              ref="goalChart"
              :options="goalOptions"
              style="width: 100%;"
              autoresize
            />
          </b-card>
        </div>
      </div>
    </div>
  </MVContent>
</template>

<script>
import { MVButtonDaterangePicker, MVSelect2 } from 'metronic-vue'
import { BCard } from 'bootstrap-vue'
import Filter from '../StaffSummary/Filter'
import { mapGetters } from 'vuex'
import { debounce } from 'debounce'
import axios from 'axios'
import moment from 'moment'
import sortWith from 'ramda/src/sortWith'
import ascend from 'ramda/src/ascend'
import prop from 'ramda/src/prop'
import randomColor from 'randomcolor'
import VChart from 'vue-echarts'

import 'echarts/lib/chart/bar'
import 'echarts/lib/chart/pie'
import 'echarts/lib/component/title'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/toolbox'

export default {
  name: 'StaffChart',
  components: {
    MVSelect2,
    BCard,
    TaskFilter: Filter,
    MVButtonDaterangePicker,
    VChart,
  },
  props: {
    alwaysFullWidth: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      date: {
        start: moment().startOf('month'),
        end: moment().endOf('month'),
      },
      filter: '',
      staffs: [],
      selectedUserId: this.$store.getters.authUser.id,
      tasks: [],
      barOptions: {
        toolbox: {
          show: true,
          right: 35,
          feature: {
            saveAsImage: {},
          },
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        title: {
          text: 'Grafik Kegiatan',
          x: 'center',
        },
        xAxis: {
          data: [],
          axisLabel: {
            interval: 0,
            rotate: 25,
            fontSize: 10,
          },
        },
        grid: {
          bottom: 0,
          right: 50,
          left: 50,
          containLabel: true,
        },
        yAxis: {
          name: 'Jumlah',
          nameLocation: 'middle',
          nameGap: 30,
        },
        series: [
          {
            type: 'bar',
            name: 'Selesai',
            data: [],
            stack: 'taskType',
            itemStyle: {
              color: 'rgba(175, 243, 0, 0.6)',
              borderColor: 'rgba(175, 243, 0, 1)',
            },
            emphasis: {
              itemStyle: {
                color: 'rgba(175, 243, 0, 0.6)',
                borderColor: 'rgba(175, 243, 0, 1)',
              },
            },
          },
          {
            type: 'bar',
            name: 'Berlangsung',
            data: [],
            stack: 'taskType',
            itemStyle: {
              color: 'rgb(255, 206, 86, 0.6)',
              borderColor: 'rgb(255, 206, 86, 1)',
            },
            emphasis: {
              itemStyle: {
                color: 'rgb(255, 206, 86, 0.6)',
                borderColor: 'rgb(255, 206, 86, 1)',
              },
            },
          },
        ],
      },
      pieOptions: {
        toolbox: {
          show: true,
          right: 35,
          feature: {
            saveAsImage: {},
          },
        },
        tooltip: {
          trigger: 'item',
        },
        title: {
          text: 'Prosentase Jenis Tugas Selesai',
          x: 'center',
          padding: 0,
        },
        series: [
          {
            type: 'pie',
            name: 'Jenis Tugas',
            data: [],
            label: {
              formatter: '{b}: {c} ({d}%)',
            },
            labelLayout: { hideOverlap: false, moverOverlap: 'shiftY' },
            minShowLabelAngle: 0,
          },
        ],
      },
      goalOptions: {
        toolbox: {
          show: true,
          right: 35,
          feature: {
            saveAsImage: {},
          },
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        title: {
          text: 'Grafik Capaian Kinerja',
          x: 'center',
        },
        xAxis: {
          data: [],
          axisLabel: {
            interval: 0,
            rotate: 25,
            fontSize: 10,
          },
        },
        grid: {
          bottom: 0,
          right: 50,
          left: 50,
          containLabel: true,
        },
        yAxis: {
          name: 'Jumlah',
          nameLocation: 'middle',
          nameGap: 30,
        },
        series: [
          {
            type: 'bar',
            name: 'Rencana',
            data: [],
            itemStyle: {
              color: 'rgba(175, 243, 0, 0.6)',
              borderColor: 'rgba(175, 243, 0, 1)',
            },
            emphasis: {
              itemStyle: {
                color: 'rgba(175, 243, 0, 0.6)',
                borderColor: 'rgba(175, 243, 0, 1)',
              },
            },
          },
          {
            type: 'bar',
            name: 'Realisasi',
            data: [],
            itemStyle: {
              color: 'rgb(255, 206, 86, 0.6)',
              borderColor: 'rgb(255, 206, 86, 1)',
            },
            emphasis: {
              itemStyle: {
                color: 'rgb(255, 206, 86, 0.6)',
                borderColor: 'rgb(255, 206, 86, 1)',
              },
            },
          },
        ],
      },
    }
  },
  mounted() {
    this.getStaffs()
  },
  computed: {
    ...mapGetters(['authUser']),
  },
  watch: {
    date() {
      this.getTasks()
      this.getTaskGoalsSummary()
    },
    selectedUserId() {
      this.getTasks()
      this.getTaskGoalsSummary()
    },
    filter() {
      this.getTasksDelay()
    },
  },
  methods: {
    async getStaffs() {
      const sortByName = sortWith([ascend(prop('name'))])
      const { data } = await axios.get(
        `/api/v2/users/${this.authUser.id}/staff`
      )
      this.staffs = sortByName([{ ...this.authUser }, ...data])
    },
    async getTasks() {
      const start = moment(this.date.start).format('YYYY-MM-DD')
      const end = moment(this.date.end).format('YYYY-MM-DD')

      const { data } = await axios.get(
        `/api/v2/tasks?start=${start}&end=${end}&user_id=${this.selectedUserId}&member=true&filter=${this.filter}&groupBy=taskType`
      )

      this.barOptions.xAxis.data = data.map(x => x.name)
      this.barOptions.series[0].data = data.map(x => x.completed)
      this.barOptions.series[1].data = data.map(x => x.ongoing)

      this.pieOptions.series[0].data = data
        .filter(x => x.completed)
        .map(x => {
          const color = randomColor({ format: 'rgba', alpha: 1 })

          return {
            name: x.name,
            value: x.completed,
            itemStyle: {
              color: color.replace('1)', '0.5)'),
              borderColor: color,
            },
            label: { overflow: 'break' },
          }
        })
      this.pieOptions.title.text = `Prosentase Jenis Tugas Selesai (${data.reduce(
        (prev, next) => prev + next.completed,
        0
      )} Tugas)`

      this.$emit('taskUpdated')
    },
    async getTaskGoalsSummary() {
      const start = moment(this.date.start).format('YYYY-MM-01')
      const end = moment(this.date.end)
        .endOf('month')
        .format('YYYY-MM-DD')

      const { data } = await axios.get(
        `/api/v2/task-summary/goals?user_id=${this.selectedUserId}&start=${start}&end=${end}`
      )

      this.goalOptions.xAxis.data = data.map(x => x.name)
      this.goalOptions.series[0].data = data.map(x => x.quantity)
      this.goalOptions.series[1].data = data.map(x => x.volume)
      this.$emit('goalUpdated')
    },
    getTasksDelay: debounce(function() {
      this.getTasks()
      this.getTaskGoalsSummary()
    }, 600),
  },
}
</script>
