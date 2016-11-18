const stores = require('../lib/stores');
const Joi = require('joi');
const async = require('async');
const io = require('../lib/io');
const {
  exclude
} = require('../lib/utils');

const errorReply = (reply, err)=>{
  if(err instanceof Error){
    const result = {
      root: 'error',
      error: {
        message: err.toString(),
        stack: err.stack?err.stack.split('\n'):undefined,
      }
    };
    return reply(result).code(400);
  }
  return reply(err).code(400);
};

const responseReply = (reply, err, response)=>{
  if(err){
    return errorReply(reply, err);
  }
  return reply(response);
};

const locateNodes = (criteria, callback)=>{
  const buildFromCriteria = (criteria)=>{
    if(Array.isArray(criteria)){
      const initial = criteria.map(buildFromCriteria);
      return initial.reduce((search, item)=>{
        if(item.$or){
          return {
            $or: search.$or.concat(...item.$or),
          };
        }
        return {
          $or: search.$or.concat(item),
        };
      }, {$or: []});
    }
    if(typeof(criteria)==='string'){
      return {$or: [{id: criteria}, {name: criteria}]};
    }
    if(criteria instanceof RegExp){
      return {$or: [{id: criteria}, {name: criteria}]};
    }
    return criteria;
  };

  const searchForNode = (criteria)=>{
    const fromCriteria = buildFromCriteria(criteria);
    stores.collection('nodes', (err, nodes)=>{
      if(err){
        return callback(err);
      }
      nodes.find(fromCriteria, (err, list)=>{
        if(err){
          return callback(err);
        }
        const nodes = list[list.root];
        if((!nodes)||(nodes.length===0)){
          return callback(new Error(`Could not locate node using "${criteria}"`));
        }
        callback(null, list);
      });
    });
  };

  if(typeof(criteria)==='string'){
    return findAliasedNodes(criteria, (err, nodes)=>{
      if(err){
        return callback(err);
      }
      if(nodes && nodes[nodes.root].length){
        return callback(null, nodes);
      }
      return searchForNode(criteria);
    });
  }
  return searchForNode(criteria);
};

const locateNode = (criteria, callback)=>{
  return locateNodes(criteria, (err, list)=>{
    if(err){
      return callback(err);
    }
    const nodes = list[list.root];
    if(nodes.length>1){
      return callback(new Error(`Multiple from nodes located using ${criteria}`), list);
    }
    return callback(null, {
      root: 'node',
      node: nodes[0]
    });
  });
};

const prepareAlias = (raw, callback)=>{
  let alias = {
    definition: raw.definition,
  };
  if(raw.nodes){
    alias.nodes = [];
    return async.eachLimit(raw.nodes, 5, (def, next)=>{
      locateNodes(def, (err, list)=>{
        if(err){
          return next(err);
        }
        alias.nodes = alias.nodes.concat(...(list[list.root].map((node)=>node.id)));
        next();
      });
    }, (err)=>{
      if(err){
        return callback(err);
      }
      return callback(null, alias);
    });
  }
  alias.edges = [];
  return async.eachLimit(raw.edges, 5, (def, next)=>{
    ensureEdge(def, (err, edge)=>{
      if(err){
        return next(err);
      }
      alias.edges = alias.edges.concat(edge[edge.root].map((edge)=>edge.id));
      next();
    });
  }, (err)=>{
    if(err){
      return callback(err);
    }
    return callback(null, alias);
  });
};

const insertAlias = (alias, callback)=>{
  return prepareAlias(alias, (err, alias)=>{
    if(err){
      return callback(err);
    }
    stores.collection('aliases', (err, collection)=>{
      if(err){
        return callback(err);
      }
      collection.insert(alias, callback);
    });
  });
};

const updateAlias = (id, alias, callback)=>{
  return prepareAlias(alias, (err, alias)=>{
    if(err){
      return callback(err);
    }
    stores.collection('aliases', (err, collection)=>{
      if(err){
        return callback(err);
      }
      collection.update(id, alias, callback);
    });
  });
};

const ensureAlias = (alias, callback)=>{
  if(!alias.definition){
    return callback(new Error(`To create an alias you must supply a definition.`));
  }
  if(!(Array.isArray(alias.edges)||Array.isArray(alias.nodes))){
    return callback(new Error(`Alias ${alias.definition} has no nodes or edges assigned to it.`));
  }
  if(alias.edges && alias.nodes){
    return callback(new Error(`Alias ${alias.definition} can only have nodes or edges.`));
  }
  stores.collection('aliases', (err, collection)=>{
    if(err){
      return callback(err);
    }
    collection.find({definition: alias.definition}, (err, response)=>{
      if(err){
        return callback(err);
      }
      const aliases = response[response.root];
      if((!aliases) || (aliases.length === 0)){
        return insertAlias(alias, callback);
      }
      return updateAlias(alias.id, alias, callback);
    });
  });
};

const getAliasByDefinition = (definition, callback)=>{
  stores.collection('aliases', (err, collection)=>{
    if(err){
      return callback(err);
    }
    collection.find({definition}, (err, list)=>{
      if(err){
        return callback(err);
      }
      const alias = list[list.root][0];
      return callback(null, {
        root: 'alias',
        alias
      });
    });
  });
};

