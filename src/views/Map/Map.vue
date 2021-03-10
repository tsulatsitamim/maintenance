<template>
  <MVContent>
    <template v-slot:subheader>
      <MVSubheader title="Peta">
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
        <b-dropdown
          text="Lokasi"
          toggle-class="btn-light-primary font-weight-bolder btn-sm"
          class="mr-2"
        >
          <b-dropdown-form>
            <label class="checkbox checkbox-outline min-w-140px mb-2">
              <input
                v-model="allLocationTypes"
                type="checkbox"
                name="allLocationTypes"
                @input="
                  () => locationTypes.map(x => (x.show = !allLocationTypes))
                "
              />
              <span class="mr-2"></span>
              Semua
            </label>
            <label
              v-for="locationType in locationTypes"
              :key="locationType.name"
              class="checkbox checkbox-outline min-w-140px mb-2"
            >
              <input
                v-model="locationType.show"
                type="checkbox"
                :name="locationType.name"
              />
              <span class="mr-2"></span>
              <img :src="locationType.icon" height="30px" class="mr-2" />
              {{ locationType.name }}
            </label>
          </b-dropdown-form>
        </b-dropdown>
        <b-dropdown
          text="Sensor"
          toggle-class="btn-light-danger font-weight-bolder btn-sm"
          class="mr-2"
        >
          <b-dropdown-form>
            <label class="checkbox checkbox-outline min-w-140px mb-2">
              <input
                type="checkbox"
                v-model="allAssetTypes"
                name="allAssetTypes"
                @input="() => assetTypes.map(x => (x.show = !allAssetTypes))"
              />
              <span class="mr-2"></span>
              Semua
            </label>
            <label
              v-for="assetType in assetTypes"
              :key="assetType.name"
              class="checkbox checkbox-outline min-w-140px mb-2"
            >
              <input
                v-model="assetType.show"
                type="checkbox"
                :name="assetType.name"
              />
              <span class="mr-2"></span>
              <img :src="assetType.icon" height="30px" class="mr-2" />
              {{ assetType.name }}
            </label>
          </b-dropdown-form>
        </b-dropdown>
        <b-dropdown
          text="Jaringan"
          toggle-class="btn-light-warning font-weight-bolder btn-sm"
          class="mr-2"
        >
          <b-dropdown-form>
            <label class="checkbox checkbox-outline min-w-140px mb-2">
              <input v-model="allLinks" type="checkbox" name="semua" />
              <span class="mr-2"></span>
              Semua
            </label>
          </b-dropdown-form>
        </b-dropdown>
      </MVSubheader>
    </template>
    <div class="home">
      <div class="row">
        <div class="col-12">
          <div class="map-wrapper">
            <div id="map" ref="map" class="map"></div>
            <div id="legend" ref="legend">
              <LogStatus
                title="Kondisi Lokasi"
                :status="locationLog"
              ></LogStatus>
              <LogStatus title="Kondisi Aset" :status="assetLog"></LogStatus>
            </div>
          </div>
        </div>
      </div>
    </div>
    <LocationCrud
      ref="locationCrud"
      @location-updated="locationUpdated"
    ></LocationCrud>
    <AssetCrud ref="assetCrud" @asset-updated="assetUpdated"></AssetCrud>
  </MVContent>
</template>

<script>
import { BDropdown, BDropdownForm } from 'bootstrap-vue'
import {
  getLocationTypes,
  getAssetTypes,
  getLocationMarkers,
  getAssetMarkers,
  getLinks,
  randomNumber,
  max,
  min,
} from './dataProvider'
import initGoogleMapLib from './initGoogleMapLib'
import { initLinks, initMap, initMarkers, updateCluster } from './map'
import { debounce } from 'debounce'
import LogStatus from './LogStatus'
import { updateAssetLogStatus, updateLocationLogStatus } from './legend'
import populateInfoWindow from './populateInfoWindow'
import LocationCrud from '../Location/LocationCrud'
import AssetCrud from '../Location/Asset/AssetCrud'
import { assetMapper, locationMapper } from './dataMapper'
import axios from 'axios'
import Datepicker from 'vuejs-datepicker'

