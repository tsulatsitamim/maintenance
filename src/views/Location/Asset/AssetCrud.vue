<template>
  <b-modal
    v-model="modal"
    :title="editedItem.id ? 'Edit Jenis Aset' : 'Buat Jenis Aset'"
    size="lg"
  >
    <MVSelect2
      label="Lokasi"
      v-model="editedItem.location_id"
      name="location_id"
      :items="locations"
      placeholder="Pilih Lokasi"
      liveSearch
    />
    <MVSelect2
      v-model="editedItem.asset_type_id"
      name="asset_type_id"
      label="Jenis Aset"
      placeholder="Pilih jenis aset"
      live-search
      url="/api/v2/maintenance/asset-types?fields=id,name,brand,series&select_group=true"
      :mapper="x => x"
      :preselect="editedItem.asset_type"
    />
    <b-form-group label="Nomer Seri" label-for="serial_number-input">
      <b-form-input
        id="serial_number-input"
        v-model="editedItem.serial_number"
        name="serial_number"
        placeholder="Masukan nomer seri"
      ></b-form-input>
    </b-form-group>
    <b-form-group label="Kode Alat" label-for="code-input">
      <b-form-input
        id="code-input"
        v-model="editedItem.code"
        name="code"
        placeholder="Masukan kode alat"
      ></b-form-input>
    </b-form-group>
    <b-form-group label="Kode BMN" label-for="bmn_code-input">
      <b-form-input
        id="bmn_code-input"
        v-model="editedItem.bmn_code"
        name="bmn_code"
        placeholder="Masukan kode BMN"
      ></b-form-input>
    </b-form-group>
    <b-form-group label="Alamat IP" label-for="ip-input">
      <b-form-input
        id="ip-input"
        v-model="editedItem.ip"
        name="ip"
        placeholder="Masukan IP alat"
      ></b-form-input>
    </b-form-group>
    <MVSelect2
      v-model="editedItem.owner"
      name="owner"
      label="Pemilik"
      placeholder="Pilih pemilik"
      tags
      :items="owners"
    />
    <MVSelect2
      v-model="editedItem.transmission"
      name="transmission"
      label="Transmisi Data"
      placeholder="Pilih transmisi data"
      tags
      :items="transmissions"
    />
    <div class="row">
      <div class="col-md-4">
        <b-form-group label="Latitude" label-for="lat-input">
          <b-form-input
            id="lat-input"
            v-model="editedItem.lat"
            name="lat"
            placeholder="Latitude"
            step="0.000001"
            type="number"
          ></b-form-input>
        </b-form-group>
      </div>
      <div class="col-md-4">
        <b-form-group label="Longitude" label-for="lng-input">
          <b-form-input
            id="lng-input"
            v-model="editedItem.lng"
            name="lng"
            placeholder="Longitude"
            step="0.000001"
            type="number"
          ></b-form-input>
        </b-form-group>
      </div>
      <div class="col-md-4">
        <b-form-group label="Elevation" label-for="elevation-input">
          <b-form-input
            id="elevation-input"
            v-model="editedItem.elevation"
            name="elevation"
            placeholder="Elevation"
            type="number"
          ></b-form-input>
        </b-form-group>
      </div>
    </div>
    <MVSelect2
      v-model="editedItem.location_reference_id"
      name="location_reference_id"
      label="POS Referensi"
      placeholder="Pilih POS referensi"
      tags
      :items="locations"
    />
    <b-form-group label="URL Data" label-for="url-input">
      <b-form-input
        id="url-input"
        v-model="editedItem.url"
        name="url"
        placeholder="Masukan URL data"
      ></b-form-input>
    </b-form-group>
    <b-form-group label="Tanggal Pemasangan">
      <datepicker
        v-model="editedItem.active_date"
        format="dd MMMM yyyy"
        name="active_date"
        :language="id"
        :value="editedItem.active_date"
        input-class="form-control"
      ></datepicker>
    </b-form-group>
    <b-form-group label="Keterangan" label-for="description-input">
      <b-form-input
        id="description-input"
        v-model="editedItem.description"
        name="description"
        placeholder="Masukan keterangan"
      ></b-form-input>
    </b-form-group>

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
  BButton,
  BSpinner,
} from 'bootstrap-vue'
import moment from 'moment'
import cloneDeep from 'clone-deep'
import { MVSelect2 } from 'metronic-vue'
import Axios from 'axios'
import jsonToFormData from 'json-form-data'
import { id } from 'vuejs-datepicker/dist/locale'
import Datepicker from 'vuejs-datepicker'

