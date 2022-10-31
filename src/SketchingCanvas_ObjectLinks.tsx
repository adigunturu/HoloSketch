/* eslint-disable */
import * as THREE from 'three'
import * as React from 'react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Canvas, useFrame, extend, useThree, ThreeEvent } from '@react-three/fiber'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { CycleRaycast, GizmoHelper, GizmoViewcube, GizmoViewport, Line, OrthographicCamera, PerspectiveCamera, PivotControls, Plane, RoundedBox, Select, TransformControls, useCursor, useSelect } from '@react-three/drei';
import Slider, {SliderValueLabelProps } from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
//@ts-ignore
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'meshline'
import { Object3D, Vector3 } from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';

// import * as meshline from 'meshline'
extend({ MeshLine, MeshLineMaterial })
// extend(meshline)


let DrawingObject: {
  points: {
    [line: string]: Array<THREE.Vector3Tuple | undefined>
  },
  transforms:{
    [line: string]: THREE.Matrix4|undefined
  }
}|null = null
let DrawingScene:THREE.Scene|null = null;
let SelectedObject:THREE.Mesh|null = null;
let selectedObjectIndex:string|null = null;

type canvasFunctionsProps={
  updateSelected: (index: string|null) => void;
}

let linked = false;
let latestStrokeId:null|string = null;
let objectTransformMatrix:THREE.Matrix4|null = null
let objectTransformObject:{RelPos:[number,number,number], rotation:THREE.Quaternion, scale?:number}|null = null
let scaleOnMove = true;
let currentkeyPressed:string|null =null;

let objectClicked = false;
function Box(props: {position:[number,number,number], index:string, type:'cube'|'sphere'|'plane', objectRef:React.MutableRefObject<THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>>}) {
  // This reference will give us direct access to the THREE.Mesh object
  const ref = useRef<THREE.Mesh>(null!)
  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false)
  const [clicked, click] = useState(false)
  // Rotate mesh every frame, this is outside of React without overhead
  // useFrame((state, delta) => (ref.current.rotation.x += 0.01))

  return (
    // <mesh
    //   {...props}
    //   ref={ref}
    //   scale={clicked ? 1.5 : 1}
    //   onClick={(event) => SelectedObject = ref.current}
    //   // onPointerOver={(event) => hover(true)}
    //   // onPointerOut={(event) => hover(false)}
    //   >
    //   <boxGeometry args={[1, 1, 1]} />
    //   <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    // </mesh>

    props.type==='cube'||props.type==='sphere'?
    <RoundedBox matrixAutoUpdate={true} scale={props.type==='sphere'?[1.4,1.4,1.4]:[1,1,1]} ref={props.objectRef} onClick={(event) => {SelectedObject = props.objectRef.current; selectedObjectIndex=props.index; }}  radius={props.type==='sphere'?0.5:0} smoothness={30} {...props}>
      <meshStandardMaterial  color="white" />
    </RoundedBox>:
    props.type==='plane'?<Plane matrixAutoUpdate={true} ref={props.objectRef} onClick={(event) => {SelectedObject = props.objectRef.current; selectedObjectIndex=props.index; }} args={[2,2]} {...props}>
      <meshStandardMaterial transparent={true} opacity={0.9} color="white" />
    </Plane>:null
  )
}


