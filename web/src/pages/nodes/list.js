const builder = require('../../components/pages/listing');
const {
  processShapes,
  properCase
} = require('../../lib/utils');

const getShape = (from)=>{
  const fromLower = (from||'process').toLowerCase();
  const matches = processShapes.filter((item)=>item.id === fromLower);
  return matches[0]?matches[0].caption:'Process';
};

module.exports = builder({
  store: 'nodes',
  title: 'Nodes',
  headers: [
      'Name',
      'Version',
      'Type',
      'Tags',
    ],
  rowmap: [
      (row)=>row.name,
      (row)=>row.version,
      (row)=>getShape(row.shape),
      (row)=>(row.tags||[]).map(properCase).join(', '),
    ],
  actions:{
      View: '/nodes/${id}',
      Edit:{
        href: '/nodes/${id}/edit',
        className: 'warning'
      },
      /*
      'New Version':{
        href: '/nodes/new/${derivation|id}',
        className: 'primary'
      },
      */
    },
});
