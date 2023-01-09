import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import * as React from 'react';
import  {SliderValueLabelProps} from '@mui/material/Slider'
import { RigidBody, Debug } from "@react-three/rapier";
import Tooltip from '@mui/material/Tooltip';

function PhysicsPlane(props: any) {
  return (
      <RigidBody rotation={[-Math.PI / 2, 0, 0]} colliders={'cuboid'}>
        <mesh position={[0, 0, -3]}>
          <planeGeometry args={[10, 10]} />
          <meshBasicMaterial color="#171717" transparent opacity={0.2} />
        </mesh>
      </RigidBody>
      )
}

function LabelToolTip(props: SliderValueLabelProps) {
    const { children, value } = props;

    return (
        <Tooltip enterTouchDelay={0} placement="right" title={value}>
            {children}
        </Tooltip>
    );
}
export {PhysicsPlane, LabelToolTip}