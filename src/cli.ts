#!/usr/bin/env node

import path from 'path'
import caporal from 'caporal'
import check from './commands/check'
import { commands } from './commands'
const pkg = require('../package.json')
import mongodb from './data/connections/mongodb'
import { IDoctorConfig } from './structures/interfaces/IDoctorConfig'
import { IBuiltDoctorConfig } from './structures/interfaces/IBuiltDoctorConfig'
import { GenericRepository } from './data/repositories/GenericRepository';


caporal.version(pkg.version)
  .command(check.name, check.description)
  .action(check.handler)

async function buildConfig (fileName?: string): Promise<IBuiltDoctorConfig> {
  const rawConfig: IDoctorConfig = require(path.resolve(process.cwd(), fileName || './doctor.config.js'))

  const mongodbConnection = await mongodb.createConnection(rawConfig.mongodb)

  const config: IBuiltDoctorConfig = {
    mongodb: rawConfig.mongodb,
    entities: {}
  }

  for (const [entityName, entityConfig] of Object.entries(rawConfig.entities)) {
    const repository = entityConfig.repository
      ? entityConfig.repository(mongodbConnection)
      : new GenericRepository(mongodbConnection, entityConfig.entity, entityConfig.collection)

    config.entities[entityName] = {
      entity: entityConfig.entity,
      collection: entityConfig.collection,
      repository
    }
  }

  return config
}



async function setup () {
  for (const command of commands) {
    const prog = caporal.command(command.name, command.description)

    prog.option('-f, --file', 'Config file to override default')

    if (command.arguments && command.arguments.length) {
      for (const argument of command.arguments) {
        prog.argument(argument.name, argument.description)
      }
    }

    if (command.options && command.options.length) {
      for (const option of command.options) {
        prog.option(option.name, option.description, option.flag)
      }
    }

    prog.action(async (args, options, logger) => {
      const config = await buildConfig(options.file)

      await command.handler(config, args, options, logger)

      process.exit(0)
    })
  }
}

setup()
  .then(() => {
    caporal.parse(process.argv)
  })
