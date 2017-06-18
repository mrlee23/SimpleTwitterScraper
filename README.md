Simple Twitter Scraper
======================

This package is adapted from [twitter-scraper](https://github.com/Volox/TwitterScraper).
It focused on collecting tweets between start to end date from specific keyword.
Also, the output data properties are same as [GetOldTweets-python](https://github.com/Jefferson-Henrique/GetOldTweets-python) package.
Output file format is json.

Output Data
------------
```json
{
	"id": "123456789012345678",
	"permalink": "https://twitter.com/username/status/123456789012345678",
	"username": "username",
	"text": "@abcd @efgh #This is #tweet text",
	"datetime": "2017-01-01 11:11",
	"retweets": 30,
	"favorites": 20,
	"mentions": "@abcd @efgh",
	"hashtags": "#This #tweet",
	"geo": ""
}
```

How to use
----------
`simple-twitter-scraper <keyword> <first date(YYYY-MM-DD)> <last date(YYYY-MM-DD)> <output directory>
```sh
> npm install -g simple-twitter-scraper
> simple-twitter-scraper twitter 2017-01-01 2017-02-01 ./
```
