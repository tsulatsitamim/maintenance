export const populateInfoWindow = (map, marker, infowindow) => {
  const avatar = `<div class="map-avatar"><img src="${marker.properties.avatar}" alt="Foto Entitas"></div>`
  const address = `<div class="icon-info mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="feather feather-map"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
        <span class="ml-2">${marker.properties.address}</span>
      </div>`

  const locationtLinks = `
    <div class="view-link mt-3">
      <a target="_blank" href="${process.env.BASE_URL}locations/${marker.properties.id}/logbooks">Logbook</a>
      <a class="ml-2" target="_blank" href="${process.env.BASE_URL}locations/${marker.properties.id}/assets">Aset</a>
      <a class="ml-2 edit-action" target="_blank" href="#" data-type="location" data-id="${marker.properties.id}">Edit</a>
    </div>`

  const assetLinks = `
    <div class="view-link mt-3">
      <a class="ml-2 edit-action" target="_blank" href="#" data-type="asset" data-id="${
        marker.properties.id
      }">Edit</a>
      ${
        marker.properties.ip
          ? `
      <a class="ml-2 refresh-action" target="_blank" href="#" data-type="asset" data-id="${marker.properties.id}">Refresh</a>
      <div id="refresh-spinner" class="d-none ml-3 spinner-border spinner-border-sm text-primary" role="status">
        <span class="sr-only">Loading...</span>
      </div>
      `
          : ''
      }
    </div>`

  const content = `
    <div class="infowindow">
      ${marker.properties.avatar ? avatar : ''}
      <div class="info">
        <div class="title">
          <h6>${marker.properties.title || 'Untitled'}</h6>
          ${
            marker.properties.ip && marker.properties.is_online !== null
              ? `<div id="status" class="${
                  marker.properties.is_online ? '' : 'offline'
                }">${marker.properties.is_online ? 'Online' : 'Offline'}</div>`
              : ''
          }
        </div>
        <p>${marker.properties.description || 'No description.'}</p>
        ${marker.properties.address ? address : ''}
        <div class="icon-info">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="feather feather-map-pin"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          <span class="ml-2">${marker.properties.coordinates}</span>
        </div>
        ${marker.properties.type === 'location' ? locationtLinks : assetLinks}
      </div>
    </div>
    `

  infowindow.setContent(content)
  infowindow.open(map, marker)
}

export default populateInfoWindow