const initialItem = {
  id: null,
  code: null,
  bmn_code: null,
  description: null,
  status: 1,
  active_date: null,
  inactive_date: null,
  lat: null,
  lng: null,
  elevation: null,
  owner: null,
  transmission: null,
  url: null,
  ip: null,
  asset_type_id: null,
  location_id: null,
  location_reference_id: null,
  attachments: [],
  serial_number: null,
}

export default {
  name: 'AssetCrud',
  components: {
    BModal,
    BFormGroup,
    BFormInput,
    MVSelect2,
    BButton,
    BSpinner,
    Datepicker,
  },
  props: {
    selectedLocation: {
      type: [Number, String],
      default: null,
    },
  },
  data() {
    return {
      loading: false,
      modal: false,
      id,
      editedItem: cloneDeep(initialItem),
      owners: [],
      transmissions: [],
      locations: [],
    }
  },
  computed: {
    //
  },
  mounted() {
    this.getLocations()
    this.getAssetAttributes()
  },
  methods: {
    create() {
      this.editedItem = cloneDeep(initialItem)
      this.modal = true
    },
    edit(item) {
      this.editedItem = { ...item, attachments: [] }
      this.modal = true

      Axios.get(`/api/v2/maintenance/assets/${item.id}`).then(({ data }) => {
        this.editedItem = {
          ...item,
          ...data,
          lat: data.lat ? Number(data.lat) : null,
          lng: data.lng ? Number(data.lng) : null,
          elevation: data.elevation ? Number(data.elevation) : null,
          attachments: data.attachments.map(x => ({
            ...x,
            is_image: /\.(jpe?g|png|gif|bmp|webp)$/i.test(x.name),
          })),
        }
      })
    },

    async getLocations() {
      const { data } = await Axios.get('/api/v2/maintenance/locations')
      this.locations = data.data.map(x => ({
        id: x.id,
        name: x.name,
      }))
    },

    async getAssetAttributes() {
      const reponses = await Promise.all([
        Axios.get('/api/v2/maintenance/assets?groupBy=owner'),
        Axios.get('/api/v2/maintenance/assets?groupBy=transmission'),
      ])

      const [{ data: owners }, { data: transmissions }] = reponses
      this.owners = owners.data.map(x => ({ id: x.name, name: x.name }))
      this.transmissions = transmissions.data.map(x => ({
        id: x.name,
        name: x.name,
      }))
    },

    async destroy(item) {
      if (window.confirm('Hapus aset?')) {
        try {
          await Axios.delete(`/api/v2/maintenance/assets/${item.id}`)
          this.$toast('Aset berhasil dihapus.')
          this.$emit('asset-destroyed', item)
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
      if (!this.editedItem.asset_type_id) {
        return alert('Jenis aset harus di isi!')
      }

      const payload = {
        ...this.editedItem,
        active_date: this.editedItem.active_date
          ? moment(new Date(this.editedItem.active_date)).format('YYYY-MM-DD')
          : null,
        inactive_date: this.editedItem.inactive_date
          ? moment(new Date(this.editedItem.inactive_date)).format('YYYY-MM-DD')
          : null,
        location_id: this.editedItem.location_id
          ? this.editedItem.location_id
          : this.selectedLocation,
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
            `/api/v2/maintenance/assets/${this.editedItem.id}`,
            form
          )
          this.$emit('asset-updated', data)
        } else {
          const { data } = await Axios.post(`/api/v2/maintenance/assets`, form)
          this.$emit('asset-created', data)
        }
        this.modal = false
        this.$toast('Aset berhasil disimpan.')
      } catch (error) {
        this.$toast(error, 'danger')
      }
      this.loading = false
    },
  },
}
</script>