function SplineLine({points,objectref, isDrawing}:{points:THREE.Vector3Tuple[],objectref:THREE.Mesh, isDrawing:boolean}){

  const [mesh, setMesh] = useState<{material:THREE.Material,geometry:THREE.TubeGeometry}|null>(null)

  useEffect(()=>{
    if(!points||points===undefined||points.length===0||points.length<5){
      return
    }
    const mappedPoints = points.map(pt => new THREE.Vector3(...pt));
    const beizerPoints = customcalculator(points)
    // console.log(mappedPoints)
    // const curve = new THREE.CubicBezierCurve3(new THREE.Vector3(...points[0]), new THREE.Vector3(...points[4]), new THREE.Vector3(...points[points.length-5]), new THREE.Vector3(...points[points.length-1]));
    // const curvePoints = curve.getPoints( 
    //   // mappedPoints.length
    //   // >2?Math.round(mappedPoints.length/2):mappedPoints.length
    //   );
    
    // const geometry = new THREE.BufferGeometry().setFromPoints( curve.getPoints(points.length) );
    // const material = new THREE.LineBasicMaterial( { color: 0xff0000 } );
    // const curveObject = new THREE.Line( geometry, material );
    let filteredPoints;
    if(points.length<1){
        filteredPoints = mappedPoints
    }else{
        filteredPoints = mappedPoints
        .filter((v,i)=>{
            return i%3===0
        });
    }
    
    // filteredPoints.forEach((item,index)=>{
    //     if(index!==0){
    //         console.log(item.distanceTo(filteredPoints[index-1]))

    //     }
    // })


    const curve = new THREE.CatmullRomCurve3(filteredPoints, false, 'centripetal', 0);
    const curvePoints = curve.getPoints(mappedPoints.length);
    let geometry = new THREE.TubeGeometry( curve, 1000, 0.08, 20 );
    // const geometry = new THREE.BufferGeometry().setFromPoints( curve.getPoints(points.length) );
    const material = new THREE.MeshPhongMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    // const material = new THREE.LineBasicMaterial( { color: 0xff0000 } );
    const curveObject = new THREE.Mesh( geometry, material );
    setMesh({material:material, geometry:geometry});
  },[points])

// @ts-ignore
  return( mesh&&<mesh ref={objectref} castShadow={true} receiveShadow={true} frustumCulled={true} geometry={mesh.geometry} material={mesh.material} />)
}


