import { IBuiltDoctorConfig } from './IBuiltDoctorConfig'

export interface IArgument {
  name: string,
  description: string
}

export interface IOption {
  name: string,
  description: string,
  flag?: any
}

export interface IMongoCommandHandler {
  (
    config: IBuiltDoctorConfig,
    args: { [k: string]: any },
    options: { [k: string]: any },
    logger: Logger
  ): Promise<string | void>;
}

export interface ICommand {
  name: string,
  description: string,
  arguments?: IArgument[],
  options?: IOption[],
  handler: IMongoCommandHandler
}
