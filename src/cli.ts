#!/usr/bin/env node

import path from 'path'
import chalk from 'chalk'
import caporal from 'caporal'
import check from './commands/check'
import { commands } from './commands'
const pkg = require('../package.json')
import { DoctorConfig } from './DoctorConfig'
import mongodb from './data/connections/mongodb'
import { CommandError } from './commands/errors/CommandError'
import { IDoctorConfig } from './structures/interfaces/IDoctorConfig'
import { UnknownEntityError } from './commands/errors/UnknownEntityError'

caporal.version(pkg.version)
  .command(check.name, check.description)
  .action(check.handler)

async function buildConfig (fileName?: string): Promise<DoctorConfig> {
  const rawConfig: IDoctorConfig = require(path.resolve(process.cwd(), fileName || './doctor.config.js'))

  const mongodbConnection = await mongodb.createConnection(rawConfig.mongodb)

  return new DoctorConfig(rawConfig, mongodbConnection)
}

async function setup () {
  for (const command of commands) {
    const prog = caporal.command(command.name, command.description)

    prog.option('-f, --file <file>', 'Config file to override default', caporal.STRING, './doctor.config.js')
    prog.option('-v, --verbose', 'Verbose mode - will also output debug messages')

    if (command.arguments && command.arguments.length) {
      for (const argument of command.arguments) {
        prog.argument(argument.name, argument.description)
      }
    }

    if (command.options && command.options.length) {
      for (const option of command.options) {
        prog.option(option.name, option.description, option.validator)
      }
    }

    prog.action(async (args, options, logger) => {
      const config = await buildConfig(options.file)

      await command.handler(config, args, options, logger)
        .then(result => {
          if (result) {
            console.log(result)
          }
          process.exit(0)
        })
        .catch(err => {
          if (err instanceof UnknownEntityError) {
            console.error(err.message)
            console.error('Registered entities:\n')
            console.error(Object.keys(config.entities).map(name => ` - ${name}`).join('\n'))
            process.exit(1)
          }

          const text = err instanceof CommandError
            ? err.message
            : err

          if (options.verbose) {
            console.error(err)
            process.exit(1)
          }

          console.error(chalk.red(text))
          process.exit(1)
        })
    })
  }
}

setup()
  .then(() => {
    caporal.parse(process.argv)
  })
