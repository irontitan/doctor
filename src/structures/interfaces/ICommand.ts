import { Db } from 'mongodb'

export interface IArgument {
  name: string,
  description: string
}

export interface IOption {
  name: string,
  description: string
}

export interface IMongoCommandHandler {
  (
    args: { [k: string]: any },
    options: { [k: string]: any },
    logger: Logger,
    mongodbConnection: Db
  ): void;
}

export interface ICommand {
  name: string,
  description: string,
  arguments?: IArgument[],
  commands?: ICommand[],
  handler: ActionCallback
}
