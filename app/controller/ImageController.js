require('module-alias/register');
const console = require('console');
const { withErrorHandling, readJSONFileSync } = require('function/function')
const { globalUpdate } = require('service/MergedSubService');
const { image } = require('function/image');
const { cutVal } = require("function/function");

const img = withErrorHandling(async (msg, arg, chat) => {
    let media;
    let config = readJSONFileSync(`./config.json`);

    if(msg.hasMedia) {
        media = await msg.downloadMedia();
        
        if(!media || !media.data || !media.mimetype) {
            return await chat.sendMessage('Tidak ada media yang ditemukan.');
        }
        if(!media.mimetype.startsWith('image/')) {
            return await chat.sendMessage('Hanya gambar yang didukung.');
        }
    }

    let response = await image(config, arg, media);
    
    await chat.sendMessage(response.message);
})

module.exports = {
    img
}