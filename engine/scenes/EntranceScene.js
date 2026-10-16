/**
 * CHAPTER 00: THE ENTRANCE // BERSERKER THRESHOLD & MONOLITH CLEAVE
 * High-fidelity Berserker Avatar look-development previs, Dragon Slayer greatsword,
 * obsidian monolith, dynamic fracture kinematics, and weighted strike animation.
 */

import * as THREE from '../../assets/three.module.min.js';
import { GLTFLoader } from '../../assets/addons/GLTFLoader.js';
import { DRACOLoader } from '../../assets/addons/DRACOLoader.js';

export class EntranceScene {
  constructor(rendererInstance, cameraRig) {
    this.rendererInstance = rendererInstance;
    this.cameraRig = cameraRig;
    this.group = new THREE.Group();
    this.group.name = 'EntranceScene';

    this.isStriking = false;
    this.strikeProgress = 0; // 0 to 1
    this.isFinished = false;
    this.strikeDuration = 3.8; // seconds

    this.sparks = [];
    this.mixer = null;
    this.actions = {};
    this.hasExternalModel = false;

    this.initMonolith();
    this.initBerserkerAvatar();
    this.initSparksSystem();
    this.loadExternalCharacterAsset();
  }

  initMonolith() {
    this.monolithGroup = new THREE.Group();
    this.monolithGroup.position.set(0, 0.4, 0);

    const slabMat = this.rendererInstance.materials.obsidian || new THREE.MeshStandardMaterial({
      color: 0x0a0e17,
      metalness: 0.4,
      roughness: 0.25
    });

    const seamGlowMat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.85
    });

    // Left slab
    const slabGeoL = new THREE.BoxGeometry(1.6, 3.6, 0.45);
    this.slabL = new THREE.Mesh(slabGeoL, slabMat);
    this.slabL.position.set(-0.82, 0.9, -0.4);
    this.slabL.castShadow = true;
    this.slabL.receiveShadow = true;
    this.monolithGroup.add(this.slabL);

    // Right slab
    const slabGeoR = new THREE.BoxGeometry(1.6, 3.6, 0.45);
    this.slabR = new THREE.Mesh(slabGeoR, slabMat);
    this.slabR.position.set(0.82, 0.9, -0.4);
    this.slabR.castShadow = true;
    this.slabR.receiveShadow = true;
    this.monolithGroup.add(this.slabR);

    // Luminous fracture seam
    const seamGeo = new THREE.PlaneGeometry(0.04, 3.8);
    this.seam = new THREE.Mesh(seamGeo, seamGlowMat);
    this.seam.position.set(0, 0.9, -0.16);
    this.seam.rotation.z = -0.12; // Dynamic diagonal strike angle
    this.monolithGroup.add(this.seam);

    // Floor foundation
    const floorGeo = new THREE.CylinderGeometry(3.5, 3.8, 0.15, 32);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0f1522,
      roughness: 0.8,
      metalness: 0.3
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.set(0, -0.9, -0.2);
    floor.receiveShadow = true;
    this.monolithGroup.add(floor);

    this.group.add(this.monolithGroup);
  }

  initBerserkerAvatar() {
    this.avatar = new THREE.Group();
    this.avatar.position.set(0, -0.85, 1.35);

    const steelMat = this.rendererInstance.materials.darkSteel || new THREE.MeshStandardMaterial({
      color: 0x161d28,
      metalness: 0.9,
      roughness: 0.25
    });

    const trimMat = new THREE.MeshStandardMaterial({
      color: 0x0b0f16,
      metalness: 0.92,
      roughness: 0.35
    });

    const bladeMat = this.rendererInstance.materials.bladeSteel || new THREE.MeshStandardMaterial({
      color: 0xdde6ed,
      metalness: 0.96,
      roughness: 0.12
    });

    const capeMat = new THREE.MeshStandardMaterial({
      color: 0x0d111a,
      roughness: 0.92,
      metalness: 0.05,
      side: THREE.DoubleSide
    });

    // 1. Torso & Armor Cuirass
    this.torso = new THREE.Group();
    this.torso.position.set(0, 1.25, 0);

    // Sculpted angular cuirass with central sternum ridge
    const chestGeo = new THREE.BoxGeometry(0.62, 0.68, 0.42);
    const chest = new THREE.Mesh(chestGeo, steelMat);
    chest.castShadow = true;
    this.torso.add(chest);

    // Abdominal segmented armor lames
    const abGeo = new THREE.CylinderGeometry(0.26, 0.28, 0.45, 16);
    const ab = new THREE.Mesh(abGeo, trimMat);
    ab.position.set(0, -0.4, 0.02);
    this.torso.add(ab);

    // 2. Sculpted Berserker Beast Helmet (Canine Beast of Darkness jaw & swept crest)
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.58, 0.05);

    // Cranial armored dome with sharp dorsal crest
    const helmGeo = new THREE.CylinderGeometry(0.12, 0.18, 0.28, 8);
    const helm = new THREE.Mesh(helmGeo, steelMat);
    helm.rotation.x = 0.25;
    headGroup.add(helm);

    // Beast of Darkness Jutting Wolf Snout & Upper Jaw
    const snoutGeo = new THREE.ConeGeometry(0.14, 0.32, 5);
    const snout = new THREE.Mesh(snoutGeo, steelMat);
    snout.rotation.x = 1.35;
    snout.position.set(0, -0.06, 0.22);
    headGroup.add(snout);

    // Lower Mandible / Spiked Iron Jaw
    const jawGeo = new THREE.BoxGeometry(0.16, 0.08, 0.24);
    const jaw = new THREE.Mesh(jawGeo, trimMat);
    jaw.position.set(0, -0.16, 0.18);
    jaw.rotation.x = 0.3;
    headGroup.add(jaw);

    // Swept Back Crest Spines (3 layered dorsal lames)
    for (let s = 0; s < 3; s++) {
      const spineGeo = new THREE.ConeGeometry(0.04 - s * 0.008, 0.32 + s * 0.08, 4);
      const spine = new THREE.Mesh(spineGeo, trimMat);
      spine.position.set(0, 0.12 + s * 0.06, -0.12 - s * 0.12);
      spine.rotation.x = -1.2 - s * 0.15;
      headGroup.add(spine);
    }

    // Curved beast horns flanking the jawline (left & right)
    const hornGeo = new THREE.CylinderGeometry(0.02, 0.045, 0.42, 8);
    const hornL = new THREE.Mesh(hornGeo, trimMat);
    hornL.position.set(-0.18, 0.08, -0.04);
    hornL.rotation.set(0.6, -0.3, -0.75);
    headGroup.add(hornL);

    const hornR = new THREE.Mesh(hornGeo, trimMat);
    hornR.position.set(0.18, 0.08, -0.04);
    hornR.rotation.set(0.6, 0.3, 0.75);
    headGroup.add(hornR);

    // Piercing Crimson Visor Slits (Dual angled demonic eye glow)
    const visorGeo = new THREE.BoxGeometry(0.09, 0.025, 0.04);
    const visorMat = new THREE.MeshBasicMaterial({ color: 0xff1e1e });
    
    const visorL = new THREE.Mesh(visorGeo, visorMat);
    visorL.position.set(-0.065, -0.01, 0.26);
    visorL.rotation.z = 0.2;
    headGroup.add(visorL);

    const visorR = new THREE.Mesh(visorGeo, visorMat);
    visorR.position.set(0.065, -0.01, 0.26);
    visorR.rotation.z = -0.2;
    headGroup.add(visorR);

    // Visor point light emission
    const visorLight = new THREE.PointLight(0xef4444, 1.2, 1.6);
    visorLight.position.set(0, 0, 0.35);
    headGroup.add(visorLight);

    this.torso.add(headGroup);

    // 3. Layered Tiered Pauldrons (Triple-layered razor shoulder guards)
    for (let p = 0; p < 3; p++) {
      const pScale = 1.0 - p * 0.12;
      const pauldronGeo = new THREE.ConeGeometry(0.22 * pScale, 0.38 * pScale, 4);
      
      const pL = new THREE.Mesh(pauldronGeo, steelMat);
      pL.position.set(-0.38 - p * 0.06, 0.32 - p * 0.08, 0);
      pL.rotation.set(0, 0, Math.PI / 2.2);
      this.torso.add(pL);

      const pR = new THREE.Mesh(pauldronGeo, steelMat);
      pR.position.set(0.38 + p * 0.06, 0.32 - p * 0.08, 0);
      pR.rotation.set(0, 0, -Math.PI / 2.2);
      this.torso.add(pR);
    }

    // 4. Heavy Tattered Cloak Cascading Down
    const cloakGeo = new THREE.CylinderGeometry(0.42, 0.88, 1.95, 16, 4, true, -Math.PI / 1.4, Math.PI * 1.4);
    this.cloak = new THREE.Mesh(cloakGeo, capeMat);
    this.cloak.position.set(0, -0.45, -0.18);
    this.cloak.rotation.y = Math.PI;
    this.torso.add(this.cloak);

    // 5. Kinematic Arm Hierarchy (Two-handed grip posture)
    this.armL = new THREE.Group();
    this.armL.position.set(-0.36, 0.22, 0);
    const armGeo = new THREE.CylinderGeometry(0.085, 0.075, 0.44, 12);
    const armLMesh = new THREE.Mesh(armGeo, steelMat);
    armLMesh.position.set(0, -0.22, 0);
    this.armL.add(armLMesh);

    this.forearmL = new THREE.Group();
    this.forearmL.position.set(0, -0.44, 0);
    const forearmLMesh = new THREE.Mesh(armGeo, trimMat);
    forearmLMesh.position.set(0.12, -0.22, 0.18);
    forearmLMesh.rotation.set(-0.6, 0.3, 0.4);
    this.forearmL.add(forearmLMesh);
    this.armL.add(this.forearmL);
    this.torso.add(this.armL);

    this.armR = new THREE.Group();
    this.armR.position.set(0.36, 0.22, 0);
    const armRMesh = new THREE.Mesh(armGeo, steelMat);
    armRMesh.position.set(0, -0.22, 0);
    this.armR.add(armRMesh);

    this.forearmR = new THREE.Group();
    this.forearmR.position.set(0, -0.44, 0);
    const forearmRMesh = new THREE.Mesh(armGeo, trimMat);
    forearmRMesh.position.set(-0.12, -0.22, 0.18);
    forearmRMesh.rotation.set(-0.6, -0.3, -0.4);
    this.forearmR.add(forearmRMesh);
    this.armR.add(this.forearmR);
    this.torso.add(this.armR);

    // 6. Grounded Athletic Combat Stance (Greaves & Armored Sabaton Boots)
    this.legs = new THREE.Group();
    this.legs.position.set(0, 0.65, 0);

    const legGeo = new THREE.CylinderGeometry(0.13, 0.09, 0.78, 12);
    const legL = new THREE.Mesh(legGeo, steelMat);
    legL.position.set(-0.28, -0.38, 0.1);
    legL.rotation.set(-0.15, 0, -0.12);
    this.legs.add(legL);

    const legR = new THREE.Mesh(legGeo, steelMat);
    legR.position.set(0.28, -0.38, -0.1);
    legR.rotation.set(0.15, 0, 0.12);
    this.legs.add(legR);

    const bootGeo = new THREE.BoxGeometry(0.18, 0.15, 0.38);
    const bootL = new THREE.Mesh(bootGeo, trimMat);
    bootL.position.set(-0.32, -0.82, 0.22);
    this.legs.add(bootL);

    const bootR = new THREE.Mesh(bootGeo, trimMat);
    bootR.position.set(0.32, -0.82, -0.06);
    this.legs.add(bootR);

    this.avatar.add(this.torso);
    this.avatar.add(this.legs);

    // 7. Authentic 2.2m Dragon Slayer Greatsword (Massive slab of refined iron)
    this.swordGroup = new THREE.Group();
    this.swordGroup.position.set(0, 0.55, 0.45);

    // Huge rectangular iron slab blade (2.2m long, 0.36m wide, beveled cutting edges)
    const bladeGeo = new THREE.BoxGeometry(0.36, 2.2, 0.08);
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.set(0, 0.85, 0);
    blade.castShadow = true;
    this.swordGroup.add(blade);

    // Central fuller channel with darker weathered iron
    const fullerGeo = new THREE.BoxGeometry(0.08, 2.0, 0.085);
    const fullerMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.92, roughness: 0.35 });
    const fuller = new THREE.Mesh(fullerGeo, fullerMat);
    fuller.position.set(0, 0.85, 0);
    this.swordGroup.add(fuller);

    // Heavy iron crossguard collar
    const guardGeo = new THREE.BoxGeometry(0.58, 0.14, 0.16);
    const guard = new THREE.Mesh(guardGeo, trimMat);
    guard.position.set(0, -0.28, 0);
    this.swordGroup.add(guard);

    // Two-handed leather-wrapped hilt with grip rings
    const gripGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.65, 12);
    const gripMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.85 });
    const grip = new THREE.Mesh(gripGeo, gripMat);
    grip.position.set(0, -0.64, 0);
    this.swordGroup.add(grip);

    // Heavy iron counterweight ring pommel
    const pommelGeo = new THREE.TorusGeometry(0.07, 0.03, 8, 16);
    const pommel = new THREE.Mesh(pommelGeo, trimMat);
    pommel.position.set(0, -1.02, 0);
    pommel.rotation.x = Math.PI / 2;
    this.swordGroup.add(pommel);

    this.avatar.add(this.swordGroup);
    this.group.add(this.avatar);
  }

  initSparksSystem() {
    this.sparksGroup = new THREE.Group();
    const sparkGeo = new THREE.SphereGeometry(0.025, 6, 6);
    const sparkMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });

    for (let i = 0; i < 60; i++) {
      const spark = new THREE.Mesh(sparkGeo, sparkMat);
      spark.visible = false;
      spark.userData = {
        vx: 0,
        vy: 0,
        vz: 0,
        life: 0
      };
      this.sparksGroup.add(spark);
      this.sparks.push(spark);
    }
    this.group.add(this.sparksGroup);
  }

  emitSparks(origin) {
    for (const spark of this.sparks) {
      spark.position.copy(origin);
      spark.visible = true;
      spark.userData.vx = (Math.random() - 0.5) * 4.5;
      spark.userData.vy = Math.random() * 5.0 + 1.5;
      spark.userData.vz = (Math.random() - 0.5) * 3.5;
      spark.userData.life = 1.0;
    }
  }

  loadExternalCharacterAsset(url = 'assets/guts_berserker.glb') {
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('assets/draco/');
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      url,
      (gltf) => {
        const validation = this.validateRigAndClips(gltf);
        console.info('[EntranceScene] Rig/clip validation result:', validation);

        if (validation.isValid) {
          this.avatar.visible = false; // Hide procedural lookdev previs
          this.externalModel = gltf.scene;
          this.externalModel.position.set(0, -0.85, 1.35);
          this.externalModel.scale.set(1.0, 1.0, 1.0);
          this.group.add(this.externalModel);

          this.mixer = new THREE.AnimationMixer(this.externalModel);
          gltf.animations.forEach(clip => {
            this.actions[clip.name] = this.mixer.clipAction(clip);
          });

          if (this.actions['idle'] || this.actions['introAnimation']) {
            const action = this.actions['idle'] || this.actions['introAnimation'];
            action.play();
          }

          this.hasExternalModel = true;
          console.info(`[EntranceScene] Successfully bound Guts Berserker model with ${gltf.animations.length} clips.`);
        } else {
          console.warn('[EntranceScene] External GLTF failed rig validation; retaining elevated procedural lookdev.');
        }
      },
      undefined,
      (err) => {
        // Expected if asset is pending client download
        console.info('[EntranceScene] Awaiting external rigged Guts Berserker asset (assets/guts_berserker.glb). Elevated procedural lookdev active.');
      }
    );
  }

  validateRigAndClips(gltf) {
    const result = {
      hasBones: false,
      boneCount: 0,
      hasAnimations: false,
      animationNames: [],
      isValid: false
    };

    if (!gltf || !gltf.scene) return result;

    let boneCount = 0;
    gltf.scene.traverse((obj) => {
      if (obj.isBone) boneCount++;
    });

    result.boneCount = boneCount;
    result.hasBones = boneCount >= 8;
    result.hasAnimations = gltf.animations && gltf.animations.length > 0;
    if (result.hasAnimations) {
      result.animationNames = gltf.animations.map(a => a.name);
    }

    result.isValid = result.hasBones || result.hasAnimations;
    return result;
  }

  startStrike() {
    if (this.isStriking) return;
    this.isStriking = true;
    this.strikeProgress = 0;
    this.hasTriggeredImpact = false;

    // Trigger external strike animation if present
    if (this.hasExternalModel && this.mixer) {
      if (this.actions['strike'] || this.actions['cleave']) {
        const action = this.actions['strike'] || this.actions['cleave'];
        action.reset().play();
      }
    }
  }

  skipStrike() {
    this.isStriking = false;
    this.isFinished = true;
    this.strikeProgress = 1.0;
    // Separate slabs
    this.slabL.position.x = -2.8;
    this.slabR.position.x = 2.8;
    this.slabL.position.z = -1.5;
    this.slabR.position.z = -1.5;
    this.seam.visible = false;
  }

  update(delta, time) {
    if (this.mixer) {
      this.mixer.update(delta);
    }

    // Idle breathing & cape ripple when not striking
    if (!this.isStriking && !this.isFinished && !this.hasExternalModel) {
      const breathe = Math.sin(time * 2.2) * 0.015;
      this.torso.position.y = 1.25 + breathe;
      this.cloak.rotation.x = Math.sin(time * 3.0) * 0.04;
    }

    // Strike sequence kinematics
    if (this.isStriking) {
      this.strikeProgress += delta / this.strikeDuration;
      const p = Math.min(1.0, this.strikeProgress);

      if (p < 0.25) {
        // Phase 1: Stance loading & grip adjustment
        const t = p / 0.25;
        this.torso.position.y = 1.25 - t * 0.06;
        this.swordGroup.position.y = 0.55 + t * 0.2;
        this.armL.rotation.x = t * -0.4;
        this.armR.rotation.x = t * -0.4;
      } else if (p < 0.55) {
        // Phase 2: Overhead backswing
        const t = (p - 0.25) / 0.3;
        this.torso.rotation.y = t * 0.35;
        this.torso.position.y = 1.19 + t * 0.08;
        this.swordGroup.rotation.z = t * 1.4;
        this.swordGroup.rotation.x = t * -1.8;
        this.swordGroup.position.set(0.1, 1.4 + t * 0.4, 0.1);
        this.armL.rotation.x = -0.4 - t * 1.6;
        this.armR.rotation.x = -0.4 - t * 1.6;
      } else if (p < 0.72) {
        // Phase 3: Downward cleave acceleration
        const t = (p - 0.55) / 0.17;
        const easeT = t * t * t; // Acceleration curve
        this.torso.rotation.y = 0.35 - easeT * 0.45;
        this.torso.position.y = 1.27 - easeT * 0.14;
        this.swordGroup.rotation.z = 1.4 - easeT * 1.6;
        this.swordGroup.rotation.x = -1.8 + easeT * 2.8;
        this.swordGroup.position.set(0, 1.8 - easeT * 1.3, 0.1 + easeT * 0.4);
        this.armL.rotation.x = -2.0 + easeT * 2.4;
        this.armR.rotation.x = -2.0 + easeT * 2.4;
      } else if (p < 0.82) {
        // Phase 4: Ground Impact & Shockwave
        if (!this.hasTriggeredImpact) {
          this.hasTriggeredImpact = true;
          this.cameraRig.triggerShake(0.095);
          this.emitSparks(new THREE.Vector3(0, 0.4, -0.2));
        }
      } else {
        // Phase 5: Monolith separation & passage
        const t = (p - 0.82) / 0.18;
        this.slabL.position.x = -0.82 - t * 2.0;
        this.slabR.position.x = 0.82 + t * 2.0;
        this.slabL.position.z = -0.4 - t * 1.1;
        this.slabR.position.z = -0.4 - t * 1.1;
        this.seam.scale.x = 1.0 + t * 8.0;

        if (p >= 1.0) {
          this.isStriking = false;
          this.isFinished = true;
          document.dispatchEvent(new CustomEvent('engine:strikecomplete'));
        }
      }
    }

    // Update active sparks
    for (const spark of this.sparks) {
      if (spark.visible) {
        spark.userData.life -= delta * 1.8;
        if (spark.userData.life <= 0) {
          spark.visible = false;
        } else {
          spark.position.x += spark.userData.vx * delta;
          spark.position.y += spark.userData.vy * delta;
          spark.position.z += spark.userData.vz * delta;
          spark.userData.vy -= 9.8 * delta; // Gravity
          spark.scale.setScalar(spark.userData.life);
        }
      }
    }
  }
}
