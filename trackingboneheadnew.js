// === Fire-Triggered Advanced Aimbot System ===
// === Kích hoạt khi bắn, tích hợp BoneHeadBasedEnemyDetector ===

class Vector3 {
constructor(x = 0, y = 0, z = 0) {
this.x = x;
this.y = y;
this.z = z;
}

add(v) { return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z); }
subtract(v) { return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z); }
multiplyScalar(s) { return new Vector3(this.x * s, this.y * s, this.z * s); }
clone() { return new Vector3(this.x, this.y, this.z); }
length() { return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2); }
normalize() {
const len = this.length();
return len > 0 ? new Vector3(this.x / len, this.y / len, this.z / len) : new Vector3(0, 0, 0);
}
distance(v) { return this.subtract(v).length(); }
dot(v) { return this.x * v.x + this.y * v.y + this.z * v.z; }
lerp(target, alpha) {
return new Vector3(
this.x + (target.x - this.x) * alpha,
this.y + (target.y - this.y) * alpha,
this.z + (target.z - this.z) * alpha
);
}
}

// === Cấu hình hệ thống aimbot ===
const AimbotConfig = {
// Cài đặt tracking
smoothness: 0.85,           // Độ mượt của việc theo dõi (0-1)
predictionTime: 0.01,       // Thời gian dự đoán chuyển động
maxTrackingDistance: 99999,   // Khoảng cách tối đa để track
fovLimit: 360,              // Giới hạn FOV để target

// Cài đặt bắn kích hoạt
fireActivationDuration: 1000,  // Thời gian active sau khi bắn (ms)
burstMode: true,           // Chế độ bắn liên tiếp
burstCount: 200,             // Số viên bắn trong burst
burstDelay: 0,           // Delay giữa các burst (ms)

// Cài đặt bone targeting

preferredBones: ['bone_Head', 'bone_Neck', 'bone_Chest'],

headShotMultiplier: 10.0,   // Hệ số ưu tiên headshot

// Cài đặt anti-recoil
recoilCompensation: true,
recoilPattern: [           // Pattern giật súng chuẩn
{ x: 0, y: -2 }, { x: -1, y: -3 }, { x: 1, y: -2 },
{ x: -2, y: -4 }, { x: 2, y: -3 }, { x: -1, y: -5 }
]
};

// === Game Package Detection ===

const GamePackages = {
  GamePackage1: "com.dts.freefireth",
  GamePackage2: "com.dts.freefiremax"
};

// === BoneHeadBasedEnemyDetector tích hợp ===

