const builder = require('../../components/pages/listing');
const store = require('../../reducers');

const properCase = (str)=>str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});

const lookupNode = (id)=>{
  const nodes = store.getState().nodes;
  const node = nodes.find((node)=>node.id === id);
  return node || {name: '[Unknown]'};
};

module.exports = builder({
  store: 'edges',
  title: 'Edges',
  headers: [
      'From',
      'To',
    ],
  rowmap: [
      (row)=>lookupNode(row.from).name,
      (row)=>lookupNode(row.to).name,
    ],
  actions:{
      View: '/edges/${id}',
      Edit:{
        href: '/edges/${id}/edit',
        className: 'warning'
      },
    },
});
