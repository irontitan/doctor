import { CommandError } from './CommandError'

export class UnknownEntityError extends CommandError {
  constructor (entityName: string) {
    super(`Unknown entity or collection "${entityName}"`)
  }
}
