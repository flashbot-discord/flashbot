const BotCommand = require('../../utils/BotCommand');
const i18n = require('i18n');

module.exports = class DeactivateCommand extends BotCommand {
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
        if(!super.run(msg)) return;

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

        try {
            await botMsg.react('✅');
            await botMsg.react('❌');
        } catch (err) {
            await msg.channel.send(i18n.__('commands.deactivate.execute.reactFail'));
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
        await console.log(`[Bot Deactivation] ${msg.author.tag} (${msg.member.nickname}) deactivated the bot in ${msg.guild.name}`);

        await msg.client.provider.set(msg.guild, 'activate', false);

        // Done!
        await msg.channel.send(i18n.__('commands.deactivate.execute.agree'));
        collector.stop();
        collector2.stop();
    }

    async deny(msg, collector, collector2) {
        await msg.channel.send(i18n.__('commands.deactivate.execute.deny'));
        collector.stop();
        collector2.stop();
    }
}