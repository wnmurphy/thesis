// var React = require('react');
// var expect = require('chai').expect;
// var TestUtils = require('react-addons-test-utils'); 

// // ======================================

// // Mock the DOM
// var jsdom = require('jsdom');
// var doc = jsdom.jsdom('<!doctype html><html><body></body></html>');
// var win = doc.defaultView;
// global.document = doc;
// global.window = win;

// // Copy keys from window to global
// function propagateToGlobal (window) {
//   for (var key in window) {
//     if (!window.hasOwnProperty(key)) continue;
//     if (key in global) continue;
//     global[key] = window[key];
//   }
// }
// propagateToGlobal(win);

// // ======================================

// // Unmount component after each test to clean up.
// afterEach(function(done) {
//     React.unmountComponentAtNode(document.body);       
//     setTimeout(done);
// })

// // ======================================

describe('MapView', function () {

  it('renders on the DOM', function () {
    // var MapView = require('../client/dist/src/views/MapView.js');
    console.log('MapView is: ', JSON.stringify(MapView));
    var MapViewDiv = TestUtils.renderIntoDocument(
      React.createElement(MapView, null)
    );
    var MapViewExists = TestUtils.findRenderedDOMComponentWithTag(MapView, 'div');
    // First arg is ReactComponent tree, whatever that is
    // 
  });









// ======================================
//To write later...
  it('renders a div with a single class of map-view-container', function (done) {
    var makeMapView = React.createElement('MapView', {});
    var mapViewElement = TestUtils.renderIntoDocument(makeMapView);
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
