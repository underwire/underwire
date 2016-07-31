const React = require('react');
const {
  Component
} = React;
const {
  connect,
} = require('react-redux');
const {
  Link
} = require('react-router');
const Table = require('../../components/smarttable').SmartTable;

const builder = (options)=>{
  const {
    headers = [],
    rowmap = [],
    actions = {},
    store = '',
  } = options;
  const title = options.title || store;
  class Listing extends React.Component{
    render(){
      const {
        data = [],
      } = this.props;
      return (
        <div className="container">
          <h1>{title}</h1>
          <Link to={`/${store}/new`} className="btn btn-default">New</Link>
          <Table headers={headers} rowmap={rowmap} data={data} actions={actions} />
          <Link to={`/${store}/new`} className="btn btn-default">New</Link>
        </div>
      );
    }
  };

  const mapStateToProps = (state, ownProps) => {
    return {
      data: state[store],
    };
  };

  return connect(mapStateToProps)(Listing);
};

module.exports = builder;
