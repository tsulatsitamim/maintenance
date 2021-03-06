<template>
  <MVContent>
    <template v-slot:subheader>
      <MVSubheader title="Daftar Lokasi">
        <b-dropdown
          toggle-class="btn-light-primary font-weight-bolder btn-sm"
          class="mr-2"
        >
          <template #button-content>
            <span class="svg-icon mr-0">
              <inline-svg
                title="Rekap"
                :src="`${$baseUrl}icon/xlsx.svg`"
              ></inline-svg>
            </span>
          </template>
          <b-dropdown-item href="/api/v2/maintenance/locations?export=standard"
            >Rekap Standar</b-dropdown-item
          >
          <b-dropdown-item href="/api/v2/maintenance/locations?export=complete"
            >Rekap Lengkap</b-dropdown-item
          >
        </b-dropdown>

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

        <div
          class="input-group input-group-sm input-group-solid max-w-150px my-1 mr-2"
        >
          <datepicker
            v-model="log_date"
            name="log_date"
            input-class="form-control"
          ></datepicker>
        </div>

        <a
          href="#"
          class="btn btn-light-primary font-weight-bolder btn-sm"
          @click="$refs.locationCrud.create()"
          >Buat Lokasi</a
        >
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
                :items="locations"
                :current-page="pagination.page"
                :per-page="pagination.perPage"
                :filter="filter"
                responsive
                striped
                @filtered="onFiltered"
              >
                <template #cell(actions)="data">
                  <router-link
                    :to="`/locations/${data.item.id}/logbooks`"
                    class="btn btn-icon btn-text-dark btn-hover-light-dark btn-sm mr-2"
                    title="Logbook"
                  >
                    <span class="svg-icon svg-icon-md">
                      <inline-svg
                        title="Logbook"
                        :src="`${$baseUrl}media/svg/icons/Home/Book-open.svg`"
                      >
                      </inline-svg>
                    </span>
                  </router-link>
                  <router-link
                    :to="`/locations/${data.item.id}/assets`"
                    class="btn btn-icon btn-text-dark btn-hover-light-dark btn-sm mr-2"
                    title="Aset"
                  >
                    <span class="svg-icon svg-icon-md">
                      <inline-svg
                        title="Aset"
                        :src="`${$baseUrl}media/svg/icons/Home/Building.svg`"
                      >
                      </inline-svg>
                    </span>
                  </router-link>

                  <button
                    class="btn btn-icon btn-text-dark btn-hover-light-dark btn-sm mr-2"
                    @click="$refs.locationCrud.edit(data.item)"
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
                    @click="$refs.locationCrud.destroy(data.item)"
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
    <LocationCrud
      ref="locationCrud"
      @location-updated="getLocations"
      @location-created="getLocations"
      @location-destroyed="getLocations"
    ></LocationCrud>
  </MVContent>
</template>

<script>
import {
  BCard,
  BTable,
  BPagination,
  BFormSelect,
  BDropdown,
  BDropdownItem,
} from 'bootstrap-vue'
import axios from 'axios'
import LocationCrud from './LocationCrud'
import Datepicker from 'vuejs-datepicker'
import moment from 'moment'

export default {
  name: 'Location',
  components: {
    BCard,
    BTable,
    BPagination,
    BFormSelect,
    LocationCrud,
    BDropdown,
    BDropdownItem,
    Datepicker,
  },
  data() {
    return {
      editedItem: {},
      modal: false,
      log_date: new Date(),
      fields: [
        {
          label: 'Kode',
          key: 'code',
          sortable: true,
        },
        {
          label: 'Nama',
          key: 'name',
          sortable: true,
        },
        {
          label: 'Jenis',
          key: 'location_type',
          sortable: true,
        },
        {
          label: 'Alamat',
          key: 'kelurahan',
          sortable: true,
        },
        {
          label: 'Kondisi',
          key: 'condition',
          sortable: true,
        },
        {
          label: 'Status',
          key: 'is_online',
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
      locations: [],
      loading: false,
      xlsxUrlStandar: '#',
    }
  },
  watch: {
    log_date() {
      this.getLocations()
    },
  },
  mounted() {
    this.getLocations()
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
    async getLocations() {
      const { data } = await axios.get(
        `/api/v2/maintenance/locations?table=true&log_date=${moment(
          this.log_date
        )
          .add(1, 'days')
          .format('YYYY-MM-DD')}`
      )
      this.locations = data.data.map(x => ({
        ...x,
        condition: x.log ? x.log.status : '',
      }))
      this.pagination.totalRows = data.data.length
    },
    onFiltered(filteredItems) {
      this.pagination.totalRows = filteredItems.length
      this.pagination.page = 1
    },
  },
}
</script>
