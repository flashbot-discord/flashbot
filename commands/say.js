/**
 * @name say.js
 * @description 사용자가 입력한 말을 따라 말하는 명령어입니다.
 */

 exports.name = 'say';
 exports.desc = '사용자가 입력한 문장을 따라 말합니다.';
 exports.dev = false;
 exports.callSign = ['say', '말하기'];

 exports.args = [
     {
         name: "말",
         desc: "따라 말할 말",
         must: true
     }
 ];

 exports.execute = (msg, input) => {
    if(!input.length) {
        return msg.reply('따라 말할 말을 입력해 주세요.');
    }
    msg.channel.send(input);
 };