const React = require('react');
const {
  connect,
} = require('react-redux');
const DependencyGraphView = require('../../components/dependencyview')
const NodeSelect = require('../../components/editors').NodeSelect;

class ViewGraph extends React.Component{
  constructor(){
    super();
    this.state = {};
  }

  handleSelect(id){
    return this.setState({rootNodeId: id});
  }

  drillDown(node){
    return this.handleSelect(node.id);
  }

  getGraphView(){
    if(!this.state.rootNodeId){
      return (
        <div className="bs-callout bs-callout-info">
          <h4>NONE SELECTED:</h4>
          <p>Select a node to view its graph.</p>
        </div>
      );
    }
    return <DependencyGraphView selected={this.state.rootNodeId} focusRoot={true} onDoubleClick={this.drillDown.bind(this)} />;
  }

  render(){
    const graph = this.getGraphView();
    return (
      <div className="container">
        <NodeSelect selected={this.state.rootNodeId} onSelected={this.handleSelect.bind(this)} />
        {graph}
      </div>
    );
  }
};

module.exports = ViewGraph;
