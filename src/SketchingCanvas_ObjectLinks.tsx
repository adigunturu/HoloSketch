/* eslint-disable */
import * as THREE from 'three'
import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import { Canvas, extend, useThree } from '@react-three/fiber'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GizmoHelper, GizmoViewcube, GizmoViewport, Line, OrthographicCamera, PerspectiveCamera, PivotControls, Plane, RoundedBox, Select, TransformControls, useCursor, useSelect } from '@react-three/drei';
import Slider, { SliderValueLabelProps } from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import { Object3D } from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';


let DrawingObject: {
    points: {
        [line: string]: Array<THREE.Vector3Tuple | undefined>
    },
    transforms: {
        [line: string]: THREE.Matrix4 | undefined
    }
} | null = null
let DrawingScene: THREE.Scene | null = null;
let SelectedObject: THREE.Mesh | null = null;
let selectedObjectIndex: string | null = null;

type canvasFunctionsProps = {
    updateSelected: (index: string | null) => void;
}

let latestStrokeId: null | string = makeid(8);
let objectTransformMatrix: THREE.Matrix4 | null = null
let objectTransformObject: { RelPos: [x:number, y:number, z:number, distance:number, direction:THREE.Vector3], rotation: THREE.Quaternion, scale?: number } | null = null
let currentkeyPressed: string | null = null;

let objectClicked = false;
function SolidObject(props: { position: [number, number, number], index: string, type: 'cube' | 'sphere' | 'plane', objectRef: React.MutableRefObject<THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>> }) {
    return (
        props.type === 'cube' || props.type === 'sphere' ?
            <RoundedBox matrixAutoUpdate={true} scale={props.type === 'sphere' ? [1.4, 1.4, 1.4] : [1, 1, 1]} ref={props.objectRef} onClick={(event) => { SelectedObject = props.objectRef.current; selectedObjectIndex = props.index; }} radius={props.type === 'sphere' ? 0.5 : 0} smoothness={30} {...props}>
                <meshStandardMaterial color="white" />
            </RoundedBox> :
            props.type === 'plane' ? <Plane matrixAutoUpdate={true} ref={props.objectRef} onClick={(event) => { SelectedObject = props.objectRef.current; selectedObjectIndex = props.index; }} args={[2, 2]} {...props}>
                <meshStandardMaterial transparent={true} opacity={0.9} color="white" />
            </Plane> : null
    )
}


function TubeLine({ points, objectref }: { points: THREE.Vector3Tuple[], objectref: React.MutableRefObject<THREE.Mesh> }) {

    const [mesh, setMesh] = useState<{ material: THREE.Material, geometry: THREE.TubeGeometry } | null>(null)

    useEffect(() => {
        if (!points || points === undefined || points.length === 0 || points.length < 5) {
            return
        }
        const mappedPoints = points.map(pt => new THREE.Vector3(...pt));
        let filteredPoints;
        if (points.length < 1) {
            filteredPoints = mappedPoints
        } else {
            filteredPoints = mappedPoints
                .filter((v, i) => {
                    return i % 3 === 0
                });
        }
        const curve = new THREE.CatmullRomCurve3(filteredPoints, false, 'centripetal', 0);
        let geometry = new THREE.TubeGeometry(curve, 1000, 0.08, 20);
        const material = new THREE.MeshPhongMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        setMesh({ material: material, geometry: geometry });
    }, [points])

    // @ts-ignore
    return (mesh && <mesh ref={objectref} castShadow={true} receiveShadow={true} frustumCulled={true} geometry={mesh.geometry} material={mesh.material} />)
}


