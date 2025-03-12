require('module-alias/register');
const console = require('console');
const { withErrorHandling, readJSONFileSync } = require('function/function')
const { globalUpdate } = require('service/MergedSubService');
const { reqDeepseek, deepseekTraining } = require('function/deepseek');
const { cutVal } = require("function/function");

const ms = withErrorHandling(async (msg, arg, chat) => {
    let config = readJSONFileSync(`./config.json`)
    
    if(!arg) return await chat.sendMessage('Command salah/kurang');
    if(arg.startsWith('updateglobal')) return globalUpdate(arg, chat);

    let response = await reqDeepseek([{role: "system", content: config.GLOBAL_CHAT_MERGED}, {role: 'user', content: arg}], 'deepseek-chat');

    console.log(response.total_tokens, 'Total Tokens');
    console.log(`${ response.cost }CNY`, 'Total Cost');
    
    await chat.sendMessage(response.message);
})

module.exports = {
    ms
}