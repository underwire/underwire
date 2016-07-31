const React = require('react');
class LabeledInput extends React.Component{
  getValue(){
    return this.refs.editor.value;
  }

  render(){
    const inputProps = Object.keys(this.props).reduce((obj, key)=>{
      if(key === 'label'){
        return obj;
      }
      if(key === 'value'){
        obj.defaultValue = this.props.value;
        return obj;
      }
      obj[key] = this.props[key];
      return obj;
    }, {});
    const type = inputProps.type || "text";
    return (
      <div className="form-group">
        <label className="control-label">{this.props.label}</label>
        <input type={type} className="form-control" {...inputProps} ref="editor" />
      </div>
    );
  }
};

module.exports = LabeledInput;
