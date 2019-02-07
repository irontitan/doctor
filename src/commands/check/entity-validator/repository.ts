import ora from 'ora'
import { Db } from 'mongodb'
import { IEntityConfig } from '../../../structures/interfaces/IDoctorConfig'

export default function ({ repository }: IEntityConfig, mongodbConnection: Db, _logger: Logger) {
  const spinner = ora({ spinner: 'clock', text: 'Repository' }).start()

  if (!repository) {
    spinner.info('Repository: No custom repository provided. Using generic one')
    return true
  }

  const repositoryInstance = repository(mongodbConnection)

  if (!repositoryInstance.save || !repositoryInstance.findById) {
    spinner.fail('Repository: Returned value does not seem to be an EventRepository')
    return false
  }

  spinner.succeed('Repository')
  return true
}
