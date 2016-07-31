const stores = require('../lib/stores');
const Joi = require('joi');
const async = require('async');
const io = require('../lib/io');

const ensureEdge = (edge, callback)=>{
  const getRest = ()=>{
    const {
      from,
      to,
      ...rest
    } = edge;
    return rest;
  };
  if(!edge.from){
    return callback(new Error(`Edge requires from`));
  }
  if(!edge.to){
    return callback(new Error(`Edge requires to`));
  }

  stores.collection('edges', (err, edges)=>{
    if(err){
      return callback(err);
    }
    stores.collection('nodes', (err, nodes)=>{
      if(err){
        return callback(err);
      }

      const fromCriteria = typeof(edge.from)==='string'?
          {$or: [{id: edge.from}, {name: edge.from}]}:
          edge.from;
      const toCriteria = typeof(edge.to)==='string'?
          {$or: [{id: edge.to}, {name: edge.to}]}:
          edge.to;
      nodes.find(fromCriteria, (err, fromList)=>{
        if(err){
          return callback(err);
        }
        const from = fromList[fromList.root];
        if((!from)||(from.length===0)){
          return callback(new Error(`Could not locate from node using ${edge.from}`));
        }
        if(from.length>1){
          return callback(new Error(`Multiple from nodes located using ${edge.from}`));
        }
        nodes.find(toCriteria, (err, toList)=>{
          if(err){
            return callback(err);
          }
          const to = toList[toList.root];
          if((!to)||(to.length===0)){
            return callback(new Error(`Could not locate to node using ${edge.from}`));
          }
          if(from.length>1){
            return callback(new Error(`Multiple to nodes located using ${edge.from}`));
          }
          return callback(null, Object.assign({}, edge, {
              from: from[0].id,
              to: to[0].id,
              ...getRest()
            }));
        });
      });
    });
  });
};

const insertEdge = (edge, callback)=>{
  stores.collection('edges', (err, edges)=>{
    if(err){
      return callback(err);
    }
    ensureEdge(edge, (err, realEdge)=>{
      edges.insert(edge, callback);
    });
  });
};

const upsertEdge = (edge, callback)=>{
  stores.collection('edges', (err, edges)=>{
    if(err){
      return callback(err);
    }
    ensureEdge(edge, (err, realEdge)=>{
      if(err){
        return callback(err);
      }
      edges.find({from: realEdge.from, to: realEdge.to}, (err, res)=>{
        if(err){
          return callback(err);
        }
        const existing = (res[res.root]||[]).shift();
        if(existing){
          return edges.update(existing.id, realEdge, callback);
        }
        return edges.insert(realEdge, callback);
      });
    });
  });
};

const insertEdges = (edges, callback)=>{
  stores.collection('edges', (err, collection)=>{
    if(err){
      return reply(err);
    }
    let inserted = [];
    let errors = [];
    async.each(edges, (edge, next)=>{
        const done = (err, res)=>{
          if(err){
            errors.push({error: err.toString(), edge})
            return next();
          }
          inserted.push(res[res.root]);
          return next();
        };
        upsertEdge(edge, done);
      }, ()=>{
        io.broadcast('redux::dispatch', {
          type: 'ADD_EDGES',
          edges: inserted
        });
        return callback(null, {
          root: 'inserted',
          inserted,
          errors
        });
    });
  });
};

const updateNode = (id, node, callback)=>{
  stores.collection('nodes', (err, collection)=>{
    if(err){
      return reply(err);
    }
    collection.update(id, node, callback);
  });
};

const insertNode = (node, callback)=>{
  stores.collection('nodes', (err, collection)=>{
    if(err){
      return callback(err);
    }
    collection.insert(node, (err, res)=>{
      if(err){
        return callback(err);
      }
      return callback(null, res);
    });
  });
};

const upsertNamedNode = (name, info, callback)=>{
  const node = Object.assign({}, info, {name});
  stores.collection('nodes', (err, collection)=>{
    if(err){
      return callback(err);
    }
    collection.find({name}, (err, res)=>{
      if(err){
        return callback(err);
      }
      if(res[res.root] && res[res.root].length){
        return updateNode(res[res.root][0].id, node, callback);
      }
      return insertNode(node, callback);
    });
  });
};

const insertNodes = (nodes, callback)=>{
  let inserted = [];
  let errors = [];
  async.each(nodes, (node, next)=>{
      const done = (err, res)=>{
        if(err){
          errors.push({error: err, node})
          return next();
        }
        inserted.push(res[res.root]);
        return next();
      };
      if(node.id){
        return updateNode(node.id, node, done);
      }
      if(node.name){
        return upsertNamedNode(node.name, node, done);
      }
      insertNode(node, done);
    }, ()=>{
      io.broadcast('redux::dispatch', {
        type: 'ADD_NODES',
        nodes: inserted
      });
      return callback(null, {
        root: 'inserted',
        inserted,
        errors
      });
  });
};

const getNodes = (req, reply)=>{
  stores.collection('nodes', (err, collection)=>{
    if(err){
      return reply(err);
    }
    collection.list(req.query, (err, list)=>{
      return reply(err || list);
    });
  });
};

const getNode = (req, reply)=>{
  stores.collection('nodes', (err, collection)=>{
    if(err){
      return reply(err);
    }
    const id = req.params.id;
    collection.get(id, (err, res)=>{
      return reply(err || res);
    });
  });
};

