/**
 * @name userinfo.js
 * @description 명령어를 입력한 이용자에 대한 정보를 보여줍니다.
 */

const c = require('../classes');
const obj = new c.Command();

const i18n = require('i18n');

obj.name = 'userinfo';
/**
 * 명령어를 입력한 이용자에 대한 정보를 보여줍니다.
 */
obj.dev = false;
obj.callSign = ['userinfo', 'user-info', '이용자정보', '사용자정보', '유저정보'];

obj.args = [];

/**
 * 이용자의 이름: %s\n이용자 ID: %s
 */
obj.execute = (msg) => {
    msg.channel.send(i18n.__('commands.userinfo.result', msg.author.username, msg.author.id));
};

module.exports = obj;