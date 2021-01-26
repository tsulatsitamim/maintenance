<template>
  <b-modal v-model="modal" title="Duplikat Kontrak" size="lg">
    <BFormGroup label="Pilih target bulan yang anda inginkan:">
      <datepicker
        v-model="selectedDuplicateMonth"
        format="MMMM yyyy"
        name="selectedDate"
        :language="id"
        minimum-view="month"
        input-class="form-control"
      ></datepicker>
    </BFormGroup>
    <BFormGroup label="Pilih tugas yang ingin anda duplikat:">
      <div class="checkbox-list">
        <label
          v-for="goal in goalsWithId"
          :id="goal.id"
          :key="goal.id"
          class="checkbox checkbox-outline"
        >
          <input
            v-model="selectedDuplicateGoals"
            type="checkbox"
            :name="goal.id"
            :value="goal.id"
          />
          <span></span>
          {{ goal.name }}
        </label>
      </div>
    </BFormGroup>
    <template v-slot:modal-footer>
      <b-button @click="modal = false">Cancel</b-button>
      <b-button variant="primary" @click="saveDuplicate" :disabled="loading">
        <b-spinner v-if="loading" small></b-spinner>
        Duplikat
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import { BModal, BFormGroup, BButton, BSpinner } from 'bootstrap-vue'
import axios from 'axios'
import moment from 'moment'
import Datepicker from 'vuejs-datepicker'
import { id } from 'vuejs-datepicker/dist/locale'

export default {
  name: 'ContractDuplicate',
  components: {
    Datepicker,
    BModal,
    BFormGroup,
    BButton,
    BSpinner,
  },
  props: {
    goals: {
      type: Array,
      required: true,
    },
  },
  computed: {
    goalsWithId() {
      return this.goals.filter(x => x.id)
    },
  },
  data() {
    return {
      id,
      modal: false,
      loading: false,
      selectedDuplicateMonth: moment()
        .add(1, 'month')
        .toDate(),
      selectedDuplicateGoals: [],
    }
  },
  methods: {
    duplicate() {
      this.modal = true
      this.selectedDuplicateGoals = this.goalsWithId.map(x => x.id)
    },
    async saveDuplicate() {
      this.loading = true
      try {
        await Promise.all(
          this.goals
            .filter(goal => this.selectedDuplicateGoals.includes(goal.id))
            .map(goal =>
              axios.post(`/api/goals`, {
                ...goal,
                period: moment(this.selectedDuplicateMonth).format(
                  'YYYY-MM-DD'
                ),
              })
            )
        )
        this.$emit('duplicated', this.selectedDuplicateMonth)
        this.$toast('Kontrak berhasil diduplikat.')
        this.modal = false
      } catch (error) {
        this.$toast(error, 'danger')
      }
      this.loading = false
    },
  },
}
</script>
