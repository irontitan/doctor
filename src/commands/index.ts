import diff from './diff'
import reduce from './reduce'
import entities from './entities'
import { ICommand } from '../structures/interfaces/ICommand'

export const commands: ICommand[] = [
  diff,
  reduce,
  entities
]
