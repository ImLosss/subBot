require('module-alias/register');
// const console = require('console');
const { withErrorHandling } = require('function/function')
const { globalUpdate, eden } = require('service/SeeuService');

const seeu = withErrorHandling(async (msg, arg, chat) => {
    if(arg.startsWith('updateglobal')) return globalUpdate(arg, chat);
    if(!arg) return await chat.sendMessage('Command salah/kurang');

    let media = null;
    if(msg.hasQuotedMsg) {
        msg = await msg.getQuotedMessage();
    }
    
    if(msg.hasMedia) {
        media = await msg.downloadMedia();
    }
    
    const response = await eden(arg, media)
    await chat.sendMessage(response);
})

module.exports = {
    seeu
}