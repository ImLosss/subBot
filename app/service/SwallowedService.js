require('module-alias/register');
const console = require('console');
const axios = require('axios');
const { cutVal, reqEden, splitSrt, readJSONFileSync, writeJSONFileSync } = require('function/function');
const fs = require('fs')

async function globalUpdate(arg, chat) {
    let config = readJSONFileSync(`./config.json`)

    arg = cutVal(arg, 1);

    config.GLOBAL_CHAT_SS = arg;

    writeJSONFileSync('./config.json', config);

    return await chat.sendMessage("Data berhasil di update");
}

module.exports = {
    globalUpdate
}