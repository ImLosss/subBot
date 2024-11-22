require('module-alias/register');
const axios = require('axios');
const moment = require('moment-timezone');
const fs = require('fs');
const console = require('console');
const lockfile = require('proper-lockfile');

function sleep(ms) {
    return new Promise(resolve => {
        const intervalId = setInterval(() => {
            clearInterval(intervalId);
            resolve();
        }, ms);
    });
}

function cutVal(value, index) {
    const words = value.split(' '); // Pisahkan kalimat menjadi array kata-kata
    return words.slice(index).join(' '); // Gabungkan kembali kata-kata dari indeks yang ditentukan
}

function getTime() {
    // Tentukan zona waktu Makassar
    const time = moment().tz('Asia/Makassar');

    // Ambil tanggal, jam, dan menit
    const tanggal = time.format('YYYY-MM-DD');
    const jam = time.format('HH');
    const menit = time.format('mm');

    return `${ tanggal } / ${ jam }:${ menit }`;
}

function readJSONFileSync(filePath) {
    let release;
    try {
        // Lock the file for reading
        release = lockfile.lockSync(filePath);
        
        const fileContent = fs.readFileSync(filePath, 'utf-8');

        return JSON.parse(fileContent);
    } catch (error) {
        console.error('error');
    } finally {
        if (release) {
            release();
        }
    }
}

function writeJSONFileSync(filePath, data) {
    let release;
    try {
        // Lock the file for writing
        release = lockfile.lockSync(filePath);
        
        const jsonData = JSON.stringify(data, null, 2);
        fs.writeFileSync(filePath, jsonData, 'utf-8');
    } catch (error) {
        console.error('Error writing file:', error);
    } finally {
        if (release) {
            release();
        }
    }
}

const withErrorHandling = (fn) => {
    return async (...args) => {
        try {
            await fn(...args);
        } catch (err) {
            console.error(err);
        }
    };
};

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
            temperature: 1,
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
    getTime, readJSONFileSync, writeJSONFileSync, sleep, withErrorHandling, cutVal, reqEden
}