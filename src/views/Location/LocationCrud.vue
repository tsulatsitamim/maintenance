<template>
  <b-modal
    v-model="modal"
    :title="editedItem.id ? 'Edit Lokasi' : 'Buat Lokasi'"
    size="lg"
  >
    <MVSelect2
      v-model="editedItem.network"
      name="network"
      label="Network"
      placeholder="Pilih Network"
      live-search
      tags
      :items="networks"
    />
    <MVSelect2
      v-model="editedItem.subnetwork"
      name="subnetwork"
      label="Subnetwork"
      placeholder="Pilih Subnetwork"
      live-search
      tags
      :items="subnetworks"
    />
    <b-form-group label="Kode" label-for="code-input">
      <b-form-input
        name="code"
        id="code-input"
        v-model="editedItem.code"
        placeholder="Masukan kode lokasi"
      ></b-form-input>
    </b-form-group>
    <b-form-group label="Nama" label-for="name-input">
      <b-form-input
        name="name"
        id="name-input"
        v-model="editedItem.name"
        placeholder="Masukan nama lokasi"
      ></b-form-input>
    </b-form-group>
    <MVSelect2
      v-model="editedItem.location_type"
      name="location_type"
      label="Jenis Lokasi"
      placeholder="Pilih lokasi"
      live-search
      tags
      :items="locationTypes"
    />
    <b-form-group label="Kabupaten" label-for="kabupaten-input">
      <b-form-input
        name="kabupaten"
        id="kabupaten-input"
        v-model="editedItem.kabupaten"
        placeholder="Masukan kabupaten lokasi"
      ></b-form-input>
    </b-form-group>
    <b-form-group label="Kecamatan" label-for="kecamatan-input">
      <b-form-input
        name="kecamatan"
        id="kecamatan-input"
        v-model="editedItem.kecamatan"
        placeholder="Masukan kecamatan lokasi"
      ></b-form-input>
    </b-form-group>
    <b-form-group label="Kelurahan / Desa" label-for="kelurahan-input">
      <b-form-input
        name="kelurahan"
        id="kelurahan-input"
        v-model="editedItem.kelurahan"
        placeholder="Masukan kelurahan / desa lokasi"
      ></b-form-input>
    </b-form-group>
    <b-form-group label="Status Kepemilikan" label-for="owner-input">
      <b-form-input
        name="owner"
        id="owner-input"
        v-model="editedItem.owner"
        placeholder="Masukan status kepemilikan lokasi"
      ></b-form-input>
    </b-form-group>

    <div class="row">
      <div class="col-md-4">
        <b-form-group label="Latitude" label-for="lat-input">
          <b-form-input
            v-model="editedItem.lat"
            step="0.000001"
            type="number"
            name="lat"
            id="lat-input"
            placeholder="Masukan latitude lokasi"
          ></b-form-input>
        </b-form-group>
      </div>
      <div class="col-md-4">
        <b-form-group label="Longitude" label-for="lng-input">
          <b-form-input
            v-model="editedItem.lng"
            step="0.000001"
            type="number"
            name="lng"
            id="lng-input"
            placeholder="Masukan longitude lokasi"
          ></b-form-input>
        </b-form-group>
      </div>
      <div class="col-md-4">
        <b-form-group label="Elevasi" label-for="elevation-input">
          <b-form-input
            v-model="editedItem.elevation"
            step="0.000001"
            type="number"
            name="elevation"
            id="elevation-input"
            placeholder="Masukan elevasi lokasi"
          ></b-form-input>
        </b-form-group>
      </div>
    </div>

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
        name="description"
        id="description-input"
        v-model="editedItem.description"
        placeholder="Masukan keterangan lokasi"
      ></b-form-input>
    </b-form-group>

    <b-form-group label="Cabang Jaringan" label-for="links-input">
      <ol>
        <li v-for="(link, linkIndex) in editedItem.links" :key="link.id">
          <span>{{ link.name }}</span>
          <span>
            <button
              type="button"
              class="btn btn-sm btn-text-dark btn-hover-light-dark btn-icon ml-3"
              data-toggle="tooltip"
              title="Hapus"
              @click="removeLink(linkIndex)"
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
        </li>
      </ol>
      <MVSelect2
        v-model="new_link_id"
        name="add_link"
        placeholder="Tambah Cabang"
        live-search
        url="/api/v2/maintenance/locations?coordinates=true"
        @input="addLink"
      />
    </b-form-group>

    <b-form-group label="Foto" label-for="attachment_input">
      <ol style="padding-left: 1rem">
        <li
          v-for="(attachment, index) in editedItem.attachments"
          :key="attachment.id"
        >
          <div>
            <span>{{ attachment.name }}</span>
            <span class="ml-3">{{ attachment.created_at }}</span>
            <span>
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
          <div class="image-attachment mb-3">
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
          accept="image/*"
        />
        <label class="custom-file-label" for="attachment_input">
          Pilih Foto
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
import cloneDeep from 'clone-deep'
import { MVSelect2 } from 'metronic-vue'
import Axios from 'axios'
import jsonToFormData from 'json-form-data'
import { id } from 'vuejs-datepicker/dist/locale'
import Datepicker from 'vuejs-datepicker'
import moment from 'moment'

