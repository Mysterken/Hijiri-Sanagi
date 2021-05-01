const { prefix, botName, botColor } = require('../../config.json');
const Discord = require('discord.js');

module.exports = {

	name: 'ask',
	description: `Ask me anything and i'll give you a response.`,
	aliases: ['a'],
	usage: `**[ ${prefix}ask <string> ]**`,
	arguments: "`string`: The question you wish to ask.",
	require: ['message', 'litteralStr'],
	
	execute(argsArray) {

		const message = argsArray[0];
		const litteralStr = argsArray[1];

		if (!litteralStr) return message.reply(`You didn't asked me anything, try to add something after *"!ask"*`);

		const Response = ["It is certain.", "It is decidedly so.", "Without a doubt.", "Yes - definitely.", 
						"You may rely on it.", "As I see it, yes.", "Most likely.", "Outlook good.", "Yes.", 
						"Signs point to yes.", "Reply hazy, try again.", "Ask again later.", "Better not tell you now.", 
						"Cannot predict now.", "Concentrate and ask again.", "Don't count on it.", "My reply is no.", 
						"My sources say no.", "Outlook not so good.", "Very doubtful."];
						
		const Random = Math.floor(Math.random() * Response.length);

		let RollEmbed = new Discord.MessageEmbed()
			.setColor(botColor)
			.setTitle(message.author.tag)
			.addFields( { name: `Q: ${litteralStr}`, value: `**R: ${Response[Random]}**` } )
			.setFooter(botName, message.client.user.displayAvatarURL());

		return message.channel.send(RollEmbed);
	}
}