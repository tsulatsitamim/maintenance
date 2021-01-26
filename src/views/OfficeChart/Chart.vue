<template>
  <MVContent>
    <template v-slot:subheader>
      <MVSubheader title="Grafik Kinerja Kantor">
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
            v-model="selectedDepartmentId"
            :items="departments"
            class="form-group-sm form-group-solid"
            liveSearch
            last
          ></MVSelect2>
        </div>
        <TaskFilter
          :departments="departments"
          :selectedDepartmentId="selectedDepartmentId"
          :date="date"
          @selected-user-id="selectedDepartmentId = $event"
          @search="filter = $event"
          @date-changed="date = $event"
        ></TaskFilter>
      </MVSubheader>
    </template>
    <div class="home">
      <div class="row">
        <div class="mb-8 col-12">
          <b-card no-body class="pb-5 pt-8">
            <v-chart
              :options="taskTypeOptions"
              style="width: 100%;"
              autoresize
            />
          </b-card>
        </div>
        <div class="mb-8 col-12">
          <b-card no-body class="pb-5 pt-8">
            <v-chart
              :options="taskMemberOptions"
              style="width: 100%;"
              autoresize
            />
          </b-card>
        </div>
        <div class="mb-8 col-12">
          <b-card no-body class="pb-5 pt-8">
            <v-chart :options="pieOptions" style="width: 100%;" autoresize />
          </b-card>
        </div>
      </div>
    </div>
  </MVContent>
</template>

<script>
import { MVButtonDaterangePicker, MVSelect2 } from 'metronic-vue'
import { BCard } from 'bootstrap-vue'
import Filter from '../OfficeSummary/Filter'
import { mapGetters } from 'vuex'
import { debounce } from 'debounce'
import axios from 'axios'
import moment from 'moment'
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
  data() {
    return {
      date: {
        start: moment().startOf('month'),
        end: moment().endOf('month'),
      },
      filter: '',
      departments: [],
      selectedDepartmentId: 1,
      tasks: [],
      taskTypeOptions: {
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
          },
        ],
      },
      taskMemberOptions: {
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
          text: 'Grafik Jumlah Petugas',
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
    }
  },
  mounted() {
    this.getDepartments()
  },
  computed: {
    ...mapGetters(['authUser']),
  },
  watch: {
    date() {
      this.getTasks()
    },
    selectedDepartmentId() {
      this.getTasks()
    },
    filter() {
      this.getTasksDelay()
    },
  },
  methods: {
    async getDepartments() {
      this.departments = [
        { id: 1, name: 'BPPTKG' },
        { id: 2, name: 'TU' },
        { id: 3, name: 'MERAPI' },
        { id: 4, name: 'MT' },
        { id: 5, name: 'PL' },
      ]
    },
    async getTasks() {
      const start = moment(this.date.start).format('YYYY-MM-DD')
      const end = moment(this.date.end).format('YYYY-MM-DD')

      const { data } = await axios.get(
        `/api/v2/tasks?start=${start}&end=${end}&_department_id=${this.selectedDepartmentId}&member=true&filter=${this.filter}&groupBy=taskType`
      )

      this.taskTypeOptions.xAxis.data = data.map(x => x.name)
      this.taskTypeOptions.series[0].data = data.map(x => x.completed)
      this.taskTypeOptions.series[1].data = data.map(x => x.ongoing)

      this.taskMemberOptions.xAxis.data = this.taskTypeOptions.xAxis.data
      this.taskMemberOptions.series[0].data = data.map(x => x.completed_user)
      this.taskMemberOptions.series[1].data = data.map(x => x.ongoing_user)

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
    },
    getTasksDelay: debounce(function() {
      this.getTasks()
    }, 600),
  },
}
</script>
