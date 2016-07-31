const React = require('react');

// TODO: Refactor all this into a proper ES6 React Component

const {
  ProcessCanvas,
  ProcessCanvasEvents,
} = require('../vendor/processcanvas/processCanvas');
require('../vendor/processcanvas/processCanvas.processConnectors')(ProcessCanvas);
require('../vendor/processcanvas/processCanvas.processShapes')(ProcessCanvas);
const {
  ViewObject,
  ViewObjectList,
} = require('../vendor/processcanvas/processCanvas.viewObjects')(ProcessCanvasEvents);
require('../vendor/processcanvas/processCanvas.treeLayout')(ProcessCanvas);
require('../vendor/processcanvas/processCanvas.cuteShapes')(ProcessCanvas);
const treeLayout = ProcessCanvas.treeLayout;

const drawIgnores = [
  "drawLine", "drawRect", "drawRoundRect", "drawEllipse", "drawArc", "drawHorizontalConnection", "drawVerticalConnection", "drawConnectorEndpoint", "drawConnection"
];
const shapes = Object.keys(ProcessCanvas)
    .filter((key)=>/^draw/.exec(key)&&drawIgnores.indexOf(key)===-1)
    .map((key)=>key.replace(/^draw/, ''));

const toCamelCase = (str)=>{
  // Lower cases the string
  return str.toLowerCase()
    // Replaces any - or _ characters with a space
    .replace( /[-_]+/g, ' ')
    // Removes any non alphanumeric characters
    .replace( /[^\w\s]/g, '')
    // Uppercases the first character in each group immediately following a space
    // (delimited by spaces)
    .replace( / (.)/g, function($1) { return $1.toUpperCase(); })
    // Removes spaces
    .replace( / /g, '' );
};

class DependencyGraph extends React.Component{
  constructor(props){
    super();
    this.viewer = false;
    this.scene = false;
    this.state = {data: props.data};
  }

  componentWillReceiveProps(props){
    if(props.data){
      this.setState({data: props.data});
      this.updateView();
    }
  }

  handleMove(e){
    const {
      viewer
    } = this;
    viewer.updateDrag(e);
    e.preventDefault();
    return false;
  }

  handleUp(e){
    const {
      viewer
    } = this;
    viewer.endDrag(e);
    e.preventDefault();
    return false;
  }

  focusNode(focusOn){
    const viewer = this.viewer;

    if((focusOn.inbound.length>0)&&(focusOn.outbound.length>0)){
      return viewer.moveViewTo(focusOn.x-(viewer.width/2)+(focusOn.width/2), focusOn.y-(viewer.height/2)+(focusOn.height/2));
    }

    if(focusOn.outbound.length>0){
      return viewer.moveViewTo(focusOn.x-(viewer.width/2)+(focusOn.width/2), -30);
    }

    viewer.moveViewTo(focusOn.x-(viewer.width/2)+(focusOn.width/2), -viewer.height+focusOn.height+focusOn.height+30);
  }

  clearSelection(invalidateView = true){
    const viewer = this.viewer;
    if(viewer.selection && Array.isArray(viewer.selection)){
      viewer.selection.forEach((item)=>item.displayOptions.endColor = '#dce0e9');
    }
    if(invalidateView){
      viewer.invalidate();
    }
  }

  handleSelect(what, focusOn){
    const viewer = this.viewer;
    this.clearSelection(false);
    viewer.selection = (what===false)||Array.isArray(what)?what:[what];
    if(viewer.selection){
      if(focusOn){
        this.focusNode(focusOn);
      }
      viewer.selection.forEach((item)=>item.displayOptions.endColor = 'yellow');
    }
    viewer.invalidate();
  }

  // Centers a specific node or the viewer.root in the center of the viewer
  recenterViewTree(nodes){
    const {
      viewer,
      scene,
    } = this;
    let tree = nodes || viewer.root,
        upLeftMost = tree.inbound&&tree.inbound.length>0?tree.inbound[0].x:false,
        upRightMost= tree.inbound&&tree.inbound.length>0?tree.inbound[tree.inbound.length-1].x:false,
        downLeftMost = tree.outbound&&tree.outbound.length>0?tree.outbound[0].x:false,
        downRightMost= tree.outbound&&tree.outbound.length>0?tree.outbound[tree.outbound.length-1].x:false,
        upCenterOffset = (upRightMost-upLeftMost)/2,
        downCenterOffset = (downRightMost-downLeftMost)/2,
      offsetChildren = function(root, moveBy, direction){
        if(Math.round(moveBy)==0) return;
        if(root[direction]&&root[direction].length>0) for(var i in root[direction]){
          root[direction][i].x+=moveBy;
          offsetChildren(root[direction][i], moveBy, direction);
        }
      };
    offsetChildren(tree, tree.x-(upLeftMost+upCenterOffset), 'inbound');
    offsetChildren(tree, tree.x-(downLeftMost+downCenterOffset), 'outbound');
    viewer.moveViewTo(tree.x-(viewer.width/2)+(tree.width/2), tree.y-(viewer.height/2)+(tree.height/2));
  }

  getNodeShape(node){
    if(node && node.shape){
      const drawShapes = shapes.filter((shape)=>{
        const isMatch = !!(new RegExp(`^${shape}$`, 'i')).exec(node.shape);
        return isMatch;
      });
      const shapeName = 'draw'+drawShapes.shift();
      return ProcessCanvas[shapeName]?shapeName:'drawProcess';
    }
    return 'drawProcess';
  }

  addConnection(from, to){
    const scene = this.scene;
    const connection = new ViewObject();
    connection.setCaption('');
    connection.setSource(from);
    connection.setDest(to);
    connection.setDrawable('drawVerticalConnection');
    connection.displayOptions.startStyle = 'ball';
    connection.displayOptions.endStyle = 'arrow';
    scene.add(connection);
    return connection;
  };

