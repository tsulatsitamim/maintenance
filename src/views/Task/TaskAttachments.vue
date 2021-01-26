<template>
  <div class="task-attachments mb-10">
    <div class="font-weight-bolder mb-2">Lampiran Tugas</div>
    <div class="task-thumbnails d-flex flex-wrap">
      <span
        v-if="!task.attachments.length"
        class="font-weight-bolder font-size-lg pt-1 text-dark-50"
      >
        -
      </span>
      <a
        v-for="(attachment, i) in task.imageAttachments"
        href="#"
        :key="attachment.id"
        class="task-thumbnail-link position-relative mr-2"
        :title="`${attachment.name} - ${attachment.created_at}`"
        @click.prevent="openImageLightbox(i)"
      >
        <img
          :src="`/image-storage/${attachment.path}?w=75&h=75&fit=crop`"
          class="rounded task-thumbnail"
          :alt="attachment.name"
        />

        <div
          class="overlay rounded d-flex justify-content-center align-items-center"
        >
          <span class="svg-icon svg-icon-light svg-icon-xl">
            <inline-svg
              :src="`${$baseUrl}media/svg/icons/Design/ZoomPlus.svg`"
              title="View"
            >
            </inline-svg>
          </span>
        </div>
      </a>

      <a
        v-for="attachment in task.pdfAttachments"
        href="#"
        :key="attachment.id"
        class="task-thumbnail-link position-relative mr-2"
        :title="`${attachment.name} - ${attachment.created_at}`"
        @click.prevent="openPdfLightbox(`/auth-storage/${attachment.path}`)"
      >
        <img
          src="https://ik.imagekit.io/tsulatsitamim/tr:w-75,h-75/pdf_9quUp7qZJ9.png"
          class="rounded task-thumbnail"
          :alt="attachment.name"
        />
        <div
          class="overlay rounded d-flex justify-content-center align-items-center"
        >
          <span class="svg-icon svg-icon-light svg-icon-xl">
            <inline-svg
              :src="`${$baseUrl}media/svg/icons/Design/ZoomPlus.svg`"
              title="View"
            >
            </inline-svg>
          </span>
        </div>
      </a>

      <a
        v-for="attachment in task.otherAttachments"
        :key="attachment.id"
        class="task-thumbnail-link position-relative mr-2"
        :title="`${attachment.name} - ${attachment.created_at}`"
        :href="`/auth-storage/${attachment.path}`"
      >
        <img
          src="https://ik.imagekit.io/tsulatsitamim/tr:w-75,h-75/attachment_7lccXUDnc2M.png"
          class="rounded task-thumbnail"
          :alt="attachment.name"
        />

        <div
          class="overlay rounded d-flex justify-content-center align-items-center"
        >
          <span class="svg-icon svg-icon-light svg-icon-xl">
            <inline-svg
              :src="`${$baseUrl}media/svg/icons/Design/ZoomPlus.svg`"
              title="View"
            >
            </inline-svg>
          </span>
        </div>
      </a>
    </div>
    <div class="font-weight-bolder mb-2 mt-10">Laporan Tugas</div>
    <div class="task-thumbnails d-flex flex-wrap">
      <a
        href="#"
        class="task-thumbnail-link position-relative mr-2"
        :title="`${task.user.username}_laporan-tugas_${task.id}_${version}.pdf`"
        @click.prevent="
          openPdfLightbox(`/api/v2/tasks/${task.id}?pdf=true#toolbar=0`)
        "
      >
        <img
          src="https://ik.imagekit.io/tsulatsitamim/tr:w-75,h-75/pdf_9quUp7qZJ9.png"
          class="rounded task-thumbnail"
          alt="Laporan Tugas"
        />
        <div
          class="overlay rounded d-flex justify-content-center align-items-center"
        >
          <span class="svg-icon svg-icon-light svg-icon-xl">
            <inline-svg
              :src="`${$baseUrl}media/svg/icons/Design/ZoomPlus.svg`"
              title="View"
            >
            </inline-svg>
          </span>
        </div>
      </a>
    </div>
    <div ref="imageLightGallery"></div>
    <button
      ref="pdfLightGallery"
      class="d-none"
      data-iframe="true"
      :data-src="iframeUrl"
    >
      Open Iframe
    </button>
  </div>
</template>

<script>
import $ from 'jquery'
import moment from 'moment'
import 'lightgallery'
import 'lg-zoom'
import 'lg-thumbnail'
import 'lg-video'

export default {
  name: 'TaskAttachments',
  props: {
    task: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      iframeUrl: null,
    }
  },
  components: {},
  computed: {
    version() {
      return `${moment(this.task.due_at).format('YYYYMMDD')}_v${moment(
        this.task.updated_at
      ).format('YYYYMMDD')}`
    },
  },
  mounted() {
    $(this.$refs.imageLightGallery).on('onCloseAfter.lg', () => {
      $(this.$refs.imageLightGallery)
        .data('lightGallery')
        .destroy(true)
    })

    $(this.$refs.pdfLightGallery).lightGallery({
      selector: 'this',
    })
  },
  methods: {
    openImageLightbox(i) {
      $(this.$refs.imageLightGallery).lightGallery({
        index: i,
        dynamic: true,
        dynamicEl: this.task.imageAttachments.map(x => ({
          src: `/image-storage/${x.path}`,
          thumb: `/image-storage/${x.path}?w=75&h=75&fit=crop`,
          subHtml: `<h4>${x.name}</h4><p>${x.created_at}</p>`,
        })),
      })
    },
    openPdfLightbox(path) {
      this.iframeUrl = `${path}#toolbar=0`
      return setTimeout(() => {
        this.$refs.pdfLightGallery.click()
      }, 200)
    },
  },
}
</script>