function TheLine({points, isDrawing, index, canvasFunctions, transform, updateTransform, transformDict}
  :{ 
    points:THREE.Vector3Tuple[],
    isDrawing:boolean, 
    index:string, 
    canvasFunctions:canvasFunctionsProps,
    transform:THREE.Matrix4|undefined,
    updateTransform(id: string, transform: THREE.Matrix4): void,
    transformDict:{RelPos:[number,number,number], rotation:THREE.Quaternion, scale?:number}|null
  }) {
  const { size } = useThree();
  // This reference will give us direct access to the THREE.Mesh object
  const ref = useRef<THREE.Mesh>(null!)
  const pivotRef = useRef<THREE.Group>(null!)
  // Hold state for hovered and clicked events
  // useLayoutEffect(() => {
  //   let temparr = []
  //   points.forEach((item)=>{//@ts-ignore
  //     temparr.push(new THREE.Vector3(...item))
  //   })
  //   ref.current.geometry.setFromPoints(temparr)
  // }, [])
  const [hovered, hover] = useState(false)
  const [clicked, click] = useState(false)
  const [LocalTransform, setLocalTransform] = useState<THREE.Matrix4|undefined>()
  const [initialPosition, setInitialPosition] = useState<THREE.Vector3|null>(null)
  const [initialScale, setinitialScale] = useState<THREE.Vector3>(new THREE.Vector3(1,1,1))
  const [updatedInitialPosition, setUpdatedIntialPosition] = useState<THREE.Vector3|null>(null)
  // Rotate mesh every frame, this is outside of React without overhead
  // useFrame((state, delta) => (ref.current.rotation.x += 0.01))
  // console.log(points)
  const selected = useSelect();
  useCursor(hovered, /*'pointer', 'auto'*/)
  useEffect(()=>{
    // console.log(selected[0], selected[0]===ref.current);
    if(selected[0]===ref.current){
      click(true);
      canvasFunctions.updateSelected(index)
    }else{
      click(false)
    }
  },[selected]);

  useEffect(()=>{
    // if(transform!==undefined)
    // ref.current.applyMatrix4(transform)
    if(LocalTransform!==undefined){
      updateTransform(index, LocalTransform)
    }
  },[LocalTransform]);


  useEffect(() => {
    if (transform !== undefined) {
      // console.log('applying transform', transform)
      ref.current.applyMatrix4(transform)
    }
  }, []);

  useEffect(()=>{
    if(!isDrawing&&!initialPosition&&ref.current){
        setTimeout(() => {
            let vec = new THREE.Vector3()
      let tempPoint = points[Math.floor(points.length/2)];
      let origin = getCenterPoint(ref.current);
      if(origin===undefined){
        return
      }
    //   console.log(origin.x,origin.y,origin.z);
      // ref.current.position.set(tempPoint[0], tempPoint[1], tempPoint[2])
      ref.current.position.set(origin.x,origin.y,origin.z);
    //   console.log('setting to origin')
      ref.current.geometry.center()
      setInitialPosition(origin);
        }, 10);
    }
  },[isDrawing])

  useEffect(()=>{
    if(transformDict&&ref.current){
        if(currentkeyPressed==='AltLeft'&&transformDict.scale!==undefined){
            // console.log(transformDict.scale);
            let newScale = initialScale.z+transformDict.scale
            ref.current.scale.set(newScale,newScale,newScale)
            return
        }
      // ref.current.applyMatrix4(objectTransformMatrix);
      let TransformedVector =  new THREE.Vector3();//@ts-ignore
      TransformedVector=TransformedVector?.addVectors(initialPosition as THREE.Vector3,transformDict.RelPos[4].multiplyScalar(transformDict.RelPos[3]))
      ref.current.position.set(TransformedVector.x,TransformedVector.y,TransformedVector.z);
      setUpdatedIntialPosition(TransformedVector)
    //   setInitialPosition(TransformedVector)
    //   ref.current.translateX(transformDict?.RelPos[0] as number)
    //   ref.current.translateY(transformDict?.RelPos[1] as number)
    //   ref.current.translateZ(transformDict?.RelPos[2] as number)
      //@ts-ignore
    //   ref.current.rotateX(transformDict?.rotation.x)
    //   //@ts-ignore
    //   ref.current.rotateY(transformDict?.rotation.y)
    //   //@ts-ignore
    //   ref.current.rotateZ(transformDict?.rotation.z)
    //   ref.current.updateMatrix()

    ref.current.setRotationFromQuaternion(transformDict?.rotation)
    }else{
        if (updatedInitialPosition && transformDict === null) {
            setInitialPosition(updatedInitialPosition);
        }

        if(ref.current){
            let tempScale = new THREE.Vector3()
            ref.current.getWorldScale(tempScale)
            setinitialScale(tempScale);
            console.log(tempScale.z)
        }
    }
  },[transformDict])

  return (
    <PivotControls
    ref={pivotRef}
    fixed={true}
    scale={60}
    depthTest={false}
    autoTransform={true}
    // matrix={transform}
    onDragEnd={()=>setLocalTransform(pivotRef.current.matrix)}
    anchor={[0, 0, 0]} 
    visible={clicked} 
    disableAxes={!clicked} 
    disableSliders={!clicked} 
    disableRotations={!clicked}>

    {/* <Line
    isMesh={true}
        points={points}
        opacity={hovered||clicked?0.6:1}
        lineWidth={6}
        dashed={false}
        ref={ref}
        onPointerOver={()=>!isDrawing&&hover(true)}
        onPointerOut={()=>hover(false)}
        // raycast={MeshLineRaycast}
      /> */}
      {/* @ts-ignore */}
    <SplineLine isDrawing={isDrawing} objectref={ref} points={points}/>



      {/* <mesh
        raycast={MeshLineRaycast}
        ref={ref}
        onPointerOver={()=>!isDrawing&&hover(true)}
        onPointerOut={()=>hover(false)}>
          //@ts-ignore
        <meshLine attach="geometry" points={points.flat()} isMeshLine={true} />
        //@ts-ignore  
        <meshLineMaterial
          sizeAttenuation={1}
          attach="material"
          lineWidth={0.01}
          color={'black'}
          resolution={new THREE.Vector2(size.width, size.height)}
        />
      </mesh>  */}


    </PivotControls>
    // <mesh
      // {...position}
      // raycast={MeshLineRaycast}
      // ref={ref}
      // // scale={clicked ? 1.5 : 1}
      // onDoubleClick={(e) => {
      //   e.stopPropagation()
        
      //   // setTimeout(() => {
      //     if(clicked){
      //       objectClicked = false;
      //     }else{
      //       objectClicked = true
      //     }
      //   // }, 10);
      //   click(!clicked)
      // }}
      // onClick={(e)=>{
      //   console.log('line click')
      //   objectClicked = false;
      //   click(false)
      // }}
      // onPointerOver={(event) => {event.stopPropagation(); hover(true)}}
      // onPointerOut={(event) => {event.stopPropagation(); hover(false)}}>
    //    <meshLine attach="geometry" points={points.flat()} isMeshLine={false} /> 
    //    <meshLineMaterial
    //     sizeAttenuation={1}
    //     attach="material"
    //     lineWidth={0.05}
    //     color={'black'}
    //     resolution={new THREE.Vector2(size.width, size.height)}
    //     // near={1}
    //     // far={1000}
    //     transparent
    //     opacity={hovered?0.5:1}
    //     /> 
    //  </mesh> 
      
    //  </PivotControls> 
    
    // <line ref={ref}>
    //   <bufferGeometry  />
    //   <lineBasicMaterial color="hotpink"  />
    //   </line>

  )
}

