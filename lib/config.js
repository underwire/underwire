'use strict';

const args = require('./cmdargs').args;
const {
  extend,
  valueFromObjectCI,
  setObjectValueCI,
} = require('./utils');
const stores = require('./stores');
const fileconfig = require('./fileconfig');
const LazyEvents = require('./lazyevents').LazyEvents;
const logger = require('./logger');
const ENV = require('./env').ENV;
const noop = require('./utils').noop;

class Config extends LazyEvents{
  constructor(options){
    super();
    const {
      args = {},
      config = {},
    } = options;
    this.args = args;
    this.baseConfig = config;
    this.config = extend(true, {}, args, config);
    this.events = {};
    this._loaded = {};
    logger.info('Loading config', fileconfig.configFileName());
    fileconfig.on('ready', (fileConfig)=>this.loadFileSettings(fileConfig));
    fileconfig.on('error', (err)=>this.emit('error', err));
  }

  loadFileSettings(config){
    this._loaded.file = true;
    this.config = extend(true, {}, this.config, config.values);
    stores.on('ready', (db)=>this.loadDBSettings(db));
    stores.on('error', (err)=>this.emit('error', err));
  }

  loadDBSettings(db){
    const collection = stores.get('config');
    collection.list({}, (err, results)=>{
      if(err){
        return this.emit('error', err);
      }
      this._dbConfig = results[results.root]||[];
      const dbConfig = this._dbConfig.reduce((cfg, record)=>{
        return setObjectValueCI(cfg, record.key, record.value);
      }, {});
      this.config = extend(true, {}, this.config, dbConfig);
      this._loaded.db = true;
      this.checkReady();
    });
  }

  checkReady(){
    if(this._loaded.db && this._loaded.file && (!this._ready)){
      this._ready = true;
      logger.info('Config', this.config);
      this.emit('ready');
    }
  }

  get(key, defaultValue){
    return valueFromObjectCI(this.config, key, defaultValue);
  }

  set(key, value, callback){
    this.config = setObjectValueCI(this.config, key, value);
    const collection = db.collection('config');
    const id = this._dbConfig.reduce((id, record)=>{
      if(record.key === key){
        return record._id || record.id;
      }
      return id;
    }, -1);
    if(id===-1){
      return collection.insert({key, value}, (err, record)=>{
        if(err){
          return (callback||noop)(err);
        }
        this._dbConfig.push(record);
        return (callback||noop)(null, record);
      });
    }
    return collection.update(id, {key, value}, callback||noop);
  }
};

let config = new Config({
  args,
});
config.Config = Config;

module.exports = config;
