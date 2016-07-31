'use strict';

const LazyEvents = require('./lazyevents').LazyEvents;
const ENV = require('./env').ENV;
const path = require('path');
const fs = require('fs');
const logger = require('./logger');
const args = require('./cmdargs').args;
const babel = require('babel-core');

const configUtilities = {
  console,
  logger,
  require,
  __dirname,
};
const configUtilNames = Object.keys(configUtilities);
const configUtils = configUtilNames.map((name)=>configUtilities[name]);

const {
  valueFromObjectCI,
} = require('./utils');

class FileConfig extends LazyEvents{
  constructor(options = {}){
    super();
    this.values = {};
    this.args = options.args;
    setImmediate(()=>this.loadSettings());
  }

  configFileName(){
    return this.args.configFile || path.resolve(__dirname, `../configs/app/${ENV}.config.js`);
  }

  baseConfigFileName(){
    return path.resolve(__dirname, `../configs/app.base.js`);
  }

  loadSettings(){
    const configFileName = this.configFileName();
    const baseConfigFileName = this.baseConfigFileName();
    const babelOptions = {
      "presets": ["es2015", "stage-2", "react"],
      "plugins": [
      ],
      "env": {
        "development": {
          "plugins": [["react-transform", {
            "transforms": [{
              "transform": "react-transform-hmr",
              "imports": ["react"],
              "locals": ["module"]
            }]
          }]]
        }
      }
    };

    return fs.readFile(baseConfigFileName, (err, baseSource)=>{
      if(err && err.toString().match(/no such file or directory/)){
        baseSource = '{}';
      }
      try{
        const src = babel.transform(`const config = ${baseSource};`, babelOptions);
        const f = new Function(configUtilNames, `${src.code} return config;`);
        this.values = f(...configUtils);
        logger.info(`Base config loaded from ${baseConfigFileName}`)
      }catch(e){
        logger.error(`Error loading base config from ${baseConfigFileName}`);
        logger.error(e);
        this.values = {};
      }
      return fs.readFile(configFileName, (err, settings)=>{
        if(err && err.toString().match(/no such file or directory/)){
          logger.error(`Config file "${configFileName}" not found`);
          return this.emit('ready', this);
        }
        if(err){
          return this.emit('error', err);
        }
        try{
          const src = babel.transform(`const config = ${settings};`, babelOptions);
          const f = new Function(configUtilNames, `${src.code} return config;`);
          this.values = Object.assign({}, this.values, f(...configUtils));
        }catch(e){
          return this.emit('error', e);
        }
        this.emit('ready', this);
      });
    });
  }

  get(key, defaultValue){
    return valueFromObjectCI(this.values, key, defaultValue);
  }

  set(key, value){
    return this.config = setObjectValueCI(this.values, key, value);
  }
};

let fileconfig = new FileConfig({args});
fileconfig.FileConfig = FileConfig;

module.exports = fileconfig;
