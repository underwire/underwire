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

  render(){
    return (
      <div className="container">
        <NodeSelect selected={this.state.rootNodeId} onSelected={this.handleSelect.bind(this)} />
        <DependencyGraphView selected={this.state.rootNodeId} focusRoot={true} onDoubleClick={this.drillDown.bind(this)} />
      </div>
    );
  }
};

module.exports = ViewGraph;
