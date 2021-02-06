import populateInfoWindow from './populateInfoWindow'
import MarkerClusterer from '@googlemaps/markerclustererplus'

export const updateCluster = (map, markers, markerClusterer = null) => {
  if (markerClusterer) {
    markerClusterer.clearMarkers()
  }

  const visibleMarkers = markers.filter(x => x.properties.visible)
  return new MarkerClusterer(map, visibleMarkers, {
    imagePath: '/images/markerclusterer/m',
    gridSize: 50,
    minimumClusterSize: 3,
  })
}

export const initMap = async (el, locations) => {
  let infowindowTimeOut = null

  const infowindow = new window.google.maps.InfoWindow()

  const bounds = new window.google.maps.LatLngBounds()

  const map = new window.google.maps.Map(el, {
    center: { lat: -7.540259, lng: 110.445651 },
    zoom: 13,
    mapTypeId: 'terrain',
  })

  map.fitBounds(bounds)

  const markers = locations.map(x => {
    bounds.extend(x.position)
    const marker = new window.google.maps.Marker({
      ...x,
      map,
    })

    marker.addListener('mouseover', () => {
      clearTimeout(infowindowTimeOut)
      populateInfoWindow(this, marker, infowindow)
    })
    marker.addListener('click', () => {
      clearTimeout(infowindowTimeOut)
      populateInfoWindow(this, marker, infowindow)
    })
    marker.addListener('mouseout', () => {
      infowindowTimeOut = setTimeout(() => {
        infowindow.close()
      }, 500)
    })

    if (!marker.properties.visible) {
      marker.properties.visible = false
      marker.setVisible(false)
    }
    return marker
  })

  const markerClusterer = updateCluster(map, markers)

  window.google.maps.event.addListener(infowindow, 'domready', () => {
    const infoWindowElement = document.querySelector('.gm-style-iw')
    infoWindowElement.addEventListener('mouseover', () => {
      clearTimeout(infowindowTimeOut)
    })
    infoWindowElement.addEventListener('mouseleave', () => {
      infowindow.close()
    })
  })

  return { map, markers, markerClusterer }
}
