const { prefix } = require('../config.json');

module.exports = {

	name: 'token',
	description: 'Set your personnal wanikani token.\n'+
    'Get it [here](https://www.wanikani.com/settings/personal_access_tokens).',
	aliases: ['t'],
    path: [],
	usage: `**[ ${prefix}wanikani token <token> ]**`,
    arguments: "`token`: Your Wanikani token.",

    execute(message, args, arr) {

		if (!args[0]) return message.reply(`You need to supply your personnal token!\nI'd recommand to do it in DM to avoid getting it stolen.\nGet it here: <https://www.wanikani.com/settings/personal_access_tokens>`)

        let userDB = arr[0];

        userDB.updateOne({ userID: message.author.id }, 
            { $set: { wanikaniToken: args[0] } }, (err) => {
                if (err) {
                    console.error(err)
                    return message.reply("Couldn't connect to the database. Try later.");
                } else return message.reply('Successfully set your token!')
            })
	}
}