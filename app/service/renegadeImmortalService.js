require('module-alias/register');
const console = require('console');
const { EDEN_APIKEY } = require('config');
const axios = require('axios');
const { cutVal } = require('function/function');
const fs = require('fs')

async function getApiEden() {
    for (const apikey of EDEN_APIKEY) {
        const url = 'https://api.edenai.run/v2/text/chat';
        const headers = {
            'accept': 'application/json',
            'authorization': `Bearer ${apikey}`,
            'content-type': 'application/json'
        };

        const data = {
            response_as_dict: true,
            attributes_as_list: false,
            show_base_64: true,
            show_original_response: false,
            temperature: 0,
            max_tokens: 1000,
            tool_choice: "auto",
            providers: [
                "openai/gpt-3.5-turbo-0125",
            ],
            text: "halo"
        };

        try {
            const response = await axios.post(url, data, { headers, timeout: 120000 });
            return apikey; // Return true if a valid API key is found
        } catch (error) {

        }

        // Optional: Add a delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500)); // Delay for 1 second
    }

    return false; // Return false if no valid API key is found
}

async function globalUpdate(arg, chat) {
    let config = fs.readFileSync(`./config.json`, 'utf-8');
    config = JSON.parse(config);

    arg = cutVal(arg, 1);

    config.GLOBAL_CHAT_RENEGADE = arg;

    fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));

    return await chat.sendMessage("Data berhasil di update");
}

async function eden(prompt, apikey) {
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

        const url = 'https://api.edenai.run/v2/text/chat';

        const headers = {
            'accept': 'application/json',
            'authorization': `Bearer ${apikey}`,
            'content-type': 'application/json'
        };

        const data = {
            response_as_dict: true,
            attributes_as_list: false,
            show_base_64: true,
            show_original_response: false,
            temperature: 1,
            max_tokens: 10000,
            tool_choice: "auto",
            chatbot_global_action: config.GLOBAL_CHAT_RENEGADE,
            text: prompt,
            providers: [
                "openai/gpt-4o"
            ],
            previous_history: chatHistory
        };

        const response = await axios.post(url, data, { headers, timeout: 120000 })
        const response_message = response.data['openai/gpt-4o'].generated_text;

        chatHistory.push({role: "user", message: prompt});
        chatHistory.push({role: "assistant", message: response_message});

        if(chatHistory.length > 10) chatHistory.splice(0, 2);

        fs.writeFileSync(dir_history_chat, JSON.stringify(chatHistory));

        return response_message;
    }
}

module.exports = {
    getApiEden, globalUpdate, eden
}