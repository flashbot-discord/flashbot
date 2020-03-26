const { Command } = require('discord.js-commando');
const i18n = require('i18n');

module.exports = class ActivateCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'activate',
            aliases: ['act', '활성화'],
            group: 'activation',
            memberName: 'activate',
            description: 'Activate this bot on the server',
            userPermissions: ['ADMINISTRATOR'],
            guildOnly: true
        });

        this.result = false;
        this.author = '';
    }

    async run(msg) {

        const mcFilter = (msg) => {
            if (this.author === msg.author.id) {
                if (msg.content.toLowerCase() !== 'yes' && msg.content.toLowerCase() !== 'no') return false;
                else if (msg.content.toLowerCase() === 'yes') this.result = true;
                else if (msg.content.toLowerCase() === 'no') this.result = false;
                return true;
            } else return false;
        };

        const rcFilter = (reaction, user) => {
            if (user.id === msg.author.id) {
                if (reaction.emoji.name !== '✅' && reaction.emoji.name !== '❌') return false;
                else if (reaction.emoji.name === '✅') this.result = true;
                else if (reaction.emoji.name === '❌') this.result = false;
                return true;
            } else return false;
        };

        const botMsg = await msg.channel.send(await i18n.__ll('commands.activate.execute.title', msg.guild) + '\n\n'
            + await i18n.__ll('commands.activate.execute.content', msg.guild) + '\n\n' + await i18n.__ll('commands.activate.execute.confirm', msg.guild));

        try {
            await botMsg.react('✅');
            await botMsg.react('❌');
        } catch (err) {
            await msg.channel.send(await i18n.__ll('commands.activate.execute.reactFail', msg.guild));
        }

        // Message Collector
        this.author = msg.author.id;
        const mc = msg.channel.createMessageCollector(mcFilter);
        mc.on('collect', () => {
            if (this.result) {
                this.agree(msg, mc, rc);
            } else {
                this.deny(msg, mc, rc);
            }
        });

        // Reaction Collector
        const rc = botMsg.createReactionCollector(rcFilter);
        rc.on('collect', () => {
            if (this.result) {
                this.agree(msg, rc, mc);
            } else {
                this.deny(msg, rc, mc);
            }
        });
    }

    async agree(msg, collector, collector2) {
        // Activation
        await console.log(`[Bot Activation] ${msg.author.tag} (${msg.member.nickname}) activated the bot in ${msg.guild.name}`);

        await msg.client.provider.set('guilds', msg.guild.id, {activated: true});

        // Done!
        await msg.channel.send(await i18n.__ll('commands.activate.execute.agree', msg.guild));
        collector.stop();
        collector2.stop();
    }

    async deny(msg, collector, collector2) {
        await msg.channel.send(await i18n.__ll('commands.activate.execute.deny', msg.guild));
        collector.stop();
        collector2.stop();
    }
}
