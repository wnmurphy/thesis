var React = require('react');
var expect = require('chai').expect;
var TestUtils = require('react-addons-test-utils'); 
var MapView = require('../client/dist/src/views/MapView'); 
var jsdom = require('jsdom');

// setup the simplest document possible
var doc = jsdom.jsdom('<!doctype html><html><body></body></html>');

// get the window object out of the document
var win = doc.defaultView;

// set globals for mocha that make access to document and window feel 
// natural in the test environment
global.document = doc;
global.window = win;

// take all properties of the window object and also attach it to the 
// mocha global object
propagateToGlobal(win);

// from mocha-jsdom https://github.com/rstacruz/mocha-jsdom/blob/master/index.js#L80
function propagateToGlobal (window) {
  for (var key in window) {
    if (!window.hasOwnProperty(key)) continue;
    if (key in global) continue;
    global[key] = window[key];
  }
}

describe('MapView', function () {
  it('Renders on the DOM', function (done) {
    // Render new component
    var mapViewElement = TestUtils.renderIntoDocument(React.createElement('MapView', {}, React.createElement('div', {}) ));

    // // Look for DOM elements with that tag
    // var mapView = TestUtils.findRenderedDOMComponentWithTag(mapViewElement, 'div');

    // // Find that node on the DOM.
    // var mapViewNode = React.findDOMNode(mapView);

    expect(mapViewElement).to.exist;

    done();
  })
})