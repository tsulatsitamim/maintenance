<template>
  <MVContent>
    <template v-slot:subheader>
      <MVSubheader title="Rekap Tugas Pegawai">
        <div class="position-relative">
          <datepicker
            ref="datepicker"
            format="MMMM yyyy"
            name="selectedDate"
            :language="id"
            minimum-view="month"
            input-class="form-control"
            @selected="downloadReport"
          >
          </datepicker>
          <button
            class="btn btn-light-primary font-weight-bolder btn-sm mr-2 px-4"
            title="Download Rekap Tugas Bulanan"
            @click="openDatePicker"
          >
            <span class="svg-icon mr-0">
              <inline-svg
                title="Download Rekap Tugas Bulanan"
                :src="`${$baseUrl}media/svg/icons/Files/Download.svg`"
              ></inline-svg>
            </span>
          </button>
        </div>

        <a
          :href="xlsxUrl"
          class="btn btn-light-primary font-weight-bolder btn-sm mr-2 px-4"
          title="Export Excel"
        >
          <span class="svg-icon mr-0">
            <inline-svg
              title="Export Excel"
              :src="`${$baseUrl}icon/xlsx.svg`"
            ></inline-svg>
          </span>
        </a>
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
            @input="refreshTableDelay"
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
        <div class="col-12">
          <b-card>
            <div>
              <b-table
                ref="table"
                :fields="fields"
                :items="tableProvider"
                :current-page="pagination.page"
                :per-page="pagination.perPage"
                responsive
                striped
              >
                <template #cell(status)="data">
                  <span
                    v-if="data.item.status === 'completed'"
                    class="label font-weight-bold label-lg  label-light-success label-inline"
                    >Selesai</span
                  >
                  <span
                    v-else-if="data.item.status === 'ongoing'"
                    class="label font-weight-bold label-lg  label-light-warning label-inline"
                    >Berlangsung</span
                  >
                  <span
                    v-else
                    class="label font-weight-bold label-lg  label-light-danger label-inline"
                    >Batal</span
                  >
                </template>
                <template #cell(user_id)="data">
                  <a
                    href="#"
                    class="text-hover-primary font-weight-bold mr-lg-8 mr-5 my-1"
                    v-b-tooltip.html.bottom="
                      data.item.members.map(x => x.name).join('<br/>')
                    "
                    @click.prevent
                  >
                    {{ data.item.members | formatMembers }}
                  </a>
                </template>
                <template #cell(user_task_goal)="data">
                  {{
                    data.item.user_task_goal && data.item.user_task_goal.goal
                      ? data.item.user_task_goal.goal.name
                      : '-'
                  }}
                </template>
                <template #cell(volume)="data">
                  {{
                    data.item.user_task_goal && data.item.user_task_goal.goal
                      ? `${data.item.user_task_goal.volume} ${data.item.user_task_goal.goal.output}`
                      : '-'
                  }}
                </template>
                <template #cell(actions)="data">
                  <div class="d-flex flex-no-wrap">
                    <button
                      class="btn btn-icon btn-text-dark btn-hover-light-dark btn-sm mr-2"
                      @click="openTask(data.item)"
                      title="Lampiran"
                    >
                      <span class="svg-icon svg-icon-md">
                        <inline-svg
                          title="Lampiran"
                          :src="
                            `${$baseUrl}media/svg/icons/General/Attachment1.svg`
                          "
                        >
                        </inline-svg>
                      </span>
                    </button>
                    <button
                      class="btn btn-icon btn-text-dark btn-hover-light-dark btn-sm mr-2"
                      @click="editTask(data.item)"
                      title="Edit"
                    >
                      <span class="svg-icon svg-icon-md">
                        <inline-svg
                          title="Edit"
                          :src="`${$baseUrl}media/svg/icons/Design/Edit.svg`"
                        >
                        </inline-svg>
                      </span>
                    </button>
                    <button
                      class="btn btn-icon btn-text-dark btn-hover-light-dark btn-sm"
                      @click="destroyTask(data.item)"
                      title="Hapus"
                    >
                      <span class="svg-icon svg-icon-md">
                        <inline-svg
                          title="Hapus"
                          :src="`${$baseUrl}media/svg/icons/Home/Trash.svg`"
                        >
                        </inline-svg>
                      </span>
                    </button>
                  </div>
                </template>
              </b-table>
              <div class="d-flex justify-content-between align-items-center">
                <b-pagination
                  v-model="pagination.page"
                  :per-page="pagination.perPage"
                  :total-rows="pagination.totalRows"
                  align="right"
                ></b-pagination>
                <div class="d-flex align-items-center">
                  <b-form-select
                    v-model="pagination.perPage"
                    :options="[10, 20, 50, 100]"
                    size="sm mr-3"
                    style="width: 70px;"
                  ></b-form-select>
                  <span
                    >Showing {{ pagination.from }} to {{ pagination.to }} of
                    {{ pagination.totalRows }} entries</span
                  >
                </div>
              </div>
            </div>
          </b-card>
        </div>
      </div>
    </div>
    <div id="chart-embed">
      <chart
        ref="chart"
        @taskUpdated="startDownload('task')"
        @goalUpdated="startDownload('goal')"
        style="position:absolute;top:-9999px;"
        always-full-width
      ></chart>
    </div>
    <task-crud
      ref="taskCrud"
      :taskGoalUserId="selectedUserId"
      @task-updated="refreshTable"
      @task-destroyed="refreshTable"
    ></task-crud>
    <b-modal
      v-model="modalShow"
      title="Detail Tugas"
      size="lg"
      ok-only
      ok-title="Tutup"
    >
      <template v-slot:modal-title>
        <div class="task-title">
          <div class="task-bar" :class="task.status">
            {{ task.name }}
          </div>
        </div>
      </template>
      <TaskDetail :task="task"></TaskDetail>
    </b-modal>
  </MVContent>
