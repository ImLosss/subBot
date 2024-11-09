require('module-alias/register');
const console = require('console');
const { withErrorHandling, getApiEden } = require('function/function')
const { globalUpdate, eden } = require('service/btthService');

const btth = withErrorHandling(async (msg, arg, chat) => {
    let apikey = await getApiEden();
    if(!apikey) return await chat.sendMessage('Saldo apikey sharing admin telah habis, coba kembali');

    if(arg.startsWith('updateglobal')) return globalUpdate(arg, chat);
    if(!arg) return await chat.sendMessage('Command salah/kurang');

    const response = await eden(arg, apikey)
    await chat.sendMessage(response);
})

module.exports = {
    btth
}