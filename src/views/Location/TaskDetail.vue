<template>
  <task-attachments :task="task"></task-attachments>
</template>

<script>
import TaskAttachments from '../Task/TaskAttachments'

export default {
  name: 'TaskList',
  props: {
    task: {
      type: Object,
      required: true,
    },
  },
  components: {
    TaskAttachments,
  },
}
</script>
