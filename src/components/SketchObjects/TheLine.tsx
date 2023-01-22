import { canvasFunctionsProps, UIType } from "../../@types"
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import * as React from 'react';
import { PivotControls, useCursor, useSelect } from "@react-three/drei";
import { ApplyMatrixOnMesh, getMeshCenterPoint } from "../../utils";
import { TubeLine } from "./TubeLine";

export function TheLine({ points, isDrawing, index, canvasFunctions, transform, updateTransform, transformDict,keyPressed, typeToggle }
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
    const ref = oldref

    const pivotRef = useRef<THREE.Group>(null!)
    const [hovered, hover] = useState(false)
    const [clicked, click] = useState(false)
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
        if (transformDict && ref.current && typeToggle==='transform') {
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
            onDragEnd={() => {
                updateTransform(index, ref.current.matrix);
                
                // ApplyMatrixOnMesh(ref.current, ref.current.matrix)
                
            }}
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