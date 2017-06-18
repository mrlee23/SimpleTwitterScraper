#!/usr/bin/env node
let Scraper = require('simple-twitter-scraper').scraper,
	moment = require('moment'),
	fs = require('fs'),
	path = require('path'),
	_ = require('lodash');
let keyword =process.argv[2],
	start = process.argv[3],
	end = process.argv[4],
	basedir = process.argv[5];
let timeEnd = moment(new Date()),
	timeStart = moment(timeEnd).add(-30, 'days');
let helpText = `=============================================================
실행 방법(How to use)
node index.js <키워드(keyword)> <처음날짜(first date)> <마지막날짜(last date)> <디렉토리(output directory)>
- 키워드 : 가져오려는 트위터 키워드
- 처음날짜(YYYY-MM-DD) : 키워드를 가져올 처음날짜
- 마지막날짜(YYYY-MM-DD) : 키워드를 가져올 마지막날짜
- 디렉토리 : 저장할 디렉토리 위치

사용 예(Example)
> node index.js Twitter ${timeStart.format('YYYY-MM-DD')} ${timeEnd.format('YYYY-MM-DD')} ./
=============================================================
`;
let argNames = ['키워드(keyword)', '처음날짜(first date)', '마지막날짜(last date)', '디렉토리(output directory)'],
	argChecker = [arg => { try { if (arg.length < 1) {	throw new Error(); } } catch (e) { throw new Error("길이가 1 이상이여야 합니다.(Length should be more than 1.)"); } },
				  arg => { try { moment(arg); } catch (e) { throw new Error("형식이 YYYY-MM-DD 이여야 합니다.(Invalid date format.(YYYY-MM-DD))"); } },
				  arg => { try { moment(arg); } catch (e) { throw new Error("형식이 YYYY-MM-DD 이여야 합니다.(Invalid date format.(YYYY-MM-DD))"); } },
				  arg => { try { if (!fs.lstatSync(arg).isDirectory()) { throw new Error(); }} catch (e) { throw new Error("디렉토리 경로가 존재하지 않습니다.(Directory is not exist.)"); } }];
[keyword, start, end, basedir].forEach((arg, i) => {
	if (typeof(arg) != 'string') {
		console.log(`Error: ${i+1} 번째 인자인 <${argNames[i]}>가 지정되지 않았습니다.(Not specified argument.)`);
		console.log(helpText);
		process.exit(1);
	}
	try {
		argChecker[i](arg);
	} catch (e) {
		console.log(`Error: ${i+1} 번째 인자인 <${argNames[i]}>가 올바르지 않습니다.(Invalid argument.)`);
		console.log(`Error: ${e.message}`);
		console.log(helpText);
		process.exit(1);
	}
});
let	dummyStart = moment(start).add(-1, 'days').format('YYYY-MM-DD'),
	dummyEnd = moment(end).add(1, 'days').format('YYYY-MM-DD');
let query = `${keyword} since:${dummyStart} until:${dummyEnd}`;
let scraper = new Scraper(query);

const EXT = '.json';
function getCurrentTime() {
	return moment(new Date()).format('MM-DD HH:mm:ss');
}

scraper.interceptor = function (tweets) {
	let twData = {};
	let currentTime = getCurrentTime();
	for (var tweet of tweets) {
		let name = tweet.date.split(' ')[0],
			filePath = path.resolve(basedir, name.concat(EXT));
		if ((name == dummyStart) ||
			(name == dummyEnd)) {
			console.log(`[${currentTime}]: Ignored ${name} (dummyStart: ${dummyStart}, dummyEnd: ${dummyEnd})`);
			return;
		}
		if (twData[filePath] == null) {
			twData[filePath] = [];
		}
		twData[filePath].push(tweet);
	}
	_.forEach(twData, (dataArray, filePath) => {
		let data = dataArray;
		if (fs.existsSync(filePath)) {
			let beforeData = fs.readFileSync(filePath);
			data = JSON.parse(beforeData).concat(data);
		}
		fs.writeFileSync(filePath, JSON.stringify(data));
		console.log(`[${currentTime}]: Saved ${dataArray.length} tweets in ${filePath}`);
	});
};
scraper.start();
