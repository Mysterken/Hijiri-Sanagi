const { prefix, botColor } = require('../../config.json');
const Discord = require('discord.js');

module.exports = {

	name: 'unban',
	description: 'Unban a user from the server.',
	guildOnly: true,
	usage: `**[ ${prefix}ban <user> ]**`,
    require: ['message', 'litteralStr', 'args', 'globalUser'],
	permissions: 'BAN_MEMBERS',
	arguments: "`user`: The ID of a user.",
	
	execute(argsArray) {

        const message = argsArray[0];
        const litteralStr = argsArray[1];
		const args = argsArray[2];
		const globalUser = argsArray[3];

		var reason = litteralStr.replace(args[0], '').trim() || 'No reason provided';
        
        if (!globalUser) return message.reply(`You didn't specify the user to unban, please input their ID's.`);
		else if (globalUser === 'Invalid user') return message.reply(`Use a correct user ID to unban them.`);
		
		message.guild.members.unban(globalUser, `Unbanned by: ${message.author.tag}. Reason: ${reason}`).then(()=>{
			
			let unbanEmbed = new Discord.MessageEmbed()
				.setColor(botColor)
				.setTitle(`⚠️ | **${globalUser.tag}** has been successfully **unbanned** from this server.`)
                .setDescription(`Reason: ${reason}`)
				.setFooter(`Unbanned by: ${message.author.tag}`);
				
			return message.channel.send(unbanEmbed)
		}).catch((err) => {
			console.error(err);
			return message.reply("Couldn't unban the user!")
		})
	}
}