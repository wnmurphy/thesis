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
  
  it('renders on the DOM', function (done) {
    var makeMapView = React.createElement('MapView', {});
    var mapViewElement = TestUtils.renderIntoDocument(makeMapView);
    expect(mapViewElement).to.exist;
    done();
  });

  it('renders a div with a single class of map-view-container', function (done) {
    var makeMapView = React.createElement('MapView', {});
    var mapViewElement = TestUtils.renderIntoDocument(makeMapView);
    console.log(document.body);
    expect(mapViewElement.children[0]).getElementsByClassName('map-view-container').length.to.be(1);
    done();
  });


  it('renders a div with a single class of map', function(){
    var rootElement = this.renderedDOM();
    expect(rootElement.tagName).toEqual('div');
    expect(rootElement.classList.length).toEqual(1);
    expect(rootElement.classList[0]).toEqual('map');

  });

  it('renders a div with a class of create-button-container', function(){
    var rootElement = this.renderedDOM();
    expect(rootElement.tagName).toEqual('div');
    expect(rootElement.classList.length).toEqual(1);
    expect(rootElement.classList[0]).toEqual('create-button-container');

  });

  it('renders a div with a class of refresh-button-container', function(){
    var rootElement = this.renderedDOM();
    expect(rootElement.tagName).toEqual('div');
    expect(rootElement.classList.length).toEqual(1);
    expect(rootElement.classList[0]).toEqual('refresh-button-container');

  });


});
