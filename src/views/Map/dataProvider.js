import axios from 'axios'
import { assetMapper, locationMapper } from './dataMapper'
import moment from 'moment'

export const min = 0.999999
export const max = 1.000001
export const randomNumber = () =>
  (Math.random() < 0.5 ? -1 : 1) *
  (Math.random() * (0.000005 - 0.000001) + 0.000001)

export const getLocationTypes = async () => {
  const { data } = await axios.get(
    `/api/v2/maintenance/locations?groupBy=location_type`
  )
  return data.data.map(x => ({
    ...x,
    id: x.name,
    show: true,
    icon: `/storage/img/icons/${x.name}_baik.png`.toLowerCase(),
  }))
}

export const getAssetTypes = async () => {
  const { data } = await axios.get(
    `/api/v2/maintenance/asset-types?groupBy=method`
  )
  return data.data.map(x => ({
    ...x,
    id: x.name,
    show: false,
    icon: `/storage/img/icons/${x.name}_baik.png`.toLowerCase(),
  }))
}

export const getLocationMarkers = async date => {
  const { data } = await axios.get(
    `/api/v2/maintenance/locations?active=true&coordinates=true&avatar=true&log_date=${moment(
      date
    )
      .add(1, 'days')
      .format('YYYY-MM-DD')}`
  )

  return data.data.map(x => ({
    properties: locationMapper(x),
    position: {
      lat: Number(x.lat) + randomNumber(),
      lng: Number(x.lng) + randomNumber(),
    },
    icon: `/storage/img/icons/${x.location_type}_${
      !x.log ? 'baik' : x.log.status
    }.png`.toLowerCase(),
  }))
}

export const getAssetMarkers = async date => {
  const { data } = await axios.get(
    `/api/v2/maintenance/assets?active=true&coordinates=true&avatar=true&log_date=${moment(
      date
    )
      .add(1, 'days')
      .format('YYYY-MM-DD')}`
  )

  return data.data.map(x => {
    const iconWithLogCheck = `/storage/img/icons/${x.asset_type.method}_${
      x.log ? x.log.status : 'Baik'
    }.png`.toLowerCase()

    const iconWithIsOnlineCheck = `/storage/img/icons/${x.asset_type.method}_${
      (x.status_log ? x.status_log.status : x.is_online) ? 'baik' : 'bermasalah'
    }.png`.toLowerCase()

    // Short-period seismometers use icon from log condition
    const isShortPeriod = [10, 13].includes(x.asset_type_id)
    const icon = isShortPeriod ? iconWithLogCheck : iconWithIsOnlineCheck
    const isShortPeriodOnline = x.log ? x.log.status === 'Baik' : true
    const properties = assetMapper(x)

    return {
      properties: {
        ...properties,
        is_online: isShortPeriod ? isShortPeriodOnline : x.is_online,
      },
      position: {
        lat: Number(x.lat) * (Math.random() * (max - min) + min),
        lng: Number(x.lng) * (Math.random() * (max - min) + min),
      },
      icon: icon,
    }
  })
}

export const getLinks = async date => {
  const { data } = await axios.get(
    `/api/v2/maintenance/location-links?active=true&log_date=${moment(date)
      .add(1, 'days')
      .format('YYYY-MM-DD')}`
  )
  return data.filter(
    link => link.from.lat && link.from.lng && link.to.lat && link.to.lng
  )
}
