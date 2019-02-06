import chalk from 'chalk'
import caporal from 'caporal'
import { ICommand } from '../structures/interfaces/ICommand'

const command: ICommand = {
  name: 'reduce',
  description: 'Reduces an entity and does something with its state',
  arguments: [{
    name: '<entity>',
    description: 'Name of the entity you want to reduce'
  }, {
    name: '<id>',
    description: 'ID of the entity to be reduced'
  }],
  options: [{
    name: '-i, --ignore',
    description: 'Ignores event with given id',
    flag: caporal.REPEATABLE
  }],
  async handler (config, args, options, logger) {
    console.log(options)
    const entityConfig = config.entities[args.entity]

    if (!entityConfig) {
      return logger.error(chalk.red(`Unknown entity "${args.entity}"`))
    }

    const document = await entityConfig.repository.findById(args.id)

    if (!document) {
      return logger.error(chalk.red(`${args.entity} "${args.id} was not found]"`))
    }

    if (!options.ignore) {
      console.log(JSON.stringify(document.state, null, 4))
    }
  }
}

export default command
