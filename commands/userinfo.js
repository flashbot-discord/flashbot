/**
 * @name userinfo.js
 * @description 명령어를 입력한 이용자에 대한 정보를 보여줍니다.
 */

const c = require('../classes');
const obj = new c.Command();

obj.name = 'userinfo';
obj.desc = '명령어를 입력한 이용자에 대한 정보를 보여줍니다.';
obj.dev = false;
obj.callSign = ['userinfo', 'user-info', '이용자정보', '사용자정보', '유저정보'];

obj.args = [];

obj.execute = (msg) => {
    msg.channel.send(`이용자의 이름: ${msg.author.username}\n`
        + `이용자 ID: ${msg.author.id}`);
};

module.exports = obj;