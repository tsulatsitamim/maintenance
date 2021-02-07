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
              <div class="list-group-item">
                <label>
                  <input v-model="showLocations" type="checkbox" />
                  Tampilkan icon lokasi
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
} from './dataProvider'
import initGoogleMapLib from './initGoogleMapLib'
import { initLinks, initMap, updateCluster } from './map'
import { debounce } from 'debounce'
import LogStatus from './LogStatus'
import { updateAssetLogStatus, updateLocationLogStatus } from './legend'
import populateInfoWindow from './populateInfoWindow'

// TODO: update infowindow functionality

export default {
  name: 'Map',
  components: {
    BDropdown,
    BDropdownForm,
    LogStatus,
  },
  data() {
    return {
      filter: '',

      locationTypes: [],
      assetTypes: [],
      markers: [],
      links: [],

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
      getLocationMarkers(),
      getAssetMarkers(),
      getLinks(),
      initGoogleMapLib(),
    ])

    window.google = google
    this.locationTypes = locationTypes
    this.assetTypes = assetTypes
    this.markers = [...locationMarkers, ...assetMarkers]
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
  },
  watch: {
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
        this.updateMarkersVisibility()
      },
      deep: true,
    },
    assetTypes: {
      handler() {
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
      const index = this.markers.findIndex(
        marker =>
          marker.properties.id === id && marker.properties.type === 'asset'
      )

      if (index === -1) {
        return
      }

      const isShortPeriod = [10, 13].includes(
        this.markers[index].properties.asset_type_id
      )

      if (!isShortPeriod) {
        if (is_online) {
          const icon = this.markers[index].icon.replace('bermasalah', 'baik')
          this.markers[index].setIcon(icon)
        } else {
          const icon = this.markers[index].icon.replace('baik', 'bermasalah')
          this.markers[index].setIcon(icon)
        }
        this.markers[index].properties.is_online = is_online
      }

      if (
        this.infowindow &&
        this.infowindow.anchor &&
        this.infowindow.anchor.properties.id === id &&
        this.infowindow.anchor.properties.type === 'asset'
      ) {
        populateInfoWindow(this.map, this.markers[index], this.infowindow)
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
