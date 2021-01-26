<template>
  <div class="d-lg-none">
    <button
      id="trigger"
      v-b-toggle.filter
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
      <BSidebar
        id="filter"
        title="Filter Tugas"
        bg-variant="white"
        right
        shadow
        backdrop
      >
        <!-- <div id="filter" ref="filter" class="offcanvas offcanvas-right p-10"> -->
        <perfect-scrollbar
          class="pr-5 mr-n5 scroll mt-10"
          style="max-height: 90vh; position: relative;"
        >
          <div class="px-5">
            <MVButtonDaterangePicker
              class="mb-5"
              :value="date"
              @input="$emit('date-changed', $event)"
            ></MVButtonDaterangePicker>
            <div class="mb-5">
              <MVSelect2
                :items="departments"
                class="form-group-sm form-group-solid"
                liveSearch
                last
                :value="selectedDepartmentId"
                @input="$emit('selected-department-id', $event)"
              ></MVSelect2>
            </div>
            <div class="input-group input-group-sm input-group-solid mb-5">
              <input
                type="text"
                class="form-control pl-4"
                placeholder="Search..."
                @input="$emit('search', $event.target.value)"
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
              v-b-toggle.filter
            >
              Filter
            </button>
          </div>
        </perfect-scrollbar>
        <!-- </div> -->
      </BSidebar>
    </portal>
  </div>
</template>

<script>
import { MVSelect2, MVButtonDaterangePicker } from 'metronic-vue'
import { VBToggle, BSidebar } from 'bootstrap-vue'

export default {
  name: 'TaskFilter',
  components: {
    MVSelect2,
    MVButtonDaterangePicker,
    BSidebar,
  },
  props: {
    departments: { type: Array, required: true },
    selectedDepartmentId: { required: true },
    date: { type: Object, required: true },
  },
  directives: { 'b-toggle': VBToggle },
}
</script>

<style lang="scss">
.select2 {
  width: 100% !important;
}
</style>
