const { prefix, botColor } = require('../../config.json');
const Discord = require('discord.js');

module.exports = {

	name: 'roll',
	description: `Roll a random number between 0 (inclusive) and the max number.\nThe embed will change color depending of the result.`,
	aliases: ['r', 'random'],
	usage: `**[ ${prefix}roll <number> ]**`,
    arguments: "`number`: The maximum number the roll can achieve, default at 100.",
	require: ['message', 'args'],
    
	execute(argsArray) {

		const message = argsArray[0];
		const args = argsArray[1];

        const color = {
            green: '#1ce626',
            red: '#eb2813',
            default: botColor
        }

        const arg = parseInt(args[0]);
        var max = 100;

        function valueColor(Rolled, Value) {
            if (Rolled * 2 > Value) return color.green;
            else if (Rolled * 2 < Value) return color.red;
            else return color.default;
        }	

        if (args[0]) {
            if (!arg || arg < 0) return message.channel.send(`Sorry but *${args[0]}* isn't a valid number! Imput a positive one or leave blank.`);
            max = arg;
        }

        const random = Math.floor(Math.random() * (max+1));

        let RollEmbed = new Discord.MessageEmbed()
			.setTitle(`:game_die: **Rolling** :game_die:`)
            .setDescription(`**[  ${random}  ]**`)
		    .setFooter(`You just rolled a ${random} out of ${max}!`)
            .setColor(valueColor(random, max));
            
        return message.channel.send(RollEmbed)
    }
}