class BoneHeadBasedEnemyDetector {
  constructor(options = {}) {
    // ✅ Sửa toàn bộ dấu nháy trong headConfig
    this.headConfig = options.headConfig || {
      "boneColliderProperty": {
        "boneProperty": { "recursivery": 0 },
        "splitProperty": {
          "boneWeightType": 0,
          "boneWeight2": 100,
          "boneWeight3": 100,
          "boneWeight4": 100,
          "greaterBoneWeight": 1,
          "boneTriangleExtent": 0
        },
        "reducerProperty": {
          "shapeType": 3,
          "fitType": 0,
          "meshType": 3,
          "maxTriangles": 255,
          "sliceMode": 0,
          "scale": { "x": 1.0, "y": 1.0, "z": 1.0 },
          "scaleElementType": 0,
          "minThickness": { "x": 0.01, "y": 0.01, "z": 0.01 },
          "minThicknessElementType": 0,
          "optimizeRotation": { "x": 1, "y": 1, "z": 1 },
          "optimizeRotationElementType": 0,
          "colliderToChild": 2,
          "offset": { "x": 0.0, "y": 0.0, "z": 0.0 },
          "thicknessA": { "x": 0.0, "y": 0.0, "z": 0.0 },
          "thicknessB": { "x": 0.0, "y": 0.0, "z": 0.0 },
          "viewAdvanced": 0
        },
        "colliderProperty": {
          "convex": 1,
          "isTrigger": 0,
          "material": { "m_FileID": 0, "m_PathID": 0 },
          "isCreateAsset": 0
        },
        "rigidbodyProperty": {
          "mass": 1.0,
          "drag": 0.0,
          "angularDrag": 0.05,
          "isKinematic": 1,
          "useGravity": 0,
          "interpolation": 0,
          "collisionDetectionMode": 0,
          "isCreate": 0,
          "viewAdvanced": 0
        },
        "modifyNameEnabled": 0
      },

      "defaultBoneColliderProperty": {
        "boneProperty": { "recursivery": 0 },
        "splitProperty": {
          "boneWeightType": 0,
          "boneWeight2": 50,
          "boneWeight3": 33,
          "boneWeight4": 25,
          "greaterBoneWeight": 1,
          "boneTriangleExtent": 1
        },
        "reducerProperty": {
          "shapeType": 2,
          "fitType": 0,
          "meshType": 3,
          "maxTriangles": 255,
          "sliceMode": 0,
          "scale": { "x": 1.0, "y": 1.0, "z": 1.0 },
          "scaleElementType": 0,
          "minThickness": { "x": 0.01, "y": 0.01, "z": 0.01 },
          "minThicknessElementType": 0,
          "optimizeRotation": { "x": 1, "y": 1, "z": 1 },
          "optimizeRotationElementType": 0,
          "colliderToChild": 0,
          "offset": { "x": 0.0, "y": 0.0, "z": 0.0 },
          "thicknessA": { "x": 0.0, "y": 0.0, "z": 0.0 },
          "thicknessB": { "x": 0.0, "y": 0.0, "z": 0.0 },
          "viewAdvanced": 0
        },
        "colliderProperty": {
          "convex": 1,
          "isTrigger": 0,
          "material": { "m_FileID": 0, "m_PathID": 0 },
          "isCreateAsset": 0
        },
        "rigidbodyProperty": {
          "mass": 1.0,
          "drag": 0.0,
          "angularDrag": 0.05,
          "isKinematic": 1,
          "useGravity": 0,
          "interpolation": 0,
          "collisionDetectionMode": 0,
          "isCreate": 1,
          "viewAdvanced": 0
        },
        "modifyNameEnabled": 0
      }
    };

    

// Các cấu hình khác
this.sensitivity = options.sensitivity || 0.001;
this.smoothingFactor = options.smoothingFactor || 0.3;
this.headLockRange = options.headLockRange || 9999;

this.lockedTarget = null;
this.targetHistory = [];

this.distanceAdjustments = {
  close: { range: [0, 50], offset: { x: 0, y: 0.00907892 } },
  medium: { range: [50, 150], offset: { x: 0, y: 0.00907892 } },
  far: { range: [150, 300], offset: { x: 0, y: 0.00907892 } },
  veryFar: { range: [300, Infinity], offset: { x: 0, y: 0.00907892 } }
};


}

computeWorldPosition(matrix, bindpose) {
const p = bindpose.position;
const m = matrix;
return {
x: m.e00 * p.x + m.e01 * p.y + m.e02 * p.z + m.e03,
y: m.e10 * p.x + m.e11 * p.y + m.e12 * p.z + m.e13,
z: m.e20 * p.x + m.e21 * p.y + m.e22 * p.z + m.e23
};
}

findClosestHead(heads, crosshairPos, ignoreRangeLimit = false) {
let minDist = Infinity;
let closest = null;


heads.forEach(({ matrix, bindpose }) => {
  const pos = this.computeWorldPosition(matrix, bindpose);
  const dist = Math.hypot(pos.x - crosshairPos.x, pos.y - crosshairPos.y);

  if (ignoreRangeLimit || dist < this.headLockRange) {
    if (dist < minDist) {
      minDist = dist;
      closest = { ...pos, matrix, bindpose, distance: dist };
    }
  }
});

return closest;


}

applyDistanceOffset(head) {
  for (const key in this.distanceAdjustments) {
    const cfg = this.distanceAdjustments[key];
    if (head.distance >= cfg.range[0] && head.distance < cfg.range[1]) {
      return {
        ...head,
        x: head.x + cfg.offset.x,
        y: head.y + cfg.offset.y,
        distanceCategory: key
      };
    }
  }
  return head;
}

predictHeadMovement(current) {
const last = this.targetHistory[this.targetHistory.length - 1];
if (!last) return current;


const vx = current.x - last.x;
const vy = current.y - last.y;

return {
  ...current,
  x: current.x + vx * 2,
  y: current.y + vy * 2
};

}

computeHeadBoundingBox(headPos, distance) {
const baseSize = 30; // kích thước cơ bản bounding box
const size = baseSize * (1 / Math.max(distance, 1)); // tỉ lệ nghịch khoảng cách, tránh chia 0


return {
  left: headPos.x - size / 2,
  right: headPos.x + size / 2,
  top: headPos.y - size / 2,
  bottom: headPos.y + size / 2,
  size
};


}

calculateAimAssist(crosshair, head) {
const adjusted = this.applyDistanceOffset(head);
const predicted = this.predictHeadMovement(adjusted);


const rawDX = predicted.x - crosshair.x;
const rawDY = predicted.y - crosshair.y;

const deltaX = rawDX * this.sensitivity;
const deltaY = rawDY * this.sensitivity;

let smoothed = { x: deltaX, y: deltaY };
if (this.lockedTarget) {
  smoothed.x = this.lockedTarget.aimDelta.x +
              (deltaX - this.lockedTarget.aimDelta.x) * this.smoothingFactor;
  smoothed.y = this.lockedTarget.aimDelta.y +
              (deltaY - this.lockedTarget.aimDelta.y) * this.smoothingFactor;
}

const boundingBox = this.computeHeadBoundingBox(predicted, head.distance);

return {
  deltaX: smoothed.x,
  deltaY: smoothed.y,
  raw: { x: rawDX, y: rawDY },
  predicted,
  adjusted,
  boundingBox,
  distance: head.distance
};


}

process(boneHeadData, crosshair, isCrosshairRed = false) {
if (!isCrosshairRed) {
this.lockedTarget = null;
this.targetHistory = [];
return {
locked: false,
headInfo: null,
aimAssist: null
};
}


const head = this.findClosestHead(boneHeadData, crosshair, true);
let aim = null;

if (head) {
  aim = this.calculateAimAssist(crosshair, head);

  this.lockedTarget = {
    head,
    aimDelta: { x: aim.deltaX, y: aim.deltaY },
    timestamp: Date.now()
  };

  this.targetHistory.push(head);
  if (this.targetHistory.length > 10) this.targetHistory.shift();
} else {
  this.lockedTarget = null;
  this.targetHistory = [];
}

return {
  locked: !!head,
  headInfo: head,
  aimAssist: aim
};


}
}

