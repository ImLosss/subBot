require('module-alias/register');
const console = require('console');
const { withErrorHandling, readJSONFileSync } = require('function/function')
const { globalUpdate, eden, edenTraining } = require('service/PerfectWorldService');
const { deepseek, deepseekTraining } = require('function/deepseek');

const pw = withErrorHandling(async (msg, arg, chat) => {
    let config = readJSONFileSync(`./config.json`)
    let response;
    
    if(!arg) return await chat.sendMessage('Command salah/kurang');
    if(arg.startsWith('updateglobal')) return globalUpdate(arg, chat);
    else if(arg.startsWith('training')) response = await deepseekTraining(arg, 'database/data_chat/data_chat_pw', config.GLOBAL_CHAT_TRAINING);
    else response = await deepseek(arg, 'database/data_chat/data_chat_pw', config.GLOBAL_CHAT_PW, chat);
    
    await chat.sendMessage(response);
})

module.exports = {
    pw
}