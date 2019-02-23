import { Db } from 'mongodb'
import IMongoParams from './structures/interfaces/IMongoParams'
import { IDoctorConfig } from './structures/interfaces/IDoctorConfig'
import { GenericRepository } from './data/repositories/GenericRepository'
import { IBuiltDoctorConfig, IBuiltEntityConfig } from './structures/interfaces/IBuiltDoctorConfig'

export class DoctorConfig implements IBuiltDoctorConfig {
  public readonly mongodb: IMongoParams
  public readonly mongodbConnection: Db
  public readonly entities: { [ entityName: string ]: IBuiltEntityConfig } = {}

  constructor (config: IDoctorConfig, mongodbConnection: Db) {
    this.mongodb = config.mongodb
    this.mongodbConnection = mongodbConnection

    for (const [ entityName, entityConfig ] of Object.entries(config.entities)) {
      const repository = entityConfig.repository
        ? entityConfig.repository(mongodbConnection)
        : new GenericRepository(mongodbConnection, entityConfig.entity, entityConfig.collection)

      this.entities[ entityName ] = {
        entity: entityConfig.entity,
        collection: entityConfig.collection,
        repository
      }
    }
  }

  getEntityConfig (entityOrCollection: string) {
    const entityConfig = Object.entries(this.entities).find(([ entityName, entityConfig ]) => {
      return [entityName, entityConfig.collection].includes(entityOrCollection)
    })

    if (!entityConfig) return null

    return entityConfig[1]
  }
}
