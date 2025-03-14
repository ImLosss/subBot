require('module-alias/register');
const axios = require('axios');
const fs = require('fs');
const console = require('console');
const { cutVal, splitSrt, readJSONFileSync, writeJSONFileSync } = require('function/function');
const { generateTrainingData } = require('function/getTrainingData');

async function deepseekOld(prompt, dirChat, globalChat) {
    const prompts = splitSrt(prompt);

    console.log(prompts.length, 'Prompts length after split');

    let str = "";
    let tempChatHistory = [];
    let totReq = 0;
    let totCost = 0;
    let totToken = 0;
    let repeatReq = 0;
    for(let i = 0; i < prompts.length; i++) {
        let prompt = prompts[i];

        let line = prompt.split('\n')[0].trim();

        if(!Number(line)) return 'format tidak valid';

        console.log(i, 'index');
            
        let chatHistory = [];
        
        if(fs.existsSync(dirChat)) {
            chatHistory = readJSONFileSync(dirChat)
        }

        chatHistory.unshift({role: "system", content: globalChat});

        chatHistory = chatHistory.concat(tempChatHistory);
        chatHistory.push({role: "user", content: prompt});
        const response = await reqDeepseek(chatHistory, 'deepseek-chat')

        if(!response.status) {
            // if(i > 0) return 
            // return response.message;
            i--
            repeatReq+=1;
            // console.log(chatHistory, 'chatHistory');
            // console.log(response.message, 'response');
            console.log('repeat');

            if(repeatReq > 5) if(str != "") return str;
            else return 'cancelled';
            continue;
        }

        totCost+=response.cost;
        totToken+= response.total_tokens;
        totReq+=1;

        if(!response.message.startsWith(line)){
            i--
            repeatReq+=1;
            // console.log(chatHistory, 'chatHistory');
            // console.log(response.message, 'response');
            console.log('repeat');

            if(repeatReq > 5) if(str != "") return str;
            else return 'cancelled';
            continue;
        }

        tempChatHistory.push({role: "user", content: prompt});
        tempChatHistory.push({role: "assistant", content: response.message});

        if(tempChatHistory.length > 4) tempChatHistory.splice(0, 2);

        str+=`${ response.message }\n\n`;

        await new Promise(resolve => setTimeout(resolve, 1000)); // Delay for 1 second
    }

    console.log(totToken, 'Total Tokens');
    console.log(`${ totCost }CNY (${ totReq })`, 'Total Cost');
    console.log(repeatReq, 'RepeatRequest');

    return str;
}

async function deepseek(prompt, dirChat, globalChat) {
    const prompts = splitSrt(prompt);

    console.log(prompts.length, 'Prompts length after split');

    let str = "";
    let tempChatHistory = [];
    let totReq = 0;
    let totCost = 0;
    let totToken = 0;
    let repeatReq = 0;
    for(let i = 0; i < prompts.length; i++) {
        let prompt = prompts[i];
        let config = readJSONFileSync(`./config.json`)

        let line = prompt.split('\n')[0].trim();

        if(!Number(line)) return 'format tidak valid';

        console.log(i, 'index');
            
        let chatHistory = [];
        chatHistory.unshift({role: "system", content: globalChat});
        chatHistory.push({ role: "tool", content: "response_test" })

        chatHistory = chatHistory.concat(tempChatHistory);
        chatHistory.push({role: "user", content: prompt});
        console.log(chatHistory);

        const response = await reqDeepseek(chatHistory, 'deepseek-chat')

        if(!response.status) {
            // if(i > 0) return 
            // return response.message;
            i--
            repeatReq+=1;
            // console.log(chatHistory, 'chatHistory');
            // console.log(response.message, 'response');
            console.log('repeat');

            if(repeatReq > 5) if(str != "") return str;
            else return 'cancelled';
            continue;
        }

        totCost+=response.cost;
        totToken+= response.total_tokens;
        totReq+=1;

        if(!response.message.startsWith(line)){
            i--
            repeatReq+=1;
            console.log('repeat');

            if(repeatReq > 5) if(str != "") return str;
            else return 'cancelled';
            continue;
        }

        tempChatHistory.push({role: "user", content: prompt});
        tempChatHistory.push({role: "assistant", content: response.message});

        if(tempChatHistory.length > 4) tempChatHistory.splice(0, 2);

        str+=`${ response.message }\n\n`;

        await new Promise(resolve => setTimeout(resolve, 1000)); // Delay for 1 second
    }

    console.log(totToken, 'Total Tokens');
    console.log(`${ totCost }CNY (${ totReq })`, 'Total Cost');
    console.log(repeatReq, 'RepeatRequest');

    return str;
}

