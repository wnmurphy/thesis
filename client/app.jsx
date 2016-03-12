/** @jsx React.DOM */
var Router = window.ReactRouter.Router;
var Route = window.ReactRouter.Route;
var Link = window.ReactRouter.Link;

var routes = (
  <Router>
    <Route path="/" component={MapView} />
    <Route path="/spot/:spotId" component={SpotView} /> 
    <Route path="/create" component={CreateView} />
    <Route path="/search" component={SearchView} />
    <Route path="/feed" component={FeedView} />
    <Route path="/signup" component={SignupView} />
    <Route path="/login" component={LoginView} />
    <Route path="/profile/:profileId" component={ProfileView} />
  </Router>
);

ReactDOM.render(routes, document.getElementById('app-container'));