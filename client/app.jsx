/** @jsx React.DOM */
var Router = window.ReactRouter.Router;
var Route = window.ReactRouter.Route;
var Link = window.ReactRouter.Link;

var AppView = React.createClass({
  render: function() {
    console.log("Rendering");
    return (
      <div>
        AppView
        <div><Link to="/spot">LinktoSpotView</Link></div>
      </div>
    );
  }
});

ReactDOM.render(<AppView/>, document.getElementById('app-container'));

ReactDOM.render((
  <Router>
    <Route path="/" component={MapView} />
    <Route path="/spot" component={SpotView} > 
      <Route path="/spot/:spotId" component={Spot} />
    </Route>
    <Route path="/create" component={CreateASpotView} />
    <Route path="/search" component={SearchView} />
    <Route path="/feed" component={UserFeedView} />
    <Route path="/signup" component={SignupView} />
    <Route path="/login" component={LoginView} />
    <Route path="/profile" component={ProfileView} >
      <Route path="/profile/:profileId" component={Profile}/>
    </Route>
  </Router>
), document.getElementById('app-container'));