const React = require('react');
const ReactDOM = require('react-dom');
const {
  Component,
} = React;
const {
  connect,
} = require('react-redux');

const {
  removeDupes
} = require('../../lib/utils');

class CommaListEditor extends Component{
  constructor(props){
    super();
    this.state = {
      value: '',
      index: -1,
      selected: true
    };
  }

  handleClick(e){
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

  scrollIntoView(idx){
    const elem = this.items[idx];
    if(!elem){
      return;
    }
    const node = this.refs[elem.key];
    const panel = this.refs.searchResults;

    if (panel && node &&
      (node.offsetTop > panel.scrollTop + panel.offsetHeight || node.offsetTop < panel.scrollTop)) {
      panel.scrollTop = node.offsetTop - panel.offsetTop;
    }
  }

  selectItem(e){
    if(this.state.selected){
      return;
    }

    // Down arrow key pressed
    if(e.keyCode === 40 && this.state.index < this.items.length -1){
      this.setState({index: ++this.state.index});
      this.scrollIntoView(this.state.index);
      return e.preventDefault();
    }
    // Up arrow key pressed
    if(e.keyCode === 38 && this.state.index > 0){
      this.setState({index: --this.state.index});
      this.scrollIntoView(this.state.index);
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
      items = [],
      value = [],
      ...inputProps
    } = this.props;
    const showList = !!this.state.showList;
    const defaultValue = value.join(', ');
    const values = this.getValue().map((s)=>s.toLowerCase().replace('-', ' '));
    const val = values.length?values[values.length-1]:'';
    const itemsVal = this.items = showList && items.filter((item)=>{
      const itm = item.toLowerCase().replace('-', ' ');
      if(values.indexOf(itm) > -1){
        return false;
      }
      return itm.indexOf(val) > -1;
    }).map((item, index)=>{
      const className = this.state.index === index?'list-group-item active':'list-group-item';
      return <a ref={item} key={item} className={className} onClick={this.handleClick.bind(this)}>{item}</a>;
    });
    const searchResults = val.trim().length && !this.state.selected?(
      <div ref="searchResults" className="list-group typeahead">
        {itemsVal}
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

module.exports = CommaListEditor;