function TheLine({ points, isDrawing, index, canvasFunctions, transform, updateTransform, transformDict }
    : {
        points: THREE.Vector3Tuple[],
        isDrawing: boolean,
        index: string,
        canvasFunctions: canvasFunctionsProps,
        transform: THREE.Matrix4 | undefined,
        updateTransform(id: string, transform: THREE.Matrix4): void,
        transformDict: { RelPos: [x:number, y:number, z:number, distance:number, direction:THREE.Vector3], rotation: THREE.Quaternion, scale?: number } | null
    }) {
    const ref = useRef<THREE.Mesh | THREE.Line>(null!)
    const pivotRef = useRef<THREE.Group>(null!)
    const [hovered, hover] = useState(false)
    const [clicked, click] = useState(false)
    const [LocalTransform, setLocalTransform] = useState<THREE.Matrix4 | undefined>()
    const [initialPosition, setInitialPosition] = useState<THREE.Vector3 | null>(null)
    const [initialScale, setinitialScale] = useState<THREE.Vector3>(new THREE.Vector3(1, 1, 1))
    const [updatedInitialPosition, setUpdatedIntialPosition] = useState<THREE.Vector3 | null>(null)
    const selected = useSelect();
    useCursor(hovered)
    useEffect(() => {
        // console.log(selected[0], selected[0]===ref.current);
        if (selected[0] === ref.current) {
            click(true);
            canvasFunctions.updateSelected(index)
        } else {
            click(false)
        }
    }, [selected]);

    useEffect(() => {
        if (LocalTransform !== undefined) {
            updateTransform(index, LocalTransform)
        }
    }, [LocalTransform]);


    useEffect(() => {
        if (transform !== undefined) {
            ref.current.applyMatrix4(transform)
        }
    }, []);

    useEffect(() => {
        if (!isDrawing && !initialPosition && ref.current) {
            setTimeout(() => {
                let origin = getCenterPoint(ref.current as THREE.Mesh);
                if (!origin || origin === undefined) {
                    return
                }
                ref.current.position.set(origin.x, origin.y, origin.z);
                ref.current.geometry.center()
                setInitialPosition(origin);
            }, 10);
        }
    }, [isDrawing])

    useEffect(() => {
        if(index!==latestStrokeId){
            return
        }
        if (transformDict && ref.current) {
            if (currentkeyPressed === 'AltLeft' && transformDict.scale !== undefined) {
                // console.log(transformDict.scale);
                let newScale = initialScale.z + transformDict.scale
                ref.current.scale.set(newScale, newScale, newScale)
                return
            }
            // ref.current.applyMatrix4(objectTransformMatrix);
            let TransformedVector = new THREE.Vector3();
            if(initialPosition===null||transformDict.RelPos[4]===undefined){
                return
            }
            TransformedVector = TransformedVector?.addVectors(initialPosition, transformDict.RelPos[4].multiplyScalar(transformDict.RelPos[3]))
            ref.current.position.set(TransformedVector.x, TransformedVector.y, TransformedVector.z);
            setUpdatedIntialPosition(TransformedVector)
            ref.current.setRotationFromQuaternion(transformDict?.rotation)
        } else {
            if (updatedInitialPosition && transformDict === null) {
                setInitialPosition(updatedInitialPosition);
            }

            if (ref.current) {
                let tempScale = new THREE.Vector3()
                ref.current.getWorldScale(tempScale)
                setinitialScale(tempScale);
                console.log(tempScale.z)
            }
        }
    }, [transformDict])

    return (
        <PivotControls
            ref={pivotRef}
            fixed={true}
            scale={60}
            depthTest={false}
            autoTransform={true}
            // matrix={transform}
            onDragEnd={() => setLocalTransform(pivotRef.current.matrix)}
            anchor={[0, 0, 0]}
            visible={clicked}
            disableAxes={!clicked}
            disableSliders={!clicked}
            disableRotations={!clicked}>

            {/* <Line
                isMesh={true}
                points={points}
                opacity={hovered || clicked ? 0.6 : 1}
                lineWidth={6}
                dashed={false}
                ref={ref as React.MutableRefObject<Line2>}
                onPointerOver={() => !isDrawing && hover(true)}
                onPointerOut={() => hover(false)}
            /> */}

            <TubeLine objectref={ref as React.MutableRefObject<THREE.Mesh>} points={points} />


        </PivotControls>
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
                MIDDLE: THREE.MOUSE.DOLLY,
                RIGHT: THREE.MOUSE.ROTATE
            };


            return () => {
                controls.dispose();
            };
        }, [camera, gl]);
    return null;
};
var raycaster = new THREE.Raycaster();
var plane = new THREE.Plane();
var planeNormal = new THREE.Vector3();
var point = new THREE.Vector3();
var mouse = new THREE.Vector2();



