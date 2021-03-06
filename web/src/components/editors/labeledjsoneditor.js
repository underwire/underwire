const React = require('react');

const Codemirror = require('react-codemirror');
require('codemirror/mode/javascript/javascript');

class LabeledJSONEditor extends React.Component{
  constructor(props){
    super();
    this.state = {value: props.value};
  }

  getValue(){
    const src = this.refs.editor.getCodeMirror().doc.getValue();
    this.setState({value: src});
    const f = new Function('', 'return '+src);
    const v = f();
    return v;
  }

  componentWillReceiveProps(props){
    if(props.value){
      this.setState({value: props.value});
    }
  }

  render(){
    const options = {
      lineNumbers: true,
      mode: 'javascript',
    };
    const value = this.state.value?
      ((typeof(this.state.value)==='string')?this.state.value:JSON.stringify(this.state.value, null, '  '))
      :'{\n  // JSON payload here.\n}'
    const error = (()=>{
      try{
        const f = new Function('', 'return '+value);
        const v = f();
        return '';
      }catch(e){
        return <div className="form-errors bg-danger" ref="errors">{e.toString()}</div>;
      }
    })();
    return (
      <div className="form-group">
        <label className="control-label">{this.props.caption}</label>
        {error}
        <Codemirror ref="editor" options={options} value={value} autoSave={true} />
      </div>
    );
  }
};

module.exports = LabeledJSONEditor;
