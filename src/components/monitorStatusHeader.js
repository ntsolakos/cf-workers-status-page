import config from '../../config.yaml'
import { locations } from '../functions/locations'

const classes = {
  green:
    'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-200 border-green-200 dark:border-green-700 shadow-sm',
  yellow:
    'bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-800 dark:from-yellow-900/30 dark:to-orange-900/30 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700 shadow-sm',
}

export default function MonitorStatusHeader({ kvMonitorsLastUpdate }) {
  let color = 'green'
  let text = config.settings.allmonitorsOperational

  if (!kvMonitorsLastUpdate.allOperational) {
    color = 'yellow'
    text = config.settings.notAllmonitorsOperational
  }

  return (
    <div className={`card mb-6 font-bold text-lg border-2 ${classes[color]}`}>
      <div className="flex flex-row justify-between items-center">
        <div className="flex items-center gap-2">
          <span className={color === 'green' ? 'text-2xl' : 'text-2xl'}>
            {color === 'green' ? '✓' : '⚠'}
          </span>
          {text}
        </div>
        {kvMonitorsLastUpdate.time && typeof window !== 'undefined' && (
          <div className="text-xs font-normal opacity-75">
            checked{' '}
            {Math.round((Date.now() - kvMonitorsLastUpdate.time) / 1000)} sec
            ago (from{' '}
            {locations[kvMonitorsLastUpdate.loc] || kvMonitorsLastUpdate.loc})
          </div>
        )}
      </div>
    </div>
  )
}
