const Discord = require('discord.js');
const config = require('../config.json');

const c = require('../classes');
const obj = new c.Command();

const i18n = require('i18n');
/**
 * @name help.js
 * @description 도움말
 */

/**
 * @type {Map<string>}
 */
var cmdMap;

/**
 * 도움말을 가져옵니다.
 * @param {string} cmd 명령어
 * @returns {string} 
 * @private
 */
function getHelp(cmd) {
    const obj = cmdMap.get(cmd);
    return `\`${obj.name}\` - ${i18n.__(obj.desc)}\n`;
}

/**
 * 도움말 객체를 가져옵니다.
 * @param {string} cmd 명령어
 * @private
 */
function getHelpObj(cmd) {
    return cmdMap.get(cmd);
}

/**
 * 명령어의 별칭을 텍스트로 변환합니다.
 * @param {string[]} callSign 별칭 배열
 * @returns {string} 별칭을 `,`로 나눠놓은 문장
 * @private
 */
function formatAliases(callSign) {
    let str = '';
    callSign.forEach((val, index) => {
        if (index > 0) {
            str = str + ', ';
        }
        str = str + val;
    });
    return str;
}

/**
 * 명령어의 인수 정보를 텍스트로 변환합니다.
 * @param {Object[]} args 인수 정보 배열
 * @returns {string} 인수 정보 변환 결과
 */
function formatArgs(args) {
    if (args.length < 1) {
        /**
         * No arguments.
         */
        return i18n.__('commands.help.func_formatArgs.no_args') + '\n';
    }

    let str = '';
    args.forEach((val) => {
        str = str + '`' + val.name + '` - ' + val.must ? /* **필수.** */i18n.__('commands.help.func_formatArgs.must') : /* 선택. */i18n.__('commands.help.func_formatArgs.optional') + i18n.__(val.desc) + '\n'
    });

    return str;
}

obj.name = 'help';
/**
 * FlashBot의 도움말을 보여줍니다.
 */
obj.desc = 'commands.help.desc';
obj.dev = false;
obj.callSign = ['help', '도움말'];

obj.args = [
    /**
     * "명령어", "세부 도움말을 볼 명령어"
     */
    new c.Args('commands.help.args.0.name', 'commands.help.args.0.desc', false)
];

/**
 * @param {Message} msg
 * @param {Array<string>} args
 * @param {Map<string>} _cmdMap
 * @param {boolean} dev 개발자 모드
 */
obj.execute = (msg, args, _cmdMap, dev) => {
    cmdMap = _cmdMap;

    if (args.length < 1) {
        const embed = new Discord.RichEmbed();

        /**
         * FlashBot 도움말
         */
        const title = i18n.__('commands.help.execute.title');
        /**
         * 이 봇은 아무 명령어 입력도 없을 시 30분~1시간 뒤에 꺼집니다.
         * 만약 봇의 접속이 끊겼을 경우, 위의 링크로 들어가면 봇이 켜집니다.
         * 
         * 아래에서 모든 명령어들을 볼 수 있습니다.
         * 명령어에 대한 자세한 정보는 `%s명령어`를 입력하세요. | %s = config.prefix
         * (예: `%shelp ping`) | %s = config.prefix
         */
        const desc = i18n.__('commands.help.execute.desc', config.prefix, config.prefix);
        /**
         * 이 봇은 아무 명령어 입력도 없을 시 30분~1시간 뒤에 꺼집니다.
         * 만약 봇의 접속이 끊겼을 경우, http://flashbot-discord.herokuapp.com 으로 들어가면 봇이 켜집니다.
         * 
         * 아래에서 모든 명령어들을 볼 수 있습니다.
         * 명령어에 대한 자세한 정보는 `%s명령어`를 입력하세요. | %s = config.prefix
         * (예: `%shelp ping`) | %s = config.prefix
         */
        const desc_noEmbed = i18n.__('commands.help.execute.desc_noEmbed', config.prefix, config.prefix);

        embed.setTitle(title)
            .setURL('http://flashbot-discord.herokuapp.com')
            .setAuthor('FlashBot')
            .setDescription(desc)
            .addField('기타', getHelp('ping') + getHelp('beep') + getHelp('serverinfo') + getHelp('userinfo'));
        if (dev) {
            embed.addField('테스트', getHelp('eval') + getHelp('args-info') + getHelp('reload'));
            embed.setFooter(`현재 버전: ${config.version} (${config.build_date}) - 개발자 모드`);
        } else {
            embed.setFooter(`현재 버전: ${config.version} (${config.build_date})`);
        }

        msg.channel.send({ embed }).catch(() => {
            let msgTemp = '```링크 첨부 권한이 없어 embed 형식의 도움말을 표시할 수 없으므로 텍스트로 대신하겠습니다.\n'
                + '(이 알림을 끄는 기능은 현재 개발 중)```\n'
                + desc_noEmbed
                + '**기타**\n' + getHelp('ping') + getHelp('beep') + getHelp('serverinfo') + getHelp('userinfo') + '\n';
            if (dev) {
                msgTemp = msgTemp + '**테스트**\n' + getHelp('eval') + getHelp('args-info') + getHelp('reload') + '\n'
                    + `현재 버전: \`${config.version}\` (${config.build_date}) - 개발자 모드`;
            } else {
                msgTemp = msgTemp + `현재 버전: \`${config.version}\` (${config.build_date})`;
            }
            msg.channel.send(msgTemp);
        });
    } else {
        const obj = getHelpObj(args[0]);
        if (!obj) {
            /**
             * 해당 명령어가 존재하지 않습니다.
             */
            return msg.reply(i18n.__('commands.help.execute.cmdHelp.no_cmd'));
        }
        const embed = new Discord.RichEmbed();
        /**
         * `%s`에 대한 도움말 | %s = obj.name
         */
        const title = i18n.__('commands.help.execute.cmdHelp.result.title', obj.name);
        /**
         * **`%s`에 대한 도움말** | %s = obj.name
         */
        const title_noEmbed = i18n.__('commands.help.execute.cmdHelp.result.title_noEmbed', obj.name);
        const args = i18n.__('commands.help.execute.cmdHelp.result.args'); // 인수
        const aliases = i18n.__('commands.help.execute.cmdHelp.result.aliases'); // 별칭
        const args_noEmbed = i18n.__('commands.help.execute.cmdHelp.result.args_noEmbed'); // 인수: 
        const aliases_noEmbed = i18n.__('commands.help.execute.cmdHelp.result.aliases_noEmbed'); // 별칭: 
        embed.setTitle(title)
            .setDescription(obj.desc)
            /**
             * 인수
             */
            .addField(args, formatArgs(obj.args))
            /**
             * 별칭
             */
            .addField(aliases, formatAliases(obj.callSign));

        msg.channel.send(embed).catch(() => {
            const msgTemp = '```링크 첨부 권한이 없어 embed 형식의 도움말을 표시할 수 없으므로 텍스트로 대신하겠습니다.\n'
                + '(이 알림을 끄는 기능은 현재 개발 중)```\n'
                + title_noEmbed + `\n\n${obj.desc}\n\n${args_noEmbed}\n${formatArgs(obj.args)}\n${aliases_noEmbed}${formatAliases(obj.callSign)}`;
            msg.channel.send(msgTemp);
        });
    }
};

module.exports = obj;