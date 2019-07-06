import Randoms from "./Randoms";
import Colors from "./Colors";
import Meshes from "./Meshes";
import THREE from "three";

export default class ConiferousTrees {
  options;
  rainbow;
  m;

  numBranches = 0;

  c = new Colors();
  r = new Randoms();

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
    const sizeRange = Math.random();

    if (sizeRange < 0.2) {
      return this.r.random(0.1, 0.3);
    } else if (sizeRange < 0.5) {
      return this.r.random(0.4, 0.9);
    } else if (sizeRange < 0.95) {
      return this.r.random(1, 1.4);
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
    const decayRange = Math.random();
    if (decayRange < 0.3) {
      return this.r.random(0.01, 0.03);
    } else if (decayRange < 0.9) {
      return this.r.random(0.03, 0.06);
    } else {
      return this.r.random(0.06, 0.07);
    }
  }

  /**
   * What radius should we use for creating the tree leaves?
   * ---------------------------------------------------------
   * @return {Number}
   */
  pickLeafSize() {
    const sizeRange = Math.random();
    if (sizeRange < 0.33) {
      return this.r.random(0.15, 0.4);
    } else if (sizeRange < 0.7) {
      return this.r.random(0.4, 0.8);
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
  randomTreeData(structure, depth, max_d) {
    for (let i = 0; i < max_d; i++) {
      const substruct: any[] = [];
      for (let j = 0; j < this.options.MAX_BRANCHES_PER_NODE; j++) {
        if (Math.random() < this.options.BRANCH_P) {
          substruct.push([]);
        }
      }
      structure.push(substruct);
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
    let deepest = 0;
    const subdepths: any[] = [];

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
    // TODO This came from the original ConiferousTrees
    // const leaf = this.m.diamondMesh(leafCol, leafSize);
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
    // TODO This came from the original ConiferousTrees
    // overridecolor
  ) {
    let length = baseLength * this.r.random(1, 1.4);

    // It's possible for certain sets of parameters to make branches longer than our max, so, rein it in!
    const referenceLength = Math.min(length, this.options.BRANCH_L);

    const baseRadius = function(distFromTip, distFromRoot) {
      const fromBottom =
        minRad +
        ((fullTreeDepth - distFromRoot) / fullTreeDepth) * (maxRad - minRad);
      const fromTop =
        minRad + (distFromTip / fullTreeDepth) * (maxRad - minRad);
      return fromTop;
    };

    if (distanceFromRoot <= 1) {
      length *= 2;
    }

    const radiusBottom = baseRadius(distanceFromTip, distanceFromRoot);
    const radiusTop = baseRadius(
      Math.max(0, distanceFromTip - 1),
      distanceFromRoot + 1
    );

    const cylGeom = new THREE.CylinderGeometry(
      radiusTop,
      radiusBottom,
      length,
      8
    );
    const sphGeom = new THREE.SphereGeometry(radiusTop, 2, 2);
    let hex;

    const propBtm = (fullTreeDepth - distanceFromRoot) / fullTreeDepth;
    const propTop = 1 - propBtm;

    const branchCol = this.rainbow
      ? this.c.randomHex()
      : this.c.mixHexCols(
          this.options.COLOR_BTM,
          this.options.COLOR_TOP,
          propBtm,
          propTop
        );

    for (let i = 0; i < cylGeom.faces.length; i += 2) {
      hex = this.rainbow
        ? this.c.parseHex(this.c.randomHex())
        : this.c.parseHex(branchCol);
      cylGeom.faces[i].color.setHex(hex);
      cylGeom.faces[i + 1].color.setHex(hex);
    }

    for (let i = 0; i < sphGeom.faces.length; i += 2) {
      hex = this.rainbow
        ? this.c.parseHex(this.c.randomHex())
        : this.c.parseHex(branchCol);
      sphGeom.faces[i].color.setHex(hex);
      sphGeom.faces[i + 1].color.setHex(hex);
    }

    const material = new THREE.MeshBasicMaterial({
      vertexColors: THREE.FaceColors,
      overdraw: 0.5
    });

    const cylinder = new THREE.Mesh(cylGeom, material);
    cylinder.position.y = length / 2;

    const sphere = new THREE.Mesh(sphGeom, material);

    const tip = new THREE.Object3D();
    tip.position.y = length;
    tip.add(sphere);

    const branch = new THREE.Object3D();
    branch.add(cylinder);
    branch.add(tip);
    branch.tip = tip;
    branch.length = length;

    if (distanceFromTip < 2) {
      console.log("LEAVES");
      this.makeLeavesAround(
        branch.tip,
        this.r.randomInt(
          this.options.LEAF_DENSITY * 2,
          this.options.LEAF_DENSITY * 3
        ),
        this.options.LEAF_COLS,
        this.options.LEAF_SIZE,
        0,
        0,
        this.options.LEAF_SIZE / 2
      );
    }

    // TODO This came from the original ConiferousTrees
    // if (distanceFromTip == 1) {
    //   this.makeLeavesAround(
    //     branch.tip,
    //     this.options.LEAF_DENSITY,
    //     this.options.LEAF_COLS,
    //     this.options.LEAF_SIZE,
    //     0,
    //     0,
    //     this.options.LEAF_W
    //   );
    // }

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
    const baseTwist = this.r.random(Math.PI * 2);
    for (let i = 0; i < numLeaves; i++) {
      const sheath = new THREE.Object3D();
      const leaf_col = this.r.randomFrom(colors);

      const newLeaf = this.buildLeaf(leaf_col, leafRadius, leafWidth);
      newLeaf.position.y = leafRadius / 2;

      //newLeaf.rotation.x = -Math.PI/2;

      newLeaf.rotation.x = this.r.random(
        -this.options.ANGLE_MAX,
        -this.options.ANGLE_MIN
      );
      sheath.add(newLeaf);
      sheath.rotation.y = baseTwist + (i * Math.PI * 2) / numLeaves;
      sheath.position.y -= this.r.random(0, this.options.BRANCH_L / 2);

      //obj3d.position.y -= this.options.BRANCH_L;
      obj3d.add(sheath);
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
    maxBranchRad,
    corePiece
  ) {
    let baseTwist = this.r.random(Math.PI * 2);
    const mainTrunk = this.depthOfArray(treeData) == fullTreeDepth;

    const minBranchRad = Math.min(
      this.options.BRANCH_R_MIN,
      maxBranchRad * 0.5
    );

    // TODO This came from the original ConiferousTrees
    // let testcolor = depth == 0 ? "#FF0000" : depth == 1 ? "#0000FF" : "#00FF00";

    const root = this.buildBranch(
      0.1,
      fullTreeDepth,
      height,
      fullTreeDepth,
      minBranchRad,
      maxBranchRad
      // TODO This came from the original ConiferousTrees
      // testcolor
    );
    let workingRoot = root;

    // TODO This came from the original ConiferousTrees
    //if (depth == 1) {
    //  //root.tip.rotation.x = (depth==0 ? this.de2ra(145) : this.de2ra(-115));
    //  root.tip.rotation.x = this.de2ra(125);
    //} else if (depth > 1) {
    //  root.tip.rotation.x = this.de2ra(65);
    //}

    //const minBend = this.de2ra(corePiece ? this.options.ANGLE_MIN/6 : this.options.ANGLE_MIN);
    //const maxBend = this.de2ra(corePiece ? this.options.ANGLE_MAX/6 : this.options.ANGLE_MAX);

    const minBend = this.de2ra(
      corePiece ? -this.options.ANGLE_MIN / 12 : this.options.ANGLE_MIN / 2
    );
    const maxBend = this.de2ra(
      corePiece ? -this.options.ANGLE_MAX / 12 : this.options.ANGLE_MAX / 2
    );

    // TODO This came from the original ConiferousTrees
    // const minBend = this.de2ra(
    //   corePiece ? 180 + this.options.ANGLE_MIN / 2 : this.options.ANGLE_MIN / 2
    // );
    // const maxBend = this.de2ra(
    //   corePiece ? 180 + this.options.ANGLE_MAX / 2 : this.options.ANGLE_MAX / 2
    // );

    let newBranchL = branchLength * this.options.LENGTH_MULT;

    console.log("     d     " + depth + ",     ftd " + fullTreeDepth);
    //console.log("     bl    "+branchLength);
    //console.log("     r     "+maxBranchRad);
    //console.log(workingRoot.tip);

    const bendDir = 1; //this.r.randomFrom([1,-1]);
    const curlQuotient = this.r.randomInt(5, 9);

    for (let i = 0; i < fullTreeDepth; i++) {
      console.log(
        "-------------branch " + i + ", " + minBend + ",  " + maxBend
      );

      const trunkBranch = this.buildBranch(
        branchLength,
        fullTreeDepth - i,
        i,
        fullTreeDepth,
        minBranchRad * ((fullTreeDepth - i) / fullTreeDepth),
        maxBranchRad * ((fullTreeDepth - i) / fullTreeDepth)
      );
      trunkBranch.rotation.x =
        this.r.random(minBend / curlQuotient, maxBend / curlQuotient) * bendDir;

      // TODO This came from the original ConiferousTrees
      // const workingDepth =
      //   depth <= 1 ? fullTreeDepth : Math.min(4, fullTreeDepth);
      // for (let i = 0; i < workingDepth; i++) {
      //   console.log("-------------trunkpiece " + i);

      //   if (i > 0 && depth > 0) {
      //     testcolor = "#FFFF00";
      //   }
      //   const trunkBranch = this.buildBranch(
      //     branchLength,
      //     treeData.length - i,
      //     i,
      //     workingDepth,
      //     minBranchRad * ((treeData.length - i) / treeData.length),
      //     maxBranchRad * ((treeData.length - i) / treeData.length),
      //     testcolor
      //   );
      //   trunkBranch.rotation.x =
      //     depth == 0
      //       ? this.r.random(-0.1, 0.1)
      //       : depth > 1 && i > 1
      //       ? -this.r.random(-minBend / 10, -maxBend / 10)
      //       : this.r.random(-minBend / 10, -maxBend / 10);

      //trunkBranch.position.x = workingRoot.tip.position.x;
      //trunkBranch.position.y = workingRoot.tip.position.y;
      //trunkBranch.rotation.x = root.rotation.x + (corePiece ? 0 : -0.3);

      //branchNode.position.x = workingRoot.tip.position.x;
      //branchNode.position.y = workingRoot.tip.position.y;
      workingRoot.tip.add(trunkBranch);

      baseTwist = this.r.random(Math.PI * 2);

      if (i > 0 && depth < 2) {
        for (let j = 0; j < treeData[i].length; j++) {
          if (
            Math.random() > 1 / Math.log(depth + 3) &&
            Math.random() < this.options.BRANCH_P
          ) {
            continue;
          }

          // TODO This came from the original ConiferousTrees
          // if (Math.random() > 1 / Math.log(depth + 3)) {
          //   continue;
          // }
          // console.log("---------=== branch " + j);

          // newBranchL = branchLength * ((treeData.length - i) / treeData.length);

          //newBranchL*(fullTreeDepth-i)
          const newBranch = this.buildTree(
            treeData,
            newBranchL * 0.75,
            depth + 1,
            i,
            fullTreeDepth - 1,
            (maxBranchRad * ((treeData.length - i) / treeData.length)) / 2,
            false
          );
          //const newBranch = this.buildBranch(newBranchL, 1, i, fullTreeDepth, minBranchRad*((treeData.length -i)/treeData.length), maxBranchRad*((treeData.length -i)/treeData.length));
          //newBranch.rotation.x = this.de2ra(90+(treeData.length-i)*3);
          //newBranch.position.x = branchNode.position.x;
          //newBranch.position.y = branchNode.position.y;
          //newBranch.rotation.z = -this.r.random(minBend, maxBend);
          const branchNode = new THREE.Object3D();
          branchNode.rotation.y =
            baseTwist + (j * Math.PI * 2) / treeData[i].length;
          newBranch.position.y = this.r.random(-branchLength / 3, 0);

          // TODO This came from the original ConiferousTrees
          // newBranch.position.y = this.r.random(
          //   -branchLength / 3,
          //   branchLength / 3
          // );
          // branchNode.add(newBranch);

          workingRoot.tip.add(branchNode);

          //console.log("     --------* "+newBranchL+",  r "+branchNode.rotation.y);

          this.numBranches++;
        }
      }

      workingRoot = trunkBranch;
    }

    return root;
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
    const body = this.buildTree(
      treeData,
      branchLength,
      0,
      height,
      fullTreeDepth,
      maxBranchRad,
      true
    );

    const numRoots = this.r.randomInt(3, 10);
    const startRot = this.r.random(Math.PI * 2);
    const rootColInt = this.rainbow
      ? this.c.parseHex(this.c.randomHex())
      : this.c.parseHex(this.options.COLOR_BTM);

    //console.log(numRoots+" roots\n");
    for (let i = 0; i < numRoots; i++) {
      const rootRad = this.r.random(maxBranchRad * 0.3, maxBranchRad * 0.7);
      const rootLength = this.r.random(branchLength * 0.02, branchLength * 0.1);

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
      newRoot.rotation.y = startRot + i * ((Math.PI * 2) / numRoots);

      body.add(newRoot);
    }
    return body;
  }

  getTree(options) {
    this.numBranches = 0;
    this.setParameters(options);

    const data = this.randomTreeData([], 0, this.options.MAX_DEPTH);

    //console.trace(data);

    return this.treeWithRoots(
      data,
      this.options.BRANCH_L,
      data.length,
      0,
      data.length,
      this.options.BRANCH_R_MAX
    );
  }

  setParameters(options) {
    this.options = options;
  }

  initOptions(opts) {
    const maxRad = 5 * this.pickRadius();

    // The bottom of the tree is a random dark colour and the top is a variation on same

    const bottom_color = this.c.mixHexCols(
      this.c.brightenByAmt(this.c.randomHex(), -80),
      "#3e422e",
      0.6,
      0.4
    );

    // Leaves on the trees could be any color of the rainbow!
    // We keep the number of leaf colors down so we don't run out of colors.
    const leafBaseColor = opts.NIGHT_MODE
      ? this.c.brightenByAmt(this.c.randomHex(), -60)
      : this.c.variationsOn(this.c.randomHex(), 80);
    const leafColors: any[] = [];
    for (let i = 0; i < 8; i++) {
      leafColors.push(this.c.variationsOn(leafBaseColor, 30));
    }

    const options = {
      RAINBOW: false,
      NIGHT_MODE: false,
      BRANCH_R_MAX: maxRad,
      BRANCH_R_MIN: maxRad * this.r.random(0.03),
      TRUNK_R_MAX: this.r.random(5, 25),
      TRUNK_R_MIN: this.r.random(2),
      BRANCH_L: this.r.random(3, 7),
      BRANCH_P: this.r.random(0.85, 0.95),
      CHANCE_DECAY: this.pickDecay(),
      LENGTH_MULT: this.r.random(0.85, 0.95),
      ANGLE_MIN: this.r.random(100, 110),
      ANGLE_MAX: this.r.random(120, 135),
      COLOR_BTM: bottom_color,
      COLOR_TOP: this.c.variationsOn(bottom_color, 180),
      LEAF_COLS: leafColors,
      LEAF_SIZE: this.pickLeafSize(),
      LEAF_DENSITY: this.r.randomInt(24),
      LEAF_W: this.r.random(0.1, 0.2),
      MAX_DEPTH: this.r.random(8, 20),
      MAX_BRANCHES_TOTAL: 9999,
      MAX_BRANCHES_PER_NODE: this.r.randomInt(3, 6)
    };

    for (const opt in opts) {
      if (options[opt] !== undefined) {
        options[opt] = opts[opt];
      }
    }

    console.log(
      "decay " +
        options.CHANCE_DECAY +
        "\nmax depth " +
        options.MAX_DEPTH +
        "\nbranches per node " +
        options.MAX_BRANCHES_PER_NODE
    );

    return options;
  }
}
