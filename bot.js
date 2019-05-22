const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');

const http = require('http');

var prefix = '//';

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.login(auth.token);

client.on('message', msg => {
    /*
    if (msg.content === 'ping') {
      msg.reply('pong');
    } */
    if(msg.content.startsWith(prefix)) {
        var m = msg.content.substring(prefix.length, msg.content.length);
        var cmd = m.split(' ')[0];
        switch(cmd) {
            case 'ping':
                msg.reply('pong');
                break;
            case 'eval':
                var input = m.substring(4, m.length);
                try {
                    var result = eval(input);
                    msg.reply('Input:\n```' + input + '```\nand Output:\n```' + result + '```');
                } catch(error) {
                    msg.reply(error.stack);
                    console.log(error);
                }
                break;
        }
    }
});

// http handler
http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Flashbot Dashboard coming soon\n');
}).listen(80);
console.log('Web server running');