const { prefix, botColor } = require('../config.json');
const Discord = require('discord.js');

module.exports = {

	name: 'user',
	description: 'Give some information on the Wanikani account of the user.',
	aliases: ['u', 'userinfo', 'info'],
    path: ['user', 'assignments'],
	usage: `**[ ${prefix}wanikani user ]**`,
	
    execute(message, args, data) {

		const user = data[0].data;
		const progression = data[1].data;

		var apprenctice = guru = master = enlightened = burned = 0;

		function dateReplacement(date) { 

			date = new Date(date);
			let day = { 1:'Monday', 2:'Tuesday', 3:'Wednesday', 4:'Thursday', 5:'Friday', 6:'Saturday', 0:'Sunday' }

			let month = {
				0:'January', 1:'February', 2:'March', 3:'April', 4:'May', 5:'June',
				6:'July', 7:'August', 8:'September', 9:'October', 10:'November', 11:'December'
			}

			let suffix = (date.getUTCDate() % 10 == 1) ? "st"
			: (date.getUTCDate() % 10 === 2) ? "nd"
			: (date.getUTCDate() % 0 === 3) ? "rd"
			: "th";

			return `${day[date.getUTCDay()]}, ${month[date.getUTCMonth()]} ${date.getUTCDate()+suffix} ${date.getUTCFullYear()} @ ${date.toLocaleTimeString('en-US', { timeZone: 'UTC' }).toLowerCase()} UTC`
		}

		for (let d of progression) {
			if ([3, 4].includes(d.data.srs_stage)) apprenctice++;
			else if ([5, 6].includes(d.data.srs_stage)) guru++;
			else if ([7].includes(d.data.srs_stage)) master++;
			else if ([8].includes(d.data.srs_stage)) enlightened++;
			else if (d.data.srs_stage === 9) burned++;
		}
		let valueField = `<:Wanikani_apprentice:823215539064668191> Apprenctice [**${apprenctice}**]\n`+
						`<:Wanikani_guru:823215572547796996> Guru [**${guru}**]\n`+
						`<:Wanikani_master:823215601773969430> Master [**${master}**]\n`+
						`<:Wanikani_enlightened:823215611055964200> Enlightened [**${enlightened}**]\n`+
						`<:Wanikani_burned:823215622925320202> Burned [**${burned}**]`;

		let userEmbed = new Discord.MessageEmbed()
			.setColor(botColor)
			.setTitle(`${user.username} | Level ${user.level}`)
			.setURL(`${user.profile_url}`)
			.addFields(
			{ name: 'Progression', value: valueField },
			{ name: 'Account Created', value: `${dateReplacement(user.started_at)}` },
			{ name: 'ID', value: `${user.id}` },
			{ name: 'Subscription', value: `${user.subscription.type[0].toUpperCase() + user.subscription.type.slice(1)}${user.period_ends_at?', ends at:\n'+dateReplacement(user.period_ends_at):''}` }
			)
			.attachFiles(['data/img/Wanikani_transparent_logo.png'])
            .setThumbnail('attachment://Wanikani_transparent_logo.png');

		return message.channel.send(userEmbed);
	}
}