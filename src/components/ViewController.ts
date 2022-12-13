import { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as THREE from 'three';

export default function  ViewController(){
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