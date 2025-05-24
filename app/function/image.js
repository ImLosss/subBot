require('module-alias/register');
const axios = require('axios');
const fs = require('fs');
const console = require('console');
const { cutVal, readJSONFileSync, writeJSONFileSync, getApiEden } = require('function/function');

async function image(config, arg, media) {
    for (const apikey of config["EDEN_APIKEY_2"]) {
        const url = 'https://api.edenai.run/v2/multimodal/chat';

        console.log(media.filesize)

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
            chatbot_global_action: "kamu adalah asisten penerjemah khusus film donghua, kamu akan menerjemahkan teks mandarin yang saya kirimkan ke bahasa indonesia, jika saya mengirimkan gambar, kamu akan menerjemahkan teks yang ada di dalam gambar tersebut ke bahasa indonesia.\n\nKirim jawaban kamu dalam format format dibawah:\n\nmandarin: [teks mandarin yang saya kirimkan dalam gambar]\nPinyin: [teks mandarin dalam pinyin]\nindonesia: [terjemahan bahasa indonesia dari teks mandarin yang saya kirimkan].",
            messages: [
                {
                    role: "user",
                    content: [ 
                        {
                            type: "text",
                            content: {
                                text: "Berikan teks dan terjemahkan gambar yang saya kirim"
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
                "google/gemini-2.0-flash",
                // "openai/gpt-4o-mini"
            ]
        };

        try {
            const response = await axios.post(url, data, { headers, timeout: 280000 });
            const response_message = response.data['google/gemini-2.0-flash'].generated_text;

            console.log(response.data['google/gemini-2.0-flash'].cost, 'cost');

            if (response.data['google/gemini-2.0-flash'].status == 'fail') return { status: false, message: 'Request Timeout' }

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
}



module.exports = {
    image
}