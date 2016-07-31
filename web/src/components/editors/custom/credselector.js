const React = require('react');
const {
  Component
} = React;
const {
  connect,
} = require('react-redux');
const LabeledSelect = require('../labeledselect');

class CredsSelectorEdit extends Component{
  getValue(){
    return this.refs.editor.getValue();
  }

  getEditor(){
    const creds = (this.props.creds||[]).map((cred)=>{
      return {
        id: cred.id,
        caption: cred.name,
      };
    });
    const noCreds = {
      id: '',
      caption: '[none]'
    };
    return <LabeledSelect {...this.props} ref='editor' items={[noCreds, ...creds]} />
  }

  render(){
    return this.getEditor();
  }
};

const mapCredsSelectorStateToProps = (state, ownProps) => {
  return {
    creds: state.credentials,
  };
};

const CredsSelector = connect(mapCredsSelectorStateToProps, null, null, {withRef: true})(CredsSelectorEdit);

module.exports = CredsSelector;
