import IMongoParams from './IMongoParams'
import { EventRepository, IEvent, EventEntity } from '@nxcd/paradox'

export interface IEntityConstructor<Entity> {
  new (events?: IEvent<any>[]): Entity;
}

export interface IBuiltEntityConfig {
  idField?: string
  collection: string
  entity: IEntityConstructor<any>
  repository: EventRepository<EventEntity<any>>
}

export interface IBuiltDoctorConfig {
  mongodb: IMongoParams,
  entities: {
    [entityName: string]: IBuiltEntityConfig
  }
}
