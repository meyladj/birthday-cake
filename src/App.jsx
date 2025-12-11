import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function BirthdayCakeWithRealCandles() {
  const mountRef = useRef(null);
  const [isBlowing, setIsBlowing] = useState(false);
  const [candlesLit, setCandlesLit] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [micPermission, setMicPermission] = useState(false);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const flamesRef = useRef([]);
  const candleSpritesRef = useRef([]);
  const candleLightsRef = useRef([]);
  const confettiRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const candlesLitRef = useRef(true);
  const showConfettiRef = useRef(false);

  useEffect(() => {
    // Setup Three.js scene
    const scene = new THREE.Scene();
    // Charger une image depuis /public
const loader = new THREE.TextureLoader();
loader.load('/back.jpg', (texture) => {
  scene.background = texture;
});

    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 6, 18);
    camera.lookAt(0, 2, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Simple mouse controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotation = { x: 0, y: 0 };

    const onMouseDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;
        
        rotation.y += deltaX * 0.01;
        rotation.x += deltaY * 0.01;
        
        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('mouseleave', onMouseUp);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(5, 10, 7);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xffd4f0, 0.4);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    // Point lights for candles
    const candleLight1 = new THREE.PointLight(0xffd700, 2, 10);
    candleLight1.position.set(-1.5, 5.5, 0);
    scene.add(candleLight1);
    candleLightsRef.current.push(candleLight1);

    const candleLight2 = new THREE.PointLight(0xffd700, 2, 10);
    candleLight2.position.set(1.5, 5.5, 0);
    scene.add(candleLight2);
    candleLightsRef.current.push(candleLight2);

    // Group for rotating cake
    const cakeGroup = new THREE.Group();
    scene.add(cakeGroup);

    // Create elegant white cake base
    const cakeGeometry = new THREE.CylinderGeometry(3.5, 3.5, 3, 64);
    const cakeMaterial = new THREE.MeshStandardMaterial({
      color: 0xfff8f0,
      roughness: 0.3,
      metalness: 0.1,
    });
    const cakeBase = new THREE.Mesh(cakeGeometry, cakeMaterial);
    cakeBase.position.y = 1.5;
    cakeBase.castShadow = true;
    cakeBase.receiveShadow = true;
    cakeGroup.add(cakeBase);

    // Create wave pattern
    const wavePoints = [];
    const waveSegments = 48;
    const waveHeight = 0.15;
    
    for (let i = 0; i <= waveSegments; i++) {
      const angle = (i / waveSegments) * Math.PI * 2;
      const wave = Math.sin(i * 3) * waveHeight;
      const radius = 3.52;
      
      wavePoints.push(
        new THREE.Vector3(
          Math.cos(angle) * radius,
          1 + wave,
          Math.sin(angle) * radius
        )
      );
    }

  // Create only bottom & top waves – middle removed
for (let layer = 0; layer < 3; layer++) {

  // Skip middle wave
  if (layer === 1) continue;

  const waveCurve = new THREE.CatmullRomCurve3(wavePoints, true);
  const waveGeometry = new THREE.TubeGeometry(waveCurve, 200, 0.08, 8, true);
  const waveMaterial = new THREE.MeshStandardMaterial({
    color: 0xf5f5f5,
    roughness: 0.2,
  });
  const waveMesh = new THREE.Mesh(waveGeometry, waveMaterial);
  waveMesh.position.y = layer * 0.8;
  cakeGroup.add(waveMesh);
}

    // Frosting
    const frostingGeometry = new THREE.CylinderGeometry(3.5, 3.5, 0.2, 64);
    const frostingMaterial = new THREE.MeshStandardMaterial({
      color: 0xfffef8,
      roughness: 0.15,
      metalness: 0.05,
    });
    const frosting = new THREE.Mesh(frostingGeometry, frostingMaterial);
    frosting.position.y = 3.1;
    frosting.castShadow = true;
    cakeGroup.add(frosting);

    // Whipped cream
    const createWhippedCream = (x, z, size = 0.3) => {
      const group = new THREE.Group();
      
      const bottomGeometry = new THREE.SphereGeometry(size, 16, 16);
      const creamMaterial = new THREE.MeshStandardMaterial({
        color: 0xfffff8,
        roughness: 0.4,
        metalness: 0.1,
      });
      const bottom = new THREE.Mesh(bottomGeometry, creamMaterial);
      bottom.scale.y = 0.6;
      group.add(bottom);

      const topGeometry = new THREE.SphereGeometry(size * 0.8, 16, 16);
      const top = new THREE.Mesh(topGeometry, creamMaterial);
      top.position.y = size * 0.8;
      top.scale.y = 1.2;
      group.add(top);

      const peakGeometry = new THREE.ConeGeometry(size * 0.3, size * 0.6, 8);
      const peak = new THREE.Mesh(peakGeometry, creamMaterial);
      peak.position.y = size * 1.5;
      group.add(peak);

      group.position.set(x, 3.2, z);
      group.castShadow = true;
      return group;
    };

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const radius = 2.8;
      const cream = createWhippedCream(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0.25
      );
      cakeGroup.add(cream);
    }

    // Raspberries
    const createRaspberry = (x, z) => {
      const group = new THREE.Group();
      const raspberryColor = 0xc41e3a;
      
      const sphereSize = 0.12;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const offsetX = (i - 1) * sphereSize * 0.8;
          const offsetZ = (j - 1) * sphereSize * 0.8;
          const offsetY = Math.random() * sphereSize * 0.3;
          
          const sphereGeometry = new THREE.SphereGeometry(sphereSize, 8, 8);
          const sphereMaterial = new THREE.MeshStandardMaterial({
            color: raspberryColor,
            roughness: 0.7,
          });
          const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
          sphere.position.set(offsetX, offsetY, offsetZ);
          group.add(sphere);
        }
      }

      const leafGeometry = new THREE.ConeGeometry(0.1, 0.15, 3);
      const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x2d5016 });
      const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
      leaf.position.y = 0.15;
      leaf.rotation.x = Math.PI;
      group.add(leaf);

      group.position.set(x, 3.55, z);
      group.castShadow = true;
      return group;
    };

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + Math.PI / 12;
      const radius = 2.8;
      const raspberry = createRaspberry(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius
      );
      cakeGroup.add(raspberry);
    }

    const centerCream = createWhippedCream(0, 0, 0.4);
    centerCream.position.y = 3.3;
    cakeGroup.add(centerCream);

    const centerRaspberry = createRaspberry(0, 0);
    centerRaspberry.position.y = 4.2;
    cakeGroup.add(centerRaspberry);

    // Load textures FIRST
    const textureLoader = new THREE.TextureLoader();
    
    console.log('Loading candle textures...');
    
    const candle2Texture = textureLoader.load(
      '/candle-2.png',
      (texture) => {
        console.log('✅ Candle 2 texture loaded!');
        texture.needsUpdate = true;
      },
      undefined,
      (error) => {
        console.error('❌ Error loading candle 2:', error);
      }
    );
    
    const candle6Texture = textureLoader.load(
      '/candle-6.png',
      (texture) => {
        console.log('✅ Candle 6 texture loaded!');
        texture.needsUpdate = true;
      },
      undefined,
      (error) => {
        console.error('❌ Error loading candle 6:', error);
      }
    );

    // Create candle with REAL image
    const createRealCandle = (x, z, texture, flameYOffset = 3.2) => {
      const group = new THREE.Group();
      
      // Create sprite with texture
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.01,
      });
      
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(2.5, 3.5, 1); // Larger size
      sprite.position.y = 1.8;
      group.add(sprite);
      candleSpritesRef.current.push(sprite);

      // Flame on top
      const flame = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 16, 16),
        new THREE.MeshStandardMaterial({
          color: 0xffdd00,
          emissive: 0xff8800,
          emissiveIntensity: 2,
          transparent: true,
          opacity: 0.95,
        })
      );
      flame.position.y = flameYOffset;
      flame.scale.y = 1.6;
      group.add(flame);
      flamesRef.current.push(flame);

      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 16, 16),
        new THREE.MeshBasicMaterial({
          color: 0xffaa00,
          transparent: true,
          opacity: 0.3,
        })
      );
      glow.position.y = flameYOffset;
      glow.scale.y = 1.8;
      group.add(glow);
      flamesRef.current.push(glow);

      group.position.set(x, 3.2, z);
      return group;
    };

    // Create both candles with textures
    const candle2Group = createRealCandle(-1.5, 0.5, candle2Texture, 3.8);
    const candle6Group = createRealCandle(1.5, 0.5, candle6Texture, 3.8);
    
    cakeGroup.add(candle2Group);
    cakeGroup.add(candle6Group);

    // ================= TEXTE COURBÉ SUR LE GÂTEAU =================
