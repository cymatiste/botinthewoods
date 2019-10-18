import * as THREE from "three";
import Randoms from "./Randoms";
import Colors from "./Colors";
import Meshes from "./Meshes";

export default class DeciduousTrees {
  m: Meshes;
  rainbow: boolean;
  options;
  LEAF_BASE_COLOR;

  c = new Colors();
  r = new Randoms();

  numBranches = 0;

  constructor(options) {
    this.options = this.initOptions(options);
    this.m = new Meshes(this.options);
    this.rainbow = this.options.RAINBOW;
  }

  /**
   * What radius should we use for building the base of the trees?
   * --------------------------------------------------------------
   * @return {Number}
   */
  pickRadius() {
    const sizeRange: Number = Math.random();

    if (sizeRange < 0.1) {
      return this.r.random(0.1, 0.4);
    } else if (sizeRange < 0.7) {
      return this.r.random(0.4, 0.7);
    } else if (sizeRange < 0.8) {
      return this.r.random(0.9, 1.5);
    } else {
      return this.r.random(1.5, 2.8);
    }
  }

  /**
   * How less likely do branches become at each node?
   * ----------------------------------------------------
   * @return {Number} 0-1
   */
  pickDecay() {
    const decayRange: Number = Math.random();
    if (decayRange < 0.2) {
      return this.r.random(0, 0.02);
    } else if (decayRange < 0.8) {
      return this.r.random(0.02, 0.05);
    } else {
      return this.r.random(0.05, 0.07);
    }
  }

  /**
   * What radius should we use for creating the tree leaves?
   * ---------------------------------------------------------
   * @return {Number}
   */
  pickLeafSize() {
    const sizeRange: Number = Math.random();
    if (sizeRange < 0.33) {
      return this.r.random(0.3, 0.5);
    } else if (sizeRange < 0.7) {
      return this.r.random(0.5, 0.8);
    } else if (sizeRange < 0.9) {
      return this.r.random(0.8, 1);
    } else {
      return this.r.random(1, 1.4);
    }
  }

  /**
   * Generate a tree shape as an array of arrays.
   * --------------------------------------------------------------------------------------
   * @param  {Array} startingStructure
   * @param  {int} startingDepth          -- how deep into the main tree is this subtree?
   *
   * @return {Array}
   */
  randomTreeData(startingStructure?, startingDepth?) {
    const structure = startingStructure || [];
    const depth = startingDepth || 0;
    const maxDepth = this.r.randomInt(
      this.options.MAX_DEPTH * 0.7,
      this.options.MAX_DEPTH
    );

    //Math.round(this.options.MAX_DEPTH * this.r.random(0.3,0.6));

    if (depth < maxDepth) {
      const branchChance =
        depth == this.options.MAX_DEPTH - 1
          ? this.options.BRANCH_P
          : this.options.BRANCH_P -
            this.options.BRANCH_P * (this.options.CHANCE_DECAY * depth);

      let branchesAtThisNode = 0;
      while (
        this.numBranches == 0 ||
        (structure.length < this.options.MAX_BRANCHES_PER_NODE &&
          this.numBranches < this.options.MAX_BRANCHES_TOTAL &&
          Math.random() < branchChance)
      ) {
        const newBranch = this.randomTreeData([], depth + 1);
        structure.push(newBranch);
        branchesAtThisNode++;
        this.numBranches++;
      }

      //console.log("depth "+depth+" at branchChance "+branchChance+" --->  "+branchesAtThisNode);

      if (structure == []) {
        const tipBranches = this.r.randomInt(2, 3);
        for (let i = 0; i < tipBranches; i++) {
          structure.push([]);
        }
      }
    }
    return structure;
  }

  /**
   * How deep is this array?
   * ---------------------------------------------------------
   * @param  {Array} arr
   *
   * @return {int}        -- deepest level of nesting present
   */
  depthOfArray(arr) {
    const subdepths: any[] = [];
    let deepest = 0;

    for (let i = 0; i < arr.length; i++) {
      subdepths.push(this.depthOfArray(arr[i]));
    }

    for (let i = 0; i < subdepths.length; i++) {
      if (subdepths[i] > deepest) {
        deepest = subdepths[i];
      }
    }

    return deepest + 1;
  }

