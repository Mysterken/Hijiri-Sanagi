const { prefix, botColor, developperID } = require('../../config.json');
const Discord = require('discord.js');

module.exports = {

	name: 'wanikani',
	description: 'Display the list of wanikani related command.',
	aliases: ['wnkn', 'wanihelp', 'wnh'],
	usage: `**[ ${prefix}wanikani <command> ]**`,
    arguments: "`command`: The command to do.",
	require: ['message', 'args', 'commandName', 'userDB'],
    
	execute(argsArray) {

		const message = argsArray[0];
        const args = argsArray[1];
        const commandName = argsArray[2];
        const userDB = argsArray[3];

        const { wanikani } = message.client;

        let wanikaniEmbed = new Discord.MessageEmbed()
            .setColor(botColor)

        if (!args[0]) {

            let valueField = '';
            wanikani.forEach(e => { valueField += `\`${e.name}\` ` });

            wanikaniEmbed.setTitle(`Wanikani`)
            wanikaniEmbed.setURL(`https://www.wanikani.com`)
            wanikaniEmbed.setDescription(`Commands to interact with the Wanikani API.\n`+
                                        `Some commands require you to bind your token first.\n`+
                                        `Use \`${prefix}wanikani <command>\` to do a command.\n`+
                                        `Use \`${prefix}wanihelp <command>\` to see how to use a command.`)
            wanikaniEmbed.attachFiles(['data/img/Wanikani_transparent_logo.png'])
            wanikaniEmbed.setThumbnail('attachment://Wanikani_transparent_logo.png')
            wanikaniEmbed.addField(':flag_jp: Commands', valueField);
            
        } else if (['wanihelp', 'wnh'].includes(commandName)) {

            if (!args[0]) return message.reply(`You need to specify the command you need information about!`);
            
            const name = args[0].toLowerCase();
            const cmd = wanikani.get(name) || wanikani.find(c => c.aliases && c.aliases.includes(name));

            if (!cmd) return message.reply(`Sorry but *${args[0]}* isn't a valid wanikani command.`);

            wanikaniEmbed.setTitle(`Wanikani command | **${cmd.name}**`);
			wanikaniEmbed.setDescription(cmd.description);
			wanikaniEmbed.addFields(
				{ name: `Aliases:`, value: cmd.aliases ? `${"`" + cmd.aliases.join("` `") + "`"}` : 'No aliases' },
				{ name: `Usage:`, value: `${cmd.usage}` },
				{ name : `Arguments`, value: `${cmd.arguments ?? `None`}` },
				{ name: `Cooldown`, value: `${cmd.cooldown ?? '0'} seconds` }
			);
            wanikaniEmbed.attachFiles(['data/img/information.png']);
            wanikaniEmbed.setThumbnail('attachment://information.png');

        } else {

            const name = args[0].toLowerCase();
            const cmd = wanikani.get(name) || wanikani.find(c => c.aliases && c.aliases.includes(name));

            if (!cmd) return message.reply(`Sorry but *${args[0]}* isn't a valid wanikani command.`);    

            const fetch = require('node-fetch');
            var promiseArr = [];
            var apiToken;

            return userDB.findOne({ userID: message.author.id}, (err, res) => {

                if (err) {
                    console.error(err);
                    return message.reply("Couldn't connect to the database. Try later.");
                }

                let user = res ?? '';

                if (!user) {
                    promiseArr.push(new Promise((resolve, reject) => {
                        userDB.insertOne({ userID: message.author.id }, (err, res) => {
                            if (err) reject(console.error(err));
                            else resolve(res);
                        })
                    }))
                }

                if (user.hasOwnProperty('wanikaniToken')) apiToken = user.wanikaniToken;
                else if (cmd.name !== 'token') return message.reply(`You don't have any token set!`);

                for (let p of cmd.path) promiseArr.push(new Promise((resolve, reject) => {

                    if (p === 'subjects' && args[1] === 'fetch' && message.author.id === developperID) p = 'subjects'; // Fetch subjects from the Wanikani API
                    else if (p === 'subjects') return resolve('');
                    else if (!p) return resolve('');
    
                    try {
                    
                        let apiEndpointPath = p;
                        let requestHeaders = new fetch.Headers({ Authorization: 'Bearer ' + apiToken });
    
                        let apiEndpoint =
                            new fetch.Request('https://api.wanikani.com/v2/' + apiEndpointPath, {
                                method: 'GET',
                                headers: requestHeaders
                            });
    
                        fetch(apiEndpoint)
                        .then(response => response.json())
                        .then((responseBody) => { return resolve(responseBody) });
    
                    } catch (err) {
                        console.error(err);
                        message.reply('There was an error fetching data from the Wanikani API!');
                        return reject('Wanikani API fetch error')
                    }
                }));
    
                return Promise.all(promiseArr).then((arr) => {
    
                    for (let p of arr) {
                        if (p.code === 401) return message.reply('Unauthorized request, check if your token is valid.');
                        else if (p.code === 403) return message.reply('Forbidden request.');
                        else if (p.code === 404) return message.reply('The data couldn\'t be found.');
                        else if (p.code === 422) return message.reply(p.error);
                        else if (p.code === 429) return message.reply(`You're sending too many request! They're limited at 60/min.`);
                    }
    
                    if (['token', 't'].includes(name)) arr.push(userDB);
                    else if (['subject', 's'].includes(name) && message.author.id === developperID) arr.push(user);
                    args.splice(0, 1);
    
                    try { return cmd.execute(message, args, arr) } 
                    catch (err) {
                        console.error(err);
                        return message.reply('There was an error trying to execute that command!');
                    }
                }).catch((err) => {
                    console.error(err)
                    return message.channel.send(`\`${err}\``);
                });
            })
        }
        return message.channel.send(wanikaniEmbed);
	}
}