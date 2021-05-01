const { prefix, botName, botColor, botVersion, developperID } = require('../../config.json');
const Discord = require('discord.js');

module.exports = {

	name: 'info',
	description: 'Various information on the bot.',
	aliases: ["h"],
	usage: `**[ ${prefix}info ]**`,
	require: ['message'],
	
	execute(argsArray) {

		const message = argsArray[0];

        function passedTime() {

			seconds = Number((Date.now() - message.client.readyAt.getTime()) / 1000);
			const d = Math.floor(seconds / (3600*24));
			const h = Math.floor(seconds % (3600*24) / 3600);
			const m = Math.floor(seconds % 3600 / 60);
			const s = Math.floor(seconds % 60);
			
			let dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
			let hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
			let mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
			let sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
			return '`' + dDisplay + hDisplay + mDisplay + sDisplay + '`';
		}

        function serverStats() {

            let s = 0
            let m = 0;

            for (let g of message.client.guilds.cache) {
                s++;
                m += g[1].memberCount;
            }

            return `Currently in \`${s}\` Server${s>1?'s':''} with a total of \`${m}\` member${m>1?'s':''}.`
        }

        let infoEmbed = new Discord.MessageEmbed()
			.setColor(botColor)
            .setTitle(`**${botName}**`)
            .setDescription(
                `Hello, i'm ${botName} a bot developped by <@!${developperID}>!\n`+
                `Im coded in JavaScript using Node.js and discord.js v12.\n`+
                `Currently the database is stored with mongoDB.\n`+
                `More feature may be added over time but don't hesitate to contact my developper to give feedbacks and idea!\n`+
                `\n[Github](https://github.com/Mysterken/Hijiri-Sanagi)`
            )
            .addFields(
                { name: `Time online`, value: passedTime() },
                { name: `Server stats`, value: serverStats() },
                { name: `Version`, value: "`" + botVersion + "`" }
            )

        return message.channel.send(infoEmbed)
    }
}
