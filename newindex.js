//const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
//const fastify = require('fastify')({ logger: true })
//const cheerio = require('cheerio')
//var fs = require('fs')
//var cors = require('cors')

import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import Fastify from 'fastify';
const fastify = Fastify({ logger: true });

const port = process.env.PORT || 5000;

process.env.TZ = "Asia/Bangkok";

let dir = 'tmp/';
const __filename = fileURLToPath(import.meta.url);

fs.access(path.dirname(__filename) + '/' + dir, fs.constants.W_OK, (err) => {
    if (err) {
        dir = '/tmp/';
        console.log("can't write");
        //copy file in /tmp to /tmp/
        fs.readdir('tmp/', (err, files) => {
            files.forEach(file => {
                fs.copyFile('tmp/' + file, '/tmp/' + file, (err) => {
                    if (err) throw err;
                    console.log('success!');
                });
            });
        });
        //process.exit(1);
    }else{
        console.log("can write");
    }
    //process.exit(0);
});

let mainapistatus = false;

/*(async () => {
    const testmainapi = await fetch('https://lotapi.pwisetthon.com/');
    if (testmainapi.status == 200) {
        mainapistatus = true;
    }
})();*/

fetch('https://lotapi.pwisetthon.com/')
    .then(res => res.status)
    .then(status => {
        if (status == 200) {
            mainapistatus = true;
        }
    });

