const Discord = require('discord.js');
const client = new Discord.Client();
const { prefix, token } = require('./config.json');
const cmd = require('./commands');
const db = require('./firebase');

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.login(token);

client.on('message', msg => {
    console.log(msg);
    /*
    if (msg.content === 'ping') {
      msg.reply('pong');
    } */
    if (!msg.content.startsWith(prefix) || msg.author.bot) return;

    const args = msg.content.slice(prefix.length).split(/ +/); //regex
    const command = args.shift().toLowerCase();

    switch (command) {
        case 'ping':
            cmd.ping(msg);
            break;
        case 'eval':
            cmd.eval(msg, prefix.length);
            break;
        case 'args-info':
            cmd.args_info(msg, command, args)
    }
});

// web server
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static('public'));
app.listen(PORT, () => console.log(`Web server on port ${PORT}`));