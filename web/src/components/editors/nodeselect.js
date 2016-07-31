const React = require('react');
const {
  Component,
} = React;
const {
  connect,
} = require('react-redux');
const Select = require('react-select');

class NodeSelect extends Component{
  constructor(props){
    super();
    this.state = {value: props.selected};
  }

  handleSelect(item){
    this.setState({value: item.value});
    item && this.props.onSelected && this.props.onSelected(item.value);
  }

  getValue(){
    return this.state.value;
  }

  componentWillReceiveProps(props){
    if(props.selected){
      this.setState({value: props.selected});
    }
  }

  render(){
    const {
      nodes,
    } = this.props;
    const selected = this.state.value;//this.props.selected || (nodes[0]||{}).id;
    const items = nodes.map((node)=>{
      return {
        value: node.id,
        label: node.name,
      };
    });
    return (
      <Select ref="editor" options={items} value={selected} onChange={this.handleSelect.bind(this)} />
    );
  }
};

class NodeSelect_old extends Component{
  handleSelect(e){
    const id = e.target.value;
    id && this.props.onSelected && this.props.onSelected(id, e);
  }

  render(){
    const {
      nodes,
    } = this.props;
    const selected = this.props.selected || (nodes[0]||{}).id;
    const items = nodes.map((node)=><option value={node.id} key={node.id}>{node.name}</option>);
    return (
      <select className="form-control" value={selected} onChange={this.handleSelect.bind(this)}>
        {items}
      </select>
    );
  }
};

const mapStateToProps = (state, ownProps) => {
  return {
    selected: ownProps.selected,
    onSelected: ownProps.onSelected,
    nodes: state.nodes,
  };
};

module.exports = connect(mapStateToProps, null, null, {withRef: true})(NodeSelect);
