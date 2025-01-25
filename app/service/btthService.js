require('module-alias/register');
const console = require('console');
const axios = require('axios');
const { cutVal, reqEden, splitSrt } = require('function/function');
const fs = require('fs')

async function globalUpdate(arg, chat) {
    let config = fs.readFileSync(`./config.json`, 'utf-8');
    config = JSON.parse(config);

    arg = cutVal(arg, 1);

    config.GLOBAL_CHAT_BTTH = arg;

    fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));

    return await chat.sendMessage("Data berhasil di update");
}

async function eden(prompt) {
    const prompts = splitSrt(prompt);

    console.log(prompts.length, 'Prompts length after split');
    const dir_history_chat = `database/data_chat/data_chat_btth`;

    let config = fs.readFileSync(`./config.json`, 'utf-8');
    config = JSON.parse(config);

    let str = "";
    let tempChatHistory = [];
    let totReq = 0;
    let totCost = 0;
    for(let prompt of prompts) {
        let chatHistory = [];
            
        if(fs.existsSync(dir_history_chat)) {
            const fileData = fs.readFileSync(dir_history_chat, 'utf-8');
            chatHistory = JSON.parse(fileData);
        }
        chatHistory = chatHistory.concat(tempChatHistory);
        console.log(chatHistory);
        const response = await reqEden(config, chatHistory, prompt, config.GLOBAL_CHAT_BTTH)

        if(!response.status) return response.message;

        tempChatHistory.push({role: "user", message: prompt});
        tempChatHistory.push({role: "assistant", message: response.message});

        if(tempChatHistory.length > 4) tempChatHistory.splice(0, 2);

        str+=`${ response.message }\n\n`;

        totCost+=response.cost;
        totReq+=1;

        await new Promise(resolve => setTimeout(resolve, 1000)); // Delay for 1 second
    }

    console.log(`${ totCost } (${ totReq })`, 'Total Cost');

    return str;
}

async function edenTraining(prompt) {
    const dir_history_chat = `database/data_chat/data_chat_btth`;

    prompt = cutVal(prompt, 1);

    console.log(prompt);

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

        const response = await reqEden(config, chatHistory, prompt, config.GLOBAL_CHAT_BTTH_TRAINING);

        console.log(response.cost, 'cost');

        if(!response.status) return chat.sendMessage(response.message);

        chatHistory.push({role: "user", message: prompt});
        chatHistory.push({role: "assistant", message: response.message});

        if(chatHistory.length > 10) chatHistory.splice(0, 2);

        fs.writeFileSync(dir_history_chat, JSON.stringify(chatHistory));

        return chat.sendMessage(response.message);
    }
}

module.exports = {
    globalUpdate, eden, edenTraining
}