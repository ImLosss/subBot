require('module-alias/register');
const console = require('console');
const { withErrorHandling } = require('function/function')
const { getApiEden, globalUpdate, eden } = require('service/renegadeImmortalService');

const ri = withErrorHandling(async (chatId, value, bot) => {
    let apikey = await getApiEden();
    if(!apikey) return bot.sendMessage(chatId, 'Saldo apikey sharing admin telah habis, coba kembali');

    if(value.startsWith('updateglobal')) return globalUpdate(value, chatId, bot);
    if(!value) return bot.sendMessage(chatId, 'Command salah/kurang');

    const response = await eden(value, apikey)
    await bot.sendMessage(chatId, response);
})

module.exports = {
    ri
}