/**
 * handle interaction
 * @param {import('discord.js').Client} client client
 * @param {import('discord.js').Interaction} interaction interaction
 */
async function onInteractionCreate (client, interaction) {
  // slash command handle WIP
  if (interaction.isCommand()) {
    // get command as usual
    // and pass it to CommandHandler

    const cmdName = interaction.commandName
    const cmd = client.commands.get(cmdName)
    if (cmd) {
      // TODO: maintenance mode text (like messageCreate event)
      client.commands.run(cmd, client, interaction)
    }
  } else if (interaction.isMessageComponent()) {
    // read custom id and get InteractionCommand

    // below task will? be moved to InteractionCommandHandler class

    // check if interaction session is valid
    // if not, create a new session (non-stateful command) or reject (stateful command)
    // statefulness is marked on InteractionCommand object

    // execute InteractionCommand
  }
}

module.exports = onInteractionCreate
