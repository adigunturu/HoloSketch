import DeviceDetector from "https://cdn.skypack.dev/device-detector-js@2.2.10";
// import {OBJLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.3/examples/js/loaders/OBJLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js';

// Usage: testSupport({client?: string, os?: string}[])
// Client and os are regular expressions.
// See: https://cdn.jsdelivr.net/npm/device-detector-js@2.2.10/README.md for
// legal values for client and os
testSupport([
  {client: 'Chrome'},
]);

let pointsArr = []
let pointsArrTwo = []
let pointsArrFour = []
let pointsArrThree = []
let pointsArrFive = []
let pointsArrSix = []
let pointsArrSeven = []
let pointsArrEight = []
let pointsArrNine = []
var scene, camera, renderer,orbitcontrols;
var geometry, material, mesh;
var loader = new THREE.OBJLoader();
init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xcccccc);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.set(0, 200, 400);
  camera.lookAt(0, 0, 0);

  // geometry = new THREE.BoxGeometry(200, 200, 200);
  // material = new THREE.MeshStandardMaterial({ color: 0x333333 });

  // mesh = new THREE.Mesh(geometry, material);
  // scene.add(mesh);

  // loader.load('https://raw.githubusercontent.com/OpenGLInsights/OpenGLInsightsCode/master/Chapter%2026%20Indexing%20Multiple%20Vertex%20Arrays/article/suzanne.obj', function (object) {
  //   object.traverse(function (child) {
  //     if (child instanceof THREE.Mesh) {
  //       child.castShadow = true;
  //       child.receiveShadow = true;
  //     }
  //   });
  //   object.position.set(0, 0, 0);
  //   object.scale.set(100, 100, 100);
  //   mesh=object
  //   scene.add(mesh);
  // });

  var planeGeometry = new THREE.PlaneGeometry(1000, 1000);
  var planeMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
  var plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.receiveShadow = true;
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -200
  scene.add(plane);

  var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  var pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(250, 250, 250);
  pointLight.castShadow = true;
  scene.add(pointLight);

  var pointLight2 = new THREE.PointLight(0xffffff, 0.5);
  pointLight2.position.set(-250, 250, -250);
  scene.add(pointLight2);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  orbitcontrols = new OrbitControls( camera, renderer.domElement );
  orbitcontrols.update();
  // mesh.castShadow = true;
  // mesh.receiveShadow = true;

  document.getElementById("three").appendChild(renderer.domElement);
}

function animate() {
  requestAnimationFrame(animate);
  orbitcontrols.update();
  renderer.render(scene, camera);
}


function testSupport(supportedDevices) {
  const deviceDetector = new DeviceDetector();
  const detectedDevice = deviceDetector.parse(navigator.userAgent);

  let isSupported = false;
  for (const device of supportedDevices) {
    if (device.client !== undefined) {
      const re = new RegExp(`^${device.client}$`);
      if (!re.test(detectedDevice.client.name)) {
        continue;
      }
    }
    if (device.os !== undefined) {
      const re = new RegExp(`^${device.os}$`);
      if (!re.test(detectedDevice.os.name)) {
        continue;
      }
    }
    isSupported = true;
    break;
  }
  if (!isSupported) {
    alert(`This demo, running on ${detectedDevice.client.name}/${detectedDevice.os.name}, ` +
          `is not well supported at this time, continue at your own risk.`);
  }
}

const controls = window;
const drawingUtils = window;
const mpObjectron = window;

