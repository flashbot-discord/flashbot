module.exports = {
    name: 'reload',
    desc: '명령어 모듈을 다시 로드합니다. (현재 작동 안함 / 개발중)',
    dev: true,
    execute(msg, args) {
        if(args.length < 1) {
            return msg.reply('다시 로드할 명령어를 입력해 주세요. (현재 작동되지 않음)')
        }
        delete require.cache[require.resolve(`./${args[1]}`)];
        require(`./${args[1]}`);
        msg.channel.send(`\`${args[1]}\`이(가) 다시 로드되었습니다! (현재 작동되지 않음)`);
    }
};