const initialItem = {
  id: null,
  code: null,
  name: null,
  description: null,
  location_type: null,
  lat: null,
  lng: null,
  elevation: null,
  owner: null,
  kabupaten: null,
  kecamatan: null,
  kelurahan: null,
  status: true,
  attachments: [],
  links: [],
  network: 'VG',
  subnetwork: 'ME',
  active_date: null,
  inactive_date: null,
}

export default {
  name: 'LocationCrud',
  components: {
    BModal,
    BFormGroup,
    BFormInput,
    MVSelect2,
    BButton,
    BSpinner,
    Datepicker,
  },
  data() {
    return {
      modal: false,
      editedItem: cloneDeep(initialItem),
      networks: [],
      subnetworks: [],
      locationTypes: [],
      loading: false,
      new_link_id: null,
      id,
    }
  },
  mounted() {
    this.getLocationTypes()
    this.getSubnetworks()
    this.getNetworks()
  },
  methods: {
    create() {
      this.modal = true
      this.editedItem = cloneDeep(initialItem)
    },
    edit(item) {
      this.editedItem = {
        ...item,
        lat: item.lat ? Number(item.lat) : null,
        lng: item.lng ? Number(item.lng) : null,
        elevation: item.elevation ? Number(item.elevation) : null,
        attachments: [],
        links: [],
      }
      this.modal = true

      Axios.get(`/api/v2/maintenance/locations/${item.id}`).then(
        ({ data }) =>
          (this.editedItem = {
            ...data,
            lat: data.lat ? Number(data.lat) : null,
            lng: data.lng ? Number(data.lng) : null,
            elevation: data.elevation ? Number(data.elevation) : null,
          })
      )
    },
    async getNetworks() {
      const { data } = await Axios.get(
        `/api/v2/maintenance/locations?groupBy=network`
      )
      this.networks = data.data.length
        ? data.data.map(x => ({ id: x.name, name: x.name }))
        : [{ id: 'VG', name: 'VG' }]
    },
    async getSubnetworks() {
      const { data } = await Axios.get(
        `/api/v2/maintenance/locations?groupBy=subnetwork`
      )
      this.subnetworks = data.data.length
        ? data.data.map(x => ({ id: x.name, name: x.name }))
        : [{ id: 'ME', name: 'ME' }]
    },
    async getLocationTypes() {
      const { data } = await Axios.get(
        `/api/v2/maintenance/locations?groupBy=location_type`
      )
      this.locationTypes = data.data.map(x => ({ id: x.name, name: x.name }))
    },
    async destroy(item) {
      if (window.confirm('Hapus lokasi?')) {
        try {
          await Axios.delete(`/api/v2/maintenance/locations/${item.id}`)
          this.$toast('Lokasi berhasil dihapus.')
          this.$emit('location-destroyed', item)
        } catch (error) {
          this.$toast(error, 'danger')
        }
      }
    },
    addLink(id, location) {
      if (this.editedItem.links.findIndex(x => x.id === -1)) {
        this.editedItem.links.push({ ...location })
      }
    },
    removeLink(index) {
      this.editedItem.links.splice(index, 1)
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
      if (!this.editedItem.code) {
        return alert('Kode lokasi harus di isi!')
      }

      const payload = {
        ...this.editedItem,
        attachments: this.editedItem.attachments
          .filter(attachment => !attachment.file)
          .map(attachment => ({
            ...attachment,
            type: attachment.type ? 2 : 1,
          })),
        new_attachment: this.editedItem.attachments
          .filter(attachment => attachment.file)
          .map(attachment => ({
            ...attachment,
            type: attachment.type ? 2 : 1,
          })),
        links: this.editedItem.links.map(x => x.id),
        active_date: this.editedItem.active_date
          ? moment(new Date(this.editedItem.active_date)).format('YYYY-MM-DD')
          : null,
        inactive_date: this.editedItem.inactive_date
          ? moment(new Date(this.editedItem.inactive_date)).format('YYYY-MM-DD')
          : null,
      }

      const form = jsonToFormData(payload)

      this.loading = true
      try {
        if (this.editedItem.id) {
          form.append('_method', 'patch')
          const { data } = await Axios.post(
            `/api/v2/maintenance/locations/${this.editedItem.id}`,
            form
          )
          this.$emit('location-updated', data)
        } else {
          const { data } = await Axios.post(
            `/api/v2/maintenance/locations`,
            form
          )
          this.$emit('location-created', data)
        }
        this.modal = false
        this.$toast('Lokasi berhasil disimpan.')
      } catch (error) {
        this.$toast(error, 'danger')
      }
      this.loading = false
    },
  },
}
</script>
