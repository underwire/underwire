const fetcher = (state = {}, action)=>{
  const {
    storeName,
    error,
  } = action;
  switch(action.type){
    case('GOT_RECORDS'):
      return Object.assign(state, {
        [storeName]: {fetching: false}
      });
    case('FETCH_ERROR'):
      return Object.assign(state, {
        [storeName]: {fetching: false, error}
      });
    case('GETTING_RECORDS'):
      return Object.assign(state, {
        [storeName]: {fetching: true}
      });
    default:
      return state;
  }
};
module.exports = fetcher;
