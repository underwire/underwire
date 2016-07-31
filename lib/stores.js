/*
Stores Interface:
  get|collection(name, callback)
    -> Store | callback(err, Store)

Store Interface:
  list|asArray(options, callback)
    ->callback(err, recordsResponse)
  find(criteria, callback)
    ->callback(err, recordsResponse)
  get(id, callback)
    ->callback(err, recordResponse)
  insert(record, callback)
    ->callback(err, recordResponse)
  ensure(record, callback)
    ->callback(err, recordResponse)
  update(id, record, callback)
    ->callback(err, recordResponse)
  upsert(key, record, callback)
    ->callback(err, recordResponse)
  delete(id, callback)
    ->callback(err, deletedBool)

  RecordsResponse = {
    root: 'key',
    'key': [Record],
    length: Number,
    count: Number,
    offset: Number
  }

  RecordResponse = {
    root: 'key',
    'key': {Object}
  }
*/

const npm = require('npm');
const fileconfig = require('./fileconfig');
const logger = require('./logger');
const EventEmitter = require('events').EventEmitter;
const util = require('util');
const LazyEvents = require('./lazyevents').LazyEvents;

const Store = function(Base, storeName){
  this._storeName = storeName;
  this._Base = Base;
  this._provider = new Base(storeName);
};

const _providerDo = function(store, method, aliasFor, Store, args){
  if(!store._provider){
    return setImmediate(function(){
      return _providerDo(store, method, Store, args);
    }.bind(store));
  }
  if(store._Base.prototype[method]){
    return store._Base.prototype[method].apply(store._provider, args);
  }
  if(store._Base.prototype[aliasFor]){
    return store._Base.prototype[aliasFor].apply(store._provider, args);
  }
  const e = new Error(aliasFor?
      `Method ${method} or ${aliasFor} not supported by provider ${store._provider.constructor.name}`:
      `Method ${method} not supported by provider ${store._provider.constructor.name}`
    );
  e.interface = store._provider;
  logger.error(e);
  throw e;
};

const wrap = function(source, method, aliasFor){
  return source.prototype[method] = function(...args){
    _providerDo(this, method, aliasFor, source, args);
  };
};

wrap(Store, 'list', 'asArray');
wrap(Store, 'asArray', 'list');
wrap(Store, 'get');
wrap(Store, 'insert');
wrap(Store, 'ensure');
wrap(Store, 'update');
wrap(Store, 'upsert');
wrap(Store, 'delete');
wrap(Store, 'find');

const setup = ()=>{
  const config = fileconfig.get('DB', {});
  const {
    provider = '',
    ...providerConfig
  } = config;
  if(!provider){
    return logger.error(`No DB.provider specified in configuration file ${fileconfig.configFileName()}`);
  }
  try{
    const Provider = require(provider);
    try{
      stores.init(Provider, providerConfig);
    }catch(e){
      logger.error(e);
      return e;
    }
  }catch(e){
    logger.error(e);
    logger.info('Attempting NPM Install');
    npm.load({
      loaded: false
    }, function(err){
      if(err){
        stores.emit('error', err);
        logger.error(err);
        process.exit(1);
      }

      npm.commands.install([provider], function(err, data){
        if(err){
          stores.emit('error', err)
          logger.error(err);
          process.exit(1);
        }

        logger.info(provider+' installed');
        const Provider = require('provider');
        try{
          stores.init(Provider, config);
        }catch(e){
          logger.error(e);
          return e;
        }
      });

      npm.on('log', function(message){
        logger.info(message);
      });
    });
  }
};

class Stores extends LazyEvents{
  constructor(){
    super();
    this.cache = {};
    fileconfig.on('ready', setup);
  }

  init(base, config){
    const Store = base.Store || base;
    if(base.init){
      base.init(config);
    }
    this._Store = Store;
    this.ready = function(callback){
      callback(this);
    };
    this.emit('ready', this);
  }

  ready(callback){
    this.on('ready', callback);
  }

  get(storeName, callback){
    let {
      cache
    } = this;
    if(!this._Store){
      return setImmediate(function(){
        this.get(storeName, callback);
      }.bind(this));
    }
    let store = cache[storeName];
    if(!store){
      store = cache[storeName] = new Store(this._Store, storeName);
    }
    if(typeof(callback)==='function'){
      return callback(null, store);
    }
    return store;
  }

  collection(collectionName, callback){
    return this.get(collectionName, callback);
  }
};

var stores = new Stores();

module.exports = stores;
