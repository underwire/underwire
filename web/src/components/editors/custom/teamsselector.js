const React = require('react');
const {
  Component
} = React;
const {
  connect,
} = require('react-redux');
const LabeledSelect = require('../labeledselect');

class TeamsSelectorEdit extends Component{
  getValue(){
    return this.refs.editor.getValue();
  }

  getEditor(){
    const teams = (this.props.teams||[]).map((team)=>{
      return {
        id: team.id,
        caption: team.name,
      };
    });
    return <LabeledSelect {...this.props} ref='editor' multiple={true} items={teams} />;
  }

  render(){
    return this.getEditor();
  }
};

const mapStateToProps = (state, ownProps) => {
  return {
    teams: state.teams,
  };
};

const TeamsSelector = connect(mapStateToProps, null, null, {withRef: true})(TeamsSelectorEdit);

module.exports = TeamsSelector;
