import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const ThreeHeroViewer = ({ modelType = 'cyber_watch' }) => {
  const mountRef = useRef(null);
  const [webGlSupported, setWebGlSupported] = useState(true);
  const [activePreset, setActivePreset] = useState(modelType);

  useEffect(() => {
    setActivePreset(modelType);
  }, [modelType]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let scene, camera, renderer, animationFrameId;
    let mainMeshGroup = new THREE.Group();
    let particlesMesh;

    try {
      // Scene
      scene = new THREE.Scene();

      // Camera
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.set(0, 0, 8);

      // Renderer
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      container.appendChild(renderer.domElement);

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambientLight);

      const emeraldPoint = new THREE.PointLight(0x8EB69B, 5, 20);
      emeraldPoint.position.set(5, 4, 5);
      scene.add(emeraldPoint);

      const deepGreenPoint = new THREE.PointLight(0x235347, 4, 20);
      deepGreenPoint.position.set(-5, -3, 3);
      scene.add(deepGreenPoint);

      const frontDirect = new THREE.DirectionalLight(0xDAF1DE, 1.5);
      frontDirect.position.set(0, 5, 10);
      scene.add(frontDirect);

      // Construct Procedural 3D Models
      scene.add(mainMeshGroup);

      const buildModel = (type) => {
        // Clear previous meshes
        while (mainMeshGroup.children.length > 0) {
          mainMeshGroup.remove(mainMeshGroup.children[0]);
        }

        if (type === 'cyber_watch') {
          // Titanium Outer Bezel Ring
          const torusGeo = new THREE.TorusGeometry(1.8, 0.22, 32, 100);
          const torusMat = new THREE.MeshStandardMaterial({
            color: 0x163B32,
            metalness: 0.95,
            roughness: 0.15,
          });
          const bezel = new THREE.Mesh(torusGeo, torusMat);
          mainMeshGroup.add(bezel);

          // Inner Glowing Dial
          const cylinderGeo = new THREE.CylinderGeometry(1.7, 1.7, 0.2, 64);
          const cylinderMat = new THREE.MeshStandardMaterial({
            color: 0x051F20,
            metalness: 0.8,
            roughness: 0.2,
          });
          const dial = new THREE.Mesh(cylinderGeo, cylinderMat);
          dial.rotation.x = Math.PI / 2;
          mainMeshGroup.add(dial);

          // Sapphire Glass Hologram Screen
          const ringGeo = new THREE.RingGeometry(0.5, 1.5, 32);
          const ringMat = new THREE.MeshBasicMaterial({
            color: 0x8EB69B,
            side: THREE.DoubleSide,
            wireframe: true,
            transparent: true,
            opacity: 0.6
          });
          const holoRing = new THREE.Mesh(ringGeo, ringMat);
          holoRing.position.z = 0.12;
          mainMeshGroup.add(holoRing);

          // Floating Crown / Buttons
          const crownGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.5, 16);
          const crownMat = new THREE.MeshStandardMaterial({ color: 0xDAF1DE, metalness: 0.9, roughness: 0.2 });
          const crown = new THREE.Mesh(crownGeo, crownMat);
          crown.position.set(2.0, 0, 0);
          crown.rotation.z = Math.PI / 2;
          mainMeshGroup.add(crown);

          // Secondary Tech Ring
          const outerRingGeo = new THREE.TorusGeometry(2.3, 0.03, 16, 80);
          const outerRingMat = new THREE.MeshBasicMaterial({ color: 0x235347, transparent: true, opacity: 0.5 });
          const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
          mainMeshGroup.add(outerRing);

        } else if (type === 'audio_pod') {
          // Floating High-tech Headphone/Sphere
          const sphereGeo = new THREE.IcosahedronGeometry(1.6, 4);
          const sphereMat = new THREE.MeshStandardMaterial({
            color: 0x0B2B26,
            metalness: 0.9,
            roughness: 0.1,
            wireframe: false
          });
          const sphere = new THREE.Mesh(sphereGeo, sphereMat);
          mainMeshGroup.add(sphere);

          // Acoustic Orbital Rings
          const ring1Geo = new THREE.TorusGeometry(2.2, 0.06, 16, 100);
          const ring1Mat = new THREE.MeshStandardMaterial({ color: 0x8EB69B, emissive: 0x8EB69B, emissiveIntensity: 0.6 });
          const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
          ring1.rotation.x = 1.2;
          mainMeshGroup.add(ring1);

          const ring2Geo = new THREE.TorusGeometry(2.6, 0.04, 16, 100);
          const ring2Mat = new THREE.MeshStandardMaterial({ color: 0x235347, emissive: 0x235347, emissiveIntensity: 0.4 });
          const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
          ring2.rotation.y = 1.1;
          mainMeshGroup.add(ring2);

        } else {
          // Cyber Geometric Core
          const octaGeo = new THREE.OctahedronGeometry(1.8, 0);
          const octaMat = new THREE.MeshStandardMaterial({
            color: 0x8EB69B,
            metalness: 0.8,
            roughness: 0.1,
            wireframe: true
          });
          const octa = new THREE.Mesh(octaGeo, octaMat);
          mainMeshGroup.add(octa);

          const innerGeo = new THREE.IcosahedronGeometry(1.0, 1);
          const innerMat = new THREE.MeshStandardMaterial({
            color: 0x235347,
            metalness: 0.9,
            roughness: 0.3
          });
          const inner = new THREE.Mesh(innerGeo, innerMat);
          mainMeshGroup.add(inner);
        }
      };

      buildModel(activePreset);

      // Ambient Floating Starfield / Particles
      const particleCount = 180;
      const particleGeometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 16;
        positions[i + 1] = (Math.random() - 0.5) * 16;
        positions[i + 2] = (Math.random() - 0.5) * 12;
      }
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const particleMaterial = new THREE.PointsMaterial({
        color: 0x8EB69B,
        size: 0.05,
        transparent: true,
        opacity: 0.7
      });
      particlesMesh = new THREE.Points(particleGeometry, particleMaterial);
      scene.add(particlesMesh);

      // Mouse Parallax Interaction
      let mouseX = 0;
      let mouseY = 0;
      let targetRotationX = 0;
      let targetRotationY = 0;

      const handleMouseMove = (e) => {
        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        targetRotationY = x * 1.5;
        targetRotationX = y * 1.2;
      };

      container.addEventListener('mousemove', handleMouseMove);

      // Window resize handling
      const handleResize = () => {
        if (!container) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };

      window.addEventListener('resize', handleResize);

      // Animation Loop
      let clock = new THREE.Clock();

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Smooth rotation interpolation
        mainMeshGroup.rotation.y += (targetRotationY - mainMeshGroup.rotation.y + 0.005) * 0.05;
        mainMeshGroup.rotation.x += (targetRotationX - mainMeshGroup.rotation.x) * 0.05;
        
        // Gentle vertical levitation
        mainMeshGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.15;

        // Rotate particles slowly
        if (particlesMesh) {
          particlesMesh.rotation.y = elapsedTime * 0.03;
        }

        renderer.render(scene, camera);
      };

      animate();

      // Cleanup
      return () => {
        cancelAnimationFrame(animationFrameId);
        container.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        if (renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        renderer.dispose();
      };

    } catch (err) {
      console.warn('WebGL initialization failed, using 2D fallback:', err);
      setWebGlSupported(false);
    }
  }, [activePreset]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '380px' }}>
      {webGlSupported ? (
        <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />
      ) : (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)'
        }}>
          <img
            src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"
            alt="LUNA 3D Device"
            style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain', filter: 'drop-shadow(0 0 30px rgba(6,182,212,0.4))' }}
          />
        </div>
      )}

      {/* Model Preset Toggle Bar */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '8px',
        background: 'rgba(255, 255, 255, 0.72)',
        backdropFilter: 'blur(12px)',
        padding: '6px 12px',
        borderRadius: '999px',
        border: '1px solid var(--border-glass)',
        zIndex: 10
      }}>
        <button
          onClick={() => setActivePreset('cyber_watch')}
          style={{
            background: activePreset === 'cyber_watch' ? 'var(--primary)' : 'transparent',
            color: activePreset === 'cyber_watch' ? '#12352D' : 'var(--text-secondary)',
            border: 'none',
            borderRadius: '999px',
            padding: '4px 12px',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Chrono-X
        </button>
      </div>
    </div>
  );
};

export default ThreeHeroViewer;
