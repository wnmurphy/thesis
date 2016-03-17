var utils = React.addons.TestUtils;
// ======================================

// Unmount component after each test to clean up.
afterEach(function(done) {
    React.unmountComponentAtNode(document.body);       
    setTimeout(done);
})

// ======================================

describe('App', function () {

  it('categories object in App should exist', function () {
    expect(categories).to.exist;
  });

  it('should be an object', function () {
    expect(categories).to.be.an('object');
  });

});

describe('MapView', function () {

  it('should exist', function () {
    expect(MapView).to.exist;
  });

  it('should be an function', function () {
    expect(MapView).to.be.an('function');
  });

  it('renders on the DOM', function () {
    var renderer = utils.createRenderer();
    renderer.render(<MapView />);
    var result = renderer.getRenderOutput();
    console.log(result);
    expect(result.type).to.equal('div'); 
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
