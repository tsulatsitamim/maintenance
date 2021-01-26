<template>
  <MVContent>
    <template v-slot:subheader>
      <MVSubheader title="Kontrak">
        <template v-slot:action>
          <b-badge :variant="reviewStatus.variant">{{
            reviewStatus.label
          }}</b-badge>
        </template>

        <a
          :href="printUrl"
          class="btn btn-light-primary font-weight-bolder btn-sm mr-2 px-4"
          title="Print"
        >
          <span class="svg-icon mr-0">
            <inline-svg
              title="Print"
              :src="`${$baseUrl}media/svg/icons/Devices/Printer.svg`"
            ></inline-svg>
          </span>
        </a>
        <button
          class="btn btn-light-primary font-weight-bolder btn-sm mr-2 px-4"
          title="Duplikat"
          @click="duplicate"
        >
          <span class="svg-icon mr-0">
            <inline-svg
              title="Duplikat"
              :src="`${$baseUrl}media/svg/icons/Design/Substract.svg`"
            ></inline-svg>
          </span>
        </button>
        <div class="max-w-140px mr-2">
          <datepicker
            v-model="selectedMonth"
            format="MMMM yyyy"
            name="selectedDate"
            :language="id"
            minimum-view="month"
            input-class="form-control"
          ></datepicker>
        </div>
      </MVSubheader>
    </template>
    <div class="home">
      <div class="row">
        <div class="col-12">
          <b-card>
            <div class="table-responsive">
              <table class="table table-striped table-editable">
                <thead>
                  <tr>
                    <th scope="col">No</th>
                    <th scope="col" style="min-width: auto;">Nama Kegiatan</th>
                    <th scope="col" style="min-width: 105px;">Target</th>
                    <th scope="col" style="min-width: 75px;">Durasi</th>
                    <th scope="col">Deskripsi</th>
                    <th scope="col" class="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="!goals.length">
                    <td colspan="6" class="text-center bg-white py-5">
                      Belum ada kegiatan pada period terpilih.
                    </td>
                  </tr>
                  <tr v-for="(goal, i) in goals" :key="goal.id">
                    <template v-if="editedGoal.id === goal.id">
                      <td>{{ i + 1 }}</td>
                      <td>
                        <textarea
                          v-model="editedGoal.name"
                          class="form-control min-w-120px"
                          placeholder="Nama Kegiatan"
                          rows="1"
                        />
                      </td>
                      <td class="d-flex">
                        <input
                          v-model="editedGoal.quantity"
                          type="number"
                          class="form-control border-square-right min-w-90px"
                          style="border-right: none"
                          placeholder="Kuantitas"
                        />
                        <input
                          v-model="editedGoal.output"
                          type="text"
                          class="form-control border-square-left input-datalist-group  min-w-90px"
                          placeholder="Output"
                          list="output"
                        />
                        <datalist id="output">
                          <option
                            v-for="output in outputs"
                            :key="output"
                            :value="output"
                          >
                          </option>
                        </datalist>
                      </td>
                      <td>
                        <b-input-group class="d-flex flex-nowrap">
                          <b-form-input
                            v-model="editedGoal.duration"
                            placeholder="Durasi"
                            type="number"
                            class="min-w-90px"
                          ></b-form-input>
                          <template v-slot:append>
                            <b-dropdown :text="editedGoal.unit">
                              <b-dropdown-item @click="editedGoal.unit = 'Jam'">
                                Jam
                              </b-dropdown-item>
                              <b-dropdown-item
                                @click="editedGoal.unit = 'Hari'"
                              >
                                Hari
                              </b-dropdown-item>
                              <b-dropdown-item
                                @click="editedGoal.unit = 'Minggu'"
                              >
                                Minggu
                              </b-dropdown-item>
                              <b-dropdown-item
                                @click="editedGoal.unit = 'Bulan'"
                              >
                                Bulan
                              </b-dropdown-item>
                            </b-dropdown>
                          </template>
                        </b-input-group>
                      </td>
                      <td>
                        <textarea
                          v-model="editedGoal.description"
                          class="form-control min-w-120px"
                          placeholder="Deskripsi"
                          rows="1"
                        />
                      </td>
                      <td>
                        <div class="d-flex flex-no-wrap">
                          <button
                            class="btn btn-icon btn-text-dark btn-hover-light-dark btn-sm mr-2"
                            @click="save(i)"
                            title="Simpan"
                          >
                            <b-spinner
                              v-if="loading"
                              variant="light"
                              small
                            ></b-spinner>
                            <span v-else class="svg-icon svg-icon-md">
                              <inline-svg
                                title="Simpan"
                                :src="
                                  `${$baseUrl}media/svg/icons/Navigation/Check.svg`
                                "
                              >
                              </inline-svg>
                            </span>
                          </button>
                          <button
                            class="btn btn-icon btn-text-dark btn-hover-light-dark btn-sm"
                            @click="cancel(i)"
                            title="Batal"
                          >
                            <span class="svg-icon svg-icon-md">
                              <inline-svg
                                title="Batal"
                                :src="
                                  `${$baseUrl}media/svg/icons/Navigation/Close.svg`
                                "
                              >
                              </inline-svg>
                            </span>
                          </button>
                        </div>
                      </td>
                    </template>
                    <template v-else>
                      <td>{{ i + 1 }}</td>
                      <td>{{ goal.name }}</td>
                      <td>{{ goal.quantity + ' ' + goal.output }}</td>
                      <td>{{ goal.duration + ' ' + goal.unit }}</td>
                      <td>{{ goal.description }}</td>
                      <td>
                        <div class="d-flex flex-no-wrap justify-content-center">
                          <button
                            class="btn btn-icon btn-text-dark btn-hover-light-dark btn-sm mr-2"
                            @click="edit(goal)"
                            title="Edit"
                          >
                            <span class="svg-icon svg-icon-md">
                              <inline-svg
                                title="Edit"
                                :src="
                                  `${$baseUrl}media/svg/icons/General/Edit.svg`
                                "
                              >
                              </inline-svg>
                            </span>
                          </button>
                          <button
                            class="btn btn-icon btn-text-dark btn-hover-light-dark btn-sm"
                            @click="destroy(goal, i)"
                            title="Hapus"
                          >
                            <span class="svg-icon svg-icon-md">
                              <inline-svg
                                title="Hapus"
                                :src="
                                  `${$baseUrl}media/svg/icons/Home/Trash.svg`
                                "
                              >
                              </inline-svg>
                            </span>
                          </button>
                        </div>
                      </td>
                    </template>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="text-center mt-7">
              <button
                v-if="showAddButton"
                class="btn btn-light-primary font-weight-bold"
                @click="add"
              >
                Tambah Kegiatan
              </button>
              <button
                v-if="
                  showAddButton &&
                    goals.length &&
                    validation.status !== 1 &&
                    validation.status !== 2
                "
                class="btn btn-light-success font-weight-bold ml-5"
                @click="submitValidation"
              >
                {{
                  validation.status === 3
                    ? 'Ajukan Ulang Kontrak'
                    : 'Ajukan Kontrak'
                }}
              </button>
            </div>
          </b-card>
        </div>
        <div v-if="validation.id" class="col-12 mt-10">
          <chat :validationId="validation.id"></chat>
        </div>
      </div>
    </div>
    <duplicate
      ref="duplicate"
      :goals="goals"
      @duplicated="selectedMonth = $event"
    ></duplicate>
  </MVContent>