// === Bindpose matrices cho các bone ===
const BoneMatrices = {
bone_Head: {
e00: -1.34559613e-13, e01: 8.881784e-14, e02: -1.0, e03: 0.487912,
e10: -2.84512817e-6, e11: -1.0, e12: 8.881784e-14, e13: -2.842171e-14,
e20: -1.0, e21: 2.84512817e-6, e22: -1.72951931e-13, e23: 0.0,
e30: 0.0, e31: 0.0, e32: 0.0, e33: 1.0
},
bone_Neck: {
e00: -1.2e-13, e01: 7.5e-14, e02: -1.0, e03: 0.45,
e10: -2.5e-6, e11: -1.0, e12: 7.5e-14, e13: -2.0e-14,
e20: -1.0, e21: 2.5e-6, e22: -1.5e-13, e23: 0.0,
e30: 0.0, e31: 0.0, e32: 0.0, e33: 1.0
},
bone_Chest: {
e00: -1.1e-13, e01: 6.8e-14, e02: -1.0, e03: 0.35,
e10: -2.2e-6, e11: -1.0, e12: 6.8e-14, e13: -1.8e-14,
e20: -1.0, e21: 2.2e-6, e22: -1.3e-13, e23: 0.0,
e30: 0.0, e31: 0.0, e32: 0.0, e33: 1.0
}
};

// === Offset cho từng bone ===
const BoneOffsets = {
bone_Head: new Vector3(-0.0456970781, -0.004478302, -0.0200432576),
bone_Neck: new Vector3(-0.0356970781, -0.002478302, -0.0150432576),
bone_Chest: new Vector3(-0.0256970781, -0.001478302, -0.0100432576)
};

