(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ArcGISTiledMapServiceSource = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = Point;

/**
 * A standalone point geometry with useful accessor, comparison, and
 * modification methods.
 *
 * @class Point
 * @param {Number} x the x-coordinate. this could be longitude or screen
 * pixels, or any other sort of unit.
 * @param {Number} y the y-coordinate. this could be latitude or screen
 * pixels, or any other sort of unit.
 * @example
 * var point = new Point(-77, 38);
 */
function Point(x, y) {
    this.x = x;
    this.y = y;
}

Point.prototype = {

    /**
     * Clone this point, returning a new point that can be modified
     * without affecting the old one.
     * @return {Point} the clone
     */
    clone: function() { return new Point(this.x, this.y); },

    /**
     * Add this point's x & y coordinates to another point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    add:     function(p) { return this.clone()._add(p); },

    /**
     * Subtract this point's x & y coordinates to from point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    sub:     function(p) { return this.clone()._sub(p); },

    /**
     * Multiply this point's x & y coordinates by point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    multByPoint:    function(p) { return this.clone()._multByPoint(p); },

    /**
     * Divide this point's x & y coordinates by point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    divByPoint:     function(p) { return this.clone()._divByPoint(p); },

    /**
     * Multiply this point's x & y coordinates by a factor,
     * yielding a new point.
     * @param {Point} k factor
     * @return {Point} output point
     */
    mult:    function(k) { return this.clone()._mult(k); },

    /**
     * Divide this point's x & y coordinates by a factor,
     * yielding a new point.
     * @param {Point} k factor
     * @return {Point} output point
     */
    div:     function(k) { return this.clone()._div(k); },

    /**
     * Rotate this point around the 0, 0 origin by an angle a,
     * given in radians
     * @param {Number} a angle to rotate around, in radians
     * @return {Point} output point
     */
    rotate:  function(a) { return this.clone()._rotate(a); },

    /**
     * Rotate this point around p point by an angle a,
     * given in radians
     * @param {Number} a angle to rotate around, in radians
     * @param {Point} p Point to rotate around
     * @return {Point} output point
     */
    rotateAround:  function(a,p) { return this.clone()._rotateAround(a,p); },

    /**
     * Multiply this point by a 4x1 transformation matrix
     * @param {Array<Number>} m transformation matrix
     * @return {Point} output point
     */
    matMult: function(m) { return this.clone()._matMult(m); },

    /**
     * Calculate this point but as a unit vector from 0, 0, meaning
     * that the distance from the resulting point to the 0, 0
     * coordinate will be equal to 1 and the angle from the resulting
     * point to the 0, 0 coordinate will be the same as before.
     * @return {Point} unit vector point
     */
    unit:    function() { return this.clone()._unit(); },

    /**
     * Compute a perpendicular point, where the new y coordinate
     * is the old x coordinate and the new x coordinate is the old y
     * coordinate multiplied by -1
     * @return {Point} perpendicular point
     */
    perp:    function() { return this.clone()._perp(); },

    /**
     * Return a version of this point with the x & y coordinates
     * rounded to integers.
     * @return {Point} rounded point
     */
    round:   function() { return this.clone()._round(); },

    /**
     * Return the magitude of this point: this is the Euclidean
     * distance from the 0, 0 coordinate to this point's x and y
     * coordinates.
     * @return {Number} magnitude
     */
    mag: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },

    /**
     * Judge whether this point is equal to another point, returning
     * true or false.
     * @param {Point} other the other point
     * @return {boolean} whether the points are equal
     */
    equals: function(other) {
        return this.x === other.x &&
               this.y === other.y;
    },

    /**
     * Calculate the distance from this point to another point
     * @param {Point} p the other point
     * @return {Number} distance
     */
    dist: function(p) {
        return Math.sqrt(this.distSqr(p));
    },

    /**
     * Calculate the distance from this point to another point,
     * without the square root step. Useful if you're comparing
     * relative distances.
     * @param {Point} p the other point
     * @return {Number} distance
     */
    distSqr: function(p) {
        var dx = p.x - this.x,
            dy = p.y - this.y;
        return dx * dx + dy * dy;
    },

    /**
     * Get the angle from the 0, 0 coordinate to this point, in radians
     * coordinates.
     * @return {Number} angle
     */
    angle: function() {
        return Math.atan2(this.y, this.x);
    },

    /**
     * Get the angle from this point to another point, in radians
     * @param {Point} b the other point
     * @return {Number} angle
     */
    angleTo: function(b) {
        return Math.atan2(this.y - b.y, this.x - b.x);
    },

    /**
     * Get the angle between this point and another point, in radians
     * @param {Point} b the other point
     * @return {Number} angle
     */
    angleWith: function(b) {
        return this.angleWithSep(b.x, b.y);
    },

    /*
     * Find the angle of the two vectors, solving the formula for
     * the cross product a x b = |a||b|sin(θ) for θ.
     * @param {Number} x the x-coordinate
     * @param {Number} y the y-coordinate
     * @return {Number} the angle in radians
     */
    angleWithSep: function(x, y) {
        return Math.atan2(
            this.x * y - this.y * x,
            this.x * x + this.y * y);
    },

    _matMult: function(m) {
        var x = m[0] * this.x + m[1] * this.y,
            y = m[2] * this.x + m[3] * this.y;
        this.x = x;
        this.y = y;
        return this;
    },

    _add: function(p) {
        this.x += p.x;
        this.y += p.y;
        return this;
    },

    _sub: function(p) {
        this.x -= p.x;
        this.y -= p.y;
        return this;
    },

    _mult: function(k) {
        this.x *= k;
        this.y *= k;
        return this;
    },

    _div: function(k) {
        this.x /= k;
        this.y /= k;
        return this;
    },

    _multByPoint: function(p) {
        this.x *= p.x;
        this.y *= p.y;
        return this;
    },

    _divByPoint: function(p) {
        this.x /= p.x;
        this.y /= p.y;
        return this;
    },

    _unit: function() {
        this._div(this.mag());
        return this;
    },

    _perp: function() {
        var y = this.y;
        this.y = this.x;
        this.x = -y;
        return this;
    },

    _rotate: function(angle) {
        var cos = Math.cos(angle),
            sin = Math.sin(angle),
            x = cos * this.x - sin * this.y,
            y = sin * this.x + cos * this.y;
        this.x = x;
        this.y = y;
        return this;
    },

    _rotateAround: function(angle, p) {
        var cos = Math.cos(angle),
            sin = Math.sin(angle),
            x = p.x + cos * (this.x - p.x) - sin * (this.y - p.y),
            y = p.y + sin * (this.x - p.x) + cos * (this.y - p.y);
        this.x = x;
        this.y = y;
        return this;
    },

    _round: function() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
    }
};

/**
 * Construct a point from an array if necessary, otherwise if the input
 * is already a Point, or an unknown type, return it unchanged
 * @param {Array<Number>|Point|*} a any kind of input value
 * @return {Point} constructed point, or passed-through value.
 * @example
 * // this
 * var point = Point.convert([0, 1]);
 * // is equivalent to
 * var point = new Point(0, 1);
 */
Point.convert = function (a) {
    if (a instanceof Point) {
        return a;
    }
    if (Array.isArray(a)) {
        return new Point(a[0], a[1]);
    }
    return a;
};

},{}],2:[function(require,module,exports){
var SphericalMercator = (function(){

// Closures including constants and other precalculated values.
var cache = {},
    EPSLN = 1.0e-10,
    D2R = Math.PI / 180,
    R2D = 180 / Math.PI,
    // 900913 properties.
    A = 6378137.0,
    MAXEXTENT = 20037508.342789244;

function isFloat(n){
    return Number(n) === n && n % 1 !== 0;
}

// SphericalMercator constructor: precaches calculations
// for fast tile lookups.
function SphericalMercator(options) {
    options = options || {};
    this.size = options.size || 256;
    if (!cache[this.size]) {
        var size = this.size;
        var c = cache[this.size] = {};
        c.Bc = [];
        c.Cc = [];
        c.zc = [];
        c.Ac = [];
        for (var d = 0; d < 30; d++) {
            c.Bc.push(size / 360);
            c.Cc.push(size / (2 * Math.PI));
            c.zc.push(size / 2);
            c.Ac.push(size);
            size *= 2;
        }
    }
    this.Bc = cache[this.size].Bc;
    this.Cc = cache[this.size].Cc;
    this.zc = cache[this.size].zc;
    this.Ac = cache[this.size].Ac;
};

// Convert lon lat to screen pixel value
//
// - `ll` {Array} `[lon, lat]` array of geographic coordinates.
// - `zoom` {Number} zoom level.
SphericalMercator.prototype.px = function(ll, zoom) {
  if (isFloat(zoom)) {
    var size = this.size * Math.pow(2, zoom);
    var d = size / 2;
    var bc = (size / 360);
    var cc = (size / (2 * Math.PI));
    var ac = size;
    var f = Math.min(Math.max(Math.sin(D2R * ll[1]), -0.9999), 0.9999);
    var x = d + ll[0] * bc;
    var y = d + 0.5 * Math.log((1 + f) / (1 - f)) * -cc;
    (x > ac) && (x = ac);
    (y > ac) && (y = ac);
    //(x < 0) && (x = 0);
    //(y < 0) && (y = 0);
    return [x, y];
  } else {
    var d = this.zc[zoom];
    var f = Math.min(Math.max(Math.sin(D2R * ll[1]), -0.9999), 0.9999);
    var x = Math.round(d + ll[0] * this.Bc[zoom]);
    var y = Math.round(d + 0.5 * Math.log((1 + f) / (1 - f)) * (-this.Cc[zoom]));
    (x > this.Ac[zoom]) && (x = this.Ac[zoom]);
    (y > this.Ac[zoom]) && (y = this.Ac[zoom]);
    //(x < 0) && (x = 0);
    //(y < 0) && (y = 0);
    return [x, y];
  }
};

// Convert screen pixel value to lon lat
//
// - `px` {Array} `[x, y]` array of geographic coordinates.
// - `zoom` {Number} zoom level.
SphericalMercator.prototype.ll = function(px, zoom) {
  if (isFloat(zoom)) {
    var size = this.size * Math.pow(2, zoom);
    var bc = (size / 360);
    var cc = (size / (2 * Math.PI));
    var zc = size / 2;
    var g = (px[1] - zc) / -cc;
    var lon = (px[0] - zc) / bc;
    var lat = R2D * (2 * Math.atan(Math.exp(g)) - 0.5 * Math.PI);
    return [lon, lat];
  } else {
    var g = (px[1] - this.zc[zoom]) / (-this.Cc[zoom]);
    var lon = (px[0] - this.zc[zoom]) / this.Bc[zoom];
    var lat = R2D * (2 * Math.atan(Math.exp(g)) - 0.5 * Math.PI);
    return [lon, lat];
  }
};

// Convert tile xyz value to bbox of the form `[w, s, e, n]`
//
// - `x` {Number} x (longitude) number.
// - `y` {Number} y (latitude) number.
// - `zoom` {Number} zoom.
// - `tms_style` {Boolean} whether to compute using tms-style.
// - `srs` {String} projection for resulting bbox (WGS84|900913).
// - `return` {Array} bbox array of values in form `[w, s, e, n]`.
SphericalMercator.prototype.bbox = function(x, y, zoom, tms_style, srs) {
    // Convert xyz into bbox with srs WGS84
    if (tms_style) {
        y = (Math.pow(2, zoom) - 1) - y;
    }
    // Use +y to make sure it's a number to avoid inadvertent concatenation.
    var ll = [x * this.size, (+y + 1) * this.size]; // lower left
    // Use +x to make sure it's a number to avoid inadvertent concatenation.
    var ur = [(+x + 1) * this.size, y * this.size]; // upper right
    var bbox = this.ll(ll, zoom).concat(this.ll(ur, zoom));

    // If web mercator requested reproject to 900913.
    if (srs === '900913') {
        return this.convert(bbox, '900913');
    } else {
        return bbox;
    }
};

// Convert bbox to xyx bounds
//
// - `bbox` {Number} bbox in the form `[w, s, e, n]`.
// - `zoom` {Number} zoom.
// - `tms_style` {Boolean} whether to compute using tms-style.
// - `srs` {String} projection of input bbox (WGS84|900913).
// - `@return` {Object} XYZ bounds containing minX, maxX, minY, maxY properties.
SphericalMercator.prototype.xyz = function(bbox, zoom, tms_style, srs) {
    // If web mercator provided reproject to WGS84.
    if (srs === '900913') {
        bbox = this.convert(bbox, 'WGS84');
    }

    var ll = [bbox[0], bbox[1]]; // lower left
    var ur = [bbox[2], bbox[3]]; // upper right
    var px_ll = this.px(ll, zoom);
    var px_ur = this.px(ur, zoom);
    // Y = 0 for XYZ is the top hence minY uses px_ur[1].
    var x = [ Math.floor(px_ll[0] / this.size), Math.floor((px_ur[0] - 1) / this.size) ];
    var y = [ Math.floor(px_ur[1] / this.size), Math.floor((px_ll[1] - 1) / this.size) ];
    var bounds = {
        minX: Math.min.apply(Math, x) < 0 ? 0 : Math.min.apply(Math, x),
        minY: Math.min.apply(Math, y) < 0 ? 0 : Math.min.apply(Math, y),
        maxX: Math.max.apply(Math, x),
        maxY: Math.max.apply(Math, y)
    };
    if (tms_style) {
        var tms = {
            minY: (Math.pow(2, zoom) - 1) - bounds.maxY,
            maxY: (Math.pow(2, zoom) - 1) - bounds.minY
        };
        bounds.minY = tms.minY;
        bounds.maxY = tms.maxY;
    }
    return bounds;
};

// Convert projection of given bbox.
//
// - `bbox` {Number} bbox in the form `[w, s, e, n]`.
// - `to` {String} projection of output bbox (WGS84|900913). Input bbox
//   assumed to be the "other" projection.
// - `@return` {Object} bbox with reprojected coordinates.
SphericalMercator.prototype.convert = function(bbox, to) {
    if (to === '900913') {
        return this.forward(bbox.slice(0, 2)).concat(this.forward(bbox.slice(2,4)));
    } else {
        return this.inverse(bbox.slice(0, 2)).concat(this.inverse(bbox.slice(2,4)));
    }
};

// Convert lon/lat values to 900913 x/y.
SphericalMercator.prototype.forward = function(ll) {
    var xy = [
        A * ll[0] * D2R,
        A * Math.log(Math.tan((Math.PI*0.25) + (0.5 * ll[1] * D2R)))
    ];
    // if xy value is beyond maxextent (e.g. poles), return maxextent.
    (xy[0] > MAXEXTENT) && (xy[0] = MAXEXTENT);
    (xy[0] < -MAXEXTENT) && (xy[0] = -MAXEXTENT);
    (xy[1] > MAXEXTENT) && (xy[1] = MAXEXTENT);
    (xy[1] < -MAXEXTENT) && (xy[1] = -MAXEXTENT);
    return xy;
};

// Convert 900913 x/y values to lon/lat.
SphericalMercator.prototype.inverse = function(xy) {
    return [
        (xy[0] * R2D / A),
        ((Math.PI*0.5) - 2.0 * Math.atan(Math.exp(-xy[1] / A))) * R2D
    ];
};

return SphericalMercator;

})();

if (typeof module !== 'undefined' && typeof exports !== 'undefined') {
    module.exports = exports = SphericalMercator;
}

},{}],3:[function(require,module,exports){
/*
 * Copyright (C) 2008 Apple Inc. All Rights Reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE INC. OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * Ported from Webkit
 * http://svn.webkit.org/repository/webkit/trunk/Source/WebCore/platform/graphics/UnitBezier.h
 */

module.exports = UnitBezier;

function UnitBezier(p1x, p1y, p2x, p2y) {
    // Calculate the polynomial coefficients, implicit first and last control points are (0,0) and (1,1).
    this.cx = 3.0 * p1x;
    this.bx = 3.0 * (p2x - p1x) - this.cx;
    this.ax = 1.0 - this.cx - this.bx;

    this.cy = 3.0 * p1y;
    this.by = 3.0 * (p2y - p1y) - this.cy;
    this.ay = 1.0 - this.cy - this.by;

    this.p1x = p1x;
    this.p1y = p2y;
    this.p2x = p2x;
    this.p2y = p2y;
}

UnitBezier.prototype.sampleCurveX = function(t) {
    // `ax t^3 + bx t^2 + cx t' expanded using Horner's rule.
    return ((this.ax * t + this.bx) * t + this.cx) * t;
};

UnitBezier.prototype.sampleCurveY = function(t) {
    return ((this.ay * t + this.by) * t + this.cy) * t;
};

UnitBezier.prototype.sampleCurveDerivativeX = function(t) {
    return (3.0 * this.ax * t + 2.0 * this.bx) * t + this.cx;
};

UnitBezier.prototype.solveCurveX = function(x, epsilon) {
    if (typeof epsilon === 'undefined') epsilon = 1e-6;

    var t0, t1, t2, x2, i;

    // First try a few iterations of Newton's method -- normally very fast.
    for (t2 = x, i = 0; i < 8; i++) {

        x2 = this.sampleCurveX(t2) - x;
        if (Math.abs(x2) < epsilon) return t2;

        var d2 = this.sampleCurveDerivativeX(t2);
        if (Math.abs(d2) < 1e-6) break;

        t2 = t2 - x2 / d2;
    }

    // Fall back to the bisection method for reliability.
    t0 = 0.0;
    t1 = 1.0;
    t2 = x;

    if (t2 < t0) return t0;
    if (t2 > t1) return t1;

    while (t0 < t1) {

        x2 = this.sampleCurveX(t2);
        if (Math.abs(x2 - x) < epsilon) return t2;

        if (x > x2) {
            t0 = t2;
        } else {
            t1 = t2;
        }

        t2 = (t1 - t0) * 0.5 + t0;
    }

    // Failure.
    return t2;
};

UnitBezier.prototype.solve = function(x, epsilon) {
    return this.sampleCurveY(this.solveCurveX(x, epsilon));
};

},{}],4:[function(require,module,exports){
'use strict';//      

/**
 * A coordinate is a column, row, zoom combination, often used
 * as the data component of a tile.
 *
 * @param {number} column
 * @param {number} row
 * @param {number} zoom
 * @private
 */
var Coordinate = function Coordinate(column    , row    , zoom    ) {
    this.column = column;
    this.row = row;
    this.zoom = zoom;
};

/**
 * Create a clone of this coordinate that can be mutated without
 * changing the original coordinate
 *
 * @returns {Coordinate} clone
 * @private
 * var coord = new Coordinate(0, 0, 0);
 * var c2 = coord.clone();
 * // since coord is cloned, modifying a property of c2 does
 * // not modify it.
 * c2.zoom = 2;
 */
Coordinate.prototype.clone = function clone () {
    return new Coordinate(this.column, this.row, this.zoom);
};

/**
 * Zoom this coordinate to a given zoom level. This returns a new
 * coordinate object, not mutating the old one.
 *
 * @param {number} zoom
 * @returns {Coordinate} zoomed coordinate
 * @private
 * @example
 * var coord = new Coordinate(0, 0, 0);
 * var c2 = coord.zoomTo(1);
 * c2 // equals new Coordinate(0, 0, 1);
 */
Coordinate.prototype.zoomTo = function zoomTo (zoom    ) { return this.clone()._zoomTo(zoom); };

/**
 * Subtract the column and row values of this coordinate from those
 * of another coordinate. The other coordinat will be zoomed to the
 * same level as `this` before the subtraction occurs
 *
 * @param {Coordinate} c other coordinate
 * @returns {Coordinate} result
 * @private
 */
Coordinate.prototype.sub = function sub (c        ) { return this.clone()._sub(c); };

Coordinate.prototype._zoomTo = function _zoomTo (zoom    ) {
    var scale = Math.pow(2, zoom - this.zoom);
    this.column *= scale;
    this.row *= scale;
    this.zoom = zoom;
    return this;
};

Coordinate.prototype._sub = function _sub (c        ) {
    c = c.zoomTo(this.zoom);
    this.column -= c.column;
    this.row -= c.row;
    return this;
};

module.exports = Coordinate;

},{}],5:[function(require,module,exports){
'use strict';//      

var wrap = require('../util/util').wrap;

/**
 * A `LngLat` object represents a given longitude and latitude coordinate, measured in degrees.
 *
 * Mapbox GL uses longitude, latitude coordinate order (as opposed to latitude, longitude) to match GeoJSON.
 *
 * Note that any Mapbox GL method that accepts a `LngLat` object as an argument or option
 * can also accept an `Array` of two numbers and will perform an implicit conversion.
 * This flexible type is documented as {@link LngLatLike}.
 *
 * @param {number} lng Longitude, measured in degrees.
 * @param {number} lat Latitude, measured in degrees.
 * @example
 * var ll = new mapboxgl.LngLat(-73.9749, 40.7736);
 * @see [Get coordinates of the mouse pointer](https://www.mapbox.com/mapbox-gl-js/example/mouse-position/)
 * @see [Display a popup](https://www.mapbox.com/mapbox-gl-js/example/popup/)
 * @see [Highlight features within a bounding box](https://www.mapbox.com/mapbox-gl-js/example/using-box-queryrenderedfeatures/)
 * @see [Create a timeline animation](https://www.mapbox.com/mapbox-gl-js/example/timeline-animation/)
 */
var LngLat = function LngLat(lng    , lat    ) {
    if (isNaN(lng) || isNaN(lat)) {
        throw new Error(("Invalid LngLat object: (" + lng + ", " + lat + ")"));
    }
    this.lng = +lng;
    this.lat = +lat;
    if (this.lat > 90 || this.lat < -90) {
        throw new Error('Invalid LngLat latitude value: must be between -90 and 90');
    }
};

/**
 * Returns a new `LngLat` object whose longitude is wrapped to the range (-180, 180).
 *
 * @returns {LngLat} The wrapped `LngLat` object.
 * @example
 * var ll = new mapboxgl.LngLat(286.0251, 40.7736);
 * var wrapped = ll.wrap();
 * wrapped.lng; // = -73.9749
 */
LngLat.prototype.wrap = function wrap$1 () {
    return new LngLat(wrap(this.lng, -180, 180), this.lat);
};

/**
 * Returns the coordinates represented as an array of two numbers.
 *
 * @returns {Array<number>} The coordinates represeted as an array of longitude and latitude.
 * @example
 * var ll = new mapboxgl.LngLat(-73.9749, 40.7736);
 * ll.toArray(); // = [-73.9749, 40.7736]
 */
LngLat.prototype.toArray = function toArray () {
    return [this.lng, this.lat];
};

/**
 * Returns the coordinates represent as a string.
 *
 * @returns {string} The coordinates represented as a string of the format `'LngLat(lng, lat)'`.
 * @example
 * var ll = new mapboxgl.LngLat(-73.9749, 40.7736);
 * ll.toString(); // = "LngLat(-73.9749, 40.7736)"
 */
LngLat.prototype.toString = function toString () {
    return ("LngLat(" + (this.lng) + ", " + (this.lat) + ")");
};

/**
 * Returns a `LngLatBounds` from the coordinates extended by a given `radius`.
 *
 * @param {number} radius Distance in meters from the coordinates to extend the bounds.
 * @returns {LngLatBounds} A new `LngLatBounds` object representing the coordinates extended by the `radius`.
 * @example
 * var ll = new mapboxgl.LngLat(-73.9749, 40.7736);
 * ll.toBounds(100).toArray(); // = [[-73.97501862141328, 40.77351016847229], [-73.97478137858673, 40.77368983152771]]
 */
LngLat.prototype.toBounds = function toBounds (radius    ) {
    var earthCircumferenceInMetersAtEquator = 40075017;
    var latAccuracy = 360 * radius / earthCircumferenceInMetersAtEquator,
        lngAccuracy = latAccuracy / Math.cos((Math.PI / 180) * this.lat);

    var LngLatBounds = require('./lng_lat_bounds');
    return new LngLatBounds(new LngLat(this.lng - lngAccuracy, this.lat - latAccuracy),
        new LngLat(this.lng + lngAccuracy, this.lat + latAccuracy));
};

/**
 * Converts an array of two numbers to a `LngLat` object.
 *
 * If a `LngLat` object is passed in, the function returns it unchanged.
 *
 * @param {LngLatLike} input An array of two numbers to convert, or a `LngLat` object to return.
 * @returns {LngLat} A new `LngLat` object, if a conversion occurred, or the original `LngLat` object.
 * @example
 * var arr = [-73.9749, 40.7736];
 * var ll = mapboxgl.LngLat.convert(arr);
 * ll;   // = LngLat {lng: -73.9749, lat: 40.7736}
 */
LngLat.convert = function convert (input        )     {
    if (input instanceof LngLat) {
        return input;
    }
    if (Array.isArray(input) && (input.length === 2 || input.length === 3)) {
        return new LngLat(Number(input[0]), Number(input[1]));
    }
    if (!Array.isArray(input) && typeof input === 'object' && input !== null) {
        return new LngLat(Number(input.lng), Number(input.lat));
    }
    throw new Error("`LngLatLike` argument must be specified as a LngLat instance, an object {lng: <lng>, lat: <lat>}, or an array of [<lng>, <lat>]");
};

/**
 * A {@link LngLat} object, an array of two numbers representing longitude and latitude,
 * or an object with `lng` and `lat` properties.
 *
 * @typedef {LngLat | {lng: number, lat: number} | [number, number]} LngLatLike
 * @example
 * var v1 = new mapboxgl.LngLat(-122.420679, 37.772537);
 * var v2 = [-122.420679, 37.772537];
 */
                                                                                

module.exports = LngLat;

},{"../util/util":13,"./lng_lat_bounds":6}],6:[function(require,module,exports){
'use strict';//      

var LngLat = require('./lng_lat');

                                          

/**
 * A `LngLatBounds` object represents a geographical bounding box,
 * defined by its southwest and northeast points in longitude and latitude.
 *
 * If no arguments are provided to the constructor, a `null` bounding box is created.
 *
 * Note that any Mapbox GL method that accepts a `LngLatBounds` object as an argument or option
 * can also accept an `Array` of two {@link LngLatLike} constructs and will perform an implicit conversion.
 * This flexible type is documented as {@link LngLatBoundsLike}.
 *
 * @param {LngLatLike} [sw] The southwest corner of the bounding box.
 * @param {LngLatLike} [ne] The northeast corner of the bounding box.
 * @example
 * var sw = new mapboxgl.LngLat(-73.9876, 40.7661);
 * var ne = new mapboxgl.LngLat(-73.9397, 40.8002);
 * var llb = new mapboxgl.LngLatBounds(sw, ne);
 */
var LngLatBounds = function LngLatBounds(sw , ne ) {
    if (!sw) {
        return;
    } else if (ne) {
        this.setSouthWest(sw).setNorthEast(ne);
    } else if (sw.length === 4) {
        this.setSouthWest([sw[0], sw[1]]).setNorthEast([sw[2], sw[3]]);
    } else {
        this.setSouthWest(sw[0]).setNorthEast(sw[1]);
    }
};

/**
 * Set the northeast corner of the bounding box
 *
 * @param {LngLatLike} ne
 * @returns {LngLatBounds} `this`
 */
LngLatBounds.prototype.setNorthEast = function setNorthEast (ne        ) {
    this._ne = ne instanceof LngLat ? new LngLat(ne.lng, ne.lat) : LngLat.convert(ne);
    return this;
};

/**
 * Set the southwest corner of the bounding box
 *
 * @param {LngLatLike} sw
 * @returns {LngLatBounds} `this`
 */
LngLatBounds.prototype.setSouthWest = function setSouthWest (sw        ) {
    this._sw = sw instanceof LngLat ? new LngLat(sw.lng, sw.lat) : LngLat.convert(sw);
    return this;
};

/**
 * Extend the bounds to include a given LngLat or LngLatBounds.
 *
 * @param {LngLat|LngLatBounds} obj object to extend to
 * @returns {LngLatBounds} `this`
 */
LngLatBounds.prototype.extend = function extend (obj) {
    var sw = this._sw,
        ne = this._ne;
    var sw2, ne2;

    if (obj instanceof LngLat) {
        sw2 = obj;
        ne2 = obj;

    } else if (obj instanceof LngLatBounds) {
        sw2 = obj._sw;
        ne2 = obj._ne;

        if (!sw2 || !ne2) { return this; }

    } else {
        if (Array.isArray(obj)) {
            if (obj.every(Array.isArray)) {
                return this.extend(LngLatBounds.convert(obj));
            } else {
                return this.extend(LngLat.convert(obj));
            }
        }
        return this;
    }

    if (!sw && !ne) {
        this._sw = new LngLat(sw2.lng, sw2.lat);
        this._ne = new LngLat(ne2.lng, ne2.lat);

    } else {
        sw.lng = Math.min(sw2.lng, sw.lng);
        sw.lat = Math.min(sw2.lat, sw.lat);
        ne.lng = Math.max(ne2.lng, ne.lng);
        ne.lat = Math.max(ne2.lat, ne.lat);
    }

    return this;
};

/**
 * Returns the geographical coordinate equidistant from the bounding box's corners.
 *
 * @returns {LngLat} The bounding box's center.
 * @example
 * var llb = new mapboxgl.LngLatBounds([-73.9876, 40.7661], [-73.9397, 40.8002]);
 * llb.getCenter(); // = LngLat {lng: -73.96365, lat: 40.78315}
 */
LngLatBounds.prototype.getCenter = function getCenter ()     {
    return new LngLat((this._sw.lng + this._ne.lng) / 2, (this._sw.lat + this._ne.lat) / 2);
};

/**
 * Returns the southwest corner of the bounding box.
 *
 * @returns {LngLat} The southwest corner of the bounding box.
 */
LngLatBounds.prototype.getSouthWest = function getSouthWest ()     { return this._sw; };

/**
* Returns the northeast corner of the bounding box.
*
* @returns {LngLat} The northeast corner of the bounding box.
 */
LngLatBounds.prototype.getNorthEast = function getNorthEast ()     { return this._ne; };

/**
* Returns the northwest corner of the bounding box.
*
* @returns {LngLat} The northwest corner of the bounding box.
 */
LngLatBounds.prototype.getNorthWest = function getNorthWest ()     { return new LngLat(this.getWest(), this.getNorth()); };

/**
* Returns the southeast corner of the bounding box.
*
* @returns {LngLat} The southeast corner of the bounding box.
 */
LngLatBounds.prototype.getSouthEast = function getSouthEast ()     { return new LngLat(this.getEast(), this.getSouth()); };

/**
* Returns the west edge of the bounding box.
*
* @returns {number} The west edge of the bounding box.
 */
LngLatBounds.prototype.getWest = function getWest ()     { return this._sw.lng; };

/**
* Returns the south edge of the bounding box.
*
* @returns {number} The south edge of the bounding box.
 */
LngLatBounds.prototype.getSouth = function getSouth ()     { return this._sw.lat; };

/**
* Returns the east edge of the bounding box.
*
* @returns {number} The east edge of the bounding box.
 */
LngLatBounds.prototype.getEast = function getEast ()     { return this._ne.lng; };

/**
* Returns the north edge of the bounding box.
*
* @returns {number} The north edge of the bounding box.
 */
LngLatBounds.prototype.getNorth = function getNorth ()     { return this._ne.lat; };

/**
 * Returns the bounding box represented as an array.
 *
 * @returns {Array<Array<number>>} The bounding box represented as an array, consisting of the
 *   southwest and northeast coordinates of the bounding represented as arrays of numbers.
 * @example
 * var llb = new mapboxgl.LngLatBounds([-73.9876, 40.7661], [-73.9397, 40.8002]);
 * llb.toArray(); // = [[-73.9876, 40.7661], [-73.9397, 40.8002]]
 */
LngLatBounds.prototype.toArray = function toArray () {
    return [this._sw.toArray(), this._ne.toArray()];
};

/**
 * Return the bounding box represented as a string.
 *
 * @returns {string} The bounding box represents as a string of the format
 *   `'LngLatBounds(LngLat(lng, lat), LngLat(lng, lat))'`.
 * @example
 * var llb = new mapboxgl.LngLatBounds([-73.9876, 40.7661], [-73.9397, 40.8002]);
 * llb.toString(); // = "LngLatBounds(LngLat(-73.9876, 40.7661), LngLat(-73.9397, 40.8002))"
 */
LngLatBounds.prototype.toString = function toString () {
    return ("LngLatBounds(" + (this._sw.toString()) + ", " + (this._ne.toString()) + ")");
};

/**
 * Converts an array to a `LngLatBounds` object.
 *
 * If a `LngLatBounds` object is passed in, the function returns it unchanged.
 *
 * Internally, the function calls `LngLat#convert` to convert arrays to `LngLat` values.
 *
 * @param {LngLatBoundsLike} input An array of two coordinates to convert, or a `LngLatBounds` object to return.
 * @returns {LngLatBounds} A new `LngLatBounds` object, if a conversion occurred, or the original `LngLatBounds` object.
 * @example
 * var arr = [[-73.9876, 40.7661], [-73.9397, 40.8002]];
 * var llb = mapboxgl.LngLatBounds.convert(arr);
 * llb;   // = LngLatBounds {_sw: LngLat {lng: -73.9876, lat: 40.7661}, _ne: LngLat {lng: -73.9397, lat: 40.8002}}
 */
LngLatBounds.convert = function convert (input              )           {
    if (!input || input instanceof LngLatBounds) { return input; }
    return new LngLatBounds(input);
};

/**
 * A {@link LngLatBounds} object, an array of {@link LngLatLike} objects in [sw, ne] order,
 * or an array of numbers in [west, south, east, north] order.
 *
 * @typedef {LngLatBounds | [LngLatLike, LngLatLike] | [number, number, number, number]} LngLatBoundsLike
 * @example
 * var v1 = new mapboxgl.LngLatBounds(
 *   new mapboxgl.LngLat(-73.9876, 40.7661),
 *   new mapboxgl.LngLat(-73.9397, 40.8002)
 * );
 * var v2 = new mapboxgl.LngLatBounds([-73.9876, 40.7661], [-73.9397, 40.8002])
 * var v3 = [[-73.9876, 40.7661], [-73.9397, 40.8002]];
 */
                                                                                                          

module.exports = LngLatBounds;

},{"./lng_lat":5}],7:[function(require,module,exports){
'use strict';//      

var ref = require('../util/window');
var HTMLImageElement = ref.HTMLImageElement;
var HTMLCanvasElement = ref.HTMLCanvasElement;
var HTMLVideoElement = ref.HTMLVideoElement;
var ImageData = ref.ImageData;

                                         
                                                         

                           
                                                  
                                                    
                           
                                                    
                                                                   
                                                      
                         
                                                    
                                                           
                                                              

                   
                  
                   
              
 

                          
               
                
                      
                       
                      
               
                 

var Texture = function Texture(context     , image          , format           , premultiply      ) {
    this.context = context;

    var width = image.width;
    var height = image.height;
    this.size = [width, height];
    this.format = format;

    this.texture = context.gl.createTexture();
    this.update(image, premultiply);
};

Texture.prototype.update = function update (image          , premultiply      ) {
    var width = image.width;
        var height = image.height;
    this.size = [width, height];

    var ref = this;
        var context = ref.context;
    var gl = context.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    context.pixelStoreUnpack.set(1);

    if (this.format === gl.RGBA && premultiply !== false) {
        context.pixelStoreUnpackPremultiplyAlpha.set(true);
    }

    if (image instanceof HTMLImageElement || image instanceof HTMLCanvasElement || image instanceof HTMLVideoElement || image instanceof ImageData) {
        gl.texImage2D(gl.TEXTURE_2D, 0, this.format, this.format, gl.UNSIGNED_BYTE, image);
    } else {
        gl.texImage2D(gl.TEXTURE_2D, 0, this.format, width, height, 0, this.format, gl.UNSIGNED_BYTE, image.data);
    }
};

Texture.prototype.bind = function bind (filter           , wrap         , minFilter            ) {
    var ref = this;
        var context = ref.context;
    var gl = context.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    if (filter !== this.filter) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter || filter);
        this.filter = filter;
    }

    if (wrap !== this.wrap) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
        this.wrap = wrap;
    }
};

