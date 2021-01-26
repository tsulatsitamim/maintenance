import { pick } from 'ramda'
import moment from 'moment'

const localeDurationDate = (start, end) => {
  if (!start) {
    return '-'
  }

  const localeStart = moment(start).format('DD MMMM YYYY')
  if (!end) {
    return localeStart
  }

  const localeEnd = moment(end).format('DD MMMM YYYY')
  if (localeStart === localeEnd) {
    return localeStart
  }

  return `${localeStart} - ${localeEnd}`
}

export const taskMapper = task => ({
  ...pick(
    [
      'id',
      'status',
      'assignment_id',
      'description',
      'location',
      'name',
      'letter_number',
      'assignor_id',
      'members',
      'attachments',
      'user',
    ],
    task
  ),
  due_at: moment(task.due_at).toDate(),
  end_at: moment(task.end_at || task.due_at).toDate(),
  report: task.report ? task.report : '<p>&nbsp;</p>',
  attachments: task.attachments.map(attachment => {
    const is_image = /\.(jpe?g|png|gif|bmp|webp)$/i.test(attachment.name)
    return {
      ...attachment,
      is_image,
      path: `/image-storage/${attachment.path}/?w=170`,
      type: attachment.type === 2 || false,
    }
  }),
  goal_id: task.user_task_goal ? task.user_task_goal.goal.id : null,
  goal_period: task.user_task_goal
    ? moment(task.user_task_goal.goal.period).toDate()
    : new Date(),
  volume: task.user_task_goal ? task.user_task_goal.volume : 1,
})

export const mapTaskFromApi = x => ({
  ...x,
  duration: localeDurationDate(x.due_at, x.end_at),
  imageAttachments: x.attachments.filter(attachment =>
    /\.(jpe?g|png|gif|bmp|webp)$/i.test(attachment.name)
  ),
  pdfAttachments: x.attachments.filter(attachment =>
    /\.(pdf)$/i.test(attachment.name)
  ),
  otherAttachments: x.attachments.filter(
    attachment => !/\.(jpe?g|png|gif|bmp|webp|pdf)$/i.test(attachment.name)
  ),
})
