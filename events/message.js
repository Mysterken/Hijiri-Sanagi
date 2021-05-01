const { prefix } = require('../config.json');

module.exports = {

	name: 'message',
	description: `Message handler`,

	execute (client, message) {
        (async function msgHandler (client, message) {
			
			if (!message.content.startsWith(prefix) || message.author.bot) return;

			// Fetch user from cache or discord api if not cached
			async function fetchUser(str, global) {

				if (!str) return;

				if (str.match(/^<@!?[\d]+?>$/) || str.match(/^[\d]+$/)) {

					const fetched = str.match(/[\d]+/);

					try {
						if (global) return await client.users.fetch(fetched[0]);
						else return await message.guild.members.fetch(fetched[0]);
					} catch (err) { return "Invalid user" }
				} 
			}

			async function fetchGuild(str) {

				if (!str) return;

				if (str.match(/^[\d]+$/)) {
					try {
						return await client.guilds.fetch(str)
					} catch (err) { return "Invalid server" }
				}
			}

			const args =  message.content.slice(prefix.length).split(/ +/);
			const commandName = args.shift().toLowerCase();

			const command = client.commands.get(commandName)
				|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
			if (!command) return;

			if (command.permissions) {
				const authorPerms = message.channel.permissionsFor(message.author);
				const botPerms = message.channel.permissionsFor(message.author);
				if (!botPerms || !botPerms.has(command.permissions)) return message.reply(`I don't have the permission required for this command! \`${command.permissions}\``);
				else if (!authorPerms || !authorPerms.has(command.permissions)) return message.reply(`You don't have the permission required for this command! \`${command.permissions}\``);
			}

			const { hijiriDB } = client;

			const possibleArgs = {
				message: message,
                litteralStr: message.content.slice(prefix.length + commandName.length),
				args: args,
				commandName: commandName,
				globalUser: await fetchUser(args[0], true),
				guildUser: await fetchUser(args[0], false),
				guild: await fetchGuild(args[0]),
				userDB: hijiriDB.db().collection("user"),
				serverDB: hijiriDB.db().collection("server"),
				exchange_rates: hijiriDB.db().collection("exchange_rates")
			}
			
			try {

				const argsArray = [];

				command.require.forEach( requirement => argsArray.push(possibleArgs[requirement]) );
				command.execute(argsArray);

			} catch (error) {
				console.error(error);
				message.reply('There was an error trying to execute that command!');
			}
		})(client, message)
    }
}