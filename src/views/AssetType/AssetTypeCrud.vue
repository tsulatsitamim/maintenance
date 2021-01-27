<template>
  <b-modal
    v-model="modal"
    :title="editedItem.id ? 'Edit Jenis Aset' : 'Buat Jenis Aset'"
    size="lg"
  >
    <MVSelect2
      v-model="editedItem.group"
      name="group"
      label="Kelompok"
      placeholder="Pilih kelompok"
      tags
      :items="groups"
    />
    <b-form-group label="Nama" label-for="name-input">
      <b-form-input
        id="name-input"
        v-model="editedItem.name"
        name="name"
        placeholder="Masukan name jenis asest"
      ></b-form-input>
    </b-form-group>
    <MVSelect2
      v-model="editedItem.brand"
      name="brand"
      label="Merek Dagang"
      placeholder="Pilih merek dagang"
      live-search
      tags
      :items="brands"
    />
    <MVSelect2
      v-model="editedItem.series"
      name="series"
      label="Model Produk"
      placeholder="Pilih Model produk"
      live-search
      tags
      :items="series"
    />

    <b-form-group label="Spesifikasi" label-for="specification-input">
      <b-form-text
        v-model="editedItem.url"
        name="specification"
        id="specification-input"
        placeholder="Masukan spesifikasi produk"
      ></b-form-text>
    </b-form-group>

    <b-form-group label="Url Produk" label-for="url-input">
      <b-form-input
        v-model="editedItem.url"
        name="url"
        id="url-input"
        placeholder="Masukan url produk"
      ></b-form-input>
    </b-form-group>
    <div class="row">
      <div class="col-md-6">
        <b-form-group label="Harga (IDR)" label-for="price_idr-input">
          <b-form-input
            id="price_idr-input"
            v-model="editedItem.price_idr"
            type="number"
            name="price_idr"
            placeholder="Masukan harga produk (IDR)"
          ></b-form-input>
        </b-form-group>
      </div>
      <div class="col-md-6">
        <b-form-group label="Harga (USD)" label-for="price_usd-input">
          <b-form-input
            id="price_usd-input"
            v-model="editedItem.price_usd"
            type="number"
            name="price_usd"
            placeholder="Masukan harga produk (USD)"
          ></b-form-input>
        </b-form-group>
      </div>
    </div>
    <MVSelect2
      v-if="editedItem.group === 'Sistem Sensor'"
      v-model="editedItem.method"
      name="method"
      label="Metode"
      placeholder="Pilih metode"
      live-search
      tags
      :items="methods"
    />
    <MVSelect2
      v-if="editedItem.group === 'Sistem Sensor'"
      v-model="editedItem.data_type"
      name="data_type"
      label="Jenis Data"
      placeholder="Pilih jenis data"
      live-search
      :items="[
        ...dataTypes,
        ...(editedItem.data_type
          ? [{ id: editedItem.data_type, name: editedItem.data_type }]
          : []),
      ]"
    />
    <MVSelect2
      v-model="editedItem.status"
      name="status"
      label="Status"
      placeholder="Pilih status"
      :items="[
        { id: 1, name: 'Aktif' },
        { id: 0, name: 'Non-Aktif' },
      ]"
    />

    <b-form-group label="Lampiran" label-for="attachment_input">
      <ol style="padding-left: 1rem">
        <li
          v-for="(attachment, index) in editedItem.attachments"
          :key="attachment.id"
        >
          <div>
            <span>{{ attachment.name }}</span>
            <span class="ml-3">{{ attachment.created_at }}</span>
            <span>
              <a
                :href="attachment.path"
                download
                type="button"
                class="btn btn-sm btn-hover-light-dark btn-text-dark btn-icon ml-3"
                title="Download"
                target="_blank"
              >
                <span class="svg-icon svg-icon-dark svg-icon-md">
                  <inline-svg
                    title="Download"
                    :src="`${$baseUrl}media/svg/icons/Files/Download.svg`"
                  >
                  </inline-svg>
                </span>
              </a>
              <button
                type="button"
                class="btn btn-sm btn-text-dark btn-hover-light-dark btn-icon ml-3"
                title="Hapus"
                @click="removeAttachment(index)"
              >
                <span class="svg-icon svg-icon-dark svg-icon-md">
                  <inline-svg
                    title="Hapus"
                    :src="`${$baseUrl}media/svg/icons/Home/Trash.svg`"
                  >
                  </inline-svg>
                </span>
              </button>
            </span>
          </div>
          <div v-if="attachment.is_image" class="image-attachment mb-3">
            <img
              :src="attachment.path"
              width="170"
              class="img-thumbnail"
              :alt="attachment.name"
            />
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
          Pilih Lampiran
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
import {
  BModal,
  BFormGroup,
  BFormInput,
  BIconTrash,
  BButton,
  BSpinner,
  BFormText,
} from 'bootstrap-vue'
import cloneDeep from 'clone-deep'
import { MVSelect2 } from 'metronic-vue'
import Axios from 'axios'
import jsonToFormData from 'json-form-data'

