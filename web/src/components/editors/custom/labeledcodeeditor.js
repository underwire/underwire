const React = require('react');

const Codemirror = require('react-codemirror');
require('codemirror/mode/javascript/javascript');

class LabeledEditor extends React.Component{
  getValue(){
    return this.refs.editor.value;
  }

  render(){
    /*
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
    //*/
    const options = {
      lineNumbers: true,
      mode: 'javascript',
    };
    return (
      <div className="form-group">
        <label className="control-label">{this.props.label}</label>
        <Codemirror options={options} />
      </div>
    );
  }
};

module.exports = LabeledEditor;
