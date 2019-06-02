const Discord = require('discord.js');
const config = require('../config.json');

var cmdMap;

function getHelp(cmd) {
    const obj = cmdMap.get(cmd);
    return `\`${obj.name}\` - ${obj.desc}\n`;
}

function getHelpObj(cmd) {
    return cmdMap.get(cmd);
}

// Basic help
module.exports = {
    name: 'help',
    desc: '',
    dev: false,
    execute(msg, args, _cmdMap, dev) {
        cmdMap = _cmdMap;

        if (args.length < 1) {
            const embed = new Discord.RichEmbed();
            embed.setTitle('FlashBot 도움말')
                .setURL('http://flashbot-discord.herokuapp.com')
                .setAuthor('FlashBot')
                .setDescription('이 봇은 아무 명령어 입력도 없을 시 30분~1시간 뒤에 꺼집니다.\n'
                    + '만약 봇의 접속이 끊겼을 경우, 위의 링크로 들어가면 봇이 켜집니다.\n\n'
                    + '아래에서 모든 명령어들을 볼 수 있습니다.\n'
                    + `명령어에 대한 자세한 정보는 \`${config.prefix}명령어\`를 입력하세요.\n`
                    + `(예: \`${config.prefix}help ping\`)`)
                .addField('기타', getHelp('ping') + getHelp('beep') + getHelp('serverinfo') + getHelp('userinfo'));
            if (dev) {
                embed.addField('테스트', getHelp('eval') + getHelp('args-info') + getHelp('reload'));
                embed.setFooter(`현재 버전: ${config.version} (${config.build_date}) - 개발자 모드`);
            } else {
                embed.setFooter(`현재 버전: ${config.version} (${config.build_date})`);
            }

            msg.channel.send({ embed }).catch(error => {
                let msgTemp = '```링크 첨부 권한이 없어 embed 형식의 도움말을 표시할 수 없으므로 텍스트로 대신하겠습니다.\n'
                    + '(이 알림을 끄는 기능은 현재 개발 중)```\n'
                    + '이 봇은 아무 명령어 입력도 없을 시 30분~1시간 뒤에 꺼집니다.\n'
                    + '만약 봇의 접속이 끊겼을 경우, http://flashbot-discord.herokuapp.com 으로 들어가면 봇이 켜집니다.\n\n'
                    + '아래에서 모든 명령어들을 볼 수 있습니다.\n'
                    + `명령어에 대한 자세한 정보는 \`${config.prefix}명령어\`를 입력하세요.\n`
                    + `(예: \`${config.prefix}help ping\`)\n\n`
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
            if (!obj) return msg.reply('해당 명령어가 존재하지 않습니다.');
            const embed = new Discord.RichEmbed();
            embed.setTitle(`\`${obj.name}\`에 대한 도움말`)
                .setDescription(obj.desc);

            msg.channel.send(embed).catch(error => {
                const msgTemp = '```링크 첨부 권한이 없어 embed 형식의 도움말을 표시할 수 없으므로 텍스트로 대신하겠습니다.\n'
                    + '(이 알림을 끄는 기능은 현재 개발 중)```\n'
                    + `**\`${obj.name}\`에 대한 도움말**\n${obj.desc}`;
                    msg.channel.send(msgTemp);
            });
        }
    }
};