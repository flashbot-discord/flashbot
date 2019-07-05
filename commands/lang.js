/**
 * @name lang.js
 * @description 설정된 언어 확인 및 변경
 */

const c = require('../classes');
const obj = new c.Command();

const i18n = require('i18n');

obj.name = 'lang';
obj.dev = false;
obj.callSign = ['lang', '언어'];

obj.args = [
    /**
     * language to change. shows current language when omitted.
     */
    new c.Args("language", false)
];

obj.execute = (msg, args) => {
    msg.reply('lang cmd test');

    /**
     * @todo For global changes only. In future, locales will be managed per guild using databases.
     */
    if(args.length < 1) {
        msg.channel.send(i18n.__('commands.lang.execute.get', i18n.getLocale()));
    } else {
        i18n.setLocale(args[0]);
        msg.channel.send(i18n.__('commands.lang.execute.set', args[0]));
    }
};

module.exports = obj;