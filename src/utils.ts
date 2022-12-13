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
    let geometry = new THREE.TubeGeometry(curve, points.length, 0.08, 20);
    let vertices = geometry.attributes.position.array
    let indices = geometry.index?.array;
    if(vertices!==undefined&&indices!==undefined){
        return[vertices,indices]
    }else{
        return [null]
    }
}

export {makeid, generateGeometry, getMeshCenterPoint}