import chalk from 'chalk'
import ProgressBar from 'progress'
import { IEvent } from '@nxcd/paradox'
import { Cursor, ObjectId } from 'mongodb'
import { ICommand } from '../structures/interfaces/ICommand'
import { UnknownEntityError } from './errors/UnknownEntityError'

interface IPersistedEventEntity {
  events: IEvent<any>[],
  state: { id: ObjectId }
}

const PROGRESS_FORMAT = `Processing :current out of :total [${chalk.green(':bar')}] (:elapseds / :etas)`
const PROGRESS_CONFIG = {
  incomplete: ' ',
  complete: '\u2588',
  head: '\u2588'
}

const command: ICommand = {
  name: 'rebuild',
  description: 'Updates the state of an entire collection',
  arguments: [
    {
      name: '<collection>',
      description: 'Collection to be rebuilt'
    }
  ],
  async handler (config, args) {
    const entityConfig = config.getEntityConfig(args.collection)

    if (!entityConfig) throw new UnknownEntityError(args.collection)

    const collection = config.mongodbConnection.collection(entityConfig.collection)

    const cursor: Cursor<IPersistedEventEntity> = await collection.find()

    const progressBarOptions = {
      total: await cursor.count(),
      ...PROGRESS_CONFIG
    }

    const progressBar = new ProgressBar(PROGRESS_FORMAT, progressBarOptions)

    while(await cursor.hasNext()) {
      const document = await cursor.next()

      if (!document) {
        progressBar.tick()
        return
      }

      const entity = new entityConfig.entity().setPersistedEvents(document.events)

      await entityConfig.repository.save(entity)

      progressBar.tick()
    }

    cursor.close()
  }
}

export default command
