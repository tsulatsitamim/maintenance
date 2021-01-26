import { BVToastPlugin } from 'bootstrap-vue'

const defaultTitle = {
  success: 'Success',
  danger: 'Error',
}

const parseMessage = message => {
  if (!(message instanceof Error)) {
    return message
  }

  if (message.response) {
    if (message.response.data.message) {
      return message.response.data.message
    }
    return message.response.data
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log(message)
  }
  return message.toString() || 'Unexpected error has occured!'
}

const Toast = {
  install(VueInstance) {
    VueInstance.use(BVToastPlugin)
    VueInstance.prototype.$toast = function(
      message,
      variant = 'success',
      title = ''
    ) {
      const renderedTitle = title || defaultTitle[variant] || ''
      this.$bvToast.toast(parseMessage(message), {
        title: renderedTitle,
        variant: variant,
        solid: true,
        // noCloseButton: true,
      })
    }
  },
}

export default Toast
