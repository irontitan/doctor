import chalk from 'chalk'
import { IEntityConfig } from '../../../structures/interfaces/IDoctorConfig'

const fail = chalk.red
const succeed = chalk.green

export default function ({ collection }: IEntityConfig, _logger: Logger) {
  return collection
    ? succeed('Collection: OK')
    : fail('Collection: Failed - No collection provided')
}