Texture.prototype.destroy = function destroy () {
    var ref = this.context;
        var gl = ref.gl;
    gl.deleteTexture(this.texture);
    this.texture = (null );
};

module.exports = Texture;

},{"../util/window":11}],8:[function(require,module,exports){
'use strict';//      

var LngLatBounds = require('../geo/lng_lat_bounds');
var clamp = require('../util/util').clamp;

                                               

var TileBounds = function TileBounds(bounds                              , minzoom     , maxzoom     ) {
    this.bounds = LngLatBounds.convert(this.validateBounds(bounds));
    this.minzoom = minzoom || 0;
    this.maxzoom = maxzoom || 24;
};

TileBounds.prototype.validateBounds = function validateBounds (bounds                              ) {
    // make sure the bounds property contains valid longitude and latitudes
    if (!Array.isArray(bounds) || bounds.length !== 4) { return [-180, -90, 180, 90]; }
    return [Math.max(-180, bounds[0]), Math.max(-90, bounds[1]), Math.min(180, bounds[2]), Math.min(90, bounds[3])];
};

TileBounds.prototype.contains = function contains (tileID             ) {
    var level = {
        minX: Math.floor(this.lngX(this.bounds.getWest(), tileID.z)),
        minY: Math.floor(this.latY(this.bounds.getNorth(), tileID.z)),
        maxX: Math.ceil(this.lngX(this.bounds.getEast(), tileID.z)),
        maxY: Math.ceil(this.latY(this.bounds.getSouth(), tileID.z))
    };
    var hit = tileID.x >= level.minX && tileID.x < level.maxX && tileID.y >= level.minY && tileID.y < level.maxY;
    return hit;
};

TileBounds.prototype.lngX = function lngX (lng    , zoom    ) {
    return (lng + 180) * (Math.pow(2, zoom) / 360);
};

TileBounds.prototype.latY = function latY (lat    , zoom    ) {
    var f = clamp(Math.sin(Math.PI / 180 * lat), -0.9999, 0.9999);
    var scale = Math.pow(2, zoom) / (2 * Math.PI);
    return Math.pow(2, zoom - 1) + 0.5 * Math.log((1 + f) / (1 - f)) * -scale;
};

module.exports = TileBounds;

},{"../geo/lng_lat_bounds":6,"../util/util":13}],9:[function(require,module,exports){
'use strict';//      

var window = require('./window');

                                                  

/**
 * The type of a resource.
 * @private
 * @readonly
 * @enum {string}
 */
var ResourceType = {
    Unknown: 'Unknown',
    Style: 'Style',
    Source: 'Source',
    Tile: 'Tile',
    Glyphs: 'Glyphs',
    SpriteImage: 'SpriteImage',
    SpriteJSON: 'SpriteJSON',
    Image: 'Image'
};
exports.ResourceType = ResourceType;

if (typeof Object.freeze == 'function') {
    Object.freeze(ResourceType);
}

/**
 * A `RequestParameters` object to be returned from Map.options.transformRequest callbacks.
 * @typedef {Object} RequestParameters
 * @property {string} url The URL to be requested.
 * @property {Object} headers The headers to be sent with the request.
 * @property {string} credentials `'same-origin'|'include'` Use 'include' to send cookies with cross-origin requests.
 */
                                 
                
                     
                                           
  

var AJAXError = (function (Error) {
  function AJAXError(message        , status        ) {
        Error.call(this, message);
        this.status = status;
    }

  if ( Error ) AJAXError.__proto__ = Error;
  AJAXError.prototype = Object.create( Error && Error.prototype );
  AJAXError.prototype.constructor = AJAXError;

  return AJAXError;
}(Error));

function makeRequest(requestParameters                   )                 {
    var xhr                 = new window.XMLHttpRequest();

    xhr.open('GET', requestParameters.url, true);
    for (var k in requestParameters.headers) {
        xhr.setRequestHeader(k, requestParameters.headers[k]);
    }
    xhr.withCredentials = requestParameters.credentials === 'include';
    return xhr;
}

exports.getJSON = function(requestParameters                   , callback                 ) {
    var xhr = makeRequest(requestParameters);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.onerror = function() {
        callback(new Error(xhr.statusText));
    };
    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300 && xhr.response) {
            var data;
            try {
                data = JSON.parse(xhr.response);
            } catch (err) {
                return callback(err);
            }
            callback(null, data);
        } else {
            callback(new AJAXError(xhr.statusText, xhr.status));
        }
    };
    xhr.send();
    return xhr;
};

exports.getArrayBuffer = function(requestParameters                   , callback                                                                        ) {
    var xhr = makeRequest(requestParameters);
    xhr.responseType = 'arraybuffer';
    xhr.onerror = function() {
        callback(new Error(xhr.statusText));
    };
    xhr.onload = function() {
        var response              = xhr.response;
        if (response.byteLength === 0 && xhr.status === 200) {
            return callback(new Error('http status 200 returned without content.'));
        }
        if (xhr.status >= 200 && xhr.status < 300 && xhr.response) {
            callback(null, {
                data: response,
                cacheControl: xhr.getResponseHeader('Cache-Control'),
                expires: xhr.getResponseHeader('Expires')
            });
        } else {
            callback(new AJAXError(xhr.statusText, xhr.status));
        }
    };
    xhr.send();
    return xhr;
};

function sameOrigin(url) {
    var a                    = window.document.createElement('a');
    a.href = url;
    return a.protocol === window.document.location.protocol && a.host === window.document.location.host;
}

var transparentPngUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII=';

exports.getImage = function(requestParameters                   , callback                            ) {
    // request the image with XHR to work around caching issues
    // see https://github.com/mapbox/mapbox-gl-js/issues/1470
    return exports.getArrayBuffer(requestParameters, function (err, imgData) {
        if (err) {
            callback(err);
        } else if (imgData) {
            var img                   = new window.Image();
            var URL = window.URL || window.webkitURL;
            img.onload = function () {
                callback(null, img);
                URL.revokeObjectURL(img.src);
            };
            var blob       = new window.Blob([new Uint8Array(imgData.data)], { type: 'image/png' });
            (img     ).cacheControl = imgData.cacheControl;
            (img     ).expires = imgData.expires;
            img.src = imgData.data.byteLength ? URL.createObjectURL(blob) : transparentPngUrl;
        }
    });
};

