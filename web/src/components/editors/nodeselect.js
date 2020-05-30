const React = require('react');
const { Component } = React;
const { connect } = require('react-redux');
import Select from 'react-select';

const getValueFrom = item => {
  if (item.target && item.target.value) {
    return item.target.value;
  }
  return (item && item.value) || undefined;
};

class NodeSelect extends Component {
  constructor(props) {
    super();
    this.state = { value: props.value };
  }

  handleSelect(item) {
    const value = getValueFrom(item);
    this.setState({ value });
    this.props.onSelected && this.props.onSelected(value);
  }

  getValue() {
    return this.state.value;
  }

  componentWillReceiveProps(props) {
    if (props.value) {
      this.setState({ value: props.value });
    }
  }

  render() {
    const { nodes } = this.props;
    const items = nodes.map(node => {
      const caption = node.version
        ? `${node.name} (v${node.version})`
        : node.name;
      return {
        value: node.id,
        label: caption
      };
    });
    const value = this.state.value || (items[0] || {}).value;
    console.log(items, value);
    return (
      <Select
        ref="editor"
        options={items}
        value={value}
        onChange={this.handleSelect.bind(this)}
      />
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    value: ownProps.value,
    onSelected: ownProps.onSelected,
    nodes: state.nodes
  };
};

module.exports = connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(NodeSelect);
