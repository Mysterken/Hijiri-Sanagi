const { prefix, botColor } = require('../../config.json');
const Discord = require('discord.js');

module.exports = {

	name: 'avatar',
	description: "Send the user their or the requested person's avatar",
	aliases: ['icon', 'pfp'],
	usage: `**[${prefix}avatar <user> <format> <size>]**`,
    arguments: "`user`: A mention or the ID of a user, if not given will result in the command author's.\n"+
				"`format`: The format of the image, png by default (supported webp, png, jpg, jpeg or gif).\n"+
				"`size`: The image size, 256 by default (supported 16, 32, 64, 128, 256, 512, 1024, 2048, 4096)",
	require: ['message', 'args', 'globalUser'],
	
	execute(argsArray) {

		const message = argsArray[0];
		const args = argsArray[1];
		const globalUser = argsArray[2];

		const possibleFormat = ['webp', 'png', 'jpg', 'jpeg', 'gif'];
		const possibleSize = ['16', '32', '64', '128', '256', '512', '1024', '2048', '4096']
		var chosenFormat = 'png';
		var chosenSize = 256;
		var user = message.author;
        
		if (args) {

			let x = 0;

			if (globalUser === 'Invalid user') return message.reply(`Use a correct mention or user ID if you want someone's avatar!`);
			else if (globalUser) {
				user = globalUser;
				x++;
			}

			if (args[x]) {
				if (!possibleFormat.includes(args[x])) return message.reply(`${args[x]} isn't a valid image format.`);
				chosenFormat = args[x];
			}

			if (args[x+1]) {
				if (!possibleSize.includes(args[x+1])) return message.reply(`*${args[x+1]}* isn't a valid image size.`);
				chosenSize = parseInt(args[x+1]);
			}
		}

		let AvatarEmbed = new Discord.MessageEmbed()
			.setColor(botColor)
			.setAuthor(user.tag, null, user.avatarURL({ format: chosenFormat, dynamic: true, size: chosenSize }))
			.setImage(user.displayAvatarURL({ format: chosenFormat, dynamic: true, size: chosenSize}));
			
		return message.channel.send(AvatarEmbed);
	}
}