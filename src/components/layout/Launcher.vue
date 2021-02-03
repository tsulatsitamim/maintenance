<template>
  <div id="launcher" class="topbar-item">
    <b-dropdown
      size="sm"
      variant="link"
      toggle-class="btn btn-icon btn-clean btn-dropdown btn-lg mr-1 text-decoration-none"
      no-caret
      right
      no-flip
    >
      <template v-slot:button-content>
        <span class="svg-icon svg-icon-xl svg-icon-primary">
          <inline-svg
            :src="`${$baseUrl}/media/svg/icons/Layout/Layout-4-blocks.svg`"
          />
        </span>
      </template>
      <b-dropdown-text tag="div">
        <ul class="launcher navi navi-hover py-4">
          <template v-for="launcher in launchers">
            <li
              v-if="!launcher.hidden"
              :key="launcher.icon"
              class="navi-item navi-item-active"
              :class="{
                'navi-item-activex': launcher.active,
              }"
            >
              <a
                :href="launcher.link"
                class="navi-link d-flex flex-column px-2 py-3 justify-content-center"
              >
                <span class="symbol">
                  <img :src="launcher.icon" alt="" />
                </span>
                <span class="navi-text mt-2">{{ launcher.name }}</span>
              </a>
            </li>
          </template>
        </ul>
        <div class="mb-0 font-weight-bold text-center">
          <a href="/">Launcher</a>
        </div>
      </b-dropdown-text>
    </b-dropdown>
  </div>
</template>

<script>
import { BDropdownText, BDropdown } from 'bootstrap-vue'
import { mapGetters } from 'vuex'

export default {
  name: 'Launcher',
  components: { BDropdownText, BDropdown },
  data() {
    return {}
  },
  computed: {
    ...mapGetters(['authUser']),
    launchers() {
      return [
        {
          name: 'File Manager',
          icon: `${this.$baseUrl}/icon/launcher/file.svg`,
          active: true,
          link: '/file-manager',
        },
        {
          name: 'Data Entry',
          icon: `${this.$baseUrl}/icon/launcher/report.svg`,
          link: '/data-entry',
          hidden: ![
            'ka-seksi-merapi',
            'staf-seksi-merapi',
            'ka-bpptkg',
          ].includes(this.authUser.position_name),
        },
        {
          name: 'Assignment',
          icon: `${this.$baseUrl}/icon/launcher/task.svg`,
          link: '/assignment',
        },
        {
          name: 'Data Analysis',
          icon: `${this.$baseUrl}/icon/launcher/analytic.svg`,
          link: '/data-analysis',
          hidden: ![
            'ka-seksi-merapi',
            'staf-seksi-merapi',
            'ka-bpptkg',
          ].includes(this.authUser.position_name),
        },
        {
          name: 'Display Device',
          icon: `${this.$baseUrl}/icon/launcher/display.svg`,
          link: '/display-device',
          hidden: ![
            'ka-seksi-merapi',
            'staf-seksi-merapi',
            'ka-bpptkg',
          ].includes(this.authUser.position_name),
        },
        {
          name: 'Maintenance',
          icon: `${this.$baseUrl}/icon/launcher/maintenance.svg`,
          link: '/maintenance',
          hidden: ![
            'ka-seksi-merapi',
            'staf-seksi-merapi',
            'ka-bpptkg',
          ].includes(this.authUser.position_name),
        },
        {
          name: 'Broadcast',
          icon: `${this.$baseUrl}/icon/launcher/broadcast.jpg`,
          link: '/broadcasting',
          hidden: ![
            'ka-seksi-merapi',
            'staf-seksi-merapi',
            'ka-bpptkg',
          ].includes(this.authUser.position_name),
        },
        {
          name: 'Gallery',
          icon: `${this.$baseUrl}/icon/launcher/gallery.jpg`,
          link: '/gallery',
        },
        {
          name: 'LIMS',
          icon: `${this.$baseUrl}/icon/launcher/beaker.png`,
          link: '/lims',
          hidden: ![
            'ka-seksi-pl',
            'staf-seksi-pl',
            'ka-bpptkg',
            'ka-bpptkg',
          ].includes(this.authUser.position_name),
        },
      ]
    },
  },
}
</script>

<style lang="scss">
#launcher {
  @media (max-width: 600px) {
    .dropdown-menu {
      width: auto;
    }
  }
  .launcher.navi {
    display: grid;
    grid-template-columns: repeat(3, 95px);

    .navi-item .navi-link .navi-text {
      font-size: 0.85rem;
    }

    .navi-item .navi-link .symbol {
      width: 50px;
      height: 50px;
      opacity: 0.9;
    }
  }
}
</style>
