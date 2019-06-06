/**
 * @name userinfo.js
 * @description 명령어를 입력한 이용자에 대한 정보를 보여줍니다.
 */

exports.name = 'userinfo';
exports.desc = '명령어를 입력한 이용자에 대한 정보를 보여줍니다.';
exports.dev = false;
exports.callSign = ['userinfo', 'user-info', '이용자정보', '사용자정보', '유저정보'];

exports.args = [];

exports.execute = (msg) => {
    msg.channel.send(`이용자의 이름: ${msg.author.username}\n`
        + `이용자 ID: ${msg.author.id}`);
};