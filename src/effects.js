import * as THREE from "three";

export function spawnConfetti(scene){
  for(let i=0;i<200;i++){
    const c=new THREE.Mesh(
      new THREE.BoxGeometry(0.12,0.12,0.05),
      new THREE.MeshStandardMaterial({color:Math.random()*0xffffff})
    );
    c.position.set((Math.random()-0.5)*10,6,(Math.random()-0.5)*10);
    scene.add(c);
  }
}

export function spawnBalloons(scene){
  const colors=["#FF69B4","#87CEFA","#FFD700","#9B59B6"];
  for(let i=0;i<8;i++){
    const bal=new THREE.Mesh(
      new THREE.SphereGeometry(0.9,32,32),
      new THREE.MeshStandardMaterial({color:colors[i%colors.length],metalness:0.3,roughness:0.3})
    );
    bal.position.set((Math.random()-0.5)*6,4+(i*0.3),(Math.random()-0.5)*6);
    scene.add(bal);
  }
}
