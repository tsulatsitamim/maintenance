<template>
  <b-modal v-model="modal" title="Edit Icon">
    <b-form-group label="Icon Kondisi Baik" label-for="baik_input">
      <div class="custom-file">
        <input
          id="baik_input"
          type="file"
          class="custom-file-input"
          @change="addAttachment($event, 'baik')"
          accept="image/*"
        />
        <label class="custom-file-label" for="baik_input">
          Pilih Icon
        </label>
      </div>
    </b-form-group>

    <b-form-group label="Icon Kondisi Bermasalah" label-for="bermasalah_input">
      <div class="custom-file">
        <input
          id="bermasalah_input"
          type="file"
          class="custom-file-input"
          @change="addAttachment($event, 'bermasalah')"
          accept="image/*"
        />
        <label class="custom-file-label" for="bermasalah_input">
          Pilih Icon
        </label>
      </div>
    </b-form-group>

    <b-form-group label="Icon Kondisi Rusak" label-for="rusak_input">
      <div class="custom-file">
        <input
          id="rusak_input"
          type="file"
          class="custom-file-input"
          @change="addAttachment($event, 'rusak')"
          accept="image/*"
        />
        <label class="custom-file-label" for="rusak_input">
          Pilih Icon
        </label>
      </div>
    </b-form-group>

    <template v-slot:modal-footer>
      <b-button @click="modal = false">Cancel</b-button>
      <b-button variant="primary" @click="save" :disabled="loading">
        <b-spinner v-if="loading" small></b-spinner>
        Simpan
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import { BModal, BFormGroup, BButton, BSpinner } from 'bootstrap-vue'
import Axios from 'axios'
import jsonToFormData from 'json-form-data'

const initialItem = {
  id: null,
  name: null,
}

export default {
  name: 'SymbolCrud',
  components: {
    BModal,
    BFormGroup,
    BButton,
    BSpinner,
  },
  data() {
    return {
      modal: false,
      loading: false,
      editedItem: { ...initialItem },
      icon: {
        baik: {},
        bermasalah: {},
        rusak: {},
      },
    }
  },
  methods: {
    edit(item) {
      this.editedItem = {
        ...item,
      }

      this.icon = {
        baik: {},
        bermasalah: {},
        rusak: {},
      }

      this.modal = true
    },

    addAttachment(e, key) {
      const file = e.target.files[0]
      const is_image = /\.(jpe?g|png|gif|bmp|webp)$/i.test(file.name)
      if (!is_image) {
        return alert('Gambar tidak valid!')
      }

      const FR = new FileReader()
      FR.addEventListener('load', ({ target }) => {
        this.icon[key] = {
          id: Date.now(),
          name: file.name,
          path: target.result,
          file,
          symbol: `${this.editedItem.id}_${key}.png`.toLowerCase(),
        }
      })

      return FR.readAsDataURL(file)
    },

    async save() {
      const payload = {
        attachments: [this.icon.baik, this.icon.bermasalah, this.icon.rusak],
      }
      const form = jsonToFormData(payload)
      this.loading = true
      try {
        const { data } = await Axios.post(`/api/v2/maintenance/symbols`, form)
        this.$emit('symbol-updated', data)
        this.modal = false
        this.$toast('Simbol berhasil disimpan.')
      } catch (error) {
        this.$toast(error, 'danger')
      }
      this.loading = false
    },
  },
}
</script>
