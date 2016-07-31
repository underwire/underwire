'use strict';

const EventEmitter = require('events').EventEmitter;
const util = require('util');

class LazyEvents extends EventEmitter{
  constructor(){
    super();
    this._handledEvents = {};
  }

  on(event, handler){
    if(Object.keys(this._handledEvents).indexOf(event)!==-1){
      handler(this._handledEvents[event]);
    }
    super.on(event, handler);
  }

  emit(event, data){
    this._handledEvents[event] = data;
    super.emit(event, data);
  }
};

module.exports = {LazyEvents};
