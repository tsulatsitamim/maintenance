<template>
  <div class="d-lg-none">
    <button
      id="trigger"
      class="btn btn-light-primary font-weight-bolder btn-sm mr-2 px-4"
    >
      <span class="svg-icon mr-0">
        <inline-svg
          :src="`${$baseUrl}media/svg/icons/Text/Filter.svg`"
        ></inline-svg>
      </span>
      Filter
    </button>
    <portal to="topbar">
      <div
        id="kt_quick_user"
        ref="kt_quick_user"
        class="offcanvas offcanvas-right p-10"
      >
        <!--begin::Header-->
        <div
          class="offcanvas-header d-flex align-items-center justify-content-between pb-5"
        >
          <h3 class="font-weight-bold m-0">
            Filter Tugas
          </h3>
          <a
            ref="close"
            href="#"
            class="btn btn-xs btn-icon btn-light btn-hover-primary"
            id="kt_quick_user_close"
          >
            <i class="ki ki-close icon-xs text-muted"></i>
          </a>
        </div>
        <!--end::Header-->

        <perfect-scrollbar
          class="offcanvas-content pr-5 mr-n5 scroll mt-10"
          style="max-height: 90vh; position: relative;"
        >
          <div class="mb-5">
            <MVSelect2
              :items="tasksUsers"
              class="form-group-sm form-group-solid"
              liveSearch
              last
              :value="selectedUserId"
              @input="updateSelectedUserId"
            ></MVSelect2>
          </div>
          <div class="input-group input-group-sm input-group-solid mb-5">
            <input
              type="text"
              class="form-control pl-4"
              placeholder="Search..."
              @input="updateSearchQuery"
            />
            <div class="input-group-append">
              <span class="input-group-text">
                <span class="svg-icon svg-icon-md">
                  <inline-svg
                    :src="`${$baseUrl}media/svg/icons/General/Search.svg`"
                  >
                  </inline-svg>
                </span>
              </span>
            </div>
          </div>

          <button
            class="btn btn-sm btn-block btn-light-primary font-weight-bold"
            @click="$refs.close.click()"
          >
            Filter
          </button>
        </perfect-scrollbar>
      </div>
    </portal>
  </div>
</template>

<script>
import { MVSelect2 } from 'metronic-vue'
import {
  UPDATE_SEARCH_QUERY,
  UPDATE_SELECTED_USER_ID,
} from '../../store/task.module'
import { mapGetters, mapState } from 'vuex'
import { debounce } from 'debounce'

const initOffcanvas = el => {
  const _element = window.KTUtil.getById(el)

  const header = window.KTUtil.find(_element, '.offcanvas-header')
  const content = window.KTUtil.find(_element, '.offcanvas-content')

  new window.KTOffcanvas(_element, {
    overlay: true,
    baseClass: 'offcanvas',
    placement: 'right',
    closeBy: 'kt_quick_user_close',
    toggleBy: 'trigger',
  })

  window.KTUtil.scrollInit(content, {
    disableForMobile: true,
    resetHeightOnDestroy: true,
    handleWindowResize: true,
    height: function() {
      let height = parseInt(window.KTUtil.getViewPort().height)

      if (header) {
        height = height - parseInt(window.KTUtil.actualHeight(header))
        height = height - parseInt(window.KTUtil.css(header, 'marginTop'))
        height = height - parseInt(window.KTUtil.css(header, 'marginBottom'))
      }

      if (content) {
        height = height - parseInt(window.KTUtil.css(content, 'marginTop'))
        height = height - parseInt(window.KTUtil.css(content, 'marginBottom'))
      }

      height = height - parseInt(window.KTUtil.css(_element, 'paddingTop'))
      height = height - parseInt(window.KTUtil.css(_element, 'paddingBottom'))

      height = height - 2

      return height
    },
  })
}

export default {
  name: 'TaskFilter',
  components: {
    MVSelect2,
  },
  mounted() {
    setTimeout(() => {
      initOffcanvas('kt_quick_user')
    }, 100)
  },
  computed: {
    ...mapState({
      selectedUserId: ({ task }) => task.selectedUserId,
    }),
    ...mapGetters(['tasksUsers']),
  },
  methods: {
    updateSelectedUserId(id) {
      this.$store.commit(UPDATE_SELECTED_USER_ID, id)
    },
    updateSearchQuery: debounce(function(e) {
      this.$store.commit(UPDATE_SEARCH_QUERY, e.target.value)
    }, 600),
  },
}
</script>