export default {
  name: 'Map',
  components: {
    BDropdown,
    BDropdownForm,
    LogStatus,
    LocationCrud,
    AssetCrud,
    Datepicker,
  },
  data() {
    return {
      log_date: new Date(),
      filter: '',

      locationTypes: [],
      assetTypes: [],
      markers: [],
      links: [],

      locations: [],
      assets: [],

      map: null,
      mapMarkers: [],
      markerClusterer: null,

      showLocations: true,
      allLocationTypes: true,
      allAssetTypes: false,
      allLinks: false,

      assetLog: {
        good: 0,
        hasIssue: 0,
        damaged: 0,
      },
      locationLog: {
        good: 0,
        hasIssue: 0,
        damaged: 0,
      },
    }
  },
  async mounted() {
    const [
      locationTypes,
      assetTypes,
      locationMarkers,
      assetMarkers,
      links,
      google,
    ] = await Promise.all([
      getLocationTypes(),
      getAssetTypes(),
      getLocationMarkers(this.log_date),
      getAssetMarkers(this.log_date),
      getLinks(this.log_date),
      initGoogleMapLib(),
    ])

    const locationMarkersWithIp = locationMarkers.map(location => {
      const assetsWithIp = assetMarkers.filter(
        asset =>
          asset.properties.ip &&
          asset.properties.location_id === location.properties.id
      )

      return {
        ...location,
        properties: {
          ...location.properties,
          ip: assetsWithIp.length ? 'dummy_ip_address' : null,
          is_online: !!assetsWithIp.find(asset => asset.properties.is_online),
        },
      }
    })

    window.google = google
    this.locationTypes = locationTypes
    this.assetTypes = assetTypes
    this.markers = [...locationMarkersWithIp, ...assetMarkers]
    this.links = initLinks(links)

    const { map, markers } = await initMap(
      document.getElementById('map'),
      this.markers
    )

    this.map = map
    this.mapMarkers = markers

    this.updateLegend()
    this.updateCluster()

    map.controls[window.google.maps.ControlPosition.LEFT_BOTTOM].push(
      document.getElementById('legend')
    )

    this.listenAssetUpdate()
    this.addInfoWindowEventListener()
  },
  watch: {
    async log_date() {
      this.mapMarkers = this.mapMarkers.map(x => x.setMap(null))
      this.mapMarkers = []

      this.links = this.links.map(x => x.setMap(null))
      this.links = []

      this.markerClusterer.clearMarkers()

      const [locationMarkers, assetMarkers, links] = await Promise.all([
        getLocationMarkers(this.log_date),
        getAssetMarkers(this.log_date),
        getLinks(this.log_date),
      ])

      const locationMarkersWithIp = locationMarkers.map(location => {
        const assetsWithIp = assetMarkers.filter(
          asset =>
            asset.properties.ip &&
            asset.properties.location_id === location.properties.id
        )

        return {
          ...location,
          properties: {
            ...location.properties,
            ip: assetsWithIp.length ? 'dummy_ip_address' : null,
            is_online: !!assetsWithIp.find(asset => asset.properties.is_online),
          },
        }
      })
      this.markers = [...locationMarkersWithIp, ...assetMarkers]

      this.mapMarkers = initMarkers(this.map, [
        ...locationMarkersWithIp,
        ...assetMarkers,
      ])

      this.links = initLinks(links)
      this.links.map(x => x.setMap(this.allLinks ? this.map : null))

      this.updateMarkersVisibility()
      this.updateLegend()
      this.updateCluster()
      this.addInfoWindowEventListener()
    },
    allLinks() {
      this.links.map(x => x.setMap(this.allLinks ? this.map : null))
    },
    showLocations() {
      this.updateMarkersVisibility()
    },
    filter: {
      handler: debounce(function() {
        this.updateMarkersVisibility()
      }, 600),
    },
    locationTypes: {
      handler() {
        if (
          this.locationTypes.some(x => x.show) &&
          this.assetTypes.some(x => x.show)
        ) {
          return this.assetTypes.map(x => (x.show = false))
        }
        this.updateMarkersVisibility()
      },
      deep: true,
    },
    assetTypes: {
      handler() {
        if (
          this.assetTypes.some(x => x.show) &&
          this.locationTypes.some(x => x.show)
        ) {
          return this.locationTypes.map(x => (x.show = false))
        }
        this.updateMarkersVisibility()
      },
      deep: true,
    },
  },
  computed: {},
  methods: {
    updateMarkersVisibility() {
      this.allLocationTypes = !this.locationTypes.some(x => !x.show)
      const locationTypes = this.locationTypes
        .filter(x => x.show)
        .map(x => x.name)

      this.allAssetTypes = !this.assetTypes.some(x => !x.show)
      const assetTypes = this.assetTypes.filter(x => x.show).map(x => x.name)

      const filter = this.filter ? this.filter.toLowerCase() : ''

      this.mapMarkers = this.mapMarkers.map(x => {
        if (x.properties.type === 'location') {
          const isVisible =
            locationTypes.includes(x.properties.location_type) &&
            ((x.properties.title &&
              x.properties.title.toLowerCase().includes(filter)) ||
              (x.properties.description &&
                x.properties.description.toLowerCase().includes(filter)))

          x.setMap(this.showLocations && isVisible ? this.map : null)
          x.properties.visible = isVisible
          x.setVisible(this.showLocations && isVisible)
          return x
        }

        if (x.properties.type === 'asset') {
          const isVisible =
            assetTypes.includes(x.properties.method) &&
            ((x.properties.title &&
              x.properties.title.toLowerCase().includes(filter)) ||
              (x.properties.description &&
                x.properties.description.toLowerCase().includes(filter)))

          x.setMap(isVisible ? this.map : null)
          x.properties.visible = isVisible
          x.setVisible(isVisible)
          return x
        }

        return x
      })

      this.updateLegend()
      this.updateCluster()
    },
    updateCluster() {
      this.markerClusterer = updateCluster(
        this.map,
        this.mapMarkers,
        this.markerClusterer,
        this.showLocations
      )
    },
    updateLegend() {
      this.locationLog = updateLocationLogStatus(this.mapMarkers)
      this.assetLog = updateAssetLogStatus(this.mapMarkers, this.assetTypes)
    },
    listenAssetUpdate() {
      window.Echo.private(`asset`).listen(
        '.App\\Events\\Maintenance\\AssetIsOnlineUpdated',
        ({ id, is_online }) => {
          this.updateAssetStatus(id, is_online)
        }
      )
    },
    updateAssetStatus(id, is_online) {
      const index = this.mapMarkers.findIndex(
        marker =>
          marker.properties.id === id && marker.properties.type === 'asset'
      )

      if (index === -1) {
        return
      }

      const isShortPeriod = [10, 13].includes(
        this.mapMarkers[index].properties.asset_type_id
      )

      if (!isShortPeriod) {
        if (is_online) {
          const icon = this.mapMarkers[index].icon.replace('bermasalah', 'baik')
          this.mapMarkers[index].setIcon(icon)
        } else {
          const icon = this.mapMarkers[index].icon.replace('baik', 'bermasalah')
          this.mapMarkers[index].setIcon(icon)
        }
        this.mapMarkers[index].properties.is_online = is_online
      }

      if (
        this.infowindow &&
        this.infowindow.anchor &&
        this.infowindow.anchor.properties.id === id &&
        this.infowindow.anchor.properties.type === 'asset'
      ) {
        populateInfoWindow(this.map, this.mapMarkers[index], this.infowindow)
      }
    },
    infoWindowHandler(e) {
      if (e.target.classList.contains('edit-action')) {
        e.preventDefault()

        if (e.target.dataset.type === 'location') {
          this.$refs.locationCrud.edit({ id: e.target.dataset.id })
        }

        if (e.target.dataset.type === 'asset') {
          this.$refs.assetCrud.edit({ id: e.target.dataset.id })
        }

        return
      }

      if (e.target.classList.contains('refresh-action')) {
        e.preventDefault()
        this.refreshAssetStatus(e)
      }
    },
    addInfoWindowEventListener() {
      document
        .getElementById('map')
        .addEventListener('click', this.infoWindowHandler)
    },
    locationUpdated(location) {
      const index = this.mapMarkers.findIndex(
        marker =>
          marker.properties.id === location.id &&
          marker.properties.type === 'location'
      )
      if (index !== -1) {
        this.mapMarkers[index].properties = locationMapper(location)
        this.mapMarkers[index].setPosition({
          lat: Number(location.lat) + randomNumber(),
          lng: Number(location.lng) + randomNumber(),
        })
      }
    },
    assetUpdated(asset) {
      const index = this.mapMarkers.findIndex(
        marker =>
          marker.properties.id === asset.id &&
          marker.properties.type === 'asset'
      )
      if (index !== -1) {
        this.mapMarkers[index].properties = assetMapper(asset)
        this.mapMarkers[index].setPosition({
          lat: Number(asset.lat) * (Math.random() * (max - min) + min),
          lng: Number(asset.lng) * (Math.random() * (max - min) + min),
        })
      }
    },
    async refreshAssetStatus(e) {
      e.target.classList.add('d-none')
      const refreshElement = document.getElementById('refresh-spinner')
      if (refreshElement) {
        refreshElement.classList.remove('d-none')
      }

      try {
        const { data } = await axios.get(
          `/api/v2/maintenance/assets/${e.target.dataset.id}?ping=true`
        )
        this.updateAssetStatus(data.id, data.is_online)
        if (refreshElement) {
          refreshElement.classList.add('d-none')
        }
        e.target.classList.remove('d-none')
      } catch (error) {
        console.log(error)
      }
    },
  },
}
</script>

<style lang="scss">
.map {
  width: 100%;
  height: calc(100vh - 170px);
}

.gm-style-iw-d {
  overflow: hidden !important;
  max-height: none !important;
}

.gm-style-iw-c {
  padding: 0 !important;
}

.infowindow {
  width: 300px;

  .info {
    padding: 12px;

    .title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;

      h6 {
        margin-bottom: 0;
      }

      #status {
        min-width: 50px;
        margin-left: 2px;

        &:before {
          content: '';
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 5px;
          background-color: #2cd45c;
          margin-right: 3px;
        }

        &.offline {
          &:before {
            background-color: #fb0000 !important;
          }
        }
      }
    }
  }
}

.map-avatar {
  img {
    height: 150px;
    width: 300px;
    object-fit: cover;
  }
}

.icon-info {
  display: flex;
  align-items: center;
}

#legend {
  margin: 10px;
}
</style>
