const tls = require('tls');
const fs = require('fs');
const Discord = require('discord.js');

require("dotenv").config();
const client = new Discord.Client();
const VNDB = tls.connect({host:'api.vndb.org', port:19535});
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.hijiriLogin}.nqvty.mongodb.net/database?retryWrites=true&w=majority`;
const hijiriDB = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const { prefix, botName, botVersion } = require('./config.json');

client.commands = new Discord.Collection();
client.events = new Discord.Collection();
client.wanikani = new Discord.Collection();
client.help = [];

fs.readdir('./events', (err, files) => {
    console.log("Reading events folders...");
    if (err) throw err;
    files.forEach((file) => {
        if (file.endsWith('.js')) {
            const event = require(`./events/${file}`);
            client.events.set(event.name, event);
        }
    })
})

fs.readdir('./cmd', (err, folders) =>{
    console.log("Reading cmd folders...");
    if (err) throw err;
    folders.forEach((folder) => {
        console.log(`Loading ${folder}`);
        fs.readdir(`./cmd/${folder}`, (err, files) => {
            if (err) throw err;
            let entry = {section: folder, commands: files};
            client.help.push(entry);
            files.forEach((file) => {
                if (file.endsWith('.js')) {
                    const command = require(`./cmd/${folder}/${file}`);
                    client.commands.set(command.name, command);
                }
            })
        })
    })
})

fs.readdir(`./wanikani`, (err, files) => {
    console.log("Reading wanikani folders...");
    if (err) throw err;
    files.forEach((file) => {
        if (file.endsWith('.js')) {
            const command = require(`./wanikani/${file}`);
            client.wanikani.set(command.name, command);
        }
    })
})

client.once('ready', () => {
    console.log(`I am connected to Discord!\nThe current global prefix is : ${prefix}`)
});

client.on('message', message => {
    client.events.get('message').execute(client, message)
})

client.on('guildCreate', guild => {
    client.events.get('joinedGuild').execute(client, guild)
})

VNDB.once('ready', ()=> {
    client.VNDB = VNDB;
    VNDB.setEncoding('utf8');
    console.log("Successfully connected to VNDB!");
    VNDB.write(`login {"protocol":1,"client":"${botName}","clientver":${botVersion}}\u0004`)
})

VNDB.once('data', data => {
    if (data.slice(0, data.indexOf('{')-1) === 'error') return console.log(`ERROR`);
    else console.log("Successfully logged to VNDB!");
})

hijiriDB.connect(err => {
    if (err) throw err;
    console.log("Successfully connected to Hijiri Sanagi database!")
    client.hijiriDB = hijiriDB;
})

client.login(process.env.token);