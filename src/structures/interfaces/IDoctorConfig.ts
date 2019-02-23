import IMongoParams from './IMongoParams'
import { EventRepository, EventEntity, IEvent } from '@nxcd/paradox'

export interface IEntityConstructor<Entity> {
  new (events?: IEvent<any>[]): Entity;
}

export interface IEntityConfig {
  idField?: string
  collection: string
  entity: IEntityConstructor<EventEntity<unknown>>
  repository? (mongodbConnection: any): EventRepository<EventEntity<any>>
}

export interface IDoctorConfig {
  mongodb: IMongoParams,
  entities: {
    [entityName: string]: IEntityConfig
  }
}