// === Enemy class tích hợp ===
class Enemy {
constructor(data) {
this.id = data.id || Math.random();
this.bones = data.bones || {};
this.velocity = data.velocity || new Vector3(0, 0, 0);
this.health = data.health || 100;
this.lastPosition = null;
this.positionHistory = [];
this.isMoving = false;

this.movementPattern = "linear";
this.threatLevel = this.calculateThreatLevel();
}

updatePosition(newBones) {
if (this.bones.bone_Head) {
this.lastPosition = this.bones.bone_Head.clone();
}


this.bones = { ...this.bones, ...newBones };
this.updateVelocity();
this.updateMovementPattern();
this.addToHistory();


}

updateVelocity() {
if (this.lastPosition && this.bones.bone_Head) {
const deltaPos = this.bones.bone_Head.subtract(this.lastPosition);
this.velocity = deltaPos.multiplyScalar(60); // Assuming 60 FPS
this.isMoving = this.velocity.length() > 0.1;
}
}

updateMovementPattern() {
if (this.positionHistory.length < 5) return;


const recent = this.positionHistory.slice(-5);
const movements = recent.slice(1).map((pos, i) => pos.subtract(recent[i]));

// Phân tích pattern chuyển động
const avgMovement = movements.reduce((sum, mov) => sum.add(mov), new Vector3()).multiplyScalar(1/movements.length);
const variance = movements.reduce((sum, mov) => sum + mov.subtract(avgMovement).length(), 0) / movements.length;

if (variance < 0.1) this.movementPattern = 'linear';
else if (variance < 0.5) this.movementPattern = 'curved';
else this.movementPattern = 'erratic';


}

addToHistory() {
if (this.bones.bone_Head) {
this.positionHistory.push(this.bones.bone_Head.clone());
if (this.positionHistory.length > 10) {
this.positionHistory.shift();
}
}
}

calculateThreatLevel() {
let threat = 1.0;
if (this.health > 80) threat += 0.3;
if (this.isMoving) threat += 0.2;
return Math.min(threat, 2.0);
}

getBestTargetBone() {
const availableBones = AimbotConfig.preferredBones.filter(bone => this.bones[bone]);
if (availableBones.length === 0) return null;


// Ưu tiên head shot
if (this.bones.bone_Head && Math.random() < 0.8) {
  return 'bone_Head';
}

return availableBones[0];


}
}

// === Movement Predictor ===
class MovementPredictor {
static predictPosition(enemy, deltaTime) {
if (!enemy.bones.bone_Head) return null;


const currentPos = enemy.bones.bone_Head;
const velocity = enemy.velocity;

// Dự đoán cơ bản dựa trên velocity
let predicted = currentPos.add(velocity.multiplyScalar(deltaTime));

// Áp dụng AI prediction dựa trên pattern
switch (enemy.movementPattern) {
  case 'linear':
    // Dự đoán tuyến tính đơn giản
    break;
    
  case 'curved':
    // Dự đoán chuyển động cong
    const curveFactor = Math.sin(Date.now() * 0.001) * 0.1;
    predicted = predicted.add(new Vector3(curveFactor, 0, curveFactor));
    break;
    
  case 'erratic':
    // Dự đoán chuyển động bất thường
    if (enemy.positionHistory.length >= 3) {
      const recent = enemy.positionHistory.slice(-3);
      const trend = recent[2].subtract(recent[0]).multiplyScalar(0.5);
      predicted = predicted.add(trend);
    }
    break;
}

// Áp dụng gravity compensation
predicted.y -= 9.81 * deltaTime * deltaTime * 0.5;

return predicted;


}

static calculateLeadTime(enemy, targetDistance) {
const projectileSpeed = 800; // m/s (tốc độ đạn)
const baseLeadTime = targetDistance / projectileSpeed;


// Điều chỉnh dựa trên movement pattern
let leadMultiplier = 1.0;
switch (enemy.movementPattern) {
  case 'erratic': leadMultiplier = 1.3; break;
  case 'curved': leadMultiplier = 1.1; break;
}

return baseLeadTime * leadMultiplier;


}
}

