const { prefix, botColor } = require('../../config.json');
const Discord = require('discord.js');

module.exports = {

	name: 'rps',
	description: 'Play a game of rock, paper, scissors with me!',
	aliases: ['rockpaperscissors'],
	usage: `**[ ${prefix}rps <choice> ]**`,
    arguments: '`choice`: either "rock", "paper" or "scissors" alternatively "r", "p" or "s"',
	require: ['message', 'args'],

	execute(argsArray) {

		const message = argsArray[0];
		const args = argsArray[1];

        args[0] = args[0]?.toLowerCase();

        const color = {
            green: '#1ce626',
            red: '#eb2813',
            default: botColor
        }

        const emoji = {
            rock: ':fist:',
            paper: ':hand_splayed:',
            scissors: ':v:'
        }

        const random = Math.floor(Math.random() * (3));
        const playerChoice = args[0] === 'r' ? 'rock' : args[0] === 'p' ? 'paper' : args[0] === 's' ? 'scissors' : args[0]; // Convert shortcut to appropriate string
        var botChoice;
        var Color;

		if (!args[0]) return message.reply(`Hum... We can't play if you don't specify your choice.\nAdd either "r", "p" or "s" after "!rps" so we can have a match!`);
        else if (!emoji[playerChoice]) return message.reply(`Sorry but *${args[0]}* isn't a valid choice, either add "r", "p" or "s" after "!rps" so we can have a match!`);

        let RPSEmbed = new Discord.MessageEmbed()
        
        switch (random) {
            case 0:
                botChoice = playerChoice;
                Color = color.default;
                RPSEmbed.setTitle(`**It's a tie!**`);
                break
            case 1:
                botChoice = playerChoice==='rock'?'scissors':playerChoice==='paper'?'rock':'paper';
                Color = color.green;
                RPSEmbed.setTitle(`**You win!**`);              
                break
            case 2:
                botChoice = playerChoice==='rock'?'paper':playerChoice==='paper'?'scissors':'rock';
                Color = color.red;
                RPSEmbed.setTitle(`**You lose!**`);
                break    
        }

        RPSEmbed.setColor(Color);
        RPSEmbed.setDescription(`${emoji[botChoice]} *Rock, paper, scissors!* ${emoji[playerChoice]}`);
        RPSEmbed.setFooter(random !== 0 ? `I played ${botChoice} and you ${playerChoice}.` : `We both played ${playerChoice}!`);

        return message.channel.send(RPSEmbed)
    }
}