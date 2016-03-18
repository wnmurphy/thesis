
var utils = React.addons.TestUtils;
var result;
var renderer;
// ======================================

// Unmount component after each test to clean up.
afterEach(function(done) {
    React.unmountComponentAtNode(document.body);       
    result = undefined;
    renderer = undefined;
    setTimeout(done);
});

// ======================================

// describe('App', function () {

//   it('categories object in App should exist', function () {
//     expect(categories).to.exist;
//   });

//   it('should be an object', function () {
//     expect(categories).to.be.an('object');
//   });

// });

describe('MapView', function () {
  
  beforeEach(function(done){
    renderer = utils.createRenderer();
    renderer.render(<MapView />);
    result = renderer.getRenderOutput();
    setTimeout(done);
  });

  it('should exist', function () {
    expect(MapView).to.exist;
  });

  it('should be an function', function () {
    expect(MapView).to.be.an('function');
  });

  it('renders on the DOM', function () {
    expect(result.type).to.equal('div'); 
  });

  describe('MapView divs', function(){

    it('contains a div with a class of map-view-container', function () {
      expect(result.props.className).to.equal('map-view-container');
    });

    it('contains other children divs', function () {
      expect(result.props.children.length).to.be.above(0);
    });

    it('contains a div with a id of map', function () {
      expect(result.props.children[0].type).to.equal('div');
      expect(result.props.children[0].props.id).to.equal('map');
    });

    it('contains a div with a className of create-button-container', function () {
      expect(result.props.children[1].type).to.equal('div');
      expect(result.props.children[1].props.className).to.contain('create-button-container');
    });

    it('contains a div with a className of collapse-button-container', function () {
      expect(result.props.children[2].type).to.equal('div');
      expect(result.props.children[2].props.className).to.contain('collapse-button-container');
    });

    it('contains a div with a className of refresh-button-container', function () {
      expect(result.props.children[3].type).to.equal('div');
      expect(result.props.children[3].props.className).to.contain('refresh-button-container');
    });

    it('contains a div with a className of center-button-container', function () {
      expect(result.props.children[4].type).to.equal('div');
      expect(result.props.children[4].props.className).to.contain('center-button-container');
    });

    it('contains a div with a className of filter-search', function () {
      expect(result.props.children[5].type).to.equal('div');
      expect(result.props.children[5].props.className).to.contain('filter-search');
    });
  });
});


describe('CreateView', function () {

  beforeEach(function(done){
    renderer = utils.createRenderer();
    renderer.render(<CreateView />);
    result = renderer.getRenderOutput();
    setTimeout(done);
  });

  it('should exist', function () {
    expect(CreateView).to.exist;
  });

  it('should be an function', function () {
    expect(CreateView).to.be.an('function');
  });

  it('renders on the DOM', function () {
    expect(result.type).to.equal('div'); 
  });

  describe('CreateView divs', function(){

    it('contains a div with a className of create-map-view-container', function () {
      expect(result.props.children[0].type).to.equal('div');
      expect(result.props.children[0].props.className).to.equal('create-map-view-container');
    });

    it('contains a div with a className of reset-button-container', function () {
      expect(result.props.children[1].type).to.equal('div');
      expect(result.props.children[1].props.className).to.contain('reset-button-container');
    });

    it('renders a div that contains a form', function () {
      expect(result.props.children[2].type).to.equal('div');
      expect(result.props.children[2].props.children.type).to.equal('form');
    });
  });
});


describe('SpotView', function () {

  beforeEach(function(done){
    renderer = utils.createRenderer();
    renderer.render(<SpotView />);
    result = renderer.getRenderOutput();
    setTimeout(done);
  });

  it('should exist', function () {
    expect(SpotView).to.exist;
    console.log("SpotView: ", result);
  });

  it('should be an function', function () {
    expect(SpotView).to.be.an('function');
  });

  it('renders on the DOM', function () {
    expect(result.type).to.equal('div'); 
  });

  describe('SpotView divs', function(){

    it('contains a div with a className of spot-container', function () {
      expect(result.type).to.equal('div');
      expect(result.props.className).to.equal('spot-container');
    });

    it('contains a div with a className of create-map-view-container', function () {
      expect(result.props.children[0].type).to.equal('div');
      expect(result.props.children[0].props.className).to.equal('create-map-view-container');
    });

    it('contains a div with a className of spot-view-container', function () {
      expect(result.props.children[1].type).to.equal('div');
      expect(result.props.children[1].props.className).to.equal('spot-view-container');
    });

    it('contains a div with a className of share-card-container', function () {
      expect(result.props.children[2].type).to.equal('div');
      expect(result.props.children[2].props.className).to.equal('share-card-container');
    });

    it('contains a div with a className of share-button-container', function () {
      expect(result.props.children[3].type).to.equal('div');
      expect(result.props.children[3].props.className).to.equal('share-button-container');
    });
  });
});


describe('FeedView', function () {

  beforeEach(function(done){
    renderer = utils.createRenderer();
    renderer.render(<FeedView />);
    result = renderer.getRenderOutput();
    setTimeout(done);
  });

  it('should exist', function () {
    expect(FeedView).to.exist;
  });

  it('should be an function', function () {
    expect(FeedView).to.be.an('function');
  });

  it('renders on the DOM', function () {
    expect(result.type).to.equal('div'); 
  });
});


describe('LoginView', function () {

  beforeEach(function(done){
    renderer = utils.createRenderer();
    renderer.render(<LoginView />);
    result = renderer.getRenderOutput();
    setTimeout(done);
  });

  it('should exist', function () {
    expect(LoginView).to.exist;
  });

  it('should be an function', function () {
    expect(LoginView).to.be.an('function');
  });

  it('renders on the DOM', function () {
    expect(result.type).to.equal('div'); 
  });
});


describe('SignupView', function () {

  beforeEach(function(done){
    renderer = utils.createRenderer();
    renderer.render(<SignupView />);
    result = renderer.getRenderOutput();
    setTimeout(done);
  });

  it('should exist', function () {
    expect(SignupView).to.exist;
  });

  it('should be an function', function () {
    expect(SignupView).to.be.an('function');
  });

  it('renders on the DOM', function () {
    expect(result.type).to.equal('div'); 
  });
});


describe('SearchView', function () {

  beforeEach(function(done){
    renderer = utils.createRenderer();
    renderer.render(<SearchView />);
    result = renderer.getRenderOutput();
    setTimeout(done);
  });

  it('should exist', function () {
    expect(SearchView).to.exist;
  });

  it('should be an function', function () {
    expect(SearchView).to.be.an('function');
  });

  it('renders on the DOM', function () {
    expect(result.type).to.equal('div'); 
  });
});


describe('ProfileView', function () {

  beforeEach(function(done){
    renderer = utils.createRenderer();
    renderer.render(<ProfileView />);
    result = renderer.getRenderOutput();
    setTimeout(done);
  });

  it('should exist', function () {
    expect(ProfileView).to.exist;
  });

  it('should be an function', function () {
    expect(ProfileView).to.be.an('function');
  });

  it('renders on the DOM', function () {
    expect(result.type).to.equal('div'); 
  });
});