require('module-alias/register');
const fs = require('fs');
const path = require('path');

function parseSrt(content) {
    srtArr = content.split('\n');
    let line = 1;
    let srtList = [];
    let last = "";
    let srtJson = {};
    for (let item of srtArr) {
        item = item.trim();
        if(item == "") continue;

        if(last == "string" || last == "") {
            if (!Number(item)) return { status: false, message: `Terdapat Kesalahan pada line srt-training di line ke-${ line }` };
            srtJson["line"] = line;
            last = "line";
        } else if (last == "line") {
            if(!isSrtTimestamp(item)) return { status: false, message: `Terdapat kesalahan pada timestamp srt-training di line ke-${ line }` }
            srtJson["timestamp"] = item;
            last = "timestamp";
        } else if (last == "timestamp") {
            if(!item.includes('->')) return { status: false, message: `Terdapat kesalahan pada string srt-training di line ke-${ line }` }
            let splitString = item.split('->');
            if(!isMandarin(splitString[0].trim()) || !splitString[0].trim()) return { status: false, message: `Terdapat kesalahan format pada string srt-training di line ke-${ line }` }
            if(isMandarin(splitString[1].trim()) || !splitString[1].trim()) return { status: false, message: `Terdapat kesalahan format pada string srt-training di line ke-${ line }` }
            srtJson["mandarin"] = splitString[0].trim();
            srtJson["translated_indo"] = splitString[1].trim();
            last = "string";
            srtList.push(srtJson);
            srtJson = {};
            line+=1;
        }
    }
  
    return srtList;
}

function checkSrt(content) {
    srtArr = content.split('\n');
    let line = 1;
    let last = "";
    for (let item of srtArr) {
        item = item.trim();
        if(item == "") continue;

        if(last == "string" || last == "") {
            if (!Number(item)) return { status: false, message: `Terdapat Kesalahan pada line srt di line ke-${ line }: ${ item }` };
            last = "line";
        } else if (last == "line") {
            if(!isSrtTimestamp(item)) return { status: false, message: `Terdapat kesalahan pada timestamp srt di line ke-${ line }: ${ item }` }
            last = "timestamp";
        } else if (last == "timestamp") {
            if(!isMandarin(item.trim()) || !item.trim()) return { status: false, message: `Terdapat kesalahan format pada string srt di line ke-${ line }: ${ item }` }
            last = "string";
            line+=1;
        }
    }
  
    return true;
}

function isSrtTimestamp(str) {
    const srtRegex = /^\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}$/;
    return srtRegex.test(str);
}

function isMandarin(text) {
    const mandarinRegex = /[\u4e00-\u9fff]/;
    return mandarinRegex.test(text);
}

function getSRTFilesFromFolder(folderPath) {
    let trainingData = {};
    
    fs.readdirSync(folderPath).forEach(file => {
        const filePath = `${ folderPath }/${ file }`;
        const content = fs.readFileSync(filePath, 'utf-8');
        const fileName = path.basename(filePath, path.extname(filePath));
        const srtTrain = parseSrt(content);
        if (srtTrain.status == false) return trainingData = `${ fileName }: ${ srtTrain.message }`;
        trainingData[fileName] = srtTrain;
    });
    
    return trainingData;
}

function getSrt(folderPath, important) {
    return {
        training_data: getSRTFilesFromFolder(folderPath)
    };
}

module.exports = {
    checkSrt
}