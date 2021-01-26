<template>
  <MVContent>
    <template v-slot:subheader>
      <MVSubheader title="Ulasan">
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
            <div>
              <b-table
                hover
                ref="table"
                class="review-table"
                :fields="fields"
                :items="validations"
                responsive
                @row-clicked="openValidation"
              >
                <template #table-colgroup="scope">
                  <col
                    v-for="field in scope.fields"
                    :key="field.key"
                    :style="{
                      width: field.key === 'status' ? '120px' : 'auto',
                    }"
                  />
                </template>
                <template #cell(user.name)="data">
                  {{ data.item.user.name }}
                  <b-badge v-if="data.item.isNew" class="flash-badge ml-2"
                    >new</b-badge
                  >
                </template>
                <template #cell(status)="data">
                  <b-badge :variant="data.item.label.variant">{{
                    data.item.label.label
                  }}</b-badge>
                </template>
              </b-table>
            </div>
          </b-card>
        </div>
      </div>
    </div>
  </MVContent>
</template>

<script>
import { BCard, BTable, BBadge } from 'bootstrap-vue'
import axios from 'axios'
import moment from 'moment'
import Datepicker from 'vuejs-datepicker'
import { id } from 'vuejs-datepicker/dist/locale'
import { reviewStatus } from '../Contract/utils'

export default {
  name: 'Review',
  components: {
    BCard,
    BTable,
    Datepicker,
    BBadge,
  },
  data() {
    return {
      id,
      selectedMonth: new Date(),
      validations: [],
      fields: [
        { label: 'Nama', key: 'user.name', sortable: true },
        { label: 'Status', key: 'status', sortable: true },
      ],
    }
  },
  mounted() {
    this.getValidations()
  },
  watch: {
    selectedMonth() {
      this.getValidations()
    },
  },
  methods: {
    async getValidations() {
      try {
        const { data } = await axios.get(
          `/api/goal-validations?manager_id=true&period=${moment(
            this.selectedMonth
          ).format('YYYY-MM-DD')}`
        )

        this.validations = data.map(validation => ({
          ...validation,
          label: reviewStatus(validation.status),
          isNew:
            !validation.manager_last_seen ||
            moment(validation.manager_last_seen).isBefore(
              validation.updated_at
            ),
        }))
      } catch (error) {
        this.$toast(error, 'danger')
        return []
      }
    },
    openValidation(validation) {
      this.$router.push(`/review/${validation.id}`)
    },
  },
}
</script>

<style lang="scss">
.review-table {
  tr {
    cursor: pointer;
  }
}

.flash-badge {
  background: #1bc5bd;
  padding: 5px 10px;
  color: #fff;
  border: none;
  border-radius: 5px;

  animation-name: flash;
  animation-duration: 1s;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

@keyframes flash {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style>
