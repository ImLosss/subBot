require('module-alias/register');
const console = require('console');
const { withErrorHandling, readJSONFileSync } = require('function/function')
const { globalUpdate } = require('service/SwallowedService');
const { deepseek, deepseekTraining } = require('function/deepseek');

const ss = withErrorHandling(async (msg, arg, chat) => {
    let config = readJSONFileSync(`./config3.json`)
    let response;
    
    if(!arg) return await chat.sendMessage('Command salah/kurang');
    if(arg.startsWith('updateglobal')) return globalUpdate(arg, chat);
<<<<<<< HEAD
    else if(arg.startsWith('training')) response = await deepseekTraining(arg, 'database/data_chat/data_chat_ss', config.GLOBAL_CHAT_TRAINING);
    else response = await deepseek(arg, 'database/data_chat/data_chat_ss', config.GLOBAL_CHAT_SS, chat);
=======
    else if(arg.startsWith('training')) response = await deepseekTraining(arg, 'database/data_chat/data_chat_btth_deepseek', config.GLOBAL_CHAT_BTTH_TRAINING2);
    else response = await deepseek(arg, 'database/training/ss', 'database/training/important/ss.json', config.GLOBAL_CHAT_SS, chat);
>>>>>>> mode3
    
    await chat.sendMessage(response);
})

module.exports = {
    ss
}