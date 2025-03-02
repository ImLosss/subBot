require('module-alias/register');
const axios = require('axios');
const moment = require('moment-timezone');
const fs = require('fs');
const path = require('path');
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
        // Pastikan direktori ada sebelum menulis file
        const dirPath = path.dirname(filePath);
        if (!fs.existsSync(dirPath)) {
            console.log('tess');
            fs.mkdirSync(dirPath, { recursive: true });
        }

         // Pastikan file ada sebelum mengunci
         if (!fs.existsSync(filePath)) {
            console.log('Membuat file:', filePath);
            fs.writeFileSync(filePath, '{}', 'utf-8'); // Buat file kosong agar bisa dikunci
        }

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

async function reqEdenMulti(config, globalChat, prompt, media) {
    let error;
    for (const apikey of config["EDEN_APIKEY_2"]) {
        const url = 'https://api.edenai.run/v2/multimodal/chat';

        // Path ke file gambar
        const imagePath = './doc.pdf';

        // Membaca file gambar secara sinkron
        const imageBuffer = fs.readFileSync(imagePath);

        // Konversi buffer ke Base64
        const base64Image = imageBuffer.toString('base64');

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
            messages: [
                {
                    role: "user",
                    content: [ 
                        {
                            type: "text",
                            content: {
                                text: prompt
                            }
                        },
                        {
                            type: "media_base64",
                            content: {
                                media_base64: media.data,
                                media_type: media.mimetype
                            }
                        }
                    ]
                }
            ],
            providers: [
                "openai/gpt-4o-mini"
            ]
        };

        try {
            const response = await axios.post(url, data, { headers, timeout: 280000 });
            const response_message = response.data['openai/gpt-4o-mini'].generated_text;

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
            tool_choice: "none",
            chatbot_global_action: globalChat,
            text: prompt,
            providers: [
                // "deepseek/DeepSeek-V3"
                "openai/gpt-4o-mini"
            ],
            previous_history: chatHistory
        };

        try {
            const response = await axios.post(url, data, { headers, timeout: 300000 });
            console.log(response.data)
            const response_message = response.data['openai/gpt-4o-mini'].generated_text;

            if (response.data['openai/gpt-4o-mini'].status == 'fail') return { status: false, message: 'Request Timeout' }

            return {
                status: true,
                message: response_message,
                cost: response.data['openai/gpt-4o-mini'].cost
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

function splitSrt(srt, groupSize = 50) {
  srtArr = srt.split('\n');
  let no = 0;
  let srtSplit = [];
  let srtString = "";
  for (let [index, item] of srtArr.entries()) {
    const isLastItem = index === srtArr.length - 1;
    item = item.trim();

    if(Number(item)) {
      if(no == 0) srtString += `${ item }\n`;
      else if(no != groupSize) srtString += `\n${ item }\n`;

      if (no == groupSize) {
        srtSplit.push(srtString);
        srtString = `${ item }\n`;
        no = 0
        // continue;
      }
      no = no + 1;
    } else {
      if(item == "" && !isLastItem) continue;
      srtString += `${ item }\n`;
      if (isLastItem) srtSplit.push(srtString);
    }
  }

  return srtSplit;
}

module.exports = {
    getTime, readJSONFileSync, writeJSONFileSync, sleep, withErrorHandling, cutVal, reqEden, reqEdenMulti, splitSrt
}