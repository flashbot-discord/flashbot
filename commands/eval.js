const util = require('util');
const discord = require('discord.js');
const client = new discord.Client(); // for developing
const perm = require('../permission');
const config = require('../config.json');

module.exports = {
    name: 'eval',
    desc: '자바스크립트 실행. 관리자 권한 가지고 있어야 사용 가능',
    execute(msg, args) {
        if (perm.isAdmin(msg.member)) {
            var input = msg.content.slice(config.prefix.length + 5); // eval command slice
            try {
                var result = eval(input);
                msg.reply('입력:\n```' + input + '```\n그리고 출력:\n```' + util.inspect(result, false, null, false) + '```');
                console.log(result);
            } catch (error) {
                msg.reply(error.stack);
                console.log(error);
            }
        } else {
            msg.reply('당신은 관리자 권한을 가지고 있지 않습니다!');
        }
    }
};