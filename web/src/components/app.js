const React = require('react');
const Nav = require('./nav');
const {
  Router,
  Route,
  Link,
  IndexRoute,
  hashHistory,
  browserHistory,
} = require('react-router');

const history = browserHistory;

const Home = require('../pages/home');
const Graph = require('../pages/graph');
const Nodes = require('../pages/nodes');
const Edges = require('../pages/edges');
const About = require('../pages/about');
const Reports = require('../pages/reports');

const PageNotFound = require('../pages/notfound');

const { Provider } = require('react-redux');
const store = require('../reducers');
const io = require('../lib/io');

const fetcher = require('../lib/fetcher');

const App = React.createClass({
  render(){
    return (
      <div>
        <Nav />
        <div className="page-container">
          {this.props.children}
        </div>
      </div>
    );
  }
});

module.exports = React.createClass({
  render(){
    return (
      <Provider store={store}>
        <Router history={history}>
          <Route path="/" component={App}>
            <IndexRoute component={Home}/>
            <Route path="/graph" component={Graph.View} />
            <Route path="/nodes" component={Nodes.List} />
            <Route path="/nodes/new" component={Nodes.Create} />
            <Route path="/nodes/:id" component={Nodes.View} />
            <Route path="/nodes/:id/edit" component={Nodes.Edit} />
            <Route path="/edges" component={Edges.List} />
            <Route path="/edges/new" component={Edges.Create} />
            <Route path="/edges/:id" component={Edges.View} />
            <Route path="/edges/:id/edit" component={Edges.Edit} />
            <Route path="/reports" component={Reports.Listing} />
            <Route path="/reports/dependencies/overview" component={Reports.DependencyOverview} />
            <Route path="/about" component={About} />
            <Route path="*" component={PageNotFound} />
          </Route>
        </Router>
      </Provider>
    );
  }
});

io.on('connect', ()=>{
  store.dispatch({type: 'CLEAR_EDGES'});
  store.dispatch({type: 'CLEAR_NODES'});
  fetcher('nodes', '/api/graph/nodes');
  fetcher('edges', '/api/graph/edges');
});
