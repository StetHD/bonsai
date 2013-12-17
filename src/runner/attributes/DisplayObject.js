define([
  '../../util/unit',
  '../../vendor/glmatrix/mat2d'
], function(unit, mat2d) {
  'use strict';

  var PI_2 = 6.283185307179586;
  var atan2 = Math.atan2;

  var copyMatrix = mat2d.copy;

  function DisplayObjectAttributes() {
    this.opacity =
      this.scaleX =
      this.scaleY = 1;
    this.rotation =
      this.skew =
      this.transformOriginX =
      this.transformOriginY =
      this.x =
      this.y = 0;
    this.transform = null;

    this._isTransformDirty = false;
  }

  DisplayObjectAttributes.prototype = {
    set_opacity: function(value) {
      return value < 0 ? 0 : value > 1 ? 1 : value;
    },

    set_skew: function(value) {
      this._isTransformDirty = value !== this.skew;
      return value;
    },

    get_scale: function() {
      var scale = this.scaleX;
      return scale === this.scaleY ? scale : undefined;
    },

    set_scale: function(value) {
      this._isTransformDirty = value !== this.scaleX || value !== this.scaleY;
      this.scaleX = this.scaleY = value;
    },

    set_scaleX: function(value) {
      this._isTransformDirty = value !== this.scaleX;
      return value;
    },

    set_scaleY: function(value) {
      this._isTransformDirty = value !== this.scaleY;
      return value;
    },

    set_rotation: function(value) {
      if (typeof value === 'string') value = unit.parseAngle(value);
      this._isTransformDirty = this.rotation !== value;
      return limitRotation(value);
    },

    set_x: function(value) {
      this._isTransformDirty = value !== this.x;
      return value;
    },

    set_y: function(value) {
      this._isTransformDirty = value !== this.y;
      return value;
    },

    get_transform: function() {
      if (!this._isTransformDirty) {
        return this.transform;
      }

      var originX = this.transformOriginX, originY = this.transformOriginY;
      var scaleX = this.scaleX, scaleY = this.scaleY;

      var transform = getTransform(this);
      transform[0] = scaleX;
      transform[1] = 0;
      transform[2] = this.skew * scaleX;
      transform[3] = scaleY;
      transform[4] = -originX * scaleX;
      transform[5] = -originY * scaleY;
      if (this.rotation) {
        rotate(transform, this.rotation);
      }
      transform[4] += this.x + originX;
      transform[5] += this.y + originY;

      this._isTransformDirty = false;
      return transform;
    },

    set_transform: function(value) {
      // don't operate on the passed in transform to avoid side-effects
      var transform = copyMatrix(tmpTransform, value);


      this.x = transform[4];
      this.y = transform[5];
      transform[4] = transform[5] = 0;

      var a = atan2(transform[1], transform[0]);
      var b = -atan2(transform[2], transform[3]);
      var angle = this.rotation = limitRotation(a > b ? a : b);
      rotate(transform, -angle);

      var scaleX = this.scaleX = transform[0];
      this.scaleY = transform[3];
      this.skew = transform[2] / scaleX;

      this._isTransformDirty = false;
      return copyMatrix(getTransform(this), value);
    },

    set_transformOriginX: function(value, previousValue) {
      this._isTransformDirty = value !== previousValue;
      return value;
    },

    set_transformOriginY: function(value, previousValue) {
      this._isTransformDirty = value !== previousValue;
      return value;
    },

    set_transformOrigin: function(value) {
      var x = value[0], y = value[1];
      this._isTransformDirty = x !== this.transformOriginX || y !== this.transformOriginY;
      this.transformOriginX = x;
      this.transformOriginY = y;
    }
  };

  // avoid array allocations when setting transforms
  var tmpTransform = [];

  function limitRotation(angle) {
    return angle < 0 ? angle % PI_2 + PI_2 : angle % PI_2;
  }

  function getTransform(attributes) {
    return attributes.transform || (attributes.transform = [1, 0, 0, 1, 0, 0]);
  }

  function rotate(transform, angle) {
    mat2d.rotate(transform, transform, -angle); // glmatrix rotates counter-clockwise
  }

  return DisplayObjectAttributes;
});
