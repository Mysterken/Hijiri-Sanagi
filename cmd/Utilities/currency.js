const { prefix, botColor } = require('../../config.json');
const Discord = require('discord.js');
const { currency_code } = require('../../data/currency_code.json')

module.exports = {

	name: 'currency',
	description: 'Display the exchange rate of a given currency against the 8 major currencies or convert an amount of one currency to another.\n'+
                'A list of supported currencies can be found [here](https://www.exchangerate-api.com/docs/supported-currencies).\n'+
                '*Shortcut*: `ety` = euro to yen, `yte` yen to euro.',
	aliases: ['cur', 'money', 'ety', 'yte'],
	usage: `**[ ${prefix}currency <code> ]**\n`+
            `**[ ${prefix}currency <base> <amount> <converted> ]**\n`+
            `**[ ${prefix}<shortcut> <amount>**\n`,
    arguments: "`code`: The currency code.\n"+
                "`base`: The code of the base currency.\n"+
                "`amount`: The amount of the currency.\n"+
                "`converted`: The code of the currency converted.\n"+
                "`shortcut`: The shortcut command.\n",
	require: ['message', 'args', 'commandName', 'exchange_rates'],
	
	execute(argsArray) {

		const message = argsArray[0];
        const args = argsArray[1];
        const commandName = argsArray[2];
        const exchange_rates = argsArray[3];

        const majorCurrencies = ['USD', 'CAD', 'EUR', 'GBP', 'CHF', 'NZD', 'AUD', 'JPY'];
        let type = 'pair';
        let ARGS = [...args];
        let base;
        let converted;
        let amount;

        for (let a in ARGS) ARGS[a] = ARGS[a].toUpperCase()

        // Special shortcut for often used conversion
        if (['ety', 'yte'].includes(commandName)) {

            if (!args[0]) return message.reply("You didn't specify the amount to convert!")
            else if (!+args[0]) return message.reply(`Sorry but *${args[0]}* isn't a valid number.`)

            amount = args[0];

            if (commandName === 'ety') { base = 'EUR'; converted = 'JPY' }
            else if (commandName === 'yte') { base = 'JPY'; converted = 'EUR' }

        } else {

            if (!args[0]) return message.reply("You didn't specify which currency to display!");
            else if (args[2]) {

                if (!+args[1]) return message.reply(`Sorry but *${args[0]}* isn't a valid number.`);
                else if (!currency_code[ARGS[0]]) return message.reply(`Sorry but *${args[0]}* isn't a valid currency.`);
                else if (!currency_code[ARGS[2]]) return message.reply(`Sorry but *${args[2]}* isn't a valid currency.`);

                base = ARGS[0];
                amount = args[1];
                converted = ARGS[2];

            } else {
                if (!currency_code[ARGS[0]]) return message.reply(`Sorry but *${args[0]}* isn't a valid currency.`);
                type = 'display';
                base = ARGS[0];
            }
        }

        let currencyEmbed = new Discord.MessageEmbed()
            .setColor(botColor)
        
        if (type === 'display') {

            return exchange_rates.findOne({ code: base })
            .then((doc) => {

                let desc = '';

                for (c of majorCurrencies) {
                    desc += `${currency_code[c]} | **${doc.conversion_rates[c]}** \`${c}\`\n`;
                } 

                currencyEmbed.setTitle(`Exchange rate for 1 ${currency_code[base]}`);
                currencyEmbed.setDescription(desc);
                return message.channel.send(currencyEmbed);
            })
            .catch((err) => {
                console.error(err);
                return message.reply('There has been an error while fetching the exchange rate. Try later.')
            })

        } else {

            return exchange_rates.findOne({ code: base })
            .then((doc) => {
                const result = doc.conversion_rates[converted] * amount;
                currencyEmbed.setTitle(`**${amount}** ${currency_code[base]} = \`${result}\` ${currency_code[converted]}`);
                return message.channel.send(currencyEmbed);
            })
            .catch((err) => {
                console.error(err);
                return message.reply('There has been an error while fetching the exchange rate. Try later.')
            })
        }
    }
}