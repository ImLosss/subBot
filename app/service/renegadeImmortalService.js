require('module-alias/register');
const console = require('console');
const axios = require('axios');
const { cutVal, reqEden, splitSrt, readJSONFileSync, writeJSONFileSync } = require('function/function');
const fs = require('fs')

async function globalUpdate(arg, chat) {
    let config = readJSONFileSync(`./config.json`)

    arg = cutVal(arg, 1);

    config.GLOBAL_CHAT_RENEGADE = arg;

    writeJSONFileSync('./config.json', config);

    return await chat.sendMessage("Data berhasil di update");
}

async function eden(prompt) {
    const prompts = splitSrt(prompt);

    console.log(prompts.length, 'Prompts length after split');
    const dir_history_chat = `database/data_chat/data_chat_ri`;

    let config = readJSONFileSync(`./config.json`)

    let str = "";
    let tempChatHistory = [];
    let totReq = 0;
    let totCost = 0;
    let repeatReq = 0;
    for(let i = 0; i < prompts.length; i++) {
        let chatHistory = [];
        let prompt = prompts[i];

        let line = prompt.split('\n')[0].trim();

        if(!Number(line)) return 'format tidak valid';

        console.log(i, 'index');
            
        if(fs.existsSync(dir_history_chat)) {
            chatHistory = readJSONFileSync(dir_history_chat)
        }

        chatHistory = chatHistory.concat(tempChatHistory);
        const response = await reqEden(config, chatHistory, prompt, config.GLOBAL_CHAT_RENEGADE)

        if(!response.status) {
            // if(i > 0) return 
            // return response.message;
            i--
            repeatReq+=1;
            console.log(prompt, 'prompt')
            console.log(response.message, 'response');
            console.log('repeat');

            if(repeatReq > 5) if(i > 0) return str;
            else return 'cancelled';
            continue;
        }

        totCost+=response.cost;
        totReq+=1;

        if(!response.message.startsWith(line)){
            i--
            repeatReq+=1;
            console.log(prompt, 'prompt')
            console.log(response.message, 'response');
            console.log('repeat');

            if(repeatReq > 5) if(i > 0) return str;
            else return 'cancelled';
            continue;
        }

        tempChatHistory.push({role: "user", message: prompt});
        tempChatHistory.push({role: "assistant", message: response.message});

        if(tempChatHistory.length > 4) tempChatHistory.splice(0, 2);

        str+=`${ response.message }\n\n`;

        await new Promise(resolve => setTimeout(resolve, 1000)); // Delay for 1 second
    }

    console.log(`${ totCost } (${ totReq })`, 'Total Cost');
    console.log(repeatReq, 'RepeatRequest');

    return str;
}

async function edenTraining(prompt) {
    const dir_history_chat = `database/data_chat/data_chat_ri`;

    prompt = cutVal(prompt, 1);

    console.log(prompt);

    let config = readJSONFileSync(`./config.json`)

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
            chatHistory = readJSONFileSync(dir_history_chat)
        }

        const response = await reqEden(config, chatHistory, prompt, config.GLOBAL_CHAT_RENEGADE_TRAINING);

        console.log(response.cost, 'cost');

        if(!response.status) return chat.sendMessage(response.message);

        chatHistory.push({role: "user", message: prompt});
        chatHistory.push({role: "assistant", message: response.message});

        if(chatHistory.length > 10) chatHistory.splice(0, 2);

        writeJSONFileSync(dir_history_chat, chatHistory);

        return response.message;
    }
}

module.exports = {
    globalUpdate, eden, edenTraining
}