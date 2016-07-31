let editors = {};

class Editors{
  static register(options){
    if(options.types){
      return options.types.forEach((type)=>{
        editors[type] = options;
      });
    }
    editors[options.type] = options;
  }

  static get(type, defaultEditor){
    return editors[type] || editors.default || defaultEditor;
  }
}

module.exports = Editors;
