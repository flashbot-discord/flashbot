module.exports = {
    name: 'serverinfo',
    desc: '서버에 대한 정보를 보여줍니다.',
    execute(msg, args) {
        msg.channel.send(`서버 이름: **${msg.guild.name}**\n`
            + `전체 이용자 수: ${msg.guild.memberCount}`);
    }
};