  buildLeaf(leafCol, leafSize, leafWidth) {
    const leaf = this.m.circleMesh(leafCol, leafSize);
    leaf.scale.x = leafWidth;
    return leaf;
  }

  /**
   * Convert degrees to radians
   * --------------------------------------------
   * @param  {Number} degree
   *
   * @return {Number}        -- the equivalent number in radians
   */
  de2ra(degree) {
    return degree * (Math.PI / 180);
  }

  /**
   * "Branch"
   * Make a cylindrical mesh and ball "joint" representing one branch segment of a tree.
   * ---------------------------------------------------------------------------------------------------
   * @param  {Number} baseLength          -- how long are branches at base? Will vary based on this.
   * @param  {int} distanceFromTip        -- how many nodes away from the branch tip is this node?
   * @param  {int} distanceFromRoot       -- how many nodes is this node away from the ground?
   * @param  {int} fullTreeDepth          -- how many nodes has the longest path from root to tip?
   * @param  {Number} minRad              -- minimum branch radius
   * @param  {Number} maxRad              -- maximum branch radius
   *
   * @return {THREE.Object3D}             -- a 3d object holding the branch segment
   */
  buildBranch(
    baseLength,
    distanceFromTip,
    distanceFromRoot,
    fullTreeDepth,
    minRad,
    maxRad
  ) {
    const length = baseLength * this.r.random(1, 1.4);

    // It's possible for certain sets of parameters to make branches longer than our max, so, rein it in!
    let referenceLength = Math.min(length, this.options.BRANCH_L);
    if (distanceFromTip == 1) {
      referenceLength = referenceLength / 2;
    }

    const baseRadius = function(distFromTip, distFromRoot) {
      const fromBottom =
        minRad +
        ((fullTreeDepth - distFromRoot) / fullTreeDepth) * (maxRad - minRad);
      const fromTop =
        minRad + (distFromTip / fullTreeDepth) * (maxRad - minRad);
      return fromTop;
    };

    const radiusBottom = baseRadius(distanceFromTip, distanceFromRoot);
    const radiusTop = baseRadius(
      Math.max(0, distanceFromTip - 1),
      distanceFromRoot + 1
    );

    const cylGeom = new THREE.CylinderGeometry(
      radiusTop,
      radiusBottom,
      referenceLength,
      8
    );
    const sphGeom = new THREE.SphereGeometry(radiusBottom, 4, 4);
    let hex;

    const propBtm = (fullTreeDepth - distanceFromRoot) / fullTreeDepth;
    const propTop = 1 - propBtm;

    const branchCol = this.c.mixHexCols(
      this.options.COLOR_BTM,
      this.options.COLOR_TOP,
      propBtm,
      propTop
    );

    //hex = this.rainbow ? this.c.parseHex(this.c.randomHex()) : this.c.parseHex(branchCol);
    hex = this.c.parseHex(branchCol);

    for (let i = 0; i < cylGeom.faces.length; i += 2) {
      //hex = this.rainbow ? this.c.parseHex(this.c.randomHex()) : this.c.parseHex(branchCol);
      cylGeom.faces[i].color.setHex(hex);
      cylGeom.faces[i + 1].color.setHex(hex);
    }

    for (let i = 0; i < sphGeom.faces.length; i += 2) {
      hex = this.c.parseHex(branchCol);
      sphGeom.faces[i].color.setHex(hex);
      sphGeom.faces[i + 1].color.setHex(hex);
    }

    const material = new THREE.MeshBasicMaterial({
      vertexColors: THREE.FaceColors,
      overdraw: 0.5
    });

    const cylinder = new THREE.Mesh(cylGeom, material);
    cylinder.position.y = referenceLength / 2;

    const sphere = new THREE.Mesh(sphGeom, material);

    const tip = new THREE.Object3D();
    tip.position.y = referenceLength;
    tip.add(sphere);

    const branch = new THREE.Object3D();
    branch.add(cylinder);
    branch.add(tip);
    branch.tip = tip;
    branch.length = referenceLength;

    if (distanceFromTip < 2) {
      this.makeLeavesAround(
        branch.tip,
        this.r.randomInt(
          this.options.LEAF_DENSITY * 2,
          this.options.LEAF_DENSITY * 3
        ),
        this.options.LEAF_COLS,
        2 * this.options.LEAF_SIZE,
        0,
        0,
        2 * this.options.LEAF_SIZE
      );
    }

    return branch;
  }

