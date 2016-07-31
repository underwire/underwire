const React = require('react');
const {
  Component
} = React;

class Checkbox extends Component{
  getValue(){
    return this.refs.editor.checked;
  }

  onClick(e){
    if(this.props.onClick){
      this.props.onClick(e, this.refs.editor);
    }
  }

  render(){
    const {
      checked,
      children,
      ...props
    } = this.props;
    return(
      <label>
        <input {...props} type="checkbox" defaultChecked={checked} ref="editor" onClick={this.onClick.bind(this)} />
        {children}
      </label>
    );
  }
};

module.exports = Checkbox;
