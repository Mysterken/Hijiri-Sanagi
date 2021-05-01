const { prefix, botColor } = require('../../config.json');
const Discord = require('discord.js');

module.exports = {

    name: 'ping',
    description: `Respond with **"pong!"** and display the response time.`,
    aliases: ['p'],
    usage: `**[ ${prefix}ping ]**`,
	require: ['message'],
    
    execute(argsArray) {

        const message = argsArray[0];

        let time = Date.now() - message.createdTimestamp ;

        let PingEmbed = new Discord.MessageEmbed()
            .setColor(botColor)
            .setTitle('**pong!**')
            .setDescription(`:hourglass: **Response time:** ${time} ms`);
            
        return message.channel.send(PingEmbed).catch(console.error);
    }
}