  /**
   * Add a bunch of leaves around the given object.
   * -----------------------------------------------------------------------------------------------------
   * @param  {THREE.Object3D} obj3d   -- the thing to add leaves to
   * @param  {int} numLeaves
   * @param  {Array of hex strings} colors
   * @param  {Number} leafRadius
   * @param  {Number} yAdjust         -- how high above the pivot point
   * @param  {Number} rAdjust         -- how far out from the center to place leaves
   *
   * @return {void}                   -- The leaves will be added as children of the obj.
   */
  makeLeavesAround(
    obj3d,
    numLeaves,
    colors,
    leafRadius,
    yAdjust,
    rAdjust,
    leafWidth
  ) {
    for (let i = 0; i < numLeaves; i++) {
      const leaf_col = this.r.randomFrom(colors);

      const newLeaf = this.buildLeaf(leaf_col, leafRadius, leafWidth);

      const circleSize = this.r.random(1.2, 2.2);

      newLeaf.rotation.x = this.r.random(-Math.PI / 2, Math.PI);
      newLeaf.rotation.y = this.r.random(-Math.PI / 2, Math.PI);
      newLeaf.rotation.z = this.r.random(-Math.PI / 2, Math.PI);

      newLeaf.position.y += this.r.random(-0.5, 2) * circleSize + yAdjust;
      newLeaf.position.x += this.r.randomSign(
        this.r.random(0.75) * circleSize + rAdjust
      );
      newLeaf.position.z += this.r.randomSign(
        this.r.random(0.75) * circleSize + rAdjust
      );

      obj3d.rotation.y += (Math.PI * 2) / numLeaves;

      obj3d.add(newLeaf);
    }
  }

  /**
   * Build a tree!  Or a subtree!  In 3D.
   * -------------------------------------------------------------------------------------
   * @param  {Array of arrays} treeData       -- structure to follow
   * @param  {Number} branchLength
   * @param  {int} depth                      -- how deep is this subtree?
   * @param  {int} height                     -- how far from the root is this subtree?
   * @param  {int} fullTreeDepth              -- how deep is the full tree?
   * @param  {Number} maxBranchRad            -- radius at the base of the tree
   *
   * @return {THREE.Object3D}                 -- the 3D tree!
   */
  buildTree(
    treeData,
    branchLength,
    depth,
    height,
    fullTreeDepth,
    maxBranchRad
  ) {
    let fanRads = this.de2ra(
      this.options.ANGLE_MIN +
        this.r.random(this.options.ANGLE_MAX - this.options.ANGLE_MIN)
    );
    // Don't start fanning out too low in the tree.
    if (height < 2) {
      //fanRads = fanRads / 2;
    }

    const root = this.buildBranch(
      branchLength,
      depth,
      height,
      fullTreeDepth,
      this.options.BRANCH_R_MIN,
      maxBranchRad
    );

    const bottomThreshold = this.r.randomInt(1, 4);
    const numClusters = this.r.randomInt(1, 4);
    //const bottomQuint = height == 0 || (depth < fullTreeDepth/5 && height < fullTreeDepth/5);

    if (this.options.MUSHROOMS && height < bottomThreshold) {
      console.log(
        "ADDING MUSHROOMS AT HEIGHT " +
          height +
          " AND DEPTH " +
          depth +
          " /" +
          fullTreeDepth
      );
      for (let i = 0; i < numClusters; i++) {
        this.addMushroomsTo(root, maxBranchRad, branchLength);
      }
    }

    for (let i = 0; i < treeData.length; i++) {
      const newBranch = this.buildTree(
        treeData[i],
        branchLength * this.options.LENGTH_MULT,
        this.depthOfArray(treeData[i]),
        height + 1,
        fullTreeDepth,
        maxBranchRad
      );
      const fanMod = height / fullTreeDepth;
      const xrot = this.r.randomSign(this.r.random(fanRads / 2, fanRads)); // * fanMod;
      const zrot = this.r.randomSign(this.r.random(fanRads / 2, fanRads)); // * fanMod;
      newBranch.rotation.x = root.rotation.x + xrot * fanMod;

      newBranch.rotation.z = root.rotation.z + zrot * fanMod;

      // Position this subtree somewhere along the parent branch if such exists.
      //newBranch.position.y = (height == 0) ? 0 : -Math.random() * (branchLength / 3);

      root.tip.add(newBranch);
    }

    return root;
  }

