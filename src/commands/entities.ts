import { ICommand } from '../structures/interfaces/ICommand'

const command: ICommand = {
  name: 'entities',
  description: 'Lists all entities found in the configuration file',
  async handler (config, _args, _options, _logger) {
    return ['Registered entities:']
      .concat(Object.keys(config.entities).map((name) => `  - ${name}`))
      .join('\n')
  }
}

export default command
