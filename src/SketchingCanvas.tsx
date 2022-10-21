/* eslint-disable */
import * as THREE from 'three'
import * as React from 'react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Canvas, useFrame, extend, useThree, ThreeEvent } from '@react-three/fiber'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { CycleRaycast, GizmoHelper, GizmoViewcube, GizmoViewport, Line, OrthographicCamera, PerspectiveCamera, PivotControls, Select, TransformControls, useCursor, useSelect } from '@react-three/drei';
import Slider, {SliderValueLabelProps } from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
//@ts-ignore
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'meshline'
import e from 'express';
import { Object3D } from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import InfoIcon from '@mui/icons-material/Info';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import ThreeDRotationIcon from '@mui/icons-material/ThreeDRotation';
import GridOnIcon from '@mui/icons-material/GridOn';
import GridOffIcon from '@mui/icons-material/GridOff';
import { IconButton } from '@mui/material';
import Button from '@mui/material/Button';
import { GLTFExporter} from 'three/examples/jsm/exporters/GLTFExporter'

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

type canvasFunctionsProps={
  updateSelected: (index: string|null) => void;
}

let objectClicked = false;
function Box(props: JSX.IntrinsicElements['mesh']) {
  // This reference will give us direct access to the THREE.Mesh object
  const ref = useRef<THREE.Mesh>(null!)
  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false)
  const [clicked, click] = useState(false)
  // Rotate mesh every frame, this is outside of React without overhead
  // useFrame((state, delta) => (ref.current.rotation.x += 0.01))

  return (
    <mesh
      {...props}
      ref={ref}
      scale={clicked ? 1.5 : 1}
      onClick={(event) => click(!clicked)}
      onPointerOver={(event) => hover(true)}
      onPointerOut={(event) => hover(false)}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  )
}

function TheLine({points, isDrawing, index, canvasFunctions, transform, updateTransform}
  :{ 
    points:THREE.Vector3Tuple[],
    isDrawing:boolean, 
    index:string, 
    canvasFunctions:canvasFunctionsProps,
    transform:THREE.Matrix4|undefined,
    updateTransform(id: string, transform: THREE.Matrix4): void
  }) {
  const { size } = useThree();
  // This reference will give us direct access to the THREE.Mesh object
  const ref = useRef<Line2>(null!)
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
  }, [])

  return (
    <PivotControls
    ref={pivotRef}
    autoTransform={true}
    // matrix={transform}
    onDragEnd={()=>setLocalTransform(pivotRef.current.matrix)}
    anchor={[0, 0, 0]} 
    visible={clicked} 
    disableAxes={!clicked} 
    disableSliders={!clicked} 
    disableRotations={!clicked}>
    <Line
    // applyMatrix4={(matrix)=>transform}
    // matrix={transform}

    isMesh={true}
        points={points}
        opacity={hovered||clicked?0.6:1}
        lineWidth={6}
        dashed={false}
        ref={ref}
        onPointerOver={()=>!isDrawing&&hover(true)}
        onPointerOut={()=>hover(false)}
        // raycast={MeshLineRaycast}
      />




      {/* <mesh
        raycast={MeshLineRaycast}
        ref={ref}
        onPointerOver={()=>!isDrawing&&hover(true)}
        onPointerOut={()=>hover(false)}>
          // @ts-ignore 
        <meshLine attach="geometry" points={points.flat()} isMeshLine={false} />
        // @ts-ignore 
        <meshLineMaterial
          sizeAttenuation={1}
          attach="material"
          lineWidth={0.05}
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



function Sketch({mousePos,lineNumber, depth,isDrawing, canvasFunctions, deleteLine, loadLines}:{
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
  }|null
}){
  const {camera, scene} = useThree();
  const [renderPoints, setRenderPoints]=useState<Array<THREE.Vector3Tuple|undefined>>([]);
  const [points, setPoints] = useState<{[line:string]:Array<THREE.Vector3Tuple|undefined>}>({})
  const [transforms, setTransforms] = useState<{[line:string]:THREE.Matrix4|undefined}>({})
  // function getPoint(event:React.MouseEvent) {
  useEffect(()=>{
    let zoomLvl = camera.position.distanceTo(new THREE.Vector3())
    if(mousePos.x===0&&mousePos.y===0){
      return
    }
    mouse.x = (mousePos.x / window.innerWidth) * 2 - 1;
    mouse.y = -(mousePos.y / window.innerHeight) * 2 + 1;
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
      {Object.keys(points).length !== 0 &&
      
        <Select multiple border='#000' onChange={(e)=>{setSelected(e)}}>
        {Object.keys(points).map((keyIndex,index) =>
            
            <TheLine key={index} 
            index={keyIndex} 
            canvasFunctions={canvasFunctions} 
            isDrawing={isDrawing} 
            points={points[keyIndex] as THREE.Vector3Tuple[]} 
            updateTransform={updateTransform}
            transform={transforms[keyIndex]}
            />
            
          )
        }
        </Select>
      }
      {/* {active && <TransformControls object={active} />} */}
      {/* {renderPoints.length !== 0 &&
        renderPoints.map((item, index) => (
          <Box position={item} />
        ))} */}
    </>
  )
}


