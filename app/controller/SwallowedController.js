require('module-alias/register');
const console = require('console');
const { withErrorHandling, readJSONFileSync } = require('function/function')
const { globalUpdate } = require('service/SwallowedService');
const { deepseek, deepseekTraining } = require('function/deepseek');

const ss = withErrorHandling(async (msg, arg, chat) => {
    let config = readJSONFileSync(`./config.json`)
    let response;
    
    if(!arg) return await chat.sendMessage('Command salah/kurang');
    if(arg.startsWith('updateglobal')) return globalUpdate(arg, chat);
    else if(arg.startsWith('training')) response = await deepseekTraining(arg, 'database/data_chat/data_chat_ss', config.GLOBAL_CHAT_TRAINING);
    else response = await deepseek(arg, 'database/data_chat/data_chat_ss', config.GLOBAL_CHAT_SS, chat);
    
    await chat.sendMessage(response);
})

module.exports = {
    ss
}