import 'pusher-js'
import Echo from 'laravel-echo'
import axios from 'axios'

// window.Pusher = require('pusher-js');
;(async function() {
  const { data } = await axios.get(`/csrf-token`)
  window.Echo = new Echo({
    broadcaster: 'pusher',
    key: process.env.VUE_APP_PUSHER_APP_KEY,
    cluster: process.env.VUE_APP_PUSHER_APP_CLUSTER,
    encrypted: true,
    auth: {
      headers: {
        'X-CSRF-TOKEN': data,
      },
    },
  })
})()
