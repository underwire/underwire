const React = require('react');
const {Component} = React;
const LabeledInput = require('../labeledinput');
const LabeledSelect = require('../labeledselect');
const LabeledCodeEditor = require('./labeledcodeeditor');
const {
  Row,
  Col
} = require('react-bootstrap');

class RecipeSteps extends Component{
  render(){
    const stepTypes = [
      {
        id: 'script/javascript',
        caption: 'JavaScript'
      },
      {
        id: 'recipe',
        caption: 'Recipe'
      }
    ];
    const recipes = [
      {
        id: 0,
        caption: 'Another Recipe Name'
      },
    ];
    return(
      <div>
        <h3 className="control-label">{this.props.label}</h3>
        <LabeledSelect label="Type" items={stepTypes}/>
        <LabeledCodeEditor label="Script" />
        <LabeledSelect label="Type" items={stepTypes}/>
        <LabeledSelect label="Type" items={recipes}/>
        <button className="btn btn-default">Add</button>
      </div>
    );
  }
}

module.exports = RecipeSteps;
