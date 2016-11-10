const React = require('react');
const ReactDOM = require('react-dom');
const {
  Component,
} = React;
const {
  connect,
} = require('react-redux');

const CommaListEditor = require('./commalist');

const {
  removeDupes
} = require('../../lib/utils');

const mapStateToProps = (state, ownProps) => {
  const {
    nodes = [],
    edges = [],
  } = state;
  const items = (ownProps.tags || [])
          .concat(...nodes.map((node)=>node.tags||[]))
          .concat(...edges.map((edge)=>edge.tags||[]))
          .map((s)=>s.toLowerCase()).filter(removeDupes);
  return {
    value: ownProps.value,
    onSelected: ownProps.onSelected,
    items,
  };
};

module.exports = connect(mapStateToProps, null, null, {withRef: true})(CommaListEditor);
