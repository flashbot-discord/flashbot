/**
 * @name serverinfo.js
 * @description 서버 정보 보여주는 명령어
 */

const c = require('../classes');
const obj = new c.Command();

const i18n = require('i18n');

obj.name = 'serverinfo';
/**
 * 서버에 대한 정보를 보여줍니다.
 */
obj.desc = 'commands.serverinfo.desc';
obj.dev = false;
obj.callSign = ['serverinfo', 'server-info', '서버정보'];

obj.args = [];

obj.execute = (msg) => {
    if (msg.channel.type === 'dm') {
        /**
         * 이 명령어는 DM에서 사용할 수 없습니다.
         */
        return msg.channel.send(i18n.__('commands.serverinfo.execute.isDM'));
    }

    /**
     * 서버 이름: %s\n전체 이용자 수: %s
     */
    msg.channel.send(i18n.__('commands.serverinfo.result', msg.guild.name, msg.guild.memberCount));
};

module.exports = obj;