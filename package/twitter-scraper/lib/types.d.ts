import cheerio = require('cheerio');
export interface MaxPosition {
    session: string;
    fixed: string;
    last: string;
}
export interface PageResponse {
    html: string;
    cheerio?: cheerio.Static;
    last?: string;
}
export interface Tweet {
    id: string;
    text: string;
    timestamp: number;
    date: Date;
}
