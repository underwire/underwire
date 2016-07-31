const async = require('async');
const sift = require('sift');
const uuid = require('uuid').v4;

const isNumeric = function (n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

const lock = (store, callback)=>{
  if(store._lock){
    return setImmediate(function(){
      lock(store, callback);
    });
  }
  store._lock = true;
  return setImmediate(()=>{
    return callback((done)=>{
      store._lock = false;
      done();
    });
  });
};

const buildCompareFunc = function(o){
  const keys = Object.keys(o);
  let val, ord;
  let src = 'var cmp = '+(function(a, b){
    let v;
    if(!isNaN(parseFloat(a)) && isFinite(b)){
      v = a-b;
      if(v>0) return 1;
      if(v<0) return -1;
      return 0;
    }else{
      return (""+a).localeCompare(""+b);
    }
  }).toString()+'\r\n';
  keys.forEach(function(key){
    val = o[key];
    if(val>0){
      ord = 'a.'+key+', b.'+key;
    }else if(val<0){
      ord = 'b.'+key+', a.'+key;
    }
    src += 'v = cmp('+ord+');\r\n'+
      'if(v!=0) return v\r\n';
  });
  src+='return 0;';
  return new Function('a', 'b', src);
};

class MemoryStore{
  constructor(){
    this.data = [];
  }

  list(options = {}, callback){
    lock(this, (unlock)=>{
      const {data} = this;
      let records = options.filter?sift(options.filter, data):data;
      const count = records.length;
      const offset = isNumeric(options.offset)?parseInt(options.offset):0;
      const limit = isNumeric(options.limit)?parseInt(options.limit):count;
      if(options.sort){
        const f = buildCompareFunc(options.sort);
        records = records.sort(f);
      }
      records = records.slice(offset, offset+limit);
      const result = {
          length: count,
          count: records.length,
          limit,
          offset,
          root: 'response',
          response: records.slice()
        };
      unlock(()=>callback(null, result));
    });
  }

  find(criteria, callback){
    lock(this, (unlock)=>{
      const {data} = this;
      const records = sift(criteria, data);
      const result = {
          root: 'response',
          response: records.slice()
        };
      unlock(()=>callback(null, result));
    });
  }

  get(id, callback){
    lock(this, (unlock)=>{
      const {data} = this;
      const idx = sift.indexOf({id}, data);
      unlock(()=>callback(null, {
          root: 'record',
          record: idx>-1?data[idx]:undefined
        }));
    });
  }

  insert(record, callback){
    lock(this, (unlock)=>{
      const rec = Object.assign({}, record, {id: uuid(), _created: new Date()});
      this.data.push(rec);
      unlock(()=>callback(null, {
          root: 'record',
          record: rec
        }));
    });
  }

  update(id, record, callback){
    lock(this, (unlock)=>{
      const {data} = this;
      const idx = sift.indexOf({id}, data);
      if(idx === -1){
        return callback(new Error(`No record with id of ${id} could be found.`));
      }
      const rec = Object.assign({}, record, {
        id,
        _created: data[idx]._created,
        _updated: new Date()
      });
      data[idx] = rec;
      unlock(()=>callback(null, {
          root: 'record',
          record: rec
        }));
    });
  }

  delete(id, callback){
    lock(this, (unlock)=>{
      const {data} = this;
      const idx = sift.indexOf({id}, data);
      if(idx === -1){
        return unlock(()=>callback(null, 0));
      }
      this.data = [...data.slice(0, idx), ...data.slice(idx+1, data.length)];
      unlock(()=>callback(null, 1));
    });
  }
};

module.exports = MemoryStore;
