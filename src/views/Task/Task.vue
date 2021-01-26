<template>
  <MVContent>
    <template v-slot:subheader>
      <MVSubheader title="Tugas">
        <div
          class="input-group input-group-sm input-group-solid max-w-175px my-1 mr-2 d-none d-lg-flex"
        >
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
        <div class="min-w-175px mr-2 d-none d-lg-block">
          <MVSelect2
            :items="tasksUsers"
            class="form-group-sm form-group-solid"
            liveSearch
            last
            :value="selectedUserId"
            @input="updateSelectedUserId"
          ></MVSelect2>
        </div>
        <TaskFilter></TaskFilter>
        <button
          class="btn btn-light-primary font-weight-bolder btn-sm px-4"
          @click="$refs.taskCrud.create()"
        >
          Tugas Baru
        </button>
      </MVSubheader>
    </template>
    <div class="home">
      <div class="row">
        <div class="col-md-4 col-xl-4">
          <b-card no-body class="p-1 gutter-b">
            <calendar></calendar>
          </b-card>
        </div>
        <div class="col-md-8 col-xl-8">
          <div v-if="loadTask" class="d-flex justify-content-center">
            <div class="lds-ellipsis">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
          <div v-else>
            <TaskList
              v-for="task in tasks"
              :key="task.id"
              :task="task"
              @destroy="destroyTask"
              @edit="editTask"
            ></TaskList>
          </div>
          <p
            v-if="!loadTask && !tasks.length"
            class="text-center font-weight-bold mt-5"
          >
            No Results Found
          </p>
        </div>
      </div>
    </div>
    <task-crud
      ref="taskCrud"
      :taskGoalUserId="authUser.id"
      @task-created="addTask"
      @task-updated="updateTask"
      @task-destroyed="removeTask"
    ></task-crud>
  </MVContent>
</template>

<script>
import { MVSelect2 } from 'metronic-vue'
import { BCard } from 'bootstrap-vue'
import Calendar from './Calendar.vue'
import TaskList from './TaskList.vue'
import Filter from './Filter.vue'
import TaskCrud from './TaskCrud.vue'
import {
  ADD_TASK,
  REMOVE_TASKS_BY_ID,
  UPDATE_SEARCH_QUERY,
  UPDATE_SELECTED_DATE_AND_TASKS,
  UPDATE_SELECTED_USER_ID,
  UPDATE_TASKS_BY_ID,
} from '../../store/task.module'
import { mapGetters, mapState } from 'vuex'
import { debounce } from 'debounce'
import { mapTaskFromApi } from './utils'

export default {
  name: 'Task',
  components: {
    MVSelect2,
    BCard,
    Calendar,
    TaskList,
    TaskFilter: Filter,
    TaskCrud,
  },
  data() {
    return {
      selectedDate: new Date(),
    }
  },
  mounted() {
    this.$store.dispatch(UPDATE_SELECTED_DATE_AND_TASKS, new Date())
  },
  computed: {
    ...mapState({
      selectedUserId: ({ task }) => task.selectedUserId,
      loadTask: ({ task }) => task.loadTask,
    }),
    ...mapGetters(['tasksUsers', 'tasks', 'authUser']),
  },
  methods: {
    updateSelectedUserId(id) {
      this.$store.commit(UPDATE_SELECTED_USER_ID, id)
    },
    updateSearchQuery: debounce(function(e) {
      this.$store.commit(UPDATE_SEARCH_QUERY, e.target.value)
    }, 600),
    destroyTask(task) {
      this.$refs.taskCrud.destroy(task)
    },
    addTask(task) {
      this.$store.commit(
        ADD_TASK,
        mapTaskFromApi({
          ...task,
          attachments: task.attachments.map(x => ({
            ...x,
            path: x.path.split('/storage/')[1],
          })),
        })
      )
    },
    updateTask(task) {
      this.$store.commit(
        UPDATE_TASKS_BY_ID,
        mapTaskFromApi({
          ...task,
          attachments: task.attachments.map(x => ({
            ...x,
            path: x.path.split('/storage/')[1],
          })),
        })
      )
    },
    removeTask(item) {
      this.$store.commit(REMOVE_TASKS_BY_ID, item.id)
    },
    editTask(task) {
      this.$refs.taskCrud.edit(task)
    },
  },
}
</script>
