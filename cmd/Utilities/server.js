const { prefix, botColor } = require('../../config.json');
const Discord = require('discord.js');

module.exports = {

	name: 'server',
	description: 'Give various information on a server.',
	guildOnly: true,
	aliases: ['serv', 'serverinfo'],
	usage: `**[ ${prefix}server <serverID> ]**`,
    arguments: "`serverID`: The ID of a server the bot is currently in, if not given will result in the current server.",
	require: ['message', 'args', 'guild'],
	
	execute(argsArray) {

        const message = argsArray[0];
        const args = argsArray[1];
		const guild = argsArray[2];

        var server = message.guild;
		let cha=c=t=v=x=0;

		let serverEmbed = new Discord.MessageEmbed()
            .setColor(botColor)

		args[0] = args[0]?.toLowerCase();

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
        
        if (guild) {
            if (guild === 'Invalid server') return message.reply(`Use the server ID of one i'm in if you want info about it.`);
			server = guild;
			x++;
        }

		if (args[x] === 'roles') {

			async function fetchRoles(server) {

				let roles = [];
				let i = 0;

				for (let role of server.roles.cache) {
					let r = await server.roles.fetch(role[0])
					roles[r.position] = `<@&${role[0]}> `;
					i++
				}

				if (x > 0) serverEmbed.setAuthor(server.name, server.iconURL(true));

				serverEmbed.setTitle(`Roles [${i}]`);
				serverEmbed.setDescription(roles.reverse().join(' ') || 'None');
				
				return message.channel.send(serverEmbed);
			}
			return fetchRoles(server);
		}

		for (let ch of server.channels.cache) {
			if (ch[1]['type'] === 'category') c++;
			else if (ch[1]['type'] === 'text') t++;
			else if (ch[1]['type'] === 'voice') v++;
			cha++
		}
		
		serverEmbed.setAuthor(server.name, server.iconURL(true));
		serverEmbed.setTitle(`Server's ID: ${server.id}`);
		serverEmbed.setThumbnail(server.iconURL(true));
		serverEmbed.addFields(
			{ name: 'Description', value: server.description || "This server doesn't have any description yet." },
			{ name: 'Owner', value: `<@!${server.ownerID}>`, inline: true },
			{ name: `Owner's ID`, value: server.ownerID, inline: true },
			{ name: `\u200B`, value: `\u200B`, inline: true },
			{ name: 'Region', value: server.region, inline: true },
			{ name: 'Members Count', value: `**${server.memberCount}**`, inline: true },
			{ name: `\u200B`, value: `\u200B`, inline: true },
			{ name: `Channels [${cha}]`, value: `Categories: **${c}**\n<:message:830897496905613382> Text: **${t}**\n<:mic:830898258796085308> Voice: **${v}**`, inline: true },
			{ name: 'Verification Level', value: server.verificationLevel },
			{ name: 'Creation Date', value: dateReplacement(server.createdAt) },
			{ name: 'Roles', value: `Use \`${prefix}server roles\` to see a list of all the roles.`, inline: true },
			{ name: 'Server boost', value: `Level **${server.premiumTier}** with **${server.premiumSubscriptionCount}** boost.` },
		);
		return message.channel.send(serverEmbed);
	},
}