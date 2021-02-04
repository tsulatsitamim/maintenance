<template>
  <MVContent>
    <template v-slot:subheader>
      <MVSubheader :title="title">
        <button
          class="btn btn-light-primary font-weight-bolder btn-sm mr-2 px-4"
          title="Print"
          @click="openPdf"
        >
          <span class="svg-icon mr-0">
            <inline-svg
              title="Print"
              :src="`${$baseUrl}media/svg/icons/Devices/Printer.svg`"
            ></inline-svg>
          </span>
        </button>
        <button
          class="btn btn-light-primary font-weight-bolder btn-sm mr-2 px-4"
          title="Ping"
          @click="dispatchPing"
        >
          <span class="svg-icon mr-0">
            <inline-svg
              title="Ping"
              :src="`${$baseUrl}media/svg/icons/Devices/LTE2.svg`"
            ></inline-svg>
          </span>
        </button>

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
        <a
          href="#"
          class="btn btn-light-primary font-weight-bolder btn-sm"
          @click="$refs.assetCrud.create()"
          >Buat Jenis Aset</a
        >
      </MVSubheader>
    </template>
    <div class="home">
      <div class="row">
        <div class="col-12">
          <b-card>
            <div>
              <BTableSimple responsive striped>
                <thead>
                  <tr>
                    <th>Jenis</th>
                    <th>Kode BMN</th>
                    <th>Seri</th>
                    <th>Kode Alat</th>
                    <th>IP</th>
                    <th>Metode</th>
                    <th>Tanggal Update</th>
                    <th>Kondisi</th>
                    <th>Status</th>
                    <th>Tindakan</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="group in Object.keys(assets).sort()">
                    <tr :key="group">
                      <th colspan="11" class="text-dark">{{ group }}</th>
                    </tr>
                    <tr v-for="asset in assets[group]" :key="asset.id">
                      <td class="align-middle">{{ asset.name }}</td>
                      <td class="align-middle">{{ asset.bmn_code }}</td>
                      <td class="align-middle">{{ asset.series }}</td>
                      <td class="align-middle">{{ asset.code }}</td>
                      <td class="align-middle">{{ asset.ip }}</td>
                      <td class="align-middle">{{ asset.method }}</td>
                      <td class="align-middle">{{ asset.last_log_date }}</td>
                      <td class="align-middle">{{ asset.log }}</td>
                      <td class="align-middle">{{ asset.is_online }}</td>
                      <td class="py-0 align-middle">
                        <button
                          class="btn btn-icon btn-text-dark btn-hover-light-dark btn-sm mr-2"
                          @click="$refs.assetCrud.edit(asset)"
                          title="Edit"
                        >
                          <span class="svg-icon svg-icon-md">
                            <inline-svg
                              title="Edit"
                              :src="
                                `${$baseUrl}media/svg/icons/Design/Edit.svg`
                              "
                            >
                            </inline-svg>
                          </span>
                        </button>
                        <button
                          class="btn btn-icon btn-text-dark btn-hover-light-dark btn-sm"
                          @click="$refs.assetCrud.destroy(asset)"
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
                      </td>
                    </tr>
                  </template>
                </tbody>
              </BTableSimple>
            </div>
          </b-card>
        </div>
      </div>
    </div>
    <AssetCrud
      ref="assetCrud"
      @asset-updated="getAssets"
      @asset-created="getAssets"
      @asset-destroyed="getAssets"
    ></AssetCrud>
  </MVContent>
</template>

<script>
import { BCard, BTableSimple } from 'bootstrap-vue'
import groupBy from 'ramda/src/groupBy'
import axios from 'axios'
import AssetCrud from './AssetCrud'

export default {
  name: 'Asset',
  components: {
    BCard,
    AssetCrud,
    BTableSimple,
  },
  data() {
    return {
      filter: '',

      assets: [],
      title: 'Daftar Aset',
    }
  },
  mounted() {
    this.getLocation()
    this.getAssets()

    window.Echo.private(`asset`).listen(
      '.App\\Events\\Maintenance\\AssetIsOnlineUpdated',
      () => {
        this.getAssets()
      }
    )
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
    async getLocation() {
      const { data } = await axios.get(
        `/api/v2/maintenance/locations/${this.$route.params.id}`
      )
      this.title = `Daftar Aset - ${data.name}`
    },
    async getAssets() {
      const { data } = await axios.get(
        `http://cendana15.test:3002/api/v2/maintenance/assets?location_id=${this.$route.params.id}`
      )
      const assets = data.data.map(x => ({
        id: x.id,
        group: x.asset_type.group,
        name: x.asset_type.name,
        bmn_code: x.bmn_code,
        series: `${x.asset_type.brand}${
          x.asset_type.brand && x.asset_type.series
            ? ` - ${x.asset_type.series}`
            : x.asset_type.series
        }`,
        code: x.code,
        ip: x.ip,
        method: x.asset_type.method,
        last_log_date: x.log ? x.log.date : '',
        log: x.log ? x.log.status : '',
        is_online:
          x.is_online === null ? '' : x.is_online ? 'Online' : 'Offline',
      }))

      this.assets = groupBy(x => x.group, assets)
    },
    openPdf() {
      window.open(
        `/api/v2/maintenance/assets?location_id=${this.$route.params.id}&pdf=true`,
        '_blank',
        'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=900, height=900'
      )
    },
    async dispatchPing() {
      await axios.get(
        `/api/v2/maintenance/assets?location_id=${this.$route.params.id}&ping=true`
      )
      this.$toast('Ping sent!')
      this.getAssets()
    },
  },
}
</script>
