require('module-alias/register');
const console = require('console');
const { withErrorHandling, readJSONFileSync } = require('function/function')
const { globalUpdate, eden, edenTraining } = require('service/renegadeImmortalService');
const { deepseek, deepseekTraining } = require('function/deepseek');

const ri = withErrorHandling(async (msg, arg, chat) => {
    let config = readJSONFileSync(`./config.json`)
    let response;
    
    if(!arg) return await chat.sendMessage('Command salah/kurang');
    if(arg.startsWith('updateglobal')) return globalUpdate(arg, chat);
    else if(arg.startsWith('training')) response = await deepseekTraining(arg, 'database/data_chat/data_chat_ri_deepseek', config.GLOBAL_CHAT_BTTH_TRAINING2);
    else response = await deepseek(arg, 'database/data_chat/data_chat_ri', config.GLOBAL_CHAT_RENEGADE, chat);
    
    await chat.sendMessage(response);
})

module.exports = {
    ri
}