const postNodes = (req, reply)=>{
  const nodes = Array.isArray(req.payload)?req.payload:[req.payload];
  insertNodes(nodes, (err, response)=>{
    if(err){
      return reply(err);
    }
    return reply(response);
  });
};

const putNamedNode = (req, reply)=>{
  const name = req.params.name;
  const node = req.payload;
  upsertNamedNode(name, node, (err, res)=>{
    io.broadcast('redux::dispatch', {
      type: 'UPDATE_NODES',
      nodes: [res[res.root]]
    });
    return reply(err || res);
  });
};

const putNode = (req, reply)=>{
  const id = req.params.id;
  const node = req.payload;
  updateNode(id, node, (err, res)=>{
    io.broadcast('redux::dispatch', {
      type: 'UPDATE_NODES',
      nodes: [res[res.root]]
    });
    return reply(err || res);
  });
};

const deleteNode = (req, reply)=>{
  stores.collection('nodes', (err, collection)=>{
    if(err){
      return reply(err);
    }
    const id = req.params.id;
    collection.delete(id, (err, res)=>{
      io.broadcast('redux::dispatch', {
        type: 'DELETE_NODES',
        nodes: [{id}]
      });
      return reply(err || res);
    });
  });
};


const getEdges = (req, reply)=>{
  stores.collection('edges', (err, collection)=>{
    if(err){
      return reply(err);
    }
    collection.list(req.query, (err, list)=>{
      return reply(err || list);
    });
  });
};

const getEdge = (req, reply)=>{
  stores.collection('edges', (err, collection)=>{
    if(err){
      return reply(err);
    }
    const id = req.params.id;
    collection.get(id, (err, res)=>{
      return reply(err || res);
    });
  });
};

const postEdges = (req, reply)=>{
  const edges = Array.isArray(req.payload)?req.payload:[req.payload];
  insertEdges(edges, (err, response)=>{
    if(err){
      return reply(err);
    }
    return reply(response);
  });
};

const putEdge = (req, reply)=>{
  stores.collection('edges', (err, collection)=>{
    if(err){
      return reply(err);
    }
    const id = req.params.id;
    const edge = req.payload;
    collection.update(id, edge, (err, res)=>{
      io.broadcast('redux::dispatch', {
        type: 'UPDATE_EDGES',
        edges: [res[res.root]]
      });
      return reply(err || res);
    });
  });
};

const deleteEdge = (req, reply)=>{
  stores.collection('edges', (err, collection)=>{
    if(err){
      return reply(err);
    }
    const id = req.params.id;
    collection.delete(id, (err, res)=>{
      io.broadcast('redux::dispatch', {
        type: 'DELETE_EDGES',
        nodes: [{id}]
      });
      return reply(err || res);
    });
  });
};

module.exports = [
  {
    method: 'GET',
    path: '/api/graph/nodes',
    config: {
      tags: ['api'],
      handler: getNodes,
    },
  },
  {
    method: 'GET',
    path: '/api/graph/node/{id}',
    config: {
      tags: ['api'],
      validate: {
        params: {
          id: Joi.string(),
        }
      },
      handler: getNode,
    },
  },
  {
    method: 'POST',
    path: '/api/graph/nodes',
    config: {
      tags: ['api'],
      validate: {
        payload: Joi.alternatives().try(Joi.object(), Joi.array().items(Joi.object())),
      },
      handler: postNodes,
    },
  },
  {
    method: 'PUT',
    path: '/api/graph/node/named/{name}',
    config: {
      tags: ['api'],
      validate: {
        params: {
          name: Joi.string(),
        },
        payload: Joi.alternatives().try(Joi.object(), Joi.array().items(Joi.object())),
      },
      handler: putNamedNode,
    },
  },
  {
    method: 'PUT',
    path: '/api/graph/node/{id}',
    config: {
      tags: ['api'],
      validate: {
        params: {
          id: Joi.string(),
        },
        payload: Joi.alternatives().try(Joi.object(), Joi.array().items(Joi.object())),
      },
      handler: putNode,
    },
  },
  {
    method: 'DELETE',
    path: '/api/graph/node/{id}',
    config: {
      tags: ['api'],
      validate: {
        params: {
          id: Joi.string(),
        }
      },
      handler: deleteNode,
    },
  },

  {
    method: 'GET',
    path: '/api/graph/edges',
    config: {
      tags: ['api'],
      handler: getEdges,
    },
  },
  {
    method: 'GET',
    path: '/api/graph/edge/{id}',
    config: {
      tags: ['api'],
      validate: {
        params: {
          id: Joi.string(),
        }
      },
      handler: getEdge,
    },
  },
  {
    method: 'POST',
    path: '/api/graph/edges',
    config: {
      tags: ['api'],
      validate: {
        payload: Joi.alternatives().try(Joi.object(), Joi.array().items(Joi.object())),
      },
      handler: postEdges,
    },
  },
  {
    method: 'PUT',
    path: '/api/graph/edge/{id}',
    config: {
      tags: ['api'],
      validate: {
        params: {
          id: Joi.string(),
        },
        payload: Joi.alternatives().try(Joi.object(), Joi.array().items(Joi.object())),
      },
      handler: putEdge,
    },
  },
  {
    method: 'DELETE',
    path: '/api/graph/edge/{id}',
    config: {
      tags: ['api'],
      validate: {
        params: {
          id: Joi.string(),
        }
      },
      handler: deleteEdge,
    },
  },
];