const Controller = () => {
  const { camera, gl } = useThree();
  useEffect(
    () => {
      const controls = new OrbitControls(camera, gl.domElement);
        controls.enableZoom = true;
        controls.enableRotate = true;
        controls.enablePan = true;
        controls.minDistance = 3;
        controls.maxDistance = 20;
        controls.mouseButtons = { 
          LEFT: undefined,
          MIDDLE:THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.ROTATE 
        };
      
      
      return () => {
        controls.dispose();
      };
    },[camera, gl]);
  return null;
};
var raycaster = new THREE.Raycaster();
var plane = new THREE.Plane();
var planeNormal = new THREE.Vector3();
var point = new THREE.Vector3();
var mouse = new THREE.Vector2();



function Sketch({mousePos,lineNumber, depth,isDrawing, canvasFunctions, deleteLine, loadLines, objectsInScene,transformDict}:{
  mousePos:{x:number,y:number},
  lineNumber:string|null, 
  depth:number,
  isDrawing:boolean, 
  canvasFunctions:canvasFunctionsProps, 
  deleteLine:string|null,
  loadLines:{
    points: {
      [line: string]: Array<THREE.Vector3Tuple | undefined>
    },
    transforms:{
      [line: string]: THREE.Matrix4|undefined
    }
  }|null,
  objectsInScene:{index:string, type:'plane'|'cube'|'sphere'}[],
  transformDict:{RelPos:[number,number,number], rotation:THREE.Quaternion}|null
}){
  const {camera, scene} = useThree();
  const [renderPoints, setRenderPoints]=useState<Array<THREE.Vector3Tuple|undefined>>([]);
  const [points, setPoints] = useState<{[line:string]:Array<THREE.Vector3Tuple|undefined>}>({})
  const [transforms, setTransforms] = useState<{[line:string]:THREE.Matrix4|undefined}>({})
  // function getPoint(event:React.MouseEvent) {
  useEffect(()=>{
    let zoomLvl = camera.position.distanceTo(new THREE.Vector3());
    if(mousePos.x===0&&mousePos.y===0){
      return
    }
    mouse.x = (mousePos.x / window.innerWidth) * 2 - 1;
    mouse.y = -(mousePos.y / window.innerHeight) * 2 + 1;

    if (SelectedObject) {
      raycaster.setFromCamera(mouse, camera);
      const intersections = raycaster.intersectObject(SelectedObject);
      if (intersections && intersections.length) {
        if(intersections[0].face&&intersections[0].face!==undefined){
          let newpoint:THREE.Vector3|undefined = intersections[0].point.add( intersections[0].face.normal.multiplyScalar( 0.01 ) );
          let tempPoint = newpoint.toArray();
          setRenderPoints((prev) => [...prev, tempPoint]);
          let temparr = renderPoints;
          temparr.push(tempPoint);
          if (lineNumber) {
            setPoints((prev) => ({ ...prev, [lineNumber]: temparr }))
          }
        }
      }
      
      return
    }

    planeNormal.copy(camera.position).normalize();
    //depth code and plane position
    
    // plane.setFromNormalAndCoplanarPoint(planeNormal,
    //   scene.position
    //   );
    // plane.set(planeNormal, calcPlaneDistance(10, zoomLvl))
    plane.set(planeNormal, depth)


    raycaster.setFromCamera(mouse, camera);
    let tempPoint = raycaster.ray.intersectPlane(plane, point/*point*/)?.toArray();
    
    // console.log(zoomLvl);
    setRenderPoints((prev)=>[...prev, tempPoint]);
    let temparr = renderPoints;
    temparr.push(tempPoint);
    if(lineNumber){
      setPoints((prev)=>({...prev,[lineNumber]:temparr}))
    }
  },[mousePos]);
  useEffect(()=>{
    // console.log('deleteline',deleteLine)
    if(deleteLine!==null){
      let tempObj = points
      delete tempObj[deleteLine]
      setPoints(tempObj);
      // console.log(tempObj);

    }
  },[deleteLine]);

  useEffect(() => {
    if (loadLines !== null) {
      setPoints(loadLines.points);
      setTransforms(loadLines.transforms);
      // console.log(loadLines)
    }
  }, [loadLines])

  useEffect(()=>{
    setRenderPoints([]);
  },[lineNumber]);

  useEffect(()=>{
    DrawingObject = {points:points, transforms:transforms};
    // console.log(DrawingObject)
  },[points, transforms])
  useEffect(()=>{
    DrawingScene=scene;
    // console.log(scene)
  },[scene,points])

  // }
  const [selected, setSelected] = React.useState<Object3D[]>([])
  const active = selected[0]
  useEffect(()=>{
    if(active){
      objectClicked = true;
      // console.log(points)
    }else{
      objectClicked=false;
      canvasFunctions.updateSelected(null)
    }
    
  },[active])


  function updateTransform(id:string, transform:THREE.Matrix4){
    setTransforms((prev)=>({...prev,[id]:transform}))
  }

  return (
    <> 
      <Select multiple border='#000' onChange={(e) => { setSelected(e) }}>
        {Object.keys(points).length !== 0 &&
          Object.keys(points).map((keyIndex, index) => (
        <TheLine transformDict={transformDict} key={index}
              index={keyIndex}
              canvasFunctions={canvasFunctions}
              isDrawing={isDrawing}
              points={points[keyIndex] as THREE.Vector3Tuple[]}
              updateTransform={updateTransform}
              transform={transforms[keyIndex]}
            />
          ))
        }
      </Select>
      {/* {active && <TransformControls object={active} />} */}
      {/* {renderPoints.length !== 0 &&
        renderPoints.map((item, index) => (
          <Box position={item} />
        ))} */}
    </>
  )
}

