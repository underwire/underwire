const React = require('react');
const pjson = require('../../../package.json');
const {
  connect,
} = require('react-redux');
const DependencyGraphView = require('../components/dependencyview')

class Home extends React.Component{
  render(){
    return (
      <div className="container">
        <div className="jumbotron">
          <h1>Underwire</h1>
          <h2>v{pjson.version}</h2>
          <p>A minimal dependency graph manager and viewer built with Hapi and React.</p>
        </div>
        <div className="bs-callout bs-callout-info">
          <h4>NOTE:</h4>
          <p>This project is an experiment and is in early development stages.  Pull requests and help are welcome.</p>
        </div>
        <div className="row">
          <div className="col-lg-4">
            <h2>Graph</h2>
            <ul>
              <li>Dynamically create/update nodes</li>
              <li>Dynamically create/update edges</li>
              <li>Track dependencies between nodes</li>
            </ul>
          </div>
          <div className="col-lg-4">
            <h2>Visualize</h2>
            <ul>
              <li>Visualize node dependencies (both inbound and outbound)</li>
              <li>More visualizations to come</li>
            </ul>
          </div>
          <div className="col-lg-4">
            <h2>Customize</h2>
            <ul>
              <li>Completely open source</li>
              <li>Extend, enhance, destory as you see fit</li>
              <li>Bring your own datastore, or use the built in memory store</li>
              <li>Use our backend, build/bring your own frontend</li>
            </ul>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-4">
            <h2>API Driven</h2>
            <ul>
              <li>Graphs, Nodes, Edges all have an REST API</li>
              <li>Add and Update events synced over Websockets</li>
              <li>API documented with swagger <a href="/documentation">/documentation</a></li>
            </ul>
          </div>
          <div className="col-lg-4">
            <h2>Planned Features</h2>
            <ul>
              <li>Alias lists</li>
              <li>Edge enforcement</li>
              <li>Plugin architecture</li>
              <li>Database drivers (Mongo, Level, ???)</li>
              <li>Security plugins</li>
              <li>More visualizations and reports</li>
              <li>Customizeable home page</li>
            </ul>
          </div>
          <div className="col-lg-4">
            <h2>Todo</h2>
            <ul>
              <li>Better node shape selection</li>
              <li>Ability to edit edges from nodes</li>
              <li>Bug fixes on wordwarp in graph view</li>
              <li>Tests</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
};

module.exports = Home;
