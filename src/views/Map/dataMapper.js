export const locationMapper = location => ({
  id: location.id,
  location_type: location.location_type,
  active_date: location.active_date,
  is_online: null,
  visible: true,
  status: location.log ? location.log.status : 'Baik',
  type: 'location',
  title: [location.code, location.name].filter(x => x).join(', '),
  description: location.description,
  address: [location.kelurahan, location.kecamatan, location.kabupaten]
    .filter(x => x)
    .join(', '),
  coordinates: [
    Number(location.lat),
    Number(location.lng),
    location.elevation ? `${location.elevation} mdpl` : null,
  ]
    .filter(x => x)
    .join(', '),
  avatar: location.avatar ? `/storage/auth/${location.avatar.path}` : null,
})

export const assetMapper = asset => ({
  id: asset.id,
  is_online: asset.is_online,
  active_date: asset.active_date,
  ip: asset.ip,
  asset_type_id: asset.asset_type_id,
  visible: false,
  location_id: asset.location_id,
  status: asset.log ? asset.log.status : 'Baik',
  type: 'asset',
  method: asset.asset_type.method,
  title: [asset.code, asset.asset_type.name].filter(x => x).join(', '),
  description: asset.description,
  coordinates: [
    Number(asset.lat),
    Number(asset.lng),
    asset.elevation ? `${asset.elevation} mdpl` : null,
  ]
    .filter(x => x)
    .join(', '),
  avatar: asset.avatar ? `/storage/auth/${asset.avatar.path}` : null,
})
