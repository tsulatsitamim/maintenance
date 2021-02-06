<template>
  <div class="list-group-item">
    <div class="d-flex justify-content-between align-items-center">
      <span class="font-weight-bold">
        {{ title }}
      </span>
      <button
        type="button"
        data-toggle="tooltip"
        class="btn btn-icon btn-icon-sm"
        @click="toggleCollapse"
      >
        <span v-if="isCollapsed" class="svg-icon svg-icon-dark svg-icon-xs">
          <inline-svg
            :src="`${$baseUrl}media/svg/icons/Navigation/Angle-down.svg`"
            title="Open"
          >
          </inline-svg>
        </span>
        <span v-else class="svg-icon svg-icon-dark svg-icon-xs">
          <inline-svg
            :src="
              `${$baseUrl}media/svg/icons/Navigation/Stockholm-icons/Navigation/Angle-up.svg`
            "
            title="Close"
          >
          </inline-svg>
        </span>
      </button>
    </div>
    <div v-if="!isCollapsed">
      <div>Baik ({{ status.good }})</div>
      <div>Bermasalah ({{ status.hasIssue }})</div>
      <div>Rusak ({{ status.damaged }})</div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'LogStatus',
  props: {
    title: {
      type: String,
      default: '',
    },
    status: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isCollapsed: false,
    }
  },
  methods: {
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed
    },
  },
}
</script>
