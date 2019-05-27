const userinfo = function(msg) {
    msg.channel.send(`이용자의 이름: ${msg.author.username}\n`
    + `이용자 ID: ${msg.author.id}`);
};

module.exports = userinfo;