  mushroom(col, size, width) {
    const cap = this.m.sphereMesh(col, size, 8);
    cap.scale.y = width;
    return cap;
  }

  addMushroomsTo(branch, branchRad, branchLength) {
    // add mushrooms
    const numMushrooms = this.r.randomFrom([
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8
    ]);
    const col = this.c.variationsOn(this.options.MUSHROOM_COL, 20);
    let mushroomRoot = new THREE.Object3D();

    for (let m = 0; m < numMushrooms; m++) {
      const size = this.r.random(branchRad / 4, branchRad / 2);
      const mushroom = this.mushroom(col, size, this.r.random(0.2, 0.6));
      mushroom.position.y = this.r.random(0, branchLength / 2);
      mushroom.position.x =
        Math.random() < 0.5 ? -branchRad / 2 : branchRad / 2;
      mushroom.position.z =
        Math.random() < 0.5 ? -branchRad / 2 : branchRad / 2;
      mushroomRoot.add(mushroom);
    }
    mushroomRoot.rotation.y = this.r.random(Math.PI * 2);
    mushroomRoot.position.y = this.r.random(branchLength / 2);
    branch.add(mushroomRoot);
  }

  /**
   * Add roots to the tree
   * --------------------------
   * @params as per this.buildTree
   */
  treeWithRoots(
    treeData,
    branchLength,
    depth,
    height,
    fullTreeDepth,
    maxBranchRad
  ) {
    if (this.rainbow) {
      //this.options.COLOR_TOP = this.c.randomHex();
      this.options.COLOR_TOP = this.c.variationsOn(this.options.COLOR_TOP, 50);
      this.options.COLOR_BTM = this.c.brightenByMult(
        this.options.COLOR_TOP,
        0.3
      );

      //const leafBaseColor = this.c.variationsOn(this.LEAF_BASE_COLOR, 50);
      const leafBaseColor = this.c.randomHex();
      this.options.LEAF_COLS = [];
      for (let i = 0; i < 3; i++) {
        this.options.LEAF_COLS.push(this.c.variationsOn(leafBaseColor, 20));
      }
    }

    const body = this.buildTree(
      treeData,
      branchLength,
      depth,
      height,
      fullTreeDepth,
      maxBranchRad
    );

    const numRoots = this.r.randomInt(3, 10);
    const startRot = this.r.random(Math.PI * 2);
    const rootColInt = this.c.parseHex(this.options.COLOR_BTM);

    //console.log(numRoots+" roots\n");
    for (let i = 0; i < numRoots; i++) {
      const rootRad = this.r.random(maxBranchRad * 0.3, maxBranchRad * 0.7);
      const rootLength = this.r.random(
        branchLength * 0.05,
        branchLength * 0.25
      );

      const cylGeom = new THREE.CylinderGeometry(rootRad, 0.01, rootLength, 8);
      for (let f = 0; f < cylGeom.faces.length; f++) {
        cylGeom.faces[f].color.setHex(rootColInt);
      }

      const cylMat = new THREE.MeshBasicMaterial({
        vertexColors: THREE.FaceColors,
        overdraw: 0.5
      });

      const cone = new THREE.Mesh(cylGeom, cylMat);
      const newRoot = new THREE.Object3D();
      cone.rotation.x = -Math.PI / 2.4;
      cone.position.z = rootLength / 2 + (maxBranchRad / 2) * 0.9;

      newRoot.add(cone);
      //cone.rotation.y = i*(Math.PI*2/numRoots);
      newRoot.rotation.y = startRot + i * ((Math.PI * 2) / numRoots);

      //console.log("root "+numRoots+", "+newRoot.rotation.y);
      //newRoot.position.y = 0.7;

      body.add(newRoot);
    }
    return body;
  }

