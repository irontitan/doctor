import IMongoParams from './IMongoParams'
import { EventRepository, IEvent, EventEntity } from '@irontitan/paradox'

export interface IEntityConstructor<Entity> {
  new (events?: IEvent<any>[]): Entity;
}

export interface IBuiltEntityConfig {
  idField?: string
  collection: string
  entity: IEntityConstructor<EventEntity<unknown>>
  repository: EventRepository<EventEntity<unknown>>
}

export interface IBuiltDoctorConfig {
  mongodb: IMongoParams,
  entities: {
    [entityName: string]: IBuiltEntityConfig
  }
}
