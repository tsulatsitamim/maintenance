<template>
  <div class="d-flex align-items-center">
    <Launcher></Launcher>
    <MVUserTopbar :user="user">
      <!-- <li class="navi-item">
        <a href="#" class="navi-link">
          <span class="navi-text">Edit Profil</span>
        </a>
      </li>
      <li class="navi-item">
        <a href="#" class="navi-link">
          <span class="navi-text">Ganti Password</span>
        </a>
      </li> -->
      <li class="navi-item">
        <a href="/" class="navi-link" @click.prevent="logout">
          <span class="navi-text">Keluar</span>
        </a>
      </li>
    </MVUserTopbar>
  </div>
</template>

<script>
import { MVUserTopbar } from 'metronic-vue'
import Launcher from './Launcher.vue'
import axios from 'axios'

export default {
  name: 'HeaderMenu',
  props: {
    user: {
      required: true,
    },
  },
  components: { MVUserTopbar, Launcher },
  methods: {
    async logout() {
      try {
        await axios.post(`/logout`)
        window.location.href = '/'
      } catch (error) {
        this.$toast('Gagal logout', 'danger')
      }
    },
  },
}
</script>
