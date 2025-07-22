require('module-alias/register');
const console = require('console');
const { withErrorHandling, readJSONFileSync } = require('function/function')
const { globalUpdate, eden, edenTraining } = require('service/btthService');
const { deepseek, deepseekTraining } = require('function/deepseek');

const ri = withErrorHandling(async (msg, arg, chat) => {
    let config = readJSONFileSync(`./config3.json`)
    let response;
    
    if(!arg) return await chat.sendMessage('Command salah/kurang');
    if(arg.startsWith('updateglobal')) return globalUpdate(arg, chat);
<<<<<<< HEAD
    else if(arg.startsWith('training')) response = await deepseekTraining(arg, 'database/data_chat/data_chat_ri_deepseek', config.GLOBAL_CHAT_BTTH_TRAINING2);
    else response = await deepseek(arg, 'database/data_chat/data_chat_ri', config.GLOBAL_CHAT_RENEGADE, chat);
=======
    else if(arg.startsWith('training')) response = await deepseekTraining(arg, 'database/data_chat/data_chat_btth_deepseek', config.GLOBAL_CHAT_BTTH_TRAINING2);
    else response = await deepseek(arg, 'database/training/ri', 'database/training/important/ri.json', config.GLOBAL_CHAT_RI, chat);
>>>>>>> mode3
    
    await chat.sendMessage(response);
})

module.exports = {
    ri
}