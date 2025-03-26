require('module-alias/register');
const console = require('console');
const { withErrorHandling, readJSONFileSync } = require('function/function')
const { globalUpdate, eden, edenTraining } = require('service/btthService');
const { deepseek, deepseekTraining } = require('function/deepseek');

const btth = withErrorHandling(async (msg, arg, chat) => {
    let config = readJSONFileSync(`./config.json`)
    let response;
    
    if(!arg) return await chat.sendMessage('Command salah/kurang');
    if(arg.startsWith('updateglobal')) return globalUpdate(arg, chat);
    else if(arg.startsWith('training')) response = await deepseekTraining(arg, 'database/data_chat/data_chat_btth_deepseek', config.GLOBAL_CHAT_BTTH_TRAINING2);
    else response = await deepseek(arg, 'database/training/btth', config.GLOBAL_CHAT_BTTH);
    
    await chat.sendMessage(response);
})

module.exports = {
    btth
}