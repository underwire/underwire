const builder = require('../../components/pages/listing');
const store = require('../../reducers');

const properCase = (str)=>str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});

const lookupNode = (id)=>{
  const nodes = store.getState().nodes;
  const node = nodes.find((node)=>node.id === id);
  const caption = node&&node.version?`${node.name} (v${node.version})`:node.name||'[Unknown]';
  return Object.assign({}, node || {name: '[Unknown]'}, {caption});
};

module.exports = builder({
  store: 'edges',
  title: 'Edges',
  headers: [
      'From',
      'To',
      'Tags',
    ],
  rowmap: [
      (row)=>lookupNode(row.from).caption,
      (row)=>lookupNode(row.to).caption,
      (row)=>(row.tags||[]).map(properCase).join(', '),
    ],
  actions:{
      View: '/edges/${id}',
      Edit:{
        href: '/edges/${id}/edit',
        className: 'warning'
      },
    },
});
