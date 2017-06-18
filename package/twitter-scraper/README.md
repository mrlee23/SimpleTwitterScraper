# TwitterScraper

Retrieve basic tweet data based on the specified query. Requires NodeJS 4+.

## Usage

```js
'use strict';

let stream = require( 'stream' );
let Scraper = require( 'twitter-scraper' ).Scraper;

let query = 'from:riccardovolo since:2015-05-01 until:2015-05-02';
let scraper = new Scraper( query );
let toConsole = new stream.Writable( {
  objectMode: true,
  write: function( tweet, enc, cb ) {
    console.log( 'Got tweet: ', tweet );
    return cb();
  }
} )
scraper.pipe( toConsole );

// Start the scraper
scraper.start();
```

## Stream data

The data in the stream have the following format:

```js
{
    "id": "123123131312",       // Tweet id as string
    "text": "tweet tweeeet",    // Text
    "timestamp": 123123123,     // Unix seconds
}
```

## Options

The `start` method can accept 2 parameters `first` and `last` 

## Debug

The lib uses the `debug` lib (see [here](https://github.com/visionmedia/debug)) use the `DEBUG` env variable to control the logs.

## License
http://www.wtfpl.net/