async function deepseekTraining(prompt, dirChat, globalChat) {
    prompt = cutVal(prompt, 1);

    let config = readJSONFileSync(`./config.json`)

    if(prompt == "reset"){
        if (fs.existsSync(dirChat)){
            fs.unlink(`./${ dirChat }`, (err) => {
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
        let messages = [];
        
        if(fs.existsSync(dirChat)) {
            chatHistory = readJSONFileSync(dirChat)
            messages = structuredClone(chatHistory);
        }

        messages.unshift({role: "system", content: globalChat});
        messages.push({role: "user", content: prompt});

        const response = await reqDeepseekTraining(config, messages, 'deepseek-chat');

        console.log(response.cost, 'cost');

        if(!response.status) return response.message;

        chatHistory.push({role: "user", content: prompt});
        chatHistory.push({role: "assistant", content: response.content});

        if(chatHistory.length > 10) chatHistory.splice(0, 2);

        writeJSONFileSync(dirChat, chatHistory);

        return response.message.content;
    }
}

async function reqDeepseek(chatHistory, model) {
    let config = readJSONFileSync(`./config.json`)

    let error;
    const url = 'https://api.deepseek.com/chat/completions';

    const headers = {
        'accept': 'application/json',
        'authorization': `Bearer ${config.DEEPSEEK_APIKEY}`,
        'content-type': 'application/json'
    };

    const data = {
        messages: chatHistory,
        model: model,
        frequency_penalty: 0,
        max_tokens: 8192,
        presence_penalty: 0,
        response_format: { type: 'text' },
        stop: null,
        stream: false,
        stream_options: null,
        temperature: 1,
        tools: null,
        tool_choice: 'none',
    };

    const response = await axios.post(url, data, { headers });
    console.log(response.data);
    if(response.data == '') return { status: false, message: error };
    
    try {
        const response_message = response.data.choices[0].message.content;
        let cost_input_miss_cny = (response.data.usage.prompt_cache_miss_tokens / 1000000) * 2;
        let cost_input_hit_cny = (response.data.usage.prompt_cache_hit_tokens / 1000000) * 0.5;
        let cost_output_cny = (response.data.usage.completion_tokens / 1000000) * 8;

        return {
            status: true,
            message: response_message,
            total_tokens: response.data.usage.total_tokens,
            cost: cost_input_hit_cny + cost_input_miss_cny + cost_output_cny
        } 
    } catch (err) {
        error = err.message;
        console.log(error);

        await new Promise(resolve => setTimeout(resolve, 500)); // Delay for 1 second

        return {
            status: false,
            message: error
        };
    }
}

async function reqDeepseekTraining(config, chatHistory, model) {
    console.log(chatHistory);
    let error;
    const url = 'https://api.deepseek.com/chat/completions';

    const headers = {
        'accept': 'application/json',
        'authorization': `Bearer ${config.DEEPSEEK_APIKEY}`,
        'content-type': 'application/json'
    };

    const data = {
        messages: chatHistory,
        model: model,
        frequency_penalty: 0,
        max_tokens: 8192,
        presence_penalty: 0,
        response_format: { type: 'text' },
        stop: null,
        stream: false,
        stream_options: null,
        temperature: 1,
        tools: null,
        tool_choice: 'none',
    };

    const response = await axios.post(url, data, { headers });
    if(response.data == '') return { status: false, message: 'gagal' }
    
    try {
        const response_message = response.data.choices[0].message;
        let cost_input_miss_cny = (response.data.usage.prompt_cache_miss_tokens / 1000000) * 2;
        let cost_input_hit_cny = (response.data.usage.prompt_cache_hit_tokens / 1000000) * 0.5;
        let cost_output_cny = (response.data.usage.completion_tokens / 1000000) * 8;

        return {
            status: true,
            message: response_message,
            content: response_message.content,
            // reasoning_content: response_message.reasoning_content,
            total_tokens: response.data.usage.total_tokens,
            cost: cost_input_hit_cny + cost_input_miss_cny + cost_output_cny
        } 
    } catch (err) {
        error = err.message;
        console.log(error);

        return {
            status: false,
            message: error
        }; // Return false if no valid API key is found
    }

}

module.exports = {
    reqDeepseek, deepseek, deepseekTraining, reqDeepseekTraining
}