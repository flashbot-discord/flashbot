/**
 * @name serverinfo.js
 * @description 서버 정보 보여주는 명령어
 */

exports.name = 'serverinfo';
exports.desc = '서버에 대한 정보를 보여줍니다.';
exports.dev = false;
exports.callSign = ['serverinfo', 'server-info', '서버정보'];

exports.args = [];

exports.execute = (msg) => {
    if (msg.channel.type == 'dm') return msg.channel.send('이 명령어는 DM에서 사용할 수 없습니다.');

    msg.channel.send(`서버 이름: **${msg.guild.name}**\n`
        + `전체 이용자 수: ${msg.guild.memberCount}`);
}