export default function SketchingCanvas() {
  const [mousePos,setMousePoint] = useState({x:0,y:0});
  const [isMouseDown,setMouseDown] = useState(false);
  const [lineNumber,setLine] = useState<string|null>(makeid(8));
  const [isDrawing,setIsDrawing] = useState(false);
  const [depth,setDepth] = useState(0);
  const [Selected,setSelected] = useState<string|null>(null);
  const [deleteLine, setDeleteLine] = useState<string|null>(null);
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
  };

  useEffect(()=>{
    // console.log(Selected)
  },[Selected])

  let canvasFunctions:canvasFunctionsProps={
    updateSelected:updateSelected,
  }
  return (
    <>
      <div style={{height:'60%', position:'absolute', zIndex:2, padding:'10px', marginTop:'calc((100vh - (60vh + 20px))/2)'}}>
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
    <div style={{position:'absolute', right:'10px', top:'10px',display:'block'}}>
        <IconButton onClick={() => setShowGrid(!showGrid)} style={{ zIndex: 3, opacity: 0.7 }}>
          {showGrid ? <GridOnIcon htmlColor='#000' /> : <GridOffIcon htmlColor='#000' />}
        </IconButton>
        <IconButton onClick={() => setDisplayModal(true)} style={{ zIndex: 3, opacity: 0.7 }}>
          <InfoIcon htmlColor='#000' />
        </IconButton>
      </div>
    <div className='InfoModal' style={{display:displayModal?'block':'none'}}>
        <div style={{ position: 'absolute',right:0 }}>
          <IconButton onClick={() => setDisplayModal(false)} style={{ zIndex: 3, opacity: 0.7 }}>
            <CancelIcon htmlColor='#000' />
          </IconButton>
        </div>
        <div style={{display:'flex', flexDirection:'column', width:'100%', height:'100%', justifyContent:'center', alignItems:'center'}}>
          <div style={{display:'flex', paddingTop:'20px',flexDirection:'column', justifyContent:'space-around',width:'100%', height:'100%', alignItems:'center', overflow:'scroll'}}>
          <div style={{ display: 'flex', padding: '10px', width:'50vh', alignItems:'center' }}>
            <img style={{ width: '40px', height: '40px' }} src={require("./assets/leftMouse.png")} />
            <p style={{margin:0, marginLeft:'10px'}}>Click and drag to start sketching anywhere. Your drawings will be added to this scene. Additionally, you can click on any line and change it's position or rotation. While a line is selected, press the delete key to remove it.</p>
          </div>
          <div style={{ display: 'flex', padding: '10px', width:'50vh', alignItems:'center' }}>
            <img style={{ width: '40px', height: '40px' }} src={require("./assets/rightMouse.png")} />
            <p style={{margin:0, marginLeft:'10px'}}>Right click and drag to rotate the view. You can pan around the scene by dragging while holding the shift key.</p>
          </div>
          <div style={{ display: 'flex', padding: '10px', width:'50vh', alignItems:'center' }}>
            <img style={{ width: '40px', height: '40px' }} src={require("./assets/scrollMouse.png")} />
            <p style={{margin:0, marginLeft:'10px'}}>Scroll to zoom in or out.</p>
          </div>
          <div style={{ display: 'flex', padding: '10px', width:'50vh', alignItems:'center' }}>
            <img style={{ width: '40px', height: '40px' }} src={require("./assets/slider.png")} />
            <p style={{margin:0, marginLeft:'10px'}}>Use the slider to draw at a specific depth. Default is 0, move it up or down to draw at multiple depths from the same perspective.</p>
          </div>
          </div>
          <div style={{ display: 'flex', padding: '10px',paddingTop:'0' ,width:'50vh', alignItems:'center', justifyContent:'space-evenly' }}>
            {/* <Button 
              onClick={() => {
                if(DrawingScene===null){
                  return
                }
                // downloadObjectAsJson(DrawingScene.toJSON(),'scene')
                // DrawingScene.children[0].children.forEach((item)=>{
                //   let obj = item.children[0].children[1].children[0] as Line2;
                //   let LineGeometry = obj.geometry.clone();
                //   LineGeometry.applyMatrix4(obj.matrix);
                //   console.log(Array.from(LineGeometry.attributes.position.array))
                // })
              }}
            startIcon={<ThreeDRotationIcon/>} size={'small'} variant="contained">Export as OBJ</Button> */}
            <Button onClick={() => {if(DrawingObject)
                downloadObjectAsJson(DrawingObject, '3D Sketch')
              }}startIcon={<SaveAltIcon />} size={'small'} variant="contained">Save Drawing</Button>
              <Button onClick={() => {
              let theinput = document.createElement('input');
              theinput.type = 'file';
              theinput.onchange = (e) => {
                const fileReader = new FileReader();//@ts-ignore
                fileReader.readAsText(e.target?.files[0], "UTF-8");
                fileReader.onload = e => {//@ts-ignore
                  // console.log(JSON.parse(e.target?.result));
                  //@ts-ignore
                  setLoadLines(JSON.parse(e.target?.result));
                  setTimeout(() => {
                    setLoadLines(null);
                  }, 100);
                };
              };
              theinput.click();
              }}startIcon={<ThreeDRotationIcon />} size={'small'} variant="contained">Load Drawing</Button>
          </div>


          <p style={{bottom: 0, width: "100%", textAlign: "center", marginTop: "4px"}}>Made by 
          <a style={{color:'black', textDecorationColor:'#03dac6'}} href="https://adigunturu.com"> Aditya Gunturu</a> (and lots of ☕) using <a style={{color:'black', textDecorationColor:'#03dac6'}} href="https://threejs.org">Three.js</a>
          </p>

        </div>
    </div>
    <Canvas 
    tabIndex={0}
    onKeyDown={(e)=>{
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
      if(objectClicked){
        return
      }
      setMouseDown(false);
      // console.log('was drawing',isDrawing);
      if(isDrawing){
        setLine(makeid(8));
      }
      setIsDrawing(false)
    }}
    onMouseMove={(e)=>{
      if(objectClicked){
        return
      }
      if(isMouseDown){
        setMousePoint({x:e.clientX,y:e.clientY});
        setIsDrawing(true)
      }
    }}
    // onClick={(e)=>{objectClicked=false}}
    >
      <Sketch loadLines={loadLines} deleteLine={deleteLine} canvasFunctions={canvasFunctions} isDrawing={isDrawing} depth={depth} lineNumber={lineNumber} mousePos={mousePos} />
      <OrthographicCamera zoom={80} makeDefault position={[0, 0, 10]} />
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
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />
      {/* <Box position={[-1.2, 0, 0]} />
      <Box position={[1.2, 0, 0]} /> */}
      <gridHelper visible={showGrid} />
    </Canvas>
    </> 
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