  getTree(options) {
    this.numBranches = 0;
    this.initOptions(options);

    let data = [];
    while (data.length == 0) {
      data = this.randomTreeData();
    }

    return this.treeWithRoots(
      data,
      this.options.BRANCH_L,
      this.depthOfArray(data),
      0,
      this.depthOfArray(data),
      this.options.BRANCH_R_MAX
    );
  }

  setParameters(options) {
    this.options = this.initOptions(options);
  }

  initOptions(opts) {
    const maxRad = this.pickRadius();
    const nightMode = Math.random() > 0.6;

    // The bottom of the tree is a random dark colour and the top is a variation on same
    let top_color = this.c.randomHex();
    if (nightMode) {
      top_color = this.c.brightenByMult(top_color, 0.5);
    }
    //const bottom_color = nightMode ? this.c.brightenByAmt(this.c.randomDark(), this.r.random(0,15)) : this.c.brightenByAmt(this.c.randomDark(), this.r.random(15,45));

    // Leaves on the trees could be any color of the rainbow!
    // We keep the number of leaf colors down so we don't run out of colors.
    this.LEAF_BASE_COLOR = nightMode
      ? this.c.brightenByMult(this.c.randomHex(), 0.6)
      : this.c.randomHex();

    let leafColors: any[] = [];
    const colorVariability = opts.COLOR_INTENSE
      ? this.r.randomInt(20, 40)
      : this.r.randomInt(10, 25);
    const numLeafColors = opts.COLOR_INTENSE ? 6 : 3;
    for (let i = 0; i < numLeafColors; i++) {
      leafColors.push(
        this.c.variationsOn(this.LEAF_BASE_COLOR, colorVariability)
      );
    }

    const btm_color =
      Math.random() < 0.4
        ? top_color
        : this.c.mixHexCols(
            this.c.randomHex(),
            this.c.brightenByMult(top_color, 0.4),
            0.6,
            0.4
          );

    const options = {
      RAINBOW: false,
      COLOR_INTENSE: false,
      NIGHT_MODE: nightMode,
      BRANCH_R_MAX: maxRad,
      BRANCH_R_MIN: maxRad * this.r.random(0.03),
      BRANCH_L: Math.max(maxRad * 10, this.r.random(4, 8)),
      BRANCH_P: this.r.random(0.72, 0.77),
      CHANCE_DECAY: this.pickDecay(),
      LENGTH_MULT: this.r.random(0.6, 0.95),
      ANGLE_MIN: this.r.random(15, 45),
      ANGLE_MAX: this.r.random(60, 120),
      COLOR_TOP: top_color,
      //COLOR_BTM: this.c.brightenByMult(top_color, 0.3),
      COLOR_BTM: btm_color,
      LEAF_COLS: leafColors,
      LEAF_SIZE: this.pickLeafSize(),
      LEAF_DENSITY: this.r.randomInt(24),
      LEAF_W: this.r.random(0.7, 1),
      MAX_DEPTH: 12,
      MAX_BRANCHES_TOTAL: 999,
      MAX_BRANCHES_PER_NODE: this.r.randomInt(3, 4),
      MUSHROOMS: Math.random() < 0.5,
      MUSHROOM_COL: this.c.variationsOn("#777777", 100)
    };

    for (const opt in opts) {
      if (options[opt] !== undefined) {
        options[opt] = opts[opt];
      }
    }

    return options;
  }
}
