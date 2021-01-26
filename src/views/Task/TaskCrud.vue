<template>
  <b-modal
    v-model="modalShow"
    :title="task.id ? 'Edit Tugas' : 'Buat Tugas'"
    size="lg"
    @ok="handleOk"
    @shown="startAutoSave"
    @hidden="clearAutoSaveInterval"
  >
    <b-form-group label="Status:" v-slot="{ ariaDescribedby }">
      <b-form-radio-group
        v-model="task.status"
        :options="[
          { value: 'ongoing', text: 'Berlangsung' },
          { value: 'completed', text: 'Selesai' },
          { value: 'cancelled', text: 'Dibatalkan' },
        ]"
        :aria-describedby="ariaDescribedby"
        name="status"
        plain
      ></b-form-radio-group>
    </b-form-group>

    <MVSelect2
      label="Jenis Tugas (Wajib Diisi)"
      v-model="task.assignment_id"
      name="assignment_id"
      :items="taskTypes"
      placeholder="Pilih jenis tugas"
      liveSearch
      class=""
    ></MVSelect2>
    <b-form-group v-if="task.assignment_id == 1" label-for="name">
      <b-form-input
        v-model="task.name"
        name="letter_number"
        id="name"
      ></b-form-input>
    </b-form-group>

    <b-form-group label="Deskripsi Kegiatan:" label-for="description-input">
      <b-form-input
        name="description"
        id="description-input"
        v-model="task.description"
        placeholder="Tuliskan deskripsi kegiatan"
      ></b-form-input>
    </b-form-group>

    <MVSelect2
      label="Lokasi (Wajib Diisi)"
      v-model="task.location"
      name="location"
      :items="locations"
      placeholder="Pilih lokasi"
      liveSearch
      tags
    ></MVSelect2>

    <b-form-group label="Dasar Pelaksanaan:" label-for="letter-input">
      <b-form-input
        name="letter_number"
        id="letter-input"
        v-model="task.letter_number"
        placeholder="Tuliskan dasar pelaksanaan"
      ></b-form-input>
    </b-form-group>

    <b-form-group
      label="Tanggal Mulai Pelaksanaan (Wajib Diisi):"
      label-for="due_at"
    >
      <datepicker
        v-model="task.due_at"
        format="dd MMMM yyyy"
        name="due_at"
        :language="id"
        :value="task.due_at"
        input-class="form-control"
        @input="updateTaskEnd"
      ></datepicker>
    </b-form-group>

    <b-form-group label="Tanggal Selesai Pelaksanaan:" label-for="end_at">
      <datepicker
        v-model="task.end_at"
        format="dd MMMM yyyy"
        name="end_at"
        :language="id"
        :value="task.end_at"
        input-class="form-control"
        @input="updateTaskDue"
      ></datepicker>
    </b-form-group>

    <MVSelect2
      label="Pemberi Tugas"
      v-model="task.assignor_id"
      name="assignor_id"
      :items="users"
      placeholder="Pilih pemberi tugas"
      liveSearch
    ></MVSelect2>

    <b-form-group label="Personil Yang Ditugaskan:" class="mb-0">
      <ol>
        <li v-for="(member, index) in task.members" :key="member.id">
          <span>{{ member.name }}</span>
          <span>
            <button
              type="button"
              class="btn btn-sm btn-text-dark btn-hover-light-dark btn-icon ml-3"
              title="Hapus"
              @click="removeMember(index)"
            >
              <BIconTrash font-scale="1"></BIconTrash>
            </button>
          </span>
        </li>
      </ol>
    </b-form-group>
    <MVSelect2
      v-model="newMemberUserId"
      name="add_member"
      :items="notMembers"
      placeholder="Tambah Personil"
      liveSearch
      @input="addMember"
    ></MVSelect2>

    <b-form-group label="Period Kontrak:" label-for="goal_period">
      <datepicker
        v-model="task.goal_period"
        format="MMMM yyyy"
        name="goal_period"
        :language="id"
        minimum-view="month"
        input-class="form-control"
        @input="getGoals"
      ></datepicker>
    </b-form-group>

    <MVSelect2
      label="Nama Kontrak:"
      v-model="task.goal_id"
      name="goal_id"
      :items="goals"
      placeholder="Pilih kontrak jika masuk kontrak"
      liveSearch
    ></MVSelect2>

    <b-form-group
      v-if="task.goal_id"
      :label="`Volume ${volumeOutput}:`"
      label-for="volume"
    >
      <b-form-input
        v-model="task.volume"
        name="letter_number"
        id="volume"
        type="number"
      ></b-form-input>
    </b-form-group>

    <b-form-group label="Lampiran/Foto Tugas:" label-for="attachment_input">
      <ol style="padding-left: 1rem">
        <li
          v-for="(attachment, index) in task.attachments"
          :key="attachment.id"
        >
          <div>
            <span>{{ attachment.name }}</span>
            <span>{{ attachment.created_at }}</span>
            <span>
              <button
                type="button"
                class="btn btn-sm btn-text-dark btn-hover-light-dark btn-icon ml-3"
                title="Hapus"
                @click="removeAttachment(index)"
              >
                <BIconTrash font-scale="1"></BIconTrash>
              </button>
            </span>
          </div>
          <div v-if="attachment.is_image" class="image-attachment mb-3">
            <div>
              <img
                :src="attachment.path"
                width="170"
                class="img-thumbnail"
                :alt="attachment.name"
              />
              <b-form-checkbox
                class="mt-3"
                v-model="attachment.type"
                :id="'checkbox' + attachment.id"
                :name="'checkbox' + attachment.id"
                switch
                size="md"
              >
                Masukkan ke Laporan
              </b-form-checkbox>
            </div>
            <div class="action">
              <b-form-group style="flex-grow:1" class="pr-2 ml-4">
                <BFormTextarea
                  v-if="attachment.type"
                  v-model="attachment.description"
                  placeholder="Deskripsi"
                  rows="3"
                ></BFormTextarea>
              </b-form-group>
            </div>
          </div>
        </li>
      </ol>

      <div class="custom-file">
        <input
          id="attachment_input"
          type="file"
          class="custom-file-input"
          @change="addAttachment($event)"
        />
        <label class="custom-file-label" for="attachment_input">
          Pilih Lampiran/Foto
        </label>
      </div>
    </b-form-group>

    <b-form-group label="Catatan Kegiatan / Laporan">
      <ckeditor
        ref="editor"
        v-model="task.report"
        :editor="input.editor"
        :config="input.editorConfig"
        @ready="setData"
      ></ckeditor>
    </b-form-group>

    <b-form-group v-if="uploading">
      <b-progress :value="uploadProgress" max="100"></b-progress>
    </b-form-group>
  </b-modal>
