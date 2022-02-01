# agubot

**A**nother **G**eneral **U**sage Twitch **Bot** for the Pokémon Speedrunning Community

## Documentation

Here is a list of all default commands, their arguments, and a brief description of their purpose.

Commands with `(*)` in their title denote mod-only commands.

### Command (*)

Create, edit and delete (if they exist) custom commands with simple text outputs.

`!command <operation> <command> <output>`

* operation
  
  Single word.

  Can be one of:
  * add
  * edit
  * delete

* command
  
  Single word.

  Must start with `!` (such as `!shiny`, `!funny` or `!donate`).

* output

  Text

### Alias (*)

Create, edit and delete (if they exist) custom aliases that invoke other commands.

`!alias <operation> <alias> <command> [arguments]`

* operation
  
  Single word.

  Can be one of:
  * add
  * edit
  * delete

* alias
  
  Single word.

  Must start with `!` (such as `!shiny`, `!funny` or `!donate`).

* command

  Command name to invoke.

  Must exist and start with `!`.

* arguments

  Optional.

  Arguments to pass to `command`.

### Permission (*)

Create, edit and delete (if they exist) permissions for existing commands.

`!permission <role> <command>`

* role
  
  Single word.

  Can be one of:
  * vip
  * mod
  * broadcaster
  * delete
  
  Changing a command permission will make it available for the role specified or roles superior to it.
  Deleting the permission will make it available to everyone.

* command
  
  Command name to invoke.

  Must exist and start with `!`.

### Choose

Choose between two or more options at random.

`!choose option1 | option2 [| optionX]`

  All options must be separated by `|`.

### Expression

Evaluate a mathematical expression and output its result

`!expr <expression>`

### Red Bar Checker

Check if a given hp versus its given max hp would result in a red bar.

`!isRedBar <fraction>`

* fraction
  
  Fraction in the format `n/m`, such as `15/70`.

### Metronome

Output a random Pokémon move.

`!metronome`

### Random Pokémon

Output a random Pokémon move from generation `1` to the generation specified in the command.

`!randmon [generation]`

* generation
  
  Optional parameter. If not specified, defaults to `3`. Max value `8`.

### Roll

Generate a random number between `1` and `max`, both inclusive.

`!roll [max]`

* max
  
  Optional parameter. If not specified, defaults to `100`.

### Torrent Checker

Output the highest HP a water starter can have for it to be in torrent given a max hp `hp`.

`!torrent <hp>`

* hp
  
  Number. Must be a number between 4 and 714.

### Weather

Output the current forecast and temperature of a given city.

`!weather <city>`

* city
  
  Name of a city.

## Credit

Bot developed by Sizzle, with great inspiration from [Stringflow's](https://github.com/stringflow) original [twitch bot](https://github.com/stringflow/SenjougaharaBot).
