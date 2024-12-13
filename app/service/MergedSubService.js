require('module-alias/register');
const console = require('console');
const axios = require('axios');
const { cutVal } = require('function/function');
const fs = require('fs')

async function globalUpdate(arg, chat) {
    let config = fs.readFileSync(`./config.json`, 'utf-8');
    config = JSON.parse(config);

    arg = cutVal(arg, 1);

    config.GLOBAL_CHAT_MERGED = arg;

    fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));

    return await chat.sendMessage("Data berhasil di update");
}

async function eden(prompt) {
    let config = fs.readFileSync(`./config.json`, 'utf-8');
    config = JSON.parse(config);
    let chatHistory = [];

    const response = await reqEden(config, chatHistory, prompt, config.GLOBAL_CHAT_MERGED)

    if(!response.status) return response.message;

    if(chatHistory.length > 10) chatHistory.splice(0, 2);

    return response.message;
}

async function reqEden(config, chatHistory, prompt, globalChat) {
    let error;
    for (const apikey of config["EDEN_APIKEY"]) {
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
            max_tokens: 16384,
            tool_choice: "auto",
            chatbot_global_action: globalChat,
            text: prompt,
            providers: [
                "openai/gpt-4o-mini"
            ],
            previous_history: chatHistory
        };

        try {
            const response = await axios.post(url, data, { headers, timeout: 240000 });
            const response_message = response.data['openai/gpt-4o-mini'].generated_text;

            // console.log(response.data);

            console.log(response.data['openai/gpt-4o-mini'].cost, 'cost');

            if (response.data['openai/gpt-4o-mini'].status == 'fail') return { status: false, message: 'Request Timeout' }

            return {
                status: true,
                message: response_message
            } 
        } catch (err) {
            error = err.message;
            console.log(error);
        }

        // Optional: Add a delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500)); // Delay for 1 second
    }

    return {
        status: false,
        message: error
    }; // Return false if no valid API key is found
}

module.exports = {
    globalUpdate, eden
}