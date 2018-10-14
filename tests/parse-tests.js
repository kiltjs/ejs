
var assert = require('assert');
var parseEjs = require('../lib/parse-ejs');

describe('parsing', function () {

  it('foo', function () {

    assert.strictEqual( parseEjs(' foo <% if( foo ) { %> bar <% } %> foobar')({ foo: true }) , ' foo  bar  foobar');

  });

  it('= foo', function () {

    assert.strictEqual( parseEjs(' foo <% if( foo ) { %> <%= foo %> <% } %> foobar')({ foo: 'true text' }) , ' foo  true text  foobar');

  });

  it('= foo (using with)', function () {

    assert.strictEqual( parseEjs(' foo <% if( foo ) { %> <%= foo %> <% } %> foobar', {
      use_with: true,
    })({ foo: 'true text' }) , ' foo  true text  foobar');

  });

});
