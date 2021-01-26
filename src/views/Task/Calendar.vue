<template>
  <v-date-picker
    ref="calendar"
    is-expanded
    color="orange"
    :attributes="calendarTasks"
    :locale="locale"
    @update:to-page="updatePage"
    :value="selectedDate"
    @input="updateSelectedDate"
  />
</template>

<script>
import VDatePicker from 'v-calendar/lib/components/date-picker.umd'
import { mapState } from 'vuex'
import {
  GET_CALENDAR_TASKS,
  UPDATE_SELECTED_DATE_AND_TASKS,
} from '../../store/task.module'

export default {
  name: 'Calendar',
  components: {
    VDatePicker,
  },
  data() {
    return {
      locale: {
        id: 'id',
        firstDayOfWeek: 2,
      },
    }
  },
  computed: {
    ...mapState({
      selectedDate: state => state.task.selectedDate,
      calendarTasks: state => state.task.calendarTasks,
    }),
  },
  methods: {
    updateSelectedDate(date) {
      this.$store.dispatch(UPDATE_SELECTED_DATE_AND_TASKS, date)
    },
    updatePage(page) {
      this.$store.dispatch(GET_CALENDAR_TASKS, page)
    },
  },
}
</script>

<style lang="scss">
.vc-container {
  font-family: Poppins !important;
  border: none !important;

  .vc-title {
    font-weight: 500 !important;
  }

  .vc-weekday {
    font-weight: 500 !important;
  }

  .vc-grid-container {
    gap: 8px 0px !important;
  }

  .vc-dots {
    bottom: -6px;
    position: absolute;
  }

  .vc-header,
  .vc-arrows-container {
    padding-top: 1.5em !important;
    padding-bottom: 1.5em !important;
  }

  .vc-day-content {
    border-radius: 0.25rem;
    height: 38px;
    width: 38px;

    &:focus {
      background: none;
      color: rgb(26, 32, 44);
    }
  }

  .vc-highlight {
    border-radius: 0.25rem !important;
    background: #6699ff !important;
    height: 38px;
    width: 38px;
  }
}

.vdp-datepicker__calendar .cell.selected {
  border-radius: 0.25rem !important;
  background: #6699ff !important;
  font-weight: 600;
  color: #ffffff;
}
</style>
