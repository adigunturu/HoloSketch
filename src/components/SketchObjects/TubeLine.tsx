import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import * as React from 'react';
import { UIType } from '../../@types';
import { RigidBody } from '@react-three/rapier';
import { useFrame, useThree } from '@react-three/fiber';

export function TubeLine({ points, objectref, isDrawing, typeToggle }: {
    points: THREE.Vector3Tuple[],
    objectref: React.MutableRefObject<THREE.Mesh>,
    isDrawing: boolean, typeToggle: UIType
}) {

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
    useFrame(({ gl, scene, camera }) => {
        if (typeToggle === 'action_trigger') {
            if (camera.position.distanceTo(objectref.current.position) < 5) {
                let newmaterial = new THREE.MeshBasicMaterial({ color: "#171717" });
                objectref.current.material = newmaterial
            } else {
                let newmaterial = new THREE.MeshBasicMaterial({ color: "#ffffff" });
                objectref.current.material = newmaterial
            }
        }
    })

    // @ts-ignore
    return (mesh && !isDrawing && typeToggle === 'physics' ?
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