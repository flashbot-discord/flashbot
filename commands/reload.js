module.exports = {
    name: 'reload',
    desc: '',
    dev: true,
    execute(msg, args) {
        if(args.length < 2) {
            return msg.reply('다시 로드할 명령어를 입력해 주세요.')
        }
        delete require.cache[require.resolve(`./${args[1]}`)];
        require(`./${args[1]}`);
        msg.channel.send(`\`${args[1]}\`이(가) 다시 로드되었습니다!`);
    }
};