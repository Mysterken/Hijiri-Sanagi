const { prefix, botName, botColor } = require('../../config.json');
const Discord = require('discord.js');

module.exports = {

	name: 'help',
	description: 'A list of all the available commands separated by categories and instruction on how to use them.',
	aliases: ["h"],
	usage: `**[ ${prefix}help <command> ]**`,
    arguments: "`command`: The command you need a more in depth explanation of, and it's usage.",
	require: ['message', 'args'],
	
	execute(argsArray) {

		const message = argsArray[0];
		const args = argsArray[1];

		let HelpEmbed = new Discord.MessageEmbed()
			.setColor(botColor)
		
		if (!args[0]) {

			const sections = message.client.help;
			let x = 0;
			const emoji = {
				Moderation: ':bust_in_silhouette:',
				Utilities: ':gear:',
				Fun: ':video_game:',
				Miscellaneous: ':paperclip:',
				'Japanese Learning': ':rice_ball:'
			}	

			HelpEmbed.setAuthor(botName, message.client.user.displayAvatarURL())
            HelpEmbed.setTitle(`**Commands help | Prefix: ${prefix}**`)
            HelpEmbed.setDescription(`Use \`${prefix}help <command>\` for a more in depth explanation of a command.`);

			for (let section of sections) {

				const nameField = emoji[section.section] ? emoji[section.section] + ' ' + section.section : section.section;
				let valueField = '';
				let i = 0;

				for (const command of section.commands) {
					valueField += `\`${command.slice(0, -3)}\` `;
					i++;
					if (i % 3 === 0 && i !== 0) valueField += '\n';
				}

				valueField = valueField.trimEnd();

				if (valueField) {
					HelpEmbed.addFields({ name: nameField, value: valueField, inline: true });
					x++;
				}	
			}
			if (x%3 !== 0) { // Below code arrange folder visually
				if (x%2 === 0) HelpEmbed.addFields( { name: '\u200B', value: '\u200B', inline: true } );
				HelpEmbed.addFields( { name: '\u200B', value: '\u200B', inline: true } )	
			}			
		} else {

			const name = args[0].toLowerCase();
			const { commands } = message.client;
			const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

			if (!command) return message.reply(`Sorry but *${args[0]}* isn't a valid command.`);

			HelpEmbed.setTitle(`**${command.name}**`);
			HelpEmbed.setDescription(command.description);
			HelpEmbed.addFields(
				{ name: `Aliases:`, value: command.aliases?`${"`" + command.aliases.join("` `") + "`"}`:'No aliases' },
				{ name: `Usage:`, value: `${command.usage}` },
				{ name : `Arguments`, value: `${command.arguments || `None`}` }
			);
			HelpEmbed.attachFiles(['data/img/information.png'])
            HelpEmbed.setThumbnail('attachment://information.png')
			if (command.permissions) HelpEmbed.addField('Permission required', "`" + command.permissions + "`");
		}
		return message.channel.send(HelpEmbed)
    }
}