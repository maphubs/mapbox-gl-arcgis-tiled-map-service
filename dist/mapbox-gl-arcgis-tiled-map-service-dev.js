(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('assert')) :
typeof define === 'function' && define.amd ? define(['assert'], factory) :
(global = global || self, global.ArcGISTiledMapServiceSource = factory(global.assert));
}(this, function (assert) { 'use strict';

assert = assert && assert.hasOwnProperty('default') ? assert['default'] : assert;

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

var unitbezier = UnitBezier;

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
    if (typeof epsilon === 'undefined') { epsilon = 1e-6; }

    var t0, t1, t2, x2, i;

    // First try a few iterations of Newton's method -- normally very fast.
    for (t2 = x, i = 0; i < 8; i++) {

        x2 = this.sampleCurveX(t2) - x;
        if (Math.abs(x2) < epsilon) { return t2; }

        var d2 = this.sampleCurveDerivativeX(t2);
        if (Math.abs(d2) < 1e-6) { break; }

        t2 = t2 - x2 / d2;
    }

    // Fall back to the bisection method for reliability.
    t0 = 0.0;
    t1 = 1.0;
    t2 = x;

    if (t2 < t0) { return t0; }
    if (t2 > t1) { return t1; }

    while (t0 < t1) {

        x2 = this.sampleCurveX(t2);
        if (Math.abs(x2 - x) < epsilon) { return t2; }

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

'use strict';

var pointGeometry = Point;

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

//

//      

/**
 * Deeply compares two object literals.
 *
 * @private
 */
function deepEqual(a        , b        )          {
    if (Array.isArray(a)) {
        if (!Array.isArray(b) || a.length !== b.length) { return false; }
        for (var i = 0; i < a.length; i++) {
            if (!deepEqual(a[i], b[i])) { return false; }
        }
        return true;
    }
    if (typeof a === 'object' && a !== null && b !== null) {
        if (!(typeof b === 'object')) { return false; }
        var keys = Object.keys(a);
        if (keys.length !== Object.keys(b).length) { return false; }
        for (var key in a) {
            if (!deepEqual(a[key], b[key])) { return false; }
        }
        return true;
    }
    return a === b;
}

//      

                                                

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
function easeCubicInOut(t        )         {
    if (t <= 0) { return 0; }
    if (t >= 1) { return 1; }
    var t2 = t * t,
        t3 = t2 * t;
    return 4 * (t < 0.5 ? t3 : 3 * (t - t2) + t3 - 0.75);
}

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
function bezier(p1x        , p1y        , p2x        , p2y        )                        {
    var bezier = new unitbezier(p1x, p1y, p2x, p2y);
    return function(t        ) {
        return bezier.solve(t);
    };
}

/**
 * A default bezier-curve powered easing function with
 * control points (0.25, 0.1) and (0.25, 1)
 *
 * @private
 */
var ease = bezier(0.25, 0.1, 0.25, 1);

/**
 * constrain n to the given range via min + max
 *
 * @param n value
 * @param min the minimum value to be returned
 * @param max the maximum value to be returned
 * @returns the clamped value
 * @private
 */
function clamp(n        , min        , max        )         {
    return Math.min(max, Math.max(min, n));
}

/**
 * constrain n to the given range, excluding the minimum, via modular arithmetic
 *
 * @param n value
 * @param min the minimum value to be returned, exclusive
 * @param max the maximum value to be returned, inclusive
 * @returns constrained number
 * @private
 */
function wrap(n        , min        , max        )         {
    var d = max - min;
    var w = ((n - min) % d + d) % d + min;
    return (w === min) ? max : w;
}

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
function asyncAll              (
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
}

/*
 * Polyfill for Object.values. Not fully spec compliant, but we don't
 * need it to be.
 *
 * @private
 */
function values   (obj                    )           {
    var result = [];
    for (var k in obj) {
        result.push(obj[k]);
    }
    return result;
}

/*
 * Compute the difference between the keys in one object and the keys
 * in another object.
 *
 * @returns keys difference
 * @private
 */
function keysDifference      (obj                    , other                    )                {
    var difference = [];
    for (var i in obj) {
        if (!(i in other)) {
            difference.push(i);
        }
    }
    return difference;
}

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
function extend(dest                )         {
    var sources = [], len = arguments.length - 1;
    while ( len-- > 0 ) sources[ len ] = arguments[ len + 1 ];

    for (var i = 0, list = sources; i < list.length; i += 1) {
        var src = list[i];

        for (var k in src) {
            dest[k] = src[k];
        }
    }
    return dest;
}

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
function pick(src        , properties               )         {
    var result = {};
    for (var i = 0; i < properties.length; i++) {
        var k = properties[i];
        if (k in src) {
            result[k] = src[k];
        }
    }
    return result;
}

var id = 1;

/**
 * Return a unique numeric id, starting at 1 and incrementing with
 * each call.
 *
 * @returns unique numeric id.
 * @private
 */
function uniqueId()         {
    return id++;
}

/**
 * Return a random UUID (v4). Taken from: https://gist.github.com/jed/982883
 * @private
 */
function uuid()         {
    function b(a) {
        return a ? (a ^ Math.random() * 16 >> a / 4).toString(16) :
        //$FlowFixMe: Flow doesn't like the implied array literal conversion here
            ([1e7] + -[1e3] + -4e3 + -8e3 + -1e11).replace(/[018]/g, b);
    }
    return b();
}

/**
 * Validate a string to match UUID(v4) of the
 * form: xxxxxxxx-xxxx-4xxx-[89ab]xxx-xxxxxxxxxxxx
 * @param str string to validate.
 * @private
 */
function validateUuid(str         )          {
    return str ? /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str) : false;
}

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
function bindAll(fns               , context        )       {
    fns.forEach(function (fn) {
        if (!context[fn]) { return; }
        context[fn] = context[fn].bind(context);
    });
}

/**
 * Determine if a string ends with a particular substring
 *
 * @private
 */
function endsWith(string        , suffix        )          {
    return string.indexOf(suffix, string.length - suffix.length) !== -1;
}

/**
 * Create an object by mapping all the values of an existing object while
 * preserving their keys.
 *
 * @private
 */
function mapObject(input        , iterator          , context         )         {
    var output = {};
    for (var key in input) {
        output[key] = iterator.call(context || this, input[key], key, input);
    }
    return output;
}

/**
 * Create an object by filtering out values of an existing object.
 *
 * @private
 */
function filterObject(input        , iterator          , context         )         {
    var output = {};
    for (var key in input) {
        if (iterator.call(context || this, input[key], key, input)) {
            output[key] = input[key];
        }
    }
    return output;
}

/**
 * Deeply clones two objects.
 *
 * @private
 */
function clone   (input   )    {
    if (Array.isArray(input)) {
        return input.map(clone);
    } else if (typeof input === 'object' && input) {
        return ((mapObject(input, clone)     )   );
    } else {
        return input;
    }
}

/**
 * Check if two arrays have at least one common element.
 *
 * @private
 */
function arraysIntersect   (a          , b          )          {
    for (var l = 0; l < a.length; l++) {
        if (b.indexOf(a[l]) >= 0) { return true; }
    }
    return false;
}

/**
 * Print a warning message to the console and ensure duplicate warning messages
 * are not printed.
 *
 * @private
 */
var warnOnceHistory                           = {};

function warnOnce(message        )       {
    if (!warnOnceHistory[message]) {
        // console isn't defined in some WebWorkers, see #2558
        if (typeof console !== "undefined") { console.warn(message); }
        warnOnceHistory[message] = true;
    }
}

/**
 * Indicates if the provided Points are in a counter clockwise (true) or clockwise (false) order
 *
 * @private
 * @returns true for a counter clockwise set of points
 */
// http://bryceboe.com/2006/10/23/line-segment-intersection-algorithm/
function isCounterClockwise(a       , b       , c       )          {
    return (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
}

/**
 * Returns the signed area for the polygon ring.  Postive areas are exterior rings and
 * have a clockwise winding.  Negative areas are interior rings and have a counter clockwise
 * ordering.
 *
 * @private
 * @param ring Exterior or interior ring
 */
function calculateSignedArea(ring              )         {
    var sum = 0;
    for (var i = 0, len = ring.length, j = len - 1, p1 = (void 0), p2 = (void 0); i < len; j = i++) {
        p1 = ring[i];
        p2 = ring[j];
        sum += (p2.x - p1.x) * (p1.y + p2.y);
    }
    return sum;
}

/**
 * Detects closed polygons, first + last point are equal
 *
 * @private
 * @param points array of points
 * @return true if the points are a closed polygon
 */
function isClosedPolygon(points              )          {
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
    return Math.abs(calculateSignedArea(points)) > 0.01;
}

/**
 * Converts spherical coordinates to cartesian coordinates.
 *
 * @private
 * @param spherical Spherical coordinates, in [radial, azimuthal, polar]
 * @return cartesian coordinates in [x, y, z]
 */

function sphericalToCartesian(ref                          )                                    {
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
}

/**
 * Parses data from 'Cache-Control' headers.
 *
 * @private
 * @param cacheControl Value of 'Cache-Control' header
 * @return object containing parsed header info.
 */

function parseCacheControl(cacheControl        )         {
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
}

function storageAvailable(type        )          {
    try {
        var storage = self[type];
        storage.setItem('_mapbox_test_', 1);
        storage.removeItem('_mapbox_test_');
        return true;
    } catch (e) {
        return false;
    }
}

//      

                
                  
                     
                                
                        
                                     
   

var config         = {
    API_URL: 'https://api.mapbox.com',
    get EVENTS_URL() {
        if (this.API_URL.indexOf('https://api.mapbox.cn') === 0) {
            return 'https://events.mapbox.cn/events/v2';
        } else {
            return 'https://events.mapbox.com/events/v2';
        }
    },
    REQUIRE_ACCESS_TOKEN: true,
    ACCESS_TOKEN: null,
    MAX_PARALLEL_IMAGE_REQUESTS: 16
};

//      
                                                      

var now = self.performance && self.performance.now ?
    self.performance.now.bind(self.performance) :
    Date.now.bind(Date);

var raf = self.requestAnimationFrame ||
    self.mozRequestAnimationFrame ||
    self.webkitRequestAnimationFrame ||
    self.msRequestAnimationFrame;

var cancel = self.cancelAnimationFrame ||
    self.mozCancelAnimationFrame ||
    self.webkitCancelAnimationFrame ||
    self.msCancelAnimationFrame;

/**
 * @private
 */
var exported = {
    /**
     * Provides a function that outputs milliseconds: either performance.now()
     * or a fallback to Date.now()
     */
    now: now,

    frame: function frame(fn          )             {
        var frame = raf(fn);
        return { cancel: function () { return cancel(frame); } };
    },

    getImageData: function getImageData(img                   )            {
        var canvas = self.document.createElement('canvas');
        var context = canvas.getContext('2d');
        if (!context) {
            throw new Error('failed to create canvas 2d context');
        }
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0, img.width, img.height);
        return context.getImageData(0, 0, img.width, img.height);
    },

    resolveURL: function resolveURL(path        ) {
        var a = self.document.createElement('a');
        a.href = path;
        return a.href;
    },

    hardwareConcurrency: self.navigator.hardwareConcurrency || 4,
    get devicePixelRatio() { return self.devicePixelRatio; }
};

//      

var exported$1 = {
    supported: false,
    testSupport: testSupport
};

var glForTesting;
var webpCheckComplete = false;
var webpImgTest;

if (self.document) {
    webpImgTest = self.document.createElement('img');
    webpImgTest.onload = function() {
        if (glForTesting) { testWebpTextureUpload(glForTesting); }
        glForTesting = null;
    };
    webpImgTest.onerror = function() {
        webpCheckComplete = true;
        glForTesting = null;
    };
    webpImgTest.src = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAQAAAAfQ//73v/+BiOh/AAA=';
}

function testSupport(gl                       ) {
    if (webpCheckComplete || !webpImgTest) { return; }

    if (!webpImgTest.complete) {
        glForTesting = gl;
        return;
    }

    testWebpTextureUpload(gl);
}

function testWebpTextureUpload(gl                       ) {
    // Edge 18 supports WebP but not uploading a WebP image to a gl texture
    // Test support for this before allowing WebP images.
    // https://github.com/mapbox/mapbox-gl-js/issues/7671
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, webpImgTest);

        // The error does not get triggered in Edge if the context is lost
        if (gl.isContextLost()) { return; }

        exported$1.supported = true;
    } catch (e) {
        // Catch "Unspecified Error." in Edge 18.
    }

    gl.deleteTexture(texture);

    webpCheckComplete = true;
}

var _from = "mapbox-gl@0.52.0";
var _id = "mapbox-gl@0.52.0";
var _inBundle = false;
var _integrity = "sha512-jiZMGI7LjBNiSwYpFA3drzbZXrgEGERGJRpNS95t5BLZoc8Z+ggOOI1Fz2X+zLlh1j32iNDtf4j6En+caWwYiQ==";
var _location = "/mapbox-gl";
var _phantomChildren = {
};
var _requested = {
	type: "version",
	registry: true,
	raw: "mapbox-gl@0.52.0",
	name: "mapbox-gl",
	escapedName: "mapbox-gl",
	rawSpec: "0.52.0",
	saveSpec: null,
	fetchSpec: "0.52.0"
};
var _requiredBy = [
	"#DEV:/",
	"#USER"
];
var _resolved = "https://registry.npmjs.org/mapbox-gl/-/mapbox-gl-0.52.0.tgz";
var _shasum = "a43b61caa339ae28e43c87ecfbe9ce4032795859";
var _spec = "mapbox-gl@0.52.0";
var _where = "/Users/kris/dev/maphubs/mapbox-gl-arcgis-tiled-map-service";
var browser = {
	"./src/shaders/index.js": "./src/shaders/shaders.js",
	"./src/util/window.js": "./src/util/browser/window.js",
	"./src/util/web_worker.js": "./src/util/browser/web_worker.js"
};
var bugs = {
	url: "https://github.com/mapbox/mapbox-gl-js/issues"
};
var bundleDependencies = false;
var dependencies = {
	"@mapbox/geojson-types": "^1.0.2",
	"@mapbox/jsonlint-lines-primitives": "^2.0.2",
	"@mapbox/mapbox-gl-supported": "^1.4.0",
	"@mapbox/point-geometry": "^0.1.0",
	"@mapbox/tiny-sdf": "^1.1.0",
	"@mapbox/unitbezier": "^0.0.0",
	"@mapbox/vector-tile": "^1.3.1",
	"@mapbox/whoots-js": "^3.1.0",
	csscolorparser: "~1.0.2",
	earcut: "^2.1.3",
	esm: "^3.0.84",
	"geojson-rewind": "^0.3.0",
	"geojson-vt": "^3.2.1",
	"gl-matrix": "^2.6.1",
	"grid-index": "^1.0.0",
	minimist: "0.0.8",
	"murmurhash-js": "^1.0.0",
	pbf: "^3.0.5",
	potpack: "^1.0.1",
	quickselect: "^1.0.0",
	rw: "^1.3.3",
	supercluster: "^5.0.0",
	tinyqueue: "^1.1.0",
	"vt-pbf": "^3.0.1"
};
var deprecated = false;
var description = "A WebGL interactive maps library";
var devDependencies = {
	"@mapbox/batfish": "^1.9.4",
	"@mapbox/flow-remove-types": "^1.3.0-await.upstream.1",
	"@mapbox/mapbox-gl-rtl-text": "^0.2.0",
	"@mapbox/mapbox-gl-test-suite": "file:test/integration",
	"@octokit/rest": "^15.15.1",
	"babel-eslint": "^10.0.1",
	benchmark: "~2.1.0",
	browserify: "^16.1.0",
	d3: "^4.12.0",
	documentation: "~8.1.1",
	ejs: "^2.5.7",
	eslint: "^5.8.0",
	"eslint-config-mourner": "^3.0.0",
	"eslint-plugin-flowtype": "^3.2.0",
	"eslint-plugin-html": "^4.0.6",
	"eslint-plugin-import": "^2.14.0",
	"eslint-plugin-react": "^7.11.1",
	"execcommand-copy": "^1.1.0",
	"flow-bin": "^0.85.0",
	"github-slugger": "^1.1.1",
	gl: "^4.1.1",
	glob: "^7.0.3",
	"is-builtin-module": "^3.0.0",
	jsdom: "^13.0.0",
	"json-stringify-pretty-compact": "^1.0.4",
	jsonwebtoken: "^8.3.0",
	"mock-geolocation": "^1.0.11",
	"npm-run-all": "^4.0.1",
	nyc: "^13.1.0",
	"object.entries": "^1.0.4",
	pirates: "^3.0.2",
	pngjs: "^3.3.3",
	"postcss-cli": "^5.0.0",
	"postcss-inline-svg": "^3.1.1",
	"pretty-bytes": "^5.1.0",
	prismjs: "^1.8.1",
	"prop-types": "^15.6.0",
	"raw-loader": "^0.5.1",
	react: "^16.0.0",
	"react-dom": "^16.0.0",
	"react-helmet": "^5.2.0",
	remark: "^8.0.0",
	"remark-html": "^5.0.1",
	"remark-react": "^4.0.1",
	request: "^2.79.0",
	rollup: "^0.66.2",
	"rollup-plugin-buble": "^0.18.0",
	"rollup-plugin-commonjs": "^9.1.6",
	"rollup-plugin-json": "^2.3.0",
	"rollup-plugin-node-resolve": "3.4.0",
	"rollup-plugin-replace": "^2.0.0",
	"rollup-plugin-sourcemaps": "^0.4.2",
	"rollup-plugin-terser": "^3.0.0",
	"rollup-plugin-unassert": "^0.2.0",
	sinon: "^7.1.1",
	slugg: "^1.2.1",
	st: "^1.2.0",
	stylelint: "^9.7.1",
	"stylelint-config-standard": "^18.2.0",
	tap: "^12.0.1"
};
var engines = {
	node: ">=6.4.0"
};
var esm = true;
var files = [
	"build/",
	"dist/",
	"flow-typed/",
	"src/",
	".flowconfig"
];
var homepage = "https://github.com/mapbox/mapbox-gl-js#readme";
var license = "SEE LICENSE IN LICENSE.txt";
var main = "dist/mapbox-gl.js";
var name = "mapbox-gl";
var repository = {
	type: "git",
	url: "git://github.com/mapbox/mapbox-gl-js.git"
};
var scripts = {
	build: "run-s build-docs && batfish build # invoked by publisher when publishing docs on the mb-pages branch",
	"build-benchmarks": "BENCHMARK_VERSION=${BENCHMARK_VERSION:-\"$(git rev-parse --abbrev-ref HEAD) $(git rev-parse --short=7 HEAD)\"} rollup -c bench/versions/rollup_config_benchmarks.js",
	"build-css": "postcss -o dist/mapbox-gl.css src/css/mapbox-gl.css",
	"build-dev": "rollup -c --environment BUILD:dev",
	"build-docs": "documentation build --github --format json --config ./docs/documentation.yml --output docs/components/api.json src/index.js",
	"build-flow-types": "cp build/mapbox-gl.js.flow dist/mapbox-gl.js.flow && cp build/mapbox-gl.js.flow dist/mapbox-gl-dev.js.flow",
	"build-prod": "rollup -c --environment BUILD:production",
	"build-prod-min": "rollup -c --environment BUILD:production,MINIFY:true",
	"build-style-spec": "cd src/style-spec && npm run build && cd ../.. && mkdir -p dist/style-spec && cp src/style-spec/dist/* dist/style-spec",
	"build-token": "node build/generate-access-token-script.js",
	codegen: "build/run-node build/generate-style-code.js && build/run-node build/generate-struct-arrays.js",
	lint: "eslint --cache --ignore-path .gitignore src test bench docs docs/pages/example/*.html debug/*.html",
	"lint-css": "stylelint 'src/css/mapbox-gl.css'",
	"lint-docs": "documentation lint src/index.js",
	"open-changed-examples": "git diff --name-only mb-pages HEAD -- docs/pages/example/*.html | awk '{print \"http://127.0.0.1:4000/mapbox-gl-js/example/\" substr($0,33,length($0)-37)}' | xargs open",
	prepublishOnly: "run-s build-flow-types build-dev build-prod-min build-prod build-css build-style-spec test-build",
	start: "run-p build-token watch-css watch-dev watch-benchmarks watch-style-benchmarks start-server",
	"start-bench": "run-p build-token watch-benchmarks watch-style-benchmarks start-server",
	"start-debug": "run-p build-token watch-css watch-dev start-server",
	"start-docs": "run-s build-prod-min build-css build-docs && DEPLOY_ENV=local batfish start",
	"start-server": "st --no-cache -H 0.0.0.0 --port 9966 --index index.html .",
	test: "run-s lint lint-css test-flow test-unit",
	"test-build": "build/run-tap --no-coverage test/build/**/*.test.js",
	"test-cov": "nyc --require=@mapbox/flow-remove-types/register --reporter=text-summary --reporter=lcov --cache run-s test-unit test-expressions test-query test-render",
	"test-expressions": "build/run-node test/expression.test.js",
	"test-flow": "build/run-node build/generate-flow-typed-style-spec && flow .",
	"test-query": "node test/query.test.js",
	"test-render": "node --max-old-space-size=2048 test/render.test.js",
	"test-suite": "run-s test-render test-query",
	"test-suite-clean": "find test/integration/{render,query}-tests -mindepth 2 -type d  -not \\( -exec test -e \"{}/style.json\" \\; \\) -print | xargs -t rm -r",
	"test-unit": "build/run-tap --reporter classic --no-coverage test/unit",
	"watch-benchmarks": "BENCHMARK_VERSION=${BENCHMARK_VERSION:-\"$(git rev-parse --abbrev-ref HEAD) $(git rev-parse --short=7 HEAD)\"} rollup -c bench/versions/rollup_config_benchmarks.js --watch",
	"watch-css": "postcss --watch -o dist/mapbox-gl.css src/css/mapbox-gl.css",
	"watch-dev": "rollup -c --environment BUILD:dev --watch",
	"watch-style-benchmarks": "BENCHMARK_VERSION=${BENCHMARK_VERSION:-\"$(git rev-parse --abbrev-ref HEAD) $(git rev-parse --short=7 HEAD)\"} rollup -c bench/styles/rollup_config_benchmarks.js --watch"
};
var style = "dist/mapbox-gl.css";
var version = "0.52.0";
({
	_from: _from,
	_id: _id,
	_inBundle: _inBundle,
	_integrity: _integrity,
	_location: _location,
	_phantomChildren: _phantomChildren,
	_requested: _requested,
	_requiredBy: _requiredBy,
	_resolved: _resolved,
	_shasum: _shasum,
	_spec: _spec,
	_where: _where,
	browser: browser,
	bugs: bugs,
	bundleDependencies: bundleDependencies,
	dependencies: dependencies,
	deprecated: deprecated,
	description: description,
	devDependencies: devDependencies,
	engines: engines,
	esm: esm,
	files: files,
	homepage: homepage,
	license: license,
	main: main,
	name: name,
	repository: repository,
	scripts: scripts,
	style: style,
	version: version
});

//      

                                                
                                                      
                                                

var help = 'See https://www.mapbox.com/api-documentation/#access-tokens';
var telemEventKey = 'mapbox.eventData';

                   
                     
                      
                 
                         
   

function makeAPIURL(urlObject           , accessToken                      )         {
    var apiUrlObject = parseUrl(config.API_URL);
    urlObject.protocol = apiUrlObject.protocol;
    urlObject.authority = apiUrlObject.authority;

    if (apiUrlObject.path !== '/') {
        urlObject.path = "" + (apiUrlObject.path) + (urlObject.path);
    }

    if (!config.REQUIRE_ACCESS_TOKEN) { return formatUrl(urlObject); }

    accessToken = accessToken || config.ACCESS_TOKEN;
    if (!accessToken)
        { throw new Error(("An API access token is required to use Mapbox GL. " + help)); }
    if (accessToken[0] === 's')
        { throw new Error(("Use a public access token (pk.*) with Mapbox GL, not a secret access token (sk.*). " + help)); }

    urlObject.params.push(("access_token=" + accessToken));
    return formatUrl(urlObject);
}

function isMapboxURL(url        ) {
    return url.indexOf('mapbox:') === 0;
}

var mapboxHTTPURLRe = /^((https?:)?\/\/)?([^\/]+\.)?mapbox\.c(n|om)(\/|\?|$)/i;
function isMapboxHTTPURL(url        )          {
    return mapboxHTTPURLRe.test(url);
}

var normalizeStyleURL = function(url        , accessToken         )         {
    if (!isMapboxURL(url)) { return url; }
    var urlObject = parseUrl(url);
    urlObject.path = "/styles/v1" + (urlObject.path);
    return makeAPIURL(urlObject, accessToken);
};

var normalizeGlyphsURL = function(url        , accessToken         )         {
    if (!isMapboxURL(url)) { return url; }
    var urlObject = parseUrl(url);
    urlObject.path = "/fonts/v1" + (urlObject.path);
    return makeAPIURL(urlObject, accessToken);
};

var normalizeSourceURL = function(url        , accessToken         )         {
    if (!isMapboxURL(url)) { return url; }
    var urlObject = parseUrl(url);
    urlObject.path = "/v4/" + (urlObject.authority) + ".json";
    // TileJSON requests need a secure flag appended to their URLs so
    // that the server knows to send SSL-ified resource references.
    urlObject.params.push('secure');
    return makeAPIURL(urlObject, accessToken);
};

var normalizeSpriteURL = function(url        , format        , extension        , accessToken         )         {
    var urlObject = parseUrl(url);
    if (!isMapboxURL(url)) {
        urlObject.path += "" + format + extension;
        return formatUrl(urlObject);
    }
    urlObject.path = "/styles/v1" + (urlObject.path) + "/sprite" + format + extension;
    return makeAPIURL(urlObject, accessToken);
};

var imageExtensionRe = /(\.(png|jpg)\d*)(?=$)/;
// matches any file extension specified by a dot and one or more alphanumeric characters
var extensionRe = /\.[\w]+$/;

var normalizeTileURL = function(tileURL        , sourceURL          , tileSize          )         {
    if (!sourceURL || !isMapboxURL(sourceURL)) { return tileURL; }

    var urlObject = parseUrl(tileURL);

    // The v4 mapbox tile API supports 512x512 image tiles only when @2x
    // is appended to the tile URL. If `tileSize: 512` is specified for
    // a Mapbox raster source force the @2x suffix even if a non hidpi device.
    var suffix = exported.devicePixelRatio >= 2 || tileSize === 512 ? '@2x' : '';
    var extension = exported$1.supported ? '.webp' : '$1';
    urlObject.path = urlObject.path.replace(imageExtensionRe, ("" + suffix + extension));
    urlObject.path = "/v4" + (urlObject.path);

    return makeAPIURL(urlObject);
};

var canonicalizeTileURL = function(url        ) {
    var version$$1 = "/v4/";

    var urlObject = parseUrl(url);
    // Make sure that we are dealing with a valid Mapbox tile URL.
    // Has to begin with /v4/, with a valid filename + extension
    if (!urlObject.path.match(/(^\/v4\/)/) || !urlObject.path.match(extensionRe)) {
        // Not a proper Mapbox tile URL.
        return url;
    }
    // Reassemble the canonical URL from the parts we've parsed before.
    var result = "mapbox://tiles/";
    result +=  urlObject.path.replace(version$$1, '');

    // Append the query string, minus the access token parameter.
    var params = urlObject.params.filter(function (p) { return !p.match(/^access_token=/); });
    if (params.length) { result += "?" + (params.join('&')); }
    return result;
};

var canonicalizeTileset = function(tileJSON          , sourceURL        ) {
    if (!isMapboxURL(sourceURL)) { return tileJSON.tiles || []; }
    var canonical = [];
    for (var i = 0, list = tileJSON.tiles; i < list.length; i += 1) {
        var url = list[i];

       var canonicalUrl = canonicalizeTileURL(url);
        canonical.push(canonicalUrl);
    }
    return canonical;
};

var urlRe = /^(\w+):\/\/([^/?]*)(\/[^?]+)?\??(.+)?/;

function parseUrl(url        )            {
    var parts = url.match(urlRe);
    if (!parts) {
        throw new Error('Unable to parse URL object');
    }
    return {
        protocol: parts[1],
        authority: parts[2],
        path: parts[3] || '/',
        params: parts[4] ? parts[4].split('&') : []
    };
}

function formatUrl(obj           )         {
    var params = obj.params.length ? ("?" + (obj.params.join('&'))) : '';
    return ((obj.protocol) + "://" + (obj.authority) + (obj.path) + params);
}

                                                          

var TelemetryEvent = function TelemetryEvent(type                 ) {
     this.type = type;
     this.anonId = null;
     this.eventData = {lastSuccess: null, accessToken: config.ACCESS_TOKEN};
     this.queue = [];
     this.pendingRequest = null;
 };

 TelemetryEvent.prototype.fetchEventData = function fetchEventData () {
     var isLocalStorageAvailable = storageAvailable('localStorage');
     var storageKey = telemEventKey + ":" + (config.ACCESS_TOKEN || '');
     var uuidKey = telemEventKey + ".uuid:" + (config.ACCESS_TOKEN || '');

     if (isLocalStorageAvailable) {
         //Retrieve cached data
         try {
             var data = self.localStorage.getItem(storageKey);
             if (data) {
                 this.eventData = JSON.parse(data);
             }

             var uuid$$1 = self.localStorage.getItem(uuidKey);
             if (uuid$$1) { this.anonId = uuid$$1; }
         } catch (e) {
             warnOnce('Unable to read from LocalStorage');
         }
     }
 };

 TelemetryEvent.prototype.saveEventData = function saveEventData () {
     var isLocalStorageAvailable = storageAvailable('localStorage');
     var storageKey = telemEventKey + ":" + (config.ACCESS_TOKEN || '');
     var uuidKey = telemEventKey + ".uuid:" + (config.ACCESS_TOKEN || '');
     if (isLocalStorageAvailable) {
         try {
             self.localStorage.setItem(uuidKey, this.anonId);
             if (this.eventData.lastSuccess) {
                 self.localStorage.setItem(storageKey, JSON.stringify(this.eventData));
             }
         } catch (e) {
             warnOnce('Unable to write to LocalStorage');
         }
     }

 };

 TelemetryEvent.prototype.processRequests = function processRequests () {};

 /*
 * If any event data should be persisted after the POST request, the callback should modify eventData`
 * to the values that should be saved. For this reason, the callback should be invoked prior to the call
 * to TelemetryEvent#saveData
 */
 TelemetryEvent.prototype.postEvent = function postEvent (timestamp     , additionalPayload              , callback                    ) {
        var this$1 = this;

     var eventsUrlObject         = parseUrl(config.EVENTS_URL);
     eventsUrlObject.params.push(("access_token=" + (config.ACCESS_TOKEN || '')));
     var payload      = {
         event: this.type,
         created: new Date(timestamp).toISOString(),
         sdkIdentifier: 'mapbox-gl-js',
         sdkVersion: version,
         userId: this.anonId
     };

     var finalPayload = additionalPayload ? extend(payload, additionalPayload) : payload;
     var request                 = {
         url: formatUrl(eventsUrlObject),
         headers: {
             'Content-Type': 'text/plain' //Skip the pre-flight OPTIONS request
         },
         body: JSON.stringify([finalPayload])
     };

     this.pendingRequest = postData(request, function (error) {
         this$1.pendingRequest = null;
         callback(error);
         this$1.saveEventData();
         this$1.processRequests();
     });
 };

 TelemetryEvent.prototype.queueRequest = function queueRequest (event                                       ) {
     this.queue.push(event);
     this.processRequests();
 };

var MapLoadEvent = /*@__PURE__*/(function (TelemetryEvent) {
   function MapLoadEvent() {
        TelemetryEvent.call(this, 'map.load');
        this.success = {};
    }

   if ( TelemetryEvent ) MapLoadEvent.__proto__ = TelemetryEvent;
   MapLoadEvent.prototype = Object.create( TelemetryEvent && TelemetryEvent.prototype );
   MapLoadEvent.prototype.constructor = MapLoadEvent;

    MapLoadEvent.prototype.postMapLoadEvent = function postMapLoadEvent (tileUrls               , mapId        ) {
        //Enabled only when Mapbox Access Token is set and a source uses
        // mapbox tiles.
        if (config.ACCESS_TOKEN &&
            Array.isArray(tileUrls) &&
            tileUrls.some(function (url) { return isMapboxHTTPURL(url); })) {
            this.queueRequest({id: mapId, timestamp: Date.now()});
        }
    };

    MapLoadEvent.prototype.processRequests = function processRequests () {
        var this$1 = this;

        if (this.pendingRequest || this.queue.length === 0) { return; }
        var ref = this.queue.shift();
        var id = ref.id;
        var timestamp = ref.timestamp;

        // Only one load event should fire per map
        if (id && this.success[id]) { return; }

        if (!this.anonId) {
            this.fetchEventData();
        }

        if (!validateUuid(this.anonId)) {
            this.anonId = uuid();
        }

        this.postEvent(timestamp, {}, function (err) {
            if (!err) {
                if (id) { this$1.success[id] = true; }
            }
        });
    };

   return MapLoadEvent;
}(TelemetryEvent));


var TurnstileEvent = /*@__PURE__*/(function (TelemetryEvent) {
   function TurnstileEvent() {
        TelemetryEvent.call(this, 'appUserTurnstile');
    }

   if ( TelemetryEvent ) TurnstileEvent.__proto__ = TelemetryEvent;
   TurnstileEvent.prototype = Object.create( TelemetryEvent && TelemetryEvent.prototype );
   TurnstileEvent.prototype.constructor = TurnstileEvent;

    TurnstileEvent.prototype.postTurnstileEvent = function postTurnstileEvent (tileUrls               ) {
        //Enabled only when Mapbox Access Token is set and a source uses
        // mapbox tiles.
        if (config.ACCESS_TOKEN &&
            Array.isArray(tileUrls) &&
            tileUrls.some(function (url) { return isMapboxHTTPURL(url); })) {
            this.queueRequest(Date.now());
        }
    };


    TurnstileEvent.prototype.processRequests = function processRequests () {
        var this$1 = this;

        if (this.pendingRequest || this.queue.length === 0) {
            return;
        }

        var dueForEvent = this.eventData.accessToken ? (this.eventData.accessToken !== config.ACCESS_TOKEN) : false;
        //Reset event data cache if the access token changed.
        if (dueForEvent) {
            this.anonId = this.eventData.lastSuccess = null;
        }
        if (!this.anonId || !this.eventData.lastSuccess) {
            //Retrieve cached data
            this.fetchEventData();
        }

        if (!validateUuid(this.anonId)) {
            this.anonId = uuid();
            dueForEvent = true;
        }

        var nextUpdate = this.queue.shift();
        // Record turnstile event once per calendar day.
        if (this.eventData.lastSuccess) {
            var lastUpdate = new Date(this.eventData.lastSuccess);
            var nextDate = new Date(nextUpdate);
            var daysElapsed = (nextUpdate - this.eventData.lastSuccess) / (24 * 60 * 60 * 1000);
            dueForEvent = dueForEvent || daysElapsed >= 1 || daysElapsed < -1 || lastUpdate.getDate() !== nextDate.getDate();
        } else {
            dueForEvent = true;
        }

        if (!dueForEvent) {
            return this.processRequests();
        }

        this.postEvent(nextUpdate, {"enabled.telemetry": false}, function (err) {
            if (!err) {
                this$1.eventData.lastSuccess = nextUpdate;
                this$1.eventData.accessToken = config.ACCESS_TOKEN;
            }
        });
    };

   return TurnstileEvent;
}(TelemetryEvent));

var turnstileEvent_ = new TurnstileEvent();
var postTurnstileEvent = turnstileEvent_.postTurnstileEvent.bind(turnstileEvent_);

var mapLoadEvent_ = new MapLoadEvent();
var postMapLoadEvent = mapLoadEvent_.postMapLoadEvent.bind(mapLoadEvent_);

//      

                                                  
                                                      

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
                                 
                
                     
                                    
                  
                                             
                                            
                                   
  

                                                                                                             

var AJAXError = /*@__PURE__*/(function (Error) {
  function AJAXError(message        , status        , url        ) {
        if (status === 401 && isMapboxHTTPURL(url)) {
            message += ': you may have provided an invalid Mapbox access token. See https://www.mapbox.com/api-documentation/#access-tokens';
        }
        Error.call(this, message);
        this.status = status;
        this.url = url;

        // work around for https://github.com/Rich-Harris/buble/issues/40
        this.name = this.constructor.name;
        this.message = message;
    }

  if ( Error ) AJAXError.__proto__ = Error;
  AJAXError.prototype = Object.create( Error && Error.prototype );
  AJAXError.prototype.constructor = AJAXError;

    AJAXError.prototype.toString = function toString () {
        return ((this.name) + ": " + (this.message) + " (" + (this.status) + "): " + (this.url));
    };

  return AJAXError;
}(Error));

// Ensure that we're sending the correct referrer from blob URL worker bundles.
// For files loaded from the local file system, `location.origin` will be set
// to the string(!) "null" (Firefox), or "file://" (Chrome, Safari, Edge, IE),
// and we will set an empty referrer. Otherwise, we're using the document's URL.
/* global self, WorkerGlobalScope */
var getReferrer = typeof WorkerGlobalScope !== 'undefined' &&
                           typeof self !== 'undefined' &&
                           self instanceof WorkerGlobalScope ?
    function () { return self.worker && self.worker.referrer; } :
    function () {
        var origin = self.location.origin;
        if (origin && origin !== 'null' && origin !== 'file://') {
            return origin + self.location.pathname;
        }
    };

function makeFetchRequest(requestParameters                   , callback                       )             {
    var controller = new self.AbortController();
    var request = new self.Request(requestParameters.url, {
        method: requestParameters.method || 'GET',
        body: requestParameters.body,
        credentials: requestParameters.credentials,
        headers: requestParameters.headers,
        referrer: getReferrer(),
        signal: controller.signal
    });

    if (requestParameters.type === 'json') {
        request.headers.set('Accept', 'application/json');
    }

    self.fetch(request).then(function (response) {
        if (response.ok) {
            response[requestParameters.type || 'text']().then(function (result) {
                callback(null, result, response.headers.get('Cache-Control'), response.headers.get('Expires'));
            }).catch(function (err) { return callback(new Error(err.message)); });
        } else {
            callback(new AJAXError(response.statusText, response.status, requestParameters.url));
        }
    }).catch(function (error) {
        if (error.code === 20) {
            // silence expected AbortError
            return;
        }
        callback(new Error(error.message));
    });

    return { cancel: function () { return controller.abort(); } };
}

function makeXMLHttpRequest(requestParameters                   , callback                       )             {
    var xhr                 = new self.XMLHttpRequest();

    xhr.open(requestParameters.method || 'GET', requestParameters.url, true);
    if (requestParameters.type === 'arrayBuffer') {
        xhr.responseType = 'arraybuffer';
    }
    for (var k in requestParameters.headers) {
        xhr.setRequestHeader(k, requestParameters.headers[k]);
    }
    if (requestParameters.type === 'json') {
        xhr.setRequestHeader('Accept', 'application/json');
    }
    xhr.withCredentials = requestParameters.credentials === 'include';
    xhr.onerror = function () {
        callback(new Error(xhr.statusText));
    };
    xhr.onload = function () {
        if (((xhr.status >= 200 && xhr.status < 300) || xhr.status === 0) && xhr.response !== null) {
            var data        = xhr.response;
            if (requestParameters.type === 'json') {
                // We're manually parsing JSON here to get better error messages.
                try {
                    data = JSON.parse(xhr.response);
                } catch (err) {
                    return callback(err);
                }
            }
            callback(null, data, xhr.getResponseHeader('Cache-Control'), xhr.getResponseHeader('Expires'));
        } else {
            callback(new AJAXError(xhr.statusText, xhr.status, requestParameters.url));
        }
    };
    xhr.send(requestParameters.body);
    return { cancel: function () { return xhr.abort(); } };
}

var makeRequest = self.fetch && self.Request && self.AbortController ? makeFetchRequest : makeXMLHttpRequest;

var getJSON = function(requestParameters                   , callback                          )             {
    return makeRequest(extend(requestParameters, { type: 'json' }), callback);
};

var getArrayBuffer = function(requestParameters                   , callback                               )             {
    return makeRequest(extend(requestParameters, { type: 'arrayBuffer' }), callback);
};

var postData = function(requestParameters                   , callback                          )             {
    return makeRequest(extend(requestParameters, { method: 'POST' }), callback);
};

function sameOrigin(url) {
    var a                    = self.document.createElement('a');
    a.href = url;
    return a.protocol === self.document.location.protocol && a.host === self.document.location.host;
}

var transparentPngUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII=';

var imageQueue, numImageRequests;
var resetImageRequestQueue = function () {
    imageQueue = [];
    numImageRequests = 0;
};
resetImageRequestQueue();

var getImage = function(requestParameters                   , callback                            )             {
    // limit concurrent image loads to help with raster sources performance on big screens
    if (numImageRequests >= config.MAX_PARALLEL_IMAGE_REQUESTS) {
        var queued = {requestParameters: requestParameters, callback: callback, cancelled: false};
        imageQueue.push(queued);
        return { cancel: function cancel() { queued.cancelled = true; } };
    }
    numImageRequests++;

    var advanced = false;
    var advanceImageRequestQueue = function () {
        if (advanced) { return; }
        advanced = true;
        numImageRequests--;
        assert(numImageRequests >= 0);
        while (imageQueue.length && numImageRequests < config.MAX_PARALLEL_IMAGE_REQUESTS) { // eslint-disable-line
            var ref = imageQueue.shift();
            var requestParameters = ref.requestParameters;
            var callback = ref.callback;
            var cancelled = ref.cancelled;
            if (!cancelled) {
                getImage(requestParameters, callback);
            }
        }
    };

    // request the image with XHR to work around caching issues
    // see https://github.com/mapbox/mapbox-gl-js/issues/1470
    var request = getArrayBuffer(requestParameters, function (err        , data              , cacheControl         , expires         ) {

        advanceImageRequestQueue();

        if (err) {
            callback(err);
        } else if (data) {
            var img                   = new self.Image();
            var URL = self.URL || self.webkitURL;
            img.onload = function () {
                callback(null, img);
                URL.revokeObjectURL(img.src);
            };
            img.onerror = function () { return callback(new Error('Could not load image. Please make sure to use a supported image type such as PNG or JPEG. Note that SVGs are not supported.')); };
            var blob       = new self.Blob([new Uint8Array(data)], { type: 'image/png' });
            (img     ).cacheControl = cacheControl;
            (img     ).expires = expires;
            img.src = data.byteLength ? URL.createObjectURL(blob) : transparentPngUrl;
        }
    });

    return {
        cancel: function () {
            request.cancel();
            advanceImageRequestQueue();
        }
    };
};

var getVideo = function(urls               , callback                            )             {
    var video                   = self.document.createElement('video');
    video.muted = true;
    video.onloadstart = function() {
        callback(null, video);
    };
    for (var i = 0; i < urls.length; i++) {
        var s                    = self.document.createElement('source');
        if (!sameOrigin(urls[i])) {
            video.crossOrigin = 'Anonymous';
        }
        s.src = urls[i];
        video.appendChild(s);
    }
    return { cancel: function () {} };
};

//      

                                
                                               

function _addEventListener(type        , listener          , listenerList           ) {
    var listenerExists = listenerList[type] && listenerList[type].indexOf(listener) !== -1;
    if (!listenerExists) {
        listenerList[type] = listenerList[type] || [];
        listenerList[type].push(listener);
    }
}

function _removeEventListener(type        , listener          , listenerList           ) {
    if (listenerList && listenerList[type]) {
        var index = listenerList[type].indexOf(listener);
        if (index !== -1) {
            listenerList[type].splice(index, 1);
        }
    }
}

var Event = function Event(type    , data) {
    if ( data === void 0 ) data     = {};

    extend(this, data);
    this.type = type;
};

var ErrorEvent = /*@__PURE__*/(function (Event) {
    function ErrorEvent(error       , data) {
        if ( data === void 0 ) data         = {};

        Event.call(this, 'error', extend({error: error}, data));
    }

    if ( Event ) ErrorEvent.__proto__ = Event;
    ErrorEvent.prototype = Object.create( Event && Event.prototype );
    ErrorEvent.prototype.constructor = ErrorEvent;

    return ErrorEvent;
}(Event));

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

Evented.prototype.fire = function fire (event   , properties     ) {
    // Compatibility with (type: string, properties: Object) signature from previous versions.
    // See https://github.com/mapbox/mapbox-gl-js/issues/6522,
    // https://github.com/mapbox/mapbox-gl-draw/issues/766
    if (typeof event === 'string') {
        event = new Event(event, properties || {});
    }

    var type = event.type;

    if (this.listens(type)) {
        (event ).target = this;

        // make sure adding or removing listeners inside other listeners won't cause an infinite loop
        var listeners = this._listeners && this._listeners[type] ? this._listeners[type].slice() : [];
        for (var i = 0, list = listeners; i < list.length; i += 1) {
            var listener = list[i];

                listener.call(this, event);
        }

        var oneTimeListeners = this._oneTimeListeners && this._oneTimeListeners[type] ? this._oneTimeListeners[type].slice() : [];
        for (var i$1 = 0, list$1 = oneTimeListeners; i$1 < list$1.length; i$1 += 1) {
            var listener$1 = list$1[i$1];

                _removeEventListener(type, listener$1, this._oneTimeListeners);
            listener$1.call(this, event);
        }

        var parent = this._eventedParent;
        if (parent) {
            extend(
                event,
                typeof this._eventedParentData === 'function' ? this._eventedParentData() : this._eventedParentData
            );
            parent.fire(event);
        }

    // To ensure that no error events are dropped, print them to the
    // console if they have no listeners.
    } else if (event instanceof ErrorEvent) {
        console.error(event.error);
    }

    return this;
};

/**
 * Returns a true if this instance of Evented or any forwardeed instances of Evented have a listener for the specified type.
 *
 * @param {string} type The event type
 * @returns {boolean} `true` if there is at least one registered listener for specified event type, `false` otherwise
 * @private
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
 * @private
 */
Evented.prototype.setEventedParent = function setEventedParent (parent      , data                    ) {
    this._eventedParent = parent;
    this._eventedParentData = data;

    return this;
};

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
}

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x.default : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

function getCjsExportFromNamespace (n) {
	return n && n.default || n;
}

var sphericalmercator = createCommonjsModule(function (module, exports) {
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
}

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

if ('object' !== 'undefined' && 'object' !== 'undefined') {
    module.exports = exports = SphericalMercator;
}
});

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

function loadArcGISMapServer(options, callback) {
    var loaded = function(err, metadata) {
        if (err) {
            return callback(err);
        }

        var result = pick(metadata,
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
                var merc = new sphericalmercator({
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
        getJSON({url: options.url}, loaded);
    } else {
        exported.frame(loaded.bind(null, null, options));
    }
}

//      

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

    return new LngLatBounds(new LngLat(this.lng - lngAccuracy, this.lat - latAccuracy),
        new LngLat(this.lng + lngAccuracy, this.lat + latAccuracy));
};

/**
 * Converts an array of two numbers or an object with `lng` and `lat` or `lon` and `lat` properties
 * to a `LngLat` object.
 *
 * If a `LngLat` object is passed in, the function returns it unchanged.
 *
 * @param {LngLatLike} input An array of two numbers or object to convert, or a `LngLat` object to return.
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
        return new LngLat(
            // flow can't refine this to have one of lng or lat, so we have to cast to any
            Number('lng' in input ? (input ).lng : (input ).lon),
            Number(input.lat)
        );
    }
    throw new Error("`LngLatLike` argument must be specified as a LngLat instance, an object {lng: <lng>, lat: <lat>}, an object {lon: <lng>, lat: <lat>}, or an array of [<lng>, <lat>]");
};

//      

                                          

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
        // noop
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
LngLatBounds.prototype.extend = function extend (obj                   ) {
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
 * Check if the bounding box is an empty/`null`-type box.
 *
 * @returns {boolean} True if bounds have been defined, otherwise false.
 */
LngLatBounds.prototype.isEmpty = function isEmpty () {
    return !(this._sw && this._ne);
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

//      
                                               

/*
 * The circumference of the world in meters at the given latitude.
 */
function circumferenceAtLatitude(latitude        ) {
    var circumference = 2 * Math.PI * 6378137;
    return circumference * Math.cos(latitude * Math.PI / 180);
}

function mercatorXfromLng(lng        ) {
    return (180 + lng) / 360;
}

function mercatorYfromLat(lat        ) {
    return (180 - (180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)))) / 360;
}

function mercatorZfromAltitude(altitude        , lat        ) {
    return altitude / circumferenceAtLatitude(lat);
}

function lngFromMercatorX(x        ) {
    return x * 360 - 180;
}

function latFromMercatorY(y        ) {
    var y2 = 180 - y * 360;
    return 360 / Math.PI * Math.atan(Math.exp(y2 * Math.PI / 180)) - 90;
}

function altitudeFromMercatorZ(z        , y        ) {
    return z * circumferenceAtLatitude(latFromMercatorY(y));
}

/**
 * A `MercatorCoordinate` object represents a projected three dimensional position.
 *
 * `MercatorCoordinate` uses the web mercator projection ([EPSG:3857](https://epsg.io/3857)) with slightly different units:
 * - the size of 1 unit is the width of the projected world instead of the "mercator meter"
 * - the origin of the coordinate space is at the north-west corner instead of the middle
 *
 * For example, `MercatorCoordinate(0, 0, 0)` is the north-west corner of the mercator world and
 * `MercatorCoordinate(1, 1, 0)` is the south-east corner. If you are familiar with
 * [vector tiles](https://github.com/mapbox/vector-tile-spec) it may be helpful to think
 * of the coordinate space as the `0/0/0` tile with an extent of `1`.
 *
 * The `z` dimension of `MercatorCoordinate` is conformal. A cube in the mercator coordinate space would be rendered as a cube.
 *
 * @param {number} x The x component of the position.
 * @param {number} y The y component of the position.
 * @param {number} z The z component of the position.
 * @example
 * var nullIsland = new mapboxgl.MercatorCoordinate(0.5, 0.5, 0);
 *
 * @see [Add a custom style layer](https://www.mapbox.com/mapbox-gl-js/example/custom-style-layer/)
 */
var MercatorCoordinate = function MercatorCoordinate(x    , y    , z) {
    if ( z === void 0 ) z     = 0;

    this.x = +x;
    this.y = +y;
    this.z = +z;
};

/**
 * Project a `LngLat` to a `MercatorCoordinate`.
 *
 * @param {LngLatLike} lngLatLike The location to project.
 * @param {number} altitude The altitude in meters of the position.
 * @returns {MercatorCoordinate} The projected mercator coordinate.
 * @example
 * var coord = mapboxgl.MercatorCoordinate.fromLngLat({ lng: 0, lat: 0}, 0);
 * coord; // MercatorCoordinate(0.5, 0.5, 0)
 */
MercatorCoordinate.fromLngLat = function fromLngLat (lngLatLike        , altitude) {
        if ( altitude === void 0 ) altitude     = 0;

    var lngLat = LngLat.convert(lngLatLike);

    return new MercatorCoordinate(
            mercatorXfromLng(lngLat.lng),
            mercatorYfromLat(lngLat.lat),
            mercatorZfromAltitude(altitude, lngLat.lat));
};

/**
 * Returns the `LngLat` for the coordinate.
 *
 * @returns {LngLat} The `LngLat` object.
 * @example
 * var coord = new mapboxgl.MercatorCoordinate(0.5, 0.5, 0);
 * var latLng = coord.toLngLat(); // LngLat(0, 0)
 */
MercatorCoordinate.prototype.toLngLat = function toLngLat () {
    return new LngLat(
            lngFromMercatorX(this.x),
            latFromMercatorY(this.y));
};

/**
 * Returns the altitude in meters of the coordinate.
 *
 * @returns {number} The altitude in meters.
 * @example
 * var coord = new mapboxgl.MercatorCoordinate(0, 0, 0.02);
 * coord.toAltitude(); // 6914.281956295339
 */
MercatorCoordinate.prototype.toAltitude = function toAltitude () {
    return altitudeFromMercatorZ(this.z, this.y);
};

//      

                                               

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
    var worldSize = Math.pow(2, tileID.z);
    var level = {
        minX: Math.floor(mercatorXfromLng(this.bounds.getWest()) * worldSize),
        minY: Math.floor(mercatorYfromLat(this.bounds.getNorth()) * worldSize),
        maxX: Math.ceil(mercatorXfromLng(this.bounds.getEast()) * worldSize),
        maxY: Math.ceil(mercatorYfromLat(this.bounds.getSouth()) * worldSize)
    };
    var hit = tileID.x >= level.minX && tileID.x < level.maxX && tileID.y >= level.minY && tileID.y < level.maxY;
    return hit;
};

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

//      
var HTMLImageElement = self.HTMLImageElement;
var HTMLCanvasElement = self.HTMLCanvasElement;
var HTMLVideoElement = self.HTMLVideoElement;
var ImageData = self.ImageData;

                                         
                                                         

                           
                                                  
                                                    
                           
                                                    
                                                                   
                                                      
                         
                                                    
                                                           
                                                              

                   
                  
                   
              
 

                          
               
                
                      
                       
                      
               
                 

var Texture = function Texture(context     , image          , format           , options                                             ) {
    this.context = context;
    this.format = format;
    this.texture = context.gl.createTexture();
    this.update(image, options);
};

Texture.prototype.update = function update (image          , options                                           ) {
    var width = image.width;
        var height = image.height;
    var resize = !this.size || this.size[0] !== width || this.size[1] !== height;
    var ref = this;
        var context = ref.context;
    var gl = context.gl;

    this.useMipmap = Boolean(options && options.useMipmap);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    context.pixelStoreUnpackFlipY.set(false);
    context.pixelStoreUnpack.set(1);
    context.pixelStoreUnpackPremultiplyAlpha.set(this.format === gl.RGBA && (!options || options.premultiply !== false));

    if (resize) {
        this.size = [width, height];

        if (image instanceof HTMLImageElement || image instanceof HTMLCanvasElement || image instanceof HTMLVideoElement || image instanceof ImageData) {
            gl.texImage2D(gl.TEXTURE_2D, 0, this.format, this.format, gl.UNSIGNED_BYTE, image);
        } else {
            gl.texImage2D(gl.TEXTURE_2D, 0, this.format, width, height, 0, this.format, gl.UNSIGNED_BYTE, image.data);
        }

    } else {
        if (image instanceof HTMLImageElement || image instanceof HTMLCanvasElement || image instanceof HTMLVideoElement || image instanceof ImageData) {
            gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
        } else {
            gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, image.data);
        }
    }

    if (this.useMipmap && this.isSizePowerOfTwo()) {
        gl.generateMipmap(gl.TEXTURE_2D);
    }
};

Texture.prototype.bind = function bind (filter           , wrap         , minFilter            ) {
    var ref = this;
        var context = ref.context;
    var gl = context.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    if (minFilter === gl.LINEAR_MIPMAP_NEAREST && !this.isSizePowerOfTwo()) {
        minFilter = gl.LINEAR;
    }

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

Texture.prototype.isSizePowerOfTwo = function isSizePowerOfTwo () {
    return this.size[0] === this.size[1] && (Math.log(this.size[0]) / Math.LN2) % 1 === 0;
};

Texture.prototype.destroy = function destroy () {
    var ref = this.context;
        var gl = ref.gl;
    gl.deleteTexture(this.texture);
    this.texture = (null );
};

//      

                                                        
                                                                   
                                            
                                                            
                                                  
                                                           

var ArcGISTiledMapServiceSource = /*@__PURE__*/(function (Evented$$1) {
    function ArcGISTiledMapServiceSource(id        , options                                                          , dispatcher            , eventedParent         ) {
        Evented$$1.call(this);
        this.id = id;
        this.dispatcher = dispatcher;
        this.setEventedParent(eventedParent);

        this.type = 'arcgisraster';
        this.minzoom = 0;
        this.maxzoom = 22;
        this.roundZoom = true;
        this.tileSize = 512;
        this._loaded = false;

        this._options = extend({}, options);
        extend(this, pick(options, ['url', 'scheme', 'tileSize']));
    }

    if ( Evented$$1 ) ArcGISTiledMapServiceSource.__proto__ = Evented$$1;
    ArcGISTiledMapServiceSource.prototype = Object.create( Evented$$1 && Evented$$1.prototype );
    ArcGISTiledMapServiceSource.prototype.constructor = ArcGISTiledMapServiceSource;

    ArcGISTiledMapServiceSource.prototype.load = function load () {
        var this$1 = this;

        this.fire(new Event('dataloading', {dataType: 'source'}));
        loadArcGISMapServer(this._options, function (err, metadata) {
            if (err) {
                this$1.fire(new ErrorEvent(err));
            } else if (metadata) {
                extend(this$1, metadata);

                if (metadata.bounds) {
                    this$1.tileBounds = new TileBounds(metadata.bounds, this$1.minzoom, this$1.maxzoom);
                }

            // `content` is included here to prevent a race condition where `Style#_updateSources` is called
            // before the TileJSON arrives. this makes sure the tiles needed are loaded once TileJSON arrives
            // ref: https://github.com/mapbox/mapbox-gl-js/pull/4347#discussion_r104418088
            this$1.fire(new Event('data', {dataType: 'source', sourceDataType: 'metadata'}));
            this$1.fire(new Event('data', {dataType: 'source', sourceDataType: 'content'}));
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
        return extend({}, this._options);
    };

    ArcGISTiledMapServiceSource.prototype.hasTile = function hasTile (tileID                  ) {
        return !this.tileBounds || this.tileBounds.contains(tileID.canonical);
    };

    ArcGISTiledMapServiceSource.prototype.loadTile = function loadTile (tile      , callback                ) {
        var this$1 = this;

        //convert to ags coords
        var tilePoint = { z: tile.tileID.overscaledZ, x: tile.tileID.canonical.x, y: tile.tileID.canonical.y };

        var url =  _template(this.tileUrl, extend({
            s: _getSubdomain(tilePoint, this.subdomains),
            z: (this._lodMap && this._lodMap[tilePoint.z]) ? this._lodMap[tilePoint.z] : tilePoint.z, // try lod map first, then just defualt to zoom level
            x: tilePoint.x,
            y: tilePoint.y
        }, this.options));
        tile.request = getImage({url: url},  function (err, img) {
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
                    tile.texture.update(img, { useMipmap: true });
                } else {
                    tile.texture = new Texture(context, img, gl.RGBA, { useMipmap: true });
                    tile.texture.bind(gl.LINEAR, gl.CLAMP_TO_EDGE, gl.LINEAR_MIPMAP_NEAREST);

                    if (context.extTextureFilterAnisotropic) {
                        gl.texParameterf(gl.TEXTURE_2D, context.extTextureFilterAnisotropic.TEXTURE_MAX_ANISOTROPY_EXT, context.extTextureFilterAnisotropicMax);
                    }
                }

                tile.state = 'loaded';

                callback(null);
            }
        });
    };

    ArcGISTiledMapServiceSource.prototype.abortTile = function abortTile (tile      , callback                ) {
        if (tile.request) {
            tile.request.cancel();
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

return ArcGISTiledMapServiceSource;

}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwYm94LWdsLWFyY2dpcy10aWxlZC1tYXAtc2VydmljZS1kZXYuanMiLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9AbWFwYm94L3VuaXRiZXppZXIvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvQG1hcGJveC9wb2ludC1nZW9tZXRyeS9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9tYXBib3gtZ2wvc3JjL3V0aWwvYnJvd3Nlci93aW5kb3cuanMiLCIuLi9ub2RlX21vZHVsZXMvbWFwYm94LWdsL3NyYy9zdHlsZS1zcGVjL3V0aWwvZGVlcF9lcXVhbC5qcyIsIi4uL25vZGVfbW9kdWxlcy9tYXBib3gtZ2wvc3JjL3V0aWwvdXRpbC5qcyIsIi4uL25vZGVfbW9kdWxlcy9tYXBib3gtZ2wvc3JjL3V0aWwvY29uZmlnLmpzIiwiLi4vbm9kZV9tb2R1bGVzL21hcGJveC1nbC9zcmMvdXRpbC9icm93c2VyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL21hcGJveC1nbC9zcmMvdXRpbC93ZWJwX3N1cHBvcnRlZC5qcyIsIi4uL25vZGVfbW9kdWxlcy9tYXBib3gtZ2wvc3JjL3V0aWwvbWFwYm94LmpzIiwiLi4vbm9kZV9tb2R1bGVzL21hcGJveC1nbC9zcmMvdXRpbC9hamF4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL21hcGJveC1nbC9zcmMvdXRpbC9ldmVudGVkLmpzIiwiLi4vbm9kZV9tb2R1bGVzL0BtYXBib3gvc3BoZXJpY2FsbWVyY2F0b3Ivc3BoZXJpY2FsbWVyY2F0b3IuanMiLCIuLi9zcmMvbG9hZF9hcmNnaXNfbWFwc2VydmVyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL21hcGJveC1nbC9zcmMvZ2VvL2xuZ19sYXQuanMiLCIuLi9ub2RlX21vZHVsZXMvbWFwYm94LWdsL3NyYy9nZW8vbG5nX2xhdF9ib3VuZHMuanMiLCIuLi9ub2RlX21vZHVsZXMvbWFwYm94LWdsL3NyYy9nZW8vbWVyY2F0b3JfY29vcmRpbmF0ZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9tYXBib3gtZ2wvc3JjL3NvdXJjZS90aWxlX2JvdW5kcy5qcyIsIi4uL3NyYy9oZWxwZXJzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL21hcGJveC1nbC9zcmMvcmVuZGVyL3RleHR1cmUuanMiLCIuLi9zcmMvYXJjZ2lzX3RpbGVkX21hcF9zZXJ2aWNlX3NvdXJjZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogQ29weXJpZ2h0IChDKSAyMDA4IEFwcGxlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXRcbiAqIG1vZGlmaWNhdGlvbiwgYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uc1xuICogYXJlIG1ldDpcbiAqIDEuIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0XG4gKiAgICBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gKiAyLiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodFxuICogICAgbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZVxuICogICAgZG9jdW1lbnRhdGlvbiBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cbiAqXG4gKiBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIEFQUExFIElOQy4gYGBBUyBJUycnIEFORCBBTllcbiAqIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFXG4gKiBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVJcbiAqIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuICBJTiBOTyBFVkVOVCBTSEFMTCBBUFBMRSBJTkMuIE9SXG4gKiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCxcbiAqIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIChJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTyxcbiAqIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7IExPU1MgT0YgVVNFLCBEQVRBLCBPUlxuICogUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZIFRIRU9SWVxuICogT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUXG4gKiAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0VcbiAqIE9GIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4gKlxuICogUG9ydGVkIGZyb20gV2Via2l0XG4gKiBodHRwOi8vc3ZuLndlYmtpdC5vcmcvcmVwb3NpdG9yeS93ZWJraXQvdHJ1bmsvU291cmNlL1dlYkNvcmUvcGxhdGZvcm0vZ3JhcGhpY3MvVW5pdEJlemllci5oXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBVbml0QmV6aWVyO1xuXG5mdW5jdGlvbiBVbml0QmV6aWVyKHAxeCwgcDF5LCBwMngsIHAyeSkge1xuICAgIC8vIENhbGN1bGF0ZSB0aGUgcG9seW5vbWlhbCBjb2VmZmljaWVudHMsIGltcGxpY2l0IGZpcnN0IGFuZCBsYXN0IGNvbnRyb2wgcG9pbnRzIGFyZSAoMCwwKSBhbmQgKDEsMSkuXG4gICAgdGhpcy5jeCA9IDMuMCAqIHAxeDtcbiAgICB0aGlzLmJ4ID0gMy4wICogKHAyeCAtIHAxeCkgLSB0aGlzLmN4O1xuICAgIHRoaXMuYXggPSAxLjAgLSB0aGlzLmN4IC0gdGhpcy5ieDtcblxuICAgIHRoaXMuY3kgPSAzLjAgKiBwMXk7XG4gICAgdGhpcy5ieSA9IDMuMCAqIChwMnkgLSBwMXkpIC0gdGhpcy5jeTtcbiAgICB0aGlzLmF5ID0gMS4wIC0gdGhpcy5jeSAtIHRoaXMuYnk7XG5cbiAgICB0aGlzLnAxeCA9IHAxeDtcbiAgICB0aGlzLnAxeSA9IHAyeTtcbiAgICB0aGlzLnAyeCA9IHAyeDtcbiAgICB0aGlzLnAyeSA9IHAyeTtcbn1cblxuVW5pdEJlemllci5wcm90b3R5cGUuc2FtcGxlQ3VydmVYID0gZnVuY3Rpb24odCkge1xuICAgIC8vIGBheCB0XjMgKyBieCB0XjIgKyBjeCB0JyBleHBhbmRlZCB1c2luZyBIb3JuZXIncyBydWxlLlxuICAgIHJldHVybiAoKHRoaXMuYXggKiB0ICsgdGhpcy5ieCkgKiB0ICsgdGhpcy5jeCkgKiB0O1xufTtcblxuVW5pdEJlemllci5wcm90b3R5cGUuc2FtcGxlQ3VydmVZID0gZnVuY3Rpb24odCkge1xuICAgIHJldHVybiAoKHRoaXMuYXkgKiB0ICsgdGhpcy5ieSkgKiB0ICsgdGhpcy5jeSkgKiB0O1xufTtcblxuVW5pdEJlemllci5wcm90b3R5cGUuc2FtcGxlQ3VydmVEZXJpdmF0aXZlWCA9IGZ1bmN0aW9uKHQpIHtcbiAgICByZXR1cm4gKDMuMCAqIHRoaXMuYXggKiB0ICsgMi4wICogdGhpcy5ieCkgKiB0ICsgdGhpcy5jeDtcbn07XG5cblVuaXRCZXppZXIucHJvdG90eXBlLnNvbHZlQ3VydmVYID0gZnVuY3Rpb24oeCwgZXBzaWxvbikge1xuICAgIGlmICh0eXBlb2YgZXBzaWxvbiA9PT0gJ3VuZGVmaW5lZCcpIGVwc2lsb24gPSAxZS02O1xuXG4gICAgdmFyIHQwLCB0MSwgdDIsIHgyLCBpO1xuXG4gICAgLy8gRmlyc3QgdHJ5IGEgZmV3IGl0ZXJhdGlvbnMgb2YgTmV3dG9uJ3MgbWV0aG9kIC0tIG5vcm1hbGx5IHZlcnkgZmFzdC5cbiAgICBmb3IgKHQyID0geCwgaSA9IDA7IGkgPCA4OyBpKyspIHtcblxuICAgICAgICB4MiA9IHRoaXMuc2FtcGxlQ3VydmVYKHQyKSAtIHg7XG4gICAgICAgIGlmIChNYXRoLmFicyh4MikgPCBlcHNpbG9uKSByZXR1cm4gdDI7XG5cbiAgICAgICAgdmFyIGQyID0gdGhpcy5zYW1wbGVDdXJ2ZURlcml2YXRpdmVYKHQyKTtcbiAgICAgICAgaWYgKE1hdGguYWJzKGQyKSA8IDFlLTYpIGJyZWFrO1xuXG4gICAgICAgIHQyID0gdDIgLSB4MiAvIGQyO1xuICAgIH1cblxuICAgIC8vIEZhbGwgYmFjayB0byB0aGUgYmlzZWN0aW9uIG1ldGhvZCBmb3IgcmVsaWFiaWxpdHkuXG4gICAgdDAgPSAwLjA7XG4gICAgdDEgPSAxLjA7XG4gICAgdDIgPSB4O1xuXG4gICAgaWYgKHQyIDwgdDApIHJldHVybiB0MDtcbiAgICBpZiAodDIgPiB0MSkgcmV0dXJuIHQxO1xuXG4gICAgd2hpbGUgKHQwIDwgdDEpIHtcblxuICAgICAgICB4MiA9IHRoaXMuc2FtcGxlQ3VydmVYKHQyKTtcbiAgICAgICAgaWYgKE1hdGguYWJzKHgyIC0geCkgPCBlcHNpbG9uKSByZXR1cm4gdDI7XG5cbiAgICAgICAgaWYgKHggPiB4Mikge1xuICAgICAgICAgICAgdDAgPSB0MjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHQxID0gdDI7XG4gICAgICAgIH1cblxuICAgICAgICB0MiA9ICh0MSAtIHQwKSAqIDAuNSArIHQwO1xuICAgIH1cblxuICAgIC8vIEZhaWx1cmUuXG4gICAgcmV0dXJuIHQyO1xufTtcblxuVW5pdEJlemllci5wcm90b3R5cGUuc29sdmUgPSBmdW5jdGlvbih4LCBlcHNpbG9uKSB7XG4gICAgcmV0dXJuIHRoaXMuc2FtcGxlQ3VydmVZKHRoaXMuc29sdmVDdXJ2ZVgoeCwgZXBzaWxvbikpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBQb2ludDtcblxuLyoqXG4gKiBBIHN0YW5kYWxvbmUgcG9pbnQgZ2VvbWV0cnkgd2l0aCB1c2VmdWwgYWNjZXNzb3IsIGNvbXBhcmlzb24sIGFuZFxuICogbW9kaWZpY2F0aW9uIG1ldGhvZHMuXG4gKlxuICogQGNsYXNzIFBvaW50XG4gKiBAcGFyYW0ge051bWJlcn0geCB0aGUgeC1jb29yZGluYXRlLiB0aGlzIGNvdWxkIGJlIGxvbmdpdHVkZSBvciBzY3JlZW5cbiAqIHBpeGVscywgb3IgYW55IG90aGVyIHNvcnQgb2YgdW5pdC5cbiAqIEBwYXJhbSB7TnVtYmVyfSB5IHRoZSB5LWNvb3JkaW5hdGUuIHRoaXMgY291bGQgYmUgbGF0aXR1ZGUgb3Igc2NyZWVuXG4gKiBwaXhlbHMsIG9yIGFueSBvdGhlciBzb3J0IG9mIHVuaXQuXG4gKiBAZXhhbXBsZVxuICogdmFyIHBvaW50ID0gbmV3IFBvaW50KC03NywgMzgpO1xuICovXG5mdW5jdGlvbiBQb2ludCh4LCB5KSB7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xufVxuXG5Qb2ludC5wcm90b3R5cGUgPSB7XG5cbiAgICAvKipcbiAgICAgKiBDbG9uZSB0aGlzIHBvaW50LCByZXR1cm5pbmcgYSBuZXcgcG9pbnQgdGhhdCBjYW4gYmUgbW9kaWZpZWRcbiAgICAgKiB3aXRob3V0IGFmZmVjdGluZyB0aGUgb2xkIG9uZS5cbiAgICAgKiBAcmV0dXJuIHtQb2ludH0gdGhlIGNsb25lXG4gICAgICovXG4gICAgY2xvbmU6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbmV3IFBvaW50KHRoaXMueCwgdGhpcy55KTsgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZCB0aGlzIHBvaW50J3MgeCAmIHkgY29vcmRpbmF0ZXMgdG8gYW5vdGhlciBwb2ludCxcbiAgICAgKiB5aWVsZGluZyBhIG5ldyBwb2ludC5cbiAgICAgKiBAcGFyYW0ge1BvaW50fSBwIHRoZSBvdGhlciBwb2ludFxuICAgICAqIEByZXR1cm4ge1BvaW50fSBvdXRwdXQgcG9pbnRcbiAgICAgKi9cbiAgICBhZGQ6ICAgICBmdW5jdGlvbihwKSB7IHJldHVybiB0aGlzLmNsb25lKCkuX2FkZChwKTsgfSxcblxuICAgIC8qKlxuICAgICAqIFN1YnRyYWN0IHRoaXMgcG9pbnQncyB4ICYgeSBjb29yZGluYXRlcyB0byBmcm9tIHBvaW50LFxuICAgICAqIHlpZWxkaW5nIGEgbmV3IHBvaW50LlxuICAgICAqIEBwYXJhbSB7UG9pbnR9IHAgdGhlIG90aGVyIHBvaW50XG4gICAgICogQHJldHVybiB7UG9pbnR9IG91dHB1dCBwb2ludFxuICAgICAqL1xuICAgIHN1YjogICAgIGZ1bmN0aW9uKHApIHsgcmV0dXJuIHRoaXMuY2xvbmUoKS5fc3ViKHApOyB9LFxuXG4gICAgLyoqXG4gICAgICogTXVsdGlwbHkgdGhpcyBwb2ludCdzIHggJiB5IGNvb3JkaW5hdGVzIGJ5IHBvaW50LFxuICAgICAqIHlpZWxkaW5nIGEgbmV3IHBvaW50LlxuICAgICAqIEBwYXJhbSB7UG9pbnR9IHAgdGhlIG90aGVyIHBvaW50XG4gICAgICogQHJldHVybiB7UG9pbnR9IG91dHB1dCBwb2ludFxuICAgICAqL1xuICAgIG11bHRCeVBvaW50OiAgICBmdW5jdGlvbihwKSB7IHJldHVybiB0aGlzLmNsb25lKCkuX211bHRCeVBvaW50KHApOyB9LFxuXG4gICAgLyoqXG4gICAgICogRGl2aWRlIHRoaXMgcG9pbnQncyB4ICYgeSBjb29yZGluYXRlcyBieSBwb2ludCxcbiAgICAgKiB5aWVsZGluZyBhIG5ldyBwb2ludC5cbiAgICAgKiBAcGFyYW0ge1BvaW50fSBwIHRoZSBvdGhlciBwb2ludFxuICAgICAqIEByZXR1cm4ge1BvaW50fSBvdXRwdXQgcG9pbnRcbiAgICAgKi9cbiAgICBkaXZCeVBvaW50OiAgICAgZnVuY3Rpb24ocCkgeyByZXR1cm4gdGhpcy5jbG9uZSgpLl9kaXZCeVBvaW50KHApOyB9LFxuXG4gICAgLyoqXG4gICAgICogTXVsdGlwbHkgdGhpcyBwb2ludCdzIHggJiB5IGNvb3JkaW5hdGVzIGJ5IGEgZmFjdG9yLFxuICAgICAqIHlpZWxkaW5nIGEgbmV3IHBvaW50LlxuICAgICAqIEBwYXJhbSB7UG9pbnR9IGsgZmFjdG9yXG4gICAgICogQHJldHVybiB7UG9pbnR9IG91dHB1dCBwb2ludFxuICAgICAqL1xuICAgIG11bHQ6ICAgIGZ1bmN0aW9uKGspIHsgcmV0dXJuIHRoaXMuY2xvbmUoKS5fbXVsdChrKTsgfSxcblxuICAgIC8qKlxuICAgICAqIERpdmlkZSB0aGlzIHBvaW50J3MgeCAmIHkgY29vcmRpbmF0ZXMgYnkgYSBmYWN0b3IsXG4gICAgICogeWllbGRpbmcgYSBuZXcgcG9pbnQuXG4gICAgICogQHBhcmFtIHtQb2ludH0gayBmYWN0b3JcbiAgICAgKiBAcmV0dXJuIHtQb2ludH0gb3V0cHV0IHBvaW50XG4gICAgICovXG4gICAgZGl2OiAgICAgZnVuY3Rpb24oaykgeyByZXR1cm4gdGhpcy5jbG9uZSgpLl9kaXYoayk7IH0sXG5cbiAgICAvKipcbiAgICAgKiBSb3RhdGUgdGhpcyBwb2ludCBhcm91bmQgdGhlIDAsIDAgb3JpZ2luIGJ5IGFuIGFuZ2xlIGEsXG4gICAgICogZ2l2ZW4gaW4gcmFkaWFuc1xuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBhIGFuZ2xlIHRvIHJvdGF0ZSBhcm91bmQsIGluIHJhZGlhbnNcbiAgICAgKiBAcmV0dXJuIHtQb2ludH0gb3V0cHV0IHBvaW50XG4gICAgICovXG4gICAgcm90YXRlOiAgZnVuY3Rpb24oYSkgeyByZXR1cm4gdGhpcy5jbG9uZSgpLl9yb3RhdGUoYSk7IH0sXG5cbiAgICAvKipcbiAgICAgKiBSb3RhdGUgdGhpcyBwb2ludCBhcm91bmQgcCBwb2ludCBieSBhbiBhbmdsZSBhLFxuICAgICAqIGdpdmVuIGluIHJhZGlhbnNcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gYSBhbmdsZSB0byByb3RhdGUgYXJvdW5kLCBpbiByYWRpYW5zXG4gICAgICogQHBhcmFtIHtQb2ludH0gcCBQb2ludCB0byByb3RhdGUgYXJvdW5kXG4gICAgICogQHJldHVybiB7UG9pbnR9IG91dHB1dCBwb2ludFxuICAgICAqL1xuICAgIHJvdGF0ZUFyb3VuZDogIGZ1bmN0aW9uKGEscCkgeyByZXR1cm4gdGhpcy5jbG9uZSgpLl9yb3RhdGVBcm91bmQoYSxwKTsgfSxcblxuICAgIC8qKlxuICAgICAqIE11bHRpcGx5IHRoaXMgcG9pbnQgYnkgYSA0eDEgdHJhbnNmb3JtYXRpb24gbWF0cml4XG4gICAgICogQHBhcmFtIHtBcnJheTxOdW1iZXI+fSBtIHRyYW5zZm9ybWF0aW9uIG1hdHJpeFxuICAgICAqIEByZXR1cm4ge1BvaW50fSBvdXRwdXQgcG9pbnRcbiAgICAgKi9cbiAgICBtYXRNdWx0OiBmdW5jdGlvbihtKSB7IHJldHVybiB0aGlzLmNsb25lKCkuX21hdE11bHQobSk7IH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGUgdGhpcyBwb2ludCBidXQgYXMgYSB1bml0IHZlY3RvciBmcm9tIDAsIDAsIG1lYW5pbmdcbiAgICAgKiB0aGF0IHRoZSBkaXN0YW5jZSBmcm9tIHRoZSByZXN1bHRpbmcgcG9pbnQgdG8gdGhlIDAsIDBcbiAgICAgKiBjb29yZGluYXRlIHdpbGwgYmUgZXF1YWwgdG8gMSBhbmQgdGhlIGFuZ2xlIGZyb20gdGhlIHJlc3VsdGluZ1xuICAgICAqIHBvaW50IHRvIHRoZSAwLCAwIGNvb3JkaW5hdGUgd2lsbCBiZSB0aGUgc2FtZSBhcyBiZWZvcmUuXG4gICAgICogQHJldHVybiB7UG9pbnR9IHVuaXQgdmVjdG9yIHBvaW50XG4gICAgICovXG4gICAgdW5pdDogICAgZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmNsb25lKCkuX3VuaXQoKTsgfSxcblxuICAgIC8qKlxuICAgICAqIENvbXB1dGUgYSBwZXJwZW5kaWN1bGFyIHBvaW50LCB3aGVyZSB0aGUgbmV3IHkgY29vcmRpbmF0ZVxuICAgICAqIGlzIHRoZSBvbGQgeCBjb29yZGluYXRlIGFuZCB0aGUgbmV3IHggY29vcmRpbmF0ZSBpcyB0aGUgb2xkIHlcbiAgICAgKiBjb29yZGluYXRlIG11bHRpcGxpZWQgYnkgLTFcbiAgICAgKiBAcmV0dXJuIHtQb2ludH0gcGVycGVuZGljdWxhciBwb2ludFxuICAgICAqL1xuICAgIHBlcnA6ICAgIGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5jbG9uZSgpLl9wZXJwKCk7IH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gYSB2ZXJzaW9uIG9mIHRoaXMgcG9pbnQgd2l0aCB0aGUgeCAmIHkgY29vcmRpbmF0ZXNcbiAgICAgKiByb3VuZGVkIHRvIGludGVnZXJzLlxuICAgICAqIEByZXR1cm4ge1BvaW50fSByb3VuZGVkIHBvaW50XG4gICAgICovXG4gICAgcm91bmQ6ICAgZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmNsb25lKCkuX3JvdW5kKCk7IH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gdGhlIG1hZ2l0dWRlIG9mIHRoaXMgcG9pbnQ6IHRoaXMgaXMgdGhlIEV1Y2xpZGVhblxuICAgICAqIGRpc3RhbmNlIGZyb20gdGhlIDAsIDAgY29vcmRpbmF0ZSB0byB0aGlzIHBvaW50J3MgeCBhbmQgeVxuICAgICAqIGNvb3JkaW5hdGVzLlxuICAgICAqIEByZXR1cm4ge051bWJlcn0gbWFnbml0dWRlXG4gICAgICovXG4gICAgbWFnOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguc3FydCh0aGlzLnggKiB0aGlzLnggKyB0aGlzLnkgKiB0aGlzLnkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBKdWRnZSB3aGV0aGVyIHRoaXMgcG9pbnQgaXMgZXF1YWwgdG8gYW5vdGhlciBwb2ludCwgcmV0dXJuaW5nXG4gICAgICogdHJ1ZSBvciBmYWxzZS5cbiAgICAgKiBAcGFyYW0ge1BvaW50fSBvdGhlciB0aGUgb3RoZXIgcG9pbnRcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSB3aGV0aGVyIHRoZSBwb2ludHMgYXJlIGVxdWFsXG4gICAgICovXG4gICAgZXF1YWxzOiBmdW5jdGlvbihvdGhlcikge1xuICAgICAgICByZXR1cm4gdGhpcy54ID09PSBvdGhlci54ICYmXG4gICAgICAgICAgICAgICB0aGlzLnkgPT09IG90aGVyLnk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGN1bGF0ZSB0aGUgZGlzdGFuY2UgZnJvbSB0aGlzIHBvaW50IHRvIGFub3RoZXIgcG9pbnRcbiAgICAgKiBAcGFyYW0ge1BvaW50fSBwIHRoZSBvdGhlciBwb2ludFxuICAgICAqIEByZXR1cm4ge051bWJlcn0gZGlzdGFuY2VcbiAgICAgKi9cbiAgICBkaXN0OiBmdW5jdGlvbihwKSB7XG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQodGhpcy5kaXN0U3FyKHApKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlIHRoZSBkaXN0YW5jZSBmcm9tIHRoaXMgcG9pbnQgdG8gYW5vdGhlciBwb2ludCxcbiAgICAgKiB3aXRob3V0IHRoZSBzcXVhcmUgcm9vdCBzdGVwLiBVc2VmdWwgaWYgeW91J3JlIGNvbXBhcmluZ1xuICAgICAqIHJlbGF0aXZlIGRpc3RhbmNlcy5cbiAgICAgKiBAcGFyYW0ge1BvaW50fSBwIHRoZSBvdGhlciBwb2ludFxuICAgICAqIEByZXR1cm4ge051bWJlcn0gZGlzdGFuY2VcbiAgICAgKi9cbiAgICBkaXN0U3FyOiBmdW5jdGlvbihwKSB7XG4gICAgICAgIHZhciBkeCA9IHAueCAtIHRoaXMueCxcbiAgICAgICAgICAgIGR5ID0gcC55IC0gdGhpcy55O1xuICAgICAgICByZXR1cm4gZHggKiBkeCArIGR5ICogZHk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgYW5nbGUgZnJvbSB0aGUgMCwgMCBjb29yZGluYXRlIHRvIHRoaXMgcG9pbnQsIGluIHJhZGlhbnNcbiAgICAgKiBjb29yZGluYXRlcy5cbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGFuZ2xlXG4gICAgICovXG4gICAgYW5nbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gTWF0aC5hdGFuMih0aGlzLnksIHRoaXMueCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgYW5nbGUgZnJvbSB0aGlzIHBvaW50IHRvIGFub3RoZXIgcG9pbnQsIGluIHJhZGlhbnNcbiAgICAgKiBAcGFyYW0ge1BvaW50fSBiIHRoZSBvdGhlciBwb2ludFxuICAgICAqIEByZXR1cm4ge051bWJlcn0gYW5nbGVcbiAgICAgKi9cbiAgICBhbmdsZVRvOiBmdW5jdGlvbihiKSB7XG4gICAgICAgIHJldHVybiBNYXRoLmF0YW4yKHRoaXMueSAtIGIueSwgdGhpcy54IC0gYi54KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBhbmdsZSBiZXR3ZWVuIHRoaXMgcG9pbnQgYW5kIGFub3RoZXIgcG9pbnQsIGluIHJhZGlhbnNcbiAgICAgKiBAcGFyYW0ge1BvaW50fSBiIHRoZSBvdGhlciBwb2ludFxuICAgICAqIEByZXR1cm4ge051bWJlcn0gYW5nbGVcbiAgICAgKi9cbiAgICBhbmdsZVdpdGg6IGZ1bmN0aW9uKGIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYW5nbGVXaXRoU2VwKGIueCwgYi55KTtcbiAgICB9LFxuXG4gICAgLypcbiAgICAgKiBGaW5kIHRoZSBhbmdsZSBvZiB0aGUgdHdvIHZlY3RvcnMsIHNvbHZpbmcgdGhlIGZvcm11bGEgZm9yXG4gICAgICogdGhlIGNyb3NzIHByb2R1Y3QgYSB4IGIgPSB8YXx8YnxzaW4ozrgpIGZvciDOuC5cbiAgICAgKiBAcGFyYW0ge051bWJlcn0geCB0aGUgeC1jb29yZGluYXRlXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHkgdGhlIHktY29vcmRpbmF0ZVxuICAgICAqIEByZXR1cm4ge051bWJlcn0gdGhlIGFuZ2xlIGluIHJhZGlhbnNcbiAgICAgKi9cbiAgICBhbmdsZVdpdGhTZXA6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguYXRhbjIoXG4gICAgICAgICAgICB0aGlzLnggKiB5IC0gdGhpcy55ICogeCxcbiAgICAgICAgICAgIHRoaXMueCAqIHggKyB0aGlzLnkgKiB5KTtcbiAgICB9LFxuXG4gICAgX21hdE11bHQ6IGZ1bmN0aW9uKG0pIHtcbiAgICAgICAgdmFyIHggPSBtWzBdICogdGhpcy54ICsgbVsxXSAqIHRoaXMueSxcbiAgICAgICAgICAgIHkgPSBtWzJdICogdGhpcy54ICsgbVszXSAqIHRoaXMueTtcbiAgICAgICAgdGhpcy54ID0geDtcbiAgICAgICAgdGhpcy55ID0geTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIF9hZGQ6IGZ1bmN0aW9uKHApIHtcbiAgICAgICAgdGhpcy54ICs9IHAueDtcbiAgICAgICAgdGhpcy55ICs9IHAueTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIF9zdWI6IGZ1bmN0aW9uKHApIHtcbiAgICAgICAgdGhpcy54IC09IHAueDtcbiAgICAgICAgdGhpcy55IC09IHAueTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIF9tdWx0OiBmdW5jdGlvbihrKSB7XG4gICAgICAgIHRoaXMueCAqPSBrO1xuICAgICAgICB0aGlzLnkgKj0gaztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIF9kaXY6IGZ1bmN0aW9uKGspIHtcbiAgICAgICAgdGhpcy54IC89IGs7XG4gICAgICAgIHRoaXMueSAvPSBrO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgX211bHRCeVBvaW50OiBmdW5jdGlvbihwKSB7XG4gICAgICAgIHRoaXMueCAqPSBwLng7XG4gICAgICAgIHRoaXMueSAqPSBwLnk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBfZGl2QnlQb2ludDogZnVuY3Rpb24ocCkge1xuICAgICAgICB0aGlzLnggLz0gcC54O1xuICAgICAgICB0aGlzLnkgLz0gcC55O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgX3VuaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9kaXYodGhpcy5tYWcoKSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBfcGVycDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB5ID0gdGhpcy55O1xuICAgICAgICB0aGlzLnkgPSB0aGlzLng7XG4gICAgICAgIHRoaXMueCA9IC15O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgX3JvdGF0ZTogZnVuY3Rpb24oYW5nbGUpIHtcbiAgICAgICAgdmFyIGNvcyA9IE1hdGguY29zKGFuZ2xlKSxcbiAgICAgICAgICAgIHNpbiA9IE1hdGguc2luKGFuZ2xlKSxcbiAgICAgICAgICAgIHggPSBjb3MgKiB0aGlzLnggLSBzaW4gKiB0aGlzLnksXG4gICAgICAgICAgICB5ID0gc2luICogdGhpcy54ICsgY29zICogdGhpcy55O1xuICAgICAgICB0aGlzLnggPSB4O1xuICAgICAgICB0aGlzLnkgPSB5O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgX3JvdGF0ZUFyb3VuZDogZnVuY3Rpb24oYW5nbGUsIHApIHtcbiAgICAgICAgdmFyIGNvcyA9IE1hdGguY29zKGFuZ2xlKSxcbiAgICAgICAgICAgIHNpbiA9IE1hdGguc2luKGFuZ2xlKSxcbiAgICAgICAgICAgIHggPSBwLnggKyBjb3MgKiAodGhpcy54IC0gcC54KSAtIHNpbiAqICh0aGlzLnkgLSBwLnkpLFxuICAgICAgICAgICAgeSA9IHAueSArIHNpbiAqICh0aGlzLnggLSBwLngpICsgY29zICogKHRoaXMueSAtIHAueSk7XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBfcm91bmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnggPSBNYXRoLnJvdW5kKHRoaXMueCk7XG4gICAgICAgIHRoaXMueSA9IE1hdGgucm91bmQodGhpcy55KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxufTtcblxuLyoqXG4gKiBDb25zdHJ1Y3QgYSBwb2ludCBmcm9tIGFuIGFycmF5IGlmIG5lY2Vzc2FyeSwgb3RoZXJ3aXNlIGlmIHRoZSBpbnB1dFxuICogaXMgYWxyZWFkeSBhIFBvaW50LCBvciBhbiB1bmtub3duIHR5cGUsIHJldHVybiBpdCB1bmNoYW5nZWRcbiAqIEBwYXJhbSB7QXJyYXk8TnVtYmVyPnxQb2ludHwqfSBhIGFueSBraW5kIG9mIGlucHV0IHZhbHVlXG4gKiBAcmV0dXJuIHtQb2ludH0gY29uc3RydWN0ZWQgcG9pbnQsIG9yIHBhc3NlZC10aHJvdWdoIHZhbHVlLlxuICogQGV4YW1wbGVcbiAqIC8vIHRoaXNcbiAqIHZhciBwb2ludCA9IFBvaW50LmNvbnZlcnQoWzAsIDFdKTtcbiAqIC8vIGlzIGVxdWl2YWxlbnQgdG9cbiAqIHZhciBwb2ludCA9IG5ldyBQb2ludCgwLCAxKTtcbiAqL1xuUG9pbnQuY29udmVydCA9IGZ1bmN0aW9uIChhKSB7XG4gICAgaWYgKGEgaW5zdGFuY2VvZiBQb2ludCkge1xuICAgICAgICByZXR1cm4gYTtcbiAgICB9XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoYSkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQb2ludChhWzBdLCBhWzFdKTtcbiAgICB9XG4gICAgcmV0dXJuIGE7XG59O1xuIiwiLy8gQGZsb3dcbi8qIGVzbGludC1lbnYgYnJvd3NlciAqL1xuaW1wb3J0IHR5cGUge1dpbmRvd30gZnJvbSAnLi4vLi4vdHlwZXMvd2luZG93JztcblxuZXhwb3J0IGRlZmF1bHQgKHNlbGY6IFdpbmRvdyk7XG4iLCIvLyBAZmxvd1xuXG4vKipcbiAqIERlZXBseSBjb21wYXJlcyB0d28gb2JqZWN0IGxpdGVyYWxzLlxuICpcbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIGRlZXBFcXVhbChhOiA/bWl4ZWQsIGI6ID9taXhlZCk6IGJvb2xlYW4ge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGEpKSB7XG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShiKSB8fCBhLmxlbmd0aCAhPT0gYi5sZW5ndGgpIHJldHVybiBmYWxzZTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoIWRlZXBFcXVhbChhW2ldLCBiW2ldKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGEgPT09ICdvYmplY3QnICYmIGEgIT09IG51bGwgJiYgYiAhPT0gbnVsbCkge1xuICAgICAgICBpZiAoISh0eXBlb2YgYiA9PT0gJ29iamVjdCcpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhhKTtcbiAgICAgICAgaWYgKGtleXMubGVuZ3RoICE9PSBPYmplY3Qua2V5cyhiKS5sZW5ndGgpIHJldHVybiBmYWxzZTtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gYSkge1xuICAgICAgICAgICAgaWYgKCFkZWVwRXF1YWwoYVtrZXldLCBiW2tleV0pKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBhID09PSBiO1xufVxuXG5leHBvcnQgZGVmYXVsdCBkZWVwRXF1YWw7XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgVW5pdEJlemllciBmcm9tICdAbWFwYm94L3VuaXRiZXppZXInO1xuXG5pbXBvcnQgUG9pbnQgZnJvbSAnQG1hcGJveC9wb2ludC1nZW9tZXRyeSc7XG5pbXBvcnQgd2luZG93IGZyb20gJy4vd2luZG93JztcblxuaW1wb3J0IHR5cGUge0NhbGxiYWNrfSBmcm9tICcuLi90eXBlcy9jYWxsYmFjayc7XG5cbi8qKlxuICogQG1vZHVsZSB1dGlsXG4gKiBAcHJpdmF0ZVxuICovXG5cbi8qKlxuICogR2l2ZW4gYSB2YWx1ZSBgdGAgdGhhdCB2YXJpZXMgYmV0d2VlbiAwIGFuZCAxLCByZXR1cm5cbiAqIGFuIGludGVycG9sYXRpb24gZnVuY3Rpb24gdGhhdCBlYXNlcyBiZXR3ZWVuIDAgYW5kIDEgaW4gYSBwbGVhc2luZ1xuICogY3ViaWMgaW4tb3V0IGZhc2hpb24uXG4gKlxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVhc2VDdWJpY0luT3V0KHQ6IG51bWJlcik6IG51bWJlciB7XG4gICAgaWYgKHQgPD0gMCkgcmV0dXJuIDA7XG4gICAgaWYgKHQgPj0gMSkgcmV0dXJuIDE7XG4gICAgY29uc3QgdDIgPSB0ICogdCxcbiAgICAgICAgdDMgPSB0MiAqIHQ7XG4gICAgcmV0dXJuIDQgKiAodCA8IDAuNSA/IHQzIDogMyAqICh0IC0gdDIpICsgdDMgLSAwLjc1KTtcbn1cblxuLyoqXG4gKiBHaXZlbiBnaXZlbiAoeCwgeSksICh4MSwgeTEpIGNvbnRyb2wgcG9pbnRzIGZvciBhIGJlemllciBjdXJ2ZSxcbiAqIHJldHVybiBhIGZ1bmN0aW9uIHRoYXQgaW50ZXJwb2xhdGVzIGFsb25nIHRoYXQgY3VydmUuXG4gKlxuICogQHBhcmFtIHAxeCBjb250cm9sIHBvaW50IDEgeCBjb29yZGluYXRlXG4gKiBAcGFyYW0gcDF5IGNvbnRyb2wgcG9pbnQgMSB5IGNvb3JkaW5hdGVcbiAqIEBwYXJhbSBwMnggY29udHJvbCBwb2ludCAyIHggY29vcmRpbmF0ZVxuICogQHBhcmFtIHAyeSBjb250cm9sIHBvaW50IDIgeSBjb29yZGluYXRlXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gYmV6aWVyKHAxeDogbnVtYmVyLCBwMXk6IG51bWJlciwgcDJ4OiBudW1iZXIsIHAyeTogbnVtYmVyKTogKHQ6IG51bWJlcikgPT4gbnVtYmVyIHtcbiAgICBjb25zdCBiZXppZXIgPSBuZXcgVW5pdEJlemllcihwMXgsIHAxeSwgcDJ4LCBwMnkpO1xuICAgIHJldHVybiBmdW5jdGlvbih0OiBudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIGJlemllci5zb2x2ZSh0KTtcbiAgICB9O1xufVxuXG4vKipcbiAqIEEgZGVmYXVsdCBiZXppZXItY3VydmUgcG93ZXJlZCBlYXNpbmcgZnVuY3Rpb24gd2l0aFxuICogY29udHJvbCBwb2ludHMgKDAuMjUsIDAuMSkgYW5kICgwLjI1LCAxKVxuICpcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBjb25zdCBlYXNlID0gYmV6aWVyKDAuMjUsIDAuMSwgMC4yNSwgMSk7XG5cbi8qKlxuICogY29uc3RyYWluIG4gdG8gdGhlIGdpdmVuIHJhbmdlIHZpYSBtaW4gKyBtYXhcbiAqXG4gKiBAcGFyYW0gbiB2YWx1ZVxuICogQHBhcmFtIG1pbiB0aGUgbWluaW11bSB2YWx1ZSB0byBiZSByZXR1cm5lZFxuICogQHBhcmFtIG1heCB0aGUgbWF4aW11bSB2YWx1ZSB0byBiZSByZXR1cm5lZFxuICogQHJldHVybnMgdGhlIGNsYW1wZWQgdmFsdWVcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGFtcChuOiBudW1iZXIsIG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIE1hdGgubWluKG1heCwgTWF0aC5tYXgobWluLCBuKSk7XG59XG5cbi8qKlxuICogY29uc3RyYWluIG4gdG8gdGhlIGdpdmVuIHJhbmdlLCBleGNsdWRpbmcgdGhlIG1pbmltdW0sIHZpYSBtb2R1bGFyIGFyaXRobWV0aWNcbiAqXG4gKiBAcGFyYW0gbiB2YWx1ZVxuICogQHBhcmFtIG1pbiB0aGUgbWluaW11bSB2YWx1ZSB0byBiZSByZXR1cm5lZCwgZXhjbHVzaXZlXG4gKiBAcGFyYW0gbWF4IHRoZSBtYXhpbXVtIHZhbHVlIHRvIGJlIHJldHVybmVkLCBpbmNsdXNpdmVcbiAqIEByZXR1cm5zIGNvbnN0cmFpbmVkIG51bWJlclxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdyYXAobjogbnVtYmVyLCBtaW46IG51bWJlciwgbWF4OiBudW1iZXIpOiBudW1iZXIge1xuICAgIGNvbnN0IGQgPSBtYXggLSBtaW47XG4gICAgY29uc3QgdyA9ICgobiAtIG1pbikgJSBkICsgZCkgJSBkICsgbWluO1xuICAgIHJldHVybiAodyA9PT0gbWluKSA/IG1heCA6IHc7XG59XG5cbi8qXG4gKiBDYWxsIGFuIGFzeW5jaHJvbm91cyBmdW5jdGlvbiBvbiBhbiBhcnJheSBvZiBhcmd1bWVudHMsXG4gKiBjYWxsaW5nIGBjYWxsYmFja2Agd2l0aCB0aGUgY29tcGxldGVkIHJlc3VsdHMgb2YgYWxsIGNhbGxzLlxuICpcbiAqIEBwYXJhbSBhcnJheSBpbnB1dCB0byBlYWNoIGNhbGwgb2YgdGhlIGFzeW5jIGZ1bmN0aW9uLlxuICogQHBhcmFtIGZuIGFuIGFzeW5jIGZ1bmN0aW9uIHdpdGggc2lnbmF0dXJlIChkYXRhLCBjYWxsYmFjaylcbiAqIEBwYXJhbSBjYWxsYmFjayBhIGNhbGxiYWNrIHJ1biBhZnRlciBhbGwgYXN5bmMgd29yayBpcyBkb25lLlxuICogY2FsbGVkIHdpdGggYW4gYXJyYXksIGNvbnRhaW5pbmcgdGhlIHJlc3VsdHMgb2YgZWFjaCBhc3luYyBjYWxsLlxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzeW5jQWxsPEl0ZW0sIFJlc3VsdD4oXG4gICAgYXJyYXk6IEFycmF5PEl0ZW0+LFxuICAgIGZuOiAoaXRlbTogSXRlbSwgZm5DYWxsYmFjazogQ2FsbGJhY2s8UmVzdWx0PikgPT4gdm9pZCxcbiAgICBjYWxsYmFjazogQ2FsbGJhY2s8QXJyYXk8UmVzdWx0Pj5cbikge1xuICAgIGlmICghYXJyYXkubGVuZ3RoKSB7IHJldHVybiBjYWxsYmFjayhudWxsLCBbXSk7IH1cbiAgICBsZXQgcmVtYWluaW5nID0gYXJyYXkubGVuZ3RoO1xuICAgIGNvbnN0IHJlc3VsdHMgPSBuZXcgQXJyYXkoYXJyYXkubGVuZ3RoKTtcbiAgICBsZXQgZXJyb3IgPSBudWxsO1xuICAgIGFycmF5LmZvckVhY2goKGl0ZW0sIGkpID0+IHtcbiAgICAgICAgZm4oaXRlbSwgKGVyciwgcmVzdWx0KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKSBlcnJvciA9IGVycjtcbiAgICAgICAgICAgIHJlc3VsdHNbaV0gPSAoKHJlc3VsdDogYW55KTogUmVzdWx0KTsgLy8gaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL2Zsb3cvaXNzdWVzLzIxMjNcbiAgICAgICAgICAgIGlmICgtLXJlbWFpbmluZyA9PT0gMCkgY2FsbGJhY2soZXJyb3IsIHJlc3VsdHMpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuLypcbiAqIFBvbHlmaWxsIGZvciBPYmplY3QudmFsdWVzLiBOb3QgZnVsbHkgc3BlYyBjb21wbGlhbnQsIGJ1dCB3ZSBkb24ndFxuICogbmVlZCBpdCB0byBiZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsdWVzPFQ+KG9iajoge1trZXk6IHN0cmluZ106IFR9KTogQXJyYXk8VD4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuICAgIGZvciAoY29uc3QgayBpbiBvYmopIHtcbiAgICAgICAgcmVzdWx0LnB1c2gob2JqW2tdKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLypcbiAqIENvbXB1dGUgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGUga2V5cyBpbiBvbmUgb2JqZWN0IGFuZCB0aGUga2V5c1xuICogaW4gYW5vdGhlciBvYmplY3QuXG4gKlxuICogQHJldHVybnMga2V5cyBkaWZmZXJlbmNlXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24ga2V5c0RpZmZlcmVuY2U8UywgVD4ob2JqOiB7W2tleTogc3RyaW5nXTogU30sIG90aGVyOiB7W2tleTogc3RyaW5nXTogVH0pOiBBcnJheTxzdHJpbmc+IHtcbiAgICBjb25zdCBkaWZmZXJlbmNlID0gW107XG4gICAgZm9yIChjb25zdCBpIGluIG9iaikge1xuICAgICAgICBpZiAoIShpIGluIG90aGVyKSkge1xuICAgICAgICAgICAgZGlmZmVyZW5jZS5wdXNoKGkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkaWZmZXJlbmNlO1xufVxuXG4vKipcbiAqIEdpdmVuIGEgZGVzdGluYXRpb24gb2JqZWN0IGFuZCBvcHRpb25hbGx5IG1hbnkgc291cmNlIG9iamVjdHMsXG4gKiBjb3B5IGFsbCBwcm9wZXJ0aWVzIGZyb20gdGhlIHNvdXJjZSBvYmplY3RzIGludG8gdGhlIGRlc3RpbmF0aW9uLlxuICogVGhlIGxhc3Qgc291cmNlIG9iamVjdCBnaXZlbiBvdmVycmlkZXMgcHJvcGVydGllcyBmcm9tIHByZXZpb3VzXG4gKiBzb3VyY2Ugb2JqZWN0cy5cbiAqXG4gKiBAcGFyYW0gZGVzdCBkZXN0aW5hdGlvbiBvYmplY3RcbiAqIEBwYXJhbSBzb3VyY2VzIHNvdXJjZXMgZnJvbSB3aGljaCBwcm9wZXJ0aWVzIGFyZSBwdWxsZWRcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleHRlbmQoZGVzdDogT2JqZWN0LCAuLi5zb3VyY2VzOiBBcnJheTw/T2JqZWN0Pik6IE9iamVjdCB7XG4gICAgZm9yIChjb25zdCBzcmMgb2Ygc291cmNlcykge1xuICAgICAgICBmb3IgKGNvbnN0IGsgaW4gc3JjKSB7XG4gICAgICAgICAgICBkZXN0W2tdID0gc3JjW2tdO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkZXN0O1xufVxuXG4vKipcbiAqIEdpdmVuIGFuIG9iamVjdCBhbmQgYSBudW1iZXIgb2YgcHJvcGVydGllcyBhcyBzdHJpbmdzLCByZXR1cm4gdmVyc2lvblxuICogb2YgdGhhdCBvYmplY3Qgd2l0aCBvbmx5IHRob3NlIHByb3BlcnRpZXMuXG4gKlxuICogQHBhcmFtIHNyYyB0aGUgb2JqZWN0XG4gKiBAcGFyYW0gcHJvcGVydGllcyBhbiBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcyBjaG9zZW5cbiAqIHRvIGFwcGVhciBvbiB0aGUgcmVzdWx0aW5nIG9iamVjdC5cbiAqIEByZXR1cm5zIG9iamVjdCB3aXRoIGxpbWl0ZWQgcHJvcGVydGllcy5cbiAqIEBleGFtcGxlXG4gKiB2YXIgZm9vID0geyBuYW1lOiAnQ2hhcmxpZScsIGFnZTogMTAgfTtcbiAqIHZhciBqdXN0TmFtZSA9IHBpY2soZm9vLCBbJ25hbWUnXSk7XG4gKiAvLyBqdXN0TmFtZSA9IHsgbmFtZTogJ0NoYXJsaWUnIH1cbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwaWNrKHNyYzogT2JqZWN0LCBwcm9wZXJ0aWVzOiBBcnJheTxzdHJpbmc+KTogT2JqZWN0IHtcbiAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByb3BlcnRpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgayA9IHByb3BlcnRpZXNbaV07XG4gICAgICAgIGlmIChrIGluIHNyYykge1xuICAgICAgICAgICAgcmVzdWx0W2tdID0gc3JjW2tdO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmxldCBpZCA9IDE7XG5cbi8qKlxuICogUmV0dXJuIGEgdW5pcXVlIG51bWVyaWMgaWQsIHN0YXJ0aW5nIGF0IDEgYW5kIGluY3JlbWVudGluZyB3aXRoXG4gKiBlYWNoIGNhbGwuXG4gKlxuICogQHJldHVybnMgdW5pcXVlIG51bWVyaWMgaWQuXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gdW5pcXVlSWQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gaWQrKztcbn1cblxuLyoqXG4gKiBSZXR1cm4gYSByYW5kb20gVVVJRCAodjQpLiBUYWtlbiBmcm9tOiBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9qZWQvOTgyODgzXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gdXVpZCgpOiBzdHJpbmcge1xuICAgIGZ1bmN0aW9uIGIoYSkge1xuICAgICAgICByZXR1cm4gYSA/IChhIF4gTWF0aC5yYW5kb20oKSAqIDE2ID4+IGEgLyA0KS50b1N0cmluZygxNikgOlxuICAgICAgICAvLyRGbG93Rml4TWU6IEZsb3cgZG9lc24ndCBsaWtlIHRoZSBpbXBsaWVkIGFycmF5IGxpdGVyYWwgY29udmVyc2lvbiBoZXJlXG4gICAgICAgICAgICAoWzFlN10gKyAtWzFlM10gKyAtNGUzICsgLThlMyArIC0xZTExKS5yZXBsYWNlKC9bMDE4XS9nLCBiKTtcbiAgICB9XG4gICAgcmV0dXJuIGIoKTtcbn1cblxuLyoqXG4gKiBWYWxpZGF0ZSBhIHN0cmluZyB0byBtYXRjaCBVVUlEKHY0KSBvZiB0aGVcbiAqIGZvcm06IHh4eHh4eHh4LXh4eHgtNHh4eC1bODlhYl14eHgteHh4eHh4eHh4eHh4XG4gKiBAcGFyYW0gc3RyIHN0cmluZyB0byB2YWxpZGF0ZS5cbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVV1aWQoc3RyOiA/c3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHN0ciA/IC9eWzAtOWEtZl17OH0tWzAtOWEtZl17NH0tWzRdWzAtOWEtZl17M30tWzg5YWJdWzAtOWEtZl17M30tWzAtOWEtZl17MTJ9JC9pLnRlc3Qoc3RyKSA6IGZhbHNlO1xufVxuXG4vKipcbiAqIEdpdmVuIGFuIGFycmF5IG9mIG1lbWJlciBmdW5jdGlvbiBuYW1lcyBhcyBzdHJpbmdzLCByZXBsYWNlIGFsbCBvZiB0aGVtXG4gKiB3aXRoIGJvdW5kIHZlcnNpb25zIHRoYXQgd2lsbCBhbHdheXMgcmVmZXIgdG8gYGNvbnRleHRgIGFzIGB0aGlzYC4gVGhpc1xuICogaXMgdXNlZnVsIGZvciBjbGFzc2VzIHdoZXJlIG90aGVyd2lzZSBldmVudCBiaW5kaW5ncyB3b3VsZCByZWFzc2lnblxuICogYHRoaXNgIHRvIHRoZSBldmVudGVkIG9iamVjdCBvciBzb21lIG90aGVyIHZhbHVlOiB0aGlzIGxldHMgeW91IGVuc3VyZVxuICogdGhlIGB0aGlzYCB2YWx1ZSBhbHdheXMuXG4gKlxuICogQHBhcmFtIGZucyBsaXN0IG9mIG1lbWJlciBmdW5jdGlvbiBuYW1lc1xuICogQHBhcmFtIGNvbnRleHQgdGhlIGNvbnRleHQgdmFsdWVcbiAqIEBleGFtcGxlXG4gKiBmdW5jdGlvbiBNeUNsYXNzKCkge1xuICogICBiaW5kQWxsKFsnb250aW1lciddLCB0aGlzKTtcbiAqICAgdGhpcy5uYW1lID0gJ1RvbSc7XG4gKiB9XG4gKiBNeUNsYXNzLnByb3RvdHlwZS5vbnRpbWVyID0gZnVuY3Rpb24oKSB7XG4gKiAgIGFsZXJ0KHRoaXMubmFtZSk7XG4gKiB9O1xuICogdmFyIG15Q2xhc3MgPSBuZXcgTXlDbGFzcygpO1xuICogc2V0VGltZW91dChteUNsYXNzLm9udGltZXIsIDEwMCk7XG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gYmluZEFsbChmbnM6IEFycmF5PHN0cmluZz4sIGNvbnRleHQ6IE9iamVjdCk6IHZvaWQge1xuICAgIGZucy5mb3JFYWNoKChmbikgPT4ge1xuICAgICAgICBpZiAoIWNvbnRleHRbZm5dKSB7IHJldHVybjsgfVxuICAgICAgICBjb250ZXh0W2ZuXSA9IGNvbnRleHRbZm5dLmJpbmQoY29udGV4dCk7XG4gICAgfSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgc3RyaW5nIGVuZHMgd2l0aCBhIHBhcnRpY3VsYXIgc3Vic3RyaW5nXG4gKlxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuZHNXaXRoKHN0cmluZzogc3RyaW5nLCBzdWZmaXg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBzdHJpbmcuaW5kZXhPZihzdWZmaXgsIHN0cmluZy5sZW5ndGggLSBzdWZmaXgubGVuZ3RoKSAhPT0gLTE7XG59XG5cbi8qKlxuICogQ3JlYXRlIGFuIG9iamVjdCBieSBtYXBwaW5nIGFsbCB0aGUgdmFsdWVzIG9mIGFuIGV4aXN0aW5nIG9iamVjdCB3aGlsZVxuICogcHJlc2VydmluZyB0aGVpciBrZXlzLlxuICpcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXBPYmplY3QoaW5wdXQ6IE9iamVjdCwgaXRlcmF0b3I6IEZ1bmN0aW9uLCBjb250ZXh0PzogT2JqZWN0KTogT2JqZWN0IHtcbiAgICBjb25zdCBvdXRwdXQgPSB7fTtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBpbnB1dCkge1xuICAgICAgICBvdXRwdXRba2V5XSA9IGl0ZXJhdG9yLmNhbGwoY29udGV4dCB8fCB0aGlzLCBpbnB1dFtrZXldLCBrZXksIGlucHV0KTtcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYW4gb2JqZWN0IGJ5IGZpbHRlcmluZyBvdXQgdmFsdWVzIG9mIGFuIGV4aXN0aW5nIG9iamVjdC5cbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZmlsdGVyT2JqZWN0KGlucHV0OiBPYmplY3QsIGl0ZXJhdG9yOiBGdW5jdGlvbiwgY29udGV4dD86IE9iamVjdCk6IE9iamVjdCB7XG4gICAgY29uc3Qgb3V0cHV0ID0ge307XG4gICAgZm9yIChjb25zdCBrZXkgaW4gaW5wdXQpIHtcbiAgICAgICAgaWYgKGl0ZXJhdG9yLmNhbGwoY29udGV4dCB8fCB0aGlzLCBpbnB1dFtrZXldLCBrZXksIGlucHV0KSkge1xuICAgICAgICAgICAgb3V0cHV0W2tleV0gPSBpbnB1dFtrZXldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG59XG5cbmltcG9ydCBkZWVwRXF1YWwgZnJvbSAnLi4vc3R5bGUtc3BlYy91dGlsL2RlZXBfZXF1YWwnO1xuZXhwb3J0IHsgZGVlcEVxdWFsIH07XG5cbi8qKlxuICogRGVlcGx5IGNsb25lcyB0d28gb2JqZWN0cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY2xvbmU8VD4oaW5wdXQ6IFQpOiBUIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShpbnB1dCkpIHtcbiAgICAgICAgcmV0dXJuIGlucHV0Lm1hcChjbG9uZSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgaW5wdXQgPT09ICdvYmplY3QnICYmIGlucHV0KSB7XG4gICAgICAgIHJldHVybiAoKG1hcE9iamVjdChpbnB1dCwgY2xvbmUpOiBhbnkpOiBUKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gaW5wdXQ7XG4gICAgfVxufVxuXG4vKipcbiAqIENoZWNrIGlmIHR3byBhcnJheXMgaGF2ZSBhdCBsZWFzdCBvbmUgY29tbW9uIGVsZW1lbnQuXG4gKlxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFycmF5c0ludGVyc2VjdDxUPihhOiBBcnJheTxUPiwgYjogQXJyYXk8VD4pOiBib29sZWFuIHtcbiAgICBmb3IgKGxldCBsID0gMDsgbCA8IGEubGVuZ3RoOyBsKyspIHtcbiAgICAgICAgaWYgKGIuaW5kZXhPZihhW2xdKSA+PSAwKSByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIFByaW50IGEgd2FybmluZyBtZXNzYWdlIHRvIHRoZSBjb25zb2xlIGFuZCBlbnN1cmUgZHVwbGljYXRlIHdhcm5pbmcgbWVzc2FnZXNcbiAqIGFyZSBub3QgcHJpbnRlZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5jb25zdCB3YXJuT25jZUhpc3Rvcnk6IHtba2V5OiBzdHJpbmddOiBib29sZWFufSA9IHt9O1xuXG5leHBvcnQgZnVuY3Rpb24gd2Fybk9uY2UobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKCF3YXJuT25jZUhpc3RvcnlbbWVzc2FnZV0pIHtcbiAgICAgICAgLy8gY29uc29sZSBpc24ndCBkZWZpbmVkIGluIHNvbWUgV2ViV29ya2Vycywgc2VlICMyNTU4XG4gICAgICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gXCJ1bmRlZmluZWRcIikgY29uc29sZS53YXJuKG1lc3NhZ2UpO1xuICAgICAgICB3YXJuT25jZUhpc3RvcnlbbWVzc2FnZV0gPSB0cnVlO1xuICAgIH1cbn1cblxuLyoqXG4gKiBJbmRpY2F0ZXMgaWYgdGhlIHByb3ZpZGVkIFBvaW50cyBhcmUgaW4gYSBjb3VudGVyIGNsb2Nrd2lzZSAodHJ1ZSkgb3IgY2xvY2t3aXNlIChmYWxzZSkgb3JkZXJcbiAqXG4gKiBAcHJpdmF0ZVxuICogQHJldHVybnMgdHJ1ZSBmb3IgYSBjb3VudGVyIGNsb2Nrd2lzZSBzZXQgb2YgcG9pbnRzXG4gKi9cbi8vIGh0dHA6Ly9icnljZWJvZS5jb20vMjAwNi8xMC8yMy9saW5lLXNlZ21lbnQtaW50ZXJzZWN0aW9uLWFsZ29yaXRobS9cbmV4cG9ydCBmdW5jdGlvbiBpc0NvdW50ZXJDbG9ja3dpc2UoYTogUG9pbnQsIGI6IFBvaW50LCBjOiBQb2ludCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAoYy55IC0gYS55KSAqIChiLnggLSBhLngpID4gKGIueSAtIGEueSkgKiAoYy54IC0gYS54KTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBzaWduZWQgYXJlYSBmb3IgdGhlIHBvbHlnb24gcmluZy4gIFBvc3RpdmUgYXJlYXMgYXJlIGV4dGVyaW9yIHJpbmdzIGFuZFxuICogaGF2ZSBhIGNsb2Nrd2lzZSB3aW5kaW5nLiAgTmVnYXRpdmUgYXJlYXMgYXJlIGludGVyaW9yIHJpbmdzIGFuZCBoYXZlIGEgY291bnRlciBjbG9ja3dpc2VcbiAqIG9yZGVyaW5nLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0gcmluZyBFeHRlcmlvciBvciBpbnRlcmlvciByaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjYWxjdWxhdGVTaWduZWRBcmVhKHJpbmc6IEFycmF5PFBvaW50Pik6IG51bWJlciB7XG4gICAgbGV0IHN1bSA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IHJpbmcubGVuZ3RoLCBqID0gbGVuIC0gMSwgcDEsIHAyOyBpIDwgbGVuOyBqID0gaSsrKSB7XG4gICAgICAgIHAxID0gcmluZ1tpXTtcbiAgICAgICAgcDIgPSByaW5nW2pdO1xuICAgICAgICBzdW0gKz0gKHAyLnggLSBwMS54KSAqIChwMS55ICsgcDIueSk7XG4gICAgfVxuICAgIHJldHVybiBzdW07XG59XG5cbi8qKlxuICogRGV0ZWN0cyBjbG9zZWQgcG9seWdvbnMsIGZpcnN0ICsgbGFzdCBwb2ludCBhcmUgZXF1YWxcbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHBvaW50cyBhcnJheSBvZiBwb2ludHNcbiAqIEByZXR1cm4gdHJ1ZSBpZiB0aGUgcG9pbnRzIGFyZSBhIGNsb3NlZCBwb2x5Z29uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0Nsb3NlZFBvbHlnb24ocG9pbnRzOiBBcnJheTxQb2ludD4pOiBib29sZWFuIHtcbiAgICAvLyBJZiBpdCBpcyAyIHBvaW50cyB0aGF0IGFyZSB0aGUgc2FtZSB0aGVuIGl0IGlzIGEgcG9pbnRcbiAgICAvLyBJZiBpdCBpcyAzIHBvaW50cyB3aXRoIHN0YXJ0IGFuZCBlbmQgdGhlIHNhbWUgdGhlbiBpdCBpcyBhIGxpbmVcbiAgICBpZiAocG9pbnRzLmxlbmd0aCA8IDQpXG4gICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIGNvbnN0IHAxID0gcG9pbnRzWzBdO1xuICAgIGNvbnN0IHAyID0gcG9pbnRzW3BvaW50cy5sZW5ndGggLSAxXTtcblxuICAgIGlmIChNYXRoLmFicyhwMS54IC0gcDIueCkgPiAwIHx8XG4gICAgICAgIE1hdGguYWJzKHAxLnkgLSBwMi55KSA+IDApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIHBvbHlnb24gc2ltcGxpZmljYXRpb24gY2FuIHByb2R1Y2UgcG9seWdvbnMgd2l0aCB6ZXJvIGFyZWEgYW5kIG1vcmUgdGhhbiAzIHBvaW50c1xuICAgIHJldHVybiBNYXRoLmFicyhjYWxjdWxhdGVTaWduZWRBcmVhKHBvaW50cykpID4gMC4wMTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBzcGhlcmljYWwgY29vcmRpbmF0ZXMgdG8gY2FydGVzaWFuIGNvb3JkaW5hdGVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0gc3BoZXJpY2FsIFNwaGVyaWNhbCBjb29yZGluYXRlcywgaW4gW3JhZGlhbCwgYXppbXV0aGFsLCBwb2xhcl1cbiAqIEByZXR1cm4gY2FydGVzaWFuIGNvb3JkaW5hdGVzIGluIFt4LCB5LCB6XVxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBzcGhlcmljYWxUb0NhcnRlc2lhbihbciwgYXppbXV0aGFsLCBwb2xhcl06IFtudW1iZXIsIG51bWJlciwgbnVtYmVyXSk6IHt4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyfSB7XG4gICAgLy8gV2UgYWJzdHJhY3QgXCJub3J0aFwiL1widXBcIiAoY29tcGFzcy13aXNlKSB0byBiZSAwwrAgd2hlbiByZWFsbHkgdGhpcyBpcyA5MMKwICjPgC8yKTpcbiAgICAvLyBjb3JyZWN0IGZvciB0aGF0IGhlcmVcbiAgICBhemltdXRoYWwgKz0gOTA7XG5cbiAgICAvLyBDb252ZXJ0IGF6aW11dGhhbCBhbmQgcG9sYXIgYW5nbGVzIHRvIHJhZGlhbnNcbiAgICBhemltdXRoYWwgKj0gTWF0aC5QSSAvIDE4MDtcbiAgICBwb2xhciAqPSBNYXRoLlBJIC8gMTgwO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgeDogciAqIE1hdGguY29zKGF6aW11dGhhbCkgKiBNYXRoLnNpbihwb2xhciksXG4gICAgICAgIHk6IHIgKiBNYXRoLnNpbihhemltdXRoYWwpICogTWF0aC5zaW4ocG9sYXIpLFxuICAgICAgICB6OiByICogTWF0aC5jb3MocG9sYXIpXG4gICAgfTtcbn1cblxuLyoqXG4gKiBQYXJzZXMgZGF0YSBmcm9tICdDYWNoZS1Db250cm9sJyBoZWFkZXJzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0gY2FjaGVDb250cm9sIFZhbHVlIG9mICdDYWNoZS1Db250cm9sJyBoZWFkZXJcbiAqIEByZXR1cm4gb2JqZWN0IGNvbnRhaW5pbmcgcGFyc2VkIGhlYWRlciBpbmZvLlxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUNhY2hlQ29udHJvbChjYWNoZUNvbnRyb2w6IHN0cmluZyk6IE9iamVjdCB7XG4gICAgLy8gVGFrZW4gZnJvbSBbV3JlY2tdKGh0dHBzOi8vZ2l0aHViLmNvbS9oYXBpanMvd3JlY2spXG4gICAgY29uc3QgcmUgPSAvKD86XnwoPzpcXHMqXFwsXFxzKikpKFteXFx4MDAtXFx4MjBcXChcXCk8PkBcXCw7XFw6XFxcXFwiXFwvXFxbXFxdXFw/XFw9XFx7XFx9XFx4N0ZdKykoPzpcXD0oPzooW15cXHgwMC1cXHgyMFxcKFxcKTw+QFxcLDtcXDpcXFxcXCJcXC9cXFtcXF1cXD9cXD1cXHtcXH1cXHg3Rl0rKXwoPzpcXFwiKCg/OlteXCJcXFxcXXxcXFxcLikqKVxcXCIpKSk/L2c7XG5cbiAgICBjb25zdCBoZWFkZXIgPSB7fTtcbiAgICBjYWNoZUNvbnRyb2wucmVwbGFjZShyZSwgKCQwLCAkMSwgJDIsICQzKSA9PiB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gJDIgfHwgJDM7XG4gICAgICAgIGhlYWRlclskMV0gPSB2YWx1ZSA/IHZhbHVlLnRvTG93ZXJDYXNlKCkgOiB0cnVlO1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgfSk7XG5cbiAgICBpZiAoaGVhZGVyWydtYXgtYWdlJ10pIHtcbiAgICAgICAgY29uc3QgbWF4QWdlID0gcGFyc2VJbnQoaGVhZGVyWydtYXgtYWdlJ10sIDEwKTtcbiAgICAgICAgaWYgKGlzTmFOKG1heEFnZSkpIGRlbGV0ZSBoZWFkZXJbJ21heC1hZ2UnXTtcbiAgICAgICAgZWxzZSBoZWFkZXJbJ21heC1hZ2UnXSA9IG1heEFnZTtcbiAgICB9XG5cbiAgICByZXR1cm4gaGVhZGVyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RvcmFnZUF2YWlsYWJsZSh0eXBlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBzdG9yYWdlID0gd2luZG93W3R5cGVdO1xuICAgICAgICBzdG9yYWdlLnNldEl0ZW0oJ19tYXBib3hfdGVzdF8nLCAxKTtcbiAgICAgICAgc3RvcmFnZS5yZW1vdmVJdGVtKCdfbWFwYm94X3Rlc3RfJyk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbiIsIi8vIEBmbG93XG5cbnR5cGUgQ29uZmlnID0ge3xcbiAgQVBJX1VSTDogc3RyaW5nLFxuICBFVkVOVFNfVVJMOiBzdHJpbmcsXG4gIFJFUVVJUkVfQUNDRVNTX1RPS0VOOiBib29sZWFuLFxuICBBQ0NFU1NfVE9LRU46ID9zdHJpbmcsXG4gIE1BWF9QQVJBTExFTF9JTUFHRV9SRVFVRVNUUzogbnVtYmVyXG58fTtcblxuY29uc3QgY29uZmlnOiBDb25maWcgPSB7XG4gICAgQVBJX1VSTDogJ2h0dHBzOi8vYXBpLm1hcGJveC5jb20nLFxuICAgIGdldCBFVkVOVFNfVVJMKCkge1xuICAgICAgICBpZiAodGhpcy5BUElfVVJMLmluZGV4T2YoJ2h0dHBzOi8vYXBpLm1hcGJveC5jbicpID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gJ2h0dHBzOi8vZXZlbnRzLm1hcGJveC5jbi9ldmVudHMvdjInO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuICdodHRwczovL2V2ZW50cy5tYXBib3guY29tL2V2ZW50cy92Mic7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIFJFUVVJUkVfQUNDRVNTX1RPS0VOOiB0cnVlLFxuICAgIEFDQ0VTU19UT0tFTjogbnVsbCxcbiAgICBNQVhfUEFSQUxMRUxfSU1BR0VfUkVRVUVTVFM6IDE2XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjb25maWc7XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgd2luZG93IGZyb20gJy4vd2luZG93JztcbmltcG9ydCB0eXBlIHsgQ2FuY2VsYWJsZSB9IGZyb20gJy4uL3R5cGVzL2NhbmNlbGFibGUnO1xuXG5jb25zdCBub3cgPSB3aW5kb3cucGVyZm9ybWFuY2UgJiYgd2luZG93LnBlcmZvcm1hbmNlLm5vdyA/XG4gICAgd2luZG93LnBlcmZvcm1hbmNlLm5vdy5iaW5kKHdpbmRvdy5wZXJmb3JtYW5jZSkgOlxuICAgIERhdGUubm93LmJpbmQoRGF0ZSk7XG5cbmNvbnN0IHJhZiA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgIHdpbmRvdy5tc1JlcXVlc3RBbmltYXRpb25GcmFtZTtcblxuY29uc3QgY2FuY2VsID0gd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgd2luZG93Lm1vekNhbmNlbEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgd2luZG93LndlYmtpdENhbmNlbEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgd2luZG93Lm1zQ2FuY2VsQW5pbWF0aW9uRnJhbWU7XG5cbi8qKlxuICogQHByaXZhdGVcbiAqL1xuY29uc3QgZXhwb3J0ZWQgPSB7XG4gICAgLyoqXG4gICAgICogUHJvdmlkZXMgYSBmdW5jdGlvbiB0aGF0IG91dHB1dHMgbWlsbGlzZWNvbmRzOiBlaXRoZXIgcGVyZm9ybWFuY2Uubm93KClcbiAgICAgKiBvciBhIGZhbGxiYWNrIHRvIERhdGUubm93KClcbiAgICAgKi9cbiAgICBub3csXG5cbiAgICBmcmFtZShmbjogRnVuY3Rpb24pOiBDYW5jZWxhYmxlIHtcbiAgICAgICAgY29uc3QgZnJhbWUgPSByYWYoZm4pO1xuICAgICAgICByZXR1cm4geyBjYW5jZWw6ICgpID0+IGNhbmNlbChmcmFtZSkgfTtcbiAgICB9LFxuXG4gICAgZ2V0SW1hZ2VEYXRhKGltZzogQ2FudmFzSW1hZ2VTb3VyY2UpOiBJbWFnZURhdGEge1xuICAgICAgICBjb25zdCBjYW52YXMgPSB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgIGNvbnN0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgaWYgKCFjb250ZXh0KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ZhaWxlZCB0byBjcmVhdGUgY2FudmFzIDJkIGNvbnRleHQnKTtcbiAgICAgICAgfVxuICAgICAgICBjYW52YXMud2lkdGggPSBpbWcud2lkdGg7XG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSBpbWcuaGVpZ2h0O1xuICAgICAgICBjb250ZXh0LmRyYXdJbWFnZShpbWcsIDAsIDAsIGltZy53aWR0aCwgaW1nLmhlaWdodCk7XG4gICAgICAgIHJldHVybiBjb250ZXh0LmdldEltYWdlRGF0YSgwLCAwLCBpbWcud2lkdGgsIGltZy5oZWlnaHQpO1xuICAgIH0sXG5cbiAgICByZXNvbHZlVVJMKHBhdGg6IHN0cmluZykge1xuICAgICAgICBjb25zdCBhID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgICAgYS5ocmVmID0gcGF0aDtcbiAgICAgICAgcmV0dXJuIGEuaHJlZjtcbiAgICB9LFxuXG4gICAgaGFyZHdhcmVDb25jdXJyZW5jeTogd2luZG93Lm5hdmlnYXRvci5oYXJkd2FyZUNvbmN1cnJlbmN5IHx8IDQsXG4gICAgZ2V0IGRldmljZVBpeGVsUmF0aW8oKSB7IHJldHVybiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbzsgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgZXhwb3J0ZWQ7XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgd2luZG93IGZyb20gJy4vd2luZG93JztcblxuY29uc3QgZXhwb3J0ZWQgPSB7XG4gICAgc3VwcG9ydGVkOiBmYWxzZSxcbiAgICB0ZXN0U3VwcG9ydFxufTtcblxuZXhwb3J0IGRlZmF1bHQgZXhwb3J0ZWQ7XG5cbmxldCBnbEZvclRlc3Rpbmc7XG5sZXQgd2VicENoZWNrQ29tcGxldGUgPSBmYWxzZTtcbmxldCB3ZWJwSW1nVGVzdDtcblxuaWYgKHdpbmRvdy5kb2N1bWVudCkge1xuICAgIHdlYnBJbWdUZXN0ID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuICAgIHdlYnBJbWdUZXN0Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoZ2xGb3JUZXN0aW5nKSB0ZXN0V2VicFRleHR1cmVVcGxvYWQoZ2xGb3JUZXN0aW5nKTtcbiAgICAgICAgZ2xGb3JUZXN0aW5nID0gbnVsbDtcbiAgICB9O1xuICAgIHdlYnBJbWdUZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgd2VicENoZWNrQ29tcGxldGUgPSB0cnVlO1xuICAgICAgICBnbEZvclRlc3RpbmcgPSBudWxsO1xuICAgIH07XG4gICAgd2VicEltZ1Rlc3Quc3JjID0gJ2RhdGE6aW1hZ2Uvd2VicDtiYXNlNjQsVWtsR1JoNEFBQUJYUlVKUVZsQTRUQkVBQUFBdkFRQUFBQWZRLy83M3YvK0JpT2gvQUFBPSc7XG59XG5cbmZ1bmN0aW9uIHRlc3RTdXBwb3J0KGdsOiBXZWJHTFJlbmRlcmluZ0NvbnRleHQpIHtcbiAgICBpZiAod2VicENoZWNrQ29tcGxldGUgfHwgIXdlYnBJbWdUZXN0KSByZXR1cm47XG5cbiAgICBpZiAoIXdlYnBJbWdUZXN0LmNvbXBsZXRlKSB7XG4gICAgICAgIGdsRm9yVGVzdGluZyA9IGdsO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGVzdFdlYnBUZXh0dXJlVXBsb2FkKGdsKTtcbn1cblxuZnVuY3Rpb24gdGVzdFdlYnBUZXh0dXJlVXBsb2FkKGdsOiBXZWJHTFJlbmRlcmluZ0NvbnRleHQpIHtcbiAgICAvLyBFZGdlIDE4IHN1cHBvcnRzIFdlYlAgYnV0IG5vdCB1cGxvYWRpbmcgYSBXZWJQIGltYWdlIHRvIGEgZ2wgdGV4dHVyZVxuICAgIC8vIFRlc3Qgc3VwcG9ydCBmb3IgdGhpcyBiZWZvcmUgYWxsb3dpbmcgV2ViUCBpbWFnZXMuXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL21hcGJveC9tYXBib3gtZ2wtanMvaXNzdWVzLzc2NzFcbiAgICBjb25zdCB0ZXh0dXJlID0gZ2wuY3JlYXRlVGV4dHVyZSgpO1xuICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRleHR1cmUpO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgZ2wudGV4SW1hZ2UyRChnbC5URVhUVVJFXzJELCAwLCBnbC5SR0JBLCBnbC5SR0JBLCBnbC5VTlNJR05FRF9CWVRFLCB3ZWJwSW1nVGVzdCk7XG5cbiAgICAgICAgLy8gVGhlIGVycm9yIGRvZXMgbm90IGdldCB0cmlnZ2VyZWQgaW4gRWRnZSBpZiB0aGUgY29udGV4dCBpcyBsb3N0XG4gICAgICAgIGlmIChnbC5pc0NvbnRleHRMb3N0KCkpIHJldHVybjtcblxuICAgICAgICBleHBvcnRlZC5zdXBwb3J0ZWQgPSB0cnVlO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gQ2F0Y2ggXCJVbnNwZWNpZmllZCBFcnJvci5cIiBpbiBFZGdlIDE4LlxuICAgIH1cblxuICAgIGdsLmRlbGV0ZVRleHR1cmUodGV4dHVyZSk7XG5cbiAgICB3ZWJwQ2hlY2tDb21wbGV0ZSA9IHRydWU7XG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgY29uZmlnIGZyb20gJy4vY29uZmlnJztcblxuaW1wb3J0IGJyb3dzZXIgZnJvbSAnLi9icm93c2VyJztcbmltcG9ydCB3ZWJwU3VwcG9ydGVkIGZyb20gJy4vd2VicF9zdXBwb3J0ZWQnO1xuaW1wb3J0IHdpbmRvdyBmcm9tICcuL3dpbmRvdyc7XG5pbXBvcnQgeyB2ZXJzaW9uIH0gZnJvbSAnLi4vLi4vcGFja2FnZS5qc29uJztcbmltcG9ydCB7IHV1aWQsIHZhbGlkYXRlVXVpZCwgc3RvcmFnZUF2YWlsYWJsZSwgd2Fybk9uY2UsIGV4dGVuZCB9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQgeyBwb3N0RGF0YSB9IGZyb20gJy4vYWpheCc7XG5cbmltcG9ydCB0eXBlIHsgUmVxdWVzdFBhcmFtZXRlcnMgfSBmcm9tICcuL2FqYXgnO1xuaW1wb3J0IHR5cGUgeyBDYW5jZWxhYmxlIH0gZnJvbSAnLi4vdHlwZXMvY2FuY2VsYWJsZSc7XG5pbXBvcnQgdHlwZSB7VGlsZUpTT059IGZyb20gJy4uL3R5cGVzL3RpbGVqc29uJztcblxuY29uc3QgaGVscCA9ICdTZWUgaHR0cHM6Ly93d3cubWFwYm94LmNvbS9hcGktZG9jdW1lbnRhdGlvbi8jYWNjZXNzLXRva2Vucyc7XG5jb25zdCB0ZWxlbUV2ZW50S2V5ID0gJ21hcGJveC5ldmVudERhdGEnO1xuXG50eXBlIFVybE9iamVjdCA9IHt8XG4gICAgcHJvdG9jb2w6IHN0cmluZyxcbiAgICBhdXRob3JpdHk6IHN0cmluZyxcbiAgICBwYXRoOiBzdHJpbmcsXG4gICAgcGFyYW1zOiBBcnJheTxzdHJpbmc+XG58fTtcblxuZnVuY3Rpb24gbWFrZUFQSVVSTCh1cmxPYmplY3Q6IFVybE9iamVjdCwgYWNjZXNzVG9rZW46IHN0cmluZyB8IG51bGwgfCB2b2lkKTogc3RyaW5nIHtcbiAgICBjb25zdCBhcGlVcmxPYmplY3QgPSBwYXJzZVVybChjb25maWcuQVBJX1VSTCk7XG4gICAgdXJsT2JqZWN0LnByb3RvY29sID0gYXBpVXJsT2JqZWN0LnByb3RvY29sO1xuICAgIHVybE9iamVjdC5hdXRob3JpdHkgPSBhcGlVcmxPYmplY3QuYXV0aG9yaXR5O1xuXG4gICAgaWYgKGFwaVVybE9iamVjdC5wYXRoICE9PSAnLycpIHtcbiAgICAgICAgdXJsT2JqZWN0LnBhdGggPSBgJHthcGlVcmxPYmplY3QucGF0aH0ke3VybE9iamVjdC5wYXRofWA7XG4gICAgfVxuXG4gICAgaWYgKCFjb25maWcuUkVRVUlSRV9BQ0NFU1NfVE9LRU4pIHJldHVybiBmb3JtYXRVcmwodXJsT2JqZWN0KTtcblxuICAgIGFjY2Vzc1Rva2VuID0gYWNjZXNzVG9rZW4gfHwgY29uZmlnLkFDQ0VTU19UT0tFTjtcbiAgICBpZiAoIWFjY2Vzc1Rva2VuKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEFuIEFQSSBhY2Nlc3MgdG9rZW4gaXMgcmVxdWlyZWQgdG8gdXNlIE1hcGJveCBHTC4gJHtoZWxwfWApO1xuICAgIGlmIChhY2Nlc3NUb2tlblswXSA9PT0gJ3MnKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVzZSBhIHB1YmxpYyBhY2Nlc3MgdG9rZW4gKHBrLiopIHdpdGggTWFwYm94IEdMLCBub3QgYSBzZWNyZXQgYWNjZXNzIHRva2VuIChzay4qKS4gJHtoZWxwfWApO1xuXG4gICAgdXJsT2JqZWN0LnBhcmFtcy5wdXNoKGBhY2Nlc3NfdG9rZW49JHthY2Nlc3NUb2tlbn1gKTtcbiAgICByZXR1cm4gZm9ybWF0VXJsKHVybE9iamVjdCk7XG59XG5cbmZ1bmN0aW9uIGlzTWFwYm94VVJMKHVybDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHVybC5pbmRleE9mKCdtYXBib3g6JykgPT09IDA7XG59XG5cbmNvbnN0IG1hcGJveEhUVFBVUkxSZSA9IC9eKChodHRwcz86KT9cXC9cXC8pPyhbXlxcL10rXFwuKT9tYXBib3hcXC5jKG58b20pKFxcL3xcXD98JCkvaTtcbmZ1bmN0aW9uIGlzTWFwYm94SFRUUFVSTCh1cmw6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBtYXBib3hIVFRQVVJMUmUudGVzdCh1cmwpO1xufVxuXG5leHBvcnQgeyBpc01hcGJveFVSTCwgaXNNYXBib3hIVFRQVVJMIH07XG5cbmV4cG9ydCBjb25zdCBub3JtYWxpemVTdHlsZVVSTCA9IGZ1bmN0aW9uKHVybDogc3RyaW5nLCBhY2Nlc3NUb2tlbj86IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKCFpc01hcGJveFVSTCh1cmwpKSByZXR1cm4gdXJsO1xuICAgIGNvbnN0IHVybE9iamVjdCA9IHBhcnNlVXJsKHVybCk7XG4gICAgdXJsT2JqZWN0LnBhdGggPSBgL3N0eWxlcy92MSR7dXJsT2JqZWN0LnBhdGh9YDtcbiAgICByZXR1cm4gbWFrZUFQSVVSTCh1cmxPYmplY3QsIGFjY2Vzc1Rva2VuKTtcbn07XG5cbmV4cG9ydCBjb25zdCBub3JtYWxpemVHbHlwaHNVUkwgPSBmdW5jdGlvbih1cmw6IHN0cmluZywgYWNjZXNzVG9rZW4/OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICghaXNNYXBib3hVUkwodXJsKSkgcmV0dXJuIHVybDtcbiAgICBjb25zdCB1cmxPYmplY3QgPSBwYXJzZVVybCh1cmwpO1xuICAgIHVybE9iamVjdC5wYXRoID0gYC9mb250cy92MSR7dXJsT2JqZWN0LnBhdGh9YDtcbiAgICByZXR1cm4gbWFrZUFQSVVSTCh1cmxPYmplY3QsIGFjY2Vzc1Rva2VuKTtcbn07XG5cbmV4cG9ydCBjb25zdCBub3JtYWxpemVTb3VyY2VVUkwgPSBmdW5jdGlvbih1cmw6IHN0cmluZywgYWNjZXNzVG9rZW4/OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICghaXNNYXBib3hVUkwodXJsKSkgcmV0dXJuIHVybDtcbiAgICBjb25zdCB1cmxPYmplY3QgPSBwYXJzZVVybCh1cmwpO1xuICAgIHVybE9iamVjdC5wYXRoID0gYC92NC8ke3VybE9iamVjdC5hdXRob3JpdHl9Lmpzb25gO1xuICAgIC8vIFRpbGVKU09OIHJlcXVlc3RzIG5lZWQgYSBzZWN1cmUgZmxhZyBhcHBlbmRlZCB0byB0aGVpciBVUkxzIHNvXG4gICAgLy8gdGhhdCB0aGUgc2VydmVyIGtub3dzIHRvIHNlbmQgU1NMLWlmaWVkIHJlc291cmNlIHJlZmVyZW5jZXMuXG4gICAgdXJsT2JqZWN0LnBhcmFtcy5wdXNoKCdzZWN1cmUnKTtcbiAgICByZXR1cm4gbWFrZUFQSVVSTCh1cmxPYmplY3QsIGFjY2Vzc1Rva2VuKTtcbn07XG5cbmV4cG9ydCBjb25zdCBub3JtYWxpemVTcHJpdGVVUkwgPSBmdW5jdGlvbih1cmw6IHN0cmluZywgZm9ybWF0OiBzdHJpbmcsIGV4dGVuc2lvbjogc3RyaW5nLCBhY2Nlc3NUb2tlbj86IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgdXJsT2JqZWN0ID0gcGFyc2VVcmwodXJsKTtcbiAgICBpZiAoIWlzTWFwYm94VVJMKHVybCkpIHtcbiAgICAgICAgdXJsT2JqZWN0LnBhdGggKz0gYCR7Zm9ybWF0fSR7ZXh0ZW5zaW9ufWA7XG4gICAgICAgIHJldHVybiBmb3JtYXRVcmwodXJsT2JqZWN0KTtcbiAgICB9XG4gICAgdXJsT2JqZWN0LnBhdGggPSBgL3N0eWxlcy92MSR7dXJsT2JqZWN0LnBhdGh9L3Nwcml0ZSR7Zm9ybWF0fSR7ZXh0ZW5zaW9ufWA7XG4gICAgcmV0dXJuIG1ha2VBUElVUkwodXJsT2JqZWN0LCBhY2Nlc3NUb2tlbik7XG59O1xuXG5jb25zdCBpbWFnZUV4dGVuc2lvblJlID0gLyhcXC4ocG5nfGpwZylcXGQqKSg/PSQpLztcbi8vIG1hdGNoZXMgYW55IGZpbGUgZXh0ZW5zaW9uIHNwZWNpZmllZCBieSBhIGRvdCBhbmQgb25lIG9yIG1vcmUgYWxwaGFudW1lcmljIGNoYXJhY3RlcnNcbmNvbnN0IGV4dGVuc2lvblJlID0gL1xcLltcXHddKyQvO1xuXG5leHBvcnQgY29uc3Qgbm9ybWFsaXplVGlsZVVSTCA9IGZ1bmN0aW9uKHRpbGVVUkw6IHN0cmluZywgc291cmNlVVJMPzogP3N0cmluZywgdGlsZVNpemU/OiA/bnVtYmVyKTogc3RyaW5nIHtcbiAgICBpZiAoIXNvdXJjZVVSTCB8fCAhaXNNYXBib3hVUkwoc291cmNlVVJMKSkgcmV0dXJuIHRpbGVVUkw7XG5cbiAgICBjb25zdCB1cmxPYmplY3QgPSBwYXJzZVVybCh0aWxlVVJMKTtcblxuICAgIC8vIFRoZSB2NCBtYXBib3ggdGlsZSBBUEkgc3VwcG9ydHMgNTEyeDUxMiBpbWFnZSB0aWxlcyBvbmx5IHdoZW4gQDJ4XG4gICAgLy8gaXMgYXBwZW5kZWQgdG8gdGhlIHRpbGUgVVJMLiBJZiBgdGlsZVNpemU6IDUxMmAgaXMgc3BlY2lmaWVkIGZvclxuICAgIC8vIGEgTWFwYm94IHJhc3RlciBzb3VyY2UgZm9yY2UgdGhlIEAyeCBzdWZmaXggZXZlbiBpZiBhIG5vbiBoaWRwaSBkZXZpY2UuXG4gICAgY29uc3Qgc3VmZml4ID0gYnJvd3Nlci5kZXZpY2VQaXhlbFJhdGlvID49IDIgfHwgdGlsZVNpemUgPT09IDUxMiA/ICdAMngnIDogJyc7XG4gICAgY29uc3QgZXh0ZW5zaW9uID0gd2VicFN1cHBvcnRlZC5zdXBwb3J0ZWQgPyAnLndlYnAnIDogJyQxJztcbiAgICB1cmxPYmplY3QucGF0aCA9IHVybE9iamVjdC5wYXRoLnJlcGxhY2UoaW1hZ2VFeHRlbnNpb25SZSwgYCR7c3VmZml4fSR7ZXh0ZW5zaW9ufWApO1xuICAgIHVybE9iamVjdC5wYXRoID0gYC92NCR7dXJsT2JqZWN0LnBhdGh9YDtcblxuICAgIHJldHVybiBtYWtlQVBJVVJMKHVybE9iamVjdCk7XG59O1xuXG5leHBvcnQgY29uc3QgY2Fub25pY2FsaXplVGlsZVVSTCA9IGZ1bmN0aW9uKHVybDogc3RyaW5nKSB7XG4gICAgY29uc3QgdmVyc2lvbiA9IFwiL3Y0L1wiO1xuXG4gICAgY29uc3QgdXJsT2JqZWN0ID0gcGFyc2VVcmwodXJsKTtcbiAgICAvLyBNYWtlIHN1cmUgdGhhdCB3ZSBhcmUgZGVhbGluZyB3aXRoIGEgdmFsaWQgTWFwYm94IHRpbGUgVVJMLlxuICAgIC8vIEhhcyB0byBiZWdpbiB3aXRoIC92NC8sIHdpdGggYSB2YWxpZCBmaWxlbmFtZSArIGV4dGVuc2lvblxuICAgIGlmICghdXJsT2JqZWN0LnBhdGgubWF0Y2goLyheXFwvdjRcXC8pLykgfHwgIXVybE9iamVjdC5wYXRoLm1hdGNoKGV4dGVuc2lvblJlKSkge1xuICAgICAgICAvLyBOb3QgYSBwcm9wZXIgTWFwYm94IHRpbGUgVVJMLlxuICAgICAgICByZXR1cm4gdXJsO1xuICAgIH1cbiAgICAvLyBSZWFzc2VtYmxlIHRoZSBjYW5vbmljYWwgVVJMIGZyb20gdGhlIHBhcnRzIHdlJ3ZlIHBhcnNlZCBiZWZvcmUuXG4gICAgbGV0IHJlc3VsdCA9IFwibWFwYm94Oi8vdGlsZXMvXCI7XG4gICAgcmVzdWx0ICs9ICB1cmxPYmplY3QucGF0aC5yZXBsYWNlKHZlcnNpb24sICcnKTtcblxuICAgIC8vIEFwcGVuZCB0aGUgcXVlcnkgc3RyaW5nLCBtaW51cyB0aGUgYWNjZXNzIHRva2VuIHBhcmFtZXRlci5cbiAgICBjb25zdCBwYXJhbXMgPSB1cmxPYmplY3QucGFyYW1zLmZpbHRlcihwID0+ICFwLm1hdGNoKC9eYWNjZXNzX3Rva2VuPS8pKTtcbiAgICBpZiAocGFyYW1zLmxlbmd0aCkgcmVzdWx0ICs9IGA/JHtwYXJhbXMuam9pbignJicpfWA7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbmV4cG9ydCBjb25zdCBjYW5vbmljYWxpemVUaWxlc2V0ID0gZnVuY3Rpb24odGlsZUpTT046IFRpbGVKU09OLCBzb3VyY2VVUkw6IHN0cmluZykge1xuICAgIGlmICghaXNNYXBib3hVUkwoc291cmNlVVJMKSkgcmV0dXJuIHRpbGVKU09OLnRpbGVzIHx8IFtdO1xuICAgIGNvbnN0IGNhbm9uaWNhbCA9IFtdO1xuICAgIGZvciAoY29uc3QgdXJsIG9mIHRpbGVKU09OLnRpbGVzKSB7XG4gICAgICAgIGNvbnN0IGNhbm9uaWNhbFVybCA9IGNhbm9uaWNhbGl6ZVRpbGVVUkwodXJsKTtcbiAgICAgICAgY2Fub25pY2FsLnB1c2goY2Fub25pY2FsVXJsKTtcbiAgICB9XG4gICAgcmV0dXJuIGNhbm9uaWNhbDtcbn07XG5cbmNvbnN0IHVybFJlID0gL14oXFx3Kyk6XFwvXFwvKFteLz9dKikoXFwvW14/XSspP1xcPz8oLispPy87XG5cbmZ1bmN0aW9uIHBhcnNlVXJsKHVybDogc3RyaW5nKTogVXJsT2JqZWN0IHtcbiAgICBjb25zdCBwYXJ0cyA9IHVybC5tYXRjaCh1cmxSZSk7XG4gICAgaWYgKCFwYXJ0cykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuYWJsZSB0byBwYXJzZSBVUkwgb2JqZWN0Jyk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIHByb3RvY29sOiBwYXJ0c1sxXSxcbiAgICAgICAgYXV0aG9yaXR5OiBwYXJ0c1syXSxcbiAgICAgICAgcGF0aDogcGFydHNbM10gfHwgJy8nLFxuICAgICAgICBwYXJhbXM6IHBhcnRzWzRdID8gcGFydHNbNF0uc3BsaXQoJyYnKSA6IFtdXG4gICAgfTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VXJsKG9iajogVXJsT2JqZWN0KTogc3RyaW5nIHtcbiAgICBjb25zdCBwYXJhbXMgPSBvYmoucGFyYW1zLmxlbmd0aCA/IGA/JHtvYmoucGFyYW1zLmpvaW4oJyYnKX1gIDogJyc7XG4gICAgcmV0dXJuIGAke29iai5wcm90b2NvbH06Ly8ke29iai5hdXRob3JpdHl9JHtvYmoucGF0aH0ke3BhcmFtc31gO1xufVxuXG50eXBlIFRlbGVtZXRyeUV2ZW50VHlwZSA9ICdhcHBVc2VyVHVybnN0aWxlJyB8ICdtYXAubG9hZCc7XG5cbmNsYXNzIFRlbGVtZXRyeUV2ZW50IHtcbiAgICBldmVudERhdGE6IHsgbGFzdFN1Y2Nlc3M6ID9udW1iZXIsIGFjY2Vzc1Rva2VuOiA/c3RyaW5nfTtcbiAgICBhbm9uSWQ6ID9zdHJpbmc7XG4gICAgcXVldWU6IEFycmF5PGFueT47XG4gICAgdHlwZTogVGVsZW1ldHJ5RXZlbnRUeXBlO1xuICAgIHBlbmRpbmdSZXF1ZXN0OiA/Q2FuY2VsYWJsZTtcblxuICAgIGNvbnN0cnVjdG9yKHR5cGU6IFRlbGVtZXRyeUV2ZW50VHlwZSkge1xuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgICAgICB0aGlzLmFub25JZCA9IG51bGw7XG4gICAgICAgIHRoaXMuZXZlbnREYXRhID0ge2xhc3RTdWNjZXNzOiBudWxsLCBhY2Nlc3NUb2tlbjogY29uZmlnLkFDQ0VTU19UT0tFTn07XG4gICAgICAgIHRoaXMucXVldWUgPSBbXTtcbiAgICAgICAgdGhpcy5wZW5kaW5nUmVxdWVzdCA9IG51bGw7XG4gICAgfVxuXG4gICAgZmV0Y2hFdmVudERhdGEoKSB7XG4gICAgICAgIGNvbnN0IGlzTG9jYWxTdG9yYWdlQXZhaWxhYmxlID0gc3RvcmFnZUF2YWlsYWJsZSgnbG9jYWxTdG9yYWdlJyk7XG4gICAgICAgIGNvbnN0IHN0b3JhZ2VLZXkgPSBgJHt0ZWxlbUV2ZW50S2V5fToke2NvbmZpZy5BQ0NFU1NfVE9LRU4gfHwgJyd9YDtcbiAgICAgICAgY29uc3QgdXVpZEtleSA9IGAke3RlbGVtRXZlbnRLZXl9LnV1aWQ6JHtjb25maWcuQUNDRVNTX1RPS0VOIHx8ICcnfWA7XG5cbiAgICAgICAgaWYgKGlzTG9jYWxTdG9yYWdlQXZhaWxhYmxlKSB7XG4gICAgICAgICAgICAvL1JldHJpZXZlIGNhY2hlZCBkYXRhXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oc3RvcmFnZUtleSk7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ldmVudERhdGEgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IHV1aWQgPSB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0odXVpZEtleSk7XG4gICAgICAgICAgICAgICAgaWYgKHV1aWQpIHRoaXMuYW5vbklkID0gdXVpZDtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICB3YXJuT25jZSgnVW5hYmxlIHRvIHJlYWQgZnJvbSBMb2NhbFN0b3JhZ2UnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNhdmVFdmVudERhdGEoKSB7XG4gICAgICAgIGNvbnN0IGlzTG9jYWxTdG9yYWdlQXZhaWxhYmxlID0gc3RvcmFnZUF2YWlsYWJsZSgnbG9jYWxTdG9yYWdlJyk7XG4gICAgICAgIGNvbnN0IHN0b3JhZ2VLZXkgPSBgJHt0ZWxlbUV2ZW50S2V5fToke2NvbmZpZy5BQ0NFU1NfVE9LRU4gfHwgJyd9YDtcbiAgICAgICAgY29uc3QgdXVpZEtleSA9IGAke3RlbGVtRXZlbnRLZXl9LnV1aWQ6JHtjb25maWcuQUNDRVNTX1RPS0VOIHx8ICcnfWA7XG4gICAgICAgIGlmIChpc0xvY2FsU3RvcmFnZUF2YWlsYWJsZSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0odXVpZEtleSwgdGhpcy5hbm9uSWQpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmV2ZW50RGF0YS5sYXN0U3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oc3RvcmFnZUtleSwgSlNPTi5zdHJpbmdpZnkodGhpcy5ldmVudERhdGEpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgd2Fybk9uY2UoJ1VuYWJsZSB0byB3cml0ZSB0byBMb2NhbFN0b3JhZ2UnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgcHJvY2Vzc1JlcXVlc3RzKCkge31cblxuICAgIC8qXG4gICAgKiBJZiBhbnkgZXZlbnQgZGF0YSBzaG91bGQgYmUgcGVyc2lzdGVkIGFmdGVyIHRoZSBQT1NUIHJlcXVlc3QsIHRoZSBjYWxsYmFjayBzaG91bGQgbW9kaWZ5IGV2ZW50RGF0YWBcbiAgICAqIHRvIHRoZSB2YWx1ZXMgdGhhdCBzaG91bGQgYmUgc2F2ZWQuIEZvciB0aGlzIHJlYXNvbiwgdGhlIGNhbGxiYWNrIHNob3VsZCBiZSBpbnZva2VkIHByaW9yIHRvIHRoZSBjYWxsXG4gICAgKiB0byBUZWxlbWV0cnlFdmVudCNzYXZlRGF0YVxuICAgICovXG4gICAgcG9zdEV2ZW50KHRpbWVzdGFtcDogbnVtYmVyLCBhZGRpdGlvbmFsUGF5bG9hZDoge1tzdHJpbmddOiBhbnl9LCBjYWxsYmFjazogKGVycjogP0Vycm9yKSA9PiB2b2lkKSB7XG4gICAgICAgIGNvbnN0IGV2ZW50c1VybE9iamVjdDogVXJsT2JqZWN0ID0gcGFyc2VVcmwoY29uZmlnLkVWRU5UU19VUkwpO1xuICAgICAgICBldmVudHNVcmxPYmplY3QucGFyYW1zLnB1c2goYGFjY2Vzc190b2tlbj0ke2NvbmZpZy5BQ0NFU1NfVE9LRU4gfHwgJyd9YCk7XG4gICAgICAgIGNvbnN0IHBheWxvYWQ6IE9iamVjdCA9IHtcbiAgICAgICAgICAgIGV2ZW50OiB0aGlzLnR5cGUsXG4gICAgICAgICAgICBjcmVhdGVkOiBuZXcgRGF0ZSh0aW1lc3RhbXApLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICBzZGtJZGVudGlmaWVyOiAnbWFwYm94LWdsLWpzJyxcbiAgICAgICAgICAgIHNka1ZlcnNpb246IHZlcnNpb24sXG4gICAgICAgICAgICB1c2VySWQ6IHRoaXMuYW5vbklkXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgZmluYWxQYXlsb2FkID0gYWRkaXRpb25hbFBheWxvYWQgPyBleHRlbmQocGF5bG9hZCwgYWRkaXRpb25hbFBheWxvYWQpIDogcGF5bG9hZDtcbiAgICAgICAgY29uc3QgcmVxdWVzdDogUmVxdWVzdFBhcmFtZXRlcnMgPSB7XG4gICAgICAgICAgICB1cmw6IGZvcm1hdFVybChldmVudHNVcmxPYmplY3QpLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAndGV4dC9wbGFpbicgLy9Ta2lwIHRoZSBwcmUtZmxpZ2h0IE9QVElPTlMgcmVxdWVzdFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KFtmaW5hbFBheWxvYWRdKVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMucGVuZGluZ1JlcXVlc3QgPSBwb3N0RGF0YShyZXF1ZXN0LCAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGVuZGluZ1JlcXVlc3QgPSBudWxsO1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyb3IpO1xuICAgICAgICAgICAgdGhpcy5zYXZlRXZlbnREYXRhKCk7XG4gICAgICAgICAgICB0aGlzLnByb2Nlc3NSZXF1ZXN0cygpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBxdWV1ZVJlcXVlc3QoZXZlbnQ6IG51bWJlciB8IHtpZDogbnVtYmVyLCB0aW1lc3RhbXA6IG51bWJlcn0pIHtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKGV2ZW50KTtcbiAgICAgICAgdGhpcy5wcm9jZXNzUmVxdWVzdHMoKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBNYXBMb2FkRXZlbnQgZXh0ZW5kcyBUZWxlbWV0cnlFdmVudCB7XG4gICAgK3N1Y2Nlc3M6IHtbbnVtYmVyXTogYm9vbGVhbn07XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoJ21hcC5sb2FkJyk7XG4gICAgICAgIHRoaXMuc3VjY2VzcyA9IHt9O1xuICAgIH1cblxuICAgIHBvc3RNYXBMb2FkRXZlbnQodGlsZVVybHM6IEFycmF5PHN0cmluZz4sIG1hcElkOiBudW1iZXIpIHtcbiAgICAgICAgLy9FbmFibGVkIG9ubHkgd2hlbiBNYXBib3ggQWNjZXNzIFRva2VuIGlzIHNldCBhbmQgYSBzb3VyY2UgdXNlc1xuICAgICAgICAvLyBtYXBib3ggdGlsZXMuXG4gICAgICAgIGlmIChjb25maWcuQUNDRVNTX1RPS0VOICYmXG4gICAgICAgICAgICBBcnJheS5pc0FycmF5KHRpbGVVcmxzKSAmJlxuICAgICAgICAgICAgdGlsZVVybHMuc29tZSh1cmwgPT4gaXNNYXBib3hIVFRQVVJMKHVybCkpKSB7XG4gICAgICAgICAgICB0aGlzLnF1ZXVlUmVxdWVzdCh7aWQ6IG1hcElkLCB0aW1lc3RhbXA6IERhdGUubm93KCl9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb2Nlc3NSZXF1ZXN0cygpIHtcbiAgICAgICAgaWYgKHRoaXMucGVuZGluZ1JlcXVlc3QgfHwgdGhpcy5xdWV1ZS5sZW5ndGggPT09IDApIHJldHVybjtcbiAgICAgICAgY29uc3Qge2lkLCB0aW1lc3RhbXB9ID0gdGhpcy5xdWV1ZS5zaGlmdCgpO1xuXG4gICAgICAgIC8vIE9ubHkgb25lIGxvYWQgZXZlbnQgc2hvdWxkIGZpcmUgcGVyIG1hcFxuICAgICAgICBpZiAoaWQgJiYgdGhpcy5zdWNjZXNzW2lkXSkgcmV0dXJuO1xuXG4gICAgICAgIGlmICghdGhpcy5hbm9uSWQpIHtcbiAgICAgICAgICAgIHRoaXMuZmV0Y2hFdmVudERhdGEoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdmFsaWRhdGVVdWlkKHRoaXMuYW5vbklkKSkge1xuICAgICAgICAgICAgdGhpcy5hbm9uSWQgPSB1dWlkKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnBvc3RFdmVudCh0aW1lc3RhbXAsIHt9LCAoZXJyKSA9PiB7XG4gICAgICAgICAgICBpZiAoIWVycikge1xuICAgICAgICAgICAgICAgIGlmIChpZCkgdGhpcy5zdWNjZXNzW2lkXSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuXG5leHBvcnQgY2xhc3MgVHVybnN0aWxlRXZlbnQgZXh0ZW5kcyBUZWxlbWV0cnlFdmVudCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCdhcHBVc2VyVHVybnN0aWxlJyk7XG4gICAgfVxuXG4gICAgcG9zdFR1cm5zdGlsZUV2ZW50KHRpbGVVcmxzOiBBcnJheTxzdHJpbmc+KSB7XG4gICAgICAgIC8vRW5hYmxlZCBvbmx5IHdoZW4gTWFwYm94IEFjY2VzcyBUb2tlbiBpcyBzZXQgYW5kIGEgc291cmNlIHVzZXNcbiAgICAgICAgLy8gbWFwYm94IHRpbGVzLlxuICAgICAgICBpZiAoY29uZmlnLkFDQ0VTU19UT0tFTiAmJlxuICAgICAgICAgICAgQXJyYXkuaXNBcnJheSh0aWxlVXJscykgJiZcbiAgICAgICAgICAgIHRpbGVVcmxzLnNvbWUodXJsID0+IGlzTWFwYm94SFRUUFVSTCh1cmwpKSkge1xuICAgICAgICAgICAgdGhpcy5xdWV1ZVJlcXVlc3QoRGF0ZS5ub3coKSk7XG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIHByb2Nlc3NSZXF1ZXN0cygpIHtcbiAgICAgICAgaWYgKHRoaXMucGVuZGluZ1JlcXVlc3QgfHwgdGhpcy5xdWV1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBkdWVGb3JFdmVudCA9IHRoaXMuZXZlbnREYXRhLmFjY2Vzc1Rva2VuID8gKHRoaXMuZXZlbnREYXRhLmFjY2Vzc1Rva2VuICE9PSBjb25maWcuQUNDRVNTX1RPS0VOKSA6IGZhbHNlO1xuICAgICAgICAvL1Jlc2V0IGV2ZW50IGRhdGEgY2FjaGUgaWYgdGhlIGFjY2VzcyB0b2tlbiBjaGFuZ2VkLlxuICAgICAgICBpZiAoZHVlRm9yRXZlbnQpIHtcbiAgICAgICAgICAgIHRoaXMuYW5vbklkID0gdGhpcy5ldmVudERhdGEubGFzdFN1Y2Nlc3MgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5hbm9uSWQgfHwgIXRoaXMuZXZlbnREYXRhLmxhc3RTdWNjZXNzKSB7XG4gICAgICAgICAgICAvL1JldHJpZXZlIGNhY2hlZCBkYXRhXG4gICAgICAgICAgICB0aGlzLmZldGNoRXZlbnREYXRhKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXZhbGlkYXRlVXVpZCh0aGlzLmFub25JZCkpIHtcbiAgICAgICAgICAgIHRoaXMuYW5vbklkID0gdXVpZCgpO1xuICAgICAgICAgICAgZHVlRm9yRXZlbnQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbmV4dFVwZGF0ZSA9IHRoaXMucXVldWUuc2hpZnQoKTtcbiAgICAgICAgLy8gUmVjb3JkIHR1cm5zdGlsZSBldmVudCBvbmNlIHBlciBjYWxlbmRhciBkYXkuXG4gICAgICAgIGlmICh0aGlzLmV2ZW50RGF0YS5sYXN0U3VjY2Vzcykge1xuICAgICAgICAgICAgY29uc3QgbGFzdFVwZGF0ZSA9IG5ldyBEYXRlKHRoaXMuZXZlbnREYXRhLmxhc3RTdWNjZXNzKTtcbiAgICAgICAgICAgIGNvbnN0IG5leHREYXRlID0gbmV3IERhdGUobmV4dFVwZGF0ZSk7XG4gICAgICAgICAgICBjb25zdCBkYXlzRWxhcHNlZCA9IChuZXh0VXBkYXRlIC0gdGhpcy5ldmVudERhdGEubGFzdFN1Y2Nlc3MpIC8gKDI0ICogNjAgKiA2MCAqIDEwMDApO1xuICAgICAgICAgICAgZHVlRm9yRXZlbnQgPSBkdWVGb3JFdmVudCB8fCBkYXlzRWxhcHNlZCA+PSAxIHx8IGRheXNFbGFwc2VkIDwgLTEgfHwgbGFzdFVwZGF0ZS5nZXREYXRlKCkgIT09IG5leHREYXRlLmdldERhdGUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGR1ZUZvckV2ZW50ID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghZHVlRm9yRXZlbnQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnByb2Nlc3NSZXF1ZXN0cygpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wb3N0RXZlbnQobmV4dFVwZGF0ZSwge1wiZW5hYmxlZC50ZWxlbWV0cnlcIjogZmFsc2V9LCAoZXJyKSA9PiB7XG4gICAgICAgICAgICBpZiAoIWVycikge1xuICAgICAgICAgICAgICAgIHRoaXMuZXZlbnREYXRhLmxhc3RTdWNjZXNzID0gbmV4dFVwZGF0ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmV2ZW50RGF0YS5hY2Nlc3NUb2tlbiA9IGNvbmZpZy5BQ0NFU1NfVE9LRU47XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuY29uc3QgdHVybnN0aWxlRXZlbnRfID0gbmV3IFR1cm5zdGlsZUV2ZW50KCk7XG5leHBvcnQgY29uc3QgcG9zdFR1cm5zdGlsZUV2ZW50ID0gdHVybnN0aWxlRXZlbnRfLnBvc3RUdXJuc3RpbGVFdmVudC5iaW5kKHR1cm5zdGlsZUV2ZW50Xyk7XG5cbmNvbnN0IG1hcExvYWRFdmVudF8gPSBuZXcgTWFwTG9hZEV2ZW50KCk7XG5leHBvcnQgY29uc3QgcG9zdE1hcExvYWRFdmVudCA9IG1hcExvYWRFdmVudF8ucG9zdE1hcExvYWRFdmVudC5iaW5kKG1hcExvYWRFdmVudF8pO1xuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHdpbmRvdyBmcm9tICcuL3dpbmRvdyc7XG5pbXBvcnQgeyBleHRlbmQgfSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHsgaXNNYXBib3hIVFRQVVJMIH0gZnJvbSAnLi9tYXBib3gnO1xuaW1wb3J0IGNvbmZpZyBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5cbmltcG9ydCB0eXBlIHsgQ2FsbGJhY2sgfSBmcm9tICcuLi90eXBlcy9jYWxsYmFjayc7XG5pbXBvcnQgdHlwZSB7IENhbmNlbGFibGUgfSBmcm9tICcuLi90eXBlcy9jYW5jZWxhYmxlJztcblxuLyoqXG4gKiBUaGUgdHlwZSBvZiBhIHJlc291cmNlLlxuICogQHByaXZhdGVcbiAqIEByZWFkb25seVxuICogQGVudW0ge3N0cmluZ31cbiAqL1xuY29uc3QgUmVzb3VyY2VUeXBlID0ge1xuICAgIFVua25vd246ICdVbmtub3duJyxcbiAgICBTdHlsZTogJ1N0eWxlJyxcbiAgICBTb3VyY2U6ICdTb3VyY2UnLFxuICAgIFRpbGU6ICdUaWxlJyxcbiAgICBHbHlwaHM6ICdHbHlwaHMnLFxuICAgIFNwcml0ZUltYWdlOiAnU3ByaXRlSW1hZ2UnLFxuICAgIFNwcml0ZUpTT046ICdTcHJpdGVKU09OJyxcbiAgICBJbWFnZTogJ0ltYWdlJ1xufTtcbmV4cG9ydCB7IFJlc291cmNlVHlwZSB9O1xuXG5pZiAodHlwZW9mIE9iamVjdC5mcmVlemUgPT0gJ2Z1bmN0aW9uJykge1xuICAgIE9iamVjdC5mcmVlemUoUmVzb3VyY2VUeXBlKTtcbn1cblxuLyoqXG4gKiBBIGBSZXF1ZXN0UGFyYW1ldGVyc2Agb2JqZWN0IHRvIGJlIHJldHVybmVkIGZyb20gTWFwLm9wdGlvbnMudHJhbnNmb3JtUmVxdWVzdCBjYWxsYmFja3MuXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBSZXF1ZXN0UGFyYW1ldGVyc1xuICogQHByb3BlcnR5IHtzdHJpbmd9IHVybCBUaGUgVVJMIHRvIGJlIHJlcXVlc3RlZC5cbiAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBoZWFkZXJzIFRoZSBoZWFkZXJzIHRvIGJlIHNlbnQgd2l0aCB0aGUgcmVxdWVzdC5cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBjcmVkZW50aWFscyBgJ3NhbWUtb3JpZ2luJ3wnaW5jbHVkZSdgIFVzZSAnaW5jbHVkZScgdG8gc2VuZCBjb29raWVzIHdpdGggY3Jvc3Mtb3JpZ2luIHJlcXVlc3RzLlxuICovXG5leHBvcnQgdHlwZSBSZXF1ZXN0UGFyYW1ldGVycyA9IHtcbiAgICB1cmw6IHN0cmluZyxcbiAgICBoZWFkZXJzPzogT2JqZWN0LFxuICAgIG1ldGhvZD86ICdHRVQnIHwgJ1BPU1QnIHwgJ1BVVCcsXG4gICAgYm9keT86IHN0cmluZyxcbiAgICB0eXBlPzogJ3N0cmluZycgfCAnanNvbicgfCAnYXJyYXlCdWZmZXInLFxuICAgIGNyZWRlbnRpYWxzPzogJ3NhbWUtb3JpZ2luJyB8ICdpbmNsdWRlJyxcbiAgICBjb2xsZWN0UmVzb3VyY2VUaW1pbmc/OiBib29sZWFuXG59O1xuXG5leHBvcnQgdHlwZSBSZXNwb25zZUNhbGxiYWNrPFQ+ID0gKGVycm9yOiA/RXJyb3IsIGRhdGE6ID9ULCBjYWNoZUNvbnRyb2w6ID9zdHJpbmcsIGV4cGlyZXM6ID9zdHJpbmcpID0+IHZvaWQ7XG5cbmNsYXNzIEFKQVhFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgICBzdGF0dXM6IG51bWJlcjtcbiAgICB1cmw6IHN0cmluZztcbiAgICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcsIHN0YXR1czogbnVtYmVyLCB1cmw6IHN0cmluZykge1xuICAgICAgICBpZiAoc3RhdHVzID09PSA0MDEgJiYgaXNNYXBib3hIVFRQVVJMKHVybCkpIHtcbiAgICAgICAgICAgIG1lc3NhZ2UgKz0gJzogeW91IG1heSBoYXZlIHByb3ZpZGVkIGFuIGludmFsaWQgTWFwYm94IGFjY2VzcyB0b2tlbi4gU2VlIGh0dHBzOi8vd3d3Lm1hcGJveC5jb20vYXBpLWRvY3VtZW50YXRpb24vI2FjY2Vzcy10b2tlbnMnO1xuICAgICAgICB9XG4gICAgICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgICAgICB0aGlzLnN0YXR1cyA9IHN0YXR1cztcbiAgICAgICAgdGhpcy51cmwgPSB1cmw7XG5cbiAgICAgICAgLy8gd29yayBhcm91bmQgZm9yIGh0dHBzOi8vZ2l0aHViLmNvbS9SaWNoLUhhcnJpcy9idWJsZS9pc3N1ZXMvNDBcbiAgICAgICAgdGhpcy5uYW1lID0gdGhpcy5jb25zdHJ1Y3Rvci5uYW1lO1xuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gYCR7dGhpcy5uYW1lfTogJHt0aGlzLm1lc3NhZ2V9ICgke3RoaXMuc3RhdHVzfSk6ICR7dGhpcy51cmx9YDtcbiAgICB9XG59XG5cbi8vIEVuc3VyZSB0aGF0IHdlJ3JlIHNlbmRpbmcgdGhlIGNvcnJlY3QgcmVmZXJyZXIgZnJvbSBibG9iIFVSTCB3b3JrZXIgYnVuZGxlcy5cbi8vIEZvciBmaWxlcyBsb2FkZWQgZnJvbSB0aGUgbG9jYWwgZmlsZSBzeXN0ZW0sIGBsb2NhdGlvbi5vcmlnaW5gIHdpbGwgYmUgc2V0XG4vLyB0byB0aGUgc3RyaW5nKCEpIFwibnVsbFwiIChGaXJlZm94KSwgb3IgXCJmaWxlOi8vXCIgKENocm9tZSwgU2FmYXJpLCBFZGdlLCBJRSksXG4vLyBhbmQgd2Ugd2lsbCBzZXQgYW4gZW1wdHkgcmVmZXJyZXIuIE90aGVyd2lzZSwgd2UncmUgdXNpbmcgdGhlIGRvY3VtZW50J3MgVVJMLlxuLyogZ2xvYmFsIHNlbGYsIFdvcmtlckdsb2JhbFNjb3BlICovXG5leHBvcnQgY29uc3QgZ2V0UmVmZXJyZXIgPSB0eXBlb2YgV29ya2VyR2xvYmFsU2NvcGUgIT09ICd1bmRlZmluZWQnICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYgaW5zdGFuY2VvZiBXb3JrZXJHbG9iYWxTY29wZSA/XG4gICAgKCkgPT4gc2VsZi53b3JrZXIgJiYgc2VsZi53b3JrZXIucmVmZXJyZXIgOlxuICAgICgpID0+IHtcbiAgICAgICAgY29uc3Qgb3JpZ2luID0gd2luZG93LmxvY2F0aW9uLm9yaWdpbjtcbiAgICAgICAgaWYgKG9yaWdpbiAmJiBvcmlnaW4gIT09ICdudWxsJyAmJiBvcmlnaW4gIT09ICdmaWxlOi8vJykge1xuICAgICAgICAgICAgcmV0dXJuIG9yaWdpbiArIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcbiAgICAgICAgfVxuICAgIH07XG5cbmZ1bmN0aW9uIG1ha2VGZXRjaFJlcXVlc3QocmVxdWVzdFBhcmFtZXRlcnM6IFJlcXVlc3RQYXJhbWV0ZXJzLCBjYWxsYmFjazogUmVzcG9uc2VDYWxsYmFjazxhbnk+KTogQ2FuY2VsYWJsZSB7XG4gICAgY29uc3QgY29udHJvbGxlciA9IG5ldyB3aW5kb3cuQWJvcnRDb250cm9sbGVyKCk7XG4gICAgY29uc3QgcmVxdWVzdCA9IG5ldyB3aW5kb3cuUmVxdWVzdChyZXF1ZXN0UGFyYW1ldGVycy51cmwsIHtcbiAgICAgICAgbWV0aG9kOiByZXF1ZXN0UGFyYW1ldGVycy5tZXRob2QgfHwgJ0dFVCcsXG4gICAgICAgIGJvZHk6IHJlcXVlc3RQYXJhbWV0ZXJzLmJvZHksXG4gICAgICAgIGNyZWRlbnRpYWxzOiByZXF1ZXN0UGFyYW1ldGVycy5jcmVkZW50aWFscyxcbiAgICAgICAgaGVhZGVyczogcmVxdWVzdFBhcmFtZXRlcnMuaGVhZGVycyxcbiAgICAgICAgcmVmZXJyZXI6IGdldFJlZmVycmVyKCksXG4gICAgICAgIHNpZ25hbDogY29udHJvbGxlci5zaWduYWxcbiAgICB9KTtcblxuICAgIGlmIChyZXF1ZXN0UGFyYW1ldGVycy50eXBlID09PSAnanNvbicpIHtcbiAgICAgICAgcmVxdWVzdC5oZWFkZXJzLnNldCgnQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICB9XG5cbiAgICB3aW5kb3cuZmV0Y2gocmVxdWVzdCkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgIGlmIChyZXNwb25zZS5vaykge1xuICAgICAgICAgICAgcmVzcG9uc2VbcmVxdWVzdFBhcmFtZXRlcnMudHlwZSB8fCAndGV4dCddKCkudGhlbihyZXN1bHQgPT4ge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHJlc3VsdCwgcmVzcG9uc2UuaGVhZGVycy5nZXQoJ0NhY2hlLUNvbnRyb2wnKSwgcmVzcG9uc2UuaGVhZGVycy5nZXQoJ0V4cGlyZXMnKSk7XG4gICAgICAgICAgICB9KS5jYXRjaChlcnIgPT4gY2FsbGJhY2sobmV3IEVycm9yKGVyci5tZXNzYWdlKSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FsbGJhY2sobmV3IEFKQVhFcnJvcihyZXNwb25zZS5zdGF0dXNUZXh0LCByZXNwb25zZS5zdGF0dXMsIHJlcXVlc3RQYXJhbWV0ZXJzLnVybCkpO1xuICAgICAgICB9XG4gICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgIGlmIChlcnJvci5jb2RlID09PSAyMCkge1xuICAgICAgICAgICAgLy8gc2lsZW5jZSBleHBlY3RlZCBBYm9ydEVycm9yXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY2FsbGJhY2sobmV3IEVycm9yKGVycm9yLm1lc3NhZ2UpKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB7IGNhbmNlbDogKCkgPT4gY29udHJvbGxlci5hYm9ydCgpIH07XG59XG5cbmZ1bmN0aW9uIG1ha2VYTUxIdHRwUmVxdWVzdChyZXF1ZXN0UGFyYW1ldGVyczogUmVxdWVzdFBhcmFtZXRlcnMsIGNhbGxiYWNrOiBSZXNwb25zZUNhbGxiYWNrPGFueT4pOiBDYW5jZWxhYmxlIHtcbiAgICBjb25zdCB4aHI6IFhNTEh0dHBSZXF1ZXN0ID0gbmV3IHdpbmRvdy5YTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgeGhyLm9wZW4ocmVxdWVzdFBhcmFtZXRlcnMubWV0aG9kIHx8ICdHRVQnLCByZXF1ZXN0UGFyYW1ldGVycy51cmwsIHRydWUpO1xuICAgIGlmIChyZXF1ZXN0UGFyYW1ldGVycy50eXBlID09PSAnYXJyYXlCdWZmZXInKSB7XG4gICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IGsgaW4gcmVxdWVzdFBhcmFtZXRlcnMuaGVhZGVycykge1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihrLCByZXF1ZXN0UGFyYW1ldGVycy5oZWFkZXJzW2tdKTtcbiAgICB9XG4gICAgaWYgKHJlcXVlc3RQYXJhbWV0ZXJzLnR5cGUgPT09ICdqc29uJykge1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICB9XG4gICAgeGhyLndpdGhDcmVkZW50aWFscyA9IHJlcXVlc3RQYXJhbWV0ZXJzLmNyZWRlbnRpYWxzID09PSAnaW5jbHVkZSc7XG4gICAgeGhyLm9uZXJyb3IgPSAoKSA9PiB7XG4gICAgICAgIGNhbGxiYWNrKG5ldyBFcnJvcih4aHIuc3RhdHVzVGV4dCkpO1xuICAgIH07XG4gICAgeGhyLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgaWYgKCgoeGhyLnN0YXR1cyA+PSAyMDAgJiYgeGhyLnN0YXR1cyA8IDMwMCkgfHwgeGhyLnN0YXR1cyA9PT0gMCkgJiYgeGhyLnJlc3BvbnNlICE9PSBudWxsKSB7XG4gICAgICAgICAgICBsZXQgZGF0YTogbWl4ZWQgPSB4aHIucmVzcG9uc2U7XG4gICAgICAgICAgICBpZiAocmVxdWVzdFBhcmFtZXRlcnMudHlwZSA9PT0gJ2pzb24nKSB7XG4gICAgICAgICAgICAgICAgLy8gV2UncmUgbWFudWFsbHkgcGFyc2luZyBKU09OIGhlcmUgdG8gZ2V0IGJldHRlciBlcnJvciBtZXNzYWdlcy5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBkYXRhID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYWxsYmFjayhudWxsLCBkYXRhLCB4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ0NhY2hlLUNvbnRyb2wnKSwgeGhyLmdldFJlc3BvbnNlSGVhZGVyKCdFeHBpcmVzJykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FsbGJhY2sobmV3IEFKQVhFcnJvcih4aHIuc3RhdHVzVGV4dCwgeGhyLnN0YXR1cywgcmVxdWVzdFBhcmFtZXRlcnMudXJsKSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHhoci5zZW5kKHJlcXVlc3RQYXJhbWV0ZXJzLmJvZHkpO1xuICAgIHJldHVybiB7IGNhbmNlbDogKCkgPT4geGhyLmFib3J0KCkgfTtcbn1cblxuY29uc3QgbWFrZVJlcXVlc3QgPSB3aW5kb3cuZmV0Y2ggJiYgd2luZG93LlJlcXVlc3QgJiYgd2luZG93LkFib3J0Q29udHJvbGxlciA/IG1ha2VGZXRjaFJlcXVlc3QgOiBtYWtlWE1MSHR0cFJlcXVlc3Q7XG5cbmV4cG9ydCBjb25zdCBnZXRKU09OID0gZnVuY3Rpb24ocmVxdWVzdFBhcmFtZXRlcnM6IFJlcXVlc3RQYXJhbWV0ZXJzLCBjYWxsYmFjazogUmVzcG9uc2VDYWxsYmFjazxPYmplY3Q+KTogQ2FuY2VsYWJsZSB7XG4gICAgcmV0dXJuIG1ha2VSZXF1ZXN0KGV4dGVuZChyZXF1ZXN0UGFyYW1ldGVycywgeyB0eXBlOiAnanNvbicgfSksIGNhbGxiYWNrKTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRBcnJheUJ1ZmZlciA9IGZ1bmN0aW9uKHJlcXVlc3RQYXJhbWV0ZXJzOiBSZXF1ZXN0UGFyYW1ldGVycywgY2FsbGJhY2s6IFJlc3BvbnNlQ2FsbGJhY2s8QXJyYXlCdWZmZXI+KTogQ2FuY2VsYWJsZSB7XG4gICAgcmV0dXJuIG1ha2VSZXF1ZXN0KGV4dGVuZChyZXF1ZXN0UGFyYW1ldGVycywgeyB0eXBlOiAnYXJyYXlCdWZmZXInIH0pLCBjYWxsYmFjayk7XG59O1xuXG5leHBvcnQgY29uc3QgcG9zdERhdGEgPSBmdW5jdGlvbihyZXF1ZXN0UGFyYW1ldGVyczogUmVxdWVzdFBhcmFtZXRlcnMsIGNhbGxiYWNrOiBSZXNwb25zZUNhbGxiYWNrPHN0cmluZz4pOiBDYW5jZWxhYmxlIHtcbiAgICByZXR1cm4gbWFrZVJlcXVlc3QoZXh0ZW5kKHJlcXVlc3RQYXJhbWV0ZXJzLCB7IG1ldGhvZDogJ1BPU1QnIH0pLCBjYWxsYmFjayk7XG59O1xuXG5mdW5jdGlvbiBzYW1lT3JpZ2luKHVybCkge1xuICAgIGNvbnN0IGE6IEhUTUxBbmNob3JFbGVtZW50ID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICBhLmhyZWYgPSB1cmw7XG4gICAgcmV0dXJuIGEucHJvdG9jb2wgPT09IHdpbmRvdy5kb2N1bWVudC5sb2NhdGlvbi5wcm90b2NvbCAmJiBhLmhvc3QgPT09IHdpbmRvdy5kb2N1bWVudC5sb2NhdGlvbi5ob3N0O1xufVxuXG5jb25zdCB0cmFuc3BhcmVudFBuZ1VybCA9ICdkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUFFQUFBQUJDQVlBQUFBZkZjU0pBQUFBQzBsRVFWUVlWMk5nQUFJQUFBVUFBYXJWeUZFQUFBQUFTVVZPUks1Q1lJST0nO1xuXG5sZXQgaW1hZ2VRdWV1ZSwgbnVtSW1hZ2VSZXF1ZXN0cztcbmV4cG9ydCBjb25zdCByZXNldEltYWdlUmVxdWVzdFF1ZXVlID0gKCkgPT4ge1xuICAgIGltYWdlUXVldWUgPSBbXTtcbiAgICBudW1JbWFnZVJlcXVlc3RzID0gMDtcbn07XG5yZXNldEltYWdlUmVxdWVzdFF1ZXVlKCk7XG5cbmV4cG9ydCBjb25zdCBnZXRJbWFnZSA9IGZ1bmN0aW9uKHJlcXVlc3RQYXJhbWV0ZXJzOiBSZXF1ZXN0UGFyYW1ldGVycywgY2FsbGJhY2s6IENhbGxiYWNrPEhUTUxJbWFnZUVsZW1lbnQ+KTogQ2FuY2VsYWJsZSB7XG4gICAgLy8gbGltaXQgY29uY3VycmVudCBpbWFnZSBsb2FkcyB0byBoZWxwIHdpdGggcmFzdGVyIHNvdXJjZXMgcGVyZm9ybWFuY2Ugb24gYmlnIHNjcmVlbnNcbiAgICBpZiAobnVtSW1hZ2VSZXF1ZXN0cyA+PSBjb25maWcuTUFYX1BBUkFMTEVMX0lNQUdFX1JFUVVFU1RTKSB7XG4gICAgICAgIGNvbnN0IHF1ZXVlZCA9IHtyZXF1ZXN0UGFyYW1ldGVycywgY2FsbGJhY2ssIGNhbmNlbGxlZDogZmFsc2V9O1xuICAgICAgICBpbWFnZVF1ZXVlLnB1c2gocXVldWVkKTtcbiAgICAgICAgcmV0dXJuIHsgY2FuY2VsKCkgeyBxdWV1ZWQuY2FuY2VsbGVkID0gdHJ1ZTsgfSB9O1xuICAgIH1cbiAgICBudW1JbWFnZVJlcXVlc3RzKys7XG5cbiAgICBsZXQgYWR2YW5jZWQgPSBmYWxzZTtcbiAgICBjb25zdCBhZHZhbmNlSW1hZ2VSZXF1ZXN0UXVldWUgPSAoKSA9PiB7XG4gICAgICAgIGlmIChhZHZhbmNlZCkgcmV0dXJuO1xuICAgICAgICBhZHZhbmNlZCA9IHRydWU7XG4gICAgICAgIG51bUltYWdlUmVxdWVzdHMtLTtcbiAgICAgICAgYXNzZXJ0KG51bUltYWdlUmVxdWVzdHMgPj0gMCk7XG4gICAgICAgIHdoaWxlIChpbWFnZVF1ZXVlLmxlbmd0aCAmJiBudW1JbWFnZVJlcXVlc3RzIDwgY29uZmlnLk1BWF9QQVJBTExFTF9JTUFHRV9SRVFVRVNUUykgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgICAgICAgICBjb25zdCB7cmVxdWVzdFBhcmFtZXRlcnMsIGNhbGxiYWNrLCBjYW5jZWxsZWR9ID0gaW1hZ2VRdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgaWYgKCFjYW5jZWxsZWQpIHtcbiAgICAgICAgICAgICAgICBnZXRJbWFnZShyZXF1ZXN0UGFyYW1ldGVycywgY2FsbGJhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIHJlcXVlc3QgdGhlIGltYWdlIHdpdGggWEhSIHRvIHdvcmsgYXJvdW5kIGNhY2hpbmcgaXNzdWVzXG4gICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXBib3gvbWFwYm94LWdsLWpzL2lzc3Vlcy8xNDcwXG4gICAgY29uc3QgcmVxdWVzdCA9IGdldEFycmF5QnVmZmVyKHJlcXVlc3RQYXJhbWV0ZXJzLCAoZXJyOiA/RXJyb3IsIGRhdGE6ID9BcnJheUJ1ZmZlciwgY2FjaGVDb250cm9sOiA/c3RyaW5nLCBleHBpcmVzOiA/c3RyaW5nKSA9PiB7XG5cbiAgICAgICAgYWR2YW5jZUltYWdlUmVxdWVzdFF1ZXVlKCk7XG5cbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgfSBlbHNlIGlmIChkYXRhKSB7XG4gICAgICAgICAgICBjb25zdCBpbWc6IEhUTUxJbWFnZUVsZW1lbnQgPSBuZXcgd2luZG93LkltYWdlKCk7XG4gICAgICAgICAgICBjb25zdCBVUkwgPSB3aW5kb3cuVVJMIHx8IHdpbmRvdy53ZWJraXRVUkw7XG4gICAgICAgICAgICBpbWcub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIGltZyk7XG4gICAgICAgICAgICAgICAgVVJMLnJldm9rZU9iamVjdFVSTChpbWcuc3JjKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpbWcub25lcnJvciA9ICgpID0+IGNhbGxiYWNrKG5ldyBFcnJvcignQ291bGQgbm90IGxvYWQgaW1hZ2UuIFBsZWFzZSBtYWtlIHN1cmUgdG8gdXNlIGEgc3VwcG9ydGVkIGltYWdlIHR5cGUgc3VjaCBhcyBQTkcgb3IgSlBFRy4gTm90ZSB0aGF0IFNWR3MgYXJlIG5vdCBzdXBwb3J0ZWQuJykpO1xuICAgICAgICAgICAgY29uc3QgYmxvYjogQmxvYiA9IG5ldyB3aW5kb3cuQmxvYihbbmV3IFVpbnQ4QXJyYXkoZGF0YSldLCB7IHR5cGU6ICdpbWFnZS9wbmcnIH0pO1xuICAgICAgICAgICAgKGltZzogYW55KS5jYWNoZUNvbnRyb2wgPSBjYWNoZUNvbnRyb2w7XG4gICAgICAgICAgICAoaW1nOiBhbnkpLmV4cGlyZXMgPSBleHBpcmVzO1xuICAgICAgICAgICAgaW1nLnNyYyA9IGRhdGEuYnl0ZUxlbmd0aCA/IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYikgOiB0cmFuc3BhcmVudFBuZ1VybDtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgY2FuY2VsOiAoKSA9PiB7XG4gICAgICAgICAgICByZXF1ZXN0LmNhbmNlbCgpO1xuICAgICAgICAgICAgYWR2YW5jZUltYWdlUmVxdWVzdFF1ZXVlKCk7XG4gICAgICAgIH1cbiAgICB9O1xufTtcblxuZXhwb3J0IGNvbnN0IGdldFZpZGVvID0gZnVuY3Rpb24odXJsczogQXJyYXk8c3RyaW5nPiwgY2FsbGJhY2s6IENhbGxiYWNrPEhUTUxWaWRlb0VsZW1lbnQ+KTogQ2FuY2VsYWJsZSB7XG4gICAgY29uc3QgdmlkZW86IEhUTUxWaWRlb0VsZW1lbnQgPSB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndmlkZW8nKTtcbiAgICB2aWRlby5tdXRlZCA9IHRydWU7XG4gICAgdmlkZW8ub25sb2Fkc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgdmlkZW8pO1xuICAgIH07XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB1cmxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHM6IEhUTUxTb3VyY2VFbGVtZW50ID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NvdXJjZScpO1xuICAgICAgICBpZiAoIXNhbWVPcmlnaW4odXJsc1tpXSkpIHtcbiAgICAgICAgICAgIHZpZGVvLmNyb3NzT3JpZ2luID0gJ0Fub255bW91cyc7XG4gICAgICAgIH1cbiAgICAgICAgcy5zcmMgPSB1cmxzW2ldO1xuICAgICAgICB2aWRlby5hcHBlbmRDaGlsZChzKTtcbiAgICB9XG4gICAgcmV0dXJuIHsgY2FuY2VsOiAoKSA9PiB7fSB9O1xufTtcbiIsIi8vIEBmbG93XG5cbmltcG9ydCB7IGV4dGVuZCB9IGZyb20gJy4vdXRpbCc7XG5cbnR5cGUgTGlzdGVuZXIgPSAoT2JqZWN0KSA9PiBhbnk7XG50eXBlIExpc3RlbmVycyA9IHsgW3N0cmluZ106IEFycmF5PExpc3RlbmVyPiB9O1xuXG5mdW5jdGlvbiBfYWRkRXZlbnRMaXN0ZW5lcih0eXBlOiBzdHJpbmcsIGxpc3RlbmVyOiBMaXN0ZW5lciwgbGlzdGVuZXJMaXN0OiBMaXN0ZW5lcnMpIHtcbiAgICBjb25zdCBsaXN0ZW5lckV4aXN0cyA9IGxpc3RlbmVyTGlzdFt0eXBlXSAmJiBsaXN0ZW5lckxpc3RbdHlwZV0uaW5kZXhPZihsaXN0ZW5lcikgIT09IC0xO1xuICAgIGlmICghbGlzdGVuZXJFeGlzdHMpIHtcbiAgICAgICAgbGlzdGVuZXJMaXN0W3R5cGVdID0gbGlzdGVuZXJMaXN0W3R5cGVdIHx8IFtdO1xuICAgICAgICBsaXN0ZW5lckxpc3RbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBfcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlOiBzdHJpbmcsIGxpc3RlbmVyOiBMaXN0ZW5lciwgbGlzdGVuZXJMaXN0OiBMaXN0ZW5lcnMpIHtcbiAgICBpZiAobGlzdGVuZXJMaXN0ICYmIGxpc3RlbmVyTGlzdFt0eXBlXSkge1xuICAgICAgICBjb25zdCBpbmRleCA9IGxpc3RlbmVyTGlzdFt0eXBlXS5pbmRleE9mKGxpc3RlbmVyKTtcbiAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgbGlzdGVuZXJMaXN0W3R5cGVdLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBFdmVudCB7XG4gICAgK3R5cGU6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKHR5cGU6IHN0cmluZywgZGF0YTogT2JqZWN0ID0ge30pIHtcbiAgICAgICAgZXh0ZW5kKHRoaXMsIGRhdGEpO1xuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEVycm9yRXZlbnQgZXh0ZW5kcyBFdmVudCB7XG4gICAgZXJyb3I6IEVycm9yO1xuXG4gICAgY29uc3RydWN0b3IoZXJyb3I6IEVycm9yLCBkYXRhOiBPYmplY3QgPSB7fSkge1xuICAgICAgICBzdXBlcignZXJyb3InLCBleHRlbmQoe2Vycm9yfSwgZGF0YSkpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBNZXRob2RzIG1peGVkIGluIHRvIG90aGVyIGNsYXNzZXMgZm9yIGV2ZW50IGNhcGFiaWxpdGllcy5cbiAqXG4gKiBAbWl4aW4gRXZlbnRlZFxuICovXG5leHBvcnQgY2xhc3MgRXZlbnRlZCB7XG4gICAgX2xpc3RlbmVyczogTGlzdGVuZXJzO1xuICAgIF9vbmVUaW1lTGlzdGVuZXJzOiBMaXN0ZW5lcnM7XG4gICAgX2V2ZW50ZWRQYXJlbnQ6ID9FdmVudGVkO1xuICAgIF9ldmVudGVkUGFyZW50RGF0YTogPyhPYmplY3QgfCAoKSA9PiBPYmplY3QpO1xuXG4gICAgLyoqXG4gICAgICogQWRkcyBhIGxpc3RlbmVyIHRvIGEgc3BlY2lmaWVkIGV2ZW50IHR5cGUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBUaGUgZXZlbnQgdHlwZSB0byBhZGQgYSBsaXN0ZW4gZm9yLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyIFRoZSBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiB0aGUgZXZlbnQgaXMgZmlyZWQuXG4gICAgICogICBUaGUgbGlzdGVuZXIgZnVuY3Rpb24gaXMgY2FsbGVkIHdpdGggdGhlIGRhdGEgb2JqZWN0IHBhc3NlZCB0byBgZmlyZWAsXG4gICAgICogICBleHRlbmRlZCB3aXRoIGB0YXJnZXRgIGFuZCBgdHlwZWAgcHJvcGVydGllcy5cbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBgdGhpc2BcbiAgICAgKi9cbiAgICBvbih0eXBlOiAqLCBsaXN0ZW5lcjogTGlzdGVuZXIpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5fbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzIHx8IHt9O1xuICAgICAgICBfYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgdGhpcy5fbGlzdGVuZXJzKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGEgcHJldmlvdXNseSByZWdpc3RlcmVkIGV2ZW50IGxpc3RlbmVyLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgVGhlIGV2ZW50IHR5cGUgdG8gcmVtb3ZlIGxpc3RlbmVycyBmb3IuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXIgVGhlIGxpc3RlbmVyIGZ1bmN0aW9uIHRvIHJlbW92ZS5cbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBgdGhpc2BcbiAgICAgKi9cbiAgICBvZmYodHlwZTogKiwgbGlzdGVuZXI6IExpc3RlbmVyKSB7XG4gICAgICAgIF9yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCB0aGlzLl9saXN0ZW5lcnMpO1xuICAgICAgICBfcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgdGhpcy5fb25lVGltZUxpc3RlbmVycyk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBhIGxpc3RlbmVyIHRoYXQgd2lsbCBiZSBjYWxsZWQgb25seSBvbmNlIHRvIGEgc3BlY2lmaWVkIGV2ZW50IHR5cGUuXG4gICAgICpcbiAgICAgKiBUaGUgbGlzdGVuZXIgd2lsbCBiZSBjYWxsZWQgZmlyc3QgdGltZSB0aGUgZXZlbnQgZmlyZXMgYWZ0ZXIgdGhlIGxpc3RlbmVyIGlzIHJlZ2lzdGVyZWQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBUaGUgZXZlbnQgdHlwZSB0byBsaXN0ZW4gZm9yLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyIFRoZSBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiB0aGUgZXZlbnQgaXMgZmlyZWQgdGhlIGZpcnN0IHRpbWUuXG4gICAgICogQHJldHVybnMge09iamVjdH0gYHRoaXNgXG4gICAgICovXG4gICAgb25jZSh0eXBlOiBzdHJpbmcsIGxpc3RlbmVyOiBMaXN0ZW5lcikge1xuICAgICAgICB0aGlzLl9vbmVUaW1lTGlzdGVuZXJzID0gdGhpcy5fb25lVGltZUxpc3RlbmVycyB8fCB7fTtcbiAgICAgICAgX2FkZEV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIHRoaXMuX29uZVRpbWVMaXN0ZW5lcnMpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZpcmUoZXZlbnQ6IEV2ZW50LCBwcm9wZXJ0aWVzPzogT2JqZWN0KSB7XG4gICAgICAgIC8vIENvbXBhdGliaWxpdHkgd2l0aCAodHlwZTogc3RyaW5nLCBwcm9wZXJ0aWVzOiBPYmplY3QpIHNpZ25hdHVyZSBmcm9tIHByZXZpb3VzIHZlcnNpb25zLlxuICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL21hcGJveC9tYXBib3gtZ2wtanMvaXNzdWVzLzY1MjIsXG4gICAgICAgIC8vICAgICBodHRwczovL2dpdGh1Yi5jb20vbWFwYm94L21hcGJveC1nbC1kcmF3L2lzc3Vlcy83NjZcbiAgICAgICAgaWYgKHR5cGVvZiBldmVudCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGV2ZW50ID0gbmV3IEV2ZW50KGV2ZW50LCBwcm9wZXJ0aWVzIHx8IHt9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHR5cGUgPSBldmVudC50eXBlO1xuXG4gICAgICAgIGlmICh0aGlzLmxpc3RlbnModHlwZSkpIHtcbiAgICAgICAgICAgIChldmVudDogYW55KS50YXJnZXQgPSB0aGlzO1xuXG4gICAgICAgICAgICAvLyBtYWtlIHN1cmUgYWRkaW5nIG9yIHJlbW92aW5nIGxpc3RlbmVycyBpbnNpZGUgb3RoZXIgbGlzdGVuZXJzIHdvbid0IGNhdXNlIGFuIGluZmluaXRlIGxvb3BcbiAgICAgICAgICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycyAmJiB0aGlzLl9saXN0ZW5lcnNbdHlwZV0gPyB0aGlzLl9saXN0ZW5lcnNbdHlwZV0uc2xpY2UoKSA6IFtdO1xuICAgICAgICAgICAgZm9yIChjb25zdCBsaXN0ZW5lciBvZiBsaXN0ZW5lcnMpIHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lci5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3Qgb25lVGltZUxpc3RlbmVycyA9IHRoaXMuX29uZVRpbWVMaXN0ZW5lcnMgJiYgdGhpcy5fb25lVGltZUxpc3RlbmVyc1t0eXBlXSA/IHRoaXMuX29uZVRpbWVMaXN0ZW5lcnNbdHlwZV0uc2xpY2UoKSA6IFtdO1xuICAgICAgICAgICAgZm9yIChjb25zdCBsaXN0ZW5lciBvZiBvbmVUaW1lTGlzdGVuZXJzKSB7XG4gICAgICAgICAgICAgICAgX3JlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIHRoaXMuX29uZVRpbWVMaXN0ZW5lcnMpO1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyLmNhbGwodGhpcywgZXZlbnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBwYXJlbnQgPSB0aGlzLl9ldmVudGVkUGFyZW50O1xuICAgICAgICAgICAgaWYgKHBhcmVudCkge1xuICAgICAgICAgICAgICAgIGV4dGVuZChcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQsXG4gICAgICAgICAgICAgICAgICAgIHR5cGVvZiB0aGlzLl9ldmVudGVkUGFyZW50RGF0YSA9PT0gJ2Z1bmN0aW9uJyA/IHRoaXMuX2V2ZW50ZWRQYXJlbnREYXRhKCkgOiB0aGlzLl9ldmVudGVkUGFyZW50RGF0YVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgcGFyZW50LmZpcmUoZXZlbnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIC8vIFRvIGVuc3VyZSB0aGF0IG5vIGVycm9yIGV2ZW50cyBhcmUgZHJvcHBlZCwgcHJpbnQgdGhlbSB0byB0aGVcbiAgICAgICAgLy8gY29uc29sZSBpZiB0aGV5IGhhdmUgbm8gbGlzdGVuZXJzLlxuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50IGluc3RhbmNlb2YgRXJyb3JFdmVudCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihldmVudC5lcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgdHJ1ZSBpZiB0aGlzIGluc3RhbmNlIG9mIEV2ZW50ZWQgb3IgYW55IGZvcndhcmRlZWQgaW5zdGFuY2VzIG9mIEV2ZW50ZWQgaGF2ZSBhIGxpc3RlbmVyIGZvciB0aGUgc3BlY2lmaWVkIHR5cGUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBUaGUgZXZlbnQgdHlwZVxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBgdHJ1ZWAgaWYgdGhlcmUgaXMgYXQgbGVhc3Qgb25lIHJlZ2lzdGVyZWQgbGlzdGVuZXIgZm9yIHNwZWNpZmllZCBldmVudCB0eXBlLCBgZmFsc2VgIG90aGVyd2lzZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgbGlzdGVucyh0eXBlOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICh0aGlzLl9saXN0ZW5lcnMgJiYgdGhpcy5fbGlzdGVuZXJzW3R5cGVdICYmIHRoaXMuX2xpc3RlbmVyc1t0eXBlXS5sZW5ndGggPiAwKSB8fFxuICAgICAgICAgICAgKHRoaXMuX29uZVRpbWVMaXN0ZW5lcnMgJiYgdGhpcy5fb25lVGltZUxpc3RlbmVyc1t0eXBlXSAmJiB0aGlzLl9vbmVUaW1lTGlzdGVuZXJzW3R5cGVdLmxlbmd0aCA+IDApIHx8XG4gICAgICAgICAgICAodGhpcy5fZXZlbnRlZFBhcmVudCAmJiB0aGlzLl9ldmVudGVkUGFyZW50Lmxpc3RlbnModHlwZSkpXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQnViYmxlIGFsbCBldmVudHMgZmlyZWQgYnkgdGhpcyBpbnN0YW5jZSBvZiBFdmVudGVkIHRvIHRoaXMgcGFyZW50IGluc3RhbmNlIG9mIEV2ZW50ZWQuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IGB0aGlzYFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgc2V0RXZlbnRlZFBhcmVudChwYXJlbnQ6ID9FdmVudGVkLCBkYXRhPzogT2JqZWN0IHwgKCkgPT4gT2JqZWN0KSB7XG4gICAgICAgIHRoaXMuX2V2ZW50ZWRQYXJlbnQgPSBwYXJlbnQ7XG4gICAgICAgIHRoaXMuX2V2ZW50ZWRQYXJlbnREYXRhID0gZGF0YTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59XG4iLCJ2YXIgU3BoZXJpY2FsTWVyY2F0b3IgPSAoZnVuY3Rpb24oKXtcblxuLy8gQ2xvc3VyZXMgaW5jbHVkaW5nIGNvbnN0YW50cyBhbmQgb3RoZXIgcHJlY2FsY3VsYXRlZCB2YWx1ZXMuXG52YXIgY2FjaGUgPSB7fSxcbiAgICBFUFNMTiA9IDEuMGUtMTAsXG4gICAgRDJSID0gTWF0aC5QSSAvIDE4MCxcbiAgICBSMkQgPSAxODAgLyBNYXRoLlBJLFxuICAgIC8vIDkwMDkxMyBwcm9wZXJ0aWVzLlxuICAgIEEgPSA2Mzc4MTM3LjAsXG4gICAgTUFYRVhURU5UID0gMjAwMzc1MDguMzQyNzg5MjQ0O1xuXG5mdW5jdGlvbiBpc0Zsb2F0KG4pe1xuICAgIHJldHVybiBOdW1iZXIobikgPT09IG4gJiYgbiAlIDEgIT09IDA7XG59XG5cbi8vIFNwaGVyaWNhbE1lcmNhdG9yIGNvbnN0cnVjdG9yOiBwcmVjYWNoZXMgY2FsY3VsYXRpb25zXG4vLyBmb3IgZmFzdCB0aWxlIGxvb2t1cHMuXG5mdW5jdGlvbiBTcGhlcmljYWxNZXJjYXRvcihvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdGhpcy5zaXplID0gb3B0aW9ucy5zaXplIHx8IDI1NjtcbiAgICBpZiAoIWNhY2hlW3RoaXMuc2l6ZV0pIHtcbiAgICAgICAgdmFyIHNpemUgPSB0aGlzLnNpemU7XG4gICAgICAgIHZhciBjID0gY2FjaGVbdGhpcy5zaXplXSA9IHt9O1xuICAgICAgICBjLkJjID0gW107XG4gICAgICAgIGMuQ2MgPSBbXTtcbiAgICAgICAgYy56YyA9IFtdO1xuICAgICAgICBjLkFjID0gW107XG4gICAgICAgIGZvciAodmFyIGQgPSAwOyBkIDwgMzA7IGQrKykge1xuICAgICAgICAgICAgYy5CYy5wdXNoKHNpemUgLyAzNjApO1xuICAgICAgICAgICAgYy5DYy5wdXNoKHNpemUgLyAoMiAqIE1hdGguUEkpKTtcbiAgICAgICAgICAgIGMuemMucHVzaChzaXplIC8gMik7XG4gICAgICAgICAgICBjLkFjLnB1c2goc2l6ZSk7XG4gICAgICAgICAgICBzaXplICo9IDI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5CYyA9IGNhY2hlW3RoaXMuc2l6ZV0uQmM7XG4gICAgdGhpcy5DYyA9IGNhY2hlW3RoaXMuc2l6ZV0uQ2M7XG4gICAgdGhpcy56YyA9IGNhY2hlW3RoaXMuc2l6ZV0uemM7XG4gICAgdGhpcy5BYyA9IGNhY2hlW3RoaXMuc2l6ZV0uQWM7XG59O1xuXG4vLyBDb252ZXJ0IGxvbiBsYXQgdG8gc2NyZWVuIHBpeGVsIHZhbHVlXG4vL1xuLy8gLSBgbGxgIHtBcnJheX0gYFtsb24sIGxhdF1gIGFycmF5IG9mIGdlb2dyYXBoaWMgY29vcmRpbmF0ZXMuXG4vLyAtIGB6b29tYCB7TnVtYmVyfSB6b29tIGxldmVsLlxuU3BoZXJpY2FsTWVyY2F0b3IucHJvdG90eXBlLnB4ID0gZnVuY3Rpb24obGwsIHpvb20pIHtcbiAgaWYgKGlzRmxvYXQoem9vbSkpIHtcbiAgICB2YXIgc2l6ZSA9IHRoaXMuc2l6ZSAqIE1hdGgucG93KDIsIHpvb20pO1xuICAgIHZhciBkID0gc2l6ZSAvIDI7XG4gICAgdmFyIGJjID0gKHNpemUgLyAzNjApO1xuICAgIHZhciBjYyA9IChzaXplIC8gKDIgKiBNYXRoLlBJKSk7XG4gICAgdmFyIGFjID0gc2l6ZTtcbiAgICB2YXIgZiA9IE1hdGgubWluKE1hdGgubWF4KE1hdGguc2luKEQyUiAqIGxsWzFdKSwgLTAuOTk5OSksIDAuOTk5OSk7XG4gICAgdmFyIHggPSBkICsgbGxbMF0gKiBiYztcbiAgICB2YXIgeSA9IGQgKyAwLjUgKiBNYXRoLmxvZygoMSArIGYpIC8gKDEgLSBmKSkgKiAtY2M7XG4gICAgKHggPiBhYykgJiYgKHggPSBhYyk7XG4gICAgKHkgPiBhYykgJiYgKHkgPSBhYyk7XG4gICAgLy8oeCA8IDApICYmICh4ID0gMCk7XG4gICAgLy8oeSA8IDApICYmICh5ID0gMCk7XG4gICAgcmV0dXJuIFt4LCB5XTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgZCA9IHRoaXMuemNbem9vbV07XG4gICAgdmFyIGYgPSBNYXRoLm1pbihNYXRoLm1heChNYXRoLnNpbihEMlIgKiBsbFsxXSksIC0wLjk5OTkpLCAwLjk5OTkpO1xuICAgIHZhciB4ID0gTWF0aC5yb3VuZChkICsgbGxbMF0gKiB0aGlzLkJjW3pvb21dKTtcbiAgICB2YXIgeSA9IE1hdGgucm91bmQoZCArIDAuNSAqIE1hdGgubG9nKCgxICsgZikgLyAoMSAtIGYpKSAqICgtdGhpcy5DY1t6b29tXSkpO1xuICAgICh4ID4gdGhpcy5BY1t6b29tXSkgJiYgKHggPSB0aGlzLkFjW3pvb21dKTtcbiAgICAoeSA+IHRoaXMuQWNbem9vbV0pICYmICh5ID0gdGhpcy5BY1t6b29tXSk7XG4gICAgLy8oeCA8IDApICYmICh4ID0gMCk7XG4gICAgLy8oeSA8IDApICYmICh5ID0gMCk7XG4gICAgcmV0dXJuIFt4LCB5XTtcbiAgfVxufTtcblxuLy8gQ29udmVydCBzY3JlZW4gcGl4ZWwgdmFsdWUgdG8gbG9uIGxhdFxuLy9cbi8vIC0gYHB4YCB7QXJyYXl9IGBbeCwgeV1gIGFycmF5IG9mIGdlb2dyYXBoaWMgY29vcmRpbmF0ZXMuXG4vLyAtIGB6b29tYCB7TnVtYmVyfSB6b29tIGxldmVsLlxuU3BoZXJpY2FsTWVyY2F0b3IucHJvdG90eXBlLmxsID0gZnVuY3Rpb24ocHgsIHpvb20pIHtcbiAgaWYgKGlzRmxvYXQoem9vbSkpIHtcbiAgICB2YXIgc2l6ZSA9IHRoaXMuc2l6ZSAqIE1hdGgucG93KDIsIHpvb20pO1xuICAgIHZhciBiYyA9IChzaXplIC8gMzYwKTtcbiAgICB2YXIgY2MgPSAoc2l6ZSAvICgyICogTWF0aC5QSSkpO1xuICAgIHZhciB6YyA9IHNpemUgLyAyO1xuICAgIHZhciBnID0gKHB4WzFdIC0gemMpIC8gLWNjO1xuICAgIHZhciBsb24gPSAocHhbMF0gLSB6YykgLyBiYztcbiAgICB2YXIgbGF0ID0gUjJEICogKDIgKiBNYXRoLmF0YW4oTWF0aC5leHAoZykpIC0gMC41ICogTWF0aC5QSSk7XG4gICAgcmV0dXJuIFtsb24sIGxhdF07XG4gIH0gZWxzZSB7XG4gICAgdmFyIGcgPSAocHhbMV0gLSB0aGlzLnpjW3pvb21dKSAvICgtdGhpcy5DY1t6b29tXSk7XG4gICAgdmFyIGxvbiA9IChweFswXSAtIHRoaXMuemNbem9vbV0pIC8gdGhpcy5CY1t6b29tXTtcbiAgICB2YXIgbGF0ID0gUjJEICogKDIgKiBNYXRoLmF0YW4oTWF0aC5leHAoZykpIC0gMC41ICogTWF0aC5QSSk7XG4gICAgcmV0dXJuIFtsb24sIGxhdF07XG4gIH1cbn07XG5cbi8vIENvbnZlcnQgdGlsZSB4eXogdmFsdWUgdG8gYmJveCBvZiB0aGUgZm9ybSBgW3csIHMsIGUsIG5dYFxuLy9cbi8vIC0gYHhgIHtOdW1iZXJ9IHggKGxvbmdpdHVkZSkgbnVtYmVyLlxuLy8gLSBgeWAge051bWJlcn0geSAobGF0aXR1ZGUpIG51bWJlci5cbi8vIC0gYHpvb21gIHtOdW1iZXJ9IHpvb20uXG4vLyAtIGB0bXNfc3R5bGVgIHtCb29sZWFufSB3aGV0aGVyIHRvIGNvbXB1dGUgdXNpbmcgdG1zLXN0eWxlLlxuLy8gLSBgc3JzYCB7U3RyaW5nfSBwcm9qZWN0aW9uIGZvciByZXN1bHRpbmcgYmJveCAoV0dTODR8OTAwOTEzKS5cbi8vIC0gYHJldHVybmAge0FycmF5fSBiYm94IGFycmF5IG9mIHZhbHVlcyBpbiBmb3JtIGBbdywgcywgZSwgbl1gLlxuU3BoZXJpY2FsTWVyY2F0b3IucHJvdG90eXBlLmJib3ggPSBmdW5jdGlvbih4LCB5LCB6b29tLCB0bXNfc3R5bGUsIHNycykge1xuICAgIC8vIENvbnZlcnQgeHl6IGludG8gYmJveCB3aXRoIHNycyBXR1M4NFxuICAgIGlmICh0bXNfc3R5bGUpIHtcbiAgICAgICAgeSA9IChNYXRoLnBvdygyLCB6b29tKSAtIDEpIC0geTtcbiAgICB9XG4gICAgLy8gVXNlICt5IHRvIG1ha2Ugc3VyZSBpdCdzIGEgbnVtYmVyIHRvIGF2b2lkIGluYWR2ZXJ0ZW50IGNvbmNhdGVuYXRpb24uXG4gICAgdmFyIGxsID0gW3ggKiB0aGlzLnNpemUsICgreSArIDEpICogdGhpcy5zaXplXTsgLy8gbG93ZXIgbGVmdFxuICAgIC8vIFVzZSAreCB0byBtYWtlIHN1cmUgaXQncyBhIG51bWJlciB0byBhdm9pZCBpbmFkdmVydGVudCBjb25jYXRlbmF0aW9uLlxuICAgIHZhciB1ciA9IFsoK3ggKyAxKSAqIHRoaXMuc2l6ZSwgeSAqIHRoaXMuc2l6ZV07IC8vIHVwcGVyIHJpZ2h0XG4gICAgdmFyIGJib3ggPSB0aGlzLmxsKGxsLCB6b29tKS5jb25jYXQodGhpcy5sbCh1ciwgem9vbSkpO1xuXG4gICAgLy8gSWYgd2ViIG1lcmNhdG9yIHJlcXVlc3RlZCByZXByb2plY3QgdG8gOTAwOTEzLlxuICAgIGlmIChzcnMgPT09ICc5MDA5MTMnKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnZlcnQoYmJveCwgJzkwMDkxMycpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBiYm94O1xuICAgIH1cbn07XG5cbi8vIENvbnZlcnQgYmJveCB0byB4eXggYm91bmRzXG4vL1xuLy8gLSBgYmJveGAge051bWJlcn0gYmJveCBpbiB0aGUgZm9ybSBgW3csIHMsIGUsIG5dYC5cbi8vIC0gYHpvb21gIHtOdW1iZXJ9IHpvb20uXG4vLyAtIGB0bXNfc3R5bGVgIHtCb29sZWFufSB3aGV0aGVyIHRvIGNvbXB1dGUgdXNpbmcgdG1zLXN0eWxlLlxuLy8gLSBgc3JzYCB7U3RyaW5nfSBwcm9qZWN0aW9uIG9mIGlucHV0IGJib3ggKFdHUzg0fDkwMDkxMykuXG4vLyAtIGBAcmV0dXJuYCB7T2JqZWN0fSBYWVogYm91bmRzIGNvbnRhaW5pbmcgbWluWCwgbWF4WCwgbWluWSwgbWF4WSBwcm9wZXJ0aWVzLlxuU3BoZXJpY2FsTWVyY2F0b3IucHJvdG90eXBlLnh5eiA9IGZ1bmN0aW9uKGJib3gsIHpvb20sIHRtc19zdHlsZSwgc3JzKSB7XG4gICAgLy8gSWYgd2ViIG1lcmNhdG9yIHByb3ZpZGVkIHJlcHJvamVjdCB0byBXR1M4NC5cbiAgICBpZiAoc3JzID09PSAnOTAwOTEzJykge1xuICAgICAgICBiYm94ID0gdGhpcy5jb252ZXJ0KGJib3gsICdXR1M4NCcpO1xuICAgIH1cblxuICAgIHZhciBsbCA9IFtiYm94WzBdLCBiYm94WzFdXTsgLy8gbG93ZXIgbGVmdFxuICAgIHZhciB1ciA9IFtiYm94WzJdLCBiYm94WzNdXTsgLy8gdXBwZXIgcmlnaHRcbiAgICB2YXIgcHhfbGwgPSB0aGlzLnB4KGxsLCB6b29tKTtcbiAgICB2YXIgcHhfdXIgPSB0aGlzLnB4KHVyLCB6b29tKTtcbiAgICAvLyBZID0gMCBmb3IgWFlaIGlzIHRoZSB0b3AgaGVuY2UgbWluWSB1c2VzIHB4X3VyWzFdLlxuICAgIHZhciB4ID0gWyBNYXRoLmZsb29yKHB4X2xsWzBdIC8gdGhpcy5zaXplKSwgTWF0aC5mbG9vcigocHhfdXJbMF0gLSAxKSAvIHRoaXMuc2l6ZSkgXTtcbiAgICB2YXIgeSA9IFsgTWF0aC5mbG9vcihweF91clsxXSAvIHRoaXMuc2l6ZSksIE1hdGguZmxvb3IoKHB4X2xsWzFdIC0gMSkgLyB0aGlzLnNpemUpIF07XG4gICAgdmFyIGJvdW5kcyA9IHtcbiAgICAgICAgbWluWDogTWF0aC5taW4uYXBwbHkoTWF0aCwgeCkgPCAwID8gMCA6IE1hdGgubWluLmFwcGx5KE1hdGgsIHgpLFxuICAgICAgICBtaW5ZOiBNYXRoLm1pbi5hcHBseShNYXRoLCB5KSA8IDAgPyAwIDogTWF0aC5taW4uYXBwbHkoTWF0aCwgeSksXG4gICAgICAgIG1heFg6IE1hdGgubWF4LmFwcGx5KE1hdGgsIHgpLFxuICAgICAgICBtYXhZOiBNYXRoLm1heC5hcHBseShNYXRoLCB5KVxuICAgIH07XG4gICAgaWYgKHRtc19zdHlsZSkge1xuICAgICAgICB2YXIgdG1zID0ge1xuICAgICAgICAgICAgbWluWTogKE1hdGgucG93KDIsIHpvb20pIC0gMSkgLSBib3VuZHMubWF4WSxcbiAgICAgICAgICAgIG1heFk6IChNYXRoLnBvdygyLCB6b29tKSAtIDEpIC0gYm91bmRzLm1pbllcbiAgICAgICAgfTtcbiAgICAgICAgYm91bmRzLm1pblkgPSB0bXMubWluWTtcbiAgICAgICAgYm91bmRzLm1heFkgPSB0bXMubWF4WTtcbiAgICB9XG4gICAgcmV0dXJuIGJvdW5kcztcbn07XG5cbi8vIENvbnZlcnQgcHJvamVjdGlvbiBvZiBnaXZlbiBiYm94LlxuLy9cbi8vIC0gYGJib3hgIHtOdW1iZXJ9IGJib3ggaW4gdGhlIGZvcm0gYFt3LCBzLCBlLCBuXWAuXG4vLyAtIGB0b2Age1N0cmluZ30gcHJvamVjdGlvbiBvZiBvdXRwdXQgYmJveCAoV0dTODR8OTAwOTEzKS4gSW5wdXQgYmJveFxuLy8gICBhc3N1bWVkIHRvIGJlIHRoZSBcIm90aGVyXCIgcHJvamVjdGlvbi5cbi8vIC0gYEByZXR1cm5gIHtPYmplY3R9IGJib3ggd2l0aCByZXByb2plY3RlZCBjb29yZGluYXRlcy5cblNwaGVyaWNhbE1lcmNhdG9yLnByb3RvdHlwZS5jb252ZXJ0ID0gZnVuY3Rpb24oYmJveCwgdG8pIHtcbiAgICBpZiAodG8gPT09ICc5MDA5MTMnKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZvcndhcmQoYmJveC5zbGljZSgwLCAyKSkuY29uY2F0KHRoaXMuZm9yd2FyZChiYm94LnNsaWNlKDIsNCkpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnZlcnNlKGJib3guc2xpY2UoMCwgMikpLmNvbmNhdCh0aGlzLmludmVyc2UoYmJveC5zbGljZSgyLDQpKSk7XG4gICAgfVxufTtcblxuLy8gQ29udmVydCBsb24vbGF0IHZhbHVlcyB0byA5MDA5MTMgeC95LlxuU3BoZXJpY2FsTWVyY2F0b3IucHJvdG90eXBlLmZvcndhcmQgPSBmdW5jdGlvbihsbCkge1xuICAgIHZhciB4eSA9IFtcbiAgICAgICAgQSAqIGxsWzBdICogRDJSLFxuICAgICAgICBBICogTWF0aC5sb2coTWF0aC50YW4oKE1hdGguUEkqMC4yNSkgKyAoMC41ICogbGxbMV0gKiBEMlIpKSlcbiAgICBdO1xuICAgIC8vIGlmIHh5IHZhbHVlIGlzIGJleW9uZCBtYXhleHRlbnQgKGUuZy4gcG9sZXMpLCByZXR1cm4gbWF4ZXh0ZW50LlxuICAgICh4eVswXSA+IE1BWEVYVEVOVCkgJiYgKHh5WzBdID0gTUFYRVhURU5UKTtcbiAgICAoeHlbMF0gPCAtTUFYRVhURU5UKSAmJiAoeHlbMF0gPSAtTUFYRVhURU5UKTtcbiAgICAoeHlbMV0gPiBNQVhFWFRFTlQpICYmICh4eVsxXSA9IE1BWEVYVEVOVCk7XG4gICAgKHh5WzFdIDwgLU1BWEVYVEVOVCkgJiYgKHh5WzFdID0gLU1BWEVYVEVOVCk7XG4gICAgcmV0dXJuIHh5O1xufTtcblxuLy8gQ29udmVydCA5MDA5MTMgeC95IHZhbHVlcyB0byBsb24vbGF0LlxuU3BoZXJpY2FsTWVyY2F0b3IucHJvdG90eXBlLmludmVyc2UgPSBmdW5jdGlvbih4eSkge1xuICAgIHJldHVybiBbXG4gICAgICAgICh4eVswXSAqIFIyRCAvIEEpLFxuICAgICAgICAoKE1hdGguUEkqMC41KSAtIDIuMCAqIE1hdGguYXRhbihNYXRoLmV4cCgteHlbMV0gLyBBKSkpICogUjJEXG4gICAgXTtcbn07XG5cbnJldHVybiBTcGhlcmljYWxNZXJjYXRvcjtcblxufSkoKTtcblxuaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IFNwaGVyaWNhbE1lcmNhdG9yO1xufVxuIiwiaW1wb3J0IHsgcGljayB9IGZyb20gJ21hcGJveC1nbC9zcmMvdXRpbC91dGlsJztcbmltcG9ydCB7IGdldEpTT04gfSBmcm9tICdtYXBib3gtZ2wvc3JjL3V0aWwvYWpheCc7XG5pbXBvcnQgYnJvd3NlciBmcm9tICdtYXBib3gtZ2wvc3JjL3V0aWwvYnJvd3Nlcic7XG5pbXBvcnQgU3BoZXJpY2FsTWVyY2F0b3IgZnJvbSAnQG1hcGJveC9zcGhlcmljYWxtZXJjYXRvcic7XG5cbi8vQ29udGFpbnMgY29kZSBmcm9tIGVzcmktbGVhZmxldCBodHRwczovL2dpdGh1Yi5jb20vRXNyaS9lc3JpLWxlYWZsZXRcbmNvbnN0IE1lcmNhdG9yWm9vbUxldmVscyA9IHtcbiAgICAnMCc6IDE1NjU0My4wMzM5Mjc5OTk5OSxcbiAgICAnMSc6IDc4MjcxLjUxNjk2Mzk5OTg5MyxcbiAgICAnMic6IDM5MTM1Ljc1ODQ4MjAwMDA5OSxcbiAgICAnMyc6IDE5NTY3Ljg3OTI0MDk5OTkwMSxcbiAgICAnNCc6IDk3ODMuOTM5NjIwNDk5OTU5MyxcbiAgICAnNSc6IDQ4OTEuOTY5ODEwMjQ5OTc5NyxcbiAgICAnNic6IDI0NDUuOTg0OTA1MTI0OTg5OCxcbiAgICAnNyc6IDEyMjIuOTkyNDUyNTYyNDg5OSxcbiAgICAnOCc6IDYxMS40OTYyMjYyODEzODAwMixcbiAgICAnOSc6IDMwNS43NDgxMTMxNDA1NTgwMixcbiAgICAnMTAnOiAxNTIuODc0MDU2NTcwNDExLFxuICAgICcxMSc6IDc2LjQzNzAyODI4NTA3MzE5NyxcbiAgICAnMTInOiAzOC4yMTg1MTQxNDI1MzY1OTgsXG4gICAgJzEzJzogMTkuMTA5MjU3MDcxMjY4Mjk5LFxuICAgICcxNCc6IDkuNTU0NjI4NTM1NjM0MTQ5NixcbiAgICAnMTUnOiA0Ljc3NzMxNDI2Nzk0OTM2OTksXG4gICAgJzE2JzogMi4zODg2NTcxMzM5NzQ2OCxcbiAgICAnMTcnOiAxLjE5NDMyODU2Njg1NTA1MDEsXG4gICAgJzE4JzogMC41OTcxNjQyODM1NTk4MTY5OSxcbiAgICAnMTknOiAwLjI5ODU4MjE0MTY0NzYxNjk4LFxuICAgICcyMCc6IDAuMTQ5MjkxMDcwODIzODEsXG4gICAgJzIxJzogMC4wNzQ2NDU1MzU0MTE5MSxcbiAgICAnMjInOiAwLjAzNzMyMjc2NzcwNTk1MjUsXG4gICAgJzIzJzogMC4wMTg2NjEzODM4NTI5NzYzXG59O1xuXG5jb25zdCBfd2l0aGluUGVyY2VudGFnZSA9IGZ1bmN0aW9uIChhLCBiLCBwZXJjZW50YWdlKSB7XG4gICAgY29uc3QgZGlmZiA9IE1hdGguYWJzKChhIC8gYikgLSAxKTtcbiAgICByZXR1cm4gZGlmZiA8IHBlcmNlbnRhZ2U7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihvcHRpb25zLCBjYWxsYmFjaykge1xuICAgIGNvbnN0IGxvYWRlZCA9IGZ1bmN0aW9uKGVyciwgbWV0YWRhdGEpIHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByZXN1bHQgPSBwaWNrKG1ldGFkYXRhLFxuICAgICAgICAgICAgWyd0aWxlSW5mbycsICdpbml0aWFsRXh0ZW50JywgJ2Z1bGxFeHRlbnQnLCAnc3BhdGlhbFJlZmVyZW5jZScsICd0aWxlU2VydmVycycsICdkb2N1bWVudEluZm8nXSk7XG5cbiAgICAgICAgcmVzdWx0Ll9sb2RNYXAgPSB7fTtcbiAgICAgICAgY29uc3Qgem9vbU9mZnNldEFsbG93YW5jZSA9IDAuMTtcbiAgICAgICAgY29uc3Qgc3IgPSBtZXRhZGF0YS5zcGF0aWFsUmVmZXJlbmNlLmxhdGVzdFdraWQgfHwgbWV0YWRhdGEuc3BhdGlhbFJlZmVyZW5jZS53a2lkO1xuICAgICAgICBpZiAoc3IgPT09IDEwMjEwMCB8fCBzciA9PT0gMzg1Nykge1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgRXhhbXBsZSBleHRlbnQgZnJvbSBBcmNHSVMgUkVTVCBBUElcbiAgICAgICAgICAgIGZ1bGxFeHRlbnQ6IHtcbiAgICAgICAgICAgIHhtaW46IC05MTQ0NzkxLjY3OTIyNjEyNyxcbiAgICAgICAgICAgIHltaW46IC0yMTk1MTkwLjk2MTQzNzcyNixcbiAgICAgICAgICAgIHhtYXg6IC00NjUwOTg3LjA3MjAxOTk4MyxcbiAgICAgICAgICAgIHltYXg6IDExMTgxMTMuMTEwMTU1NzY2LFxuICAgICAgICAgICAgc3BhdGlhbFJlZmVyZW5jZToge1xuICAgICAgICAgICAgd2tpZDogMTAyMTAwLFxuICAgICAgICAgICAgd2t0OiBudWxsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIC8vY29udmVydCBBcmNHSVMgZXh0ZW50IHRvIGJvdW5kc1xuICAgICAgICAgICAgY29uc3QgZXh0ZW50ID0gbWV0YWRhdGEuZnVsbEV4dGVudDtcbiAgICAgICAgICAgIGlmIChleHRlbnQgJiYgZXh0ZW50LnNwYXRpYWxSZWZlcmVuY2UgJiYgZXh0ZW50LnNwYXRpYWxSZWZlcmVuY2Uud2tpZCA9PT0gIDEwMjEwMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJvdW5kc1dlYk1lcmNhdG9yID0gW2V4dGVudC54bWluLCBleHRlbnQueW1pbiwgZXh0ZW50LnhtYXgsIGV4dGVudC55bWF4XTtcbiAgICAgICAgICAgICAgICB2YXIgbWVyYyA9IG5ldyBTcGhlcmljYWxNZXJjYXRvcih7XG4gICAgICAgICAgICAgICAgICAgIHNpemU6IDI1NlxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNvbnN0IGJvdW5kc1dHUzg0ID0gbWVyYy5jb252ZXJ0KGJvdW5kc1dlYk1lcmNhdG9yKTtcbiAgICAgICAgICAgICAgICByZXN1bHQuYm91bmRzID0gYm91bmRzV0dTODQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGNyZWF0ZSB0aGUgem9vbSBsZXZlbCBkYXRhXG4gICAgICAgICAgICBjb25zdCBhcmNnaXNMT0RzID0gbWV0YWRhdGEudGlsZUluZm8ubG9kcztcbiAgICAgICAgICAgIGNvbnN0IGNvcnJlY3RSZXNvbHV0aW9ucyA9IE1lcmNhdG9yWm9vbUxldmVscztcbiAgICAgICAgICAgIHJlc3VsdC5taW56b29tID0gYXJjZ2lzTE9Ec1swXS5sZXZlbDtcbiAgICAgICAgICAgIHJlc3VsdC5tYXh6b29tID0gYXJjZ2lzTE9Ec1thcmNnaXNMT0RzLmxlbmd0aCAtIDFdLmxldmVsO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcmNnaXNMT0RzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYXJjZ2lzTE9EID0gYXJjZ2lzTE9Ec1tpXTtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGNpIGluIGNvcnJlY3RSZXNvbHV0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb3JyZWN0UmVzID0gY29ycmVjdFJlc29sdXRpb25zW2NpXTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoX3dpdGhpblBlcmNlbnRhZ2UoYXJjZ2lzTE9ELnJlc29sdXRpb24sIGNvcnJlY3RSZXMsIHpvb21PZmZzZXRBbGxvd2FuY2UpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuX2xvZE1hcFtjaV0gPSBhcmNnaXNMT0QubGV2ZWw7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKG5ldyBFcnJvcignbm9uLW1lcmNhdG9yIHNwYXRpYWwgcmVmZXJlbmNlJykpO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzdWx0KTtcbiAgICB9O1xuXG4gICAgaWYgKG9wdGlvbnMudXJsKSB7XG4gICAgICAgIGdldEpTT04oe3VybDogb3B0aW9ucy51cmx9LCBsb2FkZWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGJyb3dzZXIuZnJhbWUobG9hZGVkLmJpbmQobnVsbCwgbnVsbCwgb3B0aW9ucykpO1xuICAgIH1cbn07XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgeyB3cmFwIH0gZnJvbSAnLi4vdXRpbC91dGlsJztcbmltcG9ydCBMbmdMYXRCb3VuZHMgZnJvbSAnLi9sbmdfbGF0X2JvdW5kcyc7XG5cbi8qKlxuICogQSBgTG5nTGF0YCBvYmplY3QgcmVwcmVzZW50cyBhIGdpdmVuIGxvbmdpdHVkZSBhbmQgbGF0aXR1ZGUgY29vcmRpbmF0ZSwgbWVhc3VyZWQgaW4gZGVncmVlcy5cbiAqXG4gKiBNYXBib3ggR0wgdXNlcyBsb25naXR1ZGUsIGxhdGl0dWRlIGNvb3JkaW5hdGUgb3JkZXIgKGFzIG9wcG9zZWQgdG8gbGF0aXR1ZGUsIGxvbmdpdHVkZSkgdG8gbWF0Y2ggR2VvSlNPTi5cbiAqXG4gKiBOb3RlIHRoYXQgYW55IE1hcGJveCBHTCBtZXRob2QgdGhhdCBhY2NlcHRzIGEgYExuZ0xhdGAgb2JqZWN0IGFzIGFuIGFyZ3VtZW50IG9yIG9wdGlvblxuICogY2FuIGFsc28gYWNjZXB0IGFuIGBBcnJheWAgb2YgdHdvIG51bWJlcnMgYW5kIHdpbGwgcGVyZm9ybSBhbiBpbXBsaWNpdCBjb252ZXJzaW9uLlxuICogVGhpcyBmbGV4aWJsZSB0eXBlIGlzIGRvY3VtZW50ZWQgYXMge0BsaW5rIExuZ0xhdExpa2V9LlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBsbmcgTG9uZ2l0dWRlLCBtZWFzdXJlZCBpbiBkZWdyZWVzLlxuICogQHBhcmFtIHtudW1iZXJ9IGxhdCBMYXRpdHVkZSwgbWVhc3VyZWQgaW4gZGVncmVlcy5cbiAqIEBleGFtcGxlXG4gKiB2YXIgbGwgPSBuZXcgbWFwYm94Z2wuTG5nTGF0KC03My45NzQ5LCA0MC43NzM2KTtcbiAqIEBzZWUgW0dldCBjb29yZGluYXRlcyBvZiB0aGUgbW91c2UgcG9pbnRlcl0oaHR0cHM6Ly93d3cubWFwYm94LmNvbS9tYXBib3gtZ2wtanMvZXhhbXBsZS9tb3VzZS1wb3NpdGlvbi8pXG4gKiBAc2VlIFtEaXNwbGF5IGEgcG9wdXBdKGh0dHBzOi8vd3d3Lm1hcGJveC5jb20vbWFwYm94LWdsLWpzL2V4YW1wbGUvcG9wdXAvKVxuICogQHNlZSBbSGlnaGxpZ2h0IGZlYXR1cmVzIHdpdGhpbiBhIGJvdW5kaW5nIGJveF0oaHR0cHM6Ly93d3cubWFwYm94LmNvbS9tYXBib3gtZ2wtanMvZXhhbXBsZS91c2luZy1ib3gtcXVlcnlyZW5kZXJlZGZlYXR1cmVzLylcbiAqIEBzZWUgW0NyZWF0ZSBhIHRpbWVsaW5lIGFuaW1hdGlvbl0oaHR0cHM6Ly93d3cubWFwYm94LmNvbS9tYXBib3gtZ2wtanMvZXhhbXBsZS90aW1lbGluZS1hbmltYXRpb24vKVxuICovXG5jbGFzcyBMbmdMYXQge1xuICAgIGxuZzogbnVtYmVyO1xuICAgIGxhdDogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IobG5nOiBudW1iZXIsIGxhdDogbnVtYmVyKSB7XG4gICAgICAgIGlmIChpc05hTihsbmcpIHx8IGlzTmFOKGxhdCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBMbmdMYXQgb2JqZWN0OiAoJHtsbmd9LCAke2xhdH0pYCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5sbmcgPSArbG5nO1xuICAgICAgICB0aGlzLmxhdCA9ICtsYXQ7XG4gICAgICAgIGlmICh0aGlzLmxhdCA+IDkwIHx8IHRoaXMubGF0IDwgLTkwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgTG5nTGF0IGxhdGl0dWRlIHZhbHVlOiBtdXN0IGJlIGJldHdlZW4gLTkwIGFuZCA5MCcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIG5ldyBgTG5nTGF0YCBvYmplY3Qgd2hvc2UgbG9uZ2l0dWRlIGlzIHdyYXBwZWQgdG8gdGhlIHJhbmdlICgtMTgwLCAxODApLlxuICAgICAqXG4gICAgICogQHJldHVybnMge0xuZ0xhdH0gVGhlIHdyYXBwZWQgYExuZ0xhdGAgb2JqZWN0LlxuICAgICAqIEBleGFtcGxlXG4gICAgICogdmFyIGxsID0gbmV3IG1hcGJveGdsLkxuZ0xhdCgyODYuMDI1MSwgNDAuNzczNik7XG4gICAgICogdmFyIHdyYXBwZWQgPSBsbC53cmFwKCk7XG4gICAgICogd3JhcHBlZC5sbmc7IC8vID0gLTczLjk3NDlcbiAgICAgKi9cbiAgICB3cmFwKCkge1xuICAgICAgICByZXR1cm4gbmV3IExuZ0xhdCh3cmFwKHRoaXMubG5nLCAtMTgwLCAxODApLCB0aGlzLmxhdCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgY29vcmRpbmF0ZXMgcmVwcmVzZW50ZWQgYXMgYW4gYXJyYXkgb2YgdHdvIG51bWJlcnMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7QXJyYXk8bnVtYmVyPn0gVGhlIGNvb3JkaW5hdGVzIHJlcHJlc2V0ZWQgYXMgYW4gYXJyYXkgb2YgbG9uZ2l0dWRlIGFuZCBsYXRpdHVkZS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHZhciBsbCA9IG5ldyBtYXBib3hnbC5MbmdMYXQoLTczLjk3NDksIDQwLjc3MzYpO1xuICAgICAqIGxsLnRvQXJyYXkoKTsgLy8gPSBbLTczLjk3NDksIDQwLjc3MzZdXG4gICAgICovXG4gICAgdG9BcnJheSgpIHtcbiAgICAgICAgcmV0dXJuIFt0aGlzLmxuZywgdGhpcy5sYXRdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGNvb3JkaW5hdGVzIHJlcHJlc2VudCBhcyBhIHN0cmluZy5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb29yZGluYXRlcyByZXByZXNlbnRlZCBhcyBhIHN0cmluZyBvZiB0aGUgZm9ybWF0IGAnTG5nTGF0KGxuZywgbGF0KSdgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICogdmFyIGxsID0gbmV3IG1hcGJveGdsLkxuZ0xhdCgtNzMuOTc0OSwgNDAuNzczNik7XG4gICAgICogbGwudG9TdHJpbmcoKTsgLy8gPSBcIkxuZ0xhdCgtNzMuOTc0OSwgNDAuNzczNilcIlxuICAgICAqL1xuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gYExuZ0xhdCgke3RoaXMubG5nfSwgJHt0aGlzLmxhdH0pYDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgYExuZ0xhdEJvdW5kc2AgZnJvbSB0aGUgY29vcmRpbmF0ZXMgZXh0ZW5kZWQgYnkgYSBnaXZlbiBgcmFkaXVzYC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSByYWRpdXMgRGlzdGFuY2UgaW4gbWV0ZXJzIGZyb20gdGhlIGNvb3JkaW5hdGVzIHRvIGV4dGVuZCB0aGUgYm91bmRzLlxuICAgICAqIEByZXR1cm5zIHtMbmdMYXRCb3VuZHN9IEEgbmV3IGBMbmdMYXRCb3VuZHNgIG9iamVjdCByZXByZXNlbnRpbmcgdGhlIGNvb3JkaW5hdGVzIGV4dGVuZGVkIGJ5IHRoZSBgcmFkaXVzYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHZhciBsbCA9IG5ldyBtYXBib3hnbC5MbmdMYXQoLTczLjk3NDksIDQwLjc3MzYpO1xuICAgICAqIGxsLnRvQm91bmRzKDEwMCkudG9BcnJheSgpOyAvLyA9IFtbLTczLjk3NTAxODYyMTQxMzI4LCA0MC43NzM1MTAxNjg0NzIyOV0sIFstNzMuOTc0NzgxMzc4NTg2NzMsIDQwLjc3MzY4OTgzMTUyNzcxXV1cbiAgICAgKi9cbiAgICB0b0JvdW5kcyhyYWRpdXM6IG51bWJlcikge1xuICAgICAgICBjb25zdCBlYXJ0aENpcmN1bWZlcmVuY2VJbk1ldGVyc0F0RXF1YXRvciA9IDQwMDc1MDE3O1xuICAgICAgICBjb25zdCBsYXRBY2N1cmFjeSA9IDM2MCAqIHJhZGl1cyAvIGVhcnRoQ2lyY3VtZmVyZW5jZUluTWV0ZXJzQXRFcXVhdG9yLFxuICAgICAgICAgICAgbG5nQWNjdXJhY3kgPSBsYXRBY2N1cmFjeSAvIE1hdGguY29zKChNYXRoLlBJIC8gMTgwKSAqIHRoaXMubGF0KTtcblxuICAgICAgICByZXR1cm4gbmV3IExuZ0xhdEJvdW5kcyhuZXcgTG5nTGF0KHRoaXMubG5nIC0gbG5nQWNjdXJhY3ksIHRoaXMubGF0IC0gbGF0QWNjdXJhY3kpLFxuICAgICAgICAgICAgbmV3IExuZ0xhdCh0aGlzLmxuZyArIGxuZ0FjY3VyYWN5LCB0aGlzLmxhdCArIGxhdEFjY3VyYWN5KSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29udmVydHMgYW4gYXJyYXkgb2YgdHdvIG51bWJlcnMgb3IgYW4gb2JqZWN0IHdpdGggYGxuZ2AgYW5kIGBsYXRgIG9yIGBsb25gIGFuZCBgbGF0YCBwcm9wZXJ0aWVzXG4gICAgICogdG8gYSBgTG5nTGF0YCBvYmplY3QuXG4gICAgICpcbiAgICAgKiBJZiBhIGBMbmdMYXRgIG9iamVjdCBpcyBwYXNzZWQgaW4sIHRoZSBmdW5jdGlvbiByZXR1cm5zIGl0IHVuY2hhbmdlZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7TG5nTGF0TGlrZX0gaW5wdXQgQW4gYXJyYXkgb2YgdHdvIG51bWJlcnMgb3Igb2JqZWN0IHRvIGNvbnZlcnQsIG9yIGEgYExuZ0xhdGAgb2JqZWN0IHRvIHJldHVybi5cbiAgICAgKiBAcmV0dXJucyB7TG5nTGF0fSBBIG5ldyBgTG5nTGF0YCBvYmplY3QsIGlmIGEgY29udmVyc2lvbiBvY2N1cnJlZCwgb3IgdGhlIG9yaWdpbmFsIGBMbmdMYXRgIG9iamVjdC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHZhciBhcnIgPSBbLTczLjk3NDksIDQwLjc3MzZdO1xuICAgICAqIHZhciBsbCA9IG1hcGJveGdsLkxuZ0xhdC5jb252ZXJ0KGFycik7XG4gICAgICogbGw7ICAgLy8gPSBMbmdMYXQge2xuZzogLTczLjk3NDksIGxhdDogNDAuNzczNn1cbiAgICAgKi9cbiAgICBzdGF0aWMgY29udmVydChpbnB1dDogTG5nTGF0TGlrZSk6IExuZ0xhdCB7XG4gICAgICAgIGlmIChpbnB1dCBpbnN0YW5jZW9mIExuZ0xhdCkge1xuICAgICAgICAgICAgcmV0dXJuIGlucHV0O1xuICAgICAgICB9XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGlucHV0KSAmJiAoaW5wdXQubGVuZ3RoID09PSAyIHx8IGlucHV0Lmxlbmd0aCA9PT0gMykpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgTG5nTGF0KE51bWJlcihpbnB1dFswXSksIE51bWJlcihpbnB1dFsxXSkpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShpbnB1dCkgJiYgdHlwZW9mIGlucHV0ID09PSAnb2JqZWN0JyAmJiBpbnB1dCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBMbmdMYXQoXG4gICAgICAgICAgICAgICAgLy8gZmxvdyBjYW4ndCByZWZpbmUgdGhpcyB0byBoYXZlIG9uZSBvZiBsbmcgb3IgbGF0LCBzbyB3ZSBoYXZlIHRvIGNhc3QgdG8gYW55XG4gICAgICAgICAgICAgICAgTnVtYmVyKCdsbmcnIGluIGlucHV0ID8gKGlucHV0OiBhbnkpLmxuZyA6IChpbnB1dDogYW55KS5sb24pLFxuICAgICAgICAgICAgICAgIE51bWJlcihpbnB1dC5sYXQpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImBMbmdMYXRMaWtlYCBhcmd1bWVudCBtdXN0IGJlIHNwZWNpZmllZCBhcyBhIExuZ0xhdCBpbnN0YW5jZSwgYW4gb2JqZWN0IHtsbmc6IDxsbmc+LCBsYXQ6IDxsYXQ+fSwgYW4gb2JqZWN0IHtsb246IDxsbmc+LCBsYXQ6IDxsYXQ+fSwgb3IgYW4gYXJyYXkgb2YgWzxsbmc+LCA8bGF0Pl1cIik7XG4gICAgfVxufVxuXG4vKipcbiAqIEEge0BsaW5rIExuZ0xhdH0gb2JqZWN0LCBhbiBhcnJheSBvZiB0d28gbnVtYmVycyByZXByZXNlbnRpbmcgbG9uZ2l0dWRlIGFuZCBsYXRpdHVkZSxcbiAqIG9yIGFuIG9iamVjdCB3aXRoIGBsbmdgIGFuZCBgbGF0YCBvciBgbG9uYCBhbmQgYGxhdGAgcHJvcGVydGllcy5cbiAqXG4gKiBAdHlwZWRlZiB7TG5nTGF0IHwge2xuZzogbnVtYmVyLCBsYXQ6IG51bWJlcn0gfCB7bG9uOiBudW1iZXIsIGxhdDogbnVtYmVyfSB8IFtudW1iZXIsIG51bWJlcl19IExuZ0xhdExpa2VcbiAqIEBleGFtcGxlXG4gKiB2YXIgdjEgPSBuZXcgbWFwYm94Z2wuTG5nTGF0KC0xMjIuNDIwNjc5LCAzNy43NzI1MzcpO1xuICogdmFyIHYyID0gWy0xMjIuNDIwNjc5LCAzNy43NzI1MzddO1xuICogdmFyIHYzID0ge2xvbjogLTEyMi40MjA2NzksIGxhdDogMzcuNzcyNTM3fTtcbiAqL1xuZXhwb3J0IHR5cGUgTG5nTGF0TGlrZSA9IExuZ0xhdCB8IHtsbmc6IG51bWJlciwgbGF0OiBudW1iZXJ9IHwge2xvbjogbnVtYmVyLCBsYXQ6IG51bWJlcn0gfCBbbnVtYmVyLCBudW1iZXJdO1xuXG5leHBvcnQgZGVmYXVsdCBMbmdMYXQ7XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgTG5nTGF0IGZyb20gJy4vbG5nX2xhdCc7XG5cbmltcG9ydCB0eXBlIHtMbmdMYXRMaWtlfSBmcm9tICcuL2xuZ19sYXQnO1xuXG4vKipcbiAqIEEgYExuZ0xhdEJvdW5kc2Agb2JqZWN0IHJlcHJlc2VudHMgYSBnZW9ncmFwaGljYWwgYm91bmRpbmcgYm94LFxuICogZGVmaW5lZCBieSBpdHMgc291dGh3ZXN0IGFuZCBub3J0aGVhc3QgcG9pbnRzIGluIGxvbmdpdHVkZSBhbmQgbGF0aXR1ZGUuXG4gKlxuICogSWYgbm8gYXJndW1lbnRzIGFyZSBwcm92aWRlZCB0byB0aGUgY29uc3RydWN0b3IsIGEgYG51bGxgIGJvdW5kaW5nIGJveCBpcyBjcmVhdGVkLlxuICpcbiAqIE5vdGUgdGhhdCBhbnkgTWFwYm94IEdMIG1ldGhvZCB0aGF0IGFjY2VwdHMgYSBgTG5nTGF0Qm91bmRzYCBvYmplY3QgYXMgYW4gYXJndW1lbnQgb3Igb3B0aW9uXG4gKiBjYW4gYWxzbyBhY2NlcHQgYW4gYEFycmF5YCBvZiB0d28ge0BsaW5rIExuZ0xhdExpa2V9IGNvbnN0cnVjdHMgYW5kIHdpbGwgcGVyZm9ybSBhbiBpbXBsaWNpdCBjb252ZXJzaW9uLlxuICogVGhpcyBmbGV4aWJsZSB0eXBlIGlzIGRvY3VtZW50ZWQgYXMge0BsaW5rIExuZ0xhdEJvdW5kc0xpa2V9LlxuICpcbiAqIEBwYXJhbSB7TG5nTGF0TGlrZX0gW3N3XSBUaGUgc291dGh3ZXN0IGNvcm5lciBvZiB0aGUgYm91bmRpbmcgYm94LlxuICogQHBhcmFtIHtMbmdMYXRMaWtlfSBbbmVdIFRoZSBub3J0aGVhc3QgY29ybmVyIG9mIHRoZSBib3VuZGluZyBib3guXG4gKiBAZXhhbXBsZVxuICogdmFyIHN3ID0gbmV3IG1hcGJveGdsLkxuZ0xhdCgtNzMuOTg3NiwgNDAuNzY2MSk7XG4gKiB2YXIgbmUgPSBuZXcgbWFwYm94Z2wuTG5nTGF0KC03My45Mzk3LCA0MC44MDAyKTtcbiAqIHZhciBsbGIgPSBuZXcgbWFwYm94Z2wuTG5nTGF0Qm91bmRzKHN3LCBuZSk7XG4gKi9cbmNsYXNzIExuZ0xhdEJvdW5kcyB7XG4gICAgX25lOiBMbmdMYXQ7XG4gICAgX3N3OiBMbmdMYXQ7XG5cbiAgICAvLyBUaGlzIGNvbnN0cnVjdG9yIGlzIHRvbyBmbGV4aWJsZSB0byB0eXBlLiBJdCBzaG91bGQgbm90IGJlIHNvIGZsZXhpYmxlLlxuICAgIGNvbnN0cnVjdG9yKHN3OiBhbnksIG5lOiBhbnkpIHtcbiAgICAgICAgaWYgKCFzdykge1xuICAgICAgICAgICAgLy8gbm9vcFxuICAgICAgICB9IGVsc2UgaWYgKG5lKSB7XG4gICAgICAgICAgICB0aGlzLnNldFNvdXRoV2VzdChzdykuc2V0Tm9ydGhFYXN0KG5lKTtcbiAgICAgICAgfSBlbHNlIGlmIChzdy5sZW5ndGggPT09IDQpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U291dGhXZXN0KFtzd1swXSwgc3dbMV1dKS5zZXROb3J0aEVhc3QoW3N3WzJdLCBzd1szXV0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXRTb3V0aFdlc3Qoc3dbMF0pLnNldE5vcnRoRWFzdChzd1sxXSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIG5vcnRoZWFzdCBjb3JuZXIgb2YgdGhlIGJvdW5kaW5nIGJveFxuICAgICAqXG4gICAgICogQHBhcmFtIHtMbmdMYXRMaWtlfSBuZVxuICAgICAqIEByZXR1cm5zIHtMbmdMYXRCb3VuZHN9IGB0aGlzYFxuICAgICAqL1xuICAgIHNldE5vcnRoRWFzdChuZTogTG5nTGF0TGlrZSkge1xuICAgICAgICB0aGlzLl9uZSA9IG5lIGluc3RhbmNlb2YgTG5nTGF0ID8gbmV3IExuZ0xhdChuZS5sbmcsIG5lLmxhdCkgOiBMbmdMYXQuY29udmVydChuZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgc291dGh3ZXN0IGNvcm5lciBvZiB0aGUgYm91bmRpbmcgYm94XG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0xuZ0xhdExpa2V9IHN3XG4gICAgICogQHJldHVybnMge0xuZ0xhdEJvdW5kc30gYHRoaXNgXG4gICAgICovXG4gICAgc2V0U291dGhXZXN0KHN3OiBMbmdMYXRMaWtlKSB7XG4gICAgICAgIHRoaXMuX3N3ID0gc3cgaW5zdGFuY2VvZiBMbmdMYXQgPyBuZXcgTG5nTGF0KHN3LmxuZywgc3cubGF0KSA6IExuZ0xhdC5jb252ZXJ0KHN3KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRXh0ZW5kIHRoZSBib3VuZHMgdG8gaW5jbHVkZSBhIGdpdmVuIExuZ0xhdCBvciBMbmdMYXRCb3VuZHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0xuZ0xhdHxMbmdMYXRCb3VuZHN9IG9iaiBvYmplY3QgdG8gZXh0ZW5kIHRvXG4gICAgICogQHJldHVybnMge0xuZ0xhdEJvdW5kc30gYHRoaXNgXG4gICAgICovXG4gICAgZXh0ZW5kKG9iajogTG5nTGF0IHwgTG5nTGF0Qm91bmRzKSB7XG4gICAgICAgIGNvbnN0IHN3ID0gdGhpcy5fc3csXG4gICAgICAgICAgICBuZSA9IHRoaXMuX25lO1xuICAgICAgICBsZXQgc3cyLCBuZTI7XG5cbiAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIExuZ0xhdCkge1xuICAgICAgICAgICAgc3cyID0gb2JqO1xuICAgICAgICAgICAgbmUyID0gb2JqO1xuXG4gICAgICAgIH0gZWxzZSBpZiAob2JqIGluc3RhbmNlb2YgTG5nTGF0Qm91bmRzKSB7XG4gICAgICAgICAgICBzdzIgPSBvYmouX3N3O1xuICAgICAgICAgICAgbmUyID0gb2JqLl9uZTtcblxuICAgICAgICAgICAgaWYgKCFzdzIgfHwgIW5lMikgcmV0dXJuIHRoaXM7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KG9iaikpIHtcbiAgICAgICAgICAgICAgICBpZiAob2JqLmV2ZXJ5KEFycmF5LmlzQXJyYXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmV4dGVuZChMbmdMYXRCb3VuZHMuY29udmVydChvYmopKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5leHRlbmQoTG5nTGF0LmNvbnZlcnQob2JqKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXN3ICYmICFuZSkge1xuICAgICAgICAgICAgdGhpcy5fc3cgPSBuZXcgTG5nTGF0KHN3Mi5sbmcsIHN3Mi5sYXQpO1xuICAgICAgICAgICAgdGhpcy5fbmUgPSBuZXcgTG5nTGF0KG5lMi5sbmcsIG5lMi5sYXQpO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdy5sbmcgPSBNYXRoLm1pbihzdzIubG5nLCBzdy5sbmcpO1xuICAgICAgICAgICAgc3cubGF0ID0gTWF0aC5taW4oc3cyLmxhdCwgc3cubGF0KTtcbiAgICAgICAgICAgIG5lLmxuZyA9IE1hdGgubWF4KG5lMi5sbmcsIG5lLmxuZyk7XG4gICAgICAgICAgICBuZS5sYXQgPSBNYXRoLm1heChuZTIubGF0LCBuZS5sYXQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgZ2VvZ3JhcGhpY2FsIGNvb3JkaW5hdGUgZXF1aWRpc3RhbnQgZnJvbSB0aGUgYm91bmRpbmcgYm94J3MgY29ybmVycy5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtMbmdMYXR9IFRoZSBib3VuZGluZyBib3gncyBjZW50ZXIuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB2YXIgbGxiID0gbmV3IG1hcGJveGdsLkxuZ0xhdEJvdW5kcyhbLTczLjk4NzYsIDQwLjc2NjFdLCBbLTczLjkzOTcsIDQwLjgwMDJdKTtcbiAgICAgKiBsbGIuZ2V0Q2VudGVyKCk7IC8vID0gTG5nTGF0IHtsbmc6IC03My45NjM2NSwgbGF0OiA0MC43ODMxNX1cbiAgICAgKi9cbiAgICBnZXRDZW50ZXIoKTogTG5nTGF0IHtcbiAgICAgICAgcmV0dXJuIG5ldyBMbmdMYXQoKHRoaXMuX3N3LmxuZyArIHRoaXMuX25lLmxuZykgLyAyLCAodGhpcy5fc3cubGF0ICsgdGhpcy5fbmUubGF0KSAvIDIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHNvdXRod2VzdCBjb3JuZXIgb2YgdGhlIGJvdW5kaW5nIGJveC5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtMbmdMYXR9IFRoZSBzb3V0aHdlc3QgY29ybmVyIG9mIHRoZSBib3VuZGluZyBib3guXG4gICAgICovXG4gICAgZ2V0U291dGhXZXN0KCk6IExuZ0xhdCB7IHJldHVybiB0aGlzLl9zdzsgfVxuXG4gICAgLyoqXG4gICAgKiBSZXR1cm5zIHRoZSBub3J0aGVhc3QgY29ybmVyIG9mIHRoZSBib3VuZGluZyBib3guXG4gICAgKlxuICAgICogQHJldHVybnMge0xuZ0xhdH0gVGhlIG5vcnRoZWFzdCBjb3JuZXIgb2YgdGhlIGJvdW5kaW5nIGJveC5cbiAgICAgKi9cbiAgICBnZXROb3J0aEVhc3QoKTogTG5nTGF0IHsgcmV0dXJuIHRoaXMuX25lOyB9XG5cbiAgICAvKipcbiAgICAqIFJldHVybnMgdGhlIG5vcnRod2VzdCBjb3JuZXIgb2YgdGhlIGJvdW5kaW5nIGJveC5cbiAgICAqXG4gICAgKiBAcmV0dXJucyB7TG5nTGF0fSBUaGUgbm9ydGh3ZXN0IGNvcm5lciBvZiB0aGUgYm91bmRpbmcgYm94LlxuICAgICAqL1xuICAgIGdldE5vcnRoV2VzdCgpOiBMbmdMYXQgeyByZXR1cm4gbmV3IExuZ0xhdCh0aGlzLmdldFdlc3QoKSwgdGhpcy5nZXROb3J0aCgpKTsgfVxuXG4gICAgLyoqXG4gICAgKiBSZXR1cm5zIHRoZSBzb3V0aGVhc3QgY29ybmVyIG9mIHRoZSBib3VuZGluZyBib3guXG4gICAgKlxuICAgICogQHJldHVybnMge0xuZ0xhdH0gVGhlIHNvdXRoZWFzdCBjb3JuZXIgb2YgdGhlIGJvdW5kaW5nIGJveC5cbiAgICAgKi9cbiAgICBnZXRTb3V0aEVhc3QoKTogTG5nTGF0IHsgcmV0dXJuIG5ldyBMbmdMYXQodGhpcy5nZXRFYXN0KCksIHRoaXMuZ2V0U291dGgoKSk7IH1cblxuICAgIC8qKlxuICAgICogUmV0dXJucyB0aGUgd2VzdCBlZGdlIG9mIHRoZSBib3VuZGluZyBib3guXG4gICAgKlxuICAgICogQHJldHVybnMge251bWJlcn0gVGhlIHdlc3QgZWRnZSBvZiB0aGUgYm91bmRpbmcgYm94LlxuICAgICAqL1xuICAgIGdldFdlc3QoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX3N3LmxuZzsgfVxuXG4gICAgLyoqXG4gICAgKiBSZXR1cm5zIHRoZSBzb3V0aCBlZGdlIG9mIHRoZSBib3VuZGluZyBib3guXG4gICAgKlxuICAgICogQHJldHVybnMge251bWJlcn0gVGhlIHNvdXRoIGVkZ2Ugb2YgdGhlIGJvdW5kaW5nIGJveC5cbiAgICAgKi9cbiAgICBnZXRTb3V0aCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fc3cubGF0OyB9XG5cbiAgICAvKipcbiAgICAqIFJldHVybnMgdGhlIGVhc3QgZWRnZSBvZiB0aGUgYm91bmRpbmcgYm94LlxuICAgICpcbiAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSBlYXN0IGVkZ2Ugb2YgdGhlIGJvdW5kaW5nIGJveC5cbiAgICAgKi9cbiAgICBnZXRFYXN0KCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9uZS5sbmc7IH1cblxuICAgIC8qKlxuICAgICogUmV0dXJucyB0aGUgbm9ydGggZWRnZSBvZiB0aGUgYm91bmRpbmcgYm94LlxuICAgICpcbiAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSBub3J0aCBlZGdlIG9mIHRoZSBib3VuZGluZyBib3guXG4gICAgICovXG4gICAgZ2V0Tm9ydGgoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX25lLmxhdDsgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgYm91bmRpbmcgYm94IHJlcHJlc2VudGVkIGFzIGFuIGFycmF5LlxuICAgICAqXG4gICAgICogQHJldHVybnMge0FycmF5PEFycmF5PG51bWJlcj4+fSBUaGUgYm91bmRpbmcgYm94IHJlcHJlc2VudGVkIGFzIGFuIGFycmF5LCBjb25zaXN0aW5nIG9mIHRoZVxuICAgICAqICAgc291dGh3ZXN0IGFuZCBub3J0aGVhc3QgY29vcmRpbmF0ZXMgb2YgdGhlIGJvdW5kaW5nIHJlcHJlc2VudGVkIGFzIGFycmF5cyBvZiBudW1iZXJzLlxuICAgICAqIEBleGFtcGxlXG4gICAgICogdmFyIGxsYiA9IG5ldyBtYXBib3hnbC5MbmdMYXRCb3VuZHMoWy03My45ODc2LCA0MC43NjYxXSwgWy03My45Mzk3LCA0MC44MDAyXSk7XG4gICAgICogbGxiLnRvQXJyYXkoKTsgLy8gPSBbWy03My45ODc2LCA0MC43NjYxXSwgWy03My45Mzk3LCA0MC44MDAyXV1cbiAgICAgKi9cbiAgICB0b0FycmF5KCkge1xuICAgICAgICByZXR1cm4gW3RoaXMuX3N3LnRvQXJyYXkoKSwgdGhpcy5fbmUudG9BcnJheSgpXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gdGhlIGJvdW5kaW5nIGJveCByZXByZXNlbnRlZCBhcyBhIHN0cmluZy5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBib3VuZGluZyBib3ggcmVwcmVzZW50cyBhcyBhIHN0cmluZyBvZiB0aGUgZm9ybWF0XG4gICAgICogICBgJ0xuZ0xhdEJvdW5kcyhMbmdMYXQobG5nLCBsYXQpLCBMbmdMYXQobG5nLCBsYXQpKSdgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICogdmFyIGxsYiA9IG5ldyBtYXBib3hnbC5MbmdMYXRCb3VuZHMoWy03My45ODc2LCA0MC43NjYxXSwgWy03My45Mzk3LCA0MC44MDAyXSk7XG4gICAgICogbGxiLnRvU3RyaW5nKCk7IC8vID0gXCJMbmdMYXRCb3VuZHMoTG5nTGF0KC03My45ODc2LCA0MC43NjYxKSwgTG5nTGF0KC03My45Mzk3LCA0MC44MDAyKSlcIlxuICAgICAqL1xuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gYExuZ0xhdEJvdW5kcygke3RoaXMuX3N3LnRvU3RyaW5nKCl9LCAke3RoaXMuX25lLnRvU3RyaW5nKCl9KWA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgdGhlIGJvdW5kaW5nIGJveCBpcyBhbiBlbXB0eS9gbnVsbGAtdHlwZSBib3guXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiBib3VuZHMgaGF2ZSBiZWVuIGRlZmluZWQsIG90aGVyd2lzZSBmYWxzZS5cbiAgICAgKi9cbiAgICBpc0VtcHR5KCkge1xuICAgICAgICByZXR1cm4gISh0aGlzLl9zdyAmJiB0aGlzLl9uZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29udmVydHMgYW4gYXJyYXkgdG8gYSBgTG5nTGF0Qm91bmRzYCBvYmplY3QuXG4gICAgICpcbiAgICAgKiBJZiBhIGBMbmdMYXRCb3VuZHNgIG9iamVjdCBpcyBwYXNzZWQgaW4sIHRoZSBmdW5jdGlvbiByZXR1cm5zIGl0IHVuY2hhbmdlZC5cbiAgICAgKlxuICAgICAqIEludGVybmFsbHksIHRoZSBmdW5jdGlvbiBjYWxscyBgTG5nTGF0I2NvbnZlcnRgIHRvIGNvbnZlcnQgYXJyYXlzIHRvIGBMbmdMYXRgIHZhbHVlcy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7TG5nTGF0Qm91bmRzTGlrZX0gaW5wdXQgQW4gYXJyYXkgb2YgdHdvIGNvb3JkaW5hdGVzIHRvIGNvbnZlcnQsIG9yIGEgYExuZ0xhdEJvdW5kc2Agb2JqZWN0IHRvIHJldHVybi5cbiAgICAgKiBAcmV0dXJucyB7TG5nTGF0Qm91bmRzfSBBIG5ldyBgTG5nTGF0Qm91bmRzYCBvYmplY3QsIGlmIGEgY29udmVyc2lvbiBvY2N1cnJlZCwgb3IgdGhlIG9yaWdpbmFsIGBMbmdMYXRCb3VuZHNgIG9iamVjdC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHZhciBhcnIgPSBbWy03My45ODc2LCA0MC43NjYxXSwgWy03My45Mzk3LCA0MC44MDAyXV07XG4gICAgICogdmFyIGxsYiA9IG1hcGJveGdsLkxuZ0xhdEJvdW5kcy5jb252ZXJ0KGFycik7XG4gICAgICogbGxiOyAgIC8vID0gTG5nTGF0Qm91bmRzIHtfc3c6IExuZ0xhdCB7bG5nOiAtNzMuOTg3NiwgbGF0OiA0MC43NjYxfSwgX25lOiBMbmdMYXQge2xuZzogLTczLjkzOTcsIGxhdDogNDAuODAwMn19XG4gICAgICovXG4gICAgc3RhdGljIGNvbnZlcnQoaW5wdXQ6IExuZ0xhdEJvdW5kc0xpa2UpOiBMbmdMYXRCb3VuZHMge1xuICAgICAgICBpZiAoIWlucHV0IHx8IGlucHV0IGluc3RhbmNlb2YgTG5nTGF0Qm91bmRzKSByZXR1cm4gaW5wdXQ7XG4gICAgICAgIHJldHVybiBuZXcgTG5nTGF0Qm91bmRzKGlucHV0KTtcbiAgICB9XG59XG5cbi8qKlxuICogQSB7QGxpbmsgTG5nTGF0Qm91bmRzfSBvYmplY3QsIGFuIGFycmF5IG9mIHtAbGluayBMbmdMYXRMaWtlfSBvYmplY3RzIGluIFtzdywgbmVdIG9yZGVyLFxuICogb3IgYW4gYXJyYXkgb2YgbnVtYmVycyBpbiBbd2VzdCwgc291dGgsIGVhc3QsIG5vcnRoXSBvcmRlci5cbiAqXG4gKiBAdHlwZWRlZiB7TG5nTGF0Qm91bmRzIHwgW0xuZ0xhdExpa2UsIExuZ0xhdExpa2VdIHwgW251bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlcl19IExuZ0xhdEJvdW5kc0xpa2VcbiAqIEBleGFtcGxlXG4gKiB2YXIgdjEgPSBuZXcgbWFwYm94Z2wuTG5nTGF0Qm91bmRzKFxuICogICBuZXcgbWFwYm94Z2wuTG5nTGF0KC03My45ODc2LCA0MC43NjYxKSxcbiAqICAgbmV3IG1hcGJveGdsLkxuZ0xhdCgtNzMuOTM5NywgNDAuODAwMilcbiAqICk7XG4gKiB2YXIgdjIgPSBuZXcgbWFwYm94Z2wuTG5nTGF0Qm91bmRzKFstNzMuOTg3NiwgNDAuNzY2MV0sIFstNzMuOTM5NywgNDAuODAwMl0pXG4gKiB2YXIgdjMgPSBbWy03My45ODc2LCA0MC43NjYxXSwgWy03My45Mzk3LCA0MC44MDAyXV07XG4gKi9cbmV4cG9ydCB0eXBlIExuZ0xhdEJvdW5kc0xpa2UgPSBMbmdMYXRCb3VuZHMgfCBbTG5nTGF0TGlrZSwgTG5nTGF0TGlrZV0gfCBbbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyXTtcblxuZXhwb3J0IGRlZmF1bHQgTG5nTGF0Qm91bmRzO1xuIiwiLy8gQGZsb3dcblxuaW1wb3J0IExuZ0xhdCBmcm9tICcuLi9nZW8vbG5nX2xhdCc7XG5pbXBvcnQgdHlwZSB7TG5nTGF0TGlrZX0gZnJvbSAnLi4vZ2VvL2xuZ19sYXQnO1xuXG4vKlxuICogVGhlIGNpcmN1bWZlcmVuY2Ugb2YgdGhlIHdvcmxkIGluIG1ldGVycyBhdCB0aGUgZ2l2ZW4gbGF0aXR1ZGUuXG4gKi9cbmZ1bmN0aW9uIGNpcmN1bWZlcmVuY2VBdExhdGl0dWRlKGxhdGl0dWRlOiBudW1iZXIpIHtcbiAgICBjb25zdCBjaXJjdW1mZXJlbmNlID0gMiAqIE1hdGguUEkgKiA2Mzc4MTM3O1xuICAgIHJldHVybiBjaXJjdW1mZXJlbmNlICogTWF0aC5jb3MobGF0aXR1ZGUgKiBNYXRoLlBJIC8gMTgwKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1lcmNhdG9yWGZyb21MbmcobG5nOiBudW1iZXIpIHtcbiAgICByZXR1cm4gKDE4MCArIGxuZykgLyAzNjA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtZXJjYXRvcllmcm9tTGF0KGxhdDogbnVtYmVyKSB7XG4gICAgcmV0dXJuICgxODAgLSAoMTgwIC8gTWF0aC5QSSAqIE1hdGgubG9nKE1hdGgudGFuKE1hdGguUEkgLyA0ICsgbGF0ICogTWF0aC5QSSAvIDM2MCkpKSkgLyAzNjA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtZXJjYXRvclpmcm9tQWx0aXR1ZGUoYWx0aXR1ZGU6IG51bWJlciwgbGF0OiBudW1iZXIpIHtcbiAgICByZXR1cm4gYWx0aXR1ZGUgLyBjaXJjdW1mZXJlbmNlQXRMYXRpdHVkZShsYXQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbG5nRnJvbU1lcmNhdG9yWCh4OiBudW1iZXIpIHtcbiAgICByZXR1cm4geCAqIDM2MCAtIDE4MDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxhdEZyb21NZXJjYXRvclkoeTogbnVtYmVyKSB7XG4gICAgY29uc3QgeTIgPSAxODAgLSB5ICogMzYwO1xuICAgIHJldHVybiAzNjAgLyBNYXRoLlBJICogTWF0aC5hdGFuKE1hdGguZXhwKHkyICogTWF0aC5QSSAvIDE4MCkpIC0gOTA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbHRpdHVkZUZyb21NZXJjYXRvclooejogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICByZXR1cm4geiAqIGNpcmN1bWZlcmVuY2VBdExhdGl0dWRlKGxhdEZyb21NZXJjYXRvclkoeSkpO1xufVxuXG4vKipcbiAqIEEgYE1lcmNhdG9yQ29vcmRpbmF0ZWAgb2JqZWN0IHJlcHJlc2VudHMgYSBwcm9qZWN0ZWQgdGhyZWUgZGltZW5zaW9uYWwgcG9zaXRpb24uXG4gKlxuICogYE1lcmNhdG9yQ29vcmRpbmF0ZWAgdXNlcyB0aGUgd2ViIG1lcmNhdG9yIHByb2plY3Rpb24gKFtFUFNHOjM4NTddKGh0dHBzOi8vZXBzZy5pby8zODU3KSkgd2l0aCBzbGlnaHRseSBkaWZmZXJlbnQgdW5pdHM6XG4gKiAtIHRoZSBzaXplIG9mIDEgdW5pdCBpcyB0aGUgd2lkdGggb2YgdGhlIHByb2plY3RlZCB3b3JsZCBpbnN0ZWFkIG9mIHRoZSBcIm1lcmNhdG9yIG1ldGVyXCJcbiAqIC0gdGhlIG9yaWdpbiBvZiB0aGUgY29vcmRpbmF0ZSBzcGFjZSBpcyBhdCB0aGUgbm9ydGgtd2VzdCBjb3JuZXIgaW5zdGVhZCBvZiB0aGUgbWlkZGxlXG4gKlxuICogRm9yIGV4YW1wbGUsIGBNZXJjYXRvckNvb3JkaW5hdGUoMCwgMCwgMClgIGlzIHRoZSBub3J0aC13ZXN0IGNvcm5lciBvZiB0aGUgbWVyY2F0b3Igd29ybGQgYW5kXG4gKiBgTWVyY2F0b3JDb29yZGluYXRlKDEsIDEsIDApYCBpcyB0aGUgc291dGgtZWFzdCBjb3JuZXIuIElmIHlvdSBhcmUgZmFtaWxpYXIgd2l0aFxuICogW3ZlY3RvciB0aWxlc10oaHR0cHM6Ly9naXRodWIuY29tL21hcGJveC92ZWN0b3ItdGlsZS1zcGVjKSBpdCBtYXkgYmUgaGVscGZ1bCB0byB0aGlua1xuICogb2YgdGhlIGNvb3JkaW5hdGUgc3BhY2UgYXMgdGhlIGAwLzAvMGAgdGlsZSB3aXRoIGFuIGV4dGVudCBvZiBgMWAuXG4gKlxuICogVGhlIGB6YCBkaW1lbnNpb24gb2YgYE1lcmNhdG9yQ29vcmRpbmF0ZWAgaXMgY29uZm9ybWFsLiBBIGN1YmUgaW4gdGhlIG1lcmNhdG9yIGNvb3JkaW5hdGUgc3BhY2Ugd291bGQgYmUgcmVuZGVyZWQgYXMgYSBjdWJlLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSB4IFRoZSB4IGNvbXBvbmVudCBvZiB0aGUgcG9zaXRpb24uXG4gKiBAcGFyYW0ge251bWJlcn0geSBUaGUgeSBjb21wb25lbnQgb2YgdGhlIHBvc2l0aW9uLlxuICogQHBhcmFtIHtudW1iZXJ9IHogVGhlIHogY29tcG9uZW50IG9mIHRoZSBwb3NpdGlvbi5cbiAqIEBleGFtcGxlXG4gKiB2YXIgbnVsbElzbGFuZCA9IG5ldyBtYXBib3hnbC5NZXJjYXRvckNvb3JkaW5hdGUoMC41LCAwLjUsIDApO1xuICpcbiAqIEBzZWUgW0FkZCBhIGN1c3RvbSBzdHlsZSBsYXllcl0oaHR0cHM6Ly93d3cubWFwYm94LmNvbS9tYXBib3gtZ2wtanMvZXhhbXBsZS9jdXN0b20tc3R5bGUtbGF5ZXIvKVxuICovXG5jbGFzcyBNZXJjYXRvckNvb3JkaW5hdGUge1xuICAgIHg6IG51bWJlcjtcbiAgICB5OiBudW1iZXI7XG4gICAgejogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IoeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlciA9IDApIHtcbiAgICAgICAgdGhpcy54ID0gK3g7XG4gICAgICAgIHRoaXMueSA9ICt5O1xuICAgICAgICB0aGlzLnogPSArejtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQcm9qZWN0IGEgYExuZ0xhdGAgdG8gYSBgTWVyY2F0b3JDb29yZGluYXRlYC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7TG5nTGF0TGlrZX0gbG5nTGF0TGlrZSBUaGUgbG9jYXRpb24gdG8gcHJvamVjdC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gYWx0aXR1ZGUgVGhlIGFsdGl0dWRlIGluIG1ldGVycyBvZiB0aGUgcG9zaXRpb24uXG4gICAgICogQHJldHVybnMge01lcmNhdG9yQ29vcmRpbmF0ZX0gVGhlIHByb2plY3RlZCBtZXJjYXRvciBjb29yZGluYXRlLlxuICAgICAqIEBleGFtcGxlXG4gICAgICogdmFyIGNvb3JkID0gbWFwYm94Z2wuTWVyY2F0b3JDb29yZGluYXRlLmZyb21MbmdMYXQoeyBsbmc6IDAsIGxhdDogMH0sIDApO1xuICAgICAqIGNvb3JkOyAvLyBNZXJjYXRvckNvb3JkaW5hdGUoMC41LCAwLjUsIDApXG4gICAgICovXG4gICAgc3RhdGljIGZyb21MbmdMYXQobG5nTGF0TGlrZTogTG5nTGF0TGlrZSwgYWx0aXR1ZGU6IG51bWJlciA9IDApIHtcbiAgICAgICAgY29uc3QgbG5nTGF0ID0gTG5nTGF0LmNvbnZlcnQobG5nTGF0TGlrZSk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBNZXJjYXRvckNvb3JkaW5hdGUoXG4gICAgICAgICAgICAgICAgbWVyY2F0b3JYZnJvbUxuZyhsbmdMYXQubG5nKSxcbiAgICAgICAgICAgICAgICBtZXJjYXRvcllmcm9tTGF0KGxuZ0xhdC5sYXQpLFxuICAgICAgICAgICAgICAgIG1lcmNhdG9yWmZyb21BbHRpdHVkZShhbHRpdHVkZSwgbG5nTGF0LmxhdCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGBMbmdMYXRgIGZvciB0aGUgY29vcmRpbmF0ZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtMbmdMYXR9IFRoZSBgTG5nTGF0YCBvYmplY3QuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB2YXIgY29vcmQgPSBuZXcgbWFwYm94Z2wuTWVyY2F0b3JDb29yZGluYXRlKDAuNSwgMC41LCAwKTtcbiAgICAgKiB2YXIgbGF0TG5nID0gY29vcmQudG9MbmdMYXQoKTsgLy8gTG5nTGF0KDAsIDApXG4gICAgICovXG4gICAgdG9MbmdMYXQoKSB7XG4gICAgICAgIHJldHVybiBuZXcgTG5nTGF0KFxuICAgICAgICAgICAgICAgIGxuZ0Zyb21NZXJjYXRvclgodGhpcy54KSxcbiAgICAgICAgICAgICAgICBsYXRGcm9tTWVyY2F0b3JZKHRoaXMueSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGFsdGl0dWRlIGluIG1ldGVycyBvZiB0aGUgY29vcmRpbmF0ZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSBhbHRpdHVkZSBpbiBtZXRlcnMuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB2YXIgY29vcmQgPSBuZXcgbWFwYm94Z2wuTWVyY2F0b3JDb29yZGluYXRlKDAsIDAsIDAuMDIpO1xuICAgICAqIGNvb3JkLnRvQWx0aXR1ZGUoKTsgLy8gNjkxNC4yODE5NTYyOTUzMzlcbiAgICAgKi9cbiAgICB0b0FsdGl0dWRlKCkge1xuICAgICAgICByZXR1cm4gYWx0aXR1ZGVGcm9tTWVyY2F0b3JaKHRoaXMueiwgdGhpcy55KTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE1lcmNhdG9yQ29vcmRpbmF0ZTtcbiIsIi8vIEBmbG93XG5cbmltcG9ydCBMbmdMYXRCb3VuZHMgZnJvbSAnLi4vZ2VvL2xuZ19sYXRfYm91bmRzJztcbmltcG9ydCB7bWVyY2F0b3JYZnJvbUxuZywgbWVyY2F0b3JZZnJvbUxhdH0gZnJvbSAnLi4vZ2VvL21lcmNhdG9yX2Nvb3JkaW5hdGUnO1xuXG5pbXBvcnQgdHlwZSB7Q2Fub25pY2FsVGlsZUlEfSBmcm9tICcuL3RpbGVfaWQnO1xuXG5jbGFzcyBUaWxlQm91bmRzIHtcbiAgICBib3VuZHM6IExuZ0xhdEJvdW5kcztcbiAgICBtaW56b29tOiBudW1iZXI7XG4gICAgbWF4em9vbTogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IoYm91bmRzOiBbbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyXSwgbWluem9vbTogP251bWJlciwgbWF4em9vbTogP251bWJlcikge1xuICAgICAgICB0aGlzLmJvdW5kcyA9IExuZ0xhdEJvdW5kcy5jb252ZXJ0KHRoaXMudmFsaWRhdGVCb3VuZHMoYm91bmRzKSk7XG4gICAgICAgIHRoaXMubWluem9vbSA9IG1pbnpvb20gfHwgMDtcbiAgICAgICAgdGhpcy5tYXh6b29tID0gbWF4em9vbSB8fCAyNDtcbiAgICB9XG5cbiAgICB2YWxpZGF0ZUJvdW5kcyhib3VuZHM6IFtudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXJdKSB7XG4gICAgICAgIC8vIG1ha2Ugc3VyZSB0aGUgYm91bmRzIHByb3BlcnR5IGNvbnRhaW5zIHZhbGlkIGxvbmdpdHVkZSBhbmQgbGF0aXR1ZGVzXG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShib3VuZHMpIHx8IGJvdW5kcy5sZW5ndGggIT09IDQpIHJldHVybiBbLTE4MCwgLTkwLCAxODAsIDkwXTtcbiAgICAgICAgcmV0dXJuIFtNYXRoLm1heCgtMTgwLCBib3VuZHNbMF0pLCBNYXRoLm1heCgtOTAsIGJvdW5kc1sxXSksIE1hdGgubWluKDE4MCwgYm91bmRzWzJdKSwgTWF0aC5taW4oOTAsIGJvdW5kc1szXSldO1xuICAgIH1cblxuICAgIGNvbnRhaW5zKHRpbGVJRDogQ2Fub25pY2FsVGlsZUlEKSB7XG4gICAgICAgIGNvbnN0IHdvcmxkU2l6ZSA9IE1hdGgucG93KDIsIHRpbGVJRC56KTtcbiAgICAgICAgY29uc3QgbGV2ZWwgPSB7XG4gICAgICAgICAgICBtaW5YOiBNYXRoLmZsb29yKG1lcmNhdG9yWGZyb21MbmcodGhpcy5ib3VuZHMuZ2V0V2VzdCgpKSAqIHdvcmxkU2l6ZSksXG4gICAgICAgICAgICBtaW5ZOiBNYXRoLmZsb29yKG1lcmNhdG9yWWZyb21MYXQodGhpcy5ib3VuZHMuZ2V0Tm9ydGgoKSkgKiB3b3JsZFNpemUpLFxuICAgICAgICAgICAgbWF4WDogTWF0aC5jZWlsKG1lcmNhdG9yWGZyb21MbmcodGhpcy5ib3VuZHMuZ2V0RWFzdCgpKSAqIHdvcmxkU2l6ZSksXG4gICAgICAgICAgICBtYXhZOiBNYXRoLmNlaWwobWVyY2F0b3JZZnJvbUxhdCh0aGlzLmJvdW5kcy5nZXRTb3V0aCgpKSAqIHdvcmxkU2l6ZSlcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgaGl0ID0gdGlsZUlELnggPj0gbGV2ZWwubWluWCAmJiB0aWxlSUQueCA8IGxldmVsLm1heFggJiYgdGlsZUlELnkgPj0gbGV2ZWwubWluWSAmJiB0aWxlSUQueSA8IGxldmVsLm1heFk7XG4gICAgICAgIHJldHVybiBoaXQ7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUaWxlQm91bmRzO1xuIiwiXG4vL0Zyb20gaHR0cHM6Ly9naXRodWIuY29tL0xlYWZsZXQvTGVhZmxldC9ibG9iL21hc3Rlci9zcmMvY29yZS9VdGlsLmpzXG5jb25zdCBfdGVtcGxhdGVSZSA9IC9cXHsgKihbXFx3X10rKSAqXFx9L2c7XG5jb25zdCBfdGVtcGxhdGUgPSBmdW5jdGlvbiAoc3RyLCBkYXRhKSB7XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKF90ZW1wbGF0ZVJlLCAoc3RyLCBrZXkpID0+IHtcbiAgICAgICAgbGV0IHZhbHVlID0gZGF0YVtrZXldO1xuXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIHZhbHVlIHByb3ZpZGVkIGZvciB2YXJpYWJsZSAke3N0cn1gKTtcblxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZShkYXRhKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSk7XG59O1xuXG4vL0Zyb20gaHR0cHM6Ly9naXRodWIuY29tL0xlYWZsZXQvTGVhZmxldC9ibG9iL21hc3Rlci9zcmMvbGF5ZXIvdGlsZS9UaWxlTGF5ZXIuanNcbmNvbnN0IF9nZXRTdWJkb21haW4gPSBmdW5jdGlvbiAodGlsZVBvaW50LCBzdWJkb21haW5zKSB7XG4gICAgaWYgKHN1YmRvbWFpbnMpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBNYXRoLmFicyh0aWxlUG9pbnQueCArIHRpbGVQb2ludC55KSAlIHN1YmRvbWFpbnMubGVuZ3RoO1xuICAgICAgICByZXR1cm4gc3ViZG9tYWluc1tpbmRleF07XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufTtcblxuZXhwb3J0IHtcbiAgICBfdGVtcGxhdGUsXG4gICAgX2dldFN1YmRvbWFpblxufTtcbiIsIi8vIEBmbG93XG5cbmltcG9ydCB3aW5kb3cgZnJvbSAnLi4vdXRpbC93aW5kb3cnO1xuY29uc3QgeyBIVE1MSW1hZ2VFbGVtZW50LCBIVE1MQ2FudmFzRWxlbWVudCwgSFRNTFZpZGVvRWxlbWVudCwgSW1hZ2VEYXRhIH0gPSB3aW5kb3c7XG5cbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSAnLi4vZ2wvY29udGV4dCc7XG5pbXBvcnQgdHlwZSB7UkdCQUltYWdlLCBBbHBoYUltYWdlfSBmcm9tICcuLi91dGlsL2ltYWdlJztcblxuZXhwb3J0IHR5cGUgVGV4dHVyZUZvcm1hdCA9XG4gICAgfCAkUHJvcGVydHlUeXBlPFdlYkdMUmVuZGVyaW5nQ29udGV4dCwgJ1JHQkEnPlxuICAgIHwgJFByb3BlcnR5VHlwZTxXZWJHTFJlbmRlcmluZ0NvbnRleHQsICdBTFBIQSc+O1xuZXhwb3J0IHR5cGUgVGV4dHVyZUZpbHRlciA9XG4gICAgfCAkUHJvcGVydHlUeXBlPFdlYkdMUmVuZGVyaW5nQ29udGV4dCwgJ0xJTkVBUic+XG4gICAgfCAkUHJvcGVydHlUeXBlPFdlYkdMUmVuZGVyaW5nQ29udGV4dCwgJ0xJTkVBUl9NSVBNQVBfTkVBUkVTVCc+XG4gICAgfCAkUHJvcGVydHlUeXBlPFdlYkdMUmVuZGVyaW5nQ29udGV4dCwgJ05FQVJFU1QnPjtcbmV4cG9ydCB0eXBlIFRleHR1cmVXcmFwID1cbiAgICB8ICRQcm9wZXJ0eVR5cGU8V2ViR0xSZW5kZXJpbmdDb250ZXh0LCAnUkVQRUFUJz5cbiAgICB8ICRQcm9wZXJ0eVR5cGU8V2ViR0xSZW5kZXJpbmdDb250ZXh0LCAnQ0xBTVBfVE9fRURHRSc+XG4gICAgfCAkUHJvcGVydHlUeXBlPFdlYkdMUmVuZGVyaW5nQ29udGV4dCwgJ01JUlJPUkVEX1JFUEVBVCc+O1xuXG50eXBlIEVtcHR5SW1hZ2UgPSB7XG4gICAgd2lkdGg6IG51bWJlcixcbiAgICBoZWlnaHQ6IG51bWJlcixcbiAgICBkYXRhOiBudWxsXG59XG5cbmV4cG9ydCB0eXBlIFRleHR1cmVJbWFnZSA9XG4gICAgfCBSR0JBSW1hZ2VcbiAgICB8IEFscGhhSW1hZ2VcbiAgICB8IEhUTUxJbWFnZUVsZW1lbnRcbiAgICB8IEhUTUxDYW52YXNFbGVtZW50XG4gICAgfCBIVE1MVmlkZW9FbGVtZW50XG4gICAgfCBJbWFnZURhdGFcbiAgICB8IEVtcHR5SW1hZ2U7XG5cbmNsYXNzIFRleHR1cmUge1xuICAgIGNvbnRleHQ6IENvbnRleHQ7XG4gICAgc2l6ZTogW251bWJlciwgbnVtYmVyXTtcbiAgICB0ZXh0dXJlOiBXZWJHTFRleHR1cmU7XG4gICAgZm9ybWF0OiBUZXh0dXJlRm9ybWF0O1xuICAgIGZpbHRlcjogP1RleHR1cmVGaWx0ZXI7XG4gICAgd3JhcDogP1RleHR1cmVXcmFwO1xuICAgIHVzZU1pcG1hcDogYm9vbGVhbjtcblxuICAgIGNvbnN0cnVjdG9yKGNvbnRleHQ6IENvbnRleHQsIGltYWdlOiBUZXh0dXJlSW1hZ2UsIGZvcm1hdDogVGV4dHVyZUZvcm1hdCwgb3B0aW9uczogP3sgcHJlbXVsdGlwbHk/OiBib29sZWFuLCB1c2VNaXBtYXA/OiBib29sZWFuIH0pIHtcbiAgICAgICAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcbiAgICAgICAgdGhpcy5mb3JtYXQgPSBmb3JtYXQ7XG4gICAgICAgIHRoaXMudGV4dHVyZSA9IGNvbnRleHQuZ2wuY3JlYXRlVGV4dHVyZSgpO1xuICAgICAgICB0aGlzLnVwZGF0ZShpbWFnZSwgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgdXBkYXRlKGltYWdlOiBUZXh0dXJlSW1hZ2UsIG9wdGlvbnM6ID97cHJlbXVsdGlwbHk/OiBib29sZWFuLCB1c2VNaXBtYXA/OiBib29sZWFufSkge1xuICAgICAgICBjb25zdCB7d2lkdGgsIGhlaWdodH0gPSBpbWFnZTtcbiAgICAgICAgY29uc3QgcmVzaXplID0gIXRoaXMuc2l6ZSB8fCB0aGlzLnNpemVbMF0gIT09IHdpZHRoIHx8IHRoaXMuc2l6ZVsxXSAhPT0gaGVpZ2h0O1xuICAgICAgICBjb25zdCB7Y29udGV4dH0gPSB0aGlzO1xuICAgICAgICBjb25zdCB7Z2x9ID0gY29udGV4dDtcblxuICAgICAgICB0aGlzLnVzZU1pcG1hcCA9IEJvb2xlYW4ob3B0aW9ucyAmJiBvcHRpb25zLnVzZU1pcG1hcCk7XG4gICAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRoaXMudGV4dHVyZSk7XG5cbiAgICAgICAgY29udGV4dC5waXhlbFN0b3JlVW5wYWNrRmxpcFkuc2V0KGZhbHNlKTtcbiAgICAgICAgY29udGV4dC5waXhlbFN0b3JlVW5wYWNrLnNldCgxKTtcbiAgICAgICAgY29udGV4dC5waXhlbFN0b3JlVW5wYWNrUHJlbXVsdGlwbHlBbHBoYS5zZXQodGhpcy5mb3JtYXQgPT09IGdsLlJHQkEgJiYgKCFvcHRpb25zIHx8IG9wdGlvbnMucHJlbXVsdGlwbHkgIT09IGZhbHNlKSk7XG5cbiAgICAgICAgaWYgKHJlc2l6ZSkge1xuICAgICAgICAgICAgdGhpcy5zaXplID0gW3dpZHRoLCBoZWlnaHRdO1xuXG4gICAgICAgICAgICBpZiAoaW1hZ2UgaW5zdGFuY2VvZiBIVE1MSW1hZ2VFbGVtZW50IHx8IGltYWdlIGluc3RhbmNlb2YgSFRNTENhbnZhc0VsZW1lbnQgfHwgaW1hZ2UgaW5zdGFuY2VvZiBIVE1MVmlkZW9FbGVtZW50IHx8IGltYWdlIGluc3RhbmNlb2YgSW1hZ2VEYXRhKSB7XG4gICAgICAgICAgICAgICAgZ2wudGV4SW1hZ2UyRChnbC5URVhUVVJFXzJELCAwLCB0aGlzLmZvcm1hdCwgdGhpcy5mb3JtYXQsIGdsLlVOU0lHTkVEX0JZVEUsIGltYWdlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZ2wudGV4SW1hZ2UyRChnbC5URVhUVVJFXzJELCAwLCB0aGlzLmZvcm1hdCwgd2lkdGgsIGhlaWdodCwgMCwgdGhpcy5mb3JtYXQsIGdsLlVOU0lHTkVEX0JZVEUsIGltYWdlLmRhdGEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoaW1hZ2UgaW5zdGFuY2VvZiBIVE1MSW1hZ2VFbGVtZW50IHx8IGltYWdlIGluc3RhbmNlb2YgSFRNTENhbnZhc0VsZW1lbnQgfHwgaW1hZ2UgaW5zdGFuY2VvZiBIVE1MVmlkZW9FbGVtZW50IHx8IGltYWdlIGluc3RhbmNlb2YgSW1hZ2VEYXRhKSB7XG4gICAgICAgICAgICAgICAgZ2wudGV4U3ViSW1hZ2UyRChnbC5URVhUVVJFXzJELCAwLCAwLCAwLCBnbC5SR0JBLCBnbC5VTlNJR05FRF9CWVRFLCBpbWFnZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGdsLnRleFN1YkltYWdlMkQoZ2wuVEVYVFVSRV8yRCwgMCwgMCwgMCwgd2lkdGgsIGhlaWdodCwgZ2wuUkdCQSwgZ2wuVU5TSUdORURfQllURSwgaW1hZ2UuZGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy51c2VNaXBtYXAgJiYgdGhpcy5pc1NpemVQb3dlck9mVHdvKCkpIHtcbiAgICAgICAgICAgIGdsLmdlbmVyYXRlTWlwbWFwKGdsLlRFWFRVUkVfMkQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYmluZChmaWx0ZXI6IFRleHR1cmVGaWx0ZXIsIHdyYXA6IFRleHR1cmVXcmFwLCBtaW5GaWx0ZXI6ID9UZXh0dXJlRmlsdGVyKSB7XG4gICAgICAgIGNvbnN0IHtjb250ZXh0fSA9IHRoaXM7XG4gICAgICAgIGNvbnN0IHtnbH0gPSBjb250ZXh0O1xuICAgICAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0aGlzLnRleHR1cmUpO1xuXG4gICAgICAgIGlmIChtaW5GaWx0ZXIgPT09IGdsLkxJTkVBUl9NSVBNQVBfTkVBUkVTVCAmJiAhdGhpcy5pc1NpemVQb3dlck9mVHdvKCkpIHtcbiAgICAgICAgICAgIG1pbkZpbHRlciA9IGdsLkxJTkVBUjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChmaWx0ZXIgIT09IHRoaXMuZmlsdGVyKSB7XG4gICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgZmlsdGVyKTtcbiAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCBtaW5GaWx0ZXIgfHwgZmlsdGVyKTtcbiAgICAgICAgICAgIHRoaXMuZmlsdGVyID0gZmlsdGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHdyYXAgIT09IHRoaXMud3JhcCkge1xuICAgICAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfUywgd3JhcCk7XG4gICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9ULCB3cmFwKTtcbiAgICAgICAgICAgIHRoaXMud3JhcCA9IHdyYXA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpc1NpemVQb3dlck9mVHdvKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zaXplWzBdID09PSB0aGlzLnNpemVbMV0gJiYgKE1hdGgubG9nKHRoaXMuc2l6ZVswXSkgLyBNYXRoLkxOMikgJSAxID09PSAwO1xuICAgIH1cblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICAgIGNvbnN0IHtnbH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgICAgIGdsLmRlbGV0ZVRleHR1cmUodGhpcy50ZXh0dXJlKTtcbiAgICAgICAgdGhpcy50ZXh0dXJlID0gKG51bGw6IGFueSk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUZXh0dXJlO1xuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHsgZXh0ZW5kLCBwaWNrIH0gZnJvbSAnbWFwYm94LWdsL3NyYy91dGlsL3V0aWwnO1xuaW1wb3J0IHsgZ2V0SW1hZ2UsIFJlc291cmNlVHlwZSB9IGZyb20gJ21hcGJveC1nbC9zcmMvdXRpbC9hamF4JztcbmltcG9ydCB7IEV2ZW50LCBFcnJvckV2ZW50LCBFdmVudGVkIH0gZnJvbSAnbWFwYm94LWdsL3NyYy91dGlsL2V2ZW50ZWQnO1xuaW1wb3J0IGxvYWRBcmNHSVNNYXBTZXJ2ZXIgZnJvbSAnLi9sb2FkX2FyY2dpc19tYXBzZXJ2ZXInO1xuaW1wb3J0IFRpbGVCb3VuZHMgZnJvbSAnbWFwYm94LWdsL3NyYy9zb3VyY2UvdGlsZV9ib3VuZHMnO1xuaW1wb3J0IHtfdGVtcGxhdGUsIF9nZXRTdWJkb21haW59IGZyb20gJy4vaGVscGVycyc7XG5pbXBvcnQgVGV4dHVyZSBmcm9tICdtYXBib3gtZ2wvc3JjL3JlbmRlci90ZXh0dXJlJztcblxuaW1wb3J0IHR5cGUge1NvdXJjZX0gZnJvbSAnbWFwYm94LWdsL3NyYy9zb3VyY2Uvc291cmNlJztcbmltcG9ydCB0eXBlIHtPdmVyc2NhbGVkVGlsZUlEfSBmcm9tICdtYXBib3gtZ2wvc3JjL3NvdXJjZS90aWxlX2lkJztcbmltcG9ydCB0eXBlIE1hcCBmcm9tICdtYXBib3gtZ2wvc3JjL3VpL21hcCc7XG5pbXBvcnQgdHlwZSBEaXNwYXRjaGVyIGZyb20gJ21hcGJveC1nbC9zcmMvdXRpbC9kaXNwYXRjaGVyJztcbmltcG9ydCB0eXBlIFRpbGUgZnJvbSAnbWFwYm94LWdsL3NyYy9zb3VyY2UvdGlsZSc7XG5pbXBvcnQgdHlwZSB7Q2FsbGJhY2t9IGZyb20gJ21hcGJveC1nbC9zcmMvdHlwZXMvY2FsbGJhY2snO1xuXG5jbGFzcyBBcmNHSVNUaWxlZE1hcFNlcnZpY2VTb3VyY2UgZXh0ZW5kcyBFdmVudGVkIGltcGxlbWVudHMgU291cmNlIHtcblxuICAgIHR5cGU6ICdyYXN0ZXInIHwgJ3Jhc3Rlci1kZW0nO1xuICAgIGlkOiBzdHJpbmc7XG4gICAgbWluem9vbTogbnVtYmVyO1xuICAgIG1heHpvb206IG51bWJlcjtcbiAgICB1cmw6IHN0cmluZztcbiAgICBzY2hlbWU6IHN0cmluZztcbiAgICB0aWxlU2l6ZTogbnVtYmVyO1xuXG4gICAgYm91bmRzOiA/W251bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlcl07XG4gICAgdGlsZUJvdW5kczogVGlsZUJvdW5kcztcbiAgICByb3VuZFpvb206IGJvb2xlYW47XG4gICAgZGlzcGF0Y2hlcjogRGlzcGF0Y2hlcjtcbiAgICBtYXA6IE1hcDtcbiAgICB0aWxlczogQXJyYXk8c3RyaW5nPjtcblxuICAgIF9sb2FkZWQ6IGJvb2xlYW47XG4gICAgX29wdGlvbnM6IFJhc3RlclNvdXJjZVNwZWNpZmljYXRpb24gfCBSYXN0ZXJERU1Tb3VyY2VTcGVjaWZpY2F0aW9uO1xuXG4gICAgY29uc3RydWN0b3IoaWQ6IHN0cmluZywgb3B0aW9uczogUmFzdGVyU291cmNlU3BlY2lmaWNhdGlvbiB8IFJhc3RlckRFTVNvdXJjZVNwZWNpZmljYXRpb24sIGRpc3BhdGNoZXI6IERpc3BhdGNoZXIsIGV2ZW50ZWRQYXJlbnQ6IEV2ZW50ZWQpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xuICAgICAgICB0aGlzLmRpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xuICAgICAgICB0aGlzLnNldEV2ZW50ZWRQYXJlbnQoZXZlbnRlZFBhcmVudCk7XG5cbiAgICAgICAgdGhpcy50eXBlID0gJ2FyY2dpc3Jhc3Rlcic7XG4gICAgICAgIHRoaXMubWluem9vbSA9IDA7XG4gICAgICAgIHRoaXMubWF4em9vbSA9IDIyO1xuICAgICAgICB0aGlzLnJvdW5kWm9vbSA9IHRydWU7XG4gICAgICAgIHRoaXMudGlsZVNpemUgPSA1MTI7XG4gICAgICAgIHRoaXMuX2xvYWRlZCA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuX29wdGlvbnMgPSBleHRlbmQoe30sIG9wdGlvbnMpO1xuICAgICAgICBleHRlbmQodGhpcywgcGljayhvcHRpb25zLCBbJ3VybCcsICdzY2hlbWUnLCAndGlsZVNpemUnXSkpO1xuICAgIH1cblxuICAgIGxvYWQoKSB7XG4gICAgICAgIHRoaXMuZmlyZShuZXcgRXZlbnQoJ2RhdGFsb2FkaW5nJywge2RhdGFUeXBlOiAnc291cmNlJ30pKTtcbiAgICAgICAgbG9hZEFyY0dJU01hcFNlcnZlcih0aGlzLl9vcHRpb25zLCAoZXJyLCBtZXRhZGF0YSkgPT4ge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHRoaXMuZmlyZShuZXcgRXJyb3JFdmVudChlcnIpKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobWV0YWRhdGEpIHtcbiAgICAgICAgICAgICAgICBleHRlbmQodGhpcywgbWV0YWRhdGEpO1xuXG4gICAgICAgICAgICAgICAgaWYgKG1ldGFkYXRhLmJvdW5kcykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRpbGVCb3VuZHMgPSBuZXcgVGlsZUJvdW5kcyhtZXRhZGF0YS5ib3VuZHMsIHRoaXMubWluem9vbSwgdGhpcy5tYXh6b29tKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGBjb250ZW50YCBpcyBpbmNsdWRlZCBoZXJlIHRvIHByZXZlbnQgYSByYWNlIGNvbmRpdGlvbiB3aGVyZSBgU3R5bGUjX3VwZGF0ZVNvdXJjZXNgIGlzIGNhbGxlZFxuICAgICAgICAgICAgLy8gYmVmb3JlIHRoZSBUaWxlSlNPTiBhcnJpdmVzLiB0aGlzIG1ha2VzIHN1cmUgdGhlIHRpbGVzIG5lZWRlZCBhcmUgbG9hZGVkIG9uY2UgVGlsZUpTT04gYXJyaXZlc1xuICAgICAgICAgICAgLy8gcmVmOiBodHRwczovL2dpdGh1Yi5jb20vbWFwYm94L21hcGJveC1nbC1qcy9wdWxsLzQzNDcjZGlzY3Vzc2lvbl9yMTA0NDE4MDg4XG4gICAgICAgICAgICB0aGlzLmZpcmUobmV3IEV2ZW50KCdkYXRhJywge2RhdGFUeXBlOiAnc291cmNlJywgc291cmNlRGF0YVR5cGU6ICdtZXRhZGF0YSd9KSk7XG4gICAgICAgICAgICB0aGlzLmZpcmUobmV3IEV2ZW50KCdkYXRhJywge2RhdGFUeXBlOiAnc291cmNlJywgc291cmNlRGF0YVR5cGU6ICdjb250ZW50J30pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb25BZGQobWFwOiBNYXApIHtcbiAgICAgICAgLy8gc2V0IHRoZSB1cmxzXG4gICAgICAgIGNvbnN0IGJhc2VVcmwgPSB0aGlzLnVybC5zcGxpdCgnPycpWzBdO1xuICAgICAgICB0aGlzLnRpbGVVcmwgPSBgJHtiYXNlVXJsfS90aWxlL3t6fS97eX0ve3h9YDtcblxuICAgICAgICBjb25zdCBhcmNnaXNvbmxpbmUgPSBuZXcgUmVnRXhwKC90aWxlcy5hcmNnaXMob25saW5lKT9cXC5jb20vZyk7XG4gICAgICAgIGlmIChhcmNnaXNvbmxpbmUudGVzdCh0aGlzLnVybCkpIHtcbiAgICAgICAgICAgIHRoaXMudGlsZVVybCA9IHRoaXMudGlsZVVybC5yZXBsYWNlKCc6Ly90aWxlcycsICc6Ly90aWxlc3tzfScpO1xuICAgICAgICAgICAgdGhpcy5zdWJkb21haW5zID0gWycxJywgJzInLCAnMycsICc0J107XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy50b2tlbikge1xuICAgICAgICAgICAgdGhpcy50aWxlVXJsICs9IChgP3Rva2VuPSR7dGhpcy50b2tlbn1gKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdGhpcy5tYXAgPSBtYXA7XG4gICAgICAgIHRoaXMubG9hZCgpO1xuICAgIH1cblxuICAgIHNlcmlhbGl6ZSgpIHtcbiAgICAgICAgcmV0dXJuIGV4dGVuZCh7fSwgdGhpcy5fb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgaGFzVGlsZSh0aWxlSUQ6IE92ZXJzY2FsZWRUaWxlSUQpIHtcbiAgICAgICAgcmV0dXJuICF0aGlzLnRpbGVCb3VuZHMgfHwgdGhpcy50aWxlQm91bmRzLmNvbnRhaW5zKHRpbGVJRC5jYW5vbmljYWwpO1xuICAgIH1cblxuICAgIGxvYWRUaWxlKHRpbGU6IFRpbGUsIGNhbGxiYWNrOiBDYWxsYmFjazx2b2lkPikge1xuICAgICAgICAvL2NvbnZlcnQgdG8gYWdzIGNvb3Jkc1xuICAgICAgICBjb25zdCB0aWxlUG9pbnQgPSB7IHo6IHRpbGUudGlsZUlELm92ZXJzY2FsZWRaLCB4OiB0aWxlLnRpbGVJRC5jYW5vbmljYWwueCwgeTogdGlsZS50aWxlSUQuY2Fub25pY2FsLnkgfTtcblxuICAgICAgICBjb25zdCB1cmwgPSAgX3RlbXBsYXRlKHRoaXMudGlsZVVybCwgZXh0ZW5kKHtcbiAgICAgICAgICAgIHM6IF9nZXRTdWJkb21haW4odGlsZVBvaW50LCB0aGlzLnN1YmRvbWFpbnMpLFxuICAgICAgICAgICAgejogKHRoaXMuX2xvZE1hcCAmJiB0aGlzLl9sb2RNYXBbdGlsZVBvaW50LnpdKSA/IHRoaXMuX2xvZE1hcFt0aWxlUG9pbnQuel0gOiB0aWxlUG9pbnQueiwgLy8gdHJ5IGxvZCBtYXAgZmlyc3QsIHRoZW4ganVzdCBkZWZ1YWx0IHRvIHpvb20gbGV2ZWxcbiAgICAgICAgICAgIHg6IHRpbGVQb2ludC54LFxuICAgICAgICAgICAgeTogdGlsZVBvaW50LnlcbiAgICAgICAgfSwgdGhpcy5vcHRpb25zKSk7XG4gICAgICAgIHRpbGUucmVxdWVzdCA9IGdldEltYWdlKHt1cmx9LCAgKGVyciwgaW1nKSA9PiB7XG4gICAgICAgICAgICBkZWxldGUgdGlsZS5yZXF1ZXN0O1xuXG4gICAgICAgICAgICBpZiAodGlsZS5hYm9ydGVkKSB7XG4gICAgICAgICAgICAgICAgdGlsZS5zdGF0ZSA9ICd1bmxvYWRlZCc7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHRpbGUuc3RhdGUgPSAnZXJyb3JlZCc7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaW1nKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubWFwLl9yZWZyZXNoRXhwaXJlZFRpbGVzKSB0aWxlLnNldEV4cGlyeURhdGEoaW1nKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgKGltZzogYW55KS5jYWNoZUNvbnRyb2w7XG4gICAgICAgICAgICAgICAgZGVsZXRlIChpbWc6IGFueSkuZXhwaXJlcztcblxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzLm1hcC5wYWludGVyLmNvbnRleHQ7XG4gICAgICAgICAgICAgICAgY29uc3QgZ2wgPSBjb250ZXh0LmdsO1xuICAgICAgICAgICAgICAgIHRpbGUudGV4dHVyZSA9IHRoaXMubWFwLnBhaW50ZXIuZ2V0VGlsZVRleHR1cmUoaW1nLndpZHRoKTtcbiAgICAgICAgICAgICAgICBpZiAodGlsZS50ZXh0dXJlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRpbGUudGV4dHVyZS51cGRhdGUoaW1nLCB7IHVzZU1pcG1hcDogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aWxlLnRleHR1cmUgPSBuZXcgVGV4dHVyZShjb250ZXh0LCBpbWcsIGdsLlJHQkEsIHsgdXNlTWlwbWFwOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgICAgICB0aWxlLnRleHR1cmUuYmluZChnbC5MSU5FQVIsIGdsLkNMQU1QX1RPX0VER0UsIGdsLkxJTkVBUl9NSVBNQVBfTkVBUkVTVCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnRleHQuZXh0VGV4dHVyZUZpbHRlckFuaXNvdHJvcGljKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJmKGdsLlRFWFRVUkVfMkQsIGNvbnRleHQuZXh0VGV4dHVyZUZpbHRlckFuaXNvdHJvcGljLlRFWFRVUkVfTUFYX0FOSVNPVFJPUFlfRVhULCBjb250ZXh0LmV4dFRleHR1cmVGaWx0ZXJBbmlzb3Ryb3BpY01heCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aWxlLnN0YXRlID0gJ2xvYWRlZCc7XG5cbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYWJvcnRUaWxlKHRpbGU6IFRpbGUsIGNhbGxiYWNrOiBDYWxsYmFjazx2b2lkPikge1xuICAgICAgICBpZiAodGlsZS5yZXF1ZXN0KSB7XG4gICAgICAgICAgICB0aWxlLnJlcXVlc3QuY2FuY2VsKCk7XG4gICAgICAgICAgICBkZWxldGUgdGlsZS5yZXF1ZXN0O1xuICAgICAgICB9XG4gICAgICAgIGNhbGxiYWNrKCk7XG4gICAgfVxuXG4gICAgdW5sb2FkVGlsZSh0aWxlOiBUaWxlLCBjYWxsYmFjazogQ2FsbGJhY2s8dm9pZD4pIHtcbiAgICAgICAgaWYgKHRpbGUudGV4dHVyZSkgdGhpcy5tYXAucGFpbnRlci5zYXZlVGlsZVRleHR1cmUodGlsZS50ZXh0dXJlKTtcbiAgICAgICAgY2FsbGJhY2soKTtcbiAgICB9XG5cbiAgICBoYXNUcmFuc2l0aW9uKCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBBcmNHSVNUaWxlZE1hcFNlcnZpY2VTb3VyY2U7Il0sIm5hbWVzIjpbImxldCIsImNvbnN0IiwiVW5pdEJlemllciIsIndpbmRvdyIsImV4cG9ydGVkIiwiYnJvd3NlciIsIndlYnBTdXBwb3J0ZWQiLCJ2ZXJzaW9uIiwidXVpZCIsInRoaXMiLCJzdXBlciIsImxpc3RlbmVyIiwiU3BoZXJpY2FsTWVyY2F0b3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUE0QkEsY0FBYyxHQUFHLFVBQVUsQ0FBQzs7QUFFNUIsU0FBUyxVQUFVLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFOztJQUVwQyxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFDcEIsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7SUFDdEMsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDOztJQUVsQyxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFDcEIsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7SUFDdEMsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDOztJQUVsQyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztJQUNmLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0lBQ2YsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFDZixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztDQUNsQjs7QUFFRCxVQUFVLENBQUMsU0FBUyxDQUFDLFlBQVksR0FBRyxTQUFTLENBQUMsRUFBRTs7SUFFNUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7Q0FDdEQsQ0FBQzs7QUFFRixVQUFVLENBQUMsU0FBUyxDQUFDLFlBQVksR0FBRyxTQUFTLENBQUMsRUFBRTtJQUM1QyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztDQUN0RCxDQUFDOztBQUVGLFVBQVUsQ0FBQyxTQUFTLENBQUMsc0JBQXNCLEdBQUcsU0FBUyxDQUFDLEVBQUU7SUFDdEQsT0FBTyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztDQUM1RCxDQUFDOztBQUVGLFVBQVUsQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQyxFQUFFLE9BQU8sRUFBRTtJQUNwRCxJQUFJLE9BQU8sT0FBTyxLQUFLLFdBQVcsSUFBRSxPQUFPLEdBQUcsSUFBSSxHQUFDOztJQUVuRCxJQUFJLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7OztJQUd0QixLQUFLLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFOztRQUU1QixFQUFFLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDL0IsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sSUFBRSxPQUFP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QUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDbkUsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUM5QyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM3RSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDM0MsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDOzs7SUFHM0MsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztHQUNmO0NBQ0YsQ0FBQzs7Ozs7O0FBTUYsaUJBQWlCLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBRyxTQUFTLEVBQUUsRUFBRSxJQUFJLEVBQUU7RUFDbEQsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7SUFDakIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN6QyxJQUFJLEVBQUUsSUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7SUFDdEIsSUFBSSxFQUFFLElBQUksSUFBSSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNoQyxJQUFJLEVBQUUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0lBQ2xCLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQztJQUMzQixJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDO0lBQzVCLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM3RCxPQUFPLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0dBQ25CLE1BQU07SUFDTCxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ25ELElBQUksR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNsRCxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDN0QsT0FBTyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztHQUNuQjtDQUNGLENBQUM7Ozs7Ozs7Ozs7QUFVRixpQkFBaUIsQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRTs7SUFFcEUsSUFBSSxTQUFTLEVBQUU7UUFDWCxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ25DOztJQUVELElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDOztJQUUvQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMvQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQzs7O0lBR3ZELElBQUksR0FBRyxLQUFLLFFBQVEsRUFBRTtRQUNsQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQ3ZDLE1BQU07UUFDSCxPQUFPLElBQUksQ0FBQztLQUNmO0NBQ0osQ0FBQzs7Ozs7Ozs7O0FBU0YsaUJBQWlCLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBRyxTQUFTLElBQUksRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRTs7SUFFbkUsSUFBSSxHQUFHLEtBQUssUUFBUSxFQUFFO1FBQ2xCLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztLQUN0Qzs7SUFFRCxJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM1QixJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM1QixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUM5QixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQzs7SUFFOUIsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7SUFDckYsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7SUFDckYsSUFBSSxNQUFNLEdBQUc7UUFDVCxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUMvRCxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFB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
