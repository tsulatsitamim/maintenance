export const LocationStatus = Object.freeze({
  GOOD: 'Baik',
  HAS_ISSUE: 'Bermasalah',
  DAMAGED: 'Rusak',
})

export const AssetStatus = Object.freeze({
  GOOD: 'Baik',
  HAS_ISSUE: 'Bermasalah',
  DAMAGED: 'Rusak',
})

export function countLocationMarkerByStatus(markers, status) {
  const assets = markers.filter(
    marker =>
      marker.properties.type === 'location' &&
      marker.properties.visible &&
      marker.properties.status === status
  )
  return assets.length
}

export function countAssetMarkerByStatus(markers, status) {
  const assets = markers.filter(
    marker =>
      marker.properties.type === 'asset' &&
      marker.properties.visible &&
      marker.properties.status === status
  )
  return assets.length
}

export const updateLocationLogStatus = markers => {
  return {
    good: countLocationMarkerByStatus(markers, LocationStatus.GOOD),
    hasIssue: countLocationMarkerByStatus(markers, LocationStatus.HAS_ISSUE),
    damaged: countLocationMarkerByStatus(markers, LocationStatus.DAMAGED),
  }
}

export const updateAssetLogStatus = (markers, assetTypes) => {
  const assetTypesKeys = assetTypes.filter(x => x.show).map(x => x.name)
  const assetMarkers = markers.filter(
    x => x.properties.method && assetTypesKeys.includes(x.properties.method)
  )

  return {
    good: countAssetMarkerByStatus(assetMarkers, AssetStatus.GOOD),
    hasIssue: countAssetMarkerByStatus(assetMarkers, AssetStatus.HAS_ISSUE),
    damaged: countAssetMarkerByStatus(assetMarkers, AssetStatus.DAMAGED),
  }
}
