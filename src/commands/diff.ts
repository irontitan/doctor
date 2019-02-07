import moment from 'moment'
import { CommandError } from './errors/CommandError'
import { ICommand } from '../structures/interfaces/ICommand'
import { UnknownEntityError } from './errors/UnknownEntityError'

const command: ICommand = {
  name: 'diff',
  description: 'Calculates de difference between two events of a given entity',
  arguments: [
    {
      name: '<entity>',
      description: 'Entity to use',
    },
    {
      name: '<id>',
      description: 'ID of the document'
    },
    {
      name: '<from>',
      description: 'Name of the first event'
    },
    {
      name: '<to>',
      description: 'Name of the last event'
    }
  ],
  async handler (config, args, _options, _logger) {
    const { entity: Entity = null, repository = null} = config.entities[args.entity] || {}

    if (!Entity || !repository) {
      throw new UnknownEntityError(args.entity)
    }

    const document = await repository.findById(args.id)

    if (!document) {
      throw new CommandError(`${args.entity} "${args.id}" was not found`)
    }

    const firstEvent = document.persistedEvents.find(({ id, name }) => (id === args.from) || (name === args.from))

    if (!firstEvent) {
      throw new CommandError(`Event "${args.from}" not found in array of given entity`)
    }

    const lastEvent = [ ...document.persistedEvents ].reverse().find(({ id, name }) => (id === args.to) || (name === args.to))

    if (!lastEvent) {
      throw new CommandError(`Event "${args.to}" not found in array of given entity`)
    }

    const firstMoment = moment(firstEvent.timestamp).utc()
    const lastMoment = moment(lastEvent.timestamp).utc()

    return `${lastEvent.name} happened ${lastMoment.diff(firstMoment, 'hours')} hours after ${firstEvent.name}`
  }
}

export default command