function padLeadingZeros(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

function numbertomonth(num) {
    switch (num) {
        case '01':
            return 'มกราคม';
        case '02':
            return 'กุมภาพันธ์';
        case '03':
            return 'มีนาคม';
        case '04':
            return 'เมษายน';
        case '05':
            return 'พฤษภาคม';
        case '06':
            return 'มิถุนายน';
        case '07':
            return 'กรกฎาคม';
        case '08':
            return 'สิงหาคม';
        case '09':
            return 'กันยายน';
        case '10':
            return 'ตุลาคม';
        case '11':
            return 'พฤศจิกายน';
        case '12':
            return 'ธันวาคม';
    }
}

function monthtonumber(month) {
    switch (month) {
        case 'มกราคม':
            return '01';
        case 'กุมภาพันธ์':
            return '02';
        case 'มีนาคม':
            return '03';
        case 'เมษายน':
            return '04';
        case 'พฤษภาคม':
            return '05';
        case 'มิถุนายน':
            return '06';
        case 'กรกฎาคม':
            return '07';
        case 'สิงหาคม':
            return '08';
        case 'กันยายน':
            return '09';
        case 'ตุลาคม':
            return '10';
        case 'พฤศจิกายน':
            return '11';
        case 'ธันวาคม':
            return '12';
    }
}

fastify.get('/', async (request, reply) => {
    if(request.hostname == 'lotapi3.pwisetthon.com'){
        console.log(request.hostname);
        if(mainapistatus == true){
            //get raw url and change from lotapi3.pwisetthon.com to lotapi.pwisetthon.com
            const rawurl = request.raw.url;
            const mainapi = await fetch('https://lotapi.pwisetthon.com' + rawurl);
            const mainapibody = await mainapi.json();
            return mainapibody;
        }
    }
    let url;
    try {
        const checkurl = await fetch('http://localhost:' + port + '/index3')
        if (checkurl.status === 200) {
            url = 'http://localhost:' + port
        } else {
            url = 'https://' + request.headers.host
        }
    } catch (error) {
        url = 'https://' + request.headers.host
    }

    let test = ['test']

    var raw
    if (!request.query.date) {
        request.query.date = padLeadingZeros(new Date().getDate(), 2) + '' + padLeadingZeros((new Date().getMonth() + 1), 2) + '' + (new Date().getFullYear() + 543)
        raw = JSON.stringify({
            date: padLeadingZeros(new Date().getDate(), 2),
            month: padLeadingZeros((new Date().getMonth() + 1), 2),
            year: new Date().getFullYear()
        });
    } else {
        raw = JSON.stringify({
            date: request.query.date.substr(0, 2),
            month: request.query.date.substr(2, 2),
            year: parseInt(request.query.date.substr(4, 4)) - 543
        });
    }
    var date = new Date(parseInt(request.query.date.substr(4, 4)) - 543, parseInt(request.query.date.substr(2, 2)) - 1, parseInt(request.query.date.substr(0, 2)) + 1);
    var today = new Date();

    if (date.toDateString() === today.toDateString() || date.getTime() > today.getTime()) {
        /*if (request.query.from !== undefined) {
            await fetch(url + '/index3?date=' + request.query.date + '&from')
                .then(res => res.json())
                .then((body) => {
                    //res.send(body)
                    test = body
                })
        } else {
            await fetch(url + '/index3?date=' + request.query.date)
                .then(res => res.json())
                .then((body) => {
                    //res.send(body)
                    test = body
                })
        }*/
        let backup1url = new URL(url + request.raw.url.replace('/','/index2'));
        let backup2url = new URL(url + request.raw.url.replace('/','/index3'));
        //add param focus=true to backup url
        backup1url.searchParams.append('focus', 'true');
        backup2url.searchParams.append('focus', 'true');
        const backup1 = await fetch(backup1url.href);
        const backup2 = await fetch(backup2url.href);
        console.log(backup1url.href);
        console.log(backup2url.href);
        const bu1json = await backup1.json()
        const bu2json = await backup2.json()
        //if some json [0][1] is 0 and other is not 0 return 0
        if (bu1json[0][1] == 0 && bu2json[0][1] != 0) {
            if(bu2json[0][1] == 'xxxxxx' || !isNaN(bu2json[0][1])){
                return bu2json
            }else{
                return bu1json
            }
        } else if (bu1json[0][1] != 0 && bu2json[0][1] == 0) {
            if(bu1json[0][1] == 'xxxxxx' || !isNaN(bu1json[0][1])){
                return bu1json
            }else{
                return bu2json
            }
        }
        //who is latest update
        //change json to json string
        const bu1jsonstring = JSON.stringify(bu1json)
        const bu2jsonstring = JSON.stringify(bu2json)
        //change to lower case
        const bu1jsonstringlower = bu1jsonstring.toLowerCase()
        const bu2jsonstringlower = bu2jsonstring.toLowerCase()
        //count having xxxxxx
        const bu1jsonstringlowercount = (bu1jsonstringlower.match(/xxxxxx/g) || []).length
        const bu2jsonstringlowercount = (bu2jsonstringlower.match(/xxxxxx/g) || []).length
        //compare count
        if (bu1jsonstringlowercount > bu2jsonstringlowercount) {
            return bu2json
        } else {
            return bu1json
        }
    } /* else {*/
    var requestOptions = {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: raw,
        redirect: 'follow'
    };

    await fetch("https://www.glo.or.th/api/lottery/getLotteryAward", requestOptions)
        .then(response => response.json())
        .then(async (result) => {
            /*if (date.getTime() === today.getTime() || date > today) {
                if (request.query.from !== undefined) {
                    await fetch(url + '/index3?date=' + request.query.date + '&from')
                        .then(res => res.json())
                        .then((body) => {
                            //res.send(body)
                            test = body
                        })
                } else {
                    await fetch(url + '/index3?date=' + request.query.date)
                        .then(res => res.json())
                        .then((body) => {
                            //res.send(body)
                            test = body
                        })
                }
            } else {*/
                if (result["response"] != null) {
                    let data = [["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e481", 0], ["\u0e40\u0e25\u0e02\u0e2b\u0e19\u0e49\u0e323\u0e15\u0e31\u0e27", 0, 0], ["\u0e40\u0e25\u0e02\u0e17\u0e49\u0e32\u0e223\u0e15\u0e31\u0e27", 0, 0], ["\u0e40\u0e25\u0e02\u0e17\u0e49\u0e32\u0e222\u0e15\u0e31\u0e27", 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e02\u0e49\u0e32\u0e07\u0e40\u0e04\u0e35\u0e22\u0e07\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e481", 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e482", 0, 0, 0, 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e483", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e484", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e485", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]
                    data[0][1] = result["response"]["data"]["first"]["number"][0]["value"]
                    for (let [index, val] of result["response"]["data"]["last3f"]["number"].entries()) {
                        data[1][index + 1] = val["value"]
                    }
                    for (let [index, val] of result["response"]["data"]["last3b"]["number"].entries()) {
                        data[2][index + 1] = val["value"]
                    }
                    data[3][1] = result["response"]["data"]["last2"]["number"][0]["value"]
                    for (let [index, val] of result["response"]["data"]["near1"]["number"].entries()) {
                        data[4][index + 1] = val["value"]
                    }
                    for (let [index, val] of result["response"]["data"]["second"]["number"].entries()) {
                        data[5][index + 1] = val["value"]
                    }
                    for (let [index, val] of result["response"]["data"]["third"]["number"].entries()) {
                        data[6][index + 1] = val["value"]
                    }
                    for (let [index, val] of result["response"]["data"]["fourth"]["number"].entries()) {
                        data[7][index + 1] = val["value"]
                    }
                    for (let [index, val] of result["response"]["data"]["fifth"]["number"].entries()) {
                        data[8][index + 1] = val["value"]
                    }
                    if (request.query.from !== undefined) {
                        monthtext = numbertomonth(request.query.date.substr(2, 2))

                        data[0][0] = request.query.date.substring(0, 2) + monthtext + request.query.date.substring(4, 8)
                    }
                    //res.send(data)
                    test = data
                } else {
                    var date = new Date(parseInt(request.query.date.substr(4, 4)) - 543, parseInt(request.query.date.substr(2, 2)) - 1, parseInt(request.query.date.substr(0, 2)) + 1);
                    var thatdate = new Date(2010, 2 - 1, 16 + 1);
                    console.log(date)
                    console.log(thatdate)
                    if (date.getTime() === thatdate.getTime() || date < thatdate) {
                        if (request.query.from !== undefined) {
                            await fetch(url + '/index2?date=' + request.query.date + '&from')
                                .then(res => res.json())
                                .then((body) => {
                                    //res.send(body)
                                    test = body
                                })
                        } else {
                            await fetch(url + '/index2?date=' + request.query.date)
                                .then(res => res.json())
                                .then((body) => {
                                    //res.send(body)
                                    test = body
                                })
                        }
                    } else {
                        let data = [["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e481", 0], ["\u0e40\u0e25\u0e02\u0e2b\u0e19\u0e49\u0e323\u0e15\u0e31\u0e27", 0, 0], ["\u0e40\u0e25\u0e02\u0e17\u0e49\u0e32\u0e223\u0e15\u0e31\u0e27", 0, 0], ["\u0e40\u0e25\u0e02\u0e17\u0e49\u0e32\u0e222\u0e15\u0e31\u0e27", 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e02\u0e49\u0e32\u0e07\u0e40\u0e04\u0e35\u0e22\u0e07\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e481", 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e482", 0, 0, 0, 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e483", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e484", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e485", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]
                        //res.send(data)
                        test = data
                    }
                }
            //}
        })
        .catch(async (error) => {
            if (request.query.from !== undefined) {
                await fetch(url + '/index2?date=' + request.query.date + '&from')
                    .then(res => res.json())
                    .then((body) => {
                        //res.send(body)
                        test = body
                    })
            } else {
                await fetch(url + '/index2?date=' + request.query.date)
                    .then(res => res.json())
                    .then((body) => {
                        //res.send(body)
                        test = body
                    })
            }
        });
    //}

    //return { hello: 'world' }
    return test
})

fastify.get('/index2', async (request, reply) => {
    if(request.hostname == 'lotapi3.pwisetthon.com'){
        console.log(request.hostname);
        if(mainapistatus == true){
            //get raw url and change from lotapi3.pwisetthon.com to lotapi.pwisetthon.com
            const rawurl = request.raw.url;
            const mainapi = await fetch('https://lotapi.pwisetthon.com' + rawurl);
            const mainapibody = await mainapi.json();
            return mainapibody;
        }
    }
    let url;
    try {
        const checkurl = await fetch('http://localhost:' + port + '/index3')
        if (checkurl.status === 200) {
            url = 'http://localhost:' + port
        } else {
            url = 'https://' + request.headers.host
        }
    } catch (error) {
        url = 'https://' + request.headers.host
    }

    var test = []

    if (!request.query.date) {
        request.query.date = padLeadingZeros(new Date().getDate(), 2) + '' + padLeadingZeros((new Date().getMonth() + 1), 2) + '' + (new Date().getFullYear() + 543)
    }
    if ((request.query.date.substring(4, 8) == new Date().getFullYear() + 543) && (request.query.focus == undefined || request.query.focus == false || request.query.focus == 'false')) {
        if (request.query.from !== undefined) {
            await fetch(url + '/index3?date=' + request.query.date + '&from')
                .then(res => res.json())
                .then((body) => {
                    //res.send(body)
                    test = body
                })
        } else {
            await fetch(url + '/index3?date=' + request.query.date)
                .then(res => res.json())
                .then((body) => {
                    //res.send(body)
                    test = body
                })
        }
    } else {
        if(request.query.focus == true || request.query.focus == 'true'){
            console.log('direct to index2');
        }
        let data = ""
        let monthtext
        monthtext = numbertomonth(request.query.date.substring(2, 4))
        try {
            if (request.query.fresh !== undefined) {
                fs.unlinkSync(dir + request.query.date + '.txt');
            }
        } catch (err) {

        }
        var fileContents = null;
        try {
            fileContents = fs.readFileSync(dir + request.query.date + '.txt');
            data = JSON.parse(fileContents)
        } catch (err) {
            fileContents = false
        }

        if (fileContents) {
            data = JSON.parse(fileContents)
            if (request.query.from !== undefined) {
                data[0][0] = request.query.date.substring(0, 2) + monthtext + request.query.date.substring(4, 8)
            }
            //res.send(data);
            test = data
        } else {
            console.log('fetching data');
            await fetch('https://www.myhora.com/%E0%B8%AB%E0%B8%A7%E0%B8%A2/%E0%B8%87%E0%B8%A7%E0%B8%94-' + request.query.date.substring(0, 2) + '-' + encodeURI(monthtext) + '-' + request.query.date.substring(4, 8) + '.aspx', { redirect: 'error' })
                .then(res => res.text())
                .then((body) => {
                    let data = [["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e481", 0], ["\u0e40\u0e25\u0e02\u0e2b\u0e19\u0e49\u0e323\u0e15\u0e31\u0e27", 0, 0], ["\u0e40\u0e25\u0e02\u0e17\u0e49\u0e32\u0e223\u0e15\u0e31\u0e27", 0, 0], ["\u0e40\u0e25\u0e02\u0e17\u0e49\u0e32\u0e222\u0e15\u0e31\u0e27", 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e02\u0e49\u0e32\u0e07\u0e40\u0e04\u0e35\u0e22\u0e07\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e481", 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e482", 0, 0, 0, 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e483", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e484", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e485", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]
                    let $ = cheerio.load(body)

                    let numberpush = []

                    $('.lot-dc').toArray().forEach(element => {
                        try {
                            //console.log(element.firstChild.data)
                            numberpush.push(element.firstChild.data)
                        } catch (error) {

                        }
                    });

                    console.log('1')

                    if ($('div').toArray()[2] == null) {
                        //res.send(data)
                        test = data
                        return
                    }

                    console.log('2')

                    let threefirst = []
                    let threeend = []

                    data[0][1] = numberpush[0]
                    numberpush.shift()
                    if (numberpush[0].split(" ").length > 2) {
                        threeend = numberpush[0].split(" ")
                        data[2][1] = threeend[0].replace(/\xc2\xa0/, '').trim();
                        data[2][2] = threeend[1].replace(/\xc2\xa0/, '').trim();
                        data[2][3] = threeend[2].replace(/\xc2\xa0/, '').trim();
                        data[2][4] = threeend[3].replace(/\xc2\xa0/, '').trim();
                    } else {
                        threefirst = numberpush[0].split(" ")
                        data[1][1] = threefirst[0].replace(/\xc2\xa0/, '');
                        data[1][2] = threefirst[1].replace(/\xc2\xa0/, '');
                    }
                    numberpush.shift()
                    if (numberpush[0].length == 2) {
                        data[3][1] = numberpush[0]
                        numberpush.shift()
                    } else {
                        threeend = numberpush[0].split(" ")
                        data[2][1] = threeend[0].replace(/\xc2\xa0/, '');
                        data[2][2] = threeend[1].replace(/\xc2\xa0/, '');
                        numberpush.shift()
                        data[3][1] = numberpush[0]
                        numberpush.shift()
                    }
                    data[4][1] = padLeadingZeros((data[0][1] - 1), 6);
                    data[4][2] = padLeadingZeros((parseInt(data[0][1]) + 1), 6);

                    let wave = 5;
                    let minwave = 0;
                    let maxwave = 5;

                    for (const type of numberpush) {
                        if (wave >= 5) {
                            if (minwave < maxwave) {
                                minwave++;
                                data[wave][minwave] = type
                            }
                        }
                        if (minwave == maxwave && wave == 5) {
                            minwave = 0;
                            maxwave = 10;
                            wave = 6;
                        }
                        if (minwave == maxwave && wave == 6) {
                            minwave = 0;
                            maxwave = 50;
                            wave = 7;
                        }
                        if (minwave == maxwave && wave == 7) {
                            minwave = 0;
                            maxwave = 100;
                            wave = 8;
                        }
                    }

                    if (request.query.from !== undefined) {
                        data[0][0] = request.query.date.substring(0, 2) + monthtext + request.query.date.substring(4, 8)
                    }

                    test = data

                    if ($('div').toArray()[2].firstChild.data != null && $('div').toArray()[2].firstChild.data != ' เวลา 14:30-16:00น.') {
                        fs.writeFile(dir + request.query.date + '.txt', JSON.stringify(data), function (err) {
                            if (err) throw err;
                            //console.log('Saved!');
                            //if (request.query.from !== undefined) {
                            //    data[0][0] = request.query.date.substring(0, 2) + monthtext + request.query.date.substring(4, 8)
                            //}
                            //res.send(data)
                            //test = data
                        });
                    } else {
                        //if (request.query.from !== undefined) {
                        //    data[0][0] = request.query.date.substring(0, 2) + monthtext + request.query.date.substring(4, 8)
                        //}
                        //res.send(data)
                        //test = data
                    }

                    //get content from meta name="Keywords"
                    const keywords = $('meta[name="Keywords"]').attr('content');
                    //split keywords by comma
                    const keywordsArray = keywords.split(',');
                    //split keywordsArray[0] by space
                    const keywordsArray0 = keywordsArray[0].split(' ');
                    //remove / from keywordsArray0[1]
                    const keywordsArray0_1 = keywordsArray0[1].replace(/\//g, '');
                    console.log(keywordsArray0_1)
                    console.log(request.query.date)
                    if (keywordsArray0_1 != request.query.date) {
                        test = [["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e481", 0], ["\u0e40\u0e25\u0e02\u0e2b\u0e19\u0e49\u0e323\u0e15\u0e31\u0e27", 0, 0], ["\u0e40\u0e25\u0e02\u0e17\u0e49\u0e32\u0e223\u0e15\u0e31\u0e27", 0, 0], ["\u0e40\u0e25\u0e02\u0e17\u0e49\u0e32\u0e222\u0e15\u0e31\u0e27", 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e02\u0e49\u0e32\u0e07\u0e40\u0e04\u0e35\u0e22\u0e07\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e481", 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e482", 0, 0, 0, 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e483", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e484", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e485", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]
                        //remove file
                        fs.unlink(dir + request.query.date + '.txt', function (err) {
                            if (err) {
                                console.log(err)
                            } else {
                                console.log('File deleted!');
                            }
                        })
                    }
                }).catch(error => {
                    console.log(error)
                    let data = [["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e481", 0], ["\u0e40\u0e25\u0e02\u0e2b\u0e19\u0e49\u0e323\u0e15\u0e31\u0e27", 0, 0], ["\u0e40\u0e25\u0e02\u0e17\u0e49\u0e32\u0e223\u0e15\u0e31\u0e27", 0, 0], ["\u0e40\u0e25\u0e02\u0e17\u0e49\u0e32\u0e222\u0e15\u0e31\u0e27", 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e02\u0e49\u0e32\u0e07\u0e40\u0e04\u0e35\u0e22\u0e07\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e481", 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e482", 0, 0, 0, 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e483", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e484", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e485", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]
                    //res.send(data)
                    test = data
                });
        }
    }

    return test;
})

fastify.get('/index3', async (request, reply) => {
    if(request.hostname == 'lotapi3.pwisetthon.com'){
        console.log(request.hostname);
        if(mainapistatus == true){
            //get raw url and change from lotapi3.pwisetthon.com to lotapi.pwisetthon.com
            const rawurl = request.raw.url;
            const mainapi = await fetch('https://lotapi.pwisetthon.com' + rawurl);
            const mainapibody = await mainapi.json();
            return mainapibody;
        }
    }
    let test = [];

    if (!request.query.date) {
        request.query.date = padLeadingZeros(new Date().getDate(), 2) + '' + padLeadingZeros((new Date().getMonth() + 1), 2) + '' + (new Date().getFullYear() + 543)
    }
    try {
        if (request.query.fresh !== undefined) {
            fs.unlinkSync(dir + request.query.date + '.txt');
        }
    } catch (err) {

    }
    let monthtext
    var fileContents = null;
    try {
        fileContents = fs.readFileSync(dir + request.query.date + '.txt');
    } catch (err) {

    }
    if (fileContents) {
        let data = JSON.parse(fileContents)
        if (request.query.from !== undefined) {
            monthtext = numbertomonth(request.query.date.substr(2, 2))

            data[0][0] = request.query.date.substring(0, 2) + monthtext + request.query.date.substring(4, 8)
        }
        //res.send(data);
        test = data
    } else {
        await fetch('https://news.sanook.com/lotto/check/' + request.query.date + '/', { redirect: 'error' })
            .then(res => res.text())
            .then((body) => {
                let data = [["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e481", 0], ["\u0e40\u0e25\u0e02\u0e2b\u0e19\u0e49\u0e323\u0e15\u0e31\u0e27", 0, 0], ["\u0e40\u0e25\u0e02\u0e17\u0e49\u0e32\u0e223\u0e15\u0e31\u0e27", 0, 0], ["\u0e40\u0e25\u0e02\u0e17\u0e49\u0e32\u0e222\u0e15\u0e31\u0e27", 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e02\u0e49\u0e32\u0e07\u0e40\u0e04\u0e35\u0e22\u0e07\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e481", 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e482", 0, 0, 0, 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e483", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e484", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e485", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]
                let $ = cheerio.load(body)

                let wow = 0
                if ($('strong').toArray()[0].firstChild.data == 'เว็บไซต์นี้ใช้คุกกี้') {
                    wow = 1;
                }

                let checktitle = $('h2').toArray()
                let thaiday

                //loop h2
                for (let i = 0; i < checktitle.length; i++) {
                    //if h2 class title
                    if ($(checktitle[i]).attr('class').includes('title') && $(checktitle[i]).attr('class').includes('content')) {
                        //console h2 text
                        thaiday = $(checktitle[i]).text()
                        //remove งวดวันที่
                        thaiday = thaiday.replace('งวดวันที่', '').trim()
                        let thaidaysplit = thaiday.split(' ')
                        let monthnum = ''
                        monthnum = monthtonumber(thaidaysplit[1])
                        thaiday=thaidaysplit[0].padStart(2,"0")+''+monthnum+''+thaidaysplit[2]
                        console.log(thaiday)
                        //console.log($(h2[i]).text());
                    }
                }

                //if request.query.date and thaiday not same thing make catch
                if (request.query.date != thaiday) {
                    return {
                        status: 'error',
                        message: 'วันที่ไม่ตรงกัน'
                    }
                }

                data[0][1] = $('strong').toArray()[0 + wow].firstChild.data
                data[1][1] = $('strong').toArray()[1 + wow].firstChild.data
                data[1][2] = $('strong').toArray()[2 + wow].firstChild.data
                data[2][1] = $('strong').toArray()[3 + wow].firstChild.data
                data[2][2] = $('strong').toArray()[4 + wow].firstChild.data
                data[3][1] = $('strong').toArray()[5 + wow].firstChild.data
                data[4][1] = $('strong').toArray()[6 + wow].firstChild.data
                data[4][2] = $('strong').toArray()[7 + wow].firstChild.data
                
                //get h2 class content__title--sub
                let h2 = $('h2').toArray()[0].firstChild.data

                let k = 5
                let i = 1
                for (const type of $('span').toArray()) {
                    var arrit = type.attribs.class + ''
                    if (!arrit.search('lotto__number')) {
                        if (k == 5 && i <= 5) {
                            data[k][i] = type.firstChild.data
                            i++
                        } else if (k == 5 && i > 5) {
                            k++
                            i = 1
                        }
                        if (k == 6 && i <= 10) {
                            data[k][i] = type.firstChild.data
                            i++
                        } else if (k == 6 && i > 10) {
                            k++
                            i = 1
                        }
                        if (k == 7 && i <= 50) {
                            data[k][i] = type.firstChild.data
                            i++
                        } else if (k == 7 && i > 50) {
                            k++
                            i = 1
                        }
                        if (k == 8 && i <= 100) {
                            data[k][i] = type.firstChild.data
                            i++
                        }
                    }
                }

                try {
                    if ($('div').toArray()[2].firstChild.data.match('~[0-9]+~')) {
                        fs.writeFile(dir + request.query.date + '.txt', JSON.stringify(data), function (err) {
                            if (err) throw err;
                            //console.log('Saved!');
                            if (request.query.from !== undefined) {
                                monthtext = numbertomonth(request.query.date.substr(2, 2))

                                data[0][0] = request.query.date.substring(0, 2) + monthtext + request.query.date.substring(4, 8)
                            }
                            //res.send(data)
                            test = data
                        });
                    } else {
                        if (request.query.from !== undefined) {
                            monthtext = numbertomonth(request.query.date.substr(2, 2))

                            data[0][0] = request.query.date.substring(0, 2) + monthtext + request.query.date.substring(4, 8)
                        }
                        //res.send(data)
                        test = data
                    }
                } catch (error) {
                    if (request.query.from !== undefined) {
                        monthtext = numbertomonth(request.query.date.substr(2, 2))

                        data[0][0] = request.query.date.substring(0, 2) + monthtext + request.query.date.substring(4, 8)
                    }
                    //res.send(data)
                    test = data
                }

                //get content from meta property og:title
                const title = $('meta[property="og:title"]').attr('content');
                //split title by space
                const titlearr = title.split(' ')
                let datefromweb = titlearr[1]+monthtonumber(titlearr[2])+titlearr[3]
                // if datefromweb is not 8 length add 0 to front
                if(datefromweb.length != 8){
                    datefromweb = datefromweb.padStart(8,"0")
                }
                if(request.query.date != datefromweb){
                    test = [["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e481", 0], ["\u0e40\u0e25\u0e02\u0e2b\u0e19\u0e49\u0e323\u0e15\u0e31\u0e27", 0, 0], ["\u0e40\u0e25\u0e02\u0e17\u0e49\u0e32\u0e223\u0e15\u0e31\u0e27", 0, 0], ["\u0e40\u0e25\u0e02\u0e17\u0e49\u0e32\u0e222\u0e15\u0e31\u0e27", 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e02\u0e49\u0e32\u0e07\u0e40\u0e04\u0e35\u0e22\u0e07\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e481", 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e482", 0, 0, 0, 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e483", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e484", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e485", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]
                    fs.unlink(dir + request.query.date + '.txt', (err) => {
                        if (err) {
                            console.log(err)
                        }else{
                            console.log('delete file')
                        }
                    })
                }
            })
            .catch((err) => {
                let data = [["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e481", 0], ["\u0e40\u0e25\u0e02\u0e2b\u0e19\u0e49\u0e323\u0e15\u0e31\u0e27", 0, 0], ["\u0e40\u0e25\u0e02\u0e17\u0e49\u0e32\u0e223\u0e15\u0e31\u0e27", 0, 0], ["\u0e40\u0e25\u0e02\u0e17\u0e49\u0e32\u0e222\u0e15\u0e31\u0e27", 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e02\u0e49\u0e32\u0e07\u0e40\u0e04\u0e35\u0e22\u0e07\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e481", 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e482", 0, 0, 0, 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e483", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e484", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e485", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]
                //res.send(data)
                test = data
                console.log(err)
            });
    }

    return test;
})

fastify.get('/reto', async (request, reply) => {
    if(request.hostname == 'lotapi3.pwisetthon.com'){
        console.log(request.hostname);
        if(mainapistatus == true){
            //get raw url and change from lotapi3.pwisetthon.com to lotapi.pwisetthon.com
            const rawurl = request.raw.url;
            const mainapi = await fetch('https://lotapi.pwisetthon.com' + rawurl);
            const mainapibody = await mainapi.text();
            return mainapibody;
        }
    }
    let url;
    try {
        const checkurl = await fetch('http://localhost:' + port + '/index3')
        if (checkurl.status === 200) {
            url = 'http://localhost:' + port
        } else {
            url = 'https://' + request.headers.host
        }
    } catch (error) {
        url = 'https://' + request.headers.host
    }


    let test
    await fetch(url + '/?date=' + padLeadingZeros(new Date().getDate(), 2) + '' + padLeadingZeros((new Date().getMonth() + 1), 2) + '' + (new Date().getFullYear() + 543))
        .then(res => res.json())
        .then((body) => {
            if (body[0][1] === "XXXXXX" || body[0][1] === "xxxxxx") {
                //res.send('yes')
                test = 'yes'
            } else {
                //res.send('no')
                test = 'no'
            }
        })

    return test
})

fastify.get('/god', async (request, reply) => {
    if(request.hostname == 'lotapi3.pwisetthon.com'){
        console.log(request.hostname);
        if(mainapistatus == true){
            //get raw url and change from lotapi3.pwisetthon.com to lotapi.pwisetthon.com
            const rawurl = request.raw.url;
            const mainapi = await fetch('https://lotapi.pwisetthon.com' + rawurl);
            const mainapibody = await mainapi.json();
            return mainapibody;
        }
    }
    //let test = []

    let year = 2533;
    let preyearlist = [];
    let preyearsuperlist = [];
    let yearlist = [];
    let nextyear = new Date().getFullYear() + 543;
    let channel = [];
    //let jdata
    let countloveme = 0
    var fileContents = null;
    try {
        fileContents = fs.readFileSync(dir + 'cache.txt');
    } catch (err) { }
    try {
        if (fileContents) {
            yearlist = JSON.parse(fileContents);
            if (yearlist[yearlist.length - 1].substring(4, 8) == new Date().getFullYear() + 543) {
                year = new Date().getFullYear() + 543;
            } else {
                //year = yearlist[yearlist.length - 1].substring(4, 8)
                year = new Date().getFullYear() + 543 - 1;
            }
            yearlist.forEach(function (value, i) {
                if (
                    value.substring(4, 8) ==
                    year
                ) {
                    countloveme--;
                }
            });
            yearlist.splice(countloveme);
        }
    } catch (err) {
        fileContents = false
    }

    let day
    while (year <= nextyear) {
        channel = []
        for (let i = 0; i < 10; i++) {
            preyearsuperlist = [];
            preyearlist = [];
            let peryear = [];
            let ayear = year + i
            if (ayear > nextyear) {
                break
            }
            await fetch('https://www.myhora.com/%E0%B8%AB%E0%B8%A7%E0%B8%A2/%E0%B8%9B%E0%B8%B5-' + ayear + '.aspx')
                .then(res => res.text())
                .then((body) => {
                    var $ = cheerio.load(body);
                    for (const val of $('font').toArray()) {
                        if (val.firstChild.data.indexOf('ตรวจสลากกินแบ่งรัฐบาล') > -1) {
                            day = val.firstChild.data.split(" ").splice(2)
                            let monthnum
                            switch (day[2]) {
                                case 'มกราคม': monthnum = "01"; break;
                                case 'กุมภาพันธ์': monthnum = "02"; break;
                                case 'มีนาคม': monthnum = "03"; break;
                                case 'เมษายน': monthnum = "04"; break;
                                case 'พฤษภาคม': monthnum = "05"; break;
                                case 'มิถุนายน': monthnum = "06"; break;
                                case 'กรกฎาคม': monthnum = "07"; break;
                                case 'สิงหาคม': monthnum = "08"; break;
                                case 'กันยายน': monthnum = "09"; break;
                                case 'ตุลาคม': monthnum = "10"; break;
                                case 'พฤศจิกายน': monthnum = "11"; break;
                                case 'ธันวาคม': monthnum = "12"; break;
                            }
                            peryear.unshift(padLeadingZeros(day[0], 2) + monthnum + day[3])
                            preyearsuperlist.unshift(padLeadingZeros(day[0], 2) + monthnum + day[3])
                        }
                    }
                    for (const val of peryear) {
                        yearlist.push(val)
                    }
                    for (const val of preyearsuperlist) {
                        preyearlist.push(val)
                        try {
                            if (day[3] == new Date().getFullYear() + 543) {
                                fs.unlinkSync(dir + request.query.date + '.txt');
                                console.log('yes this year')
                            }
                        } catch (err) {

                        }
                        fs.writeFile(dir + day[3] + '.txt', JSON.stringify(preyearlist), function (err) {
                            if (err) throw err;
                        });
                    }
                })
        }
        year += 10
    }
    fs.writeFile(dir + 'cache.txt', JSON.stringify(yearlist), async function (err) {
        if (err) throw err;
    });

    if (request.query.format == "thtext") {
        yearlist.forEach(element => {
            let monthtext
            switch (element.slice(2, 4)) {
                case '01': monthtext = "มกราคม"; break;
                case '02': monthtext = "กุมภาพันธ์"; break;
                case '03': monthtext = "มีนาคม"; break;
                case '04': monthtext = "เมษายน"; break;
                case '05': monthtext = "พฤษภาคม"; break;
                case '06': monthtext = "มิถุนายน"; break;
                case '07': monthtext = "กรกฎาคม"; break;
                case '08': monthtext = "สิงหาคม"; break;
                case '09': monthtext = "กันยายน"; break;
                case '10': monthtext = "ตุลาคม"; break;
                case '11': monthtext = "พฤศจิกายน"; break;
                case '12': monthtext = "ธันวาคม"; break;
            }
            //element = element.slice(0, 2) + " " + monthtext + " " + element.slice(4, 8)
            //yearlist.indexOf(element)
            yearlist[yearlist.indexOf(element)] = element.slice(0, 2) + " " + monthtext + " " + element.slice(4, 8)
        });
        //res.send(yearlist)
        //test = yearlist
    } else if (request.query.format == "combothtext") {
        yearlist.forEach(element => {
            let monthtext
            //let array
            switch (element.slice(2, 4)) {
                case '01': monthtext = "มกราคม"; break;
                case '02': monthtext = "กุมภาพันธ์"; break;
                case '03': monthtext = "มีนาคม"; break;
                case '04': monthtext = "เมษายน"; break;
                case '05': monthtext = "พฤษภาคม"; break;
                case '06': monthtext = "มิถุนายน"; break;
                case '07': monthtext = "กรกฎาคม"; break;
                case '08': monthtext = "สิงหาคม"; break;
                case '09': monthtext = "กันยายน"; break;
                case '10': monthtext = "ตุลาคม"; break;
                case '11': monthtext = "พฤศจิกายน"; break;
                case '12': monthtext = "ธันวาคม"; break;
            }
            //element = element.slice(0, 2) + " " + monthtext + " " + element.slice(4, 8)
            //yearlist.indexOf(element)
            yearlist[yearlist.indexOf(element)] = [element, element.slice(0, 2) + " " + monthtext + " " + element.slice(4, 8)]
        });
        //res.send(yearlist)
        //test = yearlist
    } else {
        //res.send(yearlist)
        //test = yearlist
    }

    //console.log(yearlist)
    return yearlist
})

fastify.get('/gdpy', async (request, reply) => {
    if(request.hostname == 'lotapi3.pwisetthon.com'){
        console.log(request.hostname);
        if(mainapistatus == true){
            //get raw url and change from lotapi3.pwisetthon.com to lotapi.pwisetthon.com
            const rawurl = request.raw.url;
            const mainapi = await fetch('https://lotapi.pwisetthon.com' + rawurl);
            const mainapibody = await mainapi.json();
            return mainapibody;
        }
    }
    //let test

    let peryear = []
    let yearlist = []
    var fileContents = null;
    try {
        if (request.query.year == new Date().getFullYear() + 543) {
            fs.unlinkSync(dir + request.query.year + '.txt');
            console.log('yes this year')
        }
        fileContents = fs.readFileSync(dir + request.query.year + '.txt');
        console.log(JSON.parse(fileContents))
    } catch (err) {
        fileContents = null;
    }
    if (fileContents) {
        //res.send(JSON.parse(fileContents));
        //test = JSON.parse(fileContents)
        yearlist = JSON.parse(fileContents)
    } else {
        await fetch('https://www.myhora.com/%E0%B8%AB%E0%B8%A7%E0%B8%A2/%E0%B8%9B%E0%B8%B5-' + request.query.year + '.aspx')
            .then(res => res.text())
            .then((body) => {
                var $ = cheerio.load(body);
                for (const val of $('font').toArray()) {
                    if (val.firstChild.data.indexOf("ตรวจสลากกินแบ่งรัฐบาล") > -1) {
                        let day = val.firstChild.data.split(" ").splice(2)
                        let monthnum
                        switch (day[2]) {
                            case 'มกราคม': monthnum = "01"; break;
                            case 'กุมภาพันธ์': monthnum = "02"; break;
                            case 'มีนาคม': monthnum = "03"; break;
                            case 'เมษายน': monthnum = "04"; break;
                            case 'พฤษภาคม': monthnum = "05"; break;
                            case 'มิถุนายน': monthnum = "06"; break;
                            case 'กรกฎาคม': monthnum = "07"; break;
                            case 'สิงหาคม': monthnum = "08"; break;
                            case 'กันยายน': monthnum = "09"; break;
                            case 'ตุลาคม': monthnum = "10"; break;
                            case 'พฤศจิกายน': monthnum = "11"; break;
                            case 'ธันวาคม': monthnum = "12"; break;
                        }
                        peryear.unshift(padLeadingZeros(day[0], 2) + monthnum + day[3])
                    }
                }
                for (const val of peryear) {
                    yearlist.push(val)
                }
                fs.writeFile(dir + request.query.year + '.txt', JSON.stringify(yearlist), function (err) {
                    if (err) throw err;
                    //res.send(yearlist)
                    //test = yearlist
                });
            })
    }

    return yearlist
})

fastify.get('/checklottery', async (request, reply) => {
    if(request.hostname == 'lotapi3.pwisetthon.com'){
        console.log(request.hostname);
        if(mainapistatus == true){
            //get raw url and change from lotapi3.pwisetthon.com to lotapi.pwisetthon.com
            const rawurl = request.raw.url;
            const mainapi = await fetch('https://lotapi.pwisetthon.com' + rawurl);
            const mainapibody = await mainapi.text();
            return mainapibody;
        }
    }
    let url;
    try {
        const checkurl = await fetch('http://localhost:' + port + '/index3')
        if (checkurl.status === 200) {
            url = 'http://localhost:' + port
        } else {
            url = 'https://' + request.headers.host
        }
    } catch (error) {
        url = 'https://' + request.headers.host
    }

    let result = ""
    await fetch(url + '/?date=' + request.query.by)
        .then(res => res.json())
        .then((body) => {
            body.forEach(function (val, x) {
                val.forEach(function (superval, y) {
                    if (superval == request.query.search || superval == request.query.search.substr(0, 3) || superval == request.query.search.substr(3, 6) || superval == request.query.search.substr(4, 6) && y != 0) {
                        if (x == 0) {
                            result = result + "111111,";
                        }
                        if (x == 1) {
                            result = result + "333000,";
                        }
                        if (x == 2) {
                            result = result + "000333,";
                        }
                        if (x == 3) {
                            result = result + "000022,";
                        }
                        if (x == 4) {
                            result = result + "111112,";
                        }
                        if (x == 5) {
                            result = result + "222222,";
                        }
                        if (x == 6) {
                            result = result + "333333,";
                        }
                        if (x == 7) {
                            result = result + "444444,";
                        }
                        if (x == 8) {
                            result = result + "555555,";
                        }
                    }
                })
            })
            //res.send(result.substring(0, result.length - 1))
        })

    return result.substring(0, result.length - 1)
})

fastify.get('/lastlot', async (request, reply) => {
    if(request.hostname == 'lotapi3.pwisetthon.com'){
        console.log(request.hostname);
        if(mainapistatus == true){
            //get raw url and change from lotapi3.pwisetthon.com to lotapi.pwisetthon.com
            const rawurl = request.raw.url;
            const mainapi = await fetch('https://lotapi.pwisetthon.com' + rawurl);
            const mainapibody = await mainapi.json();
            return mainapibody;
        }
    }
    let url;
    try {
        const checkurl = await fetch('http://localhost:' + port + '/index3')
        if (checkurl.status === 200) {
            url = 'http://localhost:' + port
        } else {
            url = 'https://' + request.headers.host
        }
    } catch (error) {
        url = 'https://' + request.headers.host
    }

    let lastdate
    let viewer
    await fetch(url + '/gdpy?year=' + (new Date().getFullYear() + 543))
        .then(res => res.json())
        .then((body) => {
            lastdate = body[body.length - 1]
        })
    // if lastdate is null or undefined then fetch last year
    if (lastdate == undefined || lastdate == null) {
        await fetch(url + '/gdpy?year=' + (new Date().getFullYear() + 543 - 1))
            .then(res => res.json())
            .then((body) => {
                lastdate = body[body.length - 1]
            })
    }
    await fetch(url + '/?date=' + lastdate)
        .then(res => res.json())
        .then((body) => {
            if (request.query.info !== undefined) {
                viewer = {
                    info: {
                        date: lastdate
                    },
                    win: body[0][1],
                    threefirst: body[1][1] + ',' + body[1][2],
                    threeend: body[2][1] + ',' + body[2][2],
                    twoend: body[3][1]
                }
            } else {
                viewer = {
                    win: body[0][1],
                    threefirst: body[1][1] + ',' + body[1][2],
                    threeend: body[2][1] + ',' + body[2][2],
                    twoend: body[3][1]
                }
            }
            //res.send(viewer)
        })

    return viewer
})

fastify.get('/getchit', async (request, reply) => {
    if(request.hostname == 'lotapi3.pwisetthon.com'){
        console.log(request.hostname);
        if(mainapistatus == true){
            //get raw url and change from lotapi3.pwisetthon.com to lotapi.pwisetthon.com
            const rawurl = request.raw.url;
            const mainapi = await fetch('https://lotapi.pwisetthon.com' + rawurl);
            const mainapibody = await mainapi.json();
            return mainapibody;
        }
    }
    let a = []
    await fetch('https://www.huayvips.com/luckynumber/')
        .then(res => res.text())
        .then((body) => {
            let $ = cheerio.load(body)
            for (const val of $('img').toArray()) {
                if (val.attribs.src.indexOf('TL') > -1) {
                    a.push(val.attribs.src)
                }
                if (val.attribs.src.indexOf('DN') > -1) {
                    a.push(val.attribs.src)
                }
                if (val.attribs.src.indexOf('BT') > -1) {
                    a.push(val.attribs.src)
                }
                if (a.length == 3) {
                    //res.send(a)
                    return
                }
            }
        })

    if (a.length == 3) {
        //res.send(a)
        return a
    }
})

fastify.get('/finddol', async (request, reply) => {
    if(request.hostname == 'lotapi3.pwisetthon.com'){
        console.log(request.hostname);
        if(mainapistatus == true){
            //get raw url and change from lotapi3.pwisetthon.com to lotapi.pwisetthon.com
            const rawurl = request.raw.url;
            const mainapi = await fetch('https://lotapi.pwisetthon.com' + rawurl);
            const mainapibody = await mainapi.json();
            return mainapibody;
        }
    }
    let url;
    try {
        const checkurl = await fetch('http://localhost:' + port + '/index3')
        if (checkurl.status === 200) {
            url = 'http://localhost:' + port
        } else {
            url = 'https://' + request.headers.host
        }
    } catch (error) {
        url = 'https://' + request.headers.host
    }

    let channels
    let allwin = []
    await fetch('https://raw.githubusercontent.com/boyphongsakorn/testrepo/main/tmp/' + request.query.search, { redirect: 'error' })
        .then(res => res.json())
        .then((body) => {
            //res.send(body)
            allwin = body
            var postData = JSON.stringify({
                "inputs": {
                    "number": request.query.search.toString()
                },
                "ref": "refs/heads/main"
            });
        })
        .catch(async (error) => {
            if (request.query.search.length > 3) {
                var postData = JSON.stringify({
                    "inputs": {
                        "number": request.query.search.toString()
                    },
                    "ref": "refs/heads/main"
                });
                const takeres = await fetch('https://api.github.com/repos/boyphongsakorn/testrepo/actions/workflows/blank.yml/dispatches', { body: postData, method: 'POST', headers: { 'Accept': 'application/vnd.github.v3+json', 'Authorization': 'token ' + process.env.gtoken, 'Content-Type': 'application/json', 'User-Agent': 'PostmanRuntime/7.28.4' }, redirect: 'follow', follow: 20 })
                const takedata = await takeres.text()
                console.log(takedata)

                /*var https = require('follow-redirects').https;

                var options = {
                    'method': 'POST',
                    'hostname': 'api.github.com',
                    'path': '/repos/boyphongsakorn/testrepo/actions/workflows/blank.yml/dispatches',
                    'headers': {
                        'Accept': 'application/vnd.github.v3+json',
                        'Authorization': 'token ' + process.env.gtoken,
                        'Content-Type': 'application/json',
                        'User-Agent': 'PostmanRuntime/7.28.4'
                    },
                    'maxRedirects': 20
                };

                var reqtwo = https.request(options, function (res) {
                    var chunks = [];

                    res.on("data", function (chunk) {
                        chunks.push(chunk);
                    });

                    res.on("end", function (chunk) {
                        var body = Buffer.concat(chunks);
                        console.log(body.toString());
                    });

                    res.on("error", function (error) {
                        console.error(error);
                    });
                });

                reqtwo.write(postData);

                reqtwo.end();*/

                await fetch(url + '/god')
                    .then(res => res.json())
                    .then((body) => {
                        channels = body.splice(408)
                        console.log(channels)
                    })
                for (const val of channels) {
                    console.log(val)
                    await fetch(url + '/?date=' + val + '&from')
                        .then(res => res.json())
                        .then((body) => {
                            for (let index = 0; index < body.length; index++) {
                                const element = body[index];
                                if (element.includes(request.query.search.toString())) {
                                    allwin.push(body[0][0])
                                    console.log(url + '/?date=' + val + '&from')
                                }
                            }

                        })
                }
                //res.send(allwin)
            } else {
                await fetch('https://astro.meemodel.com/%E0%B8%A7%E0%B8%B4%E0%B9%80%E0%B8%84%E0%B8%A3%E0%B8%B2%E0%B8%B0%E0%B8%AB%E0%B9%8C%E0%B9%80%E0%B8%A5%E0%B8%82%E0%B8%AB%E0%B8%A7%E0%B8%A2/' + request.query.search, { redirect: 'error' })
                    .then(res => res.text())
                    .then((body) => {
                        let $ = cheerio.load(body)
                        $('td').toArray().forEach(element => {
                            let sl = element.firstChild.data
                            if (sl != null && sl.split(" ").length == 3 && sl.split(" ")[2] >= 2550) {
                                allwin.unshift(sl)
                            }

                        });
                        //res.send(allwin)
                    });
            }
        })

    return allwin
})

fastify.get('/lotnews', async (request, reply) => {
    if(request.hostname == 'lotapi3.pwisetthon.com'){
        console.log(request.hostname);
        if(mainapistatus == true && request.query.count <= 5){
            //get raw url and change from lotapi3.pwisetthon.com to lotapi.pwisetthon.com
            const rawurl = request.raw.url;
            //const mainapi = await fetch('https://lotapi.pwisetthon.com' + rawurl);
            const mainapi = await fetch('https://lottsanook-cfworker.boy1556.workers.dev' + rawurl);
            const mainapibody = await mainapi.json();
            return mainapibody;
        } else if (mainapistatus == true && request.query.count > 5){
            const mainapi = await fetch('https://raw.githubusercontent.com/boyphongsakorn/testrepo/main/latestnews.json');
            const mainapibody = await mainapi.json();
            //get only by count
            const mainapibodycount = mainapibody.splice(0, request.query.count);
            return mainapibodycount;
            //return mainapibody;
        }
    }
    let arrayofnews = [0, 0, 0, 0]
    let count = request.query.count || 0
    let check = count % 4
    //get date 7 days ago
    let date = new Date()
    let fulldesc = request.query.fulldesc || 'false'
    date.setDate(date.getDate() - 7)
    /*if (check != 0) {
        if (check == 1) {
            //ceil number
            arrayofnews[0] = Math.floor(count / 4)
            arrayofnews[1] = Math.ceil(count / 4)
            //floor number
            arrayofnews[2] = Math.floor(count / 4)
            arrayofnews[3] = Math.floor(count / 4)
        } else if (check == 2) {
            //ceil number
            arrayofnews[0] = Math.floor(count / 4)
            arrayofnews[1] = Math.ceil(count / 4)
            //floor number
            arrayofnews[2] = Math.floor(count / 4)
            arrayofnews[3] = Math.floor(count / 4) + 1
        } else if (check == 3) {
            //ceil number
            arrayofnews[0] = Math.floor(count / 4)
            arrayofnews[1] = Math.ceil(count / 4) + 1
            //floor number
            arrayofnews[2] = Math.floor(count / 4)
            arrayofnews[3] = Math.floor(count / 4) + 1
        }
    } else {
        arrayofnews[0] = count / 4
        arrayofnews[1] = count / 4
        arrayofnews[2] = count / 4
        arrayofnews[3] = (count / 4) + 1
    }
    if (request.query.lastweek && request.query.lastweek == 'true') {*/
    if (count > 10) {
        arrayofnews[0] = 10
        arrayofnews[1] = 10
        arrayofnews[2] = 10
        arrayofnews[3] = 10
    } else {
        arrayofnews[0] = count
        arrayofnews[1] = count
        arrayofnews[2] = count
        arrayofnews[3] = count
        //if hostname = lotapi3.pwisetthon.com
        if (request.hostname == 'lotapi3.pwisetthon.com') {
            arrayofnews[0] = Math.ceil(count / 2)
            arrayofnews[1] = Math.ceil(count / 2)
            arrayofnews[2] = 0
            arrayofnews[3] = 0
        }
    }
    /*}*/

    let array = [];
    let response = await fetch('https://www.brighttv.co.th/tag/%e0%b9%80%e0%b8%a5%e0%b8%82%e0%b9%80%e0%b8%94%e0%b9%87%e0%b8%94/feed')
    let xml = await response.text()
    let $ = cheerio.load(xml)
    let news = $('item')
    //loop news 5 time and push to array
    console.log(arrayofnews)
    for (let i = 0; i < arrayofnews[0]; i++) {
        const title = news.eq(i).find('title').text()
        const link = news.eq(i).find('link')[0].next.data
        let description = news.eq(i).find('description').text()
        if (fulldesc == 'true') {
            const content = news.eq(i).find('content\\:encoded').text()
            description = content.replace(/]]>/g, '')
            //console.log(content_clean)
        } else {
            description = description.substring(0, 100) + '...'
        }
        //remove /r/n from description
        description = description.replace(/\r?\n|\r/g, '')
        const pubDate = news.eq(i).find('pubDate').text()
        const getimage = await fetch(link)
        const responimage = await getimage.text()
        //console.log(image)
        //write to html file
        //fs.writeFileSync('news.html', responimage)
        const $ = cheerio.load(responimage)
        /*$('picture > img').toArray().forEach(element => {
            try {
                if(element.attribs.class.includes('wp-post-image')){
                    console.log(element.attribs['data-src'])
                }
                //numberpush.push(element.firstChild.data)
            } catch (error) {

            }
        });*/
        //console.log($('picture > img').toArray()[0].attribs['data-src'])
        const image = $('picture > img').toArray()[0].attribs['data-src']
        //loop imageurl
        /*for (let index = 0; index < imageurl.length; index++) {
            console.log(imageurl)
        }*/
        /*const date = pubDate.slice(0, 10)
        const time = pubDate.slice(11, 19)
        const dateTime = date + ' ' + time*/
        const json = {
            title: title,
            //remove \n and \t in string
            link: link.replace(/\n|\t/g, ''),
            description: description,
            image: image,
            pubDate: pubDate,
        }
        //if new Date(pubDate) < date push to array
        if (request.query.lastweek) {
            if (new Date(pubDate) > date) {
                array.push(json)
            }
        } else {
            array.push(json)
        }
    }

    response = await fetch('https://www.khaosod.co.th/get_menu?slug=lottery&offset=0&limit=' + arrayofnews[1])
    xml = await response.json()
    news = xml._posts
    for (let i = 0; i < news.length; i++) {
        const title = news[i].post_title
        const link = 'https://www.khaosod.co.th/lottery/news_' + news[i].ID
        const description = news[i].post_content
        const pubDate = news[i].created_at
        //format pubDate from iso string to date string
        const event = new Date(pubDate)
        // image
        const image = news[i].image
        //create new description variable with remove html tag
        let description2 = description.replace(/<(?:.|\n)*?>/gm, '')
        if (fulldesc == 'false') {
            description2 = description2.substring(0, 100) + '...'
        }
        description2 = description2.replace(/\r?\n|\r/g, '')
        const json = {
            title: title,
            link: link.replace(/\n|\t/g, ''),
            description: description2,
            image: image,
            pubDate: event.toUTCString(),
        }
        //if new Date(pubDate) < date push to array
        if (request.query.lastweek) {
            if (event > date) {
                array.push(json)
            }
        } else {
            array.push(json)
        }
    }

    response = await fetch('https://www.brighttv.co.th/tag/%E0%B8%AB%E0%B8%A7%E0%B8%A2%E0%B9%81%E0%B8%A1%E0%B9%88%E0%B8%99%E0%B9%89%E0%B8%B3%E0%B8%AB%E0%B8%99%E0%B8%B6%E0%B9%88%E0%B8%87/feed')
    xml = await response.text()
    $ = cheerio.load(xml)
    news = $('item')
    //loop news 5 time and push to array
    for (let i = 0; i < arrayofnews[2]; i++) {
        const title = news.eq(i).find('title').text()
        const link = news.eq(i).find('link')[0].next.data
        let description = news.eq(i).find('description').text()
        if (fulldesc == 'true') {
            const content = news.eq(i).find('content\\:encoded').text()
            description = content.replace(/]]>/g, '')
            //console.log(content_clean)
        } else {
            description = description.substring(0, 100) + '...'
        }
        description = description.replace(/\r?\n|\r/g, '')
        const pubDate = news.eq(i).find('pubDate').text()
        const getimage = await fetch(link)
        const responimage = await getimage.text()
        const $ = cheerio.load(responimage)
        const image = $('picture > img').toArray()[0].attribs['data-src']
        const json = {
            title: title,
            //remove \n and \t in string
            link: link.replace(/\n|\t/g, ''),
            description: description,
            image: image,
            pubDate: pubDate,
        }
        //if new Date(pubDate) < date push to array
        if (request.query.lastweek) {
            if (new Date(pubDate) > date) {
                array.push(json)
            }
        } else {
            array.push(json)
        }
    }

    response = await fetch('https://www.bangkokbiznews.com/tags/%E0%B9%80%E0%B8%A5%E0%B8%82%E0%B9%80%E0%B8%94%E0%B9%87%E0%B8%94');
    $ = cheerio.load(await response.text());
    const a = $('a.card-wrapper');
    for (let i = 0; i < arrayofnews[3]; i++) {
        //if h3 class card-v-content-title text-excerpt-2
        if ($(a[i]).find('h3').attr('class') === 'card-v-content-title  text-excerpt-2' && !$(a[i]).find('h3').text().includes('ตรวจหวย')) {
            const title = $(a[i]).find('h3').text()
            const link = 'https://www.bangkokbiznews.com' + $(a[i]).attr('href')
            let description
            const image = $(a[i]).find('img').attr('src')
            const date = $(a[i]).find('span.date').text().split('|');
            let time = date[1].trim().split(':')[0].padStart(2, '0') + ':' + date[1].trim().split(':')[1].padStart(2, '0');
            let number = '';
            switch (date[0].split(' ')[1]) {
                case 'ม.ค.':
                    number = '01';
                    break;
                case 'ก.พ.':
                    number = '02';
                    break;
                case 'มี.ค.':
                    number = '03';
                    break;
                case 'เม.ย.':
                    number = '04';
                    break;
                case 'พ.ค.':
                    number = '05';
                    break;
                case 'มิ.ย.':
                    number = '06';
                    break;
                case 'ก.ค.':
                    number = '07';
                    break;
                case 'ส.ค.':
                    number = '08';
                    break;
                case 'ก.ย.':
                    number = '09';
                    break;
                case 'ต.ค.':
                    number = '10';
                    break;
                case 'พ.ย.':
                    number = '11';
                    break;
                case 'ธ.ค.':
                    number = '12';
                    break;
            }
            let vertdate = new Date(parseInt(date[0].split(' ')[2]) - 543 + '-' + number + '-' + date[0].split(' ')[0] + 'T' + time + ':00Z');
            const pubDate = vertdate.toUTCString()
            const content = await fetch(link);
            const $$ = cheerio.load(await content.text());
            const div = $$('div.content-detail');
            for (let j = 0; j < div.length; j++) {
                if ($(div[j]).attr('class') === 'content-detail') {
                    if (fulldesc == 'true') {
                        description = $(div[j]).text().replace(/\r?\n|\r/g, '')
                    } else {
                        //remove new line from description
                        description = $(div[j]).text().replace(/\r?\n|\r/g, '')
                        description = description.substring(0, 100) + '...'
                    }
                }
            }
            const json = {
                title: title,
                link: link,
                description: description,
                image: image,
                pubDate: pubDate,
            }
            //if new Date(pubDate) < date push to array
            if (request.query.lastweek) {
                if (new Date(pubDate) > date) {
                    array.push(json)
                }
            } else {
                array.push(json)
            }
        }
    }

    if (request.query.lastweek) {
        //get array.length > request.query.count
        if (array.length > count) {
            //slice array to request.query.count
            //array = array.slice(0, request.query.count)
            let wantremove = array.length - count
            array.splice(parseInt(count / 2), wantremove)
        }
    }

    //order by pubDate
    array.sort((a, b) => {
        return new Date(b.pubDate) - new Date(a.pubDate)
    })

    //get only count of array
    if (count) {
        array = array.slice(0, count)
    } else {
        array = array.slice(0, 10)
    }

    //res.send(array)

    return array
})

const start = async () => {
    try {
        await fastify.listen({ port: port, host: '0.0.0.0' })
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
start()