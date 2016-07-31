const React = require('react');
const {
  FormControls,
} = require('react-bootstrap');

module.exports = React.createClass({
  render(){
    const hasValue = Array.isArray(this.props.value)?this.props.value.length>0:!!this.props.value;
    if(this.props.hideIfNone && (!hasValue)){
      return <div />;
    }
    return(
      <div><FormControls.Static label={this.props.label} labelClassName="col-xs-2" wrapperClassName="col-xs-10">{this.props.value}</FormControls.Static></div>
    );
  }
});
