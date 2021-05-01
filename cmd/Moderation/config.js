const { prefix, botColor } = require('../../config.json');
const Discord = require('discord.js');

module.exports = {

	name: 'config',
	description: 'Display or change the configuration for some commands on the server.',
	guildOnly: true,
	usage: `**[ ${prefix}config <arg> <value> ]**`,
    require: ['message', 'args', 'serverDB'],
	arguments: "`arg`: The setting you want to change (numerated).\n"+
                "`value`: The value to attribute.",

	execute(argsArray) {

        const message = argsArray[0];
		const args = argsArray[1];
        const serverDB = argsArray[2];

        if (!args[0]) {

            serverDB.findOne({ serverID: message.guild.id}, (err, res) => {

                if (err) {
                    console.error(err);
                    return message.reply("Couldn't connect to the database. Try later.");
                } else if (!res) return message.reply("Couldn't find the server in the database.");

                let desc = `:tools: **Configuration**\n`+
                        `**1** - VNDB Sexual Level: \`${res.vndbSexLV}\`\n`+
                        `**2** - VNDB Violence Level: \`${res.vndbViolenceLV}\``

                let configEmbed = new Discord.MessageEmbed()
                    .setColor(botColor)
                    .setAuthor(message.guild.name, message.guild.iconURL(true))
                    .setDescription(desc)

                return message.channel.send(configEmbed);
            })

        } else {

            if (!message.member.hasPermission('ADMINISTRATOR')) return message.reply('Only member with administrator privilege can change configurations.')
            else if (!args[1]) return message.reply('You need to specify a value to attribute.');

            let change;
            args[0] = args[0].toLowerCase()

            if (args[0] == 1) {
                if (!(0 <= parseInt(args[1]) && parseInt(args[1]) <= 2)) return message.reply('VNDB Sexual Level can only range from [0-2] inclusive.');
                change = { vndbSexLV: parseInt(args[1]) };
            } else if (args[0] == 2) {
                if (!(0 <= parseInt(args[1]) && parseInt(args[1]) <= 2)) return message.reply('VNDB Violence Level can only range from [0-2] inclusive.');
                change = { vndbViolenceLV: parseInt(args[1]) };
            } else return message.reply('Sorry but this is not a valid configuration.')

            serverDB.updateOne({ serverID: message.guild.id}, { $set: change }, (err) => {
                if (err) {
                    console.error(err);
                    return message.reply("Couldn't connect to the database. Try later.");
                } else return message.react('✅');
            })
        }
	}
}