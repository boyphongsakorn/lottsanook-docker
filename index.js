const fetch = require('node-fetch')
const cheerio = require('cheerio')
const express = require('express')
var fs = require('fs')

const app = express()
const port = process.env.PORT || 3000;

function padLeadingZeros(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

app.get('/', (req, res) => {
    if(!req.query.date){
        req.query.date=padLeadingZeros(new Date().getDate(), 2) + '' + padLeadingZeros((new Date().getMonth() + 1), 2) + '' + (new Date().getFullYear() + 543)
    }
    if (req.query.date.substring(4, 8) == new Date().getFullYear() + 543) {
        fetch('http://localhost:' + port + '/index2?date=' + req.query.date)
            .then(res => res.json())
            .then((body) => {
                res.send(body)
            })
    } else {
        let data = ""
        let monthtext
        switch (req.query.date.substring(2, 4)) {
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
            if (req.query.fresh !== undefined) {
                fs.unlinkSync('tmp/' + req.query.date + '.txt');
            }
        } catch (err) {

        }
        var fileContents = null;
        try {
            fileContents = fs.readFileSync('tmp/' + req.query.date + '.txt');
        } catch (err) {

        }
        if (fileContents) {
            data = JSON.parse(fileContents)
            if (req.query.from !== undefined) {
                data[0][0] = req.query.date.substring(0, 2) + monthtext + req.query.date.substring(4, 8)
            }
            res.send(data);
        } else {
            fetch('https://www.myhora.com/%E0%B8%AB%E0%B8%A7%E0%B8%A2/%E0%B8%87%E0%B8%A7%E0%B8%94-' + req.query.date.substring(0, 2) + '-' + encodeURI(monthtext) + '-' + req.query.date.substring(4, 8) + '.aspx')
                .then(res => res.text())
                .then((body) => {
                    data = [["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e481", 0], ["\u0e40\u0e25\u0e02\u0e2b\u0e19\u0e49\u0e323\u0e15\u0e31\u0e27", 0, 0], ["\u0e40\u0e25\u0e02\u0e17\u0e49\u0e32\u0e223\u0e15\u0e31\u0e27", 0, 0], ["\u0e40\u0e25\u0e02\u0e17\u0e49\u0e32\u0e222\u0e15\u0e31\u0e27", 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e02\u0e49\u0e32\u0e07\u0e40\u0e04\u0e35\u0e22\u0e07\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e481", 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e482", 0, 0, 0, 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e483", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e484", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e485", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]
                    let $ = cheerio.load(body)

                    if ($('b').toArray()[2] == null) {
                        res.send(data)
                        return
                    }

                    data[0][1] = $('b').toArray()[2].firstChild.data
                    let threefirst = []
                    let threeend = []
                    try {
                        threefirst = $('b').toArray()[3].firstChild.data.split(" ")
                        threeend = $('b').toArray()[4].firstChild.data.split(" ")
                    } catch (error) {
                        /*threefirst = $('b').toArray()[4].firstChild.data.split(" ")
                        threeend = $('b').toArray()[5].firstChild.data.split(" ")*/
                        threeend = $('b').toArray()[4].firstChild.data.split(" ")
                        data[2][1] = threeend[0].replace(/\xc2\xa0/, '');
                        data[2][2] = threeend[1].replace(/\xc2\xa0/, '');
                        data[2][3] = threeend[2].replace(/\xc2\xa0/, '');
                        data[2][4] = threeend[3].replace(/\xc2\xa0/, '');
                    }
                    /*let threefirst = $('b').toArray()[3].firstChild.data.split(" ")
                    let threeend = $('b').toArray()[4].firstChild.data.split(" ")*/

                    if (threefirst.length <= 1) {
                        data[1][1] = 0;
                        data[1][2] = 0;
                        /*data[2][3] = threeend[2].replace(/\xc2\xa0/, '');
                        data[2][4] = threeend[3].replace(/\xc2\xa0/, '');*/
                    } else {
                        data[1][1] = threefirst[0].replace(/\xc2\xa0/, '');
                        data[1][2] = threefirst[1].replace(/\xc2\xa0/, '');
                    }
                    data[2][1] = threeend[0].replace('/\xc2\xa0/', '');
                    data[2][2] = threeend[1].replace('/\xc2\xa0/', '');
                    data[3][1] = $('b').toArray()[5].firstChild.data;

                    data[4][1] = padLeadingZeros(data[0][1] - 1, 6);
                    data[4][2] = padLeadingZeros(data[0][1] + 1, 6);

                    let wave = 5;
                    let minwave = 0;
                    let maxwave = 5;

                    for (const type of $('div').toArray()) {
                        if (type.attribs.class == 'ltr_dc ltr-fx ltr_c20') {
                            if (minwave < maxwave) {
                                minwave++;
                                data[wave][minwave] = type.firstChild.data;
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
                        fs.writeFile('tmp/' + req.query.date + '.txt', JSON.stringify(data), function (err) {
                            if (err) throw err;
                            //console.log('Saved!');
                            if (req.query.from !== undefined) {
                                data[0][0] = req.query.date.substring(0, 2) + monthtext + req.query.date.substring(4, 8)
                            }
                            res.send(data)
                        });
                    } else {
                        if (req.query.from !== undefined) {
                            data[0][0] = req.query.date.substring(0, 2) + monthtext + req.query.date.substring(4, 8)
                        }
                        res.send(data)
                    }
                });
        }
    }
})

app.get('/index2', (req, res) => {
    try {
        if (req.query.fresh !== undefined) {
            fs.unlinkSync('tmp/' + req.query.date + '.txt');
        }
    } catch (err) {

    }
    let monthtext
    var fileContents = null;
    try {
        fileContents = fs.readFileSync('tmp/' + req.query.date + '.txt');
    } catch (err) {

    }
    if (fileContents) {
        data = JSON.parse(fileContents)
        if (req.query.from !== undefined) {
            switch (req.query.date.substr(2, 2)) {
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

            data[0][0] = req.query.date.substring(0, 2) + monthtext + req.query.date.substring(4, 8)
        }
        res.send(data);
    } else {
        fetch('https://news.sanook.com/lotto/check/' + req.query.date + '/', { redirect: 'error' })
            .then(res => res.text())
            .then((body) => {
                let data = [["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e481", 0], ["\u0e40\u0e25\u0e02\u0e2b\u0e19\u0e49\u0e323\u0e15\u0e31\u0e27", 0, 0], ["\u0e40\u0e25\u0e02\u0e17\u0e49\u0e32\u0e223\u0e15\u0e31\u0e27", 0, 0], ["\u0e40\u0e25\u0e02\u0e17\u0e49\u0e32\u0e222\u0e15\u0e31\u0e27", 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e02\u0e49\u0e32\u0e07\u0e40\u0e04\u0e35\u0e22\u0e07\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e481", 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e482", 0, 0, 0, 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e483", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e484", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e485", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]
                let $ = cheerio.load(body)

                data[0][1] = $('strong').toArray()[0].firstChild.data
                data[1][1] = $('strong').toArray()[1].firstChild.data
                data[1][2] = $('strong').toArray()[2].firstChild.data
                data[2][1] = $('strong').toArray()[3].firstChild.data
                data[2][2] = $('strong').toArray()[4].firstChild.data
                data[3][1] = $('strong').toArray()[5].firstChild.data
                data[4][1] = $('strong').toArray()[6].firstChild.data
                data[4][2] = $('strong').toArray()[7].firstChild.data

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
                if ($('div').toArray()[2].firstChild.data.match('~[0-9]+~')) {
                    fs.writeFile('tmp/' + req.query.date + '.txt', JSON.stringify(data), function (err) {
                        if (err) throw err;
                        //console.log('Saved!');
                        if (req.query.from !== undefined) {
                            switch (req.query.date.substr(2, 2)) {
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

                            data[0][0] = req.query.date.substring(0, 2) + monthtext + req.query.date.substring(4, 8)
                        }
                        res.send(data)
                    });
                } else {
                    if (req.query.from !== undefined) {
                        switch (req.query.date.substr(2, 2)) {
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

                        data[0][0] = req.query.date.substring(0, 2) + monthtext + req.query.date.substring(4, 8)
                    }
                    res.send(data)
                }
            })
            .catch((err) => {
                let data = [["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e481", 0], ["\u0e40\u0e25\u0e02\u0e2b\u0e19\u0e49\u0e323\u0e15\u0e31\u0e27", 0, 0], ["\u0e40\u0e25\u0e02\u0e17\u0e49\u0e32\u0e223\u0e15\u0e31\u0e27", 0, 0], ["\u0e40\u0e25\u0e02\u0e17\u0e49\u0e32\u0e222\u0e15\u0e31\u0e27", 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e02\u0e49\u0e32\u0e07\u0e40\u0e04\u0e35\u0e22\u0e07\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e481", 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e482", 0, 0, 0, 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e483", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e484", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ["\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e17\u0e35\u0e485", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]
                res.send(data)
                console.log(err)
            });
    }
})

app.get('/reto', (req, res) => {
    fetch('http://localhost:' + port + '/?date=' + padLeadingZeros(new Date().getDate(), 2) + '' + padLeadingZeros((new Date().getMonth() + 1), 2) + '' + (new Date().getFullYear() + 543))
        .then(res => res.json())
        .then((body) => {
            if (body[0][1] === "XXXXXX" || body[0][1] === "xxxxxx") {
                res.send('yes')
            } else {
                res.send('no')
            }
        })
})

app.get('/god', async (req, res) => {
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
    } catch (err) {
    }
    if (fileContents) {
        yearlist = JSON.parse(fileContents);
        if (
            yearlist[yearlist.length - 1].substring(4, 8) ==
            new Date().getFullYear() + 543
        ) {
            year = new Date().getFullYear() + 543;
        } else {
            year = yearlist[yearlist.length - 1].substring(4, 8)
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
                                fs.unlinkSync('tmp/' + req.query.date + '.txt');
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
    fs.writeFile('tmp/cache.txt', JSON.stringify(yearlist), function (err) {
        if (err) throw err;
        res.send(yearlist)
    });
})

app.get('/gdpy', (req, res) => {
    let peryear = []
    let yearlist = []
    var fileContents = null;
    try {
        if (req.query.year == new Date().getFullYear() + 543) {
            fs.unlinkSync('tmp/' + req.query.year + '.txt');
            console.log('yes this year')
        }
        fileContents = fs.readFileSync('tmp/' + req.query.year + '.txt');
    } catch (err) {

    }
    if (fileContents) {
        res.send(JSON.parse(fileContents));
    } else {
        fetch('https://www.myhora.com/%E0%B8%AB%E0%B8%A7%E0%B8%A2/%E0%B8%9B%E0%B8%B5-' + req.query.year + '.aspx')
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
                fs.writeFile('tmp/' + req.query.year + '.txt', JSON.stringify(yearlist), function (err) {
                    if (err) throw err;
                    res.send(yearlist)
                });
            })
    }
})

app.get('/checklottery', (req, res) => {
    let result = ""
    fetch('http://localhost:' + port + '/?date=' + req.query.by)
        .then(res => res.json())
        .then((body) => {
            body.forEach(function (val, x) {
                val.forEach(function (superval, y) {
                    if (superval == req.query.search || superval == req.query.search.substr(0, 3) || superval == req.query.search.substr(3, 6) || superval == req.query.search.substr(4, 6) && y != 0) {
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
            res.send(result.substring(0, result.length - 1))
        })
})

app.get('/lastlot', async (req, res) => {
    let lastdate
    let viewer
    await fetch('http://localhost:'+port+'/gdpy?year='+(new Date().getFullYear()+543))
    .then(res => res.json())
    .then((body) => {
        lastdate = body[body.length-1]
    })
    await fetch('http://localhost:'+port+'/?date='+lastdate)
    .then(res => res.json())
    .then((body) => {
        if(req.query.info !== undefined){
            viewer = {
                info: {
                    date: lastdate
                },
                win: body[0][1],
                threefirst: body[1][1]+','+body[1][2],
                threeend: body[2][1]+','+body[2][2],
                twoend: body[3][1]
            }
        }else{
            viewer = {
                win: body[0][1],
                threefirst: body[1][1]+','+body[1][2],
                threeend: body[2][1]+','+body[2][2],
                twoend: body[3][1]
            }
        }
        res.send(viewer)
    })
})

app.get('/getchit', (req, res) => {
    let a = []
    fetch('https://www.huayvips.com/luckynumber/')
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
                    res.send(a)
                    return
                }
            }
        })
})

app.get('/finddol', async (req, res) => {
    let channels
    let allwin = []
    await fetch('http://localhost:' + port + '/god')
        .then(res => res.json())
        .then((body) => {
            channels = body.splice(408)
        })
    for (const val of channels) {
        await fetch('http://localhost:' + port + '/?date=' + val + '&from')
            .then(res => res.json())
            .then((body) => {
                for (let index = 0; index < body.length; index++) {
                    const element = body[index];
                    if (element.includes(req.query.search.toString())) {
                        allwin.push(body[0][0])
                    }
                }

            })
    }
    res.send(allwin)
})

app.listen(port, '0.0.0.0', () => {
    console.log('lottsanook app listening at port: ' + port)
})
