const Discord = require('discord.js');
const client = new Discord.Client();
client.setMaxListeners(100);
//const config = require('./config.json');
const command = require('./command');
//const firstMessage = require('./first-message');
const privateMessage = require('./private-message');
const welcome = require('./welcome');
const memberCount = require('./member-count');
const sendMessage = require('./send-message');
const messageCount = require('./message-counter');
// const mongo = require('./mongo');
const mute = require('./mute');
require('dotenv/config');

client.on('ready', async () => {

    console.log('waifu is ready to go!');

    // await mongo().then(mongoose => {
    //     try {
    //         console.log('Successfully connected to monogo!');
    //     } finally {
    //         mongoose.connection.close();
    //     }
    // });

    //firstMessage(client, '798421536129548298', 'hello world!', ['🍉', '😶', '❤️']);

    privateMessage(client, 'ping', 'pong!');   
    client.users.fetch('702144210354045078').then(user => {
        user.send('Yahello!');
    }); 

    command(client, ['greetings', 'hi'], message => {
        message.channel.send('Greetings!');
    });

    command(client, 'members', message => {
        const { guild, channel } = message;

        if (guild.memberCount !== 2) {
            channel.send(`${guild.name} has a total of ${guild.memberCount} members!`);
        } else {
            channel.send(`${guild.name} has a total of ${guild.memberCounts} members! It's just you and me :eyes:`)
        }
    });

    command(client, ['cc', 'clearChannel'], message => {
        if (message.member.hasPermission('ADMINISTRATOR')) {
            message.channel.messages.fetch().then(results => {
                message.channel.bulkDelete(results);
            });
        } else {
            message.channel.send(`<@${message.member.id}> Sorry, operation failed because of the lack of authority! :(`);
        }
    });

    command(client, 'status', message => {
		const content = message.content.replace('!status ', '');
		const typeAndPresence = content.split(' ');
		const type = typeAndPresence[0];
		const presence = typeAndPresence.splice(1, typeAndPresence.length - 1).join(' ');

        // const availTypes = ['PLAYING', 'WATCHING']; 
        message.author.id === '702144210354045078'
        ? client.user.setPresence({
                activity: {
                    name: presence,
                    type: type.toUpperCase(),
            }
            })
        : message.channel.send(`<@${message.member.id}> Sorry, you don't have the authority to change my status! :`);
	});

    command(client, 'createTextChannel', message => {
        const name = message.content.replace('!createTextChannel ', '');

        if(message.member.hasPermission('ADMINISTRATOR')) {
            message.guild.channels.create(name, {
                type: 'text',
            }).then(channel => {
                const categoryId = '788685492903870507';
                channel.setParent(categoryId);
            });
        } else {
            message.channel.send(`<@${message.member.id}> you don't have the permission to run this command!`);
        }
    });

    command(client, 'createVoiceChannel', message => {
        const name = message.content.replace('!createVoiceChannel ', '');

        message.guild.channels.create(name, {
           type: 'voice', 
        }).then(channel => {
            const categoryId = '806039321404375060';
            channel.setParent(categoryId);
            channel.setUserLimit(2);
        });
    })

    command(client, 'embed', message => {
        const logo = 'https://www.monstersandcritics.com/wp-content/uploads/2020/07/Re-Zero-Rem-wake-up-death-1024x576.jpg';
        const embed = new Discord.MessageEmbed()
            .setTitle('Wa-ta-shi')
            .setURL('https://static0.cbrimages.com/wordpress/wp-content/uploads/2020/07/Rem-re-zero-promo-Cropped.jpg')
            .setAuthor(message.author.username)
            .setImage(logo)
            .setThumbnail(logo)
            .setFooter('This is an useless footer')
            .setColor('#00AAFF')
            .addFields({
                name: 'Field 1',
                value: 'greetings',
                inline: true,                     // Meaning, there can be multiple fields next to each other
            }, {
                name: 'Field 2',
                value: 'greetings2',
                inline: true,                     
            }, {
                name: 'Field 3',                  // This one's gonna be on a new line because inline is false by dafault            
                value: 'greetings3',                                                  
            });

        message.channel.send(embed);
    });

    command(client, 'serverInfo', message => {
        const { guild } = message;
        const { name, region, memberCount, owner, afkTimeout } = guild;
        const icon = guild.iconURL();

        const embed = new Discord.MessageEmbed()
            .setTitle(`Server info for ${name}`)
            .setThumbnail(icon)
            .addFields({
                name: 'Region',
                value: region,
            }, {
                name: 'Memebers',
                value: memberCount,
            }, {
                name: 'Owner',
                value: owner,
            }, {
                name: 'AFK Timeout',
                value: afkTimeout / 60,
            });

        message.channel.send(embed);
    });

    command(client, 'kick', message => {
        const { member, mentions } = message;

        // console.log(mentions);
        if (member.hasPermission('ADMINISTRATOR')) {
            const target = mentions.users.first();
            if (target) {
                const targetMember = message.guild.members.cache.get(target.id);
                targetMember.kick();
                message.channel.send(`<@${member.id}> The kick has been completed! :(`)
            } else {
                message.channel.send(`<@${member.id}> you haven't specified who to kick!`);
            }
        } else {
            message.channel.send(`<@${member.id}> Sorry, you don't have the authority to run this command :(`);
        }
    });

    command(client, 'ban', message => {
        const { member, mentions } = message;
  
        if (member.hasPermission('ADMINISTRATOR')) {
            const target = mentions.users.first();
            if (target) {
                const targetMember = message.guild.members.cache.get(target.id);
                targetMember.ban();
                message.channel.send(`<@${member.id}> The ban has been completed! :(`)
            } else {
                message.channel.send(`<@${member.id}> you haven't specified who to ban!`);
            }
        } else {
            message.channel.send(`<@${member.id}> Sorry, you don't have the authority to run this command :(`);
        }
    });

    command(client, 'taskete', message => {
        message.channel.send(`
        These are my available commands ->
        
            **!hi** or **!greetings** - I'll reply **Greetings!** ^u^
            **!members** - I'll let you know the number of members the guild has! UwU
            **!cc** or **!clearChannel** - I'll delete all messages of the server if I have the authority! ~.~
            **!staus** - Centain someone can change my status :eyes:
            **!createTextChannel <channel name here>** - I'll create a text channel! ;)
            **!createVoiceChannel <channel name here>** - I'll create a voice channel! ;)
            **!embed** - I'll send a model embed! Just for practice for now OwO
            **!serverInfo** - I'll let you know some info about the server! OwU
            **!taskete** - I'll send this message! Here's a secret, you already know that! >///<
            **!kick <mention member here>** - I'll kick the mentioned member if the invloved accounts are authorized! >,<
            **!ban <mention member here>** - I'll ban the mentioned member if the involved accounts have the authority! >.<
            *PS:* Kicking and banning hurt my feelings :'(

            Don't forget to put the **!** sign before every command!
        `);
    });

    welcome(client);

    memberCount(client);

    messageCount(client);

    mute(client);

    const guild = client.guilds.cache.get('788685492903870504');
    const channel = guild.channels.cache.get('806019640396087337');

    sendMessage(channel, 'This message will be deleted after 5 seconds!', 5);

});

client.login(process.env.BOT_TOKEN);