exports.getVideo = function(urls               , callback                            ) {
    var video                   = window.document.createElement('video');
    video.onloadstart = function() {
        callback(null, video);
    };
    for (var i = 0; i < urls.length; i++) {
        var s                    = window.document.createElement('source');
        if (!sameOrigin(urls[i])) {
            video.crossOrigin = 'Anonymous';
        }
        s.src = urls[i];
        video.appendChild(s);
    }
    return video;
};

},{"./window":11}],10:[function(require,module,exports){
'use strict';//      

var window = require('./window');

var now = window.performance && window.performance.now ?
    window.performance.now.bind(window.performance) :
    Date.now.bind(Date);

var frame = window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame;

var cancel = window.cancelAnimationFrame ||
    window.mozCancelAnimationFrame ||
    window.webkitCancelAnimationFrame ||
    window.msCancelAnimationFrame;

/**
 * @private
 */
module.exports = {
    /**
     * Provides a function that outputs milliseconds: either performance.now()
     * or a fallback to Date.now()
     */
    now: now,

    frame: function frame$1(fn          ) {
        return frame(fn);
    },

    cancelFrame: function cancelFrame(id        ) {
        return cancel(id);
    },

    getImageData: function getImageData(img                   )            {
        var canvas = window.document.createElement('canvas');
        var context = canvas.getContext('2d');
        if (!context) {
            throw new Error('failed to create canvas 2d context');
        }
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0, img.width, img.height);
        return context.getImageData(0, 0, img.width, img.height);
    },

    hardwareConcurrency: window.navigator.hardwareConcurrency || 4,

    get devicePixelRatio() { return window.devicePixelRatio; },

    supportsWebp: false
};

var webpImgTest = window.document.createElement('img');
webpImgTest.onload = function() {
    module.exports.supportsWebp = true;
};
webpImgTest.src = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAQAAAAfQ//73v/+BiOh/AAA=';

},{"./window":11}],11:[function(require,module,exports){
'use strict';//      

/* eslint-env browser */
module.exports = (self        );

},{}],12:[function(require,module,exports){
'use strict';//      

var util = require('./util');

                                
                                               

function _addEventListener(type        , listener          , listenerList           ) {
    listenerList[type] = listenerList[type] || [];
    listenerList[type].push(listener);
}

function _removeEventListener(type        , listener          , listenerList           ) {
    if (listenerList && listenerList[type]) {
        var index = listenerList[type].indexOf(listener);
        if (index !== -1) {
            listenerList[type].splice(index, 1);
        }
    }
}

/**
 * Methods mixed in to other classes for event capabilities.
 *
 * @mixin Evented
 */
var Evented = function Evented () {};

Evented.prototype.on = function on (type   , listener      )   {
    this._listeners = this._listeners || {};
    _addEventListener(type, listener, this._listeners);

    return this;
};

/**
 * Removes a previously registered event listener.
 *
 * @param {string} type The event type to remove listeners for.
 * @param {Function} listener The listener function to remove.
 * @returns {Object} `this`
 */
Evented.prototype.off = function off (type   , listener      ) {
    _removeEventListener(type, listener, this._listeners);
    _removeEventListener(type, listener, this._oneTimeListeners);

    return this;
};

/**
 * Adds a listener that will be called only once to a specified event type.
 *
 * The listener will be called first time the event fires after the listener is registered.
 *
 * @param {string} type The event type to listen for.
 * @param {Function} listener The function to be called when the event is fired the first time.
 * @returns {Object} `this`
 */
Evented.prototype.once = function once (type    , listener      ) {
    this._oneTimeListeners = this._oneTimeListeners || {};
    _addEventListener(type, listener, this._oneTimeListeners);

    return this;
};

/**
 * Fires an event of the specified type.
 *
 * @param {string} type The type of event to fire.
 * @param {Object} [data] Data to be passed to any listeners.
 * @returns {Object} `this`
 */
Evented.prototype.fire = function fire (type    , data     ) {
        var this$1 = this;

    if (this.listens(type)) {
        data = util.extend({}, data, {type: type, target: this});

        // make sure adding or removing listeners inside other listeners won't cause an infinite loop
        var listeners = this._listeners && this._listeners[type] ? this._listeners[type].slice() : [];
        for (var i = 0, list = listeners; i < list.length; i += 1) {
            var listener = list[i];

                listener.call(this$1, data);
        }

        var oneTimeListeners = this._oneTimeListeners && this._oneTimeListeners[type] ? this._oneTimeListeners[type].slice() : [];
        for (var i$1 = 0, list$1 = oneTimeListeners; i$1 < list$1.length; i$1 += 1) {
            var listener$1 = list$1[i$1];

                _removeEventListener(type, listener$1, this$1._oneTimeListeners);
            listener$1.call(this$1, data);
        }

        if (this._eventedParent) {
            this._eventedParent.fire(type, util.extend({}, data, typeof this._eventedParentData === 'function' ? this._eventedParentData() : this._eventedParentData));
        }

    // To ensure that no error events are dropped, print them to the
    // console if they have no listeners.
    } else if (util.endsWith(type, 'error')) {
        console.error((data && data.error) || data || 'Empty error event');
    }

    return this;
};

/**
 * Returns a true if this instance of Evented or any forwardeed instances of Evented have a listener for the specified type.
 *
 * @param {string} type The event type
 * @returns {boolean} `true` if there is at least one registered listener for specified event type, `false` otherwise
 */
Evented.prototype.listens = function listens (type    ) {
    return (
        (this._listeners && this._listeners[type] && this._listeners[type].length > 0) ||
        (this._oneTimeListeners && this._oneTimeListeners[type] && this._oneTimeListeners[type].length > 0) ||
        (this._eventedParent && this._eventedParent.listens(type))
    );
};

/**
 * Bubble all events fired by this instance of Evented to this parent instance of Evented.
 *
 * @private
 * @returns {Object} `this`
 */
Evented.prototype.setEventedParent = function setEventedParent (parent      , data                    ) {
    this._eventedParent = parent;
    this._eventedParentData = data;

    return this;
};

module.exports = Evented;

},{"./util":13}],13:[function(require,module,exports){
'use strict';//      

var UnitBezier = require('@mapbox/unitbezier');
var Coordinate = require('../geo/coordinate');
var Point = require('@mapbox/point-geometry');

                                                

/**
 * @module util
 * @private
 */

/**
 * Given a value `t` that varies between 0 and 1, return
 * an interpolation function that eases between 0 and 1 in a pleasing
 * cubic in-out fashion.
 *
 * @private
 */
exports.easeCubicInOut = function(t        )         {
    if (t <= 0) { return 0; }
    if (t >= 1) { return 1; }
    var t2 = t * t,
        t3 = t2 * t;
    return 4 * (t < 0.5 ? t3 : 3 * (t - t2) + t3 - 0.75);
};

/**
 * Given given (x, y), (x1, y1) control points for a bezier curve,
 * return a function that interpolates along that curve.
 *
 * @param p1x control point 1 x coordinate
 * @param p1y control point 1 y coordinate
 * @param p2x control point 2 x coordinate
 * @param p2y control point 2 y coordinate
 * @private
 */
exports.bezier = function(p1x        , p1y        , p2x        , p2y        )                        {
    var bezier = new UnitBezier(p1x, p1y, p2x, p2y);
    return function(t        ) {
        return bezier.solve(t);
    };
};

/**
 * A default bezier-curve powered easing function with
 * control points (0.25, 0.1) and (0.25, 1)
 *
 * @private
 */
exports.ease = exports.bezier(0.25, 0.1, 0.25, 1);

/**
 * constrain n to the given range via min + max
 *
 * @param n value
 * @param min the minimum value to be returned
 * @param max the maximum value to be returned
 * @returns the clamped value
 * @private
 */
exports.clamp = function (n        , min        , max        )         {
    return Math.min(max, Math.max(min, n));
};

/**
 * constrain n to the given range, excluding the minimum, via modular arithmetic
 *
 * @param n value
 * @param min the minimum value to be returned, exclusive
 * @param max the maximum value to be returned, inclusive
 * @returns constrained number
 * @private
 */
exports.wrap = function (n        , min        , max        )         {
    var d = max - min;
    var w = ((n - min) % d + d) % d + min;
    return (w === min) ? max : w;
};

/*
 * Call an asynchronous function on an array of arguments,
 * calling `callback` with the completed results of all calls.
 *
 * @param array input to each call of the async function.
 * @param fn an async function with signature (data, callback)
 * @param callback a callback run after all async work is done.
 * called with an array, containing the results of each async call.
 * @private
 */
exports.asyncAll = function               (
    array             ,
    fn                                                    ,
    callback                         
) {
    if (!array.length) { return callback(null, []); }
    var remaining = array.length;
    var results = new Array(array.length);
    var error = null;
    array.forEach(function (item, i) {
        fn(item, function (err, result) {
            if (err) { error = err; }
            results[i] = ((result     )        ); // https://github.com/facebook/flow/issues/2123
            if (--remaining === 0) { callback(error, results); }
        });
    });
};

/*
 * Polyfill for Object.values. Not fully spec compliant, but we don't
 * need it to be.
 *
 * @private
 */
exports.values = function   (obj                    )           {
    var result = [];
    for (var k in obj) {
        result.push(obj[k]);
    }
    return result;
};

/*
 * Compute the difference between the keys in one object and the keys
 * in another object.
 *
 * @returns keys difference
 * @private
 */
exports.keysDifference = function      (obj                    , other                    )                {
    var difference = [];
    for (var i in obj) {
        if (!(i in other)) {
            difference.push(i);
        }
    }
    return difference;
};

/**
 * Given a destination object and optionally many source objects,
 * copy all properties from the source objects into the destination.
 * The last source object given overrides properties from previous
 * source objects.
 *
 * @param dest destination object
 * @param sources sources from which properties are pulled
 * @private
 */
exports.extend = function (dest                )         {
    var sources = [], len = arguments.length - 1;
    while ( len-- > 0 ) sources[ len ] = arguments[ len + 1 ];

    for (var i = 0, list = sources; i < list.length; i += 1) {
        var src = list[i];

        for (var k in src) {
            dest[k] = src[k];
        }
    }
    return dest;
};

/**
 * Given an object and a number of properties as strings, return version
 * of that object with only those properties.
 *
 * @param src the object
 * @param properties an array of property names chosen
 * to appear on the resulting object.
 * @returns object with limited properties.
 * @example
 * var foo = { name: 'Charlie', age: 10 };
 * var justName = pick(foo, ['name']);
 * // justName = { name: 'Charlie' }
 * @private
 */
exports.pick = function (src        , properties               )         {
    var result = {};
    for (var i = 0; i < properties.length; i++) {
        var k = properties[i];
        if (k in src) {
            result[k] = src[k];
        }
    }
    return result;
};

var id = 1;

/**
 * Return a unique numeric id, starting at 1 and incrementing with
 * each call.
 *
 * @returns unique numeric id.
 * @private
 */
exports.uniqueId = function ()         {
    return id++;
};

/**
 * Given an array of member function names as strings, replace all of them
 * with bound versions that will always refer to `context` as `this`. This
 * is useful for classes where otherwise event bindings would reassign
 * `this` to the evented object or some other value: this lets you ensure
 * the `this` value always.
 *
 * @param fns list of member function names
 * @param context the context value
 * @example
 * function MyClass() {
 *   bindAll(['ontimer'], this);
 *   this.name = 'Tom';
 * }
 * MyClass.prototype.ontimer = function() {
 *   alert(this.name);
 * };
 * var myClass = new MyClass();
 * setTimeout(myClass.ontimer, 100);
 * @private
 */
exports.bindAll = function(fns               , context        )       {
    fns.forEach(function (fn) {
        if (!context[fn]) { return; }
        context[fn] = context[fn].bind(context);
    });
};

/**
 * Given a list of coordinates, get their center as a coordinate.
 *
 * @returns centerpoint
 * @private
 */
exports.getCoordinatesCenter = function(coords                   )             {
    var minX = Infinity;
    var minY = Infinity;
    var maxX = -Infinity;
    var maxY = -Infinity;

    for (var i = 0; i < coords.length; i++) {
        minX = Math.min(minX, coords[i].column);
        minY = Math.min(minY, coords[i].row);
        maxX = Math.max(maxX, coords[i].column);
        maxY = Math.max(maxY, coords[i].row);
    }

    var dx = maxX - minX;
    var dy = maxY - minY;
    var dMax = Math.max(dx, dy);
    var zoom = Math.max(0, Math.floor(-Math.log(dMax) / Math.LN2));
    return new Coordinate((minX + maxX) / 2, (minY + maxY) / 2, 0)
        .zoomTo(zoom);
};

/**
 * Determine if a string ends with a particular substring
 *
 * @private
 */
exports.endsWith = function(string        , suffix        )          {
    return string.indexOf(suffix, string.length - suffix.length) !== -1;
};

/**
 * Create an object by mapping all the values of an existing object while
 * preserving their keys.
 *
 * @private
 */
exports.mapObject = function(input        , iterator          , context         )         {
    var this$1 = this;

    var output = {};
    for (var key in input) {
        output[key] = iterator.call(context || this$1, input[key], key, input);
    }
    return output;
};

/**
 * Create an object by filtering out values of an existing object.
 *
 * @private
 */
exports.filterObject = function(input        , iterator          , context         )         {
    var this$1 = this;

    var output = {};
    for (var key in input) {
        if (iterator.call(context || this$1, input[key], key, input)) {
            output[key] = input[key];
        }
    }
    return output;
};

/**
 * Deeply compares two object literals.
 *
 * @private
 */
exports.deepEqual = function(a        , b        )          {
    if (Array.isArray(a)) {
        if (!Array.isArray(b) || a.length !== b.length) { return false; }
        for (var i = 0; i < a.length; i++) {
            if (!exports.deepEqual(a[i], b[i])) { return false; }
        }
        return true;
    }
    if (typeof a === 'object' && a !== null && b !== null) {
        if (!(typeof b === 'object')) { return false; }
        var keys = Object.keys(a);
        if (keys.length !== Object.keys(b).length) { return false; }
        for (var key in a) {
            if (!exports.deepEqual(a[key], b[key])) { return false; }
        }
        return true;
    }
    return a === b;
};

/**
 * Deeply clones two objects.
 *
 * @private
 */
exports.clone = function   (input   )    {
    if (Array.isArray(input)) {
        return input.map(exports.clone);
    } else if (typeof input === 'object' && input) {
        return ((exports.mapObject(input, exports.clone)     )   );
    } else {
        return input;
    }
};

/**
 * Check if two arrays have at least one common element.
 *
 * @private
 */
exports.arraysIntersect = function   (a          , b          )          {
    for (var l = 0; l < a.length; l++) {
        if (b.indexOf(a[l]) >= 0) { return true; }
    }
    return false;
};

/**
 * Print a warning message to the console and ensure duplicate warning messages
 * are not printed.
 *
 * @private
 */
var warnOnceHistory                           = {};
exports.warnOnce = function(message        )       {
    if (!warnOnceHistory[message]) {
        // console isn't defined in some WebWorkers, see #2558
        if (typeof console !== "undefined") { console.warn(message); }
        warnOnceHistory[message] = true;
    }
};

/**
 * Indicates if the provided Points are in a counter clockwise (true) or clockwise (false) order
 *
 * @returns true for a counter clockwise set of points
 */
// http://bryceboe.com/2006/10/23/line-segment-intersection-algorithm/
exports.isCounterClockwise = function(a       , b       , c       )          {
    return (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
};

/**
 * Returns the signed area for the polygon ring.  Postive areas are exterior rings and
 * have a clockwise winding.  Negative areas are interior rings and have a counter clockwise
 * ordering.
 *
 * @param ring Exterior or interior ring
 */
exports.calculateSignedArea = function(ring              )         {
    var sum = 0;
    for (var i = 0, len = ring.length, j = len - 1, p1 = (void 0), p2 = (void 0); i < len; j = i++) {
        p1 = ring[i];
        p2 = ring[j];
        sum += (p2.x - p1.x) * (p1.y + p2.y);
    }
    return sum;
};

/**
 * Detects closed polygons, first + last point are equal
 *
 * @param points array of points
 * @return true if the points are a closed polygon
 */
exports.isClosedPolygon = function(points              )          {
    // If it is 2 points that are the same then it is a point
    // If it is 3 points with start and end the same then it is a line
    if (points.length < 4)
        { return false; }

    var p1 = points[0];
    var p2 = points[points.length - 1];

    if (Math.abs(p1.x - p2.x) > 0 ||
        Math.abs(p1.y - p2.y) > 0) {
        return false;
    }

    // polygon simplification can produce polygons with zero area and more than 3 points
    return (Math.abs(exports.calculateSignedArea(points)) > 0.01);
};

/**
 * Converts spherical coordinates to cartesian coordinates.
 *
 * @param spherical Spherical coordinates, in [radial, azimuthal, polar]
 * @return cartesian coordinates in [x, y, z]
 */

exports.sphericalToCartesian = function(ref                          )                                    {
    var r = ref[0];
    var azimuthal = ref[1];
    var polar = ref[2];

    // We abstract "north"/"up" (compass-wise) to be 0° when really this is 90° (π/2):
    // correct for that here
    azimuthal += 90;

    // Convert azimuthal and polar angles to radians
    azimuthal *= Math.PI / 180;
    polar *= Math.PI / 180;

    return {
        x: r * Math.cos(azimuthal) * Math.sin(polar),
        y: r * Math.sin(azimuthal) * Math.sin(polar),
        z: r * Math.cos(polar)
    };
};

/**
 * Parses data from 'Cache-Control' headers.
 *
 * @param cacheControl Value of 'Cache-Control' header
 * @return object containing parsed header info.
 */

exports.parseCacheControl = function(cacheControl        )         {
    // Taken from [Wreck](https://github.com/hapijs/wreck)
    var re = /(?:^|(?:\s*\,\s*))([^\x00-\x20\(\)<>@\,;\:\\"\/\[\]\?\=\{\}\x7F]+)(?:\=(?:([^\x00-\x20\(\)<>@\,;\:\\"\/\[\]\?\=\{\}\x7F]+)|(?:\"((?:[^"\\]|\\.)*)\")))?/g;

    var header = {};
    cacheControl.replace(re, function ($0, $1, $2, $3) {
        var value = $2 || $3;
        header[$1] = value ? value.toLowerCase() : true;
        return '';
    });

    if (header['max-age']) {
        var maxAge = parseInt(header['max-age'], 10);
        if (isNaN(maxAge)) { delete header['max-age']; }
        else { header['max-age'] = maxAge; }
    }

    return header;
};

},{"../geo/coordinate":4,"@mapbox/point-geometry":1,"@mapbox/unitbezier":3}],14:[function(require,module,exports){
//      

var util = require('mapbox-gl/src/util/util');
var ajax = require('mapbox-gl/src/util/ajax');
var Evented = require('mapbox-gl/src/util/evented');
var loadArcGISMapServer = require('./load_arcgis_mapserver');
var TileBounds = require('mapbox-gl/src/source/tile_bounds');
var Texture = require('mapbox-gl/src/render/texture');
var helpers = require('./helpers');

                                                        
                                                                   
                                            
                                                            
                                                  
                                                           

var ArcGISTiledMapServiceSource = (function (Evented) {
    function ArcGISTiledMapServiceSource(id        , options                                                          , dispatcher            , eventedParent         ) {
        Evented.call(this);
        this.id = id;
        this.dispatcher = dispatcher;
        this.setEventedParent(eventedParent);

        this.type = 'arcgisraster';
        this.minzoom = 0;
        this.maxzoom = 22;
        this.roundZoom = true;
        this.tileSize = 512;
        this._loaded = false;

        this._options = util.extend({}, options);
        util.extend(this, util.pick(options, ['url', 'scheme', 'tileSize']));
    }

    if ( Evented ) ArcGISTiledMapServiceSource.__proto__ = Evented;
    ArcGISTiledMapServiceSource.prototype = Object.create( Evented && Evented.prototype );
    ArcGISTiledMapServiceSource.prototype.constructor = ArcGISTiledMapServiceSource;

    ArcGISTiledMapServiceSource.prototype.load = function load () {
        var this$1 = this;

        this.fire('dataloading', {dataType: 'source'});
        loadArcGISMapServer(this._options, function (err, metadata) {
            if (err) {
                this$1.fire('error', err);
            } else if (metadata) {
                util.extend(this$1, metadata);

                if (metadata.bounds) {
                    this$1.tileBounds = new TileBounds(metadata.bounds, this$1.minzoom, this$1.maxzoom);
                }

            // `content` is included here to prevent a race condition where `Style#_updateSources` is called
            // before the TileJSON arrives. this makes sure the tiles needed are loaded once TileJSON arrives
            // ref: https://github.com/mapbox/mapbox-gl-js/pull/4347#discussion_r104418088
            this$1.fire('data', {dataType: 'source', sourceDataType: 'metadata'});
            this$1.fire('data', {dataType: 'source', sourceDataType: 'content'});
            }
        });
    };

    ArcGISTiledMapServiceSource.prototype.onAdd = function onAdd (map     ) {
        // set the urls
        var baseUrl = this.url.split('?')[0];
        this.tileUrl = baseUrl + "/tile/{z}/{y}/{x}";

        var arcgisonline = new RegExp(/tiles.arcgis(online)?\.com/g);
        if (arcgisonline.test(this.url)) {
            this.tileUrl = this.tileUrl.replace('://tiles', '://tiles{s}');
            this.subdomains = ['1', '2', '3', '4'];
        }

        if (this.token) {
            this.tileUrl += (("?token=" + (this.token)));
        }
        
        this.map = map;
        this.load();
    };

    ArcGISTiledMapServiceSource.prototype.serialize = function serialize () {
        return util.extend({}, this._options);
    };

    ArcGISTiledMapServiceSource.prototype.hasTile = function hasTile (tileID                  ) {
        return !this.tileBounds || this.tileBounds.contains(tileID.canonical);
    };

    ArcGISTiledMapServiceSource.prototype.loadTile = function loadTile (tile      , callback                ) {
        var this$1 = this;

        //convert to ags coords
        var tilePoint = { z: tile.tileID.overscaledZ, x: tile.tileID.canonical.x, y: tile.tileID.canonical.y };

        var url =  helpers._template(this.tileUrl, util.extend({
            s: helpers._getSubdomain(tilePoint, this.subdomains),
            z: (this._lodMap && this._lodMap[tilePoint.z]) ? this._lodMap[tilePoint.z] : tilePoint.z, // try lod map first, then just defualt to zoom level
            x: tilePoint.x,
            y: tilePoint.y
        }, this.options));
        tile.request = ajax.getImage({url: url},  function (err, img) {
            delete tile.request;

            if (tile.aborted) {
                tile.state = 'unloaded';
                callback(null);
            } else if (err) {
                tile.state = 'errored';
                callback(err);
            } else if (img) {
                if (this$1.map._refreshExpiredTiles) { tile.setExpiryData(img); }
                delete (img     ).cacheControl;
                delete (img     ).expires;

                var context = this$1.map.painter.context;
                var gl = context.gl;
                tile.texture = this$1.map.painter.getTileTexture(img.width);
                if (tile.texture) {
                    tile.texture.bind(gl.LINEAR, gl.CLAMP_TO_EDGE, gl.LINEAR_MIPMAP_NEAREST);
                    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, img);
                } else {
                    tile.texture = new Texture(context, img, gl.RGBA);
                    tile.texture.bind(gl.LINEAR, gl.CLAMP_TO_EDGE, gl.LINEAR_MIPMAP_NEAREST);

                    if (context.extTextureFilterAnisotropic) {
                        gl.texParameterf(gl.TEXTURE_2D, context.extTextureFilterAnisotropic.TEXTURE_MAX_ANISOTROPY_EXT, context.extTextureFilterAnisotropicMax);
                    }
                }
                gl.generateMipmap(gl.TEXTURE_2D);

                tile.state = 'loaded';

                callback(null);
            }
        });
    };

    ArcGISTiledMapServiceSource.prototype.abortTile = function abortTile (tile      , callback                ) {
        if (tile.request) {
            tile.request.abort();
            delete tile.request;
        }
        callback();
    };

    ArcGISTiledMapServiceSource.prototype.unloadTile = function unloadTile (tile      , callback                ) {
        if (tile.texture) { this.map.painter.saveTileTexture(tile.texture); }
        callback();
    };

    ArcGISTiledMapServiceSource.prototype.hasTransition = function hasTransition () {
        return false;
    };

    return ArcGISTiledMapServiceSource;
}(Evented));

module.exports = ArcGISTiledMapServiceSource;

},{"./helpers":15,"./load_arcgis_mapserver":17,"mapbox-gl/src/render/texture":7,"mapbox-gl/src/source/tile_bounds":8,"mapbox-gl/src/util/ajax":9,"mapbox-gl/src/util/evented":12,"mapbox-gl/src/util/util":13}],15:[function(require,module,exports){

//From https://github.com/Leaflet/Leaflet/blob/master/src/core/Util.js
var _templateRe = /\{ *([\w_]+) *\}/g;
var _template = function (str, data) {
    return str.replace(_templateRe, function (str, key) {
        var value = data[key];

        if (value === undefined) {
            throw new Error(("No value provided for variable " + str));

        } else if (typeof value === 'function') {
            value = value(data);
        }
        return value;
    });
};

//From https://github.com/Leaflet/Leaflet/blob/master/src/layer/tile/TileLayer.js
var _getSubdomain = function (tilePoint, subdomains) {
    if (subdomains) {
        var index = Math.abs(tilePoint.x + tilePoint.y) % subdomains.length;
        return subdomains[index];
    }
    return null;
};

module.exports = {
    _template: _template,
    _getSubdomain: _getSubdomain
};

},{}],16:[function(require,module,exports){
var ArcGISTiledMapServiceSource = require('./arcgis_tiled_map_service_source');
module.exports = ArcGISTiledMapServiceSource;

},{"./arcgis_tiled_map_service_source":14}],17:[function(require,module,exports){
'use strict';
var util = require('mapbox-gl/src/util/util');
var ajax = require('mapbox-gl/src/util/ajax');
var browser = require('mapbox-gl/src/util/browser');
var SphericalMercator = require('@mapbox/sphericalmercator');

//Contains code from esri-leaflet https://github.com/Esri/esri-leaflet
var MercatorZoomLevels = {
    '0': 156543.03392799999,
    '1': 78271.516963999893,
    '2': 39135.758482000099,
    '3': 19567.879240999901,
    '4': 9783.9396204999593,
    '5': 4891.9698102499797,
    '6': 2445.9849051249898,
    '7': 1222.9924525624899,
    '8': 611.49622628138002,
    '9': 305.74811314055802,
    '10': 152.874056570411,
    '11': 76.437028285073197,
    '12': 38.218514142536598,
    '13': 19.109257071268299,
    '14': 9.5546285356341496,
    '15': 4.7773142679493699,
    '16': 2.38865713397468,
    '17': 1.1943285668550501,
    '18': 0.59716428355981699,
    '19': 0.29858214164761698,
    '20': 0.14929107082381,
    '21': 0.07464553541191,
    '22': 0.0373227677059525,
    '23': 0.0186613838529763
};

var _withinPercentage = function (a, b, percentage) {
    var diff = Math.abs((a / b) - 1);
    return diff < percentage;
};

module.exports = function(options, callback) {
    var loaded = function(err, metadata) {
        if (err) {
            return callback(err);
        }

        var result = util.pick(metadata,
            ['tileInfo', 'initialExtent', 'fullExtent', 'spatialReference', 'tileServers', 'documentInfo']);

        result._lodMap = {};
        var zoomOffsetAllowance = 0.1;
        var sr = metadata.spatialReference.latestWkid || metadata.spatialReference.wkid;
        if (sr === 102100 || sr === 3857) {

            /*
            Example extent from ArcGIS REST API
            fullExtent: {
            xmin: -9144791.679226127,
            ymin: -2195190.961437726,
            xmax: -4650987.072019983,
            ymax: 1118113.110155766,
            spatialReference: {
            wkid: 102100,
            wkt: null
            }
            },
            */
            //convert ArcGIS extent to bounds
            var extent = metadata.fullExtent;
            if (extent && extent.spatialReference && extent.spatialReference.wkid ===  102100) {
                var boundsWebMercator = [extent.xmin, extent.ymin, extent.xmax, extent.ymax];
                var merc = new SphericalMercator({
                    size: 256
                });
                var boundsWGS84 = merc.convert(boundsWebMercator);
                result.bounds = boundsWGS84;
            }

            // create the zoom level data
            var arcgisLODs = metadata.tileInfo.lods;
            var correctResolutions = MercatorZoomLevels;
            result.minzoom = arcgisLODs[0].level;
            result.maxzoom = arcgisLODs[arcgisLODs.length - 1].level;
            for (var i = 0; i < arcgisLODs.length; i++) {
                var arcgisLOD = arcgisLODs[i];
                for (var ci in correctResolutions) {
                    var correctRes = correctResolutions[ci];

                    if (_withinPercentage(arcgisLOD.resolution, correctRes, zoomOffsetAllowance)) {
                        result._lodMap[ci] = arcgisLOD.level;
                        break;
                    }
                }
            }
        } else {
            callback(new Error('non-mercator spatial reference'));
        }

        callback(null, result);
    };

    if (options.url) {
        ajax.getJSON({url: options.url}, loaded);
    } else {
        browser.frame(loaded.bind(null, null, options));
    }
};

},{"@mapbox/sphericalmercator":2,"mapbox-gl/src/util/ajax":9,"mapbox-gl/src/util/browser":10,"mapbox-gl/src/util/util":13}]},{},[16])(16)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvQG1hcGJveC9wb2ludC1nZW9tZXRyeS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9AbWFwYm94L3NwaGVyaWNhbG1lcmNhdG9yL3NwaGVyaWNhbG1lcmNhdG9yLmpzIiwibm9kZV9tb2R1bGVzL0BtYXBib3gvdW5pdGJlemllci9pbmRleC5qcyIsIi9Vc2Vycy9rcmlzL2Rldi9tYXBodWJzL21hcGJveC1nbC1hcmNnaXMtdGlsZWQtbWFwLXNlcnZpY2Uvbm9kZV9tb2R1bGVzL21hcGJveC1nbC9zcmMvZ2VvL2Nvb3JkaW5hdGUuanMiLCIvVXNlcnMva3Jpcy9kZXYvbWFwaHVicy9tYXBib3gtZ2wtYXJjZ2lzLXRpbGVkLW1hcC1zZXJ2aWNlL25vZGVfbW9kdWxlcy9tYXBib3gtZ2wvc3JjL2dlby9sbmdfbGF0LmpzIiwiL1VzZXJzL2tyaXMvZGV2L21hcGh1YnMvbWFwYm94LWdsLWFyY2dpcy10aWxlZC1tYXAtc2VydmljZS9ub2RlX21vZHVsZXMvbWFwYm94LWdsL3NyYy9nZW8vbG5nX2xhdF9ib3VuZHMuanMiLCIvVXNlcnMva3Jpcy9kZXYvbWFwaHVicy9tYXBib3gtZ2wtYXJjZ2lzLXRpbGVkLW1hcC1zZXJ2aWNlL25vZGVfbW9kdWxlcy9tYXBib3gtZ2wvc3JjL3JlbmRlci90ZXh0dXJlLmpzIiwiL1VzZXJzL2tyaXMvZGV2L21hcGh1YnMvbWFwYm94LWdsLWFyY2dpcy10aWxlZC1tYXAtc2VydmljZS9ub2RlX21vZHVsZXMvbWFwYm94LWdsL3NyYy9zb3VyY2UvdGlsZV9ib3VuZHMuanMiLCIvVXNlcnMva3Jpcy9kZXYvbWFwaHVicy9tYXBib3gtZ2wtYXJjZ2lzLXRpbGVkLW1hcC1zZXJ2aWNlL25vZGVfbW9kdWxlcy9tYXBib3gtZ2wvc3JjL3V0aWwvYWpheC5qcyIsIi9Vc2Vycy9rcmlzL2Rldi9tYXBodWJzL21hcGJveC1nbC1hcmNnaXMtdGlsZWQtbWFwLXNlcnZpY2Uvbm9kZV9tb2R1bGVzL21hcGJveC1nbC9zcmMvdXRpbC9icm93c2VyLmpzIiwiL1VzZXJzL2tyaXMvZGV2L21hcGh1YnMvbWFwYm94LWdsLWFyY2dpcy10aWxlZC1tYXAtc2VydmljZS9ub2RlX21vZHVsZXMvbWFwYm94LWdsL3NyYy91dGlsL2Jyb3dzZXIvd2luZG93LmpzIiwiL1VzZXJzL2tyaXMvZGV2L21hcGh1YnMvbWFwYm94LWdsLWFyY2dpcy10aWxlZC1tYXAtc2VydmljZS9ub2RlX21vZHVsZXMvbWFwYm94LWdsL3NyYy91dGlsL2V2ZW50ZWQuanMiLCIvVXNlcnMva3Jpcy9kZXYvbWFwaHVicy9tYXBib3gtZ2wtYXJjZ2lzLXRpbGVkLW1hcC1zZXJ2aWNlL25vZGVfbW9kdWxlcy9tYXBib3gtZ2wvc3JjL3V0aWwvdXRpbC5qcyIsIi9Vc2Vycy9rcmlzL2Rldi9tYXBodWJzL21hcGJveC1nbC1hcmNnaXMtdGlsZWQtbWFwLXNlcnZpY2Uvc3JjL2FyY2dpc190aWxlZF9tYXBfc2VydmljZV9zb3VyY2UuanMiLCIvVXNlcnMva3Jpcy9kZXYvbWFwaHVicy9tYXBib3gtZ2wtYXJjZ2lzLXRpbGVkLW1hcC1zZXJ2aWNlL3NyYy9oZWxwZXJzLmpzIiwiL1VzZXJzL2tyaXMvZGV2L21hcGh1YnMvbWFwYm94LWdsLWFyY2dpcy10aWxlZC1tYXAtc2VydmljZS9zcmMvaW5kZXguanMiLCIvVXNlcnMva3Jpcy9kZXYvbWFwaHVicy9tYXBib3gtZ2wtYXJjZ2lzLXRpbGVkLW1hcC1zZXJ2aWNlL3NyYy9sb2FkX2FyY2dpc19tYXBzZXJ2ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4VEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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OztRQUVELFFBQVEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7S0FDMUIsQ0FBQzs7SUFFRixJQUFJLE9BQU8sQ0FBQyxHQUFHLEVBQUU7UUFDYixJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztLQUM1QyxNQUFNO1FBQ0gsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztLQUNuRDtDQUNKLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBvaW50O1xuXG4vKipcbiAqIEEgc3RhbmRhbG9uZSBwb2ludCBnZW9tZXRyeSB3aXRoIHVzZWZ1bCBhY2Nlc3NvciwgY29tcGFyaXNvbiwgYW5kXG4gKiBtb2RpZmljYXRpb24gbWV0aG9kcy5cbiAqXG4gKiBAY2xhc3MgUG9pbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB4IHRoZSB4LWNvb3JkaW5hdGUuIHRoaXMgY291bGQgYmUgbG9uZ2l0dWRlIG9yIHNjcmVlblxuICogcGl4ZWxzLCBvciBhbnkgb3RoZXIgc29ydCBvZiB1bml0LlxuICogQHBhcmFtIHtOdW1iZXJ9IHkgdGhlIHktY29vcmRpbmF0ZS4gdGhpcyBjb3VsZCBiZSBsYXRpdHVkZSBvciBzY3JlZW5cbiAqIHBpeGVscywgb3IgYW55IG90aGVyIHNvcnQgb2YgdW5pdC5cbiAqIEBleGFtcGxlXG4gKiB2YXIgcG9pbnQgPSBuZXcgUG9pbnQoLTc3LCAzOCk7XG4gKi9cbmZ1bmN0aW9uIFBvaW50KHgsIHkpIHtcbiAgICB0aGlzLnggPSB4O1xuICAgIHRoaXMueSA9IHk7XG59XG5cblBvaW50LnByb3RvdHlwZSA9IHtcblxuICAgIC8qKlxuICAgICAqIENsb25lIHRoaXMgcG9pbnQsIHJldHVybmluZyBhIG5ldyBwb2ludCB0aGF0IGNhbiBiZSBtb2RpZmllZFxuICAgICAqIHdpdGhvdXQgYWZmZWN0aW5nIHRoZSBvbGQgb25lLlxuICAgICAqIEByZXR1cm4ge1BvaW50fSB0aGUgY2xvbmVcbiAgICAgKi9cbiAgICBjbG9uZTogZnVuY3Rpb24oKSB7IHJldHVybiBuZXcgUG9pbnQodGhpcy54LCB0aGlzLnkpOyB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIHRoaXMgcG9pbnQncyB4ICYgeSBjb29yZGluYXRlcyB0byBhbm90aGVyIHBvaW50LFxuICAgICAqIHlpZWxkaW5nIGEgbmV3IHBvaW50LlxuICAgICAqIEBwYXJhbSB7UG9pbnR9IHAgdGhlIG90aGVyIHBvaW50XG4gICAgICogQHJldHVybiB7UG9pbnR9IG91dHB1dCBwb2ludFxuICAgICAqL1xuICAgIGFkZDogICAgIGZ1bmN0aW9uKHApIHsgcmV0dXJuIHRoaXMuY2xvbmUoKS5fYWRkKHApOyB9LFxuXG4gICAgLyoqXG4gICAgICogU3VidHJhY3QgdGhpcyBwb2ludCdzIHggJiB5IGNvb3JkaW5hdGVzIHRvIGZyb20gcG9pbnQsXG4gICAgICogeWllbGRpbmcgYSBuZXcgcG9pbnQuXG4gICAgICogQHBhcmFtIHtQb2ludH0gcCB0aGUgb3RoZXIgcG9pbnRcbiAgICAgKiBAcmV0dXJuIHtQb2ludH0gb3V0cHV0IHBvaW50XG4gICAgICovXG4gICAgc3ViOiAgICAgZnVuY3Rpb24ocCkgeyByZXR1cm4gdGhpcy5jbG9uZSgpLl9zdWIocCk7IH0sXG5cbiAgICAvKipcbiAgICAgKiBNdWx0aXBseSB0aGlzIHBvaW50J3MgeCAmIHkgY29vcmRpbmF0ZXMgYnkgcG9pbnQsXG4gICAgICogeWllbGRpbmcgYSBuZXcgcG9pbnQuXG4gICAgICogQHBhcmFtIHtQb2ludH0gcCB0aGUgb3RoZXIgcG9pbnRcbiAgICAgKiBAcmV0dXJuIHtQb2ludH0gb3V0cHV0IHBvaW50XG4gICAgICovXG4gICAgbXVsdEJ5UG9pbnQ6ICAgIGZ1bmN0aW9uKHApIHsgcmV0dXJuIHRoaXMuY2xvbmUoKS5fbXVsdEJ5UG9pbnQocCk7IH0sXG5cbiAgICAvKipcbiAgICAgKiBEaXZpZGUgdGhpcyBwb2ludCdzIHggJiB5IGNvb3JkaW5hdGVzIGJ5IHBvaW50LFxuICAgICAqIHlpZWxkaW5nIGEgbmV3IHBvaW50LlxuICAgICAqIEBwYXJhbSB7UG9pbnR9IHAgdGhlIG90aGVyIHBvaW50XG4gICAgICogQHJldHVybiB7UG9pbnR9IG91dHB1dCBwb2ludFxuICAgICAqL1xuICAgIGRpdkJ5UG9pbnQ6ICAgICBmdW5jdGlvbihwKSB7IHJldHVybiB0aGlzLmNsb25lKCkuX2RpdkJ5UG9pbnQocCk7IH0sXG5cbiAgICAvKipcbiAgICAgKiBNdWx0aXBseSB0aGlzIHBvaW50J3MgeCAmIHkgY29vcmRpbmF0ZXMgYnkgYSBmYWN0b3IsXG4gICAgICogeWllbGRpbmcgYSBuZXcgcG9pbnQuXG4gICAgICogQHBhcmFtIHtQb2ludH0gayBmYWN0b3JcbiAgICAgKiBAcmV0dXJuIHtQb2ludH0gb3V0cHV0IHBvaW50XG4gICAgICovXG4gICAgbXVsdDogICAgZnVuY3Rpb24oaykgeyByZXR1cm4gdGhpcy5jbG9uZSgpLl9tdWx0KGspOyB9LFxuXG4gICAgLyoqXG4gICAgICogRGl2aWRlIHRoaXMgcG9pbnQncyB4ICYgeSBjb29yZGluYXRlcyBieSBhIGZhY3RvcixcbiAgICAgKiB5aWVsZGluZyBhIG5ldyBwb2ludC5cbiAgICAgKiBAcGFyYW0ge1BvaW50fSBrIGZhY3RvclxuICAgICAqIEByZXR1cm4ge1BvaW50fSBvdXRwdXQgcG9pbnRcbiAgICAgKi9cbiAgICBkaXY6ICAgICBmdW5jdGlvbihrKSB7IHJldHVybiB0aGlzLmNsb25lKCkuX2RpdihrKTsgfSxcblxuICAgIC8qKlxuICAgICAqIFJvdGF0ZSB0aGlzIHBvaW50IGFyb3VuZCB0aGUgMCwgMCBvcmlnaW4gYnkgYW4gYW5nbGUgYSxcbiAgICAgKiBnaXZlbiBpbiByYWRpYW5zXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGEgYW5nbGUgdG8gcm90YXRlIGFyb3VuZCwgaW4gcmFkaWFuc1xuICAgICAqIEByZXR1cm4ge1BvaW50fSBvdXRwdXQgcG9pbnRcbiAgICAgKi9cbiAgICByb3RhdGU6ICBmdW5jdGlvbihhKSB7IHJldHVybiB0aGlzLmNsb25lKCkuX3JvdGF0ZShhKTsgfSxcblxuICAgIC8qKlxuICAgICAqIFJvdGF0ZSB0aGlzIHBvaW50IGFyb3VuZCBwIHBvaW50IGJ5IGFuIGFuZ2xlIGEsXG4gICAgICogZ2l2ZW4gaW4gcmFkaWFuc1xuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBhIGFuZ2xlIHRvIHJvdGF0ZSBhcm91bmQsIGluIHJhZGlhbnNcbiAgICAgKiBAcGFyYW0ge1BvaW50fSBwIFBvaW50IHRvIHJvdGF0ZSBhcm91bmRcbiAgICAgKiBAcmV0dXJuIHtQb2ludH0gb3V0cHV0IHBvaW50XG4gICAgICovXG4gICAgcm90YXRlQXJvdW5kOiAgZnVuY3Rpb24oYSxwKSB7IHJldHVybiB0aGlzLmNsb25lKCkuX3JvdGF0ZUFyb3VuZChhLHApOyB9LFxuXG4gICAgLyoqXG4gICAgICogTXVsdGlwbHkgdGhpcyBwb2ludCBieSBhIDR4MSB0cmFuc2Zvcm1hdGlvbiBtYXRyaXhcbiAgICAgKiBAcGFyYW0ge0FycmF5PE51bWJlcj59IG0gdHJhbnNmb3JtYXRpb24gbWF0cml4XG4gICAgICogQHJldHVybiB7UG9pbnR9IG91dHB1dCBwb2ludFxuICAgICAqL1xuICAgIG1hdE11bHQ6IGZ1bmN0aW9uKG0pIHsgcmV0dXJuIHRoaXMuY2xvbmUoKS5fbWF0TXVsdChtKTsgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGN1bGF0ZSB0aGlzIHBvaW50IGJ1dCBhcyBhIHVuaXQgdmVjdG9yIGZyb20gMCwgMCwgbWVhbmluZ1xuICAgICAqIHRoYXQgdGhlIGRpc3RhbmNlIGZyb20gdGhlIHJlc3VsdGluZyBwb2ludCB0byB0aGUgMCwgMFxuICAgICAqIGNvb3JkaW5hdGUgd2lsbCBiZSBlcXVhbCB0byAxIGFuZCB0aGUgYW5nbGUgZnJvbSB0aGUgcmVzdWx0aW5nXG4gICAgICogcG9pbnQgdG8gdGhlIDAsIDAgY29vcmRpbmF0ZSB3aWxsIGJlIHRoZSBzYW1lIGFzIGJlZm9yZS5cbiAgICAgKiBAcmV0dXJuIHtQb2ludH0gdW5pdCB2ZWN0b3IgcG9pbnRcbiAgICAgKi9cbiAgICB1bml0OiAgICBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuY2xvbmUoKS5fdW5pdCgpOyB9LFxuXG4gICAgLyoqXG4gICAgICogQ29tcHV0ZSBhIHBlcnBlbmRpY3VsYXIgcG9pbnQsIHdoZXJlIHRoZSBuZXcgeSBjb29yZGluYXRlXG4gICAgICogaXMgdGhlIG9sZCB4IGNvb3JkaW5hdGUgYW5kIHRoZSBuZXcgeCBjb29yZGluYXRlIGlzIHRoZSBvbGQgeVxuICAgICAqIGNvb3JkaW5hdGUgbXVsdGlwbGllZCBieSAtMVxuICAgICAqIEByZXR1cm4ge1BvaW50fSBwZXJwZW5kaWN1bGFyIHBvaW50XG4gICAgICovXG4gICAgcGVycDogICAgZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmNsb25lKCkuX3BlcnAoKTsgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBhIHZlcnNpb24gb2YgdGhpcyBwb2ludCB3aXRoIHRoZSB4ICYgeSBjb29yZGluYXRlc1xuICAgICAqIHJvdW5kZWQgdG8gaW50ZWdlcnMuXG4gICAgICogQHJldHVybiB7UG9pbnR9IHJvdW5kZWQgcG9pbnRcbiAgICAgKi9cbiAgICByb3VuZDogICBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuY2xvbmUoKS5fcm91bmQoKTsgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiB0aGUgbWFnaXR1ZGUgb2YgdGhpcyBwb2ludDogdGhpcyBpcyB0aGUgRXVjbGlkZWFuXG4gICAgICogZGlzdGFuY2UgZnJvbSB0aGUgMCwgMCBjb29yZGluYXRlIHRvIHRoaXMgcG9pbnQncyB4IGFuZCB5XG4gICAgICogY29vcmRpbmF0ZXMuXG4gICAgICogQHJldHVybiB7TnVtYmVyfSBtYWduaXR1ZGVcbiAgICAgKi9cbiAgICBtYWc6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KHRoaXMueCAqIHRoaXMueCArIHRoaXMueSAqIHRoaXMueSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEp1ZGdlIHdoZXRoZXIgdGhpcyBwb2ludCBpcyBlcXVhbCB0byBhbm90aGVyIHBvaW50LCByZXR1cm5pbmdcbiAgICAgKiB0cnVlIG9yIGZhbHNlLlxuICAgICAqIEBwYXJhbSB7UG9pbnR9IG90aGVyIHRoZSBvdGhlciBwb2ludFxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHdoZXRoZXIgdGhlIHBvaW50cyBhcmUgZXF1YWxcbiAgICAgKi9cbiAgICBlcXVhbHM6IGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnggPT09IG90aGVyLnggJiZcbiAgICAgICAgICAgICAgIHRoaXMueSA9PT0gb3RoZXIueTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlIHRoZSBkaXN0YW5jZSBmcm9tIHRoaXMgcG9pbnQgdG8gYW5vdGhlciBwb2ludFxuICAgICAqIEBwYXJhbSB7UG9pbnR9IHAgdGhlIG90aGVyIHBvaW50XG4gICAgICogQHJldHVybiB7TnVtYmVyfSBkaXN0YW5jZVxuICAgICAqL1xuICAgIGRpc3Q6IGZ1bmN0aW9uKHApIHtcbiAgICAgICAgcmV0dXJuIE1hdGguc3FydCh0aGlzLmRpc3RTcXIocCkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGUgdGhlIGRpc3RhbmNlIGZyb20gdGhpcyBwb2ludCB0byBhbm90aGVyIHBvaW50LFxuICAgICAqIHdpdGhvdXQgdGhlIHNxdWFyZSByb290IHN0ZXAuIFVzZWZ1bCBpZiB5b3UncmUgY29tcGFyaW5nXG4gICAgICogcmVsYXRpdmUgZGlzdGFuY2VzLlxuICAgICAqIEBwYXJhbSB7UG9pbnR9IHAgdGhlIG90aGVyIHBvaW50XG4gICAgICogQHJldHVybiB7TnVtYmVyfSBkaXN0YW5jZVxuICAgICAqL1xuICAgIGRpc3RTcXI6IGZ1bmN0aW9uKHApIHtcbiAgICAgICAgdmFyIGR4ID0gcC54IC0gdGhpcy54LFxuICAgICAgICAgICAgZHkgPSBwLnkgLSB0aGlzLnk7XG4gICAgICAgIHJldHVybiBkeCAqIGR4ICsgZHkgKiBkeTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBhbmdsZSBmcm9tIHRoZSAwLCAwIGNvb3JkaW5hdGUgdG8gdGhpcyBwb2ludCwgaW4gcmFkaWFuc1xuICAgICAqIGNvb3JkaW5hdGVzLlxuICAgICAqIEByZXR1cm4ge051bWJlcn0gYW5nbGVcbiAgICAgKi9cbiAgICBhbmdsZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBNYXRoLmF0YW4yKHRoaXMueSwgdGhpcy54KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBhbmdsZSBmcm9tIHRoaXMgcG9pbnQgdG8gYW5vdGhlciBwb2ludCwgaW4gcmFkaWFuc1xuICAgICAqIEBwYXJhbSB7UG9pbnR9IGIgdGhlIG90aGVyIHBvaW50XG4gICAgICogQHJldHVybiB7TnVtYmVyfSBhbmdsZVxuICAgICAqL1xuICAgIGFuZ2xlVG86IGZ1bmN0aW9uKGIpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguYXRhbjIodGhpcy55IC0gYi55LCB0aGlzLnggLSBiLngpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGFuZ2xlIGJldHdlZW4gdGhpcyBwb2ludCBhbmQgYW5vdGhlciBwb2ludCwgaW4gcmFkaWFuc1xuICAgICAqIEBwYXJhbSB7UG9pbnR9IGIgdGhlIG90aGVyIHBvaW50XG4gICAgICogQHJldHVybiB7TnVtYmVyfSBhbmdsZVxuICAgICAqL1xuICAgIGFuZ2xlV2l0aDogZnVuY3Rpb24oYikge1xuICAgICAgICByZXR1cm4gdGhpcy5hbmdsZVdpdGhTZXAoYi54LCBiLnkpO1xuICAgIH0sXG5cbiAgICAvKlxuICAgICAqIEZpbmQgdGhlIGFuZ2xlIG9mIHRoZSB0d28gdmVjdG9ycywgc29sdmluZyB0aGUgZm9ybXVsYSBmb3JcbiAgICAgKiB0aGUgY3Jvc3MgcHJvZHVjdCBhIHggYiA9IHxhfHxifHNpbijOuCkgZm9yIM64LlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB4IHRoZSB4LWNvb3JkaW5hdGVcbiAgICAgKiBAcGFyYW0ge051bWJlcn0geSB0aGUgeS1jb29yZGluYXRlXG4gICAgICogQHJldHVybiB7TnVtYmVyfSB0aGUgYW5nbGUgaW4gcmFkaWFuc1xuICAgICAqL1xuICAgIGFuZ2xlV2l0aFNlcDogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICByZXR1cm4gTWF0aC5hdGFuMihcbiAgICAgICAgICAgIHRoaXMueCAqIHkgLSB0aGlzLnkgKiB4LFxuICAgICAgICAgICAgdGhpcy54ICogeCArIHRoaXMueSAqIHkpO1xuICAgIH0sXG5cbiAgICBfbWF0TXVsdDogZnVuY3Rpb24obSkge1xuICAgICAgICB2YXIgeCA9IG1bMF0gKiB0aGlzLnggKyBtWzFdICogdGhpcy55LFxuICAgICAgICAgICAgeSA9IG1bMl0gKiB0aGlzLnggKyBtWzNdICogdGhpcy55O1xuICAgICAgICB0aGlzLnggPSB4O1xuICAgICAgICB0aGlzLnkgPSB5O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgX2FkZDogZnVuY3Rpb24ocCkge1xuICAgICAgICB0aGlzLnggKz0gcC54O1xuICAgICAgICB0aGlzLnkgKz0gcC55O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgX3N1YjogZnVuY3Rpb24ocCkge1xuICAgICAgICB0aGlzLnggLT0gcC54O1xuICAgICAgICB0aGlzLnkgLT0gcC55O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgX211bHQ6IGZ1bmN0aW9uKGspIHtcbiAgICAgICAgdGhpcy54ICo9IGs7XG4gICAgICAgIHRoaXMueSAqPSBrO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgX2RpdjogZnVuY3Rpb24oaykge1xuICAgICAgICB0aGlzLnggLz0gaztcbiAgICAgICAgdGhpcy55IC89IGs7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBfbXVsdEJ5UG9pbnQ6IGZ1bmN0aW9uKHApIHtcbiAgICAgICAgdGhpcy54ICo9IHAueDtcbiAgICAgICAgdGhpcy55ICo9IHAueTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIF9kaXZCeVBvaW50OiBmdW5jdGlvbihwKSB7XG4gICAgICAgIHRoaXMueCAvPSBwLng7XG4gICAgICAgIHRoaXMueSAvPSBwLnk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBfdW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2Rpdih0aGlzLm1hZygpKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIF9wZXJwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHkgPSB0aGlzLnk7XG4gICAgICAgIHRoaXMueSA9IHRoaXMueDtcbiAgICAgICAgdGhpcy54ID0gLXk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBfcm90YXRlOiBmdW5jdGlvbihhbmdsZSkge1xuICAgICAgICB2YXIgY29zID0gTWF0aC5jb3MoYW5nbGUpLFxuICAgICAgICAgICAgc2luID0gTWF0aC5zaW4oYW5nbGUpLFxuICAgICAgICAgICAgeCA9IGNvcyAqIHRoaXMueCAtIHNpbiAqIHRoaXMueSxcbiAgICAgICAgICAgIHkgPSBzaW4gKiB0aGlzLnggKyBjb3MgKiB0aGlzLnk7XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBfcm90YXRlQXJvdW5kOiBmdW5jdGlvbihhbmdsZSwgcCkge1xuICAgICAgICB2YXIgY29zID0gTWF0aC5jb3MoYW5nbGUpLFxuICAgICAgICAgICAgc2luID0gTWF0aC5zaW4oYW5nbGUpLFxuICAgICAgICAgICAgeCA9IHAueCArIGNvcyAqICh0aGlzLnggLSBwLngpIC0gc2luICogKHRoaXMueSAtIHAueSksXG4gICAgICAgICAgICB5ID0gcC55ICsgc2luICogKHRoaXMueCAtIHAueCkgKyBjb3MgKiAodGhpcy55IC0gcC55KTtcbiAgICAgICAgdGhpcy54ID0geDtcbiAgICAgICAgdGhpcy55ID0geTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIF9yb3VuZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMueCA9IE1hdGgucm91bmQodGhpcy54KTtcbiAgICAgICAgdGhpcy55ID0gTWF0aC5yb3VuZCh0aGlzLnkpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59O1xuXG4vKipcbiAqIENvbnN0cnVjdCBhIHBvaW50IGZyb20gYW4gYXJyYXkgaWYgbmVjZXNzYXJ5LCBvdGhlcndpc2UgaWYgdGhlIGlucHV0XG4gKiBpcyBhbHJlYWR5IGEgUG9pbnQsIG9yIGFuIHVua25vd24gdHlwZSwgcmV0dXJuIGl0IHVuY2hhbmdlZFxuICogQHBhcmFtIHtBcnJheTxOdW1iZXI+fFBvaW50fCp9IGEgYW55IGtpbmQgb2YgaW5wdXQgdmFsdWVcbiAqIEByZXR1cm4ge1BvaW50fSBjb25zdHJ1Y3RlZCBwb2ludCwgb3IgcGFzc2VkLXRocm91Z2ggdmFsdWUuXG4gKiBAZXhhbXBsZVxuICogLy8gdGhpc1xuICogdmFyIHBvaW50ID0gUG9pbnQuY29udmVydChbMCwgMV0pO1xuICogLy8gaXMgZXF1aXZhbGVudCB0b1xuICogdmFyIHBvaW50ID0gbmV3IFBvaW50KDAsIDEpO1xuICovXG5Qb2ludC5jb252ZXJ0ID0gZnVuY3Rpb24gKGEpIHtcbiAgICBpZiAoYSBpbnN0YW5jZW9mIFBvaW50KSB7XG4gICAgICAgIHJldHVybiBhO1xuICAgIH1cbiAgICBpZiAoQXJyYXkuaXNBcnJheShhKSkge1xuICAgICAgICByZXR1cm4gbmV3IFBvaW50KGFbMF0sIGFbMV0pO1xuICAgIH1cbiAgICByZXR1cm4gYTtcbn07XG4iLCJ2YXIgU3BoZXJpY2FsTWVyY2F0b3IgPSAoZnVuY3Rpb24oKXtcblxuLy8gQ2xvc3VyZXMgaW5jbHVkaW5nIGNvbnN0YW50cyBhbmQgb3RoZXIgcHJlY2FsY3VsYXRlZCB2YWx1ZXMuXG52YXIgY2FjaGUgPSB7fSxcbiAgICBFUFNMTiA9IDEuMGUtMTAsXG4gICAgRDJSID0gTWF0aC5QSSAvIDE4MCxcbiAgICBSMkQgPSAxODAgLyBNYXRoLlBJLFxuICAgIC8vIDkwMDkxMyBwcm9wZXJ0aWVzLlxuICAgIEEgPSA2Mzc4MTM3LjAsXG4gICAgTUFYRVhURU5UID0gMjAwMzc1MDguMzQyNzg5MjQ0O1xuXG5mdW5jdGlvbiBpc0Zsb2F0KG4pe1xuICAgIHJldHVybiBOdW1iZXIobikgPT09IG4gJiYgbiAlIDEgIT09IDA7XG59XG5cbi8vIFNwaGVyaWNhbE1lcmNhdG9yIGNvbnN0cnVjdG9yOiBwcmVjYWNoZXMgY2FsY3VsYXRpb25zXG4vLyBmb3IgZmFzdCB0aWxlIGxvb2t1cHMuXG5mdW5jdGlvbiBTcGhlcmljYWxNZXJjYXRvcihvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdGhpcy5zaXplID0gb3B0aW9ucy5zaXplIHx8IDI1NjtcbiAgICBpZiAoIWNhY2hlW3RoaXMuc2l6ZV0pIHtcbiAgICAgICAgdmFyIHNpemUgPSB0aGlzLnNpemU7XG4gICAgICAgIHZhciBjID0gY2FjaGVbdGhpcy5zaXplXSA9IHt9O1xuICAgICAgICBjLkJjID0gW107XG4gICAgICAgIGMuQ2MgPSBbXTtcbiAgICAgICAgYy56YyA9IFtdO1xuICAgICAgICBjLkFjID0gW107XG4gICAgICAgIGZvciAodmFyIGQgPSAwOyBkIDwgMzA7IGQrKykge1xuICAgICAgICAgICAgYy5CYy5wdXNoKHNpemUgLyAzNjApO1xuICAgICAgICAgICAgYy5DYy5wdXNoKHNpemUgLyAoMiAqIE1hdGguUEkpKTtcbiAgICAgICAgICAgIGMuemMucHVzaChzaXplIC8gMik7XG4gICAgICAgICAgICBjLkFjLnB1c2goc2l6ZSk7XG4gICAgICAgICAgICBzaXplICo9IDI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5CYyA9IGNhY2hlW3RoaXMuc2l6ZV0uQmM7XG4gICAgdGhpcy5DYyA9IGNhY2hlW3RoaXMuc2l6ZV0uQ2M7XG4gICAgdGhpcy56YyA9IGNhY2hlW3RoaXMuc2l6ZV0uemM7XG4gICAgdGhpcy5BYyA9IGNhY2hlW3RoaXMuc2l6ZV0uQWM7XG59O1xuXG4vLyBDb252ZXJ0IGxvbiBsYXQgdG8gc2NyZWVuIHBpeGVsIHZhbHVlXG4vL1xuLy8gLSBgbGxgIHtBcnJheX0gYFtsb24sIGxhdF1gIGFycmF5IG9mIGdlb2dyYXBoaWMgY29vcmRpbmF0ZXMuXG4vLyAtIGB6b29tYCB7TnVtYmVyfSB6b29tIGxldmVsLlxuU3BoZXJpY2FsTWVyY2F0b3IucHJvdG90eXBlLnB4ID0gZnVuY3Rpb24obGwsIHpvb20pIHtcbiAgaWYgKGlzRmxvYXQoem9vbSkpIHtcbiAgICB2YXIgc2l6ZSA9IHRoaXMuc2l6ZSAqIE1hdGgucG93KDIsIHpvb20pO1xuICAgIHZhciBkID0gc2l6ZSAvIDI7XG4gICAgdmFyIGJjID0gKHNpemUgLyAzNjApO1xuICAgIHZhciBjYyA9IChzaXplIC8gKDIgKiBNYXRoLlBJKSk7XG4gICAgdmFyIGFjID0gc2l6ZTtcbiAgICB2YXIgZiA9IE1hdGgubWluKE1hdGgubWF4KE1hdGguc2luKEQyUiAqIGxsWzFdKSwgLTAuOTk5OSksIDAuOTk5OSk7XG4gICAgdmFyIHggPSBkICsgbGxbMF0gKiBiYztcbiAgICB2YXIgeSA9IGQgKyAwLjUgKiBNYXRoLmxvZygoMSArIGYpIC8gKDEgLSBmKSkgKiAtY2M7XG4gICAgKHggPiBhYykgJiYgKHggPSBhYyk7XG4gICAgKHkgPiBhYykgJiYgKHkgPSBhYyk7XG4gICAgLy8oeCA8IDApICYmICh4ID0gMCk7XG4gICAgLy8oeSA8IDApICYmICh5ID0gMCk7XG4gICAgcmV0dXJuIFt4LCB5XTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgZCA9IHRoaXMuemNbem9vbV07XG4gICAgdmFyIGYgPSBNYXRoLm1pbihNYXRoLm1heChNYXRoLnNpbihEMlIgKiBsbFsxXSksIC0wLjk5OTkpLCAwLjk5OTkpO1xuICAgIHZhciB4ID0gTWF0aC5yb3VuZChkICsgbGxbMF0gKiB0aGlzLkJjW3pvb21dKTtcbiAgICB2YXIgeSA9IE1hdGgucm91bmQoZCArIDAuNSAqIE1hdGgubG9nKCgxICsgZikgLyAoMSAtIGYpKSAqICgtdGhpcy5DY1t6b29tXSkpO1xuICAgICh4ID4gdGhpcy5BY1t6b29tXSkgJiYgKHggPSB0aGlzLkFjW3pvb21dKTtcbiAgICAoeSA+IHRoaXMuQWNbem9vbV0pICYmICh5ID0gdGhpcy5BY1t6b29tXSk7XG4gICAgLy8oeCA8IDApICYmICh4ID0gMCk7XG4gICAgLy8oeSA8IDApICYmICh5ID0gMCk7XG4gICAgcmV0dXJuIFt4LCB5XTtcbiAgfVxufTtcblxuLy8gQ29udmVydCBzY3JlZW4gcGl4ZWwgdmFsdWUgdG8gbG9uIGxhdFxuLy9cbi8vIC0gYHB4YCB7QXJyYXl9IGBbeCwgeV1gIGFycmF5IG9mIGdlb2dyYXBoaWMgY29vcmRpbmF0ZXMuXG4vLyAtIGB6b29tYCB7TnVtYmVyfSB6b29tIGxldmVsLlxuU3BoZXJpY2FsTWVyY2F0b3IucHJvdG90eXBlLmxsID0gZnVuY3Rpb24ocHgsIHpvb20pIHtcbiAgaWYgKGlzRmxvYXQoem9vbSkpIHtcbiAgICB2YXIgc2l6ZSA9IHRoaXMuc2l6ZSAqIE1hdGgucG93KDIsIHpvb20pO1xuICAgIHZhciBiYyA9IChzaXplIC8gMzYwKTtcbiAgICB2YXIgY2MgPSAoc2l6ZSAvICgyICogTWF0aC5QSSkpO1xuICAgIHZhciB6YyA9IHNpemUgLyAyO1xuICAgIHZhciBnID0gKHB4WzFdIC0gemMpIC8gLWNjO1xuICAgIHZhciBsb24gPSAocHhbMF0gLSB6YykgLyBiYztcbiAgICB2YXIgbGF0ID0gUjJEICogKDIgKiBNYXRoLmF0YW4oTWF0aC5leHAoZykpIC0gMC41ICogTWF0aC5QSSk7XG4gICAgcmV0dXJuIFtsb24sIGxhdF07XG4gIH0gZWxzZSB7XG4gICAgdmFyIGcgPSAocHhbMV0gLSB0aGlzLnpjW3pvb21dKSAvICgtdGhpcy5DY1t6b29tXSk7XG4gICAgdmFyIGxvbiA9IChweFswXSAtIHRoaXMuemNbem9vbV0pIC8gdGhpcy5CY1t6b29tXTtcbiAgICB2YXIgbGF0ID0gUjJEICogKDIgKiBNYXRoLmF0YW4oTWF0aC5leHAoZykpIC0gMC41ICogTWF0aC5QSSk7XG4gICAgcmV0dXJuIFtsb24sIGxhdF07XG4gIH1cbn07XG5cbi8vIENvbnZlcnQgdGlsZSB4eXogdmFsdWUgdG8gYmJveCBvZiB0aGUgZm9ybSBgW3csIHMsIGUsIG5dYFxuLy9cbi8vIC0gYHhgIHtOdW1iZXJ9IHggKGxvbmdpdHVkZSkgbnVtYmVyLlxuLy8gLSBgeWAge051bWJlcn0geSAobGF0aXR1ZGUpIG51bWJlci5cbi8vIC0gYHpvb21gIHtOdW1iZXJ9IHpvb20uXG4vLyAtIGB0bXNfc3R5bGVgIHtCb29sZWFufSB3aGV0aGVyIHRvIGNvbXB1dGUgdXNpbmcgdG1zLXN0eWxlLlxuLy8gLSBgc3JzYCB7U3RyaW5nfSBwcm9qZWN0aW9uIGZvciByZXN1bHRpbmcgYmJveCAoV0dTODR8OTAwOTEzKS5cbi8vIC0gYHJldHVybmAge0FycmF5fSBiYm94IGFycmF5IG9mIHZhbHVlcyBpbiBmb3JtIGBbdywgcywgZSwgbl1gLlxuU3BoZXJpY2FsTWVyY2F0b3IucHJvdG90eXBlLmJib3ggPSBmdW5jdGlvbih4LCB5LCB6b29tLCB0bXNfc3R5bGUsIHNycykge1xuICAgIC8vIENvbnZlcnQgeHl6IGludG8gYmJveCB3aXRoIHNycyBXR1M4NFxuICAgIGlmICh0bXNfc3R5bGUpIHtcbiAgICAgICAgeSA9IChNYXRoLnBvdygyLCB6b29tKSAtIDEpIC0geTtcbiAgICB9XG4gICAgLy8gVXNlICt5IHRvIG1ha2Ugc3VyZSBpdCdzIGEgbnVtYmVyIHRvIGF2b2lkIGluYWR2ZXJ0ZW50IGNvbmNhdGVuYXRpb24uXG4gICAgdmFyIGxsID0gW3ggKiB0aGlzLnNpemUsICgreSArIDEpICogdGhpcy5zaXplXTsgLy8gbG93ZXIgbGVmdFxuICAgIC8vIFVzZSAreCB0byBtYWtlIHN1cmUgaXQncyBhIG51bWJlciB0byBhdm9pZCBpbmFkdmVydGVudCBjb25jYXRlbmF0aW9uLlxuICAgIHZhciB1ciA9IFsoK3ggKyAxKSAqIHRoaXMuc2l6ZSwgeSAqIHRoaXMuc2l6ZV07IC8vIHVwcGVyIHJpZ2h0XG4gICAgdmFyIGJib3ggPSB0aGlzLmxsKGxsLCB6b29tKS5jb25jYXQodGhpcy5sbCh1ciwgem9vbSkpO1xuXG4gICAgLy8gSWYgd2ViIG1lcmNhdG9yIHJlcXVlc3RlZCByZXByb2plY3QgdG8gOTAwOTEzLlxuICAgIGlmIChzcnMgPT09ICc5MDA5MTMnKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnZlcnQoYmJveCwgJzkwMDkxMycpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBiYm94O1xuICAgIH1cbn07XG5cbi8vIENvbnZlcnQgYmJveCB0byB4eXggYm91bmRzXG4vL1xuLy8gLSBgYmJveGAge051bWJlcn0gYmJveCBpbiB0aGUgZm9ybSBgW3csIHMsIGUsIG5dYC5cbi8vIC0gYHpvb21gIHtOdW1iZXJ9IHpvb20uXG4vLyAtIGB0bXNfc3R5bGVgIHtCb29sZWFufSB3aGV0aGVyIHRvIGNvbXB1dGUgdXNpbmcgdG1zLXN0eWxlLlxuLy8gLSBgc3JzYCB7U3RyaW5nfSBwcm9qZWN0aW9uIG9mIGlucHV0IGJib3ggKFdHUzg0fDkwMDkxMykuXG4vLyAtIGBAcmV0dXJuYCB7T2JqZWN0fSBYWVogYm91bmRzIGNvbnRhaW5pbmcgbWluWCwgbWF4WCwgbWluWSwgbWF4WSBwcm9wZXJ0aWVzLlxuU3BoZXJpY2FsTWVyY2F0b3IucHJvdG90eXBlLnh5eiA9IGZ1bmN0aW9uKGJib3gsIHpvb20sIHRtc19zdHlsZSwgc3JzKSB7XG4gICAgLy8gSWYgd2ViIG1lcmNhdG9yIHByb3ZpZGVkIHJlcHJvamVjdCB0byBXR1M4NC5cbiAgICBpZiAoc3JzID09PSAnOTAwOTEzJykge1xuICAgICAgICBiYm94ID0gdGhpcy5jb252ZXJ0KGJib3gsICdXR1M4NCcpO1xuICAgIH1cblxuICAgIHZhciBsbCA9IFtiYm94WzBdLCBiYm94WzFdXTsgLy8gbG93ZXIgbGVmdFxuICAgIHZhciB1ciA9IFtiYm94WzJdLCBiYm94WzNdXTsgLy8gdXBwZXIgcmlnaHRcbiAgICB2YXIgcHhfbGwgPSB0aGlzLnB4KGxsLCB6b29tKTtcbiAgICB2YXIgcHhfdXIgPSB0aGlzLnB4KHVyLCB6b29tKTtcbiAgICAvLyBZID0gMCBmb3IgWFlaIGlzIHRoZSB0b3AgaGVuY2UgbWluWSB1c2VzIHB4X3VyWzFdLlxuICAgIHZhciB4ID0gWyBNYXRoLmZsb29yKHB4X2xsWzBdIC8gdGhpcy5zaXplKSwgTWF0aC5mbG9vcigocHhfdXJbMF0gLSAxKSAvIHRoaXMuc2l6ZSkgXTtcbiAgICB2YXIgeSA9IFsgTWF0aC5mbG9vcihweF91clsxXSAvIHRoaXMuc2l6ZSksIE1hdGguZmxvb3IoKHB4X2xsWzFdIC0gMSkgLyB0aGlzLnNpemUpIF07XG4gICAgdmFyIGJvdW5kcyA9IHtcbiAgICAgICAgbWluWDogTWF0aC5taW4uYXBwbHkoTWF0aCwgeCkgPCAwID8gMCA6IE1hdGgubWluLmFwcGx5KE1hdGgsIHgpLFxuICAgICAgICBtaW5ZOiBNYXRoLm1pbi5hcHBseShNYXRoLCB5KSA8IDAgPyAwIDogTWF0aC5taW4uYXBwbHkoTWF0aCwgeSksXG4gICAgICAgIG1heFg6IE1hdGgubWF4LmFwcGx5KE1hdGgsIHgpLFxuICAgICAgICBtYXhZOiBNYXRoLm1heC5hcHBseShNYXRoLCB5KVxuICAgIH07XG4gICAgaWYgKHRtc19zdHlsZSkge1xuICAgICAgICB2YXIgdG1zID0ge1xuICAgICAgICAgICAgbWluWTogKE1hdGgucG93KDIsIHpvb20pIC0gMSkgLSBib3VuZHMubWF4WSxcbiAgICAgICAgICAgIG1heFk6IChNYXRoLnBvdygyLCB6b29tKSAtIDEpIC0gYm91bmRzLm1pbllcbiAgICAgICAgfTtcbiAgICAgICAgYm91bmRzLm1pblkgPSB0bXMubWluWTtcbiAgICAgICAgYm91bmRzLm1heFkgPSB0bXMubWF4WTtcbiAgICB9XG4gICAgcmV0dXJuIGJvdW5kcztcbn07XG5cbi8vIENvbnZlcnQgcHJvamVjdGlvbiBvZiBnaXZlbiBiYm94LlxuLy9cbi8vIC0gYGJib3hgIHtOdW1iZXJ9IGJib3ggaW4gdGhlIGZvcm0gYFt3LCBzLCBlLCBuXWAuXG4vLyAtIGB0b2Age1N0cmluZ30gcHJvamVjdGlvbiBvZiBvdXRwdXQgYmJveCAoV0dTODR8OTAwOTEzKS4gSW5wdXQgYmJveFxuLy8gICBhc3N1bWVkIHRvIGJlIHRoZSBcIm90aGVyXCIgcHJvamVjdGlvbi5cbi8vIC0gYEByZXR1cm5gIHtPYmplY3R9IGJib3ggd2l0aCByZXByb2plY3RlZCBjb29yZGluYXRlcy5cblNwaGVyaWNhbE1lcmNhdG9yLnByb3RvdHlwZS5jb252ZXJ0ID0gZnVuY3Rpb24oYmJveCwgdG8pIHtcbiAgICBpZiAodG8gPT09ICc5MDA5MTMnKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZvcndhcmQoYmJveC5zbGljZSgwLCAyKSkuY29uY2F0KHRoaXMuZm9yd2FyZChiYm94LnNsaWNlKDIsNCkpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnZlcnNlKGJib3guc2xpY2UoMCwgMikpLmNvbmNhdCh0aGlzLmludmVyc2UoYmJveC5zbGljZSgyLDQpKSk7XG4gICAgfVxufTtcblxuLy8gQ29udmVydCBsb24vbGF0IHZhbHVlcyB0byA5MDA5MTMgeC95LlxuU3BoZXJpY2FsTWVyY2F0b3IucHJvdG90eXBlLmZvcndhcmQgPSBmdW5jdGlvbihsbCkge1xuICAgIHZhciB4eSA9IFtcbiAgICAgICAgQSAqIGxsWzBdICogRDJSLFxuICAgICAgICBBICogTWF0aC5sb2coTWF0aC50YW4oKE1hdGguUEkqMC4yNSkgKyAoMC41ICogbGxbMV0gKiBEMlIpKSlcbiAgICBdO1xuICAgIC8vIGlmIHh5IHZhbHVlIGlzIGJleW9uZCBtYXhleHRlbnQgKGUuZy4gcG9sZXMpLCByZXR1cm4gbWF4ZXh0ZW50LlxuICAgICh4eVswXSA+IE1BWEVYVEVOVCkgJiYgKHh5WzBdID0gTUFYRVhURU5UKTtcbiAgICAoeHlbMF0gPCAtTUFYRVhURU5UKSAmJiAoeHlbMF0gPSAtTUFYRVhURU5UKTtcbiAgICAoeHlbMV0gPiBNQVhFWFRFTlQpICYmICh4eVsxXSA9IE1BWEVYVEVOVCk7XG4gICAgKHh5WzFdIDwgLU1BWEVYVEVOVCkgJiYgKHh5WzFdID0gLU1BWEVYVEVOVCk7XG4gICAgcmV0dXJuIHh5O1xufTtcblxuLy8gQ29udmVydCA5MDA5MTMgeC95IHZhbHVlcyB0byBsb24vbGF0LlxuU3BoZXJpY2FsTWVyY2F0b3IucHJvdG90eXBlLmludmVyc2UgPSBmdW5jdGlvbih4eSkge1xuICAgIHJldHVybiBbXG4gICAgICAgICh4eVswXSAqIFIyRCAvIEEpLFxuICAgICAgICAoKE1hdGguUEkqMC41KSAtIDIuMCAqIE1hdGguYXRhbihNYXRoLmV4cCgteHlbMV0gLyBBKSkpICogUjJEXG4gICAgXTtcbn07XG5cbnJldHVybiBTcGhlcmljYWxNZXJjYXRvcjtcblxufSkoKTtcblxuaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IFNwaGVyaWNhbE1lcmNhdG9yO1xufVxuIiwiLypcbiAqIENvcHlyaWdodCAoQykgMjAwOCBBcHBsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0XG4gKiBtb2RpZmljYXRpb24sIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnNcbiAqIGFyZSBtZXQ6XG4gKiAxLiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodFxuICogICAgbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICogMi4gUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHRcbiAqICAgIG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGVcbiAqICAgIGRvY3VtZW50YXRpb24gYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG4gKlxuICogVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBBUFBMRSBJTkMuIGBgQVMgSVMnJyBBTkQgQU5ZXG4gKiBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRVxuICogSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSXG4gKiBQVVJQT1NFIEFSRSBESVNDTEFJTUVELiAgSU4gTk8gRVZFTlQgU0hBTEwgQVBQTEUgSU5DLiBPUlxuICogQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsXG4gKiBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sXG4gKiBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSwgREFUQSwgT1JcbiAqIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUllcbiAqIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuICogKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFXG4gKiBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuICpcbiAqIFBvcnRlZCBmcm9tIFdlYmtpdFxuICogaHR0cDovL3N2bi53ZWJraXQub3JnL3JlcG9zaXRvcnkvd2Via2l0L3RydW5rL1NvdXJjZS9XZWJDb3JlL3BsYXRmb3JtL2dyYXBoaWNzL1VuaXRCZXppZXIuaFxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gVW5pdEJlemllcjtcblxuZnVuY3Rpb24gVW5pdEJlemllcihwMXgsIHAxeSwgcDJ4LCBwMnkpIHtcbiAgICAvLyBDYWxjdWxhdGUgdGhlIHBvbHlub21pYWwgY29lZmZpY2llbnRzLCBpbXBsaWNpdCBmaXJzdCBhbmQgbGFzdCBjb250cm9sIHBvaW50cyBhcmUgKDAsMCkgYW5kICgxLDEpLlxuICAgIHRoaXMuY3ggPSAzLjAgKiBwMXg7XG4gICAgdGhpcy5ieCA9IDMuMCAqIChwMnggLSBwMXgpIC0gdGhpcy5jeDtcbiAgICB0aGlzLmF4ID0gMS4wIC0gdGhpcy5jeCAtIHRoaXMuYng7XG5cbiAgICB0aGlzLmN5ID0gMy4wICogcDF5O1xuICAgIHRoaXMuYnkgPSAzLjAgKiAocDJ5IC0gcDF5KSAtIHRoaXMuY3k7XG4gICAgdGhpcy5heSA9IDEuMCAtIHRoaXMuY3kgLSB0aGlzLmJ5O1xuXG4gICAgdGhpcy5wMXggPSBwMXg7XG4gICAgdGhpcy5wMXkgPSBwMnk7XG4gICAgdGhpcy5wMnggPSBwMng7XG4gICAgdGhpcy5wMnkgPSBwMnk7XG59XG5cblVuaXRCZXppZXIucHJvdG90eXBlLnNhbXBsZUN1cnZlWCA9IGZ1bmN0aW9uKHQpIHtcbiAgICAvLyBgYXggdF4zICsgYnggdF4yICsgY3ggdCcgZXhwYW5kZWQgdXNpbmcgSG9ybmVyJ3MgcnVsZS5cbiAgICByZXR1cm4gKCh0aGlzLmF4ICogdCArIHRoaXMuYngpICogdCArIHRoaXMuY3gpICogdDtcbn07XG5cblVuaXRCZXppZXIucHJvdG90eXBlLnNhbXBsZUN1cnZlWSA9IGZ1bmN0aW9uKHQpIHtcbiAgICByZXR1cm4gKCh0aGlzLmF5ICogdCArIHRoaXMuYnkpICogdCArIHRoaXMuY3kpICogdDtcbn07XG5cblVuaXRCZXppZXIucHJvdG90eXBlLnNhbXBsZUN1cnZlRGVyaXZhdGl2ZVggPSBmdW5jdGlvbih0KSB7XG4gICAgcmV0dXJuICgzLjAgKiB0aGlzLmF4ICogdCArIDIuMCAqIHRoaXMuYngpICogdCArIHRoaXMuY3g7XG59O1xuXG5Vbml0QmV6aWVyLnByb3RvdHlwZS5zb2x2ZUN1cnZlWCA9IGZ1bmN0aW9uKHgsIGVwc2lsb24pIHtcbiAgICBpZiAodHlwZW9mIGVwc2lsb24gPT09ICd1bmRlZmluZWQnKSBlcHNpbG9uID0gMWUtNjtcblxuICAgIHZhciB0MCwgdDEsIHQyLCB4MiwgaTtcblxuICAgIC8vIEZpcnN0IHRyeSBhIGZldyBpdGVyYXRpb25zIG9mIE5ld3RvbidzIG1ldGhvZCAtLSBub3JtYWxseSB2ZXJ5IGZhc3QuXG4gICAgZm9yICh0MiA9IHgsIGkgPSAwOyBpIDwgODsgaSsrKSB7XG5cbiAgICAgICAgeDIgPSB0aGlzLnNhbXBsZUN1cnZlWCh0MikgLSB4O1xuICAgICAgICBpZiAoTWF0aC5hYnMoeDIpIDwgZXBzaWxvbikgcmV0dXJuIHQyO1xuXG4gICAgICAgIHZhciBkMiA9IHRoaXMuc2FtcGxlQ3VydmVEZXJpdmF0aXZlWCh0Mik7XG4gICAgICAgIGlmIChNYXRoLmFicyhkMikgPCAxZS02KSBicmVhaztcblxuICAgICAgICB0MiA9IHQyIC0geDIgLyBkMjtcbiAgICB9XG5cbiAgICAvLyBGYWxsIGJhY2sgdG8gdGhlIGJpc2VjdGlvbiBtZXRob2QgZm9yIHJlbGlhYmlsaXR5LlxuICAgIHQwID0gMC4wO1xuICAgIHQxID0gMS4wO1xuICAgIHQyID0geDtcblxuICAgIGlmICh0MiA8IHQwKSByZXR1cm4gdDA7XG4gICAgaWYgKHQyID4gdDEpIHJldHVybiB0MTtcblxuICAgIHdoaWxlICh0MCA8IHQxKSB7XG5cbiAgICAgICAgeDIgPSB0aGlzLnNhbXBsZUN1cnZlWCh0Mik7XG4gICAgICAgIGlmIChNYXRoLmFicyh4MiAtIHgpIDwgZXBzaWxvbikgcmV0dXJuIHQyO1xuXG4gICAgICAgIGlmICh4ID4geDIpIHtcbiAgICAgICAgICAgIHQwID0gdDI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0MSA9IHQyO1xuICAgICAgICB9XG5cbiAgICAgICAgdDIgPSAodDEgLSB0MCkgKiAwLjUgKyB0MDtcbiAgICB9XG5cbiAgICAvLyBGYWlsdXJlLlxuICAgIHJldHVybiB0Mjtcbn07XG5cblVuaXRCZXppZXIucHJvdG90eXBlLnNvbHZlID0gZnVuY3Rpb24oeCwgZXBzaWxvbikge1xuICAgIHJldHVybiB0aGlzLnNhbXBsZUN1cnZlWSh0aGlzLnNvbHZlQ3VydmVYKHgsIGVwc2lsb24pKTtcbn07XG4iLCIvLyAgICAgIFxuXG4vKipcbiAqIEEgY29vcmRpbmF0ZSBpcyBhIGNvbHVtbiwgcm93LCB6b29tIGNvbWJpbmF0aW9uLCBvZnRlbiB1c2VkXG4gKiBhcyB0aGUgZGF0YSBjb21wb25lbnQgb2YgYSB0aWxlLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBjb2x1bW5cbiAqIEBwYXJhbSB7bnVtYmVyfSByb3dcbiAqIEBwYXJhbSB7bnVtYmVyfSB6b29tXG4gKiBAcHJpdmF0ZVxuICovXG5jbGFzcyBDb29yZGluYXRlIHtcbiAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgXG4gICAgY29uc3RydWN0b3IoY29sdW1uICAgICAgICAsIHJvdyAgICAgICAgLCB6b29tICAgICAgICApIHtcbiAgICAgICAgdGhpcy5jb2x1bW4gPSBjb2x1bW47XG4gICAgICAgIHRoaXMucm93ID0gcm93O1xuICAgICAgICB0aGlzLnpvb20gPSB6b29tO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIGNsb25lIG9mIHRoaXMgY29vcmRpbmF0ZSB0aGF0IGNhbiBiZSBtdXRhdGVkIHdpdGhvdXRcbiAgICAgKiBjaGFuZ2luZyB0aGUgb3JpZ2luYWwgY29vcmRpbmF0ZVxuICAgICAqXG4gICAgICogQHJldHVybnMge0Nvb3JkaW5hdGV9IGNsb25lXG4gICAgICogQHByaXZhdGVcbiAgICAgKiB2YXIgY29vcmQgPSBuZXcgQ29vcmRpbmF0ZSgwLCAwLCAwKTtcbiAgICAgKiB2YXIgYzIgPSBjb29yZC5jbG9uZSgpO1xuICAgICAqIC8vIHNpbmNlIGNvb3JkIGlzIGNsb25lZCwgbW9kaWZ5aW5nIGEgcHJvcGVydHkgb2YgYzIgZG9lc1xuICAgICAqIC8vIG5vdCBtb2RpZnkgaXQuXG4gICAgICogYzIuem9vbSA9IDI7XG4gICAgICovXG4gICAgY2xvbmUoKSB7XG4gICAgICAgIHJldHVybiBuZXcgQ29vcmRpbmF0ZSh0aGlzLmNvbHVtbiwgdGhpcy5yb3csIHRoaXMuem9vbSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogWm9vbSB0aGlzIGNvb3JkaW5hdGUgdG8gYSBnaXZlbiB6b29tIGxldmVsLiBUaGlzIHJldHVybnMgYSBuZXdcbiAgICAgKiBjb29yZGluYXRlIG9iamVjdCwgbm90IG11dGF0aW5nIHRoZSBvbGQgb25lLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHpvb21cbiAgICAgKiBAcmV0dXJucyB7Q29vcmRpbmF0ZX0gem9vbWVkIGNvb3JkaW5hdGVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBleGFtcGxlXG4gICAgICogdmFyIGNvb3JkID0gbmV3IENvb3JkaW5hdGUoMCwgMCwgMCk7XG4gICAgICogdmFyIGMyID0gY29vcmQuem9vbVRvKDEpO1xuICAgICAqIGMyIC8vIGVxdWFscyBuZXcgQ29vcmRpbmF0ZSgwLCAwLCAxKTtcbiAgICAgKi9cbiAgICB6b29tVG8oem9vbSAgICAgICAgKSB7IHJldHVybiB0aGlzLmNsb25lKCkuX3pvb21Ubyh6b29tKTsgfVxuXG4gICAgLyoqXG4gICAgICogU3VidHJhY3QgdGhlIGNvbHVtbiBhbmQgcm93IHZhbHVlcyBvZiB0aGlzIGNvb3JkaW5hdGUgZnJvbSB0aG9zZVxuICAgICAqIG9mIGFub3RoZXIgY29vcmRpbmF0ZS4gVGhlIG90aGVyIGNvb3JkaW5hdCB3aWxsIGJlIHpvb21lZCB0byB0aGVcbiAgICAgKiBzYW1lIGxldmVsIGFzIGB0aGlzYCBiZWZvcmUgdGhlIHN1YnRyYWN0aW9uIG9jY3Vyc1xuICAgICAqXG4gICAgICogQHBhcmFtIHtDb29yZGluYXRlfSBjIG90aGVyIGNvb3JkaW5hdGVcbiAgICAgKiBAcmV0dXJucyB7Q29vcmRpbmF0ZX0gcmVzdWx0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBzdWIoYyAgICAgICAgICAgICkgeyByZXR1cm4gdGhpcy5jbG9uZSgpLl9zdWIoYyk7IH1cblxuICAgIF96b29tVG8oem9vbSAgICAgICAgKSB7XG4gICAgICAgIGNvbnN0IHNjYWxlID0gTWF0aC5wb3coMiwgem9vbSAtIHRoaXMuem9vbSk7XG4gICAgICAgIHRoaXMuY29sdW1uICo9IHNjYWxlO1xuICAgICAgICB0aGlzLnJvdyAqPSBzY2FsZTtcbiAgICAgICAgdGhpcy56b29tID0gem9vbTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgX3N1YihjICAgICAgICAgICAgKSB7XG4gICAgICAgIGMgPSBjLnpvb21Ubyh0aGlzLnpvb20pO1xuICAgICAgICB0aGlzLmNvbHVtbiAtPSBjLmNvbHVtbjtcbiAgICAgICAgdGhpcy5yb3cgLT0gYy5yb3c7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDb29yZGluYXRlO1xuIiwiLy8gICAgICBcblxuY29uc3Qgd3JhcCA9IHJlcXVpcmUoJy4uL3V0aWwvdXRpbCcpLndyYXA7XG5cbi8qKlxuICogQSBgTG5nTGF0YCBvYmplY3QgcmVwcmVzZW50cyBhIGdpdmVuIGxvbmdpdHVkZSBhbmQgbGF0aXR1ZGUgY29vcmRpbmF0ZSwgbWVhc3VyZWQgaW4gZGVncmVlcy5cbiAqXG4gKiBNYXBib3ggR0wgdXNlcyBsb25naXR1ZGUsIGxhdGl0dWRlIGNvb3JkaW5hdGUgb3JkZXIgKGFzIG9wcG9zZWQgdG8gbGF0aXR1ZGUsIGxvbmdpdHVkZSkgdG8gbWF0Y2ggR2VvSlNPTi5cbiAqXG4gKiBOb3RlIHRoYXQgYW55IE1hcGJveCBHTCBtZXRob2QgdGhhdCBhY2NlcHRzIGEgYExuZ0xhdGAgb2JqZWN0IGFzIGFuIGFyZ3VtZW50IG9yIG9wdGlvblxuICogY2FuIGFsc28gYWNjZXB0IGFuIGBBcnJheWAgb2YgdHdvIG51bWJlcnMgYW5kIHdpbGwgcGVyZm9ybSBhbiBpbXBsaWNpdCBjb252ZXJzaW9uLlxuICogVGhpcyBmbGV4aWJsZSB0eXBlIGlzIGRvY3VtZW50ZWQgYXMge0BsaW5rIExuZ0xhdExpa2V9LlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBsbmcgTG9uZ2l0dWRlLCBtZWFzdXJlZCBpbiBkZWdyZWVzLlxuICogQHBhcmFtIHtudW1iZXJ9IGxhdCBMYXRpdHVkZSwgbWVhc3VyZWQgaW4gZGVncmVlcy5cbiAqIEBleGFtcGxlXG4gKiB2YXIgbGwgPSBuZXcgbWFwYm94Z2wuTG5nTGF0KC03My45NzQ5LCA0MC43NzM2KTtcbiAqIEBzZWUgW0dldCBjb29yZGluYXRlcyBvZiB0aGUgbW91c2UgcG9pbnRlcl0oaHR0cHM6Ly93d3cubWFwYm94LmNvbS9tYXBib3gtZ2wtanMvZXhhbXBsZS9tb3VzZS1wb3NpdGlvbi8pXG4gKiBAc2VlIFtEaXNwbGF5IGEgcG9wdXBdKGh0dHBzOi8vd3d3Lm1hcGJveC5jb20vbWFwYm94LWdsLWpzL2V4YW1wbGUvcG9wdXAvKVxuICogQHNlZSBbSGlnaGxpZ2h0IGZlYXR1cmVzIHdpdGhpbiBhIGJvdW5kaW5nIGJveF0oaHR0cHM6Ly93d3cubWFwYm94LmNvbS9tYXBib3gtZ2wtanMvZXhhbXBsZS91c2luZy1ib3gtcXVlcnlyZW5kZXJlZGZlYXR1cmVzLylcbiAqIEBzZWUgW0NyZWF0ZSBhIHRpbWVsaW5lIGFuaW1hdGlvbl0oaHR0cHM6Ly93d3cubWFwYm94LmNvbS9tYXBib3gtZ2wtanMvZXhhbXBsZS90aW1lbGluZS1hbmltYXRpb24vKVxuICovXG5jbGFzcyBMbmdMYXQge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFxuXG4gICAgY29uc3RydWN0b3IobG5nICAgICAgICAsIGxhdCAgICAgICAgKSB7XG4gICAgICAgIGlmIChpc05hTihsbmcpIHx8IGlzTmFOKGxhdCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBMbmdMYXQgb2JqZWN0OiAoJHtsbmd9LCAke2xhdH0pYCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5sbmcgPSArbG5nO1xuICAgICAgICB0aGlzLmxhdCA9ICtsYXQ7XG4gICAgICAgIGlmICh0aGlzLmxhdCA+IDkwIHx8IHRoaXMubGF0IDwgLTkwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgTG5nTGF0IGxhdGl0dWRlIHZhbHVlOiBtdXN0IGJlIGJldHdlZW4gLTkwIGFuZCA5MCcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIG5ldyBgTG5nTGF0YCBvYmplY3Qgd2hvc2UgbG9uZ2l0dWRlIGlzIHdyYXBwZWQgdG8gdGhlIHJhbmdlICgtMTgwLCAxODApLlxuICAgICAqXG4gICAgICogQHJldHVybnMge0xuZ0xhdH0gVGhlIHdyYXBwZWQgYExuZ0xhdGAgb2JqZWN0LlxuICAgICAqIEBleGFtcGxlXG4gICAgICogdmFyIGxsID0gbmV3IG1hcGJveGdsLkxuZ0xhdCgyODYuMDI1MSwgNDAuNzczNik7XG4gICAgICogdmFyIHdyYXBwZWQgPSBsbC53cmFwKCk7XG4gICAgICogd3JhcHBlZC5sbmc7IC8vID0gLTczLjk3NDlcbiAgICAgKi9cbiAgICB3cmFwKCkge1xuICAgICAgICByZXR1cm4gbmV3IExuZ0xhdCh3cmFwKHRoaXMubG5nLCAtMTgwLCAxODApLCB0aGlzLmxhdCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgY29vcmRpbmF0ZXMgcmVwcmVzZW50ZWQgYXMgYW4gYXJyYXkgb2YgdHdvIG51bWJlcnMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7QXJyYXk8bnVtYmVyPn0gVGhlIGNvb3JkaW5hdGVzIHJlcHJlc2V0ZWQgYXMgYW4gYXJyYXkgb2YgbG9uZ2l0dWRlIGFuZCBsYXRpdHVkZS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHZhciBsbCA9IG5ldyBtYXBib3hnbC5MbmdMYXQoLTczLjk3NDksIDQwLjc3MzYpO1xuICAgICAqIGxsLnRvQXJyYXkoKTsgLy8gPSBbLTczLjk3NDksIDQwLjc3MzZdXG4gICAgICovXG4gICAgdG9BcnJheSgpIHtcbiAgICAgICAgcmV0dXJuIFt0aGlzLmxuZywgdGhpcy5sYXRdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGNvb3JkaW5hdGVzIHJlcHJlc2VudCBhcyBhIHN0cmluZy5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb29yZGluYXRlcyByZXByZXNlbnRlZCBhcyBhIHN0cmluZyBvZiB0aGUgZm9ybWF0IGAnTG5nTGF0KGxuZywgbGF0KSdgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICogdmFyIGxsID0gbmV3IG1hcGJveGdsLkxuZ0xhdCgtNzMuOTc0OSwgNDAuNzczNik7XG4gICAgICogbGwudG9TdHJpbmcoKTsgLy8gPSBcIkxuZ0xhdCgtNzMuOTc0OSwgNDAuNzczNilcIlxuICAgICAqL1xuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gYExuZ0xhdCgke3RoaXMubG5nfSwgJHt0aGlzLmxhdH0pYDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgYExuZ0xhdEJvdW5kc2AgZnJvbSB0aGUgY29vcmRpbmF0ZXMgZXh0ZW5kZWQgYnkgYSBnaXZlbiBgcmFkaXVzYC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSByYWRpdXMgRGlzdGFuY2UgaW4gbWV0ZXJzIGZyb20gdGhlIGNvb3JkaW5hdGVzIHRvIGV4dGVuZCB0aGUgYm91bmRzLlxuICAgICAqIEByZXR1cm5zIHtMbmdMYXRCb3VuZHN9IEEgbmV3IGBMbmdMYXRCb3VuZHNgIG9iamVjdCByZXByZXNlbnRpbmcgdGhlIGNvb3JkaW5hdGVzIGV4dGVuZGVkIGJ5IHRoZSBgcmFkaXVzYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHZhciBsbCA9IG5ldyBtYXBib3hnbC5MbmdMYXQoLTczLjk3NDksIDQwLjc3MzYpO1xuICAgICAqIGxsLnRvQm91bmRzKDEwMCkudG9BcnJheSgpOyAvLyA9IFtbLTczLjk3NTAxODYyMTQxMzI4LCA0MC43NzM1MTAxNjg0NzIyOV0sIFstNzMuOTc0NzgxMzc4NTg2NzMsIDQwLjc3MzY4OTgzMTUyNzcxXV1cbiAgICAgKi9cbiAgICB0b0JvdW5kcyhyYWRpdXMgICAgICAgICkge1xuICAgICAgICBjb25zdCBlYXJ0aENpcmN1bWZlcmVuY2VJbk1ldGVyc0F0RXF1YXRvciA9IDQwMDc1MDE3O1xuICAgICAgICBjb25zdCBsYXRBY2N1cmFjeSA9IDM2MCAqIHJhZGl1cyAvIGVhcnRoQ2lyY3VtZmVyZW5jZUluTWV0ZXJzQXRFcXVhdG9yLFxuICAgICAgICAgICAgbG5nQWNjdXJhY3kgPSBsYXRBY2N1cmFjeSAvIE1hdGguY29zKChNYXRoLlBJIC8gMTgwKSAqIHRoaXMubGF0KTtcblxuICAgICAgICBjb25zdCBMbmdMYXRCb3VuZHMgPSByZXF1aXJlKCcuL2xuZ19sYXRfYm91bmRzJyk7XG4gICAgICAgIHJldHVybiBuZXcgTG5nTGF0Qm91bmRzKG5ldyBMbmdMYXQodGhpcy5sbmcgLSBsbmdBY2N1cmFjeSwgdGhpcy5sYXQgLSBsYXRBY2N1cmFjeSksXG4gICAgICAgICAgICBuZXcgTG5nTGF0KHRoaXMubG5nICsgbG5nQWNjdXJhY3ksIHRoaXMubGF0ICsgbGF0QWNjdXJhY3kpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0cyBhbiBhcnJheSBvZiB0d28gbnVtYmVycyB0byBhIGBMbmdMYXRgIG9iamVjdC5cbiAgICAgKlxuICAgICAqIElmIGEgYExuZ0xhdGAgb2JqZWN0IGlzIHBhc3NlZCBpbiwgdGhlIGZ1bmN0aW9uIHJldHVybnMgaXQgdW5jaGFuZ2VkLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtMbmdMYXRMaWtlfSBpbnB1dCBBbiBhcnJheSBvZiB0d28gbnVtYmVycyB0byBjb252ZXJ0LCBvciBhIGBMbmdMYXRgIG9iamVjdCB0byByZXR1cm4uXG4gICAgICogQHJldHVybnMge0xuZ0xhdH0gQSBuZXcgYExuZ0xhdGAgb2JqZWN0LCBpZiBhIGNvbnZlcnNpb24gb2NjdXJyZWQsIG9yIHRoZSBvcmlnaW5hbCBgTG5nTGF0YCBvYmplY3QuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB2YXIgYXJyID0gWy03My45NzQ5LCA0MC43NzM2XTtcbiAgICAgKiB2YXIgbGwgPSBtYXBib3hnbC5MbmdMYXQuY29udmVydChhcnIpO1xuICAgICAqIGxsOyAgIC8vID0gTG5nTGF0IHtsbmc6IC03My45NzQ5LCBsYXQ6IDQwLjc3MzZ9XG4gICAgICovXG4gICAgc3RhdGljIGNvbnZlcnQoaW5wdXQgICAgICAgICAgICApICAgICAgICAge1xuICAgICAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBMbmdMYXQpIHtcbiAgICAgICAgICAgIHJldHVybiBpbnB1dDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShpbnB1dCkgJiYgKGlucHV0Lmxlbmd0aCA9PT0gMiB8fCBpbnB1dC5sZW5ndGggPT09IDMpKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IExuZ0xhdChOdW1iZXIoaW5wdXRbMF0pLCBOdW1iZXIoaW5wdXRbMV0pKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoaW5wdXQpICYmIHR5cGVvZiBpbnB1dCA9PT0gJ29iamVjdCcgJiYgaW5wdXQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgTG5nTGF0KE51bWJlcihpbnB1dC5sbmcpLCBOdW1iZXIoaW5wdXQubGF0KSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiYExuZ0xhdExpa2VgIGFyZ3VtZW50IG11c3QgYmUgc3BlY2lmaWVkIGFzIGEgTG5nTGF0IGluc3RhbmNlLCBhbiBvYmplY3Qge2xuZzogPGxuZz4sIGxhdDogPGxhdD59LCBvciBhbiBhcnJheSBvZiBbPGxuZz4sIDxsYXQ+XVwiKTtcbiAgICB9XG59XG5cbi8qKlxuICogQSB7QGxpbmsgTG5nTGF0fSBvYmplY3QsIGFuIGFycmF5IG9mIHR3byBudW1iZXJzIHJlcHJlc2VudGluZyBsb25naXR1ZGUgYW5kIGxhdGl0dWRlLFxuICogb3IgYW4gb2JqZWN0IHdpdGggYGxuZ2AgYW5kIGBsYXRgIHByb3BlcnRpZXMuXG4gKlxuICogQHR5cGVkZWYge0xuZ0xhdCB8IHtsbmc6IG51bWJlciwgbGF0OiBudW1iZXJ9IHwgW251bWJlciwgbnVtYmVyXX0gTG5nTGF0TGlrZVxuICogQGV4YW1wbGVcbiAqIHZhciB2MSA9IG5ldyBtYXBib3hnbC5MbmdMYXQoLTEyMi40MjA2NzksIDM3Ljc3MjUzNyk7XG4gKiB2YXIgdjIgPSBbLTEyMi40MjA2NzksIDM3Ljc3MjUzN107XG4gKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5cbm1vZHVsZS5leHBvcnRzID0gTG5nTGF0O1xuIiwiLy8gICAgICBcblxuY29uc3QgTG5nTGF0ID0gcmVxdWlyZSgnLi9sbmdfbGF0Jyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuXG4vKipcbiAqIEEgYExuZ0xhdEJvdW5kc2Agb2JqZWN0IHJlcHJlc2VudHMgYSBnZW9ncmFwaGljYWwgYm91bmRpbmcgYm94LFxuICogZGVmaW5lZCBieSBpdHMgc291dGh3ZXN0IGFuZCBub3J0aGVhc3QgcG9pbnRzIGluIGxvbmdpdHVkZSBhbmQgbGF0aXR1ZGUuXG4gKlxuICogSWYgbm8gYXJndW1lbnRzIGFyZSBwcm92aWRlZCB0byB0aGUgY29uc3RydWN0b3IsIGEgYG51bGxgIGJvdW5kaW5nIGJveCBpcyBjcmVhdGVkLlxuICpcbiAqIE5vdGUgdGhhdCBhbnkgTWFwYm94IEdMIG1ldGhvZCB0aGF0IGFjY2VwdHMgYSBgTG5nTGF0Qm91bmRzYCBvYmplY3QgYXMgYW4gYXJndW1lbnQgb3Igb3B0aW9uXG4gKiBjYW4gYWxzbyBhY2NlcHQgYW4gYEFycmF5YCBvZiB0d28ge0BsaW5rIExuZ0xhdExpa2V9IGNvbnN0cnVjdHMgYW5kIHdpbGwgcGVyZm9ybSBhbiBpbXBsaWNpdCBjb252ZXJzaW9uLlxuICogVGhpcyBmbGV4aWJsZSB0eXBlIGlzIGRvY3VtZW50ZWQgYXMge0BsaW5rIExuZ0xhdEJvdW5kc0xpa2V9LlxuICpcbiAqIEBwYXJhbSB7TG5nTGF0TGlrZX0gW3N3XSBUaGUgc291dGh3ZXN0IGNvcm5lciBvZiB0aGUgYm91bmRpbmcgYm94LlxuICogQHBhcmFtIHtMbmdMYXRMaWtlfSBbbmVdIFRoZSBub3J0aGVhc3QgY29ybmVyIG9mIHRoZSBib3VuZGluZyBib3guXG4gKiBAZXhhbXBsZVxuICogdmFyIHN3ID0gbmV3IG1hcGJveGdsLkxuZ0xhdCgtNzMuOTg3NiwgNDAuNzY2MSk7XG4gKiB2YXIgbmUgPSBuZXcgbWFwYm94Z2wuTG5nTGF0KC03My45Mzk3LCA0MC44MDAyKTtcbiAqIHZhciBsbGIgPSBuZXcgbWFwYm94Z2wuTG5nTGF0Qm91bmRzKHN3LCBuZSk7XG4gKi9cbmNsYXNzIExuZ0xhdEJvdW5kcyB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgXG5cbiAgICAvLyBUaGlzIGNvbnN0cnVjdG9yIGlzIHRvbyBmbGV4aWJsZSB0byB0eXBlLiBJdCBzaG91bGQgbm90IGJlIHNvIGZsZXhpYmxlLlxuICAgIGNvbnN0cnVjdG9yKHN3ICAgICAsIG5lICAgICApIHtcbiAgICAgICAgaWYgKCFzdykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2UgaWYgKG5lKSB7XG4gICAgICAgICAgICB0aGlzLnNldFNvdXRoV2VzdChzdykuc2V0Tm9ydGhFYXN0KG5lKTtcbiAgICAgICAgfSBlbHNlIGlmIChzdy5sZW5ndGggPT09IDQpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U291dGhXZXN0KFtzd1swXSwgc3dbMV1dKS5zZXROb3J0aEVhc3QoW3N3WzJdLCBzd1szXV0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXRTb3V0aFdlc3Qoc3dbMF0pLnNldE5vcnRoRWFzdChzd1sxXSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIG5vcnRoZWFzdCBjb3JuZXIgb2YgdGhlIGJvdW5kaW5nIGJveFxuICAgICAqXG4gICAgICogQHBhcmFtIHtMbmdMYXRMaWtlfSBuZVxuICAgICAqIEByZXR1cm5zIHtMbmdMYXRCb3VuZHN9IGB0aGlzYFxuICAgICAqL1xuICAgIHNldE5vcnRoRWFzdChuZSAgICAgICAgICAgICkge1xuICAgICAgICB0aGlzLl9uZSA9IG5lIGluc3RhbmNlb2YgTG5nTGF0ID8gbmV3IExuZ0xhdChuZS5sbmcsIG5lLmxhdCkgOiBMbmdMYXQuY29udmVydChuZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgc291dGh3ZXN0IGNvcm5lciBvZiB0aGUgYm91bmRpbmcgYm94XG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0xuZ0xhdExpa2V9IHN3XG4gICAgICogQHJldHVybnMge0xuZ0xhdEJvdW5kc30gYHRoaXNgXG4gICAgICovXG4gICAgc2V0U291dGhXZXN0KHN3ICAgICAgICAgICAgKSB7XG4gICAgICAgIHRoaXMuX3N3ID0gc3cgaW5zdGFuY2VvZiBMbmdMYXQgPyBuZXcgTG5nTGF0KHN3LmxuZywgc3cubGF0KSA6IExuZ0xhdC5jb252ZXJ0KHN3KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRXh0ZW5kIHRoZSBib3VuZHMgdG8gaW5jbHVkZSBhIGdpdmVuIExuZ0xhdCBvciBMbmdMYXRCb3VuZHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0xuZ0xhdHxMbmdMYXRCb3VuZHN9IG9iaiBvYmplY3QgdG8gZXh0ZW5kIHRvXG4gICAgICogQHJldHVybnMge0xuZ0xhdEJvdW5kc30gYHRoaXNgXG4gICAgICovXG4gICAgZXh0ZW5kKG9iaikge1xuICAgICAgICBjb25zdCBzdyA9IHRoaXMuX3N3LFxuICAgICAgICAgICAgbmUgPSB0aGlzLl9uZTtcbiAgICAgICAgbGV0IHN3MiwgbmUyO1xuXG4gICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBMbmdMYXQpIHtcbiAgICAgICAgICAgIHN3MiA9IG9iajtcbiAgICAgICAgICAgIG5lMiA9IG9iajtcblxuICAgICAgICB9IGVsc2UgaWYgKG9iaiBpbnN0YW5jZW9mIExuZ0xhdEJvdW5kcykge1xuICAgICAgICAgICAgc3cyID0gb2JqLl9zdztcbiAgICAgICAgICAgIG5lMiA9IG9iai5fbmU7XG5cbiAgICAgICAgICAgIGlmICghc3cyIHx8ICFuZTIpIHJldHVybiB0aGlzO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShvYmopKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9iai5ldmVyeShBcnJheS5pc0FycmF5KSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5leHRlbmQoTG5nTGF0Qm91bmRzLmNvbnZlcnQob2JqKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXh0ZW5kKExuZ0xhdC5jb252ZXJ0KG9iaikpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFzdyAmJiAhbmUpIHtcbiAgICAgICAgICAgIHRoaXMuX3N3ID0gbmV3IExuZ0xhdChzdzIubG5nLCBzdzIubGF0KTtcbiAgICAgICAgICAgIHRoaXMuX25lID0gbmV3IExuZ0xhdChuZTIubG5nLCBuZTIubGF0KTtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3cubG5nID0gTWF0aC5taW4oc3cyLmxuZywgc3cubG5nKTtcbiAgICAgICAgICAgIHN3LmxhdCA9IE1hdGgubWluKHN3Mi5sYXQsIHN3LmxhdCk7XG4gICAgICAgICAgICBuZS5sbmcgPSBNYXRoLm1heChuZTIubG5nLCBuZS5sbmcpO1xuICAgICAgICAgICAgbmUubGF0ID0gTWF0aC5tYXgobmUyLmxhdCwgbmUubGF0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGdlb2dyYXBoaWNhbCBjb29yZGluYXRlIGVxdWlkaXN0YW50IGZyb20gdGhlIGJvdW5kaW5nIGJveCdzIGNvcm5lcnMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7TG5nTGF0fSBUaGUgYm91bmRpbmcgYm94J3MgY2VudGVyLlxuICAgICAqIEBleGFtcGxlXG4gICAgICogdmFyIGxsYiA9IG5ldyBtYXBib3hnbC5MbmdMYXRCb3VuZHMoWy03My45ODc2LCA0MC43NjYxXSwgWy03My45Mzk3LCA0MC44MDAyXSk7XG4gICAgICogbGxiLmdldENlbnRlcigpOyAvLyA9IExuZ0xhdCB7bG5nOiAtNzMuOTYzNjUsIGxhdDogNDAuNzgzMTV9XG4gICAgICovXG4gICAgZ2V0Q2VudGVyKCkgICAgICAgICB7XG4gICAgICAgIHJldHVybiBuZXcgTG5nTGF0KCh0aGlzLl9zdy5sbmcgKyB0aGlzLl9uZS5sbmcpIC8gMiwgKHRoaXMuX3N3LmxhdCArIHRoaXMuX25lLmxhdCkgLyAyKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBzb3V0aHdlc3QgY29ybmVyIG9mIHRoZSBib3VuZGluZyBib3guXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7TG5nTGF0fSBUaGUgc291dGh3ZXN0IGNvcm5lciBvZiB0aGUgYm91bmRpbmcgYm94LlxuICAgICAqL1xuICAgIGdldFNvdXRoV2VzdCgpICAgICAgICAgeyByZXR1cm4gdGhpcy5fc3c7IH1cblxuICAgIC8qKlxuICAgICogUmV0dXJucyB0aGUgbm9ydGhlYXN0IGNvcm5lciBvZiB0aGUgYm91bmRpbmcgYm94LlxuICAgICpcbiAgICAqIEByZXR1cm5zIHtMbmdMYXR9IFRoZSBub3J0aGVhc3QgY29ybmVyIG9mIHRoZSBib3VuZGluZyBib3guXG4gICAgICovXG4gICAgZ2V0Tm9ydGhFYXN0KCkgICAgICAgICB7IHJldHVybiB0aGlzLl9uZTsgfVxuXG4gICAgLyoqXG4gICAgKiBSZXR1cm5zIHRoZSBub3J0aHdlc3QgY29ybmVyIG9mIHRoZSBib3VuZGluZyBib3guXG4gICAgKlxuICAgICogQHJldHVybnMge0xuZ0xhdH0gVGhlIG5vcnRod2VzdCBjb3JuZXIgb2YgdGhlIGJvdW5kaW5nIGJveC5cbiAgICAgKi9cbiAgICBnZXROb3J0aFdlc3QoKSAgICAgICAgIHsgcmV0dXJuIG5ldyBMbmdMYXQodGhpcy5nZXRXZXN0KCksIHRoaXMuZ2V0Tm9ydGgoKSk7IH1cblxuICAgIC8qKlxuICAgICogUmV0dXJucyB0aGUgc291dGhlYXN0IGNvcm5lciBvZiB0aGUgYm91bmRpbmcgYm94LlxuICAgICpcbiAgICAqIEByZXR1cm5zIHtMbmdMYXR9IFRoZSBzb3V0aGVhc3QgY29ybmVyIG9mIHRoZSBib3VuZGluZyBib3guXG4gICAgICovXG4gICAgZ2V0U291dGhFYXN0KCkgICAgICAgICB7IHJldHVybiBuZXcgTG5nTGF0KHRoaXMuZ2V0RWFzdCgpLCB0aGlzLmdldFNvdXRoKCkpOyB9XG5cbiAgICAvKipcbiAgICAqIFJldHVybnMgdGhlIHdlc3QgZWRnZSBvZiB0aGUgYm91bmRpbmcgYm94LlxuICAgICpcbiAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSB3ZXN0IGVkZ2Ugb2YgdGhlIGJvdW5kaW5nIGJveC5cbiAgICAgKi9cbiAgICBnZXRXZXN0KCkgICAgICAgICB7IHJldHVybiB0aGlzLl9zdy5sbmc7IH1cblxuICAgIC8qKlxuICAgICogUmV0dXJucyB0aGUgc291dGggZWRnZSBvZiB0aGUgYm91bmRpbmcgYm94LlxuICAgICpcbiAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSBzb3V0aCBlZGdlIG9mIHRoZSBib3VuZGluZyBib3guXG4gICAgICovXG4gICAgZ2V0U291dGgoKSAgICAgICAgIHsgcmV0dXJuIHRoaXMuX3N3LmxhdDsgfVxuXG4gICAgLyoqXG4gICAgKiBSZXR1cm5zIHRoZSBlYXN0IGVkZ2Ugb2YgdGhlIGJvdW5kaW5nIGJveC5cbiAgICAqXG4gICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgZWFzdCBlZGdlIG9mIHRoZSBib3VuZGluZyBib3guXG4gICAgICovXG4gICAgZ2V0RWFzdCgpICAgICAgICAgeyByZXR1cm4gdGhpcy5fbmUubG5nOyB9XG5cbiAgICAvKipcbiAgICAqIFJldHVybnMgdGhlIG5vcnRoIGVkZ2Ugb2YgdGhlIGJvdW5kaW5nIGJveC5cbiAgICAqXG4gICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgbm9ydGggZWRnZSBvZiB0aGUgYm91bmRpbmcgYm94LlxuICAgICAqL1xuICAgIGdldE5vcnRoKCkgICAgICAgICB7IHJldHVybiB0aGlzLl9uZS5sYXQ7IH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGJvdW5kaW5nIGJveCByZXByZXNlbnRlZCBhcyBhbiBhcnJheS5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtBcnJheTxBcnJheTxudW1iZXI+Pn0gVGhlIGJvdW5kaW5nIGJveCByZXByZXNlbnRlZCBhcyBhbiBhcnJheSwgY29uc2lzdGluZyBvZiB0aGVcbiAgICAgKiAgIHNvdXRod2VzdCBhbmQgbm9ydGhlYXN0IGNvb3JkaW5hdGVzIG9mIHRoZSBib3VuZGluZyByZXByZXNlbnRlZCBhcyBhcnJheXMgb2YgbnVtYmVycy5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHZhciBsbGIgPSBuZXcgbWFwYm94Z2wuTG5nTGF0Qm91bmRzKFstNzMuOTg3NiwgNDAuNzY2MV0sIFstNzMuOTM5NywgNDAuODAwMl0pO1xuICAgICAqIGxsYi50b0FycmF5KCk7IC8vID0gW1stNzMuOTg3NiwgNDAuNzY2MV0sIFstNzMuOTM5NywgNDAuODAwMl1dXG4gICAgICovXG4gICAgdG9BcnJheSgpIHtcbiAgICAgICAgcmV0dXJuIFt0aGlzLl9zdy50b0FycmF5KCksIHRoaXMuX25lLnRvQXJyYXkoKV07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRoZSBib3VuZGluZyBib3ggcmVwcmVzZW50ZWQgYXMgYSBzdHJpbmcuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgYm91bmRpbmcgYm94IHJlcHJlc2VudHMgYXMgYSBzdHJpbmcgb2YgdGhlIGZvcm1hdFxuICAgICAqICAgYCdMbmdMYXRCb3VuZHMoTG5nTGF0KGxuZywgbGF0KSwgTG5nTGF0KGxuZywgbGF0KSknYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHZhciBsbGIgPSBuZXcgbWFwYm94Z2wuTG5nTGF0Qm91bmRzKFstNzMuOTg3NiwgNDAuNzY2MV0sIFstNzMuOTM5NywgNDAuODAwMl0pO1xuICAgICAqIGxsYi50b1N0cmluZygpOyAvLyA9IFwiTG5nTGF0Qm91bmRzKExuZ0xhdCgtNzMuOTg3NiwgNDAuNzY2MSksIExuZ0xhdCgtNzMuOTM5NywgNDAuODAwMikpXCJcbiAgICAgKi9cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIGBMbmdMYXRCb3VuZHMoJHt0aGlzLl9zdy50b1N0cmluZygpfSwgJHt0aGlzLl9uZS50b1N0cmluZygpfSlgO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIGFuIGFycmF5IHRvIGEgYExuZ0xhdEJvdW5kc2Agb2JqZWN0LlxuICAgICAqXG4gICAgICogSWYgYSBgTG5nTGF0Qm91bmRzYCBvYmplY3QgaXMgcGFzc2VkIGluLCB0aGUgZnVuY3Rpb24gcmV0dXJucyBpdCB1bmNoYW5nZWQuXG4gICAgICpcbiAgICAgKiBJbnRlcm5hbGx5LCB0aGUgZnVuY3Rpb24gY2FsbHMgYExuZ0xhdCNjb252ZXJ0YCB0byBjb252ZXJ0IGFycmF5cyB0byBgTG5nTGF0YCB2YWx1ZXMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0xuZ0xhdEJvdW5kc0xpa2V9IGlucHV0IEFuIGFycmF5IG9mIHR3byBjb29yZGluYXRlcyB0byBjb252ZXJ0LCBvciBhIGBMbmdMYXRCb3VuZHNgIG9iamVjdCB0byByZXR1cm4uXG4gICAgICogQHJldHVybnMge0xuZ0xhdEJvdW5kc30gQSBuZXcgYExuZ0xhdEJvdW5kc2Agb2JqZWN0LCBpZiBhIGNvbnZlcnNpb24gb2NjdXJyZWQsIG9yIHRoZSBvcmlnaW5hbCBgTG5nTGF0Qm91bmRzYCBvYmplY3QuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB2YXIgYXJyID0gW1stNzMuOTg3NiwgNDAuNzY2MV0sIFstNzMuOTM5NywgNDAuODAwMl1dO1xuICAgICAqIHZhciBsbGIgPSBtYXBib3hnbC5MbmdMYXRCb3VuZHMuY29udmVydChhcnIpO1xuICAgICAqIGxsYjsgICAvLyA9IExuZ0xhdEJvdW5kcyB7X3N3OiBMbmdMYXQge2xuZzogLTczLjk4NzYsIGxhdDogNDAuNzY2MX0sIF9uZTogTG5nTGF0IHtsbmc6IC03My45Mzk3LCBsYXQ6IDQwLjgwMDJ9fVxuICAgICAqL1xuICAgIHN0YXRpYyBjb252ZXJ0KGlucHV0ICAgICAgICAgICAgICAgICAgKSAgICAgICAgICAgICAgIHtcbiAgICAgICAgaWYgKCFpbnB1dCB8fCBpbnB1dCBpbnN0YW5jZW9mIExuZ0xhdEJvdW5kcykgcmV0dXJuIGlucHV0O1xuICAgICAgICByZXR1cm4gbmV3IExuZ0xhdEJvdW5kcyhpbnB1dCk7XG4gICAgfVxufVxuXG4vKipcbiAqIEEge0BsaW5rIExuZ0xhdEJvdW5kc30gb2JqZWN0LCBhbiBhcnJheSBvZiB7QGxpbmsgTG5nTGF0TGlrZX0gb2JqZWN0cyBpbiBbc3csIG5lXSBvcmRlcixcbiAqIG9yIGFuIGFycmF5IG9mIG51bWJlcnMgaW4gW3dlc3QsIHNvdXRoLCBlYXN0LCBub3J0aF0gb3JkZXIuXG4gKlxuICogQHR5cGVkZWYge0xuZ0xhdEJvdW5kcyB8IFtMbmdMYXRMaWtlLCBMbmdMYXRMaWtlXSB8IFtudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXJdfSBMbmdMYXRCb3VuZHNMaWtlXG4gKiBAZXhhbXBsZVxuICogdmFyIHYxID0gbmV3IG1hcGJveGdsLkxuZ0xhdEJvdW5kcyhcbiAqICAgbmV3IG1hcGJveGdsLkxuZ0xhdCgtNzMuOTg3NiwgNDAuNzY2MSksXG4gKiAgIG5ldyBtYXBib3hnbC5MbmdMYXQoLTczLjkzOTcsIDQwLjgwMDIpXG4gKiApO1xuICogdmFyIHYyID0gbmV3IG1hcGJveGdsLkxuZ0xhdEJvdW5kcyhbLTczLjk4NzYsIDQwLjc2NjFdLCBbLTczLjkzOTcsIDQwLjgwMDJdKVxuICogdmFyIHYzID0gW1stNzMuOTg3NiwgNDAuNzY2MV0sIFstNzMuOTM5NywgNDAuODAwMl1dO1xuICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5cbm1vZHVsZS5leHBvcnRzID0gTG5nTGF0Qm91bmRzO1xuIiwiLy8gICAgICBcblxuY29uc3Qge0hUTUxJbWFnZUVsZW1lbnQsIEhUTUxDYW52YXNFbGVtZW50LCBIVE1MVmlkZW9FbGVtZW50LCBJbWFnZURhdGF9ID0gcmVxdWlyZSgnLi4vdXRpbC93aW5kb3cnKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5cbiAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICBcbiBcblxuICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICBcblxuY2xhc3MgVGV4dHVyZSB7XG4gICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgXG5cbiAgICBjb25zdHJ1Y3Rvcihjb250ZXh0ICAgICAgICAgLCBpbWFnZSAgICAgICAgICAgICAgLCBmb3JtYXQgICAgICAgICAgICAgICAsIHByZW11bHRpcGx5ICAgICAgICAgICkge1xuICAgICAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuXG4gICAgICAgIGNvbnN0IHt3aWR0aCwgaGVpZ2h0fSA9IGltYWdlO1xuICAgICAgICB0aGlzLnNpemUgPSBbd2lkdGgsIGhlaWdodF07XG4gICAgICAgIHRoaXMuZm9ybWF0ID0gZm9ybWF0O1xuXG4gICAgICAgIHRoaXMudGV4dHVyZSA9IGNvbnRleHQuZ2wuY3JlYXRlVGV4dHVyZSgpO1xuICAgICAgICB0aGlzLnVwZGF0ZShpbWFnZSwgcHJlbXVsdGlwbHkpO1xuICAgIH1cblxuICAgIHVwZGF0ZShpbWFnZSAgICAgICAgICAgICAgLCBwcmVtdWx0aXBseSAgICAgICAgICApIHtcbiAgICAgICAgY29uc3Qge3dpZHRoLCBoZWlnaHR9ID0gaW1hZ2U7XG4gICAgICAgIHRoaXMuc2l6ZSA9IFt3aWR0aCwgaGVpZ2h0XTtcblxuICAgICAgICBjb25zdCB7Y29udGV4dH0gPSB0aGlzO1xuICAgICAgICBjb25zdCB7Z2x9ID0gY29udGV4dDtcbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGhpcy50ZXh0dXJlKTtcbiAgICAgICAgY29udGV4dC5waXhlbFN0b3JlVW5wYWNrLnNldCgxKTtcblxuICAgICAgICBpZiAodGhpcy5mb3JtYXQgPT09IGdsLlJHQkEgJiYgcHJlbXVsdGlwbHkgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICBjb250ZXh0LnBpeGVsU3RvcmVVbnBhY2tQcmVtdWx0aXBseUFscGhhLnNldCh0cnVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpbWFnZSBpbnN0YW5jZW9mIEhUTUxJbWFnZUVsZW1lbnQgfHwgaW1hZ2UgaW5zdGFuY2VvZiBIVE1MQ2FudmFzRWxlbWVudCB8fCBpbWFnZSBpbnN0YW5jZW9mIEhUTUxWaWRlb0VsZW1lbnQgfHwgaW1hZ2UgaW5zdGFuY2VvZiBJbWFnZURhdGEpIHtcbiAgICAgICAgICAgIGdsLnRleEltYWdlMkQoZ2wuVEVYVFVSRV8yRCwgMCwgdGhpcy5mb3JtYXQsIHRoaXMuZm9ybWF0LCBnbC5VTlNJR05FRF9CWVRFLCBpbWFnZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBnbC50ZXhJbWFnZTJEKGdsLlRFWFRVUkVfMkQsIDAsIHRoaXMuZm9ybWF0LCB3aWR0aCwgaGVpZ2h0LCAwLCB0aGlzLmZvcm1hdCwgZ2wuVU5TSUdORURfQllURSwgaW1hZ2UuZGF0YSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBiaW5kKGZpbHRlciAgICAgICAgICAgICAgICwgd3JhcCAgICAgICAgICAgICAsIG1pbkZpbHRlciAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgY29uc3Qge2NvbnRleHR9ID0gdGhpcztcbiAgICAgICAgY29uc3Qge2dsfSA9IGNvbnRleHQ7XG4gICAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRoaXMudGV4dHVyZSk7XG5cbiAgICAgICAgaWYgKGZpbHRlciAhPT0gdGhpcy5maWx0ZXIpIHtcbiAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBmaWx0ZXIpO1xuICAgICAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01JTl9GSUxURVIsIG1pbkZpbHRlciB8fCBmaWx0ZXIpO1xuICAgICAgICAgICAgdGhpcy5maWx0ZXIgPSBmaWx0ZXI7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAod3JhcCAhPT0gdGhpcy53cmFwKSB7XG4gICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9TLCB3cmFwKTtcbiAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1QsIHdyYXApO1xuICAgICAgICAgICAgdGhpcy53cmFwID0gd3JhcDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICAgIGNvbnN0IHtnbH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgICAgIGdsLmRlbGV0ZVRleHR1cmUodGhpcy50ZXh0dXJlKTtcbiAgICAgICAgdGhpcy50ZXh0dXJlID0gKG51bGwgICAgICk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRleHR1cmU7XG4iLCIvLyAgICAgIFxuXG5jb25zdCBMbmdMYXRCb3VuZHMgPSByZXF1aXJlKCcuLi9nZW8vbG5nX2xhdF9ib3VuZHMnKTtcbmNvbnN0IGNsYW1wID0gcmVxdWlyZSgnLi4vdXRpbC91dGlsJykuY2xhbXA7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5cbmNsYXNzIFRpbGVCb3VuZHMge1xuICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgXG5cbiAgICBjb25zdHJ1Y3Rvcihib3VuZHMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLCBtaW56b29tICAgICAgICAgLCBtYXh6b29tICAgICAgICAgKSB7XG4gICAgICAgIHRoaXMuYm91bmRzID0gTG5nTGF0Qm91bmRzLmNvbnZlcnQodGhpcy52YWxpZGF0ZUJvdW5kcyhib3VuZHMpKTtcbiAgICAgICAgdGhpcy5taW56b29tID0gbWluem9vbSB8fCAwO1xuICAgICAgICB0aGlzLm1heHpvb20gPSBtYXh6b29tIHx8IDI0O1xuICAgIH1cblxuICAgIHZhbGlkYXRlQm91bmRzKGJvdW5kcyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgLy8gbWFrZSBzdXJlIHRoZSBib3VuZHMgcHJvcGVydHkgY29udGFpbnMgdmFsaWQgbG9uZ2l0dWRlIGFuZCBsYXRpdHVkZXNcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGJvdW5kcykgfHwgYm91bmRzLmxlbmd0aCAhPT0gNCkgcmV0dXJuIFstMTgwLCAtOTAsIDE4MCwgOTBdO1xuICAgICAgICByZXR1cm4gW01hdGgubWF4KC0xODAsIGJvdW5kc1swXSksIE1hdGgubWF4KC05MCwgYm91bmRzWzFdKSwgTWF0aC5taW4oMTgwLCBib3VuZHNbMl0pLCBNYXRoLm1pbig5MCwgYm91bmRzWzNdKV07XG4gICAgfVxuXG4gICAgY29udGFpbnModGlsZUlEICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgY29uc3QgbGV2ZWwgPSB7XG4gICAgICAgICAgICBtaW5YOiBNYXRoLmZsb29yKHRoaXMubG5nWCh0aGlzLmJvdW5kcy5nZXRXZXN0KCksIHRpbGVJRC56KSksXG4gICAgICAgICAgICBtaW5ZOiBNYXRoLmZsb29yKHRoaXMubGF0WSh0aGlzLmJvdW5kcy5nZXROb3J0aCgpLCB0aWxlSUQueikpLFxuICAgICAgICAgICAgbWF4WDogTWF0aC5jZWlsKHRoaXMubG5nWCh0aGlzLmJvdW5kcy5nZXRFYXN0KCksIHRpbGVJRC56KSksXG4gICAgICAgICAgICBtYXhZOiBNYXRoLmNlaWwodGhpcy5sYXRZKHRoaXMuYm91bmRzLmdldFNvdXRoKCksIHRpbGVJRC56KSlcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgaGl0ID0gdGlsZUlELnggPj0gbGV2ZWwubWluWCAmJiB0aWxlSUQueCA8IGxldmVsLm1heFggJiYgdGlsZUlELnkgPj0gbGV2ZWwubWluWSAmJiB0aWxlSUQueSA8IGxldmVsLm1heFk7XG4gICAgICAgIHJldHVybiBoaXQ7XG4gICAgfVxuXG4gICAgbG5nWChsbmcgICAgICAgICwgem9vbSAgICAgICAgKSB7XG4gICAgICAgIHJldHVybiAobG5nICsgMTgwKSAqIChNYXRoLnBvdygyLCB6b29tKSAvIDM2MCk7XG4gICAgfVxuXG4gICAgbGF0WShsYXQgICAgICAgICwgem9vbSAgICAgICAgKSB7XG4gICAgICAgIGNvbnN0IGYgPSBjbGFtcChNYXRoLnNpbihNYXRoLlBJIC8gMTgwICogbGF0KSwgLTAuOTk5OSwgMC45OTk5KTtcbiAgICAgICAgY29uc3Qgc2NhbGUgPSBNYXRoLnBvdygyLCB6b29tKSAvICgyICogTWF0aC5QSSk7XG4gICAgICAgIHJldHVybiBNYXRoLnBvdygyLCB6b29tIC0gMSkgKyAwLjUgKiBNYXRoLmxvZygoMSArIGYpIC8gKDEgLSBmKSkgKiAtc2NhbGU7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRpbGVCb3VuZHM7XG4iLCIvLyAgICAgIFxuXG5jb25zdCB3aW5kb3cgPSByZXF1aXJlKCcuL3dpbmRvdycpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuXG4vKipcbiAqIFRoZSB0eXBlIG9mIGEgcmVzb3VyY2UuXG4gKiBAcHJpdmF0ZVxuICogQHJlYWRvbmx5XG4gKiBAZW51bSB7c3RyaW5nfVxuICovXG5jb25zdCBSZXNvdXJjZVR5cGUgPSB7XG4gICAgVW5rbm93bjogJ1Vua25vd24nLFxuICAgIFN0eWxlOiAnU3R5bGUnLFxuICAgIFNvdXJjZTogJ1NvdXJjZScsXG4gICAgVGlsZTogJ1RpbGUnLFxuICAgIEdseXBoczogJ0dseXBocycsXG4gICAgU3ByaXRlSW1hZ2U6ICdTcHJpdGVJbWFnZScsXG4gICAgU3ByaXRlSlNPTjogJ1Nwcml0ZUpTT04nLFxuICAgIEltYWdlOiAnSW1hZ2UnXG59O1xuZXhwb3J0cy5SZXNvdXJjZVR5cGUgPSBSZXNvdXJjZVR5cGU7XG5cbmlmICh0eXBlb2YgT2JqZWN0LmZyZWV6ZSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgT2JqZWN0LmZyZWV6ZShSZXNvdXJjZVR5cGUpO1xufVxuXG4vKipcbiAqIEEgYFJlcXVlc3RQYXJhbWV0ZXJzYCBvYmplY3QgdG8gYmUgcmV0dXJuZWQgZnJvbSBNYXAub3B0aW9ucy50cmFuc2Zvcm1SZXF1ZXN0IGNhbGxiYWNrcy5cbiAqIEB0eXBlZGVmIHtPYmplY3R9IFJlcXVlc3RQYXJhbWV0ZXJzXG4gKiBAcHJvcGVydHkge3N0cmluZ30gdXJsIFRoZSBVUkwgdG8gYmUgcmVxdWVzdGVkLlxuICogQHByb3BlcnR5IHtPYmplY3R9IGhlYWRlcnMgVGhlIGhlYWRlcnMgdG8gYmUgc2VudCB3aXRoIHRoZSByZXF1ZXN0LlxuICogQHByb3BlcnR5IHtzdHJpbmd9IGNyZWRlbnRpYWxzIGAnc2FtZS1vcmlnaW4nfCdpbmNsdWRlJ2AgVXNlICdpbmNsdWRlJyB0byBzZW5kIGNvb2tpZXMgd2l0aCBjcm9zcy1vcmlnaW4gcmVxdWVzdHMuXG4gKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIFxuXG5jbGFzcyBBSkFYRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gICAgICAgICAgICAgICAgICAgXG4gICAgY29uc3RydWN0b3IobWVzc2FnZSAgICAgICAgLCBzdGF0dXMgICAgICAgICkge1xuICAgICAgICBzdXBlcihtZXNzYWdlKTtcbiAgICAgICAgdGhpcy5zdGF0dXMgPSBzdGF0dXM7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBtYWtlUmVxdWVzdChyZXF1ZXN0UGFyYW1ldGVycyAgICAgICAgICAgICAgICAgICApICAgICAgICAgICAgICAgICB7XG4gICAgY29uc3QgeGhyICAgICAgICAgICAgICAgICA9IG5ldyB3aW5kb3cuWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgIHhoci5vcGVuKCdHRVQnLCByZXF1ZXN0UGFyYW1ldGVycy51cmwsIHRydWUpO1xuICAgIGZvciAoY29uc3QgayBpbiByZXF1ZXN0UGFyYW1ldGVycy5oZWFkZXJzKSB7XG4gICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKGssIHJlcXVlc3RQYXJhbWV0ZXJzLmhlYWRlcnNba10pO1xuICAgIH1cbiAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gcmVxdWVzdFBhcmFtZXRlcnMuY3JlZGVudGlhbHMgPT09ICdpbmNsdWRlJztcbiAgICByZXR1cm4geGhyO1xufVxuXG5leHBvcnRzLmdldEpTT04gPSBmdW5jdGlvbihyZXF1ZXN0UGFyYW1ldGVycyAgICAgICAgICAgICAgICAgICAsIGNhbGxiYWNrICAgICAgICAgICAgICAgICApIHtcbiAgICBjb25zdCB4aHIgPSBtYWtlUmVxdWVzdChyZXF1ZXN0UGFyYW1ldGVycyk7XG4gICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0FjY2VwdCcsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgeGhyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgY2FsbGJhY2sobmV3IEVycm9yKHhoci5zdGF0dXNUZXh0KSk7XG4gICAgfTtcbiAgICB4aHIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh4aHIuc3RhdHVzID49IDIwMCAmJiB4aHIuc3RhdHVzIDwgMzAwICYmIHhoci5yZXNwb25zZSkge1xuICAgICAgICAgICAgbGV0IGRhdGE7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGRhdGEgPSBKU09OLnBhcnNlKHhoci5yZXNwb25zZSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIGRhdGEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FsbGJhY2sobmV3IEFKQVhFcnJvcih4aHIuc3RhdHVzVGV4dCwgeGhyLnN0YXR1cykpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICB4aHIuc2VuZCgpO1xuICAgIHJldHVybiB4aHI7XG59O1xuXG5leHBvcnRzLmdldEFycmF5QnVmZmVyID0gZnVuY3Rpb24ocmVxdWVzdFBhcmFtZXRlcnMgICAgICAgICAgICAgICAgICAgLCBjYWxsYmFjayAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgIGNvbnN0IHhociA9IG1ha2VSZXF1ZXN0KHJlcXVlc3RQYXJhbWV0ZXJzKTtcbiAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2FycmF5YnVmZmVyJztcbiAgICB4aHIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBjYWxsYmFjayhuZXcgRXJyb3IoeGhyLnN0YXR1c1RleHQpKTtcbiAgICB9O1xuICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgICAgICAgICAgICAgID0geGhyLnJlc3BvbnNlO1xuICAgICAgICBpZiAocmVzcG9uc2UuYnl0ZUxlbmd0aCA9PT0gMCAmJiB4aHIuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhuZXcgRXJyb3IoJ2h0dHAgc3RhdHVzIDIwMCByZXR1cm5lZCB3aXRob3V0IGNvbnRlbnQuJykpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh4aHIuc3RhdHVzID49IDIwMCAmJiB4aHIuc3RhdHVzIDwgMzAwICYmIHhoci5yZXNwb25zZSkge1xuICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwge1xuICAgICAgICAgICAgICAgIGRhdGE6IHJlc3BvbnNlLFxuICAgICAgICAgICAgICAgIGNhY2hlQ29udHJvbDogeGhyLmdldFJlc3BvbnNlSGVhZGVyKCdDYWNoZS1Db250cm9sJyksXG4gICAgICAgICAgICAgICAgZXhwaXJlczogeGhyLmdldFJlc3BvbnNlSGVhZGVyKCdFeHBpcmVzJylcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FsbGJhY2sobmV3IEFKQVhFcnJvcih4aHIuc3RhdHVzVGV4dCwgeGhyLnN0YXR1cykpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICB4aHIuc2VuZCgpO1xuICAgIHJldHVybiB4aHI7XG59O1xuXG5mdW5jdGlvbiBzYW1lT3JpZ2luKHVybCkge1xuICAgIGNvbnN0IGEgICAgICAgICAgICAgICAgICAgID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICBhLmhyZWYgPSB1cmw7XG4gICAgcmV0dXJuIGEucHJvdG9jb2wgPT09IHdpbmRvdy5kb2N1bWVudC5sb2NhdGlvbi5wcm90b2NvbCAmJiBhLmhvc3QgPT09IHdpbmRvdy5kb2N1bWVudC5sb2NhdGlvbi5ob3N0O1xufVxuXG5jb25zdCB0cmFuc3BhcmVudFBuZ1VybCA9ICdkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUFFQUFBQUJDQVlBQUFBZkZjU0pBQUFBQzBsRVFWUVlWMk5nQUFJQUFBVUFBYXJWeUZFQUFBQUFTVVZPUks1Q1lJST0nO1xuXG5leHBvcnRzLmdldEltYWdlID0gZnVuY3Rpb24ocmVxdWVzdFBhcmFtZXRlcnMgICAgICAgICAgICAgICAgICAgLCBjYWxsYmFjayAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAvLyByZXF1ZXN0IHRoZSBpbWFnZSB3aXRoIFhIUiB0byB3b3JrIGFyb3VuZCBjYWNoaW5nIGlzc3Vlc1xuICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vbWFwYm94L21hcGJveC1nbC1qcy9pc3N1ZXMvMTQ3MFxuICAgIHJldHVybiBleHBvcnRzLmdldEFycmF5QnVmZmVyKHJlcXVlc3RQYXJhbWV0ZXJzLCAoZXJyLCBpbWdEYXRhKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgIH0gZWxzZSBpZiAoaW1nRGF0YSkge1xuICAgICAgICAgICAgY29uc3QgaW1nICAgICAgICAgICAgICAgICAgID0gbmV3IHdpbmRvdy5JbWFnZSgpO1xuICAgICAgICAgICAgY29uc3QgVVJMID0gd2luZG93LlVSTCB8fCB3aW5kb3cud2Via2l0VVJMO1xuICAgICAgICAgICAgaW1nLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCBpbWcpO1xuICAgICAgICAgICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwoaW1nLnNyYyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgYmxvYiAgICAgICA9IG5ldyB3aW5kb3cuQmxvYihbbmV3IFVpbnQ4QXJyYXkoaW1nRGF0YS5kYXRhKV0sIHsgdHlwZTogJ2ltYWdlL3BuZycgfSk7XG4gICAgICAgICAgICAoaW1nICAgICApLmNhY2hlQ29udHJvbCA9IGltZ0RhdGEuY2FjaGVDb250cm9sO1xuICAgICAgICAgICAgKGltZyAgICAgKS5leHBpcmVzID0gaW1nRGF0YS5leHBpcmVzO1xuICAgICAgICAgICAgaW1nLnNyYyA9IGltZ0RhdGEuZGF0YS5ieXRlTGVuZ3RoID8gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKSA6IHRyYW5zcGFyZW50UG5nVXJsO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG5leHBvcnRzLmdldFZpZGVvID0gZnVuY3Rpb24odXJscyAgICAgICAgICAgICAgICwgY2FsbGJhY2sgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgY29uc3QgdmlkZW8gICAgICAgICAgICAgICAgICAgPSB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndmlkZW8nKTtcbiAgICB2aWRlby5vbmxvYWRzdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBjYWxsYmFjayhudWxsLCB2aWRlbyk7XG4gICAgfTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHVybHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgcyAgICAgICAgICAgICAgICAgICAgPSB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc291cmNlJyk7XG4gICAgICAgIGlmICghc2FtZU9yaWdpbih1cmxzW2ldKSkge1xuICAgICAgICAgICAgdmlkZW8uY3Jvc3NPcmlnaW4gPSAnQW5vbnltb3VzJztcbiAgICAgICAgfVxuICAgICAgICBzLnNyYyA9IHVybHNbaV07XG4gICAgICAgIHZpZGVvLmFwcGVuZENoaWxkKHMpO1xuICAgIH1cbiAgICByZXR1cm4gdmlkZW87XG59O1xuIiwiLy8gICAgICBcblxuY29uc3Qgd2luZG93ID0gcmVxdWlyZSgnLi93aW5kb3cnKTtcblxuY29uc3Qgbm93ID0gd2luZG93LnBlcmZvcm1hbmNlICYmIHdpbmRvdy5wZXJmb3JtYW5jZS5ub3cgP1xuICAgIHdpbmRvdy5wZXJmb3JtYW5jZS5ub3cuYmluZCh3aW5kb3cucGVyZm9ybWFuY2UpIDpcbiAgICBEYXRlLm5vdy5iaW5kKERhdGUpO1xuXG5jb25zdCBmcmFtZSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgIHdpbmRvdy5tc1JlcXVlc3RBbmltYXRpb25GcmFtZTtcblxuY29uc3QgY2FuY2VsID0gd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgd2luZG93Lm1vekNhbmNlbEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgd2luZG93LndlYmtpdENhbmNlbEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgd2luZG93Lm1zQ2FuY2VsQW5pbWF0aW9uRnJhbWU7XG5cbi8qKlxuICogQHByaXZhdGVcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgLyoqXG4gICAgICogUHJvdmlkZXMgYSBmdW5jdGlvbiB0aGF0IG91dHB1dHMgbWlsbGlzZWNvbmRzOiBlaXRoZXIgcGVyZm9ybWFuY2Uubm93KClcbiAgICAgKiBvciBhIGZhbGxiYWNrIHRvIERhdGUubm93KClcbiAgICAgKi9cbiAgICBub3csXG5cbiAgICBmcmFtZShmbiAgICAgICAgICApIHtcbiAgICAgICAgcmV0dXJuIGZyYW1lKGZuKTtcbiAgICB9LFxuXG4gICAgY2FuY2VsRnJhbWUoaWQgICAgICAgICkge1xuICAgICAgICByZXR1cm4gY2FuY2VsKGlkKTtcbiAgICB9LFxuXG4gICAgZ2V0SW1hZ2VEYXRhKGltZyAgICAgICAgICAgICAgICAgICApICAgICAgICAgICAge1xuICAgICAgICBjb25zdCBjYW52YXMgPSB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgIGNvbnN0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgaWYgKCFjb250ZXh0KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ZhaWxlZCB0byBjcmVhdGUgY2FudmFzIDJkIGNvbnRleHQnKTtcbiAgICAgICAgfVxuICAgICAgICBjYW52YXMud2lkdGggPSBpbWcud2lkdGg7XG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSBpbWcuaGVpZ2h0O1xuICAgICAgICBjb250ZXh0LmRyYXdJbWFnZShpbWcsIDAsIDAsIGltZy53aWR0aCwgaW1nLmhlaWdodCk7XG4gICAgICAgIHJldHVybiBjb250ZXh0LmdldEltYWdlRGF0YSgwLCAwLCBpbWcud2lkdGgsIGltZy5oZWlnaHQpO1xuICAgIH0sXG5cbiAgICBoYXJkd2FyZUNvbmN1cnJlbmN5OiB3aW5kb3cubmF2aWdhdG9yLmhhcmR3YXJlQ29uY3VycmVuY3kgfHwgNCxcblxuICAgIGdldCBkZXZpY2VQaXhlbFJhdGlvKCkgeyByZXR1cm4gd2luZG93LmRldmljZVBpeGVsUmF0aW87IH0sXG5cbiAgICBzdXBwb3J0c1dlYnA6IGZhbHNlXG59O1xuXG5jb25zdCB3ZWJwSW1nVGVzdCA9IHdpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcbndlYnBJbWdUZXN0Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIG1vZHVsZS5leHBvcnRzLnN1cHBvcnRzV2VicCA9IHRydWU7XG59O1xud2VicEltZ1Rlc3Quc3JjID0gJ2RhdGE6aW1hZ2Uvd2VicDtiYXNlNjQsVWtsR1JoNEFBQUJYUlVKUVZsQTRUQkVBQUFBdkFRQUFBQWZRLy83M3YvK0JpT2gvQUFBPSc7XG4iLCIvLyAgICAgIFxuXG4vKiBlc2xpbnQtZW52IGJyb3dzZXIgKi9cbm1vZHVsZS5leHBvcnRzID0gKHNlbGYgICAgICAgICk7XG4iLCIvLyAgICAgIFxuXG5jb25zdCB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuXG5mdW5jdGlvbiBfYWRkRXZlbnRMaXN0ZW5lcih0eXBlICAgICAgICAsIGxpc3RlbmVyICAgICAgICAgICwgbGlzdGVuZXJMaXN0ICAgICAgICAgICApIHtcbiAgICBsaXN0ZW5lckxpc3RbdHlwZV0gPSBsaXN0ZW5lckxpc3RbdHlwZV0gfHwgW107XG4gICAgbGlzdGVuZXJMaXN0W3R5cGVdLnB1c2gobGlzdGVuZXIpO1xufVxuXG5mdW5jdGlvbiBfcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlICAgICAgICAsIGxpc3RlbmVyICAgICAgICAgICwgbGlzdGVuZXJMaXN0ICAgICAgICAgICApIHtcbiAgICBpZiAobGlzdGVuZXJMaXN0ICYmIGxpc3RlbmVyTGlzdFt0eXBlXSkge1xuICAgICAgICBjb25zdCBpbmRleCA9IGxpc3RlbmVyTGlzdFt0eXBlXS5pbmRleE9mKGxpc3RlbmVyKTtcbiAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgbGlzdGVuZXJMaXN0W3R5cGVdLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogTWV0aG9kcyBtaXhlZCBpbiB0byBvdGhlciBjbGFzc2VzIGZvciBldmVudCBjYXBhYmlsaXRpZXMuXG4gKlxuICogQG1peGluIEV2ZW50ZWRcbiAqL1xuY2xhc3MgRXZlbnRlZCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuXG4gICAgLyoqXG4gICAgICogQWRkcyBhIGxpc3RlbmVyIHRvIGEgc3BlY2lmaWVkIGV2ZW50IHR5cGUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBUaGUgZXZlbnQgdHlwZSB0byBhZGQgYSBsaXN0ZW4gZm9yLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyIFRoZSBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiB0aGUgZXZlbnQgaXMgZmlyZWQuXG4gICAgICogICBUaGUgbGlzdGVuZXIgZnVuY3Rpb24gaXMgY2FsbGVkIHdpdGggdGhlIGRhdGEgb2JqZWN0IHBhc3NlZCB0byBgZmlyZWAsXG4gICAgICogICBleHRlbmRlZCB3aXRoIGB0YXJnZXRgIGFuZCBgdHlwZWAgcHJvcGVydGllcy5cbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBgdGhpc2BcbiAgICAgKi9cbiAgICBvbih0eXBlICAgLCBsaXN0ZW5lciAgICAgICAgICApICAgICAgIHtcbiAgICAgICAgdGhpcy5fbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzIHx8IHt9O1xuICAgICAgICBfYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgdGhpcy5fbGlzdGVuZXJzKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGEgcHJldmlvdXNseSByZWdpc3RlcmVkIGV2ZW50IGxpc3RlbmVyLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgVGhlIGV2ZW50IHR5cGUgdG8gcmVtb3ZlIGxpc3RlbmVycyBmb3IuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXIgVGhlIGxpc3RlbmVyIGZ1bmN0aW9uIHRvIHJlbW92ZS5cbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBgdGhpc2BcbiAgICAgKi9cbiAgICBvZmYodHlwZSAgICwgbGlzdGVuZXIgICAgICAgICAgKSB7XG4gICAgICAgIF9yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCB0aGlzLl9saXN0ZW5lcnMpO1xuICAgICAgICBfcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgdGhpcy5fb25lVGltZUxpc3RlbmVycyk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBhIGxpc3RlbmVyIHRoYXQgd2lsbCBiZSBjYWxsZWQgb25seSBvbmNlIHRvIGEgc3BlY2lmaWVkIGV2ZW50IHR5cGUuXG4gICAgICpcbiAgICAgKiBUaGUgbGlzdGVuZXIgd2lsbCBiZSBjYWxsZWQgZmlyc3QgdGltZSB0aGUgZXZlbnQgZmlyZXMgYWZ0ZXIgdGhlIGxpc3RlbmVyIGlzIHJlZ2lzdGVyZWQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBUaGUgZXZlbnQgdHlwZSB0byBsaXN0ZW4gZm9yLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyIFRoZSBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiB0aGUgZXZlbnQgaXMgZmlyZWQgdGhlIGZpcnN0IHRpbWUuXG4gICAgICogQHJldHVybnMge09iamVjdH0gYHRoaXNgXG4gICAgICovXG4gICAgb25jZSh0eXBlICAgICAgICAsIGxpc3RlbmVyICAgICAgICAgICkge1xuICAgICAgICB0aGlzLl9vbmVUaW1lTGlzdGVuZXJzID0gdGhpcy5fb25lVGltZUxpc3RlbmVycyB8fCB7fTtcbiAgICAgICAgX2FkZEV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIHRoaXMuX29uZVRpbWVMaXN0ZW5lcnMpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZpcmVzIGFuIGV2ZW50IG9mIHRoZSBzcGVjaWZpZWQgdHlwZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIFRoZSB0eXBlIG9mIGV2ZW50IHRvIGZpcmUuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtkYXRhXSBEYXRhIHRvIGJlIHBhc3NlZCB0byBhbnkgbGlzdGVuZXJzLlxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IGB0aGlzYFxuICAgICAqL1xuICAgIGZpcmUodHlwZSAgICAgICAgLCBkYXRhICAgICAgICAgKSB7XG4gICAgICAgIGlmICh0aGlzLmxpc3RlbnModHlwZSkpIHtcbiAgICAgICAgICAgIGRhdGEgPSB1dGlsLmV4dGVuZCh7fSwgZGF0YSwge3R5cGU6IHR5cGUsIHRhcmdldDogdGhpc30pO1xuXG4gICAgICAgICAgICAvLyBtYWtlIHN1cmUgYWRkaW5nIG9yIHJlbW92aW5nIGxpc3RlbmVycyBpbnNpZGUgb3RoZXIgbGlzdGVuZXJzIHdvbid0IGNhdXNlIGFuIGluZmluaXRlIGxvb3BcbiAgICAgICAgICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycyAmJiB0aGlzLl9saXN0ZW5lcnNbdHlwZV0gPyB0aGlzLl9saXN0ZW5lcnNbdHlwZV0uc2xpY2UoKSA6IFtdO1xuICAgICAgICAgICAgZm9yIChjb25zdCBsaXN0ZW5lciBvZiBsaXN0ZW5lcnMpIHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lci5jYWxsKHRoaXMsIGRhdGEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBvbmVUaW1lTGlzdGVuZXJzID0gdGhpcy5fb25lVGltZUxpc3RlbmVycyAmJiB0aGlzLl9vbmVUaW1lTGlzdGVuZXJzW3R5cGVdID8gdGhpcy5fb25lVGltZUxpc3RlbmVyc1t0eXBlXS5zbGljZSgpIDogW107XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGxpc3RlbmVyIG9mIG9uZVRpbWVMaXN0ZW5lcnMpIHtcbiAgICAgICAgICAgICAgICBfcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgdGhpcy5fb25lVGltZUxpc3RlbmVycyk7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXIuY2FsbCh0aGlzLCBkYXRhKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMuX2V2ZW50ZWRQYXJlbnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9ldmVudGVkUGFyZW50LmZpcmUodHlwZSwgdXRpbC5leHRlbmQoe30sIGRhdGEsIHR5cGVvZiB0aGlzLl9ldmVudGVkUGFyZW50RGF0YSA9PT0gJ2Z1bmN0aW9uJyA/IHRoaXMuX2V2ZW50ZWRQYXJlbnREYXRhKCkgOiB0aGlzLl9ldmVudGVkUGFyZW50RGF0YSkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIC8vIFRvIGVuc3VyZSB0aGF0IG5vIGVycm9yIGV2ZW50cyBhcmUgZHJvcHBlZCwgcHJpbnQgdGhlbSB0byB0aGVcbiAgICAgICAgLy8gY29uc29sZSBpZiB0aGV5IGhhdmUgbm8gbGlzdGVuZXJzLlxuICAgICAgICB9IGVsc2UgaWYgKHV0aWwuZW5kc1dpdGgodHlwZSwgJ2Vycm9yJykpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoKGRhdGEgJiYgZGF0YS5lcnJvcikgfHwgZGF0YSB8fCAnRW1wdHkgZXJyb3IgZXZlbnQnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSB0cnVlIGlmIHRoaXMgaW5zdGFuY2Ugb2YgRXZlbnRlZCBvciBhbnkgZm9yd2FyZGVlZCBpbnN0YW5jZXMgb2YgRXZlbnRlZCBoYXZlIGEgbGlzdGVuZXIgZm9yIHRoZSBzcGVjaWZpZWQgdHlwZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIFRoZSBldmVudCB0eXBlXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IGB0cnVlYCBpZiB0aGVyZSBpcyBhdCBsZWFzdCBvbmUgcmVnaXN0ZXJlZCBsaXN0ZW5lciBmb3Igc3BlY2lmaWVkIGV2ZW50IHR5cGUsIGBmYWxzZWAgb3RoZXJ3aXNlXG4gICAgICovXG4gICAgbGlzdGVucyh0eXBlICAgICAgICApIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICh0aGlzLl9saXN0ZW5lcnMgJiYgdGhpcy5fbGlzdGVuZXJzW3R5cGVdICYmIHRoaXMuX2xpc3RlbmVyc1t0eXBlXS5sZW5ndGggPiAwKSB8fFxuICAgICAgICAgICAgKHRoaXMuX29uZVRpbWVMaXN0ZW5lcnMgJiYgdGhpcy5fb25lVGltZUxpc3RlbmVyc1t0eXBlXSAmJiB0aGlzLl9vbmVUaW1lTGlzdGVuZXJzW3R5cGVdLmxlbmd0aCA+IDApIHx8XG4gICAgICAgICAgICAodGhpcy5fZXZlbnRlZFBhcmVudCAmJiB0aGlzLl9ldmVudGVkUGFyZW50Lmxpc3RlbnModHlwZSkpXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQnViYmxlIGFsbCBldmVudHMgZmlyZWQgYnkgdGhpcyBpbnN0YW5jZSBvZiBFdmVudGVkIHRvIHRoaXMgcGFyZW50IGluc3RhbmNlIG9mIEV2ZW50ZWQuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IGB0aGlzYFxuICAgICAqL1xuICAgIHNldEV2ZW50ZWRQYXJlbnQocGFyZW50ICAgICAgICAgICwgZGF0YSAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICB0aGlzLl9ldmVudGVkUGFyZW50ID0gcGFyZW50O1xuICAgICAgICB0aGlzLl9ldmVudGVkUGFyZW50RGF0YSA9IGRhdGE7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50ZWQ7XG4iLCIvLyAgICAgIFxuXG5jb25zdCBVbml0QmV6aWVyID0gcmVxdWlyZSgnQG1hcGJveC91bml0YmV6aWVyJyk7XG5jb25zdCBDb29yZGluYXRlID0gcmVxdWlyZSgnLi4vZ2VvL2Nvb3JkaW5hdGUnKTtcbmNvbnN0IFBvaW50ID0gcmVxdWlyZSgnQG1hcGJveC9wb2ludC1nZW9tZXRyeScpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcblxuLyoqXG4gKiBAbW9kdWxlIHV0aWxcbiAqIEBwcml2YXRlXG4gKi9cblxuLyoqXG4gKiBHaXZlbiBhIHZhbHVlIGB0YCB0aGF0IHZhcmllcyBiZXR3ZWVuIDAgYW5kIDEsIHJldHVyblxuICogYW4gaW50ZXJwb2xhdGlvbiBmdW5jdGlvbiB0aGF0IGVhc2VzIGJldHdlZW4gMCBhbmQgMSBpbiBhIHBsZWFzaW5nXG4gKiBjdWJpYyBpbi1vdXQgZmFzaGlvbi5cbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnRzLmVhc2VDdWJpY0luT3V0ID0gZnVuY3Rpb24odCAgICAgICAgKSAgICAgICAgIHtcbiAgICBpZiAodCA8PSAwKSByZXR1cm4gMDtcbiAgICBpZiAodCA+PSAxKSByZXR1cm4gMTtcbiAgICBjb25zdCB0MiA9IHQgKiB0LFxuICAgICAgICB0MyA9IHQyICogdDtcbiAgICByZXR1cm4gNCAqICh0IDwgMC41ID8gdDMgOiAzICogKHQgLSB0MikgKyB0MyAtIDAuNzUpO1xufTtcblxuLyoqXG4gKiBHaXZlbiBnaXZlbiAoeCwgeSksICh4MSwgeTEpIGNvbnRyb2wgcG9pbnRzIGZvciBhIGJlemllciBjdXJ2ZSxcbiAqIHJldHVybiBhIGZ1bmN0aW9uIHRoYXQgaW50ZXJwb2xhdGVzIGFsb25nIHRoYXQgY3VydmUuXG4gKlxuICogQHBhcmFtIHAxeCBjb250cm9sIHBvaW50IDEgeCBjb29yZGluYXRlXG4gKiBAcGFyYW0gcDF5IGNvbnRyb2wgcG9pbnQgMSB5IGNvb3JkaW5hdGVcbiAqIEBwYXJhbSBwMnggY29udHJvbCBwb2ludCAyIHggY29vcmRpbmF0ZVxuICogQHBhcmFtIHAyeSBjb250cm9sIHBvaW50IDIgeSBjb29yZGluYXRlXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnRzLmJlemllciA9IGZ1bmN0aW9uKHAxeCAgICAgICAgLCBwMXkgICAgICAgICwgcDJ4ICAgICAgICAsIHAyeSAgICAgICAgKSAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICBjb25zdCBiZXppZXIgPSBuZXcgVW5pdEJlemllcihwMXgsIHAxeSwgcDJ4LCBwMnkpO1xuICAgIHJldHVybiBmdW5jdGlvbih0ICAgICAgICApIHtcbiAgICAgICAgcmV0dXJuIGJlemllci5zb2x2ZSh0KTtcbiAgICB9O1xufTtcblxuLyoqXG4gKiBBIGRlZmF1bHQgYmV6aWVyLWN1cnZlIHBvd2VyZWQgZWFzaW5nIGZ1bmN0aW9uIHdpdGhcbiAqIGNvbnRyb2wgcG9pbnRzICgwLjI1LCAwLjEpIGFuZCAoMC4yNSwgMSlcbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnRzLmVhc2UgPSBleHBvcnRzLmJlemllcigwLjI1LCAwLjEsIDAuMjUsIDEpO1xuXG4vKipcbiAqIGNvbnN0cmFpbiBuIHRvIHRoZSBnaXZlbiByYW5nZSB2aWEgbWluICsgbWF4XG4gKlxuICogQHBhcmFtIG4gdmFsdWVcbiAqIEBwYXJhbSBtaW4gdGhlIG1pbmltdW0gdmFsdWUgdG8gYmUgcmV0dXJuZWRcbiAqIEBwYXJhbSBtYXggdGhlIG1heGltdW0gdmFsdWUgdG8gYmUgcmV0dXJuZWRcbiAqIEByZXR1cm5zIHRoZSBjbGFtcGVkIHZhbHVlXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnRzLmNsYW1wID0gZnVuY3Rpb24gKG4gICAgICAgICwgbWluICAgICAgICAsIG1heCAgICAgICAgKSAgICAgICAgIHtcbiAgICByZXR1cm4gTWF0aC5taW4obWF4LCBNYXRoLm1heChtaW4sIG4pKTtcbn07XG5cbi8qKlxuICogY29uc3RyYWluIG4gdG8gdGhlIGdpdmVuIHJhbmdlLCBleGNsdWRpbmcgdGhlIG1pbmltdW0sIHZpYSBtb2R1bGFyIGFyaXRobWV0aWNcbiAqXG4gKiBAcGFyYW0gbiB2YWx1ZVxuICogQHBhcmFtIG1pbiB0aGUgbWluaW11bSB2YWx1ZSB0byBiZSByZXR1cm5lZCwgZXhjbHVzaXZlXG4gKiBAcGFyYW0gbWF4IHRoZSBtYXhpbXVtIHZhbHVlIHRvIGJlIHJldHVybmVkLCBpbmNsdXNpdmVcbiAqIEByZXR1cm5zIGNvbnN0cmFpbmVkIG51bWJlclxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0cy53cmFwID0gZnVuY3Rpb24gKG4gICAgICAgICwgbWluICAgICAgICAsIG1heCAgICAgICAgKSAgICAgICAgIHtcbiAgICBjb25zdCBkID0gbWF4IC0gbWluO1xuICAgIGNvbnN0IHcgPSAoKG4gLSBtaW4pICUgZCArIGQpICUgZCArIG1pbjtcbiAgICByZXR1cm4gKHcgPT09IG1pbikgPyBtYXggOiB3O1xufTtcblxuLypcbiAqIENhbGwgYW4gYXN5bmNocm9ub3VzIGZ1bmN0aW9uIG9uIGFuIGFycmF5IG9mIGFyZ3VtZW50cyxcbiAqIGNhbGxpbmcgYGNhbGxiYWNrYCB3aXRoIHRoZSBjb21wbGV0ZWQgcmVzdWx0cyBvZiBhbGwgY2FsbHMuXG4gKlxuICogQHBhcmFtIGFycmF5IGlucHV0IHRvIGVhY2ggY2FsbCBvZiB0aGUgYXN5bmMgZnVuY3Rpb24uXG4gKiBAcGFyYW0gZm4gYW4gYXN5bmMgZnVuY3Rpb24gd2l0aCBzaWduYXR1cmUgKGRhdGEsIGNhbGxiYWNrKVxuICogQHBhcmFtIGNhbGxiYWNrIGEgY2FsbGJhY2sgcnVuIGFmdGVyIGFsbCBhc3luYyB3b3JrIGlzIGRvbmUuXG4gKiBjYWxsZWQgd2l0aCBhbiBhcnJheSwgY29udGFpbmluZyB0aGUgcmVzdWx0cyBvZiBlYWNoIGFzeW5jIGNhbGwuXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnRzLmFzeW5jQWxsID0gZnVuY3Rpb24gICAgICAgICAgICAgICAoXG4gICAgYXJyYXkgICAgICAgICAgICAgLFxuICAgIGZuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICxcbiAgICBjYWxsYmFjayAgICAgICAgICAgICAgICAgICAgICAgICBcbikge1xuICAgIGlmICghYXJyYXkubGVuZ3RoKSB7IHJldHVybiBjYWxsYmFjayhudWxsLCBbXSk7IH1cbiAgICBsZXQgcmVtYWluaW5nID0gYXJyYXkubGVuZ3RoO1xuICAgIGNvbnN0IHJlc3VsdHMgPSBuZXcgQXJyYXkoYXJyYXkubGVuZ3RoKTtcbiAgICBsZXQgZXJyb3IgPSBudWxsO1xuICAgIGFycmF5LmZvckVhY2goKGl0ZW0sIGkpID0+IHtcbiAgICAgICAgZm4oaXRlbSwgKGVyciwgcmVzdWx0KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKSBlcnJvciA9IGVycjtcbiAgICAgICAgICAgIHJlc3VsdHNbaV0gPSAoKHJlc3VsdCAgICAgKSAgICAgICAgKTsgLy8gaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL2Zsb3cvaXNzdWVzLzIxMjNcbiAgICAgICAgICAgIGlmICgtLXJlbWFpbmluZyA9PT0gMCkgY2FsbGJhY2soZXJyb3IsIHJlc3VsdHMpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn07XG5cbi8qXG4gKiBQb2x5ZmlsbCBmb3IgT2JqZWN0LnZhbHVlcy4gTm90IGZ1bGx5IHNwZWMgY29tcGxpYW50LCBidXQgd2UgZG9uJ3RcbiAqIG5lZWQgaXQgdG8gYmUuXG4gKlxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0cy52YWx1ZXMgPSBmdW5jdGlvbiAgIChvYmogICAgICAgICAgICAgICAgICAgICkgICAgICAgICAgIHtcbiAgICBjb25zdCByZXN1bHQgPSBbXTtcbiAgICBmb3IgKGNvbnN0IGsgaW4gb2JqKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKG9ialtrXSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKlxuICogQ29tcHV0ZSB0aGUgZGlmZmVyZW5jZSBiZXR3ZWVuIHRoZSBrZXlzIGluIG9uZSBvYmplY3QgYW5kIHRoZSBrZXlzXG4gKiBpbiBhbm90aGVyIG9iamVjdC5cbiAqXG4gKiBAcmV0dXJucyBrZXlzIGRpZmZlcmVuY2VcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydHMua2V5c0RpZmZlcmVuY2UgPSBmdW5jdGlvbiAgICAgIChvYmogICAgICAgICAgICAgICAgICAgICwgb3RoZXIgICAgICAgICAgICAgICAgICAgICkgICAgICAgICAgICAgICAge1xuICAgIGNvbnN0IGRpZmZlcmVuY2UgPSBbXTtcbiAgICBmb3IgKGNvbnN0IGkgaW4gb2JqKSB7XG4gICAgICAgIGlmICghKGkgaW4gb3RoZXIpKSB7XG4gICAgICAgICAgICBkaWZmZXJlbmNlLnB1c2goaSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRpZmZlcmVuY2U7XG59O1xuXG4vKipcbiAqIEdpdmVuIGEgZGVzdGluYXRpb24gb2JqZWN0IGFuZCBvcHRpb25hbGx5IG1hbnkgc291cmNlIG9iamVjdHMsXG4gKiBjb3B5IGFsbCBwcm9wZXJ0aWVzIGZyb20gdGhlIHNvdXJjZSBvYmplY3RzIGludG8gdGhlIGRlc3RpbmF0aW9uLlxuICogVGhlIGxhc3Qgc291cmNlIG9iamVjdCBnaXZlbiBvdmVycmlkZXMgcHJvcGVydGllcyBmcm9tIHByZXZpb3VzXG4gKiBzb3VyY2Ugb2JqZWN0cy5cbiAqXG4gKiBAcGFyYW0gZGVzdCBkZXN0aW5hdGlvbiBvYmplY3RcbiAqIEBwYXJhbSBzb3VyY2VzIHNvdXJjZXMgZnJvbSB3aGljaCBwcm9wZXJ0aWVzIGFyZSBwdWxsZWRcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydHMuZXh0ZW5kID0gZnVuY3Rpb24gKGRlc3QgICAgICAgICwgLi4uc291cmNlcyAgICAgICAgICAgICAgICApICAgICAgICAge1xuICAgIGZvciAoY29uc3Qgc3JjIG9mIHNvdXJjZXMpIHtcbiAgICAgICAgZm9yIChjb25zdCBrIGluIHNyYykge1xuICAgICAgICAgICAgZGVzdFtrXSA9IHNyY1trXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGVzdDtcbn07XG5cbi8qKlxuICogR2l2ZW4gYW4gb2JqZWN0IGFuZCBhIG51bWJlciBvZiBwcm9wZXJ0aWVzIGFzIHN0cmluZ3MsIHJldHVybiB2ZXJzaW9uXG4gKiBvZiB0aGF0IG9iamVjdCB3aXRoIG9ubHkgdGhvc2UgcHJvcGVydGllcy5cbiAqXG4gKiBAcGFyYW0gc3JjIHRoZSBvYmplY3RcbiAqIEBwYXJhbSBwcm9wZXJ0aWVzIGFuIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzIGNob3NlblxuICogdG8gYXBwZWFyIG9uIHRoZSByZXN1bHRpbmcgb2JqZWN0LlxuICogQHJldHVybnMgb2JqZWN0IHdpdGggbGltaXRlZCBwcm9wZXJ0aWVzLlxuICogQGV4YW1wbGVcbiAqIHZhciBmb28gPSB7IG5hbWU6ICdDaGFybGllJywgYWdlOiAxMCB9O1xuICogdmFyIGp1c3ROYW1lID0gcGljayhmb28sIFsnbmFtZSddKTtcbiAqIC8vIGp1c3ROYW1lID0geyBuYW1lOiAnQ2hhcmxpZScgfVxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0cy5waWNrID0gZnVuY3Rpb24gKHNyYyAgICAgICAgLCBwcm9wZXJ0aWVzICAgICAgICAgICAgICAgKSAgICAgICAgIHtcbiAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByb3BlcnRpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgayA9IHByb3BlcnRpZXNbaV07XG4gICAgICAgIGlmIChrIGluIHNyYykge1xuICAgICAgICAgICAgcmVzdWx0W2tdID0gc3JjW2tdO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG5sZXQgaWQgPSAxO1xuXG4vKipcbiAqIFJldHVybiBhIHVuaXF1ZSBudW1lcmljIGlkLCBzdGFydGluZyBhdCAxIGFuZCBpbmNyZW1lbnRpbmcgd2l0aFxuICogZWFjaCBjYWxsLlxuICpcbiAqIEByZXR1cm5zIHVuaXF1ZSBudW1lcmljIGlkLlxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0cy51bmlxdWVJZCA9IGZ1bmN0aW9uICgpICAgICAgICAge1xuICAgIHJldHVybiBpZCsrO1xufTtcblxuLyoqXG4gKiBHaXZlbiBhbiBhcnJheSBvZiBtZW1iZXIgZnVuY3Rpb24gbmFtZXMgYXMgc3RyaW5ncywgcmVwbGFjZSBhbGwgb2YgdGhlbVxuICogd2l0aCBib3VuZCB2ZXJzaW9ucyB0aGF0IHdpbGwgYWx3YXlzIHJlZmVyIHRvIGBjb250ZXh0YCBhcyBgdGhpc2AuIFRoaXNcbiAqIGlzIHVzZWZ1bCBmb3IgY2xhc3NlcyB3aGVyZSBvdGhlcndpc2UgZXZlbnQgYmluZGluZ3Mgd291bGQgcmVhc3NpZ25cbiAqIGB0aGlzYCB0byB0aGUgZXZlbnRlZCBvYmplY3Qgb3Igc29tZSBvdGhlciB2YWx1ZTogdGhpcyBsZXRzIHlvdSBlbnN1cmVcbiAqIHRoZSBgdGhpc2AgdmFsdWUgYWx3YXlzLlxuICpcbiAqIEBwYXJhbSBmbnMgbGlzdCBvZiBtZW1iZXIgZnVuY3Rpb24gbmFtZXNcbiAqIEBwYXJhbSBjb250ZXh0IHRoZSBjb250ZXh0IHZhbHVlXG4gKiBAZXhhbXBsZVxuICogZnVuY3Rpb24gTXlDbGFzcygpIHtcbiAqICAgYmluZEFsbChbJ29udGltZXInXSwgdGhpcyk7XG4gKiAgIHRoaXMubmFtZSA9ICdUb20nO1xuICogfVxuICogTXlDbGFzcy5wcm90b3R5cGUub250aW1lciA9IGZ1bmN0aW9uKCkge1xuICogICBhbGVydCh0aGlzLm5hbWUpO1xuICogfTtcbiAqIHZhciBteUNsYXNzID0gbmV3IE15Q2xhc3MoKTtcbiAqIHNldFRpbWVvdXQobXlDbGFzcy5vbnRpbWVyLCAxMDApO1xuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0cy5iaW5kQWxsID0gZnVuY3Rpb24oZm5zICAgICAgICAgICAgICAgLCBjb250ZXh0ICAgICAgICApICAgICAgIHtcbiAgICBmbnMuZm9yRWFjaCgoZm4pID0+IHtcbiAgICAgICAgaWYgKCFjb250ZXh0W2ZuXSkgeyByZXR1cm47IH1cbiAgICAgICAgY29udGV4dFtmbl0gPSBjb250ZXh0W2ZuXS5iaW5kKGNvbnRleHQpO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBHaXZlbiBhIGxpc3Qgb2YgY29vcmRpbmF0ZXMsIGdldCB0aGVpciBjZW50ZXIgYXMgYSBjb29yZGluYXRlLlxuICpcbiAqIEByZXR1cm5zIGNlbnRlcnBvaW50XG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnRzLmdldENvb3JkaW5hdGVzQ2VudGVyID0gZnVuY3Rpb24oY29vcmRzICAgICAgICAgICAgICAgICAgICkgICAgICAgICAgICAge1xuICAgIGxldCBtaW5YID0gSW5maW5pdHk7XG4gICAgbGV0IG1pblkgPSBJbmZpbml0eTtcbiAgICBsZXQgbWF4WCA9IC1JbmZpbml0eTtcbiAgICBsZXQgbWF4WSA9IC1JbmZpbml0eTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29vcmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIG1pblggPSBNYXRoLm1pbihtaW5YLCBjb29yZHNbaV0uY29sdW1uKTtcbiAgICAgICAgbWluWSA9IE1hdGgubWluKG1pblksIGNvb3Jkc1tpXS5yb3cpO1xuICAgICAgICBtYXhYID0gTWF0aC5tYXgobWF4WCwgY29vcmRzW2ldLmNvbHVtbik7XG4gICAgICAgIG1heFkgPSBNYXRoLm1heChtYXhZLCBjb29yZHNbaV0ucm93KTtcbiAgICB9XG5cbiAgICBjb25zdCBkeCA9IG1heFggLSBtaW5YO1xuICAgIGNvbnN0IGR5ID0gbWF4WSAtIG1pblk7XG4gICAgY29uc3QgZE1heCA9IE1hdGgubWF4KGR4LCBkeSk7XG4gICAgY29uc3Qgem9vbSA9IE1hdGgubWF4KDAsIE1hdGguZmxvb3IoLU1hdGgubG9nKGRNYXgpIC8gTWF0aC5MTjIpKTtcbiAgICByZXR1cm4gbmV3IENvb3JkaW5hdGUoKG1pblggKyBtYXhYKSAvIDIsIChtaW5ZICsgbWF4WSkgLyAyLCAwKVxuICAgICAgICAuem9vbVRvKHpvb20pO1xufTtcblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSBzdHJpbmcgZW5kcyB3aXRoIGEgcGFydGljdWxhciBzdWJzdHJpbmdcbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnRzLmVuZHNXaXRoID0gZnVuY3Rpb24oc3RyaW5nICAgICAgICAsIHN1ZmZpeCAgICAgICAgKSAgICAgICAgICB7XG4gICAgcmV0dXJuIHN0cmluZy5pbmRleE9mKHN1ZmZpeCwgc3RyaW5nLmxlbmd0aCAtIHN1ZmZpeC5sZW5ndGgpICE9PSAtMTtcbn07XG5cbi8qKlxuICogQ3JlYXRlIGFuIG9iamVjdCBieSBtYXBwaW5nIGFsbCB0aGUgdmFsdWVzIG9mIGFuIGV4aXN0aW5nIG9iamVjdCB3aGlsZVxuICogcHJlc2VydmluZyB0aGVpciBrZXlzLlxuICpcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydHMubWFwT2JqZWN0ID0gZnVuY3Rpb24oaW5wdXQgICAgICAgICwgaXRlcmF0b3IgICAgICAgICAgLCBjb250ZXh0ICAgICAgICAgKSAgICAgICAgIHtcbiAgICBjb25zdCBvdXRwdXQgPSB7fTtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBpbnB1dCkge1xuICAgICAgICBvdXRwdXRba2V5XSA9IGl0ZXJhdG9yLmNhbGwoY29udGV4dCB8fCB0aGlzLCBpbnB1dFtrZXldLCBrZXksIGlucHV0KTtcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbn07XG5cbi8qKlxuICogQ3JlYXRlIGFuIG9iamVjdCBieSBmaWx0ZXJpbmcgb3V0IHZhbHVlcyBvZiBhbiBleGlzdGluZyBvYmplY3QuXG4gKlxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0cy5maWx0ZXJPYmplY3QgPSBmdW5jdGlvbihpbnB1dCAgICAgICAgLCBpdGVyYXRvciAgICAgICAgICAsIGNvbnRleHQgICAgICAgICApICAgICAgICAge1xuICAgIGNvbnN0IG91dHB1dCA9IHt9O1xuICAgIGZvciAoY29uc3Qga2V5IGluIGlucHV0KSB7XG4gICAgICAgIGlmIChpdGVyYXRvci5jYWxsKGNvbnRleHQgfHwgdGhpcywgaW5wdXRba2V5XSwga2V5LCBpbnB1dCkpIHtcbiAgICAgICAgICAgIG91dHB1dFtrZXldID0gaW5wdXRba2V5XTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0O1xufTtcblxuLyoqXG4gKiBEZWVwbHkgY29tcGFyZXMgdHdvIG9iamVjdCBsaXRlcmFscy5cbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnRzLmRlZXBFcXVhbCA9IGZ1bmN0aW9uKGEgICAgICAgICwgYiAgICAgICAgKSAgICAgICAgICB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoYSkpIHtcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGIpIHx8IGEubGVuZ3RoICE9PSBiLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICghZXhwb3J0cy5kZWVwRXF1YWwoYVtpXSwgYltpXSkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBhID09PSAnb2JqZWN0JyAmJiBhICE9PSBudWxsICYmIGIgIT09IG51bGwpIHtcbiAgICAgICAgaWYgKCEodHlwZW9mIGIgPT09ICdvYmplY3QnKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMoYSk7XG4gICAgICAgIGlmIChrZXlzLmxlbmd0aCAhPT0gT2JqZWN0LmtleXMoYikubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIGEpIHtcbiAgICAgICAgICAgIGlmICghZXhwb3J0cy5kZWVwRXF1YWwoYVtrZXldLCBiW2tleV0pKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBhID09PSBiO1xufTtcblxuLyoqXG4gKiBEZWVwbHkgY2xvbmVzIHR3byBvYmplY3RzLlxuICpcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydHMuY2xvbmUgPSBmdW5jdGlvbiAgIChpbnB1dCAgICkgICAge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGlucHV0KSkge1xuICAgICAgICByZXR1cm4gaW5wdXQubWFwKGV4cG9ydHMuY2xvbmUpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGlucHV0ID09PSAnb2JqZWN0JyAmJiBpbnB1dCkge1xuICAgICAgICByZXR1cm4gKChleHBvcnRzLm1hcE9iamVjdChpbnB1dCwgZXhwb3J0cy5jbG9uZSkgICAgICkgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBpbnB1dDtcbiAgICB9XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIHR3byBhcnJheXMgaGF2ZSBhdCBsZWFzdCBvbmUgY29tbW9uIGVsZW1lbnQuXG4gKlxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0cy5hcnJheXNJbnRlcnNlY3QgPSBmdW5jdGlvbiAgIChhICAgICAgICAgICwgYiAgICAgICAgICApICAgICAgICAgIHtcbiAgICBmb3IgKGxldCBsID0gMDsgbCA8IGEubGVuZ3RoOyBsKyspIHtcbiAgICAgICAgaWYgKGIuaW5kZXhPZihhW2xdKSA+PSAwKSByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxuLyoqXG4gKiBQcmludCBhIHdhcm5pbmcgbWVzc2FnZSB0byB0aGUgY29uc29sZSBhbmQgZW5zdXJlIGR1cGxpY2F0ZSB3YXJuaW5nIG1lc3NhZ2VzXG4gKiBhcmUgbm90IHByaW50ZWQuXG4gKlxuICogQHByaXZhdGVcbiAqL1xuY29uc3Qgd2Fybk9uY2VIaXN0b3J5ICAgICAgICAgICAgICAgICAgICAgICAgICAgPSB7fTtcbmV4cG9ydHMud2Fybk9uY2UgPSBmdW5jdGlvbihtZXNzYWdlICAgICAgICApICAgICAgIHtcbiAgICBpZiAoIXdhcm5PbmNlSGlzdG9yeVttZXNzYWdlXSkge1xuICAgICAgICAvLyBjb25zb2xlIGlzbid0IGRlZmluZWQgaW4gc29tZSBXZWJXb3JrZXJzLCBzZWUgIzI1NThcbiAgICAgICAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSBcInVuZGVmaW5lZFwiKSBjb25zb2xlLndhcm4obWVzc2FnZSk7XG4gICAgICAgIHdhcm5PbmNlSGlzdG9yeVttZXNzYWdlXSA9IHRydWU7XG4gICAgfVxufTtcblxuLyoqXG4gKiBJbmRpY2F0ZXMgaWYgdGhlIHByb3ZpZGVkIFBvaW50cyBhcmUgaW4gYSBjb3VudGVyIGNsb2Nrd2lzZSAodHJ1ZSkgb3IgY2xvY2t3aXNlIChmYWxzZSkgb3JkZXJcbiAqXG4gKiBAcmV0dXJucyB0cnVlIGZvciBhIGNvdW50ZXIgY2xvY2t3aXNlIHNldCBvZiBwb2ludHNcbiAqL1xuLy8gaHR0cDovL2JyeWNlYm9lLmNvbS8yMDA2LzEwLzIzL2xpbmUtc2VnbWVudC1pbnRlcnNlY3Rpb24tYWxnb3JpdGhtL1xuZXhwb3J0cy5pc0NvdW50ZXJDbG9ja3dpc2UgPSBmdW5jdGlvbihhICAgICAgICwgYiAgICAgICAsIGMgICAgICAgKSAgICAgICAgICB7XG4gICAgcmV0dXJuIChjLnkgLSBhLnkpICogKGIueCAtIGEueCkgPiAoYi55IC0gYS55KSAqIChjLnggLSBhLngpO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBzaWduZWQgYXJlYSBmb3IgdGhlIHBvbHlnb24gcmluZy4gIFBvc3RpdmUgYXJlYXMgYXJlIGV4dGVyaW9yIHJpbmdzIGFuZFxuICogaGF2ZSBhIGNsb2Nrd2lzZSB3aW5kaW5nLiAgTmVnYXRpdmUgYXJlYXMgYXJlIGludGVyaW9yIHJpbmdzIGFuZCBoYXZlIGEgY291bnRlciBjbG9ja3dpc2VcbiAqIG9yZGVyaW5nLlxuICpcbiAqIEBwYXJhbSByaW5nIEV4dGVyaW9yIG9yIGludGVyaW9yIHJpbmdcbiAqL1xuZXhwb3J0cy5jYWxjdWxhdGVTaWduZWRBcmVhID0gZnVuY3Rpb24ocmluZyAgICAgICAgICAgICAgKSAgICAgICAgIHtcbiAgICBsZXQgc3VtID0gMDtcbiAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gcmluZy5sZW5ndGgsIGogPSBsZW4gLSAxLCBwMSwgcDI7IGkgPCBsZW47IGogPSBpKyspIHtcbiAgICAgICAgcDEgPSByaW5nW2ldO1xuICAgICAgICBwMiA9IHJpbmdbal07XG4gICAgICAgIHN1bSArPSAocDIueCAtIHAxLngpICogKHAxLnkgKyBwMi55KTtcbiAgICB9XG4gICAgcmV0dXJuIHN1bTtcbn07XG5cbi8qKlxuICogRGV0ZWN0cyBjbG9zZWQgcG9seWdvbnMsIGZpcnN0ICsgbGFzdCBwb2ludCBhcmUgZXF1YWxcbiAqXG4gKiBAcGFyYW0gcG9pbnRzIGFycmF5IG9mIHBvaW50c1xuICogQHJldHVybiB0cnVlIGlmIHRoZSBwb2ludHMgYXJlIGEgY2xvc2VkIHBvbHlnb25cbiAqL1xuZXhwb3J0cy5pc0Nsb3NlZFBvbHlnb24gPSBmdW5jdGlvbihwb2ludHMgICAgICAgICAgICAgICkgICAgICAgICAge1xuICAgIC8vIElmIGl0IGlzIDIgcG9pbnRzIHRoYXQgYXJlIHRoZSBzYW1lIHRoZW4gaXQgaXMgYSBwb2ludFxuICAgIC8vIElmIGl0IGlzIDMgcG9pbnRzIHdpdGggc3RhcnQgYW5kIGVuZCB0aGUgc2FtZSB0aGVuIGl0IGlzIGEgbGluZVxuICAgIGlmIChwb2ludHMubGVuZ3RoIDwgNClcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgY29uc3QgcDEgPSBwb2ludHNbMF07XG4gICAgY29uc3QgcDIgPSBwb2ludHNbcG9pbnRzLmxlbmd0aCAtIDFdO1xuXG4gICAgaWYgKE1hdGguYWJzKHAxLnggLSBwMi54KSA+IDAgfHxcbiAgICAgICAgTWF0aC5hYnMocDEueSAtIHAyLnkpID4gMCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gcG9seWdvbiBzaW1wbGlmaWNhdGlvbiBjYW4gcHJvZHVjZSBwb2x5Z29ucyB3aXRoIHplcm8gYXJlYSBhbmQgbW9yZSB0aGFuIDMgcG9pbnRzXG4gICAgcmV0dXJuIChNYXRoLmFicyhleHBvcnRzLmNhbGN1bGF0ZVNpZ25lZEFyZWEocG9pbnRzKSkgPiAwLjAxKTtcbn07XG5cbi8qKlxuICogQ29udmVydHMgc3BoZXJpY2FsIGNvb3JkaW5hdGVzIHRvIGNhcnRlc2lhbiBjb29yZGluYXRlcy5cbiAqXG4gKiBAcGFyYW0gc3BoZXJpY2FsIFNwaGVyaWNhbCBjb29yZGluYXRlcywgaW4gW3JhZGlhbCwgYXppbXV0aGFsLCBwb2xhcl1cbiAqIEByZXR1cm4gY2FydGVzaWFuIGNvb3JkaW5hdGVzIGluIFt4LCB5LCB6XVxuICovXG5cbmV4cG9ydHMuc3BoZXJpY2FsVG9DYXJ0ZXNpYW4gPSBmdW5jdGlvbihbciwgYXppbXV0aGFsLCBwb2xhcl0gICAgICAgICAgICAgICAgICAgICAgICAgICkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgLy8gV2UgYWJzdHJhY3QgXCJub3J0aFwiL1widXBcIiAoY29tcGFzcy13aXNlKSB0byBiZSAwwrAgd2hlbiByZWFsbHkgdGhpcyBpcyA5MMKwICjPgC8yKTpcbiAgICAvLyBjb3JyZWN0IGZvciB0aGF0IGhlcmVcbiAgICBhemltdXRoYWwgKz0gOTA7XG5cbiAgICAvLyBDb252ZXJ0IGF6aW11dGhhbCBhbmQgcG9sYXIgYW5nbGVzIHRvIHJhZGlhbnNcbiAgICBhemltdXRoYWwgKj0gTWF0aC5QSSAvIDE4MDtcbiAgICBwb2xhciAqPSBNYXRoLlBJIC8gMTgwO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgeDogciAqIE1hdGguY29zKGF6aW11dGhhbCkgKiBNYXRoLnNpbihwb2xhciksXG4gICAgICAgIHk6IHIgKiBNYXRoLnNpbihhemltdXRoYWwpICogTWF0aC5zaW4ocG9sYXIpLFxuICAgICAgICB6OiByICogTWF0aC5jb3MocG9sYXIpXG4gICAgfTtcbn07XG5cbi8qKlxuICogUGFyc2VzIGRhdGEgZnJvbSAnQ2FjaGUtQ29udHJvbCcgaGVhZGVycy5cbiAqXG4gKiBAcGFyYW0gY2FjaGVDb250cm9sIFZhbHVlIG9mICdDYWNoZS1Db250cm9sJyBoZWFkZXJcbiAqIEByZXR1cm4gb2JqZWN0IGNvbnRhaW5pbmcgcGFyc2VkIGhlYWRlciBpbmZvLlxuICovXG5cbmV4cG9ydHMucGFyc2VDYWNoZUNvbnRyb2wgPSBmdW5jdGlvbihjYWNoZUNvbnRyb2wgICAgICAgICkgICAgICAgICB7XG4gICAgLy8gVGFrZW4gZnJvbSBbV3JlY2tdKGh0dHBzOi8vZ2l0aHViLmNvbS9oYXBpanMvd3JlY2spXG4gICAgY29uc3QgcmUgPSAvKD86XnwoPzpcXHMqXFwsXFxzKikpKFteXFx4MDAtXFx4MjBcXChcXCk8PkBcXCw7XFw6XFxcXFwiXFwvXFxbXFxdXFw/XFw9XFx7XFx9XFx4N0ZdKykoPzpcXD0oPzooW15cXHgwMC1cXHgyMFxcKFxcKTw+QFxcLDtcXDpcXFxcXCJcXC9cXFtcXF1cXD9cXD1cXHtcXH1cXHg3Rl0rKXwoPzpcXFwiKCg/OlteXCJcXFxcXXxcXFxcLikqKVxcXCIpKSk/L2c7XG5cbiAgICBjb25zdCBoZWFkZXIgPSB7fTtcbiAgICBjYWNoZUNvbnRyb2wucmVwbGFjZShyZSwgKCQwLCAkMSwgJDIsICQzKSA9PiB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gJDIgfHwgJDM7XG4gICAgICAgIGhlYWRlclskMV0gPSB2YWx1ZSA/IHZhbHVlLnRvTG93ZXJDYXNlKCkgOiB0cnVlO1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgfSk7XG5cbiAgICBpZiAoaGVhZGVyWydtYXgtYWdlJ10pIHtcbiAgICAgICAgY29uc3QgbWF4QWdlID0gcGFyc2VJbnQoaGVhZGVyWydtYXgtYWdlJ10sIDEwKTtcbiAgICAgICAgaWYgKGlzTmFOKG1heEFnZSkpIGRlbGV0ZSBoZWFkZXJbJ21heC1hZ2UnXTtcbiAgICAgICAgZWxzZSBoZWFkZXJbJ21heC1hZ2UnXSA9IG1heEFnZTtcbiAgICB9XG5cbiAgICByZXR1cm4gaGVhZGVyO1xufTtcbiIsIi8vICAgICAgXG5cbmNvbnN0IHV0aWwgPSByZXF1aXJlKCdtYXBib3gtZ2wvc3JjL3V0aWwvdXRpbCcpO1xuY29uc3QgYWpheCA9IHJlcXVpcmUoJ21hcGJveC1nbC9zcmMvdXRpbC9hamF4Jyk7XG5jb25zdCBFdmVudGVkID0gcmVxdWlyZSgnbWFwYm94LWdsL3NyYy91dGlsL2V2ZW50ZWQnKTtcbmNvbnN0IGxvYWRBcmNHSVNNYXBTZXJ2ZXIgPSByZXF1aXJlKCcuL2xvYWRfYXJjZ2lzX21hcHNlcnZlcicpO1xuY29uc3QgVGlsZUJvdW5kcyA9IHJlcXVpcmUoJ21hcGJveC1nbC9zcmMvc291cmNlL3RpbGVfYm91bmRzJyk7XG5jb25zdCBUZXh0dXJlID0gcmVxdWlyZSgnbWFwYm94LWdsL3NyYy9yZW5kZXIvdGV4dHVyZScpO1xuY29uc3QgaGVscGVycyA9IHJlcXVpcmUoJy4vaGVscGVycycpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5cbmNsYXNzIEFyY0dJU1RpbGVkTWFwU2VydmljZVNvdXJjZSBleHRlbmRzIEV2ZW50ZWQgICAgICAgICAgICAgICAgICAge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgIFxuXG4gICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5cbiAgICBjb25zdHJ1Y3RvcihpZCAgICAgICAgLCBvcHRpb25zICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICwgZGlzcGF0Y2hlciAgICAgICAgICAgICwgZXZlbnRlZFBhcmVudCAgICAgICAgICkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmlkID0gaWQ7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlciA9IGRpc3BhdGNoZXI7XG4gICAgICAgIHRoaXMuc2V0RXZlbnRlZFBhcmVudChldmVudGVkUGFyZW50KTtcblxuICAgICAgICB0aGlzLnR5cGUgPSAnYXJjZ2lzcmFzdGVyJztcbiAgICAgICAgdGhpcy5taW56b29tID0gMDtcbiAgICAgICAgdGhpcy5tYXh6b29tID0gMjI7XG4gICAgICAgIHRoaXMucm91bmRab29tID0gdHJ1ZTtcbiAgICAgICAgdGhpcy50aWxlU2l6ZSA9IDUxMjtcbiAgICAgICAgdGhpcy5fbG9hZGVkID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5fb3B0aW9ucyA9IHV0aWwuZXh0ZW5kKHt9LCBvcHRpb25zKTtcbiAgICAgICAgdXRpbC5leHRlbmQodGhpcywgdXRpbC5waWNrKG9wdGlvbnMsIFsndXJsJywgJ3NjaGVtZScsICd0aWxlU2l6ZSddKSk7XG4gICAgfVxuXG4gICAgbG9hZCgpIHtcbiAgICAgICAgdGhpcy5maXJlKCdkYXRhbG9hZGluZycsIHtkYXRhVHlwZTogJ3NvdXJjZSd9KTtcbiAgICAgICAgbG9hZEFyY0dJU01hcFNlcnZlcih0aGlzLl9vcHRpb25zLCAoZXJyLCBtZXRhZGF0YSkgPT4ge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHRoaXMuZmlyZSgnZXJyb3InLCBlcnIpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChtZXRhZGF0YSkge1xuICAgICAgICAgICAgICAgIHV0aWwuZXh0ZW5kKHRoaXMsIG1ldGFkYXRhKTtcblxuICAgICAgICAgICAgICAgIGlmIChtZXRhZGF0YS5ib3VuZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50aWxlQm91bmRzID0gbmV3IFRpbGVCb3VuZHMobWV0YWRhdGEuYm91bmRzLCB0aGlzLm1pbnpvb20sIHRoaXMubWF4em9vbSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBgY29udGVudGAgaXMgaW5jbHVkZWQgaGVyZSB0byBwcmV2ZW50IGEgcmFjZSBjb25kaXRpb24gd2hlcmUgYFN0eWxlI191cGRhdGVTb3VyY2VzYCBpcyBjYWxsZWRcbiAgICAgICAgICAgIC8vIGJlZm9yZSB0aGUgVGlsZUpTT04gYXJyaXZlcy4gdGhpcyBtYWtlcyBzdXJlIHRoZSB0aWxlcyBuZWVkZWQgYXJlIGxvYWRlZCBvbmNlIFRpbGVKU09OIGFycml2ZXNcbiAgICAgICAgICAgIC8vIHJlZjogaHR0cHM6Ly9naXRodWIuY29tL21hcGJveC9tYXBib3gtZ2wtanMvcHVsbC80MzQ3I2Rpc2N1c3Npb25fcjEwNDQxODA4OFxuICAgICAgICAgICAgdGhpcy5maXJlKCdkYXRhJywge2RhdGFUeXBlOiAnc291cmNlJywgc291cmNlRGF0YVR5cGU6ICdtZXRhZGF0YSd9KTtcbiAgICAgICAgICAgIHRoaXMuZmlyZSgnZGF0YScsIHtkYXRhVHlwZTogJ3NvdXJjZScsIHNvdXJjZURhdGFUeXBlOiAnY29udGVudCd9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb25BZGQobWFwICAgICApIHtcbiAgICAgICAgLy8gc2V0IHRoZSB1cmxzXG4gICAgICAgIGNvbnN0IGJhc2VVcmwgPSB0aGlzLnVybC5zcGxpdCgnPycpWzBdO1xuICAgICAgICB0aGlzLnRpbGVVcmwgPSBgJHtiYXNlVXJsfS90aWxlL3t6fS97eX0ve3h9YDtcblxuICAgICAgICBjb25zdCBhcmNnaXNvbmxpbmUgPSBuZXcgUmVnRXhwKC90aWxlcy5hcmNnaXMob25saW5lKT9cXC5jb20vZyk7XG4gICAgICAgIGlmIChhcmNnaXNvbmxpbmUudGVzdCh0aGlzLnVybCkpIHtcbiAgICAgICAgICAgIHRoaXMudGlsZVVybCA9IHRoaXMudGlsZVVybC5yZXBsYWNlKCc6Ly90aWxlcycsICc6Ly90aWxlc3tzfScpO1xuICAgICAgICAgICAgdGhpcy5zdWJkb21haW5zID0gWycxJywgJzInLCAnMycsICc0J107XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy50b2tlbikge1xuICAgICAgICAgICAgdGhpcy50aWxlVXJsICs9IChgP3Rva2VuPSR7dGhpcy50b2tlbn1gKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdGhpcy5tYXAgPSBtYXA7XG4gICAgICAgIHRoaXMubG9hZCgpO1xuICAgIH1cblxuICAgIHNlcmlhbGl6ZSgpIHtcbiAgICAgICAgcmV0dXJuIHV0aWwuZXh0ZW5kKHt9LCB0aGlzLl9vcHRpb25zKTtcbiAgICB9XG5cbiAgICBoYXNUaWxlKHRpbGVJRCAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICByZXR1cm4gIXRoaXMudGlsZUJvdW5kcyB8fCB0aGlzLnRpbGVCb3VuZHMuY29udGFpbnModGlsZUlELmNhbm9uaWNhbCk7XG4gICAgfVxuXG4gICAgbG9hZFRpbGUodGlsZSAgICAgICwgY2FsbGJhY2sgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgIC8vY29udmVydCB0byBhZ3MgY29vcmRzXG4gICAgICAgIGNvbnN0IHRpbGVQb2ludCA9IHsgejogdGlsZS50aWxlSUQub3ZlcnNjYWxlZFosIHg6IHRpbGUudGlsZUlELmNhbm9uaWNhbC54LCB5OiB0aWxlLnRpbGVJRC5jYW5vbmljYWwueSB9O1xuXG4gICAgICAgIGNvbnN0IHVybCA9ICBoZWxwZXJzLl90ZW1wbGF0ZSh0aGlzLnRpbGVVcmwsIHV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgIHM6IGhlbHBlcnMuX2dldFN1YmRvbWFpbih0aWxlUG9pbnQsIHRoaXMuc3ViZG9tYWlucyksXG4gICAgICAgICAgICB6OiAodGhpcy5fbG9kTWFwICYmIHRoaXMuX2xvZE1hcFt0aWxlUG9pbnQuel0pID8gdGhpcy5fbG9kTWFwW3RpbGVQb2ludC56XSA6IHRpbGVQb2ludC56LCAvLyB0cnkgbG9kIG1hcCBmaXJzdCwgdGhlbiBqdXN0IGRlZnVhbHQgdG8gem9vbSBsZXZlbFxuICAgICAgICAgICAgeDogdGlsZVBvaW50LngsXG4gICAgICAgICAgICB5OiB0aWxlUG9pbnQueVxuICAgICAgICB9LCB0aGlzLm9wdGlvbnMpKTtcbiAgICAgICAgdGlsZS5yZXF1ZXN0ID0gYWpheC5nZXRJbWFnZSh7dXJsfSwgIChlcnIsIGltZykgPT4ge1xuICAgICAgICAgICAgZGVsZXRlIHRpbGUucmVxdWVzdDtcblxuICAgICAgICAgICAgaWYgKHRpbGUuYWJvcnRlZCkge1xuICAgICAgICAgICAgICAgIHRpbGUuc3RhdGUgPSAndW5sb2FkZWQnO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICB0aWxlLnN0YXRlID0gJ2Vycm9yZWQnO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGltZykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1hcC5fcmVmcmVzaEV4cGlyZWRUaWxlcykgdGlsZS5zZXRFeHBpcnlEYXRhKGltZyk7XG4gICAgICAgICAgICAgICAgZGVsZXRlIChpbWcgICAgICkuY2FjaGVDb250cm9sO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSAoaW1nICAgICApLmV4cGlyZXM7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBjb250ZXh0ID0gdGhpcy5tYXAucGFpbnRlci5jb250ZXh0O1xuICAgICAgICAgICAgICAgIGNvbnN0IGdsID0gY29udGV4dC5nbDtcbiAgICAgICAgICAgICAgICB0aWxlLnRleHR1cmUgPSB0aGlzLm1hcC5wYWludGVyLmdldFRpbGVUZXh0dXJlKGltZy53aWR0aCk7XG4gICAgICAgICAgICAgICAgaWYgKHRpbGUudGV4dHVyZSkge1xuICAgICAgICAgICAgICAgICAgICB0aWxlLnRleHR1cmUuYmluZChnbC5MSU5FQVIsIGdsLkNMQU1QX1RPX0VER0UsIGdsLkxJTkVBUl9NSVBNQVBfTkVBUkVTVCk7XG4gICAgICAgICAgICAgICAgICAgIGdsLnRleFN1YkltYWdlMkQoZ2wuVEVYVFVSRV8yRCwgMCwgMCwgMCwgZ2wuUkdCQSwgZ2wuVU5TSUdORURfQllURSwgaW1nKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aWxlLnRleHR1cmUgPSBuZXcgVGV4dHVyZShjb250ZXh0LCBpbWcsIGdsLlJHQkEpO1xuICAgICAgICAgICAgICAgICAgICB0aWxlLnRleHR1cmUuYmluZChnbC5MSU5FQVIsIGdsLkNMQU1QX1RPX0VER0UsIGdsLkxJTkVBUl9NSVBNQVBfTkVBUkVTVCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnRleHQuZXh0VGV4dHVyZUZpbHRlckFuaXNvdHJvcGljKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJmKGdsLlRFWFRVUkVfMkQsIGNvbnRleHQuZXh0VGV4dHVyZUZpbHRlckFuaXNvdHJvcGljLlRFWFRVUkVfTUFYX0FOSVNPVFJPUFlfRVhULCBjb250ZXh0LmV4dFRleHR1cmVGaWx0ZXJBbmlzb3Ryb3BpY01heCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZ2wuZ2VuZXJhdGVNaXBtYXAoZ2wuVEVYVFVSRV8yRCk7XG5cbiAgICAgICAgICAgICAgICB0aWxlLnN0YXRlID0gJ2xvYWRlZCc7XG5cbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYWJvcnRUaWxlKHRpbGUgICAgICAsIGNhbGxiYWNrICAgICAgICAgICAgICAgICkge1xuICAgICAgICBpZiAodGlsZS5yZXF1ZXN0KSB7XG4gICAgICAgICAgICB0aWxlLnJlcXVlc3QuYWJvcnQoKTtcbiAgICAgICAgICAgIGRlbGV0ZSB0aWxlLnJlcXVlc3Q7XG4gICAgICAgIH1cbiAgICAgICAgY2FsbGJhY2soKTtcbiAgICB9XG5cbiAgICB1bmxvYWRUaWxlKHRpbGUgICAgICAsIGNhbGxiYWNrICAgICAgICAgICAgICAgICkge1xuICAgICAgICBpZiAodGlsZS50ZXh0dXJlKSB0aGlzLm1hcC5wYWludGVyLnNhdmVUaWxlVGV4dHVyZSh0aWxlLnRleHR1cmUpO1xuICAgICAgICBjYWxsYmFjaygpO1xuICAgIH1cblxuICAgIGhhc1RyYW5zaXRpb24oKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQXJjR0lTVGlsZWRNYXBTZXJ2aWNlU291cmNlOyIsIlxuLy9Gcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9MZWFmbGV0L0xlYWZsZXQvYmxvYi9tYXN0ZXIvc3JjL2NvcmUvVXRpbC5qc1xuY29uc3QgX3RlbXBsYXRlUmUgPSAvXFx7ICooW1xcd19dKykgKlxcfS9nO1xuY29uc3QgX3RlbXBsYXRlID0gZnVuY3Rpb24gKHN0ciwgZGF0YSkge1xuICAgIHJldHVybiBzdHIucmVwbGFjZShfdGVtcGxhdGVSZSwgKHN0ciwga2V5KSA9PiB7XG4gICAgICAgIGxldCB2YWx1ZSA9IGRhdGFba2V5XTtcblxuICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBObyB2YWx1ZSBwcm92aWRlZCBmb3IgdmFyaWFibGUgJHtzdHJ9YCk7XG5cbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUoZGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0pO1xufTtcblxuLy9Gcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9MZWFmbGV0L0xlYWZsZXQvYmxvYi9tYXN0ZXIvc3JjL2xheWVyL3RpbGUvVGlsZUxheWVyLmpzXG5jb25zdCBfZ2V0U3ViZG9tYWluID0gZnVuY3Rpb24gKHRpbGVQb2ludCwgc3ViZG9tYWlucykge1xuICAgIGlmIChzdWJkb21haW5zKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gTWF0aC5hYnModGlsZVBvaW50LnggKyB0aWxlUG9pbnQueSkgJSBzdWJkb21haW5zLmxlbmd0aDtcbiAgICAgICAgcmV0dXJuIHN1YmRvbWFpbnNbaW5kZXhdO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIF90ZW1wbGF0ZSxcbiAgICBfZ2V0U3ViZG9tYWluXG59O1xuIiwiY29uc3QgQXJjR0lTVGlsZWRNYXBTZXJ2aWNlU291cmNlID0gcmVxdWlyZSgnLi9hcmNnaXNfdGlsZWRfbWFwX3NlcnZpY2Vfc291cmNlJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEFyY0dJU1RpbGVkTWFwU2VydmljZVNvdXJjZTsiLCIndXNlIHN0cmljdCc7XG5jb25zdCB1dGlsID0gcmVxdWlyZSgnbWFwYm94LWdsL3NyYy91dGlsL3V0aWwnKTtcbmNvbnN0IGFqYXggPSByZXF1aXJlKCdtYXBib3gtZ2wvc3JjL3V0aWwvYWpheCcpO1xuY29uc3QgYnJvd3NlciA9IHJlcXVpcmUoJ21hcGJveC1nbC9zcmMvdXRpbC9icm93c2VyJyk7XG5jb25zdCBTcGhlcmljYWxNZXJjYXRvciA9IHJlcXVpcmUoJ0BtYXBib3gvc3BoZXJpY2FsbWVyY2F0b3InKTtcblxuLy9Db250YWlucyBjb2RlIGZyb20gZXNyaS1sZWFmbGV0IGh0dHBzOi8vZ2l0aHViLmNvbS9Fc3JpL2VzcmktbGVhZmxldFxuY29uc3QgTWVyY2F0b3Jab29tTGV2ZWxzID0ge1xuICAgICcwJzogMTU2NTQzLjAzMzkyNzk5OTk5LFxuICAgICcxJzogNzgyNzEuNTE2OTYzOTk5ODkzLFxuICAgICcyJzogMzkxMzUuNzU4NDgyMDAwMDk5LFxuICAgICczJzogMTk1NjcuODc5MjQwOTk5OTAxLFxuICAgICc0JzogOTc4My45Mzk2MjA0OTk5NTkzLFxuICAgICc1JzogNDg5MS45Njk4MTAyNDk5Nzk3LFxuICAgICc2JzogMjQ0NS45ODQ5MDUxMjQ5ODk4LFxuICAgICc3JzogMTIyMi45OTI0NTI1NjI0ODk5LFxuICAgICc4JzogNjExLjQ5NjIyNjI4MTM4MDAyLFxuICAgICc5JzogMzA1Ljc0ODExMzE0MDU1ODAyLFxuICAgICcxMCc6IDE1Mi44NzQwNTY1NzA0MTEsXG4gICAgJzExJzogNzYuNDM3MDI4Mjg1MDczMTk3LFxuICAgICcxMic6IDM4LjIxODUxNDE0MjUzNjU5OCxcbiAgICAnMTMnOiAxOS4xMDkyNTcwNzEyNjgyOTksXG4gICAgJzE0JzogOS41NTQ2Mjg1MzU2MzQxNDk2LFxuICAgICcxNSc6IDQuNzc3MzE0MjY3OTQ5MzY5OSxcbiAgICAnMTYnOiAyLjM4ODY1NzEzMzk3NDY4LFxuICAgICcxNyc6IDEuMTk0MzI4NTY2ODU1MDUwMSxcbiAgICAnMTgnOiAwLjU5NzE2NDI4MzU1OTgxNjk5LFxuICAgICcxOSc6IDAuMjk4NTgyMTQxNjQ3NjE2OTgsXG4gICAgJzIwJzogMC4xNDkyOTEwNzA4MjM4MSxcbiAgICAnMjEnOiAwLjA3NDY0NTUzNTQxMTkxLFxuICAgICcyMic6IDAuMDM3MzIyNzY3NzA1OTUyNSxcbiAgICAnMjMnOiAwLjAxODY2MTM4Mzg1Mjk3NjNcbn07XG5cbmNvbnN0IF93aXRoaW5QZXJjZW50YWdlID0gZnVuY3Rpb24gKGEsIGIsIHBlcmNlbnRhZ2UpIHtcbiAgICBjb25zdCBkaWZmID0gTWF0aC5hYnMoKGEgLyBiKSAtIDEpO1xuICAgIHJldHVybiBkaWZmIDwgcGVyY2VudGFnZTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICBjb25zdCBsb2FkZWQgPSBmdW5jdGlvbihlcnIsIG1ldGFkYXRhKSB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcmVzdWx0ID0gdXRpbC5waWNrKG1ldGFkYXRhLFxuICAgICAgICAgICAgWyd0aWxlSW5mbycsICdpbml0aWFsRXh0ZW50JywgJ2Z1bGxFeHRlbnQnLCAnc3BhdGlhbFJlZmVyZW5jZScsICd0aWxlU2VydmVycycsICdkb2N1bWVudEluZm8nXSk7XG5cbiAgICAgICAgcmVzdWx0Ll9sb2RNYXAgPSB7fTtcbiAgICAgICAgY29uc3Qgem9vbU9mZnNldEFsbG93YW5jZSA9IDAuMTtcbiAgICAgICAgY29uc3Qgc3IgPSBtZXRhZGF0YS5zcGF0aWFsUmVmZXJlbmNlLmxhdGVzdFdraWQgfHwgbWV0YWRhdGEuc3BhdGlhbFJlZmVyZW5jZS53a2lkO1xuICAgICAgICBpZiAoc3IgPT09IDEwMjEwMCB8fCBzciA9PT0gMzg1Nykge1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgRXhhbXBsZSBleHRlbnQgZnJvbSBBcmNHSVMgUkVTVCBBUElcbiAgICAgICAgICAgIGZ1bGxFeHRlbnQ6IHtcbiAgICAgICAgICAgIHhtaW46IC05MTQ0NzkxLjY3OTIyNjEyNyxcbiAgICAgICAgICAgIHltaW46IC0yMTk1MTkwLjk2MTQzNzcyNixcbiAgICAgICAgICAgIHhtYXg6IC00NjUwOTg3LjA3MjAxOTk4MyxcbiAgICAgICAgICAgIHltYXg6IDExMTgxMTMuMTEwMTU1NzY2LFxuICAgICAgICAgICAgc3BhdGlhbFJlZmVyZW5jZToge1xuICAgICAgICAgICAgd2tpZDogMTAyMTAwLFxuICAgICAgICAgICAgd2t0OiBudWxsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIC8vY29udmVydCBBcmNHSVMgZXh0ZW50IHRvIGJvdW5kc1xuICAgICAgICAgICAgY29uc3QgZXh0ZW50ID0gbWV0YWRhdGEuZnVsbEV4dGVudDtcbiAgICAgICAgICAgIGlmIChleHRlbnQgJiYgZXh0ZW50LnNwYXRpYWxSZWZlcmVuY2UgJiYgZXh0ZW50LnNwYXRpYWxSZWZlcmVuY2Uud2tpZCA9PT0gIDEwMjEwMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJvdW5kc1dlYk1lcmNhdG9yID0gW2V4dGVudC54bWluLCBleHRlbnQueW1pbiwgZXh0ZW50LnhtYXgsIGV4dGVudC55bWF4XTtcbiAgICAgICAgICAgICAgICB2YXIgbWVyYyA9IG5ldyBTcGhlcmljYWxNZXJjYXRvcih7XG4gICAgICAgICAgICAgICAgICAgIHNpemU6IDI1NlxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNvbnN0IGJvdW5kc1dHUzg0ID0gbWVyYy5jb252ZXJ0KGJvdW5kc1dlYk1lcmNhdG9yKTtcbiAgICAgICAgICAgICAgICByZXN1bHQuYm91bmRzID0gYm91bmRzV0dTODQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGNyZWF0ZSB0aGUgem9vbSBsZXZlbCBkYXRhXG4gICAgICAgICAgICBjb25zdCBhcmNnaXNMT0RzID0gbWV0YWRhdGEudGlsZUluZm8ubG9kcztcbiAgICAgICAgICAgIGNvbnN0IGNvcnJlY3RSZXNvbHV0aW9ucyA9IE1lcmNhdG9yWm9vbUxldmVscztcbiAgICAgICAgICAgIHJlc3VsdC5taW56b29tID0gYXJjZ2lzTE9Ec1swXS5sZXZlbDtcbiAgICAgICAgICAgIHJlc3VsdC5tYXh6b29tID0gYXJjZ2lzTE9Ec1thcmNnaXNMT0RzLmxlbmd0aCAtIDFdLmxldmVsO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcmNnaXNMT0RzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYXJjZ2lzTE9EID0gYXJjZ2lzTE9Ec1tpXTtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGNpIGluIGNvcnJlY3RSZXNvbHV0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb3JyZWN0UmVzID0gY29ycmVjdFJlc29sdXRpb25zW2NpXTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoX3dpdGhpblBlcmNlbnRhZ2UoYXJjZ2lzTE9ELnJlc29sdXRpb24sIGNvcnJlY3RSZXMsIHpvb21PZmZzZXRBbGxvd2FuY2UpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuX2xvZE1hcFtjaV0gPSBhcmNnaXNMT0QubGV2ZWw7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKG5ldyBFcnJvcignbm9uLW1lcmNhdG9yIHNwYXRpYWwgcmVmZXJlbmNlJykpO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzdWx0KTtcbiAgICB9O1xuXG4gICAgaWYgKG9wdGlvbnMudXJsKSB7XG4gICAgICAgIGFqYXguZ2V0SlNPTih7dXJsOiBvcHRpb25zLnVybH0sIGxvYWRlZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYnJvd3Nlci5mcmFtZShsb2FkZWQuYmluZChudWxsLCBudWxsLCBvcHRpb25zKSk7XG4gICAgfVxufTtcbiJdfQ==
