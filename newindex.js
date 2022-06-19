const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const fastify = require('fastify')({ logger: true })
const cheerio = require('cheerio')
var fs = require('fs')
//var cors = require('cors')

const port = process.env.PORT || 5000;

function padLeadingZeros(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

fastify.get('/', async (request, reply) => {
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

    if (date.getTime() === today.getTime() || date > today) {
        if (request.query.from !== undefined) {
            await fetch('http://localhost:' + port + '/index3?date=' + request.query.date + '&from')
                .then(res => res.json())
                .then((body) => {
                    //res.send(body)
                    test = body
                })
        } else {
            await fetch('http://localhost:' + port + '/index3?date=' + request.query.date)
                .then(res => res.json())
                .then((body) => {
                    //res.send(body)
                    test = body
                })
        }
    } else {
        var requestOptions = {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: raw,
            redirect: 'follow'
        };

        await fetch("https://www.glo.or.th/api/lottery/getLotteryAward", requestOptions)
            .then(response => response.json())
            .then(async (result) => {
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
                        switch (request.query.date.substr(2, 2)) {
                            case '01':
                                monthtext = "มกราคม";
                                break;
                            case '02':
                                monthtext = "กุมภาพันธ์";
                                break;
                            case '03':
                                monthtext = "มีนาคม";
                                break;
                            case '04':
                                monthtext = "เมษายน";
                                break;
                            case '05':
                                monthtext = "พฤษภาคม";
                                break;
                            case '06':
                                monthtext = "มิถุนายน";
                                break;
                            case '07':
                                monthtext = "กรกฎาคม";
                                break;
                            case '08':
                                monthtext = "สิงหาคม";
                                break;
                            case '09':
                                monthtext = "กันยายน";
                                break;
                            case '10':
                                monthtext = "ตุลาคม";
                                break;
                            case '11':
                                monthtext = "พฤศจิกายน";
                                break;
                            case '12':
                                monthtext = "ธันวาคม";
                                break;
                        }

                        data[0][0] = request.query.date.substring(0, 2) + monthtext + request.query.date.substring(4, 8)
                    }
                    //res.send(data)
                    test = data
                } else {
                    var date = new Date(parseInt(request.query.date.substr(4, 4)) - 543, parseInt(request.query.date.substr(2, 2)) - 1, parseInt(request.query.date.substr(0, 2)) + 1);
                    var thatdate = new Date(2010, 02 - 1, 16 + 1);
                    console.log(date)
                    console.log(thatdate)
                    if (date.getTime() === thatdate.getTime() || date < thatdate) {
                        if (request.query.from !== undefined) {
                            await fetch('http://localhost:' + port + '/index2?date=' + request.query.date + '&from')
                                .then(res => res.json())
                                .then((body) => {
                                    //res.send(body)
                                    test = body
                                })
                        } else {
                            await fetch('http://localhost:' + port + '/index2?date=' + request.query.date)
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
            })
            .catch(async (error) => {
                if (request.query.from !== undefined) {
                    await fetch('http://localhost:' + port + '/index2?date=' + request.query.date + '&from')
                        .then(res => res.json())
                        .then((body) => {
                            //res.send(body)
                            test = body
                        })
                } else {
                    await fetch('http://localhost:' + port + '/index2?date=' + request.query.date)
                        .then(res => res.json())
                        .then((body) => {
                            //res.send(body)
                            test = body
                        })
                }
            });
    }

    //return { hello: 'world' }
    return test
})

fastify.get('/index2', async (request, reply) => {
    var test = []

    if (!request.query.date) {
        request.query.date = padLeadingZeros(new Date().getDate(), 2) + '' + padLeadingZeros((new Date().getMonth() + 1), 2) + '' + (new Date().getFullYear() + 543)
    }
    if (request.query.date.substring(4, 8) == new Date().getFullYear() + 543) {
        if (request.query.from !== undefined) {
            await fetch('http://localhost:' + port + '/index3?date=' + request.query.date + '&from')
                .then(res => res.json())
                .then((body) => {
                    //res.send(body)
                    test = body
                })
        } else {
            await fetch('http://localhost:' + port + '/index3?date=' + request.query.date)
                .then(res => res.json())
                .then((body) => {
                    //res.send(body)
                    test = body
                })
        }
    } else {
        let data = ""
        let monthtext
        switch (request.query.date.substring(2, 4)) {
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
        try {
            if (request.query.fresh !== undefined) {
                fs.unlinkSync('tmp/' + request.query.date + '.txt');
            }
        } catch (err) {

        }
        var fileContents = null;
        try {
            fileContents = fs.readFileSync('tmp/' + request.query.date + '.txt');
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

                    if ($('div').toArray()[2] == null) {
                        //res.send(data)
                        test = data
                        return
                    }

                    let threefirst = []
                    let threeend = []

                    data[0][1] = numberpush[0]
                    numberpush.shift()
                    if (numberpush[0].split(" ").length > 2) {
                        threeend = numberpush[0].split(" ")
                        data[2][1] = threeend[0].replace(/\xc2\xa0/, '');
                        data[2][2] = threeend[1].replace(/\xc2\xa0/, '');
                        data[2][3] = threeend[2].replace(/\xc2\xa0/, '');
                        data[2][4] = threeend[3].replace(/\xc2\xa0/, '');
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
                    data[4][2] = padLeadingZeros((data[0][1] + 1), 6);

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

                    if ($('div').toArray()[2].firstChild.data != null && $('div').toArray()[2].firstChild.data != ' เวลา 14:30-16:00น.') {
                        fs.writeFile('tmp/' + request.query.date + '.txt', JSON.stringify(data), function (err) {
                            if (err) throw err;
                            //console.log('Saved!');
                            if (request.query.from !== undefined) {
                                data[0][0] = request.query.date.substring(0, 2) + monthtext + request.query.date.substring(4, 8)
                            }
                            //res.send(data)
                            test = data
                        });
                    } else {
                        if (request.query.from !== undefined) {
                            data[0][0] = request.query.date.substring(0, 2) + monthtext + request.query.date.substring(4, 8)
                        }
                        //res.send(data)
                        test = data
                    }
                }).catch(error => {
                    let data = [["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e481", 0], ["\u0e40\u0e25\u0e02\u0e2b\u0e19\u0e49\u0e323\u0e15\u0e31\u0e27", 0, 0], ["\u0e40\u0e25\u0e02\u0e17\u0e49\u0e32\u0e223\u0e15\u0e31\u0e27", 0, 0], ["\u0e40\u0e25\u0e02\u0e17\u0e49\u0e32\u0e222\u0e15\u0e31\u0e27", 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e02\u0e49\u0e32\u0e07\u0e40\u0e04\u0e35\u0e22\u0e07\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e481", 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e482", 0, 0, 0, 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e483", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e484", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e485", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]
                    //res.send(data)
                    test = data
                });
        }
    }

    return test;
})

fastify.get('/index3', async (request, reply) => {
    let test = [];

    if (!request.query.date) {
        request.query.date = padLeadingZeros(new Date().getDate(), 2) + '' + padLeadingZeros((new Date().getMonth() + 1), 2) + '' + (new Date().getFullYear() + 543)
    }
    try {
        if (request.query.fresh !== undefined) {
            fs.unlinkSync('tmp/' + request.query.date + '.txt');
        }
    } catch (err) {

    }
    let monthtext
    var fileContents = null;
    try {
        fileContents = fs.readFileSync('tmp/' + request.query.date + '.txt');
    } catch (err) {

    }
    if (fileContents) {
        let data = JSON.parse(fileContents)
        if (request.query.from !== undefined) {
            switch (request.query.date.substr(2, 2)) {
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

                data[0][1] = $('strong').toArray()[0 + wow].firstChild.data
                data[1][1] = $('strong').toArray()[1 + wow].firstChild.data
                data[1][2] = $('strong').toArray()[2 + wow].firstChild.data
                data[2][1] = $('strong').toArray()[3 + wow].firstChild.data
                data[2][2] = $('strong').toArray()[4 + wow].firstChild.data
                data[3][1] = $('strong').toArray()[5 + wow].firstChild.data
                data[4][1] = $('strong').toArray()[6 + wow].firstChild.data
                data[4][2] = $('strong').toArray()[7 + wow].firstChild.data

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
                        fs.writeFile('tmp/' + request.query.date + '.txt', JSON.stringify(data), function (err) {
                            if (err) throw err;
                            //console.log('Saved!');
                            if (request.query.from !== undefined) {
                                switch (request.query.date.substr(2, 2)) {
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

                                data[0][0] = request.query.date.substring(0, 2) + monthtext + request.query.date.substring(4, 8)
                            }
                            //res.send(data)
                            test = data
                        });
                    } else {
                        if (request.query.from !== undefined) {
                            switch (request.query.date.substr(2, 2)) {
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

                            data[0][0] = request.query.date.substring(0, 2) + monthtext + request.query.date.substring(4, 8)
                        }
                        //res.send(data)
                        test = data
                    }
                } catch (error) {
                    if (request.query.from !== undefined) {
                        switch (request.query.date.substr(2, 2)) {
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

                        data[0][0] = request.query.date.substring(0, 2) + monthtext + request.query.date.substring(4, 8)
                    }
                    //res.send(data)
                    test = data
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
    let test
    await fetch('http://localhost:' + port + '/?date=' + padLeadingZeros(new Date().getDate(), 2) + '' + padLeadingZeros((new Date().getMonth() + 1), 2) + '' + (new Date().getFullYear() + 543))
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
        fileContents = fs.readFileSync('tmp/cache.txt');
    } catch (err) { }
    try {
        if (fileContents) {
            yearlist = JSON.parse(fileContents);
            if (
                yearlist[yearlist.length - 1].substring(4, 8) ==
                new Date().getFullYear() + 543
            ) {
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
                                fs.unlinkSync('tmp/' + request.query.date + '.txt');
                                console.log('yes this year')
                            }
                        } catch (err) {

                        }
                        fs.writeFile('tmp/' + day[3] + '.txt', JSON.stringify(preyearlist), function (err) {
                            if (err) throw err;
                        });
                    }
                })
        }
        year += 10
    }
    fs.writeFile('tmp/cache.txt', JSON.stringify(yearlist), async function (err) {
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
    //let test

    let peryear = []
    let yearlist = []
    var fileContents = null;
    try {
        if (request.query.year == new Date().getFullYear() + 543) {
            fs.unlinkSync('tmp/' + request.query.year + '.txt');
            console.log('yes this year')
        }
        fileContents = fs.readFileSync('tmp/' + request.query.year + '.txt');
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
                fs.writeFile('tmp/' + request.query.year + '.txt', JSON.stringify(yearlist), function (err) {
                    if (err) throw err;
                    //res.send(yearlist)
                    //test = yearlist
                });
            })
    }

    return yearlist
})

fastify.get('/checklottery', async (request, reply) => {
    let result = ""
    await fetch('http://localhost:' + port + '/?date=' + request.query.by)
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
    let lastdate
    let viewer
    await fetch('http://localhost:' + port + '/gdpy?year=' + (new Date().getFullYear() + 543))
        .then(res => res.json())
        .then((body) => {
            lastdate = body[body.length - 1]
        })
    // if lastdate is null or undefined then fetch last year
    if (lastdate == undefined || lastdate == null) {
        await fetch('http://localhost:' + port + '/gdpy?year=' + (new Date().getFullYear() + 543 - 1))
            .then(res => res.json())
            .then((body) => {
                lastdate = body[body.length - 1]
            })
    }
    await fetch('http://localhost:' + port + '/?date=' + lastdate)
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
    let channels
    let allwin = []
    await fetch('https://raw.githubusercontent.com/boyphongsakorn/testrepo/main/tmp/' + request.query.search, { redirect: 'error' })
        .then(res => res.json())
        .then((body) => {
            //res.send(body)
            allwin = body
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

                await fetch('http://localhost:' + port + '/god')
                    .then(res => res.json())
                    .then((body) => {
                        channels = body.splice(408)
                        console.log(channels)
                    })
                for (const val of channels) {
                    console.log(val)
                    await fetch('http://localhost:' + port + '/?date=' + val + '&from')
                        .then(res => res.json())
                        .then((body) => {
                            for (let index = 0; index < body.length; index++) {
                                const element = body[index];
                                if (element.includes(request.query.search.toString())) {
                                    allwin.push(body[0][0])
                                    console.log('http://localhost:' + port + '/?date=' + val + '&from')
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
    let arrayofnews = [0, 0, 0]
    let check = request.query.count % 3
    //get date 7 days ago
    let date = new Date()
    date.setDate(date.getDate() - 7)
    if (check != 0) {
        if (check == 1) {
            //ceil number
            arrayofnews[0] = Math.floor(request.query.count / 3)
            arrayofnews[1] = Math.ceil(request.query.count / 3)
            //floor number
            arrayofnews[2] = Math.floor(request.query.count / 3)
        } else {
            //ceil number
            arrayofnews[0] = Math.floor(request.query.count / 3)
            arrayofnews[1] = Math.ceil(request.query.count / 3)
            //floor number
            arrayofnews[2] = Math.floor(request.query.count / 3) + 1
        }
    } else {
        arrayofnews[0] = request.query.count / 3
        arrayofnews[1] = request.query.count / 3
        arrayofnews[2] = request.query.count / 3
    }
    if(request.query.lastweek && request.query.lastweek == 'true'){
        arrayofnews[0] = 7
        arrayofnews[1] = 7
        arrayofnews[2] = 7
    }
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
        const description = news.eq(i).find('description').text()
        const pubDate = news.eq(i).find('pubDate').text()
        /*const date = pubDate.slice(0, 10)
        const time = pubDate.slice(11, 19)
        const dateTime = date + ' ' + time*/
        const json = {
            title: title,
            //remove \n and \t in string
            link: link.replace(/\n|\t/g, ''),
            description: description.substring(0, 100) + '...',
            pubDate: pubDate,
        }
        //if new Date(pubDate) < date push to array
        if (request.query.lastweek) {
            if (new Date(pubDate) > date) {
                array.push(json)
            }
        }else{
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
        const json = {
            title: title,
            link: link.replace(/\n|\t/g, ''),
            description: description2.substring(0, 100) + '...',
            image: image,
            pubDate: event.toUTCString(),
        }
        //if new Date(pubDate) < date push to array
        if (request.query.lastweek) {
            if (event > date) {
                array.push(json)
            }
        }else{
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
        const description = news.eq(i).find('description').text()
        const pubDate = news.eq(i).find('pubDate').text()
        const json = {
            title: title,
            //remove \n and \t in string
            link: link.replace(/\n|\t/g, ''),
            description: description.substring(0, 100) + '...',
            pubDate: pubDate,
        }
        //if new Date(pubDate) < date push to array
        if (request.query.lastweek) {
            if (new Date(pubDate) > date) {
                array.push(json)
            }
        }else{
            array.push(json)
        }
    }

    //order by pubDate
    array.sort((a, b) => {
        return new Date(b.pubDate) - new Date(a.pubDate)
    })

    //res.send(array)

    return array
})

const start = async () => {
    try {
        await fastify.listen(port, '0.0.0.0')
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
start()