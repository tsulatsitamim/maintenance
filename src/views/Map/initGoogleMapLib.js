const API_KEY = process.env.VUE_APP_MAP_API
const CALLBACK_NAME = 'gmapsCallback'

export const initGoogleMapLib = () =>
  new Promise((resolve, reject) => {
    if (window.google) {
      return resolve(window.google)
    }

    window[CALLBACK_NAME] = () => resolve(window.google)

    const script = document.createElement('script')
    script.async = true
    script.defer = true
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=${CALLBACK_NAME}`
    script.onerror = reject

    document.querySelector('head').appendChild(script)
  })

export default initGoogleMapLib
