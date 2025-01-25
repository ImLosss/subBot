require('module-alias/register');
const console = require('console');
const { withErrorHandling } = require('function/function')
const { globalUpdate, eden, edenTraining } = require('service/btthService');

const btth = withErrorHandling(async (msg, arg, chat) => {
    if(arg.startsWith('updateglobal')) return globalUpdate(arg, chat);
    if(arg.startsWith('training')) return edenTraining(arg);
    if(!arg) return await chat.sendMessage('Command salah/kurang');

    const response = await eden(arg)
    await chat.sendMessage(response);
})

module.exports = {
    btth
}