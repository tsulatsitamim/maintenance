<template>
  <MVContent>
    <template v-slot:subheader>
      <MVSubheader title="Simbol">
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
                :items="symbols"
                :current-page="pagination.page"
                :per-page="pagination.perPage"
                :filter="filter"
                responsive
                striped
                @filtered="onFiltered"
              >
                <template #cell(baik)="data">
                  <img
                    :src="
                      `/storage/img/icons/${data.item.id.toLowerCase()}_baik.png?${Date.now()}`
                    "
                    onerror="this.style.display='none'"
                  />
                </template>
                <template #cell(bermasalah)="data">
                  <img
                    :src="
                      `/storage/img/icons/${data.item.id.toLowerCase()}_bermasalah.png?${Date.now()}`
                    "
                    onerror="this.style.display='none'"
                  />
                </template>
                <template #cell(rusak)="data">
                  <img
                    :src="
                      `/storage/img/icons/${data.item.id.toLowerCase()}_rusak.png?${Date.now()}`
                    "
                    onerror="this.style.display='none'"
                  />
                </template>
                <template #cell(actions)="data">
                  <button
                    class="btn btn-icon btn-text-dark btn-hover-light-dark btn-sm mr-2"
                    @click="$refs.SymbolCrud.edit(data.item)"
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
    <SymbolCrud ref="SymbolCrud" @symbol-updated="refreshTable"></SymbolCrud>
  </MVContent>
</template>

<script>
import { BCard, BTable, BPagination, BFormSelect } from 'bootstrap-vue'
import axios from 'axios'
import SymbolCrud from './SymbolCrud'

export default {
  name: 'Symbol',
  components: {
    BCard,
    BTable,
    BPagination,
    BFormSelect,
    SymbolCrud,
  },
  data() {
    return {
      editedItem: {},
      modal: false,
      fields: [
        {
          label: 'Jenis',
          key: 'type',
          sortable: true,
        },
        {
          label: 'Nama',
          key: 'name',
          sortable: true,
        },
        {
          label: 'Baik',
          key: 'baik',
          sortable: true,
          class: 'text-center',
        },
        {
          label: 'Bermasalah',
          key: 'bermasalah',
          sortable: true,
          class: 'text-center',
        },
        {
          label: 'Rusak',
          key: 'rusak',
          sortable: true,
          class: 'text-center',
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
        perPage: 20,
      },
      symbols: [],
      original_symbols: [],
      loading: false,
    }
  },
  mounted() {
    this.getSymbols()
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
    refreshTable() {
      this.symbols = []
      this.$nextTick(() => {
        this.symbols = this.original_symbols
      })
    },
    async getSymbols() {
      const responses = await Promise.all([
        await axios.get(`/api/v2/maintenance/locations?groupBy=location_type`),
        await axios.get(`/api/v2/maintenance/asset-types?groupBy=method`),
      ])

      const [{ data: locations }, { data: assets }] = responses

      this.symbols = [
        ...locations.data.map(x => ({
          type: 'Lokasi',
          id: x.name,
          name: x.name,
        })),
        ...assets.data.map(x => ({
          type: 'Asset',
          id: x.name,
          name: x.name,
        })),
      ]
      this.original_symbols = this.symbols

      this.pagination.totalRows = this.symbols.length
    },
    onFiltered(filteredItems) {
      this.pagination.totalRows = filteredItems.length
      this.pagination.page = 1
    },
  },
}
</script>
