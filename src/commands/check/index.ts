import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import entityValidator from './entity-validator'
import mongodb from '../../data/connections/mongodb'
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

const command = {
  name: 'check',
  description: "Diagnoses you project configuration and tells if it's OK",
  async handler (_args: { [key: string]: any }, options: { [key: string]: any }, logger: Logger) {
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

    console.error('Begginning entity validation\n')

    const mongodbConnection = await mongodb.createConnection(config.mongodb)

    let hasInvalidEntity = false

    for (const [entityName, entity] of Object.entries(config.entities)) {
      console.log(chalk.cyan.bold(entityName))

      const isEntityValid = await entityValidator.validate(entity, mongodbConnection, logger)

      if (!isEntityValid) {
        hasInvalidEntity = true
      }

      console.log('')
    }

    const text = hasInvalidEntity
      ? chalk.red("Uh... You'll need to fix that before we can travel through time")
      : chalk.green("Great! We're good to go :D")

    console.error(text)

    process.exit(hasInvalidEntity ? 1 : 0)
  }
}

export default command
