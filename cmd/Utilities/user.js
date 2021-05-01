const { prefix, botColor } = require('../../config.json');
const Discord = require('discord.js');

module.exports = {

	name: 'user',
	description: 'Give some information on yourself or the requested user.',
	aliases: ['u', 'userinfo', 'info'],
	usage: `**[ ${prefix}user <user> ]**`,
    arguments: "`user`: A mention or the ID of a user, if not given will result in the command author's.",
	require: ['message', 'globalUser', 'guildUser'],
	
    execute(argsArray) {

		const message = argsArray[0];
		const globalUser = argsArray[1];
		const guildUser = argsArray[2];

		var user = message.author;
		var nick = 'None';

		var UserEmbed = new Discord.MessageEmbed()
			.setColor(botColor)

		function dateReplacement(date) { 

			let day = { 1:'Monday', 2:'Tuesday', 3:'Wednesday', 4:'Thursday', 5:'Friday', 6:'Saturday', 0:'Sunday' }

			let month = {
				0:'January', 1:'February', 2:'March', 3:'April', 4:'May', 5:'June',
				6:'July', 7:'August', 8:'September', 9:'October', 10:'November', 11:'December'
			}

			let suffix = (date.getUTCDate() % 10 === 1) ? "st"
			: (date.getUTCDate() % 10 === 2) ? "nd"
			: (date.getUTCDate() % 0 === 3) ? "rd"
			: "th";

			return `${day[date.getUTCDay()]}, ${month[date.getUTCMonth()]} ${date.getUTCDate()+suffix} ${date.getUTCFullYear()} @ ${date.toLocaleTimeString('en-US', { timeZone: 'UTC' }).toLowerCase()} UTC`
		}

		if (globalUser) {

			if (globalUser === 'Invalid user') return message.reply(`Use a correct mention or user ID if you want info on someone.`);

			user = globalUser;
			UserEmbed.setTitle(`${user.username}'s Information`);

		} else UserEmbed.setTitle(`Your Information`);

		UserEmbed.setAuthor(user.tag, user.displayAvatarURL(true));
		UserEmbed.setThumbnail(user.displayAvatarURL(true))
		UserEmbed.addFields(
			{ name: 'ID', value: user.id, inline: true },
			{ name: 'Nickname', value: nick, inline: true },
			{ name: 'Account Created', value: dateReplacement(user.createdAt) }
		);

		if (((guildUser && guildUser != 'Invalid user') || !globalUser) && message.channel.type != 'dm') {

			if (guildUser) user = guildUser;
			else user = message.member

			let roles = '';
			let i = -1;

			for (let role of user.roles.cache) {
				roles += `<@&${role[0]}> `;
				var lastRole = `<@&${role[0]}> `;
				i++
			}

			roles = roles.replace(lastRole, '');

			UserEmbed.addFields(
				{ name: 'Server Joined', value: dateReplacement(user.joinedAt) },
				{ name: `Roles [${i}]`, value: roles || 'None' }
			);
			
			return message.channel.send(UserEmbed);
		}
		return message.channel.send(UserEmbed);
	}
}