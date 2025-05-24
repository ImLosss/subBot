require('module-alias/register');
const { checkSrt } = require('function/checkSrt');

const srt = `1
00:00:02,320 --> 00:00:03,759
大变将至

4
00:00:04,600 --> 00:00:06,319
定是外界之人急不可

3
00:00:06,880 --> 00:00:08,199
在他们踏入仙古之前

4
00:00:08,840 --> 00:00:10,359
定要夺取终极机缘`;

console.log(checkSrt(srt))