const React = require('react');
const DependencyGraph = require('../components/dependencygraph');
const {
  connect,
} = require('react-redux');

// Takes the raw data and converts it into a graph for use with walkData
const linkData = (data)=>{
  const sceneObjects = data.nodes.map((node, i)=>{
    const {
      id,
      name,
      shape,
      ...meta
    } = node;
    return Object.assign({id, name, shape, meta, node}, {
      inbound: [],
      outbound: [],
    });
  });
  const indexes = sceneObjects.map((item)=>item.id);

  data.edges.forEach((connection)=>{
    let fromIdx = indexes.indexOf(connection.from);
    let toIdx = indexes.indexOf(connection.to);
    sceneObjects[fromIdx].outbound.push(sceneObjects[toIdx]);
    sceneObjects[toIdx].inbound.push(sceneObjects[fromIdx]);
  });

  return sceneObjects;
};

const flattenTree = (node)=>{
  const flattenBranch = (node, direction, seen)=>{
    const children = node[direction] || [];
    return children.map((child)=>{
      const idx = seen.indexOf(child.id);
      if(idx > -1){
        return {
          id: child.id,
          name: child.name,
          shape: child.shape,
          node: child.node
        };
        return false;
      }
      seen.push(child.id);
      return Object.assign({}, child, {
        [direction]: flattenBranch(child, direction, seen.slice())
      });
    }).filter((child)=>child!==false);
  };
  const flattenNode = (node)=>{
    return Object.assign({}, node, {
      inbound: flattenBranch(node, 'inbound', [node.id]),
      outbound: flattenBranch(node, 'outbound', [node.id]),
    });
  };
  return flattenNode(node);
};

class DependencyGraphView extends React.Component{
  constructor(props){
    super();
    const {
      nodes = [],
      edges = [],
    } = props;
    const data = linkData({
      nodes,
      edges,
    }).map((node)=>flattenTree(node));
    this.state = {data};
  }

  componentWillReceiveProps(props){
    const {
      nodes = this.state.nodes || [],
      edges = this.state.edges || [],
    } = props;
    const data = linkData({
      nodes,
      edges,
    }).map((node)=>flattenTree(node));
    this.setState({data});
  }

  handleDoubleClick(e, node){
    if(node && ((!this.state.root)||(this.state.root !== node.id))){
      const clickHandler = this.props.onDoubleClick;
      if(clickHandler){
        return clickHandler(node);
      }
      this.setState({root: node.id});
    }
  }

  renderView(props){
    const {
        loading,
        nodes,
      } = this.props;
    if(loading){
      return <span>Loading...</span>;
    }
    if(nodes.length === 0){
      return (
        <div className="bs-callout bs-callout-warning">
          <h4>NO DATA</h4>
          <p>You haven't pushed any nodes or connections yet.  Come back once you have.</p>
        </div>
      );
    }
    return (
      <DependencyGraph
        {...this.props}
        rootNodeID={this.props.selected}
        data={this.state.data}
        onDoubleClick={this.handleDoubleClick.bind(this)}
        />
    );
  }

  render(){
    return this.renderView(this.props);
  }
};

const mapStateToProps = (state, ownProps) => {
  const {
    fetcher
  } = state;
  const {
    nodes = {fetching: false},
    edges = {fetching: false}
  } = fetcher;
  const loading = !((nodes.fetching === false) && (edges.fetching === false));
  return {
    nodes: state.nodes,
    edges: state.edges,
    loading,
  };
};

module.exports = connect(mapStateToProps)(DependencyGraphView);