const findAliasedNodes = (definition, callback)=>{
  getAliasByDefinition(definition, (err, resp)=>{
    if(err){
      return callback(err);
    }
    const alias = resp[resp.root];
    if(!alias){
      return callback(null, undefined);
    }
    stores.collection('nodes', (err, collection)=>{
      if(err){
        return callback(err);
      }
      collection.find({id: {$in: alias.nodes}}, (err, nodes)=>{
        if(err){
          return callback(err);
        }
        return callback(null, nodes);
      });
    });
  });
};

const listAliases = (options, callback)=>{
  stores.collection('aliases', (err, collection)=>{
    if(err){
      return callback(err);
    }
    collection.list(options, callback);
  });
};

const deleteAlias = (id, callback)=>{
  stores.collection('aliases', (err, collection)=>{
    if(err){
      return callback(err);
    }
    collection.delete(id, callback);
  });
};

const getAliases = (like, options, callback)=>{
  stores.collection('aliases', (err, collection)=>{
    if(err){
      return callback(err);
    }
    collection.find({definition: like}, callback);
  });
};

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
      ensureNode(edge.from, (err, node)=>{
        if(err){
          return callback(err);
        }
        const from = node[node.root] || node;
        if(!from){
          return callback(new Error(`Could not locate node using "${edge.from}"`));
        }

        ensureNode(edge.to, (err, node)=>{
          if(err){
            return callback(err);
          }
          const to = node[node.root] || node;
          return callback(null, Object.assign({}, edge, {
              from: from.id||from._id,
              to: to.id||to._id,
              ...getRest()
            }));
        });
      });
    });
  });
};

const _insertEdge = (edge, callback)=>{
  stores.collection('edges', (err, edges)=>{
    if(err){
      return callback(err);
    }
    edges.insert(edge, (err, res)=>{
      if(err){
        return callback(err);
      }
      const edge = res[res.root] || res || realEdge;
      io.broadcast('redux::dispatch', {
        type: 'ADD_EDGES',
        edges: [edge]
      });
      return callback(null, res);
    });
  });
};

const insertEdge = (edge, callback)=>{
  ensureEdge(edge, (err, realEdge)=>{
    _insertEdge(realEdge, callback);
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
        _insertEdge(realEdge, callback);
      });
    });
  });
};

