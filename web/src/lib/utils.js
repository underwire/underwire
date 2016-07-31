const moment = require('moment');

const reTrue = /^(true|t|yes|y|1)$/i;
const reFalse = /^(false|f|no|n|0)$/i;

const noop = function(){};

const encodeParams = (args)=>{
  let key, s=[], i, l;
  const encodeKey = (key)=>{
    return encodeURIComponent(key).replace(/%5B/g, '[').replace(/%5D/g, ']');
  };
  const encodeObjectValue = (prefix, obj)=>{
    if(!obj){
      return;
    }
    return Object.keys(obj).map((key)=>addParam(prefix, key, obj[key]));
  };
  const encodeArrayValue = (prefix, arr)=>{
    if(!arr){
      return;
    }
    return arr.map((v, i)=>addParam(prefix, i, v));
  };
  const encodeParam = (key, value)=>{
    return s[s.length]=encodeKey(key)+'='+encodeURIComponent(value);
  };
  const addParam = function(...args){
    let [
      prefix,
      key,
      value
    ] = args.length===2?['', args[0], args[1]]:args;
    value = value instanceof Function?value():value;
    key = `${key}`;
    if(value===void 0){
      return;
    }
    if(value === null){
      return;
    }
    if(prefix && key){
      key = `${prefix}[${key}]`;
    }
    if(Array.isArray(value)){
      return encodeArrayValue(key, value);
    }
    if(typeof(value)==='object'){
      return encodeObjectValue(key, value);
    }
    return encodeParam(key, value);
  };

  if(args instanceof Array){
    l = args.length;
    for(i=0; i<l; i++){
      addParam(args[i].name, args[i].value);
    }
  }else if(args){
    for(key in args){
      addParam(key, args[key]);
    }
  }
  return s.join('&').replace(/%20/g, '+');
};

const formatDate = (dt)=>{
  return moment((dt instanceof Date?dt.toISOString():dt || '').substr(0, 10)).format('LL');
};

const getObjectValue = (obj, key, def) => {
  let o = obj;
  let path = key.split('.');
  let segment;
  while(o && path.length){
    segment = path.shift();
    o = o[segment];
  }
  if(typeof(o) !== 'undefined'){
    return o;
  }
  return def;
};

const setObjectValue = (source, key, value) => {
  let res = Object.assign({}, source);
  let o = res;
  let path = key.split('.'), last, segment;
  while(o && path.length){
    segment = path.shift();
    last = o;
    o = o[segment];
    if(!o){
      o = last[segment] = {};
    }
  }
  last[segment] = value;
  return res;
};

const isTrue = (value) => {
  return !!reTrue.exec(''+value);
};

const isFalse = (value) => {
  return !!reFalse.exec(''+value);
};

const lowerFirstLetter = (string) => {
  return string.charAt(0).toLowerCase() + string.slice(1);
};

const upperFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const isNumeric = (n) => {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

const isDateTime = (value) => {
  if(value instanceof Date){
    return true;
  }
  if(typeof(value)==='string' && (!isNaN(Date.parse(value)))){
    return true;
  }
  return false;
};

const getTypedValueFrom = (value) => {
  if(isNumeric(value)){
    return +value;
  }
  if(isTrue(value)){
    return true;
  }
  if(isFalse(value)){
    return false;
  }
  if(isDateTime(value)){
    return new Date(Date.parse(value));
  }
  return value;
};

const getJoiErrorText = (data)=>{
  return data.details.map(detail=>{
    const tail = /"[^"]+" ([\s\S]+)/.exec(detail.message)[1];
    return `"${detail.path}" ${tail}`;
  });
};

module.exports = {
  encodeParams,
  formatDate,
  setObjectValue,
  getObjectValue,
  noop,
  isTrue,
  isFalse,
  reTrue,
  reFalse,
  isNumeric,
  isDateTime,
  lowerFirstLetter,
  upperFirstLetter,
  getTypedValueFrom,
  getJoiErrorText,
};
