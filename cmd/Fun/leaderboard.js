const { prefix, botColor } = require('../../config.json');
const Discord = require('discord.js');

module.exports = {

    name: 'leaderboard',
	description: `Display the server's game leaderboard.`,
    guildOnly: true,
    aliases: ["lb"],
	usage: `**[ ${prefix}leaderboard ]**`,
    require: ['message', 'serverDB'],
    
    execute(argsArray) {

        const message = argsArray[0];
        const serverDB = argsArray[1];

        serverDB.findOne({ serverID: message.guild.id }, (err, res) => {
            
            if (err) {
                console.error(err);
                return message.reply("Couldn't connect to the database. Try later.");
            } else if (!res) return message.reply("Couldn't find the server in the database.");

            function snipeLB() { 
                if (!res.snipeLB.time) return `No record yet`
                else return `${res.snipeLB.time}ms by <@!${res.snipeLB.UID}>` 
            }

            let lbEmbed = new Discord.MessageEmbed()
                .setColor(botColor)
                .setTitle(`Leaderboard`)
                .addField('<:snipe:830890113004470312> Snipe', snipeLB());

            return message.channel.send(lbEmbed);
        })
    }
}