const textCanvas = document.createElement('canvas');
textCanvas.width = 4096; // x2 pour une meilleure netteté
textCanvas.height = 1024;
const ctx = textCanvas.getContext('2d');

// Fond transparent
ctx.clearRect(0, 0, textCanvas.width, textCanvas.height);

// Dégradé doré
const gradient = ctx.createLinearGradient(0, 0, textCanvas.width, 0);
gradient.addColorStop(0, '#D4AF37');
gradient.addColorStop(0.5, '#FFD700');
gradient.addColorStop(1, '#D4AF37');

// Style texte plus lisible
ctx.fillStyle = gradient;
ctx.strokeStyle = "rgba(0,0,0,0.6)"; // contour sombre lisible
ctx.lineWidth = 14;

ctx.font = "bold 230px Georgia";
ctx.textAlign = "center";
ctx.textBaseline = "middle";

// Texte principal
ctx.strokeText("Joyeux Anniversaire", textCanvas.width/2, 380);
ctx.fillText("Joyeux Anniversaire", textCanvas.width/2, 380);

ctx.font = "bold 260px Georgia";

// Prénom (plus grand & lisible)
ctx.strokeText("Rayano", textCanvas.width/2, 650);
ctx.fillText("Rayano", textCanvas.width/2, 650);

