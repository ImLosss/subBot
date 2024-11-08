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

async function globalUpdate(value,chatId, bot) {
    let config = fs.readFileSync(`./config.json`, 'utf-8');
    config = JSON.parse(config);

    value = cutVal(value, 1);

    config.GLOBAL_CHAT_RENEGADE = value;

    fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));

    return bot.sendMessage(chatId, "Data berhasil di update");
}

module.exports = {
    getApiEden, globalUpdate
}