const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();

const config = require('./config.json');
const db = require('./firebase');

client.commands = new Discord.Collection();
const token = process.env.token || require('./token.json').token;

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setPresence({ status: 'online', game: { name: `${config.prefix}help` } });
});

client.login(token);

const cmdFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of cmdFiles) {
    const cmd = require(`./commands/${file}`);
    if(!(process.env.dev !== 'true' && cmd.dev)) {
        client.commands.set(cmd.name, cmd);
    }
}

client.on('message', msg => {
    console.log(msg.content);
    /*
    if (msg.content === 'ping') {
      msg.reply('pong');
    } */
    if (!msg.content.startsWith(config.prefix) || msg.author.bot) return;

    const args = msg.content.slice(config.prefix.length).split(/ +/); //regex
    const command = args.shift().toLowerCase();

    if (!client.commands.has(command)) return;

    try {
        client.commands.get(command).execute(msg, args);
    } catch (error) {
        console.error(error);
        msg.reply('명령어를 실행하는 도중에 오류가 발생했습니다.');
    }
});

// web server
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static('public'));
app.listen(PORT, () => console.log(`Web server on port ${PORT}`));