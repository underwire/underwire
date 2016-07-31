const React = require('react');
class LabeledDatePicker extends React.Component{
  getValue(){
    return new Date(Date.parse(this.refs.editor.value));
  }

  render(){
    const inputProps = Object.keys(this.props).reduce((obj, key)=>{
      if(key === 'label'){
        return obj;
      }
      if(key === 'value'){
        obj.defaultValue = this.props.value?new Date(Date.parse(this.props.value)):this.props.value;
        if(obj.defaultValue){
          obj.defaultValue = obj.defaultValue.toISOString().substring(0, 10);
        }
        return obj;
      }
      obj[key] = this.props[key];
      return obj;
    }, {});
    return (
      <div className="form-group">
        <label className="control-label">{this.props.label}</label>
        <input type="date" className="form-control" {...inputProps} ref="editor" />
      </div>
    );
  }
};

module.exports = LabeledDatePicker;
