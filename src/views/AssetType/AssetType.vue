<template>
  <MVContent>
    <template v-slot:subheader>
      <MVSubheader title="Daftar Jenis Aset">
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
            @input="getAssetTypesCondition"
          ></MVSelect2>
        </div>
        <a
          href="#"
          class="btn btn-light-primary font-weight-bolder btn-sm"
          @click="$refs.assetTypeCrud.create()"
          >Buat Jenis Aset</a
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
                :items="assetTypes"
                :current-page="pagination.page"
                :per-page="pagination.perPage"
                :filter="filter"
                responsive
                striped
                @filtered="onFiltered"
              >
                <template #custom-foot="{items}">
                  <tr>
                    <th colspan="3"></th>
                    <th class="text-right text-dark">Total:</th>
                    <th class="text-dark">
                      {{
                        items.reduce(
                          (prev, next) => prev + next.assets_count,
                          0
                        )
                      }}
                    </th>
                    <th class="text-dark">
                      {{
                        items.reduce(
                          (prev, next) => prev + next.broken_assets_count,
                          0
                        )
                      }}
                    </th>
                    <th class="text-dark">
                      {{
                        items.reduce(
                          (prev, next) => prev + next.have_problem_assets_count,
                          0
                        )
                      }}
                    </th>
                    <th></th>
                  </tr>
                </template>
                <template #table-colgroup="scope">
                  <col
                    v-for="field in scope.fields"
                    :key="field.key"
                    :style="{
                      width: field.key === 'actions' ? '120px' : 'auto',
                    }"
                  />
                </template>
                <template #cell(actions)="data">
                  <button
                    class="btn btn-icon btn-text-dark btn-hover-light-dark btn-sm mr-2"
                    @click="$refs.assetTypeCrud.edit(data.item)"
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
                    @click="$refs.assetTypeCrud.destroy(data.item)"
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
    <AssetTypeCrud
      ref="assetTypeCrud"
      @asset-type-updated="getAssetTypesCondition"
      @asset-type-created="getAssetTypesCondition"
      @asset-type-destroyed="getAssetTypesCondition"
    ></AssetTypeCrud>
  </MVContent>
</template>

<script>
import { BCard, BTable, BPagination, BFormSelect } from 'bootstrap-vue'
import { MVSelect2 } from 'metronic-vue'
import axios from 'axios'
import AssetTypeCrud from './AssetTypeCrud'

export default {
  name: 'AssetType',
  components: {
    BCard,
    BTable,
    BPagination,
    BFormSelect,
    AssetTypeCrud,
    MVSelect2,
  },
  data() {
    return {
      editedItem: {},
      modal: false,
      fields: [
        {
          label: 'Nama',
          key: 'name',
          sortable: true,
        },
        {
          label: 'Merek',
          key: 'brand',
          sortable: true,
        },
        {
          label: 'Model',
          key: 'series',
          sortable: true,
        },
        {
          label: 'Kelompok',
          key: 'group',
          sortable: true,
        },
        {
          label: 'Jumlah',
          key: 'assets_count',
          sortable: true,
        },
        {
          label: 'Rusak',
          key: 'broken_assets_count',
          sortable: true,
        },
        {
          label: 'Bermasalah',
          key: 'have_problem_assets_count',
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
    this.getAssetTypesCondition()
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
    async getAssetTypesCondition() {
      const { data } = await axios.get(
        `/api/v2/maintenance/asset-types-condition?location_id=${this.location_id}`
      )
      this.assetTypes = data.data.map(x => ({
        ...x,
      }))
      this.pagination.totalRows = data.data.length
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
    onFiltered(filteredItems) {
      this.pagination.totalRows = filteredItems.length
      this.pagination.page = 1
    },
  },
}
</script>