function Sketch({ mousePos, lineNumber, depth, isDrawing, canvasFunctions, deleteLine, loadLines, objectsInScene, transformDict }: {
    mousePos: { x: number, y: number },
    lineNumber: string | null,
    depth: number,
    isDrawing: boolean,
    canvasFunctions: canvasFunctionsProps,
    deleteLine: string | null,
    loadLines: {
        points: {
            [line: string]: Array<THREE.Vector3Tuple | undefined>
        },
        transforms: {
            [line: string]: THREE.Matrix4 | undefined
        }
    } | null,
    objectsInScene: { index: string, type: 'plane' | 'cube' | 'sphere' }[],
    transformDict: { RelPos: [x:number, y:number, z:number, distance:number, direction:THREE.Vector3], rotation: THREE.Quaternion } | null
}) {
    const { camera, scene } = useThree();
    const [renderPoints, setRenderPoints] = useState<Array<THREE.Vector3Tuple | undefined>>([]);
    const [points, setPoints] = useState<{ [line: string]: Array<THREE.Vector3Tuple | undefined> }>({})
    const [transforms, setTransforms] = useState<{ [line: string]: THREE.Matrix4 | undefined }>({})
    // function getPoint(event:React.MouseEvent) {
    useEffect(() => {
        let zoomLvl = camera.position.distanceTo(new THREE.Vector3());
        if (mousePos.x === 0 && mousePos.y === 0) {
            return
        }
        mouse.x = (mousePos.x / window.innerWidth) * 2 - 1;
        mouse.y = -(mousePos.y / window.innerHeight) * 2 + 1;

        if (SelectedObject) {
            raycaster.setFromCamera(mouse, camera);
            const intersections = raycaster.intersectObject(SelectedObject);
            if (intersections && intersections.length) {
                if (intersections[0].face && intersections[0].face !== undefined) {
                    let newpoint: THREE.Vector3 | undefined = intersections[0].point.add(intersections[0].face.normal.multiplyScalar(0.01));
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
        plane.set(planeNormal, depth)
        raycaster.setFromCamera(mouse, camera);
        let tempPoint = raycaster.ray.intersectPlane(plane, point/*point*/)?.toArray();
        setRenderPoints((prev) => [...prev, tempPoint]);
        let temparr = renderPoints;
        temparr.push(tempPoint);
        if (lineNumber) {
            setPoints((prev) => ({ ...prev, [lineNumber]: temparr }))
        }
    }, [mousePos]);
    useEffect(() => {
        // console.log('deleteline',deleteLine)
        if (deleteLine !== null) {
            let tempObj = points
            delete tempObj[deleteLine]
            setPoints(tempObj);
            // console.log(tempObj);

        }
    }, [deleteLine]);

    useEffect(() => {
        if (loadLines !== null) {
            setPoints(loadLines.points);
            setTransforms(loadLines.transforms);
        }
    }, [loadLines])

    useEffect(() => {
        setRenderPoints([]);
    }, [lineNumber]);

    useEffect(() => {
        DrawingObject = { points: points, transforms: transforms };
    }, [points, transforms])
    useEffect(() => {
        DrawingScene = scene;
    }, [scene, points])
    const [selected, setSelected] = React.useState<Object3D[]>([])
    const active = selected[0]
    useEffect(() => {
        if (active) {
            objectClicked = true;
        } else {
            objectClicked = false;
            canvasFunctions.updateSelected(null)
        }
    }, [active])


    function updateTransform(id: string, transform: THREE.Matrix4) {
        setTransforms((prev) => ({ ...prev, [id]: transform }))
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
        </>
    )
}

export default function SketchingCanvas_ObjectLinks() {
    const [mousePos, setMousePoint] = useState({ x: 0, y: 0 });
    const [objectsInScene, setObjectsInScene] = useState<{ type: 'sphere' | 'cube' | 'plane', index: string }[]>([]);
    const [isMouseDown, setMouseDown] = useState(false);
    const [lineNumber, setLine] = useState<string | null>(latestStrokeId);
    const [isDrawing, setIsDrawing] = useState(false);
    const [depth, setDepth] = useState(0);
    const [Selected, setSelected] = useState<string | null>(null);
    const [deleteLine, setDeleteLine] = useState<string | null>(null);
    const [transformDict, setTransformDict] = useState<{ RelPos: [x:number, y:number, z:number, distance:number, direction:THREE.Vector3], rotation: THREE.Quaternion } | null>(null);
    const [loadLines, setLoadLines] = useState<{
        points: {
            [line: string]: Array<THREE.Vector3Tuple | undefined>
        },
        transforms: {
            [line: string]: THREE.Matrix4 | undefined
        }
    } | null>(null);

    function updateSelected(index: string | null) {
        setSelected(index);
        selectedObjectIndex = null
        SelectedObject = null
    };

    function updateDraggingTransformObject(object: { RelPos: [x:number, y:number, z:number, distance:number, direction:THREE.Vector3], rotation: THREE.Quaternion, scale?: number } | null, nullify = false) {
        if (!nullify) {
            setTransformDict(object)
        } else {
            setTransformDict(null)
        }
    }

    useEffect(() => {
        setObjectsInScene([{ type: 'sphere', index: makeid(8) }])
    }, [])

    let canvasFunctions: canvasFunctionsProps = {
        updateSelected: updateSelected,
    }
    return (
        <>
            <div style={{ height: '60%', position: 'absolute', zIndex: 2, padding: '10px', marginTop: 'calc((100vh - (60vh + 20px))/2)', display: 'none' }}>
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
                        ValueLabel: ValueLabelComponent
                    }}
                    value={depth}
                    onChange={(e, v) => setDepth(v as number)}
                />
            </div>

            <Canvas
                onPointerMissed={() => { SelectedObject = null; selectedObjectIndex = null }}
                tabIndex={0}
                onKeyUp={() => {
                    currentkeyPressed = null
                }}
                onKeyDown={(e) => {
                    currentkeyPressed = e.code;
                    if (e.code === "Delete" && Selected !== null) {
                        console.log('deleting', Selected)

                        // document.getRootNode.click()
                        objectClicked = false;
                        updateSelected(null)
                        setDeleteLine(Selected);
                        setTimeout(() => {
                            setDeleteLine(null)
                        }, 100);

                    }
                    if (selectedObjectIndex && e.code === "Delete") {
                        let tempArr = [...objectsInScene];
                        tempArr.forEach((item, index) => {
                            if (item.index === selectedObjectIndex) {
                                tempArr.splice(index, 1)
                            }
                        });
                        setObjectsInScene(tempArr);
                    }
                }}
                onMouseDown={(e) => {
                    if (objectClicked) {
                        return
                    }
                    if (e.button === 0) {
                        setMouseDown(true);
                    }
                }}
                onMouseUp={(e) => {
                    setMouseDown(false);
                    if (objectClicked) {
                        return
                    }

                    if (isDrawing) {
                        const NewLineID = makeid(8)
                        setLine(NewLineID);
                    }
                    setIsDrawing(false)
                }}
                onMouseMove={(e) => {
                    if (objectClicked) {
                        return
                    }
                    if (isMouseDown) {
                        setMousePoint({ x: e.clientX, y: e.clientY });
                        setIsDrawing(true)
                    }
                }}
            >
                <Sketch transformDict={transformDict} objectsInScene={objectsInScene} loadLines={loadLines} deleteLine={deleteLine} canvasFunctions={canvasFunctions} isDrawing={isDrawing} depth={depth} lineNumber={lineNumber} mousePos={mousePos} />
                <OrthographicCamera makeDefault zoom={80} position={[10, 4, 4]} />
                <Controller />
                <GizmoHelper
                    alignment="bottom-right" // widget alignment within scene
                    margin={[80, 80]} // widget margins (X, Y)
                >
                    <GizmoViewport />
                </GizmoHelper>
                <ambientLight intensity={0.5} />
                <spotLight position={[20, 4, 10]} angle={0.60} penumbra={1} />
                {objectsInScene.map((item) => (
                    <BaseObject updateDraggingTransformObject={updateDraggingTransformObject} key={item.index} item={item} isDrawing={isDrawing} index={item.index} />
                ))}
                <gridHelper visible={true} />
            </Canvas>
        </>
    )
}

function BaseObject(props: { item: { type: 'sphere' | 'cube' | 'plane'; index: string }, isDrawing: boolean, index: string, updateDraggingTransformObject: (object: any, nullify?: boolean) => void }) {
    const transformref = useRef()
    const objectRef = useRef<THREE.Mesh>(null!)
    const [isDraggingPivot, setDraggingPivot] = useState(false);
    const [initialPosition, setInitialPosition] = useState<THREE.Vector3>(new THREE.Vector3());
    useEffect(() => {
        if (isDraggingPivot) {
            objectClicked = true;
        } else {
            objectClicked = false
        }
    }, [isDraggingPivot]);

    useEffect(() => {
        let randomVec = new THREE.Vector3();
        objectRef.current.getWorldPosition(randomVec);
        setInitialPosition(randomVec)
        console.log(randomVec)
    }, [])

    return (
        <PivotControls
            //@ts-ignore
            ref={transformref}
            onDragStart={() => setDraggingPivot(true)}//@ts-ignore
            onDragEnd={() => {
                setDraggingPivot(false);
                let randomVectwo = new THREE.Vector3();
                objectRef.current.getWorldPosition(randomVectwo);
                //   console.log(randomVectwo)
                setInitialPosition(randomVectwo);
                props.updateDraggingTransformObject(null, true)
            }}
            onDrag={(l, dl, w, dw) => {
                // console.log(currentkeyPressed)
                if (currentkeyPressed === 'AltLeft') {
                    let quartn = new THREE.Quaternion()
                    let vec = new THREE.Vector3()
                    let scale = new THREE.Vector3()
                    l.decompose(vec, quartn, scale);
                    objectTransformObject = { RelPos: [0, 0, 0, 0, new THREE.Vector3()], rotation: quartn, scale: 0 - (initialPosition?.z - vec.z) };
                    props.updateDraggingTransformObject(objectTransformObject)
                    return
                }


                var vec = new THREE.Vector3();
                var rotation = new THREE.Quaternion();
                var scale = new THREE.Vector3();
                dl.decompose(vec, rotation, scale);
                objectTransformMatrix = dl;
                var tempVec = new THREE.Vector3();
                var tempQuat = new THREE.Quaternion();
                var temp = new THREE.Vector3();
                objectRef.current.getWorldPosition(tempVec)
                // console.log(objectRef.current.getWorldPosition(tempVec))
                let distance = tempVec.distanceTo(initialPosition as THREE.Vector3)
                objectRef.current.getWorldQuaternion(rotation);
                console.log(rotation)
                let TransformedVector = new THREE.Vector3();
                TransformedVector = TransformedVector?.addVectors(initialPosition as THREE.Vector3, tempVec.subVectors(tempVec, initialPosition as THREE.Vector3).normalize().multiplyScalar(distance));
                if (rotation.x !== 0 || rotation.y !== 0 || rotation.z !== 0) {
                    TransformedVector.x = 0;
                    TransformedVector.y = 0;
                    TransformedVector.z = 0;
                }//@ts-ignore
                objectTransformObject = { RelPos: [TransformedVector.x, TransformedVector.y, TransformedVector.z, distance, tempVec.subVectors(tempVec, initialPosition as THREE.Vector3).normalize()], rotation: rotation };
                props.updateDraggingTransformObject(objectTransformObject)
            }}
            fixed={true}
            scale={60}
            depthTest={false}
            autoTransform={true}
            anchor={[0, 0, 0]}
            annotationsClass={'transformValues'}
            visible={selectedObjectIndex === props.item.index && !props.isDrawing || isDraggingPivot}
            disableAxes={selectedObjectIndex === props.item.index && props.isDrawing && !isDraggingPivot}
            disableSliders={selectedObjectIndex === props.item.index && props.isDrawing && !isDraggingPivot}
            disableRotations={selectedObjectIndex === props.item.index && props.isDrawing && !isDraggingPivot}>
            <SolidObject objectRef={objectRef} type={props.item.type} index={props.item.index} position={[0, 0, 0]} />
        </PivotControls>
    )
}

function ValueLabelComponent(props: SliderValueLabelProps) {
    const { children, value } = props;

    return (
        <Tooltip enterTouchDelay={0} placement="right" title={value}>
            {children}
        </Tooltip>
    );
}

function makeid(length: number) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function getCenterPoint(mesh: THREE.Mesh) {
    if (mesh === null) {
        return
    }
    var geometry = mesh.geometry;
    geometry.computeBoundingBox();
    var center = new THREE.Vector3();
    geometry.boundingBox?.getCenter(center);
    return center;
}