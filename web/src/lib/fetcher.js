const fetch = require('isomorphic-fetch');
const store = require('../reducers');

const fetcher = (storeName, uri = '')=>{
  const {
    fetching = false
  } = store.getState()[storeName] || {};
  const dispatch = store.dispatch;
  if(fetching){
    return Promise.resolve();
  }
  fetch(uri || `/api/${storeName.toLowerCase()}`)
    .then((response)=>{
      if(response.status >= 400){
        return dispatch({type: 'FETCH_ERROR', error: response});
      }
      return response.json();
    })
    .then((json)=>{
      dispatch({type: 'GOT_RECORDS', storeName});
      return dispatch({type: `ADD_${storeName.toUpperCase()}`, items: json[json.root]});
    })
    .catch((error)=>{
      return dispatch({type: 'FETCH_ERROR', error});
    });
  return dispatch({
    type: 'GETTING_RECORDS',
    storeName
  });
};

module.exports = fetcher;