</template>

<script>
import {
  BModal,
  BFormGroup,
  BFormRadioGroup,
  BFormInput,
  BIconTrash,
  BFormTextarea,
  BFormCheckbox,
  BProgress,
} from 'bootstrap-vue'
import cloneDeep from 'clone-deep'
import moment from 'moment'
import { MVSelect2 } from 'metronic-vue'
import Axios from 'axios'
import { id } from 'vuejs-datepicker/dist/locale'
import Datepicker from 'vuejs-datepicker'
import { pluck } from 'ramda'
import pick from 'ramda/src/pick'
import CKEditor from '@ckeditor/ckeditor5-vue2'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import jsonToFormData from 'json-form-data'
import { taskMapper } from './utils'

const emptyTask = {
  id: null,
  status: 'ongoing',
  assignment_id: null,
  description: null,
  location: 'BPPTKG',
  name: '',
  letter_number: null,
  due_at: new Date(),
  end_at: new Date(),
  assignor_id: null,
  members: [],
  goal_period: new Date(),
  goal_id: null,
  volume: 1,
  attachments: [],
  report: '<p>&nbsp;</p>',
}

export default {
  name: 'TaskCrud',
  components: {
    BModal,
    BFormGroup,
    BFormRadioGroup,
    BFormInput,
    MVSelect2,
    Datepicker,
    BIconTrash,
    BFormTextarea,
    BFormCheckbox,
    ckeditor: CKEditor.component,
    BProgress,
  },
  props: {
    taskGoalUserId: { required: true },
    selectedPeriod: { type: String },
  },
  data() {
    return {
      id,
      autoSaveInterval: null,
      modalShow: false,
      task: cloneDeep(emptyTask),
      taskTypes: [],
      locations: [],
      users: [],
      goals: [],
      newMemberUserId: null,
      input: {
        editor: ClassicEditor,
        editorConfig: {
          removePlugins: ['MediaEmbed'],
          toolbar: [
            'undo',
            'redo',
            '|',
            'bold',
            'italic',
            'link',
            'bulletedList',
            'numberedList',
            'blockQuote',
            '|',
            'heading',
          ],
        },
      },
      uploading: false,
      uploadProgress: 0,
    }
  },
  mounted() {
    this.getTaskType()
    this.getLocations()
    this.getUsers()
    this.getGoals()

    emptyTask.members = [this.$store.getters.authUser]
  },
  computed: {
    notMembers() {
      const memberIds = pluck('id', this.task.members)
      return this.users.filter(user => !memberIds.includes(user.id))
    },
    volumeOutput() {
      const goal = this.goals.find(
        goal => goal.id === Number(this.task.goal_id)
      )
      if (goal) {
        return `(${goal.output})`
      }
      return ''
    },
  },
  methods: {
    show() {
      this.modalShow = true
    },
    hide() {
      this.modalShow = false
    },
    create() {
      this.show()
      this.task = cloneDeep(emptyTask)
    },
    edit(task) {
      this.show()
      this.task = taskMapper(task)
      if (task.user_task_goal) {
        this.goals = [task.user_task_goal.goal]
      }

      this.getGoals()
    },
    async getTaskType() {
      const { data } = await Axios.get('/api/v2/task-types')
      this.taskTypes = data
    },
    async getLocations() {
      const { data } = await Axios.get(`/api/v2/task-locations`)
      this.locations = data.map(x => ({ id: x.name, name: x.name }))
    },
    async getUsers() {
      const { data: users } = await Axios.get('/api/v2/users?department=true')
      this.users = users

      const { data: authUser } = await Axios.get('/user')
      const assignor = this.users.find(
        user =>
          Number(user.department_position_id) ===
          Number(authUser.department_position.manager_id)
      )

      if (assignor) {
        emptyTask.assignor_id = assignor.id
        this.task.assignor_id = assignor.id
      }
    },
    async getGoals() {
      const { data } = await Axios.get(
        `/api/v2/goal-validations?user_id=${
          this.$store.getters.authUser.id
        }&period=${moment(this.task.goal_period).format(
          'YYYY-MM-01'
        )}&goals=true&verified=true`
      )

      this.goals = data.goals
        ? data.goals.map(goal => pick(['id', 'name', 'output'], goal))
        : [
            {
              id: null,
              name:
                'Anda tidak memiliki kontrak yang telah disetujui untuk periode terpilih',
            },
          ]
    },
    updateTaskEnd(dueAt) {
      if (
        moment(dueAt.toISOString().substring(0, 10)).isAfter(
          this.task.end_at.toISOString().substring(0, 10)
        )
      ) {
        this.task.end_at = dueAt
      }
    },
    updateTaskDue(endAt) {
      if (
        moment(endAt.toISOString().substring(0, 10)).isBefore(
          this.task.due_at.toISOString().substring(0, 10)
        )
      ) {
        alert('Tanggal selesai tidak bisa kurang dari tanggal mulai')
        setTimeout(() => {
          this.task.end_at = this.task.due_at
        }, 100)
      }
    },
    removeMember(index) {
      this.task.members.splice(index, 1)
    },
    addMember(id) {
      this.newMemberUserId = ''
      const user = this.users.find(user => user.id === Number(id))
      this.task.members.push(user)
    },
    addAttachment(e, type) {
      const file = e.target.files[0]
      const is_image = /\.(jpe?g|png|gif|bmp|webp)$/i.test(file.name)

      const FR = new FileReader()
      FR.addEventListener('load', ({ target }) => {
        this.task.attachments.push({
          id: Date.now(),
          name: file.name,
          path: target.result,
          is_image,
          file,
          type,
        })
      })

      return FR.readAsDataURL(file)
    },
    removeAttachment(index) {
      this.task.attachments.splice(index, 1)
    },
    setData() {
      this.task.report = `${this.task.report} `
    },
    handleOk(bvModalEvt) {
      bvModalEvt.preventDefault()
      this.save()
    },
    async save(autosave = false) {
      const vm = this

      if (autosave) {
        if (
          !this.task.assignment_id ||
          !this.task.location ||
          !this.task.due_at ||
          !this.task.assignor_id ||
          !this.task.members.length
        ) {
          return
        }
      }

      if (!this.task.assignment_id) {
        return alert('Jenis tugas harus di isi!')
      }

      if (!this.task.location) {
        return alert('Lokasi harus di isi!')
      }

      if (!this.task.due_at) {
        return alert('Tanggal pelaksanaan harus di isi!')
      }

      if (!this.task.assignor_id) {
        return alert('Pemberi tugas harus diisi!')
      }

      if (!this.task.members.length) {
        return alert('Personil harus di isi!')
      }

      const taskName =
        Number(this.task.assignment_id) === 1
          ? this.task.name
          : this.taskTypes.find(x => x.id === Number(this.task.assignment_id))
              .name

      const payload = {
        ...pick(
          [
            'id',
            'name',
            'location',
            'letter_number',
            'description',
            'assignor_id',
            'status',
            'assignment_id',
            'goal_id',
          ],
          this.task
        ),
        name: taskName,
        due_at: moment(this.task.due_at).format('YYYY-MM-DD'),
        end_at: moment(this.task.end_at).format('YYYY-MM-DD'),
        members: this.task.members.reduce(
          (prev, next, index) => ({ ...prev, [next.id]: { index } }),
          {}
        ),
        attachments: this.task.attachments
          .filter(attachment => !attachment.file)
          .map(attachment => ({
            ...attachment,
            type: attachment.type ? 2 : 1,
          })),
        new_attachment: this.task.attachments
          .filter(attachment => attachment.file)
          .map(attachment => ({
            ...attachment,
            type: attachment.type ? 2 : 1,
          })),
        volume: this.task.goal_id ? this.task.volume : 'null',
        report:
          this.task.report === '<p>&nbsp;</p>' ? 'null' : this.task.report,
        task_goal_user_id: this.taskGoalUserId,
      }

      const form = jsonToFormData(payload)
      try {
        this.uploading = true
        if (payload.id) {
          form.append('_method', 'patch')
          const { data } = await Axios.post(
            `/api/v2/tasks/${this.task.id}`,
            form,
            {
              onUploadProgress(event) {
                vm.uploadProgress = Math.round(
                  (event.loaded * 100) / event.total
                )
              },
            }
          )
          // this.task = taskMapper(data)
          this.$emit('task-updated', data)
        } else {
          const { data } = await Axios.post(`/api/v2/tasks`, form, {
            onUploadProgress(event) {
              vm.uploadProgress = Math.round((event.loaded * 100) / event.total)
            },
          })
          this.task.id = data.id
          this.task.user = data.user
          this.$emit('task-created', data)
        }
        this.$emit('updated')
        if (autosave) {
          this.$toast('Autosave.')
        } else {
          this.modalShow = false
          this.$toast('Tugas anda telah berhasil disimpan.')
        }
        this.getLocations()
        if (!autosave) {
          this.modalShow = false
        }
      } catch (error) {
        this.$toast(error, 'danger')
      }
      this.uploading = false
    },
    async destroy(task) {
      if (window.confirm('Hapus Tugas?')) {
        try {
          await Axios.delete(`/api/v2/tasks/${task.id}`)
          this.$toast('Tugas anda telah dihapus.')
          this.$emit('task-destroyed', task)
        } catch (error) {
          this.$toast(error, 'danger')
        }
      }
    },
    startAutoSave() {
      if (this.viewModal) {
        return
      }
      this.autoSaveInterval = setInterval(() => {
        this.save(true)
      }, 1000 * 50 * 1)
      // }, 1000 * 60 * 5)
    },
    clearAutoSaveInterval() {
      clearInterval(this.autoSaveInterval)
    },
  },
}
</script>

<style lang="scss">
.image-attachment {
  display: flex;
  align-items: start;
  margin-top: 10px;

  .action {
    display: flex;
    align-items: flex-start;
    flex-grow: 1;
  }
}

.img-thumbnail {
  padding: 0.25rem;
  background-color: #fff;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;

  max-width: 100%;
  height: auto;
}
</style>
