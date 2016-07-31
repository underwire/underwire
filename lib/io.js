const socketio = require('socket.io');

class IO{
  constructor(io){
  }

  init(listener){
    this._io = socketio(listener);
  }

  io(callback){
    if(this._io){
      return callback(this._io);
    }
    return setImmediate(()=>this.io(callback));
  }

  broadcast(eventName, data){
    this.io((io)=>{
      io.emit(eventName, data);
    });
  }

  on(eventName, handler){

  }
};

const io = new IO();

module.exports = io;