var timesPerSecond = 24; // how many times to fire the event per second
var wait = false;

export default function SketchingCanvas_ObjectLinks() {
  const [mousePos,setMousePoint] = useState({x:0,y:0});
  const [objectsInScene,setObjectsInScene] = useState<{type:'sphere'|'cube'|'plane',index:string}[]>([]);
  const [isMouseDown,setMouseDown] = useState(false);
  const [lineNumber,setLine] = useState<string|null>(makeid(8));
  const [isDrawing,setIsDrawing] = useState(false);
  const [depth,setDepth] = useState(0);
  const [Selected,setSelected] = useState<string|null>(null);
  const [deleteLine, setDeleteLine] = useState<string|null>(null);
  const [transformDict, setTransformDict] = useState<{RelPos:[number,number,number], rotation:THREE.Quaternion}|null>(null);
  const [loadLines, setLoadLines] = useState<{
    points: {
      [line: string]: Array<THREE.Vector3Tuple | undefined>
    },
    transforms:{
      [line: string]: THREE.Matrix4|undefined
    }
  }|null>(null);
  const [displayModal, setDisplayModal] = useState(false);
  const [showGrid, setShowGrid] = useState(true);


  function updateSelected(index:string|null){
    setSelected(index);
    // console.log('selected',index);
    selectedObjectIndex=null
    SelectedObject=null
  };

  function updateDraggingTransformObject(object:{RelPos:[number,number,number], rotation:THREE.Quaternion, scale?:number}|null, nullify=false){
    if(!nullify){
        setTransformDict(object)
    }else{
        setTransformDict(null)
    }
  }

  useEffect(()=>{
    setObjectsInScene([{type:'sphere', index:makeid(8)}])
  },[])

  let canvasFunctions:canvasFunctionsProps={
    updateSelected:updateSelected,
  }
  return (
    <>
      <div style={{height:'60%', position:'absolute', zIndex:2, padding:'10px', marginTop:'calc((100vh - (60vh + 20px))/2)', display:'none'}}>
        <Slider
          defaultValue={0}
          step={1}
          min={-10}
          max={10}
          marks
          orientation="vertical"
          track={false}
          valueLabelDisplay="auto"
          components={{
            ValueLabel:ValueLabelComponent
          }}
          value={depth}
          onChange={(e,v)=>setDepth(v as number)}
        />
      </div>
    
    <Canvas 
    onPointerMissed={()=>{SelectedObject=null; selectedObjectIndex=null}}
    tabIndex={0}
    onKeyUp={()=>{
        currentkeyPressed = null
    }}
    onKeyDown={(e)=>{
        currentkeyPressed = e.code;
      // console.log(e.code,Selected)
      if(e.code==="Delete" && Selected!==null){
        console.log('deleting', Selected)
        
        // document.getRootNode.click()
        objectClicked = false;
        updateSelected(null)
        setDeleteLine(Selected);
        setTimeout(() => {
          setDeleteLine(null)
        }, 100);
        
      }
      if(selectedObjectIndex&&e.code==="Delete"){
        let tempArr = [...objectsInScene];
        tempArr.forEach((item,index)=>{
          if(item.index===selectedObjectIndex){
            tempArr.splice(index,1)
          }
        });
        setObjectsInScene(tempArr);
      }
    }}
    onMouseDown={(e)=>{
      if(objectClicked){
        return
      }
      if(e.button===0){
        setMouseDown(true);
        //console.log('mousedown',e.clientX,e.clientY)
      }
    }}
    onMouseUp={(e)=>{
      setMouseDown(false);
      if(objectClicked){
        return
      }
      
      // console.log('was drawing',isDrawing);
      if(isDrawing){
        const NewLineID = makeid(8)
        setLine(NewLineID);
        latestStrokeId = NewLineID;
      }
      setIsDrawing(false)
    }}
    onMouseMove={(e)=>{
      if(objectClicked){
        // console.log('returning cause object clicked')
        return
      }
      if(isMouseDown){
        setMousePoint({ x: e.clientX, y: e.clientY });
        setIsDrawing(true)
        // if (!wait) {
        //   // fire the event
        //   setMousePoint({ x: e.clientX, y: e.clientY });
        //   setIsDrawing(true)
        //   // stop any further events
        //   wait = true;
        //   // after a fraction of a second, allow events again
        //   setTimeout(function () {
        //     wait = false;
        //   }, 1000 / timesPerSecond);
        // }
      }
    }}
    // onClick={(e)=>{objectClicked=false}}
    >
      <Sketch transformDict={transformDict} objectsInScene={objectsInScene} loadLines={loadLines} deleteLine={deleteLine} canvasFunctions={canvasFunctions} isDrawing={isDrawing} depth={depth} lineNumber={lineNumber} mousePos={mousePos} />
      {/* <ThreeDObjects canvasFunctions={canvasFunctions} isDrawing={isDrawing}  objectsInScene={objectsInScene}/> */}
      <OrthographicCamera makeDefault zoom={80} position={[10, 4, 4]} />
         {/* <perspectiveCamera position={[10, 4, 4]}*/}
      {/* <OrbitControls  
      domElement={document.getElementById('CanvasControls') as HTMLElement}
      /> */}
      {/* <PanController /> */}
      <Controller/>
      <GizmoHelper
        alignment="bottom-right" // widget alignment within scene
        margin={[80, 80]} // widget margins (X, Y)
      >
        <GizmoViewport />
        {/* alternative: <GizmoViewcube /> */}
      </GizmoHelper>
      <ambientLight intensity={0.5} />
      <spotLight position={[20, 4, 10]} angle={0.60} penumbra={1} />
      {/* <pointLight position={[-10, -10, -10]} /> */}
      {/* <Box position={[-1.2, 0, 0]} />
      <Box position={[1.2, 0, 0]} /> */}
      {objectsInScene.map((item)=>(
        <BaseObject updateDraggingTransformObject={updateDraggingTransformObject} key={item.index} item={item} isDrawing={isDrawing} index={item.index}/>
        ))}
      <gridHelper visible={showGrid} />
    </Canvas>
    </> 
  )
}

