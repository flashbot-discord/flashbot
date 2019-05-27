const serverinfo = function(msg) {
    msg.channel.send(`서버 이름: **${msg.guild.name}**\n`
    + `전체 이용자 수: ${msg.guild.memberCount}`);
};

module.exports = serverinfo;