import * as THREE from "three";

export default function createCake({ text, textColor }) {
  const cake = new THREE.Group();

  // Base cake
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(3, 3, 2.6, 64),
    new THREE.MeshStandardMaterial({ color: "#ffffff", roughness:0.4 })
  );
  base.castShadow = true;
  base.receiveShadow = true;
  cake.add(base);

  // Top layer cream
  const topLayer = new THREE.Mesh(
    new THREE.CylinderGeometry(3.15, 3.15, 0.45, 64),
    new THREE.MeshStandardMaterial({ color:"#ffffff", roughness:0.3 })
  );
  topLayer.position.y = 1.4;
  cake.add(topLayer);

  // Text curved around cake front
  const textCanvas = document.createElement("canvas");
  textCanvas.width = 1024;
  textCanvas.height = 256;
  const ctx = textCanvas.getContext("2d");
  ctx.fillStyle = textColor;
  ctx.font = "bold 68px Brush Script MT";
  ctx.textAlign="center";
  ctx.fillText(text, 512, 170);

  const curvedTexture = new THREE.CanvasTexture(textCanvas);
  const textMat = new THREE.MeshBasicMaterial({ map: curvedTexture, transparent:true });
  const textMesh = new THREE.Mesh(new THREE.PlaneGeometry(4.8,1.1), textMat);
  textMesh.position.set(0,0.4,2.95);
  textMesh.rotation.x = -0.05;
  cake.add(textMesh);

  return cake;
}
