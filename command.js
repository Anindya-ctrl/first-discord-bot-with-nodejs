const { prefix } = require('./config.json');

module.exports = (client, aliases, callback) => {
    if (typeof aliases === 'string') {
        aliases = [aliases];
    }

    client.on('message', message => {
        const { content } = message;
            aliases.forEach(alias => {
                const command = `${prefix}${alias}`

                if (message.channel.type !== 'dm' && (content.startsWith(`${command} `) || content === command)) {
                    console.log(`Running the command ${command}`);
                    callback(message);
                }
            });

    });

}