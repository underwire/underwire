const {
  createStore,
  combineReducers,
  compose,
  applyMiddleware,
} = require('redux');
const {
  default: thunkMiddleware,
} = require('redux-thunk');

const builder = require('./builder');
const nodes = builder('nodes');
const edges = builder('edges');

const fetcher = require('./fetcher');
const appData = combineReducers({
  nodes,
  edges,
  fetcher,
});

const store = createStore(
  appData,
  window.initialState?window.initialState:undefined,
  window.devToolsExtension ? window.devToolsExtension() : f => f,
  applyMiddleware(
    thunkMiddleware,
  ),
);

module.exports = store;