// === Fire-Triggered Aimbot chính ===
class FireTriggeredAimbot {
constructor() {
this.isActive = false;
this.currentTarget = null;
this.lockOnTarget = null;
this.smoothingQueue = [];
this.lastAimPosition = new Vector3();
this.recoilCounter = 0;
this.burstCounter = 0;
this.lastShotTime = 0;
this.activationTimer = null;
this.trackingInterval = null;

// Tích hợp BoneHeadBasedEnemyDetector
this.boneDetector = new BoneHeadBasedEnemyDetector({
  sensitivity: 0.001,
  smoothingFactor: 0.3,
  headLockRange: 9999
});

this.statistics = {
  shotsHired: 0,
  headshotsHit: 0,
  accuracy: 0,
  activations: 0
};

// Demo data
this.demoBoneHeads = [
  {
    matrix: {
      e00: -1.34559613E-13, e01: 8.881784E-14, e02: -1.0, e03: 0.487912,
      e10: -2.84512817E-06, e11: -1.0, e12: 8.881784E-14, e13: -2.842171E-14,
      e20: -1.0, e21: 2.84512817E-06, e22: -1.72951931E-13, e23: 0.0,
      e30: 0.0, e31: 0.0, e32: 0.0, e33: 1.0
    },
    bindpose: {
      position: { x: -0.0456970781, y: -0.004478302, z: -0.0200432576 },
      rotation: { x: 0.0258174837, y: -0.08611039, z: -0.1402113, w: 0.9860321 },
      scale: { x: 0.99999994, y: 1.00000012, z: 1.0 }
    }
  }
];

this.crosshairPos = { x: 400, y: 300 };


}

// Hàm được gọi khi player bắn
onFirePressed() {
this.statistics.activations++;


// Kích hoạt aimbot trong khoảng thời gian nhất định
this.activateForDuration(AimbotConfig.fireActivationDuration);

console.log(`🔥 FIRE PRESSED! Aimbot activated for ${AimbotConfig.fireActivationDuration}ms`);

// Xử lý shooting logic
this.handleShooting();


}

// Kích hoạt aimbot trong thời gian nhất định
activateForDuration(duration) {
// Clear timer cũ nếu có
if (this.activationTimer) {
clearTimeout(this.activationTimer);
}


// Kích hoạt aimbot
if (!this.isActive) {
  this.isActive = true;
  this.startTracking();
}

// Tự động tắt sau thời gian nhất định
this.activationTimer = setTimeout(() => {
  this.deactivate();
}, duration);


}

// Tắt aimbot
deactivate() {
this.isActive = false;
this.stopTracking();
this.currentTarget = null;
this.lockOnTarget = null;


if (this.activationTimer) {
  clearTimeout(this.activationTimer);
  this.activationTimer = null;
}

console.log("⏹️  Aimbot deactivated");


}

// Bắt đầu tracking
startTracking() {
if (this.trackingInterval) return;


this.trackingInterval = setInterval(() => {
  if (this.isActive) {
    this.updateTracking();
  }
}, 8); // ~120 FPS để match với BoneDetector

console.log("🚀 Head tracking started");


}

// Dừng tracking
stopTracking() {
if (this.trackingInterval) {
clearInterval(this.trackingInterval);
this.trackingInterval = null;
}
}

// Cập nhật tracking logic chính
updateTracking() {
const enemies = this.scanForEnemies();


// Sử dụng BoneHeadBasedEnemyDetector
const crosshairRed = enemies.length > 0; // Giả sử có enemy thì crosshair đỏ
const detectionResult = this.boneDetector.process(this.demoBoneHeads, this.crosshairPos, crosshairRed);

if (detectionResult.locked && detectionResult.headInfo) {
  this.acquireTargetFromDetection(detectionResult);
  this.aimAtDetectedTarget(detectionResult);
} else {
  // Fallback to original enemy detection
  if (enemies.length === 0) {
    this.currentTarget = null;
    this.lockOnTarget = null;
    return;
  }
  
  const bestTarget = this.selectBestTarget(enemies);
  
  if (bestTarget && this.isValidTarget(bestTarget)) {
    this.acquireTarget(bestTarget);
    this.aimAtTarget();
  }
}


}

// Acquire target từ bone detection
acquireTargetFromDetection(detectionResult) {
const headInfo = detectionResult.headInfo;


// Convert detection result to Enemy format
const enemy = new Enemy({
  id: 'detected_enemy',
  bones: {
    bone_Head: new Vector3(headInfo.x, headInfo.y, headInfo.z)
  },
  velocity: new Vector3(0, 0, 0), // Sẽ được tính từ history
  health: 100
});

this.currentTarget = enemy;
this.lockOnTarget = enemy;


}

// Aim at detected target
aimAtDetectedTarget(detectionResult) {
const aimAssist = detectionResult.aimAssist;
if (!aimAssist) return;


// Convert aim assist to world position
const targetPos = new Vector3(
  aimAssist.predicted.x,
  aimAssist.predicted.y,
  aimAssist.predicted.z || 0
);

// Apply smoothing
const smoothedPos = this.applySmoothAiming(targetPos);

// Apply recoil compensation
const finalPos = this.applyRecoilCompensation(smoothedPos);

this.aimAt(finalPos);
this.lastAimPosition = finalPos;

console.log(`🎯 BoneDetector Aim: (${finalPos.x.toFixed(3)}, ${finalPos.y.toFixed(3)}, ${finalPos.z.toFixed(3)})`);


}

// Quét tìm kẻ địch (mô phỏng)

