// Load system modules
const moment = require('moment');
const stream_1 = require('stream');
const url_1 = require('url');
// Load modules
const initDebug = require('debug');
const request = require('request');
const cheerio = require('cheerio');
// Constant declaration
const debug = initDebug('twitter-scraper');
const TW_HOST = 'twitter.com';
const TW_QUERY_PATH = 'search';
const TW_AJAX_PATH = 'i/search/timeline';
const SESSION_CONTAINER = '.stream-container[data-max-position]';
const TWEETS_SELECTOR = '.stream-item[data-item-id]';
const REQUEST_TIMEOUT = 1000 * 10; // 10s
const RETRY_DELAY = 1000 * 5; // 5s
// Module variables declaration
// Module interfaces declaration
// Module functions declaration
function scrape(query, callback) {
    const tweets = [];
    const scraper = new Scraper(query);
    scraper.on('data', t => tweets.push(t));
    scraper.on('end', () => callback(null, tweets));
    scraper.on('error', err => callback(err));
    return scraper.start();
}
exports.scrape = scrape;
// Module class declaration
class Scraper extends stream_1.Readable {
    constructor(query) {
        super({ objectMode: true });
        this.total = 0;
        this.session = null;
        this.fixed = null;
        this.lastTweet = null;
        if (typeof query !== 'string') {
            throw new Error('Query must be a string');
        }
        this.query = query;
        debug('Query: "%s"', query);
    }
    // Overrides
    _read() { }
    toString() { return 'TwitterScraper'; }
    // unleak( s: string ): string {
    // return ( ' ' + s ).substr( 1 );
    // }
    // Max position is a string in the format:
    // TWEET-<numbers>-<numbers>-<sessionId>
    getMaxPosition(last) {
        let maxPosition = null;
        if (last) {
            maxPosition = `TWEET-${last}-${this.fixed}-${this.session}`;
        }
        return maxPosition;
    }
    parseMaxPosition(maxPosition) {
        const parts = maxPosition.split('-').slice(1); // Remove the "TWEET" part
        return {
            session: parts[2],
            fixed: parts[1],
            last: parts[0],
        };
    }
    // Twitter URL
    getTwitterUrl(query, maxPosition) {
        const qs = {
            q: query,
            max_position: maxPosition,
            // Fixed
            f: 'tweets',
            vertical: 'news',
            include_entities: 0,
            src: 'sprv',
        };
        const fullPath = maxPosition ? TW_AJAX_PATH : TW_QUERY_PATH;
        const fullTwUrl = url_1.format({
            host: TW_HOST,
            pathname: fullPath,
            query: qs,
            protocol: 'https',
        });
        return fullTwUrl;
    }
    // Requests
    getPage(url, callback) {
        const options = {
            url: url,
            json: true,
            timeout: REQUEST_TIMEOUT,
        };
        return request(options, (err, req, body) => {
            // Handle errors
            if (err) {
                debug('Error %s', err.code, err.stack);
                debug('REDO REQUEST');
                return this.getPage(url, callback);
            }
            // Parse response, get html
            let html = body;
            // Create response
            const res = {
                html: html,
            };
            // In case of AJAX call
            if (body && body.min_position) {
                const last = this.parseMaxPosition(body.min_position).last;
                res.html = body.items_html;
                res.last = last;
            }
            // Parse the page with cheerio
            res.cheerio = cheerio.load(res.html);
            return callback(null, res);
        });
    }
    getSession(query, callback) {
        debug('Get session');
        const pageUrl = this.getTwitterUrl(query);
        return this.getPage(pageUrl, (err, pageResult) => {
            // Pass back the error
            if (err)
                return callback(err);
            // Extract the parsed page as $
            const $ = pageResult.cheerio;
            const maxPositionStr = $(SESSION_CONTAINER).attr('data-max-position');
            // const maxPositionStr = this.unleak( $( SESSION_CONTAINER ).attr( 'data-max-position' ) );
            const tweets = this.parsePage($);
            if (maxPositionStr) {
                const maxPosition = this.parseMaxPosition(maxPositionStr);
                return callback(null, maxPosition);
            }
            else {
                const error = new Error('"data-max-position" not found in "' + SESSION_CONTAINER + '"');
                return callback(error);
            }
        });
    }
    // Tweet data extraction
    parsePage($) {
        const tweets = this.getTweetIds($);
        // this.sendTweets(tweets); // memory leak
        return tweets;
    }
    getTweetIds($) {
        const divs = $(TWEETS_SELECTOR).toArray();
        const tweets = [];
        for (const div of divs) {
            const timestamp = Number($('._timestamp', div).attr('data-time'));
			let $div = $(div);
			const id = $div.attr('data-item-id'),
				  username = $div.find('span.username.u-dir b').text(),
				  permalink = 'https://twitter.com'.concat('/', username, '/status/', id),
				  text = $div.find('p.js-tweet-text').text().replace('# ','#').replace('@ ', '@').replace(/\s+/g, ' '),
				  date = moment(new Date(parseInt($div.find("small.time span.js-short-timestamp").attr("data-time"))*1000)).format('YYYY-MM-DD HH:mm'),
				  retweets = parseInt($div.find("span.ProfileTweet-action--retweet span.ProfileTweet-actionCount").attr("data-tweet-stat-count").replace(",", "")),
				  favorites = parseInt($div.find("span.ProfileTweet-action--favorite span.ProfileTweet-actionCount").attr("data-tweet-stat-count").replace(",", "")),
				  mentions = text.match(/(@\w*)/g) != null ? text.match(/(@\w*)/g).join(' ') : '',
				  hashtags = text.match(/(#\w*)/g) != null ? text.match(/(#\w*)/g).join(' ') : '',
				  geo = ($div.find('span.Tweet-geo').length > 0) ? $div.find('span.Tweet-geo').attr('title') : '';

            tweets.push({ id: id,
						  permalink: permalink,
						  username: username,
						  text: text,
						  date: date,
						  retweets: retweets,
						  favorites: favorites,
						  mentions: mentions,
						  hashtags: hashtags,
						  geo: geo
						});
			// delete {div: $div};
        }
		// this.debug();
        return tweets;
    }
    // Stream send data
    sendTweet(tweet) {
        this.lastTweet = tweet;
        this.total += 1;
        debug('Pushing tweet %d: %s', this.total, tweet.id);
        this.push(tweet);
    }
    sendTweets(tweets) {
        for (const tweet of tweets) {
            this.sendTweet(tweet);
        }
    }
    // Loop page loop
    loop(last) {
        debug('Loop for: %s', last);
        const maxPosition = this.getMaxPosition(last);
        const pageUrl = this.getTwitterUrl(this.query, maxPosition);
        return this.getPage(pageUrl, (err, pageResult) => {
            const $ = pageResult.cheerio;
            const newLast = pageResult.last;
            // Parse results
            let tw = this.parsePage($);
			this.interceptor(tw);
            // Exit strategy
            if (newLast === last) {
                debug('No more data, bye');
                this.push(null);
                return;
            }
            // Start nel loop
            setImmediate(() => this.loop(newLast));
        });
    }
    // Public methods
    start(last, fixed) {
        return this.getSession(this.query, (err, maxPosition) => {
            debug('Got maxPosition: ', maxPosition);
            this.session = maxPosition.session;
            this.fixed = fixed || maxPosition.fixed;
            this.loop(last || maxPosition.last);
        });
    }
}
exports.Scraper = Scraper;
// Module initialization (at first load)
// Module exports
//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78
//# sourceMappingURL=index.js.map
