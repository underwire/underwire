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

class ViewNode extends Component{
  findNode(id){
    const nodesList = this.props.nodes.filter((node)=>node.id===id);
    return nodesList.shift()||{name: '[unknown]'};
  }

  findEdges(id, direction){
    const opposite = direction==='from'?'to':'from';
    const edges = (this.props.edges || []).filter((edge)=>edge[direction]===id).map((edge)=>{
      return this.findNode(edge[opposite]).name;
    });
    return edges;
  }

  render(){
    const id = this.props.id;
    const node = [this.findNode(id)].map((node)=>{
      return Object.assign({}, node, {
        connections: {
          inbound: this.findEdges(node.id, 'to'),
          outbound: this.findEdges(node.id, 'from'),
        }
      });
    }).shift();
    return (
      <div className="container">
        <h1>View Node</h1>
        <pre>{JSON.stringify(node, null, '  ')}</pre>
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

module.exports = connect(mapStateToProps)(ViewNode);
