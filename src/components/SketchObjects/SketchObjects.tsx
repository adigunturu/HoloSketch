import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import * as React from 'react';
import { Select, TransformControls, useCursor, useSelect } from '@react-three/drei';
import TweenExp from '../TweenExp';
import { canvasFunctionsProps, UIType } from '../../@types';
import { useSketchObjectsHook } from './Hooks/useSketchObjectsHook';
import { TheLine } from './TheLine';


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
    
       const{points, transforms, setSelected, updateTransform} = useSketchObjectsHook({ mousePos, lineNumber, depth, isDrawing, canvasFunctions, deleteLine, typeToggle, objectsInScene, transformDict, SelectedObject, keyPressed})

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



