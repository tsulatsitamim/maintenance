<template>
  <MVContent>
    <template v-slot:subheader>
      <MVSubheader title="Logbook">
        <div
          class="input-group input-group-sm input-group-solid max-w-150px my-1 mr-2"
        >
          <input
            v-model="filter"
            type="text"
            class="form-control pl-4"
            placeholder="Search..."
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
        <div class="min-w-150px mr-2">
          <MVSelect2
            v-model="location_id"
            :items="locations"
            class="form-group-sm form-group-solid"
            liveSearch
            last
          ></MVSelect2>
        </div>
        <router-link
          :to="`/logbooks/0`"
          class="btn btn-light-primary font-weight-bolder btn-sm"
          title="Baru"
        >
          Baru
        </router-link>
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
                <template #table-colgroup="scope">
                  <col
                    v-for="field in scope.fields"
                    :key="field.key"
                    :style="{
                      width: field.key === 'actions' ? '140px' : 'auto',
                    }"
                  />
                </template>
                <template #cell(task.due_at)="data">
                  {{ data.item.task_due_at }}
                </template>
                <template #cell(actions)="data">
                  <a
                    class="btn btn-icon btn-text-dark btn-hover-light-dark btn-sm mr-2"
                    :href="`/api/v2/tasks/${data.item.task_id}?pdf=true`"
                    title="Laporan"
                    target="_blank"
                  >
                    <span class="svg-icon svg-icon-md">
                      <inline-svg
                        title="Laporan"
                        :src="`${$baseUrl}media/svg/icons/Devices/Printer.svg`"
                      >
                      </inline-svg>
                    </span>
                  </a>
                  <router-link
                    :to="`/logbooks/${data.item.id}`"
                    class="btn btn-icon btn-text-dark btn-hover-light-dark btn-sm mr-2"
                    title="Edit"
                  >
                    <span class="svg-icon svg-icon-md">
                      <inline-svg
                        title="Edit"
                        :src="`${$baseUrl}media/svg/icons/Design/Edit.svg`"
                      >
                      </inline-svg>
                    </span>
                  </router-link>
                  <button
                    class="btn btn-icon btn-text-dark btn-hover-light-dark btn-sm"
                    @click="destroy(data.item)"
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
                    >Showing
                    {{ (pagination.page - 1) * pagination.perPage + 1 }} to
                    {{ entriesTo }}
                    of {{ pagination.totalRows }} entries</span
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
import { BCard, BTable, BPagination, BFormSelect } from 'bootstrap-vue'
import { MVSelect2 } from 'metronic-vue'
import axios from 'axios'
import { debounce } from 'debounce'
import moment from 'moment'

export default {
  name: 'Logbook',
  components: {
    BCard,
    BTable,
    BPagination,
    BFormSelect,
    MVSelect2,
  },
  data() {
    return {
      editedItem: {},
      modal: false,
      fields: [
        {
          label: 'Tanggal',
          key: 'task.due_at',
          sortable: true,
        },
        {
          label: 'Lokasi',
          key: 'location.name',
          sortable: true,
        },
        {
          label: 'Lokasi Petugas',
          key: 'task.location',
          sortable: true,
        },
        {
          label: 'Dibuat Oleh',
          key: 'task.user.name',
          sortable: true,
        },
        {
          label: 'Kondisi Umum',
          key: 'status',
          sortable: true,
        },

        {
          label: 'Actions',
          key: 'actions',
          class: 'text-center',
        },
      ],
      filter: '',
      pagination: {
        page: 1,
        totalRows: 0,
        perPage: 10,
      },
      assetTypes: [],
      locations: [],
      location_id: 0,
      loading: false,
    }
  },
  mounted() {
    this.getLocations()
  },
  watch: {
    location_id() {
      this.refreshTable()
    },
    filter() {
      this.refreshTableDelay()
    },
  },
  computed: {
    entriesTo() {
      return Math.ceil(this.pagination.totalRows / this.pagination.perPage) ===
        this.pagination.page
        ? this.pagination.totalRows
        : this.pagination.page * this.pagination.perPage
    },
  },
  methods: {
    async tableProvider(ctx) {
      const url = `/api/v2/maintenance/logbooks?location_id=${
        this.location_id
      }&location=true&page=${ctx.currentPage}&per_page=${ctx.perPage}&sortBy=${
        ctx.sortBy
      }&order=${ctx.sortDesc ? 'desc' : 'asc'}&filter=${this.filter}`

      try {
        const { data } = await axios.get(url)
        this.pagination.totalRows = data.total

        return data.data.map(x => ({
          ...x,
          task_due_at: moment(x.task.due_at).format('YYYY-MM-DD'),
        }))
      } catch (error) {
        console.log(error)
        return []
      }
    },

    async getLocations() {
      const { data } = await axios.get('/api/v2/maintenance/locations')
      this.locations = [
        { id: 0, name: 'Semua' },
        ...data.data.map(x => ({
          id: x.id,
          name: x.name,
        })),
      ]
    },

    refreshTable() {
      this.$refs.table.refresh()
    },
    refreshTableDelay: debounce(function() {
      this.refreshTable()
    }, 600),

    edit(item) {
      this.$router.push(`/logbooks/${item.id}`)
    },
    async destroy(item) {
      if (window.confirm('Hapus logbook?')) {
        try {
          await axios.delete(`/api/v2/maintenance/logbooks/${item.id}`)
          this.$toast('Logbook berhasil dihapus.')
          this.refreshTable()
        } catch (error) {
          this.$toast(error, 'danger')
        }
      }
    },
  },
}
</script>
