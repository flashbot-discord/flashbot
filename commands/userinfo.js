module.exports = {
    name: 'userinfo',
    desc: '명령어를 입력한 이용자에 대한 정보를 보여줍니다.',
    dev: false,
    execute(msg, args) {
        msg.channel.send(`이용자의 이름: ${msg.author.username}\n`
            + `이용자 ID: ${msg.author.id}`);
    }
};