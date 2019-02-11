Doctor
===
![stability-unstable](https://img.shields.io/badge/stability-unstable-yellow.svg)

Simple yet useful library to avoid manually manipulating event sourcing databases and [paradox](https://github.com/nxcd/paradox) / [tardis](https://github.com/nxcd/tardis) events and entities.
- [Doctor](#doctor)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Configuration file](#configuration-file)
      - [Structure](#structure)
    - [Important concepts](#important-concepts)
    - [Commands](#commands)
      - [Global params](#global-params)
      - [`help`](#help)
        - [Usage](#usage-1)
        - [Params](#params)
      - [`reduce`](#reduce)
        - [Usage](#usage-2)
        - [Params](#params-1)
      - [`check`](#check)
        - [Usage](#usage-3)
        - [Params](#params-2)
      - [`diff`](#diff)
        - [Usage](#usage-4)
        - [Params](#params-3)
      - [`entitites`](#entitites)
        - [Usage](#usage-5)
        - [Params](#params-4)
    - [TODO](#todo)
    - [Contributing](#contributing)

## Installation

The recommended way to install doctor is through npm:

```bash
npm i -g @nxcd/doctor
```

## Usage

### Configuration file

Doctor works based on a configuration file that defines your applications, with its entities and repositories. Besides that, this file provides all the information doctor needs to connect to your database.

The default filename is `doctor.config.js`. The CLI will look for this file in the current working directory every time you invoke it, unless you pass the `-f` or `--file` flag. See [global params](#global-params)

#### Structure

This is the minimum structure of a valid doctor configuration file:

```js
const Person = require('path/to/your/event-entity/class')
const PersonRepository = require('path/to/your/event-repository/class')

module.exports = {
  mongodb: {
    uri: process.env.DATABASE_MONGODB_URI,
    dbName: process.env.DATABASE_MONGODB_DBNAME
  },
  entities: {
    'person': {
      entity: Person,
      collection: 'people',
      repository: (mongodbConnection) => new PersonRepository(mongodbConnection)
  }
}
```

Breaking it down:
  - mongodb
    - uri:
      - Type: String
      - Description: Mongodb URI (including connection schema)
      - Example: `mongodb://localhost:27017`
      - Required: `true`
    - dbName:
      - Tyoe: String
      - Description: Mongodb database name
      - Example: `my-app`
      - Required: `true`
  - entities
    - [entity-name] : String
      - entity:
        - Type: EventEntity
        - Description: Constructor of the entity class
        - Required: `true`
      - collection
        - Type: String
        - Description: Name of the collection for this entity
        - Required: `true`
      - repository:
        - Type: Function
        - Description: Function that receives a connection to mongodb and returns a specific EventRepository **instance** that will be used for all operations for this entity
        - example:
        - required: `false`

### Important concepts

During following commands documentation, some concepts will be refered to. They are:

- Entity: The name of an entity, as described on the [config file](#configuration-file)
- Entity id: The unique ID of a document of given entity
- Event: The unique id of an event inside an `events` array, **or** an event name
- Timestamp: A date and, optionally, time, in the format `YYYY-MM-DD.HH:mm`, as [momentjs format tokens](https://momentjs.com/docs/#/parsing/string-format/)

### Commands

All following commands are invoked the same way:

```sh
doctor <command> [params]
```

#### Global params

All commands (except by `help`) accept the following params:

- `-f, --file`: Config file path. Overrides default `./doctor.config.js`
- `-f, --verbose`: Enables verbose output

#### `help`

Prints help about commands

##### Usage

```sh
doctor help [command]
```

##### Params
No params supported

#### `reduce`

Reduces the events of a given entity and returns its resulting state.

##### Usage
```sh
doctor reduce <entity> <entity-id> [--ignore <event>] [--until <timestamp>] [--save]
```

##### Params

- `-i, --ignore`: Ignores given event. Can be repeated to ignore more than one event.
- `-u, --until`: Ignores all events that happened after given timestamp. Takes precedence over `--ignore`.
- `-s, --save`: Saves the result to the database. This will ask for your confirmation before making any changes.

All [global params](#global-params) are supported

#### `check`

This command goes through you config file an tells you if it's ok and usable by doctor.

##### Usage

```sh
doctor check
```

##### Params
All global params are supported

#### `diff`

This command calculates the time difference (in hours) between the first occurence of an event and the last occurence of another event.

##### Usage

```sh
doctor diff <entity> <entity-id> <first-event> <last-event>
```

##### Params
All [global params](#global-params) are supported

#### `entitites`

This command lists all entities described by the [config file](#configuration-file)

##### Usage
```sh
doctor entities
```

##### Params
All [global params](#global-params) are supported

---

### TODO

- [ ] Write tests
- [ ] Add ability to reduce multiple entities and even collections at once
- [ ] Add ability to use custom script to manipulate entities
- [ ] Make mongodb connection not required
- [ ] Improve documentation about custom repositories

---

### Contributing

PRs are, as always, very welcome.

Just follow StandardJS, use pnpm, and make sure you code builds (`pnpm run build`) before submitting.
