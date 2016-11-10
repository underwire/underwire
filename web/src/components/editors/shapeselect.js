const React = require('react');
const Select = require('./select');
const {
  processShapes,
} = require('../../lib/utils');

class ShapeSelect extends React.Component{
  getValue(){
    return this.refs.editor.getValue();
  }

  render(){
    return (
      <Select
        {...this.props}
        ref="editor"
        items={processShapes}
        value={this.props.value.toLowerCase()}
        />
    );
  }
}

module.exports = ShapeSelect;