const config = {locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/objectron/${file}`;
}};

const examples = {
  images: [
    {name: 'Camera image', src: 'https://assets.codepen.io/5409376/camera.jpg'},
    {name: 'Chair image', src: 'https://assets.codepen.io/5409376/chair.jpg'},
    {name: 'Cup image', src: 'https://assets.codepen.io/5409376/cup.jpg'},
    {name: 'Shoe image', src: 'https://assets.codepen.io/5409376/shoe.jpg'},
  ],
  videos: [
    {
      name: 'Camera video',
      src: 'https://assets.codepen.io/5409376/camera_3_8.mp4'
    },
    {
      name: 'Chair video',
      src: 'https://assets.codepen.io/5409376/chair_10_1.mp4'
    },
    {name: 'Cup video', src: 'https://assets.codepen.io/5409376/cup_43_42.mp4'},
    {
      name: 'Shoe video',
      src: 'https://assets.codepen.io/5409376/shoe_1063642984-sd-trim-short.mov'
    }
  ],
};

// Our input frames will come from here.
const videoElement =
    document.getElementsByClassName('input_video')[0];
const canvasElement =
    document.getElementsByClassName('output_canvas')[0] ;
const controlsElement =
    document.getElementsByClassName('control-panel')[0];
const canvasCtx = canvasElement.getContext('2d');

// We'll add this to our control panel later, but we'll save it here so we can
// call tick() each time the graph runs.
const fpsControl = new controls.FPS();

// Optimization: Turn off animated spinner after its hiding animation is done.
const spinner = document.querySelector('.loading');
spinner.ontransitionend = () => {
  spinner.style.display = 'none';
};


setTimeout(() => {
  let p1 = findModePoint(pointsArr)
  let p2 = findModePoint(pointsArrTwo)
  let p3 = findModePoint(pointsArrThree)
  let p4 = findModePoint(pointsArrFour)
  let p5 = findModePoint(pointsArrFive)
  let p6 = findModePoint(pointsArrSix)
  let p7 = findModePoint(pointsArrSeven)
  let p8 = findModePoint(pointsArrEight)
  let p9 = findModePoint(pointsArrNine)
  var point1 = new THREE.Vector3(p1.x, p1.y, p1.z);
  // createGeometry(p2)
  // createGeometry(p3)
  // createGeometry(p4)
  // createGeometry(p5)
  // createGeometry(p6)
  // createGeometry(p7)
  // createGeometry(p8)
  // createGeometry(p9)

  addSpheres({x:0,y:0,z:0})
  addSpheres(p2)
  addSpheres(p3)
  addSpheres(p4)
  addSpheres(p5)
  addSpheres(p6)
  addSpheres(p7)
  addSpheres(p8)
  addSpheres(p9)

}, 30000);

function onResults(results) {

  
  // Hide the spinner.
  document.body.classList.add('loaded');

  // Update the frame rate.
  fpsControl.tick();
  const {
    BACK_BOTTOM_RIGHT,
    BACK_TOP_LEFT,
    BACK_BOTTOM_LEFT,
    BACK_TOP_RIGHT,
    FRONT_BOTTOM_LEFT,
    FRONT_BOTTOM_RIGHT,
    FRONT_TOP_RIGHT,
    FRONT_TOP_LEFT,
    CENTER
  } = mpObjectron.BOX_KEYPOINTS;
  // Draw the overlays.
  canvasCtx.save();
  canvasCtx.drawImage(
      results.image, 0, 0, canvasElement.width, canvasElement.height);
  if (!!results.objectDetections) {
    
    for (const detectedObject of results.objectDetections) {



      // Reformat keypoint information as landmarks, for easy drawing.
      let rot = detectedObject.rotation
      console.log(detectedObject)
      let matrix = new THREE.Matrix4();
      matrix.set(
        rot[0], rot[1], rot[2], 0,
        rot[3], rot[4], rot[5], 0,
        rot[6], rot[7], rot[8], 0,
        0, 0, 0, 1
      );
      // mesh.quaternion.setFromRotationMatrix( matrix );
      const landmarks =
          detectedObject.keypoints.map(x => x.point2d);





      const threeDLandmarks = detectedObject.keypoints.map(x => x.point3d);
      let num = {
        x:Number.parseFloat(threeDLandmarks[CENTER].x).toFixed(2),
        y:Number.parseFloat(threeDLandmarks[CENTER].y).toFixed(2),
        z:Number.parseFloat(threeDLandmarks[CENTER].z).toFixed(2),
      }

      // const xMidPoint = getPlaneCenter(
      //   [threeDLandmarks[BACK_BOTTOM_RIGHT], threeDLandmarks[FRONT_TOP_RIGHT],
      //   threeDLandmarks[BACK_TOP_RIGHT], threeDLandmarks[FRONT_BOTTOM_RIGHT]]);

      let num2 = {
        x: 50 * Number.parseFloat(threeDLandmarks[FRONT_TOP_RIGHT].x).toFixed(2),
        y: 50 * Number.parseFloat(threeDLandmarks[FRONT_TOP_RIGHT].y).toFixed(2),
        z: 50 * Number.parseFloat(threeDLandmarks[FRONT_TOP_RIGHT].z).toFixed(2),
      }

      let num3 = {
        x: 50 * Number.parseFloat(threeDLandmarks[BACK_TOP_RIGHT].x).toFixed(2),
        y: 50 * Number.parseFloat(threeDLandmarks[BACK_TOP_RIGHT].y).toFixed(2),
        z: 50 * Number.parseFloat(threeDLandmarks[BACK_TOP_RIGHT].z).toFixed(2),
      }

      let num4 = {
        x: 50 * Number.parseFloat(threeDLandmarks[FRONT_BOTTOM_RIGHT].x).toFixed(2),
        y: 50 * Number.parseFloat(threeDLandmarks[FRONT_BOTTOM_RIGHT].y).toFixed(2),
        z: 50 * Number.parseFloat(threeDLandmarks[FRONT_BOTTOM_RIGHT].z).toFixed(2),
      }

      let num5 = {
        x: 50 * Number.parseFloat(threeDLandmarks[BACK_BOTTOM_RIGHT].x).toFixed(2),
        y: 50 * Number.parseFloat(threeDLandmarks[BACK_BOTTOM_RIGHT].y).toFixed(2),
        z: 50 * Number.parseFloat(threeDLandmarks[BACK_BOTTOM_RIGHT].z).toFixed(2),
      }

      let num6 = {
        x: 50 * Number.parseFloat(threeDLandmarks[FRONT_TOP_LEFT].x).toFixed(2),
        y: 50 * Number.parseFloat(threeDLandmarks[FRONT_TOP_LEFT].y).toFixed(2),
        z: 50 * Number.parseFloat(threeDLandmarks[FRONT_TOP_LEFT].z).toFixed(2),
      }

      let num7 = {
        x: 50 * Number.parseFloat(threeDLandmarks[FRONT_BOTTOM_LEFT].x).toFixed(2),
        y: 50 * Number.parseFloat(threeDLandmarks[FRONT_BOTTOM_LEFT].y).toFixed(2),
        z: 50 * Number.parseFloat(threeDLandmarks[FRONT_BOTTOM_LEFT].z).toFixed(2),
      }

      let num8 = {
        x: 50 * Number.parseFloat(threeDLandmarks[BACK_TOP_LEFT].x).toFixed(2),
        y: 50 * Number.parseFloat(threeDLandmarks[BACK_TOP_LEFT].y).toFixed(2),
        z: 50 * Number.parseFloat(threeDLandmarks[BACK_TOP_LEFT].z).toFixed(2),
      }
      let num9 = {
        x: 50 * Number.parseFloat(threeDLandmarks[BACK_BOTTOM_LEFT].x).toFixed(2),
        y: 50 * Number.parseFloat(threeDLandmarks[BACK_BOTTOM_LEFT].y).toFixed(2),
        z: 50 * Number.parseFloat(threeDLandmarks[BACK_BOTTOM_LEFT].z).toFixed(2),
      }
      pointsArr.push(num)
      pointsArrTwo.push(num2)
      pointsArrThree.push(num3)
      pointsArrFour.push(num4)
      pointsArrFive.push(num5)
      pointsArrSix.push(num6)
      pointsArrSeven.push(num7)
      pointsArrEight.push(num8)
      pointsArrNine.push(num9)
      console.log()




          // Draw bounding box.
      drawingUtils.drawConnectors(canvasCtx, landmarks,
          mpObjectron.BOX_CONNECTIONS, {color: '#FF0000'});

      // Draw Axes
      drawAxes(canvasCtx, landmarks, {
        x: '#00FF00',
        y: '#FF0000',
        z: '#0000FF',
      });
      // Draw centroid.
      drawingUtils.drawLandmarks(canvasCtx, [landmarks[0]], {color: '#FFFFFF'});
    }
  }
  canvasCtx.restore();
}

const objectron = new mpObjectron.Objectron(config);
objectron.onResults(onResults);

// Present a control panel through which the user can manipulate the solution
// options.
new controls
    .ControlPanel(controlsElement, {
      selfieMode: false,
      modelName: 'Cup',
      maxNumObjects: 1,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.99,
    })
    .add([
      new controls.StaticText({title: 'MediaPipe Objectron'}),
      fpsControl,
      new controls.SourcePicker({
        onSourceChanged: (name, type) => {
          objectron.setOptions({staticImageMode: type !== 'image'});
          objectron.reset();
        },
        onFrame:
            async (input, size) => {
              const aspect = size.height / size.width;
              let width, height;
              if (window.innerWidth > window.innerHeight) {
                height = window.innerHeight;
                width = height / aspect;
              } else {
                width = window.innerWidth;
                height = width * aspect;
              }
              canvasElement.width = width;
              canvasElement.height = height;
              await objectron.send({image: input});
            },
      }),
      new controls.Toggle({title: 'Selfie Mode', field: 'selfieMode'}),
      new controls.DropDownControl({
        title: 'Model',
        field: 'modelName',
        options: [
          {
            name: 'Cup',
            value: 'Cup',
          },
        ]
      }),
      new controls.Slider({
        title: 'Max Num Objects',
        field: 'maxNumObjects',
        range: [1, 10],
        step: 1,
      }),
      new controls.Slider({
        title: 'Min Detection Confidence',
        field: 'minDetectionConfidence',
        range: [0, 1],
        step: 0.01
      }),
      new controls.Slider({
        title: 'Min Tracking Confidence',
        field: 'minTrackingConfidence',
        range: [0, 1],
        step: 0.01
      }),
    ])
    .on(x => {
      const options = x;
      videoElement.classList.toggle('selfie', options.selfieMode);
      objectron.setOptions(options);
    });

function drawAxes(
    canvasCtx, landmarks,
    color) {
  const {
    BACK_BOTTOM_RIGHT,
    BACK_TOP_LEFT,
    BACK_TOP_RIGHT,
    FRONT_BOTTOM_LEFT,
    FRONT_BOTTOM_RIGHT,
    FRONT_TOP_RIGHT,
    FRONT_TOP_LEFT,
    CENTER
  } = mpObjectron.BOX_KEYPOINTS;

  const xMidPoint = lineIntersection(
      [landmarks[BACK_BOTTOM_RIGHT], landmarks[FRONT_TOP_RIGHT]],
      [landmarks[BACK_TOP_RIGHT], landmarks[FRONT_BOTTOM_RIGHT]]);
  const yMidPoint = lineIntersection(
      [landmarks[BACK_TOP_LEFT], landmarks[FRONT_TOP_RIGHT]],
      [landmarks[FRONT_TOP_LEFT], landmarks[BACK_TOP_RIGHT]]);
  const zMidPoint = lineIntersection(
      [landmarks[FRONT_TOP_RIGHT], landmarks[FRONT_BOTTOM_LEFT]],
      [landmarks[FRONT_TOP_LEFT], landmarks[FRONT_BOTTOM_RIGHT]]);

  const LINE_WIDTH = 8;
  const TRIANGLE_BASE = 2 * LINE_WIDTH;

  drawingUtils.drawConnectors(
      canvasCtx, [landmarks[CENTER], xMidPoint], [[0, 1]],
      {color: color.x, lineWidth: LINE_WIDTH});
  // drawingUtils.drawConnectors(
  //     canvasCtx, [landmarks[CENTER], yMidPoint], [[0, 1]],
  //     {color: color.y, lineWidth: LINE_WIDTH});
  // drawingUtils.drawConnectors(
  //     canvasCtx, [landmarks[CENTER], zMidPoint], [[0, 1]],
  //     {color: color.z, lineWidth: LINE_WIDTH});

  drawTriangle(
      canvasCtx, xMidPoint, TRIANGLE_BASE, TRIANGLE_BASE, color.x,
      arctan360(
          xMidPoint.x - landmarks[CENTER].x,
          xMidPoint.y - landmarks[CENTER].y) +
          Math.PI / 2);
  drawTriangle(
      canvasCtx, yMidPoint, TRIANGLE_BASE, TRIANGLE_BASE, color.y,
      arctan360(
          yMidPoint.x - landmarks[CENTER].x,
          yMidPoint.y - landmarks[CENTER].y) +
          Math.PI / 2);
  drawTriangle(
      canvasCtx, zMidPoint, TRIANGLE_BASE, TRIANGLE_BASE, color.z,
      arctan360(
          zMidPoint.x - landmarks[CENTER].x,
          zMidPoint.y - landmarks[CENTER].y) +
          Math.PI / 2);
}

function lineIntersection(
    a, b) {
  const yDiffB = b[0].y - b[1].y;
  const xDiffB = b[0].x - b[1].x;

  const top = (a[0].x - b[0].x) * yDiffB - (a[0].y - b[0].y) * xDiffB;
  const bot = (a[0].x - a[1].x) * yDiffB - (a[0].y - a[1].y) * xDiffB;
  const t = top / bot;

  return {
    x: a[0].x + t * (a[1].x - a[0].x),
    y: a[0].y + t * (a[1].y - a[0].y),
    depth: 0,
  };
}

function drawTriangle(
    ctx, point, height,
    base, color, rotation = 0) {
  const canvas = ctx.canvas;
  const realX = canvas.width * point.x;
  const realY = canvas.height * point.y;
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.translate(realX, realY);
  ctx.rotate(rotation);
  ctx.moveTo(base / 2, 0);
  ctx.lineTo(0, -height);
  ctx.lineTo(-base / 2, 0);
  ctx.lineTo(base / 2, 0);
  ctx.translate(-realX, -realY);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function arctan360(x, y) {
  if (x === 0) {
    return y >= 0 ? Math.PI / 2 : -Math.PI / 2;
  }

  const angle = Math.atan(y / x);

  if (x > 0) {
    return angle;
  }

  return y >= 0 ? (angle + Math.PI) : angle - Math.PI;
}


function findModePoint(points) {
  let pointCounts = {};
  for (let i = 0; i < points.length; i++) {
    let point = points[i];
    let pointKey = point.x + ',' + point.y + ',' + point.z;
    if (pointCounts[pointKey]) {
      pointCounts[pointKey]++;
    } else {
      pointCounts[pointKey] = 1;
    }
  }
  let maxCount = 0;
  let modePointKey = '';
  for (let key in pointCounts) {
    if (pointCounts[key] > maxCount) {
      maxCount = pointCounts[key];
      modePointKey = key;
    }
  }
  let modePointCoords = modePointKey.split(',');
  return {
    x: parseFloat(modePointCoords[0]),
    y: parseFloat(modePointCoords[1]),
    z: parseFloat(modePointCoords[2])
  };
}


function getPlaneCenter(points) {
  let x = 0, y = 0, z = 0;
  for (const point of points) {
    x += point.x;
    y += point.y;
    z += point.z;
  }
  x=Number.parseFloat(x/4).toFixed(2)
  y=Number.parseFloat(y/4).toFixed(2)
  z=Number.parseFloat(z/4).toFixed(2)
  return {x:x, y:y, z:z}
}

function createGeometry(p){
  var point = new THREE.Vector3(p.x, p.y, p.z);

  // Create a geometry object and set its vertices to the two points
  var lineGeometry = new THREE.Geometry();
  lineGeometry.vertices.push(new THREE.Vector3(0,0,0), point);

  // Create a material object and set its color
  var lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });

  // Create a line object using the geometry and material
  var line = new THREE.Line(lineGeometry, lineMaterial);

  // Add the line to the scene
  scene.add(line);
}

function createCuboidWireframe (vertices) {
  const geometry = new THREE.Geometry();
  geometry.vertices = vertices;
  geometry.faces.push(new THREE.Face3(0, 1, 2));
  geometry.faces.push(new THREE.Face3(2, 3, 0));
  geometry.faces.push(new THREE.Face3(1, 5, 6));
  geometry.faces.push(new THREE.Face3(6, 2, 1));
  geometry.faces.push(new THREE.Face3(5, 4, 7));
  geometry.faces.push(new THREE.Face3(7, 6, 5));
  geometry.faces.push(new THREE.Face3(4, 0, 3));
  geometry.faces.push(new THREE.Face3(3, 7, 4));
  geometry.faces.push(new THREE.Face3(3, 2, 6));
  geometry.faces.push(new THREE.Face3(6, 7, 3));
  geometry.faces.push(new THREE.Face3(1, 0, 4));
  geometry.faces.push(new THREE.Face3(4, 5, 1));
  geometry.computeFaceNormals();
  geometry.computeVertexNormals();

  const material = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    shading: THREE.SmoothShading,
  });

  const cuboid = new THREE.Mesh(geometry, material);
  return cuboid;
}

function addSpheres(p){
  let sphereGeo = new  THREE.SphereGeometry();
  const spherematerial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    shading: THREE.SmoothShading,
  });
  const sphere = new THREE.Mesh(sphereGeo, spherematerial);
  sphere.position.set(p.x,p.y,p.z)
  sphere.scale.set(3,3,3)
  scene.add(sphere)
}