import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import entityValidator from './entity-validator'
import mongodb from '../../data/connections/mongodb'
import { ICommand } from "../../structures/interfaces/ICommand"
import { IDoctorConfig } from '../../structures/interfaces/IDoctorConfig'

const fail = chalk.red

async function exists (fileName: string) {
  return new Promise ((resolve) => {
    fs.stat(fileName, (err) =>{
      if (err) return resolve(false)
      resolve(true)
    })
  })
}

const command: ICommand = {
  name: 'check',
  description: "Diagnoses you project and tells if it's OK",
  async handler (_args, options, logger) {
    const configFile = path.resolve(process.cwd(), options.file || './doctor.config.js')

    if (!await exists(configFile)) {
      return logger.error(fail('[fatal] Config file does not exist'))
    }

    const config: IDoctorConfig = require(configFile)

    if (!config.entities || !Object.keys(config.entities).length) {
      return logger.error(fail('[fatal] No entities configured'))
    }

    if (!config.mongodb) {
      return logger.error(fail('[fatal] No mongodb connection configuration provided'))
    }

    const mongodbConnection = await mongodb.createConnection(config.mongodb)

    console.log('Begginning entity validation\n')

    for (const [entityName, entity] of Object.entries(config.entities)) {
      const text = [
        chalk.cyan(`  ${entityName}:`),
        ...entityValidator.validate(entity, mongodbConnection, logger)
      ]

      console.log(text.join('\n'))

      process.exit(0)
    }
  }
}

export default command