</template>

<script>
import {
  BCard,
  BInputGroup,
  BFormInput,
  BDropdown,
  BDropdownItem,
  BBadge,
  BSpinner,
} from 'bootstrap-vue'
import { mapGetters } from 'vuex'
import axios from 'axios'
import moment from 'moment'
import Datepicker from 'vuejs-datepicker'
import cloneDeep from 'clone-deep'
import { id } from 'vuejs-datepicker/dist/locale'
import Duplicate from './Duplicate.vue'
import { reviewStatus } from './utils'
import Chat from './Chat.vue'

const isValidForm = (goal, vm) => {
  if (!goal.name) {
    vm.$toast('Nama kegiatan harus diisi.', 'danger')
    return
  }
  if (!goal.quantity) {
    vm.$toast('Kuantitas harus diisi.', 'danger')
    return
  }
  if (!goal.output) {
    vm.$toast('Output kegiatan harus diisi.', 'danger')
    return
  }
  if (!goal.duration) {
    vm.$toast('Durasi kegiatan harus diisi.', 'danger')
    return
  }
  if (!goal.unit) {
    vm.$toast('Satuan durasi harus diisi.', 'danger')
    return
  }

  return true
}

const initialGoal = {
  id: null,
  name: '',
  quantity: '',
  output: '',
  duration: '',
  unit: 'Hari',
}

