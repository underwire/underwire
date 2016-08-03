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
  getNode(id){
    const nodes = this.props.nodes.filter((node)=>node.id===id);
    return nodes[0];
  }

  getEditForm(node, derivation){
    const {
      id = false,
    } = node;
    const action = id&&node?'Edit':'Create';
    const fields = [
      {
        caption: 'Name:',
        field: 'name',
        type: 'text',
        defaultValue: derivation.name || node.name || '',
        required: true,
      },
      {
        caption: 'Version:',
        field: 'version',
        type: 'text',
      },
      {
        caption: 'Shape:',
        field: 'shape',
        type: 'select',
        items: shapes,
        default: derivation.shape||'Process',
      },
      {
        caption: 'Tags:',
        field: 'tags',
        type: 'labeledtags',
        placeholder: 'Separate tags with ,'
      },
      {
        caption: 'Meta:',
        field: 'meta',
        type: 'labeledjsoneditor',
      },
    ];
    const hiddenFields = {
      derivation: derivation.id,
    };
    return (
      <div className="container">
        <SmartForm
          hidden={hiddenFields}
          fields={fields}
          data={node}
          title={`${action} Node`}
          ref="form"
          onUpdate={(data, callback)=>this.props.onSave(data, callback)}
          onInsert={(data, callback)=>this.props.onRegister(data, callback)}
          onSuccess={()=>this.context.router.push('/nodes')}
          />
      </div>
    );
  }

  render(){
    const id = this.props.id || false;
    const node = this.getNode(id);
    const {
      derivation = false,
    } = this.props;
    const derivationNode = derivation?this.getNode(derivation):{};
    if((derivation !== false) && (!derivationNode)){
      return <span>Loading...</span>;
    }
    return node||(id===false)?this.getEditForm(node||{}, derivationNode):<span>Loading...</span>;
  }
}

EditNode.contextTypes = {
  router: React.PropTypes.object,
};

const mapStateToProps = (state, ownProps) => {
  return {
    id: ownProps.params.id,
    nodes: state.nodes,
    derivation: ownProps.params.derivation,
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
