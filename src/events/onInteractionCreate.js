/**
 * handle interaction
 * @param {import('discord.js').Client} client client
 * @param {import('discord.js').Interaction} interaction interaction
 */
async function onInteractionCreate (client, interaction) {
  // slash command handle WIP
  if (interaction.isCommand()) {

  }
}

module.exports = onInteractionCreate
