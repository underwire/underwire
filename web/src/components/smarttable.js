const React = require('react');
const {
  Link,
} = require('react-router');
const {
  Button,
} = require('react-bootstrap');
const reToken = /\$\{([^}]+)\}/gi;

const replaceToken = (token, data)=>{
  const options = token.split('|');
  const key = options.find((key)=>typeof(data[key])!=='undefined');
  return key?data[key]:undefined;
};

class Row extends React.Component{
  getActionHandler(options){
    const {
      caption,
      settings,
      data,
    } = options;
    const id = caption;
    const isLink = (typeof(settings)==='string')||(!!settings.href);
    const extClass = settings.className||'default';
    if(isLink){
      const href = ((typeof(settings)==='string')?settings:settings.href).replace(reToken, (full, token)=>replaceToken(token, data));
      return <Link key={id} className={`btn btn-${extClass}`} to={href}>{caption}</Link>
    }
    const handler = typeof(settings)==='function'?settings:settings.handler;
    const clickHandler = (e)=>{
      e&&e.preventDefault();
      handler(data);
    };
    return <Button key={id} bsStyle={extClass} onClick={clickHandler}>{caption}</Button>;
  }

  render(){
    const data = this.props.data;
    const id = data.id;
    const cells = this.props.map.map((f, index)=><td key={index}>{f(data)}</td>);
    const actions = this.props.actions?(
        <td>
          {Object.keys(this.props.actions||{}).map((caption)=>this.getActionHandler({caption, settings: this.props.actions[caption], data}))}
        </td>
      ):null;
    return (
      <tr>
        {cells}
          {actions}
      </tr>
    );
  }
};

class SmartTable extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      data: props.data || props.rows || props.items || [],
    };
  }

  componentWillReceiveProps(newProps){
    if(newProps.data){
      return this.setState({data: newProps.data});
    }
    if(newProps.rows){
      return this.setState({data: newProps.rows});
    }
    if(newProps.items){
      return this.setState({data: newProps.items});
    }
  }

  render(){
    const {
      actions,
    } = this.props;
    const actionsCol = actions?<th key="actions">Actions</th>:null;
    const headings = (this.props.headers||[]).map((caption, index)=><th key={caption}>{caption}</th>).concat([actionsCol]);
    const rows = (this.state.data||[]).map((row, index)=><Row key={row.id||index} map={this.props.rowmap||[]} data={row} actions={actions} />);
    return (
        <table className="table">
          <thead>
            <tr>
              {headings}
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
          <tfoot>
            <tr>
              {headings}
            </tr>
          </tfoot>
        </table>
      );
  }
};

module.exports = {
  SmartTable,
  SmartRow: Row,
};
