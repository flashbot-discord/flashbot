const config = require('../config.json');

// Basic help
const help = function (msg, embed) {
    embed.setTitle('FlashBot Help Page')
        .setURL('http://flashbot-discord.herokuapp.com')
        .setAuthor('FlashBot')
        .setDescription('아래에서 모든 명령어들을 볼 수 있습니다.\n'
            + `명령어에 대한 자세한 정보는 \`${config.prefix}명령어\`를 입력하세요.\n`
            + `(예: \`${config.prefix}help ping\`)`)
        .addField('기타', '`ping` - pong!\n'
            + '`beep` - boop\n'
            + '`serverinfo` - 서버에 대한 정보를 보여줍니다.\n'
            + '`userinfo` - 명령어를 입력한 이용자에 대한 정보를 보여줍니다.')
        .addField('테스트', '`eval` - 자바스크립트 실행. 관리자 권한 가지고 있어야 사용 가능\n'
            + '`args-info` - 명령어 인자 체크용')
        .setFooter(`현재 버전: ${config.version} (${config.build_date})`);

    msg.channel.send(embed).catch(error => {
        msg.channel.send('```링크 첨부 권한이 없어 embed 형식의 도움말을 표시할 수 없으므로 텍스트로 대신하겠습니다.\n'
            + '(이 알림을 끄는 기능은 현재 개발 중)```'
            + '아래에서 모든 명령어들을 볼 수 있습니다.\n'
            + `명령어에 대한 자세한 정보는 \`${config.prefix}명령어\`를 입력하세요.\n`
            + `(예: \`${config.prefix}help ping\`)\n\n`
            + '**기타**\n'
            + '`ping` - pong!\n'
            + '`beep` - boop\n'
            + '`serverinfo` - 서버에 대한 정보를 보여줍니다.\n'
            + '`userinfo` - 명령어를 입력한 이용자에 대한 정보를 보여줍니다.\n\n'
            + '**테스트**\n'
            + '`eval` - 자바스크립트 실행. 관리자 권한 가지고 있어야 사용 가능\n'
            + '`args-info` - 명령어 인자 체크용\n\n'
            + `현재 버전: \`${config.version}\` (${config.build_date})`);
    });
}

module.exports = help;