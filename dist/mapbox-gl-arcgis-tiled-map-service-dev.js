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
    var d = this.zc[zoom];
    var f = Math.min(Math.max(Math.sin(D2R * ll[1]), -0.9999), 0.9999);
    var x = Math.round(d + ll[0] * this.Bc[zoom]);
    var y = Math.round(d + 0.5 * Math.log((1 + f) / (1 - f)) * (-this.Cc[zoom]));
    (x > this.Ac[zoom]) && (x = this.Ac[zoom]);
    (y > this.Ac[zoom]) && (y = this.Ac[zoom]);
    //(x < 0) && (x = 0);
    //(y < 0) && (y = 0);
    return [x, y];
};

// Convert screen pixel value to lon lat
//
// - `px` {Array} `[x, y]` array of geographic coordinates.
// - `zoom` {Number} zoom level.
SphericalMercator.prototype.ll = function(px, zoom) {
    var g = (px[1] - this.zc[zoom]) / (-this.Cc[zoom]);
    var lon = (px[0] - this.zc[zoom]) / this.Bc[zoom];
    var lat = R2D * (2 * Math.atan(Math.exp(g)) - 0.5 * Math.PI);
    return [lon, lat];
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvQG1hcGJveC9wb2ludC1nZW9tZXRyeS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9AbWFwYm94L3NwaGVyaWNhbG1lcmNhdG9yL3NwaGVyaWNhbG1lcmNhdG9yLmpzIiwibm9kZV9tb2R1bGVzL0BtYXBib3gvdW5pdGJlemllci9pbmRleC5qcyIsIi9Vc2Vycy9rcmlzL2Rldi9tYXBodWJzL21hcGJveC1nbC1hcmNnaXMtdGlsZWQtbWFwLXNlcnZpY2Uvbm9kZV9tb2R1bGVzL21hcGJveC1nbC9zcmMvZ2VvL2Nvb3JkaW5hdGUuanMiLCIvVXNlcnMva3Jpcy9kZXYvbWFwaHVicy9tYXBib3gtZ2wtYXJjZ2lzLXRpbGVkLW1hcC1zZXJ2aWNlL25vZGVfbW9kdWxlcy9tYXBib3gtZ2wvc3JjL2dlby9sbmdfbGF0LmpzIiwiL1VzZXJzL2tyaXMvZGV2L21hcGh1YnMvbWFwYm94LWdsLWFyY2dpcy10aWxlZC1tYXAtc2VydmljZS9ub2RlX21vZHVsZXMvbWFwYm94LWdsL3NyYy9nZW8vbG5nX2xhdF9ib3VuZHMuanMiLCIvVXNlcnMva3Jpcy9kZXYvbWFwaHVicy9tYXBib3gtZ2wtYXJjZ2lzLXRpbGVkLW1hcC1zZXJ2aWNlL25vZGVfbW9kdWxlcy9tYXBib3gtZ2wvc3JjL3JlbmRlci90ZXh0dXJlLmpzIiwiL1VzZXJzL2tyaXMvZGV2L21hcGh1YnMvbWFwYm94LWdsLWFyY2dpcy10aWxlZC1tYXAtc2VydmljZS9ub2RlX21vZHVsZXMvbWFwYm94LWdsL3NyYy9zb3VyY2UvdGlsZV9ib3VuZHMuanMiLCIvVXNlcnMva3Jpcy9kZXYvbWFwaHVicy9tYXBib3gtZ2wtYXJjZ2lzLXRpbGVkLW1hcC1zZXJ2aWNlL25vZGVfbW9kdWxlcy9tYXBib3gtZ2wvc3JjL3V0aWwvYWpheC5qcyIsIi9Vc2Vycy9rcmlzL2Rldi9tYXBodWJzL21hcGJveC1nbC1hcmNnaXMtdGlsZWQtbWFwLXNlcnZpY2Uvbm9kZV9tb2R1bGVzL21hcGJveC1nbC9zcmMvdXRpbC9icm93c2VyLmpzIiwiL1VzZXJzL2tyaXMvZGV2L21hcGh1YnMvbWFwYm94LWdsLWFyY2dpcy10aWxlZC1tYXAtc2VydmljZS9ub2RlX21vZHVsZXMvbWFwYm94LWdsL3NyYy91dGlsL2Jyb3dzZXIvd2luZG93LmpzIiwiL1VzZXJzL2tyaXMvZGV2L21hcGh1YnMvbWFwYm94LWdsLWFyY2dpcy10aWxlZC1tYXAtc2VydmljZS9ub2RlX21vZHVsZXMvbWFwYm94LWdsL3NyYy91dGlsL2V2ZW50ZWQuanMiLCIvVXNlcnMva3Jpcy9kZXYvbWFwaHVicy9tYXBib3gtZ2wtYXJjZ2lzLXRpbGVkLW1hcC1zZXJ2aWNlL25vZGVfbW9kdWxlcy9tYXBib3gtZ2wvc3JjL3V0aWwvdXRpbC5qcyIsIi9Vc2Vycy9rcmlzL2Rldi9tYXBodWJzL21hcGJveC1nbC1hcmNnaXMtdGlsZWQtbWFwLXNlcnZpY2Uvc3JjL2FyY2dpc190aWxlZF9tYXBfc2VydmljZV9zb3VyY2UuanMiLCIvVXNlcnMva3Jpcy9kZXYvbWFwaHVicy9tYXBib3gtZ2wtYXJjZ2lzLXRpbGVkLW1hcC1zZXJ2aWNlL3NyYy9oZWxwZXJzLmpzIiwiL1VzZXJzL2tyaXMvZGV2L21hcGh1YnMvbWFwYm94LWdsLWFyY2dpcy10aWxlZC1tYXAtc2VydmljZS9zcmMvaW5kZXguanMiLCIvVXNlcnMva3Jpcy9kZXYvbWFwaHVicy9tYXBib3gtZ2wtYXJjZ2lzLXRpbGVkLW1hcC1zZXJ2aWNlL3NyYy9sb2FkX2FyY2dpc19tYXBzZXJ2ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4VEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QUFNLENBQUMsQ0FBQztLQUM1QyxNQUFNO1FBQ0gsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztLQUNuRDtDQUNKLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBvaW50O1xuXG4vKipcbiAqIEEgc3RhbmRhbG9uZSBwb2ludCBnZW9tZXRyeSB3aXRoIHVzZWZ1bCBhY2Nlc3NvciwgY29tcGFyaXNvbiwgYW5kXG4gKiBtb2RpZmljYXRpb24gbWV0aG9kcy5cbiAqXG4gKiBAY2xhc3MgUG9pbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB4IHRoZSB4LWNvb3JkaW5hdGUuIHRoaXMgY291bGQgYmUgbG9uZ2l0dWRlIG9yIHNjcmVlblxuICogcGl4ZWxzLCBvciBhbnkgb3RoZXIgc29ydCBvZiB1bml0LlxuICogQHBhcmFtIHtOdW1iZXJ9IHkgdGhlIHktY29vcmRpbmF0ZS4gdGhpcyBjb3VsZCBiZSBsYXRpdHVkZSBvciBzY3JlZW5cbiAqIHBpeGVscywgb3IgYW55IG90aGVyIHNvcnQgb2YgdW5pdC5cbiAqIEBleGFtcGxlXG4gKiB2YXIgcG9pbnQgPSBuZXcgUG9pbnQoLTc3LCAzOCk7XG4gKi9cbmZ1bmN0aW9uIFBvaW50KHgsIHkpIHtcbiAgICB0aGlzLnggPSB4O1xuICAgIHRoaXMueSA9IHk7XG59XG5cblBvaW50LnByb3RvdHlwZSA9IHtcblxuICAgIC8qKlxuICAgICAqIENsb25lIHRoaXMgcG9pbnQsIHJldHVybmluZyBhIG5ldyBwb2ludCB0aGF0IGNhbiBiZSBtb2RpZmllZFxuICAgICAqIHdpdGhvdXQgYWZmZWN0aW5nIHRoZSBvbGQgb25lLlxuICAgICAqIEByZXR1cm4ge1BvaW50fSB0aGUgY2xvbmVcbiAgICAgKi9cbiAgICBjbG9uZTogZnVuY3Rpb24oKSB7IHJldHVybiBuZXcgUG9pbnQodGhpcy54LCB0aGlzLnkpOyB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkIHRoaXMgcG9pbnQncyB4ICYgeSBjb29yZGluYXRlcyB0byBhbm90aGVyIHBvaW50LFxuICAgICAqIHlpZWxkaW5nIGEgbmV3IHBvaW50LlxuICAgICAqIEBwYXJhbSB7UG9pbnR9IHAgdGhlIG90aGVyIHBvaW50XG4gICAgICogQHJldHVybiB7UG9pbnR9IG91dHB1dCBwb2ludFxuICAgICAqL1xuICAgIGFkZDogICAgIGZ1bmN0aW9uKHApIHsgcmV0dXJuIHRoaXMuY2xvbmUoKS5fYWRkKHApOyB9LFxuXG4gICAgLyoqXG4gICAgICogU3VidHJhY3QgdGhpcyBwb2ludCdzIHggJiB5IGNvb3JkaW5hdGVzIHRvIGZyb20gcG9pbnQsXG4gICAgICogeWllbGRpbmcgYSBuZXcgcG9pbnQuXG4gICAgICogQHBhcmFtIHtQb2ludH0gcCB0aGUgb3RoZXIgcG9pbnRcbiAgICAgKiBAcmV0dXJuIHtQb2ludH0gb3V0cHV0IHBvaW50XG4gICAgICovXG4gICAgc3ViOiAgICAgZnVuY3Rpb24ocCkgeyByZXR1cm4gdGhpcy5jbG9uZSgpLl9zdWIocCk7IH0sXG5cbiAgICAvKipcbiAgICAgKiBNdWx0aXBseSB0aGlzIHBvaW50J3MgeCAmIHkgY29vcmRpbmF0ZXMgYnkgcG9pbnQsXG4gICAgICogeWllbGRpbmcgYSBuZXcgcG9pbnQuXG4gICAgICogQHBhcmFtIHtQb2ludH0gcCB0aGUgb3RoZXIgcG9pbnRcbiAgICAgKiBAcmV0dXJuIHtQb2ludH0gb3V0cHV0IHBvaW50XG4gICAgICovXG4gICAgbXVsdEJ5UG9pbnQ6ICAgIGZ1bmN0aW9uKHApIHsgcmV0dXJuIHRoaXMuY2xvbmUoKS5fbXVsdEJ5UG9pbnQocCk7IH0sXG5cbiAgICAvKipcbiAgICAgKiBEaXZpZGUgdGhpcyBwb2ludCdzIHggJiB5IGNvb3JkaW5hdGVzIGJ5IHBvaW50LFxuICAgICAqIHlpZWxkaW5nIGEgbmV3IHBvaW50LlxuICAgICAqIEBwYXJhbSB7UG9pbnR9IHAgdGhlIG90aGVyIHBvaW50XG4gICAgICogQHJldHVybiB7UG9pbnR9IG91dHB1dCBwb2ludFxuICAgICAqL1xuICAgIGRpdkJ5UG9pbnQ6ICAgICBmdW5jdGlvbihwKSB7IHJldHVybiB0aGlzLmNsb25lKCkuX2RpdkJ5UG9pbnQocCk7IH0sXG5cbiAgICAvKipcbiAgICAgKiBNdWx0aXBseSB0aGlzIHBvaW50J3MgeCAmIHkgY29vcmRpbmF0ZXMgYnkgYSBmYWN0b3IsXG4gICAgICogeWllbGRpbmcgYSBuZXcgcG9pbnQuXG4gICAgICogQHBhcmFtIHtQb2ludH0gayBmYWN0b3JcbiAgICAgKiBAcmV0dXJuIHtQb2ludH0gb3V0cHV0IHBvaW50XG4gICAgICovXG4gICAgbXVsdDogICAgZnVuY3Rpb24oaykgeyByZXR1cm4gdGhpcy5jbG9uZSgpLl9tdWx0KGspOyB9LFxuXG4gICAgLyoqXG4gICAgICogRGl2aWRlIHRoaXMgcG9pbnQncyB4ICYgeSBjb29yZGluYXRlcyBieSBhIGZhY3RvcixcbiAgICAgKiB5aWVsZGluZyBhIG5ldyBwb2ludC5cbiAgICAgKiBAcGFyYW0ge1BvaW50fSBrIGZhY3RvclxuICAgICAqIEByZXR1cm4ge1BvaW50fSBvdXRwdXQgcG9pbnRcbiAgICAgKi9cbiAgICBkaXY6ICAgICBmdW5jdGlvbihrKSB7IHJldHVybiB0aGlzLmNsb25lKCkuX2RpdihrKTsgfSxcblxuICAgIC8qKlxuICAgICAqIFJvdGF0ZSB0aGlzIHBvaW50IGFyb3VuZCB0aGUgMCwgMCBvcmlnaW4gYnkgYW4gYW5nbGUgYSxcbiAgICAgKiBnaXZlbiBpbiByYWRpYW5zXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGEgYW5nbGUgdG8gcm90YXRlIGFyb3VuZCwgaW4gcmFkaWFuc1xuICAgICAqIEByZXR1cm4ge1BvaW50fSBvdXRwdXQgcG9pbnRcbiAgICAgKi9cbiAgICByb3RhdGU6ICBmdW5jdGlvbihhKSB7IHJldHVybiB0aGlzLmNsb25lKCkuX3JvdGF0ZShhKTsgfSxcblxuICAgIC8qKlxuICAgICAqIFJvdGF0ZSB0aGlzIHBvaW50IGFyb3VuZCBwIHBvaW50IGJ5IGFuIGFuZ2xlIGEsXG4gICAgICogZ2l2ZW4gaW4gcmFkaWFuc1xuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBhIGFuZ2xlIHRvIHJvdGF0ZSBhcm91bmQsIGluIHJhZGlhbnNcbiAgICAgKiBAcGFyYW0ge1BvaW50fSBwIFBvaW50IHRvIHJvdGF0ZSBhcm91bmRcbiAgICAgKiBAcmV0dXJuIHtQb2ludH0gb3V0cHV0IHBvaW50XG4gICAgICovXG4gICAgcm90YXRlQXJvdW5kOiAgZnVuY3Rpb24oYSxwKSB7IHJldHVybiB0aGlzLmNsb25lKCkuX3JvdGF0ZUFyb3VuZChhLHApOyB9LFxuXG4gICAgLyoqXG4gICAgICogTXVsdGlwbHkgdGhpcyBwb2ludCBieSBhIDR4MSB0cmFuc2Zvcm1hdGlvbiBtYXRyaXhcbiAgICAgKiBAcGFyYW0ge0FycmF5PE51bWJlcj59IG0gdHJhbnNmb3JtYXRpb24gbWF0cml4XG4gICAgICogQHJldHVybiB7UG9pbnR9IG91dHB1dCBwb2ludFxuICAgICAqL1xuICAgIG1hdE11bHQ6IGZ1bmN0aW9uKG0pIHsgcmV0dXJuIHRoaXMuY2xvbmUoKS5fbWF0TXVsdChtKTsgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGN1bGF0ZSB0aGlzIHBvaW50IGJ1dCBhcyBhIHVuaXQgdmVjdG9yIGZyb20gMCwgMCwgbWVhbmluZ1xuICAgICAqIHRoYXQgdGhlIGRpc3RhbmNlIGZyb20gdGhlIHJlc3VsdGluZyBwb2ludCB0byB0aGUgMCwgMFxuICAgICAqIGNvb3JkaW5hdGUgd2lsbCBiZSBlcXVhbCB0byAxIGFuZCB0aGUgYW5nbGUgZnJvbSB0aGUgcmVzdWx0aW5nXG4gICAgICogcG9pbnQgdG8gdGhlIDAsIDAgY29vcmRpbmF0ZSB3aWxsIGJlIHRoZSBzYW1lIGFzIGJlZm9yZS5cbiAgICAgKiBAcmV0dXJuIHtQb2ludH0gdW5pdCB2ZWN0b3IgcG9pbnRcbiAgICAgKi9cbiAgICB1bml0OiAgICBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuY2xvbmUoKS5fdW5pdCgpOyB9LFxuXG4gICAgLyoqXG4gICAgICogQ29tcHV0ZSBhIHBlcnBlbmRpY3VsYXIgcG9pbnQsIHdoZXJlIHRoZSBuZXcgeSBjb29yZGluYXRlXG4gICAgICogaXMgdGhlIG9sZCB4IGNvb3JkaW5hdGUgYW5kIHRoZSBuZXcgeCBjb29yZGluYXRlIGlzIHRoZSBvbGQgeVxuICAgICAqIGNvb3JkaW5hdGUgbXVsdGlwbGllZCBieSAtMVxuICAgICAqIEByZXR1cm4ge1BvaW50fSBwZXJwZW5kaWN1bGFyIHBvaW50XG4gICAgICovXG4gICAgcGVycDogICAgZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmNsb25lKCkuX3BlcnAoKTsgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBhIHZlcnNpb24gb2YgdGhpcyBwb2ludCB3aXRoIHRoZSB4ICYgeSBjb29yZGluYXRlc1xuICAgICAqIHJvdW5kZWQgdG8gaW50ZWdlcnMuXG4gICAgICogQHJldHVybiB7UG9pbnR9IHJvdW5kZWQgcG9pbnRcbiAgICAgKi9cbiAgICByb3VuZDogICBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuY2xvbmUoKS5fcm91bmQoKTsgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiB0aGUgbWFnaXR1ZGUgb2YgdGhpcyBwb2ludDogdGhpcyBpcyB0aGUgRXVjbGlkZWFuXG4gICAgICogZGlzdGFuY2UgZnJvbSB0aGUgMCwgMCBjb29yZGluYXRlIHRvIHRoaXMgcG9pbnQncyB4IGFuZCB5XG4gICAgICogY29vcmRpbmF0ZXMuXG4gICAgICogQHJldHVybiB7TnVtYmVyfSBtYWduaXR1ZGVcbiAgICAgKi9cbiAgICBtYWc6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KHRoaXMueCAqIHRoaXMueCArIHRoaXMueSAqIHRoaXMueSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEp1ZGdlIHdoZXRoZXIgdGhpcyBwb2ludCBpcyBlcXVhbCB0byBhbm90aGVyIHBvaW50LCByZXR1cm5pbmdcbiAgICAgKiB0cnVlIG9yIGZhbHNlLlxuICAgICAqIEBwYXJhbSB7UG9pbnR9IG90aGVyIHRoZSBvdGhlciBwb2ludFxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHdoZXRoZXIgdGhlIHBvaW50cyBhcmUgZXF1YWxcbiAgICAgKi9cbiAgICBlcXVhbHM6IGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnggPT09IG90aGVyLnggJiZcbiAgICAgICAgICAgICAgIHRoaXMueSA9PT0gb3RoZXIueTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlIHRoZSBkaXN0YW5jZSBmcm9tIHRoaXMgcG9pbnQgdG8gYW5vdGhlciBwb2ludFxuICAgICAqIEBwYXJhbSB7UG9pbnR9IHAgdGhlIG90aGVyIHBvaW50XG4gICAgICogQHJldHVybiB7TnVtYmVyfSBkaXN0YW5jZVxuICAgICAqL1xuICAgIGRpc3Q6IGZ1bmN0aW9uKHApIHtcbiAgICAgICAgcmV0dXJuIE1hdGguc3FydCh0aGlzLmRpc3RTcXIocCkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGUgdGhlIGRpc3RhbmNlIGZyb20gdGhpcyBwb2ludCB0byBhbm90aGVyIHBvaW50LFxuICAgICAqIHdpdGhvdXQgdGhlIHNxdWFyZSByb290IHN0ZXAuIFVzZWZ1bCBpZiB5b3UncmUgY29tcGFyaW5nXG4gICAgICogcmVsYXRpdmUgZGlzdGFuY2VzLlxuICAgICAqIEBwYXJhbSB7UG9pbnR9IHAgdGhlIG90aGVyIHBvaW50XG4gICAgICogQHJldHVybiB7TnVtYmVyfSBkaXN0YW5jZVxuICAgICAqL1xuICAgIGRpc3RTcXI6IGZ1bmN0aW9uKHApIHtcbiAgICAgICAgdmFyIGR4ID0gcC54IC0gdGhpcy54LFxuICAgICAgICAgICAgZHkgPSBwLnkgLSB0aGlzLnk7XG4gICAgICAgIHJldHVybiBkeCAqIGR4ICsgZHkgKiBkeTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBhbmdsZSBmcm9tIHRoZSAwLCAwIGNvb3JkaW5hdGUgdG8gdGhpcyBwb2ludCwgaW4gcmFkaWFuc1xuICAgICAqIGNvb3JkaW5hdGVzLlxuICAgICAqIEByZXR1cm4ge051bWJlcn0gYW5nbGVcbiAgICAgKi9cbiAgICBhbmdsZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBNYXRoLmF0YW4yKHRoaXMueSwgdGhpcy54KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBhbmdsZSBmcm9tIHRoaXMgcG9pbnQgdG8gYW5vdGhlciBwb2ludCwgaW4gcmFkaWFuc1xuICAgICAqIEBwYXJhbSB7UG9pbnR9IGIgdGhlIG90aGVyIHBvaW50XG4gICAgICogQHJldHVybiB7TnVtYmVyfSBhbmdsZVxuICAgICAqL1xuICAgIGFuZ2xlVG86IGZ1bmN0aW9uKGIpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguYXRhbjIodGhpcy55IC0gYi55LCB0aGlzLnggLSBiLngpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGFuZ2xlIGJldHdlZW4gdGhpcyBwb2ludCBhbmQgYW5vdGhlciBwb2ludCwgaW4gcmFkaWFuc1xuICAgICAqIEBwYXJhbSB7UG9pbnR9IGIgdGhlIG90aGVyIHBvaW50XG4gICAgICogQHJldHVybiB7TnVtYmVyfSBhbmdsZVxuICAgICAqL1xuICAgIGFuZ2xlV2l0aDogZnVuY3Rpb24oYikge1xuICAgICAgICByZXR1cm4gdGhpcy5hbmdsZVdpdGhTZXAoYi54LCBiLnkpO1xuICAgIH0sXG5cbiAgICAvKlxuICAgICAqIEZpbmQgdGhlIGFuZ2xlIG9mIHRoZSB0d28gdmVjdG9ycywgc29sdmluZyB0aGUgZm9ybXVsYSBmb3JcbiAgICAgKiB0aGUgY3Jvc3MgcHJvZHVjdCBhIHggYiA9IHxhfHxifHNpbijOuCkgZm9yIM64LlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB4IHRoZSB4LWNvb3JkaW5hdGVcbiAgICAgKiBAcGFyYW0ge051bWJlcn0geSB0aGUgeS1jb29yZGluYXRlXG4gICAgICogQHJldHVybiB7TnVtYmVyfSB0aGUgYW5nbGUgaW4gcmFkaWFuc1xuICAgICAqL1xuICAgIGFuZ2xlV2l0aFNlcDogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICByZXR1cm4gTWF0aC5hdGFuMihcbiAgICAgICAgICAgIHRoaXMueCAqIHkgLSB0aGlzLnkgKiB4LFxuICAgICAgICAgICAgdGhpcy54ICogeCArIHRoaXMueSAqIHkpO1xuICAgIH0sXG5cbiAgICBfbWF0TXVsdDogZnVuY3Rpb24obSkge1xuICAgICAgICB2YXIgeCA9IG1bMF0gKiB0aGlzLnggKyBtWzFdICogdGhpcy55LFxuICAgICAgICAgICAgeSA9IG1bMl0gKiB0aGlzLnggKyBtWzNdICogdGhpcy55O1xuICAgICAgICB0aGlzLnggPSB4O1xuICAgICAgICB0aGlzLnkgPSB5O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgX2FkZDogZnVuY3Rpb24ocCkge1xuICAgICAgICB0aGlzLnggKz0gcC54O1xuICAgICAgICB0aGlzLnkgKz0gcC55O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgX3N1YjogZnVuY3Rpb24ocCkge1xuICAgICAgICB0aGlzLnggLT0gcC54O1xuICAgICAgICB0aGlzLnkgLT0gcC55O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgX211bHQ6IGZ1bmN0aW9uKGspIHtcbiAgICAgICAgdGhpcy54ICo9IGs7XG4gICAgICAgIHRoaXMueSAqPSBrO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgX2RpdjogZnVuY3Rpb24oaykge1xuICAgICAgICB0aGlzLnggLz0gaztcbiAgICAgICAgdGhpcy55IC89IGs7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBfbXVsdEJ5UG9pbnQ6IGZ1bmN0aW9uKHApIHtcbiAgICAgICAgdGhpcy54ICo9IHAueDtcbiAgICAgICAgdGhpcy55ICo9IHAueTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIF9kaXZCeVBvaW50OiBmdW5jdGlvbihwKSB7XG4gICAgICAgIHRoaXMueCAvPSBwLng7XG4gICAgICAgIHRoaXMueSAvPSBwLnk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBfdW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2Rpdih0aGlzLm1hZygpKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIF9wZXJwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHkgPSB0aGlzLnk7XG4gICAgICAgIHRoaXMueSA9IHRoaXMueDtcbiAgICAgICAgdGhpcy54ID0gLXk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBfcm90YXRlOiBmdW5jdGlvbihhbmdsZSkge1xuICAgICAgICB2YXIgY29zID0gTWF0aC5jb3MoYW5nbGUpLFxuICAgICAgICAgICAgc2luID0gTWF0aC5zaW4oYW5nbGUpLFxuICAgICAgICAgICAgeCA9IGNvcyAqIHRoaXMueCAtIHNpbiAqIHRoaXMueSxcbiAgICAgICAgICAgIHkgPSBzaW4gKiB0aGlzLnggKyBjb3MgKiB0aGlzLnk7XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBfcm90YXRlQXJvdW5kOiBmdW5jdGlvbihhbmdsZSwgcCkge1xuICAgICAgICB2YXIgY29zID0gTWF0aC5jb3MoYW5nbGUpLFxuICAgICAgICAgICAgc2luID0gTWF0aC5zaW4oYW5nbGUpLFxuICAgICAgICAgICAgeCA9IHAueCArIGNvcyAqICh0aGlzLnggLSBwLngpIC0gc2luICogKHRoaXMueSAtIHAueSksXG4gICAgICAgICAgICB5ID0gcC55ICsgc2luICogKHRoaXMueCAtIHAueCkgKyBjb3MgKiAodGhpcy55IC0gcC55KTtcbiAgICAgICAgdGhpcy54ID0geDtcbiAgICAgICAgdGhpcy55ID0geTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIF9yb3VuZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMueCA9IE1hdGgucm91bmQodGhpcy54KTtcbiAgICAgICAgdGhpcy55ID0gTWF0aC5yb3VuZCh0aGlzLnkpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59O1xuXG4vKipcbiAqIENvbnN0cnVjdCBhIHBvaW50IGZyb20gYW4gYXJyYXkgaWYgbmVjZXNzYXJ5LCBvdGhlcndpc2UgaWYgdGhlIGlucHV0XG4gKiBpcyBhbHJlYWR5IGEgUG9pbnQsIG9yIGFuIHVua25vd24gdHlwZSwgcmV0dXJuIGl0IHVuY2hhbmdlZFxuICogQHBhcmFtIHtBcnJheTxOdW1iZXI+fFBvaW50fCp9IGEgYW55IGtpbmQgb2YgaW5wdXQgdmFsdWVcbiAqIEByZXR1cm4ge1BvaW50fSBjb25zdHJ1Y3RlZCBwb2ludCwgb3IgcGFzc2VkLXRocm91Z2ggdmFsdWUuXG4gKiBAZXhhbXBsZVxuICogLy8gdGhpc1xuICogdmFyIHBvaW50ID0gUG9pbnQuY29udmVydChbMCwgMV0pO1xuICogLy8gaXMgZXF1aXZhbGVudCB0b1xuICogdmFyIHBvaW50ID0gbmV3IFBvaW50KDAsIDEpO1xuICovXG5Qb2ludC5jb252ZXJ0ID0gZnVuY3Rpb24gKGEpIHtcbiAgICBpZiAoYSBpbnN0YW5jZW9mIFBvaW50KSB7XG4gICAgICAgIHJldHVybiBhO1xuICAgIH1cbiAgICBpZiAoQXJyYXkuaXNBcnJheShhKSkge1xuICAgICAgICByZXR1cm4gbmV3IFBvaW50KGFbMF0sIGFbMV0pO1xuICAgIH1cbiAgICByZXR1cm4gYTtcbn07XG4iLCJ2YXIgU3BoZXJpY2FsTWVyY2F0b3IgPSAoZnVuY3Rpb24oKXtcblxuLy8gQ2xvc3VyZXMgaW5jbHVkaW5nIGNvbnN0YW50cyBhbmQgb3RoZXIgcHJlY2FsY3VsYXRlZCB2YWx1ZXMuXG52YXIgY2FjaGUgPSB7fSxcbiAgICBFUFNMTiA9IDEuMGUtMTAsXG4gICAgRDJSID0gTWF0aC5QSSAvIDE4MCxcbiAgICBSMkQgPSAxODAgLyBNYXRoLlBJLFxuICAgIC8vIDkwMDkxMyBwcm9wZXJ0aWVzLlxuICAgIEEgPSA2Mzc4MTM3LjAsXG4gICAgTUFYRVhURU5UID0gMjAwMzc1MDguMzQyNzg5MjQ0O1xuXG5cbi8vIFNwaGVyaWNhbE1lcmNhdG9yIGNvbnN0cnVjdG9yOiBwcmVjYWNoZXMgY2FsY3VsYXRpb25zXG4vLyBmb3IgZmFzdCB0aWxlIGxvb2t1cHMuXG5mdW5jdGlvbiBTcGhlcmljYWxNZXJjYXRvcihvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdGhpcy5zaXplID0gb3B0aW9ucy5zaXplIHx8IDI1NjtcbiAgICBpZiAoIWNhY2hlW3RoaXMuc2l6ZV0pIHtcbiAgICAgICAgdmFyIHNpemUgPSB0aGlzLnNpemU7XG4gICAgICAgIHZhciBjID0gY2FjaGVbdGhpcy5zaXplXSA9IHt9O1xuICAgICAgICBjLkJjID0gW107XG4gICAgICAgIGMuQ2MgPSBbXTtcbiAgICAgICAgYy56YyA9IFtdO1xuICAgICAgICBjLkFjID0gW107XG4gICAgICAgIGZvciAodmFyIGQgPSAwOyBkIDwgMzA7IGQrKykge1xuICAgICAgICAgICAgYy5CYy5wdXNoKHNpemUgLyAzNjApO1xuICAgICAgICAgICAgYy5DYy5wdXNoKHNpemUgLyAoMiAqIE1hdGguUEkpKTtcbiAgICAgICAgICAgIGMuemMucHVzaChzaXplIC8gMik7XG4gICAgICAgICAgICBjLkFjLnB1c2goc2l6ZSk7XG4gICAgICAgICAgICBzaXplICo9IDI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5CYyA9IGNhY2hlW3RoaXMuc2l6ZV0uQmM7XG4gICAgdGhpcy5DYyA9IGNhY2hlW3RoaXMuc2l6ZV0uQ2M7XG4gICAgdGhpcy56YyA9IGNhY2hlW3RoaXMuc2l6ZV0uemM7XG4gICAgdGhpcy5BYyA9IGNhY2hlW3RoaXMuc2l6ZV0uQWM7XG59O1xuXG4vLyBDb252ZXJ0IGxvbiBsYXQgdG8gc2NyZWVuIHBpeGVsIHZhbHVlXG4vL1xuLy8gLSBgbGxgIHtBcnJheX0gYFtsb24sIGxhdF1gIGFycmF5IG9mIGdlb2dyYXBoaWMgY29vcmRpbmF0ZXMuXG4vLyAtIGB6b29tYCB7TnVtYmVyfSB6b29tIGxldmVsLlxuU3BoZXJpY2FsTWVyY2F0b3IucHJvdG90eXBlLnB4ID0gZnVuY3Rpb24obGwsIHpvb20pIHtcbiAgICB2YXIgZCA9IHRoaXMuemNbem9vbV07XG4gICAgdmFyIGYgPSBNYXRoLm1pbihNYXRoLm1heChNYXRoLnNpbihEMlIgKiBsbFsxXSksIC0wLjk5OTkpLCAwLjk5OTkpO1xuICAgIHZhciB4ID0gTWF0aC5yb3VuZChkICsgbGxbMF0gKiB0aGlzLkJjW3pvb21dKTtcbiAgICB2YXIgeSA9IE1hdGgucm91bmQoZCArIDAuNSAqIE1hdGgubG9nKCgxICsgZikgLyAoMSAtIGYpKSAqICgtdGhpcy5DY1t6b29tXSkpO1xuICAgICh4ID4gdGhpcy5BY1t6b29tXSkgJiYgKHggPSB0aGlzLkFjW3pvb21dKTtcbiAgICAoeSA+IHRoaXMuQWNbem9vbV0pICYmICh5ID0gdGhpcy5BY1t6b29tXSk7XG4gICAgLy8oeCA8IDApICYmICh4ID0gMCk7XG4gICAgLy8oeSA8IDApICYmICh5ID0gMCk7XG4gICAgcmV0dXJuIFt4LCB5XTtcbn07XG5cbi8vIENvbnZlcnQgc2NyZWVuIHBpeGVsIHZhbHVlIHRvIGxvbiBsYXRcbi8vXG4vLyAtIGBweGAge0FycmF5fSBgW3gsIHldYCBhcnJheSBvZiBnZW9ncmFwaGljIGNvb3JkaW5hdGVzLlxuLy8gLSBgem9vbWAge051bWJlcn0gem9vbSBsZXZlbC5cblNwaGVyaWNhbE1lcmNhdG9yLnByb3RvdHlwZS5sbCA9IGZ1bmN0aW9uKHB4LCB6b29tKSB7XG4gICAgdmFyIGcgPSAocHhbMV0gLSB0aGlzLnpjW3pvb21dKSAvICgtdGhpcy5DY1t6b29tXSk7XG4gICAgdmFyIGxvbiA9IChweFswXSAtIHRoaXMuemNbem9vbV0pIC8gdGhpcy5CY1t6b29tXTtcbiAgICB2YXIgbGF0ID0gUjJEICogKDIgKiBNYXRoLmF0YW4oTWF0aC5leHAoZykpIC0gMC41ICogTWF0aC5QSSk7XG4gICAgcmV0dXJuIFtsb24sIGxhdF07XG59O1xuXG4vLyBDb252ZXJ0IHRpbGUgeHl6IHZhbHVlIHRvIGJib3ggb2YgdGhlIGZvcm0gYFt3LCBzLCBlLCBuXWBcbi8vXG4vLyAtIGB4YCB7TnVtYmVyfSB4IChsb25naXR1ZGUpIG51bWJlci5cbi8vIC0gYHlgIHtOdW1iZXJ9IHkgKGxhdGl0dWRlKSBudW1iZXIuXG4vLyAtIGB6b29tYCB7TnVtYmVyfSB6b29tLlxuLy8gLSBgdG1zX3N0eWxlYCB7Qm9vbGVhbn0gd2hldGhlciB0byBjb21wdXRlIHVzaW5nIHRtcy1zdHlsZS5cbi8vIC0gYHNyc2Age1N0cmluZ30gcHJvamVjdGlvbiBmb3IgcmVzdWx0aW5nIGJib3ggKFdHUzg0fDkwMDkxMykuXG4vLyAtIGByZXR1cm5gIHtBcnJheX0gYmJveCBhcnJheSBvZiB2YWx1ZXMgaW4gZm9ybSBgW3csIHMsIGUsIG5dYC5cblNwaGVyaWNhbE1lcmNhdG9yLnByb3RvdHlwZS5iYm94ID0gZnVuY3Rpb24oeCwgeSwgem9vbSwgdG1zX3N0eWxlLCBzcnMpIHtcbiAgICAvLyBDb252ZXJ0IHh5eiBpbnRvIGJib3ggd2l0aCBzcnMgV0dTODRcbiAgICBpZiAodG1zX3N0eWxlKSB7XG4gICAgICAgIHkgPSAoTWF0aC5wb3coMiwgem9vbSkgLSAxKSAtIHk7XG4gICAgfVxuICAgIC8vIFVzZSAreSB0byBtYWtlIHN1cmUgaXQncyBhIG51bWJlciB0byBhdm9pZCBpbmFkdmVydGVudCBjb25jYXRlbmF0aW9uLlxuICAgIHZhciBsbCA9IFt4ICogdGhpcy5zaXplLCAoK3kgKyAxKSAqIHRoaXMuc2l6ZV07IC8vIGxvd2VyIGxlZnRcbiAgICAvLyBVc2UgK3ggdG8gbWFrZSBzdXJlIGl0J3MgYSBudW1iZXIgdG8gYXZvaWQgaW5hZHZlcnRlbnQgY29uY2F0ZW5hdGlvbi5cbiAgICB2YXIgdXIgPSBbKCt4ICsgMSkgKiB0aGlzLnNpemUsIHkgKiB0aGlzLnNpemVdOyAvLyB1cHBlciByaWdodFxuICAgIHZhciBiYm94ID0gdGhpcy5sbChsbCwgem9vbSkuY29uY2F0KHRoaXMubGwodXIsIHpvb20pKTtcblxuICAgIC8vIElmIHdlYiBtZXJjYXRvciByZXF1ZXN0ZWQgcmVwcm9qZWN0IHRvIDkwMDkxMy5cbiAgICBpZiAoc3JzID09PSAnOTAwOTEzJykge1xuICAgICAgICByZXR1cm4gdGhpcy5jb252ZXJ0KGJib3gsICc5MDA5MTMnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gYmJveDtcbiAgICB9XG59O1xuXG4vLyBDb252ZXJ0IGJib3ggdG8geHl4IGJvdW5kc1xuLy9cbi8vIC0gYGJib3hgIHtOdW1iZXJ9IGJib3ggaW4gdGhlIGZvcm0gYFt3LCBzLCBlLCBuXWAuXG4vLyAtIGB6b29tYCB7TnVtYmVyfSB6b29tLlxuLy8gLSBgdG1zX3N0eWxlYCB7Qm9vbGVhbn0gd2hldGhlciB0byBjb21wdXRlIHVzaW5nIHRtcy1zdHlsZS5cbi8vIC0gYHNyc2Age1N0cmluZ30gcHJvamVjdGlvbiBvZiBpbnB1dCBiYm94IChXR1M4NHw5MDA5MTMpLlxuLy8gLSBgQHJldHVybmAge09iamVjdH0gWFlaIGJvdW5kcyBjb250YWluaW5nIG1pblgsIG1heFgsIG1pblksIG1heFkgcHJvcGVydGllcy5cblNwaGVyaWNhbE1lcmNhdG9yLnByb3RvdHlwZS54eXogPSBmdW5jdGlvbihiYm94LCB6b29tLCB0bXNfc3R5bGUsIHNycykge1xuICAgIC8vIElmIHdlYiBtZXJjYXRvciBwcm92aWRlZCByZXByb2plY3QgdG8gV0dTODQuXG4gICAgaWYgKHNycyA9PT0gJzkwMDkxMycpIHtcbiAgICAgICAgYmJveCA9IHRoaXMuY29udmVydChiYm94LCAnV0dTODQnKTtcbiAgICB9XG5cbiAgICB2YXIgbGwgPSBbYmJveFswXSwgYmJveFsxXV07IC8vIGxvd2VyIGxlZnRcbiAgICB2YXIgdXIgPSBbYmJveFsyXSwgYmJveFszXV07IC8vIHVwcGVyIHJpZ2h0XG4gICAgdmFyIHB4X2xsID0gdGhpcy5weChsbCwgem9vbSk7XG4gICAgdmFyIHB4X3VyID0gdGhpcy5weCh1ciwgem9vbSk7XG4gICAgLy8gWSA9IDAgZm9yIFhZWiBpcyB0aGUgdG9wIGhlbmNlIG1pblkgdXNlcyBweF91clsxXS5cbiAgICB2YXIgeCA9IFsgTWF0aC5mbG9vcihweF9sbFswXSAvIHRoaXMuc2l6ZSksIE1hdGguZmxvb3IoKHB4X3VyWzBdIC0gMSkgLyB0aGlzLnNpemUpIF07XG4gICAgdmFyIHkgPSBbIE1hdGguZmxvb3IocHhfdXJbMV0gLyB0aGlzLnNpemUpLCBNYXRoLmZsb29yKChweF9sbFsxXSAtIDEpIC8gdGhpcy5zaXplKSBdO1xuICAgIHZhciBib3VuZHMgPSB7XG4gICAgICAgIG1pblg6IE1hdGgubWluLmFwcGx5KE1hdGgsIHgpIDwgMCA/IDAgOiBNYXRoLm1pbi5hcHBseShNYXRoLCB4KSxcbiAgICAgICAgbWluWTogTWF0aC5taW4uYXBwbHkoTWF0aCwgeSkgPCAwID8gMCA6IE1hdGgubWluLmFwcGx5KE1hdGgsIHkpLFxuICAgICAgICBtYXhYOiBNYXRoLm1heC5hcHBseShNYXRoLCB4KSxcbiAgICAgICAgbWF4WTogTWF0aC5tYXguYXBwbHkoTWF0aCwgeSlcbiAgICB9O1xuICAgIGlmICh0bXNfc3R5bGUpIHtcbiAgICAgICAgdmFyIHRtcyA9IHtcbiAgICAgICAgICAgIG1pblk6IChNYXRoLnBvdygyLCB6b29tKSAtIDEpIC0gYm91bmRzLm1heFksXG4gICAgICAgICAgICBtYXhZOiAoTWF0aC5wb3coMiwgem9vbSkgLSAxKSAtIGJvdW5kcy5taW5ZXG4gICAgICAgIH07XG4gICAgICAgIGJvdW5kcy5taW5ZID0gdG1zLm1pblk7XG4gICAgICAgIGJvdW5kcy5tYXhZID0gdG1zLm1heFk7XG4gICAgfVxuICAgIHJldHVybiBib3VuZHM7XG59O1xuXG4vLyBDb252ZXJ0IHByb2plY3Rpb24gb2YgZ2l2ZW4gYmJveC5cbi8vXG4vLyAtIGBiYm94YCB7TnVtYmVyfSBiYm94IGluIHRoZSBmb3JtIGBbdywgcywgZSwgbl1gLlxuLy8gLSBgdG9gIHtTdHJpbmd9IHByb2plY3Rpb24gb2Ygb3V0cHV0IGJib3ggKFdHUzg0fDkwMDkxMykuIElucHV0IGJib3hcbi8vICAgYXNzdW1lZCB0byBiZSB0aGUgXCJvdGhlclwiIHByb2plY3Rpb24uXG4vLyAtIGBAcmV0dXJuYCB7T2JqZWN0fSBiYm94IHdpdGggcmVwcm9qZWN0ZWQgY29vcmRpbmF0ZXMuXG5TcGhlcmljYWxNZXJjYXRvci5wcm90b3R5cGUuY29udmVydCA9IGZ1bmN0aW9uKGJib3gsIHRvKSB7XG4gICAgaWYgKHRvID09PSAnOTAwOTEzJykge1xuICAgICAgICByZXR1cm4gdGhpcy5mb3J3YXJkKGJib3guc2xpY2UoMCwgMikpLmNvbmNhdCh0aGlzLmZvcndhcmQoYmJveC5zbGljZSgyLDQpKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW52ZXJzZShiYm94LnNsaWNlKDAsIDIpKS5jb25jYXQodGhpcy5pbnZlcnNlKGJib3guc2xpY2UoMiw0KSkpO1xuICAgIH1cbn07XG5cbi8vIENvbnZlcnQgbG9uL2xhdCB2YWx1ZXMgdG8gOTAwOTEzIHgveS5cblNwaGVyaWNhbE1lcmNhdG9yLnByb3RvdHlwZS5mb3J3YXJkID0gZnVuY3Rpb24obGwpIHtcbiAgICB2YXIgeHkgPSBbXG4gICAgICAgIEEgKiBsbFswXSAqIEQyUixcbiAgICAgICAgQSAqIE1hdGgubG9nKE1hdGgudGFuKChNYXRoLlBJKjAuMjUpICsgKDAuNSAqIGxsWzFdICogRDJSKSkpXG4gICAgXTtcbiAgICAvLyBpZiB4eSB2YWx1ZSBpcyBiZXlvbmQgbWF4ZXh0ZW50IChlLmcuIHBvbGVzKSwgcmV0dXJuIG1heGV4dGVudC5cbiAgICAoeHlbMF0gPiBNQVhFWFRFTlQpICYmICh4eVswXSA9IE1BWEVYVEVOVCk7XG4gICAgKHh5WzBdIDwgLU1BWEVYVEVOVCkgJiYgKHh5WzBdID0gLU1BWEVYVEVOVCk7XG4gICAgKHh5WzFdID4gTUFYRVhURU5UKSAmJiAoeHlbMV0gPSBNQVhFWFRFTlQpO1xuICAgICh4eVsxXSA8IC1NQVhFWFRFTlQpICYmICh4eVsxXSA9IC1NQVhFWFRFTlQpO1xuICAgIHJldHVybiB4eTtcbn07XG5cbi8vIENvbnZlcnQgOTAwOTEzIHgveSB2YWx1ZXMgdG8gbG9uL2xhdC5cblNwaGVyaWNhbE1lcmNhdG9yLnByb3RvdHlwZS5pbnZlcnNlID0gZnVuY3Rpb24oeHkpIHtcbiAgICByZXR1cm4gW1xuICAgICAgICAoeHlbMF0gKiBSMkQgLyBBKSxcbiAgICAgICAgKChNYXRoLlBJKjAuNSkgLSAyLjAgKiBNYXRoLmF0YW4oTWF0aC5leHAoLXh5WzFdIC8gQSkpKSAqIFIyRFxuICAgIF07XG59O1xuXG5yZXR1cm4gU3BoZXJpY2FsTWVyY2F0b3I7XG5cbn0pKCk7XG5cbmlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBTcGhlcmljYWxNZXJjYXRvcjtcbn1cbiIsIi8qXG4gKiBDb3B5cmlnaHQgKEMpIDIwMDggQXBwbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dFxuICogbW9kaWZpY2F0aW9uLCBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zXG4gKiBhcmUgbWV0OlxuICogMS4gUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHRcbiAqICAgIG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAqIDIuIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0XG4gKiAgICBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlXG4gKiAgICBkb2N1bWVudGF0aW9uIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuICpcbiAqIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgQVBQTEUgSU5DLiBgYEFTIElTJycgQU5EIEFOWVxuICogRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEVcbiAqIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUlxuICogUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC4gIElOIE5PIEVWRU5UIFNIQUxMIEFQUExFIElOQy4gT1JcbiAqIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLFxuICogRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLFxuICogUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsIERBVEEsIE9SXG4gKiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTiBBTlkgVEhFT1JZXG4gKiBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbiAqIChJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRVxuICogT0YgVEhJUyBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cbiAqXG4gKiBQb3J0ZWQgZnJvbSBXZWJraXRcbiAqIGh0dHA6Ly9zdm4ud2Via2l0Lm9yZy9yZXBvc2l0b3J5L3dlYmtpdC90cnVuay9Tb3VyY2UvV2ViQ29yZS9wbGF0Zm9ybS9ncmFwaGljcy9Vbml0QmV6aWVyLmhcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IFVuaXRCZXppZXI7XG5cbmZ1bmN0aW9uIFVuaXRCZXppZXIocDF4LCBwMXksIHAyeCwgcDJ5KSB7XG4gICAgLy8gQ2FsY3VsYXRlIHRoZSBwb2x5bm9taWFsIGNvZWZmaWNpZW50cywgaW1wbGljaXQgZmlyc3QgYW5kIGxhc3QgY29udHJvbCBwb2ludHMgYXJlICgwLDApIGFuZCAoMSwxKS5cbiAgICB0aGlzLmN4ID0gMy4wICogcDF4O1xuICAgIHRoaXMuYnggPSAzLjAgKiAocDJ4IC0gcDF4KSAtIHRoaXMuY3g7XG4gICAgdGhpcy5heCA9IDEuMCAtIHRoaXMuY3ggLSB0aGlzLmJ4O1xuXG4gICAgdGhpcy5jeSA9IDMuMCAqIHAxeTtcbiAgICB0aGlzLmJ5ID0gMy4wICogKHAyeSAtIHAxeSkgLSB0aGlzLmN5O1xuICAgIHRoaXMuYXkgPSAxLjAgLSB0aGlzLmN5IC0gdGhpcy5ieTtcblxuICAgIHRoaXMucDF4ID0gcDF4O1xuICAgIHRoaXMucDF5ID0gcDJ5O1xuICAgIHRoaXMucDJ4ID0gcDJ4O1xuICAgIHRoaXMucDJ5ID0gcDJ5O1xufVxuXG5Vbml0QmV6aWVyLnByb3RvdHlwZS5zYW1wbGVDdXJ2ZVggPSBmdW5jdGlvbih0KSB7XG4gICAgLy8gYGF4IHReMyArIGJ4IHReMiArIGN4IHQnIGV4cGFuZGVkIHVzaW5nIEhvcm5lcidzIHJ1bGUuXG4gICAgcmV0dXJuICgodGhpcy5heCAqIHQgKyB0aGlzLmJ4KSAqIHQgKyB0aGlzLmN4KSAqIHQ7XG59O1xuXG5Vbml0QmV6aWVyLnByb3RvdHlwZS5zYW1wbGVDdXJ2ZVkgPSBmdW5jdGlvbih0KSB7XG4gICAgcmV0dXJuICgodGhpcy5heSAqIHQgKyB0aGlzLmJ5KSAqIHQgKyB0aGlzLmN5KSAqIHQ7XG59O1xuXG5Vbml0QmV6aWVyLnByb3RvdHlwZS5zYW1wbGVDdXJ2ZURlcml2YXRpdmVYID0gZnVuY3Rpb24odCkge1xuICAgIHJldHVybiAoMy4wICogdGhpcy5heCAqIHQgKyAyLjAgKiB0aGlzLmJ4KSAqIHQgKyB0aGlzLmN4O1xufTtcblxuVW5pdEJlemllci5wcm90b3R5cGUuc29sdmVDdXJ2ZVggPSBmdW5jdGlvbih4LCBlcHNpbG9uKSB7XG4gICAgaWYgKHR5cGVvZiBlcHNpbG9uID09PSAndW5kZWZpbmVkJykgZXBzaWxvbiA9IDFlLTY7XG5cbiAgICB2YXIgdDAsIHQxLCB0MiwgeDIsIGk7XG5cbiAgICAvLyBGaXJzdCB0cnkgYSBmZXcgaXRlcmF0aW9ucyBvZiBOZXd0b24ncyBtZXRob2QgLS0gbm9ybWFsbHkgdmVyeSBmYXN0LlxuICAgIGZvciAodDIgPSB4LCBpID0gMDsgaSA8IDg7IGkrKykge1xuXG4gICAgICAgIHgyID0gdGhpcy5zYW1wbGVDdXJ2ZVgodDIpIC0geDtcbiAgICAgICAgaWYgKE1hdGguYWJzKHgyKSA8IGVwc2lsb24pIHJldHVybiB0MjtcblxuICAgICAgICB2YXIgZDIgPSB0aGlzLnNhbXBsZUN1cnZlRGVyaXZhdGl2ZVgodDIpO1xuICAgICAgICBpZiAoTWF0aC5hYnMoZDIpIDwgMWUtNikgYnJlYWs7XG5cbiAgICAgICAgdDIgPSB0MiAtIHgyIC8gZDI7XG4gICAgfVxuXG4gICAgLy8gRmFsbCBiYWNrIHRvIHRoZSBiaXNlY3Rpb24gbWV0aG9kIGZvciByZWxpYWJpbGl0eS5cbiAgICB0MCA9IDAuMDtcbiAgICB0MSA9IDEuMDtcbiAgICB0MiA9IHg7XG5cbiAgICBpZiAodDIgPCB0MCkgcmV0dXJuIHQwO1xuICAgIGlmICh0MiA+IHQxKSByZXR1cm4gdDE7XG5cbiAgICB3aGlsZSAodDAgPCB0MSkge1xuXG4gICAgICAgIHgyID0gdGhpcy5zYW1wbGVDdXJ2ZVgodDIpO1xuICAgICAgICBpZiAoTWF0aC5hYnMoeDIgLSB4KSA8IGVwc2lsb24pIHJldHVybiB0MjtcblxuICAgICAgICBpZiAoeCA+IHgyKSB7XG4gICAgICAgICAgICB0MCA9IHQyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdDEgPSB0MjtcbiAgICAgICAgfVxuXG4gICAgICAgIHQyID0gKHQxIC0gdDApICogMC41ICsgdDA7XG4gICAgfVxuXG4gICAgLy8gRmFpbHVyZS5cbiAgICByZXR1cm4gdDI7XG59O1xuXG5Vbml0QmV6aWVyLnByb3RvdHlwZS5zb2x2ZSA9IGZ1bmN0aW9uKHgsIGVwc2lsb24pIHtcbiAgICByZXR1cm4gdGhpcy5zYW1wbGVDdXJ2ZVkodGhpcy5zb2x2ZUN1cnZlWCh4LCBlcHNpbG9uKSk7XG59O1xuIiwiLy8gICAgICBcblxuLyoqXG4gKiBBIGNvb3JkaW5hdGUgaXMgYSBjb2x1bW4sIHJvdywgem9vbSBjb21iaW5hdGlvbiwgb2Z0ZW4gdXNlZFxuICogYXMgdGhlIGRhdGEgY29tcG9uZW50IG9mIGEgdGlsZS5cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gY29sdW1uXG4gKiBAcGFyYW0ge251bWJlcn0gcm93XG4gKiBAcGFyYW0ge251bWJlcn0gem9vbVxuICogQHByaXZhdGVcbiAqL1xuY2xhc3MgQ29vcmRpbmF0ZSB7XG4gICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIFxuICAgIGNvbnN0cnVjdG9yKGNvbHVtbiAgICAgICAgLCByb3cgICAgICAgICwgem9vbSAgICAgICAgKSB7XG4gICAgICAgIHRoaXMuY29sdW1uID0gY29sdW1uO1xuICAgICAgICB0aGlzLnJvdyA9IHJvdztcbiAgICAgICAgdGhpcy56b29tID0gem9vbTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBjbG9uZSBvZiB0aGlzIGNvb3JkaW5hdGUgdGhhdCBjYW4gYmUgbXV0YXRlZCB3aXRob3V0XG4gICAgICogY2hhbmdpbmcgdGhlIG9yaWdpbmFsIGNvb3JkaW5hdGVcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtDb29yZGluYXRlfSBjbG9uZVxuICAgICAqIEBwcml2YXRlXG4gICAgICogdmFyIGNvb3JkID0gbmV3IENvb3JkaW5hdGUoMCwgMCwgMCk7XG4gICAgICogdmFyIGMyID0gY29vcmQuY2xvbmUoKTtcbiAgICAgKiAvLyBzaW5jZSBjb29yZCBpcyBjbG9uZWQsIG1vZGlmeWluZyBhIHByb3BlcnR5IG9mIGMyIGRvZXNcbiAgICAgKiAvLyBub3QgbW9kaWZ5IGl0LlxuICAgICAqIGMyLnpvb20gPSAyO1xuICAgICAqL1xuICAgIGNsb25lKCkge1xuICAgICAgICByZXR1cm4gbmV3IENvb3JkaW5hdGUodGhpcy5jb2x1bW4sIHRoaXMucm93LCB0aGlzLnpvb20pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFpvb20gdGhpcyBjb29yZGluYXRlIHRvIGEgZ2l2ZW4gem9vbSBsZXZlbC4gVGhpcyByZXR1cm5zIGEgbmV3XG4gICAgICogY29vcmRpbmF0ZSBvYmplY3QsIG5vdCBtdXRhdGluZyB0aGUgb2xkIG9uZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB6b29tXG4gICAgICogQHJldHVybnMge0Nvb3JkaW5hdGV9IHpvb21lZCBjb29yZGluYXRlXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHZhciBjb29yZCA9IG5ldyBDb29yZGluYXRlKDAsIDAsIDApO1xuICAgICAqIHZhciBjMiA9IGNvb3JkLnpvb21UbygxKTtcbiAgICAgKiBjMiAvLyBlcXVhbHMgbmV3IENvb3JkaW5hdGUoMCwgMCwgMSk7XG4gICAgICovXG4gICAgem9vbVRvKHpvb20gICAgICAgICkgeyByZXR1cm4gdGhpcy5jbG9uZSgpLl96b29tVG8oem9vbSk7IH1cblxuICAgIC8qKlxuICAgICAqIFN1YnRyYWN0IHRoZSBjb2x1bW4gYW5kIHJvdyB2YWx1ZXMgb2YgdGhpcyBjb29yZGluYXRlIGZyb20gdGhvc2VcbiAgICAgKiBvZiBhbm90aGVyIGNvb3JkaW5hdGUuIFRoZSBvdGhlciBjb29yZGluYXQgd2lsbCBiZSB6b29tZWQgdG8gdGhlXG4gICAgICogc2FtZSBsZXZlbCBhcyBgdGhpc2AgYmVmb3JlIHRoZSBzdWJ0cmFjdGlvbiBvY2N1cnNcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7Q29vcmRpbmF0ZX0gYyBvdGhlciBjb29yZGluYXRlXG4gICAgICogQHJldHVybnMge0Nvb3JkaW5hdGV9IHJlc3VsdFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgc3ViKGMgICAgICAgICAgICApIHsgcmV0dXJuIHRoaXMuY2xvbmUoKS5fc3ViKGMpOyB9XG5cbiAgICBfem9vbVRvKHpvb20gICAgICAgICkge1xuICAgICAgICBjb25zdCBzY2FsZSA9IE1hdGgucG93KDIsIHpvb20gLSB0aGlzLnpvb20pO1xuICAgICAgICB0aGlzLmNvbHVtbiAqPSBzY2FsZTtcbiAgICAgICAgdGhpcy5yb3cgKj0gc2NhbGU7XG4gICAgICAgIHRoaXMuem9vbSA9IHpvb207XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIF9zdWIoYyAgICAgICAgICAgICkge1xuICAgICAgICBjID0gYy56b29tVG8odGhpcy56b29tKTtcbiAgICAgICAgdGhpcy5jb2x1bW4gLT0gYy5jb2x1bW47XG4gICAgICAgIHRoaXMucm93IC09IGMucm93O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29vcmRpbmF0ZTtcbiIsIi8vICAgICAgXG5cbmNvbnN0IHdyYXAgPSByZXF1aXJlKCcuLi91dGlsL3V0aWwnKS53cmFwO1xuXG4vKipcbiAqIEEgYExuZ0xhdGAgb2JqZWN0IHJlcHJlc2VudHMgYSBnaXZlbiBsb25naXR1ZGUgYW5kIGxhdGl0dWRlIGNvb3JkaW5hdGUsIG1lYXN1cmVkIGluIGRlZ3JlZXMuXG4gKlxuICogTWFwYm94IEdMIHVzZXMgbG9uZ2l0dWRlLCBsYXRpdHVkZSBjb29yZGluYXRlIG9yZGVyIChhcyBvcHBvc2VkIHRvIGxhdGl0dWRlLCBsb25naXR1ZGUpIHRvIG1hdGNoIEdlb0pTT04uXG4gKlxuICogTm90ZSB0aGF0IGFueSBNYXBib3ggR0wgbWV0aG9kIHRoYXQgYWNjZXB0cyBhIGBMbmdMYXRgIG9iamVjdCBhcyBhbiBhcmd1bWVudCBvciBvcHRpb25cbiAqIGNhbiBhbHNvIGFjY2VwdCBhbiBgQXJyYXlgIG9mIHR3byBudW1iZXJzIGFuZCB3aWxsIHBlcmZvcm0gYW4gaW1wbGljaXQgY29udmVyc2lvbi5cbiAqIFRoaXMgZmxleGlibGUgdHlwZSBpcyBkb2N1bWVudGVkIGFzIHtAbGluayBMbmdMYXRMaWtlfS5cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gbG5nIExvbmdpdHVkZSwgbWVhc3VyZWQgaW4gZGVncmVlcy5cbiAqIEBwYXJhbSB7bnVtYmVyfSBsYXQgTGF0aXR1ZGUsIG1lYXN1cmVkIGluIGRlZ3JlZXMuXG4gKiBAZXhhbXBsZVxuICogdmFyIGxsID0gbmV3IG1hcGJveGdsLkxuZ0xhdCgtNzMuOTc0OSwgNDAuNzczNik7XG4gKiBAc2VlIFtHZXQgY29vcmRpbmF0ZXMgb2YgdGhlIG1vdXNlIHBvaW50ZXJdKGh0dHBzOi8vd3d3Lm1hcGJveC5jb20vbWFwYm94LWdsLWpzL2V4YW1wbGUvbW91c2UtcG9zaXRpb24vKVxuICogQHNlZSBbRGlzcGxheSBhIHBvcHVwXShodHRwczovL3d3dy5tYXBib3guY29tL21hcGJveC1nbC1qcy9leGFtcGxlL3BvcHVwLylcbiAqIEBzZWUgW0hpZ2hsaWdodCBmZWF0dXJlcyB3aXRoaW4gYSBib3VuZGluZyBib3hdKGh0dHBzOi8vd3d3Lm1hcGJveC5jb20vbWFwYm94LWdsLWpzL2V4YW1wbGUvdXNpbmctYm94LXF1ZXJ5cmVuZGVyZWRmZWF0dXJlcy8pXG4gKiBAc2VlIFtDcmVhdGUgYSB0aW1lbGluZSBhbmltYXRpb25dKGh0dHBzOi8vd3d3Lm1hcGJveC5jb20vbWFwYm94LWdsLWpzL2V4YW1wbGUvdGltZWxpbmUtYW5pbWF0aW9uLylcbiAqL1xuY2xhc3MgTG5nTGF0IHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBcblxuICAgIGNvbnN0cnVjdG9yKGxuZyAgICAgICAgLCBsYXQgICAgICAgICkge1xuICAgICAgICBpZiAoaXNOYU4obG5nKSB8fCBpc05hTihsYXQpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgTG5nTGF0IG9iamVjdDogKCR7bG5nfSwgJHtsYXR9KWApO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubG5nID0gK2xuZztcbiAgICAgICAgdGhpcy5sYXQgPSArbGF0O1xuICAgICAgICBpZiAodGhpcy5sYXQgPiA5MCB8fCB0aGlzLmxhdCA8IC05MCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIExuZ0xhdCBsYXRpdHVkZSB2YWx1ZTogbXVzdCBiZSBiZXR3ZWVuIC05MCBhbmQgOTAnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBuZXcgYExuZ0xhdGAgb2JqZWN0IHdob3NlIGxvbmdpdHVkZSBpcyB3cmFwcGVkIHRvIHRoZSByYW5nZSAoLTE4MCwgMTgwKS5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtMbmdMYXR9IFRoZSB3cmFwcGVkIGBMbmdMYXRgIG9iamVjdC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHZhciBsbCA9IG5ldyBtYXBib3hnbC5MbmdMYXQoMjg2LjAyNTEsIDQwLjc3MzYpO1xuICAgICAqIHZhciB3cmFwcGVkID0gbGwud3JhcCgpO1xuICAgICAqIHdyYXBwZWQubG5nOyAvLyA9IC03My45NzQ5XG4gICAgICovXG4gICAgd3JhcCgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBMbmdMYXQod3JhcCh0aGlzLmxuZywgLTE4MCwgMTgwKSwgdGhpcy5sYXQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGNvb3JkaW5hdGVzIHJlcHJlc2VudGVkIGFzIGFuIGFycmF5IG9mIHR3byBudW1iZXJzLlxuICAgICAqXG4gICAgICogQHJldHVybnMge0FycmF5PG51bWJlcj59IFRoZSBjb29yZGluYXRlcyByZXByZXNldGVkIGFzIGFuIGFycmF5IG9mIGxvbmdpdHVkZSBhbmQgbGF0aXR1ZGUuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB2YXIgbGwgPSBuZXcgbWFwYm94Z2wuTG5nTGF0KC03My45NzQ5LCA0MC43NzM2KTtcbiAgICAgKiBsbC50b0FycmF5KCk7IC8vID0gWy03My45NzQ5LCA0MC43NzM2XVxuICAgICAqL1xuICAgIHRvQXJyYXkoKSB7XG4gICAgICAgIHJldHVybiBbdGhpcy5sbmcsIHRoaXMubGF0XTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBjb29yZGluYXRlcyByZXByZXNlbnQgYXMgYSBzdHJpbmcuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgY29vcmRpbmF0ZXMgcmVwcmVzZW50ZWQgYXMgYSBzdHJpbmcgb2YgdGhlIGZvcm1hdCBgJ0xuZ0xhdChsbmcsIGxhdCknYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHZhciBsbCA9IG5ldyBtYXBib3hnbC5MbmdMYXQoLTczLjk3NDksIDQwLjc3MzYpO1xuICAgICAqIGxsLnRvU3RyaW5nKCk7IC8vID0gXCJMbmdMYXQoLTczLjk3NDksIDQwLjc3MzYpXCJcbiAgICAgKi9cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIGBMbmdMYXQoJHt0aGlzLmxuZ30sICR7dGhpcy5sYXR9KWA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIGBMbmdMYXRCb3VuZHNgIGZyb20gdGhlIGNvb3JkaW5hdGVzIGV4dGVuZGVkIGJ5IGEgZ2l2ZW4gYHJhZGl1c2AuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gcmFkaXVzIERpc3RhbmNlIGluIG1ldGVycyBmcm9tIHRoZSBjb29yZGluYXRlcyB0byBleHRlbmQgdGhlIGJvdW5kcy5cbiAgICAgKiBAcmV0dXJucyB7TG5nTGF0Qm91bmRzfSBBIG5ldyBgTG5nTGF0Qm91bmRzYCBvYmplY3QgcmVwcmVzZW50aW5nIHRoZSBjb29yZGluYXRlcyBleHRlbmRlZCBieSB0aGUgYHJhZGl1c2AuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB2YXIgbGwgPSBuZXcgbWFwYm94Z2wuTG5nTGF0KC03My45NzQ5LCA0MC43NzM2KTtcbiAgICAgKiBsbC50b0JvdW5kcygxMDApLnRvQXJyYXkoKTsgLy8gPSBbWy03My45NzUwMTg2MjE0MTMyOCwgNDAuNzczNTEwMTY4NDcyMjldLCBbLTczLjk3NDc4MTM3ODU4NjczLCA0MC43NzM2ODk4MzE1Mjc3MV1dXG4gICAgICovXG4gICAgdG9Cb3VuZHMocmFkaXVzICAgICAgICApIHtcbiAgICAgICAgY29uc3QgZWFydGhDaXJjdW1mZXJlbmNlSW5NZXRlcnNBdEVxdWF0b3IgPSA0MDA3NTAxNztcbiAgICAgICAgY29uc3QgbGF0QWNjdXJhY3kgPSAzNjAgKiByYWRpdXMgLyBlYXJ0aENpcmN1bWZlcmVuY2VJbk1ldGVyc0F0RXF1YXRvcixcbiAgICAgICAgICAgIGxuZ0FjY3VyYWN5ID0gbGF0QWNjdXJhY3kgLyBNYXRoLmNvcygoTWF0aC5QSSAvIDE4MCkgKiB0aGlzLmxhdCk7XG5cbiAgICAgICAgY29uc3QgTG5nTGF0Qm91bmRzID0gcmVxdWlyZSgnLi9sbmdfbGF0X2JvdW5kcycpO1xuICAgICAgICByZXR1cm4gbmV3IExuZ0xhdEJvdW5kcyhuZXcgTG5nTGF0KHRoaXMubG5nIC0gbG5nQWNjdXJhY3ksIHRoaXMubGF0IC0gbGF0QWNjdXJhY3kpLFxuICAgICAgICAgICAgbmV3IExuZ0xhdCh0aGlzLmxuZyArIGxuZ0FjY3VyYWN5LCB0aGlzLmxhdCArIGxhdEFjY3VyYWN5KSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29udmVydHMgYW4gYXJyYXkgb2YgdHdvIG51bWJlcnMgdG8gYSBgTG5nTGF0YCBvYmplY3QuXG4gICAgICpcbiAgICAgKiBJZiBhIGBMbmdMYXRgIG9iamVjdCBpcyBwYXNzZWQgaW4sIHRoZSBmdW5jdGlvbiByZXR1cm5zIGl0IHVuY2hhbmdlZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7TG5nTGF0TGlrZX0gaW5wdXQgQW4gYXJyYXkgb2YgdHdvIG51bWJlcnMgdG8gY29udmVydCwgb3IgYSBgTG5nTGF0YCBvYmplY3QgdG8gcmV0dXJuLlxuICAgICAqIEByZXR1cm5zIHtMbmdMYXR9IEEgbmV3IGBMbmdMYXRgIG9iamVjdCwgaWYgYSBjb252ZXJzaW9uIG9jY3VycmVkLCBvciB0aGUgb3JpZ2luYWwgYExuZ0xhdGAgb2JqZWN0LlxuICAgICAqIEBleGFtcGxlXG4gICAgICogdmFyIGFyciA9IFstNzMuOTc0OSwgNDAuNzczNl07XG4gICAgICogdmFyIGxsID0gbWFwYm94Z2wuTG5nTGF0LmNvbnZlcnQoYXJyKTtcbiAgICAgKiBsbDsgICAvLyA9IExuZ0xhdCB7bG5nOiAtNzMuOTc0OSwgbGF0OiA0MC43NzM2fVxuICAgICAqL1xuICAgIHN0YXRpYyBjb252ZXJ0KGlucHV0ICAgICAgICAgICAgKSAgICAgICAgIHtcbiAgICAgICAgaWYgKGlucHV0IGluc3RhbmNlb2YgTG5nTGF0KSB7XG4gICAgICAgICAgICByZXR1cm4gaW5wdXQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoaW5wdXQpICYmIChpbnB1dC5sZW5ndGggPT09IDIgfHwgaW5wdXQubGVuZ3RoID09PSAzKSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBMbmdMYXQoTnVtYmVyKGlucHV0WzBdKSwgTnVtYmVyKGlucHV0WzFdKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGlucHV0KSAmJiB0eXBlb2YgaW5wdXQgPT09ICdvYmplY3QnICYmIGlucHV0ICE9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IExuZ0xhdChOdW1iZXIoaW5wdXQubG5nKSwgTnVtYmVyKGlucHV0LmxhdCkpO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImBMbmdMYXRMaWtlYCBhcmd1bWVudCBtdXN0IGJlIHNwZWNpZmllZCBhcyBhIExuZ0xhdCBpbnN0YW5jZSwgYW4gb2JqZWN0IHtsbmc6IDxsbmc+LCBsYXQ6IDxsYXQ+fSwgb3IgYW4gYXJyYXkgb2YgWzxsbmc+LCA8bGF0Pl1cIik7XG4gICAgfVxufVxuXG4vKipcbiAqIEEge0BsaW5rIExuZ0xhdH0gb2JqZWN0LCBhbiBhcnJheSBvZiB0d28gbnVtYmVycyByZXByZXNlbnRpbmcgbG9uZ2l0dWRlIGFuZCBsYXRpdHVkZSxcbiAqIG9yIGFuIG9iamVjdCB3aXRoIGBsbmdgIGFuZCBgbGF0YCBwcm9wZXJ0aWVzLlxuICpcbiAqIEB0eXBlZGVmIHtMbmdMYXQgfCB7bG5nOiBudW1iZXIsIGxhdDogbnVtYmVyfSB8IFtudW1iZXIsIG51bWJlcl19IExuZ0xhdExpa2VcbiAqIEBleGFtcGxlXG4gKiB2YXIgdjEgPSBuZXcgbWFwYm94Z2wuTG5nTGF0KC0xMjIuNDIwNjc5LCAzNy43NzI1MzcpO1xuICogdmFyIHYyID0gWy0xMjIuNDIwNjc5LCAzNy43NzI1MzddO1xuICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuXG5tb2R1bGUuZXhwb3J0cyA9IExuZ0xhdDtcbiIsIi8vICAgICAgXG5cbmNvbnN0IExuZ0xhdCA9IHJlcXVpcmUoJy4vbG5nX2xhdCcpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcblxuLyoqXG4gKiBBIGBMbmdMYXRCb3VuZHNgIG9iamVjdCByZXByZXNlbnRzIGEgZ2VvZ3JhcGhpY2FsIGJvdW5kaW5nIGJveCxcbiAqIGRlZmluZWQgYnkgaXRzIHNvdXRod2VzdCBhbmQgbm9ydGhlYXN0IHBvaW50cyBpbiBsb25naXR1ZGUgYW5kIGxhdGl0dWRlLlxuICpcbiAqIElmIG5vIGFyZ3VtZW50cyBhcmUgcHJvdmlkZWQgdG8gdGhlIGNvbnN0cnVjdG9yLCBhIGBudWxsYCBib3VuZGluZyBib3ggaXMgY3JlYXRlZC5cbiAqXG4gKiBOb3RlIHRoYXQgYW55IE1hcGJveCBHTCBtZXRob2QgdGhhdCBhY2NlcHRzIGEgYExuZ0xhdEJvdW5kc2Agb2JqZWN0IGFzIGFuIGFyZ3VtZW50IG9yIG9wdGlvblxuICogY2FuIGFsc28gYWNjZXB0IGFuIGBBcnJheWAgb2YgdHdvIHtAbGluayBMbmdMYXRMaWtlfSBjb25zdHJ1Y3RzIGFuZCB3aWxsIHBlcmZvcm0gYW4gaW1wbGljaXQgY29udmVyc2lvbi5cbiAqIFRoaXMgZmxleGlibGUgdHlwZSBpcyBkb2N1bWVudGVkIGFzIHtAbGluayBMbmdMYXRCb3VuZHNMaWtlfS5cbiAqXG4gKiBAcGFyYW0ge0xuZ0xhdExpa2V9IFtzd10gVGhlIHNvdXRod2VzdCBjb3JuZXIgb2YgdGhlIGJvdW5kaW5nIGJveC5cbiAqIEBwYXJhbSB7TG5nTGF0TGlrZX0gW25lXSBUaGUgbm9ydGhlYXN0IGNvcm5lciBvZiB0aGUgYm91bmRpbmcgYm94LlxuICogQGV4YW1wbGVcbiAqIHZhciBzdyA9IG5ldyBtYXBib3hnbC5MbmdMYXQoLTczLjk4NzYsIDQwLjc2NjEpO1xuICogdmFyIG5lID0gbmV3IG1hcGJveGdsLkxuZ0xhdCgtNzMuOTM5NywgNDAuODAwMik7XG4gKiB2YXIgbGxiID0gbmV3IG1hcGJveGdsLkxuZ0xhdEJvdW5kcyhzdywgbmUpO1xuICovXG5jbGFzcyBMbmdMYXRCb3VuZHMge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFxuXG4gICAgLy8gVGhpcyBjb25zdHJ1Y3RvciBpcyB0b28gZmxleGlibGUgdG8gdHlwZS4gSXQgc2hvdWxkIG5vdCBiZSBzbyBmbGV4aWJsZS5cbiAgICBjb25zdHJ1Y3RvcihzdyAgICAgLCBuZSAgICAgKSB7XG4gICAgICAgIGlmICghc3cpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIGlmIChuZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTb3V0aFdlc3Qoc3cpLnNldE5vcnRoRWFzdChuZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoc3cubGVuZ3RoID09PSA0KSB7XG4gICAgICAgICAgICB0aGlzLnNldFNvdXRoV2VzdChbc3dbMF0sIHN3WzFdXSkuc2V0Tm9ydGhFYXN0KFtzd1syXSwgc3dbM11dKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U291dGhXZXN0KHN3WzBdKS5zZXROb3J0aEVhc3Qoc3dbMV0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IHRoZSBub3J0aGVhc3QgY29ybmVyIG9mIHRoZSBib3VuZGluZyBib3hcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7TG5nTGF0TGlrZX0gbmVcbiAgICAgKiBAcmV0dXJucyB7TG5nTGF0Qm91bmRzfSBgdGhpc2BcbiAgICAgKi9cbiAgICBzZXROb3J0aEVhc3QobmUgICAgICAgICAgICApIHtcbiAgICAgICAgdGhpcy5fbmUgPSBuZSBpbnN0YW5jZW9mIExuZ0xhdCA/IG5ldyBMbmdMYXQobmUubG5nLCBuZS5sYXQpIDogTG5nTGF0LmNvbnZlcnQobmUpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIHNvdXRod2VzdCBjb3JuZXIgb2YgdGhlIGJvdW5kaW5nIGJveFxuICAgICAqXG4gICAgICogQHBhcmFtIHtMbmdMYXRMaWtlfSBzd1xuICAgICAqIEByZXR1cm5zIHtMbmdMYXRCb3VuZHN9IGB0aGlzYFxuICAgICAqL1xuICAgIHNldFNvdXRoV2VzdChzdyAgICAgICAgICAgICkge1xuICAgICAgICB0aGlzLl9zdyA9IHN3IGluc3RhbmNlb2YgTG5nTGF0ID8gbmV3IExuZ0xhdChzdy5sbmcsIHN3LmxhdCkgOiBMbmdMYXQuY29udmVydChzdyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEV4dGVuZCB0aGUgYm91bmRzIHRvIGluY2x1ZGUgYSBnaXZlbiBMbmdMYXQgb3IgTG5nTGF0Qm91bmRzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtMbmdMYXR8TG5nTGF0Qm91bmRzfSBvYmogb2JqZWN0IHRvIGV4dGVuZCB0b1xuICAgICAqIEByZXR1cm5zIHtMbmdMYXRCb3VuZHN9IGB0aGlzYFxuICAgICAqL1xuICAgIGV4dGVuZChvYmopIHtcbiAgICAgICAgY29uc3Qgc3cgPSB0aGlzLl9zdyxcbiAgICAgICAgICAgIG5lID0gdGhpcy5fbmU7XG4gICAgICAgIGxldCBzdzIsIG5lMjtcblxuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgTG5nTGF0KSB7XG4gICAgICAgICAgICBzdzIgPSBvYmo7XG4gICAgICAgICAgICBuZTIgPSBvYmo7XG5cbiAgICAgICAgfSBlbHNlIGlmIChvYmogaW5zdGFuY2VvZiBMbmdMYXRCb3VuZHMpIHtcbiAgICAgICAgICAgIHN3MiA9IG9iai5fc3c7XG4gICAgICAgICAgICBuZTIgPSBvYmouX25lO1xuXG4gICAgICAgICAgICBpZiAoIXN3MiB8fCAhbmUyKSByZXR1cm4gdGhpcztcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkob2JqKSkge1xuICAgICAgICAgICAgICAgIGlmIChvYmouZXZlcnkoQXJyYXkuaXNBcnJheSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXh0ZW5kKExuZ0xhdEJvdW5kcy5jb252ZXJ0KG9iaikpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmV4dGVuZChMbmdMYXQuY29udmVydChvYmopKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghc3cgJiYgIW5lKSB7XG4gICAgICAgICAgICB0aGlzLl9zdyA9IG5ldyBMbmdMYXQoc3cyLmxuZywgc3cyLmxhdCk7XG4gICAgICAgICAgICB0aGlzLl9uZSA9IG5ldyBMbmdMYXQobmUyLmxuZywgbmUyLmxhdCk7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN3LmxuZyA9IE1hdGgubWluKHN3Mi5sbmcsIHN3LmxuZyk7XG4gICAgICAgICAgICBzdy5sYXQgPSBNYXRoLm1pbihzdzIubGF0LCBzdy5sYXQpO1xuICAgICAgICAgICAgbmUubG5nID0gTWF0aC5tYXgobmUyLmxuZywgbmUubG5nKTtcbiAgICAgICAgICAgIG5lLmxhdCA9IE1hdGgubWF4KG5lMi5sYXQsIG5lLmxhdCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBnZW9ncmFwaGljYWwgY29vcmRpbmF0ZSBlcXVpZGlzdGFudCBmcm9tIHRoZSBib3VuZGluZyBib3gncyBjb3JuZXJzLlxuICAgICAqXG4gICAgICogQHJldHVybnMge0xuZ0xhdH0gVGhlIGJvdW5kaW5nIGJveCdzIGNlbnRlci5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHZhciBsbGIgPSBuZXcgbWFwYm94Z2wuTG5nTGF0Qm91bmRzKFstNzMuOTg3NiwgNDAuNzY2MV0sIFstNzMuOTM5NywgNDAuODAwMl0pO1xuICAgICAqIGxsYi5nZXRDZW50ZXIoKTsgLy8gPSBMbmdMYXQge2xuZzogLTczLjk2MzY1LCBsYXQ6IDQwLjc4MzE1fVxuICAgICAqL1xuICAgIGdldENlbnRlcigpICAgICAgICAge1xuICAgICAgICByZXR1cm4gbmV3IExuZ0xhdCgodGhpcy5fc3cubG5nICsgdGhpcy5fbmUubG5nKSAvIDIsICh0aGlzLl9zdy5sYXQgKyB0aGlzLl9uZS5sYXQpIC8gMik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgc291dGh3ZXN0IGNvcm5lciBvZiB0aGUgYm91bmRpbmcgYm94LlxuICAgICAqXG4gICAgICogQHJldHVybnMge0xuZ0xhdH0gVGhlIHNvdXRod2VzdCBjb3JuZXIgb2YgdGhlIGJvdW5kaW5nIGJveC5cbiAgICAgKi9cbiAgICBnZXRTb3V0aFdlc3QoKSAgICAgICAgIHsgcmV0dXJuIHRoaXMuX3N3OyB9XG5cbiAgICAvKipcbiAgICAqIFJldHVybnMgdGhlIG5vcnRoZWFzdCBjb3JuZXIgb2YgdGhlIGJvdW5kaW5nIGJveC5cbiAgICAqXG4gICAgKiBAcmV0dXJucyB7TG5nTGF0fSBUaGUgbm9ydGhlYXN0IGNvcm5lciBvZiB0aGUgYm91bmRpbmcgYm94LlxuICAgICAqL1xuICAgIGdldE5vcnRoRWFzdCgpICAgICAgICAgeyByZXR1cm4gdGhpcy5fbmU7IH1cblxuICAgIC8qKlxuICAgICogUmV0dXJucyB0aGUgbm9ydGh3ZXN0IGNvcm5lciBvZiB0aGUgYm91bmRpbmcgYm94LlxuICAgICpcbiAgICAqIEByZXR1cm5zIHtMbmdMYXR9IFRoZSBub3J0aHdlc3QgY29ybmVyIG9mIHRoZSBib3VuZGluZyBib3guXG4gICAgICovXG4gICAgZ2V0Tm9ydGhXZXN0KCkgICAgICAgICB7IHJldHVybiBuZXcgTG5nTGF0KHRoaXMuZ2V0V2VzdCgpLCB0aGlzLmdldE5vcnRoKCkpOyB9XG5cbiAgICAvKipcbiAgICAqIFJldHVybnMgdGhlIHNvdXRoZWFzdCBjb3JuZXIgb2YgdGhlIGJvdW5kaW5nIGJveC5cbiAgICAqXG4gICAgKiBAcmV0dXJucyB7TG5nTGF0fSBUaGUgc291dGhlYXN0IGNvcm5lciBvZiB0aGUgYm91bmRpbmcgYm94LlxuICAgICAqL1xuICAgIGdldFNvdXRoRWFzdCgpICAgICAgICAgeyByZXR1cm4gbmV3IExuZ0xhdCh0aGlzLmdldEVhc3QoKSwgdGhpcy5nZXRTb3V0aCgpKTsgfVxuXG4gICAgLyoqXG4gICAgKiBSZXR1cm5zIHRoZSB3ZXN0IGVkZ2Ugb2YgdGhlIGJvdW5kaW5nIGJveC5cbiAgICAqXG4gICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgd2VzdCBlZGdlIG9mIHRoZSBib3VuZGluZyBib3guXG4gICAgICovXG4gICAgZ2V0V2VzdCgpICAgICAgICAgeyByZXR1cm4gdGhpcy5fc3cubG5nOyB9XG5cbiAgICAvKipcbiAgICAqIFJldHVybnMgdGhlIHNvdXRoIGVkZ2Ugb2YgdGhlIGJvdW5kaW5nIGJveC5cbiAgICAqXG4gICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgc291dGggZWRnZSBvZiB0aGUgYm91bmRpbmcgYm94LlxuICAgICAqL1xuICAgIGdldFNvdXRoKCkgICAgICAgICB7IHJldHVybiB0aGlzLl9zdy5sYXQ7IH1cblxuICAgIC8qKlxuICAgICogUmV0dXJucyB0aGUgZWFzdCBlZGdlIG9mIHRoZSBib3VuZGluZyBib3guXG4gICAgKlxuICAgICogQHJldHVybnMge251bWJlcn0gVGhlIGVhc3QgZWRnZSBvZiB0aGUgYm91bmRpbmcgYm94LlxuICAgICAqL1xuICAgIGdldEVhc3QoKSAgICAgICAgIHsgcmV0dXJuIHRoaXMuX25lLmxuZzsgfVxuXG4gICAgLyoqXG4gICAgKiBSZXR1cm5zIHRoZSBub3J0aCBlZGdlIG9mIHRoZSBib3VuZGluZyBib3guXG4gICAgKlxuICAgICogQHJldHVybnMge251bWJlcn0gVGhlIG5vcnRoIGVkZ2Ugb2YgdGhlIGJvdW5kaW5nIGJveC5cbiAgICAgKi9cbiAgICBnZXROb3J0aCgpICAgICAgICAgeyByZXR1cm4gdGhpcy5fbmUubGF0OyB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBib3VuZGluZyBib3ggcmVwcmVzZW50ZWQgYXMgYW4gYXJyYXkuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7QXJyYXk8QXJyYXk8bnVtYmVyPj59IFRoZSBib3VuZGluZyBib3ggcmVwcmVzZW50ZWQgYXMgYW4gYXJyYXksIGNvbnNpc3Rpbmcgb2YgdGhlXG4gICAgICogICBzb3V0aHdlc3QgYW5kIG5vcnRoZWFzdCBjb29yZGluYXRlcyBvZiB0aGUgYm91bmRpbmcgcmVwcmVzZW50ZWQgYXMgYXJyYXlzIG9mIG51bWJlcnMuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB2YXIgbGxiID0gbmV3IG1hcGJveGdsLkxuZ0xhdEJvdW5kcyhbLTczLjk4NzYsIDQwLjc2NjFdLCBbLTczLjkzOTcsIDQwLjgwMDJdKTtcbiAgICAgKiBsbGIudG9BcnJheSgpOyAvLyA9IFtbLTczLjk4NzYsIDQwLjc2NjFdLCBbLTczLjkzOTcsIDQwLjgwMDJdXVxuICAgICAqL1xuICAgIHRvQXJyYXkoKSB7XG4gICAgICAgIHJldHVybiBbdGhpcy5fc3cudG9BcnJheSgpLCB0aGlzLl9uZS50b0FycmF5KCldO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybiB0aGUgYm91bmRpbmcgYm94IHJlcHJlc2VudGVkIGFzIGEgc3RyaW5nLlxuICAgICAqXG4gICAgICogQHJldHVybnMge3N0cmluZ30gVGhlIGJvdW5kaW5nIGJveCByZXByZXNlbnRzIGFzIGEgc3RyaW5nIG9mIHRoZSBmb3JtYXRcbiAgICAgKiAgIGAnTG5nTGF0Qm91bmRzKExuZ0xhdChsbmcsIGxhdCksIExuZ0xhdChsbmcsIGxhdCkpJ2AuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB2YXIgbGxiID0gbmV3IG1hcGJveGdsLkxuZ0xhdEJvdW5kcyhbLTczLjk4NzYsIDQwLjc2NjFdLCBbLTczLjkzOTcsIDQwLjgwMDJdKTtcbiAgICAgKiBsbGIudG9TdHJpbmcoKTsgLy8gPSBcIkxuZ0xhdEJvdW5kcyhMbmdMYXQoLTczLjk4NzYsIDQwLjc2NjEpLCBMbmdMYXQoLTczLjkzOTcsIDQwLjgwMDIpKVwiXG4gICAgICovXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBgTG5nTGF0Qm91bmRzKCR7dGhpcy5fc3cudG9TdHJpbmcoKX0sICR7dGhpcy5fbmUudG9TdHJpbmcoKX0pYDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0cyBhbiBhcnJheSB0byBhIGBMbmdMYXRCb3VuZHNgIG9iamVjdC5cbiAgICAgKlxuICAgICAqIElmIGEgYExuZ0xhdEJvdW5kc2Agb2JqZWN0IGlzIHBhc3NlZCBpbiwgdGhlIGZ1bmN0aW9uIHJldHVybnMgaXQgdW5jaGFuZ2VkLlxuICAgICAqXG4gICAgICogSW50ZXJuYWxseSwgdGhlIGZ1bmN0aW9uIGNhbGxzIGBMbmdMYXQjY29udmVydGAgdG8gY29udmVydCBhcnJheXMgdG8gYExuZ0xhdGAgdmFsdWVzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtMbmdMYXRCb3VuZHNMaWtlfSBpbnB1dCBBbiBhcnJheSBvZiB0d28gY29vcmRpbmF0ZXMgdG8gY29udmVydCwgb3IgYSBgTG5nTGF0Qm91bmRzYCBvYmplY3QgdG8gcmV0dXJuLlxuICAgICAqIEByZXR1cm5zIHtMbmdMYXRCb3VuZHN9IEEgbmV3IGBMbmdMYXRCb3VuZHNgIG9iamVjdCwgaWYgYSBjb252ZXJzaW9uIG9jY3VycmVkLCBvciB0aGUgb3JpZ2luYWwgYExuZ0xhdEJvdW5kc2Agb2JqZWN0LlxuICAgICAqIEBleGFtcGxlXG4gICAgICogdmFyIGFyciA9IFtbLTczLjk4NzYsIDQwLjc2NjFdLCBbLTczLjkzOTcsIDQwLjgwMDJdXTtcbiAgICAgKiB2YXIgbGxiID0gbWFwYm94Z2wuTG5nTGF0Qm91bmRzLmNvbnZlcnQoYXJyKTtcbiAgICAgKiBsbGI7ICAgLy8gPSBMbmdMYXRCb3VuZHMge19zdzogTG5nTGF0IHtsbmc6IC03My45ODc2LCBsYXQ6IDQwLjc2NjF9LCBfbmU6IExuZ0xhdCB7bG5nOiAtNzMuOTM5NywgbGF0OiA0MC44MDAyfX1cbiAgICAgKi9cbiAgICBzdGF0aWMgY29udmVydChpbnB1dCAgICAgICAgICAgICAgICAgICkgICAgICAgICAgICAgICB7XG4gICAgICAgIGlmICghaW5wdXQgfHwgaW5wdXQgaW5zdGFuY2VvZiBMbmdMYXRCb3VuZHMpIHJldHVybiBpbnB1dDtcbiAgICAgICAgcmV0dXJuIG5ldyBMbmdMYXRCb3VuZHMoaW5wdXQpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBBIHtAbGluayBMbmdMYXRCb3VuZHN9IG9iamVjdCwgYW4gYXJyYXkgb2Yge0BsaW5rIExuZ0xhdExpa2V9IG9iamVjdHMgaW4gW3N3LCBuZV0gb3JkZXIsXG4gKiBvciBhbiBhcnJheSBvZiBudW1iZXJzIGluIFt3ZXN0LCBzb3V0aCwgZWFzdCwgbm9ydGhdIG9yZGVyLlxuICpcbiAqIEB0eXBlZGVmIHtMbmdMYXRCb3VuZHMgfCBbTG5nTGF0TGlrZSwgTG5nTGF0TGlrZV0gfCBbbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyXX0gTG5nTGF0Qm91bmRzTGlrZVxuICogQGV4YW1wbGVcbiAqIHZhciB2MSA9IG5ldyBtYXBib3hnbC5MbmdMYXRCb3VuZHMoXG4gKiAgIG5ldyBtYXBib3hnbC5MbmdMYXQoLTczLjk4NzYsIDQwLjc2NjEpLFxuICogICBuZXcgbWFwYm94Z2wuTG5nTGF0KC03My45Mzk3LCA0MC44MDAyKVxuICogKTtcbiAqIHZhciB2MiA9IG5ldyBtYXBib3hnbC5MbmdMYXRCb3VuZHMoWy03My45ODc2LCA0MC43NjYxXSwgWy03My45Mzk3LCA0MC44MDAyXSlcbiAqIHZhciB2MyA9IFtbLTczLjk4NzYsIDQwLjc2NjFdLCBbLTczLjkzOTcsIDQwLjgwMDJdXTtcbiAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuXG5tb2R1bGUuZXhwb3J0cyA9IExuZ0xhdEJvdW5kcztcbiIsIi8vICAgICAgXG5cbmNvbnN0IHtIVE1MSW1hZ2VFbGVtZW50LCBIVE1MQ2FudmFzRWxlbWVudCwgSFRNTFZpZGVvRWxlbWVudCwgSW1hZ2VEYXRhfSA9IHJlcXVpcmUoJy4uL3V0aWwvd2luZG93Jyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuXG4gICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgXG4gXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgXG5cbmNsYXNzIFRleHR1cmUge1xuICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgIFxuXG4gICAgY29uc3RydWN0b3IoY29udGV4dCAgICAgICAgICwgaW1hZ2UgICAgICAgICAgICAgICwgZm9ybWF0ICAgICAgICAgICAgICAgLCBwcmVtdWx0aXBseSAgICAgICAgICApIHtcbiAgICAgICAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcblxuICAgICAgICBjb25zdCB7d2lkdGgsIGhlaWdodH0gPSBpbWFnZTtcbiAgICAgICAgdGhpcy5zaXplID0gW3dpZHRoLCBoZWlnaHRdO1xuICAgICAgICB0aGlzLmZvcm1hdCA9IGZvcm1hdDtcblxuICAgICAgICB0aGlzLnRleHR1cmUgPSBjb250ZXh0LmdsLmNyZWF0ZVRleHR1cmUoKTtcbiAgICAgICAgdGhpcy51cGRhdGUoaW1hZ2UsIHByZW11bHRpcGx5KTtcbiAgICB9XG5cbiAgICB1cGRhdGUoaW1hZ2UgICAgICAgICAgICAgICwgcHJlbXVsdGlwbHkgICAgICAgICAgKSB7XG4gICAgICAgIGNvbnN0IHt3aWR0aCwgaGVpZ2h0fSA9IGltYWdlO1xuICAgICAgICB0aGlzLnNpemUgPSBbd2lkdGgsIGhlaWdodF07XG5cbiAgICAgICAgY29uc3Qge2NvbnRleHR9ID0gdGhpcztcbiAgICAgICAgY29uc3Qge2dsfSA9IGNvbnRleHQ7XG4gICAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRoaXMudGV4dHVyZSk7XG4gICAgICAgIGNvbnRleHQucGl4ZWxTdG9yZVVucGFjay5zZXQoMSk7XG5cbiAgICAgICAgaWYgKHRoaXMuZm9ybWF0ID09PSBnbC5SR0JBICYmIHByZW11bHRpcGx5ICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgY29udGV4dC5waXhlbFN0b3JlVW5wYWNrUHJlbXVsdGlwbHlBbHBoYS5zZXQodHJ1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW1hZ2UgaW5zdGFuY2VvZiBIVE1MSW1hZ2VFbGVtZW50IHx8IGltYWdlIGluc3RhbmNlb2YgSFRNTENhbnZhc0VsZW1lbnQgfHwgaW1hZ2UgaW5zdGFuY2VvZiBIVE1MVmlkZW9FbGVtZW50IHx8IGltYWdlIGluc3RhbmNlb2YgSW1hZ2VEYXRhKSB7XG4gICAgICAgICAgICBnbC50ZXhJbWFnZTJEKGdsLlRFWFRVUkVfMkQsIDAsIHRoaXMuZm9ybWF0LCB0aGlzLmZvcm1hdCwgZ2wuVU5TSUdORURfQllURSwgaW1hZ2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZ2wudGV4SW1hZ2UyRChnbC5URVhUVVJFXzJELCAwLCB0aGlzLmZvcm1hdCwgd2lkdGgsIGhlaWdodCwgMCwgdGhpcy5mb3JtYXQsIGdsLlVOU0lHTkVEX0JZVEUsIGltYWdlLmRhdGEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYmluZChmaWx0ZXIgICAgICAgICAgICAgICAsIHdyYXAgICAgICAgICAgICAgLCBtaW5GaWx0ZXIgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgIGNvbnN0IHtjb250ZXh0fSA9IHRoaXM7XG4gICAgICAgIGNvbnN0IHtnbH0gPSBjb250ZXh0O1xuICAgICAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0aGlzLnRleHR1cmUpO1xuXG4gICAgICAgIGlmIChmaWx0ZXIgIT09IHRoaXMuZmlsdGVyKSB7XG4gICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgZmlsdGVyKTtcbiAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCBtaW5GaWx0ZXIgfHwgZmlsdGVyKTtcbiAgICAgICAgICAgIHRoaXMuZmlsdGVyID0gZmlsdGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHdyYXAgIT09IHRoaXMud3JhcCkge1xuICAgICAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfUywgd3JhcCk7XG4gICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9ULCB3cmFwKTtcbiAgICAgICAgICAgIHRoaXMud3JhcCA9IHdyYXA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgICBjb25zdCB7Z2x9ID0gdGhpcy5jb250ZXh0O1xuICAgICAgICBnbC5kZWxldGVUZXh0dXJlKHRoaXMudGV4dHVyZSk7XG4gICAgICAgIHRoaXMudGV4dHVyZSA9IChudWxsICAgICApO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUZXh0dXJlO1xuIiwiLy8gICAgICBcblxuY29uc3QgTG5nTGF0Qm91bmRzID0gcmVxdWlyZSgnLi4vZ2VvL2xuZ19sYXRfYm91bmRzJyk7XG5jb25zdCBjbGFtcCA9IHJlcXVpcmUoJy4uL3V0aWwvdXRpbCcpLmNsYW1wO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuXG5jbGFzcyBUaWxlQm91bmRzIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIFxuXG4gICAgY29uc3RydWN0b3IoYm91bmRzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICwgbWluem9vbSAgICAgICAgICwgbWF4em9vbSAgICAgICAgICkge1xuICAgICAgICB0aGlzLmJvdW5kcyA9IExuZ0xhdEJvdW5kcy5jb252ZXJ0KHRoaXMudmFsaWRhdGVCb3VuZHMoYm91bmRzKSk7XG4gICAgICAgIHRoaXMubWluem9vbSA9IG1pbnpvb20gfHwgMDtcbiAgICAgICAgdGhpcy5tYXh6b29tID0gbWF4em9vbSB8fCAyNDtcbiAgICB9XG5cbiAgICB2YWxpZGF0ZUJvdW5kcyhib3VuZHMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgIC8vIG1ha2Ugc3VyZSB0aGUgYm91bmRzIHByb3BlcnR5IGNvbnRhaW5zIHZhbGlkIGxvbmdpdHVkZSBhbmQgbGF0aXR1ZGVzXG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShib3VuZHMpIHx8IGJvdW5kcy5sZW5ndGggIT09IDQpIHJldHVybiBbLTE4MCwgLTkwLCAxODAsIDkwXTtcbiAgICAgICAgcmV0dXJuIFtNYXRoLm1heCgtMTgwLCBib3VuZHNbMF0pLCBNYXRoLm1heCgtOTAsIGJvdW5kc1sxXSksIE1hdGgubWluKDE4MCwgYm91bmRzWzJdKSwgTWF0aC5taW4oOTAsIGJvdW5kc1szXSldO1xuICAgIH1cblxuICAgIGNvbnRhaW5zKHRpbGVJRCAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgIGNvbnN0IGxldmVsID0ge1xuICAgICAgICAgICAgbWluWDogTWF0aC5mbG9vcih0aGlzLmxuZ1godGhpcy5ib3VuZHMuZ2V0V2VzdCgpLCB0aWxlSUQueikpLFxuICAgICAgICAgICAgbWluWTogTWF0aC5mbG9vcih0aGlzLmxhdFkodGhpcy5ib3VuZHMuZ2V0Tm9ydGgoKSwgdGlsZUlELnopKSxcbiAgICAgICAgICAgIG1heFg6IE1hdGguY2VpbCh0aGlzLmxuZ1godGhpcy5ib3VuZHMuZ2V0RWFzdCgpLCB0aWxlSUQueikpLFxuICAgICAgICAgICAgbWF4WTogTWF0aC5jZWlsKHRoaXMubGF0WSh0aGlzLmJvdW5kcy5nZXRTb3V0aCgpLCB0aWxlSUQueikpXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGhpdCA9IHRpbGVJRC54ID49IGxldmVsLm1pblggJiYgdGlsZUlELnggPCBsZXZlbC5tYXhYICYmIHRpbGVJRC55ID49IGxldmVsLm1pblkgJiYgdGlsZUlELnkgPCBsZXZlbC5tYXhZO1xuICAgICAgICByZXR1cm4gaGl0O1xuICAgIH1cblxuICAgIGxuZ1gobG5nICAgICAgICAsIHpvb20gICAgICAgICkge1xuICAgICAgICByZXR1cm4gKGxuZyArIDE4MCkgKiAoTWF0aC5wb3coMiwgem9vbSkgLyAzNjApO1xuICAgIH1cblxuICAgIGxhdFkobGF0ICAgICAgICAsIHpvb20gICAgICAgICkge1xuICAgICAgICBjb25zdCBmID0gY2xhbXAoTWF0aC5zaW4oTWF0aC5QSSAvIDE4MCAqIGxhdCksIC0wLjk5OTksIDAuOTk5OSk7XG4gICAgICAgIGNvbnN0IHNjYWxlID0gTWF0aC5wb3coMiwgem9vbSkgLyAoMiAqIE1hdGguUEkpO1xuICAgICAgICByZXR1cm4gTWF0aC5wb3coMiwgem9vbSAtIDEpICsgMC41ICogTWF0aC5sb2coKDEgKyBmKSAvICgxIC0gZikpICogLXNjYWxlO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUaWxlQm91bmRzO1xuIiwiLy8gICAgICBcblxuY29uc3Qgd2luZG93ID0gcmVxdWlyZSgnLi93aW5kb3cnKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcblxuLyoqXG4gKiBUaGUgdHlwZSBvZiBhIHJlc291cmNlLlxuICogQHByaXZhdGVcbiAqIEByZWFkb25seVxuICogQGVudW0ge3N0cmluZ31cbiAqL1xuY29uc3QgUmVzb3VyY2VUeXBlID0ge1xuICAgIFVua25vd246ICdVbmtub3duJyxcbiAgICBTdHlsZTogJ1N0eWxlJyxcbiAgICBTb3VyY2U6ICdTb3VyY2UnLFxuICAgIFRpbGU6ICdUaWxlJyxcbiAgICBHbHlwaHM6ICdHbHlwaHMnLFxuICAgIFNwcml0ZUltYWdlOiAnU3ByaXRlSW1hZ2UnLFxuICAgIFNwcml0ZUpTT046ICdTcHJpdGVKU09OJyxcbiAgICBJbWFnZTogJ0ltYWdlJ1xufTtcbmV4cG9ydHMuUmVzb3VyY2VUeXBlID0gUmVzb3VyY2VUeXBlO1xuXG5pZiAodHlwZW9mIE9iamVjdC5mcmVlemUgPT0gJ2Z1bmN0aW9uJykge1xuICAgIE9iamVjdC5mcmVlemUoUmVzb3VyY2VUeXBlKTtcbn1cblxuLyoqXG4gKiBBIGBSZXF1ZXN0UGFyYW1ldGVyc2Agb2JqZWN0IHRvIGJlIHJldHVybmVkIGZyb20gTWFwLm9wdGlvbnMudHJhbnNmb3JtUmVxdWVzdCBjYWxsYmFja3MuXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBSZXF1ZXN0UGFyYW1ldGVyc1xuICogQHByb3BlcnR5IHtzdHJpbmd9IHVybCBUaGUgVVJMIHRvIGJlIHJlcXVlc3RlZC5cbiAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBoZWFkZXJzIFRoZSBoZWFkZXJzIHRvIGJlIHNlbnQgd2l0aCB0aGUgcmVxdWVzdC5cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBjcmVkZW50aWFscyBgJ3NhbWUtb3JpZ2luJ3wnaW5jbHVkZSdgIFVzZSAnaW5jbHVkZScgdG8gc2VuZCBjb29raWVzIHdpdGggY3Jvc3Mtb3JpZ2luIHJlcXVlc3RzLlxuICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBcblxuY2xhc3MgQUpBWEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICAgICAgICAgICAgICAgICAgIFxuICAgIGNvbnN0cnVjdG9yKG1lc3NhZ2UgICAgICAgICwgc3RhdHVzICAgICAgICApIHtcbiAgICAgICAgc3VwZXIobWVzc2FnZSk7XG4gICAgICAgIHRoaXMuc3RhdHVzID0gc3RhdHVzO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gbWFrZVJlcXVlc3QocmVxdWVzdFBhcmFtZXRlcnMgICAgICAgICAgICAgICAgICAgKSAgICAgICAgICAgICAgICAge1xuICAgIGNvbnN0IHhociAgICAgICAgICAgICAgICAgPSBuZXcgd2luZG93LlhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICB4aHIub3BlbignR0VUJywgcmVxdWVzdFBhcmFtZXRlcnMudXJsLCB0cnVlKTtcbiAgICBmb3IgKGNvbnN0IGsgaW4gcmVxdWVzdFBhcmFtZXRlcnMuaGVhZGVycykge1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihrLCByZXF1ZXN0UGFyYW1ldGVycy5oZWFkZXJzW2tdKTtcbiAgICB9XG4gICAgeGhyLndpdGhDcmVkZW50aWFscyA9IHJlcXVlc3RQYXJhbWV0ZXJzLmNyZWRlbnRpYWxzID09PSAnaW5jbHVkZSc7XG4gICAgcmV0dXJuIHhocjtcbn1cblxuZXhwb3J0cy5nZXRKU09OID0gZnVuY3Rpb24ocmVxdWVzdFBhcmFtZXRlcnMgICAgICAgICAgICAgICAgICAgLCBjYWxsYmFjayAgICAgICAgICAgICAgICAgKSB7XG4gICAgY29uc3QgeGhyID0gbWFrZVJlcXVlc3QocmVxdWVzdFBhcmFtZXRlcnMpO1xuICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdBY2NlcHQnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgIHhoci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGNhbGxiYWNrKG5ldyBFcnJvcih4aHIuc3RhdHVzVGV4dCkpO1xuICAgIH07XG4gICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoeGhyLnN0YXR1cyA+PSAyMDAgJiYgeGhyLnN0YXR1cyA8IDMwMCAmJiB4aHIucmVzcG9uc2UpIHtcbiAgICAgICAgICAgIGxldCBkYXRhO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBkYXRhID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2UpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYWxsYmFjayhudWxsLCBkYXRhKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKG5ldyBBSkFYRXJyb3IoeGhyLnN0YXR1c1RleHQsIHhoci5zdGF0dXMpKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgeGhyLnNlbmQoKTtcbiAgICByZXR1cm4geGhyO1xufTtcblxuZXhwb3J0cy5nZXRBcnJheUJ1ZmZlciA9IGZ1bmN0aW9uKHJlcXVlc3RQYXJhbWV0ZXJzICAgICAgICAgICAgICAgICAgICwgY2FsbGJhY2sgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICBjb25zdCB4aHIgPSBtYWtlUmVxdWVzdChyZXF1ZXN0UGFyYW1ldGVycyk7XG4gICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcic7XG4gICAgeGhyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgY2FsbGJhY2sobmV3IEVycm9yKHhoci5zdGF0dXNUZXh0KSk7XG4gICAgfTtcbiAgICB4aHIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlICAgICAgICAgICAgICA9IHhoci5yZXNwb25zZTtcbiAgICAgICAgaWYgKHJlc3BvbnNlLmJ5dGVMZW5ndGggPT09IDAgJiYgeGhyLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobmV3IEVycm9yKCdodHRwIHN0YXR1cyAyMDAgcmV0dXJuZWQgd2l0aG91dCBjb250ZW50LicpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoeGhyLnN0YXR1cyA+PSAyMDAgJiYgeGhyLnN0YXR1cyA8IDMwMCAmJiB4aHIucmVzcG9uc2UpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHtcbiAgICAgICAgICAgICAgICBkYXRhOiByZXNwb25zZSxcbiAgICAgICAgICAgICAgICBjYWNoZUNvbnRyb2w6IHhoci5nZXRSZXNwb25zZUhlYWRlcignQ2FjaGUtQ29udHJvbCcpLFxuICAgICAgICAgICAgICAgIGV4cGlyZXM6IHhoci5nZXRSZXNwb25zZUhlYWRlcignRXhwaXJlcycpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKG5ldyBBSkFYRXJyb3IoeGhyLnN0YXR1c1RleHQsIHhoci5zdGF0dXMpKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgeGhyLnNlbmQoKTtcbiAgICByZXR1cm4geGhyO1xufTtcblxuZnVuY3Rpb24gc2FtZU9yaWdpbih1cmwpIHtcbiAgICBjb25zdCBhICAgICAgICAgICAgICAgICAgICA9IHdpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgYS5ocmVmID0gdXJsO1xuICAgIHJldHVybiBhLnByb3RvY29sID09PSB3aW5kb3cuZG9jdW1lbnQubG9jYXRpb24ucHJvdG9jb2wgJiYgYS5ob3N0ID09PSB3aW5kb3cuZG9jdW1lbnQubG9jYXRpb24uaG9zdDtcbn1cblxuY29uc3QgdHJhbnNwYXJlbnRQbmdVcmwgPSAnZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFBRUFBQUFCQ0FZQUFBQWZGY1NKQUFBQUMwbEVRVlFZVjJOZ0FBSUFBQVVBQWFyVnlGRUFBQUFBU1VWT1JLNUNZSUk9JztcblxuZXhwb3J0cy5nZXRJbWFnZSA9IGZ1bmN0aW9uKHJlcXVlc3RQYXJhbWV0ZXJzICAgICAgICAgICAgICAgICAgICwgY2FsbGJhY2sgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgLy8gcmVxdWVzdCB0aGUgaW1hZ2Ugd2l0aCBYSFIgdG8gd29yayBhcm91bmQgY2FjaGluZyBpc3N1ZXNcbiAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL21hcGJveC9tYXBib3gtZ2wtanMvaXNzdWVzLzE0NzBcbiAgICByZXR1cm4gZXhwb3J0cy5nZXRBcnJheUJ1ZmZlcihyZXF1ZXN0UGFyYW1ldGVycywgKGVyciwgaW1nRGF0YSkgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICB9IGVsc2UgaWYgKGltZ0RhdGEpIHtcbiAgICAgICAgICAgIGNvbnN0IGltZyAgICAgICAgICAgICAgICAgICA9IG5ldyB3aW5kb3cuSW1hZ2UoKTtcbiAgICAgICAgICAgIGNvbnN0IFVSTCA9IHdpbmRvdy5VUkwgfHwgd2luZG93LndlYmtpdFVSTDtcbiAgICAgICAgICAgIGltZy5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgaW1nKTtcbiAgICAgICAgICAgICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKGltZy5zcmMpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IGJsb2IgICAgICAgPSBuZXcgd2luZG93LkJsb2IoW25ldyBVaW50OEFycmF5KGltZ0RhdGEuZGF0YSldLCB7IHR5cGU6ICdpbWFnZS9wbmcnIH0pO1xuICAgICAgICAgICAgKGltZyAgICAgKS5jYWNoZUNvbnRyb2wgPSBpbWdEYXRhLmNhY2hlQ29udHJvbDtcbiAgICAgICAgICAgIChpbWcgICAgICkuZXhwaXJlcyA9IGltZ0RhdGEuZXhwaXJlcztcbiAgICAgICAgICAgIGltZy5zcmMgPSBpbWdEYXRhLmRhdGEuYnl0ZUxlbmd0aCA/IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYikgOiB0cmFuc3BhcmVudFBuZ1VybDtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuZXhwb3J0cy5nZXRWaWRlbyA9IGZ1bmN0aW9uKHVybHMgICAgICAgICAgICAgICAsIGNhbGxiYWNrICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgIGNvbnN0IHZpZGVvICAgICAgICAgICAgICAgICAgID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3ZpZGVvJyk7XG4gICAgdmlkZW8ub25sb2Fkc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgdmlkZW8pO1xuICAgIH07XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB1cmxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHMgICAgICAgICAgICAgICAgICAgID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NvdXJjZScpO1xuICAgICAgICBpZiAoIXNhbWVPcmlnaW4odXJsc1tpXSkpIHtcbiAgICAgICAgICAgIHZpZGVvLmNyb3NzT3JpZ2luID0gJ0Fub255bW91cyc7XG4gICAgICAgIH1cbiAgICAgICAgcy5zcmMgPSB1cmxzW2ldO1xuICAgICAgICB2aWRlby5hcHBlbmRDaGlsZChzKTtcbiAgICB9XG4gICAgcmV0dXJuIHZpZGVvO1xufTtcbiIsIi8vICAgICAgXG5cbmNvbnN0IHdpbmRvdyA9IHJlcXVpcmUoJy4vd2luZG93Jyk7XG5cbmNvbnN0IG5vdyA9IHdpbmRvdy5wZXJmb3JtYW5jZSAmJiB3aW5kb3cucGVyZm9ybWFuY2Uubm93ID9cbiAgICB3aW5kb3cucGVyZm9ybWFuY2Uubm93LmJpbmQod2luZG93LnBlcmZvcm1hbmNlKSA6XG4gICAgRGF0ZS5ub3cuYmluZChEYXRlKTtcblxuY29uc3QgZnJhbWUgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgIHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICB3aW5kb3cubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG5cbmNvbnN0IGNhbmNlbCA9IHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSB8fFxuICAgIHdpbmRvdy5tb3pDYW5jZWxBbmltYXRpb25GcmFtZSB8fFxuICAgIHdpbmRvdy53ZWJraXRDYW5jZWxBbmltYXRpb25GcmFtZSB8fFxuICAgIHdpbmRvdy5tc0NhbmNlbEFuaW1hdGlvbkZyYW1lO1xuXG4vKipcbiAqIEBwcml2YXRlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIC8qKlxuICAgICAqIFByb3ZpZGVzIGEgZnVuY3Rpb24gdGhhdCBvdXRwdXRzIG1pbGxpc2Vjb25kczogZWl0aGVyIHBlcmZvcm1hbmNlLm5vdygpXG4gICAgICogb3IgYSBmYWxsYmFjayB0byBEYXRlLm5vdygpXG4gICAgICovXG4gICAgbm93LFxuXG4gICAgZnJhbWUoZm4gICAgICAgICAgKSB7XG4gICAgICAgIHJldHVybiBmcmFtZShmbik7XG4gICAgfSxcblxuICAgIGNhbmNlbEZyYW1lKGlkICAgICAgICApIHtcbiAgICAgICAgcmV0dXJuIGNhbmNlbChpZCk7XG4gICAgfSxcblxuICAgIGdldEltYWdlRGF0YShpbWcgICAgICAgICAgICAgICAgICAgKSAgICAgICAgICAgIHtcbiAgICAgICAgY29uc3QgY2FudmFzID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICBjb25zdCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIGlmICghY29udGV4dCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdmYWlsZWQgdG8gY3JlYXRlIGNhbnZhcyAyZCBjb250ZXh0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgY2FudmFzLndpZHRoID0gaW1nLndpZHRoO1xuICAgICAgICBjYW52YXMuaGVpZ2h0ID0gaW1nLmhlaWdodDtcbiAgICAgICAgY29udGV4dC5kcmF3SW1hZ2UoaW1nLCAwLCAwLCBpbWcud2lkdGgsIGltZy5oZWlnaHQpO1xuICAgICAgICByZXR1cm4gY29udGV4dC5nZXRJbWFnZURhdGEoMCwgMCwgaW1nLndpZHRoLCBpbWcuaGVpZ2h0KTtcbiAgICB9LFxuXG4gICAgaGFyZHdhcmVDb25jdXJyZW5jeTogd2luZG93Lm5hdmlnYXRvci5oYXJkd2FyZUNvbmN1cnJlbmN5IHx8IDQsXG5cbiAgICBnZXQgZGV2aWNlUGl4ZWxSYXRpbygpIHsgcmV0dXJuIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvOyB9LFxuXG4gICAgc3VwcG9ydHNXZWJwOiBmYWxzZVxufTtcblxuY29uc3Qgd2VicEltZ1Rlc3QgPSB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG53ZWJwSW1nVGVzdC5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICBtb2R1bGUuZXhwb3J0cy5zdXBwb3J0c1dlYnAgPSB0cnVlO1xufTtcbndlYnBJbWdUZXN0LnNyYyA9ICdkYXRhOmltYWdlL3dlYnA7YmFzZTY0LFVrbEdSaDRBQUFCWFJVSlFWbEE0VEJFQUFBQXZBUUFBQUFmUS8vNzN2LytCaU9oL0FBQT0nO1xuIiwiLy8gICAgICBcblxuLyogZXNsaW50LWVudiBicm93c2VyICovXG5tb2R1bGUuZXhwb3J0cyA9IChzZWxmICAgICAgICApO1xuIiwiLy8gICAgICBcblxuY29uc3QgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcblxuZnVuY3Rpb24gX2FkZEV2ZW50TGlzdGVuZXIodHlwZSAgICAgICAgLCBsaXN0ZW5lciAgICAgICAgICAsIGxpc3RlbmVyTGlzdCAgICAgICAgICAgKSB7XG4gICAgbGlzdGVuZXJMaXN0W3R5cGVdID0gbGlzdGVuZXJMaXN0W3R5cGVdIHx8IFtdO1xuICAgIGxpc3RlbmVyTGlzdFt0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbn1cblxuZnVuY3Rpb24gX3JlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSAgICAgICAgLCBsaXN0ZW5lciAgICAgICAgICAsIGxpc3RlbmVyTGlzdCAgICAgICAgICAgKSB7XG4gICAgaWYgKGxpc3RlbmVyTGlzdCAmJiBsaXN0ZW5lckxpc3RbdHlwZV0pIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBsaXN0ZW5lckxpc3RbdHlwZV0uaW5kZXhPZihsaXN0ZW5lcik7XG4gICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgIGxpc3RlbmVyTGlzdFt0eXBlXS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIE1ldGhvZHMgbWl4ZWQgaW4gdG8gb3RoZXIgY2xhc3NlcyBmb3IgZXZlbnQgY2FwYWJpbGl0aWVzLlxuICpcbiAqIEBtaXhpbiBFdmVudGVkXG4gKi9cbmNsYXNzIEV2ZW50ZWQge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcblxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBsaXN0ZW5lciB0byBhIHNwZWNpZmllZCBldmVudCB0eXBlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgVGhlIGV2ZW50IHR5cGUgdG8gYWRkIGEgbGlzdGVuIGZvci5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lciBUaGUgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW4gdGhlIGV2ZW50IGlzIGZpcmVkLlxuICAgICAqICAgVGhlIGxpc3RlbmVyIGZ1bmN0aW9uIGlzIGNhbGxlZCB3aXRoIHRoZSBkYXRhIG9iamVjdCBwYXNzZWQgdG8gYGZpcmVgLFxuICAgICAqICAgZXh0ZW5kZWQgd2l0aCBgdGFyZ2V0YCBhbmQgYHR5cGVgIHByb3BlcnRpZXMuXG4gICAgICogQHJldHVybnMge09iamVjdH0gYHRoaXNgXG4gICAgICovXG4gICAgb24odHlwZSAgICwgbGlzdGVuZXIgICAgICAgICAgKSAgICAgICB7XG4gICAgICAgIHRoaXMuX2xpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycyB8fCB7fTtcbiAgICAgICAgX2FkZEV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIHRoaXMuX2xpc3RlbmVycyk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhIHByZXZpb3VzbHkgcmVnaXN0ZXJlZCBldmVudCBsaXN0ZW5lci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIFRoZSBldmVudCB0eXBlIHRvIHJlbW92ZSBsaXN0ZW5lcnMgZm9yLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyIFRoZSBsaXN0ZW5lciBmdW5jdGlvbiB0byByZW1vdmUuXG4gICAgICogQHJldHVybnMge09iamVjdH0gYHRoaXNgXG4gICAgICovXG4gICAgb2ZmKHR5cGUgICAsIGxpc3RlbmVyICAgICAgICAgICkge1xuICAgICAgICBfcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgdGhpcy5fbGlzdGVuZXJzKTtcbiAgICAgICAgX3JlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIHRoaXMuX29uZVRpbWVMaXN0ZW5lcnMpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBsaXN0ZW5lciB0aGF0IHdpbGwgYmUgY2FsbGVkIG9ubHkgb25jZSB0byBhIHNwZWNpZmllZCBldmVudCB0eXBlLlxuICAgICAqXG4gICAgICogVGhlIGxpc3RlbmVyIHdpbGwgYmUgY2FsbGVkIGZpcnN0IHRpbWUgdGhlIGV2ZW50IGZpcmVzIGFmdGVyIHRoZSBsaXN0ZW5lciBpcyByZWdpc3RlcmVkLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgVGhlIGV2ZW50IHR5cGUgdG8gbGlzdGVuIGZvci5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lciBUaGUgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW4gdGhlIGV2ZW50IGlzIGZpcmVkIHRoZSBmaXJzdCB0aW1lLlxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IGB0aGlzYFxuICAgICAqL1xuICAgIG9uY2UodHlwZSAgICAgICAgLCBsaXN0ZW5lciAgICAgICAgICApIHtcbiAgICAgICAgdGhpcy5fb25lVGltZUxpc3RlbmVycyA9IHRoaXMuX29uZVRpbWVMaXN0ZW5lcnMgfHwge307XG4gICAgICAgIF9hZGRFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCB0aGlzLl9vbmVUaW1lTGlzdGVuZXJzKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGaXJlcyBhbiBldmVudCBvZiB0aGUgc3BlY2lmaWVkIHR5cGUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBUaGUgdHlwZSBvZiBldmVudCB0byBmaXJlLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbZGF0YV0gRGF0YSB0byBiZSBwYXNzZWQgdG8gYW55IGxpc3RlbmVycy5cbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBgdGhpc2BcbiAgICAgKi9cbiAgICBmaXJlKHR5cGUgICAgICAgICwgZGF0YSAgICAgICAgICkge1xuICAgICAgICBpZiAodGhpcy5saXN0ZW5zKHR5cGUpKSB7XG4gICAgICAgICAgICBkYXRhID0gdXRpbC5leHRlbmQoe30sIGRhdGEsIHt0eXBlOiB0eXBlLCB0YXJnZXQ6IHRoaXN9KTtcblxuICAgICAgICAgICAgLy8gbWFrZSBzdXJlIGFkZGluZyBvciByZW1vdmluZyBsaXN0ZW5lcnMgaW5zaWRlIG90aGVyIGxpc3RlbmVycyB3b24ndCBjYXVzZSBhbiBpbmZpbml0ZSBsb29wXG4gICAgICAgICAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnMgJiYgdGhpcy5fbGlzdGVuZXJzW3R5cGVdID8gdGhpcy5fbGlzdGVuZXJzW3R5cGVdLnNsaWNlKCkgOiBbXTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgbGlzdGVuZXIgb2YgbGlzdGVuZXJzKSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXIuY2FsbCh0aGlzLCBkYXRhKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3Qgb25lVGltZUxpc3RlbmVycyA9IHRoaXMuX29uZVRpbWVMaXN0ZW5lcnMgJiYgdGhpcy5fb25lVGltZUxpc3RlbmVyc1t0eXBlXSA/IHRoaXMuX29uZVRpbWVMaXN0ZW5lcnNbdHlwZV0uc2xpY2UoKSA6IFtdO1xuICAgICAgICAgICAgZm9yIChjb25zdCBsaXN0ZW5lciBvZiBvbmVUaW1lTGlzdGVuZXJzKSB7XG4gICAgICAgICAgICAgICAgX3JlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIHRoaXMuX29uZVRpbWVMaXN0ZW5lcnMpO1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyLmNhbGwodGhpcywgZGF0YSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLl9ldmVudGVkUGFyZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRlZFBhcmVudC5maXJlKHR5cGUsIHV0aWwuZXh0ZW5kKHt9LCBkYXRhLCB0eXBlb2YgdGhpcy5fZXZlbnRlZFBhcmVudERhdGEgPT09ICdmdW5jdGlvbicgPyB0aGlzLl9ldmVudGVkUGFyZW50RGF0YSgpIDogdGhpcy5fZXZlbnRlZFBhcmVudERhdGEpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAvLyBUbyBlbnN1cmUgdGhhdCBubyBlcnJvciBldmVudHMgYXJlIGRyb3BwZWQsIHByaW50IHRoZW0gdG8gdGhlXG4gICAgICAgIC8vIGNvbnNvbGUgaWYgdGhleSBoYXZlIG5vIGxpc3RlbmVycy5cbiAgICAgICAgfSBlbHNlIGlmICh1dGlsLmVuZHNXaXRoKHR5cGUsICdlcnJvcicpKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKChkYXRhICYmIGRhdGEuZXJyb3IpIHx8IGRhdGEgfHwgJ0VtcHR5IGVycm9yIGV2ZW50Jyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgdHJ1ZSBpZiB0aGlzIGluc3RhbmNlIG9mIEV2ZW50ZWQgb3IgYW55IGZvcndhcmRlZWQgaW5zdGFuY2VzIG9mIEV2ZW50ZWQgaGF2ZSBhIGxpc3RlbmVyIGZvciB0aGUgc3BlY2lmaWVkIHR5cGUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBUaGUgZXZlbnQgdHlwZVxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBgdHJ1ZWAgaWYgdGhlcmUgaXMgYXQgbGVhc3Qgb25lIHJlZ2lzdGVyZWQgbGlzdGVuZXIgZm9yIHNwZWNpZmllZCBldmVudCB0eXBlLCBgZmFsc2VgIG90aGVyd2lzZVxuICAgICAqL1xuICAgIGxpc3RlbnModHlwZSAgICAgICAgKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAodGhpcy5fbGlzdGVuZXJzICYmIHRoaXMuX2xpc3RlbmVyc1t0eXBlXSAmJiB0aGlzLl9saXN0ZW5lcnNbdHlwZV0ubGVuZ3RoID4gMCkgfHxcbiAgICAgICAgICAgICh0aGlzLl9vbmVUaW1lTGlzdGVuZXJzICYmIHRoaXMuX29uZVRpbWVMaXN0ZW5lcnNbdHlwZV0gJiYgdGhpcy5fb25lVGltZUxpc3RlbmVyc1t0eXBlXS5sZW5ndGggPiAwKSB8fFxuICAgICAgICAgICAgKHRoaXMuX2V2ZW50ZWRQYXJlbnQgJiYgdGhpcy5fZXZlbnRlZFBhcmVudC5saXN0ZW5zKHR5cGUpKVxuICAgICAgICApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEJ1YmJsZSBhbGwgZXZlbnRzIGZpcmVkIGJ5IHRoaXMgaW5zdGFuY2Ugb2YgRXZlbnRlZCB0byB0aGlzIHBhcmVudCBpbnN0YW5jZSBvZiBFdmVudGVkLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBgdGhpc2BcbiAgICAgKi9cbiAgICBzZXRFdmVudGVkUGFyZW50KHBhcmVudCAgICAgICAgICAsIGRhdGEgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgdGhpcy5fZXZlbnRlZFBhcmVudCA9IHBhcmVudDtcbiAgICAgICAgdGhpcy5fZXZlbnRlZFBhcmVudERhdGEgPSBkYXRhO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFdmVudGVkO1xuIiwiLy8gICAgICBcblxuY29uc3QgVW5pdEJlemllciA9IHJlcXVpcmUoJ0BtYXBib3gvdW5pdGJlemllcicpO1xuY29uc3QgQ29vcmRpbmF0ZSA9IHJlcXVpcmUoJy4uL2dlby9jb29yZGluYXRlJyk7XG5jb25zdCBQb2ludCA9IHJlcXVpcmUoJ0BtYXBib3gvcG9pbnQtZ2VvbWV0cnknKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5cbi8qKlxuICogQG1vZHVsZSB1dGlsXG4gKiBAcHJpdmF0ZVxuICovXG5cbi8qKlxuICogR2l2ZW4gYSB2YWx1ZSBgdGAgdGhhdCB2YXJpZXMgYmV0d2VlbiAwIGFuZCAxLCByZXR1cm5cbiAqIGFuIGludGVycG9sYXRpb24gZnVuY3Rpb24gdGhhdCBlYXNlcyBiZXR3ZWVuIDAgYW5kIDEgaW4gYSBwbGVhc2luZ1xuICogY3ViaWMgaW4tb3V0IGZhc2hpb24uXG4gKlxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0cy5lYXNlQ3ViaWNJbk91dCA9IGZ1bmN0aW9uKHQgICAgICAgICkgICAgICAgICB7XG4gICAgaWYgKHQgPD0gMCkgcmV0dXJuIDA7XG4gICAgaWYgKHQgPj0gMSkgcmV0dXJuIDE7XG4gICAgY29uc3QgdDIgPSB0ICogdCxcbiAgICAgICAgdDMgPSB0MiAqIHQ7XG4gICAgcmV0dXJuIDQgKiAodCA8IDAuNSA/IHQzIDogMyAqICh0IC0gdDIpICsgdDMgLSAwLjc1KTtcbn07XG5cbi8qKlxuICogR2l2ZW4gZ2l2ZW4gKHgsIHkpLCAoeDEsIHkxKSBjb250cm9sIHBvaW50cyBmb3IgYSBiZXppZXIgY3VydmUsXG4gKiByZXR1cm4gYSBmdW5jdGlvbiB0aGF0IGludGVycG9sYXRlcyBhbG9uZyB0aGF0IGN1cnZlLlxuICpcbiAqIEBwYXJhbSBwMXggY29udHJvbCBwb2ludCAxIHggY29vcmRpbmF0ZVxuICogQHBhcmFtIHAxeSBjb250cm9sIHBvaW50IDEgeSBjb29yZGluYXRlXG4gKiBAcGFyYW0gcDJ4IGNvbnRyb2wgcG9pbnQgMiB4IGNvb3JkaW5hdGVcbiAqIEBwYXJhbSBwMnkgY29udHJvbCBwb2ludCAyIHkgY29vcmRpbmF0ZVxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0cy5iZXppZXIgPSBmdW5jdGlvbihwMXggICAgICAgICwgcDF5ICAgICAgICAsIHAyeCAgICAgICAgLCBwMnkgICAgICAgICkgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgY29uc3QgYmV6aWVyID0gbmV3IFVuaXRCZXppZXIocDF4LCBwMXksIHAyeCwgcDJ5KTtcbiAgICByZXR1cm4gZnVuY3Rpb24odCAgICAgICAgKSB7XG4gICAgICAgIHJldHVybiBiZXppZXIuc29sdmUodCk7XG4gICAgfTtcbn07XG5cbi8qKlxuICogQSBkZWZhdWx0IGJlemllci1jdXJ2ZSBwb3dlcmVkIGVhc2luZyBmdW5jdGlvbiB3aXRoXG4gKiBjb250cm9sIHBvaW50cyAoMC4yNSwgMC4xKSBhbmQgKDAuMjUsIDEpXG4gKlxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0cy5lYXNlID0gZXhwb3J0cy5iZXppZXIoMC4yNSwgMC4xLCAwLjI1LCAxKTtcblxuLyoqXG4gKiBjb25zdHJhaW4gbiB0byB0aGUgZ2l2ZW4gcmFuZ2UgdmlhIG1pbiArIG1heFxuICpcbiAqIEBwYXJhbSBuIHZhbHVlXG4gKiBAcGFyYW0gbWluIHRoZSBtaW5pbXVtIHZhbHVlIHRvIGJlIHJldHVybmVkXG4gKiBAcGFyYW0gbWF4IHRoZSBtYXhpbXVtIHZhbHVlIHRvIGJlIHJldHVybmVkXG4gKiBAcmV0dXJucyB0aGUgY2xhbXBlZCB2YWx1ZVxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0cy5jbGFtcCA9IGZ1bmN0aW9uIChuICAgICAgICAsIG1pbiAgICAgICAgLCBtYXggICAgICAgICkgICAgICAgICB7XG4gICAgcmV0dXJuIE1hdGgubWluKG1heCwgTWF0aC5tYXgobWluLCBuKSk7XG59O1xuXG4vKipcbiAqIGNvbnN0cmFpbiBuIHRvIHRoZSBnaXZlbiByYW5nZSwgZXhjbHVkaW5nIHRoZSBtaW5pbXVtLCB2aWEgbW9kdWxhciBhcml0aG1ldGljXG4gKlxuICogQHBhcmFtIG4gdmFsdWVcbiAqIEBwYXJhbSBtaW4gdGhlIG1pbmltdW0gdmFsdWUgdG8gYmUgcmV0dXJuZWQsIGV4Y2x1c2l2ZVxuICogQHBhcmFtIG1heCB0aGUgbWF4aW11bSB2YWx1ZSB0byBiZSByZXR1cm5lZCwgaW5jbHVzaXZlXG4gKiBAcmV0dXJucyBjb25zdHJhaW5lZCBudW1iZXJcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydHMud3JhcCA9IGZ1bmN0aW9uIChuICAgICAgICAsIG1pbiAgICAgICAgLCBtYXggICAgICAgICkgICAgICAgICB7XG4gICAgY29uc3QgZCA9IG1heCAtIG1pbjtcbiAgICBjb25zdCB3ID0gKChuIC0gbWluKSAlIGQgKyBkKSAlIGQgKyBtaW47XG4gICAgcmV0dXJuICh3ID09PSBtaW4pID8gbWF4IDogdztcbn07XG5cbi8qXG4gKiBDYWxsIGFuIGFzeW5jaHJvbm91cyBmdW5jdGlvbiBvbiBhbiBhcnJheSBvZiBhcmd1bWVudHMsXG4gKiBjYWxsaW5nIGBjYWxsYmFja2Agd2l0aCB0aGUgY29tcGxldGVkIHJlc3VsdHMgb2YgYWxsIGNhbGxzLlxuICpcbiAqIEBwYXJhbSBhcnJheSBpbnB1dCB0byBlYWNoIGNhbGwgb2YgdGhlIGFzeW5jIGZ1bmN0aW9uLlxuICogQHBhcmFtIGZuIGFuIGFzeW5jIGZ1bmN0aW9uIHdpdGggc2lnbmF0dXJlIChkYXRhLCBjYWxsYmFjaylcbiAqIEBwYXJhbSBjYWxsYmFjayBhIGNhbGxiYWNrIHJ1biBhZnRlciBhbGwgYXN5bmMgd29yayBpcyBkb25lLlxuICogY2FsbGVkIHdpdGggYW4gYXJyYXksIGNvbnRhaW5pbmcgdGhlIHJlc3VsdHMgb2YgZWFjaCBhc3luYyBjYWxsLlxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0cy5hc3luY0FsbCA9IGZ1bmN0aW9uICAgICAgICAgICAgICAgKFxuICAgIGFycmF5ICAgICAgICAgICAgICxcbiAgICBmbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAsXG4gICAgY2FsbGJhY2sgICAgICAgICAgICAgICAgICAgICAgICAgXG4pIHtcbiAgICBpZiAoIWFycmF5Lmxlbmd0aCkgeyByZXR1cm4gY2FsbGJhY2sobnVsbCwgW10pOyB9XG4gICAgbGV0IHJlbWFpbmluZyA9IGFycmF5Lmxlbmd0aDtcbiAgICBjb25zdCByZXN1bHRzID0gbmV3IEFycmF5KGFycmF5Lmxlbmd0aCk7XG4gICAgbGV0IGVycm9yID0gbnVsbDtcbiAgICBhcnJheS5mb3JFYWNoKChpdGVtLCBpKSA9PiB7XG4gICAgICAgIGZuKGl0ZW0sIChlcnIsIHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgaWYgKGVycikgZXJyb3IgPSBlcnI7XG4gICAgICAgICAgICByZXN1bHRzW2ldID0gKChyZXN1bHQgICAgICkgICAgICAgICk7IC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9mbG93L2lzc3Vlcy8yMTIzXG4gICAgICAgICAgICBpZiAoLS1yZW1haW5pbmcgPT09IDApIGNhbGxiYWNrKGVycm9yLCByZXN1bHRzKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG4vKlxuICogUG9seWZpbGwgZm9yIE9iamVjdC52YWx1ZXMuIE5vdCBmdWxseSBzcGVjIGNvbXBsaWFudCwgYnV0IHdlIGRvbid0XG4gKiBuZWVkIGl0IHRvIGJlLlxuICpcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydHMudmFsdWVzID0gZnVuY3Rpb24gICAob2JqICAgICAgICAgICAgICAgICAgICApICAgICAgICAgICB7XG4gICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgZm9yIChjb25zdCBrIGluIG9iaikge1xuICAgICAgICByZXN1bHQucHVzaChvYmpba10pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuLypcbiAqIENvbXB1dGUgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGUga2V5cyBpbiBvbmUgb2JqZWN0IGFuZCB0aGUga2V5c1xuICogaW4gYW5vdGhlciBvYmplY3QuXG4gKlxuICogQHJldHVybnMga2V5cyBkaWZmZXJlbmNlXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnRzLmtleXNEaWZmZXJlbmNlID0gZnVuY3Rpb24gICAgICAob2JqICAgICAgICAgICAgICAgICAgICAsIG90aGVyICAgICAgICAgICAgICAgICAgICApICAgICAgICAgICAgICAgIHtcbiAgICBjb25zdCBkaWZmZXJlbmNlID0gW107XG4gICAgZm9yIChjb25zdCBpIGluIG9iaikge1xuICAgICAgICBpZiAoIShpIGluIG90aGVyKSkge1xuICAgICAgICAgICAgZGlmZmVyZW5jZS5wdXNoKGkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkaWZmZXJlbmNlO1xufTtcblxuLyoqXG4gKiBHaXZlbiBhIGRlc3RpbmF0aW9uIG9iamVjdCBhbmQgb3B0aW9uYWxseSBtYW55IHNvdXJjZSBvYmplY3RzLFxuICogY29weSBhbGwgcHJvcGVydGllcyBmcm9tIHRoZSBzb3VyY2Ugb2JqZWN0cyBpbnRvIHRoZSBkZXN0aW5hdGlvbi5cbiAqIFRoZSBsYXN0IHNvdXJjZSBvYmplY3QgZ2l2ZW4gb3ZlcnJpZGVzIHByb3BlcnRpZXMgZnJvbSBwcmV2aW91c1xuICogc291cmNlIG9iamVjdHMuXG4gKlxuICogQHBhcmFtIGRlc3QgZGVzdGluYXRpb24gb2JqZWN0XG4gKiBAcGFyYW0gc291cmNlcyBzb3VyY2VzIGZyb20gd2hpY2ggcHJvcGVydGllcyBhcmUgcHVsbGVkXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnRzLmV4dGVuZCA9IGZ1bmN0aW9uIChkZXN0ICAgICAgICAsIC4uLnNvdXJjZXMgICAgICAgICAgICAgICAgKSAgICAgICAgIHtcbiAgICBmb3IgKGNvbnN0IHNyYyBvZiBzb3VyY2VzKSB7XG4gICAgICAgIGZvciAoY29uc3QgayBpbiBzcmMpIHtcbiAgICAgICAgICAgIGRlc3Rba10gPSBzcmNba107XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRlc3Q7XG59O1xuXG4vKipcbiAqIEdpdmVuIGFuIG9iamVjdCBhbmQgYSBudW1iZXIgb2YgcHJvcGVydGllcyBhcyBzdHJpbmdzLCByZXR1cm4gdmVyc2lvblxuICogb2YgdGhhdCBvYmplY3Qgd2l0aCBvbmx5IHRob3NlIHByb3BlcnRpZXMuXG4gKlxuICogQHBhcmFtIHNyYyB0aGUgb2JqZWN0XG4gKiBAcGFyYW0gcHJvcGVydGllcyBhbiBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcyBjaG9zZW5cbiAqIHRvIGFwcGVhciBvbiB0aGUgcmVzdWx0aW5nIG9iamVjdC5cbiAqIEByZXR1cm5zIG9iamVjdCB3aXRoIGxpbWl0ZWQgcHJvcGVydGllcy5cbiAqIEBleGFtcGxlXG4gKiB2YXIgZm9vID0geyBuYW1lOiAnQ2hhcmxpZScsIGFnZTogMTAgfTtcbiAqIHZhciBqdXN0TmFtZSA9IHBpY2soZm9vLCBbJ25hbWUnXSk7XG4gKiAvLyBqdXN0TmFtZSA9IHsgbmFtZTogJ0NoYXJsaWUnIH1cbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydHMucGljayA9IGZ1bmN0aW9uIChzcmMgICAgICAgICwgcHJvcGVydGllcyAgICAgICAgICAgICAgICkgICAgICAgICB7XG4gICAgY29uc3QgcmVzdWx0ID0ge307XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcm9wZXJ0aWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGsgPSBwcm9wZXJ0aWVzW2ldO1xuICAgICAgICBpZiAoayBpbiBzcmMpIHtcbiAgICAgICAgICAgIHJlc3VsdFtrXSA9IHNyY1trXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxubGV0IGlkID0gMTtcblxuLyoqXG4gKiBSZXR1cm4gYSB1bmlxdWUgbnVtZXJpYyBpZCwgc3RhcnRpbmcgYXQgMSBhbmQgaW5jcmVtZW50aW5nIHdpdGhcbiAqIGVhY2ggY2FsbC5cbiAqXG4gKiBAcmV0dXJucyB1bmlxdWUgbnVtZXJpYyBpZC5cbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydHMudW5pcXVlSWQgPSBmdW5jdGlvbiAoKSAgICAgICAgIHtcbiAgICByZXR1cm4gaWQrKztcbn07XG5cbi8qKlxuICogR2l2ZW4gYW4gYXJyYXkgb2YgbWVtYmVyIGZ1bmN0aW9uIG5hbWVzIGFzIHN0cmluZ3MsIHJlcGxhY2UgYWxsIG9mIHRoZW1cbiAqIHdpdGggYm91bmQgdmVyc2lvbnMgdGhhdCB3aWxsIGFsd2F5cyByZWZlciB0byBgY29udGV4dGAgYXMgYHRoaXNgLiBUaGlzXG4gKiBpcyB1c2VmdWwgZm9yIGNsYXNzZXMgd2hlcmUgb3RoZXJ3aXNlIGV2ZW50IGJpbmRpbmdzIHdvdWxkIHJlYXNzaWduXG4gKiBgdGhpc2AgdG8gdGhlIGV2ZW50ZWQgb2JqZWN0IG9yIHNvbWUgb3RoZXIgdmFsdWU6IHRoaXMgbGV0cyB5b3UgZW5zdXJlXG4gKiB0aGUgYHRoaXNgIHZhbHVlIGFsd2F5cy5cbiAqXG4gKiBAcGFyYW0gZm5zIGxpc3Qgb2YgbWVtYmVyIGZ1bmN0aW9uIG5hbWVzXG4gKiBAcGFyYW0gY29udGV4dCB0aGUgY29udGV4dCB2YWx1ZVxuICogQGV4YW1wbGVcbiAqIGZ1bmN0aW9uIE15Q2xhc3MoKSB7XG4gKiAgIGJpbmRBbGwoWydvbnRpbWVyJ10sIHRoaXMpO1xuICogICB0aGlzLm5hbWUgPSAnVG9tJztcbiAqIH1cbiAqIE15Q2xhc3MucHJvdG90eXBlLm9udGltZXIgPSBmdW5jdGlvbigpIHtcbiAqICAgYWxlcnQodGhpcy5uYW1lKTtcbiAqIH07XG4gKiB2YXIgbXlDbGFzcyA9IG5ldyBNeUNsYXNzKCk7XG4gKiBzZXRUaW1lb3V0KG15Q2xhc3Mub250aW1lciwgMTAwKTtcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydHMuYmluZEFsbCA9IGZ1bmN0aW9uKGZucyAgICAgICAgICAgICAgICwgY29udGV4dCAgICAgICAgKSAgICAgICB7XG4gICAgZm5zLmZvckVhY2goKGZuKSA9PiB7XG4gICAgICAgIGlmICghY29udGV4dFtmbl0pIHsgcmV0dXJuOyB9XG4gICAgICAgIGNvbnRleHRbZm5dID0gY29udGV4dFtmbl0uYmluZChjb250ZXh0KTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogR2l2ZW4gYSBsaXN0IG9mIGNvb3JkaW5hdGVzLCBnZXQgdGhlaXIgY2VudGVyIGFzIGEgY29vcmRpbmF0ZS5cbiAqXG4gKiBAcmV0dXJucyBjZW50ZXJwb2ludFxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0cy5nZXRDb29yZGluYXRlc0NlbnRlciA9IGZ1bmN0aW9uKGNvb3JkcyAgICAgICAgICAgICAgICAgICApICAgICAgICAgICAgIHtcbiAgICBsZXQgbWluWCA9IEluZmluaXR5O1xuICAgIGxldCBtaW5ZID0gSW5maW5pdHk7XG4gICAgbGV0IG1heFggPSAtSW5maW5pdHk7XG4gICAgbGV0IG1heFkgPSAtSW5maW5pdHk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvb3Jkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBtaW5YID0gTWF0aC5taW4obWluWCwgY29vcmRzW2ldLmNvbHVtbik7XG4gICAgICAgIG1pblkgPSBNYXRoLm1pbihtaW5ZLCBjb29yZHNbaV0ucm93KTtcbiAgICAgICAgbWF4WCA9IE1hdGgubWF4KG1heFgsIGNvb3Jkc1tpXS5jb2x1bW4pO1xuICAgICAgICBtYXhZID0gTWF0aC5tYXgobWF4WSwgY29vcmRzW2ldLnJvdyk7XG4gICAgfVxuXG4gICAgY29uc3QgZHggPSBtYXhYIC0gbWluWDtcbiAgICBjb25zdCBkeSA9IG1heFkgLSBtaW5ZO1xuICAgIGNvbnN0IGRNYXggPSBNYXRoLm1heChkeCwgZHkpO1xuICAgIGNvbnN0IHpvb20gPSBNYXRoLm1heCgwLCBNYXRoLmZsb29yKC1NYXRoLmxvZyhkTWF4KSAvIE1hdGguTE4yKSk7XG4gICAgcmV0dXJuIG5ldyBDb29yZGluYXRlKChtaW5YICsgbWF4WCkgLyAyLCAobWluWSArIG1heFkpIC8gMiwgMClcbiAgICAgICAgLnpvb21Ubyh6b29tKTtcbn07XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgc3RyaW5nIGVuZHMgd2l0aCBhIHBhcnRpY3VsYXIgc3Vic3RyaW5nXG4gKlxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0cy5lbmRzV2l0aCA9IGZ1bmN0aW9uKHN0cmluZyAgICAgICAgLCBzdWZmaXggICAgICAgICkgICAgICAgICAge1xuICAgIHJldHVybiBzdHJpbmcuaW5kZXhPZihzdWZmaXgsIHN0cmluZy5sZW5ndGggLSBzdWZmaXgubGVuZ3RoKSAhPT0gLTE7XG59O1xuXG4vKipcbiAqIENyZWF0ZSBhbiBvYmplY3QgYnkgbWFwcGluZyBhbGwgdGhlIHZhbHVlcyBvZiBhbiBleGlzdGluZyBvYmplY3Qgd2hpbGVcbiAqIHByZXNlcnZpbmcgdGhlaXIga2V5cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnRzLm1hcE9iamVjdCA9IGZ1bmN0aW9uKGlucHV0ICAgICAgICAsIGl0ZXJhdG9yICAgICAgICAgICwgY29udGV4dCAgICAgICAgICkgICAgICAgICB7XG4gICAgY29uc3Qgb3V0cHV0ID0ge307XG4gICAgZm9yIChjb25zdCBrZXkgaW4gaW5wdXQpIHtcbiAgICAgICAgb3V0cHV0W2tleV0gPSBpdGVyYXRvci5jYWxsKGNvbnRleHQgfHwgdGhpcywgaW5wdXRba2V5XSwga2V5LCBpbnB1dCk7XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG59O1xuXG4vKipcbiAqIENyZWF0ZSBhbiBvYmplY3QgYnkgZmlsdGVyaW5nIG91dCB2YWx1ZXMgb2YgYW4gZXhpc3Rpbmcgb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydHMuZmlsdGVyT2JqZWN0ID0gZnVuY3Rpb24oaW5wdXQgICAgICAgICwgaXRlcmF0b3IgICAgICAgICAgLCBjb250ZXh0ICAgICAgICAgKSAgICAgICAgIHtcbiAgICBjb25zdCBvdXRwdXQgPSB7fTtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBpbnB1dCkge1xuICAgICAgICBpZiAoaXRlcmF0b3IuY2FsbChjb250ZXh0IHx8IHRoaXMsIGlucHV0W2tleV0sIGtleSwgaW5wdXQpKSB7XG4gICAgICAgICAgICBvdXRwdXRba2V5XSA9IGlucHV0W2tleV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbn07XG5cbi8qKlxuICogRGVlcGx5IGNvbXBhcmVzIHR3byBvYmplY3QgbGl0ZXJhbHMuXG4gKlxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0cy5kZWVwRXF1YWwgPSBmdW5jdGlvbihhICAgICAgICAsIGIgICAgICAgICkgICAgICAgICAge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGEpKSB7XG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShiKSB8fCBhLmxlbmd0aCAhPT0gYi5sZW5ndGgpIHJldHVybiBmYWxzZTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoIWV4cG9ydHMuZGVlcEVxdWFsKGFbaV0sIGJbaV0pKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgYSA9PT0gJ29iamVjdCcgJiYgYSAhPT0gbnVsbCAmJiBiICE9PSBudWxsKSB7XG4gICAgICAgIGlmICghKHR5cGVvZiBiID09PSAnb2JqZWN0JykpIHJldHVybiBmYWxzZTtcbiAgICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKGEpO1xuICAgICAgICBpZiAoa2V5cy5sZW5ndGggIT09IE9iamVjdC5rZXlzKGIpLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBhKSB7XG4gICAgICAgICAgICBpZiAoIWV4cG9ydHMuZGVlcEVxdWFsKGFba2V5XSwgYltrZXldKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gYSA9PT0gYjtcbn07XG5cbi8qKlxuICogRGVlcGx5IGNsb25lcyB0d28gb2JqZWN0cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnRzLmNsb25lID0gZnVuY3Rpb24gICAoaW5wdXQgICApICAgIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShpbnB1dCkpIHtcbiAgICAgICAgcmV0dXJuIGlucHV0Lm1hcChleHBvcnRzLmNsb25lKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBpbnB1dCA9PT0gJ29iamVjdCcgJiYgaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuICgoZXhwb3J0cy5tYXBPYmplY3QoaW5wdXQsIGV4cG9ydHMuY2xvbmUpICAgICApICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gaW5wdXQ7XG4gICAgfVxufTtcblxuLyoqXG4gKiBDaGVjayBpZiB0d28gYXJyYXlzIGhhdmUgYXQgbGVhc3Qgb25lIGNvbW1vbiBlbGVtZW50LlxuICpcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydHMuYXJyYXlzSW50ZXJzZWN0ID0gZnVuY3Rpb24gICAoYSAgICAgICAgICAsIGIgICAgICAgICAgKSAgICAgICAgICB7XG4gICAgZm9yIChsZXQgbCA9IDA7IGwgPCBhLmxlbmd0aDsgbCsrKSB7XG4gICAgICAgIGlmIChiLmluZGV4T2YoYVtsXSkgPj0gMCkgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn07XG5cbi8qKlxuICogUHJpbnQgYSB3YXJuaW5nIG1lc3NhZ2UgdG8gdGhlIGNvbnNvbGUgYW5kIGVuc3VyZSBkdXBsaWNhdGUgd2FybmluZyBtZXNzYWdlc1xuICogYXJlIG5vdCBwcmludGVkLlxuICpcbiAqIEBwcml2YXRlXG4gKi9cbmNvbnN0IHdhcm5PbmNlSGlzdG9yeSAgICAgICAgICAgICAgICAgICAgICAgICAgID0ge307XG5leHBvcnRzLndhcm5PbmNlID0gZnVuY3Rpb24obWVzc2FnZSAgICAgICAgKSAgICAgICB7XG4gICAgaWYgKCF3YXJuT25jZUhpc3RvcnlbbWVzc2FnZV0pIHtcbiAgICAgICAgLy8gY29uc29sZSBpc24ndCBkZWZpbmVkIGluIHNvbWUgV2ViV29ya2Vycywgc2VlICMyNTU4XG4gICAgICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gXCJ1bmRlZmluZWRcIikgY29uc29sZS53YXJuKG1lc3NhZ2UpO1xuICAgICAgICB3YXJuT25jZUhpc3RvcnlbbWVzc2FnZV0gPSB0cnVlO1xuICAgIH1cbn07XG5cbi8qKlxuICogSW5kaWNhdGVzIGlmIHRoZSBwcm92aWRlZCBQb2ludHMgYXJlIGluIGEgY291bnRlciBjbG9ja3dpc2UgKHRydWUpIG9yIGNsb2Nrd2lzZSAoZmFsc2UpIG9yZGVyXG4gKlxuICogQHJldHVybnMgdHJ1ZSBmb3IgYSBjb3VudGVyIGNsb2Nrd2lzZSBzZXQgb2YgcG9pbnRzXG4gKi9cbi8vIGh0dHA6Ly9icnljZWJvZS5jb20vMjAwNi8xMC8yMy9saW5lLXNlZ21lbnQtaW50ZXJzZWN0aW9uLWFsZ29yaXRobS9cbmV4cG9ydHMuaXNDb3VudGVyQ2xvY2t3aXNlID0gZnVuY3Rpb24oYSAgICAgICAsIGIgICAgICAgLCBjICAgICAgICkgICAgICAgICAge1xuICAgIHJldHVybiAoYy55IC0gYS55KSAqIChiLnggLSBhLngpID4gKGIueSAtIGEueSkgKiAoYy54IC0gYS54KTtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgc2lnbmVkIGFyZWEgZm9yIHRoZSBwb2x5Z29uIHJpbmcuICBQb3N0aXZlIGFyZWFzIGFyZSBleHRlcmlvciByaW5ncyBhbmRcbiAqIGhhdmUgYSBjbG9ja3dpc2Ugd2luZGluZy4gIE5lZ2F0aXZlIGFyZWFzIGFyZSBpbnRlcmlvciByaW5ncyBhbmQgaGF2ZSBhIGNvdW50ZXIgY2xvY2t3aXNlXG4gKiBvcmRlcmluZy5cbiAqXG4gKiBAcGFyYW0gcmluZyBFeHRlcmlvciBvciBpbnRlcmlvciByaW5nXG4gKi9cbmV4cG9ydHMuY2FsY3VsYXRlU2lnbmVkQXJlYSA9IGZ1bmN0aW9uKHJpbmcgICAgICAgICAgICAgICkgICAgICAgICB7XG4gICAgbGV0IHN1bSA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IHJpbmcubGVuZ3RoLCBqID0gbGVuIC0gMSwgcDEsIHAyOyBpIDwgbGVuOyBqID0gaSsrKSB7XG4gICAgICAgIHAxID0gcmluZ1tpXTtcbiAgICAgICAgcDIgPSByaW5nW2pdO1xuICAgICAgICBzdW0gKz0gKHAyLnggLSBwMS54KSAqIChwMS55ICsgcDIueSk7XG4gICAgfVxuICAgIHJldHVybiBzdW07XG59O1xuXG4vKipcbiAqIERldGVjdHMgY2xvc2VkIHBvbHlnb25zLCBmaXJzdCArIGxhc3QgcG9pbnQgYXJlIGVxdWFsXG4gKlxuICogQHBhcmFtIHBvaW50cyBhcnJheSBvZiBwb2ludHNcbiAqIEByZXR1cm4gdHJ1ZSBpZiB0aGUgcG9pbnRzIGFyZSBhIGNsb3NlZCBwb2x5Z29uXG4gKi9cbmV4cG9ydHMuaXNDbG9zZWRQb2x5Z29uID0gZnVuY3Rpb24ocG9pbnRzICAgICAgICAgICAgICApICAgICAgICAgIHtcbiAgICAvLyBJZiBpdCBpcyAyIHBvaW50cyB0aGF0IGFyZSB0aGUgc2FtZSB0aGVuIGl0IGlzIGEgcG9pbnRcbiAgICAvLyBJZiBpdCBpcyAzIHBvaW50cyB3aXRoIHN0YXJ0IGFuZCBlbmQgdGhlIHNhbWUgdGhlbiBpdCBpcyBhIGxpbmVcbiAgICBpZiAocG9pbnRzLmxlbmd0aCA8IDQpXG4gICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIGNvbnN0IHAxID0gcG9pbnRzWzBdO1xuICAgIGNvbnN0IHAyID0gcG9pbnRzW3BvaW50cy5sZW5ndGggLSAxXTtcblxuICAgIGlmIChNYXRoLmFicyhwMS54IC0gcDIueCkgPiAwIHx8XG4gICAgICAgIE1hdGguYWJzKHAxLnkgLSBwMi55KSA+IDApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIHBvbHlnb24gc2ltcGxpZmljYXRpb24gY2FuIHByb2R1Y2UgcG9seWdvbnMgd2l0aCB6ZXJvIGFyZWEgYW5kIG1vcmUgdGhhbiAzIHBvaW50c1xuICAgIHJldHVybiAoTWF0aC5hYnMoZXhwb3J0cy5jYWxjdWxhdGVTaWduZWRBcmVhKHBvaW50cykpID4gMC4wMSk7XG59O1xuXG4vKipcbiAqIENvbnZlcnRzIHNwaGVyaWNhbCBjb29yZGluYXRlcyB0byBjYXJ0ZXNpYW4gY29vcmRpbmF0ZXMuXG4gKlxuICogQHBhcmFtIHNwaGVyaWNhbCBTcGhlcmljYWwgY29vcmRpbmF0ZXMsIGluIFtyYWRpYWwsIGF6aW11dGhhbCwgcG9sYXJdXG4gKiBAcmV0dXJuIGNhcnRlc2lhbiBjb29yZGluYXRlcyBpbiBbeCwgeSwgel1cbiAqL1xuXG5leHBvcnRzLnNwaGVyaWNhbFRvQ2FydGVzaWFuID0gZnVuY3Rpb24oW3IsIGF6aW11dGhhbCwgcG9sYXJdICAgICAgICAgICAgICAgICAgICAgICAgICApICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgIC8vIFdlIGFic3RyYWN0IFwibm9ydGhcIi9cInVwXCIgKGNvbXBhc3Mtd2lzZSkgdG8gYmUgMMKwIHdoZW4gcmVhbGx5IHRoaXMgaXMgOTDCsCAoz4AvMik6XG4gICAgLy8gY29ycmVjdCBmb3IgdGhhdCBoZXJlXG4gICAgYXppbXV0aGFsICs9IDkwO1xuXG4gICAgLy8gQ29udmVydCBhemltdXRoYWwgYW5kIHBvbGFyIGFuZ2xlcyB0byByYWRpYW5zXG4gICAgYXppbXV0aGFsICo9IE1hdGguUEkgLyAxODA7XG4gICAgcG9sYXIgKj0gTWF0aC5QSSAvIDE4MDtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHg6IHIgKiBNYXRoLmNvcyhhemltdXRoYWwpICogTWF0aC5zaW4ocG9sYXIpLFxuICAgICAgICB5OiByICogTWF0aC5zaW4oYXppbXV0aGFsKSAqIE1hdGguc2luKHBvbGFyKSxcbiAgICAgICAgejogciAqIE1hdGguY29zKHBvbGFyKVxuICAgIH07XG59O1xuXG4vKipcbiAqIFBhcnNlcyBkYXRhIGZyb20gJ0NhY2hlLUNvbnRyb2wnIGhlYWRlcnMuXG4gKlxuICogQHBhcmFtIGNhY2hlQ29udHJvbCBWYWx1ZSBvZiAnQ2FjaGUtQ29udHJvbCcgaGVhZGVyXG4gKiBAcmV0dXJuIG9iamVjdCBjb250YWluaW5nIHBhcnNlZCBoZWFkZXIgaW5mby5cbiAqL1xuXG5leHBvcnRzLnBhcnNlQ2FjaGVDb250cm9sID0gZnVuY3Rpb24oY2FjaGVDb250cm9sICAgICAgICApICAgICAgICAge1xuICAgIC8vIFRha2VuIGZyb20gW1dyZWNrXShodHRwczovL2dpdGh1Yi5jb20vaGFwaWpzL3dyZWNrKVxuICAgIGNvbnN0IHJlID0gLyg/Ol58KD86XFxzKlxcLFxccyopKShbXlxceDAwLVxceDIwXFwoXFwpPD5AXFwsO1xcOlxcXFxcIlxcL1xcW1xcXVxcP1xcPVxce1xcfVxceDdGXSspKD86XFw9KD86KFteXFx4MDAtXFx4MjBcXChcXCk8PkBcXCw7XFw6XFxcXFwiXFwvXFxbXFxdXFw/XFw9XFx7XFx9XFx4N0ZdKyl8KD86XFxcIigoPzpbXlwiXFxcXF18XFxcXC4pKilcXFwiKSkpPy9nO1xuXG4gICAgY29uc3QgaGVhZGVyID0ge307XG4gICAgY2FjaGVDb250cm9sLnJlcGxhY2UocmUsICgkMCwgJDEsICQyLCAkMykgPT4ge1xuICAgICAgICBjb25zdCB2YWx1ZSA9ICQyIHx8ICQzO1xuICAgICAgICBoZWFkZXJbJDFdID0gdmFsdWUgPyB2YWx1ZS50b0xvd2VyQ2FzZSgpIDogdHJ1ZTtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH0pO1xuXG4gICAgaWYgKGhlYWRlclsnbWF4LWFnZSddKSB7XG4gICAgICAgIGNvbnN0IG1heEFnZSA9IHBhcnNlSW50KGhlYWRlclsnbWF4LWFnZSddLCAxMCk7XG4gICAgICAgIGlmIChpc05hTihtYXhBZ2UpKSBkZWxldGUgaGVhZGVyWydtYXgtYWdlJ107XG4gICAgICAgIGVsc2UgaGVhZGVyWydtYXgtYWdlJ10gPSBtYXhBZ2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIGhlYWRlcjtcbn07XG4iLCIvLyAgICAgIFxuXG5jb25zdCB1dGlsID0gcmVxdWlyZSgnbWFwYm94LWdsL3NyYy91dGlsL3V0aWwnKTtcbmNvbnN0IGFqYXggPSByZXF1aXJlKCdtYXBib3gtZ2wvc3JjL3V0aWwvYWpheCcpO1xuY29uc3QgRXZlbnRlZCA9IHJlcXVpcmUoJ21hcGJveC1nbC9zcmMvdXRpbC9ldmVudGVkJyk7XG5jb25zdCBsb2FkQXJjR0lTTWFwU2VydmVyID0gcmVxdWlyZSgnLi9sb2FkX2FyY2dpc19tYXBzZXJ2ZXInKTtcbmNvbnN0IFRpbGVCb3VuZHMgPSByZXF1aXJlKCdtYXBib3gtZ2wvc3JjL3NvdXJjZS90aWxlX2JvdW5kcycpO1xuY29uc3QgVGV4dHVyZSA9IHJlcXVpcmUoJ21hcGJveC1nbC9zcmMvcmVuZGVyL3RleHR1cmUnKTtcbmNvbnN0IGhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMnKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuXG5jbGFzcyBBcmNHSVNUaWxlZE1hcFNlcnZpY2VTb3VyY2UgZXh0ZW5kcyBFdmVudGVkICAgICAgICAgICAgICAgICAgIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgIFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICBcblxuICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuXG4gICAgY29uc3RydWN0b3IoaWQgICAgICAgICwgb3B0aW9ucyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAsIGRpc3BhdGNoZXIgICAgICAgICAgICAsIGV2ZW50ZWRQYXJlbnQgICAgICAgICApIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xuICAgICAgICB0aGlzLmRpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xuICAgICAgICB0aGlzLnNldEV2ZW50ZWRQYXJlbnQoZXZlbnRlZFBhcmVudCk7XG5cbiAgICAgICAgdGhpcy50eXBlID0gJ2FyY2dpc3Jhc3Rlcic7XG4gICAgICAgIHRoaXMubWluem9vbSA9IDA7XG4gICAgICAgIHRoaXMubWF4em9vbSA9IDIyO1xuICAgICAgICB0aGlzLnJvdW5kWm9vbSA9IHRydWU7XG4gICAgICAgIHRoaXMudGlsZVNpemUgPSA1MTI7XG4gICAgICAgIHRoaXMuX2xvYWRlZCA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuX29wdGlvbnMgPSB1dGlsLmV4dGVuZCh7fSwgb3B0aW9ucyk7XG4gICAgICAgIHV0aWwuZXh0ZW5kKHRoaXMsIHV0aWwucGljayhvcHRpb25zLCBbJ3VybCcsICdzY2hlbWUnLCAndGlsZVNpemUnXSkpO1xuICAgIH1cblxuICAgIGxvYWQoKSB7XG4gICAgICAgIHRoaXMuZmlyZSgnZGF0YWxvYWRpbmcnLCB7ZGF0YVR5cGU6ICdzb3VyY2UnfSk7XG4gICAgICAgIGxvYWRBcmNHSVNNYXBTZXJ2ZXIodGhpcy5fb3B0aW9ucywgKGVyciwgbWV0YWRhdGEpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZpcmUoJ2Vycm9yJywgZXJyKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobWV0YWRhdGEpIHtcbiAgICAgICAgICAgICAgICB1dGlsLmV4dGVuZCh0aGlzLCBtZXRhZGF0YSk7XG5cbiAgICAgICAgICAgICAgICBpZiAobWV0YWRhdGEuYm91bmRzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGlsZUJvdW5kcyA9IG5ldyBUaWxlQm91bmRzKG1ldGFkYXRhLmJvdW5kcywgdGhpcy5taW56b29tLCB0aGlzLm1heHpvb20pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gYGNvbnRlbnRgIGlzIGluY2x1ZGVkIGhlcmUgdG8gcHJldmVudCBhIHJhY2UgY29uZGl0aW9uIHdoZXJlIGBTdHlsZSNfdXBkYXRlU291cmNlc2AgaXMgY2FsbGVkXG4gICAgICAgICAgICAvLyBiZWZvcmUgdGhlIFRpbGVKU09OIGFycml2ZXMuIHRoaXMgbWFrZXMgc3VyZSB0aGUgdGlsZXMgbmVlZGVkIGFyZSBsb2FkZWQgb25jZSBUaWxlSlNPTiBhcnJpdmVzXG4gICAgICAgICAgICAvLyByZWY6IGh0dHBzOi8vZ2l0aHViLmNvbS9tYXBib3gvbWFwYm94LWdsLWpzL3B1bGwvNDM0NyNkaXNjdXNzaW9uX3IxMDQ0MTgwODhcbiAgICAgICAgICAgIHRoaXMuZmlyZSgnZGF0YScsIHtkYXRhVHlwZTogJ3NvdXJjZScsIHNvdXJjZURhdGFUeXBlOiAnbWV0YWRhdGEnfSk7XG4gICAgICAgICAgICB0aGlzLmZpcmUoJ2RhdGEnLCB7ZGF0YVR5cGU6ICdzb3VyY2UnLCBzb3VyY2VEYXRhVHlwZTogJ2NvbnRlbnQnfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG9uQWRkKG1hcCAgICAgKSB7XG4gICAgICAgIC8vIHNldCB0aGUgdXJsc1xuICAgICAgICBjb25zdCBiYXNlVXJsID0gdGhpcy51cmwuc3BsaXQoJz8nKVswXTtcbiAgICAgICAgdGhpcy50aWxlVXJsID0gYCR7YmFzZVVybH0vdGlsZS97en0ve3l9L3t4fWA7XG5cbiAgICAgICAgY29uc3QgYXJjZ2lzb25saW5lID0gbmV3IFJlZ0V4cCgvdGlsZXMuYXJjZ2lzKG9ubGluZSk/XFwuY29tL2cpO1xuICAgICAgICBpZiAoYXJjZ2lzb25saW5lLnRlc3QodGhpcy51cmwpKSB7XG4gICAgICAgICAgICB0aGlzLnRpbGVVcmwgPSB0aGlzLnRpbGVVcmwucmVwbGFjZSgnOi8vdGlsZXMnLCAnOi8vdGlsZXN7c30nKTtcbiAgICAgICAgICAgIHRoaXMuc3ViZG9tYWlucyA9IFsnMScsICcyJywgJzMnLCAnNCddO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMudG9rZW4pIHtcbiAgICAgICAgICAgIHRoaXMudGlsZVVybCArPSAoYD90b2tlbj0ke3RoaXMudG9rZW59YCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRoaXMubWFwID0gbWFwO1xuICAgICAgICB0aGlzLmxvYWQoKTtcbiAgICB9XG5cbiAgICBzZXJpYWxpemUoKSB7XG4gICAgICAgIHJldHVybiB1dGlsLmV4dGVuZCh7fSwgdGhpcy5fb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgaGFzVGlsZSh0aWxlSUQgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgcmV0dXJuICF0aGlzLnRpbGVCb3VuZHMgfHwgdGhpcy50aWxlQm91bmRzLmNvbnRhaW5zKHRpbGVJRC5jYW5vbmljYWwpO1xuICAgIH1cblxuICAgIGxvYWRUaWxlKHRpbGUgICAgICAsIGNhbGxiYWNrICAgICAgICAgICAgICAgICkge1xuICAgICAgICAvL2NvbnZlcnQgdG8gYWdzIGNvb3Jkc1xuICAgICAgICBjb25zdCB0aWxlUG9pbnQgPSB7IHo6IHRpbGUudGlsZUlELm92ZXJzY2FsZWRaLCB4OiB0aWxlLnRpbGVJRC5jYW5vbmljYWwueCwgeTogdGlsZS50aWxlSUQuY2Fub25pY2FsLnkgfTtcblxuICAgICAgICBjb25zdCB1cmwgPSAgaGVscGVycy5fdGVtcGxhdGUodGhpcy50aWxlVXJsLCB1dGlsLmV4dGVuZCh7XG4gICAgICAgICAgICBzOiBoZWxwZXJzLl9nZXRTdWJkb21haW4odGlsZVBvaW50LCB0aGlzLnN1YmRvbWFpbnMpLFxuICAgICAgICAgICAgejogKHRoaXMuX2xvZE1hcCAmJiB0aGlzLl9sb2RNYXBbdGlsZVBvaW50LnpdKSA/IHRoaXMuX2xvZE1hcFt0aWxlUG9pbnQuel0gOiB0aWxlUG9pbnQueiwgLy8gdHJ5IGxvZCBtYXAgZmlyc3QsIHRoZW4ganVzdCBkZWZ1YWx0IHRvIHpvb20gbGV2ZWxcbiAgICAgICAgICAgIHg6IHRpbGVQb2ludC54LFxuICAgICAgICAgICAgeTogdGlsZVBvaW50LnlcbiAgICAgICAgfSwgdGhpcy5vcHRpb25zKSk7XG4gICAgICAgIHRpbGUucmVxdWVzdCA9IGFqYXguZ2V0SW1hZ2Uoe3VybH0sICAoZXJyLCBpbWcpID0+IHtcbiAgICAgICAgICAgIGRlbGV0ZSB0aWxlLnJlcXVlc3Q7XG5cbiAgICAgICAgICAgIGlmICh0aWxlLmFib3J0ZWQpIHtcbiAgICAgICAgICAgICAgICB0aWxlLnN0YXRlID0gJ3VubG9hZGVkJztcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgdGlsZS5zdGF0ZSA9ICdlcnJvcmVkJztcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChpbWcpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tYXAuX3JlZnJlc2hFeHBpcmVkVGlsZXMpIHRpbGUuc2V0RXhwaXJ5RGF0YShpbWcpO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSAoaW1nICAgICApLmNhY2hlQ29udHJvbDtcbiAgICAgICAgICAgICAgICBkZWxldGUgKGltZyAgICAgKS5leHBpcmVzO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgY29udGV4dCA9IHRoaXMubWFwLnBhaW50ZXIuY29udGV4dDtcbiAgICAgICAgICAgICAgICBjb25zdCBnbCA9IGNvbnRleHQuZ2w7XG4gICAgICAgICAgICAgICAgdGlsZS50ZXh0dXJlID0gdGhpcy5tYXAucGFpbnRlci5nZXRUaWxlVGV4dHVyZShpbWcud2lkdGgpO1xuICAgICAgICAgICAgICAgIGlmICh0aWxlLnRleHR1cmUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGlsZS50ZXh0dXJlLmJpbmQoZ2wuTElORUFSLCBnbC5DTEFNUF9UT19FREdFLCBnbC5MSU5FQVJfTUlQTUFQX05FQVJFU1QpO1xuICAgICAgICAgICAgICAgICAgICBnbC50ZXhTdWJJbWFnZTJEKGdsLlRFWFRVUkVfMkQsIDAsIDAsIDAsIGdsLlJHQkEsIGdsLlVOU0lHTkVEX0JZVEUsIGltZyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGlsZS50ZXh0dXJlID0gbmV3IFRleHR1cmUoY29udGV4dCwgaW1nLCBnbC5SR0JBKTtcbiAgICAgICAgICAgICAgICAgICAgdGlsZS50ZXh0dXJlLmJpbmQoZ2wuTElORUFSLCBnbC5DTEFNUF9UT19FREdFLCBnbC5MSU5FQVJfTUlQTUFQX05FQVJFU1QpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChjb250ZXh0LmV4dFRleHR1cmVGaWx0ZXJBbmlzb3Ryb3BpYykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2wudGV4UGFyYW1ldGVyZihnbC5URVhUVVJFXzJELCBjb250ZXh0LmV4dFRleHR1cmVGaWx0ZXJBbmlzb3Ryb3BpYy5URVhUVVJFX01BWF9BTklTT1RST1BZX0VYVCwgY29udGV4dC5leHRUZXh0dXJlRmlsdGVyQW5pc290cm9waWNNYXgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGdsLmdlbmVyYXRlTWlwbWFwKGdsLlRFWFRVUkVfMkQpO1xuXG4gICAgICAgICAgICAgICAgdGlsZS5zdGF0ZSA9ICdsb2FkZWQnO1xuXG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFib3J0VGlsZSh0aWxlICAgICAgLCBjYWxsYmFjayAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgaWYgKHRpbGUucmVxdWVzdCkge1xuICAgICAgICAgICAgdGlsZS5yZXF1ZXN0LmFib3J0KCk7XG4gICAgICAgICAgICBkZWxldGUgdGlsZS5yZXF1ZXN0O1xuICAgICAgICB9XG4gICAgICAgIGNhbGxiYWNrKCk7XG4gICAgfVxuXG4gICAgdW5sb2FkVGlsZSh0aWxlICAgICAgLCBjYWxsYmFjayAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgaWYgKHRpbGUudGV4dHVyZSkgdGhpcy5tYXAucGFpbnRlci5zYXZlVGlsZVRleHR1cmUodGlsZS50ZXh0dXJlKTtcbiAgICAgICAgY2FsbGJhY2soKTtcbiAgICB9XG5cbiAgICBoYXNUcmFuc2l0aW9uKCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFyY0dJU1RpbGVkTWFwU2VydmljZVNvdXJjZTsiLCJcbi8vRnJvbSBodHRwczovL2dpdGh1Yi5jb20vTGVhZmxldC9MZWFmbGV0L2Jsb2IvbWFzdGVyL3NyYy9jb3JlL1V0aWwuanNcbmNvbnN0IF90ZW1wbGF0ZVJlID0gL1xceyAqKFtcXHdfXSspICpcXH0vZztcbmNvbnN0IF90ZW1wbGF0ZSA9IGZ1bmN0aW9uIChzdHIsIGRhdGEpIHtcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UoX3RlbXBsYXRlUmUsIChzdHIsIGtleSkgPT4ge1xuICAgICAgICBsZXQgdmFsdWUgPSBkYXRhW2tleV07XG5cbiAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTm8gdmFsdWUgcHJvdmlkZWQgZm9yIHZhcmlhYmxlICR7c3RyfWApO1xuXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlKGRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9KTtcbn07XG5cbi8vRnJvbSBodHRwczovL2dpdGh1Yi5jb20vTGVhZmxldC9MZWFmbGV0L2Jsb2IvbWFzdGVyL3NyYy9sYXllci90aWxlL1RpbGVMYXllci5qc1xuY29uc3QgX2dldFN1YmRvbWFpbiA9IGZ1bmN0aW9uICh0aWxlUG9pbnQsIHN1YmRvbWFpbnMpIHtcbiAgICBpZiAoc3ViZG9tYWlucykge1xuICAgICAgICBjb25zdCBpbmRleCA9IE1hdGguYWJzKHRpbGVQb2ludC54ICsgdGlsZVBvaW50LnkpICUgc3ViZG9tYWlucy5sZW5ndGg7XG4gICAgICAgIHJldHVybiBzdWJkb21haW5zW2luZGV4XTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBfdGVtcGxhdGUsXG4gICAgX2dldFN1YmRvbWFpblxufTtcbiIsImNvbnN0IEFyY0dJU1RpbGVkTWFwU2VydmljZVNvdXJjZSA9IHJlcXVpcmUoJy4vYXJjZ2lzX3RpbGVkX21hcF9zZXJ2aWNlX3NvdXJjZScpO1xubW9kdWxlLmV4cG9ydHMgPSBBcmNHSVNUaWxlZE1hcFNlcnZpY2VTb3VyY2U7IiwiJ3VzZSBzdHJpY3QnO1xuY29uc3QgdXRpbCA9IHJlcXVpcmUoJ21hcGJveC1nbC9zcmMvdXRpbC91dGlsJyk7XG5jb25zdCBhamF4ID0gcmVxdWlyZSgnbWFwYm94LWdsL3NyYy91dGlsL2FqYXgnKTtcbmNvbnN0IGJyb3dzZXIgPSByZXF1aXJlKCdtYXBib3gtZ2wvc3JjL3V0aWwvYnJvd3NlcicpO1xuY29uc3QgU3BoZXJpY2FsTWVyY2F0b3IgPSByZXF1aXJlKCdAbWFwYm94L3NwaGVyaWNhbG1lcmNhdG9yJyk7XG5cbi8vQ29udGFpbnMgY29kZSBmcm9tIGVzcmktbGVhZmxldCBodHRwczovL2dpdGh1Yi5jb20vRXNyaS9lc3JpLWxlYWZsZXRcbmNvbnN0IE1lcmNhdG9yWm9vbUxldmVscyA9IHtcbiAgICAnMCc6IDE1NjU0My4wMzM5Mjc5OTk5OSxcbiAgICAnMSc6IDc4MjcxLjUxNjk2Mzk5OTg5MyxcbiAgICAnMic6IDM5MTM1Ljc1ODQ4MjAwMDA5OSxcbiAgICAnMyc6IDE5NTY3Ljg3OTI0MDk5OTkwMSxcbiAgICAnNCc6IDk3ODMuOTM5NjIwNDk5OTU5MyxcbiAgICAnNSc6IDQ4OTEuOTY5ODEwMjQ5OTc5NyxcbiAgICAnNic6IDI0NDUuOTg0OTA1MTI0OTg5OCxcbiAgICAnNyc6IDEyMjIuOTkyNDUyNTYyNDg5OSxcbiAgICAnOCc6IDYxMS40OTYyMjYyODEzODAwMixcbiAgICAnOSc6IDMwNS43NDgxMTMxNDA1NTgwMixcbiAgICAnMTAnOiAxNTIuODc0MDU2NTcwNDExLFxuICAgICcxMSc6IDc2LjQzNzAyODI4NTA3MzE5NyxcbiAgICAnMTInOiAzOC4yMTg1MTQxNDI1MzY1OTgsXG4gICAgJzEzJzogMTkuMTA5MjU3MDcxMjY4Mjk5LFxuICAgICcxNCc6IDkuNTU0NjI4NTM1NjM0MTQ5NixcbiAgICAnMTUnOiA0Ljc3NzMxNDI2Nzk0OTM2OTksXG4gICAgJzE2JzogMi4zODg2NTcxMzM5NzQ2OCxcbiAgICAnMTcnOiAxLjE5NDMyODU2Njg1NTA1MDEsXG4gICAgJzE4JzogMC41OTcxNjQyODM1NTk4MTY5OSxcbiAgICAnMTknOiAwLjI5ODU4MjE0MTY0NzYxNjk4LFxuICAgICcyMCc6IDAuMTQ5MjkxMDcwODIzODEsXG4gICAgJzIxJzogMC4wNzQ2NDU1MzU0MTE5MSxcbiAgICAnMjInOiAwLjAzNzMyMjc2NzcwNTk1MjUsXG4gICAgJzIzJzogMC4wMTg2NjEzODM4NTI5NzYzXG59O1xuXG5jb25zdCBfd2l0aGluUGVyY2VudGFnZSA9IGZ1bmN0aW9uIChhLCBiLCBwZXJjZW50YWdlKSB7XG4gICAgY29uc3QgZGlmZiA9IE1hdGguYWJzKChhIC8gYikgLSAxKTtcbiAgICByZXR1cm4gZGlmZiA8IHBlcmNlbnRhZ2U7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gICAgY29uc3QgbG9hZGVkID0gZnVuY3Rpb24oZXJyLCBtZXRhZGF0YSkge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHV0aWwucGljayhtZXRhZGF0YSxcbiAgICAgICAgICAgIFsndGlsZUluZm8nLCAnaW5pdGlhbEV4dGVudCcsICdmdWxsRXh0ZW50JywgJ3NwYXRpYWxSZWZlcmVuY2UnLCAndGlsZVNlcnZlcnMnLCAnZG9jdW1lbnRJbmZvJ10pO1xuXG4gICAgICAgIHJlc3VsdC5fbG9kTWFwID0ge307XG4gICAgICAgIGNvbnN0IHpvb21PZmZzZXRBbGxvd2FuY2UgPSAwLjE7XG4gICAgICAgIGNvbnN0IHNyID0gbWV0YWRhdGEuc3BhdGlhbFJlZmVyZW5jZS5sYXRlc3RXa2lkIHx8IG1ldGFkYXRhLnNwYXRpYWxSZWZlcmVuY2Uud2tpZDtcbiAgICAgICAgaWYgKHNyID09PSAxMDIxMDAgfHwgc3IgPT09IDM4NTcpIHtcblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIEV4YW1wbGUgZXh0ZW50IGZyb20gQXJjR0lTIFJFU1QgQVBJXG4gICAgICAgICAgICBmdWxsRXh0ZW50OiB7XG4gICAgICAgICAgICB4bWluOiAtOTE0NDc5MS42NzkyMjYxMjcsXG4gICAgICAgICAgICB5bWluOiAtMjE5NTE5MC45NjE0Mzc3MjYsXG4gICAgICAgICAgICB4bWF4OiAtNDY1MDk4Ny4wNzIwMTk5ODMsXG4gICAgICAgICAgICB5bWF4OiAxMTE4MTEzLjExMDE1NTc2NixcbiAgICAgICAgICAgIHNwYXRpYWxSZWZlcmVuY2U6IHtcbiAgICAgICAgICAgIHdraWQ6IDEwMjEwMCxcbiAgICAgICAgICAgIHdrdDogbnVsbFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICAvL2NvbnZlcnQgQXJjR0lTIGV4dGVudCB0byBib3VuZHNcbiAgICAgICAgICAgIGNvbnN0IGV4dGVudCA9IG1ldGFkYXRhLmZ1bGxFeHRlbnQ7XG4gICAgICAgICAgICBpZiAoZXh0ZW50ICYmIGV4dGVudC5zcGF0aWFsUmVmZXJlbmNlICYmIGV4dGVudC5zcGF0aWFsUmVmZXJlbmNlLndraWQgPT09ICAxMDIxMDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBib3VuZHNXZWJNZXJjYXRvciA9IFtleHRlbnQueG1pbiwgZXh0ZW50LnltaW4sIGV4dGVudC54bWF4LCBleHRlbnQueW1heF07XG4gICAgICAgICAgICAgICAgdmFyIG1lcmMgPSBuZXcgU3BoZXJpY2FsTWVyY2F0b3Ioe1xuICAgICAgICAgICAgICAgICAgICBzaXplOiAyNTZcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjb25zdCBib3VuZHNXR1M4NCA9IG1lcmMuY29udmVydChib3VuZHNXZWJNZXJjYXRvcik7XG4gICAgICAgICAgICAgICAgcmVzdWx0LmJvdW5kcyA9IGJvdW5kc1dHUzg0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBjcmVhdGUgdGhlIHpvb20gbGV2ZWwgZGF0YVxuICAgICAgICAgICAgY29uc3QgYXJjZ2lzTE9EcyA9IG1ldGFkYXRhLnRpbGVJbmZvLmxvZHM7XG4gICAgICAgICAgICBjb25zdCBjb3JyZWN0UmVzb2x1dGlvbnMgPSBNZXJjYXRvclpvb21MZXZlbHM7XG4gICAgICAgICAgICByZXN1bHQubWluem9vbSA9IGFyY2dpc0xPRHNbMF0ubGV2ZWw7XG4gICAgICAgICAgICByZXN1bHQubWF4em9vbSA9IGFyY2dpc0xPRHNbYXJjZ2lzTE9Ecy5sZW5ndGggLSAxXS5sZXZlbDtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJjZ2lzTE9Ecy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFyY2dpc0xPRCA9IGFyY2dpc0xPRHNbaV07XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBjaSBpbiBjb3JyZWN0UmVzb2x1dGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29ycmVjdFJlcyA9IGNvcnJlY3RSZXNvbHV0aW9uc1tjaV07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKF93aXRoaW5QZXJjZW50YWdlKGFyY2dpc0xPRC5yZXNvbHV0aW9uLCBjb3JyZWN0UmVzLCB6b29tT2Zmc2V0QWxsb3dhbmNlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0Ll9sb2RNYXBbY2ldID0gYXJjZ2lzTE9ELmxldmVsO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWxsYmFjayhuZXcgRXJyb3IoJ25vbi1tZXJjYXRvciBzcGF0aWFsIHJlZmVyZW5jZScpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHJlc3VsdCk7XG4gICAgfTtcblxuICAgIGlmIChvcHRpb25zLnVybCkge1xuICAgICAgICBhamF4LmdldEpTT04oe3VybDogb3B0aW9ucy51cmx9LCBsb2FkZWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGJyb3dzZXIuZnJhbWUobG9hZGVkLmJpbmQobnVsbCwgbnVsbCwgb3B0aW9ucykpO1xuICAgIH1cbn07XG4iXX0=
