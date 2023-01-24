import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import * as React from 'react';
import  {SliderValueLabelProps} from '@mui/material/Slider'
import { RigidBody, Debug, Physics } from "@react-three/rapier";
import Tooltip from '@mui/material/Tooltip';
import {UIType} from './@types'
import { RoundedBox } from '@react-three/drei';

function PhysicsPlane(props: any) {
  return (
      <RigidBody position={[0,-3,0]} type={'fixed'}  colliders={'cuboid'}>
        {/* <mesh position={[0, 0, -3]}>
          <planeGeometry args={[10, 10]} />
          <meshBasicMaterial color="#171717" transparent opacity={0.2} />
        </mesh> */}

      <RoundedBox args={[10,0.08,10]} smoothness={30}>
        <meshStandardMaterial color="white" />
      </RoundedBox>
      </RigidBody>
      )
}


function UITypeFunction(props: { type: UIType, pause:boolean, children: React.ReactChild }): React.ReactElement {
  return (
      props.type.includes('physics')?
      <Physics paused={props.pause}>
        {props.children}
        {/* <Debug/> */}
      </Physics>:<>{props.children}</>
  )
}

function DynamicObject(props:{type:UIType,children: React.ReactChild}):React.ReactElement{
  return(
    props.type.includes('physics')?
    <RigidBody colliders={'hull'}>
      {props.children}
    </RigidBody>:<>{props.children}</>
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
export {PhysicsPlane, LabelToolTip, UITypeFunction, DynamicObject}