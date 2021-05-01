const { prefix } = require('../../config.json');

module.exports = {

	name: 'purge',
	description: 'Delete a set number of message.',
	guildOnly: true,
	aliases: ['prune','delete'],
	usage: `**[ ${prefix}purge <number> ]**`,
    arguments: "`number`: The number of message you wish to delete, not counting the command itself (default at 1).",
	require: ['message', 'args'],
	permissions: 'MANAGE_MESSAGES',
	
	execute(argsArray) {

		const message = argsArray[0];
        const args = argsArray[1];

        let x = parseInt(args[0]);

        if (!x) x = 1;
        
		try { return message.channel.bulkDelete(x+1) } 
		catch (err) {
			console.error(err);
			return message.reply('There was an error trying to purge!');
		}
    }
}