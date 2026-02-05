import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function BirthdayCake3D() {
  const mountRef = useRef(null);
  const [isBlowing, setIsBlowing] = useState(false);
  const [candlesLit, setCandlesLit] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [micPermission, setMicPermission] = useState(false);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const flamesRef = useRef([]);
  const confettiRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  useEffect(() => {
    // Setup Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a0f0a);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 15);
    camera.lookAt(0, 2, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffd4a3, 0.3);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffffff, 1.5);
    spotLight.position.set(0, 15, 10);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 2048;
    spotLight.shadow.mapSize.height = 2048;
    scene.add(spotLight);

    // Point lights for candles (orange glow)
    const candleLight1 = new THREE.PointLight(0xff9944, 2, 10);
    candleLight1.position.set(-1.5, 4.5, 0);
    scene.add(candleLight1);

    const candleLight2 = new THREE.PointLight(0xff9944, 2, 10);
    candleLight2.position.set(1.5, 4.5, 0);
    scene.add(candleLight2);

    // Create chocolate cake base (main body)
    const cakeGeometry = new THREE.CylinderGeometry(3, 3, 2, 32);
    const cakeMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a2511,
      roughness: 0.3,
      metalness: 0.1,
    });
    const cakeBase = new THREE.Mesh(cakeGeometry, cakeMaterial);
    cakeBase.position.y = 1;
    cakeBase.castShadow = true;
    cakeBase.receiveShadow = true;
    scene.add(cakeBase);

    // Cake top layer (frosting)
    const frostingGeometry = new THREE.CylinderGeometry(3.1, 3.1, 0.3, 32);
    const frostingMaterial = new THREE.MeshStandardMaterial({
      color: 0x5c3317,
      roughness: 0.2,
      metalness: 0.2,
    });
    const frosting = new THREE.Mesh(frostingGeometry, frostingMaterial);
    frosting.position.y = 2.15;
    frosting.castShadow = true;
    scene.add(frosting);

    // Decorative chocolate drips
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const dripGeometry = new THREE.SphereGeometry(0.15, 16, 16);
      const dripMaterial = new THREE.MeshStandardMaterial({
        color: 0x3d1f0f,
        roughness: 0.4,
      });
      const drip = new THREE.Mesh(dripGeometry, dripMaterial);
      drip.position.set(
        Math.cos(angle) * 3,
        1.8 + Math.random() * 0.3,
        Math.sin(angle) * 3
      );
      drip.scale.y = 1.5;
      scene.add(drip);
    }

    // Create candles
    const createCandle = (x, z, number = null) => {
      const group = new THREE.Group();
      
      // Candle body
      const candleGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1.5, 16);
      const candleMaterial = new THREE.MeshStandardMaterial({
        color: number ? 0xffe4b5 : 0xff6b9d,
        roughness: 0.6,
      });
      const candle = new THREE.Mesh(candleGeometry, candleMaterial);
      candle.castShadow = true;
      group.add(candle);

      // Wick
      const wickGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.2, 8);
      const wickMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
      const wick = new THREE.Mesh(wickGeometry, wickMaterial);
      wick.position.y = 0.85;
      group.add(wick);

      // Flame
      const flameGeometry = new THREE.SphereGeometry(0.15, 16, 16);
      const flameMaterial = new THREE.MeshStandardMaterial({
        color: 0xffaa00,
        emissive: 0xff6600,
        emissiveIntensity: 2,
        transparent: true,
        opacity: 0.9,
      });
      const flame = new THREE.Mesh(flameGeometry, flameMaterial);
      flame.position.y = 1.05;
      flame.scale.y = 1.5;
      group.add(flame);
      flamesRef.current.push(flame);

      // Number on candle
      if (number) {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#8B4513';
        ctx.font = 'bold 48px Georgia';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(number, 32, 32);
        
        const texture = new THREE.CanvasTexture(canvas);
        const numberMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
        const numberGeometry = new THREE.PlaneGeometry(0.4, 0.4);
        const numberMesh = new THREE.Mesh(numberGeometry, numberMaterial);
        numberMesh.position.set(0, 0, 0.16);
        group.add(numberMesh);
      }

      group.position.set(x, 2.3, z);
      return group;
    };

    // Add candles with numbers
    const candle1 = createCandle(-1.5, 0, '2');
    const candle2 = createCandle(1.5, 0, '6');
    scene.add(candle1);
    scene.add(candle2);

    // Add decorative candles
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = 2.2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const decorCandle = createCandle(x, z);
      scene.add(decorCandle);
    }

    // Text on cake - "Joyeux Anniversaire "
    const textCanvas = document.createElement('canvas');
    textCanvas.width = 1024;
    textCanvas.height = 256;
    const textCtx = textCanvas.getContext('2d');
    textCtx.fillStyle = '#FFD700';
    textCtx.font = 'bold 60px Brush Script MT, cursive';
    textCtx.textAlign = 'center';
    textCtx.textBaseline = 'middle';
    textCtx.fillText('Joyeux Anniversaire', 512, 80);
    textCtx.fillText('YIDIR', 512, 160);
    
    const textTexture = new THREE.CanvasTexture(textCanvas);
    const textMaterial = new THREE.MeshBasicMaterial({ map: textTexture, transparent: true });
    const textGeometry = new THREE.PlaneGeometry(4, 1);
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(0, 1, 3.1);
    scene.add(textMesh);

    // Plate
    const plateGeometry = new THREE.CylinderGeometry(4, 4, 0.2, 32);
    const plateMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5,
      roughness: 0.2,
      metalness: 0.8,
    });
    const plate = new THREE.Mesh(plateGeometry, plateMaterial);
    plate.position.y = -0.1;
    plate.receiveShadow = true;
    scene.add(plate);

    // Animation loop
    let rotation = 0;
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate cake slowly
      rotation += 0.002;
      cakeBase.rotation.y = rotation;
      frosting.rotation.y = rotation;
      textMesh.rotation.y = rotation;

      // Animate flames
      flamesRef.current.forEach((flame, i) => {
        if (candlesLit) {
          const time = Date.now() * 0.003;
          flame.scale.y = 1.5 + Math.sin(time + i) * 0.2;
          flame.scale.x = 1 + Math.sin(time * 1.5 + i) * 0.1;
          flame.scale.z = 1 + Math.cos(time * 1.5 + i) * 0.1;
        }
      });

      // Animate confetti
      if (showConfetti) {
        confettiRef.current.forEach(confetto => {
          confetto.position.y -= 0.05;
          confetto.rotation.x += 0.1;
          confetto.rotation.y += 0.05;
          
          if (confetto.position.y < -5) {
            confetto.position.y = 10;
          }
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [candlesLit, showConfetti]);

  // Microphone setup for blow detection
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

      // Start monitoring for blow
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const checkBlow = () => {
        if (!candlesLit) return;
        
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
    
    setCandlesLit(false);
    
    // Hide flames
    flamesRef.current.forEach(flame => {
      flame.visible = false;
    });

    // Trigger confetti
    setTimeout(() => {
      createConfetti();
      setShowConfetti(true);
    }, 500);
  };

  const createConfetti = () => {
    const scene = sceneRef.current;
    const confettiColors = [0xff6b9d, 0xffd700, 0x00bfff, 0x9370db, 0xff69b4, 0x00ff7f];
    
    for (let i = 0; i < 200; i++) {
      const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.02);
      const material = new THREE.MeshStandardMaterial({
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        metalness: 0.5,
      });
      const confetto = new THREE.Mesh(geometry, material);
      
      confetto.position.set(
        (Math.random() - 0.5) * 10,
        10 + Math.random() * 5,
        (Math.random() - 0.5) * 10
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
      background: 'linear-gradient(135deg, #1a0f0a 0%, #2d1810 100%)',
      fontFamily: "'Playfair Display', serif"
    }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      
      {/* Title */}
      <div style={{
        position: 'absolute',
        top: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        color: '#FFD700',
        textShadow: '0 0 20px rgba(255, 215, 0, 0.6)',
        zIndex: 10,
      }}>
        <h1 style={{
          fontSize: '48px',
          margin: 0,
          fontWeight: 700,
          letterSpacing: '2px',
          animation: 'glow 2s ease-in-out infinite',
        }}>
          🎉 Joyeux Anniversaire YIDIR 🎉
        </h1>
      </div>

      {/* Blow instruction */}
      {candlesLit && micPermission && (
        <div style={{
          position: 'absolute',
          bottom: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          zIndex: 10,
        }}>
          <div style={{
            background: 'rgba(255, 107, 157, 0.95)',
            padding: '20px 40px',
            borderRadius: '50px',
            fontSize: '32px',
            fontWeight: 'bold',
            color: 'white',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            animation: 'pulse 1.5s ease-in-out infinite',
            border: '3px solid rgba(255, 255, 255, 0.5)',
            boxShadow: '0 0 30px rgba(255, 107, 157, 0.6)',
          }}>
             Blow the Candle! 
          </div>
        </div>
      )}

      {/* Microphone permission button */}
      {!micPermission && (
        <button
          onClick={setupMicrophone}
          style={{
            position: 'absolute',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '20px 40px',
            fontSize: '24px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(255, 107, 157, 0.4)',
            transition: 'all 0.3s ease',
            zIndex: 10,
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateX(-50%) scale(1.05)';
            e.target.style.boxShadow = '0 12px 30px rgba(255, 107, 157, 0.6)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateX(-50%) scale(1)';
            e.target.style.boxShadow = '0 8px 20px rgba(255, 107, 157, 0.4)';
          }}
        >
          🎤 Enable Microphone to Blow
        </button>
      )}

      {/* Celebration message */}
      {!candlesLit && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 100,
          animation: 'fadeInScale 1s ease-out',
        }}>
          <div style={{
            background: 'rgba(255, 215, 0, 0.95)',
            padding: '40px 60px',
            borderRadius: '30px',
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#8B4513',
            textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            border: '4px solid white',
            boxShadow: '0 0 50px rgba(255, 215, 0, 0.8)',
          }}>
            🎊 Happy 26th Birthday! 🎊
            <div style={{ fontSize: '32px', marginTop: '10px' }}>
              Make a wish! ✨
            </div>
          </div>
        </div>
      )}

      {/* Blow indicator */}
      {isBlowing && candlesLit && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '80px',
          animation: 'blowEffect 0.5s ease-out',
          zIndex: 50,
        }}>
          💨
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap');
        
        @keyframes pulse {
          0%, 100% { transform: translateX(-50%) scale(1); }
          50% { transform: translateX(-50%) scale(1.08); }
        }
        
        @keyframes glow {
          0%, 100% { text-shadow: 0 0 20px rgba(255, 215, 0, 0.6); }
          50% { text-shadow: 0 0 40px rgba(255, 215, 0, 1); }
        }
        
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        
        @keyframes blowEffect {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.5);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(2);
          }
        }
        
        body {
          margin: 0;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
