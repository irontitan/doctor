import { Db } from 'mongodb'
import validateEntity from './entity'
import validateCollection from './collection'
import validateRepository from './repository'
import { IEntityConfig } from '../../../structures/interfaces/IDoctorConfig'

function validate (entityConfig: IEntityConfig, mongodbConnection: Db, logger: Logger) {
  const results = [
    `    ${validateEntity(entityConfig, logger)}`,
    `    ${validateCollection(entityConfig, logger)}`
  ]

  if (entityConfig.repository) {
    results.push(`    ${validateRepository(entityConfig, mongodbConnection, logger)}`)
  }

  return results
}

export default { validate }
