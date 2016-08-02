const React = require('react');
const Tags = require('./tags');

class LabeledTags extends React.Component{
  getValue(){
    return this.refs.editor.getWrappedInstance().getValue();
  }

  render(){
    return (
      <div className="form-group">
        <label className="control-label">{this.props.label}</label>
        <Tags {...this.props} ref="editor" />
      </div>
    );
  }
};

module.exports = LabeledTags;
