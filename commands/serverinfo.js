/**
 * @name serverinfo.js
 * @description 서버 정보 보여주는 명령어
 */

const c = require('../classes');
const obj = new c.command();

obj.name = 'serverinfo';
obj.desc = '서버에 대한 정보를 보여줍니다.';
obj.dev = false;
obj.callSign = ['serverinfo', 'server-info', '서버정보'];

obj.args = [];

obj.execute = (msg) => {
    if (msg.channel.type === 'dm') {
        return msg.channel.send('이 명령어는 DM에서 사용할 수 없습니다.');
    }

    msg.channel.send(`서버 이름: **${msg.guild.name}**\n`
        + `전체 이용자 수: ${msg.guild.memberCount}`);
};

module.exports = obj;