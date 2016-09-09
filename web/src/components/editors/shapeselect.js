const React = require('react');
const Select = require('./select');
const {
  ProcessCanvas,
} = require('../../vendor/processcanvas/processCanvas');

const drawIgnores = [
  "drawLine", "drawRect", "drawRoundRect", "drawEllipse", "drawArc", "drawHorizontalConnection", "drawVerticalConnection", "drawConnectorEndpoint", "drawConnection"
];

const shapes = Object.keys(ProcessCanvas)
    .filter((key)=>/^draw/.exec(key)&&drawIgnores.indexOf(key)===-1)
    .map((key)=>{
      const shape = key.replace(/^draw/, '');
      return {
        id: shape.toLowerCase(),
        caption: shape,
      };
    });

class ShapeSelect extends React.Component{
  getValue(){
    return this.refs.editor.getValue();
  }

  render(){
    return (
      <Select
        ref="editor"
        items={shapes}
        value={this.props.value.toLowerCase()}
        {...this.props}
        />
    );
  }
}

module.exports = ShapeSelect;
