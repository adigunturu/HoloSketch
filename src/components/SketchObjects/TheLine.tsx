import { canvasFunctionsProps, UIType } from "../../@types"
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import * as React from 'react';
import { PivotControls, useCursor, useSelect } from "@react-three/drei";
import { ApplyMatrixOnMesh, calculateSecondObjectPosition, getMeshCenterPoint } from "../../utils";
import { TubeLine } from "./TubeLine";
import { RigidBody } from '@react-three/rapier';
import { LoadedTubeLine } from "./LoadedTubeLine";

export function TheLine({ points, isDrawing, index, canvasFunctions, transform, updateTransform, transformDict,keyPressed, typeToggle,lineFullyDrawn }
    : {
        points: THREE.Vector3Tuple[],
        isDrawing: boolean,
        index: string,
        canvasFunctions: canvasFunctionsProps,
        transform: THREE.Matrix4 | undefined,
        updateTransform(id: string, transform: THREE.Matrix4): void,
        transformDict: { 
            RelPos: [x:number, y:number, z:number, distance:number, direction:THREE.Vector3], 
            rotation: THREE.Quaternion, 
            scale?: number,
            objectOldPosition: THREE.Vector3,
            objectPosition: THREE.Vector3,
        } | null,
        keyPressed:string|null,
        lineFullyDrawn:{[line:string]:boolean},
        typeToggle:UIType
    }) {

    let oldref = useRef<THREE.Mesh>(null!)
    const ref = oldref

    const pivotRef = useRef<THREE.Group>(null!)
    const [hovered, hover] = useState(false)
    const [loaded, setLoaded] = useState(false)
    const [clicked, click] = useState(false)

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
        if (index in lineFullyDrawn) {
            if (lineFullyDrawn[index] === true && !loaded) {
                console.log('loaded')
                setLoaded(true);
            }
        }else{
            if(!loaded){
                setLoaded(true);
            }
        }
    }, [lineFullyDrawn])

    useEffect(() => {
        if (transform !== undefined) {
            ref.current?.applyMatrix4(transform)
        }
    }, []);

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


            {loaded?<LoadedTubeLine
                transformDict={transformDict}
                objectref={ref as React.MutableRefObject<THREE.Mesh>}
                points={points}
                typeToggle={typeToggle}
                key={index}
            />:<TubeLine
                objectref={ref as React.MutableRefObject<THREE.Mesh>}
                points={points}
                isDrawing={isDrawing}
                typeToggle={typeToggle}
                key={index}
            />}
            


        </PivotControls>
    )
}