const insertEdges = (edges, callback)=>{
  stores.collection('edges', (err, collection)=>{
    if(err){
      return callback(err);
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

const ensureNodeEdges = (node, edges, callback)=>{
  if(edges && edges.length){
    const _edges = [];
    return async.each(edges, (edge, next)=>{
      upsertEdge({
        from: node,
        to: edge
      }, (err, edg)=>{
        if(err){
          _edges.push({
            from: node.name,
            to: edge,
            error: err.toString()
          });
          return next();
        }
        _edges.push(edg[edg.root || edg]);
        return next();
      });
    }, ()=>{
      return callback(null, {
        root: 'response',
        response: {
          node,
          edges: _edges
        }
      });
    });
  }
  return callback(null, {root: 'node', node});
};

const updateNode = (id, source, callback)=>{
  stores.collection('nodes', (err, collection)=>{
    if(err){
      return callback(err);
    }
    const node = exclude(source, 'edges', 'aliases');
    const edges = source.edges || [];
    const aliases = source.aliases || [];
    collection.update(id, node, (err, res)=>{
      if(err){
        return callback(err);
      }
      if(aliases && aliases.length){
        return async.each(aliases, (definition, next)=>{
          ensureAlias({definition, nodes: [node]}, ()=>next());
        }, ()=>{
          return ensureNodeEdges(node, edges, (err, res)=>{
            return callback(err, res);
          });
        });
      }
      return ensureNodeEdges(node, edges, callback);
    });
  });
};

const findNamedNode = (node, callback)=>{
  stores.collection('nodes', (err, collection)=>{
    if(err){
      return callback(err);
    }
    const {
      name,
      version,
    } = node;
    collection.find({name, version}, (err, response)=>{
      if(err){
        return callback(err);
      }
      return callback(null, (response[response.root]||[])[0]);
    });
  });
};

const insertNode = (node, callback)=>{
  stores.collection('nodes', (err, collection)=>{
    if(err){
      return callback(err);
    }
    const insertNode = (source)=>{
      const node = exclude(source, 'edges', 'aliases');
      const edges = source.edges || [];
      const aliases = source.aliases || [];
      collection.insert(node, (err, res)=>{
        if(err){
          return callback(err);
        }
        const n = res[res.root] || res || node;
        io.broadcast('redux::dispatch', {
          type: 'ADD_NODES',
          nodes: [n]
        });
        if(aliases && aliases.length){
          return async.each(aliases, (definition, next)=>{
            ensureAlias({definition, nodes: [n]}, ()=>next());
          }, ()=>{
            return ensureNodeEdges(n, edges, callback);
          });
        }
        return ensureNodeEdges(n, edges, callback);
      });
    };
    if(node.version && (!node.derivation)){
      const {
        version,
        ...derivationNode,
      } = node;
      return findNamedNode(derivationNode, (err, newDerivationNode)=>{
        if(err){
          return callback(err);
        }
        if(newDerivationNode){
          return insertNode(Object.assign({}, node, {derivation: newDerivationNode.id}));
        }
        return collection.insert(derivationNode, (err, response)=>{
          if(err){
            return callback(err);
          }
          const parent = response[response.root];
          io.broadcast('redux::dispatch', {
            type: 'ADD_NODES',
            nodes: [parent]
          });
          const newNode = Object.assign({}, node, {derivation: parent.id});
          return insertNode(newNode);
        });
      });
    }
    return insertNode(node);
  });
};

const upsertNode = (node, callback)=>{
  const nodeId = node.id || node._id;
  if(nodeId){
    return updateNode(nodeId, node, callback);
  }
  stores.collection('nodes', (err, collection)=>{
    locateNode({name: node.name}, (err, res)=>{
      if(err){
        if(err.toString().match('Could not locate node')){
          return insertNode(node, callback);
        }
        return callback(err);
      }
      const existingNode = res[res.root]||res;
      return updateNode(existingNode.id||existingNode._id, node, callback);
    });
  });
};

const ensureNode = (criteria, callback)=>{
  locateNode(criteria, (err, found)=>{
    if(found){
      return callback(null, found);
    }
    const node = typeof(criteria)==='string'?{name: criteria}:criteria;
    insertNode(node, callback);
  });
};

const insertNodes = (nodes, callback)=>{
  let inserted = [];
  let edges = [];
  let errors = [];
  async.each(nodes, (node, next)=>{
      const done = (err, res)=>{
        if(err){
          errors.push({error: err, node})
          return next();
        }
        const n = res[res.root];
        inserted.push(n.node?n.node:n);
        if(n.edges){
          edges = edges.concat(n.edges);
        }
        return next();
      };
      upsertNode(node, done);
    }, ()=>{
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
      return errorReply(reply, err);
    }
    collection.list(req.query, (err, list)=>{
      return reply(err || list);
    });
  });
};

const getNode = (req, reply)=>{
  stores.collection('nodes', (err, collection)=>{
    if(err){
      return errorReply(reply, err);
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
      return errorReply(reply, err);
    }
    return reply(response);
  });
};

const putNamedNode = (req, reply)=>{
  const name = req.params.name;
  const node = req.payload;
  insertNode(node, (err, res)=>{
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
      return errorReply(reply, err);
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
      return errorReply(reply, err);
    }
    collection.list(req.query, (err, list)=>{
      return reply(err || list);
    });
  });
};

const getEdge = (req, reply)=>{
  stores.collection('edges', (err, collection)=>{
    if(err){
      return errorReply(reply, err);
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
      return errorReply(reply, err);
    }
    return reply(response);
  });
};

const putEdge = (req, reply)=>{
  stores.collection('edges', (err, collection)=>{
    if(err){
      return errorReply(reply, err);
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
      return errorReply(reply, err);
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
  // Nodes
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
        },
      },
      handler: getNode,
    },
  },
  {
    method: 'GET',
    path: '/api/graph/nodes/{like}',
    config: {
      tags: ['api'],
      validate: {
        params: {
          like: Joi.string(),
        },
      },
      handler(req, reply){
        return locateNodes(req.params.like, (err, list)=>{
          if(err){
            return errorReply(reply, err);
          }
          return reply(list);
        });
      },
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
        },
      },
      handler: deleteNode,
    },
  },

  // Edges
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
        },
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
        },
      },
      handler: deleteEdge,
    },
  },

  // Aliases
  {
    method: 'GET',
    path: '/api/graph/aliases',
    config: {
      tags: ['api'],
      handler: (req, reply)=>listAliases(req.query, (err, response)=>responseReply(reply, err, response)),
    },
  },
  {
    method: 'GET',
    path: '/api/graph/aliases/{like}',
    config: {
      tags: ['api'],
      validate: {
        params: {
          like: Joi.string(),
        },
      },
      handler: (req, reply)=>getAliases(req.params.like, req.query, (err, response)=>responseReply(reply, err, response)),
    },
  },
  {
    method: 'POST',
    path: '/api/graph/aliases',
    config: {
      tags: ['api'],
      validate: {
        payload: Joi.object()
      },
      handler: (req, reply)=>ensureAlias(req.payload, (err, response)=>responseReply(reply, err, response)),
    },
  },
  {
    method: 'PUT',
    path: '/api/graph/aliases',
    config: {
      tags: ['api'],
      validate: {
        payload: Joi.object()
      },
      handler: (req, reply)=>ensureAlias(req.payload, (err, response)=>responseReply(reply, err, response)),
    },
  },
  {
    method: 'DELETE',
    path: '/api/graph/alias/{id}',
    config: {
      tags: ['api'],
      validate: {
        params: {
          id: Joi.string(),
        },
      },
      handler: (req, reply)=>deleteAlias(req.params.id, (err, response)=>responseReply(reply, err, response)),
    },
  },
];
