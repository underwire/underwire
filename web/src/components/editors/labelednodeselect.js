const React = require('react');
const NodeSelect = require('./nodeselect');

class LabeledSelect extends React.Component{
  getValue(){
    return this.refs.editor.getWrappedInstance().getValue();
  }

  render(){
    return (
      <div className="form-group">
        <label className="control-label">{this.props.label}</label>
        <NodeSelect {...this.props} ref="editor" />
      </div>
    );
  }
};

module.exports = LabeledSelect;