const initialItem = {
  id: null,
  group: null,
  name: null,
  brand: null,
  series: null,
  specification: null,
  url: null,
  price_idr: null,
  price_usd: null,
  status: 1,
  method: null,
  data_type: null,
  attachments: [],
}

export default {
  name: 'LocationCrud',
  components: {
    BModal,
    BFormGroup,
    BFormInput,
    MVSelect2,
    BIconTrash,
    BButton,
    BSpinner,
    BFormText,
  },
  data() {
    return {
      // modal: false,
      networks: [],
      subnetworks: [],
      locationTypes: [],
      new_link_id: null,

      loading: false,
      modal: false,
      setEditingItem: false,
      editedItem: cloneDeep(initialItem),
      brands: [],
      series: [],
      groups: [],
      methods: [],
      locations: [],
      selectedLocation: 0,
    }
  },
  computed: {
    dataTypes() {
      const method = this.editedItem.method
        ? this.editedItem.method.toLowerCase()
        : ''

      if (method === 'seismik') {
        return [
          { id: 'Broadband', name: 'Broadband' },
          { id: 'Short Period', name: 'Short Period' },
          { id: 'Geophone', name: 'Geophone' },
        ]
      }
      if (method === 'deformasi') {
        return [
          { id: 'Tiltmeter', name: 'Tiltmeter' },
          { id: 'EDM', name: 'EDM' },
          { id: 'GPS', name: 'GPS' },
        ]
      }
      if (method === 'geokimia') {
        return [
          { id: 'Gas', name: 'Gas' },
          { id: 'Suhu', name: 'Suhu' },
        ]
      }
      if (method === 'geofisika') {
        return [
          { id: 'Gravitasi', name: 'Gravitasi' },
          { id: 'Magnetik', name: 'Magnetik' },
          { id: 'Resistivitas', name: 'Resistivitas' },
        ]
      }
      if (method === 'visual') {
        return [
          { id: 'CCTV', name: 'CCTV' },
          { id: 'Thermalcam', name: 'Thermalcam' },
          { id: 'DSLR', name: 'DSLR' },
        ]
      }
      if (method === 'cuaca') {
        return [
          { id: 'Hujan', name: 'Hujan' },
          { id: 'Multicuaca', name: 'Multicuaca' },
        ]
      }

      return []
    },
  },
  watch: {
    async 'editedItem.brand'(brand) {
      if (this.setEditingItem) {
        return
      }
      this.editedItem.specification = null
      this.editedItem.series = null
      this.editedItem.url = null
      if (!brand) {
        this.series = []
        return
      }
      const { data } = await Axios.get(
        `/api/v2/maintenance/asset-types?groupBy=series&brand=${brand}`
      )
      this.series = data.data.map(x => ({ id: x.name, name: x.name }))
    },
    async 'editedItem.series'(series) {
      if (this.setEditingItem) {
        return
      }
      this.editedItem.specification = null
      this.editedItem.url = null

      if (!series) {
        return
      }

      const responses = await Promise.all([
        Axios.get(
          `/api/v2/maintenance/asset-types?groupBy=specification&series=${series}`
        ),
        Axios.get(
          `/api/v2/maintenance/asset-types?groupBy=url&series=${series}`
        ),
      ])
      const [{ data: specs }, { data: urls }] = responses
      this.editedItem.specification = specs.data.length
        ? specs.data[0].name
        : ''
      this.editedItem.url = urls.data.length ? urls.data[0].name : ''
    },
    async selectedLocation() {
      if (this.$refs.dataTable.table) {
        this.$refs.dataTable.table.ajax.url(
          `/api/v2/maintenance/asset-types-condition?location_id=${this.selectedLocation}`
        )
        this.$refs.dataTable.reload()
      }
    },
  },
  mounted() {
    this.getLocations()
    this.getAssetTypesAttributes()
  },
  methods: {
    create() {
      this.modal = true
      this.editedItem = cloneDeep(initialItem)
    },
    edit(item) {
      this.setEditingItem = true
      this.editedItem = { ...item, attachments: [] }
      this.series = item.series ? [{ id: item.series, name: item.series }] : []
      this.modal = true

      Axios.get(`/api/v2/maintenance/asset-types/${item.id}`).then(
        ({ data }) => {
          this.editedItem.attachments = data.attachments
          this.setEditingItem = false
          this.editedItem.attachments = data.attachments.map(x => ({
            ...x,
            is_image: /\.(jpe?g|png|gif|bmp|webp)$/i.test(x.name),
          }))
        }
      )
    },

    async getLocations() {
      const { data } = await Axios.get('/api/v2/maintenance/locations')
      this.locations = [
        { id: 0, name: 'Semua' },
        ...data.data.map(x => ({
          id: x.id,
          name: x.name,
        })),
      ]
    },
    async getAssetTypesAttributes() {
      const reponses = await Promise.all([
        Axios.get('/api/v2/maintenance/asset-types?groupBy=brand'),
        Axios.get('/api/v2/maintenance/asset-types?groupBy=group'),
        Axios.get('/api/v2/maintenance/asset-types?groupBy=method'),
      ])

      const [{ data: brands }, { data: groups }, { data: methods }] = reponses
      this.brands = brands.data.map(x => ({ id: x.name, name: x.name }))
      this.groups = groups.data.map(x => ({ id: x.name, name: x.name }))
      this.methods = methods.data.map(x => ({ id: x.name, name: x.name }))
    },

    async destroy(item) {
      if (window.confirm('Hapus jenis aset?')) {
        try {
          await Axios.delete(`/api/v2/maintenance/asset-types/${item.id}`)
          this.$toast('Jenis aset berhasil dihapus.')
          this.$emit('asset-type-destroyed', item)
        } catch (error) {
          this.$toast(error, 'danger')
        }
      }
    },

    addAttachment(e, type) {
      const file = e.target.files[0]
      const is_image = /\.(jpe?g|png|gif|bmp|webp)$/i.test(file.name)

      const FR = new FileReader()
      FR.addEventListener('load', ({ target }) => {
        this.editedItem.attachments.push({
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
      this.editedItem.attachments.splice(index, 1)
    },

    async save() {
      if (!this.editedItem.name) {
        return alert('Nama jenis aset harus di isi!')
      }

      const payload = {
        ...this.editedItem,
        attachments: this.editedItem.attachments.filter(
          attachment => !attachment.file
        ),
        new_attachment: this.editedItem.attachments.filter(
          attachment => attachment.file
        ),
      }

      const form = jsonToFormData(payload)

      this.loading = true
      try {
        if (this.editedItem.id) {
          form.append('_method', 'patch')
          const { data } = await Axios.post(
            `/api/v2/maintenance/asset-types/${this.editedItem.id}`,
            form
          )
          this.$emit('asset-type-updated', data)
        } else {
          const { data } = await Axios.post(
            `/api/v2/maintenance/asset-types`,
            form
          )
          this.$emit('asset-type-created', data)
        }
        this.modal = false
        this.$toast('Jenis aset berhasil disimpan.')
      } catch (error) {
        this.$toast(error, 'danger')
      }
      this.loading = false
    },
  },
}
</script>