</template>

<script>
import { MVButtonDaterangePicker, MVSelect2 } from 'metronic-vue'
import {
  BCard,
  BTable,
  BPagination,
  BModal,
  VBTooltip,
  BFormSelect,
} from 'bootstrap-vue'
import Filter from './Filter.vue'
import TaskCrud from '../Task/TaskCrud'
import TaskDetail from './TaskDetail'
import { mapGetters } from 'vuex'
import { debounce } from 'debounce'
import axios from 'axios'
import moment from 'moment'
import sortWith from 'ramda/src/sortWith'
import ascend from 'ramda/src/ascend'
import prop from 'ramda/src/prop'
import { mapTaskFromApi } from '../Task/utils'
import Datepicker from 'vuejs-datepicker'
import { id } from 'vuejs-datepicker/dist/locale'
import Chart from '../StaffChart/Chart'

export default {
  name: 'Task',
  components: {
    MVSelect2,
    BCard,
    TaskFilter: Filter,
    TaskCrud,
    MVButtonDaterangePicker,
    BTable,
    BPagination,
    BModal,
    TaskDetail,
    Datepicker,
    Chart,
    BFormSelect,
  },
  directives: { 'b-tooltip': VBTooltip },
  filters: {
    formatDate(date) {
      return moment(date).format('dd-mm-YYYY')
    },
    formatMembers(members) {
      const numMembers = members.length
      if (numMembers === 0) {
        return ''
      } else if (numMembers === 1) {
        return members[0].name
      } else if (numMembers === 2) {
        return `${members[0].name} dan ${members[1].name}`
      } else {
        const memberNames = members.map(member => member.name)
        return `${memberNames.slice(0, 2).join(', ')} dkk`
      }
    },
  },
  data() {
    return {
      id,
      selectedDate: new Date(),
      fields: [
        { label: 'Deskripsi Kegiatan', key: 'description', sortable: true },
        { label: 'Lokasi', key: 'location', sortable: true },
        { label: 'Jenis Tugas', key: 'name', sortable: true },
        { label: 'Mulai Pelaksanaan', key: 'due_at', sortable: true },
        { label: 'Selesai Pelaksanaan', key: 'end_at', sortable: true },
        { label: 'Petugas', key: 'user_id', sortable: true },
        { label: 'Kontrak', key: 'user_task_goal', sortable: false },
        { label: 'Volume', key: 'volume', sortable: false },
        { label: 'Status', key: 'status', sortable: true },
        {
          label: 'Actions',
          key: 'actions',
          sortable: true,
          class: 'text-center',
        },
      ],
      pagination: {
        page: 1,
        totalRows: 0,
        currentPage: 0,
        perPage: 10,
        from: 0,
        to: 0,
      },
      date: {
        start: moment().startOf('month'),
        end: moment().endOf('month'),
      },
      filter: '',
      staffs: [],
      selectedUserId: this.$store.getters.authUser.id,
      modalShow: false,
      task: {},
      xlsxUrl: '#',
      download: { status: false, task: false, goal: false },
      downloadDate: new Date(),
      datePickerStatus: false,
    }
  },
  mounted() {
    this.getStaffs()
    document
      .querySelector('.vdp-datepicker input')
      .addEventListener('blur', () =>
        setTimeout(() => {
          this.datePickerStatus = false
        }, 400)
      )
  },
  computed: {
    ...mapGetters(['authUser']),
  },
  watch: {
    date() {
      this.refreshTable()
    },
    selectedUserId() {
      this.refreshTable()
    },
    filter() {
      this.refreshTableDelay()
    },
  },
  methods: {
    async tableProvider(ctx) {
      const start = moment(this.date.start).format('YYYY-MM-DD')
      const end = moment(this.date.end).format('YYYY-MM-DD')
      const url = `/api/v2/tasks?start=${start}&end=${end}&user_id=${
        this.selectedUserId
      }&member=true&members=true&task_type=true&user_task_goal=true&assignor=true&attachments=true&page=${
        ctx.currentPage
      }&per_page=${ctx.perPage}&sortBy=${ctx.sortBy}&order=${
        ctx.sortDesc ? 'desc' : 'asc'
      }&filter=${this.filter}`

      this.xlsxUrl = `${url}&download=xlsx`

      try {
        const { data } = await axios.get(url)

        this.pagination = {
          page: data.current_page,
          totalRows: data.total,
          perPage: data.per_page,
          from: data.from,
          to: data.to,
        }
        return data.data.map(mapTaskFromApi).map(x => ({
          ...x,
          _due_at: x.due_at,
          _end_at: x.end_at,
          due_at: moment(x.due_at).format('DD-MM-YYYY'),
          end_at: moment(x.end_at).format('DD-MM-YYYY'),
        }))
      } catch (error) {
        console.log(error)
        return []
      }
    },
    async getStaffs() {
      const sortByName = sortWith([ascend(prop('name'))])
      const { data } = await axios.get(
        `/api/v2/users/${this.authUser.id}/staff`
      )
      this.staffs = sortByName([{ ...this.authUser }, ...data])
    },
    refreshTable() {
      this.$refs.table.refresh()
    },
    refreshTableDelay: debounce(function() {
      this.refreshTable()
    }, 600),

    openTask(task) {
      this.task = task
      this.modalShow = true
    },
    destroyTask(task) {
      this.$refs.taskCrud.destroy(task)
    },
    editTask(task) {
      this.$refs.taskCrud.edit({
        ...task,
        due_at: task._due_at,
        end_at: task._end_at,
      })
    },
    setDatePickerStatus(e) {
      console.log(e)
      console.log('e')
    },
    openDatePicker() {
      if (!this.datePickerStatus) {
        this.datePickerStatus = true
        this.$refs.datepicker.showCalendar()
        document.querySelector('.vdp-datepicker input').focus()
      }
    },
    downloadReport(date) {
      this.downloadDate = date
      this.$refs.chart.date = {
        start: moment(date).startOf('month'),
        end: moment(date).endOf('month'),
      }
      this.$refs.chart.selectedUserId = this.selectedUserId

      this.download.status = true
    },
    async startDownload(key) {
      if (!this.download.status) {
        return
      }
      this.download[key] = true

      if (Object.values(this.download).find(x => !x)) {
        return
      }
      this.download = { status: false, task: false, goal: false }

      setTimeout(async () => {
        const payload = {
          start: moment(this.downloadDate)
            .startOf('month')
            .format('YYYY-MM-DD'),
          end: moment(this.downloadDate)
            .endOf('month')
            .format('YYYY-MM-DD'),
          user_id: this.selectedUserId,
          typeFigure: this.$refs.chart.$refs.taskChart
            .getDataURL()
            .replace('data:image/png;base64,', ''),
          achievementFigure: this.$refs.chart.$refs.goalChart
            .getDataURL()
            .replace('data:image/png;base64,', ''),
        }

        const response = await axios.post(`/api/v2/goals/download`, payload, {
          responseType: 'blob',
        })

        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.classList.add('d-none')
        link.href = url
        link.setAttribute(
          'download',
          response.headers['content-disposition'].split('filename=')[1]
        )
        document.body.appendChild(link)
        link.click()
      }, 1000)
    },
  },
}
</script>

<style lang="scss">
body,
html {
  overflow-x: hidden;
}

.daterangepicker {
  z-index: 1035;
}

.table.b-table {
  font-size: 1rem;

  th {
    color: #b1b1b1;
    font-size: 0.9rem;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.1rem;
    vertical-align: middle;

    &:focus {
      outline: none;
    }
  }

  td {
    color: #3f4254;
    padding: 1rem;
  }
}

.vdp-datepicker {
  right: -45px;
  position: absolute !important;

  input {
    // display: none;
    width: 0;
    height: 0;
    padding: 0;
    margin: 0;
  }
}

#chart-embed {
  .subheader {
    display: none;
  }
}
</style>