function BaseObject(props:{item:{type: 'sphere' | 'cube' | 'plane';index: string}, isDrawing:boolean, index:string, updateDraggingTransformObject:(object:any, nullify?:boolean)=>void}){
  const transformref = useRef()
  const objectRef = useRef<THREE.Mesh>(null!)
  const [isDraggingPivot, setDraggingPivot] = useState(false);
  const [initialPosition, setInitialPosition] = useState<THREE.Vector3>(new THREE.Vector3());
  useEffect(()=>{
    if(isDraggingPivot){
      objectClicked=true;
    }else{
      objectClicked=false
    }
  },[isDraggingPivot]);

  useEffect(()=>{
    let randomVec = new THREE.Vector3();
    objectRef.current.getWorldPosition(randomVec);
    setInitialPosition(randomVec)
    console.log(randomVec)
  },[])

  return(
  <PivotControls 
  //@ts-ignore
  ref={transformref}
    onDragStart={()=>setDraggingPivot(true)}//@ts-ignore
    onDragEnd={()=>{
      setDraggingPivot(false);
      let randomVectwo = new THREE.Vector3();
      objectRef.current.getWorldPosition(randomVectwo);
    //   console.log(randomVectwo)
      setInitialPosition(randomVectwo);
      props.updateDraggingTransformObject(null, true)
    }}
    onDrag={(l,dl,w,dw)=>{
        // console.log(currentkeyPressed)
        if(currentkeyPressed === 'AltLeft'){
           let quartn = new THREE.Quaternion()
           let vec = new THREE.Vector3()
           let scale = new THREE.Vector3()
           l.decompose(vec, quartn, scale);
           objectTransformObject = {RelPos: [0,0, 0], rotation:quartn, scale:0-(initialPosition?.z-vec.z)};
           props.updateDraggingTransformObject(objectTransformObject)
            return
        }


      var vec = new THREE.Vector3();//@ts-ignore
      //vec.setFromMatrixPosition(transformref.current?.matrix);
      var rotation = new THREE.Quaternion();
      var scale = new THREE.Vector3();
      dl.decompose(vec, rotation, scale);
      objectTransformMatrix = dl;
      // objectTransformObject = {RelPos: [dl.elements[12],dl.elements[13], dl.elements[14]], rotation:rotation};
      
      var tempVec = new THREE.Vector3();
      var tempQuat = new THREE.Quaternion();
      var temp = new THREE.Vector3();
      objectRef.current.getWorldPosition(tempVec)
      // console.log(objectRef.current.getWorldPosition(tempVec))
      let distance = tempVec.distanceTo(initialPosition as THREE.Vector3)
      objectRef.current.getWorldQuaternion(rotation);
      console.log(rotation)
      let TransformedVector =  new THREE.Vector3();
      TransformedVector=TransformedVector?.addVectors(initialPosition as THREE.Vector3,tempVec.subVectors(tempVec,initialPosition as THREE.Vector3).normalize().multiplyScalar(distance))
    //   console.log(TransformedVector)
      // console.log(objectRef.current.getWorldQuaternion(tempQuat))
      // console.log(tempVec, tempQuat)
      if(rotation.x!==0||rotation.y!==0||rotation.z!==0){
        TransformedVector.x = 0;
        TransformedVector.y = 0;
        TransformedVector.z = 0;
      }//@ts-ignore
      objectTransformObject = {RelPos: [TransformedVector.x,TransformedVector.y, TransformedVector.z, distance, tempVec.subVectors(tempVec,initialPosition as THREE.Vector3).normalize()], rotation:rotation};
      props.updateDraggingTransformObject(objectTransformObject)
    }}
    fixed={true}
    scale={60}
    depthTest={false}
    autoTransform={true}
    anchor={[0, 0, 0]}
    annotationsClass={'transformValues'}
    visible={selectedObjectIndex===props.item.index&&!props.isDrawing||isDraggingPivot}
    disableAxes={selectedObjectIndex===props.item.index&&props.isDrawing&&!isDraggingPivot}
    disableSliders={selectedObjectIndex===props.item.index&&props.isDrawing&&!isDraggingPivot}
    disableRotations={selectedObjectIndex===props.item.index&&props.isDrawing&&!isDraggingPivot}>
   {/* <TransformControls ref={transformref}
   onMouseDown={()=>setDraggingPivot(true)}
    onMouseUp={()=>setDraggingPivot(false)}
    mode="scale"> */}
    <Box objectRef={objectRef} type={props.item.type} index={props.item.index} position={[0, 0, 0]} />
  {/* // </TransformControls> */}
     </PivotControls>
    )
}


