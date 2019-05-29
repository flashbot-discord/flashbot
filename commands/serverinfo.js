module.exports = {
    name: 'serverinfo',
    desc: '서버에 대한 정보를 보여줍니다.',
    dev: false,
    execute(msg, args) {
        if(msg.channel.type == 'dm') return msg.channel.send('이 명령어는 DM에서 사용할 수 없습니다.');
        
        msg.channel.send(`서버 이름: **${msg.guild.name}**\n`
            + `전체 이용자 수: ${msg.guild.memberCount}`);
    }
};
