const React = require('react');
const {
  Component,
} = React;
const {
  Link,
} = require('react-router');

class ReportsListing extends Component{
  render(){
    return (
      <div className="container">
        <h1>Reports</h1>
        <p>
          <Link to="/reports/dependencies/overview">Dependency Overview</Link>
          - Shows a listing of all nodes sorted by weight along with number of inbound and outbound links.
        </p>
      </div>
    );
  }
};

module.exports = ReportsListing;
