const React = require('react');
const {
  Component
} = React;
const {
  connect,
} = require('react-redux');
const LabeledSelect = require('../labeledselect');

class CodeReposSelectorEdit extends Component{
  getValue(){
    return this.refs.editor.getValue();
  }

  getEditor(){
    const repos = (this.props.repos||[]).map((repo)=>{
      return {
        id: repo.id,
        caption: repo.name,
      };
    });
    return <LabeledSelect {...this.props} ref='editor' multiple={true} items={repos} />;
  }

  render(){
    return this.getEditor();
  }
};

const mapStateToProps = (state, ownProps) => {
  return {
    repos: state.repos,
  };
};

const CodeReposSelector = connect(mapStateToProps, null, null, {withRef: true})(CodeReposSelectorEdit);

module.exports = CodeReposSelector;
