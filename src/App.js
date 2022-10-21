import React from 'react';
import SketchingCanvas from './SketchingCanvas';

function App() {
  return (
    <div style={{width:'100vw', height:'100vh'}}>
      <SketchingCanvas />
      {/* <div id='CanvasControls' style={{width:'150px',height:'150px',position:'absolute',bottom:'0px', right:'0px'}}/> */}
    </div>
  );
}

export default App;