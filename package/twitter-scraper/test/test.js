'use strict';

let chai = require( 'chai' );
let scrape = require( '../' ).scrape;
let expect = chai.expect;


describe.skip( 'Support single page results', function() {
  this.timeout( 0 );
  let query = 'from:riccardovolo since:2015-01-01 until:2015-05-02';
  let tweets = [];
  before( function() {
    return scrape( query )
    .then( t => tweets = t );
  } );
  after( function() {
    console.log( 'Scraped %d tweets', tweets.length );
  } );

  describe( 'Test volo', function() {
    it( 'should get 4 tweets', function() {
      expect( tweets ).to.have.length( 4 );
    } );
    it( 'the first tweet id should be 590789562064117760', function() {
      // Check first tweet
      expect( tweets[0] ).to.have.property( 'id' );
      expect( tweets[0].id ).to.be.equal( '590789562064117760' );
    } );
    it( 'the last tweet id should have timestamp 1426163528', function() {
      // Check last tweet
      expect( tweets[3] ).to.have.property( 'timestamp' );
      expect( tweets[3].timestamp ).to.be.equal( 1426163528 );
    } );
  } );
} );


describe.skip( 'Support multi page results', function() {
  this.timeout( 0 );
  let query = '#yourexpo2015';
  let tweets = [];
  before( function() {
    return scrape( query )
    .then( t => tweets = t );
  } );
  after( function() {
    console.log( 'Scraped %d tweets', tweets.length );
  } );

  describe( 'Test #yourexpo2015', function() {
    it( 'should get 145 tweets', function() {
      expect( tweets ).to.have.length.within( 120, 160 );
    } );
  } );
} );