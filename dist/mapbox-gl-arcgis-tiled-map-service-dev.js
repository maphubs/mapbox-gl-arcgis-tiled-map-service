(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ArcGISTiledMapServiceSource = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
'use strict';

if (typeof module !== 'undefined' && module.exports) {
    module.exports = isSupported;
} else if (window) {
    window.mapboxgl = window.mapboxgl || {};
    window.mapboxgl.supported = isSupported;
}

/**
 * Test whether the current browser supports Mapbox GL JS
 * @param {Object} options
 * @param {boolean} [options.failIfMajorPerformanceCaveat=false] Return `false`
 *   if the performance of Mapbox GL JS would be dramatically worse than
 *   expected (i.e. a software renderer is would be used)
 * @return {boolean}
 */
function isSupported(options) {
    return !!(
        isBrowser() &&
        isArraySupported() &&
        isFunctionSupported() &&
        isObjectSupported() &&
        isJSONSupported() &&
        isWorkerSupported() &&
        isUint8ClampedArraySupported() &&
        isWebGLSupportedCached(options && options.failIfMajorPerformanceCaveat)
    );
}

function isBrowser() {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function isArraySupported() {
    return (
        Array.prototype &&
        Array.prototype.every &&
        Array.prototype.filter &&
        Array.prototype.forEach &&
        Array.prototype.indexOf &&
        Array.prototype.lastIndexOf &&
        Array.prototype.map &&
        Array.prototype.some &&
        Array.prototype.reduce &&
        Array.prototype.reduceRight &&
        Array.isArray
    );
}

function isFunctionSupported() {
    return Function.prototype && Function.prototype.bind;
}

function isObjectSupported() {
    return (
        Object.keys &&
        Object.create &&
        Object.getPrototypeOf &&
        Object.getOwnPropertyNames &&
        Object.isSealed &&
        Object.isFrozen &&
        Object.isExtensible &&
        Object.getOwnPropertyDescriptor &&
        Object.defineProperty &&
        Object.defineProperties &&
        Object.seal &&
        Object.freeze &&
        Object.preventExtensions
    );
}

function isJSONSupported() {
    return 'JSON' in window && 'parse' in JSON && 'stringify' in JSON;
}

function isWorkerSupported() {
    return 'Worker' in window;
}

// IE11 only supports `Uint8ClampedArray` as of version
// [KB2929437](https://support.microsoft.com/en-us/kb/2929437)
function isUint8ClampedArraySupported() {
    return 'Uint8ClampedArray' in window;
}

var isWebGLSupportedCache = {};
function isWebGLSupportedCached(failIfMajorPerformanceCaveat) {

    if (isWebGLSupportedCache[failIfMajorPerformanceCaveat] === undefined) {
        isWebGLSupportedCache[failIfMajorPerformanceCaveat] = isWebGLSupported(failIfMajorPerformanceCaveat);
    }

    return isWebGLSupportedCache[failIfMajorPerformanceCaveat];
}

isSupported.webGLContextAttributes = {
    antialias: false,
    alpha: true,
    stencil: true,
    depth: true
};

function isWebGLSupported(failIfMajorPerformanceCaveat) {

    var canvas = document.createElement('canvas');

    var attributes = Object.create(isSupported.webGLContextAttributes);
    attributes.failIfMajorPerformanceCaveat = failIfMajorPerformanceCaveat;

    if (canvas.probablySupportsContext) {
        return (
            canvas.probablySupportsContext('webgl', attributes) ||
            canvas.probablySupportsContext('experimental-webgl', attributes)
        );

    } else if (canvas.supportsContext) {
        return (
            canvas.supportsContext('webgl', attributes) ||
            canvas.supportsContext('experimental-webgl', attributes)
        );

    } else {
        return (
            canvas.getContext('webgl', attributes) ||
            canvas.getContext('experimental-webgl', attributes)
        );
    }
}

},{}],4:[function(require,module,exports){
'use strict';
//      

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
'use strict';

var wrap = require('../util/util').wrap;

/**
 * A `LngLat` object represents a given longitude and latitude coordinate, measured in degrees.
 *
 * Mapbox GL uses longitude, latitude coordinate order (as opposed to latitude, longitude) to match GeoJSON.
 *
 * Note that any Mapbox GL method that accepts a `LngLat` object as an argument or option
 * can also accept an `Array` of two numbers and will perform an implicit conversion.
 * This flexible type is documented as [`LngLatLike`](#LngLatLike).
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
var LngLat = function LngLat(lng, lat) {
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
 * Returns a new `LngLat` object wrapped to the best world to draw it provided a map `center` `LngLat`.
 *
 * When the map is close to the anti-meridian showing a point on world -1 or 1 is a better
 * choice. The heuristic used is to minimize the distance from the map center to the point.
 *
 * Only works where the `LngLat` is wrapped with `LngLat.wrap()` and `center` is within the main world map.
 *
 * @param {LngLat} center Map center within the main world.
 * @return {LngLat} The `LngLat` object in the best world to draw it for the provided map `center`.
 * @example
 * var ll = new mapboxgl.LngLat(170, 0);
 * var mapCenter = new mapboxgl.LngLat(-170, 0);
 * var snapped = ll.wrapToBestWorld(mapCenter);
 * snapped; // = { lng: -190, lat: 0 }
 */
LngLat.prototype.wrapToBestWorld = function wrapToBestWorld (center) {
    var wrapped = new LngLat(this.lng, this.lat);

    if (Math.abs(this.lng - center.lng) > 180) {
        if (center.lng < 0) {
            wrapped.lng -= 360;
        } else {
            wrapped.lng += 360;
        }
    }

    return wrapped;
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
LngLat.convert = function (input) {
    if (input instanceof LngLat) {
        return input;
    } else if (input && input.hasOwnProperty('lng') && input.hasOwnProperty('lat')) {
        return new LngLat(input.lng, input.lat);
    } else if (Array.isArray(input) && input.length === 2) {
        return new LngLat(input[0], input[1]);
    } else {
        throw new Error("`LngLatLike` argument must be specified as a LngLat instance, an object {lng: <lng>, lat: <lat>}, or an array of [<lng>, <lat>]");
    }
};

module.exports = LngLat;

},{"../util/util":12}],6:[function(require,module,exports){
'use strict';

var LngLat = require('./lng_lat');

/**
 * A `LngLatBounds` object represents a geographical bounding box,
 * defined by its southwest and northeast points in longitude and latitude.
 *
 * If no arguments are provided to the constructor, a `null` bounding box is created.
 *
 * Note that any Mapbox GL method that accepts a `LngLatBounds` object as an argument or option
 * can also accept an `Array` of two [`LngLatLike`](#LngLatLike) constructs and will perform an implicit conversion.
 * This flexible type is documented as [`LngLatBoundsLike`](#LngLatBoundsLike).
 *
 * @param {LngLatLike} [sw] The southwest corner of the bounding box.
 * @param {LngLatLike} [ne] The northeast corner of the bounding box.
 * @example
 * var sw = new mapboxgl.LngLat(-73.9876, 40.7661);
 * var ne = new mapboxgl.LngLat(-73.9397, 40.8002);
 * var llb = new mapboxgl.LngLatBounds(sw, ne);
 */
var LngLatBounds = function LngLatBounds(sw, ne) {
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
LngLatBounds.prototype.setNorthEast = function setNorthEast (ne) {
    this._ne = LngLat.convert(ne);
    return this;
};

/**
 * Set the southwest corner of the bounding box
 *
 * @param {LngLatLike} sw
 * @returns {LngLatBounds} `this`
 */
LngLatBounds.prototype.setSouthWest = function setSouthWest (sw) {
    this._sw = LngLat.convert(sw);
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
LngLatBounds.prototype.getCenter = function getCenter () {
    return new LngLat((this._sw.lng + this._ne.lng) / 2, (this._sw.lat + this._ne.lat) / 2);
};

/**
 * Returns the southwest corner of the bounding box.
 *
 * @returns {LngLat} The southwest corner of the bounding box.
 */
LngLatBounds.prototype.getSouthWest = function getSouthWest () { return this._sw; };

/**
* Returns the northeast corner of the bounding box.
*
* @returns {LngLat} The northeast corner of the bounding box.
 */
LngLatBounds.prototype.getNorthEast = function getNorthEast () { return this._ne; };

/**
* Returns the northwest corner of the bounding box.
*
* @returns {LngLat} The northwest corner of the bounding box.
 */
LngLatBounds.prototype.getNorthWest = function getNorthWest () { return new LngLat(this.getWest(), this.getNorth()); };

/**
* Returns the southeast corner of the bounding box.
*
* @returns {LngLat} The southeast corner of the bounding box.
 */
LngLatBounds.prototype.getSouthEast = function getSouthEast () { return new LngLat(this.getEast(), this.getSouth()); };

/**
* Returns the west edge of the bounding box.
*
* @returns {number} The west edge of the bounding box.
 */
LngLatBounds.prototype.getWest = function getWest () { return this._sw.lng; };

/**
* Returns the south edge of the bounding box.
*
* @returns {number} The south edge of the bounding box.
 */
LngLatBounds.prototype.getSouth = function getSouth () { return this._sw.lat; };

/**
* Returns the east edge of the bounding box.
*
* @returns {number} The east edge of the bounding box.
 */
LngLatBounds.prototype.getEast = function getEast () { return this._ne.lng; };

/**
* Returns the north edge of the bounding box.
*
* @returns {number} The north edge of the bounding box.
 */
LngLatBounds.prototype.getNorth = function getNorth () { return this._ne.lat; };

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
LngLatBounds.convert = function (input) {
    if (!input || input instanceof LngLatBounds) { return input; }
    return new LngLatBounds(input);
};

module.exports = LngLatBounds;

},{"./lng_lat":5}],7:[function(require,module,exports){
'use strict';

var LngLatBounds = require('../geo/lng_lat_bounds');
var clamp = require('../util/util').clamp;

var TileBounds = function TileBounds(bounds, minzoom, maxzoom) {
    this.bounds = LngLatBounds.convert(bounds);
    this.minzoom = minzoom || 0;
    this.maxzoom = maxzoom || 24;
};

TileBounds.prototype.contains = function contains (coord, maxzoom) {
    // TileCoord returns incorrect z for overscaled tiles, so we use this
    // to make sure overzoomed tiles still get displayed.
    var tileZ = maxzoom ? Math.min(coord.z, maxzoom) : coord.z;

    var level = {
        minX: Math.floor(this.lngX(this.bounds.getWest(), tileZ)),
        minY: Math.floor(this.latY(this.bounds.getNorth(), tileZ)),
        maxX: Math.ceil(this.lngX(this.bounds.getEast(), tileZ)),
        maxY: Math.ceil(this.latY(this.bounds.getSouth(), tileZ))
    };
    var hit = coord.x >= level.minX && coord.x < level.maxX && coord.y >= level.minY && coord.y < level.maxY;
    return hit;
};

TileBounds.prototype.lngX = function lngX (lng, zoom) {
    return (lng + 180) * (Math.pow(2, zoom) / 360);
};

TileBounds.prototype.latY = function latY (lat, zoom) {
    var f = clamp(Math.sin(Math.PI / 180 * lat), -0.9999, 0.9999);
    var scale = Math.pow(2, zoom) / (2 * Math.PI);
    return Math.pow(2, zoom - 1) + 0.5 * Math.log((1 + f) / (1 - f)) * -scale;
};

module.exports = TileBounds;

},{"../geo/lng_lat_bounds":6,"../util/util":12}],8:[function(require,module,exports){
'use strict';

var window = require('./window');

var AJAXError = (function (Error) {
    function AJAXError(message, status) {
        Error.call(this, message);
        this.status = status;
    }

    if ( Error ) AJAXError.__proto__ = Error;
    AJAXError.prototype = Object.create( Error && Error.prototype );
    AJAXError.prototype.constructor = AJAXError;

    return AJAXError;
}(Error));

exports.getJSON = function(url, callback) {
    var xhr = new window.XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.onerror = function(e) {
        callback(e);
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

exports.getArrayBuffer = function(url, callback) {
    var xhr = new window.XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onerror = function(e) {
        callback(e);
    };
    xhr.onload = function() {
        if (xhr.response.byteLength === 0 && xhr.status === 200) {
            return callback(new Error('http status 200 returned without content.'));
        }
        if (xhr.status >= 200 && xhr.status < 300 && xhr.response) {
            callback(null, {
                data: xhr.response,
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
    var a = window.document.createElement('a');
    a.href = url;
    return a.protocol === window.document.location.protocol && a.host === window.document.location.host;
}

var transparentPngUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII=';

exports.getImage = function(url, callback) {
    // request the image with XHR to work around caching issues
    // see https://github.com/mapbox/mapbox-gl-js/issues/1470
    return exports.getArrayBuffer(url, function (err, imgData) {
        if (err) { return callback(err); }
        var img = new window.Image();
        var URL = window.URL || window.webkitURL;
        img.onload = function () {
            callback(null, img);
            URL.revokeObjectURL(img.src);
        };
        var blob = new window.Blob([new Uint8Array(imgData.data)], { type: 'image/png' });
        img.cacheControl = imgData.cacheControl;
        img.expires = imgData.expires;
        img.src = imgData.data.byteLength ? URL.createObjectURL(blob) : transparentPngUrl;
    });
};

exports.getVideo = function(urls, callback) {
    var video = window.document.createElement('video');
    video.onloadstart = function() {
        callback(null, video);
    };
    for (var i = 0; i < urls.length; i++) {
        var s = window.document.createElement('source');
        if (!sameOrigin(urls[i])) {
            video.crossOrigin = 'Anonymous';
        }
        s.src = urls[i];
        video.appendChild(s);
    }
    return video;
};

},{"./window":10}],9:[function(require,module,exports){
'use strict';

/**
 * @module browser
 * @private
 */

var window = require('./window');

/**
 * Provides a function that outputs milliseconds: either performance.now()
 * or a fallback to Date.now()
 */
module.exports.now = (function() {
    if (window.performance &&
        window.performance.now) {
        return window.performance.now.bind(window.performance);
    } else {
        return Date.now.bind(Date);
    }
}());

var frame = window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame;

exports.frame = function(fn) {
    return frame(fn);
};

var cancel = window.cancelAnimationFrame ||
    window.mozCancelAnimationFrame ||
    window.webkitCancelAnimationFrame ||
    window.msCancelAnimationFrame;

exports.cancelFrame = function(id) {
    cancel(id);
};

exports.timed = function (fn, dur, ctx) {
    if (!dur) {
        fn.call(ctx, 1);
        return null;
    }

    var abort = false;
    var start = module.exports.now();

    function tick(now) {
        if (abort) { return; }
        now = module.exports.now();

        if (now >= start + dur) {
            fn.call(ctx, 1);
        } else {
            fn.call(ctx, (now - start) / dur);
            exports.frame(tick);
        }
    }

    exports.frame(tick);

    return function() { abort = true; };
};

exports.getImageData = function (img) {
    var canvas = window.document.createElement('canvas');
    var context = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0, img.width, img.height);
    return context.getImageData(0, 0, img.width, img.height).data;
};

/**
 * Test if the current browser supports Mapbox GL JS
 * @param {Object} options
 * @param {boolean} [options.failIfMajorPerformanceCaveat=false] Return `false`
 *   if the performance of Mapbox GL JS would be dramatically worse than
 *   expected (i.e. a software renderer would be used)
 * @return {boolean}
 */
exports.supported = require('mapbox-gl-supported');

exports.hardwareConcurrency = window.navigator.hardwareConcurrency || 4;

Object.defineProperty(exports, 'devicePixelRatio', {
    get: function() { return window.devicePixelRatio; }
});

exports.supportsWebp = false;

var webpImgTest = window.document.createElement('img');
webpImgTest.onload = function() {
    exports.supportsWebp = true;
};
webpImgTest.src = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAQAAAAfQ//73v/+BiOh/AAA=';

},{"./window":10,"mapbox-gl-supported":3}],10:[function(require,module,exports){
'use strict';

/* eslint-env browser */
module.exports = self;

},{}],11:[function(require,module,exports){
'use strict';

var util = require('./util');

function _addEventListener(type, listener, listenerList) {
    listenerList[type] = listenerList[type] || [];
    listenerList[type].push(listener);
}

function _removeEventListener(type, listener, listenerList) {
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

Evented.prototype.on = function on (type, listener) {
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
Evented.prototype.off = function off (type, listener) {
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
Evented.prototype.once = function once (type, listener) {
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
Evented.prototype.fire = function fire (type, data) {
        var this$1 = this;

    if (this.listens(type)) {
        data = util.extend({}, data, {type: type, target: this});

        // make sure adding or removing listeners inside other listeners won't cause an infinite loop
        var listeners = this._listeners && this._listeners[type] ? this._listeners[type].slice() : [];

        for (var i = 0; i < listeners.length; i++) {
            listeners[i].call(this$1, data);
        }

        var oneTimeListeners = this._oneTimeListeners && this._oneTimeListeners[type] ? this._oneTimeListeners[type].slice() : [];

        for (var i$1 = 0; i$1 < oneTimeListeners.length; i$1++) {
            oneTimeListeners[i$1].call(this$1, data);
            _removeEventListener(type, oneTimeListeners[i$1], this$1._oneTimeListeners);
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
Evented.prototype.listens = function listens (type) {
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
 * @param {parent}
 * @param {data}
 * @returns {Object} `this`
 */
Evented.prototype.setEventedParent = function setEventedParent (parent, data) {
    this._eventedParent = parent;
    this._eventedParentData = data;

    return this;
};

module.exports = Evented;

},{"./util":12}],12:[function(require,module,exports){
'use strict';
//      

var UnitBezier = require('@mapbox/unitbezier');
var Coordinate = require('../geo/coordinate');
var Point = require('point-geometry');

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
exports.asyncAll = function (array            , fn          , callback          ) {
    if (!array.length) { return callback(null, []); }
    var remaining = array.length;
    var results = new Array(array.length);
    var error = null;
    array.forEach(function (item, i) {
        fn(item, function (err, result) {
            if (err) { error = err; }
            results[i] = result;
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
exports.values = function (obj        )                {
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
exports.keysDifference = function (obj        , other        )                {
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
 * @param {...Object} sources sources from which properties are pulled
 * @private
 */
// eslint-disable-next-line no-unused-vars
exports.extend = function (dest        , source0        , source1         , source2         )         {
    var arguments$1 = arguments;

    for (var i = 1; i < arguments.length; i++) {
        var src = arguments$1[i];
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
exports.arraysIntersect = function(a            , b            )          {
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
var warnOnceHistory = {};
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

exports.sphericalToCartesian = function(spherical               )                {
    var r = spherical[0];
    var azimuthal = spherical[1],
        polar = spherical[2];
    // We abstract "north"/"up" (compass-wise) to be 0° when really this is 90° (π/2):
    // correct for that here
    azimuthal += 90;

    // Convert azimuthal and polar angles to radians
    azimuthal *= Math.PI / 180;
    polar *= Math.PI / 180;

    // spherical to cartesian (x, y, z)
    return [
        r * Math.cos(azimuthal) * Math.sin(polar),
        r * Math.sin(azimuthal) * Math.sin(polar),
        r * Math.cos(polar)
    ];
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

},{"../geo/coordinate":4,"@mapbox/unitbezier":2,"point-geometry":13}],13:[function(require,module,exports){
'use strict';

module.exports = Point;

function Point(x, y) {
    this.x = x;
    this.y = y;
}

Point.prototype = {
    clone: function() { return new Point(this.x, this.y); },

    add:     function(p) { return this.clone()._add(p);     },
    sub:     function(p) { return this.clone()._sub(p);     },
    mult:    function(k) { return this.clone()._mult(k);    },
    div:     function(k) { return this.clone()._div(k);     },
    rotate:  function(a) { return this.clone()._rotate(a);  },
    matMult: function(m) { return this.clone()._matMult(m); },
    unit:    function() { return this.clone()._unit(); },
    perp:    function() { return this.clone()._perp(); },
    round:   function() { return this.clone()._round(); },

    mag: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },

    equals: function(p) {
        return this.x === p.x &&
               this.y === p.y;
    },

    dist: function(p) {
        return Math.sqrt(this.distSqr(p));
    },

    distSqr: function(p) {
        var dx = p.x - this.x,
            dy = p.y - this.y;
        return dx * dx + dy * dy;
    },

    angle: function() {
        return Math.atan2(this.y, this.x);
    },

    angleTo: function(b) {
        return Math.atan2(this.y - b.y, this.x - b.x);
    },

    angleWith: function(b) {
        return this.angleWithSep(b.x, b.y);
    },

    // Find the angle of the two vectors, solving the formula for the cross product a x b = |a||b|sin(θ) for θ.
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

    _round: function() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
    }
};

// constructs Point from an array if necessary
Point.convert = function (a) {
    if (a instanceof Point) {
        return a;
    }
    if (Array.isArray(a)) {
        return new Point(a[0], a[1]);
    }
    return a;
};

},{}],14:[function(require,module,exports){
'use strict';

var util = require('mapbox-gl/src/util/util');
var ajax = require('mapbox-gl/src/util/ajax');
var Evented = require('mapbox-gl/src/util/evented');
var loadArcGISMapServer = require('./load_arcgis_mapserver');
var TileBounds = require('mapbox-gl/src/source/tile_bounds');

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

var ArcGISTiledMapServiceSource = (function (Evented) {
    function ArcGISTiledMapServiceSource(id, options, dispatcher, eventedParent) {
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
        this.options = options;
        util.extend(this, util.pick(options, ['url', 'scheme', 'tileSize']));
    }

    if ( Evented ) ArcGISTiledMapServiceSource.__proto__ = Evented;
    ArcGISTiledMapServiceSource.prototype = Object.create( Evented && Evented.prototype );
    ArcGISTiledMapServiceSource.prototype.constructor = ArcGISTiledMapServiceSource;

    ArcGISTiledMapServiceSource.prototype.load = function load () {
        var this$1 = this;

        this.fire('dataloading', {dataType: 'source'});
        loadArcGISMapServer(this.options, function (err, metadata) {
            if (err) {
                return this$1.fire('error', err);
            }
            util.extend(this$1, metadata);
            this$1.setBounds(metadata.bounds);

            // `content` is included here to prevent a race condition where `Style#_updateSources` is called
            // before the TileJSON arrives. this makes sure the tiles needed are loaded once TileJSON arrives
            // ref: https://github.com/mapbox/mapbox-gl-js/pull/4347#discussion_r104418088
            this$1.fire('data', {dataType: 'source', sourceDataType: 'metadata'});
            this$1.fire('data', {dataType: 'source', sourceDataType: 'content'});

        });
    };

    ArcGISTiledMapServiceSource.prototype.onAdd = function onAdd (map) {
        // set the urls
        var baseUrl = this.url.split('?')[0];
        this.tileUrl = baseUrl + " /tile/{z}/{y}/{x}";

        var arcgisonline = new RegExp(/tiles.arcgis(online)?\.com/g);
        if (arcgisonline.test(this.url)) {
            this.tileUrl = this.tileUrl.replace('://tiles', '://tiles{s}');
            this.subdomains = ['1', '2', '3', '4'];
        }

        if (this.token) {
            this.tileUrl += (("?token=" + (this.token)));
        }
        this.load();
        this.map = map;
    };

    ArcGISTiledMapServiceSource.prototype.setBounds = function setBounds (bounds) {
        this.bounds = bounds;
        if (bounds) {
            this.tileBounds = new TileBounds(bounds, this.minzoom, this.maxzoom);
        }
    };

    ArcGISTiledMapServiceSource.prototype.serialize = function serialize () {
        return {
            type: 'arcgisraster',
            url: this.url,
            tileSize: this.tileSize,
            tiles: this.tiles,
            bounds: this.bounds,
        };
    };

    ArcGISTiledMapServiceSource.prototype.hasTile = function hasTile (coord) {
        return !this.tileBounds || this.tileBounds.contains(coord, this.maxzoom);
    };

    ArcGISTiledMapServiceSource.prototype.loadTile = function loadTile (tile, callback) {
        //convert to ags coords
        var tilePoint = tile.coord;
        var url =  _template(this.tileUrl, util.extend({
            s: _getSubdomain(tilePoint, this.subdomains),
            z: (this._lodMap && this._lodMap[tilePoint.z]) ? this._lodMap[tilePoint.z] : tilePoint.z, // try lod map first, then just defualt to zoom level
            x: tilePoint.x,
            y: tilePoint.y
        }, this.options));
        tile.request = ajax.getImage(url, done.bind(this));

        function done(err, img) {
            delete tile.request;

            if (tile.aborted) {
                this.state = 'unloaded';
                return callback(null);
            }

            if (err) {
                this.state = 'errored';
                return callback(err);
            }

            if (this.map._refreshExpiredTiles) { tile.setExpiryData(img); }
            delete img.cacheControl;
            delete img.expires;

            var gl = this.map.painter.gl;
            tile.texture = this.map.painter.getTileTexture(img.width);
            if (tile.texture) {
                gl.bindTexture(gl.TEXTURE_2D, tile.texture);
                gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, img);
            } else {
                tile.texture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, tile.texture);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

                if (this.map.painter.extTextureFilterAnisotropic) {
                    gl.texParameterf(gl.TEXTURE_2D, this.map.painter.extTextureFilterAnisotropic.TEXTURE_MAX_ANISOTROPY_EXT, this.map.painter.extTextureFilterAnisotropicMax);
                }

                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
                tile.texture.size = img.width;
            }
            gl.generateMipmap(gl.TEXTURE_2D);

            tile.state = 'loaded';

            callback(null);
        }
    };

    ArcGISTiledMapServiceSource.prototype.abortTile = function abortTile (tile) {
        if (tile.request) {
            tile.request.abort();
            delete tile.request;
        }
    };

    ArcGISTiledMapServiceSource.prototype.unloadTile = function unloadTile (tile) {
        if (tile.texture) { this.map.painter.saveTileTexture(tile.texture); }
    };

    return ArcGISTiledMapServiceSource;
}(Evented));

module.exports = ArcGISTiledMapServiceSource;

},{"./load_arcgis_mapserver":16,"mapbox-gl/src/source/tile_bounds":7,"mapbox-gl/src/util/ajax":8,"mapbox-gl/src/util/evented":11,"mapbox-gl/src/util/util":12}],15:[function(require,module,exports){
var ArcGISTiledMapServiceSource = require('./arcgis_tiled_map_service_source');
module.exports = ArcGISTiledMapServiceSource;

},{"./arcgis_tiled_map_service_source":14}],16:[function(require,module,exports){
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
        ajax.getJSON(options.url, loaded);
    } else {
        browser.frame(loaded.bind(null, null, options));
    }
};

},{"@mapbox/sphericalmercator":1,"mapbox-gl/src/util/ajax":8,"mapbox-gl/src/util/browser":9,"mapbox-gl/src/util/util":12}]},{},[15])(15)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvQG1hcGJveC9zcGhlcmljYWxtZXJjYXRvci9zcGhlcmljYWxtZXJjYXRvci5qcyIsIm5vZGVfbW9kdWxlcy9AbWFwYm94L3VuaXRiZXppZXIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbWFwYm94LWdsLXN1cHBvcnRlZC9pbmRleC5qcyIsIi9Vc2Vycy9rcmlzL2Rldi9tYXBodWJzL21hcGJveC1nbC1hcmNnaXMtdGlsZWQtbWFwLXNlcnZpY2Uvbm9kZV9tb2R1bGVzL21hcGJveC1nbC9zcmMvZ2VvL2Nvb3JkaW5hdGUuanMiLCIvVXNlcnMva3Jpcy9kZXYvbWFwaHVicy9tYXBib3gtZ2wtYXJjZ2lzLXRpbGVkLW1hcC1zZXJ2aWNlL25vZGVfbW9kdWxlcy9tYXBib3gtZ2wvc3JjL2dlby9sbmdfbGF0LmpzIiwiL1VzZXJzL2tyaXMvZGV2L21hcGh1YnMvbWFwYm94LWdsLWFyY2dpcy10aWxlZC1tYXAtc2VydmljZS9ub2RlX21vZHVsZXMvbWFwYm94LWdsL3NyYy9nZW8vbG5nX2xhdF9ib3VuZHMuanMiLCIvVXNlcnMva3Jpcy9kZXYvbWFwaHVicy9tYXBib3gtZ2wtYXJjZ2lzLXRpbGVkLW1hcC1zZXJ2aWNlL25vZGVfbW9kdWxlcy9tYXBib3gtZ2wvc3JjL3NvdXJjZS90aWxlX2JvdW5kcy5qcyIsIi9Vc2Vycy9rcmlzL2Rldi9tYXBodWJzL21hcGJveC1nbC1hcmNnaXMtdGlsZWQtbWFwLXNlcnZpY2Uvbm9kZV9tb2R1bGVzL21hcGJveC1nbC9zcmMvdXRpbC9hamF4LmpzIiwiL1VzZXJzL2tyaXMvZGV2L21hcGh1YnMvbWFwYm94LWdsLWFyY2dpcy10aWxlZC1tYXAtc2VydmljZS9ub2RlX21vZHVsZXMvbWFwYm94LWdsL3NyYy91dGlsL2Jyb3dzZXIuanMiLCIvVXNlcnMva3Jpcy9kZXYvbWFwaHVicy9tYXBib3gtZ2wtYXJjZ2lzLXRpbGVkLW1hcC1zZXJ2aWNlL25vZGVfbW9kdWxlcy9tYXBib3gtZ2wvc3JjL3V0aWwvYnJvd3Nlci93aW5kb3cuanMiLCIvVXNlcnMva3Jpcy9kZXYvbWFwaHVicy9tYXBib3gtZ2wtYXJjZ2lzLXRpbGVkLW1hcC1zZXJ2aWNlL25vZGVfbW9kdWxlcy9tYXBib3gtZ2wvc3JjL3V0aWwvZXZlbnRlZC5qcyIsIi9Vc2Vycy9rcmlzL2Rldi9tYXBodWJzL21hcGJveC1nbC1hcmNnaXMtdGlsZWQtbWFwLXNlcnZpY2Uvbm9kZV9tb2R1bGVzL21hcGJveC1nbC9zcmMvdXRpbC91dGlsLmpzIiwibm9kZV9tb2R1bGVzL3BvaW50LWdlb21ldHJ5L2luZGV4LmpzIiwiL1VzZXJzL2tyaXMvZGV2L21hcGh1YnMvbWFwYm94LWdsLWFyY2dpcy10aWxlZC1tYXAtc2VydmljZS9zcmMvYXJjZ2lzX3RpbGVkX21hcF9zZXJ2aWNlX3NvdXJjZS5qcyIsIi9Vc2Vycy9rcmlzL2Rldi9tYXBodWJzL21hcGJveC1nbC1hcmNnaXMtdGlsZWQtbWFwLXNlcnZpY2Uvc3JjL2luZGV4LmpzIiwiL1VzZXJzL2tyaXMvZGV2L21hcGh1YnMvbWFwYm94LWdsLWFyY2dpcy10aWxlZC1tYXAtc2VydmljZS9zcmMvbG9hZF9hcmNnaXNfbWFwc2VydmVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pJQSxZQUFZLENBQUM7Ozs7Ozs7Ozs7OztBQVliLElBQU0sVUFBVSxHQUFDLEFBSWpCLEFB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R0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdkMsQUFBSSxFQUFFLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdkMsQUFBSSxFQUFFLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdkMsQUFBSSxFQUFFLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDM0MsQUFBSSxDQUFDOztJQUVMLEFBQUksT0FBTyxJQUFJLENBQUM7QUFDcEIsQUFBSSxDQUFDLENBQUE7O0FBRUwsQUFBSTtDQUNILEFBQUk7Q0FDSixBQUFJO0NBQ0osQUFBSTtDQUNKLEFBQUk7Q0FDSixBQUFJO0NBQ0osQUFBSTtDQUNKLEFBQUk7QUFDTCxBQUFJLHVCQUFBLFNBQVMsc0JBQUEsR0FBRztJQUNaLEFBQUksT0FBTyxJQUFJLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNoRyxBQUFJLENBQUMsQ0FBQTs7QUFFTCxBQUFJO0NBQ0gsQUFBSTtDQUNKLEFBQUk7Q0FDSixBQUFJO0NBQ0osQUFBSTtBQUNMLEFBQUksdUJBQUEsWUFBWSx5QkFBQSxHQUFHLEVBQUUsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQTs7QUFFdkMsQUFBSTtBQUNKLEFBQUk7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QzFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQzt3QkFDckMsTUFBTTtxQkFDVDtpQkFDSjthQUNKO1NBQ0osTUFBTTtZQUNILFFBQVEsQ0FBQyxJQUFJLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDLENBQUM7U0FDekQ7O1FBRUQsUUFBUSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztLQUMxQixDQUFDOztJQUVGLElBQUksT0FBTyxDQUFDLEdBQUcsRUFBRTtRQUNiLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQztLQUNyQyxNQUFNO1FBQ0gsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztLQUNuRDtDQUNKLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIFNwaGVyaWNhbE1lcmNhdG9yID0gKGZ1bmN0aW9uKCl7XG5cbi8vIENsb3N1cmVzIGluY2x1ZGluZyBjb25zdGFudHMgYW5kIG90aGVyIHByZWNhbGN1bGF0ZWQgdmFsdWVzLlxudmFyIGNhY2hlID0ge30sXG4gICAgRVBTTE4gPSAxLjBlLTEwLFxuICAgIEQyUiA9IE1hdGguUEkgLyAxODAsXG4gICAgUjJEID0gMTgwIC8gTWF0aC5QSSxcbiAgICAvLyA5MDA5MTMgcHJvcGVydGllcy5cbiAgICBBID0gNjM3ODEzNy4wLFxuICAgIE1BWEVYVEVOVCA9IDIwMDM3NTA4LjM0Mjc4OTI0NDtcblxuXG4vLyBTcGhlcmljYWxNZXJjYXRvciBjb25zdHJ1Y3RvcjogcHJlY2FjaGVzIGNhbGN1bGF0aW9uc1xuLy8gZm9yIGZhc3QgdGlsZSBsb29rdXBzLlxuZnVuY3Rpb24gU3BoZXJpY2FsTWVyY2F0b3Iob3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHRoaXMuc2l6ZSA9IG9wdGlvbnMuc2l6ZSB8fCAyNTY7XG4gICAgaWYgKCFjYWNoZVt0aGlzLnNpemVdKSB7XG4gICAgICAgIHZhciBzaXplID0gdGhpcy5zaXplO1xuICAgICAgICB2YXIgYyA9IGNhY2hlW3RoaXMuc2l6ZV0gPSB7fTtcbiAgICAgICAgYy5CYyA9IFtdO1xuICAgICAgICBjLkNjID0gW107XG4gICAgICAgIGMuemMgPSBbXTtcbiAgICAgICAgYy5BYyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBkID0gMDsgZCA8IDMwOyBkKyspIHtcbiAgICAgICAgICAgIGMuQmMucHVzaChzaXplIC8gMzYwKTtcbiAgICAgICAgICAgIGMuQ2MucHVzaChzaXplIC8gKDIgKiBNYXRoLlBJKSk7XG4gICAgICAgICAgICBjLnpjLnB1c2goc2l6ZSAvIDIpO1xuICAgICAgICAgICAgYy5BYy5wdXNoKHNpemUpO1xuICAgICAgICAgICAgc2l6ZSAqPSAyO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRoaXMuQmMgPSBjYWNoZVt0aGlzLnNpemVdLkJjO1xuICAgIHRoaXMuQ2MgPSBjYWNoZVt0aGlzLnNpemVdLkNjO1xuICAgIHRoaXMuemMgPSBjYWNoZVt0aGlzLnNpemVdLnpjO1xuICAgIHRoaXMuQWMgPSBjYWNoZVt0aGlzLnNpemVdLkFjO1xufTtcblxuLy8gQ29udmVydCBsb24gbGF0IHRvIHNjcmVlbiBwaXhlbCB2YWx1ZVxuLy9cbi8vIC0gYGxsYCB7QXJyYXl9IGBbbG9uLCBsYXRdYCBhcnJheSBvZiBnZW9ncmFwaGljIGNvb3JkaW5hdGVzLlxuLy8gLSBgem9vbWAge051bWJlcn0gem9vbSBsZXZlbC5cblNwaGVyaWNhbE1lcmNhdG9yLnByb3RvdHlwZS5weCA9IGZ1bmN0aW9uKGxsLCB6b29tKSB7XG4gICAgdmFyIGQgPSB0aGlzLnpjW3pvb21dO1xuICAgIHZhciBmID0gTWF0aC5taW4oTWF0aC5tYXgoTWF0aC5zaW4oRDJSICogbGxbMV0pLCAtMC45OTk5KSwgMC45OTk5KTtcbiAgICB2YXIgeCA9IE1hdGgucm91bmQoZCArIGxsWzBdICogdGhpcy5CY1t6b29tXSk7XG4gICAgdmFyIHkgPSBNYXRoLnJvdW5kKGQgKyAwLjUgKiBNYXRoLmxvZygoMSArIGYpIC8gKDEgLSBmKSkgKiAoLXRoaXMuQ2Nbem9vbV0pKTtcbiAgICAoeCA+IHRoaXMuQWNbem9vbV0pICYmICh4ID0gdGhpcy5BY1t6b29tXSk7XG4gICAgKHkgPiB0aGlzLkFjW3pvb21dKSAmJiAoeSA9IHRoaXMuQWNbem9vbV0pO1xuICAgIC8vKHggPCAwKSAmJiAoeCA9IDApO1xuICAgIC8vKHkgPCAwKSAmJiAoeSA9IDApO1xuICAgIHJldHVybiBbeCwgeV07XG59O1xuXG4vLyBDb252ZXJ0IHNjcmVlbiBwaXhlbCB2YWx1ZSB0byBsb24gbGF0XG4vL1xuLy8gLSBgcHhgIHtBcnJheX0gYFt4LCB5XWAgYXJyYXkgb2YgZ2VvZ3JhcGhpYyBjb29yZGluYXRlcy5cbi8vIC0gYHpvb21gIHtOdW1iZXJ9IHpvb20gbGV2ZWwuXG5TcGhlcmljYWxNZXJjYXRvci5wcm90b3R5cGUubGwgPSBmdW5jdGlvbihweCwgem9vbSkge1xuICAgIHZhciBnID0gKHB4WzFdIC0gdGhpcy56Y1t6b29tXSkgLyAoLXRoaXMuQ2Nbem9vbV0pO1xuICAgIHZhciBsb24gPSAocHhbMF0gLSB0aGlzLnpjW3pvb21dKSAvIHRoaXMuQmNbem9vbV07XG4gICAgdmFyIGxhdCA9IFIyRCAqICgyICogTWF0aC5hdGFuKE1hdGguZXhwKGcpKSAtIDAuNSAqIE1hdGguUEkpO1xuICAgIHJldHVybiBbbG9uLCBsYXRdO1xufTtcblxuLy8gQ29udmVydCB0aWxlIHh5eiB2YWx1ZSB0byBiYm94IG9mIHRoZSBmb3JtIGBbdywgcywgZSwgbl1gXG4vL1xuLy8gLSBgeGAge051bWJlcn0geCAobG9uZ2l0dWRlKSBudW1iZXIuXG4vLyAtIGB5YCB7TnVtYmVyfSB5IChsYXRpdHVkZSkgbnVtYmVyLlxuLy8gLSBgem9vbWAge051bWJlcn0gem9vbS5cbi8vIC0gYHRtc19zdHlsZWAge0Jvb2xlYW59IHdoZXRoZXIgdG8gY29tcHV0ZSB1c2luZyB0bXMtc3R5bGUuXG4vLyAtIGBzcnNgIHtTdHJpbmd9IHByb2plY3Rpb24gZm9yIHJlc3VsdGluZyBiYm94IChXR1M4NHw5MDA5MTMpLlxuLy8gLSBgcmV0dXJuYCB7QXJyYXl9IGJib3ggYXJyYXkgb2YgdmFsdWVzIGluIGZvcm0gYFt3LCBzLCBlLCBuXWAuXG5TcGhlcmljYWxNZXJjYXRvci5wcm90b3R5cGUuYmJveCA9IGZ1bmN0aW9uKHgsIHksIHpvb20sIHRtc19zdHlsZSwgc3JzKSB7XG4gICAgLy8gQ29udmVydCB4eXogaW50byBiYm94IHdpdGggc3JzIFdHUzg0XG4gICAgaWYgKHRtc19zdHlsZSkge1xuICAgICAgICB5ID0gKE1hdGgucG93KDIsIHpvb20pIC0gMSkgLSB5O1xuICAgIH1cbiAgICAvLyBVc2UgK3kgdG8gbWFrZSBzdXJlIGl0J3MgYSBudW1iZXIgdG8gYXZvaWQgaW5hZHZlcnRlbnQgY29uY2F0ZW5hdGlvbi5cbiAgICB2YXIgbGwgPSBbeCAqIHRoaXMuc2l6ZSwgKCt5ICsgMSkgKiB0aGlzLnNpemVdOyAvLyBsb3dlciBsZWZ0XG4gICAgLy8gVXNlICt4IHRvIG1ha2Ugc3VyZSBpdCdzIGEgbnVtYmVyIHRvIGF2b2lkIGluYWR2ZXJ0ZW50IGNvbmNhdGVuYXRpb24uXG4gICAgdmFyIHVyID0gWygreCArIDEpICogdGhpcy5zaXplLCB5ICogdGhpcy5zaXplXTsgLy8gdXBwZXIgcmlnaHRcbiAgICB2YXIgYmJveCA9IHRoaXMubGwobGwsIHpvb20pLmNvbmNhdCh0aGlzLmxsKHVyLCB6b29tKSk7XG5cbiAgICAvLyBJZiB3ZWIgbWVyY2F0b3IgcmVxdWVzdGVkIHJlcHJvamVjdCB0byA5MDA5MTMuXG4gICAgaWYgKHNycyA9PT0gJzkwMDkxMycpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udmVydChiYm94LCAnOTAwOTEzJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGJib3g7XG4gICAgfVxufTtcblxuLy8gQ29udmVydCBiYm94IHRvIHh5eCBib3VuZHNcbi8vXG4vLyAtIGBiYm94YCB7TnVtYmVyfSBiYm94IGluIHRoZSBmb3JtIGBbdywgcywgZSwgbl1gLlxuLy8gLSBgem9vbWAge051bWJlcn0gem9vbS5cbi8vIC0gYHRtc19zdHlsZWAge0Jvb2xlYW59IHdoZXRoZXIgdG8gY29tcHV0ZSB1c2luZyB0bXMtc3R5bGUuXG4vLyAtIGBzcnNgIHtTdHJpbmd9IHByb2plY3Rpb24gb2YgaW5wdXQgYmJveCAoV0dTODR8OTAwOTEzKS5cbi8vIC0gYEByZXR1cm5gIHtPYmplY3R9IFhZWiBib3VuZHMgY29udGFpbmluZyBtaW5YLCBtYXhYLCBtaW5ZLCBtYXhZIHByb3BlcnRpZXMuXG5TcGhlcmljYWxNZXJjYXRvci5wcm90b3R5cGUueHl6ID0gZnVuY3Rpb24oYmJveCwgem9vbSwgdG1zX3N0eWxlLCBzcnMpIHtcbiAgICAvLyBJZiB3ZWIgbWVyY2F0b3IgcHJvdmlkZWQgcmVwcm9qZWN0IHRvIFdHUzg0LlxuICAgIGlmIChzcnMgPT09ICc5MDA5MTMnKSB7XG4gICAgICAgIGJib3ggPSB0aGlzLmNvbnZlcnQoYmJveCwgJ1dHUzg0Jyk7XG4gICAgfVxuXG4gICAgdmFyIGxsID0gW2Jib3hbMF0sIGJib3hbMV1dOyAvLyBsb3dlciBsZWZ0XG4gICAgdmFyIHVyID0gW2Jib3hbMl0sIGJib3hbM11dOyAvLyB1cHBlciByaWdodFxuICAgIHZhciBweF9sbCA9IHRoaXMucHgobGwsIHpvb20pO1xuICAgIHZhciBweF91ciA9IHRoaXMucHgodXIsIHpvb20pO1xuICAgIC8vIFkgPSAwIGZvciBYWVogaXMgdGhlIHRvcCBoZW5jZSBtaW5ZIHVzZXMgcHhfdXJbMV0uXG4gICAgdmFyIHggPSBbIE1hdGguZmxvb3IocHhfbGxbMF0gLyB0aGlzLnNpemUpLCBNYXRoLmZsb29yKChweF91clswXSAtIDEpIC8gdGhpcy5zaXplKSBdO1xuICAgIHZhciB5ID0gWyBNYXRoLmZsb29yKHB4X3VyWzFdIC8gdGhpcy5zaXplKSwgTWF0aC5mbG9vcigocHhfbGxbMV0gLSAxKSAvIHRoaXMuc2l6ZSkgXTtcbiAgICB2YXIgYm91bmRzID0ge1xuICAgICAgICBtaW5YOiBNYXRoLm1pbi5hcHBseShNYXRoLCB4KSA8IDAgPyAwIDogTWF0aC5taW4uYXBwbHkoTWF0aCwgeCksXG4gICAgICAgIG1pblk6IE1hdGgubWluLmFwcGx5KE1hdGgsIHkpIDwgMCA/IDAgOiBNYXRoLm1pbi5hcHBseShNYXRoLCB5KSxcbiAgICAgICAgbWF4WDogTWF0aC5tYXguYXBwbHkoTWF0aCwgeCksXG4gICAgICAgIG1heFk6IE1hdGgubWF4LmFwcGx5KE1hdGgsIHkpXG4gICAgfTtcbiAgICBpZiAodG1zX3N0eWxlKSB7XG4gICAgICAgIHZhciB0bXMgPSB7XG4gICAgICAgICAgICBtaW5ZOiAoTWF0aC5wb3coMiwgem9vbSkgLSAxKSAtIGJvdW5kcy5tYXhZLFxuICAgICAgICAgICAgbWF4WTogKE1hdGgucG93KDIsIHpvb20pIC0gMSkgLSBib3VuZHMubWluWVxuICAgICAgICB9O1xuICAgICAgICBib3VuZHMubWluWSA9IHRtcy5taW5ZO1xuICAgICAgICBib3VuZHMubWF4WSA9IHRtcy5tYXhZO1xuICAgIH1cbiAgICByZXR1cm4gYm91bmRzO1xufTtcblxuLy8gQ29udmVydCBwcm9qZWN0aW9uIG9mIGdpdmVuIGJib3guXG4vL1xuLy8gLSBgYmJveGAge051bWJlcn0gYmJveCBpbiB0aGUgZm9ybSBgW3csIHMsIGUsIG5dYC5cbi8vIC0gYHRvYCB7U3RyaW5nfSBwcm9qZWN0aW9uIG9mIG91dHB1dCBiYm94IChXR1M4NHw5MDA5MTMpLiBJbnB1dCBiYm94XG4vLyAgIGFzc3VtZWQgdG8gYmUgdGhlIFwib3RoZXJcIiBwcm9qZWN0aW9uLlxuLy8gLSBgQHJldHVybmAge09iamVjdH0gYmJveCB3aXRoIHJlcHJvamVjdGVkIGNvb3JkaW5hdGVzLlxuU3BoZXJpY2FsTWVyY2F0b3IucHJvdG90eXBlLmNvbnZlcnQgPSBmdW5jdGlvbihiYm94LCB0bykge1xuICAgIGlmICh0byA9PT0gJzkwMDkxMycpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZm9yd2FyZChiYm94LnNsaWNlKDAsIDIpKS5jb25jYXQodGhpcy5mb3J3YXJkKGJib3guc2xpY2UoMiw0KSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLmludmVyc2UoYmJveC5zbGljZSgwLCAyKSkuY29uY2F0KHRoaXMuaW52ZXJzZShiYm94LnNsaWNlKDIsNCkpKTtcbiAgICB9XG59O1xuXG4vLyBDb252ZXJ0IGxvbi9sYXQgdmFsdWVzIHRvIDkwMDkxMyB4L3kuXG5TcGhlcmljYWxNZXJjYXRvci5wcm90b3R5cGUuZm9yd2FyZCA9IGZ1bmN0aW9uKGxsKSB7XG4gICAgdmFyIHh5ID0gW1xuICAgICAgICBBICogbGxbMF0gKiBEMlIsXG4gICAgICAgIEEgKiBNYXRoLmxvZyhNYXRoLnRhbigoTWF0aC5QSSowLjI1KSArICgwLjUgKiBsbFsxXSAqIEQyUikpKVxuICAgIF07XG4gICAgLy8gaWYgeHkgdmFsdWUgaXMgYmV5b25kIG1heGV4dGVudCAoZS5nLiBwb2xlcyksIHJldHVybiBtYXhleHRlbnQuXG4gICAgKHh5WzBdID4gTUFYRVhURU5UKSAmJiAoeHlbMF0gPSBNQVhFWFRFTlQpO1xuICAgICh4eVswXSA8IC1NQVhFWFRFTlQpICYmICh4eVswXSA9IC1NQVhFWFRFTlQpO1xuICAgICh4eVsxXSA+IE1BWEVYVEVOVCkgJiYgKHh5WzFdID0gTUFYRVhURU5UKTtcbiAgICAoeHlbMV0gPCAtTUFYRVhURU5UKSAmJiAoeHlbMV0gPSAtTUFYRVhURU5UKTtcbiAgICByZXR1cm4geHk7XG59O1xuXG4vLyBDb252ZXJ0IDkwMDkxMyB4L3kgdmFsdWVzIHRvIGxvbi9sYXQuXG5TcGhlcmljYWxNZXJjYXRvci5wcm90b3R5cGUuaW52ZXJzZSA9IGZ1bmN0aW9uKHh5KSB7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgKHh5WzBdICogUjJEIC8gQSksXG4gICAgICAgICgoTWF0aC5QSSowLjUpIC0gMi4wICogTWF0aC5hdGFuKE1hdGguZXhwKC14eVsxXSAvIEEpKSkgKiBSMkRcbiAgICBdO1xufTtcblxucmV0dXJuIFNwaGVyaWNhbE1lcmNhdG9yO1xuXG59KSgpO1xuXG5pZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gU3BoZXJpY2FsTWVyY2F0b3I7XG59XG4iLCIvKlxuICogQ29weXJpZ2h0IChDKSAyMDA4IEFwcGxlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXRcbiAqIG1vZGlmaWNhdGlvbiwgYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uc1xuICogYXJlIG1ldDpcbiAqIDEuIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0XG4gKiAgICBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gKiAyLiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodFxuICogICAgbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZVxuICogICAgZG9jdW1lbnRhdGlvbiBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cbiAqXG4gKiBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIEFQUExFIElOQy4gYGBBUyBJUycnIEFORCBBTllcbiAqIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFXG4gKiBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVJcbiAqIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuICBJTiBOTyBFVkVOVCBTSEFMTCBBUFBMRSBJTkMuIE9SXG4gKiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCxcbiAqIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIChJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTyxcbiAqIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7IExPU1MgT0YgVVNFLCBEQVRBLCBPUlxuICogUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZIFRIRU9SWVxuICogT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUXG4gKiAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0VcbiAqIE9GIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4gKlxuICogUG9ydGVkIGZyb20gV2Via2l0XG4gKiBodHRwOi8vc3ZuLndlYmtpdC5vcmcvcmVwb3NpdG9yeS93ZWJraXQvdHJ1bmsvU291cmNlL1dlYkNvcmUvcGxhdGZvcm0vZ3JhcGhpY3MvVW5pdEJlemllci5oXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBVbml0QmV6aWVyO1xuXG5mdW5jdGlvbiBVbml0QmV6aWVyKHAxeCwgcDF5LCBwMngsIHAyeSkge1xuICAgIC8vIENhbGN1bGF0ZSB0aGUgcG9seW5vbWlhbCBjb2VmZmljaWVudHMsIGltcGxpY2l0IGZpcnN0IGFuZCBsYXN0IGNvbnRyb2wgcG9pbnRzIGFyZSAoMCwwKSBhbmQgKDEsMSkuXG4gICAgdGhpcy5jeCA9IDMuMCAqIHAxeDtcbiAgICB0aGlzLmJ4ID0gMy4wICogKHAyeCAtIHAxeCkgLSB0aGlzLmN4O1xuICAgIHRoaXMuYXggPSAxLjAgLSB0aGlzLmN4IC0gdGhpcy5ieDtcblxuICAgIHRoaXMuY3kgPSAzLjAgKiBwMXk7XG4gICAgdGhpcy5ieSA9IDMuMCAqIChwMnkgLSBwMXkpIC0gdGhpcy5jeTtcbiAgICB0aGlzLmF5ID0gMS4wIC0gdGhpcy5jeSAtIHRoaXMuYnk7XG5cbiAgICB0aGlzLnAxeCA9IHAxeDtcbiAgICB0aGlzLnAxeSA9IHAyeTtcbiAgICB0aGlzLnAyeCA9IHAyeDtcbiAgICB0aGlzLnAyeSA9IHAyeTtcbn1cblxuVW5pdEJlemllci5wcm90b3R5cGUuc2FtcGxlQ3VydmVYID0gZnVuY3Rpb24odCkge1xuICAgIC8vIGBheCB0XjMgKyBieCB0XjIgKyBjeCB0JyBleHBhbmRlZCB1c2luZyBIb3JuZXIncyBydWxlLlxuICAgIHJldHVybiAoKHRoaXMuYXggKiB0ICsgdGhpcy5ieCkgKiB0ICsgdGhpcy5jeCkgKiB0O1xufTtcblxuVW5pdEJlemllci5wcm90b3R5cGUuc2FtcGxlQ3VydmVZID0gZnVuY3Rpb24odCkge1xuICAgIHJldHVybiAoKHRoaXMuYXkgKiB0ICsgdGhpcy5ieSkgKiB0ICsgdGhpcy5jeSkgKiB0O1xufTtcblxuVW5pdEJlemllci5wcm90b3R5cGUuc2FtcGxlQ3VydmVEZXJpdmF0aXZlWCA9IGZ1bmN0aW9uKHQpIHtcbiAgICByZXR1cm4gKDMuMCAqIHRoaXMuYXggKiB0ICsgMi4wICogdGhpcy5ieCkgKiB0ICsgdGhpcy5jeDtcbn07XG5cblVuaXRCZXppZXIucHJvdG90eXBlLnNvbHZlQ3VydmVYID0gZnVuY3Rpb24oeCwgZXBzaWxvbikge1xuICAgIGlmICh0eXBlb2YgZXBzaWxvbiA9PT0gJ3VuZGVmaW5lZCcpIGVwc2lsb24gPSAxZS02O1xuXG4gICAgdmFyIHQwLCB0MSwgdDIsIHgyLCBpO1xuXG4gICAgLy8gRmlyc3QgdHJ5IGEgZmV3IGl0ZXJhdGlvbnMgb2YgTmV3dG9uJ3MgbWV0aG9kIC0tIG5vcm1hbGx5IHZlcnkgZmFzdC5cbiAgICBmb3IgKHQyID0geCwgaSA9IDA7IGkgPCA4OyBpKyspIHtcblxuICAgICAgICB4MiA9IHRoaXMuc2FtcGxlQ3VydmVYKHQyKSAtIHg7XG4gICAgICAgIGlmIChNYXRoLmFicyh4MikgPCBlcHNpbG9uKSByZXR1cm4gdDI7XG5cbiAgICAgICAgdmFyIGQyID0gdGhpcy5zYW1wbGVDdXJ2ZURlcml2YXRpdmVYKHQyKTtcbiAgICAgICAgaWYgKE1hdGguYWJzKGQyKSA8IDFlLTYpIGJyZWFrO1xuXG4gICAgICAgIHQyID0gdDIgLSB4MiAvIGQyO1xuICAgIH1cblxuICAgIC8vIEZhbGwgYmFjayB0byB0aGUgYmlzZWN0aW9uIG1ldGhvZCBmb3IgcmVsaWFiaWxpdHkuXG4gICAgdDAgPSAwLjA7XG4gICAgdDEgPSAxLjA7XG4gICAgdDIgPSB4O1xuXG4gICAgaWYgKHQyIDwgdDApIHJldHVybiB0MDtcbiAgICBpZiAodDIgPiB0MSkgcmV0dXJuIHQxO1xuXG4gICAgd2hpbGUgKHQwIDwgdDEpIHtcblxuICAgICAgICB4MiA9IHRoaXMuc2FtcGxlQ3VydmVYKHQyKTtcbiAgICAgICAgaWYgKE1hdGguYWJzKHgyIC0geCkgPCBlcHNpbG9uKSByZXR1cm4gdDI7XG5cbiAgICAgICAgaWYgKHggPiB4Mikge1xuICAgICAgICAgICAgdDAgPSB0MjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHQxID0gdDI7XG4gICAgICAgIH1cblxuICAgICAgICB0MiA9ICh0MSAtIHQwKSAqIDAuNSArIHQwO1xuICAgIH1cblxuICAgIC8vIEZhaWx1cmUuXG4gICAgcmV0dXJuIHQyO1xufTtcblxuVW5pdEJlemllci5wcm90b3R5cGUuc29sdmUgPSBmdW5jdGlvbih4LCBlcHNpbG9uKSB7XG4gICAgcmV0dXJuIHRoaXMuc2FtcGxlQ3VydmVZKHRoaXMuc29sdmVDdXJ2ZVgoeCwgZXBzaWxvbikpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBpc1N1cHBvcnRlZDtcbn0gZWxzZSBpZiAod2luZG93KSB7XG4gICAgd2luZG93Lm1hcGJveGdsID0gd2luZG93Lm1hcGJveGdsIHx8IHt9O1xuICAgIHdpbmRvdy5tYXBib3hnbC5zdXBwb3J0ZWQgPSBpc1N1cHBvcnRlZDtcbn1cblxuLyoqXG4gKiBUZXN0IHdoZXRoZXIgdGhlIGN1cnJlbnQgYnJvd3NlciBzdXBwb3J0cyBNYXBib3ggR0wgSlNcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmZhaWxJZk1ham9yUGVyZm9ybWFuY2VDYXZlYXQ9ZmFsc2VdIFJldHVybiBgZmFsc2VgXG4gKiAgIGlmIHRoZSBwZXJmb3JtYW5jZSBvZiBNYXBib3ggR0wgSlMgd291bGQgYmUgZHJhbWF0aWNhbGx5IHdvcnNlIHRoYW5cbiAqICAgZXhwZWN0ZWQgKGkuZS4gYSBzb2Z0d2FyZSByZW5kZXJlciBpcyB3b3VsZCBiZSB1c2VkKVxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNTdXBwb3J0ZWQob3B0aW9ucykge1xuICAgIHJldHVybiAhIShcbiAgICAgICAgaXNCcm93c2VyKCkgJiZcbiAgICAgICAgaXNBcnJheVN1cHBvcnRlZCgpICYmXG4gICAgICAgIGlzRnVuY3Rpb25TdXBwb3J0ZWQoKSAmJlxuICAgICAgICBpc09iamVjdFN1cHBvcnRlZCgpICYmXG4gICAgICAgIGlzSlNPTlN1cHBvcnRlZCgpICYmXG4gICAgICAgIGlzV29ya2VyU3VwcG9ydGVkKCkgJiZcbiAgICAgICAgaXNVaW50OENsYW1wZWRBcnJheVN1cHBvcnRlZCgpICYmXG4gICAgICAgIGlzV2ViR0xTdXBwb3J0ZWRDYWNoZWQob3B0aW9ucyAmJiBvcHRpb25zLmZhaWxJZk1ham9yUGVyZm9ybWFuY2VDYXZlYXQpXG4gICAgKTtcbn1cblxuZnVuY3Rpb24gaXNCcm93c2VyKCkge1xuICAgIHJldHVybiB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnO1xufVxuXG5mdW5jdGlvbiBpc0FycmF5U3VwcG9ydGVkKCkge1xuICAgIHJldHVybiAoXG4gICAgICAgIEFycmF5LnByb3RvdHlwZSAmJlxuICAgICAgICBBcnJheS5wcm90b3R5cGUuZXZlcnkgJiZcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLmZpbHRlciAmJlxuICAgICAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaCAmJlxuICAgICAgICBBcnJheS5wcm90b3R5cGUuaW5kZXhPZiAmJlxuICAgICAgICBBcnJheS5wcm90b3R5cGUubGFzdEluZGV4T2YgJiZcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLm1hcCAmJlxuICAgICAgICBBcnJheS5wcm90b3R5cGUuc29tZSAmJlxuICAgICAgICBBcnJheS5wcm90b3R5cGUucmVkdWNlICYmXG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5yZWR1Y2VSaWdodCAmJlxuICAgICAgICBBcnJheS5pc0FycmF5XG4gICAgKTtcbn1cblxuZnVuY3Rpb24gaXNGdW5jdGlvblN1cHBvcnRlZCgpIHtcbiAgICByZXR1cm4gRnVuY3Rpb24ucHJvdG90eXBlICYmIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kO1xufVxuXG5mdW5jdGlvbiBpc09iamVjdFN1cHBvcnRlZCgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgICBPYmplY3Qua2V5cyAmJlxuICAgICAgICBPYmplY3QuY3JlYXRlICYmXG4gICAgICAgIE9iamVjdC5nZXRQcm90b3R5cGVPZiAmJlxuICAgICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyAmJlxuICAgICAgICBPYmplY3QuaXNTZWFsZWQgJiZcbiAgICAgICAgT2JqZWN0LmlzRnJvemVuICYmXG4gICAgICAgIE9iamVjdC5pc0V4dGVuc2libGUgJiZcbiAgICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvciAmJlxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkgJiZcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMgJiZcbiAgICAgICAgT2JqZWN0LnNlYWwgJiZcbiAgICAgICAgT2JqZWN0LmZyZWV6ZSAmJlxuICAgICAgICBPYmplY3QucHJldmVudEV4dGVuc2lvbnNcbiAgICApO1xufVxuXG5mdW5jdGlvbiBpc0pTT05TdXBwb3J0ZWQoKSB7XG4gICAgcmV0dXJuICdKU09OJyBpbiB3aW5kb3cgJiYgJ3BhcnNlJyBpbiBKU09OICYmICdzdHJpbmdpZnknIGluIEpTT047XG59XG5cbmZ1bmN0aW9uIGlzV29ya2VyU3VwcG9ydGVkKCkge1xuICAgIHJldHVybiAnV29ya2VyJyBpbiB3aW5kb3c7XG59XG5cbi8vIElFMTEgb25seSBzdXBwb3J0cyBgVWludDhDbGFtcGVkQXJyYXlgIGFzIG9mIHZlcnNpb25cbi8vIFtLQjI5Mjk0MzddKGh0dHBzOi8vc3VwcG9ydC5taWNyb3NvZnQuY29tL2VuLXVzL2tiLzI5Mjk0MzcpXG5mdW5jdGlvbiBpc1VpbnQ4Q2xhbXBlZEFycmF5U3VwcG9ydGVkKCkge1xuICAgIHJldHVybiAnVWludDhDbGFtcGVkQXJyYXknIGluIHdpbmRvdztcbn1cblxudmFyIGlzV2ViR0xTdXBwb3J0ZWRDYWNoZSA9IHt9O1xuZnVuY3Rpb24gaXNXZWJHTFN1cHBvcnRlZENhY2hlZChmYWlsSWZNYWpvclBlcmZvcm1hbmNlQ2F2ZWF0KSB7XG5cbiAgICBpZiAoaXNXZWJHTFN1cHBvcnRlZENhY2hlW2ZhaWxJZk1ham9yUGVyZm9ybWFuY2VDYXZlYXRdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaXNXZWJHTFN1cHBvcnRlZENhY2hlW2ZhaWxJZk1ham9yUGVyZm9ybWFuY2VDYXZlYXRdID0gaXNXZWJHTFN1cHBvcnRlZChmYWlsSWZNYWpvclBlcmZvcm1hbmNlQ2F2ZWF0KTtcbiAgICB9XG5cbiAgICByZXR1cm4gaXNXZWJHTFN1cHBvcnRlZENhY2hlW2ZhaWxJZk1ham9yUGVyZm9ybWFuY2VDYXZlYXRdO1xufVxuXG5pc1N1cHBvcnRlZC53ZWJHTENvbnRleHRBdHRyaWJ1dGVzID0ge1xuICAgIGFudGlhbGlhczogZmFsc2UsXG4gICAgYWxwaGE6IHRydWUsXG4gICAgc3RlbmNpbDogdHJ1ZSxcbiAgICBkZXB0aDogdHJ1ZVxufTtcblxuZnVuY3Rpb24gaXNXZWJHTFN1cHBvcnRlZChmYWlsSWZNYWpvclBlcmZvcm1hbmNlQ2F2ZWF0KSB7XG5cbiAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG5cbiAgICB2YXIgYXR0cmlidXRlcyA9IE9iamVjdC5jcmVhdGUoaXNTdXBwb3J0ZWQud2ViR0xDb250ZXh0QXR0cmlidXRlcyk7XG4gICAgYXR0cmlidXRlcy5mYWlsSWZNYWpvclBlcmZvcm1hbmNlQ2F2ZWF0ID0gZmFpbElmTWFqb3JQZXJmb3JtYW5jZUNhdmVhdDtcblxuICAgIGlmIChjYW52YXMucHJvYmFibHlTdXBwb3J0c0NvbnRleHQpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIGNhbnZhcy5wcm9iYWJseVN1cHBvcnRzQ29udGV4dCgnd2ViZ2wnLCBhdHRyaWJ1dGVzKSB8fFxuICAgICAgICAgICAgY2FudmFzLnByb2JhYmx5U3VwcG9ydHNDb250ZXh0KCdleHBlcmltZW50YWwtd2ViZ2wnLCBhdHRyaWJ1dGVzKVxuICAgICAgICApO1xuXG4gICAgfSBlbHNlIGlmIChjYW52YXMuc3VwcG9ydHNDb250ZXh0KSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBjYW52YXMuc3VwcG9ydHNDb250ZXh0KCd3ZWJnbCcsIGF0dHJpYnV0ZXMpIHx8XG4gICAgICAgICAgICBjYW52YXMuc3VwcG9ydHNDb250ZXh0KCdleHBlcmltZW50YWwtd2ViZ2wnLCBhdHRyaWJ1dGVzKVxuICAgICAgICApO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIGNhbnZhcy5nZXRDb250ZXh0KCd3ZWJnbCcsIGF0dHJpYnV0ZXMpIHx8XG4gICAgICAgICAgICBjYW52YXMuZ2V0Q29udGV4dCgnZXhwZXJpbWVudGFsLXdlYmdsJywgYXR0cmlidXRlcylcbiAgICAgICAgKTtcbiAgICB9XG59XG4iLCIndXNlIHN0cmljdCc7XG4vLyAgICAgIFxuXG4vKipcbiAqIEEgY29vcmRpbmF0ZSBpcyBhIGNvbHVtbiwgcm93LCB6b29tIGNvbWJpbmF0aW9uLCBvZnRlbiB1c2VkXG4gKiBhcyB0aGUgZGF0YSBjb21wb25lbnQgb2YgYSB0aWxlLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBjb2x1bW5cbiAqIEBwYXJhbSB7bnVtYmVyfSByb3dcbiAqIEBwYXJhbSB7bnVtYmVyfSB6b29tXG4gKiBAcHJpdmF0ZVxuICovXG5jbGFzcyBDb29yZGluYXRlIHtcbiAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgXG4gICAgY29uc3RydWN0b3IoY29sdW1uICAgICAgICAsIHJvdyAgICAgICAgLCB6b29tICAgICAgICApIHtcbiAgICAgICAgdGhpcy5jb2x1bW4gPSBjb2x1bW47XG4gICAgICAgIHRoaXMucm93ID0gcm93O1xuICAgICAgICB0aGlzLnpvb20gPSB6b29tO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIGNsb25lIG9mIHRoaXMgY29vcmRpbmF0ZSB0aGF0IGNhbiBiZSBtdXRhdGVkIHdpdGhvdXRcbiAgICAgKiBjaGFuZ2luZyB0aGUgb3JpZ2luYWwgY29vcmRpbmF0ZVxuICAgICAqXG4gICAgICogQHJldHVybnMge0Nvb3JkaW5hdGV9IGNsb25lXG4gICAgICogQHByaXZhdGVcbiAgICAgKiB2YXIgY29vcmQgPSBuZXcgQ29vcmRpbmF0ZSgwLCAwLCAwKTtcbiAgICAgKiB2YXIgYzIgPSBjb29yZC5jbG9uZSgpO1xuICAgICAqIC8vIHNpbmNlIGNvb3JkIGlzIGNsb25lZCwgbW9kaWZ5aW5nIGEgcHJvcGVydHkgb2YgYzIgZG9lc1xuICAgICAqIC8vIG5vdCBtb2RpZnkgaXQuXG4gICAgICogYzIuem9vbSA9IDI7XG4gICAgICovXG4gICAgY2xvbmUoKSB7XG4gICAgICAgIHJldHVybiBuZXcgQ29vcmRpbmF0ZSh0aGlzLmNvbHVtbiwgdGhpcy5yb3csIHRoaXMuem9vbSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogWm9vbSB0aGlzIGNvb3JkaW5hdGUgdG8gYSBnaXZlbiB6b29tIGxldmVsLiBUaGlzIHJldHVybnMgYSBuZXdcbiAgICAgKiBjb29yZGluYXRlIG9iamVjdCwgbm90IG11dGF0aW5nIHRoZSBvbGQgb25lLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHpvb21cbiAgICAgKiBAcmV0dXJucyB7Q29vcmRpbmF0ZX0gem9vbWVkIGNvb3JkaW5hdGVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBleGFtcGxlXG4gICAgICogdmFyIGNvb3JkID0gbmV3IENvb3JkaW5hdGUoMCwgMCwgMCk7XG4gICAgICogdmFyIGMyID0gY29vcmQuem9vbVRvKDEpO1xuICAgICAqIGMyIC8vIGVxdWFscyBuZXcgQ29vcmRpbmF0ZSgwLCAwLCAxKTtcbiAgICAgKi9cbiAgICB6b29tVG8oem9vbSAgICAgICAgKSB7IHJldHVybiB0aGlzLmNsb25lKCkuX3pvb21Ubyh6b29tKTsgfVxuXG4gICAgLyoqXG4gICAgICogU3VidHJhY3QgdGhlIGNvbHVtbiBhbmQgcm93IHZhbHVlcyBvZiB0aGlzIGNvb3JkaW5hdGUgZnJvbSB0aG9zZVxuICAgICAqIG9mIGFub3RoZXIgY29vcmRpbmF0ZS4gVGhlIG90aGVyIGNvb3JkaW5hdCB3aWxsIGJlIHpvb21lZCB0byB0aGVcbiAgICAgKiBzYW1lIGxldmVsIGFzIGB0aGlzYCBiZWZvcmUgdGhlIHN1YnRyYWN0aW9uIG9jY3Vyc1xuICAgICAqXG4gICAgICogQHBhcmFtIHtDb29yZGluYXRlfSBjIG90aGVyIGNvb3JkaW5hdGVcbiAgICAgKiBAcmV0dXJucyB7Q29vcmRpbmF0ZX0gcmVzdWx0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBzdWIoYyAgICAgICAgICAgICkgeyByZXR1cm4gdGhpcy5jbG9uZSgpLl9zdWIoYyk7IH1cblxuICAgIF96b29tVG8oem9vbSAgICAgICAgKSB7XG4gICAgICAgIGNvbnN0IHNjYWxlID0gTWF0aC5wb3coMiwgem9vbSAtIHRoaXMuem9vbSk7XG4gICAgICAgIHRoaXMuY29sdW1uICo9IHNjYWxlO1xuICAgICAgICB0aGlzLnJvdyAqPSBzY2FsZTtcbiAgICAgICAgdGhpcy56b29tID0gem9vbTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgX3N1YihjICAgICAgICAgICAgKSB7XG4gICAgICAgIGMgPSBjLnpvb21Ubyh0aGlzLnpvb20pO1xuICAgICAgICB0aGlzLmNvbHVtbiAtPSBjLmNvbHVtbjtcbiAgICAgICAgdGhpcy5yb3cgLT0gYy5yb3c7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDb29yZGluYXRlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCB3cmFwID0gcmVxdWlyZSgnLi4vdXRpbC91dGlsJykud3JhcDtcblxuLyoqXG4gKiBBIGBMbmdMYXRgIG9iamVjdCByZXByZXNlbnRzIGEgZ2l2ZW4gbG9uZ2l0dWRlIGFuZCBsYXRpdHVkZSBjb29yZGluYXRlLCBtZWFzdXJlZCBpbiBkZWdyZWVzLlxuICpcbiAqIE1hcGJveCBHTCB1c2VzIGxvbmdpdHVkZSwgbGF0aXR1ZGUgY29vcmRpbmF0ZSBvcmRlciAoYXMgb3Bwb3NlZCB0byBsYXRpdHVkZSwgbG9uZ2l0dWRlKSB0byBtYXRjaCBHZW9KU09OLlxuICpcbiAqIE5vdGUgdGhhdCBhbnkgTWFwYm94IEdMIG1ldGhvZCB0aGF0IGFjY2VwdHMgYSBgTG5nTGF0YCBvYmplY3QgYXMgYW4gYXJndW1lbnQgb3Igb3B0aW9uXG4gKiBjYW4gYWxzbyBhY2NlcHQgYW4gYEFycmF5YCBvZiB0d28gbnVtYmVycyBhbmQgd2lsbCBwZXJmb3JtIGFuIGltcGxpY2l0IGNvbnZlcnNpb24uXG4gKiBUaGlzIGZsZXhpYmxlIHR5cGUgaXMgZG9jdW1lbnRlZCBhcyBbYExuZ0xhdExpa2VgXSgjTG5nTGF0TGlrZSkuXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IGxuZyBMb25naXR1ZGUsIG1lYXN1cmVkIGluIGRlZ3JlZXMuXG4gKiBAcGFyYW0ge251bWJlcn0gbGF0IExhdGl0dWRlLCBtZWFzdXJlZCBpbiBkZWdyZWVzLlxuICogQGV4YW1wbGVcbiAqIHZhciBsbCA9IG5ldyBtYXBib3hnbC5MbmdMYXQoLTczLjk3NDksIDQwLjc3MzYpO1xuICogQHNlZSBbR2V0IGNvb3JkaW5hdGVzIG9mIHRoZSBtb3VzZSBwb2ludGVyXShodHRwczovL3d3dy5tYXBib3guY29tL21hcGJveC1nbC1qcy9leGFtcGxlL21vdXNlLXBvc2l0aW9uLylcbiAqIEBzZWUgW0Rpc3BsYXkgYSBwb3B1cF0oaHR0cHM6Ly93d3cubWFwYm94LmNvbS9tYXBib3gtZ2wtanMvZXhhbXBsZS9wb3B1cC8pXG4gKiBAc2VlIFtIaWdobGlnaHQgZmVhdHVyZXMgd2l0aGluIGEgYm91bmRpbmcgYm94XShodHRwczovL3d3dy5tYXBib3guY29tL21hcGJveC1nbC1qcy9leGFtcGxlL3VzaW5nLWJveC1xdWVyeXJlbmRlcmVkZmVhdHVyZXMvKVxuICogQHNlZSBbQ3JlYXRlIGEgdGltZWxpbmUgYW5pbWF0aW9uXShodHRwczovL3d3dy5tYXBib3guY29tL21hcGJveC1nbC1qcy9leGFtcGxlL3RpbWVsaW5lLWFuaW1hdGlvbi8pXG4gKi9cbmNsYXNzIExuZ0xhdCB7XG4gICAgY29uc3RydWN0b3IobG5nLCBsYXQpIHtcbiAgICAgICAgaWYgKGlzTmFOKGxuZykgfHwgaXNOYU4obGF0KSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIExuZ0xhdCBvYmplY3Q6ICgke2xuZ30sICR7bGF0fSlgKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxuZyA9ICtsbmc7XG4gICAgICAgIHRoaXMubGF0ID0gK2xhdDtcbiAgICAgICAgaWYgKHRoaXMubGF0ID4gOTAgfHwgdGhpcy5sYXQgPCAtOTApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBMbmdMYXQgbGF0aXR1ZGUgdmFsdWU6IG11c3QgYmUgYmV0d2VlbiAtOTAgYW5kIDkwJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgbmV3IGBMbmdMYXRgIG9iamVjdCB3aG9zZSBsb25naXR1ZGUgaXMgd3JhcHBlZCB0byB0aGUgcmFuZ2UgKC0xODAsIDE4MCkuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7TG5nTGF0fSBUaGUgd3JhcHBlZCBgTG5nTGF0YCBvYmplY3QuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB2YXIgbGwgPSBuZXcgbWFwYm94Z2wuTG5nTGF0KDI4Ni4wMjUxLCA0MC43NzM2KTtcbiAgICAgKiB2YXIgd3JhcHBlZCA9IGxsLndyYXAoKTtcbiAgICAgKiB3cmFwcGVkLmxuZzsgLy8gPSAtNzMuOTc0OVxuICAgICAqL1xuICAgIHdyYXAoKSB7XG4gICAgICAgIHJldHVybiBuZXcgTG5nTGF0KHdyYXAodGhpcy5sbmcsIC0xODAsIDE4MCksIHRoaXMubGF0KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgbmV3IGBMbmdMYXRgIG9iamVjdCB3cmFwcGVkIHRvIHRoZSBiZXN0IHdvcmxkIHRvIGRyYXcgaXQgcHJvdmlkZWQgYSBtYXAgYGNlbnRlcmAgYExuZ0xhdGAuXG4gICAgICpcbiAgICAgKiBXaGVuIHRoZSBtYXAgaXMgY2xvc2UgdG8gdGhlIGFudGktbWVyaWRpYW4gc2hvd2luZyBhIHBvaW50IG9uIHdvcmxkIC0xIG9yIDEgaXMgYSBiZXR0ZXJcbiAgICAgKiBjaG9pY2UuIFRoZSBoZXVyaXN0aWMgdXNlZCBpcyB0byBtaW5pbWl6ZSB0aGUgZGlzdGFuY2UgZnJvbSB0aGUgbWFwIGNlbnRlciB0byB0aGUgcG9pbnQuXG4gICAgICpcbiAgICAgKiBPbmx5IHdvcmtzIHdoZXJlIHRoZSBgTG5nTGF0YCBpcyB3cmFwcGVkIHdpdGggYExuZ0xhdC53cmFwKClgIGFuZCBgY2VudGVyYCBpcyB3aXRoaW4gdGhlIG1haW4gd29ybGQgbWFwLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtMbmdMYXR9IGNlbnRlciBNYXAgY2VudGVyIHdpdGhpbiB0aGUgbWFpbiB3b3JsZC5cbiAgICAgKiBAcmV0dXJuIHtMbmdMYXR9IFRoZSBgTG5nTGF0YCBvYmplY3QgaW4gdGhlIGJlc3Qgd29ybGQgdG8gZHJhdyBpdCBmb3IgdGhlIHByb3ZpZGVkIG1hcCBgY2VudGVyYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHZhciBsbCA9IG5ldyBtYXBib3hnbC5MbmdMYXQoMTcwLCAwKTtcbiAgICAgKiB2YXIgbWFwQ2VudGVyID0gbmV3IG1hcGJveGdsLkxuZ0xhdCgtMTcwLCAwKTtcbiAgICAgKiB2YXIgc25hcHBlZCA9IGxsLndyYXBUb0Jlc3RXb3JsZChtYXBDZW50ZXIpO1xuICAgICAqIHNuYXBwZWQ7IC8vID0geyBsbmc6IC0xOTAsIGxhdDogMCB9XG4gICAgICovXG4gICAgd3JhcFRvQmVzdFdvcmxkKGNlbnRlcikge1xuICAgICAgICBjb25zdCB3cmFwcGVkID0gbmV3IExuZ0xhdCh0aGlzLmxuZywgdGhpcy5sYXQpO1xuXG4gICAgICAgIGlmIChNYXRoLmFicyh0aGlzLmxuZyAtIGNlbnRlci5sbmcpID4gMTgwKSB7XG4gICAgICAgICAgICBpZiAoY2VudGVyLmxuZyA8IDApIHtcbiAgICAgICAgICAgICAgICB3cmFwcGVkLmxuZyAtPSAzNjA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHdyYXBwZWQubG5nICs9IDM2MDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB3cmFwcGVkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGNvb3JkaW5hdGVzIHJlcHJlc2VudGVkIGFzIGFuIGFycmF5IG9mIHR3byBudW1iZXJzLlxuICAgICAqXG4gICAgICogQHJldHVybnMge0FycmF5PG51bWJlcj59IFRoZSBjb29yZGluYXRlcyByZXByZXNldGVkIGFzIGFuIGFycmF5IG9mIGxvbmdpdHVkZSBhbmQgbGF0aXR1ZGUuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB2YXIgbGwgPSBuZXcgbWFwYm94Z2wuTG5nTGF0KC03My45NzQ5LCA0MC43NzM2KTtcbiAgICAgKiBsbC50b0FycmF5KCk7IC8vID0gWy03My45NzQ5LCA0MC43NzM2XVxuICAgICAqL1xuICAgIHRvQXJyYXkoKSB7XG4gICAgICAgIHJldHVybiBbdGhpcy5sbmcsIHRoaXMubGF0XTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBjb29yZGluYXRlcyByZXByZXNlbnQgYXMgYSBzdHJpbmcuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgY29vcmRpbmF0ZXMgcmVwcmVzZW50ZWQgYXMgYSBzdHJpbmcgb2YgdGhlIGZvcm1hdCBgJ0xuZ0xhdChsbmcsIGxhdCknYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHZhciBsbCA9IG5ldyBtYXBib3hnbC5MbmdMYXQoLTczLjk3NDksIDQwLjc3MzYpO1xuICAgICAqIGxsLnRvU3RyaW5nKCk7IC8vID0gXCJMbmdMYXQoLTczLjk3NDksIDQwLjc3MzYpXCJcbiAgICAgKi9cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIGBMbmdMYXQoJHt0aGlzLmxuZ30sICR7dGhpcy5sYXR9KWA7XG4gICAgfVxufVxuXG4vKipcbiAqIENvbnZlcnRzIGFuIGFycmF5IG9mIHR3byBudW1iZXJzIHRvIGEgYExuZ0xhdGAgb2JqZWN0LlxuICpcbiAqIElmIGEgYExuZ0xhdGAgb2JqZWN0IGlzIHBhc3NlZCBpbiwgdGhlIGZ1bmN0aW9uIHJldHVybnMgaXQgdW5jaGFuZ2VkLlxuICpcbiAqIEBwYXJhbSB7TG5nTGF0TGlrZX0gaW5wdXQgQW4gYXJyYXkgb2YgdHdvIG51bWJlcnMgdG8gY29udmVydCwgb3IgYSBgTG5nTGF0YCBvYmplY3QgdG8gcmV0dXJuLlxuICogQHJldHVybnMge0xuZ0xhdH0gQSBuZXcgYExuZ0xhdGAgb2JqZWN0LCBpZiBhIGNvbnZlcnNpb24gb2NjdXJyZWQsIG9yIHRoZSBvcmlnaW5hbCBgTG5nTGF0YCBvYmplY3QuXG4gKiBAZXhhbXBsZVxuICogdmFyIGFyciA9IFstNzMuOTc0OSwgNDAuNzczNl07XG4gKiB2YXIgbGwgPSBtYXBib3hnbC5MbmdMYXQuY29udmVydChhcnIpO1xuICogbGw7ICAgLy8gPSBMbmdMYXQge2xuZzogLTczLjk3NDksIGxhdDogNDAuNzczNn1cbiAqL1xuTG5nTGF0LmNvbnZlcnQgPSBmdW5jdGlvbiAoaW5wdXQpIHtcbiAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBMbmdMYXQpIHtcbiAgICAgICAgcmV0dXJuIGlucHV0O1xuICAgIH0gZWxzZSBpZiAoaW5wdXQgJiYgaW5wdXQuaGFzT3duUHJvcGVydHkoJ2xuZycpICYmIGlucHV0Lmhhc093blByb3BlcnR5KCdsYXQnKSkge1xuICAgICAgICByZXR1cm4gbmV3IExuZ0xhdChpbnB1dC5sbmcsIGlucHV0LmxhdCk7XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGlucHV0KSAmJiBpbnB1dC5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBMbmdMYXQoaW5wdXRbMF0sIGlucHV0WzFdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJgTG5nTGF0TGlrZWAgYXJndW1lbnQgbXVzdCBiZSBzcGVjaWZpZWQgYXMgYSBMbmdMYXQgaW5zdGFuY2UsIGFuIG9iamVjdCB7bG5nOiA8bG5nPiwgbGF0OiA8bGF0Pn0sIG9yIGFuIGFycmF5IG9mIFs8bG5nPiwgPGxhdD5dXCIpO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTG5nTGF0O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBMbmdMYXQgPSByZXF1aXJlKCcuL2xuZ19sYXQnKTtcblxuLyoqXG4gKiBBIGBMbmdMYXRCb3VuZHNgIG9iamVjdCByZXByZXNlbnRzIGEgZ2VvZ3JhcGhpY2FsIGJvdW5kaW5nIGJveCxcbiAqIGRlZmluZWQgYnkgaXRzIHNvdXRod2VzdCBhbmQgbm9ydGhlYXN0IHBvaW50cyBpbiBsb25naXR1ZGUgYW5kIGxhdGl0dWRlLlxuICpcbiAqIElmIG5vIGFyZ3VtZW50cyBhcmUgcHJvdmlkZWQgdG8gdGhlIGNvbnN0cnVjdG9yLCBhIGBudWxsYCBib3VuZGluZyBib3ggaXMgY3JlYXRlZC5cbiAqXG4gKiBOb3RlIHRoYXQgYW55IE1hcGJveCBHTCBtZXRob2QgdGhhdCBhY2NlcHRzIGEgYExuZ0xhdEJvdW5kc2Agb2JqZWN0IGFzIGFuIGFyZ3VtZW50IG9yIG9wdGlvblxuICogY2FuIGFsc28gYWNjZXB0IGFuIGBBcnJheWAgb2YgdHdvIFtgTG5nTGF0TGlrZWBdKCNMbmdMYXRMaWtlKSBjb25zdHJ1Y3RzIGFuZCB3aWxsIHBlcmZvcm0gYW4gaW1wbGljaXQgY29udmVyc2lvbi5cbiAqIFRoaXMgZmxleGlibGUgdHlwZSBpcyBkb2N1bWVudGVkIGFzIFtgTG5nTGF0Qm91bmRzTGlrZWBdKCNMbmdMYXRCb3VuZHNMaWtlKS5cbiAqXG4gKiBAcGFyYW0ge0xuZ0xhdExpa2V9IFtzd10gVGhlIHNvdXRod2VzdCBjb3JuZXIgb2YgdGhlIGJvdW5kaW5nIGJveC5cbiAqIEBwYXJhbSB7TG5nTGF0TGlrZX0gW25lXSBUaGUgbm9ydGhlYXN0IGNvcm5lciBvZiB0aGUgYm91bmRpbmcgYm94LlxuICogQGV4YW1wbGVcbiAqIHZhciBzdyA9IG5ldyBtYXBib3hnbC5MbmdMYXQoLTczLjk4NzYsIDQwLjc2NjEpO1xuICogdmFyIG5lID0gbmV3IG1hcGJveGdsLkxuZ0xhdCgtNzMuOTM5NywgNDAuODAwMik7XG4gKiB2YXIgbGxiID0gbmV3IG1hcGJveGdsLkxuZ0xhdEJvdW5kcyhzdywgbmUpO1xuICovXG5jbGFzcyBMbmdMYXRCb3VuZHMge1xuICAgIGNvbnN0cnVjdG9yKHN3LCBuZSkge1xuICAgICAgICBpZiAoIXN3KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSBpZiAobmUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U291dGhXZXN0KHN3KS5zZXROb3J0aEVhc3QobmUpO1xuICAgICAgICB9IGVsc2UgaWYgKHN3Lmxlbmd0aCA9PT0gNCkge1xuICAgICAgICAgICAgdGhpcy5zZXRTb3V0aFdlc3QoW3N3WzBdLCBzd1sxXV0pLnNldE5vcnRoRWFzdChbc3dbMl0sIHN3WzNdXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldFNvdXRoV2VzdChzd1swXSkuc2V0Tm9ydGhFYXN0KHN3WzFdKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgbm9ydGhlYXN0IGNvcm5lciBvZiB0aGUgYm91bmRpbmcgYm94XG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0xuZ0xhdExpa2V9IG5lXG4gICAgICogQHJldHVybnMge0xuZ0xhdEJvdW5kc30gYHRoaXNgXG4gICAgICovXG4gICAgc2V0Tm9ydGhFYXN0KG5lKSB7XG4gICAgICAgIHRoaXMuX25lID0gTG5nTGF0LmNvbnZlcnQobmUpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIHNvdXRod2VzdCBjb3JuZXIgb2YgdGhlIGJvdW5kaW5nIGJveFxuICAgICAqXG4gICAgICogQHBhcmFtIHtMbmdMYXRMaWtlfSBzd1xuICAgICAqIEByZXR1cm5zIHtMbmdMYXRCb3VuZHN9IGB0aGlzYFxuICAgICAqL1xuICAgIHNldFNvdXRoV2VzdChzdykge1xuICAgICAgICB0aGlzLl9zdyA9IExuZ0xhdC5jb252ZXJ0KHN3KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRXh0ZW5kIHRoZSBib3VuZHMgdG8gaW5jbHVkZSBhIGdpdmVuIExuZ0xhdCBvciBMbmdMYXRCb3VuZHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0xuZ0xhdHxMbmdMYXRCb3VuZHN9IG9iaiBvYmplY3QgdG8gZXh0ZW5kIHRvXG4gICAgICogQHJldHVybnMge0xuZ0xhdEJvdW5kc30gYHRoaXNgXG4gICAgICovXG4gICAgZXh0ZW5kKG9iaikge1xuICAgICAgICBjb25zdCBzdyA9IHRoaXMuX3N3LFxuICAgICAgICAgICAgbmUgPSB0aGlzLl9uZTtcbiAgICAgICAgbGV0IHN3MiwgbmUyO1xuXG4gICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBMbmdMYXQpIHtcbiAgICAgICAgICAgIHN3MiA9IG9iajtcbiAgICAgICAgICAgIG5lMiA9IG9iajtcblxuICAgICAgICB9IGVsc2UgaWYgKG9iaiBpbnN0YW5jZW9mIExuZ0xhdEJvdW5kcykge1xuICAgICAgICAgICAgc3cyID0gb2JqLl9zdztcbiAgICAgICAgICAgIG5lMiA9IG9iai5fbmU7XG5cbiAgICAgICAgICAgIGlmICghc3cyIHx8ICFuZTIpIHJldHVybiB0aGlzO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShvYmopKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9iai5ldmVyeShBcnJheS5pc0FycmF5KSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5leHRlbmQoTG5nTGF0Qm91bmRzLmNvbnZlcnQob2JqKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXh0ZW5kKExuZ0xhdC5jb252ZXJ0KG9iaikpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFzdyAmJiAhbmUpIHtcbiAgICAgICAgICAgIHRoaXMuX3N3ID0gbmV3IExuZ0xhdChzdzIubG5nLCBzdzIubGF0KTtcbiAgICAgICAgICAgIHRoaXMuX25lID0gbmV3IExuZ0xhdChuZTIubG5nLCBuZTIubGF0KTtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3cubG5nID0gTWF0aC5taW4oc3cyLmxuZywgc3cubG5nKTtcbiAgICAgICAgICAgIHN3LmxhdCA9IE1hdGgubWluKHN3Mi5sYXQsIHN3LmxhdCk7XG4gICAgICAgICAgICBuZS5sbmcgPSBNYXRoLm1heChuZTIubG5nLCBuZS5sbmcpO1xuICAgICAgICAgICAgbmUubGF0ID0gTWF0aC5tYXgobmUyLmxhdCwgbmUubGF0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGdlb2dyYXBoaWNhbCBjb29yZGluYXRlIGVxdWlkaXN0YW50IGZyb20gdGhlIGJvdW5kaW5nIGJveCdzIGNvcm5lcnMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7TG5nTGF0fSBUaGUgYm91bmRpbmcgYm94J3MgY2VudGVyLlxuICAgICAqIEBleGFtcGxlXG4gICAgICogdmFyIGxsYiA9IG5ldyBtYXBib3hnbC5MbmdMYXRCb3VuZHMoWy03My45ODc2LCA0MC43NjYxXSwgWy03My45Mzk3LCA0MC44MDAyXSk7XG4gICAgICogbGxiLmdldENlbnRlcigpOyAvLyA9IExuZ0xhdCB7bG5nOiAtNzMuOTYzNjUsIGxhdDogNDAuNzgzMTV9XG4gICAgICovXG4gICAgZ2V0Q2VudGVyKCkge1xuICAgICAgICByZXR1cm4gbmV3IExuZ0xhdCgodGhpcy5fc3cubG5nICsgdGhpcy5fbmUubG5nKSAvIDIsICh0aGlzLl9zdy5sYXQgKyB0aGlzLl9uZS5sYXQpIC8gMik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgc291dGh3ZXN0IGNvcm5lciBvZiB0aGUgYm91bmRpbmcgYm94LlxuICAgICAqXG4gICAgICogQHJldHVybnMge0xuZ0xhdH0gVGhlIHNvdXRod2VzdCBjb3JuZXIgb2YgdGhlIGJvdW5kaW5nIGJveC5cbiAgICAgKi9cbiAgICBnZXRTb3V0aFdlc3QoKSB7IHJldHVybiB0aGlzLl9zdzsgfVxuXG4gICAgLyoqXG4gICAgKiBSZXR1cm5zIHRoZSBub3J0aGVhc3QgY29ybmVyIG9mIHRoZSBib3VuZGluZyBib3guXG4gICAgKlxuICAgICogQHJldHVybnMge0xuZ0xhdH0gVGhlIG5vcnRoZWFzdCBjb3JuZXIgb2YgdGhlIGJvdW5kaW5nIGJveC5cbiAgICAgKi9cbiAgICBnZXROb3J0aEVhc3QoKSB7IHJldHVybiB0aGlzLl9uZTsgfVxuXG4gICAgLyoqXG4gICAgKiBSZXR1cm5zIHRoZSBub3J0aHdlc3QgY29ybmVyIG9mIHRoZSBib3VuZGluZyBib3guXG4gICAgKlxuICAgICogQHJldHVybnMge0xuZ0xhdH0gVGhlIG5vcnRod2VzdCBjb3JuZXIgb2YgdGhlIGJvdW5kaW5nIGJveC5cbiAgICAgKi9cbiAgICBnZXROb3J0aFdlc3QoKSB7IHJldHVybiBuZXcgTG5nTGF0KHRoaXMuZ2V0V2VzdCgpLCB0aGlzLmdldE5vcnRoKCkpOyB9XG5cbiAgICAvKipcbiAgICAqIFJldHVybnMgdGhlIHNvdXRoZWFzdCBjb3JuZXIgb2YgdGhlIGJvdW5kaW5nIGJveC5cbiAgICAqXG4gICAgKiBAcmV0dXJucyB7TG5nTGF0fSBUaGUgc291dGhlYXN0IGNvcm5lciBvZiB0aGUgYm91bmRpbmcgYm94LlxuICAgICAqL1xuICAgIGdldFNvdXRoRWFzdCgpIHsgcmV0dXJuIG5ldyBMbmdMYXQodGhpcy5nZXRFYXN0KCksIHRoaXMuZ2V0U291dGgoKSk7IH1cblxuICAgIC8qKlxuICAgICogUmV0dXJucyB0aGUgd2VzdCBlZGdlIG9mIHRoZSBib3VuZGluZyBib3guXG4gICAgKlxuICAgICogQHJldHVybnMge251bWJlcn0gVGhlIHdlc3QgZWRnZSBvZiB0aGUgYm91bmRpbmcgYm94LlxuICAgICAqL1xuICAgIGdldFdlc3QoKSB7IHJldHVybiB0aGlzLl9zdy5sbmc7IH1cblxuICAgIC8qKlxuICAgICogUmV0dXJucyB0aGUgc291dGggZWRnZSBvZiB0aGUgYm91bmRpbmcgYm94LlxuICAgICpcbiAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSBzb3V0aCBlZGdlIG9mIHRoZSBib3VuZGluZyBib3guXG4gICAgICovXG4gICAgZ2V0U291dGgoKSB7IHJldHVybiB0aGlzLl9zdy5sYXQ7IH1cblxuICAgIC8qKlxuICAgICogUmV0dXJucyB0aGUgZWFzdCBlZGdlIG9mIHRoZSBib3VuZGluZyBib3guXG4gICAgKlxuICAgICogQHJldHVybnMge251bWJlcn0gVGhlIGVhc3QgZWRnZSBvZiB0aGUgYm91bmRpbmcgYm94LlxuICAgICAqL1xuICAgIGdldEVhc3QoKSB7IHJldHVybiB0aGlzLl9uZS5sbmc7IH1cblxuICAgIC8qKlxuICAgICogUmV0dXJucyB0aGUgbm9ydGggZWRnZSBvZiB0aGUgYm91bmRpbmcgYm94LlxuICAgICpcbiAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSBub3J0aCBlZGdlIG9mIHRoZSBib3VuZGluZyBib3guXG4gICAgICovXG4gICAgZ2V0Tm9ydGgoKSB7IHJldHVybiB0aGlzLl9uZS5sYXQ7IH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGJvdW5kaW5nIGJveCByZXByZXNlbnRlZCBhcyBhbiBhcnJheS5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtBcnJheTxBcnJheTxudW1iZXI+Pn0gVGhlIGJvdW5kaW5nIGJveCByZXByZXNlbnRlZCBhcyBhbiBhcnJheSwgY29uc2lzdGluZyBvZiB0aGVcbiAgICAgKiAgIHNvdXRod2VzdCBhbmQgbm9ydGhlYXN0IGNvb3JkaW5hdGVzIG9mIHRoZSBib3VuZGluZyByZXByZXNlbnRlZCBhcyBhcnJheXMgb2YgbnVtYmVycy5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHZhciBsbGIgPSBuZXcgbWFwYm94Z2wuTG5nTGF0Qm91bmRzKFstNzMuOTg3NiwgNDAuNzY2MV0sIFstNzMuOTM5NywgNDAuODAwMl0pO1xuICAgICAqIGxsYi50b0FycmF5KCk7IC8vID0gW1stNzMuOTg3NiwgNDAuNzY2MV0sIFstNzMuOTM5NywgNDAuODAwMl1dXG4gICAgICovXG4gICAgdG9BcnJheSAoKSB7XG4gICAgICAgIHJldHVybiBbdGhpcy5fc3cudG9BcnJheSgpLCB0aGlzLl9uZS50b0FycmF5KCldO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybiB0aGUgYm91bmRpbmcgYm94IHJlcHJlc2VudGVkIGFzIGEgc3RyaW5nLlxuICAgICAqXG4gICAgICogQHJldHVybnMge3N0cmluZ30gVGhlIGJvdW5kaW5nIGJveCByZXByZXNlbnRzIGFzIGEgc3RyaW5nIG9mIHRoZSBmb3JtYXRcbiAgICAgKiAgIGAnTG5nTGF0Qm91bmRzKExuZ0xhdChsbmcsIGxhdCksIExuZ0xhdChsbmcsIGxhdCkpJ2AuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB2YXIgbGxiID0gbmV3IG1hcGJveGdsLkxuZ0xhdEJvdW5kcyhbLTczLjk4NzYsIDQwLjc2NjFdLCBbLTczLjkzOTcsIDQwLjgwMDJdKTtcbiAgICAgKiBsbGIudG9TdHJpbmcoKTsgLy8gPSBcIkxuZ0xhdEJvdW5kcyhMbmdMYXQoLTczLjk4NzYsIDQwLjc2NjEpLCBMbmdMYXQoLTczLjkzOTcsIDQwLjgwMDIpKVwiXG4gICAgICovXG4gICAgdG9TdHJpbmcgKCkge1xuICAgICAgICByZXR1cm4gYExuZ0xhdEJvdW5kcygke3RoaXMuX3N3LnRvU3RyaW5nKCl9LCAke3RoaXMuX25lLnRvU3RyaW5nKCl9KWA7XG4gICAgfVxufVxuXG4vKipcbiAqIENvbnZlcnRzIGFuIGFycmF5IHRvIGEgYExuZ0xhdEJvdW5kc2Agb2JqZWN0LlxuICpcbiAqIElmIGEgYExuZ0xhdEJvdW5kc2Agb2JqZWN0IGlzIHBhc3NlZCBpbiwgdGhlIGZ1bmN0aW9uIHJldHVybnMgaXQgdW5jaGFuZ2VkLlxuICpcbiAqIEludGVybmFsbHksIHRoZSBmdW5jdGlvbiBjYWxscyBgTG5nTGF0I2NvbnZlcnRgIHRvIGNvbnZlcnQgYXJyYXlzIHRvIGBMbmdMYXRgIHZhbHVlcy5cbiAqXG4gKiBAcGFyYW0ge0xuZ0xhdEJvdW5kc0xpa2V9IGlucHV0IEFuIGFycmF5IG9mIHR3byBjb29yZGluYXRlcyB0byBjb252ZXJ0LCBvciBhIGBMbmdMYXRCb3VuZHNgIG9iamVjdCB0byByZXR1cm4uXG4gKiBAcmV0dXJucyB7TG5nTGF0Qm91bmRzfSBBIG5ldyBgTG5nTGF0Qm91bmRzYCBvYmplY3QsIGlmIGEgY29udmVyc2lvbiBvY2N1cnJlZCwgb3IgdGhlIG9yaWdpbmFsIGBMbmdMYXRCb3VuZHNgIG9iamVjdC5cbiAqIEBleGFtcGxlXG4gKiB2YXIgYXJyID0gW1stNzMuOTg3NiwgNDAuNzY2MV0sIFstNzMuOTM5NywgNDAuODAwMl1dO1xuICogdmFyIGxsYiA9IG1hcGJveGdsLkxuZ0xhdEJvdW5kcy5jb252ZXJ0KGFycik7XG4gKiBsbGI7ICAgLy8gPSBMbmdMYXRCb3VuZHMge19zdzogTG5nTGF0IHtsbmc6IC03My45ODc2LCBsYXQ6IDQwLjc2NjF9LCBfbmU6IExuZ0xhdCB7bG5nOiAtNzMuOTM5NywgbGF0OiA0MC44MDAyfX1cbiAqL1xuTG5nTGF0Qm91bmRzLmNvbnZlcnQgPSBmdW5jdGlvbiAoaW5wdXQpIHtcbiAgICBpZiAoIWlucHV0IHx8IGlucHV0IGluc3RhbmNlb2YgTG5nTGF0Qm91bmRzKSByZXR1cm4gaW5wdXQ7XG4gICAgcmV0dXJuIG5ldyBMbmdMYXRCb3VuZHMoaW5wdXQpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBMbmdMYXRCb3VuZHM7XG4iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IExuZ0xhdEJvdW5kcyA9IHJlcXVpcmUoJy4uL2dlby9sbmdfbGF0X2JvdW5kcycpO1xuY29uc3QgY2xhbXAgPSByZXF1aXJlKCcuLi91dGlsL3V0aWwnKS5jbGFtcDtcblxuY2xhc3MgVGlsZUJvdW5kcyB7XG4gICAgY29uc3RydWN0b3IoYm91bmRzLCBtaW56b29tLCBtYXh6b29tKSB7XG4gICAgICAgIHRoaXMuYm91bmRzID0gTG5nTGF0Qm91bmRzLmNvbnZlcnQoYm91bmRzKTtcbiAgICAgICAgdGhpcy5taW56b29tID0gbWluem9vbSB8fCAwO1xuICAgICAgICB0aGlzLm1heHpvb20gPSBtYXh6b29tIHx8IDI0O1xuICAgIH1cblxuICAgIGNvbnRhaW5zKGNvb3JkLCBtYXh6b29tKSB7XG4gICAgICAgIC8vIFRpbGVDb29yZCByZXR1cm5zIGluY29ycmVjdCB6IGZvciBvdmVyc2NhbGVkIHRpbGVzLCBzbyB3ZSB1c2UgdGhpc1xuICAgICAgICAvLyB0byBtYWtlIHN1cmUgb3Zlcnpvb21lZCB0aWxlcyBzdGlsbCBnZXQgZGlzcGxheWVkLlxuICAgICAgICBjb25zdCB0aWxlWiA9IG1heHpvb20gPyBNYXRoLm1pbihjb29yZC56LCBtYXh6b29tKSA6IGNvb3JkLno7XG5cbiAgICAgICAgY29uc3QgbGV2ZWwgPSB7XG4gICAgICAgICAgICBtaW5YOiBNYXRoLmZsb29yKHRoaXMubG5nWCh0aGlzLmJvdW5kcy5nZXRXZXN0KCksIHRpbGVaKSksXG4gICAgICAgICAgICBtaW5ZOiBNYXRoLmZsb29yKHRoaXMubGF0WSh0aGlzLmJvdW5kcy5nZXROb3J0aCgpLCB0aWxlWikpLFxuICAgICAgICAgICAgbWF4WDogTWF0aC5jZWlsKHRoaXMubG5nWCh0aGlzLmJvdW5kcy5nZXRFYXN0KCksIHRpbGVaKSksXG4gICAgICAgICAgICBtYXhZOiBNYXRoLmNlaWwodGhpcy5sYXRZKHRoaXMuYm91bmRzLmdldFNvdXRoKCksIHRpbGVaKSlcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgaGl0ID0gY29vcmQueCA+PSBsZXZlbC5taW5YICYmIGNvb3JkLnggPCBsZXZlbC5tYXhYICYmIGNvb3JkLnkgPj0gbGV2ZWwubWluWSAmJiBjb29yZC55IDwgbGV2ZWwubWF4WTtcbiAgICAgICAgcmV0dXJuIGhpdDtcbiAgICB9XG5cbiAgICBsbmdYKGxuZywgem9vbSkge1xuICAgICAgICByZXR1cm4gKGxuZyArIDE4MCkgKiAoTWF0aC5wb3coMiwgem9vbSkgLyAzNjApO1xuICAgIH1cblxuICAgIGxhdFkobGF0LCB6b29tKSB7XG4gICAgICAgIGNvbnN0IGYgPSBjbGFtcChNYXRoLnNpbihNYXRoLlBJIC8gMTgwICogbGF0KSwgLTAuOTk5OSwgMC45OTk5KTtcbiAgICAgICAgY29uc3Qgc2NhbGUgPSBNYXRoLnBvdygyLCB6b29tKSAvICgyICogTWF0aC5QSSk7XG4gICAgICAgIHJldHVybiBNYXRoLnBvdygyLCB6b29tIC0gMSkgKyAwLjUgKiBNYXRoLmxvZygoMSArIGYpIC8gKDEgLSBmKSkgKiAtc2NhbGU7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRpbGVCb3VuZHM7XG4iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IHdpbmRvdyA9IHJlcXVpcmUoJy4vd2luZG93Jyk7XG5cbmNsYXNzIEFKQVhFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgICBjb25zdHJ1Y3RvcihtZXNzYWdlLCBzdGF0dXMpIHtcbiAgICAgICAgc3VwZXIobWVzc2FnZSk7XG4gICAgICAgIHRoaXMuc3RhdHVzID0gc3RhdHVzO1xuICAgIH1cbn1cblxuZXhwb3J0cy5nZXRKU09OID0gZnVuY3Rpb24odXJsLCBjYWxsYmFjaykge1xuICAgIGNvbnN0IHhociA9IG5ldyB3aW5kb3cuWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB4aHIub3BlbignR0VUJywgdXJsLCB0cnVlKTtcbiAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICB4aHIub25lcnJvciA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgY2FsbGJhY2soZSk7XG4gICAgfTtcbiAgICB4aHIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh4aHIuc3RhdHVzID49IDIwMCAmJiB4aHIuc3RhdHVzIDwgMzAwICYmIHhoci5yZXNwb25zZSkge1xuICAgICAgICAgICAgbGV0IGRhdGE7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGRhdGEgPSBKU09OLnBhcnNlKHhoci5yZXNwb25zZSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIGRhdGEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FsbGJhY2sobmV3IEFKQVhFcnJvcih4aHIuc3RhdHVzVGV4dCwgeGhyLnN0YXR1cykpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICB4aHIuc2VuZCgpO1xuICAgIHJldHVybiB4aHI7XG59O1xuXG5leHBvcnRzLmdldEFycmF5QnVmZmVyID0gZnVuY3Rpb24odXJsLCBjYWxsYmFjaykge1xuICAgIGNvbnN0IHhociA9IG5ldyB3aW5kb3cuWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB4aHIub3BlbignR0VUJywgdXJsLCB0cnVlKTtcbiAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2FycmF5YnVmZmVyJztcbiAgICB4aHIub25lcnJvciA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgY2FsbGJhY2soZSk7XG4gICAgfTtcbiAgICB4aHIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh4aHIucmVzcG9uc2UuYnl0ZUxlbmd0aCA9PT0gMCAmJiB4aHIuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhuZXcgRXJyb3IoJ2h0dHAgc3RhdHVzIDIwMCByZXR1cm5lZCB3aXRob3V0IGNvbnRlbnQuJykpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh4aHIuc3RhdHVzID49IDIwMCAmJiB4aHIuc3RhdHVzIDwgMzAwICYmIHhoci5yZXNwb25zZSkge1xuICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwge1xuICAgICAgICAgICAgICAgIGRhdGE6IHhoci5yZXNwb25zZSxcbiAgICAgICAgICAgICAgICBjYWNoZUNvbnRyb2w6IHhoci5nZXRSZXNwb25zZUhlYWRlcignQ2FjaGUtQ29udHJvbCcpLFxuICAgICAgICAgICAgICAgIGV4cGlyZXM6IHhoci5nZXRSZXNwb25zZUhlYWRlcignRXhwaXJlcycpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKG5ldyBBSkFYRXJyb3IoeGhyLnN0YXR1c1RleHQsIHhoci5zdGF0dXMpKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgeGhyLnNlbmQoKTtcbiAgICByZXR1cm4geGhyO1xufTtcblxuZnVuY3Rpb24gc2FtZU9yaWdpbih1cmwpIHtcbiAgICBjb25zdCBhID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICBhLmhyZWYgPSB1cmw7XG4gICAgcmV0dXJuIGEucHJvdG9jb2wgPT09IHdpbmRvdy5kb2N1bWVudC5sb2NhdGlvbi5wcm90b2NvbCAmJiBhLmhvc3QgPT09IHdpbmRvdy5kb2N1bWVudC5sb2NhdGlvbi5ob3N0O1xufVxuXG5jb25zdCB0cmFuc3BhcmVudFBuZ1VybCA9ICdkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUFFQUFBQUJDQVlBQUFBZkZjU0pBQUFBQzBsRVFWUVlWMk5nQUFJQUFBVUFBYXJWeUZFQUFBQUFTVVZPUks1Q1lJST0nO1xuXG5leHBvcnRzLmdldEltYWdlID0gZnVuY3Rpb24odXJsLCBjYWxsYmFjaykge1xuICAgIC8vIHJlcXVlc3QgdGhlIGltYWdlIHdpdGggWEhSIHRvIHdvcmsgYXJvdW5kIGNhY2hpbmcgaXNzdWVzXG4gICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXBib3gvbWFwYm94LWdsLWpzL2lzc3Vlcy8xNDcwXG4gICAgcmV0dXJuIGV4cG9ydHMuZ2V0QXJyYXlCdWZmZXIodXJsLCAoZXJyLCBpbWdEYXRhKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgICAgICBjb25zdCBpbWcgPSBuZXcgd2luZG93LkltYWdlKCk7XG4gICAgICAgIGNvbnN0IFVSTCA9IHdpbmRvdy5VUkwgfHwgd2luZG93LndlYmtpdFVSTDtcbiAgICAgICAgaW1nLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIGltZyk7XG4gICAgICAgICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKGltZy5zcmMpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBibG9iID0gbmV3IHdpbmRvdy5CbG9iKFtuZXcgVWludDhBcnJheShpbWdEYXRhLmRhdGEpXSwgeyB0eXBlOiAnaW1hZ2UvcG5nJyB9KTtcbiAgICAgICAgaW1nLmNhY2hlQ29udHJvbCA9IGltZ0RhdGEuY2FjaGVDb250cm9sO1xuICAgICAgICBpbWcuZXhwaXJlcyA9IGltZ0RhdGEuZXhwaXJlcztcbiAgICAgICAgaW1nLnNyYyA9IGltZ0RhdGEuZGF0YS5ieXRlTGVuZ3RoID8gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKSA6IHRyYW5zcGFyZW50UG5nVXJsO1xuICAgIH0pO1xufTtcblxuZXhwb3J0cy5nZXRWaWRlbyA9IGZ1bmN0aW9uKHVybHMsIGNhbGxiYWNrKSB7XG4gICAgY29uc3QgdmlkZW8gPSB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndmlkZW8nKTtcbiAgICB2aWRlby5vbmxvYWRzdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBjYWxsYmFjayhudWxsLCB2aWRlbyk7XG4gICAgfTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHVybHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgcyA9IHdpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzb3VyY2UnKTtcbiAgICAgICAgaWYgKCFzYW1lT3JpZ2luKHVybHNbaV0pKSB7XG4gICAgICAgICAgICB2aWRlby5jcm9zc09yaWdpbiA9ICdBbm9ueW1vdXMnO1xuICAgICAgICB9XG4gICAgICAgIHMuc3JjID0gdXJsc1tpXTtcbiAgICAgICAgdmlkZW8uYXBwZW5kQ2hpbGQocyk7XG4gICAgfVxuICAgIHJldHVybiB2aWRlbztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQG1vZHVsZSBicm93c2VyXG4gKiBAcHJpdmF0ZVxuICovXG5cbmNvbnN0IHdpbmRvdyA9IHJlcXVpcmUoJy4vd2luZG93Jyk7XG5cbi8qKlxuICogUHJvdmlkZXMgYSBmdW5jdGlvbiB0aGF0IG91dHB1dHMgbWlsbGlzZWNvbmRzOiBlaXRoZXIgcGVyZm9ybWFuY2Uubm93KClcbiAqIG9yIGEgZmFsbGJhY2sgdG8gRGF0ZS5ub3coKVxuICovXG5tb2R1bGUuZXhwb3J0cy5ub3cgPSAoZnVuY3Rpb24oKSB7XG4gICAgaWYgKHdpbmRvdy5wZXJmb3JtYW5jZSAmJlxuICAgICAgICB3aW5kb3cucGVyZm9ybWFuY2Uubm93KSB7XG4gICAgICAgIHJldHVybiB3aW5kb3cucGVyZm9ybWFuY2Uubm93LmJpbmQod2luZG93LnBlcmZvcm1hbmNlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gRGF0ZS5ub3cuYmluZChEYXRlKTtcbiAgICB9XG59KCkpO1xuXG5jb25zdCBmcmFtZSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgIHdpbmRvdy5tc1JlcXVlc3RBbmltYXRpb25GcmFtZTtcblxuZXhwb3J0cy5mcmFtZSA9IGZ1bmN0aW9uKGZuKSB7XG4gICAgcmV0dXJuIGZyYW1lKGZuKTtcbn07XG5cbmNvbnN0IGNhbmNlbCA9IHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSB8fFxuICAgIHdpbmRvdy5tb3pDYW5jZWxBbmltYXRpb25GcmFtZSB8fFxuICAgIHdpbmRvdy53ZWJraXRDYW5jZWxBbmltYXRpb25GcmFtZSB8fFxuICAgIHdpbmRvdy5tc0NhbmNlbEFuaW1hdGlvbkZyYW1lO1xuXG5leHBvcnRzLmNhbmNlbEZyYW1lID0gZnVuY3Rpb24oaWQpIHtcbiAgICBjYW5jZWwoaWQpO1xufTtcblxuZXhwb3J0cy50aW1lZCA9IGZ1bmN0aW9uIChmbiwgZHVyLCBjdHgpIHtcbiAgICBpZiAoIWR1cikge1xuICAgICAgICBmbi5jYWxsKGN0eCwgMSk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGxldCBhYm9ydCA9IGZhbHNlO1xuICAgIGNvbnN0IHN0YXJ0ID0gbW9kdWxlLmV4cG9ydHMubm93KCk7XG5cbiAgICBmdW5jdGlvbiB0aWNrKG5vdykge1xuICAgICAgICBpZiAoYWJvcnQpIHJldHVybjtcbiAgICAgICAgbm93ID0gbW9kdWxlLmV4cG9ydHMubm93KCk7XG5cbiAgICAgICAgaWYgKG5vdyA+PSBzdGFydCArIGR1cikge1xuICAgICAgICAgICAgZm4uY2FsbChjdHgsIDEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm4uY2FsbChjdHgsIChub3cgLSBzdGFydCkgLyBkdXIpO1xuICAgICAgICAgICAgZXhwb3J0cy5mcmFtZSh0aWNrKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydHMuZnJhbWUodGljayk7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7IGFib3J0ID0gdHJ1ZTsgfTtcbn07XG5cbmV4cG9ydHMuZ2V0SW1hZ2VEYXRhID0gZnVuY3Rpb24gKGltZykge1xuICAgIGNvbnN0IGNhbnZhcyA9IHdpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICBjb25zdCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgY2FudmFzLndpZHRoID0gaW1nLndpZHRoO1xuICAgIGNhbnZhcy5oZWlnaHQgPSBpbWcuaGVpZ2h0O1xuICAgIGNvbnRleHQuZHJhd0ltYWdlKGltZywgMCwgMCwgaW1nLndpZHRoLCBpbWcuaGVpZ2h0KTtcbiAgICByZXR1cm4gY29udGV4dC5nZXRJbWFnZURhdGEoMCwgMCwgaW1nLndpZHRoLCBpbWcuaGVpZ2h0KS5kYXRhO1xufTtcblxuLyoqXG4gKiBUZXN0IGlmIHRoZSBjdXJyZW50IGJyb3dzZXIgc3VwcG9ydHMgTWFwYm94IEdMIEpTXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5mYWlsSWZNYWpvclBlcmZvcm1hbmNlQ2F2ZWF0PWZhbHNlXSBSZXR1cm4gYGZhbHNlYFxuICogICBpZiB0aGUgcGVyZm9ybWFuY2Ugb2YgTWFwYm94IEdMIEpTIHdvdWxkIGJlIGRyYW1hdGljYWxseSB3b3JzZSB0aGFuXG4gKiAgIGV4cGVjdGVkIChpLmUuIGEgc29mdHdhcmUgcmVuZGVyZXIgd291bGQgYmUgdXNlZClcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmV4cG9ydHMuc3VwcG9ydGVkID0gcmVxdWlyZSgnbWFwYm94LWdsLXN1cHBvcnRlZCcpO1xuXG5leHBvcnRzLmhhcmR3YXJlQ29uY3VycmVuY3kgPSB3aW5kb3cubmF2aWdhdG9yLmhhcmR3YXJlQ29uY3VycmVuY3kgfHwgNDtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdkZXZpY2VQaXhlbFJhdGlvJywge1xuICAgIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbzsgfVxufSk7XG5cbmV4cG9ydHMuc3VwcG9ydHNXZWJwID0gZmFsc2U7XG5cbmNvbnN0IHdlYnBJbWdUZXN0ID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xud2VicEltZ1Rlc3Qub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgZXhwb3J0cy5zdXBwb3J0c1dlYnAgPSB0cnVlO1xufTtcbndlYnBJbWdUZXN0LnNyYyA9ICdkYXRhOmltYWdlL3dlYnA7YmFzZTY0LFVrbEdSaDRBQUFCWFJVSlFWbEE0VEJFQUFBQXZBUUFBQUFmUS8vNzN2LytCaU9oL0FBQT0nO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKiBlc2xpbnQtZW52IGJyb3dzZXIgKi9cbm1vZHVsZS5leHBvcnRzID0gc2VsZjtcbiIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5mdW5jdGlvbiBfYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgbGlzdGVuZXJMaXN0KSB7XG4gICAgbGlzdGVuZXJMaXN0W3R5cGVdID0gbGlzdGVuZXJMaXN0W3R5cGVdIHx8IFtdO1xuICAgIGxpc3RlbmVyTGlzdFt0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbn1cblxuZnVuY3Rpb24gX3JlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIGxpc3RlbmVyTGlzdCkge1xuICAgIGlmIChsaXN0ZW5lckxpc3QgJiYgbGlzdGVuZXJMaXN0W3R5cGVdKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gbGlzdGVuZXJMaXN0W3R5cGVdLmluZGV4T2YobGlzdGVuZXIpO1xuICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgICBsaXN0ZW5lckxpc3RbdHlwZV0uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBNZXRob2RzIG1peGVkIGluIHRvIG90aGVyIGNsYXNzZXMgZm9yIGV2ZW50IGNhcGFiaWxpdGllcy5cbiAqXG4gKiBAbWl4aW4gRXZlbnRlZFxuICovXG5jbGFzcyBFdmVudGVkIHtcblxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBsaXN0ZW5lciB0byBhIHNwZWNpZmllZCBldmVudCB0eXBlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgVGhlIGV2ZW50IHR5cGUgdG8gYWRkIGEgbGlzdGVuIGZvci5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lciBUaGUgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW4gdGhlIGV2ZW50IGlzIGZpcmVkLlxuICAgICAqICAgVGhlIGxpc3RlbmVyIGZ1bmN0aW9uIGlzIGNhbGxlZCB3aXRoIHRoZSBkYXRhIG9iamVjdCBwYXNzZWQgdG8gYGZpcmVgLFxuICAgICAqICAgZXh0ZW5kZWQgd2l0aCBgdGFyZ2V0YCBhbmQgYHR5cGVgIHByb3BlcnRpZXMuXG4gICAgICogQHJldHVybnMge09iamVjdH0gYHRoaXNgXG4gICAgICovXG4gICAgb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgICAgdGhpcy5fbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzIHx8IHt9O1xuICAgICAgICBfYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgdGhpcy5fbGlzdGVuZXJzKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGEgcHJldmlvdXNseSByZWdpc3RlcmVkIGV2ZW50IGxpc3RlbmVyLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgVGhlIGV2ZW50IHR5cGUgdG8gcmVtb3ZlIGxpc3RlbmVycyBmb3IuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXIgVGhlIGxpc3RlbmVyIGZ1bmN0aW9uIHRvIHJlbW92ZS5cbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBgdGhpc2BcbiAgICAgKi9cbiAgICBvZmYodHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgICAgX3JlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIHRoaXMuX2xpc3RlbmVycyk7XG4gICAgICAgIF9yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCB0aGlzLl9vbmVUaW1lTGlzdGVuZXJzKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgbGlzdGVuZXIgdGhhdCB3aWxsIGJlIGNhbGxlZCBvbmx5IG9uY2UgdG8gYSBzcGVjaWZpZWQgZXZlbnQgdHlwZS5cbiAgICAgKlxuICAgICAqIFRoZSBsaXN0ZW5lciB3aWxsIGJlIGNhbGxlZCBmaXJzdCB0aW1lIHRoZSBldmVudCBmaXJlcyBhZnRlciB0aGUgbGlzdGVuZXIgaXMgcmVnaXN0ZXJlZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIFRoZSBldmVudCB0eXBlIHRvIGxpc3RlbiBmb3IuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXIgVGhlIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBldmVudCBpcyBmaXJlZCB0aGUgZmlyc3QgdGltZS5cbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBgdGhpc2BcbiAgICAgKi9cbiAgICBvbmNlKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICAgIHRoaXMuX29uZVRpbWVMaXN0ZW5lcnMgPSB0aGlzLl9vbmVUaW1lTGlzdGVuZXJzIHx8IHt9O1xuICAgICAgICBfYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgdGhpcy5fb25lVGltZUxpc3RlbmVycyk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmlyZXMgYW4gZXZlbnQgb2YgdGhlIHNwZWNpZmllZCB0eXBlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgVGhlIHR5cGUgb2YgZXZlbnQgdG8gZmlyZS5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW2RhdGFdIERhdGEgdG8gYmUgcGFzc2VkIHRvIGFueSBsaXN0ZW5lcnMuXG4gICAgICogQHJldHVybnMge09iamVjdH0gYHRoaXNgXG4gICAgICovXG4gICAgZmlyZSh0eXBlLCBkYXRhKSB7XG4gICAgICAgIGlmICh0aGlzLmxpc3RlbnModHlwZSkpIHtcbiAgICAgICAgICAgIGRhdGEgPSB1dGlsLmV4dGVuZCh7fSwgZGF0YSwge3R5cGU6IHR5cGUsIHRhcmdldDogdGhpc30pO1xuXG4gICAgICAgICAgICAvLyBtYWtlIHN1cmUgYWRkaW5nIG9yIHJlbW92aW5nIGxpc3RlbmVycyBpbnNpZGUgb3RoZXIgbGlzdGVuZXJzIHdvbid0IGNhdXNlIGFuIGluZmluaXRlIGxvb3BcbiAgICAgICAgICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycyAmJiB0aGlzLl9saXN0ZW5lcnNbdHlwZV0gPyB0aGlzLl9saXN0ZW5lcnNbdHlwZV0uc2xpY2UoKSA6IFtdO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3RlbmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyc1tpXS5jYWxsKHRoaXMsIGRhdGEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBvbmVUaW1lTGlzdGVuZXJzID0gdGhpcy5fb25lVGltZUxpc3RlbmVycyAmJiB0aGlzLl9vbmVUaW1lTGlzdGVuZXJzW3R5cGVdID8gdGhpcy5fb25lVGltZUxpc3RlbmVyc1t0eXBlXS5zbGljZSgpIDogW107XG5cbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb25lVGltZUxpc3RlbmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIG9uZVRpbWVMaXN0ZW5lcnNbaV0uY2FsbCh0aGlzLCBkYXRhKTtcbiAgICAgICAgICAgICAgICBfcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBvbmVUaW1lTGlzdGVuZXJzW2ldLCB0aGlzLl9vbmVUaW1lTGlzdGVuZXJzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMuX2V2ZW50ZWRQYXJlbnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9ldmVudGVkUGFyZW50LmZpcmUodHlwZSwgdXRpbC5leHRlbmQoe30sIGRhdGEsIHR5cGVvZiB0aGlzLl9ldmVudGVkUGFyZW50RGF0YSA9PT0gJ2Z1bmN0aW9uJyA/IHRoaXMuX2V2ZW50ZWRQYXJlbnREYXRhKCkgOiB0aGlzLl9ldmVudGVkUGFyZW50RGF0YSkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIC8vIFRvIGVuc3VyZSB0aGF0IG5vIGVycm9yIGV2ZW50cyBhcmUgZHJvcHBlZCwgcHJpbnQgdGhlbSB0byB0aGVcbiAgICAgICAgLy8gY29uc29sZSBpZiB0aGV5IGhhdmUgbm8gbGlzdGVuZXJzLlxuICAgICAgICB9IGVsc2UgaWYgKHV0aWwuZW5kc1dpdGgodHlwZSwgJ2Vycm9yJykpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoKGRhdGEgJiYgZGF0YS5lcnJvcikgfHwgZGF0YSB8fCAnRW1wdHkgZXJyb3IgZXZlbnQnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSB0cnVlIGlmIHRoaXMgaW5zdGFuY2Ugb2YgRXZlbnRlZCBvciBhbnkgZm9yd2FyZGVlZCBpbnN0YW5jZXMgb2YgRXZlbnRlZCBoYXZlIGEgbGlzdGVuZXIgZm9yIHRoZSBzcGVjaWZpZWQgdHlwZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIFRoZSBldmVudCB0eXBlXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IGB0cnVlYCBpZiB0aGVyZSBpcyBhdCBsZWFzdCBvbmUgcmVnaXN0ZXJlZCBsaXN0ZW5lciBmb3Igc3BlY2lmaWVkIGV2ZW50IHR5cGUsIGBmYWxzZWAgb3RoZXJ3aXNlXG4gICAgICovXG4gICAgbGlzdGVucyh0eXBlKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAodGhpcy5fbGlzdGVuZXJzICYmIHRoaXMuX2xpc3RlbmVyc1t0eXBlXSAmJiB0aGlzLl9saXN0ZW5lcnNbdHlwZV0ubGVuZ3RoID4gMCkgfHxcbiAgICAgICAgICAgICh0aGlzLl9vbmVUaW1lTGlzdGVuZXJzICYmIHRoaXMuX29uZVRpbWVMaXN0ZW5lcnNbdHlwZV0gJiYgdGhpcy5fb25lVGltZUxpc3RlbmVyc1t0eXBlXS5sZW5ndGggPiAwKSB8fFxuICAgICAgICAgICAgKHRoaXMuX2V2ZW50ZWRQYXJlbnQgJiYgdGhpcy5fZXZlbnRlZFBhcmVudC5saXN0ZW5zKHR5cGUpKVxuICAgICAgICApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEJ1YmJsZSBhbGwgZXZlbnRzIGZpcmVkIGJ5IHRoaXMgaW5zdGFuY2Ugb2YgRXZlbnRlZCB0byB0aGlzIHBhcmVudCBpbnN0YW5jZSBvZiBFdmVudGVkLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge3BhcmVudH1cbiAgICAgKiBAcGFyYW0ge2RhdGF9XG4gICAgICogQHJldHVybnMge09iamVjdH0gYHRoaXNgXG4gICAgICovXG4gICAgc2V0RXZlbnRlZFBhcmVudChwYXJlbnQsIGRhdGEpIHtcbiAgICAgICAgdGhpcy5fZXZlbnRlZFBhcmVudCA9IHBhcmVudDtcbiAgICAgICAgdGhpcy5fZXZlbnRlZFBhcmVudERhdGEgPSBkYXRhO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFdmVudGVkO1xuIiwiJ3VzZSBzdHJpY3QnO1xuLy8gICAgICBcblxuY29uc3QgVW5pdEJlemllciA9IHJlcXVpcmUoJ0BtYXBib3gvdW5pdGJlemllcicpO1xuY29uc3QgQ29vcmRpbmF0ZSA9IHJlcXVpcmUoJy4uL2dlby9jb29yZGluYXRlJyk7XG5jb25zdCBQb2ludCA9IHJlcXVpcmUoJ3BvaW50LWdlb21ldHJ5Jyk7XG5cbi8qKlxuICogR2l2ZW4gYSB2YWx1ZSBgdGAgdGhhdCB2YXJpZXMgYmV0d2VlbiAwIGFuZCAxLCByZXR1cm5cbiAqIGFuIGludGVycG9sYXRpb24gZnVuY3Rpb24gdGhhdCBlYXNlcyBiZXR3ZWVuIDAgYW5kIDEgaW4gYSBwbGVhc2luZ1xuICogY3ViaWMgaW4tb3V0IGZhc2hpb24uXG4gKlxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0cy5lYXNlQ3ViaWNJbk91dCA9IGZ1bmN0aW9uKHQgICAgICAgICkgICAgICAgICB7XG4gICAgaWYgKHQgPD0gMCkgcmV0dXJuIDA7XG4gICAgaWYgKHQgPj0gMSkgcmV0dXJuIDE7XG4gICAgY29uc3QgdDIgPSB0ICogdCxcbiAgICAgICAgdDMgPSB0MiAqIHQ7XG4gICAgcmV0dXJuIDQgKiAodCA8IDAuNSA/IHQzIDogMyAqICh0IC0gdDIpICsgdDMgLSAwLjc1KTtcbn07XG5cbi8qKlxuICogR2l2ZW4gZ2l2ZW4gKHgsIHkpLCAoeDEsIHkxKSBjb250cm9sIHBvaW50cyBmb3IgYSBiZXppZXIgY3VydmUsXG4gKiByZXR1cm4gYSBmdW5jdGlvbiB0aGF0IGludGVycG9sYXRlcyBhbG9uZyB0aGF0IGN1cnZlLlxuICpcbiAqIEBwYXJhbSBwMXggY29udHJvbCBwb2ludCAxIHggY29vcmRpbmF0ZVxuICogQHBhcmFtIHAxeSBjb250cm9sIHBvaW50IDEgeSBjb29yZGluYXRlXG4gKiBAcGFyYW0gcDJ4IGNvbnRyb2wgcG9pbnQgMiB4IGNvb3JkaW5hdGVcbiAqIEBwYXJhbSBwMnkgY29udHJvbCBwb2ludCAyIHkgY29vcmRpbmF0ZVxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0cy5iZXppZXIgPSBmdW5jdGlvbihwMXggICAgICAgICwgcDF5ICAgICAgICAsIHAyeCAgICAgICAgLCBwMnkgICAgICAgICkgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgY29uc3QgYmV6aWVyID0gbmV3IFVuaXRCZXppZXIocDF4LCBwMXksIHAyeCwgcDJ5KTtcbiAgICByZXR1cm4gZnVuY3Rpb24odCAgICAgICAgKSB7XG4gICAgICAgIHJldHVybiBiZXppZXIuc29sdmUodCk7XG4gICAgfTtcbn07XG5cbi8qKlxuICogQSBkZWZhdWx0IGJlemllci1jdXJ2ZSBwb3dlcmVkIGVhc2luZyBmdW5jdGlvbiB3aXRoXG4gKiBjb250cm9sIHBvaW50cyAoMC4yNSwgMC4xKSBhbmQgKDAuMjUsIDEpXG4gKlxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0cy5lYXNlID0gZXhwb3J0cy5iZXppZXIoMC4yNSwgMC4xLCAwLjI1LCAxKTtcblxuLyoqXG4gKiBjb25zdHJhaW4gbiB0byB0aGUgZ2l2ZW4gcmFuZ2UgdmlhIG1pbiArIG1heFxuICpcbiAqIEBwYXJhbSBuIHZhbHVlXG4gKiBAcGFyYW0gbWluIHRoZSBtaW5pbXVtIHZhbHVlIHRvIGJlIHJldHVybmVkXG4gKiBAcGFyYW0gbWF4IHRoZSBtYXhpbXVtIHZhbHVlIHRvIGJlIHJldHVybmVkXG4gKiBAcmV0dXJucyB0aGUgY2xhbXBlZCB2YWx1ZVxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0cy5jbGFtcCA9IGZ1bmN0aW9uIChuICAgICAgICAsIG1pbiAgICAgICAgLCBtYXggICAgICAgICkgICAgICAgICB7XG4gICAgcmV0dXJuIE1hdGgubWluKG1heCwgTWF0aC5tYXgobWluLCBuKSk7XG59O1xuXG4vKipcbiAqIGNvbnN0cmFpbiBuIHRvIHRoZSBnaXZlbiByYW5nZSwgZXhjbHVkaW5nIHRoZSBtaW5pbXVtLCB2aWEgbW9kdWxhciBhcml0aG1ldGljXG4gKlxuICogQHBhcmFtIG4gdmFsdWVcbiAqIEBwYXJhbSBtaW4gdGhlIG1pbmltdW0gdmFsdWUgdG8gYmUgcmV0dXJuZWQsIGV4Y2x1c2l2ZVxuICogQHBhcmFtIG1heCB0aGUgbWF4aW11bSB2YWx1ZSB0byBiZSByZXR1cm5lZCwgaW5jbHVzaXZlXG4gKiBAcmV0dXJucyBjb25zdHJhaW5lZCBudW1iZXJcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydHMud3JhcCA9IGZ1bmN0aW9uIChuICAgICAgICAsIG1pbiAgICAgICAgLCBtYXggICAgICAgICkgICAgICAgICB7XG4gICAgY29uc3QgZCA9IG1heCAtIG1pbjtcbiAgICBjb25zdCB3ID0gKChuIC0gbWluKSAlIGQgKyBkKSAlIGQgKyBtaW47XG4gICAgcmV0dXJuICh3ID09PSBtaW4pID8gbWF4IDogdztcbn07XG5cbi8qXG4gKiBDYWxsIGFuIGFzeW5jaHJvbm91cyBmdW5jdGlvbiBvbiBhbiBhcnJheSBvZiBhcmd1bWVudHMsXG4gKiBjYWxsaW5nIGBjYWxsYmFja2Agd2l0aCB0aGUgY29tcGxldGVkIHJlc3VsdHMgb2YgYWxsIGNhbGxzLlxuICpcbiAqIEBwYXJhbSBhcnJheSBpbnB1dCB0byBlYWNoIGNhbGwgb2YgdGhlIGFzeW5jIGZ1bmN0aW9uLlxuICogQHBhcmFtIGZuIGFuIGFzeW5jIGZ1bmN0aW9uIHdpdGggc2lnbmF0dXJlIChkYXRhLCBjYWxsYmFjaylcbiAqIEBwYXJhbSBjYWxsYmFjayBhIGNhbGxiYWNrIHJ1biBhZnRlciBhbGwgYXN5bmMgd29yayBpcyBkb25lLlxuICogY2FsbGVkIHdpdGggYW4gYXJyYXksIGNvbnRhaW5pbmcgdGhlIHJlc3VsdHMgb2YgZWFjaCBhc3luYyBjYWxsLlxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0cy5hc3luY0FsbCA9IGZ1bmN0aW9uIChhcnJheSAgICAgICAgICAgICwgZm4gICAgICAgICAgLCBjYWxsYmFjayAgICAgICAgICApIHtcbiAgICBpZiAoIWFycmF5Lmxlbmd0aCkgeyByZXR1cm4gY2FsbGJhY2sobnVsbCwgW10pOyB9XG4gICAgbGV0IHJlbWFpbmluZyA9IGFycmF5Lmxlbmd0aDtcbiAgICBjb25zdCByZXN1bHRzID0gbmV3IEFycmF5KGFycmF5Lmxlbmd0aCk7XG4gICAgbGV0IGVycm9yID0gbnVsbDtcbiAgICBhcnJheS5mb3JFYWNoKChpdGVtLCBpKSA9PiB7XG4gICAgICAgIGZuKGl0ZW0sIChlcnIsIHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgaWYgKGVycikgZXJyb3IgPSBlcnI7XG4gICAgICAgICAgICByZXN1bHRzW2ldID0gcmVzdWx0O1xuICAgICAgICAgICAgaWYgKC0tcmVtYWluaW5nID09PSAwKSBjYWxsYmFjayhlcnJvciwgcmVzdWx0cyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblxuLypcbiAqIFBvbHlmaWxsIGZvciBPYmplY3QudmFsdWVzLiBOb3QgZnVsbHkgc3BlYyBjb21wbGlhbnQsIGJ1dCB3ZSBkb24ndFxuICogbmVlZCBpdCB0byBiZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnRzLnZhbHVlcyA9IGZ1bmN0aW9uIChvYmogICAgICAgICkgICAgICAgICAgICAgICAge1xuICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuICAgIGZvciAoY29uc3QgayBpbiBvYmopIHtcbiAgICAgICAgcmVzdWx0LnB1c2gob2JqW2tdKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qXG4gKiBDb21wdXRlIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gdGhlIGtleXMgaW4gb25lIG9iamVjdCBhbmQgdGhlIGtleXNcbiAqIGluIGFub3RoZXIgb2JqZWN0LlxuICpcbiAqIEByZXR1cm5zIGtleXMgZGlmZmVyZW5jZVxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0cy5rZXlzRGlmZmVyZW5jZSA9IGZ1bmN0aW9uIChvYmogICAgICAgICwgb3RoZXIgICAgICAgICkgICAgICAgICAgICAgICAge1xuICAgIGNvbnN0IGRpZmZlcmVuY2UgPSBbXTtcbiAgICBmb3IgKGNvbnN0IGkgaW4gb2JqKSB7XG4gICAgICAgIGlmICghKGkgaW4gb3RoZXIpKSB7XG4gICAgICAgICAgICBkaWZmZXJlbmNlLnB1c2goaSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRpZmZlcmVuY2U7XG59O1xuXG4vKipcbiAqIEdpdmVuIGEgZGVzdGluYXRpb24gb2JqZWN0IGFuZCBvcHRpb25hbGx5IG1hbnkgc291cmNlIG9iamVjdHMsXG4gKiBjb3B5IGFsbCBwcm9wZXJ0aWVzIGZyb20gdGhlIHNvdXJjZSBvYmplY3RzIGludG8gdGhlIGRlc3RpbmF0aW9uLlxuICogVGhlIGxhc3Qgc291cmNlIG9iamVjdCBnaXZlbiBvdmVycmlkZXMgcHJvcGVydGllcyBmcm9tIHByZXZpb3VzXG4gKiBzb3VyY2Ugb2JqZWN0cy5cbiAqXG4gKiBAcGFyYW0gZGVzdCBkZXN0aW5hdGlvbiBvYmplY3RcbiAqIEBwYXJhbSB7Li4uT2JqZWN0fSBzb3VyY2VzIHNvdXJjZXMgZnJvbSB3aGljaCBwcm9wZXJ0aWVzIGFyZSBwdWxsZWRcbiAqIEBwcml2YXRlXG4gKi9cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bnVzZWQtdmFyc1xuZXhwb3J0cy5leHRlbmQgPSBmdW5jdGlvbiAoZGVzdCAgICAgICAgLCBzb3VyY2UwICAgICAgICAsIHNvdXJjZTEgICAgICAgICAsIHNvdXJjZTIgICAgICAgICApICAgICAgICAge1xuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHNyYyA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgZm9yIChjb25zdCBrIGluIHNyYykge1xuICAgICAgICAgICAgZGVzdFtrXSA9IHNyY1trXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGVzdDtcbn07XG5cbi8qKlxuICogR2l2ZW4gYW4gb2JqZWN0IGFuZCBhIG51bWJlciBvZiBwcm9wZXJ0aWVzIGFzIHN0cmluZ3MsIHJldHVybiB2ZXJzaW9uXG4gKiBvZiB0aGF0IG9iamVjdCB3aXRoIG9ubHkgdGhvc2UgcHJvcGVydGllcy5cbiAqXG4gKiBAcGFyYW0gc3JjIHRoZSBvYmplY3RcbiAqIEBwYXJhbSBwcm9wZXJ0aWVzIGFuIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzIGNob3NlblxuICogdG8gYXBwZWFyIG9uIHRoZSByZXN1bHRpbmcgb2JqZWN0LlxuICogQHJldHVybnMgb2JqZWN0IHdpdGggbGltaXRlZCBwcm9wZXJ0aWVzLlxuICogQGV4YW1wbGVcbiAqIHZhciBmb28gPSB7IG5hbWU6ICdDaGFybGllJywgYWdlOiAxMCB9O1xuICogdmFyIGp1c3ROYW1lID0gcGljayhmb28sIFsnbmFtZSddKTtcbiAqIC8vIGp1c3ROYW1lID0geyBuYW1lOiAnQ2hhcmxpZScgfVxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0cy5waWNrID0gZnVuY3Rpb24gKHNyYyAgICAgICAgLCBwcm9wZXJ0aWVzICAgICAgICAgICAgICAgKSAgICAgICAgIHtcbiAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByb3BlcnRpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgayA9IHByb3BlcnRpZXNbaV07XG4gICAgICAgIGlmIChrIGluIHNyYykge1xuICAgICAgICAgICAgcmVzdWx0W2tdID0gc3JjW2tdO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG5sZXQgaWQgPSAxO1xuXG4vKipcbiAqIFJldHVybiBhIHVuaXF1ZSBudW1lcmljIGlkLCBzdGFydGluZyBhdCAxIGFuZCBpbmNyZW1lbnRpbmcgd2l0aFxuICogZWFjaCBjYWxsLlxuICpcbiAqIEByZXR1cm5zIHVuaXF1ZSBudW1lcmljIGlkLlxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0cy51bmlxdWVJZCA9IGZ1bmN0aW9uICgpICAgICAgICAge1xuICAgIHJldHVybiBpZCsrO1xufTtcblxuLyoqXG4gKiBHaXZlbiBhbiBhcnJheSBvZiBtZW1iZXIgZnVuY3Rpb24gbmFtZXMgYXMgc3RyaW5ncywgcmVwbGFjZSBhbGwgb2YgdGhlbVxuICogd2l0aCBib3VuZCB2ZXJzaW9ucyB0aGF0IHdpbGwgYWx3YXlzIHJlZmVyIHRvIGBjb250ZXh0YCBhcyBgdGhpc2AuIFRoaXNcbiAqIGlzIHVzZWZ1bCBmb3IgY2xhc3NlcyB3aGVyZSBvdGhlcndpc2UgZXZlbnQgYmluZGluZ3Mgd291bGQgcmVhc3NpZ25cbiAqIGB0aGlzYCB0byB0aGUgZXZlbnRlZCBvYmplY3Qgb3Igc29tZSBvdGhlciB2YWx1ZTogdGhpcyBsZXRzIHlvdSBlbnN1cmVcbiAqIHRoZSBgdGhpc2AgdmFsdWUgYWx3YXlzLlxuICpcbiAqIEBwYXJhbSBmbnMgbGlzdCBvZiBtZW1iZXIgZnVuY3Rpb24gbmFtZXNcbiAqIEBwYXJhbSBjb250ZXh0IHRoZSBjb250ZXh0IHZhbHVlXG4gKiBAZXhhbXBsZVxuICogZnVuY3Rpb24gTXlDbGFzcygpIHtcbiAqICAgYmluZEFsbChbJ29udGltZXInXSwgdGhpcyk7XG4gKiAgIHRoaXMubmFtZSA9ICdUb20nO1xuICogfVxuICogTXlDbGFzcy5wcm90b3R5cGUub250aW1lciA9IGZ1bmN0aW9uKCkge1xuICogICBhbGVydCh0aGlzLm5hbWUpO1xuICogfTtcbiAqIHZhciBteUNsYXNzID0gbmV3IE15Q2xhc3MoKTtcbiAqIHNldFRpbWVvdXQobXlDbGFzcy5vbnRpbWVyLCAxMDApO1xuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0cy5iaW5kQWxsID0gZnVuY3Rpb24oZm5zICAgICAgICAgICAgICAgLCBjb250ZXh0ICAgICAgICApICAgICAgIHtcbiAgICBmbnMuZm9yRWFjaCgoZm4pID0+IHtcbiAgICAgICAgaWYgKCFjb250ZXh0W2ZuXSkgeyByZXR1cm47IH1cbiAgICAgICAgY29udGV4dFtmbl0gPSBjb250ZXh0W2ZuXS5iaW5kKGNvbnRleHQpO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBHaXZlbiBhIGxpc3Qgb2YgY29vcmRpbmF0ZXMsIGdldCB0aGVpciBjZW50ZXIgYXMgYSBjb29yZGluYXRlLlxuICpcbiAqIEByZXR1cm5zIGNlbnRlcnBvaW50XG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnRzLmdldENvb3JkaW5hdGVzQ2VudGVyID0gZnVuY3Rpb24oY29vcmRzICAgICAgICAgICAgICAgICAgICkgICAgICAgICAgICAge1xuICAgIGxldCBtaW5YID0gSW5maW5pdHk7XG4gICAgbGV0IG1pblkgPSBJbmZpbml0eTtcbiAgICBsZXQgbWF4WCA9IC1JbmZpbml0eTtcbiAgICBsZXQgbWF4WSA9IC1JbmZpbml0eTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29vcmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIG1pblggPSBNYXRoLm1pbihtaW5YLCBjb29yZHNbaV0uY29sdW1uKTtcbiAgICAgICAgbWluWSA9IE1hdGgubWluKG1pblksIGNvb3Jkc1tpXS5yb3cpO1xuICAgICAgICBtYXhYID0gTWF0aC5tYXgobWF4WCwgY29vcmRzW2ldLmNvbHVtbik7XG4gICAgICAgIG1heFkgPSBNYXRoLm1heChtYXhZLCBjb29yZHNbaV0ucm93KTtcbiAgICB9XG5cbiAgICBjb25zdCBkeCA9IG1heFggLSBtaW5YO1xuICAgIGNvbnN0IGR5ID0gbWF4WSAtIG1pblk7XG4gICAgY29uc3QgZE1heCA9IE1hdGgubWF4KGR4LCBkeSk7XG4gICAgY29uc3Qgem9vbSA9IE1hdGgubWF4KDAsIE1hdGguZmxvb3IoLU1hdGgubG9nKGRNYXgpIC8gTWF0aC5MTjIpKTtcbiAgICByZXR1cm4gbmV3IENvb3JkaW5hdGUoKG1pblggKyBtYXhYKSAvIDIsIChtaW5ZICsgbWF4WSkgLyAyLCAwKVxuICAgICAgICAuem9vbVRvKHpvb20pO1xufTtcblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSBzdHJpbmcgZW5kcyB3aXRoIGEgcGFydGljdWxhciBzdWJzdHJpbmdcbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnRzLmVuZHNXaXRoID0gZnVuY3Rpb24oc3RyaW5nICAgICAgICAsIHN1ZmZpeCAgICAgICAgKSAgICAgICAgICB7XG4gICAgcmV0dXJuIHN0cmluZy5pbmRleE9mKHN1ZmZpeCwgc3RyaW5nLmxlbmd0aCAtIHN1ZmZpeC5sZW5ndGgpICE9PSAtMTtcbn07XG5cbi8qKlxuICogQ3JlYXRlIGFuIG9iamVjdCBieSBtYXBwaW5nIGFsbCB0aGUgdmFsdWVzIG9mIGFuIGV4aXN0aW5nIG9iamVjdCB3aGlsZVxuICogcHJlc2VydmluZyB0aGVpciBrZXlzLlxuICpcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydHMubWFwT2JqZWN0ID0gZnVuY3Rpb24oaW5wdXQgICAgICAgICwgaXRlcmF0b3IgICAgICAgICAgLCBjb250ZXh0ICAgICAgICAgKSAgICAgICAgIHtcbiAgICBjb25zdCBvdXRwdXQgPSB7fTtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBpbnB1dCkge1xuICAgICAgICBvdXRwdXRba2V5XSA9IGl0ZXJhdG9yLmNhbGwoY29udGV4dCB8fCB0aGlzLCBpbnB1dFtrZXldLCBrZXksIGlucHV0KTtcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbn07XG5cbi8qKlxuICogQ3JlYXRlIGFuIG9iamVjdCBieSBmaWx0ZXJpbmcgb3V0IHZhbHVlcyBvZiBhbiBleGlzdGluZyBvYmplY3QuXG4gKlxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0cy5maWx0ZXJPYmplY3QgPSBmdW5jdGlvbihpbnB1dCAgICAgICAgLCBpdGVyYXRvciAgICAgICAgICAsIGNvbnRleHQgICAgICAgICApICAgICAgICAge1xuICAgIGNvbnN0IG91dHB1dCA9IHt9O1xuICAgIGZvciAoY29uc3Qga2V5IGluIGlucHV0KSB7XG4gICAgICAgIGlmIChpdGVyYXRvci5jYWxsKGNvbnRleHQgfHwgdGhpcywgaW5wdXRba2V5XSwga2V5LCBpbnB1dCkpIHtcbiAgICAgICAgICAgIG91dHB1dFtrZXldID0gaW5wdXRba2V5XTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0O1xufTtcblxuLyoqXG4gKiBEZWVwbHkgY29tcGFyZXMgdHdvIG9iamVjdCBsaXRlcmFscy5cbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnRzLmRlZXBFcXVhbCA9IGZ1bmN0aW9uKGEgICAgICAgICwgYiAgICAgICAgKSAgICAgICAgICB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoYSkpIHtcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGIpIHx8IGEubGVuZ3RoICE9PSBiLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICghZXhwb3J0cy5kZWVwRXF1YWwoYVtpXSwgYltpXSkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBhID09PSAnb2JqZWN0JyAmJiBhICE9PSBudWxsICYmIGIgIT09IG51bGwpIHtcbiAgICAgICAgaWYgKCEodHlwZW9mIGIgPT09ICdvYmplY3QnKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMoYSk7XG4gICAgICAgIGlmIChrZXlzLmxlbmd0aCAhPT0gT2JqZWN0LmtleXMoYikubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIGEpIHtcbiAgICAgICAgICAgIGlmICghZXhwb3J0cy5kZWVwRXF1YWwoYVtrZXldLCBiW2tleV0pKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBhID09PSBiO1xufTtcblxuLyoqXG4gKiBEZWVwbHkgY2xvbmVzIHR3byBvYmplY3RzLlxuICpcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydHMuY2xvbmUgPSBmdW5jdGlvbiAgIChpbnB1dCAgICkgICAge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGlucHV0KSkge1xuICAgICAgICByZXR1cm4gaW5wdXQubWFwKGV4cG9ydHMuY2xvbmUpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGlucHV0ID09PSAnb2JqZWN0JyAmJiBpbnB1dCkge1xuICAgICAgICByZXR1cm4gKChleHBvcnRzLm1hcE9iamVjdChpbnB1dCwgZXhwb3J0cy5jbG9uZSkgICAgICkgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBpbnB1dDtcbiAgICB9XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIHR3byBhcnJheXMgaGF2ZSBhdCBsZWFzdCBvbmUgY29tbW9uIGVsZW1lbnQuXG4gKlxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0cy5hcnJheXNJbnRlcnNlY3QgPSBmdW5jdGlvbihhICAgICAgICAgICAgLCBiICAgICAgICAgICAgKSAgICAgICAgICB7XG4gICAgZm9yIChsZXQgbCA9IDA7IGwgPCBhLmxlbmd0aDsgbCsrKSB7XG4gICAgICAgIGlmIChiLmluZGV4T2YoYVtsXSkgPj0gMCkgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn07XG5cbi8qKlxuICogUHJpbnQgYSB3YXJuaW5nIG1lc3NhZ2UgdG8gdGhlIGNvbnNvbGUgYW5kIGVuc3VyZSBkdXBsaWNhdGUgd2FybmluZyBtZXNzYWdlc1xuICogYXJlIG5vdCBwcmludGVkLlxuICpcbiAqIEBwcml2YXRlXG4gKi9cbmNvbnN0IHdhcm5PbmNlSGlzdG9yeSA9IHt9O1xuZXhwb3J0cy53YXJuT25jZSA9IGZ1bmN0aW9uKG1lc3NhZ2UgICAgICAgICkgICAgICAge1xuICAgIGlmICghd2Fybk9uY2VIaXN0b3J5W21lc3NhZ2VdKSB7XG4gICAgICAgIC8vIGNvbnNvbGUgaXNuJ3QgZGVmaW5lZCBpbiBzb21lIFdlYldvcmtlcnMsIHNlZSAjMjU1OFxuICAgICAgICBpZiAodHlwZW9mIGNvbnNvbGUgIT09IFwidW5kZWZpbmVkXCIpIGNvbnNvbGUud2FybihtZXNzYWdlKTtcbiAgICAgICAgd2Fybk9uY2VIaXN0b3J5W21lc3NhZ2VdID0gdHJ1ZTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEluZGljYXRlcyBpZiB0aGUgcHJvdmlkZWQgUG9pbnRzIGFyZSBpbiBhIGNvdW50ZXIgY2xvY2t3aXNlICh0cnVlKSBvciBjbG9ja3dpc2UgKGZhbHNlKSBvcmRlclxuICpcbiAqIEByZXR1cm5zIHRydWUgZm9yIGEgY291bnRlciBjbG9ja3dpc2Ugc2V0IG9mIHBvaW50c1xuICovXG4vLyBodHRwOi8vYnJ5Y2Vib2UuY29tLzIwMDYvMTAvMjMvbGluZS1zZWdtZW50LWludGVyc2VjdGlvbi1hbGdvcml0aG0vXG5leHBvcnRzLmlzQ291bnRlckNsb2Nrd2lzZSA9IGZ1bmN0aW9uKGEgICAgICAgLCBiICAgICAgICwgYyAgICAgICApICAgICAgICAgIHtcbiAgICByZXR1cm4gKGMueSAtIGEueSkgKiAoYi54IC0gYS54KSA+IChiLnkgLSBhLnkpICogKGMueCAtIGEueCk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIHNpZ25lZCBhcmVhIGZvciB0aGUgcG9seWdvbiByaW5nLiAgUG9zdGl2ZSBhcmVhcyBhcmUgZXh0ZXJpb3IgcmluZ3MgYW5kXG4gKiBoYXZlIGEgY2xvY2t3aXNlIHdpbmRpbmcuICBOZWdhdGl2ZSBhcmVhcyBhcmUgaW50ZXJpb3IgcmluZ3MgYW5kIGhhdmUgYSBjb3VudGVyIGNsb2Nrd2lzZVxuICogb3JkZXJpbmcuXG4gKlxuICogQHBhcmFtIHJpbmcgRXh0ZXJpb3Igb3IgaW50ZXJpb3IgcmluZ1xuICovXG5leHBvcnRzLmNhbGN1bGF0ZVNpZ25lZEFyZWEgPSBmdW5jdGlvbihyaW5nICAgICAgICAgICAgICApICAgICAgICAge1xuICAgIGxldCBzdW0gPSAwO1xuICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSByaW5nLmxlbmd0aCwgaiA9IGxlbiAtIDEsIHAxLCBwMjsgaSA8IGxlbjsgaiA9IGkrKykge1xuICAgICAgICBwMSA9IHJpbmdbaV07XG4gICAgICAgIHAyID0gcmluZ1tqXTtcbiAgICAgICAgc3VtICs9IChwMi54IC0gcDEueCkgKiAocDEueSArIHAyLnkpO1xuICAgIH1cbiAgICByZXR1cm4gc3VtO1xufTtcblxuLyoqXG4gKiBEZXRlY3RzIGNsb3NlZCBwb2x5Z29ucywgZmlyc3QgKyBsYXN0IHBvaW50IGFyZSBlcXVhbFxuICpcbiAqIEBwYXJhbSBwb2ludHMgYXJyYXkgb2YgcG9pbnRzXG4gKiBAcmV0dXJuIHRydWUgaWYgdGhlIHBvaW50cyBhcmUgYSBjbG9zZWQgcG9seWdvblxuICovXG5leHBvcnRzLmlzQ2xvc2VkUG9seWdvbiA9IGZ1bmN0aW9uKHBvaW50cyAgICAgICAgICAgICAgKSAgICAgICAgICB7XG4gICAgLy8gSWYgaXQgaXMgMiBwb2ludHMgdGhhdCBhcmUgdGhlIHNhbWUgdGhlbiBpdCBpcyBhIHBvaW50XG4gICAgLy8gSWYgaXQgaXMgMyBwb2ludHMgd2l0aCBzdGFydCBhbmQgZW5kIHRoZSBzYW1lIHRoZW4gaXQgaXMgYSBsaW5lXG4gICAgaWYgKHBvaW50cy5sZW5ndGggPCA0KVxuICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICBjb25zdCBwMSA9IHBvaW50c1swXTtcbiAgICBjb25zdCBwMiA9IHBvaW50c1twb2ludHMubGVuZ3RoIC0gMV07XG5cbiAgICBpZiAoTWF0aC5hYnMocDEueCAtIHAyLngpID4gMCB8fFxuICAgICAgICBNYXRoLmFicyhwMS55IC0gcDIueSkgPiAwKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBwb2x5Z29uIHNpbXBsaWZpY2F0aW9uIGNhbiBwcm9kdWNlIHBvbHlnb25zIHdpdGggemVybyBhcmVhIGFuZCBtb3JlIHRoYW4gMyBwb2ludHNcbiAgICByZXR1cm4gKE1hdGguYWJzKGV4cG9ydHMuY2FsY3VsYXRlU2lnbmVkQXJlYShwb2ludHMpKSA+IDAuMDEpO1xufTtcblxuLyoqXG4gKiBDb252ZXJ0cyBzcGhlcmljYWwgY29vcmRpbmF0ZXMgdG8gY2FydGVzaWFuIGNvb3JkaW5hdGVzLlxuICpcbiAqIEBwYXJhbSBzcGhlcmljYWwgU3BoZXJpY2FsIGNvb3JkaW5hdGVzLCBpbiBbcmFkaWFsLCBhemltdXRoYWwsIHBvbGFyXVxuICogQHJldHVybiBjYXJ0ZXNpYW4gY29vcmRpbmF0ZXMgaW4gW3gsIHksIHpdXG4gKi9cblxuZXhwb3J0cy5zcGhlcmljYWxUb0NhcnRlc2lhbiA9IGZ1bmN0aW9uKHNwaGVyaWNhbCAgICAgICAgICAgICAgICkgICAgICAgICAgICAgICAge1xuICAgIGNvbnN0IHIgPSBzcGhlcmljYWxbMF07XG4gICAgbGV0IGF6aW11dGhhbCA9IHNwaGVyaWNhbFsxXSxcbiAgICAgICAgcG9sYXIgPSBzcGhlcmljYWxbMl07XG4gICAgLy8gV2UgYWJzdHJhY3QgXCJub3J0aFwiL1widXBcIiAoY29tcGFzcy13aXNlKSB0byBiZSAwwrAgd2hlbiByZWFsbHkgdGhpcyBpcyA5MMKwICjPgC8yKTpcbiAgICAvLyBjb3JyZWN0IGZvciB0aGF0IGhlcmVcbiAgICBhemltdXRoYWwgKz0gOTA7XG5cbiAgICAvLyBDb252ZXJ0IGF6aW11dGhhbCBhbmQgcG9sYXIgYW5nbGVzIHRvIHJhZGlhbnNcbiAgICBhemltdXRoYWwgKj0gTWF0aC5QSSAvIDE4MDtcbiAgICBwb2xhciAqPSBNYXRoLlBJIC8gMTgwO1xuXG4gICAgLy8gc3BoZXJpY2FsIHRvIGNhcnRlc2lhbiAoeCwgeSwgeilcbiAgICByZXR1cm4gW1xuICAgICAgICByICogTWF0aC5jb3MoYXppbXV0aGFsKSAqIE1hdGguc2luKHBvbGFyKSxcbiAgICAgICAgciAqIE1hdGguc2luKGF6aW11dGhhbCkgKiBNYXRoLnNpbihwb2xhciksXG4gICAgICAgIHIgKiBNYXRoLmNvcyhwb2xhcilcbiAgICBdO1xufTtcblxuLyoqXG4gKiBQYXJzZXMgZGF0YSBmcm9tICdDYWNoZS1Db250cm9sJyBoZWFkZXJzLlxuICpcbiAqIEBwYXJhbSBjYWNoZUNvbnRyb2wgVmFsdWUgb2YgJ0NhY2hlLUNvbnRyb2wnIGhlYWRlclxuICogQHJldHVybiBvYmplY3QgY29udGFpbmluZyBwYXJzZWQgaGVhZGVyIGluZm8uXG4gKi9cblxuZXhwb3J0cy5wYXJzZUNhY2hlQ29udHJvbCA9IGZ1bmN0aW9uKGNhY2hlQ29udHJvbCAgICAgICAgKSAgICAgICAgIHtcbiAgICAvLyBUYWtlbiBmcm9tIFtXcmVja10oaHR0cHM6Ly9naXRodWIuY29tL2hhcGlqcy93cmVjaylcbiAgICBjb25zdCByZSA9IC8oPzpefCg/OlxccypcXCxcXHMqKSkoW15cXHgwMC1cXHgyMFxcKFxcKTw+QFxcLDtcXDpcXFxcXCJcXC9cXFtcXF1cXD9cXD1cXHtcXH1cXHg3Rl0rKSg/OlxcPSg/OihbXlxceDAwLVxceDIwXFwoXFwpPD5AXFwsO1xcOlxcXFxcIlxcL1xcW1xcXVxcP1xcPVxce1xcfVxceDdGXSspfCg/OlxcXCIoKD86W15cIlxcXFxdfFxcXFwuKSopXFxcIikpKT8vZztcblxuICAgIGNvbnN0IGhlYWRlciA9IHt9O1xuICAgIGNhY2hlQ29udHJvbC5yZXBsYWNlKHJlLCAoJDAsICQxLCAkMiwgJDMpID0+IHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSAkMiB8fCAkMztcbiAgICAgICAgaGVhZGVyWyQxXSA9IHZhbHVlID8gdmFsdWUudG9Mb3dlckNhc2UoKSA6IHRydWU7XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9KTtcblxuICAgIGlmIChoZWFkZXJbJ21heC1hZ2UnXSkge1xuICAgICAgICBjb25zdCBtYXhBZ2UgPSBwYXJzZUludChoZWFkZXJbJ21heC1hZ2UnXSwgMTApO1xuICAgICAgICBpZiAoaXNOYU4obWF4QWdlKSkgZGVsZXRlIGhlYWRlclsnbWF4LWFnZSddO1xuICAgICAgICBlbHNlIGhlYWRlclsnbWF4LWFnZSddID0gbWF4QWdlO1xuICAgIH1cblxuICAgIHJldHVybiBoZWFkZXI7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBvaW50O1xuXG5mdW5jdGlvbiBQb2ludCh4LCB5KSB7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xufVxuXG5Qb2ludC5wcm90b3R5cGUgPSB7XG4gICAgY2xvbmU6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbmV3IFBvaW50KHRoaXMueCwgdGhpcy55KTsgfSxcblxuICAgIGFkZDogICAgIGZ1bmN0aW9uKHApIHsgcmV0dXJuIHRoaXMuY2xvbmUoKS5fYWRkKHApOyAgICAgfSxcbiAgICBzdWI6ICAgICBmdW5jdGlvbihwKSB7IHJldHVybiB0aGlzLmNsb25lKCkuX3N1YihwKTsgICAgIH0sXG4gICAgbXVsdDogICAgZnVuY3Rpb24oaykgeyByZXR1cm4gdGhpcy5jbG9uZSgpLl9tdWx0KGspOyAgICB9LFxuICAgIGRpdjogICAgIGZ1bmN0aW9uKGspIHsgcmV0dXJuIHRoaXMuY2xvbmUoKS5fZGl2KGspOyAgICAgfSxcbiAgICByb3RhdGU6ICBmdW5jdGlvbihhKSB7IHJldHVybiB0aGlzLmNsb25lKCkuX3JvdGF0ZShhKTsgIH0sXG4gICAgbWF0TXVsdDogZnVuY3Rpb24obSkgeyByZXR1cm4gdGhpcy5jbG9uZSgpLl9tYXRNdWx0KG0pOyB9LFxuICAgIHVuaXQ6ICAgIGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5jbG9uZSgpLl91bml0KCk7IH0sXG4gICAgcGVycDogICAgZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmNsb25lKCkuX3BlcnAoKTsgfSxcbiAgICByb3VuZDogICBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuY2xvbmUoKS5fcm91bmQoKTsgfSxcblxuICAgIG1hZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQodGhpcy54ICogdGhpcy54ICsgdGhpcy55ICogdGhpcy55KTtcbiAgICB9LFxuXG4gICAgZXF1YWxzOiBmdW5jdGlvbihwKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnggPT09IHAueCAmJlxuICAgICAgICAgICAgICAgdGhpcy55ID09PSBwLnk7XG4gICAgfSxcblxuICAgIGRpc3Q6IGZ1bmN0aW9uKHApIHtcbiAgICAgICAgcmV0dXJuIE1hdGguc3FydCh0aGlzLmRpc3RTcXIocCkpO1xuICAgIH0sXG5cbiAgICBkaXN0U3FyOiBmdW5jdGlvbihwKSB7XG4gICAgICAgIHZhciBkeCA9IHAueCAtIHRoaXMueCxcbiAgICAgICAgICAgIGR5ID0gcC55IC0gdGhpcy55O1xuICAgICAgICByZXR1cm4gZHggKiBkeCArIGR5ICogZHk7XG4gICAgfSxcblxuICAgIGFuZ2xlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguYXRhbjIodGhpcy55LCB0aGlzLngpO1xuICAgIH0sXG5cbiAgICBhbmdsZVRvOiBmdW5jdGlvbihiKSB7XG4gICAgICAgIHJldHVybiBNYXRoLmF0YW4yKHRoaXMueSAtIGIueSwgdGhpcy54IC0gYi54KTtcbiAgICB9LFxuXG4gICAgYW5nbGVXaXRoOiBmdW5jdGlvbihiKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFuZ2xlV2l0aFNlcChiLngsIGIueSk7XG4gICAgfSxcblxuICAgIC8vIEZpbmQgdGhlIGFuZ2xlIG9mIHRoZSB0d28gdmVjdG9ycywgc29sdmluZyB0aGUgZm9ybXVsYSBmb3IgdGhlIGNyb3NzIHByb2R1Y3QgYSB4IGIgPSB8YXx8YnxzaW4ozrgpIGZvciDOuC5cbiAgICBhbmdsZVdpdGhTZXA6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguYXRhbjIoXG4gICAgICAgICAgICB0aGlzLnggKiB5IC0gdGhpcy55ICogeCxcbiAgICAgICAgICAgIHRoaXMueCAqIHggKyB0aGlzLnkgKiB5KTtcbiAgICB9LFxuXG4gICAgX21hdE11bHQ6IGZ1bmN0aW9uKG0pIHtcbiAgICAgICAgdmFyIHggPSBtWzBdICogdGhpcy54ICsgbVsxXSAqIHRoaXMueSxcbiAgICAgICAgICAgIHkgPSBtWzJdICogdGhpcy54ICsgbVszXSAqIHRoaXMueTtcbiAgICAgICAgdGhpcy54ID0geDtcbiAgICAgICAgdGhpcy55ID0geTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIF9hZGQ6IGZ1bmN0aW9uKHApIHtcbiAgICAgICAgdGhpcy54ICs9IHAueDtcbiAgICAgICAgdGhpcy55ICs9IHAueTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIF9zdWI6IGZ1bmN0aW9uKHApIHtcbiAgICAgICAgdGhpcy54IC09IHAueDtcbiAgICAgICAgdGhpcy55IC09IHAueTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIF9tdWx0OiBmdW5jdGlvbihrKSB7XG4gICAgICAgIHRoaXMueCAqPSBrO1xuICAgICAgICB0aGlzLnkgKj0gaztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIF9kaXY6IGZ1bmN0aW9uKGspIHtcbiAgICAgICAgdGhpcy54IC89IGs7XG4gICAgICAgIHRoaXMueSAvPSBrO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgX3VuaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9kaXYodGhpcy5tYWcoKSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBfcGVycDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB5ID0gdGhpcy55O1xuICAgICAgICB0aGlzLnkgPSB0aGlzLng7XG4gICAgICAgIHRoaXMueCA9IC15O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgX3JvdGF0ZTogZnVuY3Rpb24oYW5nbGUpIHtcbiAgICAgICAgdmFyIGNvcyA9IE1hdGguY29zKGFuZ2xlKSxcbiAgICAgICAgICAgIHNpbiA9IE1hdGguc2luKGFuZ2xlKSxcbiAgICAgICAgICAgIHggPSBjb3MgKiB0aGlzLnggLSBzaW4gKiB0aGlzLnksXG4gICAgICAgICAgICB5ID0gc2luICogdGhpcy54ICsgY29zICogdGhpcy55O1xuICAgICAgICB0aGlzLnggPSB4O1xuICAgICAgICB0aGlzLnkgPSB5O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgX3JvdW5kOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy54ID0gTWF0aC5yb3VuZCh0aGlzLngpO1xuICAgICAgICB0aGlzLnkgPSBNYXRoLnJvdW5kKHRoaXMueSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn07XG5cbi8vIGNvbnN0cnVjdHMgUG9pbnQgZnJvbSBhbiBhcnJheSBpZiBuZWNlc3NhcnlcblBvaW50LmNvbnZlcnQgPSBmdW5jdGlvbiAoYSkge1xuICAgIGlmIChhIGluc3RhbmNlb2YgUG9pbnQpIHtcbiAgICAgICAgcmV0dXJuIGE7XG4gICAgfVxuICAgIGlmIChBcnJheS5pc0FycmF5KGEpKSB7XG4gICAgICAgIHJldHVybiBuZXcgUG9pbnQoYVswXSwgYVsxXSk7XG4gICAgfVxuICAgIHJldHVybiBhO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgdXRpbCA9IHJlcXVpcmUoJ21hcGJveC1nbC9zcmMvdXRpbC91dGlsJyk7XG5jb25zdCBhamF4ID0gcmVxdWlyZSgnbWFwYm94LWdsL3NyYy91dGlsL2FqYXgnKTtcbmNvbnN0IEV2ZW50ZWQgPSByZXF1aXJlKCdtYXBib3gtZ2wvc3JjL3V0aWwvZXZlbnRlZCcpO1xuY29uc3QgbG9hZEFyY0dJU01hcFNlcnZlciA9IHJlcXVpcmUoJy4vbG9hZF9hcmNnaXNfbWFwc2VydmVyJyk7XG5jb25zdCBUaWxlQm91bmRzID0gcmVxdWlyZSgnbWFwYm94LWdsL3NyYy9zb3VyY2UvdGlsZV9ib3VuZHMnKTtcblxuLy9Gcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9MZWFmbGV0L0xlYWZsZXQvYmxvYi9tYXN0ZXIvc3JjL2NvcmUvVXRpbC5qc1xuY29uc3QgX3RlbXBsYXRlUmUgPSAvXFx7ICooW1xcd19dKykgKlxcfS9nO1xuY29uc3QgX3RlbXBsYXRlID0gZnVuY3Rpb24gKHN0ciwgZGF0YSkge1xuICAgIHJldHVybiBzdHIucmVwbGFjZShfdGVtcGxhdGVSZSwgKHN0ciwga2V5KSA9PiB7XG4gICAgICAgIGxldCB2YWx1ZSA9IGRhdGFba2V5XTtcblxuICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBObyB2YWx1ZSBwcm92aWRlZCBmb3IgdmFyaWFibGUgJHtzdHJ9YCk7XG5cbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUoZGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0pO1xufTtcblxuLy9Gcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9MZWFmbGV0L0xlYWZsZXQvYmxvYi9tYXN0ZXIvc3JjL2xheWVyL3RpbGUvVGlsZUxheWVyLmpzXG5jb25zdCBfZ2V0U3ViZG9tYWluID0gZnVuY3Rpb24gKHRpbGVQb2ludCwgc3ViZG9tYWlucykge1xuICAgIGlmIChzdWJkb21haW5zKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gTWF0aC5hYnModGlsZVBvaW50LnggKyB0aWxlUG9pbnQueSkgJSBzdWJkb21haW5zLmxlbmd0aDtcbiAgICAgICAgcmV0dXJuIHN1YmRvbWFpbnNbaW5kZXhdO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn07XG5cbmNsYXNzIEFyY0dJU1RpbGVkTWFwU2VydmljZVNvdXJjZSBleHRlbmRzIEV2ZW50ZWQge1xuXG4gICAgY29uc3RydWN0b3IoaWQsIG9wdGlvbnMsIGRpc3BhdGNoZXIsIGV2ZW50ZWRQYXJlbnQpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xuICAgICAgICB0aGlzLmRpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xuICAgICAgICB0aGlzLnNldEV2ZW50ZWRQYXJlbnQoZXZlbnRlZFBhcmVudCk7XG5cbiAgICAgICAgdGhpcy50eXBlID0gJ2FyY2dpc3Jhc3Rlcic7XG4gICAgICAgIHRoaXMubWluem9vbSA9IDA7XG4gICAgICAgIHRoaXMubWF4em9vbSA9IDIyO1xuICAgICAgICB0aGlzLnJvdW5kWm9vbSA9IHRydWU7XG4gICAgICAgIHRoaXMudGlsZVNpemUgPSA1MTI7XG4gICAgICAgIHRoaXMuX2xvYWRlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgICB1dGlsLmV4dGVuZCh0aGlzLCB1dGlsLnBpY2sob3B0aW9ucywgWyd1cmwnLCAnc2NoZW1lJywgJ3RpbGVTaXplJ10pKTtcbiAgICB9XG5cbiAgICBsb2FkKCkge1xuICAgICAgICB0aGlzLmZpcmUoJ2RhdGFsb2FkaW5nJywge2RhdGFUeXBlOiAnc291cmNlJ30pO1xuICAgICAgICBsb2FkQXJjR0lTTWFwU2VydmVyKHRoaXMub3B0aW9ucywgKGVyciwgbWV0YWRhdGEpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5maXJlKCdlcnJvcicsIGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB1dGlsLmV4dGVuZCh0aGlzLCBtZXRhZGF0YSk7XG4gICAgICAgICAgICB0aGlzLnNldEJvdW5kcyhtZXRhZGF0YS5ib3VuZHMpO1xuXG4gICAgICAgICAgICAvLyBgY29udGVudGAgaXMgaW5jbHVkZWQgaGVyZSB0byBwcmV2ZW50IGEgcmFjZSBjb25kaXRpb24gd2hlcmUgYFN0eWxlI191cGRhdGVTb3VyY2VzYCBpcyBjYWxsZWRcbiAgICAgICAgICAgIC8vIGJlZm9yZSB0aGUgVGlsZUpTT04gYXJyaXZlcy4gdGhpcyBtYWtlcyBzdXJlIHRoZSB0aWxlcyBuZWVkZWQgYXJlIGxvYWRlZCBvbmNlIFRpbGVKU09OIGFycml2ZXNcbiAgICAgICAgICAgIC8vIHJlZjogaHR0cHM6Ly9naXRodWIuY29tL21hcGJveC9tYXBib3gtZ2wtanMvcHVsbC80MzQ3I2Rpc2N1c3Npb25fcjEwNDQxODA4OFxuICAgICAgICAgICAgdGhpcy5maXJlKCdkYXRhJywge2RhdGFUeXBlOiAnc291cmNlJywgc291cmNlRGF0YVR5cGU6ICdtZXRhZGF0YSd9KTtcbiAgICAgICAgICAgIHRoaXMuZmlyZSgnZGF0YScsIHtkYXRhVHlwZTogJ3NvdXJjZScsIHNvdXJjZURhdGFUeXBlOiAnY29udGVudCd9KTtcblxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBvbkFkZChtYXApIHtcbiAgICAgICAgLy8gc2V0IHRoZSB1cmxzXG4gICAgICAgIGNvbnN0IGJhc2VVcmwgPSB0aGlzLnVybC5zcGxpdCgnPycpWzBdO1xuICAgICAgICB0aGlzLnRpbGVVcmwgPSBgJHtiYXNlVXJsfSAvdGlsZS97en0ve3l9L3t4fWA7XG5cbiAgICAgICAgY29uc3QgYXJjZ2lzb25saW5lID0gbmV3IFJlZ0V4cCgvdGlsZXMuYXJjZ2lzKG9ubGluZSk/XFwuY29tL2cpO1xuICAgICAgICBpZiAoYXJjZ2lzb25saW5lLnRlc3QodGhpcy51cmwpKSB7XG4gICAgICAgICAgICB0aGlzLnRpbGVVcmwgPSB0aGlzLnRpbGVVcmwucmVwbGFjZSgnOi8vdGlsZXMnLCAnOi8vdGlsZXN7c30nKTtcbiAgICAgICAgICAgIHRoaXMuc3ViZG9tYWlucyA9IFsnMScsICcyJywgJzMnLCAnNCddO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMudG9rZW4pIHtcbiAgICAgICAgICAgIHRoaXMudGlsZVVybCArPSAoYD90b2tlbj0ke3RoaXMudG9rZW59YCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5sb2FkKCk7XG4gICAgICAgIHRoaXMubWFwID0gbWFwO1xuICAgIH1cblxuICAgIHNldEJvdW5kcyhib3VuZHMpIHtcbiAgICAgICAgdGhpcy5ib3VuZHMgPSBib3VuZHM7XG4gICAgICAgIGlmIChib3VuZHMpIHtcbiAgICAgICAgICAgIHRoaXMudGlsZUJvdW5kcyA9IG5ldyBUaWxlQm91bmRzKGJvdW5kcywgdGhpcy5taW56b29tLCB0aGlzLm1heHpvb20pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2VyaWFsaXplKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdHlwZTogJ2FyY2dpc3Jhc3RlcicsXG4gICAgICAgICAgICB1cmw6IHRoaXMudXJsLFxuICAgICAgICAgICAgdGlsZVNpemU6IHRoaXMudGlsZVNpemUsXG4gICAgICAgICAgICB0aWxlczogdGhpcy50aWxlcyxcbiAgICAgICAgICAgIGJvdW5kczogdGhpcy5ib3VuZHMsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgaGFzVGlsZShjb29yZCkge1xuICAgICAgICByZXR1cm4gIXRoaXMudGlsZUJvdW5kcyB8fCB0aGlzLnRpbGVCb3VuZHMuY29udGFpbnMoY29vcmQsIHRoaXMubWF4em9vbSk7XG4gICAgfVxuXG4gICAgbG9hZFRpbGUodGlsZSwgY2FsbGJhY2spIHtcbiAgICAgICAgLy9jb252ZXJ0IHRvIGFncyBjb29yZHNcbiAgICAgICAgY29uc3QgdGlsZVBvaW50ID0gdGlsZS5jb29yZDtcbiAgICAgICAgY29uc3QgdXJsID0gIF90ZW1wbGF0ZSh0aGlzLnRpbGVVcmwsIHV0aWwuZXh0ZW5kKHtcbiAgICAgICAgICAgIHM6IF9nZXRTdWJkb21haW4odGlsZVBvaW50LCB0aGlzLnN1YmRvbWFpbnMpLFxuICAgICAgICAgICAgejogKHRoaXMuX2xvZE1hcCAmJiB0aGlzLl9sb2RNYXBbdGlsZVBvaW50LnpdKSA/IHRoaXMuX2xvZE1hcFt0aWxlUG9pbnQuel0gOiB0aWxlUG9pbnQueiwgLy8gdHJ5IGxvZCBtYXAgZmlyc3QsIHRoZW4ganVzdCBkZWZ1YWx0IHRvIHpvb20gbGV2ZWxcbiAgICAgICAgICAgIHg6IHRpbGVQb2ludC54LFxuICAgICAgICAgICAgeTogdGlsZVBvaW50LnlcbiAgICAgICAgfSwgdGhpcy5vcHRpb25zKSk7XG4gICAgICAgIHRpbGUucmVxdWVzdCA9IGFqYXguZ2V0SW1hZ2UodXJsLCBkb25lLmJpbmQodGhpcykpO1xuXG4gICAgICAgIGZ1bmN0aW9uIGRvbmUoZXJyLCBpbWcpIHtcbiAgICAgICAgICAgIGRlbGV0ZSB0aWxlLnJlcXVlc3Q7XG5cbiAgICAgICAgICAgIGlmICh0aWxlLmFib3J0ZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gJ3VubG9hZGVkJztcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gJ2Vycm9yZWQnO1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5tYXAuX3JlZnJlc2hFeHBpcmVkVGlsZXMpIHRpbGUuc2V0RXhwaXJ5RGF0YShpbWcpO1xuICAgICAgICAgICAgZGVsZXRlIGltZy5jYWNoZUNvbnRyb2w7XG4gICAgICAgICAgICBkZWxldGUgaW1nLmV4cGlyZXM7XG5cbiAgICAgICAgICAgIGNvbnN0IGdsID0gdGhpcy5tYXAucGFpbnRlci5nbDtcbiAgICAgICAgICAgIHRpbGUudGV4dHVyZSA9IHRoaXMubWFwLnBhaW50ZXIuZ2V0VGlsZVRleHR1cmUoaW1nLndpZHRoKTtcbiAgICAgICAgICAgIGlmICh0aWxlLnRleHR1cmUpIHtcbiAgICAgICAgICAgICAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0aWxlLnRleHR1cmUpO1xuICAgICAgICAgICAgICAgIGdsLnRleFN1YkltYWdlMkQoZ2wuVEVYVFVSRV8yRCwgMCwgMCwgMCwgZ2wuUkdCQSwgZ2wuVU5TSUdORURfQllURSwgaW1nKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGlsZS50ZXh0dXJlID0gZ2wuY3JlYXRlVGV4dHVyZSgpO1xuICAgICAgICAgICAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRpbGUudGV4dHVyZSk7XG4gICAgICAgICAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01JTl9GSUxURVIsIGdsLkxJTkVBUl9NSVBNQVBfTkVBUkVTVCk7XG4gICAgICAgICAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01BR19GSUxURVIsIGdsLkxJTkVBUik7XG4gICAgICAgICAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfUywgZ2wuQ0xBTVBfVE9fRURHRSk7XG4gICAgICAgICAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfVCwgZ2wuQ0xBTVBfVE9fRURHRSk7XG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tYXAucGFpbnRlci5leHRUZXh0dXJlRmlsdGVyQW5pc290cm9waWMpIHtcbiAgICAgICAgICAgICAgICAgICAgZ2wudGV4UGFyYW1ldGVyZihnbC5URVhUVVJFXzJELCB0aGlzLm1hcC5wYWludGVyLmV4dFRleHR1cmVGaWx0ZXJBbmlzb3Ryb3BpYy5URVhUVVJFX01BWF9BTklTT1RST1BZX0VYVCwgdGhpcy5tYXAucGFpbnRlci5leHRUZXh0dXJlRmlsdGVyQW5pc290cm9waWNNYXgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGdsLnRleEltYWdlMkQoZ2wuVEVYVFVSRV8yRCwgMCwgZ2wuUkdCQSwgZ2wuUkdCQSwgZ2wuVU5TSUdORURfQllURSwgaW1nKTtcbiAgICAgICAgICAgICAgICB0aWxlLnRleHR1cmUuc2l6ZSA9IGltZy53aWR0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGdsLmdlbmVyYXRlTWlwbWFwKGdsLlRFWFRVUkVfMkQpO1xuXG4gICAgICAgICAgICB0aWxlLnN0YXRlID0gJ2xvYWRlZCc7XG5cbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYWJvcnRUaWxlKHRpbGUpIHtcbiAgICAgICAgaWYgKHRpbGUucmVxdWVzdCkge1xuICAgICAgICAgICAgdGlsZS5yZXF1ZXN0LmFib3J0KCk7XG4gICAgICAgICAgICBkZWxldGUgdGlsZS5yZXF1ZXN0O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdW5sb2FkVGlsZSh0aWxlKSB7XG4gICAgICAgIGlmICh0aWxlLnRleHR1cmUpIHRoaXMubWFwLnBhaW50ZXIuc2F2ZVRpbGVUZXh0dXJlKHRpbGUudGV4dHVyZSk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFyY0dJU1RpbGVkTWFwU2VydmljZVNvdXJjZTtcbiIsImNvbnN0IEFyY0dJU1RpbGVkTWFwU2VydmljZVNvdXJjZSA9IHJlcXVpcmUoJy4vYXJjZ2lzX3RpbGVkX21hcF9zZXJ2aWNlX3NvdXJjZScpO1xubW9kdWxlLmV4cG9ydHMgPSBBcmNHSVNUaWxlZE1hcFNlcnZpY2VTb3VyY2U7IiwiJ3VzZSBzdHJpY3QnO1xuY29uc3QgdXRpbCA9IHJlcXVpcmUoJ21hcGJveC1nbC9zcmMvdXRpbC91dGlsJyk7XG5jb25zdCBhamF4ID0gcmVxdWlyZSgnbWFwYm94LWdsL3NyYy91dGlsL2FqYXgnKTtcbmNvbnN0IGJyb3dzZXIgPSByZXF1aXJlKCdtYXBib3gtZ2wvc3JjL3V0aWwvYnJvd3NlcicpO1xuY29uc3QgU3BoZXJpY2FsTWVyY2F0b3IgPSByZXF1aXJlKCdAbWFwYm94L3NwaGVyaWNhbG1lcmNhdG9yJyk7XG5cbi8vQ29udGFpbnMgY29kZSBmcm9tIGVzcmktbGVhZmxldCBodHRwczovL2dpdGh1Yi5jb20vRXNyaS9lc3JpLWxlYWZsZXRcbmNvbnN0IE1lcmNhdG9yWm9vbUxldmVscyA9IHtcbiAgICAnMCc6IDE1NjU0My4wMzM5Mjc5OTk5OSxcbiAgICAnMSc6IDc4MjcxLjUxNjk2Mzk5OTg5MyxcbiAgICAnMic6IDM5MTM1Ljc1ODQ4MjAwMDA5OSxcbiAgICAnMyc6IDE5NTY3Ljg3OTI0MDk5OTkwMSxcbiAgICAnNCc6IDk3ODMuOTM5NjIwNDk5OTU5MyxcbiAgICAnNSc6IDQ4OTEuOTY5ODEwMjQ5OTc5NyxcbiAgICAnNic6IDI0NDUuOTg0OTA1MTI0OTg5OCxcbiAgICAnNyc6IDEyMjIuOTkyNDUyNTYyNDg5OSxcbiAgICAnOCc6IDYxMS40OTYyMjYyODEzODAwMixcbiAgICAnOSc6IDMwNS43NDgxMTMxNDA1NTgwMixcbiAgICAnMTAnOiAxNTIuODc0MDU2NTcwNDExLFxuICAgICcxMSc6IDc2LjQzNzAyODI4NTA3MzE5NyxcbiAgICAnMTInOiAzOC4yMTg1MTQxNDI1MzY1OTgsXG4gICAgJzEzJzogMTkuMTA5MjU3MDcxMjY4Mjk5LFxuICAgICcxNCc6IDkuNTU0NjI4NTM1NjM0MTQ5NixcbiAgICAnMTUnOiA0Ljc3NzMxNDI2Nzk0OTM2OTksXG4gICAgJzE2JzogMi4zODg2NTcxMzM5NzQ2OCxcbiAgICAnMTcnOiAxLjE5NDMyODU2Njg1NTA1MDEsXG4gICAgJzE4JzogMC41OTcxNjQyODM1NTk4MTY5OSxcbiAgICAnMTknOiAwLjI5ODU4MjE0MTY0NzYxNjk4LFxuICAgICcyMCc6IDAuMTQ5MjkxMDcwODIzODEsXG4gICAgJzIxJzogMC4wNzQ2NDU1MzU0MTE5MSxcbiAgICAnMjInOiAwLjAzNzMyMjc2NzcwNTk1MjUsXG4gICAgJzIzJzogMC4wMTg2NjEzODM4NTI5NzYzXG59O1xuXG5jb25zdCBfd2l0aGluUGVyY2VudGFnZSA9IGZ1bmN0aW9uIChhLCBiLCBwZXJjZW50YWdlKSB7XG4gICAgY29uc3QgZGlmZiA9IE1hdGguYWJzKChhIC8gYikgLSAxKTtcbiAgICByZXR1cm4gZGlmZiA8IHBlcmNlbnRhZ2U7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gICAgY29uc3QgbG9hZGVkID0gZnVuY3Rpb24oZXJyLCBtZXRhZGF0YSkge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHV0aWwucGljayhtZXRhZGF0YSxcbiAgICAgICAgICAgIFsndGlsZUluZm8nLCAnaW5pdGlhbEV4dGVudCcsICdmdWxsRXh0ZW50JywgJ3NwYXRpYWxSZWZlcmVuY2UnLCAndGlsZVNlcnZlcnMnLCAnZG9jdW1lbnRJbmZvJ10pO1xuXG4gICAgICAgIHJlc3VsdC5fbG9kTWFwID0ge307XG4gICAgICAgIGNvbnN0IHpvb21PZmZzZXRBbGxvd2FuY2UgPSAwLjE7XG4gICAgICAgIGNvbnN0IHNyID0gbWV0YWRhdGEuc3BhdGlhbFJlZmVyZW5jZS5sYXRlc3RXa2lkIHx8IG1ldGFkYXRhLnNwYXRpYWxSZWZlcmVuY2Uud2tpZDtcbiAgICAgICAgaWYgKHNyID09PSAxMDIxMDAgfHwgc3IgPT09IDM4NTcpIHtcblxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIEV4YW1wbGUgZXh0ZW50IGZyb20gQXJjR0lTIFJFU1QgQVBJXG4gICAgICAgICAgICBmdWxsRXh0ZW50OiB7XG4gICAgICAgICAgICB4bWluOiAtOTE0NDc5MS42NzkyMjYxMjcsXG4gICAgICAgICAgICB5bWluOiAtMjE5NTE5MC45NjE0Mzc3MjYsXG4gICAgICAgICAgICB4bWF4OiAtNDY1MDk4Ny4wNzIwMTk5ODMsXG4gICAgICAgICAgICB5bWF4OiAxMTE4MTEzLjExMDE1NTc2NixcbiAgICAgICAgICAgIHNwYXRpYWxSZWZlcmVuY2U6IHtcbiAgICAgICAgICAgIHdraWQ6IDEwMjEwMCxcbiAgICAgICAgICAgIHdrdDogbnVsbFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICAvL2NvbnZlcnQgQXJjR0lTIGV4dGVudCB0byBib3VuZHNcbiAgICAgICAgICAgIGNvbnN0IGV4dGVudCA9IG1ldGFkYXRhLmZ1bGxFeHRlbnQ7XG4gICAgICAgICAgICBpZiAoZXh0ZW50ICYmIGV4dGVudC5zcGF0aWFsUmVmZXJlbmNlICYmIGV4dGVudC5zcGF0aWFsUmVmZXJlbmNlLndraWQgPT09ICAxMDIxMDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBib3VuZHNXZWJNZXJjYXRvciA9IFtleHRlbnQueG1pbiwgZXh0ZW50LnltaW4sIGV4dGVudC54bWF4LCBleHRlbnQueW1heF07XG4gICAgICAgICAgICAgICAgdmFyIG1lcmMgPSBuZXcgU3BoZXJpY2FsTWVyY2F0b3Ioe1xuICAgICAgICAgICAgICAgICAgICBzaXplOiAyNTZcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjb25zdCBib3VuZHNXR1M4NCA9IG1lcmMuY29udmVydChib3VuZHNXZWJNZXJjYXRvcik7XG4gICAgICAgICAgICAgICAgcmVzdWx0LmJvdW5kcyA9IGJvdW5kc1dHUzg0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBjcmVhdGUgdGhlIHpvb20gbGV2ZWwgZGF0YVxuICAgICAgICAgICAgY29uc3QgYXJjZ2lzTE9EcyA9IG1ldGFkYXRhLnRpbGVJbmZvLmxvZHM7XG4gICAgICAgICAgICBjb25zdCBjb3JyZWN0UmVzb2x1dGlvbnMgPSBNZXJjYXRvclpvb21MZXZlbHM7XG4gICAgICAgICAgICByZXN1bHQubWluem9vbSA9IGFyY2dpc0xPRHNbMF0ubGV2ZWw7XG4gICAgICAgICAgICByZXN1bHQubWF4em9vbSA9IGFyY2dpc0xPRHNbYXJjZ2lzTE9Ecy5sZW5ndGggLSAxXS5sZXZlbDtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJjZ2lzTE9Ecy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFyY2dpc0xPRCA9IGFyY2dpc0xPRHNbaV07XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBjaSBpbiBjb3JyZWN0UmVzb2x1dGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29ycmVjdFJlcyA9IGNvcnJlY3RSZXNvbHV0aW9uc1tjaV07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKF93aXRoaW5QZXJjZW50YWdlKGFyY2dpc0xPRC5yZXNvbHV0aW9uLCBjb3JyZWN0UmVzLCB6b29tT2Zmc2V0QWxsb3dhbmNlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0Ll9sb2RNYXBbY2ldID0gYXJjZ2lzTE9ELmxldmVsO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWxsYmFjayhuZXcgRXJyb3IoJ25vbi1tZXJjYXRvciBzcGF0aWFsIHJlZmVyZW5jZScpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHJlc3VsdCk7XG4gICAgfTtcblxuICAgIGlmIChvcHRpb25zLnVybCkge1xuICAgICAgICBhamF4LmdldEpTT04ob3B0aW9ucy51cmwsIGxvYWRlZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYnJvd3Nlci5mcmFtZShsb2FkZWQuYmluZChudWxsLCBudWxsLCBvcHRpb25zKSk7XG4gICAgfVxufTtcbiJdfQ==
