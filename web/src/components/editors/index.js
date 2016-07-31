const React = require('react');
const Editors = require('../smartform/editors');

const LabeledInput = require('./labeledinput');
const LabeledTextarea = require('./labeledtextarea');
const LabeledDatePicker = require('./labeleddatepicker');
const Select = require('./select');
const LabeledSelect = require('./labeledselect');
const LabeledCheckbox = require('./labeledcheckbox');
const Checkbox = require('./checkbox');
const TeamsSelector = require('./custom/teamsselector');
const CredSelector = require('./custom/credselector');
const CodeReposSelector = require('./custom/codereposselector');
const SupportLinksList = require('./custom/supportlinkslist');
const RecipeSteps = require('./custom/recipesteps');

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
  type: 'teams',
  render(options){
    const {
      caption,
      field,
      ...other
    } = options;
    return <TeamsSelector label={caption || `${field}:`} {...other} />
  },
});

Editors.register({
  type: 'credentials',
  render(options){
    const {
      caption,
      field,
      ...other
    } = options;
    return <CredSelector label={caption || `${field}:`} {...other} />
  },
});

Editors.register({
  type: 'coderepos',
  render(options){
    const {
      caption,
      field,
      ...other
    } = options;
    return <CodeReposSelector label={caption || `${field}:`} {...other} />
  },
});

Editors.register({
  type: 'supportLinksList',
  render(options){
    const {
      caption,
      field,
      ...other
    } = options;
    return <SupportLinksList label={caption || `${field}:`} {...other} />
  }
});

Editors.register({
  type: 'recipesteps',
  render(options){
    const {
      caption,
      field,
      ...other
    } = options;
    return <RecipeSteps label={caption || `${field}:`} {...other} />
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
  TeamsSelector,
  CredSelector,
  CodeReposSelector,
  SupportLinksList,
  NodeSelect: require('./nodeselect'),
};
