const React = require('react');
const ReactDOM = require('react-dom');
const {
  Component,
} = React;
const {
  connect,
} = require('react-redux');

const removeDupes = (elem, index, arr)=>arr.indexOf(elem)===index;

class Tags extends Component{
  constructor(props){
    super();
    this.state = {
      value: '',
      index: -1,
      selected: true
    };
  }

  handleClick(e){
    //console.log(e);
    //e.preventDefault();
    this.addTag(e.target.innerHTML);
    return this.refs.editor.focus();
  }

  addTag(tag){
    const values = this.getValue();
    values.pop();
    values.push(tag);
    this.refs.editor.value = values.filter((s)=>!!s.trim()).filter(removeDupes).join(', ')+', ';
    return this.setState({selected: true, index: 0});
  }

  handleChange(e){
    this.setState({selected: false, index: 0});
  }

  selectItem(e){
    if(this.state.selected){
      return;
    }

    // Down arrow key pressed
    if(e.keyCode === 40 && this.state.index < this.items.length -1){
      this.setState({index: ++this.state.index});
      return e.preventDefault();
    }
    // Up arrow key pressed
    if(e.keyCode === 38 && this.state.index > 0){
      this.setState({index: --this.state.index});
      return e.preventDefault();
    }
    // Enter pressed
    if(e.keyCode === 13){
      this.addTag(this.items[this.state.index].key);
      return e.preventDefault();
    }
  }

  handleFocus(e){
    this.setState({selected: false, showList: true});
  }

  componentWillReceiveProps(props){
    this.setState({index: -1, selected: true});
  }

  getValue(){
    if(!this.refs.editor){
      return [];
    }
    const val = this.refs.editor.value;
    return val.split(',').filter((s)=>!!s.trim()).map((s)=>s.trim().toLowerCase());
  }

  removeFocus(e){
    setTimeout(()=>{
      if(this.refs.editor && document.activeElement !== ReactDOM.findDOMNode(this.refs.editor)){
        this.setState({showList: false});
      }
    }, 100);
  }

  render(){
    const {
      tags = [],
      value = [],
      ...inputProps
    } = this.props;
    const showList = !!this.state.showList;
    const defaultValue = value.join(', ');
    const values = this.getValue().map((s)=>s.toLowerCase().replace('-', ' '));
    const val = values.length?values[values.length-1]:'';
    const items = this.items = showList && tags.filter((item)=>{
      const itm = item.toLowerCase().replace('-', ' ');
      if(values.indexOf(itm) > -1){
        return false;
      }
      return itm.indexOf(val) > -1;
    }).slice(0, 10).map((item, index)=>{
      const className = this.state.index === index?'list-group-item active':'list-group-item';
      return <a key={item} className={className} onClick={this.handleClick.bind(this)}>{item}</a>;
    });
    const searchResults = val.trim().length && !this.state.selected?(
      <div className="list-group typeahead">
        {items}
      </div>
    ):<div className="list-group typeahead" />;
    return (
      <div className="field-group">
        <input
          type="text"
          className="form-control"
          {...inputProps}
          defaultValue={defaultValue}
          onChange={this.handleChange.bind(this)}
          onKeyDown={this.selectItem.bind(this)}
          onFocus={this.handleFocus.bind(this)}
          onBlur={this.removeFocus.bind(this)}
          ref="editor" />
        {searchResults}
      </div>
    );
  }
};

const mapStateToProps = (state, ownProps) => {
  const {
    nodes = [],
    edges = [],
  } = state;
  const tags = ownProps.tags || [].concat(...nodes.map((node)=>node.tags||[])).concat(...edges.map((edge)=>edge.tags||[])).map((s)=>s.toLowerCase()).filter(removeDupes);
  return {
    value: ownProps.value,
    onSelected: ownProps.onSelected,
    tags,
  };
};

module.exports = connect(mapStateToProps, null, null, {withRef: true})(Tags);
