require('module-alias/register');
const console = require('console');
const axios = require('axios');
const { cutVal, reqEden } = require('function/function');
const fs = require('fs')



async function globalUpdate(arg, chat) {
    let config = fs.readFileSync(`./config.json`, 'utf-8');
    config = JSON.parse(config);

    arg = cutVal(arg, 1);

    config.GLOBAL_CHAT_RENEGADE = arg;

    fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));

    return await chat.sendMessage("Data berhasil di update");
}

async function eden(prompt) {
    const dir_history_chat = `database/data_chat/data_chat_ri`;
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

        const response = await reqEden(config, chatHistory, prompt, config.GLOBAL_CHAT_RENEGADE)

        if(!response.status) return response.message;

        chatHistory.push({role: "user", message: prompt});
        chatHistory.push({role: "assistant", message: response.message});

        if(chatHistory.length > 10) chatHistory.splice(0, 2);

        fs.writeFileSync(dir_history_chat, JSON.stringify(chatHistory));

        return response.message;
    }
}

module.exports = {
    globalUpdate, eden
}