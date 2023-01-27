import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import * as React from 'react';
import { UIType } from '../../@types';
import { RigidBody, ConvexHullCollider, BallCollider, RigidBodyProps } from '@react-three/rapier';
import { useFrame, useThree } from '@react-three/fiber';
import { getMeshCenterPoint } from '../../utils';
import { RigidBodyApi } from '@react-three/rapier/dist/declarations/src/types';

export const LoadedTubeLine = React.memo(function LoadedTubeLine({ points, objectref, typeToggle }: {
    points: THREE.Vector3Tuple[],
    objectref: React.MutableRefObject<THREE.Mesh>, typeToggle: UIType
}) {
    const [loaded, setLoaded] = useState(false);
    const [mesh, setMesh] = useState<{ material: THREE.Material, geometry: THREE.TubeGeometry, position:THREE.Vector3 } | null>(null);
    const [triggered, setTriggered] = useState(false);
    const [position, setPosition] = useState(new THREE.Vector3());

    useEffect(() => {
        if(loaded)return
        setTimeout(() => {
            // let origin = getMeshCenterPoint(objectref.current as THREE.Mesh);
            // if (!origin || origin === undefined) {
            //     return
            // }
            // objectref.current?.position.set(origin.x, origin.y, origin.z);
            // objectref.current?.geometry.center()
            // setPosition(origin)
                // objectref.current?.geometry.center()
        }, 10);
        setLoaded(true)
    }, [objectref])
    
    // useEffect(()=>{
    //     // objectref.current?.geometry.center()
    // },[position])

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
        let geometry = new THREE.TubeGeometry(curve, points.length, 0.08, 20);
        geometry.computeBoundingBox()
        var center = new THREE.Vector3();
        geometry.boundingBox?.getCenter(center);
        geometry.center()
        const material = new THREE.MeshPhongMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        setMesh({ material: material, geometry: geometry, position:center });
    }, [points])
    useFrame(({ gl, scene, camera }) => {
        
        if (typeToggle.includes('action_trigger')&&objectref.current) {
            if (camera.position.distanceTo(objectref.current.position) < 10) {
                let newmaterial = new THREE.MeshBasicMaterial({ color: "#171717" });
                objectref.current.material = newmaterial
                setTriggered(true)
            } else {
                const newmaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, side: THREE.DoubleSide });
                objectref.current.material = newmaterial
                setTriggered(false)
            }
        }
    })

    return (mesh&&
        points.length>5&&
        typeToggle.includes('physics') ? 
        <RigidBody type={triggered?'dynamic':'fixed'} mass={10000} colliders={loaded ? 'hull' : false}>
        <mesh position={mesh.position} ref={objectref}
            castShadow={true}
            receiveShadow={true}
            frustumCulled={true}
            geometry={mesh.geometry}
            material={mesh.material} />
    </RigidBody>
        :mesh?<mesh position={mesh.position} ref={objectref}
        castShadow={true}
        receiveShadow={true}
        frustumCulled={true}
        geometry={mesh.geometry}
        material={mesh.material} />
        :null
    )
},isSame)

function isSame(prev:{
    points: THREE.Vector3Tuple[],
    objectref: React.MutableRefObject<THREE.Mesh>, typeToggle: UIType
},next:{
    points: THREE.Vector3Tuple[],
    objectref: React.MutableRefObject<THREE.Mesh>, typeToggle: UIType
}){return true}