import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import * as React from 'react';
import { UIType } from '../../@types';
import { RigidBody, ConvexHullCollider, BallCollider, RigidBodyProps } from '@react-three/rapier';
import { useFrame, useThree } from '@react-three/fiber';
import { calculateSecondObjectPosition, getMeshCenterPoint } from '../../utils';
import { RigidBodyApi } from '@react-three/rapier/dist/declarations/src/types';

export function LoadedTubeLine({ points, objectref, typeToggle, transformDict }: {
    points: THREE.Vector3Tuple[],
    objectref: React.MutableRefObject<THREE.Mesh>, typeToggle: UIType,
    transformDict: { 
        RelPos: [x:number, y:number, z:number, distance:number, direction:THREE.Vector3], 
        rotation: THREE.Quaternion, 
        scale?: number,
        objectOldPosition: THREE.Vector3,
        objectPosition: THREE.Vector3,
    } | null,
}) {
    const [loaded, setLoaded] = useState(false);
    const [mesh, setMesh] = useState<{ material: THREE.Material, geometry: THREE.TubeGeometry, position:THREE.Vector3 } | null>(null);
    const [triggered, setTriggered] = useState(false);
    const [scale, setScale] = useState(new THREE.Vector3(1,1,1));
    const [initialPosition, setInitialPosition] = useState(new THREE.Vector3());

    useEffect(()=>{
        console.log(transformDict,mesh)
        if(transformDict&&mesh){
            if (transformDict.scale !== undefined) {
                let newScale = scale.z+transformDict.scale;
                objectref.current.scale.set(newScale, newScale, newScale)
                return
            }
            let TransformedVector = calculateSecondObjectPosition(transformDict.objectPosition,transformDict.objectOldPosition,initialPosition)
            let tempMesh = mesh;
            tempMesh.position = TransformedVector
            setMesh(tempMesh)
            objectref.current.setRotationFromQuaternion(transformDict?.rotation)
        }else{
            if(objectref.current){//updates on transformdict end
                let tempScale = new THREE.Vector3()
                objectref.current?.getWorldScale(tempScale)
                setScale(tempScale);
                let tempPosition = new THREE.Vector3()
                objectref.current?.getWorldPosition(tempPosition)
                setInitialPosition(tempPosition)
            }
        }
    },[transformDict])


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
        setInitialPosition(center)
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
}

function isSame(prev:{
    points: THREE.Vector3Tuple[],
    objectref: React.MutableRefObject<THREE.Mesh>, typeToggle: UIType,
    transformDict: { 
        RelPos: [x:number, y:number, z:number, distance:number, direction:THREE.Vector3], 
        rotation: THREE.Quaternion, 
        scale?: number,
        objectOldPosition: THREE.Vector3,
        objectPosition: THREE.Vector3,
    } | null,
},next:{
    points: THREE.Vector3Tuple[],
    objectref: React.MutableRefObject<THREE.Mesh>, typeToggle: UIType,
    transformDict: { 
        RelPos: [x:number, y:number, z:number, distance:number, direction:THREE.Vector3], 
        rotation: THREE.Quaternion, 
        scale?: number,
        objectOldPosition: THREE.Vector3,
        objectPosition: THREE.Vector3,
    } | null,
}){
    if(prev.transformDict===next.transformDict){
        return false
    }else{
        return true
    }
}