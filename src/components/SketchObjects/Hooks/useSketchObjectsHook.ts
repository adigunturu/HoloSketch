import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import * as React from 'react';
import { useThree } from '@react-three/fiber'
import { Object3D } from 'three';
import { Select, TransformControls, useCursor, useSelect } from '@react-three/drei';
import { generateGeometry, getMeshCenterPoint } from '../../../utils';
import { PivotControls, Line } from '@react-three/drei';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import TweenExp from '../../TweenExp';
import { UIType } from '../../../@types';
import { DynamicObject } from '../../../utilComponents';
import { RigidBody } from '@react-three/rapier';

type canvasFunctionsProps = {
    updateSelected: (index: string | null) => void;
    updateSelectedObjectFunction: (mesh: THREE.Mesh | null) => void;
    updateSelectedObjectIndexFunction: (string: string | null) => void;
    updateIsObjectSelected: (val: boolean) => void;
}

export function useSketchObjectsHook({ mousePos, lineNumber, depth, isDrawing, canvasFunctions, deleteLine, typeToggle, objectsInScene,
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

    return {points, transforms, setSelected, updateTransform}
}