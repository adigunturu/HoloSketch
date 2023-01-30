/* eslint-disable */
import * as THREE from 'three'
import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import { Canvas, extend, useThree } from '@react-three/fiber'
import { GizmoHelper, GizmoViewcube, GizmoViewport, Line, OrthographicCamera, PerspectiveCamera, PivotControls, Plane, RoundedBox, Select, TransformControls, useCursor, useSelect } from '@react-three/drei';
import Slider from '@mui/material/Slider';
import SolidObject from './components/SolidObject';
import { makeid} from './utils';
import SketchObjects from './components/SketchObjects/SketchObjects';
import { LabelToolTip, PhysicsPlane, UITypeFunction } from './utilComponents';
import ViewController from './components/ViewController';
import TweenExp from './components/TweenExp';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { Physics } from '@react-three/rapier';
import { UIType } from './@types';

type canvasFunctionsProps = {
    updateSelected: (index: string | null) => void;
    updateSelectedObjectFunction:(mesh: THREE.Mesh|null) => void;
    updateSelectedObjectIndexFunction:(string: string|null) => void;
    updateIsObjectSelected:(val:boolean)=>void;
}

export default function SketchingCanvas_ObjectLinks() {
    const [mousePos, setMousePoint] = useState({ x: 0, y: 0 });
    const [objectsInScene, setObjectsInScene] = useState<{ type: 'sphere' | 'cube' | 'plane', index: string }[]>([]);
    const [isMouseDown, setMouseDown] = useState(false);
    const [lineNumber, setLine] = useState<string | null>(makeid(8));
    const [isDrawing, setIsDrawing] = useState(false);
    const [depth, setDepth] = useState(0);
    const [Selected, setSelected] = useState<string | null>(null);
    const [deleteLine, setDeleteLine] = useState<string | null>(null);
    const [lineFullyDrawn, setLineFullyDrawn] = useState<{[line:string]:boolean}>({});
    const [transformDict, setTransformDict] = useState<{ 
        objectPosition:THREE.Vector3,
        objectOldPosition:THREE.Vector3,
        RelPos: [x:number, y:number, z:number, distance:number, direction:THREE.Vector3], 
        rotation: THREE.Quaternion } | null>(null);
    const [loadLines, setLoadLines] = useState<{
        points: {
            [line: string]: Array<THREE.Vector3Tuple | undefined>
        },
        transforms: {
            [line: string]: THREE.Matrix4 | undefined
        }
    } | null>(null);


    const [selectedObjectThreeD,setSelectedObjectThreeD] = useState<THREE.Mesh | null>(null);
    const [selectedObjectIndexThreeD,setSelectedObjectIndex] = useState<string | null>(null);
    const [keyPressed,setKeyPressed] = useState<string | null>(null);
    const [isObjectSelected,setIsObjectSelected] = useState(false);
    function updateSelectedObjectFunction(mesh:THREE.Mesh|null){
        setSelectedObjectThreeD(mesh)
    }
    function updateSelectedObjectIndexFunction(string:string|null){
        setSelectedObjectIndex(string)
    }
    function updateIsObjectSelected(val:boolean){
        setIsObjectSelected(val)
    }
    function updateSelected(index: string | null) {
        setSelected(index);
        setSelectedObjectIndex(null)
        updateSelectedObjectFunction(null)
    };
    function updateDraggingTransformObject(object: { 
        objectOldPosition:THREE.Vector3,
        objectPosition:THREE.Vector3,
        RelPos: [x:number, y:number, z:number, distance:number, direction:THREE.Vector3], 
        rotation: THREE.Quaternion, 
        scale?: number 
    } | null, nullify = false) {
        if (!nullify) {
            setTransformDict(object)
        } else {
            setTransformDict(null)
        }
    }

    useEffect(() => {
        setObjectsInScene([{ type: 'cube', index: makeid(8) }])
    }, [])

    let canvasFunctions: canvasFunctionsProps = {
        updateSelected: updateSelected,
        updateSelectedObjectFunction:updateSelectedObjectFunction,
        updateSelectedObjectIndexFunction:updateSelectedObjectIndexFunction,
        updateIsObjectSelected:updateIsObjectSelected
    }
    const [typeToggle, setTypeToggle] = useState<UIType>(['action_trigger'])
    const [physicsPaused, setPhysicsPaused] = useState(true)
    return (
        <>
        {/* <button style={{position:'absolute',zIndex:111111}} onClick={()=>setEnablePhysics(!PhysicsEnabled)}>{PhysicsEnabled?'pause':'play'}</button> */}
            {/* <div style={{ height: '60%', position: 'absolute', zIndex: 2, padding: '10px', marginTop: 'calc((100vh - (60vh + 20px))/2)'}}>
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
                        ValueLabel: LabelToolTip
                    }}
                    value={depth}
                    onChange={(e, v) => setDepth(v as number)}
                />
            </div> */}
            {typeToggle.includes('physics')&&<button 
            onClick={()=>setPhysicsPaused(!physicsPaused)}
            style={{
                position:'absolute',
                top:50,
                left:0,
                zIndex:1000
            }}>
                {physicsPaused?"Play":"Pause"}
            </button>}
            <div style={{position:'absolute',zIndex:10}}>
                <ToggleButtonGroup
                    color="primary"
                    value={typeToggle}
                    onChange={(e, newVal) => {
                        console.log(newVal)
                        setTypeToggle(newVal)
                    }}
                    aria-label="Platform"
                >
                    <ToggleButton value="physics">Physics</ToggleButton>
                    <ToggleButton value="morph">Morph</ToggleButton>
                    <ToggleButton value="transform">Linear Transformation</ToggleButton>
                    <ToggleButton value="action_trigger">Action Trigger</ToggleButton>
                </ToggleButtonGroup>
            </div>


            <Canvas
                onPointerMissed={() => { updateSelectedObjectFunction(null); updateSelectedObjectIndexFunction(null) }}
                tabIndex={0}
                onKeyUp={() => {
                    setKeyPressed(null)
                }}
                onKeyDown={(e) => {
                    setKeyPressed(e.code)
                    if (e.code === "Delete" && Selected !== null) {
                        console.log('deleting', Selected)

                        // document.getRootNode.click()
                        // objectClicked = false;
                        updateIsObjectSelected(false)
                        updateSelected(null)
                        setDeleteLine(Selected);
                        setTimeout(() => {
                            setDeleteLine(null)
                        }, 100);

                    }
                    if (selectedObjectIndexThreeD && e.code === "Delete") {
                        let tempArr = [...objectsInScene];
                        tempArr.forEach((item, index) => {
                            if (item.index === selectedObjectIndexThreeD) {
                                tempArr.splice(index, 1)
                            }
                        });
                        setObjectsInScene(tempArr);
                    }
                }}
                onMouseDown={(e) => {
                    if (isObjectSelected) {
                        return
                    }
                    if (e.button === 0) {
                        setMouseDown(true);
                    }
                }}
                onMouseUp={(e) => {
                    setMouseDown(false);
                    if (isObjectSelected) {
                        return
                    }

                    if (isDrawing) {
                        const NewLineID = makeid(8)
                        setLine(NewLineID);
                    }
                    setIsDrawing(false)
                    
                }}
                onMouseMove={(e) => {
                    if (isObjectSelected) {
                        return
                    }
                    if (isMouseDown) {
                        setMousePoint({ x: e.clientX, y: e.clientY });
                        setIsDrawing(true)
                        // setLineBeingDrawn(lineNumber)
                    }
                }}
            >
                <UITypeFunction pause={physicsPaused} type={typeToggle}>
                    <>
                    <SketchObjects transformDict={transformDict}
                        objectsInScene={objectsInScene}
                        typeToggle={typeToggle}
                        deleteLine={deleteLine}
                        canvasFunctions={canvasFunctions}
                        isDrawing={isDrawing}
                        depth={depth}
                        lineNumber={lineNumber}
                        mousePos={mousePos}
                        SelectedObject={selectedObjectThreeD}
                        keyPressed={keyPressed}
                    />
                        {typeToggle.includes('transform')&&objectsInScene.map((item) => (
                            <SolidObject
                                updateDraggingTransformObject={updateDraggingTransformObject}
                                key={item.index}
                                item={item}
                                isDrawing={isDrawing}
                                index={item.index}
                                canvasFunctions={canvasFunctions}
                                selectedObjectIndexThreeD={selectedObjectIndexThreeD}
                                keyPressed={keyPressed}
                                typeToggle={typeToggle}
                            />
                        ))}
                        {typeToggle.includes('physics')&&<PhysicsPlane/>}
                    </>
                </UITypeFunction>
                    <PerspectiveCamera makeDefault position={[10, 4, 4]} />
                    <ViewController />
                    <GizmoHelper
                        alignment="bottom-right" // widget alignment within scene
                        margin={[80, 80]} // widget margins (X, Y)
                    >
                        <GizmoViewport />
                    </GizmoHelper>
                    <ambientLight intensity={0.5} />
                    <spotLight position={[20, 4, 10]} angle={0.60} penumbra={1} />
                    <gridHelper position={[0,-3,0]} visible={true} />
            </Canvas>
        </>
    )
}