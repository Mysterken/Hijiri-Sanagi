const { prefix } = require('../../config.json');

module.exports = {

    name: 'rate',
    description: `I'll give a rating out of 10 on anything you want!`,
    usage: `**[ ${prefix}rate <string> ]**`,
    arguments: "`string`: What you want me to rate.",
	require: ['message', 'litteralStr'],
    
    execute(argsArray) {

        const message = argsArray[0];
		const litteralStr = argsArray[1];
        
        if (!litteralStr) return message.reply(`Hey! You need to specify what you want me to rate! Add something after "${prefix}rate"`);

        const Rating = Math.floor(Math.random() * (11));
        
        return message.channel.send(`I'd rate**${litteralStr}** a **${Rating}/10!**`)
    }
}