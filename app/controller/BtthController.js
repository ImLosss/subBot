require('module-alias/register');
const console = require('console');
const { withErrorHandling, readJSONFileSync } = require('function/function')
const { globalUpdate, eden, edenTraining } = require('service/btthService');
const { deepseek, deepseekTraining } = require('function/deepseek');

const btth = withErrorHandling(async (msg, arg, chat) => {
    let config = readJSONFileSync(`./config3.json`)
    let response;
    
    if(!arg) return await chat.sendMessage('Command salah/kurang');
    if(arg.startsWith('updateglobal')) return globalUpdate(arg, chat);
<<<<<<< HEAD
    else if(arg.startsWith('training')) response = await deepseekTraining(arg, 'database/data_chat/data_chat_btth', config.GLOBAL_CHAT_TRAINING);
    else response = await deepseek(arg, 'database/data_chat/data_chat_btth', config.GLOBAL_CHAT_BTTH, chat);
=======
    else if(arg.startsWith('training')) response = await deepseekTraining(arg, 'database/data_chat/data_chat_btth_deepseek', config.GLOBAL_CHAT_BTTH_TRAINING2);
    else response = await deepseek(arg, 'database/training/btth', 'database/training/important/btth.json', config.GLOBAL_CHAT_BTTH, chat);
>>>>>>> mode3
    
    await chat.sendMessage(response);
})

module.exports = {
    btth
}