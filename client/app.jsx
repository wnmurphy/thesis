/** @jsx React.DOM */
var Router = window.ReactRouter.Router;
var Route = window.ReactRouter.Route;
var Link = window.ReactRouter.Link;
var useRouterHistory = window.ReactRouter.useRouterHistory;
var createHashHistory = window.History.createHashHistory;
var browserHistory = useRouterHistory(createHashHistory)({queryKey: false});

var globalState = {};

var routes = (
  <div>
  <Router history={browserHistory}>
    <Route path="/" component={MapView} />
    <Route path="/spot/:spotId" component={SpotView} />
    <Route path="/create" component={CreateView} />
    <Route path="/search" component={SearchView} />
    <Route path="/feed" component={FeedView} />
    <Route path="/signup" component={SignupView} />
    <Route path="/login" component={LoginView} />
    <Route path="/profile" component={ProfileView} />
    <Route path="/profile/:profileId" component={ProfileView} />
    <Route path="/share" component={ShareCard} />
  </Router>
  </div>
);

ReactDOM.render(routes, document.getElementById('app-container'));
ReactDOM.render(<NavBar />, document.getElementById('nav-container'));
