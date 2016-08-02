const React = require('react');
const {
  Component,
} = React;
const Editors = require('./editors');
const {
  LabeledItem,
} = require('../labeledlist');
const {
  getObjectValue,
  setObjectValue,
  isTrue,
  getJoiErrorText,
} = require('../../lib/utils');
const {
  FormErrors,
} = require('./formerrors');

const valueFrom = (getValue, ref)=>{
  if(ref.getWrappedInstance && ref.refs.wrappedInstance){
    return ref.getWrappedInstance().getValue();
  }
  return typeof(getValue)==='function'?getValue(ref):ref.getValue();
};

class SmartForm extends React.Component{
  constructor(params){
    super(params);
    this.state = {errors: false};
  }

  getFieldReference(fieldName){
    const ref = fieldName.replace(/[^\w]+/g, '_');
    return ref;
  }

  getEditors(fields, data){
    return fields.map((info)=>{
      const {
        field,
        type,
        caption,
        show=true,
        display,
        render,
        store,
        default: defaultValue,
        ...otherFields,
      } = info;
      if(!show){
        return false;
      }
      const required = !!info.required;
      const value = (()=>{
        try{
          return typeof(display)==='function'?display(getObjectValue(data, field, defaultValue)):getObjectValue(data, field, defaultValue);
        }catch(e){
          console.error(field, defaultValue, info);
          console.error(e);
          return defaultValue;
        }
      })();
      const ref = this.getFieldReference(field);
      const other = Object.keys(otherFields).reduce((other, key)=>{
        if(key === 'onChange'){
          const handler = otherFields[key];
          other[key] = (e)=>{
            const fieldRef = this.refs[ref];
            return handler(e, fieldRef);
          };
          return other;
        }
        other[key] = otherFields[key];
        return other;
      }, {});
      if(type === 'custom'){
        return render(ref, ref, value);
      }
      const editor = Editors.get(type);
      if(editor){
        return editor.render(Object.assign({
          field,
          type,
          caption,
          display,
          render,
          store,
          value,
        }, other, {ref, key: ref}));
      }
      return <div key={ref}>Unknown editor type {type} for {field}</div>;
    }).filter((editor)=>editor!==false);
  }

  getFormData(fields){
    const {
      id = false
    } = this.props.data || {};
    return (fields||this.props.fields).reduce((obj, info)=>{
      const {
        field,
        type,
        caption,
        display,
        store,
        as=false,
        getValue=false,
        default: defaultValue,
        ...other
      } = info;
      const required = !!info.required;
      const ref = this.refs[this.getFieldReference(field)];
      const rawValue = valueFrom(getValue, ref);
      if(((rawValue==='')||
          (rawValue===null)||
          (rawValue===NaN)||
          ((Object.prototype.toString.call(rawValue) === '[object Date]') && (isNaN(rawValue.getTime())))||
          (rawValue===void 0))&&
        (!isTrue(this.props.includeEmpty))){
        return obj;
      }
      const value = store?store(rawValue):rawValue;
      return setObjectValue(obj, as||field, value);
    }, {id});
  }

  handleDone(err, response){
    if(err){
      return this.setState({errors: err});
    }
    if(response&&response.data&&response.data.isJoi){
      return this.setState({errors: getJoiErrorText(response.data)})
    }
    if(this.props.onSuccess){
      this.props.onSuccess(response);
    }
  }

  handleSubmit(e){
    e&&e.preventDefault();
    const data = (()=>{
      try{
        return this.getFormData();
      }catch(e){
        const err = e.toString();
        this.setState({errors: [err]});
        return e;
      }
    })();
    if(data instanceof Error){
      return;
    }
    const {
      id = false,
    } = data;
    if(this.props.onSubmit){
      this.props.onSubmit(data);
    }
    if((id !== false) && this.props.onUpdate){
      return this.props.onUpdate(data, this.handleDone.bind(this));
    }
    if((id === false) && this.props.onInsert){
      return this.props.onInsert(data, this.handleDone.bind(this));
    }
  }

  componentWillReceiveProps(newProps){
    if(newProps.errors){
      return this.setState({errors: newProps.errors});
    }
  }

  render(){
    const {
      children,
      data,
      fields,
    } = this.props;
    const title = this.props.title || (data.id?'Edit':'New');
    const {
      errors = propErrors,
    } = this.state;
    const editors = this.getEditors(fields, data);
    const submitErrors = errors?<FormErrors errors={errors} />:'';
    return (
      <div>
        {submitErrors}
        <form onSubmit={this.handleSubmit.bind(this)}>
          <h1>{title}</h1>
          <div className="form-group">
            {editors}
          </div>
          {children}
          <input type="submit" className="btn btn-primary" value="Save" />
        </form>
      </div>
    );
  }
};

module.exports = SmartForm;
