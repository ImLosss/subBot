require('module-alias/register');
const console = require('console');
const axios = require('axios');
const { cutVal, reqEdenMulti, reqEden, readJSONFileSync, writeJSONFileSync } = require('function/function');
const fs = require('fs')

async function globalUpdate(arg, chat) {
    let config = fs.readFileSync(`./config.json`, 'utf-8');
    config = JSON.parse(config);

    arg = cutVal(arg, 1);

    config.GLOBAL_CHAT_SEEU = arg;

    writeJSONFileSync('./config.json', config);

    return await chat.sendMessage("Data berhasil di update");
}

async function eden(prompt, media) {
    const dir_history_chat = `database/data_chat/data_chat_seeu`;

    let update = false;
    let config = fs.readFileSync(`./config.json`, 'utf-8');
    config = JSON.parse(config);

    if(prompt == "reset"){
        if (fs.existsSync(dir_history_chat)){
            fs.unlink(`./${ dir_history_chat }`, (err) => {
                if (err) {
                    console.error(err);
                } 
            });
            return 'berhasil menghapus riwayat chat';
        } else {
            return 'Gagal : Tidak menemukan riwayat chat';
        }
    } else {
        let chatHistory = [];

        if(fs.existsSync(dir_history_chat)) {
            const fileData = fs.readFileSync(dir_history_chat, 'utf-8');
            chatHistory = JSON.parse(fileData);
        }

        if(prompt.startsWith('update')) {
            update = true;
            prompt = cutVal(prompt, 1);
        }

        if(media) {        

            const response = await reqEdenMulti(config, config.GLOBAL_CHAT_IMG, prompt, media)

            if(!response.status) return response.message;

            chatHistory.push({role: "user", message: `{ hasMedia: true, prompt: ${ prompt }, descriptionMedia: ${ response.message } }`});
        } else {
            chatHistory.push({role: "user", message: `{ hasMedia: false, prompt: ${ prompt } }`});
        }

        const response = await reqEden(config, chatHistory, prompt, config.GLOBAL_CHAT_IMG)

        if(!response.status) return response.message;

        chatHistory.push({role: "assistant", message: response.message});

        if(chatHistory.length > 20) chatHistory.splice(0, 2);

        writeJSONFileSync(dir_history_chat, chatHistory);

        return response.message;
    }
}

module.exports = {
    globalUpdate, eden
}