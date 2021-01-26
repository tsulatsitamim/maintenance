<template>
  <div id="app" class="d-flex flex-column flex-root">
    <portal-target name="topbar"></portal-target>
    <MVHeaderMobile>
      <HeaderMenu :user="authUser"></HeaderMenu>
    </MVHeaderMobile>
    <!-- <MVLoader :logo="loaderLogo"></MVLoader> -->
    <div class="d-flex flex-row flex-column-fluid page">
      <MVAside v-if="asideEnabled">
        <MVMenu :menus="menus"></MVMenu>
      </MVAside>
      <div id="kt_wrapper" class="d-flex flex-column flex-row-fluid wrapper">
        <MVHeader>
          <HeaderMenu :user="authUser"></HeaderMenu>
        </MVHeader>
        <router-view />
        <MVFooter title="BPPTKG"></MVFooter>
      </div>
    </div>
    <MVScrollTop></MVScrollTop>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { HtmlClass, MVUserTopbar, MVLoader } from 'metronic-vue'
import HeaderMenu from './components/layout/HeaderMenu'
import menus from './router/menus'

export default {
  name: 'app',
  // eslint-disable-next-line vue/no-unused-components
  components: { MVUserTopbar, MVLoader, HeaderMenu },
  data() {
    return {
      menus,
      loaderLogo: `${this.$baseUrl}logo.png`,
    }
  },
  beforeMount() {
    // initialize html element classes
    HtmlClass.init(this.layoutConfig())
  },
  computed: {
    ...mapGetters(['layoutConfig', 'authUser']),

    /**
     * Set the subheader display
     * @returns {boolean}
     */
    subheaderDisplay() {
      return !!this.layoutConfig('subheader.display')
    },

    /**
     * Check if the left aside menu is enabled
     * @returns {boolean}
     */
    asideEnabled() {
      return !!this.layoutConfig('aside.self.display')
    },
  },
}
</script>

<style lang="scss">
@import '~daterangepicker/daterangepicker.css';
@import '~select2/dist/css/select2.css';
@import '~metronic-vue/dist/style.css';
@import '~metronic-vue/dist/assets/plugins/keenthemes-icons/font/ki.css';
@import '~lightgallery/dist/css/lightgallery.min.css';
@import './assets/scss/style.scss';
</style>