export default {
  name: 'Contract',
  components: {
    BCard,
    Datepicker,
    BInputGroup,
    BFormInput,
    BDropdown,
    BDropdownItem,
    BBadge,
    Duplicate,
    BSpinner,
    Chat,
  },
  data() {
    return {
      loading: false,
      id,
      selectedMonth: new Date(),
      goals: [],
      outputs: [],
      editedGoal: { ...initialGoal },
      originalGoal: {},
      validation: {},
      showAddButton: true,
    }
  },
  mounted() {
    this.getGoals()
    this.getGoalsValidation()
    this.getOutputs()
  },
  computed: {
    ...mapGetters(['authUser']),
    printUrl() {
      return `/task-goals/print?period=${moment(this.selectedMonth).format(
        'YYYY-MM-DD'
      )}`
    },
    reviewStatus() {
      return reviewStatus(this.validation.status)
    },
  },
  watch: {
    selectedMonth() {
      this.close()
      this.getGoals()
      this.getGoalsValidation()
    },
  },
  methods: {
    async getGoals() {
      const { data } = await axios.get(
        `/api/goals?period=${moment(this.selectedMonth).format('YYYY-MM-DD')}`
      )
      this.goals = data
    },
    async getGoalsValidation() {
      const { data } = await axios.get(
        `/api/goal-validations?user_id=${this.authUser.id}&period=${moment(
          this.selectedMonth
        ).format('YYYY-MM-DD')}`
      )

      this.validation = data
    },
    async getOutputs() {
      const { data } = await axios.get(`/api/goals?groupBy=output`)
      this.outputs = data
    },
    edit(goal) {
      this.editedGoal = cloneDeep(goal)
      this.originalGoal = cloneDeep(goal)
      this.showAddButton = false
    },
    async save(i) {
      if (!isValidForm(this.editedGoal, this)) {
        return
      }

      if (this.validation.status === 2) {
        if (
          !confirm(
            'Membuat/mengubah kontrak periode yang disetujui akan mengubah status persetujuan menjadi direview'
          )
        ) {
          return
        }
      }

      const payload = {
        ...this.editedGoal,
        period: moment(this.selectedMonth).format('YYYY-MM-DD'),
      }

      this.loading = true
      try {
        if (this.editedGoal.id) {
          await axios.patch(`/api/goals/${this.editedGoal.id}`, payload)
          this.goals.splice(i, 1, cloneDeep(payload))
        } else {
          const { data } = await axios.post(`/api/goals`, payload)
          this.goals.splice(i, 1, data)
        }
        this.originalGoal = {}
        this.$toast('Kontrak kegiatan berhasil disimpan')
        this.close()
      } catch (error) {
        this.$toast(error, 'danger')
      }
      this.loading = false

      if (this.validation.status === 2) {
        this.validation.status = 1
      }
    },
    async destroy(goal, i) {
      if (!window.confirm(`Hapus kegiatan ${goal.name}?`)) {
        return
      }

      try {
        await axios.delete(`/api/goals/${goal.id}?json=true`)
        this.goals.splice(i, 1)
        this.$toast('Kontrak kegiatan berhasil dihapus')
        this.close()
      } catch (error) {
        this.$toast(error, 'danger')
      }
    },
    add() {
      this.goals.push(initialGoal)
      this.editedGoal = cloneDeep(initialGoal)
      this.showAddButton = false
    },
    cancel(i) {
      if (this.goals[i].id) {
        // Reset unsaved edited goal
        this.goals[i] = cloneDeep(this.originalGoal)
      } else {
        // Delete unsaved created goal
        this.goals.splice(i, 1)
      }
      this.close()
    },
    close() {
      this.editedGoal = cloneDeep(initialGoal)
      this.showAddButton = true
    },
    async submitValidation() {
      try {
        const { data } = await axios.post(`/api/goal-validations`, {
          period: moment(this.selectedMonth).format('YYYY-MM-DD'),
        })
        this.validation = data
        this.$toast('Kontrak berhasil diajukan.')
      } catch (error) {
        this.$toast(error, 'danger')
      }
    },
    duplicate() {
      // Delete unsaved created goal
      if (!this.goals[this.goals.length - 1].id) {
        this.goals.splice(this.goals.length - 1, 1)
      }

      // Reset unsaved edited goal
      if (this.originalGoal.id) {
        this.goals[
          this.goals.findIndex(goal => goal.id === this.originalGoal.id)
        ] = cloneDeep(this.originalGoal)
      }

      this.close()
      this.$refs.duplicate.duplicate()
    },
  },
}
</script>
