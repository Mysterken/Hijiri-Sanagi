const { prefix, botColor } = require('../../config.json');
const Discord = require('discord.js');

module.exports = {

	name: 'coinflip',
	description: "Toss a 2 side coin and tell the result, you can also bet on the outcome.",
	aliases: ['c','cf','cointoss','flip'],
	usage: `**[ ${prefix}coinflip <bet> ]**`,
    arguments: "`bet`: The side you bet the coin will fall on, either \"heads\" or \"tails\".",
	require: ['message', 'args'],
	
	execute(argsArray) {

        const message = argsArray[0];
        const args = argsArray[1];

		const color = {
            green: '#1ce626',
            red: '#eb2813',
            default: botColor
        }

		var Color;
		var flip = Math.floor(Math.random() * (2));

		flip = flip ? 'Heads' : 'Tails';

		let FlipEmbed = new Discord.MessageEmbed()
			.setDescription(`**[  ${flip}  ]**`);

		args[0] = args[0]?.toLowerCase();

		if (args[0] && ['heads', 'h', 'tails', 't'].includes(args[0]) ) {

			args[0] = args[0] === 'h' ? 'heads' : args[0] === 't' ? 'tails' : args[0];
			
			if (args[0] === flip.toLowerCase()) {
				Color = color.green;
				FlipEmbed.setTitle(`**Your bet was correct!**`);
				FlipEmbed.setFooter(`You had bet on ${args[0]} and won.`);
			} else {
				Color = color.red;
				FlipEmbed.setTitle(`**Your bet was incorrect!**`);
				FlipEmbed.setFooter(`You had bet on ${args[0]} and lost.`);
			}
			
		} else {
			Color = color.default;
			FlipEmbed.setTitle(`<:coinEmoji:720631747213262889> **Tossing a coin** <:coinEmoji:720631747213262889>`);
			FlipEmbed.setFooter(`The coin landed on ${flip}!`);		
		}
		
		FlipEmbed.setColor(Color);
		return message.channel.send(FlipEmbed);
    }
}