/**
 * @name say.js
 * @description 사용자가 입력한 말을 따라 말하는 명령어입니다.
 */

const i18n = require('i18n');

const { Command } = require('discord.js-commando');

module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'say',
            aliases: ['말하기'],
            group: 'misc',
            memberName: 'say',
            description: 'Replies with a meow, kitty cat.',
            args: [
                {
                    key: 'input',
                    prompt: i18n.__('commands.say.execute.no_args'),
                    type: 'string'
                }
            ]
        });
    }

    run(msg, { input }) {
        return msg.channel.send(input);
    }
};