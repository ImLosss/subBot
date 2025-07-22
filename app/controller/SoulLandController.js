require('module-alias/register');
const console = require('console');
const { withErrorHandling, readJSONFileSync } = require('function/function')
const { deepseek, deepseekTraining } = require('function/deepseek');

const sl = withErrorHandling(async (msg, arg, chat) => {
    let config = readJSONFileSync(`./config3.json`)
    let response;
    
    if(!arg) return await chat.sendMessage('Command salah/kurang');
    else if(arg.startsWith('training')) response = await deepseekTraining(arg, 'database/data_chat/data_chat_jd_deepseek', config.GLOBAL_CHAT_SL_TRAINING2);
    else response = await deepseek(arg, 'database/training/sl', 'database/training/important/sl.json', config.GLOBAL_CHAT_SL, chat);

    await chat.sendMessage(response);
})

module.exports = {
    sl
}