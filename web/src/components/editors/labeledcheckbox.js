const React = require('react');
const reChecked = /^(on|checked|yes|true)$/i;
class LabeledCheckbox extends React.Component{
  getValue(){
    return !!this.refs.editor.checked;
  }

  render(){
    const inputProps = Object.keys(this.props).reduce((obj, key)=>{
      if(key === 'label'){
        return obj;
      }
      if(key === 'value'){
        obj.defaultChecked = this.props.value;
        return obj;
      }
      if(key === 'checked'){
        obj.defaultChecked = this.props.checked;
        return obj;
      }
      obj[key] = this.props[key];
      return obj;
    }, {});
    return (
      <div className="form-group">
        <label className="control-label">
          {this.props.label}
          <input type="checkbox" className="form-control" {...inputProps} ref="editor" />
        </label>
      </div>
    );
  }
};

module.exports = LabeledCheckbox;
