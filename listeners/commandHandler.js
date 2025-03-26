require('module-alias/register');
const fs = require('fs');
const console = require('console');
const { ri } = require('controller/RenegadeImmortalController');
const { pw } = require('controller/PerfectWorldController');
const { btth } = require('controller/BtthController');
const { ms } = require('controller/MergedSubController');
const { wdqk } = require('controller/WdqkController');
const { seeu } = require('controller/SeeuController');
const { ss } = require('controller/SwallowedController');
const { cutVal } = require("function/function");

module.exports = (function() {
    return function(bot) {
        bot.on('message', async (msg) => {
            const prefixFunctions = {
                'ri': (msg, sender, client, arg, chat) => ri(msg, arg, chat),
                'btth': (msg, sender, client, arg, chat) => btth(msg, arg, chat),
                'pw': (msg, sender, client, arg, chat) => pw(msg, arg, chat),
                'ms': (msg, sender, client, arg, chat) => ms(msg, arg, chat),
                'wdqk': (msg, sender, client, arg, chat) => wdqk(msg, arg, chat),
                // 'seeu': (msg, sender, client, arg, chat) => seeu(msg, arg, chat),
                'ss': (msg, sender, client, arg, chat) => ss(msg, arg, chat),
            };    
            
            const prefix = ['/', '!'];

            let config = fs.readFileSync(`./config.json`, 'utf-8');
            config = JSON.parse(config);

            const chat = await msg.getChat();
            
            bot.sendPresenceAvailable();

            const text = msg.body.toLowerCase() || '';

            let sender = msg.from;

            // console.log(msg.body, `MessageFrom:${ chat.name }`);
            const value = cutVal(msg.body, 1);

            if(!chat.isGroup) {
                for (const pre of prefix) {
                    if (text.startsWith(`${pre}`)) {
                        const funcName = text.replace(pre, '').trim().split(' ');

                        if (prefixFunctions[funcName[0]]) {     
                            console.log(value, `cmd:${ funcName[0] }`);
                            return prefixFunctions[funcName[0]](msg, sender, bot, value, chat);
                        } 
                    }
                }
            }
        });
    };
})();