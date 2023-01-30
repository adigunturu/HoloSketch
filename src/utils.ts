import * as THREE from 'three';

function makeid(length: number) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function getMeshCenterPoint(mesh: THREE.Mesh) {
    if (mesh === null||mesh===undefined||mesh.geometry===undefined) {
        console.log('center return')
        return
    }
    var geometry = mesh.geometry;
    geometry.computeBoundingBox();
    var center = new THREE.Vector3();
    geometry.boundingBox?.getCenter(center);
    return center;
}


function generateGeometry(points:THREE.Vector3Tuple[]){
    if (!points || points === undefined || points.length === 0 || points.length < 5) {
        return [null]
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
    let vertices = geometry.attributes.position.array
    let indices = geometry.index?.array;
    if(vertices!==undefined&&indices!==undefined){
        return[vertices,indices]
    }else{
        return [null]
    }
}

function ApplyMatrixOnMesh(mesh:THREE.Mesh, matrix:THREE.Matrix4){
    let origin = getMeshCenterPoint(mesh);
    if (!origin || origin === undefined) {
        return
    }
    mesh.position.set(origin.x, origin.y, origin.z);
    mesh.geometry.center()
    mesh.applyMatrix4(matrix);
}

export function calculateSecondObjectPosition(
    newFirstObjectPosition:THREE.Vector3, 
    originalFirstObjectPosition:THREE.Vector3, 
    originalSecondObjectPosition:THREE.Vector3) {

    //    let firstObjPos = new THREE.Vector3(newFirstObjectPosition[0],newFirstObjectPosition[1],newFirstObjectPosition[2])
       let firstObjPos = newFirstObjectPosition

    //Vector to store the direction between the two objects
    var direction = new THREE.Vector3();
    //Vector to store the position of the second object
    var secondObjectPosition = new THREE.Vector3();
    //Calculate the direction between the two objects
    direction.subVectors(originalSecondObjectPosition, originalFirstObjectPosition);
    //Normalize the direction vector
    direction.normalize();
    //Calculate the position of the second object by adding the direction vector to the new first object position multiplied by the distance
    secondObjectPosition.copy(firstObjPos).add(direction.multiplyScalar(originalFirstObjectPosition.distanceTo(originalSecondObjectPosition)));
    //Return the position of the second object
    return secondObjectPosition;
}

export {makeid, generateGeometry, getMeshCenterPoint, ApplyMatrixOnMesh}