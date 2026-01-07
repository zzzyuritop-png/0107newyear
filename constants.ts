import * as THREE from 'three';

export const COLORS = {
  background: '#050205',
  treeCore: new THREE.Color('#ff0055'),
  treeMid: new THREE.Color('#ff5e78'),
  treeOuter: new THREE.Color('#ffbd69'),
  snow: new THREE.Color('#ffffff'),
  ringGold: new THREE.Color('#ffeb3b'),
  star: new THREE.Color('#fff0f5'),
};

export const CONFIG = {
  treeHeight: 12,
  treeRadius: 4.5,
  particleCount: 15000,
  snowCount: 2000,
  ringCount: 6000,
  starCount: 500,
  bloomThreshold: 0.2,
  bloomStrength: 2.2,
  bloomRadius: 0.7,
};