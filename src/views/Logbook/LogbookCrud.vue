<template>
  <MVContent>
    <template v-slot:subheader>
      <MVSubheader :title="title">
        <button
          class="btn btn-light-danger font-weight-bolder btn-sm mr-2"
          @click="back()"
          :disabled="uploadProgress !== 0"
        >
          Kembali
        </button>
        <button
          class="btn btn-light-primary font-weight-bolder btn-sm"
          @click="save"
          :disabled="uploadProgress !== 0"
        >
          <b-spinner v-if="uploadProgress !== 0" @click="save"></b-spinner>
          Simpan
        </button>
      </MVSubheader>
    </template>
    <div class="home">
      <div class="row">
        <div class="col-12">
          <b-card>
            <TaskCrud
              ref="taskCrud"
              :taskGoalUserId="authUser.id"
              @location-updated="updateAssets"
            ></TaskCrud>
            <BTableSimple responsive striped>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Kode Alat</th>
                  <th>Kondisi Sebelum</th>
                  <th>Tindakan</th>
                  <th>Kondisi Setelah</th>
                  <th>Keterangan</th>
                  <th>Lampiran</th>
                  <th class="text-center">
                    <span class="svg-icon svg-icon-dark svg-icon-sm">
                      <inline-svg
                        :src="`${$baseUrl}media/svg/icons/Files/Upload.svg`"
                      >
                      </inline-svg>
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <template v-for="group in Object.keys(assets).sort()">
                  <tr :key="group">
                    <th colspan="8" class="text-dark">{{ group }}</th>
                  </tr>
                  <tr v-for="(asset, i) in assets[group]" :key="asset.id">
                    <td class="align-middle">{{ asset.name }}</td>
                    <td class="align-middle">{{ asset.code }}</td>
                    <td class="align-middle">{{ asset.prev_status }}</td>
                    <td class="align-middle">
                      <b-form-select
                        v-model="asset.type"
                        :options="actions"
                        size="sm"
                      ></b-form-select>
                    </td>
                    <td class="align-middle">
                      <b-form-select
                        v-model="asset.status"
                        :options="conditions"
                        size="sm"
                      ></b-form-select>
                    </td>
                    <td class="py-0 align-middle">
                      <b-form-input
                        v-model="asset.note"
                        size="sm"
                      ></b-form-input>
                    </td>
                    <td class="py-0 align-middle">
                      <ul>
                        <li
                          v-for="attachment in asset.attachments"
                          :key="attachment.path"
                        >
                          <a
                            :href="`/auth-storage/${attachment.path}`"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {{ attachment.name }}
                          </a>
                          <button
                            class="btn btn-icon btn-text-dark btn-hover-light-dark btn-xs"
                            title="Hapus"
                            @click="removeAttachment(group, i)"
                          >
                            <span class="svg-icon svg-icon-xs">
                              <inline-svg
                                title="Hapus"
                                :src="
                                  `${$baseUrl}media/svg/icons/Home/Trash.svg`
                                "
                              >
                              </inline-svg>
                            </span>
                          </button>
                        </li>
                      </ul>
                    </td>
                    <td class="py-0 align-middle">
                      <button
                        type="button"
                        class="btn btn-sm btn-text-dark btn-hover-light-dark btn-icon ml-3"
                        title="Upload"
                        @click="openUploadForm(group, i)"
                      >
                        <span class="svg-icon svg-icon-dark svg-icon-sm">
                          <inline-svg
                            title="Upload"
                            :src="`${$baseUrl}media/svg/icons/Files/Upload.svg`"
                          >
                          </inline-svg>
                        </span>
                      </button>
                    </td>
                  </tr>
                </template>
              </tbody>
            </BTableSimple>
          </b-card>
        </div>
      </div>
    </div>
    <input
      ref="upload"
      type="file"
      class="d-none"
      @change="addAttachment($event)"
    />
  </MVContent>
</template>

<script>
import {
  BCard,
  BFormSelect,
  BFormInput,
  BTableSimple,
  BSpinner,
  // BProgress,
} from 'bootstrap-vue'
import axios from 'axios'
import moment from 'moment'
import groupBy from 'ramda/src/groupBy'
import { mapGetters } from 'vuex'
import TaskCrud from './TaskCrud.vue'
import jsonToFormData from 'json-form-data'

