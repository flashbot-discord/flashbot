const config = require('../config.json');

// Basic help
const help = function (msg, embed) {
    embed.setTitle('FlashBot Help Page')
        .setURL('http://flashbot-discord.herokuapp.com')
        .setAuthor('FlashBot')
        .setDescription('아래에서 모든 명령어들을 볼 수 있습니다.\n'
            + `명령어에 대한 자세한 정보는 \`${config.prefix}명령어\`를 입력하세요.\n`
            + `(예: \`${config.prefix}help ping\`)`)
        .addField('기타', '`ping` - pong!\n')
        .addField('테스트', '`eval` - 자바스크립트 실행. 관리자 권한 가지고 있어야 사용 가능\n'
            + '`args-info` - 명령어 인자 체크용')
        .setFooter(`현재 버전: ${config.version} (2019/5/26)`);

    return msg.channel.send(embed);
}

module.exports = help;