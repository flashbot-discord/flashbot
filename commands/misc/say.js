/**
 * @name say.js
 * @description 사용자가 입력한 말을 따라 말하는 명령어입니다.
 */

const i18n = require('i18n');

const BotCommand = require('../../utils/BotCommand');

module.exports = class SayCommand extends BotCommand {
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
                    prompt: 'TODO i18n',
                    type: 'string'
                }
            ]
        });
    }

    run(msg, input) {
        if (!super.run(msg)) return;

        return msg.channel.send(input);
    }
};