export default {
  name: 'Logbook',
  components: {
    BCard,
    BFormSelect,
    BFormInput,
    BTableSimple,
    TaskCrud,
    BSpinner,
    // BProgress,
  },
  filters: {},
  data() {
    return {
      editedItem: {
        logbook_items: [],
      },
      assets: [],
      title: '',
      conditions: ['Baik', 'Bermasalah', 'Rusak', 'Cabut BMN'],
      actions: [
        '',
        'Pengecekan',
        'Perawatan',
        'Perbaikan',
        'Pengambilan',
        'Pemasangan',
      ],
      uploadProgress: 0,
      logbookItemKey: '',
      logbookItemIndex: 0,
    }
  },
  async mounted() {
    if (Number(this.$route.params.id)) {
      await this.getLogbook(this.$route.params.id)
    }
    if (Number(this.$route.params.locationId)) {
      this.getAssets(
        this.$route.params.locationId,
        moment().format('YYYY-MM-DD')
      )
    }
  },
  watch: {},
  computed: {
    ...mapGetters(['authUser']),
  },
  methods: {
    openUploadForm(key, index) {
      this.logbookItemKey = key
      this.logbookItemIndex = index
      this.$refs.upload.click()
    },
    async getLogbook(id) {
      const { data } = await axios.get(
        `/api/v2/maintenance/logbooks/${id}?task_goal_user_id=${this.authUser.id}`
      )
      this.title = `Logbook - ${data.location.name}`
      this.editedItem.logbook_items = data.logbook_items

      this.$refs.taskCrud.edit({
        ...data,
        members: data.task.members,
        due_at: new Date(data.task.due_at),
        end_at: new Date(data.task.end_at),
        letter_number: data.task.letter_number,
        description: data.task.description,
        items: [],

        task_location: data.task.location,
        goal_id: data.task.user_task_goal
          ? data.task.user_task_goal.goal_id
          : null,
        goal_period: data.task.user_task_goal
          ? new Date(data.task.user_task_goal.goal.period)
          : new Date(),
        volume: data.task.user_task_goal ? data.task.user_task_goal.volume : 1,
        goal: data.task.user_task_goal ? data.task.user_task_goal.goal : null,
        report: data.task.report || '<p>&nbsp;</p>',
        attachments: data.task.attachments.map(x => ({
          ...x,
          is_image: /\.(jpe?g|png|gif|bmp|webp)$/i.test(x.name),
          type: x.type !== 1,
        })),
      })

      await this.getAssets(data.location.id, data.task.due_at.substr(0, 10))
    },

    updateAssets(locationId, dueAt) {
      console.log(locationId, dueAt)
      this.getAssets(locationId, moment(dueAt).format('YYYY-MM-DD'))
    },

    async getAssets(locationId, logDate) {
      const { data } = await axios.get(
        `/api/v2/maintenance/assets?location_id=${locationId}&log_date=${logDate}`
      )

      const logs = this.editedItem.logbook_items.reduce(
        (prev, next) => ({
          ...prev,
          [next.asset_id]: next,
        }),
        {}
      )

      const assets = data.data.map(x => ({
        id: x.id,
        name: x.asset_type.name,
        series: `${x.asset_type.brand}${
          x.asset_type.brand && x.asset_type.series
            ? ` - ${x.asset_type.series}`
            : x.asset_type.series
        }`,
        group: x.asset_type.group,
        code: x.code,
        prev_status: x.log ? x.log.status : '-',
        note: logs[x.id] ? logs[x.id].note : null,
        status: logs[x.id] ? logs[x.id].status : null,
        type: 'Pengecekan',
        attachments:
          logs[x.id] && logs[x.id].attachments ? logs[x.id].attachments : [],
      }))

      this.assets = groupBy(x => x.group, assets)
    },

    async save() {
      const task = this.$refs.taskCrud.getEditedTask()
      if (!task.task_location) {
        return alert('Lokasi petugas harus di isi!')
      }
      if (!task.members.length) {
        return alert('Personil harus di isi!')
      }

      const due_at = moment(task.due_at).format('YYYY-MM-DD')
      const end_at = moment(task.end_at).format('YYYY-MM-DD')

      const items = Object.values(this.assets)
        .reduce((prev, next) => [...prev, ...next], [])
        .filter(x => x.status)
        .map(x => ({
          date: due_at,
          asset_id: x.id,
          type: x.type,
          status: x.status,
          note: x.note,
          attachments: x.attachments.filter(attachment => !attachment.file),
          new_attachments: x.attachments.filter(attachment => attachment.file),
        }))

      const payload = {
        ...task,
        due_at,
        end_at,
        items,
        members: task.members.reduce(
          (prev, next, index) => ({ ...prev, [next.id]: { index } }),
          {}
        ),
        attachments: task.attachments
          .filter(attachment => !attachment.file)
          .map(attachment => ({
            ...attachment,
            type: attachment.type ? 2 : 1,
          })),
        new_attachment: task.attachments
          .filter(attachment => attachment.file)
          .map(attachment => ({
            ...attachment,
            type: attachment.type ? 2 : 1,
          })),
        volume: task.goal_id ? task.volume : 'null',
        task_goal_user_id: this.authUser.id,
        report: task.report === '<p>&nbsp;</p>' ? 'null' : task.report,
      }

      const form = jsonToFormData(payload)

      const vm = this
      try {
        if (task.id) {
          form.append('_method', 'patch')
          await axios.post(`/api/v2/maintenance/logbooks/${task.id}`, form, {
            onUploadProgress(event) {
              vm.uploadProgress = Math.round((event.loaded * 100) / event.total)
            },
          })
        } else {
          const { data } = await axios.post(
            `/api/v2/maintenance/logbooks`,
            form,
            {
              onUploadProgress(event) {
                vm.uploadProgress = Math.round(
                  (event.loaded * 100) / event.total
                )
              },
            }
          )

          if (this.$route.params.locationId) {
            this.$router.push(
              `/locations/${this.$route.params.locationId}/logbooks/${data.id}`
            )
          } else {
            this.$router.push(`/logbooks/${data.id}`)
          }

          this.getLogbook(data.id)
        }
        this.$toast('Logbook berhasil disimpan.')
      } catch (error) {
        this.$toast(error, 'danger')
      }
      this.uploadProgress = 0
    },

    back() {
      return this.$router.push(
        Number(this.$route.params.locationId)
          ? `/locations/${this.$route.params.locationId}/logbooks`
          : `/logbooks`
      )
    },

    addAttachment(e, type) {
      const file = e.target.files[0]
      const is_image = /\.(jpe?g|png|gif|bmp|webp)$/i.test(file.name)

      const FR = new FileReader()
      FR.addEventListener('load', ({ target }) => {
        this.assets[this.logbookItemKey][
          this.logbookItemIndex
        ].attachments.push({
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
    removeAttachment(key, index) {
      this.assets[key][index].attachments.splice(index, 1)
    },
  },
}
</script>
