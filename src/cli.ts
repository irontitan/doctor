#!/usr/bin/env node

import caporal from 'caporal'
import { commands } from './commands'

async function setup () {
  for (const command of commands) {
    const prog = caporal.command(command.name, command.description)

    prog.option('-f, --file', 'Config file to override default')

    if (command.arguments) {
      for (const argument of command.arguments) {
        prog.argument(argument.name, argument.description)
      }
    }

    prog.action(command.handler as ActionCallback)
  }
}

setup()
  .then(() => {
    caporal.parse(process.argv)
  })
