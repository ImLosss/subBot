require('module-alias/register');
const console = require('console');
const axios = require('axios');
const { withErrorHandling } = require('function/function')
const { getApiEden, globalUpdate } = require('service/renegadeImmortalService');

const profil = ""

const ri = withErrorHandling(async (chatId, value, bot) => {
    let apikey = await getApiEden();
    if(!apikey) return bot.sendMessage(chatId, 'Saldo apikey sharing admin telah habis, coba kembali');

    if(value.startsWith('updateglobal')) return globalUpdate(value, chatId, bot);
})

module.exports = {
    ri
}