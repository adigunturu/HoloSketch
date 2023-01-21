import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import * as React from 'react';
import { useThree } from '@react-three/fiber'
import { Object3D } from 'three';
import { Select, TransformControls, useCursor, useSelect } from '@react-three/drei';
import { generateGeometry, getMeshCenterPoint } from '../utils';
import { PivotControls, Line } from '@react-three/drei';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import TweenExp from './TweenExp';
import { UIType } from '../@types';
import { DynamicObject } from '../utilComponents';
import { RigidBody } from '@react-three/rapier';

type canvasFunctionsProps = {
    updateSelected: (index: string | null) => void;
    updateSelectedObjectFunction:(mesh: THREE.Mesh|null) => void;
    updateSelectedObjectIndexFunction:(string: string|null) => void;
    updateIsObjectSelected:(val:boolean)=>void;
}

export default function SketchObjects({ mousePos, lineNumber, depth, isDrawing, canvasFunctions, deleteLine, typeToggle, objectsInScene,
    transformDict, SelectedObject, keyPressed }: {
        mousePos: { x: number, y: number },
        lineNumber: string | null,
        depth: number,
        isDrawing: boolean,
        canvasFunctions: canvasFunctionsProps,
        deleteLine: string | null,
        typeToggle: UIType,
        objectsInScene: { index: string, type: 'plane' | 'cube' | 'sphere' }[],
        transformDict: { RelPos: [x: number, y: number, z: number, distance: number, direction: THREE.Vector3], rotation: THREE.Quaternion } | null,
        SelectedObject: THREE.Mesh | null,
        keyPressed: string | null
    }) {
    var raycaster = new THREE.Raycaster();
    var plane = new THREE.Plane();
    var planeNormal = new THREE.Vector3();
    var point = new THREE.Vector3();
    var mouse = new THREE.Vector2();

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

    // useEffect(() => {
    //     if (loadLines !== null) {
    //         setPoints(loadLines.points);
    //         setTransforms(loadLines.transforms);
    //     }
    // }, [loadLines])

    useEffect(() => {
        setRenderPoints([]);
    }, [lineNumber]);

    const [selected, setSelected] = React.useState<Object3D[]>([])
    const active = selected[0]
    useEffect(() => {
        if (active) {
            // objectClicked = true;
            canvasFunctions.updateIsObjectSelected(true)
        } else {
            // objectClicked = false;
            canvasFunctions.updateIsObjectSelected(false)
            canvasFunctions.updateSelected(null)
        }
    }, [active])


    function updateTransform(id: string, transform: THREE.Matrix4) {
        setTransforms((prev) => ({ ...prev, [id]: transform }))
    }


    useEffect(() => {
        if (!isDrawing) {
            console.log(Object.keys(points))
        }
    }, [isDrawing])

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
                            keyPressed={keyPressed}
                            typeToggle={typeToggle}
                        />
                    ))
                }
            </Select>
            {typeToggle === 'morph' && !isDrawing && Object.keys(points).length >= 2 ?
                <TweenExp
                    first={points[Object.keys(points).at(-1) as string] as THREE.Vector3Tuple[]}
                    second={points[Object.keys(points).at(-2) as string] as THREE.Vector3Tuple[]}
                /> : null}
        </>
    )
}

function TheLine({ points, isDrawing, index, canvasFunctions, transform, updateTransform, transformDict,keyPressed, typeToggle }
    : {
        points: THREE.Vector3Tuple[],
        isDrawing: boolean,
        index: string,
        canvasFunctions: canvasFunctionsProps,
        transform: THREE.Matrix4 | undefined,
        updateTransform(id: string, transform: THREE.Matrix4): void,
        transformDict: { RelPos: [x:number, y:number, z:number, distance:number, direction:THREE.Vector3], rotation: THREE.Quaternion, scale?: number } | null,
        keyPressed:string|null,
        typeToggle:UIType
    }) {

    let oldref = useRef<THREE.Mesh>(null!)
    // let newgeo = generateGeometry(points)
    // let newref = null;
    // if(newgeo[0]===null||newgeo[1]===null){
    //     newgeo = [[0,0,0],[0,0,0]]
    // }
    // newref = useTrimesh(
    //     () => ({//@ts-ignore
    //         args: [newgeo[0], newgeo[1]],
    //         mass: 10,
    //     }),
    //     useRef<THREE.Mesh>(null),
    // )
    const ref = oldref

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
            ref.current?.applyMatrix4(transform)
        }
    }, []);

    useEffect(() => {
        if (!isDrawing && !initialPosition && ref.current) {
            setTimeout(() => {
                let origin = getMeshCenterPoint(ref.current as THREE.Mesh);
                if (!origin || origin === undefined) {
                    return
                }
                ref.current?.position.set(origin.x, origin.y, origin.z);
                ref.current?.geometry.center()
                setInitialPosition(origin);
            }, 10);
        }
    }, [isDrawing])

    useEffect(() => {
        // if(index!==latestStrokeId){
        //     return
        // }
        if (transformDict && ref.current) {
            if (keyPressed === 'AltLeft' && transformDict.scale !== undefined) {
                let newScale = initialScale.z + transformDict.scale
                ref.current.scale.set(newScale, newScale, newScale)
                return
            }
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

            <TubeLine 
            objectref={ref as React.MutableRefObject<THREE.Mesh>} 
            points={points} 
            isDrawing={isDrawing}
            typeToggle={typeToggle}
             />


        </PivotControls>
    )
}

function TubeLine({ points, objectref, isDrawing, typeToggle }: { 
    points: THREE.Vector3Tuple[], 
    objectref: React.MutableRefObject<THREE.Mesh>,
    isDrawing:boolean, typeToggle:UIType }) {

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
        let geometry = new THREE.TubeGeometry(curve, points.length, 0.04, 20);
        const material = new THREE.MeshPhongMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        setMesh({ material: material, geometry: geometry });
    }, [points])

    // @ts-ignore
    return (mesh && !isDrawing && typeToggle==='physics' ?
        <RigidBody colliders={'hull'}>
            <mesh ref={objectref}
                castShadow={true}
                receiveShadow={true}
                frustumCulled={true}
                geometry={mesh.geometry}
                material={mesh.material} />
        </RigidBody> : mesh ? <mesh ref={objectref}
            castShadow={true}
            receiveShadow={true}
            frustumCulled={true}
            geometry={mesh.geometry}
            material={mesh.material} /> : null
    )
}