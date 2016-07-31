const React = require('react');
const {
  Component,
} = React;

class FormErrors extends Component{
  componentDidMount(){
    document.body.scrollTop = this.refs.errors.scrollTop;
  }

  componentWillReceiveProps(){
    document.body.scrollTop = this.refs.errors.scrollTop;
  }

  render(){
    const {
      errors
    } = this.props;
    const errorMessages = errors.map((error, index)=><p key={index}>{error}</p>);
    return (
      <div className="form-errors bg-danger" ref="errors">
        {errorMessages}
      </div>
    );
  }
};

module.exports = {
  FormErrors,
};
