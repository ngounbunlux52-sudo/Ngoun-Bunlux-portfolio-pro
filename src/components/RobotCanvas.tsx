import { useEffect, useRef } from "react";
import * as THREE from "three";
import { SectionType } from "../types";

interface RobotCanvasProps {
  activeSection: SectionType;
  eyeState?: "idle" | "happy" | "thinking" | "waving";
}

export default function RobotCanvas({ activeSection, eyeState = "idle" }: RobotCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeSectionRef = useRef<SectionType>(activeSection);
  const eyeStateRef = useRef<string>(eyeState);

  // Sync refs to avoid re-triggering useEffect
  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  useEffect(() => {
    eyeStateRef.current = eyeState;
  }, [eyeState]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.015); // subtle blue-slate space fog

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xddeeff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);

    // Glowing rim / backlight
    const rimLight = new THREE.DirectionalLight(0x3b82f6, 1.8);
    rimLight.position.set(-5, -3, -5);
    scene.add(rimLight);

    // Dynamic blue point light inside chest
    const chestGlowLight = new THREE.PointLight(0x00f2fe, 3, 4);
    chestGlowLight.position.set(0, 0.5, 0.5);
    scene.add(chestGlowLight);

    // 3. Materials
    // Premium shiny off-white ceramic/composite (Apple-style clearcoat)
    const ceramicMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf3f4f6,
      roughness: 0.12,
      metalness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
    });

    // Dark glass visor
    const glassVisorMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0b1329,
      roughness: 0.05,
      metalness: 0.9,
      clearcoat: 1.0,
      transmission: 0.2,
      thickness: 0.8,
    });

    // Silver/chrome premium metal accents (Tesla-style)
    const chromeMaterial = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      roughness: 0.2,
      metalness: 0.95,
    });

    // Dark grey inner joints
    const jointMaterial = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.5,
      metalness: 0.2,
    });

    // Emissive glowing cyan/blue LED light
    const glowBlueMaterial = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
    });

    const glowBlueCore = new THREE.MeshStandardMaterial({
      color: 0x00f2fe,
      emissive: 0x00f2fe,
      emissiveIntensity: 3.0,
    });

    // 4. Building the Robot Mesh hierarchy
    const robotGroup = new THREE.Group();
    const floatGroup = new THREE.Group();
    scene.add(robotGroup);
    robotGroup.add(floatGroup);

    // Torso (sleek egg-like chest core)
    const torsoGroup = new THREE.Group();
    floatGroup.add(torsoGroup);

    const torsoGeo = new THREE.CapsuleGeometry(0.7, 1.1, 16, 32);
    const torso = new THREE.Mesh(torsoGeo, ceramicMaterial);
    torso.castShadow = true;
    torso.receiveShadow = true;
    torsoGroup.add(torso);

    // Glowing Chest Core "AI Core" (insert element)
    const coreOuterGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.1, 32);
    const coreOuter = new THREE.Mesh(coreOuterGeo, chromeMaterial);
    coreOuter.rotation.x = Math.PI / 2;
    coreOuter.position.set(0, 0.3, 0.65);
    torsoGroup.add(coreOuter);

    const coreInnerGeo = new THREE.SphereGeometry(0.16, 16, 16);
    const coreInner = new THREE.Mesh(coreInnerGeo, glowBlueCore);
    coreInner.position.set(0, 0.3, 0.72);
    torsoGroup.add(coreInner);

    // Sleek Collar Accents
    const collarGeo = new THREE.TorusGeometry(0.4, 0.08, 16, 32);
    const collar = new THREE.Mesh(collarGeo, chromeMaterial);
    collar.rotation.x = Math.PI / 2;
    collar.position.set(0, 0.8, 0);
    torsoGroup.add(collar);

    // Thruster Base / circular engine (no clunky robot legs!)
    const baseGroup = new THREE.Group();
    baseGroup.position.set(0, -0.9, 0);
    torsoGroup.add(baseGroup);

    const thrusterConeGeo = new THREE.CylinderGeometry(0.4, 0.15, 0.4, 32);
    const thrusterCone = new THREE.Mesh(thrusterConeGeo, chromeMaterial);
    baseGroup.add(thrusterCone);

    const glowRingGeo = new THREE.TorusGeometry(0.28, 0.05, 8, 32);
    const glowRing = new THREE.Mesh(glowRingGeo, glowBlueCore);
    glowRing.rotation.x = Math.PI / 2;
    glowRing.position.set(0, -0.2, 0);
    baseGroup.add(glowRing);

    // HEAD GROUP
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.15, 0);
    floatGroup.add(headGroup);

    // Neck joint
    const neckGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.3, 16);
    const neck = new THREE.Mesh(neckGeo, chromeMaterial);
    neck.position.set(0, -0.15, 0);
    headGroup.add(neck);

    const headBaseGeo = new THREE.SphereGeometry(0.72, 32, 32);
    const headBase = new THREE.Mesh(headBaseGeo, ceramicMaterial);
    headBase.castShadow = true;
    headBase.receiveShadow = true;
    headGroup.add(headBase);

    // Face Visor panel
    const visorGeo = new THREE.SphereGeometry(0.68, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.8);
    const visor = new THREE.Mesh(visorGeo, glassVisorMaterial);
    visor.scale.set(1.02, 0.95, 1.05);
    visor.position.set(0, 0.05, 0.05);
    visor.rotation.x = -0.1;
    headGroup.add(visor);

    // Digital LED Eyes (Left and Right)
    const eyeLeftGeo = new THREE.CapsuleGeometry(0.06, 0.12, 8, 16);
    const eyeLeft = new THREE.Mesh(eyeLeftGeo, glowBlueCore);
    eyeLeft.position.set(-0.25, 0.1, 0.62);
    eyeLeft.rotation.z = Math.PI / 2; // Sleek horizontal capsules
    headGroup.add(eyeLeft);

    const eyeRightGeo = new THREE.CapsuleGeometry(0.06, 0.12, 8, 16);
    const eyeRight = new THREE.Mesh(eyeRightGeo, glowBlueCore);
    eyeRight.position.set(0.25, 0.1, 0.62);
    eyeRight.rotation.z = Math.PI / 2;
    headGroup.add(eyeRight);

    // Side ear antenna disc sensors
    const earLeftGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.08, 16);
    const earLeft = new THREE.Mesh(earLeftGeo, chromeMaterial);
    earLeft.position.set(-0.73, 0.05, 0);
    earLeft.rotation.z = Math.PI / 2;
    headGroup.add(earLeft);

    const earLeftLightGeo = new THREE.SphereGeometry(0.04, 16, 16);
    const earLeftLight = new THREE.Mesh(earLeftLightGeo, glowBlueCore);
    earLeftLight.position.set(-0.78, 0.05, 0);
    headGroup.add(earLeftLight);

    const earRightGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.08, 16);
    const earRight = new THREE.Mesh(earRightGeo, chromeMaterial);
    earRight.position.set(0.73, 0.05, 0);
    earRight.rotation.z = -Math.PI / 2;
    headGroup.add(earRight);

    const earRightLightGeo = new THREE.SphereGeometry(0.04, 16, 16);
    const earRightLight = new THREE.Mesh(earRightLightGeo, glowBlueCore);
    earRightLight.position.set(0.78, 0.05, 0);
    headGroup.add(earRightLight);

    // LEFT ARM GROUP
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.85, 0.6, 0);
    torsoGroup.add(leftArmGroup);

    // Shoulder ball
    const leftShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), jointMaterial);
    leftArmGroup.add(leftShoulder);

    // Upper arm
    const leftUpperArmGroup = new THREE.Group();
    leftUpperArmGroup.position.set(-0.1, -0.1, 0);
    leftArmGroup.add(leftUpperArmGroup);

    const leftUpperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.4, 8, 16), ceramicMaterial);
    leftUpperArm.position.y = -0.25;
    leftUpperArmGroup.add(leftUpperArm);

    // Elbow joint
    const leftElbow = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), jointMaterial);
    leftElbow.position.y = -0.5;
    leftUpperArmGroup.add(leftElbow);

    // Forearm
    const leftForearmGroup = new THREE.Group();
    leftForearmGroup.position.set(0, -0.5, 0);
    leftUpperArmGroup.add(leftForearmGroup);

    const leftForearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.45, 8, 16), ceramicMaterial);
    leftForearm.position.y = -0.28;
    leftForearmGroup.add(leftForearm);

    // Hand pad and index finger (sleek single pointer geometry)
    const leftHandGroup = new THREE.Group();
    leftHandGroup.position.set(0, -0.55, 0);
    leftForearmGroup.add(leftHandGroup);

    const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), chromeMaterial);
    leftHandGroup.add(leftHand);

    // Pointer finger pointing outward
    const leftFinger = new THREE.Mesh(new THREE.CapsuleGeometry(0.02, 0.15, 4, 8), chromeMaterial);
    leftFinger.position.set(0, -0.15, 0.05);
    leftFinger.rotation.x = -Math.PI / 3; // point forward-ish
    leftHandGroup.add(leftFinger);

    // RIGHT ARM GROUP
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.85, 0.6, 0);
    torsoGroup.add(rightArmGroup);

    // Shoulder ball
    const rightShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), jointMaterial);
    rightArmGroup.add(rightShoulder);

    // Upper arm
    const rightUpperArmGroup = new THREE.Group();
    rightUpperArmGroup.position.set(0.1, -0.1, 0);
    rightArmGroup.add(rightUpperArmGroup);

    const rightUpperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.4, 8, 16), ceramicMaterial);
    rightUpperArm.position.y = -0.25;
    rightUpperArmGroup.add(rightUpperArm);

    // Elbow joint
    const rightElbow = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), jointMaterial);
    rightElbow.position.y = -0.5;
    rightUpperArmGroup.add(rightElbow);

    // Forearm
    const rightForearmGroup = new THREE.Group();
    rightForearmGroup.position.set(0, -0.5, 0);
    rightUpperArmGroup.add(rightForearmGroup);

    const rightForearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.45, 8, 16), ceramicMaterial);
    rightForearm.position.y = -0.28;
    rightForearmGroup.add(rightForearm);

    // Hand pad and fingers
    const rightHandGroup = new THREE.Group();
    rightHandGroup.position.set(0, -0.55, 0);
    rightForearmGroup.add(rightHandGroup);

    const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), chromeMaterial);
    rightHandGroup.add(rightHand);

    const rightFinger = new THREE.Mesh(new THREE.CapsuleGeometry(0.02, 0.15, 4, 8), chromeMaterial);
    rightFinger.position.set(0, -0.15, 0.05);
    rightFinger.rotation.x = -Math.PI / 3;
    rightHandGroup.add(rightFinger);

    // Centering setup
    robotGroup.position.set(0, -0.2, 0);

    // 5. Interactivity: Tracking mouse position
    const mouse = { x: 0, y: 0 };
    const targetMouse = { x: 0, y: 0 };

    const handleMouseMove = (event: MouseEvent) => {
      // Normalize mouse positions between -1 and 1
      targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // 6. Animation variables
    let time = 0;
    let lastTime = performance.now();
    let isCanvasVisible = true;
    let frameId: number | null = null;

    // Use IntersectionObserver to pause rendering when canvas is out of view
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      const wasVisible = isCanvasVisible;
      isCanvasVisible = entry.isIntersecting;
      
      if (isCanvasVisible && !wasVisible) {
        lastTime = performance.now();
        if (frameId === null) {
          frameId = requestAnimationFrame(animate);
        }
      }
    }, { threshold: 0.02 });
    visibilityObserver.observe(container);

    // Blink states
    let lastBlinkTime = 0;
    let blinkDuration = 0.15; // seconds
    let isBlinking = false;
    let nextBlinkDelay = 3 + Math.random() * 4; // blink every 3-7s

    // Initial load waving tracking
    let waveTime = 0;
    const waveDuration = 2.2; // wave for 2.2 seconds on load

    // Target rotations for slerping / smoothing
    let headYaw = 0;
    let headPitch = 0;

    // Joint poses based on sections
    const leftArmRotationX = { val: 0 };
    const leftArmRotationZ = { val: 0.3 };
    const leftForearmRotationZ = { val: -0.4 };

    const rightArmRotationX = { val: 0 };
    const rightArmRotationZ = { val: -0.3 };
    const rightForearmRotationZ = { val: 0.4 };

    // 7. Animation Loop
    const animate = () => {
      if (!isCanvasVisible) {
        frameId = null;
        return;
      }
      const currentTime = performance.now();
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      time += delta;

      // Smoothly interpolate mouse positions for dampening
      mouse.x += (targetMouse.x - mouse.x) * 0.06;
      mouse.y += (targetMouse.y - mouse.y) * 0.06;

      // --- Animation: Breathing & Floating ---
      const floatOffset = Math.sin(time * 1.5) * 0.12;
      floatGroup.position.y = floatOffset;
      
      // Slight body sway based on breathing & mouse
      floatGroup.rotation.z = Math.sin(time * 0.8) * 0.02 + mouse.x * 0.04;
      floatGroup.rotation.y = mouse.x * 0.1;

      // Chest expand/contract breathing
      const breathScale = 1 + Math.sin(time * 1.5) * 0.015;
      torso.scale.set(breathScale, 1 + Math.cos(time * 1.5) * 0.01, breathScale);
      
      // Core glowing pulse
      const glowIntensity = 1.5 + Math.sin(time * 3.0) * 0.5;
      chestGlowLight.intensity = glowIntensity * 2;
      coreInner.scale.setScalar(1 + Math.sin(time * 3.0) * 0.05);

      // --- Animation: Head tracking cursor ---
      // Rotate head smoothly to face mouse
      headYaw = mouse.x * 0.65; // yaw constraint
      headPitch = -mouse.y * 0.35; // pitch constraint
      
      headGroup.rotation.y += (headYaw - headGroup.rotation.y) * 0.1;
      headGroup.rotation.x += (headPitch - headGroup.rotation.x) * 0.1;
      
      // Slight shoulder/torso tilt towards mouse
      torsoGroup.rotation.y += (mouse.x * 0.12 - torsoGroup.rotation.y) * 0.08;
      torsoGroup.rotation.x += (-mouse.y * 0.05 - torsoGroup.rotation.x) * 0.08;

      // --- Animation: Blinking logic ---
      if (!isBlinking && time - lastBlinkTime > nextBlinkDelay) {
        isBlinking = true;
        lastBlinkTime = time;
      }

      if (isBlinking) {
        const blinkProgress = (time - lastBlinkTime) / blinkDuration;
        if (blinkProgress >= 1.0) {
          isBlinking = false;
          eyeLeft.scale.y = 1.0;
          eyeRight.scale.y = 1.0;
          nextBlinkDelay = 3.5 + Math.random() * 4.5;
        } else {
          // Sine-like closing and opening
          const scaleY = Math.abs(Math.sin(blinkProgress * Math.PI - Math.PI / 2));
          eyeLeft.scale.y = Math.max(0.02, scaleY);
          eyeRight.scale.y = Math.max(0.02, scaleY);
        }
      }

      // --- Animation: Eye Expressions based on state ---
      const activeEyeState = eyeStateRef.current;
      if (!isBlinking) {
        if (activeEyeState === "happy") {
          // Happy squinting curved-up look
          eyeLeft.rotation.z = Math.PI / 6;
          eyeRight.rotation.z = -Math.PI / 6;
          eyeLeft.scale.set(0.9, 0.7, 1);
          eyeRight.scale.set(0.9, 0.7, 1);
        } else if (activeEyeState === "thinking") {
          // Pulsing scanning eyes
          const eyePulse = 1.0 + Math.sin(time * 8.0) * 0.15;
          eyeLeft.scale.set(eyePulse, eyePulse, 1);
          eyeRight.scale.set(eyePulse, eyePulse, 1);
          eyeLeft.rotation.z = Math.PI / 2;
          eyeRight.rotation.z = Math.PI / 2;
        } else if (activeEyeState === "waving") {
          // Excited round/wider eyes
          eyeLeft.scale.set(1.1, 1.1, 1.1);
          eyeRight.scale.set(1.1, 1.1, 1.1);
          eyeLeft.rotation.z = Math.PI / 2;
          eyeRight.rotation.z = Math.PI / 2;
        } else {
          // Normal/Idle state
          eyeLeft.rotation.z = Math.PI / 2;
          eyeRight.rotation.z = Math.PI / 2;
          eyeLeft.scale.set(1, 1, 1);
          eyeRight.scale.set(1, 1, 1);
        }
      }

      // --- Animation: Gesture Posing and Pointing ---
      const currentSection = activeSectionRef.current;
      
      // Determine target configurations
      let targetLeftArmX = 0;
      let targetLeftArmZ = 0.35;
      let targetLeftForearmZ = -0.4;

      let targetRightArmX = 0;
      let targetRightArmZ = -0.35;
      let targetRightForearmZ = 0.4;

      // Initial Waving overlay on page load (lasts 2.2s)
      if (waveTime < waveDuration) {
        waveTime += delta;
        // Lift right shoulder, tilt arm out
        targetRightArmZ = -1.6;
        targetRightArmX = -0.4;
        
        // Fast hand waving loop
        const waveAngle = Math.sin(waveTime * 12.0) * 0.4;
        targetRightForearmZ = 0.7 + waveAngle;
        
        // Eye state override
        eyeStateRef.current = "waving";
      } else {
        // Normal state poses based on section triggers
        if (currentSection === "skills" || currentSection === "projects") {
          // Point with left arm toward the left screen panel (where content is)
          targetLeftArmX = -0.9;
          targetLeftArmZ = -0.6; // extend forward/left
          targetLeftForearmZ = -0.2;
          
          // Hover floating balance for right arm
          targetRightArmZ = -0.45;
          targetRightForearmZ = 0.5;
        } else if (currentSection === "education" || currentSection === "experience") {
          // Both arms float actively forward like an analytic companion
          targetLeftArmX = -0.4;
          targetLeftArmZ = 0.2;
          targetLeftForearmZ = -0.6;

          targetRightArmX = -0.4;
          targetRightArmZ = -0.2;
          targetRightForearmZ = 0.6;
        } else if (currentSection === "certificates" || currentSection === "contact") {
          // Welcome friendly palms pose
          targetLeftArmX = -0.3;
          targetLeftArmZ = -0.4;
          targetLeftForearmZ = -0.3;

          targetRightArmX = -0.3;
          targetRightArmZ = 0.4;
          targetRightForearmZ = 0.3;
        }
      }

      // Slerp rotations towards their target values smoothly
      leftArmRotationX.val += (targetLeftArmX - leftArmRotationX.val) * 0.1;
      leftArmRotationZ.val += (targetLeftArmZ - leftArmRotationZ.val) * 0.1;
      leftForearmRotationZ.val += (targetLeftForearmZ - leftForearmRotationZ.val) * 0.1;

      rightArmRotationX.val += (targetRightArmX - rightArmRotationX.val) * 0.1;
      rightArmRotationZ.val += (targetRightArmZ - rightArmRotationZ.val) * 0.1;
      rightForearmRotationZ.val += (targetRightForearmZ - rightForearmRotationZ.val) * 0.1;

      // Apply rotations to actual joints
      leftArmGroup.rotation.x = leftArmRotationX.val;
      leftArmGroup.rotation.z = leftArmRotationZ.val;
      leftForearmGroup.rotation.z = leftForearmRotationZ.val;

      rightArmGroup.rotation.x = rightArmRotationX.val;
      rightArmGroup.rotation.z = rightArmRotationZ.val;
      rightForearmGroup.rotation.z = rightForearmRotationZ.val;

      // Gently spin base thruster ring
      baseGroup.rotation.y = time * 2.0;

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    // 8. Handle Window Resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    // Use ResizeObserver for responsive resize tracking with requestAnimationFrame to prevent layout feedback loop errors
    let resizeAnimationFrameId: number;
    const resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(resizeAnimationFrameId);
      resizeAnimationFrameId = requestAnimationFrame(() => {
        handleResize();
      });
    });
    resizeObserver.observe(container);

    // Clean up
    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      cancelAnimationFrame(resizeAnimationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="robot-3d-container"
      className="w-full h-full min-h-[300px] md:min-h-[480px] lg:min-h-[600px] transition-all duration-300 relative select-none"
      style={{ background: "transparent" }}
    />
  );
}
