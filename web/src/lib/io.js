const io = require('socket.io-client');
const client = io(window.location.origin);
const store = require('../reducers');

/*
const onevent = client.onevent;
client.onevent = function (packet) {
  const args = packet.data || [];
  onevent.call (this, packet);    // original call
  packet.data = ['*'].concat(args);
  onevent.call(this, packet);      // additional call to catch-all
};

client.on('*',function(event,data) {
  console.log('Event: ', event);
  console.log('Data: ', data);
});
//*/

client.on('redux::dispatch', (data)=>{
  store.dispatch(data);
});

module.exports = client;
