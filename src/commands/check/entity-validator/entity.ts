import ora from 'ora'
import { IEntityConfig } from '../../../structures/interfaces/IDoctorConfig'

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
  const spinner = ora('Entity').start()
  const entityInstance = new entity()

  const isValid = eventEntityProof.reduce((result, proof) => {
    const exists = (entityInstance as any)[proof] !== undefined

    logger.debug(`Checking if ${proof} exists: ${exists}`)

    return exists
      ? result
      : false
  }, true)

  if (isValid) {
    spinner.succeed('Entity')
    return true
  }

  spinner.fail('Entity: Entity is not an EventEntity')
  return false
}
