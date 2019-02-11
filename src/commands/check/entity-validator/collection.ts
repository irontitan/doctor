import ora from 'ora'
import { Db } from 'mongodb'
import { IEntityConfig } from '../../../structures/interfaces/IDoctorConfig'

export default async function ({ collection }: IEntityConfig, mongodbConnection: Db, _logger: Logger) {
  const spinner = ora('Collection').start()

  const collections = await mongodbConnection.listCollections(undefined, { nameOnly: true }).toArray()
    .then(collections => collections.map(({ name }) => name))

  if (!collections.includes(collection)) {
    spinner.fail('Collection: Provided collection does not exist')
    return false
  }

  spinner.succeed('Collection')
  return true
}
