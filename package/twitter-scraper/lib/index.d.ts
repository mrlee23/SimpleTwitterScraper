import { Readable } from 'stream';
import cheerio = require('cheerio');
import { Tweet, PageResponse, MaxPosition } from './types';
export declare function scrape(query: string, callback: (err: Error, tweets?: Tweet[]) => any): any;
export declare class Scraper extends Readable {
    protected query: string;
    total: number;
    protected session: string;
    protected fixed: string;
    protected lastTweet: Tweet;
    constructor(query: string);
    _read(): void;
    toString(): string;
    protected getMaxPosition(last: string): string;
    protected parseMaxPosition(maxPosition: string): MaxPosition;
    protected getTwitterUrl(query: string, maxPosition?: string): string;
    protected getPage(url: string, callback: (err: Error, response?: PageResponse) => any): any;
    protected getSession(query: string, callback: (err: Error, maxPosition?: MaxPosition) => any): any;
    protected parsePage($: cheerio.Static): Tweet[];
    protected getTweetIds($: cheerio.Static): Tweet[];
    protected sendTweet(tweet: Tweet): void;
    protected sendTweets(tweets: Tweet[]): void;
    protected loop(last?: string): any;
    start(last?: string, fixed?: string): any;
}
