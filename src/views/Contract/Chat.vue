<template>
  <b-card header="Diskusi" header-class="h4 text-center" no-body>
    <div class="card-body pt-0">
      <perfect-scrollbar ref="scroll" class="scroll" style="height: 400px;">
        <div class="messages p-5">
          <template v-for="message in messages">
            <!--begin::Message In-->
            <div
              v-if="!message.me"
              class="d-flex flex-column mb-5 align-items-start"
              :key="message.id"
            >
              <div class="d-flex align-items-center">
                <div>
                  <a
                    href="#"
                    class="text-dark-75 text-hover-primary font-weight-bold font-size-lg"
                    >{{ message.sender }}</a
                  >
                  <span class="text-muted font-size-sm ml-2">{{
                    message.time
                  }}</span>
                </div>
              </div>
              <div
                class="mt-2 rounded p-5 bg-light-success text-dark-50 font-weight-bold text-left max-w-600px message-content"
              >
                {{ message.content }}
              </div>
            </div>
            <!--end::Message In-->
            <!--begin::Message Out-->
            <div
              v-else
              class="d-flex flex-column mb-5 align-items-end"
              :key="message.id"
            >
              <div class="d-flex align-items-center">
                <div>
                  <span class="text-muted font-size-sm mr-2">{{
                    message.time
                  }}</span>
                  <a
                    href="#"
                    class="text-dark-75 text-hover-primary font-weight-bold font-size-lg"
                    >You</a
                  >
                </div>
              </div>
              <div
                class="mt-2 rounded p-5 bg-light-primary text-dark-50 font-weight-bold text-right max-w-600px message-content"
              >
                {{ message.content }}
              </div>
            </div>
            <!--end::Message Out-->
          </template>
        </div>
      </perfect-scrollbar>
    </div>
    <template #footer>
      <textarea
        v-model="message"
        class="form-control border-0 p-0"
        rows="2"
        placeholder="Type a message"
        @keydown.enter="handleEnter"
      ></textarea>
      <div class="d-flex align-items-center justify-content-end mt-5">
        <button
          type="button"
          class="btn btn-primary btn-md text-uppercase font-weight-bold chat-send py-2 px-6"
          @click="sendMessage"
        >
          Send
        </button>
      </div>
    </template>
  </b-card>
</template>

<script>
import axios from 'axios'
import { format } from 'timeago.js'
import { BCard } from 'bootstrap-vue'

export default {
  name: 'Chat',
  components: {
    BCard,
  },
  props: {
    validationId: {
      required: true,
    },
  },
  watch: {
    validationId() {
      this.messages = []
      this.getChats()
    },
  },
  data() {
    return {
      message: '',
      messages: [],
      interval: null,
    }
  },
  async mounted() {
    await this.getChats()
    this.interval = setInterval(() => {
      this.getChats()
    }, 5000)
  },
  beforeDestroy() {
    clearInterval(this.interval)
  },
  methods: {
    async getChats() {
      try {
        const { data } = await axios.get(
          `/messages?validationId=${this.validationId}`
        )
        const messages = data.map(message => ({
          id: message.id,
          me: this.$store.getters.authUser.id === message.user_id,
          content: message.message,
          time: format(message.created_at),
          sender: message.user.name,
        }))
        this.messages = messages

        this.$nextTick(() => {
          this.$refs.scroll.$el.scrollTop = document.querySelector(
            '.messages'
          ).offsetHeight
        })
      } catch (error) {
        this.$toast('Gagal mengambil diskusi', 'danger')
      }
    },
    handleEnter(e) {
      if (e.ctrlKey) {
        this.message = `${this.message}\n`
        return
      }
      this.sendMessage()
    },
    async sendMessage() {
      if (!this.message) {
        return
      }
      const newMessage = this.message
      this.messages.push({
        id: Date.now(),
        me: true,
        content: newMessage,
        time: 'just now',
      })
      setTimeout(() => {
        this.message = ''
      }, 100)
      this.$nextTick(() => {
        this.$refs.scroll.$el.scrollTop = document.querySelector(
          '.messages'
        ).offsetHeight
      })
      try {
        await axios.post('/messages', {
          message: newMessage,
          validation_id: this.validationId,
        })
      } catch (error) {
        this.$toast('Gagal mengirim pesan', 'danger')
      }
    },
  },
}
</script>

<style lang="scss">
.message-content {
  white-space: pre-line;
}
</style>
