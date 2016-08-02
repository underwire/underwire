const builder = require('../../components/pages/listing');

const properCase = (str)=>str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});

module.exports = builder({
  store: 'nodes',
  title: 'Nodes',
  headers: [
      'Name',
      'Type',
      'Tags',
    ],
  rowmap: [
      (row)=>row.name,
      (row)=>properCase(row.shape || 'process'),
      (row)=>(row.tags||[]).map(properCase).join(', '),
    ],
  actions:{
      View: '/nodes/${id}',
      Edit:{
        href: '/nodes/${id}/edit',
        className: 'warning'
      },
    },
});
