const React = require('react');
const {
  Component
} = React;
const {
  connect,
} = require('react-redux');
const store = require('../../reducers');
const {
  SmartForm
} = require('../../components/smartform');
const {
  insertRecord,
  updateRecord,
} = require('../../lib/api');
const {
  ProcessCanvas,
} = require('../../vendor/processcanvas/processCanvas');

const drawIgnores = [
  "drawLine", "drawRect", "drawRoundRect", "drawEllipse", "drawArc", "drawHorizontalConnection", "drawVerticalConnection", "drawConnectorEndpoint", "drawConnection"
];
const shapes = Object.keys(ProcessCanvas)
    .filter((key)=>/^draw/.exec(key)&&drawIgnores.indexOf(key)===-1)
    .map((key)=>key.replace(/^draw/, ''));

class EditNode extends Component{
  getEditForm(user){
    const {
      id = false,
    } = user;
    const action = id&&user?'Edit':'Create';
    const fields = [
      {
        caption: 'Name:',
        field: 'name',
        type: 'text',
        required: true,
      },
      {
        caption: 'Shape:',
        field: 'shape',
        type: 'select',
        items: shapes,
        default: 'Process',
      },
    ];
    return (
      <SmartForm
        fields={fields}
        data={user}
        title={`${action} Node`}
        ref="form"
        onUpdate={(data, callback)=>this.props.onSave(data, callback)}
        onInsert={(data, callback)=>this.props.onRegister(data, callback)}
        onSuccess={()=>this.context.router.push('/nodes')}
        />
    );
  }

  render(){
    const id = this.props.id || false;
    const nodes = this.props.nodes.filter((node)=>node.id===id);
    const node = nodes.shift();
    return node||(id===false)?this.getEditForm(node||{}):<span>Loading...</span>;
  }
}

EditNode.contextTypes = {
  router: React.PropTypes.object,
};

const mapStateToProps = (state, ownProps) => {
  return {
    id: ownProps.params.id,
    nodes: state.nodes,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onSave(node, callback){
      updateRecord({
        endpoint: 'graph/node',
        id: node.id,
        data: node,
      }, callback);
    },

    onRegister(node, callback){
      insertRecord({
        endpoint: 'graph/nodes',
        data: node,
      }, callback);
    },
  };
};

module.exports = connect(mapStateToProps, mapDispatchToProps)(EditNode);
