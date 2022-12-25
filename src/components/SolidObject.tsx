import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import * as React from 'react';
import { PivotControls, RoundedBox, Plane} from '@react-three/drei';


type canvasFunctionsProps = {
    updateSelected: (index: string | null) => void;
    updateSelectedObjectFunction:(mesh: THREE.Mesh|null) => void;
    updateSelectedObjectIndexFunction:(string: string|null) => void;
    updateIsObjectSelected:(val:boolean)=>void;
}

export default function SolidObject(props: { 
    item: { type: 'sphere' | 'cube' | 'plane'; index: string }, 
    isDrawing: boolean, index: string, 
    updateDraggingTransformObject: (object: any, nullify?: boolean) => void,
    canvasFunctions:canvasFunctionsProps,
    selectedObjectIndexThreeD:string|null,
    keyPressed:string|null,
 }) {
    const transformref = useRef()
    const objectRef = useRef<THREE.Mesh>(null!)
    useEffect(()=>{//@ts-ignore
        let vertices = objectRef.current?.geometry.attributes.position.array//@ts-ignore
        let indices = objectRef.current?.geometry.index?.array;
    },[])
    const [isDraggingPivot, setDraggingPivot] = useState(false);
    const [initialPosition, setInitialPosition] = useState<THREE.Vector3>(new THREE.Vector3());
    useEffect(() => {
        if (isDraggingPivot) {
            // objectClicked = true;
            props.canvasFunctions.updateIsObjectSelected(true)
        } else {
            // objectClicked = false
            props.canvasFunctions.updateIsObjectSelected(false)
        }
    }, [isDraggingPivot]);

    useEffect(() => {
        let randomVec = new THREE.Vector3();
        objectRef.current?.getWorldPosition(randomVec);
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
                objectRef.current?.getWorldPosition(randomVectwo);
                //   console.log(randomVectwo)
                setInitialPosition(randomVectwo);
                props.updateDraggingTransformObject(null, true)
            }}
            onDrag={(l, dl, w, dw) => {
                let objectTransformObject: { RelPos: [x:number, y:number, z:number, distance:number, direction:THREE.Vector3], rotation: THREE.Quaternion, scale?: number } | null = null;
                if (props.keyPressed === 'AltLeft') {
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
                var tempVec = new THREE.Vector3();
                var tempQuat = new THREE.Quaternion();
                var temp = new THREE.Vector3();
                objectRef.current?.getWorldPosition(tempVec)
                // console.log(objectRef.current.getWorldPosition(tempVec))
                let distance = tempVec.distanceTo(initialPosition as THREE.Vector3)
                objectRef.current?.getWorldQuaternion(rotation);
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
            visible={props.selectedObjectIndexThreeD === props.item.index && !props.isDrawing || isDraggingPivot}
            disableAxes={props.selectedObjectIndexThreeD === props.item.index && props.isDrawing && !isDraggingPivot}
            disableSliders={props.selectedObjectIndexThreeD === props.item.index && props.isDrawing && !isDraggingPivot}
            disableRotations={props.selectedObjectIndexThreeD === props.item.index && props.isDrawing && !isDraggingPivot}>
            <Box 
            objectRef={objectRef as React.MutableRefObject<THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>>} 
            type={props.item.type} 
            index={props.item.index} 
            position={[0, 0, 0]}
            canvasFunctions={props.canvasFunctions}
             />
        </PivotControls>
    )
}

function Box(props: { 
    position: [number, number, number], 
    index: string, 
    type: 'cube' | 'sphere' | 'plane', 
    objectRef: React.MutableRefObject<THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>>,
    canvasFunctions:canvasFunctionsProps
 }) {
    return (
        props.type === 'cube' || props.type === 'sphere' ?  
            <RoundedBox matrixAutoUpdate={true} scale={props.type === 'sphere' ? [1.4, 1.4, 1.4] : [1, 1, 1]} ref={props.objectRef} onClick={(event) => { 
                // SelectedObject = props.objectRef.current; 
                props.canvasFunctions.updateSelectedObjectFunction(props.objectRef.current)
                props.canvasFunctions.updateSelectedObjectIndexFunction(props.index)
                // selectedObjectIndex = props.index; 
                }} radius={props.type === 'sphere' ? 0.5 : 0} smoothness={30} {...props}>
                <meshStandardMaterial color="white" />
            </RoundedBox> :
            props.type === 'plane' ? <Plane matrixAutoUpdate={true} ref={props.objectRef} onClick={(event) => { 
                // SelectedObject = props.objectRef.current; 
                props.canvasFunctions.updateSelectedObjectFunction(props.objectRef.current)
                props.canvasFunctions.updateSelectedObjectIndexFunction(props.index)
                // selectedObjectIndex = props.index; 
                }} args={[2, 2]} {...props}>
                <meshStandardMaterial transparent={true} opacity={0.9} color="white" />
            </Plane> : null
    )
}