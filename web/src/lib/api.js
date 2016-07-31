const fetch = require('isomorphic-fetch');

const insertRecord = (options, callback)=>{
  const endpoint = options.endpoint;
  const raw = options.data;
  const id = raw.id;
  const item = Object.keys(raw).reduce((obj, key)=>{
    if(key !== 'id'){
      obj[key] = raw[key];
    }
    return obj;
  }, {});
  fetch(`/api/${endpoint}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(item)
  })
  .then((response)=>{
    if(response.status >= 400){
      return (callback||noop)(new Error('Bad response from server'));
    }
    return response.json();
  })
  .then((item)=>{
    setImmediate(()=>(callback||noop)(null, item));
  });
};

const updateRecord = (options, callback)=>{
  const endpoint = options.endpoint;
  const raw = options.data;
  const id = raw.id;
  const item = Object.keys(raw).reduce((obj, key)=>{
    if(key !== 'id'){
      obj[key] = raw[key];
    }
    return obj;
  }, {});
  fetch(`/api/${endpoint}/${id}`, {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(item)
  })
  .then((response)=>{
    if(response.status >= 400){
      return (callback||noop)(new Error('Bad response from server'));
    }
    return response.json();
  })
  .then((item)=>{
    setImmediate(()=>(callback||noop)(null, item));
  });
};

module.exports = {
  insertRecord,
  updateRecord,
};
