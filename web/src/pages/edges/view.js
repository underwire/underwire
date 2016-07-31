const React = require('react');
const {
  Component
} = React;

const {
  connect,
} = require('react-redux');

const {
  Link,
} = require('react-router');
const {
  LabeledList,
  LabeledItem,
} = require('../../components/labeledlist');

class ViewEdge extends Component{
  findNode(id){
    const nodes = (this.props.nodes || []).filter((node)=>node.id === id);
    return nodes.shift() || id;
  }

  render(){
    const id = this.props.id;
    const edgesList = this.props.edges.filter((edge)=>edge.id===id).map((edge)=>{
      return Object.assign({}, edge, {
        from: this.findNode(edge.from),
        to: this.findNode(edge.to),
      });
    });
    const edge = edgesList.shift()||{};
    return (
      <div className="container">
        <h1>View Edge</h1>
        <pre>{JSON.stringify(edge, null, '  ')}</pre>
      </div>
    );
  }
};

const mapStateToProps = (state, ownProps) => {
  return {
    id: ownProps.params.id,
    edges: state.edges,
    nodes: state.nodes,
  };
};

module.exports = connect(mapStateToProps)(ViewEdge);