  // Quét tìm kẻ địch (mô phỏng)
  scanForEnemies() {
    const now = Date.now();

    return [
      new Enemy({
        id: 1,
        bones: {
          bone_Head: new Vector3(0.3 + Math.sin(now * 0.002) * 0.1, 1.5, -2.0),
          bone_Neck: new Vector3(0.3, 1.4, -2.0),
          bone_Chest: new Vector3(0.3, 1.2, -2.0)
        },
        velocity: new Vector3(Math.cos(now * 0.001) * 0.5, 0, 0.1),
        health: 85
      }),

      new Enemy({
        id: 2,
        bones: {
          bone_Head: new Vector3(-0.5 + Math.sin(now * 0.001) * 0.1, 1.6, -3.5),
          bone_Neck: new Vector3(-0.5, 1.5, -3.5),
          bone_Chest: new Vector3(-0.5, 1.3, -3.5)
        },
        velocity: new Vector3(Math.cos(now * 0.002) * 0.3, 0, -0.2),
        health: 60
      }),

      new Enemy({
        id: 3,
        bones: {
          bone_Head: new Vector3(0.0 + Math.cos(now * 0.001) * 0.05, 1.55, -1.8),
          bone_Neck: new Vector3(0.0, 1.45, -1.8),
          bone_Chest: new Vector3(0.0, 1.25, -1.8)
        },
        velocity: new Vector3(0.1, 0, 0),
        health: 100
      })
    ];
  }
  aimAt(pos) {
    console.log(`🎯 Aiming at (${pos.x.toFixed(3)}, ${pos.y.toFixed(3)}, ${pos.z.toFixed(3)})`);
  }

  handleShooting() {
    if (!AimbotConfig.burstMode) return this.shoot();

    let count = 0;
    const interval = setInterval(() => {
      if (!this.isActive || count >= AimbotConfig.burstCount) return clearInterval(interval);
      this.shoot(); count++;
    }, AimbotConfig.burstDelay);
  }

  shoot() {
    this.recoilCounter++;
    console.log("🔫 Shot fired");
  }

    getDemoBoneHeads() {
    return [{
      matrix: {
        e00: 1, e01: 0, e02: 0, e03: 0.5,
        e10: 0, e11: 1, e12: 0, e13: 1.5,
        e20: 0, e21: 0, e22: 1, e23: 0,
        e30: 0, e31: 0, e32: 0, e33: 1
      },
      bindpose: {
        position: { x: -0.045, y: -0.0044, z: -0.02 },
        rotation: { x: 0, y: 0, z: 0, w: 1 },
        scale: { x: 1, y: 1, z: 1 }
      }
    }];
  }

  // Làm mượt chuyển động tới target
  applySmoothAiming(targetPos) {
    const smoothingFactor = 0.3;

    if (!this.lastAimPosition) {
      this.lastAimPosition = targetPos;
      return targetPos;
    }

    const smoothed = new Vector3(
      this.lastAimPosition.x + (targetPos.x - this.lastAimPosition.x) * smoothingFactor,
      this.lastAimPosition.y + (targetPos.y - this.lastAimPosition.y) * smoothingFactor,
      this.lastAimPosition.z + (targetPos.z - this.lastAimPosition.z) * smoothingFactor
    );

    this.lastAimPosition = smoothed;
    return smoothed;
  }

  applyRecoilCompensation(pos) {
    const recoilCompensationAmount = 0.01 * this.recoilCounter;

    return new Vector3(
      pos.x,
      pos.y - recoilCompensationAmount,
      pos.z
    );
  }
}
// === Auto Run in Shadowrocket ===
const aimbot = new FireTriggeredAimbot();
setInterval(() => {
  aimbot.onFirePressed();
}, 1000);
