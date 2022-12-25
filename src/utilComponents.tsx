import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import * as React from 'react';
import  {SliderValueLabelProps} from '@mui/material/Slider'
import Tooltip from '@mui/material/Tooltip';

function PhysicsPlane(props:any) {
    return (
      <mesh>
        <planeGeometry args={[10, 10]} />
        <meshBasicMaterial color="#171717" transparent opacity={0.2}/>
      </mesh>
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