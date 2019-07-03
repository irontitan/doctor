import ora from 'ora'
import chalk from 'chalk'
import moment from 'moment'
import caporal from 'caporal'
import inquirer from 'inquirer'
import prettyjson from 'prettyjson'
import { IEvent } from '@irontitan/tardis'
import { CommandError } from './errors/CommandError'
import { EventEntity, EventRepository } from '@irontitan/paradox'
import { ICommand } from '../structures/interfaces/ICommand'
import { UnknownEntityError } from './errors/UnknownEntityError'
import { IEntityConstructor } from '@irontitan/paradox/dist/interfaces/IEntityConstructor'

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

async function reduceEntity (args: {[key: string]: any}, options: {[key: string]: any}, logger: Logger, Entity: IEntityConstructor<EventEntity<any>>, pretty: (value: any) => string, repository: EventRepository<EventEntity<any>>) {
  const document = await repository.findById(args.id)

  if (!document) {
    throw new CommandError(`${args.entity} "${args.id}" was not found`)
  }

  if (!options.ignore && !options.until) {
    return document
  }

  const ignored = options.until
    ? document.persistedEvents.filter(keepUntil(options.until, logger)).map(getId)
    : options.ignore

  logger.debug('Filtering ignored event(s)')

  const events = document.persistedEvents.filter(ignore(ignored, logger))

  logger.debug(`Ignored ${document.persistedEvents.length - events.length} event(s)`)
  logger.debug(`Events array: ${pretty(events)}`)

  const newEntity: EventEntity<any> = new Entity().setPersistedEvents(events)

  return newEntity
}

function formatEvent (event: IEvent<EventEntity<any>>) {
  if (event.data.id && event.data.id.toHexString) {
    event.data.id = event.data.id.toHexString()
  }

  return {
    ...event,
    timestamp: moment(event.timestamp).utc().format('DD/MM/YYYY HH:mm:ss'),
    name: chalk.blue(event.name)
  }
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
    },
    {
      name: '-j, --json',
      description: 'Print valid JSON results',
      validator: caporal.BOOLEAN
    }
  ],
  async handler (config, args, options, logger) {
    const pretty = options.json
      ? (value: any) => JSON.stringify(value, null, 4)
      : prettyjson.render

    const spinner = ora('Manipulating space and time... Please, hold on.').start()
    logger.debug(`\nReceived options: ${pretty(options)}`)
    logger.debug(`Received arguments: ${pretty(args)}`)

    const { entity: Entity = null, repository = null } = config.entities[ args.entity ] || {}

    if (!Entity || !repository) {
      throw new UnknownEntityError(args.entity)
    }

    logger.debug(`Found entity config for ${args.entity}`)

    spinner.text = 'Reducing entity'
    const document = await reduceEntity(args, options, logger, Entity, pretty, repository)
    spinner.stop()

    const stringId = document.state.id && document.state.id.toHexString
      ? document.state.id.toHexString()
      : document.state.id

    const stateString = pretty({ ...document.state, id: stringId})

    if (!options.save) {
      return stateString
    }

    console.error(chalk.blue('Resulting state:'))
    console.error(stateString)
    console.error('\n\n')
    console.error(chalk.blue('\Resulting events array:'))
    console.error(pretty(document.persistedEvents.map(formatEvent)))

    const { proceed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message: `Would you like to save these results to the database? ${chalk.bold.red('THIS CANNOT BE UNDONE')}`,
        default: false
      }
    ])

    if (proceed) {
      spinner.text = 'Saving results to database'
      // spinner.start()
      await repository.save(document, true)
      // spinner.succeed('Done. Result saved to the database')
      return
    }

    spinner.info('Done. Nothing was persisted')
    return
  }
}

export default command
