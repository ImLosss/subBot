require('module-alias/register');
const console = require('console');
const { withErrorHandling, readJSONFileSync } = require('function/function')
const { globalUpdate, eden, edenTraining } = require('service/btthService');
const { deepseek, deepseekTraining } = require('function/deepseek');

const jd = withErrorHandling(async (msg, arg, chat) => {
    let config = readJSONFileSync(`./config3.json`)
    let response;
    
    if(!arg) return await chat.sendMessage('Command salah/kurang');
    if(arg.startsWith('updateglobal')) return globalUpdate(arg, chat);
    else if(arg.startsWith('training')) response = await deepseekTraining(arg, 'database/data_chat/data_chat_jd_deepseek', config.GLOBAL_CHAT_JD_TRAINING2);
    else response = await deepseek(arg, 'database/training/jd', 'database/training/important/jd.json', config.GLOBAL_CHAT_JD, chat);

    await chat.sendMessage(response);
})

module.exports = {
    jd
}