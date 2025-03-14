require('module-alias/register');
const axios = require('axios');
const { readJSONFileSync } = require('function/function');

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
        tools: [
            {
                "type": "function",
                "function": {
                    "name": "get_weather",
                    "description": "Get weather of an location, the user shoud supply a location first",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "location": {
                                "type": "string",
                                "description": "The city and state, e.g. San Francisco, CA",
                            }
                        },
                        "required": ["location"]
                    },
                }
            },
        ],
        tool_choice: 'auto',
    };

    const response = await axios.post(url, data, { headers });
    console.log(response.data);
    if(response.data == '') return { status: false, message: error };
    
    try {
        const response_message = response.data.choices[0].message;
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

reqDeepseek([
    { role: 'user', content: "How's the weather in Hangzhou?" },
    {
      role: 'assistant',
      content: '',
      tool_calls: [
        {
          id: 'call_0_06b042f3-4aeb-4d32-a6f9-a72e38d2fe4a',
          function: {
            name: 'get_weather',
            arguments: JSON.stringify({ location: 'Hangzhou' })
          },
          type: 'function'
        }
      ]
    },
    {
      role: 'tool',
      tool_call_id: 'call_0_06b042f3-4aeb-4d32-a6f9-a72e38d2fe4a',
      content: '24℃'
    }
  ], 'deepseek-chat')
.then((result) => {
    console.log(result.message);
})