function calcPlaneDistance(start:number, current:number){
  return (start-current)
}

function ValueLabelComponent(props: SliderValueLabelProps) {
  const { children, value } = props;

  return (
    <Tooltip enterTouchDelay={0} placement="right" title={value}>
      {children}
    </Tooltip>
  );
}

function makeid(length:number) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function downloadObjectAsStringOBJ(datastr:string, ){
  datastr = "data:text/obj;charset=utf-8," + encodeURIComponent(datastr);
  var downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href",datastr);
  downloadAnchorNode.setAttribute("download", 'sketch' + ".obj");
  document.body.appendChild(downloadAnchorNode); 
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}
function downloadObjectAsJson(exportObj:{
  points: {
    [line: string]: Array<THREE.Vector3Tuple | undefined>
  },
  transforms:{
    [line: string]: THREE.Matrix4|undefined
  }
}, exportName:string){
  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
  var downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href",     dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  document.body.appendChild(downloadAnchorNode); 
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

function customcalculator(points: THREE.Vector3Tuple[]) {
  let arr = points;
  let newArr: THREE.Vector3Tuple[][]=[]
  arr.forEach((item, index) => {
    if (index % 3 === 0) {
      newArr.push(arr.slice(index, index + 4));
    }
  });
  if(newArr.length===0){
    return
  }
  // console.log(newArr);
  return newArr
}

function getCenterPoint(mesh:THREE.Mesh) {
  if(mesh===null){
    return
  }
  var geometry = mesh.geometry;
  geometry.computeBoundingBox();
  var center = new THREE.Vector3();
  geometry.boundingBox?.getCenter( center );
  return center;
}