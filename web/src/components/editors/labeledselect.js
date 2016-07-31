const React = require('react');
const Select = require('./select');

class LabeledSelect extends React.Component{
  getValue(){
    return this.refs.editor.getValue();
  }

  render(){
    return (
      <div className="form-group">
        <label className="control-label">{this.props.label}</label>
        <Select {...this.props} ref="editor" />
      </div>
    );
  }
};

module.exports = LabeledSelect;
