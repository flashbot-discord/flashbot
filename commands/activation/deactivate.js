const { Command } = require('discord.js-commando');
const i18n = require('i18n');

module.exports = class DeactivateCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'deactivate',
            aliases: ['deact', '비활성화'],
            group: 'activation',
            memberName: 'deactivate',
            description: 'Deactivate this bot on the server',
            userPermissions: ['ADMINISTRATOR'],
            guildOnly: true
        })
    }

    async run(msg) {
        // msg.client.provider.set(msg.guild, 'activate', false);

        const mcFilter = (msg) => {
            if(this.author === msg.author.id) {
                if(msg.content.toLowerCase() !== 'yes' && msg.content.toLowerCase() !== 'no') return false;
                else if(msg.content.toLowerCase() === 'yes') this.result = true;
                else if(msg.content.toLowerCase() === 'no') this.result = false;
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

        const botMsg = await msg.channel.send(i18n.__('commands.deactivate.execute.title') + '\n\n' + i18n.__('commands.deactivate.execute.content') + "\n\n" + i18n.__('commands.deactivate.execute.confirm'));

        await botMsg.react('✅');
        await botMsg.react('❌');

        // Message Collector
        this.author = msg.author.id;
        const mc = msg.channel.createMessageCollector(mcFilter);
        mc.on('collect', () => {
            if (this.result) {
                this.agree(msg, mc);
            } else {
                this.deny(msg, mc);
            }
        });

        // Reaction Collector
        const rc = botMsg.createReactionCollector(rcFilter);
        rc.on('collect', () => {
            if (this.result) {
                this.agree(msg, rc);
            } else {
                this.deny(msg, rc);
            }
        });
    }

    async agree(msg, collector) {
        // Activation
        await console.log(`[Bot Activation] ${msg.author.tag} (${msg.member.nickname}) activated the bot in ${msg.guild.name}`);

        await msg.client.provider.set(msg.guild, 'activate', false);

        // Done!
        await msg.channel.send(i18n.__('commands.deactivate.execute.agree'));
        await collector.stop();
    }

    async deny(msg, collector) {
        await msg.channel.send(i18n.__('commands.deactivate.execute.deny'));
        await collector.stop();
    }
}