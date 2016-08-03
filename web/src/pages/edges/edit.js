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
const NodeSelect = require('../../components/editors').NodeSelect;

const drawIgnores = [
  "drawLine", "drawRect", "drawRoundRect", "drawEllipse", "drawArc", "drawHorizontalConnection", "drawVerticalConnection", "drawConnectorEndpoint", "drawConnection"
];
const shapes = Object.keys(ProcessCanvas)
    .filter((key)=>/^draw/.exec(key)&&drawIgnores.indexOf(key)===-1)
    .map((key)=>key.replace(/^draw/, ''));

class EditEdge extends Component{
  getEditForm(edge){
    const {
      id = false,
    } = edge;
    const nodes = this.props.nodes.map((node)=>{
      return {
        id: node.id,
        caption: node.name,
      };
    });
    const action = id&&edge?'Edit':'Create';
    const fields = [
      {
        caption: 'From:',
        field: 'from',
        type: 'labelednodeselect',
      },
      {
        caption: 'To:',
        field: 'to',
        type: 'labelednodeselect',
      },
      {
        caption: 'Tags:',
        field: 'tags',
        type: 'labeledtags',
        placeholder: 'Separate tags with ,'
      },
    ];
    return (
      <div className="container">
        <SmartForm
          fields={fields}
          data={edge}
          title={`${action} Edge`}
          ref="form"
          onUpdate={(data, callback)=>this.props.onSave(data, callback)}
          onInsert={(data, callback)=>this.props.onRegister(data, callback)}
          onSuccess={()=>this.context.router.push('/edges')}
          />
      </div>
    );
  }

  render(){
    const id = this.props.id || false;
    const edges = this.props.edges.filter((edge)=>edge.id===id);
    const edge = edges.shift();
    return edge||(id===false)?this.getEditForm(edge||{}):<span>Loading...</span>;
  }
}

EditEdge.contextTypes = {
  router: React.PropTypes.object,
};

const mapStateToProps = (state, ownProps) => {
  return {
    id: ownProps.params.id,
    edges: state.edges,
    nodes: state.nodes,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onSave(edge, callback){
      updateRecord({
        endpoint: 'graph/edge',
        id: edge.id,
        data: edge,
      }, callback);
    },

    onRegister(edge, callback){
      insertRecord({
        endpoint: 'graph/edges',
        data: edge,
      }, callback);
    },
  };
};

module.exports = connect(mapStateToProps, mapDispatchToProps)(EditEdge);
