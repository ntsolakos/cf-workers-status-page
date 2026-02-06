import config from '../../config.yaml'

const classes = {
  gray: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600',
  green: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-700 shadow-sm',
  yellow:
    'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700 shadow-sm',
}

export default function MonitorStatusLabel({ kvMonitor }) {
  let color = 'gray'
  let text = 'No data'

  if (typeof kvMonitor !== 'undefined') {
    if (kvMonitor.lastCheck.operational) {
      color = 'green'
      text = config.settings.monitorLabelOperational
    } else {
      color = 'yellow'
      text = config.settings.monitorLabelNotOperational
    }
  }

  return <div className={`pill leading-5 ${classes[color]}`}>{text}</div>
}
