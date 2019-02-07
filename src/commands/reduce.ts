import moment from 'moment'
import caporal from 'caporal'
import { IEvent } from '@nxcd/tardis'
import { CommandError } from './errors/CommandError'
import { ICommand } from '../structures/interfaces/ICommand'
import { UnknownEntityError } from './errors/UnknownEntityError'

const TIME_PARSE_FORMAT = 'YYYY-MM-DD.HH:mm'
const TIME_DISPLAY_FORMAT = 'DD/MM/YYYY HH:mm'

const ignore = (ignored: string[], logger: Logger) => function (event: IEvent<any>): Boolean {
  const result = Array.isArray(ignored)
    ? !ignored.includes(event.id) && !ignored.includes(event.name)
    : event.id !== ignored && event.name !== ignored

  logger.debug(`${event.id} ignored: ${!result}`)

  return result
}

const keepUntil = (untilOption: string, logger: Logger) => {
  const until = moment(untilOption, TIME_PARSE_FORMAT).utc(true)

  if (!until.isValid()) throw new CommandError(`Ivalid date passed to 'until' option`)

  logger.debug(`Removing events that happened after ${until.format(TIME_DISPLAY_FORMAT)}`)

  return function (event: IEvent<any>) {
    const untilString = until.format(TIME_DISPLAY_FORMAT)
    const timestampString = moment(event.timestamp).utc().format(TIME_DISPLAY_FORMAT)
    const isBefore = moment(event.timestamp).isBefore(until)

    logger.debug(`${timestampString} is before ${untilString}: ${isBefore}`)

    return !isBefore
  }
}

function getId (event: IEvent<any>) {
  return event.id
}

const command: ICommand = {
  name: 'reduce',
  description: 'Reduces an entity and does something with its state',
  arguments: [
    {
      name: '<entity>',
      description: 'Name of the entity you want to reduce'
    },
    {
      name: '<id>',
      description: 'ID of the entity to be reduced'
    }
  ],
  options: [
    {
      name: '-i, --ignore <ignore>',
      description: 'Name(s) or ID(s) of events to ignore',
      validator: caporal.REPEATABLE
    },
    {
      name: '-u, --until <until>',
      description: `Ignore any events after this date (${TIME_PARSE_FORMAT})`
    },
    {
      name: '-s, --save',
      description: 'Save results to database',
      validator: caporal.BOOLEAN
    }
  ],
  async handler (config, args, options, logger) {
    logger.debug(`Received options: ${JSON.stringify(options)}`)

    const { entity: Entity = null, repository = null } = config.entities[ args.entity ] || {}

    if (!Entity || !repository) {
      throw new UnknownEntityError(args.entity)
    }

    logger.debug(`Found entity config for ${args.entity}`)

    const document = await repository.findById(args.id)

    if (!document) {
      throw new CommandError(`${args.entity} "${args.id}" was not found`)
    }

    if (!options.ignore && !options.until) {
      return JSON.stringify(document.state, null, 4)
    }

    const ignored = options.until
      ? document.persistedEvents.filter(keepUntil(options.until, logger)).map(getId)
      : options.ignore

    logger.debug('Filtering ignored event(s)')

    const events = document.persistedEvents.filter(ignore(ignored, logger))

    logger.debug(`Ignored ${document.persistedEvents.length - events.length} event(s)`)
    logger.debug(`Events array: ${JSON.stringify(events)}`)

    const newEntity = new Entity().setPersistedEvents(events)

    console.log(JSON.stringify(newEntity.state, null, 4))

    return 'Entity was reduced!'
  }
}

export default command
