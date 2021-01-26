const menus = [
  {
    name: 'Daftar Lokasi',
    path: '/location',
    icon: `${process.env.BASE_URL}/media/svg/icons/Map/Marker1.svg`,
  },
  {
    name: 'Daftar Jenis Aset',
    path: '/asset-types',
    icon: `${process.env.BASE_URL}/media/svg/icons/Home/Building.svg`,
  },
  {
    name: 'Logbook',
    path: '/logbooks',
    icon: `${process.env.BASE_URL}/media/svg/icons/Home/Book-open.svg`,
  },
  {
    name: 'Simbol',
    path: '/symbols',
    icon: `${process.env.BASE_URL}/media/svg/icons/General/Settings-2.svg`,
    position_ids: [1, 2, 3, 4, 5],
  },
]

export default menus
