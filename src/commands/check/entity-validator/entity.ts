import chalk from 'chalk'
import { IEntityConfig } from '../../../structures/interfaces/IDoctorConfig'

const fail = chalk.red
const succeed = chalk.green

const eventEntityProof = [
  'persistedEvents',
  'pendingEvents',
  'id',
  'reducer',
  'state',
  'updateState',
  'setPersistedEvents',
  'pushNewEvents',
  'confirmEvents'
]

export default function ({ entity }: IEntityConfig, logger: Logger) {
  const entityInstance = new entity()

  const isValid = eventEntityProof.reduce((result, proof) => {
    const exists = entityInstance[proof] !== undefined

    logger.debug(`Checking if ${proof} exists: ${exists}`)

    return exists
      ? result
      : false
  }, true)

  return isValid
    ? succeed('Entity: OK')
    : fail('Entity: Failed - Entity is not an EventEntity')
}
