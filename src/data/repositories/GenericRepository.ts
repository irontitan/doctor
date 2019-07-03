import { Db } from 'mongodb'
import { EventEntity, MongodbEventRepository } from '@irontitan/paradox'
import { IEntityConstructor } from '../../structures/interfaces/IBuiltDoctorConfig'

export class GenericRepository extends MongodbEventRepository<EventEntity<any>> {
  constructor(connection: Db, entity: IEntityConstructor<EventEntity<any>>, collection: string) {
    super(connection.collection(collection), entity)
  }
}
