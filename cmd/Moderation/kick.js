const { prefix, botColor } = require('../../config.json');
const Discord = require('discord.js');

module.exports = {

	name: 'kick',
	description: 'Kick a user from the server.',
	guildOnly: true,
	usage: `**[ ${prefix}kick <user> ]**`,
    require: ['message', 'litteralStr', 'args', 'guildUser'],
	permissions: 'KICK_MEMBERS',
	arguments: "`user`: A mention or the ID of a user.",
	
	execute(argsArray) {

        const message = argsArray[0];
        const litteralStr = argsArray[1];
		const args = argsArray[2];
		const guildUser = argsArray[3];

		var reason = litteralStr.replace(args[0], '').trim() || 'No reason provided';

        if (!guildUser) return message.reply(`You didn't specify the user to kick, either mention them or input their ID's.`);
		else if (guildUser === 'Invalid user') return message.reply(`Use a correct mention or user ID of someone in the server to kick them.`);
		else if (!guildUser.kickable) return message.reply(`Sorry but I don't have the permission to kick this user.`);

        let tag = guildUser.user.tag;
		
		guildUser.kick({ reason: `Kicked by: ${message.author.tag}. Reason: ${reason}` }).then(()=>{
			
			let kickEmbed = new Discord.MessageEmbed()
				.setColor(botColor)
				.setTitle(`⚠️ | **${tag}** has been successfully **kicked** from this server.`)
				.setDescription(`Reason: ${reason}`)
				.setFooter(`Kicked by: ${message.author.tag}`);
				
			return message.channel.send(kickEmbed)
		}).catch((err) => {
			console.error(err);
			return message.reply("Couldn't kick the user!")
		})
	}
}