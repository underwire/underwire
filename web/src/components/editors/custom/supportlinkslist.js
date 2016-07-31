const React = require('react');
const {Component} = React;
const LabeledInput = require('../labeledinput');
const {
  Row,
  Col
} = require('react-bootstrap');

class SupportLinksList extends Component{
  render(){
    return(
      <div>
        <h3 className="control-label">{this.props.label}</h3>
        <Row>
          <Col md={6}><LabeledInput label="Caption" value="Team Email" /></Col>
          <Col md={6}><LabeledInput label="Value" value="someteam@pearson.com"/></Col>
        </Row>
        <Row>
          <Col md={6}><LabeledInput label="Caption" value="Pager Duty Email" /></Col>
          <Col md={6}><LabeledInput label="Value" value="someteam@pearson.pagerduty.com"/></Col>
        </Row>
        <button className="btn btn-default">Add</button>
      </div>
    );
  }
}

module.exports = SupportLinksList;
