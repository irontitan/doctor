import { Db } from 'mongodb'
import validateEntity from './entity'
import validateCollection from './collection'
import validateRepository from './repository'
import { IEntityConfig } from '../../../structures/interfaces/IDoctorConfig'

async function validate (entityConfig: IEntityConfig, mongodbConnection: Db, logger: Logger) {
  const entity = await validateEntity(entityConfig, logger)
  const collection = await validateCollection(entityConfig, mongodbConnection, logger)
  const repository = await validateRepository(entityConfig, mongodbConnection, logger)

  return entity && collection && repository
}

export default { validate }
