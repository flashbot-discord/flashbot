const util = require('util');
const discord = require('discord.js');
const client = new discord.Client();
const perm = require('../permission');

var _eval = function (msg, len) {
    if (perm.isAdmin(msg.member)) {
        var input = msg.content.slice(len + 5); // eval command slice
        try {
            var result = eval(input);
            msg.reply('Input:\n```' + input + '```\nand Output:\n```' + util.inspect(result, false, null, false) + '```');
            console.log(result);
        } catch (error) {
            msg.reply(error.stack);
            console.log(error);
        }
    } else {
        msg.reply('You do not have admin permission!');
    }
};

module.exports = _eval;