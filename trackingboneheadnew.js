class BoneHeadBasedEnemyDetector {
  constructor(options = {}) {
    // Bổ sung đoạn cấu hình headConfig nguyên vẹn
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
       this.sensitivity = options.sensitivity || 5.0;
    this.smoothingFactor = options.smoothingFactor || 0.3;
    this.headLockRange = options.headLockRange || 9999;

    this.lockedTarget = null;
    this.targetHistory = [];

    this.distanceAdjustments = {
      close: { range: [0, 50], offset: { x: 0, y: -5 } },
      medium: { range: [50, 150], offset: { x: 0, y: -8 } },
      far: { range: [150, 300], offset: { x: 0, y: -12 } },
      veryFar: { range: [300, Infinity], offset: { x: 0, y: -15 } }
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

// ===== Demo BoneHeadBasedEnemyDetector với dữ liệu thật =====
const GamePackages = {
  GamePackage1: "com.dts.freefireth",
  GamePackage2: "com.dts.freefiremax"
};
const demoBoneHeads = [
  {
    matrix: {
      e00: -1.34559613E-13,
      e01: 8.881784E-14,
      e02: -1.0,
      e03: 0.487912,
      e10: -2.84512817E-06,
      e11: -1.0,
      e12: 8.881784E-14,
      e13: -2.842171E-14,
      e20: -1.0,
      e21: 2.84512817E-06,
      e22: -1.72951931E-13,
      e23: 0.0,
      e30: 0.0,
      e31: 0.0,
      e32: 0.0,
      e33: 1.0
    },
    bindpose: {
      position: { x: -0.0456970781, y: -0.004478302, z: -0.0200432576 },
      rotation: { x: 0.0258174837, y: -0.08611039, z: -0.1402113, w: 0.9860321 },
      scale: { x: 0.99999994, y: 1.00000012, z: 1.0 }
    }
  }
];

const crosshairPos = { x: 400, y: 300 };
const isCrosshairRed = true;  // Giả sử tâm ngắm đang đỏ

const headConfig = {
  boneColliderProperty: {
    boneProperty: { recursivery: 0 },
    splitProperty: {
      boneWeightType: 0,
      boneWeight2: 100,
      boneWeight3: 100,
      boneWeight4: 100,
      greaterBoneWeight: 1,
      boneTriangleExtent: 0
    },
    reducerProperty: {
      shapeType: 3,
      fitType: 0,
      meshType: 3,
      maxTriangles: 255,
      sliceMode: 0,
      scale: { x: 1.0, y: 1.0, z: 1.0 },
      scaleElementType: 0,
      minThickness: { x: 0.01, y: 0.01, z: 0.01 },
      minThicknessElementType: 0,
      optimizeRotation: { x: 1, y: 1, z: 1 },
      optimizeRotationElementType: 0,
      colliderToChild: 2,
      offset: { x: 0.0, y: 0.0, z: 0.0 },
      thicknessA: { x: 0.0, y: 0.0, z: 0.0 },
      thicknessB: { x: 0.0, y: 0.0, z: 0.0 },
      viewAdvanced: 0
    },
    colliderProperty: {
      convex: 1,
      isTrigger: 0,
      material: { m_FileID: 0, m_PathID: 0 },
      isCreateAsset: 0
    },
    rigidbodyProperty: {
      mass: 1.0,
      drag: 0.0,
      angularDrag: 0.05,
      isKinematic: 1,
      useGravity: 0,
      interpolation: 0,
      collisionDetectionMode: 0,
      isCreate: 0,
      viewAdvanced: 0
    },
    modifyNameEnabled: 0
  },
  defaultBoneColliderProperty: {
    boneProperty: { recursivery: 0 },
    splitProperty: {
      boneWeightType: 0,
      boneWeight2: 50,
      boneWeight3: 33,
      boneWeight4: 25,
      greaterBoneWeight: 1,
      boneTriangleExtent: 1
    },
    reducerProperty: {
      shapeType: 2,
      fitType: 0,
      meshType: 3,
      maxTriangles: 255,
      sliceMode: 0,
      scale: { x: 1.0, y: 1.0, z: 1.0 },
      scaleElementType: 0,
      minThickness: { x: 0.01, y: 0.01, z: 0.01 },
      minThicknessElementType: 0,
      optimizeRotation: { x: 1, y: 1, z: 1 },
      optimizeRotationElementType: 0,
      colliderToChild: 0,
      offset: { x: 0.0, y: 0.0, z: 0.0 },
      thicknessA: { x: 0.0, y: 0.0, z: 0.0 },
      thicknessB: { x: 0.0, y: 0.0, z: 0.0 },
      viewAdvanced: 0
    },
    colliderProperty: {
      convex: 1,
      isTrigger: 0,
      material: { m_FileID: 0, m_PathID: 0 },
      isCreateAsset: 0
    },
    rigidbodyProperty: {
      mass: 1.0,
      drag: 0.0,
      angularDrag: 0.05,
      isKinematic: 1,
      useGravity: 0,
      interpolation: 0,
      collisionDetectionMode: 0,
      isCreate: 1,
      viewAdvanced: 0
    },
    modifyNameEnabled: 0
  }
};

// Tạo instance detector và truyền headConfig
const detector = new BoneHeadBasedEnemyDetector({ headConfig });

// Chạy xử lý
const result = detector.process(demoBoneHeads, crosshairPos, isCrosshairRed);

console.log("🎯 Kết quả tracking với cấu hình headConfig:", result);
