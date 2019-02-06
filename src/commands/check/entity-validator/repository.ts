import chalk from 'chalk'
import { Db } from 'mongodb'
import { IEntityConfig } from '../../../structures/interfaces/IDoctorConfig'

const fail = chalk.red
const succeed = chalk.green

export default function ({ repository }: IEntityConfig, mongodbConnection: Db, _logger: Logger) {
  if (!repository) throw new Error('repository is undefined. This should never have been called')

  const repositoryInstance = repository(mongodbConnection)

  if (!repositoryInstance.save || !repositoryInstance.findById) {
    return fail('Repository: Fail - Returned value does not seem to be an EventRepositoru')
  }

  return succeed('Repository: OK')
}