  walkData(root, builderCanvas, direction){
    const scene = this.scene;
    const shape = this.getNodeShape(root);
    let vObject = new ViewObject();
    vObject.setCaption(root.name||root.id);
    vObject.setSize(100);
    vObject.setDrawable(shape);//root.displayshape||'drawProcess');
    vObject.id = root.id;
    vObject.displayOptions.textAlign = 'center';
    if(root.decorator){
      vObject.decorator.setPlacement('bottom');
      vObject.decorator.setImage(decoratorImagesList.getImage(root.decorator, function(){
        setTimeout(scene.invalidateView, 100);
        scene.dispatch('decoratorLoaded');
      }));
    }
    vObject.inbound = new Array();
    vObject.outbound = new Array();
    vObject.calcDisplayInfo(builderCanvas);
    scene.add(vObject);
    if(root.inbound instanceof Array && ((!direction) || (direction === 'inbound'))){
      root.inbound.forEach((node)=>{
        const tmp = this.walkData(node, builderCanvas, 'inbound');
        vObject.inbound.push(tmp);
        this.addConnection(tmp, vObject);
      });
    }
    if(root.outbound instanceof Array && ((!direction) || (direction === 'outbound'))){
      root.outbound.forEach((node)=>{
        const tmp = this.walkData(node, builderCanvas, 'outbound');
        vObject.outbound.push(tmp);
        this.addConnection(vObject, tmp);
      });
    }
    return vObject;
  }

  getRootNode(){
    const {
      data = []
    } = this.state;
    const {
      rootNodeID = false,
    } = this.props;
    if(rootNodeID === false){
      return false;
    }
    const node = data.find((node)=>node.id === rootNodeID);
    if(node){
      return node;
    }
    return data[0];
  }

  updateView(){
    const {
      viewer,
      scene,
    } = this;
    const {
      data,
    } = this.state;
    const {
      focusRoot = false,
    } = this.props;
    const renderScene = ()=>{
      viewer.unsubscribe('afterdraw', renderScene);
      const rootNode = this.getRootNode();
      const root = viewer.root = this.walkData(rootNode, viewer);

      treeLayout.process(root, 'outbound');
      treeLayout.process(root, 'inbound', -1);

      this.clearSelection();
      this.recenterViewTree(root);
      if(focusRoot){
        this.handleSelect(viewer.root);
      }
      viewer.invalidate();
    };
    viewer.subscribe('afterdraw', renderScene);
    this.scene.clear();
    viewer.invalidate();
  }

  draw(context, event){
    const {
      viewer,
      scene,
    } = this;
    viewer.applyDefaultOptions();
    scene.draw(viewer);
  }

  handleClick(e){
    const {
      viewer,
      scene,
    } = this;
    e = e || window.event;
    const coords = viewer.translateMouseCoords(e, viewer.canvas);
    const focus = scene.hitTest(coords.x-viewer.translation.x, coords.y-viewer.translation.y);
    if(focus){
      viewer.select(scene.findBy('id', focus.id));
    }
    viewer.beginDrag(e);
    e.preventDefault();
    return false;
  }

  init(){
    const {
      viewer,
      scene,
    } = this;

    // Setup drawing the scene when the viewer does a draw
    viewer.subscribe('draw', this.draw.bind(this));

    // Handler to allow selection of objects from the scene
    viewer.select = this.handleSelect.bind(this);

    viewer.subscribe('touchbegin', this.handleClick.bind(this));
    viewer.subscribe('touchmove', this.handleMove.bind(this));
    viewer.subscribe('touchend', this.handleUp.bind(this));

    viewer.subscribe('mousedown', this.handleClick.bind(this));
    viewer.subscribe('mousemove', this.handleMove.bind(this));
    viewer.subscribe('mouseup', this.handleUp.bind(this));

    this.updateView();
  }

  componentDidMount(){
    const canvas = this.refs.canvas;
    const w = canvas.parentNode.clientWidth;
    const h = w * (6/8);
    canvas.width = w;
    canvas.height = h;
    this.viewer = ProcessCanvas.init(canvas);
    this.scene = new ViewObjectList(this.viewer);

    window.addEventListener('resize', this.handleResize.bind(this));
    this.init();
  }

  componentWillUnmount(){
    window.removeEventListener('resize', this.handleResize);
  }

  doubleClick(e){
    e = e || window.event;
    const bounds = event.target.getBoundingClientRect();
    const {
      viewer,
      scene,
    } = this;

    const coords = viewer.translateMouseCoords(e.nativeEvent, viewer.canvas);
    const clicked = scene.hitTest(coords.x-viewer.translation.x, coords.y-viewer.translation.y);
    this.props.onDoubleClick && this.props.onDoubleClick(e, clicked, coords);
  }

  resizeToFit(){
    const viewer = this.viewer;
    const scene = this.scene;
    const root = viewer.root;
    if(!viewer){
      return;
    }
    const sizedWindowWidth = viewer.parentNode.offsetWidth,
        sizedWindowHeight = sizedWindowWidth * (6 / 8);
    viewer.width = sizedWindowWidth;
    viewer.height = sizedWindowHeight;
    this.recenterViewTree(root);
    viewer.invalidate();
  }

  handleResize(e){
    this.resizeToFit();
  }

  renderView(){
    const rootNode = this.getRootNode();
    const style = rootNode?{display: ''}:{display: 'none'};
    return (
      <div className="processcanvas">
        <canvas style={style} ref="canvas" onDoubleClick={this.doubleClick.bind(this)} />
      </div>
    );
  }

  render(){
    return this.renderView();
  }
};

module.exports = DependencyGraph;
