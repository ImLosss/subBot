require('module-alias/register');

const { getValue } = require("function/function");
const { ri } = require("controller/RenegadeImmortalController");

module.exports = (function() {
    return function(bot) {
        bot.onText(/^\/ri/i, async (msg) => {
            const chatId = msg.chat.id;
            const value = getValue(msg);

            await ri(chatId, value, bot);
        });
    };
})();