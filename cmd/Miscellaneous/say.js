const { prefix } = require('../../config.json');

module.exports = {

	name: 'say',
	description: 'Repeat what the user said.\nUse the command with the suffix "delete" to delete your message before repeat.',
	aliases: ['s', 'repeat', 'repeatdelete', 'saydelete', 'sd'],
	usage: `**[ ${prefix}say <string> ]**`,
    arguments: "`string`: The message you wish to be repeated.",
	require: ['message', 'litteralStr', 'commandName'],
	
	execute(argsArray) {

        const message = argsArray[0];
        const litteralStr = argsArray[1];
        const commandName = argsArray[2];

        const dltAlias = ['repeatdelete', 'saydelete', 'sd']

		if (!litteralStr) return message.channel.send(`You need to add a message after "${prefix}say" for me to repeat!`);
        else if (dltAlias.includes(commandName) && message.channel.type !== 'dm') message.delete();
		
		return message.channel.send(litteralStr);
	},
}