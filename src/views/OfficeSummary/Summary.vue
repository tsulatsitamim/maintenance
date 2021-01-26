<template>
  <MVContent>
    <template v-slot:subheader>
      <MVSubheader title="Rekap Tugas Kantor">
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
          @selected-department-id="selectedDepartmentId = $event"
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
  </MVContent>
</template>

<script>
import { MVButtonDaterangePicker, MVSelect2 } from 'metronic-vue'
import { BCard, BTable, BPagination, BFormSelect } from 'bootstrap-vue'
import Filter from './Filter.vue'
import { mapGetters } from 'vuex'
import { debounce } from 'debounce'
import axios from 'axios'
import moment from 'moment'

export default {
  name: 'Task',
  components: {
    MVSelect2,
    BCard,
    TaskFilter: Filter,
    MVButtonDaterangePicker,
    BTable,
    BPagination,
    BFormSelect,
  },
  filters: {
    formatDate(date) {
      return moment(date).format('dd-mm-YYYY')
    },
  },
  data() {
    return {
      fields: [
        { label: 'Deskripsi Kegiatan', key: 'description', sortable: true },
        { label: 'Lokasi', key: 'location', sortable: true },
        { label: 'Jenis Tugas', key: 'name', sortable: true },
        { label: 'Mulai Pelaksanaan', key: 'due_at', sortable: true },
        { label: 'Selesai Pelaksanaan', key: 'end_at', sortable: true },
        { label: 'Pembuat Tugas', key: 'user.name', sortable: true },
        { label: 'Kontrak', key: 'user_task_goal', sortable: false },
        { label: 'Volume', key: 'volume', sortable: false },
        { label: 'Status', key: 'status', sortable: true },
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
      departments: [
        { id: 1, name: 'BPPTKG' },
        { id: 2, name: 'TU' },
        { id: 3, name: 'MERAPI' },
        { id: 4, name: 'MT' },
        { id: 5, name: 'PL' },
      ],
      selectedDepartmentId: 1,
      xlsxUrl: '#',
    }
  },
  mounted() {
    //
  },
  computed: {
    ...mapGetters(['authUser']),
  },
  watch: {
    date() {
      this.refreshTable()
    },
    selectedDepartmentId() {
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
        this.authUser.id
      }&department_id=${
        this.selectedDepartmentId
      }&member=true&task_type=true&user_task_goal=true&assignor=true&page=${
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
        return data.data.map(x => ({
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
    refreshTable() {
      this.$refs.table.refresh()
    },
    refreshTableDelay: debounce(function() {
      this.refreshTable()
    }, 600),
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
</style>
