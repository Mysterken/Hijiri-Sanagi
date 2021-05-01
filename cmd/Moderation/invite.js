const { prefix } = require('../../config.json');

module.exports = {

	name: 'invite',
	description: 'Create a customizable invite link to the server.\n'+
                'Type "def" instead of the argument to use the default value.\n'+
                'If no arguments are given: an unique, only usable once invite that last 30 min will be created.',
    guildOnly: true,
	usage: `**[ ${prefix}invite <temporary> <time> <use> <unique> <reason> ]**`,
    arguments: "`temporary`: Whether members that joined via the invite should be automatically kicked after 24 hours if they have not yet received a role (\"true\" or \"false\", default \"false\")\n"+
                "`time`: How long the invite should last (in seconds, 0 for forever) (number, default 86400)\n"+
                "`use`: Maximum number of uses (number, default 1)\n"+
                "`unique`: Create a unique invite, or use an existing one with similar settings (\"true\" or \"false\", default \"false\")\n"+
                "`reason`: Reason for creating the invite (string, default \"No reason provided\")",
	require: ['message', 'args'],
    permissions: 'CREATE_INSTANT_INVITE',
    
	execute(argsArray) {

		const message = argsArray[0];
		const args = argsArray[1];

        let a = [...args];
        let tmp = a.shift()?.toLowerCase() ?? 'def';
        let time = a.shift() ?? 'def';
        let use = a.shift() ?? 'def';
        let unq = a.shift()?.toLowerCase() ?? 'def';
        let rsn = a.join(' ') || 'No reason provided';

        if (!args[0]) {
            time = '1200';
            unq = 'true';
        }

        tmp = tmp === 'def' ? false : tmp === 'true' ? true : tmp === 'false' ? false : 'invalid';
        time = time === 'def' ? 86400 : parseInt(time) ? parseInt(time) : 'invalid';
        use = use === 'def' ? 1 : parseInt(use) ? parseInt(use) : 'invalid';
        unq = unq === 'def' ? false : unq === 'true' ? true : unq === 'false' ? false : 'invalid';

        if (tmp === 'invalid') return message.reply(`*<temporary>* should be "true" or "false".`);
        if (time === 'invalid' || time < 0) return message.reply(`*<time>* should be a positive number.`);
        if (use === 'invalid' || use < 0) return message.reply(`*<use>* should be a positive number.`);
        if (unq === 'invalid') return message.reply(`*<unique>* should be "true" or "false".`);

        message.channel.createInvite({ temporary: tmp, maxAge: time, maxUses: use, unique: unq, reason: `Created by: ${message.author.tag}. Reason: ${rsn}` })
			.then((inviteLink) => {
				return message.channel.send(`Alright! Here's your invite link, it will expire in ${time} seconds and can be used ${use} time(s)!\n${inviteLink}`)
		}).catch((err) => {
			console.error(err);
			return message.reply("Couldn't create an invite!")
		});
    }
}