const React = require('react');
const {
  Component,
} = React;
const {
  connect,
} = require('react-redux');

class ReportsListing extends Component{
  render(){
    const {
      nodes = [],
      edges = [],
    } = this.props;
    let heaviest = 0;
    const nodesOverview = nodes.map((node)=>{
      const inbound = edges.filter((edge)=>edge.to===node.id).length;
      const outbound = edges.filter((edge)=>edge.from===node.id).length;
      const weight = inbound+outbound;
      if(heaviest < weight){
        heaviest = weight;
      }
      return {
        id: node.id,
        name: node.name,
        weight,
        inbound,
        outbound,
      };
    }).sort((a, b)=>b.weight-a.weight);
    const rows = nodesOverview.map((node, index)=>{
      return (
        <tr key={node.id}>
          <td>{node.name}</td>
          <td>{parseFloat(node.weight/heaviest).toFixed(4)}</td>
          <td>{node.inbound}</td>
          <td>{node.outbound}</td>
        </tr>
      );
    });
    return (
      <div className="container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Weight</th>
              <th># Inbound</th>
              <th># Outbound</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      </div>
    );
  }
};

const mapStateToProps = (state, ownProps) => {
  return {
    edges: state.edges,
    nodes: state.nodes,
  };
};

module.exports = connect(mapStateToProps)(ReportsListing);
