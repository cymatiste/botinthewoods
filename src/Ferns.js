function Ferns(baseColor) {
  var _this = this;
  var THREE = require("three");
  var Randoms = require("./Randoms.js");
  var Colors = require("./Colors.js");

  var colorHelper = new Colors();
  var _r = new Randoms();

  this.options = _initOptions(baseColor);
  var _options = this.options;

  /**
   * How deep is this array?
   * ---------------------------------------------------------
   * @param  {Array} arr
   *
   * @return {int}        -- deepest level of nesting present
   */
  function _depthOfArray(arr) {
    var i;
    var deepest = 0;
    var subdepths = [];

    for (i = 0; i < arr.length; i++) {
      subdepths.push(_depthOfArray(arr[i]));
    }

    for (i = 0; i < subdepths.length; i++) {
      if (subdepths[i] > deepest) {
        deepest = subdepths[i];
      }
    }

    return deepest + 1;
  }

  function _buildLeaf(leafCol, leafSize, leafWidth) {
    var leaf = _circleMesh(leafCol, leafSize);
    leaf.scale.x = leafWidth;
    return leaf;
  }

  function _circleMesh(col, radius) {
    var geometry = new THREE.CircleGeometry(radius, 8);
    var material = new THREE.MeshBasicMaterial({
      color: colorHelper.parseHex(col)
    });

    return new THREE.Mesh(geometry, material);
  }

  function _sphereMesh(col, radius) {
    var sphGeom = new THREE.SphereGeometry(radius, 2, 2);
    var hex;

    for (i = 0; i < sphGeom.faces.length; i += 2) {
      hex = colorHelper.parseHex(col);
      sphGeom.faces[i].color.setHex(hex);
      sphGeom.faces[i + 1].color.setHex(hex);
    }

    var material = new THREE.MeshBasicMaterial({
      vertexColors: THREE.FaceColors,
      overdraw: 0.5
    });

    return new THREE.Mesh(sphGeom, material);
  }

  function _cylinderMesh(cylCol, radiusTop, radiusBottom, length) {
    var cylGeom = new THREE.CylinderGeometry(
      radiusTop,
      radiusBottom,
      length,
      8
    );
    var hex = colorHelper.parseHex(cylCol);

    for (i = 0; i < cylGeom.faces.length; i++) {
      cylGeom.faces[i].color.setHex(hex);
    }

    var material = new THREE.MeshBasicMaterial({
      vertexColors: THREE.FaceColors,
      overdraw: 0.5
    });

    return new THREE.Mesh(cylGeom, material);
  }

  /**
   * Convert degrees to radians
   * --------------------------------------------
   * @param  {Number} degree
   *
   * @return {Number}        -- the equivalent number in radians
   */
  function _de2ra(degree) {
    return degree * (Math.PI / 180);
  }

  function _frond(col, length, numLeaves) {
    var newStem = _cylinderMesh(_options.STEM_COL, 0.01, 0.02, length);

    var leafLength = 0.3;
    var widthScale = 0.2;
    console.log("frond with " + numLeaves + " leaves of length " + leafLength);

    for (var i = 0; i < numLeaves; i++) {
      var leafL = leafLength * ((numLeaves - i) / numLeaves);
      var leftLeaf = _buildLeaf(col, leafL, widthScale);
      var rightLeaf = _buildLeaf(col, leafL, widthScale);
      //leftLeaf.rotation.x = -Math.PI;
      leftLeaf.rotation.z = -Math.PI / 2;
      leftLeaf.position.x = -leafLength / 2;
      leftLeaf.position.y = i * (length / numLeaves);

      //rightLeaf.rotation.x = -Math.PI;
      rightLeaf.rotation.z = Math.PI / 2;
      rightLeaf.position.x = leafLength / 2;
      rightLeaf.position.y = i * (length / numLeaves);

      newStem.add(leftLeaf);
      newStem.add(rightLeaf);
    }
    return newStem;
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
  function _buildFern() {
    var root = new THREE.Object3D();
    root.tip = root;
    var numSegments = _r.randomInt(_options.MAX_DEPTH / 2, _options.MAX_DEPTH);
    var startingSegment = _r.randomInt(0, 5);
    var stem_segments = [root];
    var segRad = 0.1;
    var segLength = 1;
    var leafStart = _r.random(2, 5);
    var leafCol = _r.randomFrom(_options.LEAF_COLS);

    var fernFlop = _r.random(_options.MIN_FLOP, _options.MAX_FLOP);

    for (var i = 0; i < numSegments; i++) {
      //cylCol, radiusTop, radiusBottom, length
      var segRoot = new THREE.Object3D();
      var length_i = segLength - i * 0.03;
      var stemSeg = _cylinderMesh(
        _options.STEM_COL,
        segRad - (i + 1) * 0.005,
        segRad - i * 0.005,
        length_i
      );
      stemSeg.y = length_i / 2;

      var tip = new THREE.Object3D();
      tip.position.y = length_i;
      stemSeg.add(tip);
      segRoot.add(stemSeg);
      segRoot.tip = tip;
      segRoot.rotation.x = fernFlop;

      var prevSeg = stem_segments[stem_segments.length - 1];

      prevSeg.tip.add(segRoot);

      if (i > leafStart) {
        //_frond(col, length, numLeaves)
        var frondLength =
          numSegments * segLength * ((numSegments - i) / numSegments);
        var leftFrond = _frond(leafCol, frondLength, numSegments - i);
        var rightFrond = _frond(leafCol, frondLength, numSegments - i);
        leftFrond.rotation.z = -Math.PI / 2 + fernFlop / 2;
        //leftFrond.rotation.y = -0.1*(numSegments-i);
        rightFrond.rotation.z = Math.PI / 2 + fernFlop / 2;
        //rightFrond.rotation.y = 0.1*(numSegments-i);
        segRoot.add(leftFrond);
        segRoot.add(rightFrond);
      }

      stem_segments.push(segRoot);
    }
    return root;
  }

  function _fernClump() {
    var clump = new THREE.Object3D();
    var numFerns = _r.random(2, 5);
    for (var i = 0; i < numFerns; i++) {
      var fern = _buildFern();
      fern.rotation.y = (i * (Math.PI * 2)) / numFerns;
      clump.add(fern);
    }
    return clump;
  }

  this.getFern = function(col) {
    return _fernClump();
    //return _buildFern();
  };

  function _initOptions(col) {
    // The bottom of the tree is a random dark colour and the top is a variation on same
    //var bottom_color = NIGHT_MODE ? colorHelper.randomDark() : colorHelper.brightenByAmt(colorHelper.randomDark(), _r.random(30,80));

    var bottom_color = col || colorHelper.randomHex();

    // Leaves on the trees could be any color of the rainbow!
    // We keep the number of leaf colors down so we don't run out of colors.
    var leafBaseColor = colorHelper.variationsOn(bottom_color, 10);
    var leafColors = [];
    for (i = 0; i < 8; i++) {
      leafColors.push(colorHelper.variationsOn(leafBaseColor, 20));
    }

    var options = {
      STEM_COL: bottom_color,
      MAX_WIDTH: _r.randomInt(8, 20),
      MAX_DEPTH: 20,
      MIN_FLOP: _de2ra(3),
      MAX_FLOP: _de2ra(15),
      LEAF_COLS: leafColors
    };

    return options;
  }
}

module.exports = Ferns;
