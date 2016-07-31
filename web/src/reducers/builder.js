const deleteHandler = (state, action)=>{
  const ids = (action[name]||action.items||[]).map((node)=>node.id||node);
  return state.filter((src)=>ids.indexOf(src.id)===-1);
};

const clearHandler = (state, action)=>{
  return [];
};

const defaultHandler = (state, action)=>{
  return state;
};

module.exports = (name, options = {})=>{
  const STATE_NAME=name.toUpperCase();
  const addUpdateHandler = (state, action)=>{
    const newState = [...(action[name]||action.items||[]), ...state].filter((item, index, arr)=>{
      const id = item.id;
      const idx = arr.findIndex((elem)=>{
        return elem.id===id;
      });
      return idx === index;
    });
    return newState;
  };
  const actionHandlers = Object.assign({}, {
    [`ADD_${STATE_NAME}`]: addUpdateHandler,
    [`UPDATE_${STATE_NAME}`]: addUpdateHandler,
    [`DELETE_${STATE_NAME}`]: deleteHandler,
    [`CLEAR_${STATE_NAME}`]: clearHandler,
    default: defaultHandler,
  }, options.handlers || {});

  return (state = [], action)=>{
    const handler = (actionHandlers[action.type]||actionHandlers.default);
    return handler(state, action);
  };
};
