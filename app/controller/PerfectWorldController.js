require('module-alias/register');
const console = require('console');
const { withErrorHandling } = require('function/function')
const { globalUpdate, eden, edenTraining, deepseek, deepseekTraining } = require('service/PerfectWorldService');

const pw = withErrorHandling(async (msg, arg, chat) => {
    if(arg.startsWith('updateglobal')) return globalUpdate(arg, chat);
    if(arg.startsWith('training')) return chat.sendMessage(await deepseekTraining(arg));
    if(!arg) return chat.sendMessage('Command salah/kurang');

    const response = await deepseek(arg)
    chat.sendMessage(response);
})

module.exports = {
    pw
}