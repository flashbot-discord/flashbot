const { Command } = require('discord.js-commando');

module.exports = class ProfileImageCommand extends Command {
    constructor(client) {
        super(client, {
            name: "profileimage",
            aliases: ["프사", "프로필사진", "proimg"],
            group: "misc",
            memberName: "profileimage",
            description: "Shows a profile image",
            args: [
                {
                    key: "user",
                    prompt: "Please enter the user to see its profile image.",
                    type: "user"
                }
            ]
        });
    }

    run(msg, args) {
        msg.channel.send(args.user.displayAvatarURL);
    }
}
