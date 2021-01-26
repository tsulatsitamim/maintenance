<template>
  <b-card class="gutter-b task-list">
    <div
      class="text-dark text-hover-primary font-size-h5 font-weight-bold task-title d-flex justify-content-between align-items-top"
    >
      <div
        class="task-bar"
        :class="task.status"
        v-b-toggle="`collapse-${task.id}`"
      >
        {{ task.name }}
      </div>
      <div class="d-flex flex-no-wrap">
        <button
          class="btn btn-icon btn-light btn-hover-primary btn-sm mx-3"
          @click="$emit('edit', task)"
        >
          <span class="svg-icon svg-icon-md svg-icon-primary">
            <inline-svg
              title="Edit"
              :src="`${$baseUrl}media/svg/icons/Design/Edit.svg`"
            >
            </inline-svg>
          </span>
        </button>
        <button
          class="btn btn-icon btn-light btn-hover-primary btn-sm"
          @click="$emit('destroy', task)"
        >
          <span class="svg-icon svg-icon-md svg-icon-primary">
            <inline-svg
              title="Hapus"
              :src="`${$baseUrl}media/svg/icons/Home/Trash.svg`"
            >
            </inline-svg>
          </span>
        </button>
      </div>
    </div>

    <div>
      <div class="d-flex flex-wrap my-3">
        <a
          href="#"
          class="text-hover-primary text-muted font-weight-bold mr-lg-8 mr-5 my-1"
          v-b-tooltip.html.bottom="task.members.map(x => x.name).join('<br/>')"
          @click.prevent
        >
          <span class="svg-icon svg-icon-md mr-1">
            <inline-svg
              :src="`${$baseUrl}media/svg/icons/Communication/Group.svg`"
            >
            </inline-svg>
          </span>
          {{ task.members | formatMembers }}
        </a>
        <a
          href="#"
          class="text-hover-primary text-muted font-weight-bold mr-lg-8 mr-5 my-1"
          @click.prevent
        >
          <span class="svg-icon svg-icon-md mr-1">
            <inline-svg :src="`${$baseUrl}media/svg/icons/Home/Timer.svg`">
            </inline-svg>
          </span>
          {{ task.duration }}
        </a>
        <a
          href="#"
          class="text-hover-primary text-muted font-weight-bold mr-lg-8 mr-5 my-1"
          @click.prevent
        >
          <span class="svg-icon svg-icon-md mr-1">
            <inline-svg :src="`${$baseUrl}media/svg/icons/Map/Marker1.svg`">
            </inline-svg>
          </span>
          {{ task.location }}
        </a>
      </div>
      <div class="font-weight-bold text-dark-50 mr-5 mt-3">
        {{ task.description }}
      </div>
      <div class="mt-6">
        <b-collapse :id="`collapse-${task.id}`">
          <div class="d-flex flex-wrap">
            <div class="mr-12 d-flex flex-column mb-10">
              <span class="font-weight-bolder mb-2">Kontrak</span>
              <span class="font-weight-bolder font-size-lg pt-1 text-dark-50">{{
                task.user_task_goal ? `${task.user_task_goal.goal.name}` : '-'
              }}</span>
            </div>
            <div class="mr-12 d-flex flex-column mb-10">
              <span class="font-weight-bolder mb-2">Volume</span>
              <span class="font-weight-bolder font-size-lg pt-1 text-dark-50">
                {{
                  task.user_task_goal
                    ? `${task.user_task_goal.volume} ${task.user_task_goal.goal.output}`
                    : '-'
                }}</span
              >
            </div>
            <div class="mr-12 d-flex flex-column mb-10">
              <span class="font-weight-bolder mb-2">Target</span>
              <span class="font-weight-bolder font-size-lg pt-1 text-dark-50">
                {{
                  task.user_task_goal
                    ? `${task.user_task_goal.goal.quantity} ${task.user_task_goal.goal.output}`
                    : '-'
                }}</span
              >
            </div>
            <div class="mr-12 d-flex flex-column mb-10">
              <span class="font-weight-bolder mb-2">Pemberi Tugas</span>
              <span class="font-weight-bolder font-size-lg pt-1 text-dark-50">
                {{ task.assignor.name }}</span
              >
            </div>
            <div class="mr-12 d-flex flex-column mb-10">
              <span class="font-weight-bolder mb-2">Dibuat Oleh</span>
              <span class="font-weight-bolder font-size-lg pt-1 text-dark-50">
                {{ task.assignor.name }}</span
              >
            </div>
            <div class="mr-12 d-flex flex-column mb-10">
              <span class="font-weight-bolder mb-2"
                >Personil yang Ditugaskan</span
              >
              <ol class="pl-4">
                <li
                  v-for="member in task.members"
                  :key="member.id"
                  class="font-weight-bolder font-size-lg text-dark-50"
                >
                  {{ member.name }}
                </li>
              </ol>
            </div>
          </div>
          <task-attachments :task="task"></task-attachments>
        </b-collapse>
        <button
          v-b-toggle="`collapse-${task.id}`"
          class="btn btn-sm btn-block btn-light-primary font-weight-bold "
        >
          <span class="when-open">Close</span
          ><span class="when-closed">Detail Tugas</span>
        </button>
      </div>
    </div>
  </b-card>
</template>

<script>
import { BCard, BCollapse, VBToggle, VBTooltip } from 'bootstrap-vue'
import TaskAttachments from './TaskAttachments.vue'

export default {
  name: 'TaskList',
  directives: { 'b-tooltip': VBTooltip, 'b-toggle': VBToggle },
  props: {
    task: {
      type: Object,
      required: true,
    },
  },
  filters: {
    formatMembers(members) {
      const numMembers = members.length
      if (numMembers === 0) {
        return ''
      } else if (numMembers === 1) {
        return members[0].name
      } else if (numMembers === 2) {
        return `${members[0].name} dan ${members[1].name}`
      } else if (numMembers > 2 && numMembers < 4) {
        return members.map(member => member.name).join(', ')
      } else {
        const memberNames = members.map(member => member.name)
        return `${memberNames.slice(0, 3).join(', ')} dan ${numMembers -
          3} lainnya`
      }
    },
  },
  components: {
    BCard,
    BCollapse,
    TaskAttachments,
  },
  methods: {},
}
</script>

<style lang="scss">
.task-thumbnail-link {
  .overlay {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100%;
    width: 100%;
    opacity: 0;
    transition: 0.5s ease;
    background-color: #000000;
  }

  &:hover {
    .overlay {
      opacity: 0.3;
    }
  }
}

.task-title {
  position: relative;

  .task-bar {
    &:focus {
      outline: none;
    }

    &.ongoing {
      &::after {
        border-color: #ffa800;
      }
    }

    &.completed {
      &::after {
        border-color: #1bc5bd;
      }
    }

    &.cancelled {
      &::after {
        border-color: #f64e60;
      }
    }

    &::after {
      content: ' ';
      position: absolute;
      display: block;
      width: 20px;
      border: 2px solid;
      border-radius: 4px;
      box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.05);
      left: 10px;
      transform: translateX(-50%);
      margin-top: 2px;
    }
  }
}

.collapsed > .when-open,
.not-collapsed > .when-closed {
  display: none;
}

.task-list {
  .btn.not-collapsed {
    color: #f64e60 !important;
    background-color: #ffe2e5 !important;
  }
}
</style>