const textTexture = new THREE.CanvasTexture(textCanvas);
textTexture.needsUpdate = true;

// Matériau avec relief doux pour effet "imprimé crème"
const textMaterial = new THREE.MeshStandardMaterial({
  map: textTexture,
  transparent: true,
  roughness: 0.35,
  metalness: 0.15,
});

// Cylindre ultra fin autour du gâteau
const textRadius = 3.53; // 3.5 = gâteau → 3.53 = juste devant la crème
const textHeight = 1.4;  // hauteur bande lisible

const textGeometry = new THREE.CylinderGeometry(
  textRadius,
  textRadius,
  textHeight,
  180,
  1,
  true
);

// Mesh du texte
const textMesh = new THREE.Mesh(textGeometry, textMaterial);
textMesh.position.y = 1.9;      // ajuste la hauteur du message
textMesh.rotation.y = Math.PI;  // face avant du gâteau
cakeGroup.add(textMesh);
// ===============================================================

    // Plate
    const plateGeometry = new THREE.CylinderGeometry(4.5, 4.5, 0.15, 64);
    const plateMaterial = new THREE.MeshStandardMaterial({
      color: 0xffc0e0,
      roughness: 0.2,
      metalness: 0.6,
    });
    const plate = new THREE.Mesh(plateGeometry, plateMaterial);
    plate.position.y = -0.075;
    plate.receiveShadow = true;
    cakeGroup.add(plate);

    const rimGeometry = new THREE.TorusGeometry(4.5, 0.12, 16, 64);
    const rimMaterial = new THREE.MeshStandardMaterial({
      color: 0xffb0d0,
      roughness: 0.15,
      metalness: 0.7,
    });
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.position.y = 0;
    rim.rotation.x = Math.PI / 2;
    cakeGroup.add(rim);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Apply rotation
      cakeGroup.rotation.y = rotation.y;
      cakeGroup.rotation.x = Math.max(-0.5, Math.min(0.5, rotation.x));

      // Make candle sprites always face camera
      candleSpritesRef.current.forEach(sprite => {
        sprite.quaternion.copy(camera.quaternion);
      });

      // Animate flames
      flamesRef.current.forEach((flame, i) => {
        if (candlesLitRef.current && flame.visible) {
          const time = Date.now() * 0.002;
          if (flame.geometry.type === 'SphereGeometry') {
            flame.scale.y = 1.6 + Math.sin(time * 2 + i) * 0.15;
            flame.scale.x = 1 + Math.sin(time * 1.8 + i) * 0.08;
            flame.scale.z = 1 + Math.cos(time * 1.8 + i) * 0.08;
          }
        }
      });

      // Animate confetti
      if (showConfettiRef.current) {
        confettiRef.current.forEach(confetto => {
          confetto.position.y -= 0.04;
          confetto.rotation.x += 0.08;
          confetto.rotation.y += 0.06;
          confetto.rotation.z += 0.04;
          
          if (confetto.position.y < -5) {
            confetto.position.y = 12;
            confetto.position.x = (Math.random() - 0.5) * 15;
            confetto.position.z = (Math.random() - 0.5) * 15;
          }
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('mouseleave', onMouseUp);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
      
      // Nettoyer les références
      flamesRef.current = [];
      candleSpritesRef.current = [];
      candleLightsRef.current = [];
      confettiRef.current = [];
    };
  }, []); // Exécuter une seule fois au montage

  const setupMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 512;
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      setMicPermission(true);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const checkBlow = () => {
        if (!candlesLitRef.current) return;
        
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        
        if (average > 40) {
          setIsBlowing(true);
          setTimeout(() => setIsBlowing(false), 100);
          blowCandles();
        }
        
        requestAnimationFrame(checkBlow);
      };
      checkBlow();
    } catch (err) {
      console.error('Microphone access denied:', err);
    }
  };

  const blowCandles = () => {
    if (!candlesLit) return;
    
    console.log('Soufflage des bougies !'); // Pour debug
    console.log('Nombre de flammes:', flamesRef.current.length);
    
    setCandlesLit(false);
    candlesLitRef.current = false; // Mettre à jour la ref
    
    // Éteindre IMMÉDIATEMENT toutes les flammes
    flamesRef.current.forEach((flame, index) => {
      console.log(`Extinction flamme ${index}`);
      flame.visible = false;
    });
    
    // Éteindre progressivement les lumières des bougies
    candleLightsRef.current.forEach(light => {
      const startIntensity = light.intensity;
      const startTime = Date.now();
      const duration = 500;
      
      const dimLight = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        light.intensity = startIntensity * (1 - progress);
        
        if (progress < 1) {
          requestAnimationFrame(dimLight);
        }
      };
      
      dimLight();
    });

    // Lancer les confettis après un court délai
    setTimeout(() => {
      createConfetti();
      setShowConfetti(true);
      showConfettiRef.current = true; // Mettre à jour la ref
    }, 600);
  };

  const createConfetti = () => {
    const scene = sceneRef.current;
    const confettiColors = [
      0xffc0e0, 0xffd700, 0xc41e3a, 0xffe4e1, 
      0xffd4f0, 0xffb0d0, 0xd4af37, 0xff69b4
    ];
    
    for (let i = 0; i < 300; i++) {
      const shapes = ['box', 'heart', 'star'];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      
      let geometry;
      if (shape === 'box') {
        geometry = new THREE.BoxGeometry(0.15, 0.15, 0.03);
      } else if (shape === 'heart') {
        geometry = new THREE.SphereGeometry(0.1, 8, 8);
      } else {
        geometry = new THREE.ConeGeometry(0.1, 0.2, 5);
      }
      
      const material = new THREE.MeshStandardMaterial({
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        metalness: 0.6,
        roughness: 0.3,
      });
      const confetto = new THREE.Mesh(geometry, material);
      
      confetto.position.set(
        (Math.random() - 0.5) * 12,
        12 + Math.random() * 5,
        (Math.random() - 0.5) * 12
      );
      
      confetto.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      
      scene.add(confetto);
      confettiRef.current.push(confetto);
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      position: 'relative',
      backgroundImage: "url('/back.png')",
backgroundSize: 'cover',
backgroundPosition: 'center',
backgroundRepeat: 'no-repeat',

      fontFamily: "'Cormorant Garamond', serif"
    }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      
      {candlesLit && micPermission && (
        <div style={{
          position: 'absolute',
          top: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          zIndex: 10,
        }}>
          <h1 style={{
            fontSize: '48px',
            margin: 0,
            fontWeight: 600,
            letterSpacing: '3px',
            color: '#D4AF37',
            textShadow: '3px 3px 6px rgba(0,0,0,0.2)',
            fontStyle: 'italic',
            animation: 'gentlePulse 2s ease-in-out infinite',
          }}>
            💨 Blow the Candles 💨
          </h1>
        </div>
      )}

      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '15px 25px',
        borderRadius: '15px',
        fontSize: '16px',
        color: '#8B4513',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        zIndex: 10,
      }}>
         <strong>Glisser</strong> pour tourner le gâteau
      </div>

      {candlesLit && (
  <button
    onClick={blowCandles}
    style={{
      position: 'absolute',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '18px 40px',
      fontSize: '20px',
      fontWeight: 500,
      background: 'linear-gradient(135deg, #ffd1e8 0%, #ff9fcf 100%)',
      color: '#8B1333',
      border: '2px solid rgba(212, 175, 55, 0.7)',
      borderRadius: '50px',
      cursor: 'pointer',
      boxShadow: '0 6px 20px rgba(255, 160, 200, 0.5)',
      transition: 'all 0.2s ease',
      zIndex: 10,
      letterSpacing: '1px',
    }}
    onMouseOver={(e) => {
      e.target.style.transform = 'translateX(-50%) scale(1.05)';
    }}
    onMouseOut={(e) => {
      e.target.style.transform = 'translateX(-50%) scale(1)';
    }}
  >
     Blow the candles
  </button>
)}


      {!candlesLit && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 100,
          animation: 'elegantFadeIn 1.2s ease-out',
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.98)',
            padding: '50px 80px',
            borderRadius: '30px',
            fontSize: '52px',
            fontWeight: 400,
            color: '#D4AF37',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
            border: '3px solid #ffc0e0',
            boxShadow: '0 0 60px rgba(255, 192, 224, 0.6)',
            fontStyle: 'italic',
          }}>
            🎊 Happy 26th Birthday Railo! 🎊
            <div style={{ 
              fontSize: '32px', 
              marginTop: '20px',
              color: '#c41e3a',
              fontWeight: 300,
            }}>
              Make a beautiful wish ✨
            </div>
          </div>
        </div>
      )}

      {isBlowing && candlesLit && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '100px',
          animation: 'blowEffect 0.6s ease-out',
          zIndex: 50,
          filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.8))',
        }}>
          💨
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
        
        @keyframes gentlePulse {
          0%, 100% { transform: translateX(-50%) scale(1); }
          50% { transform: translateX(-50%) scale(1.05); }
        }
        
        @keyframes elegantFadeIn {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        
        @keyframes blowEffect {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.3);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.3);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(2);
          }
        }
        
        body {
          margin: 0;
          overflow: hidden;
          cursor: grab;
        }
        
        body:active {
          cursor: grabbing;
        }
      `}</style>
    </div>
  );
}