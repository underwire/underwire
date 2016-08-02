const React = require('react');
const Editors = require('../smartform/editors');

const LabeledInput = require('./labeledinput');
const LabeledTextarea = require('./labeledtextarea');
const LabeledDatePicker = require('./labeleddatepicker');
const Select = require('./select');
const LabeledSelect = require('./labeledselect');
const LabeledCheckbox = require('./labeledcheckbox');
const Checkbox = require('./checkbox');

const NodeSelect = require('./nodeselect');
const LabeledNodeSelect = require('./labelednodeselect');

const Tags = require('./tags');
const LabeledTags = require('./labeledtags');

const LabeledCodeEditor = require('./labeledcodeeditor');
const LabeledJSONEditor = require('./labeledjsoneditor');

Editors.register({
  type: 'checkbox',
  render(options){
    const {
      ref,
      key,
      caption,
      value,
      required,
      field,
      ...other
    } = options;
    return <LabeledCheckbox key={ref} label={caption || `${field}:`} value={value} ref={ref} required={required} {...other} />;
  },
});

Editors.register({
  type: 'select',
  render(options){
    const {
      ref,
      key,
      caption,
      value,
      required,
      field,
      ...other
    } = options;
    return <LabeledSelect key={ref} label={caption || `${field}:`} value={value} ref={ref} required={required} {...other} />;
  },
});

Editors.register({
  type: 'textarea',
  render(options){
    const {
      ref,
      key,
      caption,
      value,
      required,
      field,
      ...other
    } = options;
    return <LabeledTextarea key={ref} label={caption || `${field}:`} value={value} ref={ref} required={required} {...other} />;
  },
});

Editors.register({
  types: ['text', 'number', 'password', 'date'],
  render(options){
    const {
      ref,
      key,
      caption,
      value,
      required,
      field,
      ...other
    } = options;
    return <LabeledInput key={ref} label={caption || `${field}:`} value={value} ref={ref} required={required} {...other} />
  },
});

Editors.register({
  type: 'nodeselect',
  render(options){
    const {
      caption,
      field,
      ...other
    } = options;
    return <NodeSelect label={caption || `${field}:`} {...other} />
  }
});

Editors.register({
  type: 'labelednodeselect',
  render(options){
    const {
      caption,
      field,
      ...other
    } = options;
    return <LabeledNodeSelect label={caption || `${field}:`} {...other} />
  }
});

Editors.register({
  type: 'tags',
  render(options){
    const {
      caption,
      field,
      ...other
    } = options;
    return <Tags label={caption || `${field}:`} {...other} />
  }
});

Editors.register({
  type: 'labeledtags',
  render(options){
    const {
      caption,
      field,
      ...other
    } = options;
    return <LabeledTags label={caption || `${field}:`} {...other} />
  }
});

Editors.register({
  type: 'labeledcodeeditor',
  render(options){
    return <LabeledCodeEditor {...options} />;
  }
});

Editors.register({
  type: 'labeledjsoneditor',
  render(options){
    return <LabeledJSONEditor {...options} />;
  }
});

module.exports = {
  LabeledInput,
  LabeledTextarea,
  LabeledDatePicker,
  Select,
  LabeledSelect,
  LabeledCheckbox,
  Checkbox,
  LabeledNodeSelect,
  NodeSelect,
};
