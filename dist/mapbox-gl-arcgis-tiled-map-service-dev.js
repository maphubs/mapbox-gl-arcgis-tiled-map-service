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

// The following methods are from https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_Unicode_Problem
//Unicode compliant base64 encoder for strings
function b64EncodeUnicode(str        ) {
    return self.btoa(
        encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
            function (match, p1) {
                return String.fromCharCode(Number('0x' + p1)); //eslint-disable-line
            }
        )
    );
}


// Unicode compliant decoder for base64-encoded strings
function b64DecodeUnicode(str        ) {
    return decodeURIComponent(self.atob(str).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2); //eslint-disable-line
    }).join(''));
}

//       strict

                
                  
                      
                       
                                
                        
                                     
   

var config         = {
    API_URL: 'https://api.mapbox.com',
    get EVENTS_URL() {
        if (!this.API_URL) { return null; }
        if (this.API_URL.indexOf('https://api.mapbox.cn') === 0) {
            return 'https://events.mapbox.cn/events/v2';
        } else if (this.API_URL.indexOf('https://api.mapbox.com') === 0) {
            return 'https://events.mapbox.com/events/v2';
        } else {
            return null;
        }
    },
    FEEDBACK_URL: 'https://apps.mapbox.com/feedback',
    REQUIRE_ACCESS_TOKEN: true,
    ACCESS_TOKEN: null,
    MAX_PARALLEL_IMAGE_REQUESTS: 16
};

//       strict
                                                      

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

var linkEl;

/**
 * @private
 */
var exported = {
    /**
     * Provides a function that outputs milliseconds: either performance.now()
     * or a fallback to Date.now()
     */
    now: now,

    frame: function frame(fn            )             {
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
        if (!linkEl) { linkEl = self.document.createElement('a'); }
        linkEl.href = path;
        return linkEl.href;
    },

    hardwareConcurrency: self.navigator.hardwareConcurrency || 4,
    get devicePixelRatio() { return self.devicePixelRatio; }
};

//       strict

var exported$1 = {
    supported: false,
    testSupport: testSupport
};

var glForTesting;
var webpCheckComplete = false;
var webpImgTest;
var webpImgTestOnloadComplete = false;

if (self.document) {
    webpImgTest = self.document.createElement('img');
    webpImgTest.onload = function() {
        if (glForTesting) { testWebpTextureUpload(glForTesting); }
        glForTesting = null;
        webpImgTestOnloadComplete = true;
    };
    webpImgTest.onerror = function() {
        webpCheckComplete = true;
        glForTesting = null;
    };
    webpImgTest.src = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAQAAAAfQ//73v/+BiOh/AAA=';
}

function testSupport(gl                       ) {
    if (webpCheckComplete || !webpImgTest) { return; }

    // HTMLImageElement.complete is set when an image is done loading it's source
    // regardless of whether the load was successful or not.
    // It's possible for an error to set HTMLImageElement.complete to true which would trigger
    // testWebpTextureUpload and mistakenly set exported.supported to true in browsers which don't support webp
    // To avoid this, we set a flag in the image's onload handler and only call testWebpTextureUpload
    // after a successful image load event.
    if (webpImgTestOnloadComplete) {
        testWebpTextureUpload(gl);
    } else {
        glForTesting = gl;

    }
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

//      

/***** START WARNING - IF YOU USE THIS CODE WITH MAPBOX MAPPING APIS, REMOVAL OR
* MODIFICATION OF THE FOLLOWING CODE VIOLATES THE MAPBOX TERMS OF SERVICE  ******
* The following code is used to access Mapbox's Mapping APIs. Removal or modification
* of this code when used with Mapbox's Mapping APIs can result in higher fees and/or
* termination of your account with Mapbox.
*
* Under the Mapbox Terms of Service, you may not use this code to access Mapbox
* Mapping APIs other than through Mapbox SDKs.
*
* The Mapping APIs documentation is available at https://docs.mapbox.com/api/maps/#maps
* and the Mapbox Terms of Service are available at https://www.mapbox.com/tos/
******************************************************************************/

                        
                  
                          
   

var SKU_ID = '01';

function createSkuToken()                 {
    // SKU_ID and TOKEN_VERSION are specified by an internal schema and should not change
    var TOKEN_VERSION = '1';
    var base62chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    // sessionRandomizer is a randomized 10-digit base-62 number
    var sessionRandomizer = '';
    for (var i = 0; i < 10; i++) {
        sessionRandomizer += base62chars[Math.floor(Math.random() * 62)];
    }
    var expiration = 12 * 60 * 60 * 1000; // 12 hours
    var token = [TOKEN_VERSION, SKU_ID, sessionRandomizer].join('');
    var tokenExpiresAt = Date.now() + expiration;

    return { token: token, tokenExpiresAt: tokenExpiresAt };
}

/***** END WARNING - REMOVAL OR MODIFICATION OF THE
PRECEDING CODE VIOLATES THE MAPBOX TERMS OF SERVICE  ******/

var _from = "mapbox-gl@1.1.0";
var _id = "mapbox-gl@1.1.0";
var _inBundle = false;
var _integrity = "sha512-ODwesguQJM7FobmSlv/qGJkmrzUTlIRe92dEBy587RV2k2QGsQDQUCk6/KE+lzVJuyk7WQappNkzhgagaxY5Eg==";
var _location = "/mapbox-gl";
var _phantomChildren = {
};
var _requested = {
	type: "version",
	registry: true,
	raw: "mapbox-gl@1.1.0",
	name: "mapbox-gl",
	escapedName: "mapbox-gl",
	rawSpec: "1.1.0",
	saveSpec: null,
	fetchSpec: "1.1.0"
};
var _requiredBy = [
	"#DEV:/",
	"#USER"
];
var _resolved = "https://registry.npmjs.org/mapbox-gl/-/mapbox-gl-1.1.0.tgz";
var _shasum = "01b907fa025e49e2000c91878de3b68245ce9770";
var _spec = "mapbox-gl@1.1.0";
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
	"@mapbox/geojson-rewind": "^0.4.0",
	"@mapbox/geojson-types": "^1.0.2",
	"@mapbox/jsonlint-lines-primitives": "^2.0.2",
	"@mapbox/mapbox-gl-supported": "^1.4.0",
	"@mapbox/point-geometry": "^0.1.0",
	"@mapbox/tiny-sdf": "^1.1.0",
	"@mapbox/unitbezier": "^0.0.0",
	"@mapbox/vector-tile": "^1.3.1",
	"@mapbox/whoots-js": "^3.1.0",
	csscolorparser: "~1.0.2",
	earcut: "^2.1.5",
	esm: "~3.0.84",
	"geojson-vt": "^3.2.1",
	"gl-matrix": "^3.0.0",
	"grid-index": "^1.1.0",
	minimist: "0.0.8",
	"murmurhash-js": "^1.0.0",
	pbf: "^3.0.5",
	potpack: "^1.0.1",
	quickselect: "^2.0.0",
	rw: "^1.3.3",
	supercluster: "^6.0.1",
	tinyqueue: "^2.0.0",
	"vt-pbf": "^3.1.1"
};
var deprecated = false;
var description = "A WebGL interactive maps library";
var devDependencies = {
	"@mapbox/appropriate-images": "^2.0.0",
	"@mapbox/appropriate-images-react": "^1.0.0",
	"@mapbox/batfish": "1.9.8",
	"@mapbox/dr-ui": "0.6.0",
	"@mapbox/flow-remove-types": "^1.3.0-await.upstream.2",
	"@mapbox/gazetteer": "^3.1.2",
	"@mapbox/mapbox-gl-rtl-text": "^0.2.1",
	"@mapbox/mapbox-gl-test-suite": "file:test/integration",
	"@mapbox/mbx-assembly": "^0.28.2",
	"@mapbox/mr-ui": "0.5.0",
	"@octokit/rest": "^15.15.1",
	"babel-eslint": "^10.0.1",
	benchmark: "^2.1.4",
	browserify: "^16.2.3",
	d3: "^4.12.0",
	documentation: "~9.1.1",
	ejs: "^2.5.7",
	eslint: "^5.15.3",
	"eslint-config-mourner": "^3.0.0",
	"eslint-plugin-flowtype": "^3.9.1",
	"eslint-plugin-html": "^5.0.5",
	"eslint-plugin-import": "^2.16.0",
	"eslint-plugin-react": "^7.12.4",
	"flow-bin": "^0.100.0",
	"github-slugger": "1.2.1",
	gl: "~4.1.1",
	glob: "^7.0.3",
	"is-builtin-module": "^3.0.0",
	jsdom: "^13.0.0",
	"json-stringify-pretty-compact": "^2.0.0",
	jsonwebtoken: "^8.3.0",
	"mock-geolocation": "^1.0.11",
	"npm-run-all": "^4.1.5",
	nyc: "^13.3.0",
	"object.entries": "^1.1.0",
	pirates: "^4.0.1",
	pngjs: "^3.4.0",
	"postcss-cli": "^6.1.2",
	"postcss-inline-svg": "^3.1.1",
	"pretty-bytes": "^5.1.0",
	prismjs: "^1.15.0",
	"prop-types": "^15.6.2",
	puppeteer: "^1.13.0",
	"raw-loader": "^1.0.0",
	react: "^16.7.0",
	"react-dom": "16.3.3",
	"react-helmet": "^5.2.0",
	remark: "^10.0.1",
	"remark-html": "^9.0.0",
	"remark-react": "^5.0.1",
	request: "^2.88.0",
	rollup: "^1.7.3",
	"rollup-plugin-buble": "^0.19.6",
	"rollup-plugin-commonjs": "^9.2.2",
	"rollup-plugin-json": "^4.0.0",
	"rollup-plugin-node-resolve": "^4.0.1",
	"rollup-plugin-replace": "^2.1.1",
	"rollup-plugin-sourcemaps": "^0.4.2",
	"rollup-plugin-terser": "^4.0.4",
	"rollup-plugin-unassert": "^0.3.0",
	sinon: "^7.3.2",
	slugg: "^1.2.1",
	st: "^1.2.2",
	stylelint: "^9.10.1",
	"stylelint-config-standard": "^18.2.0",
	tap: "~12.4.1"
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
	build: "run-s build-docs && batfish build # invoked by publisher when publishing docs on the publisher-production branch",
	"build-benchmarks": "BENCHMARK_VERSION=${BENCHMARK_VERSION:-\"$(git rev-parse --abbrev-ref HEAD) $(git rev-parse --short=7 HEAD)\"} rollup -c bench/versions/rollup_config_benchmarks.js",
	"build-csp": "rollup -c rollup.config.csp.js",
	"build-css": "postcss -o dist/mapbox-gl.css src/css/mapbox-gl.css",
	"build-dev": "rollup -c --environment BUILD:dev",
	"build-docs": "documentation build --github --format json --config ./docs/documentation.yml --output docs/components/api.json src/index.js && npm run build-images",
	"build-flow-types": "cp build/mapbox-gl.js.flow dist/mapbox-gl.js.flow && cp build/mapbox-gl.js.flow dist/mapbox-gl-dev.js.flow",
	"build-images": "mkdir -p docs/img/dist && node docs/bin/build-image-config.js && node docs/bin/appropriate-images.js --all",
	"build-prod": "rollup -c --environment BUILD:production",
	"build-prod-min": "rollup -c --environment BUILD:production,MINIFY:true",
	"build-style-spec": "cd src/style-spec && npm run build && cd ../.. && mkdir -p dist/style-spec && cp src/style-spec/dist/* dist/style-spec",
	"build-token": "node build/generate-access-token-script.js",
	codegen: "build/run-node build/generate-style-code.js && build/run-node build/generate-struct-arrays.js",
	"create-image": "node docs/bin/create-image",
	lint: "eslint --cache --ignore-path .gitignore src test bench docs docs/pages/example/*.html debug/*.html",
	"lint-css": "stylelint 'src/css/mapbox-gl.css'",
	"lint-docs": "documentation lint src/index.js",
	"open-changed-examples": "git diff --name-only publisher-production HEAD -- docs/pages/example/*.html | awk '{print \"http://127.0.0.1:4000/mapbox-gl-js/example/\" substr($0,33,length($0)-37)}' | xargs open",
	prepublishOnly: "run-s build-flow-types build-dev build-prod-min build-prod build-csp build-css build-style-spec test-build",
	start: "run-p build-token watch-css watch-dev watch-benchmarks start-server",
	"start-bench": "run-p build-token watch-benchmarks start-server",
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
	"test-suite-clean": "find test/integration/{render,query}-tests -mindepth 2 -type d -exec test -e \"{}/actual.png\" \\; -not \\( -exec test -e \"{}/style.json\" \\; \\) -print | xargs -t rm -r",
	"test-unit": "build/run-tap --reporter classic --no-coverage test/unit",
	"watch-benchmarks": "BENCHMARK_VERSION=${BENCHMARK_VERSION:-\"$(git rev-parse --abbrev-ref HEAD) $(git rev-parse --short=7 HEAD)\"} rollup -c bench/rollup_config_benchmarks.js -w",
	"watch-css": "postcss --watch -o dist/mapbox-gl.css src/css/mapbox-gl.css",
	"watch-dev": "rollup -c --environment BUILD:dev --watch"
};
var style = "dist/mapbox-gl.css";
var version = "1.1.0";
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

                                                
                                                      
                                                  

                                                   
                                                                                                           

                   
                     
                      
                 
                         
   

var RequestManager = function RequestManager(transformRequestFn                        ) {
     this._transformRequestFn = transformRequestFn;
     this._createSkuToken();
 };

 RequestManager.prototype._createSkuToken = function _createSkuToken () {
     var skuToken = createSkuToken();
     this._skuToken = skuToken.token;
     this._skuTokenExpiresAt = skuToken.tokenExpiresAt;
 };

 RequestManager.prototype._isSkuTokenExpired = function _isSkuTokenExpired ()       {
     return Date.now() > this._skuTokenExpiresAt;
 };

 RequestManager.prototype.transformRequest = function transformRequest (url     , type               ) {
     if (this._transformRequestFn) {
         return this._transformRequestFn(url, type) || {url: url};
     }

     return {url: url};
 };

 RequestManager.prototype.normalizeStyleURL = function normalizeStyleURL$1 (url     , accessToken      )      {
     return normalizeStyleURL(url, accessToken);
 };

 RequestManager.prototype.normalizeGlyphsURL = function normalizeGlyphsURL$1 (url     , accessToken      )      {
     return normalizeGlyphsURL(url, accessToken);
 };

 RequestManager.prototype.normalizeSourceURL = function normalizeSourceURL$1 (url     , accessToken      )      {
     return normalizeSourceURL(url, accessToken);
 };

 RequestManager.prototype.normalizeSpriteURL = function normalizeSpriteURL$1 (url     , format     , extension     , accessToken      )      {
     return normalizeSpriteURL(url, format, extension, accessToken);
 };

 RequestManager.prototype.normalizeTileURL = function normalizeTileURL$1 (tileURL     , sourceURL       , tileSize       )      {
     if (this._isSkuTokenExpired()) {
         this._createSkuToken();
     }

     return normalizeTileURL(tileURL, sourceURL, tileSize, this._skuToken);
 };

 RequestManager.prototype.canonicalizeTileURL = function canonicalizeTileURL$1 (url     ) {
     return canonicalizeTileURL(url);
 };

 RequestManager.prototype.canonicalizeTileset = function canonicalizeTileset$1 (tileJSON       , sourceURL     ) {
     return canonicalizeTileset(tileJSON, sourceURL);
 };

var help = 'See https://www.mapbox.com/api-documentation/#access-tokens-and-token-scopes';

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

function hasCacheDefeatingSku(url        ) {
    return url.indexOf('sku=') > 0 && isMapboxHTTPURL(url);
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

var normalizeTileURL = function(tileURL        , sourceURL          , tileSize          , skuToken         )         {
    if (!sourceURL || !isMapboxURL(sourceURL)) { return tileURL; }

    var urlObject = parseUrl(tileURL);

    // The v4 mapbox tile API supports 512x512 image tiles only when @2x
    // is appended to the tile URL. If `tileSize: 512` is specified for
    // a Mapbox raster source force the @2x suffix even if a non hidpi device.
    var suffix = exported.devicePixelRatio >= 2 || tileSize === 512 ? '@2x' : '';
    var extension = exported$1.supported ? '.webp' : '$1';
    urlObject.path = urlObject.path.replace(imageExtensionRe, ("" + suffix + extension));
    urlObject.path = "/v4" + (urlObject.path);

    if (config.REQUIRE_ACCESS_TOKEN && config.ACCESS_TOKEN && skuToken) {
        urlObject.params.push(("sku=" + skuToken));
    }

    return makeAPIURL(urlObject);
};

// matches any file extension specified by a dot and one or more alphanumeric characters
var extensionRe = /\.[\w]+$/;

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

var telemEventKey = 'mapbox.eventData';

function parseAccessToken(accessToken         ) {
    if (!accessToken) {
        return null;
    }

    var parts = accessToken.split('.');
    if (!parts || parts.length !== 3) {
        return null;
    }

    try {
        var jsonData = JSON.parse(b64DecodeUnicode(parts[1]));
        return jsonData;
    } catch (e) {
        return null;
    }
}

                                                          

var TelemetryEvent = function TelemetryEvent(type                 ) {
     this.type = type;
     this.anonId = null;
     this.eventData = {};
     this.queue = [];
     this.pendingRequest = null;
 };

 TelemetryEvent.prototype.getStorageKey = function getStorageKey (domain      ) {
     var tokenData = parseAccessToken(config.ACCESS_TOKEN);
     var u = '';
     if (tokenData && tokenData['u']) {
         u = b64EncodeUnicode(tokenData['u']);
     } else {
         u = config.ACCESS_TOKEN || '';
     }
     return domain ?
         (telemEventKey + "." + domain + ":" + u) :
         (telemEventKey + ":" + u);
 };

 TelemetryEvent.prototype.fetchEventData = function fetchEventData () {
     var isLocalStorageAvailable = storageAvailable('localStorage');
     var storageKey = this.getStorageKey();
     var uuidKey = this.getStorageKey('uuid');

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
     var storageKey =  this.getStorageKey();
     var uuidKey = this.getStorageKey('uuid');
     if (isLocalStorageAvailable) {
         try {
             self.localStorage.setItem(uuidKey, this.anonId);
             if (Object.keys(this.eventData).length >= 1) {
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

     if (!config.EVENTS_URL) { return; }
     var eventsUrlObject         = parseUrl(config.EVENTS_URL);
     eventsUrlObject.params.push(("access_token=" + (config.ACCESS_TOKEN || '')));
     var payload      = {
         event: this.type,
         created: new Date(timestamp).toISOString(),
         sdkIdentifier: 'mapbox-gl-js',
         sdkVersion: version,
         skuId: SKU_ID,
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
        this.skuToken = '';
    }

   if ( TelemetryEvent ) MapLoadEvent.__proto__ = TelemetryEvent;
   MapLoadEvent.prototype = Object.create( TelemetryEvent && TelemetryEvent.prototype );
   MapLoadEvent.prototype.constructor = MapLoadEvent;

    MapLoadEvent.prototype.postMapLoadEvent = function postMapLoadEvent (tileUrls               , mapId        , skuToken        ) {
        //Enabled only when Mapbox Access Token is set and a source uses
        // mapbox tiles.
        this.skuToken = skuToken;

        if (config.EVENTS_URL &&
            config.ACCESS_TOKEN &&
            Array.isArray(tileUrls) &&
            tileUrls.some(function (url) { return isMapboxURL(url) || isMapboxHTTPURL(url); })) {
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

        this.postEvent(timestamp, {skuToken: this.skuToken}, function (err) {
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
        if (config.EVENTS_URL &&
            config.ACCESS_TOKEN &&
            Array.isArray(tileUrls) &&
            tileUrls.some(function (url) { return isMapboxURL(url) || isMapboxHTTPURL(url); })) {
            this.queueRequest(Date.now());
        }
    };


    TurnstileEvent.prototype.processRequests = function processRequests () {
        var this$1 = this;

        if (this.pendingRequest || this.queue.length === 0) {
            return;
        }

        if (!this.anonId || !this.eventData.lastSuccess || !this.eventData.tokenU) {
            //Retrieve cached data
            this.fetchEventData();
        }

        var tokenData = parseAccessToken(config.ACCESS_TOKEN);
        var tokenU = tokenData ? tokenData['u'] : config.ACCESS_TOKEN;
        //Reset event data cache if the access token owner changed.
        var dueForEvent = tokenU !== this.eventData.tokenU;

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
                this$1.eventData.tokenU = tokenU;
            }
        });
    };

   return TurnstileEvent;
}(TelemetryEvent));

var turnstileEvent_ = new TurnstileEvent();
var postTurnstileEvent = turnstileEvent_.postTurnstileEvent.bind(turnstileEvent_);

var mapLoadEvent_ = new MapLoadEvent();
var postMapLoadEvent = mapLoadEvent_.postMapLoadEvent.bind(mapLoadEvent_);

/***** END WARNING - REMOVAL OR MODIFICATION OF THE
PRECEDING CODE VIOLATES THE MAPBOX TERMS OF SERVICE  ******/

//      

                                           

var CACHE_NAME = 'mapbox-tiles';
var cacheLimit = 500; // 50MB / (100KB/tile) ~= 500 tiles
var cacheCheckThreshold = 50;

var MIN_TIME_UNTIL_EXPIRY = 1000 * 60 * 7; // 7 minutes. Skip caching tiles with a short enough max age.

                               
                   
                       
                           
  


var responseConstructorSupportsReadableStream;
function prepareBody(response          , callback) {
    if (responseConstructorSupportsReadableStream === undefined) {
        try {
            new Response(new ReadableStream()); // eslint-disable-line no-undef
            responseConstructorSupportsReadableStream = true;
        } catch (e) {
            // Edge
            responseConstructorSupportsReadableStream = false;
        }
    }

    if (responseConstructorSupportsReadableStream) {
        callback(response.body);
    } else {
        response.blob().then(callback);
    }
}

function cachePut(request         , response          , requestTime        ) {
    if (!self.caches) { return; }

    var options                  = {
        status: response.status,
        statusText: response.statusText,
        headers: new self.Headers()
    };
    response.headers.forEach(function (v, k) { return options.headers.set(k, v); });

    var cacheControl = parseCacheControl(response.headers.get('Cache-Control') || '');
    if (cacheControl['no-store']) {
        return;
    }
    if (cacheControl['max-age']) {
        options.headers.set('Expires', new Date(requestTime + cacheControl['max-age'] * 1000).toUTCString());
    }

    var timeUntilExpiry = new Date(options.headers.get('Expires')).getTime() - requestTime;
    if (timeUntilExpiry < MIN_TIME_UNTIL_EXPIRY) { return; }

    prepareBody(response, function (body) {
        var clonedResponse = new self.Response(body, options);

        self.caches.open(CACHE_NAME).then(function (cache) { return cache.put(stripQueryParameters(request.url), clonedResponse); });
    });
}

function stripQueryParameters(url        ) {
    var start = url.indexOf('?');
    return start < 0 ? url : url.slice(0, start);
}

function cacheGet(request         , callback                                                             ) {
    if (!self.caches) { return callback(null); }

    self.caches.open(CACHE_NAME)
        .catch(callback)
        .then(function (cache) {
            cache.match(request, { ignoreSearch: true })
                .catch(callback)
                .then(function (response) {
                    var fresh = isFresh(response);

                    // Reinsert into cache so that order of keys in the cache is the order of access.
                    // This line makes the cache a LRU instead of a FIFO cache.
                    var strippedURL = stripQueryParameters(request.url);
                    cache.delete(strippedURL);
                    if (fresh) {
                        cache.put(strippedURL, response.clone());
                    }

                    callback(null, response, fresh);
                });
        });
}



function isFresh(response) {
    if (!response) { return false; }
    var expires = new Date(response.headers.get('Expires'));
    var cacheControl = parseCacheControl(response.headers.get('Cache-Control') || '');
    return expires > Date.now() && !cacheControl['no-cache'];
}


// `Infinity` triggers a cache check after the first tile is loaded
// so that a check is run at least once on each page load.
var globalEntryCounter = Infinity;

// The cache check gets run on a worker. The reason for this is that
// profiling sometimes shows this as taking up significant time on the
// thread it gets called from. And sometimes it doesn't. It *may* be
// fine to run this on the main thread but out of caution this is being
// dispatched on a worker. This can be investigated further in the future.
function cacheEntryPossiblyAdded(dispatcher            ) {
    globalEntryCounter++;
    if (globalEntryCounter > cacheCheckThreshold) {
        dispatcher.send('enforceCacheSizeLimit', cacheLimit);
        globalEntryCounter = 0;
    }
}

// runs on worker, see above comment
function enforceCacheSizeLimit(limit        ) {
    if (!self.caches) { return; }
    self.caches.open(CACHE_NAME)
        .then(function (cache) {
            cache.keys().then(function (keys) {
                for (var i = 0; i < keys.length - limit; i++) {
                    cache.delete(keys[i]);
                }
            });
        });
}

function clearTileCache(callback                        ) {
    var promise = self.caches.delete(CACHE_NAME);
    if (callback) {
        promise.catch(callback).then(function () { return callback(); });
    }
}

function setCacheLimits(limit        , checkThreshold        ) {
    cacheLimit = limit;
    cacheCheckThreshold = checkThreshold;
}

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
            message += ': you may have provided an invalid Mapbox access token. See https://www.mapbox.com/api-documentation/#access-tokens-and-token-scopes';
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

function isWorker() {
    return typeof WorkerGlobalScope !== 'undefined' && typeof self !== 'undefined' &&
           self instanceof WorkerGlobalScope;
}

// Ensure that we're sending the correct referrer from blob URL worker bundles.
// For files loaded from the local file system, `location.origin` will be set
// to the string(!) "null" (Firefox), or "file://" (Chrome, Safari, Edge, IE),
// and we will set an empty referrer. Otherwise, we're using the document's URL.
/* global self, WorkerGlobalScope */
var getReferrer = isWorker() ?
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
    var complete = false;

    var cacheIgnoringSearch = hasCacheDefeatingSku(request.url);

    if (requestParameters.type === 'json') {
        request.headers.set('Accept', 'application/json');
    }

    var validateOrFetch = function (err, cachedResponse, responseIsFresh) {
        if (err) {
            // Do fetch in case of cache error.
            // HTTP pages in Edge trigger a security error that can be ignored.
            if (err.message !== 'SecurityError') {
                warnOnce(err);
            }
        }

        if (cachedResponse && responseIsFresh) {
            return finishRequest(cachedResponse);
        }

        if (cachedResponse) {
            // We can't do revalidation with 'If-None-Match' because then the
            // request doesn't have simple cors headers.
        }

        var requestTime = Date.now();

        self.fetch(request).then(function (response) {
            if (response.ok) {
                var cacheableResponse = cacheIgnoringSearch ? response.clone() : null;
                return finishRequest(response, cacheableResponse, requestTime);

            } else {
                return callback(new AJAXError(response.statusText, response.status, requestParameters.url));
            }
        }).catch(function (error) {
            if (error.code === 20) {
                // silence expected AbortError
                return;
            }
            callback(new Error(error.message));
        });
    };

    var finishRequest = function (response, cacheableResponse, requestTime) {
        (
            requestParameters.type === 'arrayBuffer' ? response.arrayBuffer() :
            requestParameters.type === 'json' ? response.json() :
            response.text()
        ).then(function (result) {
            if (cacheableResponse && requestTime) {
                // The response needs to be inserted into the cache after it has completely loaded.
                // Until it is fully loaded there is a chance it will be aborted. Aborting while
                // reading the body can cause the cache insertion to error. We could catch this error
                // in most browsers but in Firefox it seems to sometimes crash the tab. Adding
                // it to the cache here avoids that error.
                cachePut(request, cacheableResponse, requestTime);
            }
            complete = true;
            callback(null, result, response.headers.get('Cache-Control'), response.headers.get('Expires'));
        }).catch(function (err) { return callback(new Error(err.message)); });
    };

    if (cacheIgnoringSearch) {
        cacheGet(request, validateOrFetch);
    } else {
        validateOrFetch(null, null);
    }

    return { cancel: function () {
        if (!complete) { controller.abort(); }
    }};
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

var makeRequest = function(requestParameters                   , callback                       )             {
    // We're trying to use the Fetch API if possible. However, in some situations we can't use it:
    // - IE11 doesn't support it at all. In this case, we dispatch the request to the main thread so
    //   that we can get an accruate referrer header.
    // - Safari exposes window.AbortController, but it doesn't work actually abort any requests in
    //   some versions (see https://bugs.webkit.org/show_bug.cgi?id=174980#c2)
    // - Requests for resources with the file:// URI scheme don't work with the Fetch API either. In
    //   this case we unconditionally use XHR on the current thread since referrers don't matter.
    if (!/^file:/.test(requestParameters.url)) {
        if (self.fetch && self.Request && self.AbortController && self.Request.prototype.hasOwnProperty('signal')) {
            return makeFetchRequest(requestParameters, callback);
        }
        if (isWorker() && self.worker && self.worker.actor) {
            return self.worker.actor.send('getResource', requestParameters, callback);
        }
    }
    return makeXMLHttpRequest(requestParameters, callback);
};

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
        var queued = {
            requestParameters: requestParameters,
            callback: callback,
            cancelled: false,
            cancel: function cancel() { this.cancelled = true; }
        };
        imageQueue.push(queued);
        return queued;
    }
    numImageRequests++;

    var advanced = false;
    var advanceImageRequestQueue = function () {
        if (advanced) { return; }
        advanced = true;
        numImageRequests--;
        assert(numImageRequests >= 0);
        while (imageQueue.length && numImageRequests < config.MAX_PARALLEL_IMAGE_REQUESTS) { // eslint-disable-line
            var request = imageQueue.shift();
            var requestParameters = request.requestParameters;
            var callback = request.callback;
            var cancelled = request.cancelled;
            if (!cancelled) {
                request.cancel = getImage(requestParameters, callback).cancel;
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

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
}

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

function getCjsExportFromNamespace (n) {
	return n && n['default'] || n;
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
 * @param {number} [radius=0] Distance in meters from the coordinates to extend the bounds.
 * @returns {LngLatBounds} A new `LngLatBounds` object representing the coordinates extended by the `radius`.
 * @example
 * var ll = new mapboxgl.LngLat(-73.9749, 40.7736);
 * ll.toBounds(100).toArray(); // = [[-73.97501862141328, 40.77351016847229], [-73.97478137858673, 40.77368983152771]]
 */
LngLat.prototype.toBounds = function toBounds (radius) {
        if ( radius === void 0 ) radius      = 0;

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

Texture.prototype.update = function update (image          , options                                           , position                       ) {
    var width = image.width;
        var height = image.height;
    var resize = (!this.size || this.size[0] !== width || this.size[1] !== height) && !position;
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
        var ref$1 = position || { x: 0, y: 0};
            var x = ref$1.x;
            var y = ref$1.y;
        if (image instanceof HTMLImageElement || image instanceof HTMLCanvasElement || image instanceof HTMLVideoElement || image instanceof ImageData) {
            gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, gl.RGBA, gl.UNSIGNED_BYTE, image);
        } else {
            gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, image.data);
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

    ArcGISTiledMapServiceSource.prototype.onRemove = function onRemove () {

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
                cacheEntryPossiblyAdded(this$1.dispatcher);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwYm94LWdsLWFyY2dpcy10aWxlZC1tYXAtc2VydmljZS1kZXYuanMiLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9AbWFwYm94L3VuaXRiZXppZXIvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvQG1hcGJveC9wb2ludC1nZW9tZXRyeS9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9tYXBib3gtZ2wvc3JjL3V0aWwvYnJvd3Nlci93aW5kb3cuanMiLCIuLi9ub2RlX21vZHVsZXMvbWFwYm94LWdsL3NyYy9zdHlsZS1zcGVjL3V0aWwvZGVlcF9lcXVhbC5qcyIsIi4uL25vZGVfbW9kdWxlcy9tYXBib3gtZ2wvc3JjL3V0aWwvdXRpbC5qcyIsIi4uL25vZGVfbW9kdWxlcy9tYXBib3gtZ2wvc3JjL3V0aWwvY29uZmlnLmpzIiwiLi4vbm9kZV9tb2R1bGVzL21hcGJveC1nbC9zcmMvdXRpbC9icm93c2VyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL21hcGJveC1nbC9zcmMvdXRpbC93ZWJwX3N1cHBvcnRlZC5qcyIsIi4uL25vZGVfbW9kdWxlcy9tYXBib3gtZ2wvc3JjL3V0aWwvc2t1X3Rva2VuLmpzIiwiLi4vbm9kZV9tb2R1bGVzL21hcGJveC1nbC9zcmMvdXRpbC9tYXBib3guanMiLCIuLi9ub2RlX21vZHVsZXMvbWFwYm94LWdsL3NyYy91dGlsL3RpbGVfcmVxdWVzdF9jYWNoZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9tYXBib3gtZ2wvc3JjL3V0aWwvYWpheC5qcyIsIi4uL25vZGVfbW9kdWxlcy9tYXBib3gtZ2wvc3JjL3V0aWwvZXZlbnRlZC5qcyIsIi4uL25vZGVfbW9kdWxlcy9AbWFwYm94L3NwaGVyaWNhbG1lcmNhdG9yL3NwaGVyaWNhbG1lcmNhdG9yLmpzIiwiLi4vc3JjL2xvYWRfYXJjZ2lzX21hcHNlcnZlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9tYXBib3gtZ2wvc3JjL2dlby9sbmdfbGF0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL21hcGJveC1nbC9zcmMvZ2VvL2xuZ19sYXRfYm91bmRzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL21hcGJveC1nbC9zcmMvZ2VvL21lcmNhdG9yX2Nvb3JkaW5hdGUuanMiLCIuLi9ub2RlX21vZHVsZXMvbWFwYm94LWdsL3NyYy9zb3VyY2UvdGlsZV9ib3VuZHMuanMiLCIuLi9zcmMvaGVscGVycy5qcyIsIi4uL25vZGVfbW9kdWxlcy9tYXBib3gtZ2wvc3JjL3JlbmRlci90ZXh0dXJlLmpzIiwiLi4vc3JjL2FyY2dpc190aWxlZF9tYXBfc2VydmljZV9zb3VyY2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIENvcHlyaWdodCAoQykgMjAwOCBBcHBsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0XG4gKiBtb2RpZmljYXRpb24sIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnNcbiAqIGFyZSBtZXQ6XG4gKiAxLiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodFxuICogICAgbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICogMi4gUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHRcbiAqICAgIG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGVcbiAqICAgIGRvY3VtZW50YXRpb24gYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG4gKlxuICogVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBBUFBMRSBJTkMuIGBgQVMgSVMnJyBBTkQgQU5ZXG4gKiBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRVxuICogSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSXG4gKiBQVVJQT1NFIEFSRSBESVNDTEFJTUVELiAgSU4gTk8gRVZFTlQgU0hBTEwgQVBQTEUgSU5DLiBPUlxuICogQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsXG4gKiBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sXG4gKiBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSwgREFUQSwgT1JcbiAqIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUllcbiAqIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuICogKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFXG4gKiBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuICpcbiAqIFBvcnRlZCBmcm9tIFdlYmtpdFxuICogaHR0cDovL3N2bi53ZWJraXQub3JnL3JlcG9zaXRvcnkvd2Via2l0L3RydW5rL1NvdXJjZS9XZWJDb3JlL3BsYXRmb3JtL2dyYXBoaWNzL1VuaXRCZXppZXIuaFxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gVW5pdEJlemllcjtcblxuZnVuY3Rpb24gVW5pdEJlemllcihwMXgsIHAxeSwgcDJ4LCBwMnkpIHtcbiAgICAvLyBDYWxjdWxhdGUgdGhlIHBvbHlub21pYWwgY29lZmZpY2llbnRzLCBpbXBsaWNpdCBmaXJzdCBhbmQgbGFzdCBjb250cm9sIHBvaW50cyBhcmUgKDAsMCkgYW5kICgxLDEpLlxuICAgIHRoaXMuY3ggPSAzLjAgKiBwMXg7XG4gICAgdGhpcy5ieCA9IDMuMCAqIChwMnggLSBwMXgpIC0gdGhpcy5jeDtcbiAgICB0aGlzLmF4ID0gMS4wIC0gdGhpcy5jeCAtIHRoaXMuYng7XG5cbiAgICB0aGlzLmN5ID0gMy4wICogcDF5O1xuICAgIHRoaXMuYnkgPSAzLjAgKiAocDJ5IC0gcDF5KSAtIHRoaXMuY3k7XG4gICAgdGhpcy5heSA9IDEuMCAtIHRoaXMuY3kgLSB0aGlzLmJ5O1xuXG4gICAgdGhpcy5wMXggPSBwMXg7XG4gICAgdGhpcy5wMXkgPSBwMnk7XG4gICAgdGhpcy5wMnggPSBwMng7XG4gICAgdGhpcy5wMnkgPSBwMnk7XG59XG5cblVuaXRCZXppZXIucHJvdG90eXBlLnNhbXBsZUN1cnZlWCA9IGZ1bmN0aW9uKHQpIHtcbiAgICAvLyBgYXggdF4zICsgYnggdF4yICsgY3ggdCcgZXhwYW5kZWQgdXNpbmcgSG9ybmVyJ3MgcnVsZS5cbiAgICByZXR1cm4gKCh0aGlzLmF4ICogdCArIHRoaXMuYngpICogdCArIHRoaXMuY3gpICogdDtcbn07XG5cblVuaXRCZXppZXIucHJvdG90eXBlLnNhbXBsZUN1cnZlWSA9IGZ1bmN0aW9uKHQpIHtcbiAgICByZXR1cm4gKCh0aGlzLmF5ICogdCArIHRoaXMuYnkpICogdCArIHRoaXMuY3kpICogdDtcbn07XG5cblVuaXRCZXppZXIucHJvdG90eXBlLnNhbXBsZUN1cnZlRGVyaXZhdGl2ZVggPSBmdW5jdGlvbih0KSB7XG4gICAgcmV0dXJuICgzLjAgKiB0aGlzLmF4ICogdCArIDIuMCAqIHRoaXMuYngpICogdCArIHRoaXMuY3g7XG59O1xuXG5Vbml0QmV6aWVyLnByb3RvdHlwZS5zb2x2ZUN1cnZlWCA9IGZ1bmN0aW9uKHgsIGVwc2lsb24pIHtcbiAgICBpZiAodHlwZW9mIGVwc2lsb24gPT09ICd1bmRlZmluZWQnKSBlcHNpbG9uID0gMWUtNjtcblxuICAgIHZhciB0MCwgdDEsIHQyLCB4MiwgaTtcblxuICAgIC8vIEZpcnN0IHRyeSBhIGZldyBpdGVyYXRpb25zIG9mIE5ld3RvbidzIG1ldGhvZCAtLSBub3JtYWxseSB2ZXJ5IGZhc3QuXG4gICAgZm9yICh0MiA9IHgsIGkgPSAwOyBpIDwgODsgaSsrKSB7XG5cbiAgICAgICAgeDIgPSB0aGlzLnNhbXBsZUN1cnZlWCh0MikgLSB4O1xuICAgICAgICBpZiAoTWF0aC5hYnMoeDIpIDwgZXBzaWxvbikgcmV0dXJuIHQyO1xuXG4gICAgICAgIHZhciBkMiA9IHRoaXMuc2FtcGxlQ3VydmVEZXJpdmF0aXZlWCh0Mik7XG4gICAgICAgIGlmIChNYXRoLmFicyhkMikgPCAxZS02KSBicmVhaztcblxuICAgICAgICB0MiA9IHQyIC0geDIgLyBkMjtcbiAgICB9XG5cbiAgICAvLyBGYWxsIGJhY2sgdG8gdGhlIGJpc2VjdGlvbiBtZXRob2QgZm9yIHJlbGlhYmlsaXR5LlxuICAgIHQwID0gMC4wO1xuICAgIHQxID0gMS4wO1xuICAgIHQyID0geDtcblxuICAgIGlmICh0MiA8IHQwKSByZXR1cm4gdDA7XG4gICAgaWYgKHQyID4gdDEpIHJldHVybiB0MTtcblxuICAgIHdoaWxlICh0MCA8IHQxKSB7XG5cbiAgICAgICAgeDIgPSB0aGlzLnNhbXBsZUN1cnZlWCh0Mik7XG4gICAgICAgIGlmIChNYXRoLmFicyh4MiAtIHgpIDwgZXBzaWxvbikgcmV0dXJuIHQyO1xuXG4gICAgICAgIGlmICh4ID4geDIpIHtcbiAgICAgICAgICAgIHQwID0gdDI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0MSA9IHQyO1xuICAgICAgICB9XG5cbiAgICAgICAgdDIgPSAodDEgLSB0MCkgKiAwLjUgKyB0MDtcbiAgICB9XG5cbiAgICAvLyBGYWlsdXJlLlxuICAgIHJldHVybiB0Mjtcbn07XG5cblVuaXRCZXppZXIucHJvdG90eXBlLnNvbHZlID0gZnVuY3Rpb24oeCwgZXBzaWxvbikge1xuICAgIHJldHVybiB0aGlzLnNhbXBsZUN1cnZlWSh0aGlzLnNvbHZlQ3VydmVYKHgsIGVwc2lsb24pKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gUG9pbnQ7XG5cbi8qKlxuICogQSBzdGFuZGFsb25lIHBvaW50IGdlb21ldHJ5IHdpdGggdXNlZnVsIGFjY2Vzc29yLCBjb21wYXJpc29uLCBhbmRcbiAqIG1vZGlmaWNhdGlvbiBtZXRob2RzLlxuICpcbiAqIEBjbGFzcyBQb2ludFxuICogQHBhcmFtIHtOdW1iZXJ9IHggdGhlIHgtY29vcmRpbmF0ZS4gdGhpcyBjb3VsZCBiZSBsb25naXR1ZGUgb3Igc2NyZWVuXG4gKiBwaXhlbHMsIG9yIGFueSBvdGhlciBzb3J0IG9mIHVuaXQuXG4gKiBAcGFyYW0ge051bWJlcn0geSB0aGUgeS1jb29yZGluYXRlLiB0aGlzIGNvdWxkIGJlIGxhdGl0dWRlIG9yIHNjcmVlblxuICogcGl4ZWxzLCBvciBhbnkgb3RoZXIgc29ydCBvZiB1bml0LlxuICogQGV4YW1wbGVcbiAqIHZhciBwb2ludCA9IG5ldyBQb2ludCgtNzcsIDM4KTtcbiAqL1xuZnVuY3Rpb24gUG9pbnQoeCwgeSkge1xuICAgIHRoaXMueCA9IHg7XG4gICAgdGhpcy55ID0geTtcbn1cblxuUG9pbnQucHJvdG90eXBlID0ge1xuXG4gICAgLyoqXG4gICAgICogQ2xvbmUgdGhpcyBwb2ludCwgcmV0dXJuaW5nIGEgbmV3IHBvaW50IHRoYXQgY2FuIGJlIG1vZGlmaWVkXG4gICAgICogd2l0aG91dCBhZmZlY3RpbmcgdGhlIG9sZCBvbmUuXG4gICAgICogQHJldHVybiB7UG9pbnR9IHRoZSBjbG9uZVxuICAgICAqL1xuICAgIGNsb25lOiBmdW5jdGlvbigpIHsgcmV0dXJuIG5ldyBQb2ludCh0aGlzLngsIHRoaXMueSk7IH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgdGhpcyBwb2ludCdzIHggJiB5IGNvb3JkaW5hdGVzIHRvIGFub3RoZXIgcG9pbnQsXG4gICAgICogeWllbGRpbmcgYSBuZXcgcG9pbnQuXG4gICAgICogQHBhcmFtIHtQb2ludH0gcCB0aGUgb3RoZXIgcG9pbnRcbiAgICAgKiBAcmV0dXJuIHtQb2ludH0gb3V0cHV0IHBvaW50XG4gICAgICovXG4gICAgYWRkOiAgICAgZnVuY3Rpb24ocCkgeyByZXR1cm4gdGhpcy5jbG9uZSgpLl9hZGQocCk7IH0sXG5cbiAgICAvKipcbiAgICAgKiBTdWJ0cmFjdCB0aGlzIHBvaW50J3MgeCAmIHkgY29vcmRpbmF0ZXMgdG8gZnJvbSBwb2ludCxcbiAgICAgKiB5aWVsZGluZyBhIG5ldyBwb2ludC5cbiAgICAgKiBAcGFyYW0ge1BvaW50fSBwIHRoZSBvdGhlciBwb2ludFxuICAgICAqIEByZXR1cm4ge1BvaW50fSBvdXRwdXQgcG9pbnRcbiAgICAgKi9cbiAgICBzdWI6ICAgICBmdW5jdGlvbihwKSB7IHJldHVybiB0aGlzLmNsb25lKCkuX3N1YihwKTsgfSxcblxuICAgIC8qKlxuICAgICAqIE11bHRpcGx5IHRoaXMgcG9pbnQncyB4ICYgeSBjb29yZGluYXRlcyBieSBwb2ludCxcbiAgICAgKiB5aWVsZGluZyBhIG5ldyBwb2ludC5cbiAgICAgKiBAcGFyYW0ge1BvaW50fSBwIHRoZSBvdGhlciBwb2ludFxuICAgICAqIEByZXR1cm4ge1BvaW50fSBvdXRwdXQgcG9pbnRcbiAgICAgKi9cbiAgICBtdWx0QnlQb2ludDogICAgZnVuY3Rpb24ocCkgeyByZXR1cm4gdGhpcy5jbG9uZSgpLl9tdWx0QnlQb2ludChwKTsgfSxcblxuICAgIC8qKlxuICAgICAqIERpdmlkZSB0aGlzIHBvaW50J3MgeCAmIHkgY29vcmRpbmF0ZXMgYnkgcG9pbnQsXG4gICAgICogeWllbGRpbmcgYSBuZXcgcG9pbnQuXG4gICAgICogQHBhcmFtIHtQb2ludH0gcCB0aGUgb3RoZXIgcG9pbnRcbiAgICAgKiBAcmV0dXJuIHtQb2ludH0gb3V0cHV0IHBvaW50XG4gICAgICovXG4gICAgZGl2QnlQb2ludDogICAgIGZ1bmN0aW9uKHApIHsgcmV0dXJuIHRoaXMuY2xvbmUoKS5fZGl2QnlQb2ludChwKTsgfSxcblxuICAgIC8qKlxuICAgICAqIE11bHRpcGx5IHRoaXMgcG9pbnQncyB4ICYgeSBjb29yZGluYXRlcyBieSBhIGZhY3RvcixcbiAgICAgKiB5aWVsZGluZyBhIG5ldyBwb2ludC5cbiAgICAgKiBAcGFyYW0ge1BvaW50fSBrIGZhY3RvclxuICAgICAqIEByZXR1cm4ge1BvaW50fSBvdXRwdXQgcG9pbnRcbiAgICAgKi9cbiAgICBtdWx0OiAgICBmdW5jdGlvbihrKSB7IHJldHVybiB0aGlzLmNsb25lKCkuX211bHQoayk7IH0sXG5cbiAgICAvKipcbiAgICAgKiBEaXZpZGUgdGhpcyBwb2ludCdzIHggJiB5IGNvb3JkaW5hdGVzIGJ5IGEgZmFjdG9yLFxuICAgICAqIHlpZWxkaW5nIGEgbmV3IHBvaW50LlxuICAgICAqIEBwYXJhbSB7UG9pbnR9IGsgZmFjdG9yXG4gICAgICogQHJldHVybiB7UG9pbnR9IG91dHB1dCBwb2ludFxuICAgICAqL1xuICAgIGRpdjogICAgIGZ1bmN0aW9uKGspIHsgcmV0dXJuIHRoaXMuY2xvbmUoKS5fZGl2KGspOyB9LFxuXG4gICAgLyoqXG4gICAgICogUm90YXRlIHRoaXMgcG9pbnQgYXJvdW5kIHRoZSAwLCAwIG9yaWdpbiBieSBhbiBhbmdsZSBhLFxuICAgICAqIGdpdmVuIGluIHJhZGlhbnNcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gYSBhbmdsZSB0byByb3RhdGUgYXJvdW5kLCBpbiByYWRpYW5zXG4gICAgICogQHJldHVybiB7UG9pbnR9IG91dHB1dCBwb2ludFxuICAgICAqL1xuICAgIHJvdGF0ZTogIGZ1bmN0aW9uKGEpIHsgcmV0dXJuIHRoaXMuY2xvbmUoKS5fcm90YXRlKGEpOyB9LFxuXG4gICAgLyoqXG4gICAgICogUm90YXRlIHRoaXMgcG9pbnQgYXJvdW5kIHAgcG9pbnQgYnkgYW4gYW5nbGUgYSxcbiAgICAgKiBnaXZlbiBpbiByYWRpYW5zXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGEgYW5nbGUgdG8gcm90YXRlIGFyb3VuZCwgaW4gcmFkaWFuc1xuICAgICAqIEBwYXJhbSB7UG9pbnR9IHAgUG9pbnQgdG8gcm90YXRlIGFyb3VuZFxuICAgICAqIEByZXR1cm4ge1BvaW50fSBvdXRwdXQgcG9pbnRcbiAgICAgKi9cbiAgICByb3RhdGVBcm91bmQ6ICBmdW5jdGlvbihhLHApIHsgcmV0dXJuIHRoaXMuY2xvbmUoKS5fcm90YXRlQXJvdW5kKGEscCk7IH0sXG5cbiAgICAvKipcbiAgICAgKiBNdWx0aXBseSB0aGlzIHBvaW50IGJ5IGEgNHgxIHRyYW5zZm9ybWF0aW9uIG1hdHJpeFxuICAgICAqIEBwYXJhbSB7QXJyYXk8TnVtYmVyPn0gbSB0cmFuc2Zvcm1hdGlvbiBtYXRyaXhcbiAgICAgKiBAcmV0dXJuIHtQb2ludH0gb3V0cHV0IHBvaW50XG4gICAgICovXG4gICAgbWF0TXVsdDogZnVuY3Rpb24obSkgeyByZXR1cm4gdGhpcy5jbG9uZSgpLl9tYXRNdWx0KG0pOyB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlIHRoaXMgcG9pbnQgYnV0IGFzIGEgdW5pdCB2ZWN0b3IgZnJvbSAwLCAwLCBtZWFuaW5nXG4gICAgICogdGhhdCB0aGUgZGlzdGFuY2UgZnJvbSB0aGUgcmVzdWx0aW5nIHBvaW50IHRvIHRoZSAwLCAwXG4gICAgICogY29vcmRpbmF0ZSB3aWxsIGJlIGVxdWFsIHRvIDEgYW5kIHRoZSBhbmdsZSBmcm9tIHRoZSByZXN1bHRpbmdcbiAgICAgKiBwb2ludCB0byB0aGUgMCwgMCBjb29yZGluYXRlIHdpbGwgYmUgdGhlIHNhbWUgYXMgYmVmb3JlLlxuICAgICAqIEByZXR1cm4ge1BvaW50fSB1bml0IHZlY3RvciBwb2ludFxuICAgICAqL1xuICAgIHVuaXQ6ICAgIGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5jbG9uZSgpLl91bml0KCk7IH0sXG5cbiAgICAvKipcbiAgICAgKiBDb21wdXRlIGEgcGVycGVuZGljdWxhciBwb2ludCwgd2hlcmUgdGhlIG5ldyB5IGNvb3JkaW5hdGVcbiAgICAgKiBpcyB0aGUgb2xkIHggY29vcmRpbmF0ZSBhbmQgdGhlIG5ldyB4IGNvb3JkaW5hdGUgaXMgdGhlIG9sZCB5XG4gICAgICogY29vcmRpbmF0ZSBtdWx0aXBsaWVkIGJ5IC0xXG4gICAgICogQHJldHVybiB7UG9pbnR9IHBlcnBlbmRpY3VsYXIgcG9pbnRcbiAgICAgKi9cbiAgICBwZXJwOiAgICBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuY2xvbmUoKS5fcGVycCgpOyB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIGEgdmVyc2lvbiBvZiB0aGlzIHBvaW50IHdpdGggdGhlIHggJiB5IGNvb3JkaW5hdGVzXG4gICAgICogcm91bmRlZCB0byBpbnRlZ2Vycy5cbiAgICAgKiBAcmV0dXJuIHtQb2ludH0gcm91bmRlZCBwb2ludFxuICAgICAqL1xuICAgIHJvdW5kOiAgIGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5jbG9uZSgpLl9yb3VuZCgpOyB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRoZSBtYWdpdHVkZSBvZiB0aGlzIHBvaW50OiB0aGlzIGlzIHRoZSBFdWNsaWRlYW5cbiAgICAgKiBkaXN0YW5jZSBmcm9tIHRoZSAwLCAwIGNvb3JkaW5hdGUgdG8gdGhpcyBwb2ludCdzIHggYW5kIHlcbiAgICAgKiBjb29yZGluYXRlcy5cbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IG1hZ25pdHVkZVxuICAgICAqL1xuICAgIG1hZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQodGhpcy54ICogdGhpcy54ICsgdGhpcy55ICogdGhpcy55KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSnVkZ2Ugd2hldGhlciB0aGlzIHBvaW50IGlzIGVxdWFsIHRvIGFub3RoZXIgcG9pbnQsIHJldHVybmluZ1xuICAgICAqIHRydWUgb3IgZmFsc2UuXG4gICAgICogQHBhcmFtIHtQb2ludH0gb3RoZXIgdGhlIG90aGVyIHBvaW50XG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gd2hldGhlciB0aGUgcG9pbnRzIGFyZSBlcXVhbFxuICAgICAqL1xuICAgIGVxdWFsczogZnVuY3Rpb24ob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMueCA9PT0gb3RoZXIueCAmJlxuICAgICAgICAgICAgICAgdGhpcy55ID09PSBvdGhlci55O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGUgdGhlIGRpc3RhbmNlIGZyb20gdGhpcyBwb2ludCB0byBhbm90aGVyIHBvaW50XG4gICAgICogQHBhcmFtIHtQb2ludH0gcCB0aGUgb3RoZXIgcG9pbnRcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGRpc3RhbmNlXG4gICAgICovXG4gICAgZGlzdDogZnVuY3Rpb24ocCkge1xuICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KHRoaXMuZGlzdFNxcihwKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGN1bGF0ZSB0aGUgZGlzdGFuY2UgZnJvbSB0aGlzIHBvaW50IHRvIGFub3RoZXIgcG9pbnQsXG4gICAgICogd2l0aG91dCB0aGUgc3F1YXJlIHJvb3Qgc3RlcC4gVXNlZnVsIGlmIHlvdSdyZSBjb21wYXJpbmdcbiAgICAgKiByZWxhdGl2ZSBkaXN0YW5jZXMuXG4gICAgICogQHBhcmFtIHtQb2ludH0gcCB0aGUgb3RoZXIgcG9pbnRcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGRpc3RhbmNlXG4gICAgICovXG4gICAgZGlzdFNxcjogZnVuY3Rpb24ocCkge1xuICAgICAgICB2YXIgZHggPSBwLnggLSB0aGlzLngsXG4gICAgICAgICAgICBkeSA9IHAueSAtIHRoaXMueTtcbiAgICAgICAgcmV0dXJuIGR4ICogZHggKyBkeSAqIGR5O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGFuZ2xlIGZyb20gdGhlIDAsIDAgY29vcmRpbmF0ZSB0byB0aGlzIHBvaW50LCBpbiByYWRpYW5zXG4gICAgICogY29vcmRpbmF0ZXMuXG4gICAgICogQHJldHVybiB7TnVtYmVyfSBhbmdsZVxuICAgICAqL1xuICAgIGFuZ2xlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguYXRhbjIodGhpcy55LCB0aGlzLngpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGFuZ2xlIGZyb20gdGhpcyBwb2ludCB0byBhbm90aGVyIHBvaW50LCBpbiByYWRpYW5zXG4gICAgICogQHBhcmFtIHtQb2ludH0gYiB0aGUgb3RoZXIgcG9pbnRcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGFuZ2xlXG4gICAgICovXG4gICAgYW5nbGVUbzogZnVuY3Rpb24oYikge1xuICAgICAgICByZXR1cm4gTWF0aC5hdGFuMih0aGlzLnkgLSBiLnksIHRoaXMueCAtIGIueCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgYW5nbGUgYmV0d2VlbiB0aGlzIHBvaW50IGFuZCBhbm90aGVyIHBvaW50LCBpbiByYWRpYW5zXG4gICAgICogQHBhcmFtIHtQb2ludH0gYiB0aGUgb3RoZXIgcG9pbnRcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGFuZ2xlXG4gICAgICovXG4gICAgYW5nbGVXaXRoOiBmdW5jdGlvbihiKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFuZ2xlV2l0aFNlcChiLngsIGIueSk7XG4gICAgfSxcblxuICAgIC8qXG4gICAgICogRmluZCB0aGUgYW5nbGUgb2YgdGhlIHR3byB2ZWN0b3JzLCBzb2x2aW5nIHRoZSBmb3JtdWxhIGZvclxuICAgICAqIHRoZSBjcm9zcyBwcm9kdWN0IGEgeCBiID0gfGF8fGJ8c2luKM64KSBmb3IgzrguXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHggdGhlIHgtY29vcmRpbmF0ZVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB5IHRoZSB5LWNvb3JkaW5hdGVcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IHRoZSBhbmdsZSBpbiByYWRpYW5zXG4gICAgICovXG4gICAgYW5nbGVXaXRoU2VwOiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgIHJldHVybiBNYXRoLmF0YW4yKFxuICAgICAgICAgICAgdGhpcy54ICogeSAtIHRoaXMueSAqIHgsXG4gICAgICAgICAgICB0aGlzLnggKiB4ICsgdGhpcy55ICogeSk7XG4gICAgfSxcblxuICAgIF9tYXRNdWx0OiBmdW5jdGlvbihtKSB7XG4gICAgICAgIHZhciB4ID0gbVswXSAqIHRoaXMueCArIG1bMV0gKiB0aGlzLnksXG4gICAgICAgICAgICB5ID0gbVsyXSAqIHRoaXMueCArIG1bM10gKiB0aGlzLnk7XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBfYWRkOiBmdW5jdGlvbihwKSB7XG4gICAgICAgIHRoaXMueCArPSBwLng7XG4gICAgICAgIHRoaXMueSArPSBwLnk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBfc3ViOiBmdW5jdGlvbihwKSB7XG4gICAgICAgIHRoaXMueCAtPSBwLng7XG4gICAgICAgIHRoaXMueSAtPSBwLnk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBfbXVsdDogZnVuY3Rpb24oaykge1xuICAgICAgICB0aGlzLnggKj0gaztcbiAgICAgICAgdGhpcy55ICo9IGs7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBfZGl2OiBmdW5jdGlvbihrKSB7XG4gICAgICAgIHRoaXMueCAvPSBrO1xuICAgICAgICB0aGlzLnkgLz0gaztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIF9tdWx0QnlQb2ludDogZnVuY3Rpb24ocCkge1xuICAgICAgICB0aGlzLnggKj0gcC54O1xuICAgICAgICB0aGlzLnkgKj0gcC55O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgX2RpdkJ5UG9pbnQ6IGZ1bmN0aW9uKHApIHtcbiAgICAgICAgdGhpcy54IC89IHAueDtcbiAgICAgICAgdGhpcy55IC89IHAueTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIF91bml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fZGl2KHRoaXMubWFnKCkpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgX3BlcnA6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgeSA9IHRoaXMueTtcbiAgICAgICAgdGhpcy55ID0gdGhpcy54O1xuICAgICAgICB0aGlzLnggPSAteTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIF9yb3RhdGU6IGZ1bmN0aW9uKGFuZ2xlKSB7XG4gICAgICAgIHZhciBjb3MgPSBNYXRoLmNvcyhhbmdsZSksXG4gICAgICAgICAgICBzaW4gPSBNYXRoLnNpbihhbmdsZSksXG4gICAgICAgICAgICB4ID0gY29zICogdGhpcy54IC0gc2luICogdGhpcy55LFxuICAgICAgICAgICAgeSA9IHNpbiAqIHRoaXMueCArIGNvcyAqIHRoaXMueTtcbiAgICAgICAgdGhpcy54ID0geDtcbiAgICAgICAgdGhpcy55ID0geTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIF9yb3RhdGVBcm91bmQ6IGZ1bmN0aW9uKGFuZ2xlLCBwKSB7XG4gICAgICAgIHZhciBjb3MgPSBNYXRoLmNvcyhhbmdsZSksXG4gICAgICAgICAgICBzaW4gPSBNYXRoLnNpbihhbmdsZSksXG4gICAgICAgICAgICB4ID0gcC54ICsgY29zICogKHRoaXMueCAtIHAueCkgLSBzaW4gKiAodGhpcy55IC0gcC55KSxcbiAgICAgICAgICAgIHkgPSBwLnkgKyBzaW4gKiAodGhpcy54IC0gcC54KSArIGNvcyAqICh0aGlzLnkgLSBwLnkpO1xuICAgICAgICB0aGlzLnggPSB4O1xuICAgICAgICB0aGlzLnkgPSB5O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgX3JvdW5kOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy54ID0gTWF0aC5yb3VuZCh0aGlzLngpO1xuICAgICAgICB0aGlzLnkgPSBNYXRoLnJvdW5kKHRoaXMueSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn07XG5cbi8qKlxuICogQ29uc3RydWN0IGEgcG9pbnQgZnJvbSBhbiBhcnJheSBpZiBuZWNlc3NhcnksIG90aGVyd2lzZSBpZiB0aGUgaW5wdXRcbiAqIGlzIGFscmVhZHkgYSBQb2ludCwgb3IgYW4gdW5rbm93biB0eXBlLCByZXR1cm4gaXQgdW5jaGFuZ2VkXG4gKiBAcGFyYW0ge0FycmF5PE51bWJlcj58UG9pbnR8Kn0gYSBhbnkga2luZCBvZiBpbnB1dCB2YWx1ZVxuICogQHJldHVybiB7UG9pbnR9IGNvbnN0cnVjdGVkIHBvaW50LCBvciBwYXNzZWQtdGhyb3VnaCB2YWx1ZS5cbiAqIEBleGFtcGxlXG4gKiAvLyB0aGlzXG4gKiB2YXIgcG9pbnQgPSBQb2ludC5jb252ZXJ0KFswLCAxXSk7XG4gKiAvLyBpcyBlcXVpdmFsZW50IHRvXG4gKiB2YXIgcG9pbnQgPSBuZXcgUG9pbnQoMCwgMSk7XG4gKi9cblBvaW50LmNvbnZlcnQgPSBmdW5jdGlvbiAoYSkge1xuICAgIGlmIChhIGluc3RhbmNlb2YgUG9pbnQpIHtcbiAgICAgICAgcmV0dXJuIGE7XG4gICAgfVxuICAgIGlmIChBcnJheS5pc0FycmF5KGEpKSB7XG4gICAgICAgIHJldHVybiBuZXcgUG9pbnQoYVswXSwgYVsxXSk7XG4gICAgfVxuICAgIHJldHVybiBhO1xufTtcbiIsIi8vIEBmbG93XG4vKiBlc2xpbnQtZW52IGJyb3dzZXIgKi9cbmltcG9ydCB0eXBlIHtXaW5kb3d9IGZyb20gJy4uLy4uL3R5cGVzL3dpbmRvdyc7XG5cbmV4cG9ydCBkZWZhdWx0IChzZWxmOiBXaW5kb3cpO1xuIiwiLy8gQGZsb3dcblxuLyoqXG4gKiBEZWVwbHkgY29tcGFyZXMgdHdvIG9iamVjdCBsaXRlcmFscy5cbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBkZWVwRXF1YWwoYTogP21peGVkLCBiOiA/bWl4ZWQpOiBib29sZWFuIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShhKSkge1xuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoYikgfHwgYS5sZW5ndGggIT09IGIubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKCFkZWVwRXF1YWwoYVtpXSwgYltpXSkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBhID09PSAnb2JqZWN0JyAmJiBhICE9PSBudWxsICYmIGIgIT09IG51bGwpIHtcbiAgICAgICAgaWYgKCEodHlwZW9mIGIgPT09ICdvYmplY3QnKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMoYSk7XG4gICAgICAgIGlmIChrZXlzLmxlbmd0aCAhPT0gT2JqZWN0LmtleXMoYikubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIGEpIHtcbiAgICAgICAgICAgIGlmICghZGVlcEVxdWFsKGFba2V5XSwgYltrZXldKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gYSA9PT0gYjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZGVlcEVxdWFsO1xuIiwiLy8gQGZsb3dcblxuaW1wb3J0IFVuaXRCZXppZXIgZnJvbSAnQG1hcGJveC91bml0YmV6aWVyJztcblxuaW1wb3J0IFBvaW50IGZyb20gJ0BtYXBib3gvcG9pbnQtZ2VvbWV0cnknO1xuaW1wb3J0IHdpbmRvdyBmcm9tICcuL3dpbmRvdyc7XG5cbmltcG9ydCB0eXBlIHtDYWxsYmFja30gZnJvbSAnLi4vdHlwZXMvY2FsbGJhY2snO1xuXG4vKipcbiAqIEBtb2R1bGUgdXRpbFxuICogQHByaXZhdGVcbiAqL1xuXG4vKipcbiAqIEdpdmVuIGEgdmFsdWUgYHRgIHRoYXQgdmFyaWVzIGJldHdlZW4gMCBhbmQgMSwgcmV0dXJuXG4gKiBhbiBpbnRlcnBvbGF0aW9uIGZ1bmN0aW9uIHRoYXQgZWFzZXMgYmV0d2VlbiAwIGFuZCAxIGluIGEgcGxlYXNpbmdcbiAqIGN1YmljIGluLW91dCBmYXNoaW9uLlxuICpcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlYXNlQ3ViaWNJbk91dCh0OiBudW1iZXIpOiBudW1iZXIge1xuICAgIGlmICh0IDw9IDApIHJldHVybiAwO1xuICAgIGlmICh0ID49IDEpIHJldHVybiAxO1xuICAgIGNvbnN0IHQyID0gdCAqIHQsXG4gICAgICAgIHQzID0gdDIgKiB0O1xuICAgIHJldHVybiA0ICogKHQgPCAwLjUgPyB0MyA6IDMgKiAodCAtIHQyKSArIHQzIC0gMC43NSk7XG59XG5cbi8qKlxuICogR2l2ZW4gZ2l2ZW4gKHgsIHkpLCAoeDEsIHkxKSBjb250cm9sIHBvaW50cyBmb3IgYSBiZXppZXIgY3VydmUsXG4gKiByZXR1cm4gYSBmdW5jdGlvbiB0aGF0IGludGVycG9sYXRlcyBhbG9uZyB0aGF0IGN1cnZlLlxuICpcbiAqIEBwYXJhbSBwMXggY29udHJvbCBwb2ludCAxIHggY29vcmRpbmF0ZVxuICogQHBhcmFtIHAxeSBjb250cm9sIHBvaW50IDEgeSBjb29yZGluYXRlXG4gKiBAcGFyYW0gcDJ4IGNvbnRyb2wgcG9pbnQgMiB4IGNvb3JkaW5hdGVcbiAqIEBwYXJhbSBwMnkgY29udHJvbCBwb2ludCAyIHkgY29vcmRpbmF0ZVxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJlemllcihwMXg6IG51bWJlciwgcDF5OiBudW1iZXIsIHAyeDogbnVtYmVyLCBwMnk6IG51bWJlcik6ICh0OiBudW1iZXIpID0+IG51bWJlciB7XG4gICAgY29uc3QgYmV6aWVyID0gbmV3IFVuaXRCZXppZXIocDF4LCBwMXksIHAyeCwgcDJ5KTtcbiAgICByZXR1cm4gZnVuY3Rpb24odDogbnVtYmVyKSB7XG4gICAgICAgIHJldHVybiBiZXppZXIuc29sdmUodCk7XG4gICAgfTtcbn1cblxuLyoqXG4gKiBBIGRlZmF1bHQgYmV6aWVyLWN1cnZlIHBvd2VyZWQgZWFzaW5nIGZ1bmN0aW9uIHdpdGhcbiAqIGNvbnRyb2wgcG9pbnRzICgwLjI1LCAwLjEpIGFuZCAoMC4yNSwgMSlcbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgY29uc3QgZWFzZSA9IGJlemllcigwLjI1LCAwLjEsIDAuMjUsIDEpO1xuXG4vKipcbiAqIGNvbnN0cmFpbiBuIHRvIHRoZSBnaXZlbiByYW5nZSB2aWEgbWluICsgbWF4XG4gKlxuICogQHBhcmFtIG4gdmFsdWVcbiAqIEBwYXJhbSBtaW4gdGhlIG1pbmltdW0gdmFsdWUgdG8gYmUgcmV0dXJuZWRcbiAqIEBwYXJhbSBtYXggdGhlIG1heGltdW0gdmFsdWUgdG8gYmUgcmV0dXJuZWRcbiAqIEByZXR1cm5zIHRoZSBjbGFtcGVkIHZhbHVlXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY2xhbXAobjogbnVtYmVyLCBtaW46IG51bWJlciwgbWF4OiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiBNYXRoLm1pbihtYXgsIE1hdGgubWF4KG1pbiwgbikpO1xufVxuXG4vKipcbiAqIGNvbnN0cmFpbiBuIHRvIHRoZSBnaXZlbiByYW5nZSwgZXhjbHVkaW5nIHRoZSBtaW5pbXVtLCB2aWEgbW9kdWxhciBhcml0aG1ldGljXG4gKlxuICogQHBhcmFtIG4gdmFsdWVcbiAqIEBwYXJhbSBtaW4gdGhlIG1pbmltdW0gdmFsdWUgdG8gYmUgcmV0dXJuZWQsIGV4Y2x1c2l2ZVxuICogQHBhcmFtIG1heCB0aGUgbWF4aW11bSB2YWx1ZSB0byBiZSByZXR1cm5lZCwgaW5jbHVzaXZlXG4gKiBAcmV0dXJucyBjb25zdHJhaW5lZCBudW1iZXJcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3cmFwKG46IG51bWJlciwgbWluOiBudW1iZXIsIG1heDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICBjb25zdCBkID0gbWF4IC0gbWluO1xuICAgIGNvbnN0IHcgPSAoKG4gLSBtaW4pICUgZCArIGQpICUgZCArIG1pbjtcbiAgICByZXR1cm4gKHcgPT09IG1pbikgPyBtYXggOiB3O1xufVxuXG4vKlxuICogQ2FsbCBhbiBhc3luY2hyb25vdXMgZnVuY3Rpb24gb24gYW4gYXJyYXkgb2YgYXJndW1lbnRzLFxuICogY2FsbGluZyBgY2FsbGJhY2tgIHdpdGggdGhlIGNvbXBsZXRlZCByZXN1bHRzIG9mIGFsbCBjYWxscy5cbiAqXG4gKiBAcGFyYW0gYXJyYXkgaW5wdXQgdG8gZWFjaCBjYWxsIG9mIHRoZSBhc3luYyBmdW5jdGlvbi5cbiAqIEBwYXJhbSBmbiBhbiBhc3luYyBmdW5jdGlvbiB3aXRoIHNpZ25hdHVyZSAoZGF0YSwgY2FsbGJhY2spXG4gKiBAcGFyYW0gY2FsbGJhY2sgYSBjYWxsYmFjayBydW4gYWZ0ZXIgYWxsIGFzeW5jIHdvcmsgaXMgZG9uZS5cbiAqIGNhbGxlZCB3aXRoIGFuIGFycmF5LCBjb250YWluaW5nIHRoZSByZXN1bHRzIG9mIGVhY2ggYXN5bmMgY2FsbC5cbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3luY0FsbDxJdGVtLCBSZXN1bHQ+KFxuICAgIGFycmF5OiBBcnJheTxJdGVtPixcbiAgICBmbjogKGl0ZW06IEl0ZW0sIGZuQ2FsbGJhY2s6IENhbGxiYWNrPFJlc3VsdD4pID0+IHZvaWQsXG4gICAgY2FsbGJhY2s6IENhbGxiYWNrPEFycmF5PFJlc3VsdD4+XG4pIHtcbiAgICBpZiAoIWFycmF5Lmxlbmd0aCkgeyByZXR1cm4gY2FsbGJhY2sobnVsbCwgW10pOyB9XG4gICAgbGV0IHJlbWFpbmluZyA9IGFycmF5Lmxlbmd0aDtcbiAgICBjb25zdCByZXN1bHRzID0gbmV3IEFycmF5KGFycmF5Lmxlbmd0aCk7XG4gICAgbGV0IGVycm9yID0gbnVsbDtcbiAgICBhcnJheS5mb3JFYWNoKChpdGVtLCBpKSA9PiB7XG4gICAgICAgIGZuKGl0ZW0sIChlcnIsIHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgaWYgKGVycikgZXJyb3IgPSBlcnI7XG4gICAgICAgICAgICByZXN1bHRzW2ldID0gKChyZXN1bHQ6IGFueSk6IFJlc3VsdCk7IC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9mbG93L2lzc3Vlcy8yMTIzXG4gICAgICAgICAgICBpZiAoLS1yZW1haW5pbmcgPT09IDApIGNhbGxiYWNrKGVycm9yLCByZXN1bHRzKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbi8qXG4gKiBQb2x5ZmlsbCBmb3IgT2JqZWN0LnZhbHVlcy4gTm90IGZ1bGx5IHNwZWMgY29tcGxpYW50LCBidXQgd2UgZG9uJ3RcbiAqIG5lZWQgaXQgdG8gYmUuXG4gKlxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbHVlczxUPihvYmo6IHtba2V5OiBzdHJpbmddOiBUfSk6IEFycmF5PFQ+IHtcbiAgICBjb25zdCByZXN1bHQgPSBbXTtcbiAgICBmb3IgKGNvbnN0IGsgaW4gb2JqKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKG9ialtrXSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbi8qXG4gKiBDb21wdXRlIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gdGhlIGtleXMgaW4gb25lIG9iamVjdCBhbmQgdGhlIGtleXNcbiAqIGluIGFub3RoZXIgb2JqZWN0LlxuICpcbiAqIEByZXR1cm5zIGtleXMgZGlmZmVyZW5jZVxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGtleXNEaWZmZXJlbmNlPFMsIFQ+KG9iajoge1trZXk6IHN0cmluZ106IFN9LCBvdGhlcjoge1trZXk6IHN0cmluZ106IFR9KTogQXJyYXk8c3RyaW5nPiB7XG4gICAgY29uc3QgZGlmZmVyZW5jZSA9IFtdO1xuICAgIGZvciAoY29uc3QgaSBpbiBvYmopIHtcbiAgICAgICAgaWYgKCEoaSBpbiBvdGhlcikpIHtcbiAgICAgICAgICAgIGRpZmZlcmVuY2UucHVzaChpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGlmZmVyZW5jZTtcbn1cblxuLyoqXG4gKiBHaXZlbiBhIGRlc3RpbmF0aW9uIG9iamVjdCBhbmQgb3B0aW9uYWxseSBtYW55IHNvdXJjZSBvYmplY3RzLFxuICogY29weSBhbGwgcHJvcGVydGllcyBmcm9tIHRoZSBzb3VyY2Ugb2JqZWN0cyBpbnRvIHRoZSBkZXN0aW5hdGlvbi5cbiAqIFRoZSBsYXN0IHNvdXJjZSBvYmplY3QgZ2l2ZW4gb3ZlcnJpZGVzIHByb3BlcnRpZXMgZnJvbSBwcmV2aW91c1xuICogc291cmNlIG9iamVjdHMuXG4gKlxuICogQHBhcmFtIGRlc3QgZGVzdGluYXRpb24gb2JqZWN0XG4gKiBAcGFyYW0gc291cmNlcyBzb3VyY2VzIGZyb20gd2hpY2ggcHJvcGVydGllcyBhcmUgcHVsbGVkXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZXh0ZW5kKGRlc3Q6IE9iamVjdCwgLi4uc291cmNlczogQXJyYXk8P09iamVjdD4pOiBPYmplY3Qge1xuICAgIGZvciAoY29uc3Qgc3JjIG9mIHNvdXJjZXMpIHtcbiAgICAgICAgZm9yIChjb25zdCBrIGluIHNyYykge1xuICAgICAgICAgICAgZGVzdFtrXSA9IHNyY1trXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGVzdDtcbn1cblxuLyoqXG4gKiBHaXZlbiBhbiBvYmplY3QgYW5kIGEgbnVtYmVyIG9mIHByb3BlcnRpZXMgYXMgc3RyaW5ncywgcmV0dXJuIHZlcnNpb25cbiAqIG9mIHRoYXQgb2JqZWN0IHdpdGggb25seSB0aG9zZSBwcm9wZXJ0aWVzLlxuICpcbiAqIEBwYXJhbSBzcmMgdGhlIG9iamVjdFxuICogQHBhcmFtIHByb3BlcnRpZXMgYW4gYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMgY2hvc2VuXG4gKiB0byBhcHBlYXIgb24gdGhlIHJlc3VsdGluZyBvYmplY3QuXG4gKiBAcmV0dXJucyBvYmplY3Qgd2l0aCBsaW1pdGVkIHByb3BlcnRpZXMuXG4gKiBAZXhhbXBsZVxuICogdmFyIGZvbyA9IHsgbmFtZTogJ0NoYXJsaWUnLCBhZ2U6IDEwIH07XG4gKiB2YXIganVzdE5hbWUgPSBwaWNrKGZvbywgWyduYW1lJ10pO1xuICogLy8ganVzdE5hbWUgPSB7IG5hbWU6ICdDaGFybGllJyB9XG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gcGljayhzcmM6IE9iamVjdCwgcHJvcGVydGllczogQXJyYXk8c3RyaW5nPik6IE9iamVjdCB7XG4gICAgY29uc3QgcmVzdWx0ID0ge307XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcm9wZXJ0aWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGsgPSBwcm9wZXJ0aWVzW2ldO1xuICAgICAgICBpZiAoayBpbiBzcmMpIHtcbiAgICAgICAgICAgIHJlc3VsdFtrXSA9IHNyY1trXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5sZXQgaWQgPSAxO1xuXG4vKipcbiAqIFJldHVybiBhIHVuaXF1ZSBudW1lcmljIGlkLCBzdGFydGluZyBhdCAxIGFuZCBpbmNyZW1lbnRpbmcgd2l0aFxuICogZWFjaCBjYWxsLlxuICpcbiAqIEByZXR1cm5zIHVuaXF1ZSBudW1lcmljIGlkLlxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVuaXF1ZUlkKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIGlkKys7XG59XG5cbi8qKlxuICogUmV0dXJuIGEgcmFuZG9tIFVVSUQgKHY0KS4gVGFrZW4gZnJvbTogaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vamVkLzk4Mjg4M1xuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHV1aWQoKTogc3RyaW5nIHtcbiAgICBmdW5jdGlvbiBiKGEpIHtcbiAgICAgICAgcmV0dXJuIGEgPyAoYSBeIE1hdGgucmFuZG9tKCkgKiAxNiA+PiBhIC8gNCkudG9TdHJpbmcoMTYpIDpcbiAgICAgICAgLy8kRmxvd0ZpeE1lOiBGbG93IGRvZXNuJ3QgbGlrZSB0aGUgaW1wbGllZCBhcnJheSBsaXRlcmFsIGNvbnZlcnNpb24gaGVyZVxuICAgICAgICAgICAgKFsxZTddICsgLVsxZTNdICsgLTRlMyArIC04ZTMgKyAtMWUxMSkucmVwbGFjZSgvWzAxOF0vZywgYik7XG4gICAgfVxuICAgIHJldHVybiBiKCk7XG59XG5cbi8qKlxuICogVmFsaWRhdGUgYSBzdHJpbmcgdG8gbWF0Y2ggVVVJRCh2NCkgb2YgdGhlXG4gKiBmb3JtOiB4eHh4eHh4eC14eHh4LTR4eHgtWzg5YWJdeHh4LXh4eHh4eHh4eHh4eFxuICogQHBhcmFtIHN0ciBzdHJpbmcgdG8gdmFsaWRhdGUuXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVVdWlkKHN0cjogP3N0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBzdHIgPyAvXlswLTlhLWZdezh9LVswLTlhLWZdezR9LVs0XVswLTlhLWZdezN9LVs4OWFiXVswLTlhLWZdezN9LVswLTlhLWZdezEyfSQvaS50ZXN0KHN0cikgOiBmYWxzZTtcbn1cblxuLyoqXG4gKiBHaXZlbiBhbiBhcnJheSBvZiBtZW1iZXIgZnVuY3Rpb24gbmFtZXMgYXMgc3RyaW5ncywgcmVwbGFjZSBhbGwgb2YgdGhlbVxuICogd2l0aCBib3VuZCB2ZXJzaW9ucyB0aGF0IHdpbGwgYWx3YXlzIHJlZmVyIHRvIGBjb250ZXh0YCBhcyBgdGhpc2AuIFRoaXNcbiAqIGlzIHVzZWZ1bCBmb3IgY2xhc3NlcyB3aGVyZSBvdGhlcndpc2UgZXZlbnQgYmluZGluZ3Mgd291bGQgcmVhc3NpZ25cbiAqIGB0aGlzYCB0byB0aGUgZXZlbnRlZCBvYmplY3Qgb3Igc29tZSBvdGhlciB2YWx1ZTogdGhpcyBsZXRzIHlvdSBlbnN1cmVcbiAqIHRoZSBgdGhpc2AgdmFsdWUgYWx3YXlzLlxuICpcbiAqIEBwYXJhbSBmbnMgbGlzdCBvZiBtZW1iZXIgZnVuY3Rpb24gbmFtZXNcbiAqIEBwYXJhbSBjb250ZXh0IHRoZSBjb250ZXh0IHZhbHVlXG4gKiBAZXhhbXBsZVxuICogZnVuY3Rpb24gTXlDbGFzcygpIHtcbiAqICAgYmluZEFsbChbJ29udGltZXInXSwgdGhpcyk7XG4gKiAgIHRoaXMubmFtZSA9ICdUb20nO1xuICogfVxuICogTXlDbGFzcy5wcm90b3R5cGUub250aW1lciA9IGZ1bmN0aW9uKCkge1xuICogICBhbGVydCh0aGlzLm5hbWUpO1xuICogfTtcbiAqIHZhciBteUNsYXNzID0gbmV3IE15Q2xhc3MoKTtcbiAqIHNldFRpbWVvdXQobXlDbGFzcy5vbnRpbWVyLCAxMDApO1xuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJpbmRBbGwoZm5zOiBBcnJheTxzdHJpbmc+LCBjb250ZXh0OiBPYmplY3QpOiB2b2lkIHtcbiAgICBmbnMuZm9yRWFjaCgoZm4pID0+IHtcbiAgICAgICAgaWYgKCFjb250ZXh0W2ZuXSkgeyByZXR1cm47IH1cbiAgICAgICAgY29udGV4dFtmbl0gPSBjb250ZXh0W2ZuXS5iaW5kKGNvbnRleHQpO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHN0cmluZyBlbmRzIHdpdGggYSBwYXJ0aWN1bGFyIHN1YnN0cmluZ1xuICpcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbmRzV2l0aChzdHJpbmc6IHN0cmluZywgc3VmZml4OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gc3RyaW5nLmluZGV4T2Yoc3VmZml4LCBzdHJpbmcubGVuZ3RoIC0gc3VmZml4Lmxlbmd0aCkgIT09IC0xO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhbiBvYmplY3QgYnkgbWFwcGluZyBhbGwgdGhlIHZhbHVlcyBvZiBhbiBleGlzdGluZyBvYmplY3Qgd2hpbGVcbiAqIHByZXNlcnZpbmcgdGhlaXIga2V5cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFwT2JqZWN0KGlucHV0OiBPYmplY3QsIGl0ZXJhdG9yOiBGdW5jdGlvbiwgY29udGV4dD86IE9iamVjdCk6IE9iamVjdCB7XG4gICAgY29uc3Qgb3V0cHV0ID0ge307XG4gICAgZm9yIChjb25zdCBrZXkgaW4gaW5wdXQpIHtcbiAgICAgICAgb3V0cHV0W2tleV0gPSBpdGVyYXRvci5jYWxsKGNvbnRleHQgfHwgdGhpcywgaW5wdXRba2V5XSwga2V5LCBpbnB1dCk7XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG59XG5cbi8qKlxuICogQ3JlYXRlIGFuIG9iamVjdCBieSBmaWx0ZXJpbmcgb3V0IHZhbHVlcyBvZiBhbiBleGlzdGluZyBvYmplY3QuXG4gKlxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpbHRlck9iamVjdChpbnB1dDogT2JqZWN0LCBpdGVyYXRvcjogRnVuY3Rpb24sIGNvbnRleHQ/OiBPYmplY3QpOiBPYmplY3Qge1xuICAgIGNvbnN0IG91dHB1dCA9IHt9O1xuICAgIGZvciAoY29uc3Qga2V5IGluIGlucHV0KSB7XG4gICAgICAgIGlmIChpdGVyYXRvci5jYWxsKGNvbnRleHQgfHwgdGhpcywgaW5wdXRba2V5XSwga2V5LCBpbnB1dCkpIHtcbiAgICAgICAgICAgIG91dHB1dFtrZXldID0gaW5wdXRba2V5XTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0O1xufVxuXG5pbXBvcnQgZGVlcEVxdWFsIGZyb20gJy4uL3N0eWxlLXNwZWMvdXRpbC9kZWVwX2VxdWFsJztcbmV4cG9ydCB7IGRlZXBFcXVhbCB9O1xuXG4vKipcbiAqIERlZXBseSBjbG9uZXMgdHdvIG9iamVjdHMuXG4gKlxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsb25lPFQ+KGlucHV0OiBUKTogVCB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoaW5wdXQpKSB7XG4gICAgICAgIHJldHVybiBpbnB1dC5tYXAoY2xvbmUpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGlucHV0ID09PSAnb2JqZWN0JyAmJiBpbnB1dCkge1xuICAgICAgICByZXR1cm4gKChtYXBPYmplY3QoaW5wdXQsIGNsb25lKTogYW55KTogVCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGlucHV0O1xuICAgIH1cbn1cblxuLyoqXG4gKiBDaGVjayBpZiB0d28gYXJyYXlzIGhhdmUgYXQgbGVhc3Qgb25lIGNvbW1vbiBlbGVtZW50LlxuICpcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcnJheXNJbnRlcnNlY3Q8VD4oYTogQXJyYXk8VD4sIGI6IEFycmF5PFQ+KTogYm9vbGVhbiB7XG4gICAgZm9yIChsZXQgbCA9IDA7IGwgPCBhLmxlbmd0aDsgbCsrKSB7XG4gICAgICAgIGlmIChiLmluZGV4T2YoYVtsXSkgPj0gMCkgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBQcmludCBhIHdhcm5pbmcgbWVzc2FnZSB0byB0aGUgY29uc29sZSBhbmQgZW5zdXJlIGR1cGxpY2F0ZSB3YXJuaW5nIG1lc3NhZ2VzXG4gKiBhcmUgbm90IHByaW50ZWQuXG4gKlxuICogQHByaXZhdGVcbiAqL1xuY29uc3Qgd2Fybk9uY2VIaXN0b3J5OiB7W2tleTogc3RyaW5nXTogYm9vbGVhbn0gPSB7fTtcblxuZXhwb3J0IGZ1bmN0aW9uIHdhcm5PbmNlKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICghd2Fybk9uY2VIaXN0b3J5W21lc3NhZ2VdKSB7XG4gICAgICAgIC8vIGNvbnNvbGUgaXNuJ3QgZGVmaW5lZCBpbiBzb21lIFdlYldvcmtlcnMsIHNlZSAjMjU1OFxuICAgICAgICBpZiAodHlwZW9mIGNvbnNvbGUgIT09IFwidW5kZWZpbmVkXCIpIGNvbnNvbGUud2FybihtZXNzYWdlKTtcbiAgICAgICAgd2Fybk9uY2VIaXN0b3J5W21lc3NhZ2VdID0gdHJ1ZTtcbiAgICB9XG59XG5cbi8qKlxuICogSW5kaWNhdGVzIGlmIHRoZSBwcm92aWRlZCBQb2ludHMgYXJlIGluIGEgY291bnRlciBjbG9ja3dpc2UgKHRydWUpIG9yIGNsb2Nrd2lzZSAoZmFsc2UpIG9yZGVyXG4gKlxuICogQHByaXZhdGVcbiAqIEByZXR1cm5zIHRydWUgZm9yIGEgY291bnRlciBjbG9ja3dpc2Ugc2V0IG9mIHBvaW50c1xuICovXG4vLyBodHRwOi8vYnJ5Y2Vib2UuY29tLzIwMDYvMTAvMjMvbGluZS1zZWdtZW50LWludGVyc2VjdGlvbi1hbGdvcml0aG0vXG5leHBvcnQgZnVuY3Rpb24gaXNDb3VudGVyQ2xvY2t3aXNlKGE6IFBvaW50LCBiOiBQb2ludCwgYzogUG9pbnQpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKGMueSAtIGEueSkgKiAoYi54IC0gYS54KSA+IChiLnkgLSBhLnkpICogKGMueCAtIGEueCk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgc2lnbmVkIGFyZWEgZm9yIHRoZSBwb2x5Z29uIHJpbmcuICBQb3N0aXZlIGFyZWFzIGFyZSBleHRlcmlvciByaW5ncyBhbmRcbiAqIGhhdmUgYSBjbG9ja3dpc2Ugd2luZGluZy4gIE5lZ2F0aXZlIGFyZWFzIGFyZSBpbnRlcmlvciByaW5ncyBhbmQgaGF2ZSBhIGNvdW50ZXIgY2xvY2t3aXNlXG4gKiBvcmRlcmluZy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHJpbmcgRXh0ZXJpb3Igb3IgaW50ZXJpb3IgcmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gY2FsY3VsYXRlU2lnbmVkQXJlYShyaW5nOiBBcnJheTxQb2ludD4pOiBudW1iZXIge1xuICAgIGxldCBzdW0gPSAwO1xuICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSByaW5nLmxlbmd0aCwgaiA9IGxlbiAtIDEsIHAxLCBwMjsgaSA8IGxlbjsgaiA9IGkrKykge1xuICAgICAgICBwMSA9IHJpbmdbaV07XG4gICAgICAgIHAyID0gcmluZ1tqXTtcbiAgICAgICAgc3VtICs9IChwMi54IC0gcDEueCkgKiAocDEueSArIHAyLnkpO1xuICAgIH1cbiAgICByZXR1cm4gc3VtO1xufVxuXG4vKipcbiAqIERldGVjdHMgY2xvc2VkIHBvbHlnb25zLCBmaXJzdCArIGxhc3QgcG9pbnQgYXJlIGVxdWFsXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSBwb2ludHMgYXJyYXkgb2YgcG9pbnRzXG4gKiBAcmV0dXJuIHRydWUgaWYgdGhlIHBvaW50cyBhcmUgYSBjbG9zZWQgcG9seWdvblxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNDbG9zZWRQb2x5Z29uKHBvaW50czogQXJyYXk8UG9pbnQ+KTogYm9vbGVhbiB7XG4gICAgLy8gSWYgaXQgaXMgMiBwb2ludHMgdGhhdCBhcmUgdGhlIHNhbWUgdGhlbiBpdCBpcyBhIHBvaW50XG4gICAgLy8gSWYgaXQgaXMgMyBwb2ludHMgd2l0aCBzdGFydCBhbmQgZW5kIHRoZSBzYW1lIHRoZW4gaXQgaXMgYSBsaW5lXG4gICAgaWYgKHBvaW50cy5sZW5ndGggPCA0KVxuICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICBjb25zdCBwMSA9IHBvaW50c1swXTtcbiAgICBjb25zdCBwMiA9IHBvaW50c1twb2ludHMubGVuZ3RoIC0gMV07XG5cbiAgICBpZiAoTWF0aC5hYnMocDEueCAtIHAyLngpID4gMCB8fFxuICAgICAgICBNYXRoLmFicyhwMS55IC0gcDIueSkgPiAwKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBwb2x5Z29uIHNpbXBsaWZpY2F0aW9uIGNhbiBwcm9kdWNlIHBvbHlnb25zIHdpdGggemVybyBhcmVhIGFuZCBtb3JlIHRoYW4gMyBwb2ludHNcbiAgICByZXR1cm4gTWF0aC5hYnMoY2FsY3VsYXRlU2lnbmVkQXJlYShwb2ludHMpKSA+IDAuMDE7XG59XG5cbi8qKlxuICogQ29udmVydHMgc3BoZXJpY2FsIGNvb3JkaW5hdGVzIHRvIGNhcnRlc2lhbiBjb29yZGluYXRlcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHNwaGVyaWNhbCBTcGhlcmljYWwgY29vcmRpbmF0ZXMsIGluIFtyYWRpYWwsIGF6aW11dGhhbCwgcG9sYXJdXG4gKiBAcmV0dXJuIGNhcnRlc2lhbiBjb29yZGluYXRlcyBpbiBbeCwgeSwgel1cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gc3BoZXJpY2FsVG9DYXJ0ZXNpYW4oW3IsIGF6aW11dGhhbCwgcG9sYXJdOiBbbnVtYmVyLCBudW1iZXIsIG51bWJlcl0pOiB7eDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlcn0ge1xuICAgIC8vIFdlIGFic3RyYWN0IFwibm9ydGhcIi9cInVwXCIgKGNvbXBhc3Mtd2lzZSkgdG8gYmUgMMKwIHdoZW4gcmVhbGx5IHRoaXMgaXMgOTDCsCAoz4AvMik6XG4gICAgLy8gY29ycmVjdCBmb3IgdGhhdCBoZXJlXG4gICAgYXppbXV0aGFsICs9IDkwO1xuXG4gICAgLy8gQ29udmVydCBhemltdXRoYWwgYW5kIHBvbGFyIGFuZ2xlcyB0byByYWRpYW5zXG4gICAgYXppbXV0aGFsICo9IE1hdGguUEkgLyAxODA7XG4gICAgcG9sYXIgKj0gTWF0aC5QSSAvIDE4MDtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHg6IHIgKiBNYXRoLmNvcyhhemltdXRoYWwpICogTWF0aC5zaW4ocG9sYXIpLFxuICAgICAgICB5OiByICogTWF0aC5zaW4oYXppbXV0aGFsKSAqIE1hdGguc2luKHBvbGFyKSxcbiAgICAgICAgejogciAqIE1hdGguY29zKHBvbGFyKVxuICAgIH07XG59XG5cbi8qKlxuICogUGFyc2VzIGRhdGEgZnJvbSAnQ2FjaGUtQ29udHJvbCcgaGVhZGVycy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIGNhY2hlQ29udHJvbCBWYWx1ZSBvZiAnQ2FjaGUtQ29udHJvbCcgaGVhZGVyXG4gKiBAcmV0dXJuIG9iamVjdCBjb250YWluaW5nIHBhcnNlZCBoZWFkZXIgaW5mby5cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VDYWNoZUNvbnRyb2woY2FjaGVDb250cm9sOiBzdHJpbmcpOiBPYmplY3Qge1xuICAgIC8vIFRha2VuIGZyb20gW1dyZWNrXShodHRwczovL2dpdGh1Yi5jb20vaGFwaWpzL3dyZWNrKVxuICAgIGNvbnN0IHJlID0gLyg/Ol58KD86XFxzKlxcLFxccyopKShbXlxceDAwLVxceDIwXFwoXFwpPD5AXFwsO1xcOlxcXFxcIlxcL1xcW1xcXVxcP1xcPVxce1xcfVxceDdGXSspKD86XFw9KD86KFteXFx4MDAtXFx4MjBcXChcXCk8PkBcXCw7XFw6XFxcXFwiXFwvXFxbXFxdXFw/XFw9XFx7XFx9XFx4N0ZdKyl8KD86XFxcIigoPzpbXlwiXFxcXF18XFxcXC4pKilcXFwiKSkpPy9nO1xuXG4gICAgY29uc3QgaGVhZGVyID0ge307XG4gICAgY2FjaGVDb250cm9sLnJlcGxhY2UocmUsICgkMCwgJDEsICQyLCAkMykgPT4ge1xuICAgICAgICBjb25zdCB2YWx1ZSA9ICQyIHx8ICQzO1xuICAgICAgICBoZWFkZXJbJDFdID0gdmFsdWUgPyB2YWx1ZS50b0xvd2VyQ2FzZSgpIDogdHJ1ZTtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH0pO1xuXG4gICAgaWYgKGhlYWRlclsnbWF4LWFnZSddKSB7XG4gICAgICAgIGNvbnN0IG1heEFnZSA9IHBhcnNlSW50KGhlYWRlclsnbWF4LWFnZSddLCAxMCk7XG4gICAgICAgIGlmIChpc05hTihtYXhBZ2UpKSBkZWxldGUgaGVhZGVyWydtYXgtYWdlJ107XG4gICAgICAgIGVsc2UgaGVhZGVyWydtYXgtYWdlJ10gPSBtYXhBZ2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIGhlYWRlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0b3JhZ2VBdmFpbGFibGUodHlwZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgc3RvcmFnZSA9IHdpbmRvd1t0eXBlXTtcbiAgICAgICAgc3RvcmFnZS5zZXRJdGVtKCdfbWFwYm94X3Rlc3RfJywgMSk7XG4gICAgICAgIHN0b3JhZ2UucmVtb3ZlSXRlbSgnX21hcGJveF90ZXN0XycpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5cbi8vIFRoZSBmb2xsb3dpbmcgbWV0aG9kcyBhcmUgZnJvbSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvV2luZG93QmFzZTY0L0Jhc2U2NF9lbmNvZGluZ19hbmRfZGVjb2RpbmcjVGhlX1VuaWNvZGVfUHJvYmxlbVxuLy9Vbmljb2RlIGNvbXBsaWFudCBiYXNlNjQgZW5jb2RlciBmb3Igc3RyaW5nc1xuZXhwb3J0IGZ1bmN0aW9uIGI2NEVuY29kZVVuaWNvZGUoc3RyOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gd2luZG93LmJ0b2EoXG4gICAgICAgIGVuY29kZVVSSUNvbXBvbmVudChzdHIpLnJlcGxhY2UoLyUoWzAtOUEtRl17Mn0pL2csXG4gICAgICAgICAgICAobWF0Y2gsIHAxKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoTnVtYmVyKCcweCcgKyBwMSkpOyAvL2VzbGludC1kaXNhYmxlLWxpbmVcbiAgICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgICk7XG59XG5cblxuLy8gVW5pY29kZSBjb21wbGlhbnQgZGVjb2RlciBmb3IgYmFzZTY0LWVuY29kZWQgc3RyaW5nc1xuZXhwb3J0IGZ1bmN0aW9uIGI2NERlY29kZVVuaWNvZGUoc3RyOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHdpbmRvdy5hdG9iKHN0cikuc3BsaXQoJycpLm1hcCgoYykgPT4ge1xuICAgICAgICByZXR1cm4gJyUnICsgKCcwMCcgKyBjLmNoYXJDb2RlQXQoMCkudG9TdHJpbmcoMTYpKS5zbGljZSgtMik7IC8vZXNsaW50LWRpc2FibGUtbGluZVxuICAgIH0pLmpvaW4oJycpKTtcbn1cbiIsIi8vIEBmbG93IHN0cmljdFxuXG50eXBlIENvbmZpZyA9IHt8XG4gIEFQSV9VUkw6IHN0cmluZyxcbiAgRVZFTlRTX1VSTDogP3N0cmluZyxcbiAgRkVFREJBQ0tfVVJMOiBzdHJpbmcsXG4gIFJFUVVJUkVfQUNDRVNTX1RPS0VOOiBib29sZWFuLFxuICBBQ0NFU1NfVE9LRU46ID9zdHJpbmcsXG4gIE1BWF9QQVJBTExFTF9JTUFHRV9SRVFVRVNUUzogbnVtYmVyXG58fTtcblxuY29uc3QgY29uZmlnOiBDb25maWcgPSB7XG4gICAgQVBJX1VSTDogJ2h0dHBzOi8vYXBpLm1hcGJveC5jb20nLFxuICAgIGdldCBFVkVOVFNfVVJMKCkge1xuICAgICAgICBpZiAoIXRoaXMuQVBJX1VSTCkgeyByZXR1cm4gbnVsbDsgfVxuICAgICAgICBpZiAodGhpcy5BUElfVVJMLmluZGV4T2YoJ2h0dHBzOi8vYXBpLm1hcGJveC5jbicpID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gJ2h0dHBzOi8vZXZlbnRzLm1hcGJveC5jbi9ldmVudHMvdjInO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuQVBJX1VSTC5pbmRleE9mKCdodHRwczovL2FwaS5tYXBib3guY29tJykgPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiAnaHR0cHM6Ly9ldmVudHMubWFwYm94LmNvbS9ldmVudHMvdjInO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIEZFRURCQUNLX1VSTDogJ2h0dHBzOi8vYXBwcy5tYXBib3guY29tL2ZlZWRiYWNrJyxcbiAgICBSRVFVSVJFX0FDQ0VTU19UT0tFTjogdHJ1ZSxcbiAgICBBQ0NFU1NfVE9LRU46IG51bGwsXG4gICAgTUFYX1BBUkFMTEVMX0lNQUdFX1JFUVVFU1RTOiAxNlxufTtcblxuZXhwb3J0IGRlZmF1bHQgY29uZmlnO1xuIiwiLy8gQGZsb3cgc3RyaWN0XG5cbmltcG9ydCB3aW5kb3cgZnJvbSAnLi93aW5kb3cnO1xuaW1wb3J0IHR5cGUgeyBDYW5jZWxhYmxlIH0gZnJvbSAnLi4vdHlwZXMvY2FuY2VsYWJsZSc7XG5cbmNvbnN0IG5vdyA9IHdpbmRvdy5wZXJmb3JtYW5jZSAmJiB3aW5kb3cucGVyZm9ybWFuY2Uubm93ID9cbiAgICB3aW5kb3cucGVyZm9ybWFuY2Uubm93LmJpbmQod2luZG93LnBlcmZvcm1hbmNlKSA6XG4gICAgRGF0ZS5ub3cuYmluZChEYXRlKTtcblxuY29uc3QgcmFmID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgIHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgd2luZG93Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuXG5jb25zdCBjYW5jZWwgPSB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgfHxcbiAgICB3aW5kb3cubW96Q2FuY2VsQW5pbWF0aW9uRnJhbWUgfHxcbiAgICB3aW5kb3cud2Via2l0Q2FuY2VsQW5pbWF0aW9uRnJhbWUgfHxcbiAgICB3aW5kb3cubXNDYW5jZWxBbmltYXRpb25GcmFtZTtcblxubGV0IGxpbmtFbDtcblxuLyoqXG4gKiBAcHJpdmF0ZVxuICovXG5jb25zdCBleHBvcnRlZCA9IHtcbiAgICAvKipcbiAgICAgKiBQcm92aWRlcyBhIGZ1bmN0aW9uIHRoYXQgb3V0cHV0cyBtaWxsaXNlY29uZHM6IGVpdGhlciBwZXJmb3JtYW5jZS5ub3coKVxuICAgICAqIG9yIGEgZmFsbGJhY2sgdG8gRGF0ZS5ub3coKVxuICAgICAqL1xuICAgIG5vdyxcblxuICAgIGZyYW1lKGZuOiAoKSA9PiB2b2lkKTogQ2FuY2VsYWJsZSB7XG4gICAgICAgIGNvbnN0IGZyYW1lID0gcmFmKGZuKTtcbiAgICAgICAgcmV0dXJuIHsgY2FuY2VsOiAoKSA9PiBjYW5jZWwoZnJhbWUpIH07XG4gICAgfSxcblxuICAgIGdldEltYWdlRGF0YShpbWc6IENhbnZhc0ltYWdlU291cmNlKTogSW1hZ2VEYXRhIHtcbiAgICAgICAgY29uc3QgY2FudmFzID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICBjb25zdCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIGlmICghY29udGV4dCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdmYWlsZWQgdG8gY3JlYXRlIGNhbnZhcyAyZCBjb250ZXh0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgY2FudmFzLndpZHRoID0gaW1nLndpZHRoO1xuICAgICAgICBjYW52YXMuaGVpZ2h0ID0gaW1nLmhlaWdodDtcbiAgICAgICAgY29udGV4dC5kcmF3SW1hZ2UoaW1nLCAwLCAwLCBpbWcud2lkdGgsIGltZy5oZWlnaHQpO1xuICAgICAgICByZXR1cm4gY29udGV4dC5nZXRJbWFnZURhdGEoMCwgMCwgaW1nLndpZHRoLCBpbWcuaGVpZ2h0KTtcbiAgICB9LFxuXG4gICAgcmVzb2x2ZVVSTChwYXRoOiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKCFsaW5rRWwpIGxpbmtFbCA9IHdpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgIGxpbmtFbC5ocmVmID0gcGF0aDtcbiAgICAgICAgcmV0dXJuIGxpbmtFbC5ocmVmO1xuICAgIH0sXG5cbiAgICBoYXJkd2FyZUNvbmN1cnJlbmN5OiB3aW5kb3cubmF2aWdhdG9yLmhhcmR3YXJlQ29uY3VycmVuY3kgfHwgNCxcbiAgICBnZXQgZGV2aWNlUGl4ZWxSYXRpbygpIHsgcmV0dXJuIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvOyB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBleHBvcnRlZDtcbiIsIi8vIEBmbG93IHN0cmljdFxuXG5pbXBvcnQgd2luZG93IGZyb20gJy4vd2luZG93JztcblxuY29uc3QgZXhwb3J0ZWQgPSB7XG4gICAgc3VwcG9ydGVkOiBmYWxzZSxcbiAgICB0ZXN0U3VwcG9ydFxufTtcblxuZXhwb3J0IGRlZmF1bHQgZXhwb3J0ZWQ7XG5cbmxldCBnbEZvclRlc3Rpbmc7XG5sZXQgd2VicENoZWNrQ29tcGxldGUgPSBmYWxzZTtcbmxldCB3ZWJwSW1nVGVzdDtcbmxldCB3ZWJwSW1nVGVzdE9ubG9hZENvbXBsZXRlID0gZmFsc2U7XG5cbmlmICh3aW5kb3cuZG9jdW1lbnQpIHtcbiAgICB3ZWJwSW1nVGVzdCA9IHdpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcbiAgICB3ZWJwSW1nVGVzdC5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGdsRm9yVGVzdGluZykgdGVzdFdlYnBUZXh0dXJlVXBsb2FkKGdsRm9yVGVzdGluZyk7XG4gICAgICAgIGdsRm9yVGVzdGluZyA9IG51bGw7XG4gICAgICAgIHdlYnBJbWdUZXN0T25sb2FkQ29tcGxldGUgPSB0cnVlO1xuICAgIH07XG4gICAgd2VicEltZ1Rlc3Qub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB3ZWJwQ2hlY2tDb21wbGV0ZSA9IHRydWU7XG4gICAgICAgIGdsRm9yVGVzdGluZyA9IG51bGw7XG4gICAgfTtcbiAgICB3ZWJwSW1nVGVzdC5zcmMgPSAnZGF0YTppbWFnZS93ZWJwO2Jhc2U2NCxVa2xHUmg0QUFBQlhSVUpRVmxBNFRCRUFBQUF2QVFBQUFBZlEvLzczdi8rQmlPaC9BQUE9Jztcbn1cblxuZnVuY3Rpb24gdGVzdFN1cHBvcnQoZ2w6IFdlYkdMUmVuZGVyaW5nQ29udGV4dCkge1xuICAgIGlmICh3ZWJwQ2hlY2tDb21wbGV0ZSB8fCAhd2VicEltZ1Rlc3QpIHJldHVybjtcblxuICAgIC8vIEhUTUxJbWFnZUVsZW1lbnQuY29tcGxldGUgaXMgc2V0IHdoZW4gYW4gaW1hZ2UgaXMgZG9uZSBsb2FkaW5nIGl0J3Mgc291cmNlXG4gICAgLy8gcmVnYXJkbGVzcyBvZiB3aGV0aGVyIHRoZSBsb2FkIHdhcyBzdWNjZXNzZnVsIG9yIG5vdC5cbiAgICAvLyBJdCdzIHBvc3NpYmxlIGZvciBhbiBlcnJvciB0byBzZXQgSFRNTEltYWdlRWxlbWVudC5jb21wbGV0ZSB0byB0cnVlIHdoaWNoIHdvdWxkIHRyaWdnZXJcbiAgICAvLyB0ZXN0V2VicFRleHR1cmVVcGxvYWQgYW5kIG1pc3Rha2VubHkgc2V0IGV4cG9ydGVkLnN1cHBvcnRlZCB0byB0cnVlIGluIGJyb3dzZXJzIHdoaWNoIGRvbid0IHN1cHBvcnQgd2VicFxuICAgIC8vIFRvIGF2b2lkIHRoaXMsIHdlIHNldCBhIGZsYWcgaW4gdGhlIGltYWdlJ3Mgb25sb2FkIGhhbmRsZXIgYW5kIG9ubHkgY2FsbCB0ZXN0V2VicFRleHR1cmVVcGxvYWRcbiAgICAvLyBhZnRlciBhIHN1Y2Nlc3NmdWwgaW1hZ2UgbG9hZCBldmVudC5cbiAgICBpZiAod2VicEltZ1Rlc3RPbmxvYWRDb21wbGV0ZSkge1xuICAgICAgICB0ZXN0V2VicFRleHR1cmVVcGxvYWQoZ2wpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGdsRm9yVGVzdGluZyA9IGdsO1xuXG4gICAgfVxufVxuXG5mdW5jdGlvbiB0ZXN0V2VicFRleHR1cmVVcGxvYWQoZ2w6IFdlYkdMUmVuZGVyaW5nQ29udGV4dCkge1xuICAgIC8vIEVkZ2UgMTggc3VwcG9ydHMgV2ViUCBidXQgbm90IHVwbG9hZGluZyBhIFdlYlAgaW1hZ2UgdG8gYSBnbCB0ZXh0dXJlXG4gICAgLy8gVGVzdCBzdXBwb3J0IGZvciB0aGlzIGJlZm9yZSBhbGxvd2luZyBXZWJQIGltYWdlcy5cbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vbWFwYm94L21hcGJveC1nbC1qcy9pc3N1ZXMvNzY3MVxuICAgIGNvbnN0IHRleHR1cmUgPSBnbC5jcmVhdGVUZXh0dXJlKCk7XG4gICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGV4dHVyZSk7XG5cbiAgICB0cnkge1xuICAgICAgICBnbC50ZXhJbWFnZTJEKGdsLlRFWFRVUkVfMkQsIDAsIGdsLlJHQkEsIGdsLlJHQkEsIGdsLlVOU0lHTkVEX0JZVEUsIHdlYnBJbWdUZXN0KTtcblxuICAgICAgICAvLyBUaGUgZXJyb3IgZG9lcyBub3QgZ2V0IHRyaWdnZXJlZCBpbiBFZGdlIGlmIHRoZSBjb250ZXh0IGlzIGxvc3RcbiAgICAgICAgaWYgKGdsLmlzQ29udGV4dExvc3QoKSkgcmV0dXJuO1xuXG4gICAgICAgIGV4cG9ydGVkLnN1cHBvcnRlZCA9IHRydWU7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBDYXRjaCBcIlVuc3BlY2lmaWVkIEVycm9yLlwiIGluIEVkZ2UgMTguXG4gICAgfVxuXG4gICAgZ2wuZGVsZXRlVGV4dHVyZSh0ZXh0dXJlKTtcblxuICAgIHdlYnBDaGVja0NvbXBsZXRlID0gdHJ1ZTtcbn1cbiIsIi8vIEBmbG93XG5cbi8qKioqKiBTVEFSVCBXQVJOSU5HIC0gSUYgWU9VIFVTRSBUSElTIENPREUgV0lUSCBNQVBCT1ggTUFQUElORyBBUElTLCBSRU1PVkFMIE9SXG4qIE1PRElGSUNBVElPTiBPRiBUSEUgRk9MTE9XSU5HIENPREUgVklPTEFURVMgVEhFIE1BUEJPWCBURVJNUyBPRiBTRVJWSUNFICAqKioqKipcbiogVGhlIGZvbGxvd2luZyBjb2RlIGlzIHVzZWQgdG8gYWNjZXNzIE1hcGJveCdzIE1hcHBpbmcgQVBJcy4gUmVtb3ZhbCBvciBtb2RpZmljYXRpb25cbiogb2YgdGhpcyBjb2RlIHdoZW4gdXNlZCB3aXRoIE1hcGJveCdzIE1hcHBpbmcgQVBJcyBjYW4gcmVzdWx0IGluIGhpZ2hlciBmZWVzIGFuZC9vclxuKiB0ZXJtaW5hdGlvbiBvZiB5b3VyIGFjY291bnQgd2l0aCBNYXBib3guXG4qXG4qIFVuZGVyIHRoZSBNYXBib3ggVGVybXMgb2YgU2VydmljZSwgeW91IG1heSBub3QgdXNlIHRoaXMgY29kZSB0byBhY2Nlc3MgTWFwYm94XG4qIE1hcHBpbmcgQVBJcyBvdGhlciB0aGFuIHRocm91Z2ggTWFwYm94IFNES3MuXG4qXG4qIFRoZSBNYXBwaW5nIEFQSXMgZG9jdW1lbnRhdGlvbiBpcyBhdmFpbGFibGUgYXQgaHR0cHM6Ly9kb2NzLm1hcGJveC5jb20vYXBpL21hcHMvI21hcHNcbiogYW5kIHRoZSBNYXBib3ggVGVybXMgb2YgU2VydmljZSBhcmUgYXZhaWxhYmxlIGF0IGh0dHBzOi8vd3d3Lm1hcGJveC5jb20vdG9zL1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG50eXBlIFNrdVRva2VuT2JqZWN0ID0ge3xcbiAgICB0b2tlbjogc3RyaW5nLFxuICAgIHRva2VuRXhwaXJlc0F0OiBudW1iZXJcbnx9O1xuXG5jb25zdCBTS1VfSUQgPSAnMDEnO1xuXG5mdW5jdGlvbiBjcmVhdGVTa3VUb2tlbigpOiBTa3VUb2tlbk9iamVjdCB7XG4gICAgLy8gU0tVX0lEIGFuZCBUT0tFTl9WRVJTSU9OIGFyZSBzcGVjaWZpZWQgYnkgYW4gaW50ZXJuYWwgc2NoZW1hIGFuZCBzaG91bGQgbm90IGNoYW5nZVxuICAgIGNvbnN0IFRPS0VOX1ZFUlNJT04gPSAnMSc7XG4gICAgY29uc3QgYmFzZTYyY2hhcnMgPSAnMDEyMzQ1Njc4OWFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVonO1xuICAgIC8vIHNlc3Npb25SYW5kb21pemVyIGlzIGEgcmFuZG9taXplZCAxMC1kaWdpdCBiYXNlLTYyIG51bWJlclxuICAgIGxldCBzZXNzaW9uUmFuZG9taXplciA9ICcnO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTA7IGkrKykge1xuICAgICAgICBzZXNzaW9uUmFuZG9taXplciArPSBiYXNlNjJjaGFyc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA2MildO1xuICAgIH1cbiAgICBjb25zdCBleHBpcmF0aW9uID0gMTIgKiA2MCAqIDYwICogMTAwMDsgLy8gMTIgaG91cnNcbiAgICBjb25zdCB0b2tlbiA9IFtUT0tFTl9WRVJTSU9OLCBTS1VfSUQsIHNlc3Npb25SYW5kb21pemVyXS5qb2luKCcnKTtcbiAgICBjb25zdCB0b2tlbkV4cGlyZXNBdCA9IERhdGUubm93KCkgKyBleHBpcmF0aW9uO1xuXG4gICAgcmV0dXJuIHsgdG9rZW4sIHRva2VuRXhwaXJlc0F0IH07XG59XG5cbmV4cG9ydCB7IGNyZWF0ZVNrdVRva2VuLCBTS1VfSUQgfTtcblxuLyoqKioqIEVORCBXQVJOSU5HIC0gUkVNT1ZBTCBPUiBNT0RJRklDQVRJT04gT0YgVEhFXG5QUkVDRURJTkcgQ09ERSBWSU9MQVRFUyBUSEUgTUFQQk9YIFRFUk1TIE9GIFNFUlZJQ0UgICoqKioqKi9cbiIsIi8vIEBmbG93XG5cbi8qKioqKiBTVEFSVCBXQVJOSU5HIC0gSUYgWU9VIFVTRSBUSElTIENPREUgV0lUSCBNQVBCT1ggTUFQUElORyBBUElTLCBSRU1PVkFMIE9SXG4qIE1PRElGSUNBVElPTiBPRiBUSEUgRk9MTE9XSU5HIENPREUgVklPTEFURVMgVEhFIE1BUEJPWCBURVJNUyBPRiBTRVJWSUNFICAqKioqKipcbiogVGhlIGZvbGxvd2luZyBjb2RlIGlzIHVzZWQgdG8gYWNjZXNzIE1hcGJveCdzIE1hcHBpbmcgQVBJcy4gUmVtb3ZhbCBvciBtb2RpZmljYXRpb25cbiogb2YgdGhpcyBjb2RlIHdoZW4gdXNlZCB3aXRoIE1hcGJveCdzIE1hcHBpbmcgQVBJcyBjYW4gcmVzdWx0IGluIGhpZ2hlciBmZWVzIGFuZC9vclxuKiB0ZXJtaW5hdGlvbiBvZiB5b3VyIGFjY291bnQgd2l0aCBNYXBib3guXG4qXG4qIFVuZGVyIHRoZSBNYXBib3ggVGVybXMgb2YgU2VydmljZSwgeW91IG1heSBub3QgdXNlIHRoaXMgY29kZSB0byBhY2Nlc3MgTWFwYm94XG4qIE1hcHBpbmcgQVBJcyBvdGhlciB0aGFuIHRocm91Z2ggTWFwYm94IFNES3MuXG4qXG4qIFRoZSBNYXBwaW5nIEFQSXMgZG9jdW1lbnRhdGlvbiBpcyBhdmFpbGFibGUgYXQgaHR0cHM6Ly9kb2NzLm1hcGJveC5jb20vYXBpL21hcHMvI21hcHNcbiogYW5kIHRoZSBNYXBib3ggVGVybXMgb2YgU2VydmljZSBhcmUgYXZhaWxhYmxlIGF0IGh0dHBzOi8vd3d3Lm1hcGJveC5jb20vdG9zL1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5pbXBvcnQgY29uZmlnIGZyb20gJy4vY29uZmlnJztcblxuaW1wb3J0IGJyb3dzZXIgZnJvbSAnLi9icm93c2VyJztcbmltcG9ydCB3aW5kb3cgZnJvbSAnLi93aW5kb3cnO1xuaW1wb3J0IHdlYnBTdXBwb3J0ZWQgZnJvbSAnLi93ZWJwX3N1cHBvcnRlZCc7XG5pbXBvcnQgeyBjcmVhdGVTa3VUb2tlbiwgU0tVX0lEIH0gZnJvbSAnLi9za3VfdG9rZW4nO1xuaW1wb3J0IHsgdmVyc2lvbiBhcyBzZGtWZXJzaW9uIH0gZnJvbSAnLi4vLi4vcGFja2FnZS5qc29uJztcbmltcG9ydCB7IHV1aWQsIHZhbGlkYXRlVXVpZCwgc3RvcmFnZUF2YWlsYWJsZSwgYjY0RGVjb2RlVW5pY29kZSwgYjY0RW5jb2RlVW5pY29kZSwgd2Fybk9uY2UsIGV4dGVuZCB9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQgeyBwb3N0RGF0YSwgUmVzb3VyY2VUeXBlIH0gZnJvbSAnLi9hamF4JztcblxuaW1wb3J0IHR5cGUgeyBSZXF1ZXN0UGFyYW1ldGVycyB9IGZyb20gJy4vYWpheCc7XG5pbXBvcnQgdHlwZSB7IENhbmNlbGFibGUgfSBmcm9tICcuLi90eXBlcy9jYW5jZWxhYmxlJztcbmltcG9ydCB0eXBlIHsgVGlsZUpTT04gfSBmcm9tICcuLi90eXBlcy90aWxlanNvbic7XG5cbnR5cGUgUmVzb3VyY2VUeXBlRW51bSA9ICRLZXlzPHR5cGVvZiBSZXNvdXJjZVR5cGU+O1xuZXhwb3J0IHR5cGUgUmVxdWVzdFRyYW5zZm9ybUZ1bmN0aW9uID0gKHVybDogc3RyaW5nLCByZXNvdXJjZVR5cGU/OiBSZXNvdXJjZVR5cGVFbnVtKSA9PiBSZXF1ZXN0UGFyYW1ldGVycztcblxudHlwZSBVcmxPYmplY3QgPSB7fFxuICAgIHByb3RvY29sOiBzdHJpbmcsXG4gICAgYXV0aG9yaXR5OiBzdHJpbmcsXG4gICAgcGF0aDogc3RyaW5nLFxuICAgIHBhcmFtczogQXJyYXk8c3RyaW5nPlxufH07XG5cbmV4cG9ydCBjbGFzcyBSZXF1ZXN0TWFuYWdlciB7XG4gICAgX3NrdVRva2VuOiBzdHJpbmc7XG4gICAgX3NrdVRva2VuRXhwaXJlc0F0OiBudW1iZXI7XG4gICAgX3RyYW5zZm9ybVJlcXVlc3RGbjogP1JlcXVlc3RUcmFuc2Zvcm1GdW5jdGlvbjtcblxuICAgIGNvbnN0cnVjdG9yKHRyYW5zZm9ybVJlcXVlc3RGbj86IFJlcXVlc3RUcmFuc2Zvcm1GdW5jdGlvbikge1xuICAgICAgICB0aGlzLl90cmFuc2Zvcm1SZXF1ZXN0Rm4gPSB0cmFuc2Zvcm1SZXF1ZXN0Rm47XG4gICAgICAgIHRoaXMuX2NyZWF0ZVNrdVRva2VuKCk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZVNrdVRva2VuKCkge1xuICAgICAgICBjb25zdCBza3VUb2tlbiA9IGNyZWF0ZVNrdVRva2VuKCk7XG4gICAgICAgIHRoaXMuX3NrdVRva2VuID0gc2t1VG9rZW4udG9rZW47XG4gICAgICAgIHRoaXMuX3NrdVRva2VuRXhwaXJlc0F0ID0gc2t1VG9rZW4udG9rZW5FeHBpcmVzQXQ7XG4gICAgfVxuXG4gICAgX2lzU2t1VG9rZW5FeHBpcmVkKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gRGF0ZS5ub3coKSA+IHRoaXMuX3NrdVRva2VuRXhwaXJlc0F0O1xuICAgIH1cblxuICAgIHRyYW5zZm9ybVJlcXVlc3QodXJsOiBzdHJpbmcsIHR5cGU6IFJlc291cmNlVHlwZUVudW0pIHtcbiAgICAgICAgaWYgKHRoaXMuX3RyYW5zZm9ybVJlcXVlc3RGbikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3RyYW5zZm9ybVJlcXVlc3RGbih1cmwsIHR5cGUpIHx8IHt1cmx9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHt1cmx9O1xuICAgIH1cblxuICAgIG5vcm1hbGl6ZVN0eWxlVVJMKHVybDogc3RyaW5nLCBhY2Nlc3NUb2tlbj86IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBub3JtYWxpemVTdHlsZVVSTCh1cmwsIGFjY2Vzc1Rva2VuKTtcbiAgICB9XG5cbiAgICBub3JtYWxpemVHbHlwaHNVUkwodXJsOiBzdHJpbmcsIGFjY2Vzc1Rva2VuPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIG5vcm1hbGl6ZUdseXBoc1VSTCh1cmwsIGFjY2Vzc1Rva2VuKTtcbiAgICB9XG5cbiAgICBub3JtYWxpemVTb3VyY2VVUkwodXJsOiBzdHJpbmcsIGFjY2Vzc1Rva2VuPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIG5vcm1hbGl6ZVNvdXJjZVVSTCh1cmwsIGFjY2Vzc1Rva2VuKTtcbiAgICB9XG5cbiAgICBub3JtYWxpemVTcHJpdGVVUkwodXJsOiBzdHJpbmcsIGZvcm1hdDogc3RyaW5nLCBleHRlbnNpb246IHN0cmluZywgYWNjZXNzVG9rZW4/OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gbm9ybWFsaXplU3ByaXRlVVJMKHVybCwgZm9ybWF0LCBleHRlbnNpb24sIGFjY2Vzc1Rva2VuKTtcbiAgICB9XG5cbiAgICBub3JtYWxpemVUaWxlVVJMKHRpbGVVUkw6IHN0cmluZywgc291cmNlVVJMPzogP3N0cmluZywgdGlsZVNpemU/OiA/bnVtYmVyKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKHRoaXMuX2lzU2t1VG9rZW5FeHBpcmVkKCkpIHtcbiAgICAgICAgICAgIHRoaXMuX2NyZWF0ZVNrdVRva2VuKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbm9ybWFsaXplVGlsZVVSTCh0aWxlVVJMLCBzb3VyY2VVUkwsIHRpbGVTaXplLCB0aGlzLl9za3VUb2tlbik7XG4gICAgfVxuXG4gICAgY2Fub25pY2FsaXplVGlsZVVSTCh1cmw6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gY2Fub25pY2FsaXplVGlsZVVSTCh1cmwpO1xuICAgIH1cblxuICAgIGNhbm9uaWNhbGl6ZVRpbGVzZXQodGlsZUpTT046IFRpbGVKU09OLCBzb3VyY2VVUkw6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gY2Fub25pY2FsaXplVGlsZXNldCh0aWxlSlNPTiwgc291cmNlVVJMKTtcbiAgICB9XG59XG5cbmNvbnN0IGhlbHAgPSAnU2VlIGh0dHBzOi8vd3d3Lm1hcGJveC5jb20vYXBpLWRvY3VtZW50YXRpb24vI2FjY2Vzcy10b2tlbnMtYW5kLXRva2VuLXNjb3Blcyc7XG5cbmZ1bmN0aW9uIG1ha2VBUElVUkwodXJsT2JqZWN0OiBVcmxPYmplY3QsIGFjY2Vzc1Rva2VuOiBzdHJpbmcgfCBudWxsIHwgdm9pZCk6IHN0cmluZyB7XG4gICAgY29uc3QgYXBpVXJsT2JqZWN0ID0gcGFyc2VVcmwoY29uZmlnLkFQSV9VUkwpO1xuICAgIHVybE9iamVjdC5wcm90b2NvbCA9IGFwaVVybE9iamVjdC5wcm90b2NvbDtcbiAgICB1cmxPYmplY3QuYXV0aG9yaXR5ID0gYXBpVXJsT2JqZWN0LmF1dGhvcml0eTtcblxuICAgIGlmIChhcGlVcmxPYmplY3QucGF0aCAhPT0gJy8nKSB7XG4gICAgICAgIHVybE9iamVjdC5wYXRoID0gYCR7YXBpVXJsT2JqZWN0LnBhdGh9JHt1cmxPYmplY3QucGF0aH1gO1xuICAgIH1cblxuICAgIGlmICghY29uZmlnLlJFUVVJUkVfQUNDRVNTX1RPS0VOKSByZXR1cm4gZm9ybWF0VXJsKHVybE9iamVjdCk7XG5cbiAgICBhY2Nlc3NUb2tlbiA9IGFjY2Vzc1Rva2VuIHx8IGNvbmZpZy5BQ0NFU1NfVE9LRU47XG4gICAgaWYgKCFhY2Nlc3NUb2tlbilcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBBbiBBUEkgYWNjZXNzIHRva2VuIGlzIHJlcXVpcmVkIHRvIHVzZSBNYXBib3ggR0wuICR7aGVscH1gKTtcbiAgICBpZiAoYWNjZXNzVG9rZW5bMF0gPT09ICdzJylcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVc2UgYSBwdWJsaWMgYWNjZXNzIHRva2VuIChway4qKSB3aXRoIE1hcGJveCBHTCwgbm90IGEgc2VjcmV0IGFjY2VzcyB0b2tlbiAoc2suKikuICR7aGVscH1gKTtcblxuICAgIHVybE9iamVjdC5wYXJhbXMucHVzaChgYWNjZXNzX3Rva2VuPSR7YWNjZXNzVG9rZW59YCk7XG4gICAgcmV0dXJuIGZvcm1hdFVybCh1cmxPYmplY3QpO1xufVxuXG5mdW5jdGlvbiBpc01hcGJveFVSTCh1cmw6IHN0cmluZykge1xuICAgIHJldHVybiB1cmwuaW5kZXhPZignbWFwYm94OicpID09PSAwO1xufVxuXG5jb25zdCBtYXBib3hIVFRQVVJMUmUgPSAvXigoaHR0cHM/Oik/XFwvXFwvKT8oW15cXC9dK1xcLik/bWFwYm94XFwuYyhufG9tKShcXC98XFw/fCQpL2k7XG5mdW5jdGlvbiBpc01hcGJveEhUVFBVUkwodXJsOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gbWFwYm94SFRUUFVSTFJlLnRlc3QodXJsKTtcbn1cblxuZnVuY3Rpb24gaGFzQ2FjaGVEZWZlYXRpbmdTa3UodXJsOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdXJsLmluZGV4T2YoJ3NrdT0nKSA+IDAgJiYgaXNNYXBib3hIVFRQVVJMKHVybCk7XG59XG5cbmNvbnN0IG5vcm1hbGl6ZVN0eWxlVVJMID0gZnVuY3Rpb24odXJsOiBzdHJpbmcsIGFjY2Vzc1Rva2VuPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAoIWlzTWFwYm94VVJMKHVybCkpIHJldHVybiB1cmw7XG4gICAgY29uc3QgdXJsT2JqZWN0ID0gcGFyc2VVcmwodXJsKTtcbiAgICB1cmxPYmplY3QucGF0aCA9IGAvc3R5bGVzL3YxJHt1cmxPYmplY3QucGF0aH1gO1xuICAgIHJldHVybiBtYWtlQVBJVVJMKHVybE9iamVjdCwgYWNjZXNzVG9rZW4pO1xufTtcblxuY29uc3Qgbm9ybWFsaXplR2x5cGhzVVJMID0gZnVuY3Rpb24odXJsOiBzdHJpbmcsIGFjY2Vzc1Rva2VuPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAoIWlzTWFwYm94VVJMKHVybCkpIHJldHVybiB1cmw7XG4gICAgY29uc3QgdXJsT2JqZWN0ID0gcGFyc2VVcmwodXJsKTtcbiAgICB1cmxPYmplY3QucGF0aCA9IGAvZm9udHMvdjEke3VybE9iamVjdC5wYXRofWA7XG4gICAgcmV0dXJuIG1ha2VBUElVUkwodXJsT2JqZWN0LCBhY2Nlc3NUb2tlbik7XG59O1xuXG5jb25zdCBub3JtYWxpemVTb3VyY2VVUkwgPSBmdW5jdGlvbih1cmw6IHN0cmluZywgYWNjZXNzVG9rZW4/OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICghaXNNYXBib3hVUkwodXJsKSkgcmV0dXJuIHVybDtcbiAgICBjb25zdCB1cmxPYmplY3QgPSBwYXJzZVVybCh1cmwpO1xuICAgIHVybE9iamVjdC5wYXRoID0gYC92NC8ke3VybE9iamVjdC5hdXRob3JpdHl9Lmpzb25gO1xuICAgIC8vIFRpbGVKU09OIHJlcXVlc3RzIG5lZWQgYSBzZWN1cmUgZmxhZyBhcHBlbmRlZCB0byB0aGVpciBVUkxzIHNvXG4gICAgLy8gdGhhdCB0aGUgc2VydmVyIGtub3dzIHRvIHNlbmQgU1NMLWlmaWVkIHJlc291cmNlIHJlZmVyZW5jZXMuXG4gICAgdXJsT2JqZWN0LnBhcmFtcy5wdXNoKCdzZWN1cmUnKTtcbiAgICByZXR1cm4gbWFrZUFQSVVSTCh1cmxPYmplY3QsIGFjY2Vzc1Rva2VuKTtcbn07XG5cbmNvbnN0IG5vcm1hbGl6ZVNwcml0ZVVSTCA9IGZ1bmN0aW9uKHVybDogc3RyaW5nLCBmb3JtYXQ6IHN0cmluZywgZXh0ZW5zaW9uOiBzdHJpbmcsIGFjY2Vzc1Rva2VuPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCB1cmxPYmplY3QgPSBwYXJzZVVybCh1cmwpO1xuICAgIGlmICghaXNNYXBib3hVUkwodXJsKSkge1xuICAgICAgICB1cmxPYmplY3QucGF0aCArPSBgJHtmb3JtYXR9JHtleHRlbnNpb259YDtcbiAgICAgICAgcmV0dXJuIGZvcm1hdFVybCh1cmxPYmplY3QpO1xuICAgIH1cbiAgICB1cmxPYmplY3QucGF0aCA9IGAvc3R5bGVzL3YxJHt1cmxPYmplY3QucGF0aH0vc3ByaXRlJHtmb3JtYXR9JHtleHRlbnNpb259YDtcbiAgICByZXR1cm4gbWFrZUFQSVVSTCh1cmxPYmplY3QsIGFjY2Vzc1Rva2VuKTtcbn07XG5cbmNvbnN0IGltYWdlRXh0ZW5zaW9uUmUgPSAvKFxcLihwbmd8anBnKVxcZCopKD89JCkvO1xuXG5jb25zdCBub3JtYWxpemVUaWxlVVJMID0gZnVuY3Rpb24odGlsZVVSTDogc3RyaW5nLCBzb3VyY2VVUkw/OiA/c3RyaW5nLCB0aWxlU2l6ZT86ID9udW1iZXIsIHNrdVRva2VuPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAoIXNvdXJjZVVSTCB8fCAhaXNNYXBib3hVUkwoc291cmNlVVJMKSkgcmV0dXJuIHRpbGVVUkw7XG5cbiAgICBjb25zdCB1cmxPYmplY3QgPSBwYXJzZVVybCh0aWxlVVJMKTtcblxuICAgIC8vIFRoZSB2NCBtYXBib3ggdGlsZSBBUEkgc3VwcG9ydHMgNTEyeDUxMiBpbWFnZSB0aWxlcyBvbmx5IHdoZW4gQDJ4XG4gICAgLy8gaXMgYXBwZW5kZWQgdG8gdGhlIHRpbGUgVVJMLiBJZiBgdGlsZVNpemU6IDUxMmAgaXMgc3BlY2lmaWVkIGZvclxuICAgIC8vIGEgTWFwYm94IHJhc3RlciBzb3VyY2UgZm9yY2UgdGhlIEAyeCBzdWZmaXggZXZlbiBpZiBhIG5vbiBoaWRwaSBkZXZpY2UuXG4gICAgY29uc3Qgc3VmZml4ID0gYnJvd3Nlci5kZXZpY2VQaXhlbFJhdGlvID49IDIgfHwgdGlsZVNpemUgPT09IDUxMiA/ICdAMngnIDogJyc7XG4gICAgY29uc3QgZXh0ZW5zaW9uID0gd2VicFN1cHBvcnRlZC5zdXBwb3J0ZWQgPyAnLndlYnAnIDogJyQxJztcbiAgICB1cmxPYmplY3QucGF0aCA9IHVybE9iamVjdC5wYXRoLnJlcGxhY2UoaW1hZ2VFeHRlbnNpb25SZSwgYCR7c3VmZml4fSR7ZXh0ZW5zaW9ufWApO1xuICAgIHVybE9iamVjdC5wYXRoID0gYC92NCR7dXJsT2JqZWN0LnBhdGh9YDtcblxuICAgIGlmIChjb25maWcuUkVRVUlSRV9BQ0NFU1NfVE9LRU4gJiYgY29uZmlnLkFDQ0VTU19UT0tFTiAmJiBza3VUb2tlbikge1xuICAgICAgICB1cmxPYmplY3QucGFyYW1zLnB1c2goYHNrdT0ke3NrdVRva2VufWApO1xuICAgIH1cblxuICAgIHJldHVybiBtYWtlQVBJVVJMKHVybE9iamVjdCk7XG59O1xuXG4vLyBtYXRjaGVzIGFueSBmaWxlIGV4dGVuc2lvbiBzcGVjaWZpZWQgYnkgYSBkb3QgYW5kIG9uZSBvciBtb3JlIGFscGhhbnVtZXJpYyBjaGFyYWN0ZXJzXG5jb25zdCBleHRlbnNpb25SZSA9IC9cXC5bXFx3XSskLztcblxuY29uc3QgY2Fub25pY2FsaXplVGlsZVVSTCA9IGZ1bmN0aW9uKHVybDogc3RyaW5nKSB7XG4gICAgY29uc3QgdmVyc2lvbiA9IFwiL3Y0L1wiO1xuXG4gICAgY29uc3QgdXJsT2JqZWN0ID0gcGFyc2VVcmwodXJsKTtcbiAgICAvLyBNYWtlIHN1cmUgdGhhdCB3ZSBhcmUgZGVhbGluZyB3aXRoIGEgdmFsaWQgTWFwYm94IHRpbGUgVVJMLlxuICAgIC8vIEhhcyB0byBiZWdpbiB3aXRoIC92NC8sIHdpdGggYSB2YWxpZCBmaWxlbmFtZSArIGV4dGVuc2lvblxuICAgIGlmICghdXJsT2JqZWN0LnBhdGgubWF0Y2goLyheXFwvdjRcXC8pLykgfHwgIXVybE9iamVjdC5wYXRoLm1hdGNoKGV4dGVuc2lvblJlKSkge1xuICAgICAgICAvLyBOb3QgYSBwcm9wZXIgTWFwYm94IHRpbGUgVVJMLlxuICAgICAgICByZXR1cm4gdXJsO1xuICAgIH1cbiAgICAvLyBSZWFzc2VtYmxlIHRoZSBjYW5vbmljYWwgVVJMIGZyb20gdGhlIHBhcnRzIHdlJ3ZlIHBhcnNlZCBiZWZvcmUuXG4gICAgbGV0IHJlc3VsdCA9IFwibWFwYm94Oi8vdGlsZXMvXCI7XG4gICAgcmVzdWx0ICs9ICB1cmxPYmplY3QucGF0aC5yZXBsYWNlKHZlcnNpb24sICcnKTtcblxuICAgIC8vIEFwcGVuZCB0aGUgcXVlcnkgc3RyaW5nLCBtaW51cyB0aGUgYWNjZXNzIHRva2VuIHBhcmFtZXRlci5cbiAgICBjb25zdCBwYXJhbXMgPSB1cmxPYmplY3QucGFyYW1zLmZpbHRlcihwID0+ICFwLm1hdGNoKC9eYWNjZXNzX3Rva2VuPS8pKTtcbiAgICBpZiAocGFyYW1zLmxlbmd0aCkgcmVzdWx0ICs9IGA/JHtwYXJhbXMuam9pbignJicpfWA7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbmNvbnN0IGNhbm9uaWNhbGl6ZVRpbGVzZXQgPSBmdW5jdGlvbih0aWxlSlNPTjogVGlsZUpTT04sIHNvdXJjZVVSTDogc3RyaW5nKSB7XG4gICAgaWYgKCFpc01hcGJveFVSTChzb3VyY2VVUkwpKSByZXR1cm4gdGlsZUpTT04udGlsZXMgfHwgW107XG4gICAgY29uc3QgY2Fub25pY2FsID0gW107XG4gICAgZm9yIChjb25zdCB1cmwgb2YgdGlsZUpTT04udGlsZXMpIHtcbiAgICAgICAgY29uc3QgY2Fub25pY2FsVXJsID0gY2Fub25pY2FsaXplVGlsZVVSTCh1cmwpO1xuICAgICAgICBjYW5vbmljYWwucHVzaChjYW5vbmljYWxVcmwpO1xuICAgIH1cbiAgICByZXR1cm4gY2Fub25pY2FsO1xufTtcblxuY29uc3QgdXJsUmUgPSAvXihcXHcrKTpcXC9cXC8oW14vP10qKShcXC9bXj9dKyk/XFw/PyguKyk/LztcblxuZnVuY3Rpb24gcGFyc2VVcmwodXJsOiBzdHJpbmcpOiBVcmxPYmplY3Qge1xuICAgIGNvbnN0IHBhcnRzID0gdXJsLm1hdGNoKHVybFJlKTtcbiAgICBpZiAoIXBhcnRzKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVW5hYmxlIHRvIHBhcnNlIFVSTCBvYmplY3QnKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcHJvdG9jb2w6IHBhcnRzWzFdLFxuICAgICAgICBhdXRob3JpdHk6IHBhcnRzWzJdLFxuICAgICAgICBwYXRoOiBwYXJ0c1szXSB8fCAnLycsXG4gICAgICAgIHBhcmFtczogcGFydHNbNF0gPyBwYXJ0c1s0XS5zcGxpdCgnJicpIDogW11cbiAgICB9O1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVcmwob2JqOiBVcmxPYmplY3QpOiBzdHJpbmcge1xuICAgIGNvbnN0IHBhcmFtcyA9IG9iai5wYXJhbXMubGVuZ3RoID8gYD8ke29iai5wYXJhbXMuam9pbignJicpfWAgOiAnJztcbiAgICByZXR1cm4gYCR7b2JqLnByb3RvY29sfTovLyR7b2JqLmF1dGhvcml0eX0ke29iai5wYXRofSR7cGFyYW1zfWA7XG59XG5cbmV4cG9ydCB7IGlzTWFwYm94VVJMLCBpc01hcGJveEhUVFBVUkwsIGhhc0NhY2hlRGVmZWF0aW5nU2t1IH07XG5cbmNvbnN0IHRlbGVtRXZlbnRLZXkgPSAnbWFwYm94LmV2ZW50RGF0YSc7XG5cbmZ1bmN0aW9uIHBhcnNlQWNjZXNzVG9rZW4oYWNjZXNzVG9rZW46ID9zdHJpbmcpIHtcbiAgICBpZiAoIWFjY2Vzc1Rva2VuKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IHBhcnRzID0gYWNjZXNzVG9rZW4uc3BsaXQoJy4nKTtcbiAgICBpZiAoIXBhcnRzIHx8IHBhcnRzLmxlbmd0aCAhPT0gMykge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCBqc29uRGF0YSA9IEpTT04ucGFyc2UoYjY0RGVjb2RlVW5pY29kZShwYXJ0c1sxXSkpO1xuICAgICAgICByZXR1cm4ganNvbkRhdGE7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbnR5cGUgVGVsZW1ldHJ5RXZlbnRUeXBlID0gJ2FwcFVzZXJUdXJuc3RpbGUnIHwgJ21hcC5sb2FkJztcblxuY2xhc3MgVGVsZW1ldHJ5RXZlbnQge1xuICAgIGV2ZW50RGF0YTogYW55O1xuICAgIGFub25JZDogP3N0cmluZztcbiAgICBxdWV1ZTogQXJyYXk8YW55PjtcbiAgICB0eXBlOiBUZWxlbWV0cnlFdmVudFR5cGU7XG4gICAgcGVuZGluZ1JlcXVlc3Q6ID9DYW5jZWxhYmxlO1xuXG4gICAgY29uc3RydWN0b3IodHlwZTogVGVsZW1ldHJ5RXZlbnRUeXBlKSB7XG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgICAgIHRoaXMuYW5vbklkID0gbnVsbDtcbiAgICAgICAgdGhpcy5ldmVudERhdGEgPSB7fTtcbiAgICAgICAgdGhpcy5xdWV1ZSA9IFtdO1xuICAgICAgICB0aGlzLnBlbmRpbmdSZXF1ZXN0ID0gbnVsbDtcbiAgICB9XG5cbiAgICBnZXRTdG9yYWdlS2V5KGRvbWFpbjogP3N0cmluZykge1xuICAgICAgICBjb25zdCB0b2tlbkRhdGEgPSBwYXJzZUFjY2Vzc1Rva2VuKGNvbmZpZy5BQ0NFU1NfVE9LRU4pO1xuICAgICAgICBsZXQgdSA9ICcnO1xuICAgICAgICBpZiAodG9rZW5EYXRhICYmIHRva2VuRGF0YVsndSddKSB7XG4gICAgICAgICAgICB1ID0gYjY0RW5jb2RlVW5pY29kZSh0b2tlbkRhdGFbJ3UnXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB1ID0gY29uZmlnLkFDQ0VTU19UT0tFTiB8fCAnJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZG9tYWluID9cbiAgICAgICAgICAgIGAke3RlbGVtRXZlbnRLZXl9LiR7ZG9tYWlufToke3V9YCA6XG4gICAgICAgICAgICBgJHt0ZWxlbUV2ZW50S2V5fToke3V9YDtcbiAgICB9XG5cbiAgICBmZXRjaEV2ZW50RGF0YSgpIHtcbiAgICAgICAgY29uc3QgaXNMb2NhbFN0b3JhZ2VBdmFpbGFibGUgPSBzdG9yYWdlQXZhaWxhYmxlKCdsb2NhbFN0b3JhZ2UnKTtcbiAgICAgICAgY29uc3Qgc3RvcmFnZUtleSA9IHRoaXMuZ2V0U3RvcmFnZUtleSgpO1xuICAgICAgICBjb25zdCB1dWlkS2V5ID0gdGhpcy5nZXRTdG9yYWdlS2V5KCd1dWlkJyk7XG5cbiAgICAgICAgaWYgKGlzTG9jYWxTdG9yYWdlQXZhaWxhYmxlKSB7XG4gICAgICAgICAgICAvL1JldHJpZXZlIGNhY2hlZCBkYXRhXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oc3RvcmFnZUtleSk7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ldmVudERhdGEgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IHV1aWQgPSB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0odXVpZEtleSk7XG4gICAgICAgICAgICAgICAgaWYgKHV1aWQpIHRoaXMuYW5vbklkID0gdXVpZDtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICB3YXJuT25jZSgnVW5hYmxlIHRvIHJlYWQgZnJvbSBMb2NhbFN0b3JhZ2UnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNhdmVFdmVudERhdGEoKSB7XG4gICAgICAgIGNvbnN0IGlzTG9jYWxTdG9yYWdlQXZhaWxhYmxlID0gc3RvcmFnZUF2YWlsYWJsZSgnbG9jYWxTdG9yYWdlJyk7XG4gICAgICAgIGNvbnN0IHN0b3JhZ2VLZXkgPSAgdGhpcy5nZXRTdG9yYWdlS2V5KCk7XG4gICAgICAgIGNvbnN0IHV1aWRLZXkgPSB0aGlzLmdldFN0b3JhZ2VLZXkoJ3V1aWQnKTtcbiAgICAgICAgaWYgKGlzTG9jYWxTdG9yYWdlQXZhaWxhYmxlKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSh1dWlkS2V5LCB0aGlzLmFub25JZCk7XG4gICAgICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKHRoaXMuZXZlbnREYXRhKS5sZW5ndGggPj0gMSkge1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oc3RvcmFnZUtleSwgSlNPTi5zdHJpbmdpZnkodGhpcy5ldmVudERhdGEpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgd2Fybk9uY2UoJ1VuYWJsZSB0byB3cml0ZSB0byBMb2NhbFN0b3JhZ2UnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgcHJvY2Vzc1JlcXVlc3RzKCkge31cblxuICAgIC8qXG4gICAgKiBJZiBhbnkgZXZlbnQgZGF0YSBzaG91bGQgYmUgcGVyc2lzdGVkIGFmdGVyIHRoZSBQT1NUIHJlcXVlc3QsIHRoZSBjYWxsYmFjayBzaG91bGQgbW9kaWZ5IGV2ZW50RGF0YWBcbiAgICAqIHRvIHRoZSB2YWx1ZXMgdGhhdCBzaG91bGQgYmUgc2F2ZWQuIEZvciB0aGlzIHJlYXNvbiwgdGhlIGNhbGxiYWNrIHNob3VsZCBiZSBpbnZva2VkIHByaW9yIHRvIHRoZSBjYWxsXG4gICAgKiB0byBUZWxlbWV0cnlFdmVudCNzYXZlRGF0YVxuICAgICovXG4gICAgcG9zdEV2ZW50KHRpbWVzdGFtcDogbnVtYmVyLCBhZGRpdGlvbmFsUGF5bG9hZDoge1tzdHJpbmddOiBhbnl9LCBjYWxsYmFjazogKGVycjogP0Vycm9yKSA9PiB2b2lkKSB7XG4gICAgICAgIGlmICghY29uZmlnLkVWRU5UU19VUkwpIHJldHVybjtcbiAgICAgICAgY29uc3QgZXZlbnRzVXJsT2JqZWN0OiBVcmxPYmplY3QgPSBwYXJzZVVybChjb25maWcuRVZFTlRTX1VSTCk7XG4gICAgICAgIGV2ZW50c1VybE9iamVjdC5wYXJhbXMucHVzaChgYWNjZXNzX3Rva2VuPSR7Y29uZmlnLkFDQ0VTU19UT0tFTiB8fCAnJ31gKTtcbiAgICAgICAgY29uc3QgcGF5bG9hZDogT2JqZWN0ID0ge1xuICAgICAgICAgICAgZXZlbnQ6IHRoaXMudHlwZSxcbiAgICAgICAgICAgIGNyZWF0ZWQ6IG5ldyBEYXRlKHRpbWVzdGFtcCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgIHNka0lkZW50aWZpZXI6ICdtYXBib3gtZ2wtanMnLFxuICAgICAgICAgICAgc2RrVmVyc2lvbixcbiAgICAgICAgICAgIHNrdUlkOiBTS1VfSUQsXG4gICAgICAgICAgICB1c2VySWQ6IHRoaXMuYW5vbklkXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgZmluYWxQYXlsb2FkID0gYWRkaXRpb25hbFBheWxvYWQgPyBleHRlbmQocGF5bG9hZCwgYWRkaXRpb25hbFBheWxvYWQpIDogcGF5bG9hZDtcbiAgICAgICAgY29uc3QgcmVxdWVzdDogUmVxdWVzdFBhcmFtZXRlcnMgPSB7XG4gICAgICAgICAgICB1cmw6IGZvcm1hdFVybChldmVudHNVcmxPYmplY3QpLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAndGV4dC9wbGFpbicgLy9Ta2lwIHRoZSBwcmUtZmxpZ2h0IE9QVElPTlMgcmVxdWVzdFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KFtmaW5hbFBheWxvYWRdKVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMucGVuZGluZ1JlcXVlc3QgPSBwb3N0RGF0YShyZXF1ZXN0LCAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGVuZGluZ1JlcXVlc3QgPSBudWxsO1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyb3IpO1xuICAgICAgICAgICAgdGhpcy5zYXZlRXZlbnREYXRhKCk7XG4gICAgICAgICAgICB0aGlzLnByb2Nlc3NSZXF1ZXN0cygpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBxdWV1ZVJlcXVlc3QoZXZlbnQ6IG51bWJlciB8IHtpZDogbnVtYmVyLCB0aW1lc3RhbXA6IG51bWJlcn0pIHtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKGV2ZW50KTtcbiAgICAgICAgdGhpcy5wcm9jZXNzUmVxdWVzdHMoKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBNYXBMb2FkRXZlbnQgZXh0ZW5kcyBUZWxlbWV0cnlFdmVudCB7XG4gICAgK3N1Y2Nlc3M6IHtbbnVtYmVyXTogYm9vbGVhbn07XG4gICAgc2t1VG9rZW46IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcignbWFwLmxvYWQnKTtcbiAgICAgICAgdGhpcy5zdWNjZXNzID0ge307XG4gICAgICAgIHRoaXMuc2t1VG9rZW4gPSAnJztcbiAgICB9XG5cbiAgICBwb3N0TWFwTG9hZEV2ZW50KHRpbGVVcmxzOiBBcnJheTxzdHJpbmc+LCBtYXBJZDogbnVtYmVyLCBza3VUb2tlbjogc3RyaW5nKSB7XG4gICAgICAgIC8vRW5hYmxlZCBvbmx5IHdoZW4gTWFwYm94IEFjY2VzcyBUb2tlbiBpcyBzZXQgYW5kIGEgc291cmNlIHVzZXNcbiAgICAgICAgLy8gbWFwYm94IHRpbGVzLlxuICAgICAgICB0aGlzLnNrdVRva2VuID0gc2t1VG9rZW47XG5cbiAgICAgICAgaWYgKGNvbmZpZy5FVkVOVFNfVVJMICYmXG4gICAgICAgICAgICBjb25maWcuQUNDRVNTX1RPS0VOICYmXG4gICAgICAgICAgICBBcnJheS5pc0FycmF5KHRpbGVVcmxzKSAmJlxuICAgICAgICAgICAgdGlsZVVybHMuc29tZSh1cmwgPT4gaXNNYXBib3hVUkwodXJsKSB8fCBpc01hcGJveEhUVFBVUkwodXJsKSkpIHtcbiAgICAgICAgICAgIHRoaXMucXVldWVSZXF1ZXN0KHtpZDogbWFwSWQsIHRpbWVzdGFtcDogRGF0ZS5ub3coKX0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvY2Vzc1JlcXVlc3RzKCkge1xuICAgICAgICBpZiAodGhpcy5wZW5kaW5nUmVxdWVzdCB8fCB0aGlzLnF1ZXVlLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuICAgICAgICBjb25zdCB7aWQsIHRpbWVzdGFtcH0gPSB0aGlzLnF1ZXVlLnNoaWZ0KCk7XG5cbiAgICAgICAgLy8gT25seSBvbmUgbG9hZCBldmVudCBzaG91bGQgZmlyZSBwZXIgbWFwXG4gICAgICAgIGlmIChpZCAmJiB0aGlzLnN1Y2Nlc3NbaWRdKSByZXR1cm47XG5cbiAgICAgICAgaWYgKCF0aGlzLmFub25JZCkge1xuICAgICAgICAgICAgdGhpcy5mZXRjaEV2ZW50RGF0YSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF2YWxpZGF0ZVV1aWQodGhpcy5hbm9uSWQpKSB7XG4gICAgICAgICAgICB0aGlzLmFub25JZCA9IHV1aWQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucG9zdEV2ZW50KHRpbWVzdGFtcCwge3NrdVRva2VuOiB0aGlzLnNrdVRva2VufSwgKGVycikgPT4ge1xuICAgICAgICAgICAgaWYgKCFlcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAoaWQpIHRoaXMuc3VjY2Vzc1tpZF0gPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUdXJuc3RpbGVFdmVudCBleHRlbmRzIFRlbGVtZXRyeUV2ZW50IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoJ2FwcFVzZXJUdXJuc3RpbGUnKTtcbiAgICB9XG5cbiAgICBwb3N0VHVybnN0aWxlRXZlbnQodGlsZVVybHM6IEFycmF5PHN0cmluZz4pIHtcbiAgICAgICAgLy9FbmFibGVkIG9ubHkgd2hlbiBNYXBib3ggQWNjZXNzIFRva2VuIGlzIHNldCBhbmQgYSBzb3VyY2UgdXNlc1xuICAgICAgICAvLyBtYXBib3ggdGlsZXMuXG4gICAgICAgIGlmIChjb25maWcuRVZFTlRTX1VSTCAmJlxuICAgICAgICAgICAgY29uZmlnLkFDQ0VTU19UT0tFTiAmJlxuICAgICAgICAgICAgQXJyYXkuaXNBcnJheSh0aWxlVXJscykgJiZcbiAgICAgICAgICAgIHRpbGVVcmxzLnNvbWUodXJsID0+IGlzTWFwYm94VVJMKHVybCkgfHwgaXNNYXBib3hIVFRQVVJMKHVybCkpKSB7XG4gICAgICAgICAgICB0aGlzLnF1ZXVlUmVxdWVzdChEYXRlLm5vdygpKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgcHJvY2Vzc1JlcXVlc3RzKCkge1xuICAgICAgICBpZiAodGhpcy5wZW5kaW5nUmVxdWVzdCB8fCB0aGlzLnF1ZXVlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLmFub25JZCB8fCAhdGhpcy5ldmVudERhdGEubGFzdFN1Y2Nlc3MgfHwgIXRoaXMuZXZlbnREYXRhLnRva2VuVSkge1xuICAgICAgICAgICAgLy9SZXRyaWV2ZSBjYWNoZWQgZGF0YVxuICAgICAgICAgICAgdGhpcy5mZXRjaEV2ZW50RGF0YSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdG9rZW5EYXRhID0gcGFyc2VBY2Nlc3NUb2tlbihjb25maWcuQUNDRVNTX1RPS0VOKTtcbiAgICAgICAgY29uc3QgdG9rZW5VID0gdG9rZW5EYXRhID8gdG9rZW5EYXRhWyd1J10gOiBjb25maWcuQUNDRVNTX1RPS0VOO1xuICAgICAgICAvL1Jlc2V0IGV2ZW50IGRhdGEgY2FjaGUgaWYgdGhlIGFjY2VzcyB0b2tlbiBvd25lciBjaGFuZ2VkLlxuICAgICAgICBsZXQgZHVlRm9yRXZlbnQgPSB0b2tlblUgIT09IHRoaXMuZXZlbnREYXRhLnRva2VuVTtcblxuICAgICAgICBpZiAoIXZhbGlkYXRlVXVpZCh0aGlzLmFub25JZCkpIHtcbiAgICAgICAgICAgIHRoaXMuYW5vbklkID0gdXVpZCgpO1xuICAgICAgICAgICAgZHVlRm9yRXZlbnQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbmV4dFVwZGF0ZSA9IHRoaXMucXVldWUuc2hpZnQoKTtcbiAgICAgICAgLy8gUmVjb3JkIHR1cm5zdGlsZSBldmVudCBvbmNlIHBlciBjYWxlbmRhciBkYXkuXG4gICAgICAgIGlmICh0aGlzLmV2ZW50RGF0YS5sYXN0U3VjY2Vzcykge1xuICAgICAgICAgICAgY29uc3QgbGFzdFVwZGF0ZSA9IG5ldyBEYXRlKHRoaXMuZXZlbnREYXRhLmxhc3RTdWNjZXNzKTtcbiAgICAgICAgICAgIGNvbnN0IG5leHREYXRlID0gbmV3IERhdGUobmV4dFVwZGF0ZSk7XG4gICAgICAgICAgICBjb25zdCBkYXlzRWxhcHNlZCA9IChuZXh0VXBkYXRlIC0gdGhpcy5ldmVudERhdGEubGFzdFN1Y2Nlc3MpIC8gKDI0ICogNjAgKiA2MCAqIDEwMDApO1xuICAgICAgICAgICAgZHVlRm9yRXZlbnQgPSBkdWVGb3JFdmVudCB8fCBkYXlzRWxhcHNlZCA+PSAxIHx8IGRheXNFbGFwc2VkIDwgLTEgfHwgbGFzdFVwZGF0ZS5nZXREYXRlKCkgIT09IG5leHREYXRlLmdldERhdGUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGR1ZUZvckV2ZW50ID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghZHVlRm9yRXZlbnQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnByb2Nlc3NSZXF1ZXN0cygpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wb3N0RXZlbnQobmV4dFVwZGF0ZSwge1wiZW5hYmxlZC50ZWxlbWV0cnlcIjogZmFsc2V9LCAoZXJyKSA9PiB7XG4gICAgICAgICAgICBpZiAoIWVycikge1xuICAgICAgICAgICAgICAgIHRoaXMuZXZlbnREYXRhLmxhc3RTdWNjZXNzID0gbmV4dFVwZGF0ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmV2ZW50RGF0YS50b2tlblUgPSB0b2tlblU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuY29uc3QgdHVybnN0aWxlRXZlbnRfID0gbmV3IFR1cm5zdGlsZUV2ZW50KCk7XG5leHBvcnQgY29uc3QgcG9zdFR1cm5zdGlsZUV2ZW50ID0gdHVybnN0aWxlRXZlbnRfLnBvc3RUdXJuc3RpbGVFdmVudC5iaW5kKHR1cm5zdGlsZUV2ZW50Xyk7XG5cbmNvbnN0IG1hcExvYWRFdmVudF8gPSBuZXcgTWFwTG9hZEV2ZW50KCk7XG5leHBvcnQgY29uc3QgcG9zdE1hcExvYWRFdmVudCA9IG1hcExvYWRFdmVudF8ucG9zdE1hcExvYWRFdmVudC5iaW5kKG1hcExvYWRFdmVudF8pO1xuXG4vKioqKiogRU5EIFdBUk5JTkcgLSBSRU1PVkFMIE9SIE1PRElGSUNBVElPTiBPRiBUSEVcblBSRUNFRElORyBDT0RFIFZJT0xBVEVTIFRIRSBNQVBCT1ggVEVSTVMgT0YgU0VSVklDRSAgKioqKioqL1xuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHsgcGFyc2VDYWNoZUNvbnRyb2wgfSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHdpbmRvdyBmcm9tICcuL3dpbmRvdyc7XG5cbmltcG9ydCB0eXBlIERpc3BhdGNoZXIgZnJvbSAnLi9kaXNwYXRjaGVyJztcblxuY29uc3QgQ0FDSEVfTkFNRSA9ICdtYXBib3gtdGlsZXMnO1xubGV0IGNhY2hlTGltaXQgPSA1MDA7IC8vIDUwTUIgLyAoMTAwS0IvdGlsZSkgfj0gNTAwIHRpbGVzXG5sZXQgY2FjaGVDaGVja1RocmVzaG9sZCA9IDUwO1xuXG5jb25zdCBNSU5fVElNRV9VTlRJTF9FWFBJUlkgPSAxMDAwICogNjAgKiA3OyAvLyA3IG1pbnV0ZXMuIFNraXAgY2FjaGluZyB0aWxlcyB3aXRoIGEgc2hvcnQgZW5vdWdoIG1heCBhZ2UuXG5cbmV4cG9ydCB0eXBlIFJlc3BvbnNlT3B0aW9ucyA9IHtcbiAgICBzdGF0dXM6IG51bWJlcixcbiAgICBzdGF0dXNUZXh0OiBzdHJpbmcsXG4gICAgaGVhZGVyczogd2luZG93LkhlYWRlcnNcbn07XG5cblxubGV0IHJlc3BvbnNlQ29uc3RydWN0b3JTdXBwb3J0c1JlYWRhYmxlU3RyZWFtO1xuZnVuY3Rpb24gcHJlcGFyZUJvZHkocmVzcG9uc2U6IFJlc3BvbnNlLCBjYWxsYmFjaykge1xuICAgIGlmIChyZXNwb25zZUNvbnN0cnVjdG9yU3VwcG9ydHNSZWFkYWJsZVN0cmVhbSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBuZXcgUmVzcG9uc2UobmV3IFJlYWRhYmxlU3RyZWFtKCkpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVuZGVmXG4gICAgICAgICAgICByZXNwb25zZUNvbnN0cnVjdG9yU3VwcG9ydHNSZWFkYWJsZVN0cmVhbSA9IHRydWU7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIC8vIEVkZ2VcbiAgICAgICAgICAgIHJlc3BvbnNlQ29uc3RydWN0b3JTdXBwb3J0c1JlYWRhYmxlU3RyZWFtID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocmVzcG9uc2VDb25zdHJ1Y3RvclN1cHBvcnRzUmVhZGFibGVTdHJlYW0pIHtcbiAgICAgICAgY2FsbGJhY2socmVzcG9uc2UuYm9keSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmVzcG9uc2UuYmxvYigpLnRoZW4oY2FsbGJhY2spO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhY2hlUHV0KHJlcXVlc3Q6IFJlcXVlc3QsIHJlc3BvbnNlOiBSZXNwb25zZSwgcmVxdWVzdFRpbWU6IG51bWJlcikge1xuICAgIGlmICghd2luZG93LmNhY2hlcykgcmV0dXJuO1xuXG4gICAgY29uc3Qgb3B0aW9uczogUmVzcG9uc2VPcHRpb25zID0ge1xuICAgICAgICBzdGF0dXM6IHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgICAgc3RhdHVzVGV4dDogcmVzcG9uc2Uuc3RhdHVzVGV4dCxcbiAgICAgICAgaGVhZGVyczogbmV3IHdpbmRvdy5IZWFkZXJzKClcbiAgICB9O1xuICAgIHJlc3BvbnNlLmhlYWRlcnMuZm9yRWFjaCgodiwgaykgPT4gb3B0aW9ucy5oZWFkZXJzLnNldChrLCB2KSk7XG5cbiAgICBjb25zdCBjYWNoZUNvbnRyb2wgPSBwYXJzZUNhY2hlQ29udHJvbChyZXNwb25zZS5oZWFkZXJzLmdldCgnQ2FjaGUtQ29udHJvbCcpIHx8ICcnKTtcbiAgICBpZiAoY2FjaGVDb250cm9sWyduby1zdG9yZSddKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGNhY2hlQ29udHJvbFsnbWF4LWFnZSddKSB7XG4gICAgICAgIG9wdGlvbnMuaGVhZGVycy5zZXQoJ0V4cGlyZXMnLCBuZXcgRGF0ZShyZXF1ZXN0VGltZSArIGNhY2hlQ29udHJvbFsnbWF4LWFnZSddICogMTAwMCkudG9VVENTdHJpbmcoKSk7XG4gICAgfVxuXG4gICAgY29uc3QgdGltZVVudGlsRXhwaXJ5ID0gbmV3IERhdGUob3B0aW9ucy5oZWFkZXJzLmdldCgnRXhwaXJlcycpKS5nZXRUaW1lKCkgLSByZXF1ZXN0VGltZTtcbiAgICBpZiAodGltZVVudGlsRXhwaXJ5IDwgTUlOX1RJTUVfVU5USUxfRVhQSVJZKSByZXR1cm47XG5cbiAgICBwcmVwYXJlQm9keShyZXNwb25zZSwgYm9keSA9PiB7XG4gICAgICAgIGNvbnN0IGNsb25lZFJlc3BvbnNlID0gbmV3IHdpbmRvdy5SZXNwb25zZShib2R5LCBvcHRpb25zKTtcblxuICAgICAgICB3aW5kb3cuY2FjaGVzLm9wZW4oQ0FDSEVfTkFNRSkudGhlbihjYWNoZSA9PiBjYWNoZS5wdXQoc3RyaXBRdWVyeVBhcmFtZXRlcnMocmVxdWVzdC51cmwpLCBjbG9uZWRSZXNwb25zZSkpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBzdHJpcFF1ZXJ5UGFyYW1ldGVycyh1cmw6IHN0cmluZykge1xuICAgIGNvbnN0IHN0YXJ0ID0gdXJsLmluZGV4T2YoJz8nKTtcbiAgICByZXR1cm4gc3RhcnQgPCAwID8gdXJsIDogdXJsLnNsaWNlKDAsIHN0YXJ0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhY2hlR2V0KHJlcXVlc3Q6IFJlcXVlc3QsIGNhbGxiYWNrOiAoZXJyb3I6ID9hbnksIHJlc3BvbnNlOiA/UmVzcG9uc2UsIGZyZXNoOiA/Ym9vbGVhbikgPT4gdm9pZCkge1xuICAgIGlmICghd2luZG93LmNhY2hlcykgcmV0dXJuIGNhbGxiYWNrKG51bGwpO1xuXG4gICAgd2luZG93LmNhY2hlcy5vcGVuKENBQ0hFX05BTUUpXG4gICAgICAgIC5jYXRjaChjYWxsYmFjaylcbiAgICAgICAgLnRoZW4oY2FjaGUgPT4ge1xuICAgICAgICAgICAgY2FjaGUubWF0Y2gocmVxdWVzdCwgeyBpZ25vcmVTZWFyY2g6IHRydWUgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goY2FsbGJhY2spXG4gICAgICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmcmVzaCA9IGlzRnJlc2gocmVzcG9uc2UpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFJlaW5zZXJ0IGludG8gY2FjaGUgc28gdGhhdCBvcmRlciBvZiBrZXlzIGluIHRoZSBjYWNoZSBpcyB0aGUgb3JkZXIgb2YgYWNjZXNzLlxuICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGxpbmUgbWFrZXMgdGhlIGNhY2hlIGEgTFJVIGluc3RlYWQgb2YgYSBGSUZPIGNhY2hlLlxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdHJpcHBlZFVSTCA9IHN0cmlwUXVlcnlQYXJhbWV0ZXJzKHJlcXVlc3QudXJsKTtcbiAgICAgICAgICAgICAgICAgICAgY2FjaGUuZGVsZXRlKHN0cmlwcGVkVVJMKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZyZXNoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWNoZS5wdXQoc3RyaXBwZWRVUkwsIHJlc3BvbnNlLmNsb25lKCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzcG9uc2UsIGZyZXNoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG59XG5cblxuXG5mdW5jdGlvbiBpc0ZyZXNoKHJlc3BvbnNlKSB7XG4gICAgaWYgKCFyZXNwb25zZSkgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnN0IGV4cGlyZXMgPSBuZXcgRGF0ZShyZXNwb25zZS5oZWFkZXJzLmdldCgnRXhwaXJlcycpKTtcbiAgICBjb25zdCBjYWNoZUNvbnRyb2wgPSBwYXJzZUNhY2hlQ29udHJvbChyZXNwb25zZS5oZWFkZXJzLmdldCgnQ2FjaGUtQ29udHJvbCcpIHx8ICcnKTtcbiAgICByZXR1cm4gZXhwaXJlcyA+IERhdGUubm93KCkgJiYgIWNhY2hlQ29udHJvbFsnbm8tY2FjaGUnXTtcbn1cblxuXG4vLyBgSW5maW5pdHlgIHRyaWdnZXJzIGEgY2FjaGUgY2hlY2sgYWZ0ZXIgdGhlIGZpcnN0IHRpbGUgaXMgbG9hZGVkXG4vLyBzbyB0aGF0IGEgY2hlY2sgaXMgcnVuIGF0IGxlYXN0IG9uY2Ugb24gZWFjaCBwYWdlIGxvYWQuXG5sZXQgZ2xvYmFsRW50cnlDb3VudGVyID0gSW5maW5pdHk7XG5cbi8vIFRoZSBjYWNoZSBjaGVjayBnZXRzIHJ1biBvbiBhIHdvcmtlci4gVGhlIHJlYXNvbiBmb3IgdGhpcyBpcyB0aGF0XG4vLyBwcm9maWxpbmcgc29tZXRpbWVzIHNob3dzIHRoaXMgYXMgdGFraW5nIHVwIHNpZ25pZmljYW50IHRpbWUgb24gdGhlXG4vLyB0aHJlYWQgaXQgZ2V0cyBjYWxsZWQgZnJvbS4gQW5kIHNvbWV0aW1lcyBpdCBkb2Vzbid0LiBJdCAqbWF5KiBiZVxuLy8gZmluZSB0byBydW4gdGhpcyBvbiB0aGUgbWFpbiB0aHJlYWQgYnV0IG91dCBvZiBjYXV0aW9uIHRoaXMgaXMgYmVpbmdcbi8vIGRpc3BhdGNoZWQgb24gYSB3b3JrZXIuIFRoaXMgY2FuIGJlIGludmVzdGlnYXRlZCBmdXJ0aGVyIGluIHRoZSBmdXR1cmUuXG5leHBvcnQgZnVuY3Rpb24gY2FjaGVFbnRyeVBvc3NpYmx5QWRkZWQoZGlzcGF0Y2hlcjogRGlzcGF0Y2hlcikge1xuICAgIGdsb2JhbEVudHJ5Q291bnRlcisrO1xuICAgIGlmIChnbG9iYWxFbnRyeUNvdW50ZXIgPiBjYWNoZUNoZWNrVGhyZXNob2xkKSB7XG4gICAgICAgIGRpc3BhdGNoZXIuc2VuZCgnZW5mb3JjZUNhY2hlU2l6ZUxpbWl0JywgY2FjaGVMaW1pdCk7XG4gICAgICAgIGdsb2JhbEVudHJ5Q291bnRlciA9IDA7XG4gICAgfVxufVxuXG4vLyBydW5zIG9uIHdvcmtlciwgc2VlIGFib3ZlIGNvbW1lbnRcbmV4cG9ydCBmdW5jdGlvbiBlbmZvcmNlQ2FjaGVTaXplTGltaXQobGltaXQ6IG51bWJlcikge1xuICAgIGlmICghd2luZG93LmNhY2hlcykgcmV0dXJuO1xuICAgIHdpbmRvdy5jYWNoZXMub3BlbihDQUNIRV9OQU1FKVxuICAgICAgICAudGhlbihjYWNoZSA9PiB7XG4gICAgICAgICAgICBjYWNoZS5rZXlzKCkudGhlbihrZXlzID0+IHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoIC0gbGltaXQ7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBjYWNoZS5kZWxldGUoa2V5c1tpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJUaWxlQ2FjaGUoY2FsbGJhY2s/OiAoZXJyOiA/RXJyb3IpID0+IHZvaWQpIHtcbiAgICBjb25zdCBwcm9taXNlID0gd2luZG93LmNhY2hlcy5kZWxldGUoQ0FDSEVfTkFNRSk7XG4gICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgIHByb21pc2UuY2F0Y2goY2FsbGJhY2spLnRoZW4oKCkgPT4gY2FsbGJhY2soKSk7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0Q2FjaGVMaW1pdHMobGltaXQ6IG51bWJlciwgY2hlY2tUaHJlc2hvbGQ6IG51bWJlcikge1xuICAgIGNhY2hlTGltaXQgPSBsaW1pdDtcbiAgICBjYWNoZUNoZWNrVGhyZXNob2xkID0gY2hlY2tUaHJlc2hvbGQ7XG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgd2luZG93IGZyb20gJy4vd2luZG93JztcbmltcG9ydCB7IGV4dGVuZCwgd2Fybk9uY2UgfSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHsgaXNNYXBib3hIVFRQVVJMLCBoYXNDYWNoZURlZmVhdGluZ1NrdSB9IGZyb20gJy4vbWFwYm94JztcbmltcG9ydCBjb25maWcgZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHsgY2FjaGVHZXQsIGNhY2hlUHV0IH0gZnJvbSAnLi90aWxlX3JlcXVlc3RfY2FjaGUnO1xuXG5pbXBvcnQgdHlwZSB7IENhbGxiYWNrIH0gZnJvbSAnLi4vdHlwZXMvY2FsbGJhY2snO1xuaW1wb3J0IHR5cGUgeyBDYW5jZWxhYmxlIH0gZnJvbSAnLi4vdHlwZXMvY2FuY2VsYWJsZSc7XG5cbi8qKlxuICogVGhlIHR5cGUgb2YgYSByZXNvdXJjZS5cbiAqIEBwcml2YXRlXG4gKiBAcmVhZG9ubHlcbiAqIEBlbnVtIHtzdHJpbmd9XG4gKi9cbmNvbnN0IFJlc291cmNlVHlwZSA9IHtcbiAgICBVbmtub3duOiAnVW5rbm93bicsXG4gICAgU3R5bGU6ICdTdHlsZScsXG4gICAgU291cmNlOiAnU291cmNlJyxcbiAgICBUaWxlOiAnVGlsZScsXG4gICAgR2x5cGhzOiAnR2x5cGhzJyxcbiAgICBTcHJpdGVJbWFnZTogJ1Nwcml0ZUltYWdlJyxcbiAgICBTcHJpdGVKU09OOiAnU3ByaXRlSlNPTicsXG4gICAgSW1hZ2U6ICdJbWFnZSdcbn07XG5leHBvcnQgeyBSZXNvdXJjZVR5cGUgfTtcblxuaWYgKHR5cGVvZiBPYmplY3QuZnJlZXplID09ICdmdW5jdGlvbicpIHtcbiAgICBPYmplY3QuZnJlZXplKFJlc291cmNlVHlwZSk7XG59XG5cbi8qKlxuICogQSBgUmVxdWVzdFBhcmFtZXRlcnNgIG9iamVjdCB0byBiZSByZXR1cm5lZCBmcm9tIE1hcC5vcHRpb25zLnRyYW5zZm9ybVJlcXVlc3QgY2FsbGJhY2tzLlxuICogQHR5cGVkZWYge09iamVjdH0gUmVxdWVzdFBhcmFtZXRlcnNcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB1cmwgVGhlIFVSTCB0byBiZSByZXF1ZXN0ZWQuXG4gKiBAcHJvcGVydHkge09iamVjdH0gaGVhZGVycyBUaGUgaGVhZGVycyB0byBiZSBzZW50IHdpdGggdGhlIHJlcXVlc3QuXG4gKiBAcHJvcGVydHkge3N0cmluZ30gY3JlZGVudGlhbHMgYCdzYW1lLW9yaWdpbid8J2luY2x1ZGUnYCBVc2UgJ2luY2x1ZGUnIHRvIHNlbmQgY29va2llcyB3aXRoIGNyb3NzLW9yaWdpbiByZXF1ZXN0cy5cbiAqL1xuZXhwb3J0IHR5cGUgUmVxdWVzdFBhcmFtZXRlcnMgPSB7XG4gICAgdXJsOiBzdHJpbmcsXG4gICAgaGVhZGVycz86IE9iamVjdCxcbiAgICBtZXRob2Q/OiAnR0VUJyB8ICdQT1NUJyB8ICdQVVQnLFxuICAgIGJvZHk/OiBzdHJpbmcsXG4gICAgdHlwZT86ICdzdHJpbmcnIHwgJ2pzb24nIHwgJ2FycmF5QnVmZmVyJyxcbiAgICBjcmVkZW50aWFscz86ICdzYW1lLW9yaWdpbicgfCAnaW5jbHVkZScsXG4gICAgY29sbGVjdFJlc291cmNlVGltaW5nPzogYm9vbGVhblxufTtcblxuZXhwb3J0IHR5cGUgUmVzcG9uc2VDYWxsYmFjazxUPiA9IChlcnJvcjogP0Vycm9yLCBkYXRhOiA/VCwgY2FjaGVDb250cm9sOiA/c3RyaW5nLCBleHBpcmVzOiA/c3RyaW5nKSA9PiB2b2lkO1xuXG5jbGFzcyBBSkFYRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gICAgc3RhdHVzOiBudW1iZXI7XG4gICAgdXJsOiBzdHJpbmc7XG4gICAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nLCBzdGF0dXM6IG51bWJlciwgdXJsOiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKHN0YXR1cyA9PT0gNDAxICYmIGlzTWFwYm94SFRUUFVSTCh1cmwpKSB7XG4gICAgICAgICAgICBtZXNzYWdlICs9ICc6IHlvdSBtYXkgaGF2ZSBwcm92aWRlZCBhbiBpbnZhbGlkIE1hcGJveCBhY2Nlc3MgdG9rZW4uIFNlZSBodHRwczovL3d3dy5tYXBib3guY29tL2FwaS1kb2N1bWVudGF0aW9uLyNhY2Nlc3MtdG9rZW5zLWFuZC10b2tlbi1zY29wZXMnO1xuICAgICAgICB9XG4gICAgICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgICAgICB0aGlzLnN0YXR1cyA9IHN0YXR1cztcbiAgICAgICAgdGhpcy51cmwgPSB1cmw7XG5cbiAgICAgICAgLy8gd29yayBhcm91bmQgZm9yIGh0dHBzOi8vZ2l0aHViLmNvbS9SaWNoLUhhcnJpcy9idWJsZS9pc3N1ZXMvNDBcbiAgICAgICAgdGhpcy5uYW1lID0gdGhpcy5jb25zdHJ1Y3Rvci5uYW1lO1xuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gYCR7dGhpcy5uYW1lfTogJHt0aGlzLm1lc3NhZ2V9ICgke3RoaXMuc3RhdHVzfSk6ICR7dGhpcy51cmx9YDtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGlzV29ya2VyKCkge1xuICAgIHJldHVybiB0eXBlb2YgV29ya2VyR2xvYmFsU2NvcGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAgICAgICBzZWxmIGluc3RhbmNlb2YgV29ya2VyR2xvYmFsU2NvcGU7XG59XG5cbi8vIEVuc3VyZSB0aGF0IHdlJ3JlIHNlbmRpbmcgdGhlIGNvcnJlY3QgcmVmZXJyZXIgZnJvbSBibG9iIFVSTCB3b3JrZXIgYnVuZGxlcy5cbi8vIEZvciBmaWxlcyBsb2FkZWQgZnJvbSB0aGUgbG9jYWwgZmlsZSBzeXN0ZW0sIGBsb2NhdGlvbi5vcmlnaW5gIHdpbGwgYmUgc2V0XG4vLyB0byB0aGUgc3RyaW5nKCEpIFwibnVsbFwiIChGaXJlZm94KSwgb3IgXCJmaWxlOi8vXCIgKENocm9tZSwgU2FmYXJpLCBFZGdlLCBJRSksXG4vLyBhbmQgd2Ugd2lsbCBzZXQgYW4gZW1wdHkgcmVmZXJyZXIuIE90aGVyd2lzZSwgd2UncmUgdXNpbmcgdGhlIGRvY3VtZW50J3MgVVJMLlxuLyogZ2xvYmFsIHNlbGYsIFdvcmtlckdsb2JhbFNjb3BlICovXG5leHBvcnQgY29uc3QgZ2V0UmVmZXJyZXIgPSBpc1dvcmtlcigpID9cbiAgICAoKSA9PiBzZWxmLndvcmtlciAmJiBzZWxmLndvcmtlci5yZWZlcnJlciA6XG4gICAgKCkgPT4ge1xuICAgICAgICBjb25zdCBvcmlnaW4gPSB3aW5kb3cubG9jYXRpb24ub3JpZ2luO1xuICAgICAgICBpZiAob3JpZ2luICYmIG9yaWdpbiAhPT0gJ251bGwnICYmIG9yaWdpbiAhPT0gJ2ZpbGU6Ly8nKSB7XG4gICAgICAgICAgICByZXR1cm4gb3JpZ2luICsgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lO1xuICAgICAgICB9XG4gICAgfTtcblxuZnVuY3Rpb24gbWFrZUZldGNoUmVxdWVzdChyZXF1ZXN0UGFyYW1ldGVyczogUmVxdWVzdFBhcmFtZXRlcnMsIGNhbGxiYWNrOiBSZXNwb25zZUNhbGxiYWNrPGFueT4pOiBDYW5jZWxhYmxlIHtcbiAgICBjb25zdCBjb250cm9sbGVyID0gbmV3IHdpbmRvdy5BYm9ydENvbnRyb2xsZXIoKTtcbiAgICBjb25zdCByZXF1ZXN0ID0gbmV3IHdpbmRvdy5SZXF1ZXN0KHJlcXVlc3RQYXJhbWV0ZXJzLnVybCwge1xuICAgICAgICBtZXRob2Q6IHJlcXVlc3RQYXJhbWV0ZXJzLm1ldGhvZCB8fCAnR0VUJyxcbiAgICAgICAgYm9keTogcmVxdWVzdFBhcmFtZXRlcnMuYm9keSxcbiAgICAgICAgY3JlZGVudGlhbHM6IHJlcXVlc3RQYXJhbWV0ZXJzLmNyZWRlbnRpYWxzLFxuICAgICAgICBoZWFkZXJzOiByZXF1ZXN0UGFyYW1ldGVycy5oZWFkZXJzLFxuICAgICAgICByZWZlcnJlcjogZ2V0UmVmZXJyZXIoKSxcbiAgICAgICAgc2lnbmFsOiBjb250cm9sbGVyLnNpZ25hbFxuICAgIH0pO1xuICAgIGxldCBjb21wbGV0ZSA9IGZhbHNlO1xuXG4gICAgY29uc3QgY2FjaGVJZ25vcmluZ1NlYXJjaCA9IGhhc0NhY2hlRGVmZWF0aW5nU2t1KHJlcXVlc3QudXJsKTtcblxuICAgIGlmIChyZXF1ZXN0UGFyYW1ldGVycy50eXBlID09PSAnanNvbicpIHtcbiAgICAgICAgcmVxdWVzdC5oZWFkZXJzLnNldCgnQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICB9XG5cbiAgICBjb25zdCB2YWxpZGF0ZU9yRmV0Y2ggPSAoZXJyLCBjYWNoZWRSZXNwb25zZSwgcmVzcG9uc2VJc0ZyZXNoKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIC8vIERvIGZldGNoIGluIGNhc2Ugb2YgY2FjaGUgZXJyb3IuXG4gICAgICAgICAgICAvLyBIVFRQIHBhZ2VzIGluIEVkZ2UgdHJpZ2dlciBhIHNlY3VyaXR5IGVycm9yIHRoYXQgY2FuIGJlIGlnbm9yZWQuXG4gICAgICAgICAgICBpZiAoZXJyLm1lc3NhZ2UgIT09ICdTZWN1cml0eUVycm9yJykge1xuICAgICAgICAgICAgICAgIHdhcm5PbmNlKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2FjaGVkUmVzcG9uc2UgJiYgcmVzcG9uc2VJc0ZyZXNoKSB7XG4gICAgICAgICAgICByZXR1cm4gZmluaXNoUmVxdWVzdChjYWNoZWRSZXNwb25zZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2FjaGVkUmVzcG9uc2UpIHtcbiAgICAgICAgICAgIC8vIFdlIGNhbid0IGRvIHJldmFsaWRhdGlvbiB3aXRoICdJZi1Ob25lLU1hdGNoJyBiZWNhdXNlIHRoZW4gdGhlXG4gICAgICAgICAgICAvLyByZXF1ZXN0IGRvZXNuJ3QgaGF2ZSBzaW1wbGUgY29ycyBoZWFkZXJzLlxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcmVxdWVzdFRpbWUgPSBEYXRlLm5vdygpO1xuXG4gICAgICAgIHdpbmRvdy5mZXRjaChyZXF1ZXN0KS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5vaykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNhY2hlYWJsZVJlc3BvbnNlID0gY2FjaGVJZ25vcmluZ1NlYXJjaCA/IHJlc3BvbnNlLmNsb25lKCkgOiBudWxsO1xuICAgICAgICAgICAgICAgIHJldHVybiBmaW5pc2hSZXF1ZXN0KHJlc3BvbnNlLCBjYWNoZWFibGVSZXNwb25zZSwgcmVxdWVzdFRpbWUpO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhuZXcgQUpBWEVycm9yKHJlc3BvbnNlLnN0YXR1c1RleHQsIHJlc3BvbnNlLnN0YXR1cywgcmVxdWVzdFBhcmFtZXRlcnMudXJsKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgIGlmIChlcnJvci5jb2RlID09PSAyMCkge1xuICAgICAgICAgICAgICAgIC8vIHNpbGVuY2UgZXhwZWN0ZWQgQWJvcnRFcnJvclxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhbGxiYWNrKG5ldyBFcnJvcihlcnJvci5tZXNzYWdlKSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBjb25zdCBmaW5pc2hSZXF1ZXN0ID0gKHJlc3BvbnNlLCBjYWNoZWFibGVSZXNwb25zZSwgcmVxdWVzdFRpbWUpID0+IHtcbiAgICAgICAgKFxuICAgICAgICAgICAgcmVxdWVzdFBhcmFtZXRlcnMudHlwZSA9PT0gJ2FycmF5QnVmZmVyJyA/IHJlc3BvbnNlLmFycmF5QnVmZmVyKCkgOlxuICAgICAgICAgICAgcmVxdWVzdFBhcmFtZXRlcnMudHlwZSA9PT0gJ2pzb24nID8gcmVzcG9uc2UuanNvbigpIDpcbiAgICAgICAgICAgIHJlc3BvbnNlLnRleHQoKVxuICAgICAgICApLnRoZW4ocmVzdWx0ID0+IHtcbiAgICAgICAgICAgIGlmIChjYWNoZWFibGVSZXNwb25zZSAmJiByZXF1ZXN0VGltZSkge1xuICAgICAgICAgICAgICAgIC8vIFRoZSByZXNwb25zZSBuZWVkcyB0byBiZSBpbnNlcnRlZCBpbnRvIHRoZSBjYWNoZSBhZnRlciBpdCBoYXMgY29tcGxldGVseSBsb2FkZWQuXG4gICAgICAgICAgICAgICAgLy8gVW50aWwgaXQgaXMgZnVsbHkgbG9hZGVkIHRoZXJlIGlzIGEgY2hhbmNlIGl0IHdpbGwgYmUgYWJvcnRlZC4gQWJvcnRpbmcgd2hpbGVcbiAgICAgICAgICAgICAgICAvLyByZWFkaW5nIHRoZSBib2R5IGNhbiBjYXVzZSB0aGUgY2FjaGUgaW5zZXJ0aW9uIHRvIGVycm9yLiBXZSBjb3VsZCBjYXRjaCB0aGlzIGVycm9yXG4gICAgICAgICAgICAgICAgLy8gaW4gbW9zdCBicm93c2VycyBidXQgaW4gRmlyZWZveCBpdCBzZWVtcyB0byBzb21ldGltZXMgY3Jhc2ggdGhlIHRhYi4gQWRkaW5nXG4gICAgICAgICAgICAgICAgLy8gaXQgdG8gdGhlIGNhY2hlIGhlcmUgYXZvaWRzIHRoYXQgZXJyb3IuXG4gICAgICAgICAgICAgICAgY2FjaGVQdXQocmVxdWVzdCwgY2FjaGVhYmxlUmVzcG9uc2UsIHJlcXVlc3RUaW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbXBsZXRlID0gdHJ1ZTtcbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHJlc3VsdCwgcmVzcG9uc2UuaGVhZGVycy5nZXQoJ0NhY2hlLUNvbnRyb2wnKSwgcmVzcG9uc2UuaGVhZGVycy5nZXQoJ0V4cGlyZXMnKSk7XG4gICAgICAgIH0pLmNhdGNoKGVyciA9PiBjYWxsYmFjayhuZXcgRXJyb3IoZXJyLm1lc3NhZ2UpKSk7XG4gICAgfTtcblxuICAgIGlmIChjYWNoZUlnbm9yaW5nU2VhcmNoKSB7XG4gICAgICAgIGNhY2hlR2V0KHJlcXVlc3QsIHZhbGlkYXRlT3JGZXRjaCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFsaWRhdGVPckZldGNoKG51bGwsIG51bGwpO1xuICAgIH1cblxuICAgIHJldHVybiB7IGNhbmNlbDogKCkgPT4ge1xuICAgICAgICBpZiAoIWNvbXBsZXRlKSBjb250cm9sbGVyLmFib3J0KCk7XG4gICAgfX07XG59XG5cbmZ1bmN0aW9uIG1ha2VYTUxIdHRwUmVxdWVzdChyZXF1ZXN0UGFyYW1ldGVyczogUmVxdWVzdFBhcmFtZXRlcnMsIGNhbGxiYWNrOiBSZXNwb25zZUNhbGxiYWNrPGFueT4pOiBDYW5jZWxhYmxlIHtcbiAgICBjb25zdCB4aHI6IFhNTEh0dHBSZXF1ZXN0ID0gbmV3IHdpbmRvdy5YTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgeGhyLm9wZW4ocmVxdWVzdFBhcmFtZXRlcnMubWV0aG9kIHx8ICdHRVQnLCByZXF1ZXN0UGFyYW1ldGVycy51cmwsIHRydWUpO1xuICAgIGlmIChyZXF1ZXN0UGFyYW1ldGVycy50eXBlID09PSAnYXJyYXlCdWZmZXInKSB7XG4gICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IGsgaW4gcmVxdWVzdFBhcmFtZXRlcnMuaGVhZGVycykge1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihrLCByZXF1ZXN0UGFyYW1ldGVycy5oZWFkZXJzW2tdKTtcbiAgICB9XG4gICAgaWYgKHJlcXVlc3RQYXJhbWV0ZXJzLnR5cGUgPT09ICdqc29uJykge1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICB9XG4gICAgeGhyLndpdGhDcmVkZW50aWFscyA9IHJlcXVlc3RQYXJhbWV0ZXJzLmNyZWRlbnRpYWxzID09PSAnaW5jbHVkZSc7XG4gICAgeGhyLm9uZXJyb3IgPSAoKSA9PiB7XG4gICAgICAgIGNhbGxiYWNrKG5ldyBFcnJvcih4aHIuc3RhdHVzVGV4dCkpO1xuICAgIH07XG4gICAgeGhyLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgaWYgKCgoeGhyLnN0YXR1cyA+PSAyMDAgJiYgeGhyLnN0YXR1cyA8IDMwMCkgfHwgeGhyLnN0YXR1cyA9PT0gMCkgJiYgeGhyLnJlc3BvbnNlICE9PSBudWxsKSB7XG4gICAgICAgICAgICBsZXQgZGF0YTogbWl4ZWQgPSB4aHIucmVzcG9uc2U7XG4gICAgICAgICAgICBpZiAocmVxdWVzdFBhcmFtZXRlcnMudHlwZSA9PT0gJ2pzb24nKSB7XG4gICAgICAgICAgICAgICAgLy8gV2UncmUgbWFudWFsbHkgcGFyc2luZyBKU09OIGhlcmUgdG8gZ2V0IGJldHRlciBlcnJvciBtZXNzYWdlcy5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBkYXRhID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYWxsYmFjayhudWxsLCBkYXRhLCB4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ0NhY2hlLUNvbnRyb2wnKSwgeGhyLmdldFJlc3BvbnNlSGVhZGVyKCdFeHBpcmVzJykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FsbGJhY2sobmV3IEFKQVhFcnJvcih4aHIuc3RhdHVzVGV4dCwgeGhyLnN0YXR1cywgcmVxdWVzdFBhcmFtZXRlcnMudXJsKSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHhoci5zZW5kKHJlcXVlc3RQYXJhbWV0ZXJzLmJvZHkpO1xuICAgIHJldHVybiB7IGNhbmNlbDogKCkgPT4geGhyLmFib3J0KCkgfTtcbn1cblxuZXhwb3J0IGNvbnN0IG1ha2VSZXF1ZXN0ID0gZnVuY3Rpb24ocmVxdWVzdFBhcmFtZXRlcnM6IFJlcXVlc3RQYXJhbWV0ZXJzLCBjYWxsYmFjazogUmVzcG9uc2VDYWxsYmFjazxhbnk+KTogQ2FuY2VsYWJsZSB7XG4gICAgLy8gV2UncmUgdHJ5aW5nIHRvIHVzZSB0aGUgRmV0Y2ggQVBJIGlmIHBvc3NpYmxlLiBIb3dldmVyLCBpbiBzb21lIHNpdHVhdGlvbnMgd2UgY2FuJ3QgdXNlIGl0OlxuICAgIC8vIC0gSUUxMSBkb2Vzbid0IHN1cHBvcnQgaXQgYXQgYWxsLiBJbiB0aGlzIGNhc2UsIHdlIGRpc3BhdGNoIHRoZSByZXF1ZXN0IHRvIHRoZSBtYWluIHRocmVhZCBzb1xuICAgIC8vICAgdGhhdCB3ZSBjYW4gZ2V0IGFuIGFjY3J1YXRlIHJlZmVycmVyIGhlYWRlci5cbiAgICAvLyAtIFNhZmFyaSBleHBvc2VzIHdpbmRvdy5BYm9ydENvbnRyb2xsZXIsIGJ1dCBpdCBkb2Vzbid0IHdvcmsgYWN0dWFsbHkgYWJvcnQgYW55IHJlcXVlc3RzIGluXG4gICAgLy8gICBzb21lIHZlcnNpb25zIChzZWUgaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTE3NDk4MCNjMilcbiAgICAvLyAtIFJlcXVlc3RzIGZvciByZXNvdXJjZXMgd2l0aCB0aGUgZmlsZTovLyBVUkkgc2NoZW1lIGRvbid0IHdvcmsgd2l0aCB0aGUgRmV0Y2ggQVBJIGVpdGhlci4gSW5cbiAgICAvLyAgIHRoaXMgY2FzZSB3ZSB1bmNvbmRpdGlvbmFsbHkgdXNlIFhIUiBvbiB0aGUgY3VycmVudCB0aHJlYWQgc2luY2UgcmVmZXJyZXJzIGRvbid0IG1hdHRlci5cbiAgICBpZiAoIS9eZmlsZTovLnRlc3QocmVxdWVzdFBhcmFtZXRlcnMudXJsKSkge1xuICAgICAgICBpZiAod2luZG93LmZldGNoICYmIHdpbmRvdy5SZXF1ZXN0ICYmIHdpbmRvdy5BYm9ydENvbnRyb2xsZXIgJiYgd2luZG93LlJlcXVlc3QucHJvdG90eXBlLmhhc093blByb3BlcnR5KCdzaWduYWwnKSkge1xuICAgICAgICAgICAgcmV0dXJuIG1ha2VGZXRjaFJlcXVlc3QocmVxdWVzdFBhcmFtZXRlcnMsIGNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNXb3JrZXIoKSAmJiBzZWxmLndvcmtlciAmJiBzZWxmLndvcmtlci5hY3Rvcikge1xuICAgICAgICAgICAgcmV0dXJuIHNlbGYud29ya2VyLmFjdG9yLnNlbmQoJ2dldFJlc291cmNlJywgcmVxdWVzdFBhcmFtZXRlcnMsIGNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWFrZVhNTEh0dHBSZXF1ZXN0KHJlcXVlc3RQYXJhbWV0ZXJzLCBjYWxsYmFjayk7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0SlNPTiA9IGZ1bmN0aW9uKHJlcXVlc3RQYXJhbWV0ZXJzOiBSZXF1ZXN0UGFyYW1ldGVycywgY2FsbGJhY2s6IFJlc3BvbnNlQ2FsbGJhY2s8T2JqZWN0Pik6IENhbmNlbGFibGUge1xuICAgIHJldHVybiBtYWtlUmVxdWVzdChleHRlbmQocmVxdWVzdFBhcmFtZXRlcnMsIHsgdHlwZTogJ2pzb24nIH0pLCBjYWxsYmFjayk7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0QXJyYXlCdWZmZXIgPSBmdW5jdGlvbihyZXF1ZXN0UGFyYW1ldGVyczogUmVxdWVzdFBhcmFtZXRlcnMsIGNhbGxiYWNrOiBSZXNwb25zZUNhbGxiYWNrPEFycmF5QnVmZmVyPik6IENhbmNlbGFibGUge1xuICAgIHJldHVybiBtYWtlUmVxdWVzdChleHRlbmQocmVxdWVzdFBhcmFtZXRlcnMsIHsgdHlwZTogJ2FycmF5QnVmZmVyJyB9KSwgY2FsbGJhY2spO1xufTtcblxuZXhwb3J0IGNvbnN0IHBvc3REYXRhID0gZnVuY3Rpb24ocmVxdWVzdFBhcmFtZXRlcnM6IFJlcXVlc3RQYXJhbWV0ZXJzLCBjYWxsYmFjazogUmVzcG9uc2VDYWxsYmFjazxzdHJpbmc+KTogQ2FuY2VsYWJsZSB7XG4gICAgcmV0dXJuIG1ha2VSZXF1ZXN0KGV4dGVuZChyZXF1ZXN0UGFyYW1ldGVycywgeyBtZXRob2Q6ICdQT1NUJyB9KSwgY2FsbGJhY2spO1xufTtcblxuZnVuY3Rpb24gc2FtZU9yaWdpbih1cmwpIHtcbiAgICBjb25zdCBhOiBIVE1MQW5jaG9yRWxlbWVudCA9IHdpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgYS5ocmVmID0gdXJsO1xuICAgIHJldHVybiBhLnByb3RvY29sID09PSB3aW5kb3cuZG9jdW1lbnQubG9jYXRpb24ucHJvdG9jb2wgJiYgYS5ob3N0ID09PSB3aW5kb3cuZG9jdW1lbnQubG9jYXRpb24uaG9zdDtcbn1cblxuY29uc3QgdHJhbnNwYXJlbnRQbmdVcmwgPSAnZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFBRUFBQUFCQ0FZQUFBQWZGY1NKQUFBQUMwbEVRVlFZVjJOZ0FBSUFBQVVBQWFyVnlGRUFBQUFBU1VWT1JLNUNZSUk9JztcblxubGV0IGltYWdlUXVldWUsIG51bUltYWdlUmVxdWVzdHM7XG5leHBvcnQgY29uc3QgcmVzZXRJbWFnZVJlcXVlc3RRdWV1ZSA9ICgpID0+IHtcbiAgICBpbWFnZVF1ZXVlID0gW107XG4gICAgbnVtSW1hZ2VSZXF1ZXN0cyA9IDA7XG59O1xucmVzZXRJbWFnZVJlcXVlc3RRdWV1ZSgpO1xuXG5leHBvcnQgY29uc3QgZ2V0SW1hZ2UgPSBmdW5jdGlvbihyZXF1ZXN0UGFyYW1ldGVyczogUmVxdWVzdFBhcmFtZXRlcnMsIGNhbGxiYWNrOiBDYWxsYmFjazxIVE1MSW1hZ2VFbGVtZW50Pik6IENhbmNlbGFibGUge1xuICAgIC8vIGxpbWl0IGNvbmN1cnJlbnQgaW1hZ2UgbG9hZHMgdG8gaGVscCB3aXRoIHJhc3RlciBzb3VyY2VzIHBlcmZvcm1hbmNlIG9uIGJpZyBzY3JlZW5zXG4gICAgaWYgKG51bUltYWdlUmVxdWVzdHMgPj0gY29uZmlnLk1BWF9QQVJBTExFTF9JTUFHRV9SRVFVRVNUUykge1xuICAgICAgICBjb25zdCBxdWV1ZWQgPSB7XG4gICAgICAgICAgICByZXF1ZXN0UGFyYW1ldGVycyxcbiAgICAgICAgICAgIGNhbGxiYWNrLFxuICAgICAgICAgICAgY2FuY2VsbGVkOiBmYWxzZSxcbiAgICAgICAgICAgIGNhbmNlbCgpIHsgdGhpcy5jYW5jZWxsZWQgPSB0cnVlOyB9XG4gICAgICAgIH07XG4gICAgICAgIGltYWdlUXVldWUucHVzaChxdWV1ZWQpO1xuICAgICAgICByZXR1cm4gcXVldWVkO1xuICAgIH1cbiAgICBudW1JbWFnZVJlcXVlc3RzKys7XG5cbiAgICBsZXQgYWR2YW5jZWQgPSBmYWxzZTtcbiAgICBjb25zdCBhZHZhbmNlSW1hZ2VSZXF1ZXN0UXVldWUgPSAoKSA9PiB7XG4gICAgICAgIGlmIChhZHZhbmNlZCkgcmV0dXJuO1xuICAgICAgICBhZHZhbmNlZCA9IHRydWU7XG4gICAgICAgIG51bUltYWdlUmVxdWVzdHMtLTtcbiAgICAgICAgYXNzZXJ0KG51bUltYWdlUmVxdWVzdHMgPj0gMCk7XG4gICAgICAgIHdoaWxlIChpbWFnZVF1ZXVlLmxlbmd0aCAmJiBudW1JbWFnZVJlcXVlc3RzIDwgY29uZmlnLk1BWF9QQVJBTExFTF9JTUFHRV9SRVFVRVNUUykgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgICAgICAgICBjb25zdCByZXF1ZXN0ID0gaW1hZ2VRdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgY29uc3Qge3JlcXVlc3RQYXJhbWV0ZXJzLCBjYWxsYmFjaywgY2FuY2VsbGVkfSA9IHJlcXVlc3Q7XG4gICAgICAgICAgICBpZiAoIWNhbmNlbGxlZCkge1xuICAgICAgICAgICAgICAgIHJlcXVlc3QuY2FuY2VsID0gZ2V0SW1hZ2UocmVxdWVzdFBhcmFtZXRlcnMsIGNhbGxiYWNrKS5jYW5jZWw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gcmVxdWVzdCB0aGUgaW1hZ2Ugd2l0aCBYSFIgdG8gd29yayBhcm91bmQgY2FjaGluZyBpc3N1ZXNcbiAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL21hcGJveC9tYXBib3gtZ2wtanMvaXNzdWVzLzE0NzBcbiAgICBjb25zdCByZXF1ZXN0ID0gZ2V0QXJyYXlCdWZmZXIocmVxdWVzdFBhcmFtZXRlcnMsIChlcnI6ID9FcnJvciwgZGF0YTogP0FycmF5QnVmZmVyLCBjYWNoZUNvbnRyb2w6ID9zdHJpbmcsIGV4cGlyZXM6ID9zdHJpbmcpID0+IHtcblxuICAgICAgICBhZHZhbmNlSW1hZ2VSZXF1ZXN0UXVldWUoKTtcblxuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICB9IGVsc2UgaWYgKGRhdGEpIHtcbiAgICAgICAgICAgIGNvbnN0IGltZzogSFRNTEltYWdlRWxlbWVudCA9IG5ldyB3aW5kb3cuSW1hZ2UoKTtcbiAgICAgICAgICAgIGNvbnN0IFVSTCA9IHdpbmRvdy5VUkwgfHwgd2luZG93LndlYmtpdFVSTDtcbiAgICAgICAgICAgIGltZy5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgaW1nKTtcbiAgICAgICAgICAgICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKGltZy5zcmMpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGltZy5vbmVycm9yID0gKCkgPT4gY2FsbGJhY2sobmV3IEVycm9yKCdDb3VsZCBub3QgbG9hZCBpbWFnZS4gUGxlYXNlIG1ha2Ugc3VyZSB0byB1c2UgYSBzdXBwb3J0ZWQgaW1hZ2UgdHlwZSBzdWNoIGFzIFBORyBvciBKUEVHLiBOb3RlIHRoYXQgU1ZHcyBhcmUgbm90IHN1cHBvcnRlZC4nKSk7XG4gICAgICAgICAgICBjb25zdCBibG9iOiBCbG9iID0gbmV3IHdpbmRvdy5CbG9iKFtuZXcgVWludDhBcnJheShkYXRhKV0sIHsgdHlwZTogJ2ltYWdlL3BuZycgfSk7XG4gICAgICAgICAgICAoaW1nOiBhbnkpLmNhY2hlQ29udHJvbCA9IGNhY2hlQ29udHJvbDtcbiAgICAgICAgICAgIChpbWc6IGFueSkuZXhwaXJlcyA9IGV4cGlyZXM7XG4gICAgICAgICAgICBpbWcuc3JjID0gZGF0YS5ieXRlTGVuZ3RoID8gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKSA6IHRyYW5zcGFyZW50UG5nVXJsO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBjYW5jZWw6ICgpID0+IHtcbiAgICAgICAgICAgIHJlcXVlc3QuY2FuY2VsKCk7XG4gICAgICAgICAgICBhZHZhbmNlSW1hZ2VSZXF1ZXN0UXVldWUoKTtcbiAgICAgICAgfVxuICAgIH07XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0VmlkZW8gPSBmdW5jdGlvbih1cmxzOiBBcnJheTxzdHJpbmc+LCBjYWxsYmFjazogQ2FsbGJhY2s8SFRNTFZpZGVvRWxlbWVudD4pOiBDYW5jZWxhYmxlIHtcbiAgICBjb25zdCB2aWRlbzogSFRNTFZpZGVvRWxlbWVudCA9IHdpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCd2aWRlbycpO1xuICAgIHZpZGVvLm11dGVkID0gdHJ1ZTtcbiAgICB2aWRlby5vbmxvYWRzdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBjYWxsYmFjayhudWxsLCB2aWRlbyk7XG4gICAgfTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHVybHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgczogSFRNTFNvdXJjZUVsZW1lbnQgPSB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc291cmNlJyk7XG4gICAgICAgIGlmICghc2FtZU9yaWdpbih1cmxzW2ldKSkge1xuICAgICAgICAgICAgdmlkZW8uY3Jvc3NPcmlnaW4gPSAnQW5vbnltb3VzJztcbiAgICAgICAgfVxuICAgICAgICBzLnNyYyA9IHVybHNbaV07XG4gICAgICAgIHZpZGVvLmFwcGVuZENoaWxkKHMpO1xuICAgIH1cbiAgICByZXR1cm4geyBjYW5jZWw6ICgpID0+IHt9IH07XG59O1xuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHsgZXh0ZW5kIH0gZnJvbSAnLi91dGlsJztcblxudHlwZSBMaXN0ZW5lciA9IChPYmplY3QpID0+IGFueTtcbnR5cGUgTGlzdGVuZXJzID0geyBbc3RyaW5nXTogQXJyYXk8TGlzdGVuZXI+IH07XG5cbmZ1bmN0aW9uIF9hZGRFdmVudExpc3RlbmVyKHR5cGU6IHN0cmluZywgbGlzdGVuZXI6IExpc3RlbmVyLCBsaXN0ZW5lckxpc3Q6IExpc3RlbmVycykge1xuICAgIGNvbnN0IGxpc3RlbmVyRXhpc3RzID0gbGlzdGVuZXJMaXN0W3R5cGVdICYmIGxpc3RlbmVyTGlzdFt0eXBlXS5pbmRleE9mKGxpc3RlbmVyKSAhPT0gLTE7XG4gICAgaWYgKCFsaXN0ZW5lckV4aXN0cykge1xuICAgICAgICBsaXN0ZW5lckxpc3RbdHlwZV0gPSBsaXN0ZW5lckxpc3RbdHlwZV0gfHwgW107XG4gICAgICAgIGxpc3RlbmVyTGlzdFt0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIF9yZW1vdmVFdmVudExpc3RlbmVyKHR5cGU6IHN0cmluZywgbGlzdGVuZXI6IExpc3RlbmVyLCBsaXN0ZW5lckxpc3Q6IExpc3RlbmVycykge1xuICAgIGlmIChsaXN0ZW5lckxpc3QgJiYgbGlzdGVuZXJMaXN0W3R5cGVdKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gbGlzdGVuZXJMaXN0W3R5cGVdLmluZGV4T2YobGlzdGVuZXIpO1xuICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgICBsaXN0ZW5lckxpc3RbdHlwZV0uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEV2ZW50IHtcbiAgICArdHlwZTogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IodHlwZTogc3RyaW5nLCBkYXRhOiBPYmplY3QgPSB7fSkge1xuICAgICAgICBleHRlbmQodGhpcywgZGF0YSk7XG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgRXJyb3JFdmVudCBleHRlbmRzIEV2ZW50IHtcbiAgICBlcnJvcjogRXJyb3I7XG5cbiAgICBjb25zdHJ1Y3RvcihlcnJvcjogRXJyb3IsIGRhdGE6IE9iamVjdCA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCdlcnJvcicsIGV4dGVuZCh7ZXJyb3J9LCBkYXRhKSk7XG4gICAgfVxufVxuXG4vKipcbiAqIE1ldGhvZHMgbWl4ZWQgaW4gdG8gb3RoZXIgY2xhc3NlcyBmb3IgZXZlbnQgY2FwYWJpbGl0aWVzLlxuICpcbiAqIEBtaXhpbiBFdmVudGVkXG4gKi9cbmV4cG9ydCBjbGFzcyBFdmVudGVkIHtcbiAgICBfbGlzdGVuZXJzOiBMaXN0ZW5lcnM7XG4gICAgX29uZVRpbWVMaXN0ZW5lcnM6IExpc3RlbmVycztcbiAgICBfZXZlbnRlZFBhcmVudDogP0V2ZW50ZWQ7XG4gICAgX2V2ZW50ZWRQYXJlbnREYXRhOiA/KE9iamVjdCB8ICgpID0+IE9iamVjdCk7XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgbGlzdGVuZXIgdG8gYSBzcGVjaWZpZWQgZXZlbnQgdHlwZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIFRoZSBldmVudCB0eXBlIHRvIGFkZCBhIGxpc3RlbiBmb3IuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXIgVGhlIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBldmVudCBpcyBmaXJlZC5cbiAgICAgKiAgIFRoZSBsaXN0ZW5lciBmdW5jdGlvbiBpcyBjYWxsZWQgd2l0aCB0aGUgZGF0YSBvYmplY3QgcGFzc2VkIHRvIGBmaXJlYCxcbiAgICAgKiAgIGV4dGVuZGVkIHdpdGggYHRhcmdldGAgYW5kIGB0eXBlYCBwcm9wZXJ0aWVzLlxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IGB0aGlzYFxuICAgICAqL1xuICAgIG9uKHR5cGU6ICosIGxpc3RlbmVyOiBMaXN0ZW5lcik6IHRoaXMge1xuICAgICAgICB0aGlzLl9saXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnMgfHwge307XG4gICAgICAgIF9hZGRFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCB0aGlzLl9saXN0ZW5lcnMpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYSBwcmV2aW91c2x5IHJlZ2lzdGVyZWQgZXZlbnQgbGlzdGVuZXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBUaGUgZXZlbnQgdHlwZSB0byByZW1vdmUgbGlzdGVuZXJzIGZvci5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lciBUaGUgbGlzdGVuZXIgZnVuY3Rpb24gdG8gcmVtb3ZlLlxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IGB0aGlzYFxuICAgICAqL1xuICAgIG9mZih0eXBlOiAqLCBsaXN0ZW5lcjogTGlzdGVuZXIpIHtcbiAgICAgICAgX3JlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIHRoaXMuX2xpc3RlbmVycyk7XG4gICAgICAgIF9yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCB0aGlzLl9vbmVUaW1lTGlzdGVuZXJzKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgbGlzdGVuZXIgdGhhdCB3aWxsIGJlIGNhbGxlZCBvbmx5IG9uY2UgdG8gYSBzcGVjaWZpZWQgZXZlbnQgdHlwZS5cbiAgICAgKlxuICAgICAqIFRoZSBsaXN0ZW5lciB3aWxsIGJlIGNhbGxlZCBmaXJzdCB0aW1lIHRoZSBldmVudCBmaXJlcyBhZnRlciB0aGUgbGlzdGVuZXIgaXMgcmVnaXN0ZXJlZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIFRoZSBldmVudCB0eXBlIHRvIGxpc3RlbiBmb3IuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXIgVGhlIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBldmVudCBpcyBmaXJlZCB0aGUgZmlyc3QgdGltZS5cbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBgdGhpc2BcbiAgICAgKi9cbiAgICBvbmNlKHR5cGU6IHN0cmluZywgbGlzdGVuZXI6IExpc3RlbmVyKSB7XG4gICAgICAgIHRoaXMuX29uZVRpbWVMaXN0ZW5lcnMgPSB0aGlzLl9vbmVUaW1lTGlzdGVuZXJzIHx8IHt9O1xuICAgICAgICBfYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgdGhpcy5fb25lVGltZUxpc3RlbmVycyk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZmlyZShldmVudDogRXZlbnQsIHByb3BlcnRpZXM/OiBPYmplY3QpIHtcbiAgICAgICAgLy8gQ29tcGF0aWJpbGl0eSB3aXRoICh0eXBlOiBzdHJpbmcsIHByb3BlcnRpZXM6IE9iamVjdCkgc2lnbmF0dXJlIGZyb20gcHJldmlvdXMgdmVyc2lvbnMuXG4gICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbWFwYm94L21hcGJveC1nbC1qcy9pc3N1ZXMvNjUyMixcbiAgICAgICAgLy8gICAgIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXBib3gvbWFwYm94LWdsLWRyYXcvaXNzdWVzLzc2NlxuICAgICAgICBpZiAodHlwZW9mIGV2ZW50ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgZXZlbnQgPSBuZXcgRXZlbnQoZXZlbnQsIHByb3BlcnRpZXMgfHwge30pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdHlwZSA9IGV2ZW50LnR5cGU7XG5cbiAgICAgICAgaWYgKHRoaXMubGlzdGVucyh0eXBlKSkge1xuICAgICAgICAgICAgKGV2ZW50OiBhbnkpLnRhcmdldCA9IHRoaXM7XG5cbiAgICAgICAgICAgIC8vIG1ha2Ugc3VyZSBhZGRpbmcgb3IgcmVtb3ZpbmcgbGlzdGVuZXJzIGluc2lkZSBvdGhlciBsaXN0ZW5lcnMgd29uJ3QgY2F1c2UgYW4gaW5maW5pdGUgbG9vcFxuICAgICAgICAgICAgY29uc3QgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzICYmIHRoaXMuX2xpc3RlbmVyc1t0eXBlXSA/IHRoaXMuX2xpc3RlbmVyc1t0eXBlXS5zbGljZSgpIDogW107XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGxpc3RlbmVyIG9mIGxpc3RlbmVycykge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyLmNhbGwodGhpcywgZXZlbnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBvbmVUaW1lTGlzdGVuZXJzID0gdGhpcy5fb25lVGltZUxpc3RlbmVycyAmJiB0aGlzLl9vbmVUaW1lTGlzdGVuZXJzW3R5cGVdID8gdGhpcy5fb25lVGltZUxpc3RlbmVyc1t0eXBlXS5zbGljZSgpIDogW107XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGxpc3RlbmVyIG9mIG9uZVRpbWVMaXN0ZW5lcnMpIHtcbiAgICAgICAgICAgICAgICBfcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgdGhpcy5fb25lVGltZUxpc3RlbmVycyk7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXIuY2FsbCh0aGlzLCBldmVudCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IHRoaXMuX2V2ZW50ZWRQYXJlbnQ7XG4gICAgICAgICAgICBpZiAocGFyZW50KSB7XG4gICAgICAgICAgICAgICAgZXh0ZW5kKFxuICAgICAgICAgICAgICAgICAgICBldmVudCxcbiAgICAgICAgICAgICAgICAgICAgdHlwZW9mIHRoaXMuX2V2ZW50ZWRQYXJlbnREYXRhID09PSAnZnVuY3Rpb24nID8gdGhpcy5fZXZlbnRlZFBhcmVudERhdGEoKSA6IHRoaXMuX2V2ZW50ZWRQYXJlbnREYXRhXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBwYXJlbnQuZmlyZShldmVudCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgLy8gVG8gZW5zdXJlIHRoYXQgbm8gZXJyb3IgZXZlbnRzIGFyZSBkcm9wcGVkLCBwcmludCB0aGVtIHRvIHRoZVxuICAgICAgICAvLyBjb25zb2xlIGlmIHRoZXkgaGF2ZSBubyBsaXN0ZW5lcnMuXG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQgaW5zdGFuY2VvZiBFcnJvckV2ZW50KSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGV2ZW50LmVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSB0cnVlIGlmIHRoaXMgaW5zdGFuY2Ugb2YgRXZlbnRlZCBvciBhbnkgZm9yd2FyZGVlZCBpbnN0YW5jZXMgb2YgRXZlbnRlZCBoYXZlIGEgbGlzdGVuZXIgZm9yIHRoZSBzcGVjaWZpZWQgdHlwZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIFRoZSBldmVudCB0eXBlXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IGB0cnVlYCBpZiB0aGVyZSBpcyBhdCBsZWFzdCBvbmUgcmVnaXN0ZXJlZCBsaXN0ZW5lciBmb3Igc3BlY2lmaWVkIGV2ZW50IHR5cGUsIGBmYWxzZWAgb3RoZXJ3aXNlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBsaXN0ZW5zKHR5cGU6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgKHRoaXMuX2xpc3RlbmVycyAmJiB0aGlzLl9saXN0ZW5lcnNbdHlwZV0gJiYgdGhpcy5fbGlzdGVuZXJzW3R5cGVdLmxlbmd0aCA+IDApIHx8XG4gICAgICAgICAgICAodGhpcy5fb25lVGltZUxpc3RlbmVycyAmJiB0aGlzLl9vbmVUaW1lTGlzdGVuZXJzW3R5cGVdICYmIHRoaXMuX29uZVRpbWVMaXN0ZW5lcnNbdHlwZV0ubGVuZ3RoID4gMCkgfHxcbiAgICAgICAgICAgICh0aGlzLl9ldmVudGVkUGFyZW50ICYmIHRoaXMuX2V2ZW50ZWRQYXJlbnQubGlzdGVucyh0eXBlKSlcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBCdWJibGUgYWxsIGV2ZW50cyBmaXJlZCBieSB0aGlzIGluc3RhbmNlIG9mIEV2ZW50ZWQgdG8gdGhpcyBwYXJlbnQgaW5zdGFuY2Ugb2YgRXZlbnRlZC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHJldHVybnMge09iamVjdH0gYHRoaXNgXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBzZXRFdmVudGVkUGFyZW50KHBhcmVudDogP0V2ZW50ZWQsIGRhdGE/OiBPYmplY3QgfCAoKSA9PiBPYmplY3QpIHtcbiAgICAgICAgdGhpcy5fZXZlbnRlZFBhcmVudCA9IHBhcmVudDtcbiAgICAgICAgdGhpcy5fZXZlbnRlZFBhcmVudERhdGEgPSBkYXRhO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn1cbiIsInZhciBTcGhlcmljYWxNZXJjYXRvciA9IChmdW5jdGlvbigpe1xuXG4vLyBDbG9zdXJlcyBpbmNsdWRpbmcgY29uc3RhbnRzIGFuZCBvdGhlciBwcmVjYWxjdWxhdGVkIHZhbHVlcy5cbnZhciBjYWNoZSA9IHt9LFxuICAgIEVQU0xOID0gMS4wZS0xMCxcbiAgICBEMlIgPSBNYXRoLlBJIC8gMTgwLFxuICAgIFIyRCA9IDE4MCAvIE1hdGguUEksXG4gICAgLy8gOTAwOTEzIHByb3BlcnRpZXMuXG4gICAgQSA9IDYzNzgxMzcuMCxcbiAgICBNQVhFWFRFTlQgPSAyMDAzNzUwOC4zNDI3ODkyNDQ7XG5cbmZ1bmN0aW9uIGlzRmxvYXQobil7XG4gICAgcmV0dXJuIE51bWJlcihuKSA9PT0gbiAmJiBuICUgMSAhPT0gMDtcbn1cblxuLy8gU3BoZXJpY2FsTWVyY2F0b3IgY29uc3RydWN0b3I6IHByZWNhY2hlcyBjYWxjdWxhdGlvbnNcbi8vIGZvciBmYXN0IHRpbGUgbG9va3Vwcy5cbmZ1bmN0aW9uIFNwaGVyaWNhbE1lcmNhdG9yKG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB0aGlzLnNpemUgPSBvcHRpb25zLnNpemUgfHwgMjU2O1xuICAgIGlmICghY2FjaGVbdGhpcy5zaXplXSkge1xuICAgICAgICB2YXIgc2l6ZSA9IHRoaXMuc2l6ZTtcbiAgICAgICAgdmFyIGMgPSBjYWNoZVt0aGlzLnNpemVdID0ge307XG4gICAgICAgIGMuQmMgPSBbXTtcbiAgICAgICAgYy5DYyA9IFtdO1xuICAgICAgICBjLnpjID0gW107XG4gICAgICAgIGMuQWMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgZCA9IDA7IGQgPCAzMDsgZCsrKSB7XG4gICAgICAgICAgICBjLkJjLnB1c2goc2l6ZSAvIDM2MCk7XG4gICAgICAgICAgICBjLkNjLnB1c2goc2l6ZSAvICgyICogTWF0aC5QSSkpO1xuICAgICAgICAgICAgYy56Yy5wdXNoKHNpemUgLyAyKTtcbiAgICAgICAgICAgIGMuQWMucHVzaChzaXplKTtcbiAgICAgICAgICAgIHNpemUgKj0gMjtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0aGlzLkJjID0gY2FjaGVbdGhpcy5zaXplXS5CYztcbiAgICB0aGlzLkNjID0gY2FjaGVbdGhpcy5zaXplXS5DYztcbiAgICB0aGlzLnpjID0gY2FjaGVbdGhpcy5zaXplXS56YztcbiAgICB0aGlzLkFjID0gY2FjaGVbdGhpcy5zaXplXS5BYztcbn07XG5cbi8vIENvbnZlcnQgbG9uIGxhdCB0byBzY3JlZW4gcGl4ZWwgdmFsdWVcbi8vXG4vLyAtIGBsbGAge0FycmF5fSBgW2xvbiwgbGF0XWAgYXJyYXkgb2YgZ2VvZ3JhcGhpYyBjb29yZGluYXRlcy5cbi8vIC0gYHpvb21gIHtOdW1iZXJ9IHpvb20gbGV2ZWwuXG5TcGhlcmljYWxNZXJjYXRvci5wcm90b3R5cGUucHggPSBmdW5jdGlvbihsbCwgem9vbSkge1xuICBpZiAoaXNGbG9hdCh6b29tKSkge1xuICAgIHZhciBzaXplID0gdGhpcy5zaXplICogTWF0aC5wb3coMiwgem9vbSk7XG4gICAgdmFyIGQgPSBzaXplIC8gMjtcbiAgICB2YXIgYmMgPSAoc2l6ZSAvIDM2MCk7XG4gICAgdmFyIGNjID0gKHNpemUgLyAoMiAqIE1hdGguUEkpKTtcbiAgICB2YXIgYWMgPSBzaXplO1xuICAgIHZhciBmID0gTWF0aC5taW4oTWF0aC5tYXgoTWF0aC5zaW4oRDJSICogbGxbMV0pLCAtMC45OTk5KSwgMC45OTk5KTtcbiAgICB2YXIgeCA9IGQgKyBsbFswXSAqIGJjO1xuICAgIHZhciB5ID0gZCArIDAuNSAqIE1hdGgubG9nKCgxICsgZikgLyAoMSAtIGYpKSAqIC1jYztcbiAgICAoeCA+IGFjKSAmJiAoeCA9IGFjKTtcbiAgICAoeSA+IGFjKSAmJiAoeSA9IGFjKTtcbiAgICAvLyh4IDwgMCkgJiYgKHggPSAwKTtcbiAgICAvLyh5IDwgMCkgJiYgKHkgPSAwKTtcbiAgICByZXR1cm4gW3gsIHldO1xuICB9IGVsc2Uge1xuICAgIHZhciBkID0gdGhpcy56Y1t6b29tXTtcbiAgICB2YXIgZiA9IE1hdGgubWluKE1hdGgubWF4KE1hdGguc2luKEQyUiAqIGxsWzFdKSwgLTAuOTk5OSksIDAuOTk5OSk7XG4gICAgdmFyIHggPSBNYXRoLnJvdW5kKGQgKyBsbFswXSAqIHRoaXMuQmNbem9vbV0pO1xuICAgIHZhciB5ID0gTWF0aC5yb3VuZChkICsgMC41ICogTWF0aC5sb2coKDEgKyBmKSAvICgxIC0gZikpICogKC10aGlzLkNjW3pvb21dKSk7XG4gICAgKHggPiB0aGlzLkFjW3pvb21dKSAmJiAoeCA9IHRoaXMuQWNbem9vbV0pO1xuICAgICh5ID4gdGhpcy5BY1t6b29tXSkgJiYgKHkgPSB0aGlzLkFjW3pvb21dKTtcbiAgICAvLyh4IDwgMCkgJiYgKHggPSAwKTtcbiAgICAvLyh5IDwgMCkgJiYgKHkgPSAwKTtcbiAgICByZXR1cm4gW3gsIHldO1xuICB9XG59O1xuXG4vLyBDb252ZXJ0IHNjcmVlbiBwaXhlbCB2YWx1ZSB0byBsb24gbGF0XG4vL1xuLy8gLSBgcHhgIHtBcnJheX0gYFt4LCB5XWAgYXJyYXkgb2YgZ2VvZ3JhcGhpYyBjb29yZGluYXRlcy5cbi8vIC0gYHpvb21gIHtOdW1iZXJ9IHpvb20gbGV2ZWwuXG5TcGhlcmljYWxNZXJjYXRvci5wcm90b3R5cGUubGwgPSBmdW5jdGlvbihweCwgem9vbSkge1xuICBpZiAoaXNGbG9hdCh6b29tKSkge1xuICAgIHZhciBzaXplID0gdGhpcy5zaXplICogTWF0aC5wb3coMiwgem9vbSk7XG4gICAgdmFyIGJjID0gKHNpemUgLyAzNjApO1xuICAgIHZhciBjYyA9IChzaXplIC8gKDIgKiBNYXRoLlBJKSk7XG4gICAgdmFyIHpjID0gc2l6ZSAvIDI7XG4gICAgdmFyIGcgPSAocHhbMV0gLSB6YykgLyAtY2M7XG4gICAgdmFyIGxvbiA9IChweFswXSAtIHpjKSAvIGJjO1xuICAgIHZhciBsYXQgPSBSMkQgKiAoMiAqIE1hdGguYXRhbihNYXRoLmV4cChnKSkgLSAwLjUgKiBNYXRoLlBJKTtcbiAgICByZXR1cm4gW2xvbiwgbGF0XTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgZyA9IChweFsxXSAtIHRoaXMuemNbem9vbV0pIC8gKC10aGlzLkNjW3pvb21dKTtcbiAgICB2YXIgbG9uID0gKHB4WzBdIC0gdGhpcy56Y1t6b29tXSkgLyB0aGlzLkJjW3pvb21dO1xuICAgIHZhciBsYXQgPSBSMkQgKiAoMiAqIE1hdGguYXRhbihNYXRoLmV4cChnKSkgLSAwLjUgKiBNYXRoLlBJKTtcbiAgICByZXR1cm4gW2xvbiwgbGF0XTtcbiAgfVxufTtcblxuLy8gQ29udmVydCB0aWxlIHh5eiB2YWx1ZSB0byBiYm94IG9mIHRoZSBmb3JtIGBbdywgcywgZSwgbl1gXG4vL1xuLy8gLSBgeGAge051bWJlcn0geCAobG9uZ2l0dWRlKSBudW1iZXIuXG4vLyAtIGB5YCB7TnVtYmVyfSB5IChsYXRpdHVkZSkgbnVtYmVyLlxuLy8gLSBgem9vbWAge051bWJlcn0gem9vbS5cbi8vIC0gYHRtc19zdHlsZWAge0Jvb2xlYW59IHdoZXRoZXIgdG8gY29tcHV0ZSB1c2luZyB0bXMtc3R5bGUuXG4vLyAtIGBzcnNgIHtTdHJpbmd9IHByb2plY3Rpb24gZm9yIHJlc3VsdGluZyBiYm94IChXR1M4NHw5MDA5MTMpLlxuLy8gLSBgcmV0dXJuYCB7QXJyYXl9IGJib3ggYXJyYXkgb2YgdmFsdWVzIGluIGZvcm0gYFt3LCBzLCBlLCBuXWAuXG5TcGhlcmljYWxNZXJjYXRvci5wcm90b3R5cGUuYmJveCA9IGZ1bmN0aW9uKHgsIHksIHpvb20sIHRtc19zdHlsZSwgc3JzKSB7XG4gICAgLy8gQ29udmVydCB4eXogaW50byBiYm94IHdpdGggc3JzIFdHUzg0XG4gICAgaWYgKHRtc19zdHlsZSkge1xuICAgICAgICB5ID0gKE1hdGgucG93KDIsIHpvb20pIC0gMSkgLSB5O1xuICAgIH1cbiAgICAvLyBVc2UgK3kgdG8gbWFrZSBzdXJlIGl0J3MgYSBudW1iZXIgdG8gYXZvaWQgaW5hZHZlcnRlbnQgY29uY2F0ZW5hdGlvbi5cbiAgICB2YXIgbGwgPSBbeCAqIHRoaXMuc2l6ZSwgKCt5ICsgMSkgKiB0aGlzLnNpemVdOyAvLyBsb3dlciBsZWZ0XG4gICAgLy8gVXNlICt4IHRvIG1ha2Ugc3VyZSBpdCdzIGEgbnVtYmVyIHRvIGF2b2lkIGluYWR2ZXJ0ZW50IGNvbmNhdGVuYXRpb24uXG4gICAgdmFyIHVyID0gWygreCArIDEpICogdGhpcy5zaXplLCB5ICogdGhpcy5zaXplXTsgLy8gdXBwZXIgcmlnaHRcbiAgICB2YXIgYmJveCA9IHRoaXMubGwobGwsIHpvb20pLmNvbmNhdCh0aGlzLmxsKHVyLCB6b29tKSk7XG5cbiAgICAvLyBJZiB3ZWIgbWVyY2F0b3IgcmVxdWVzdGVkIHJlcHJvamVjdCB0byA5MDA5MTMuXG4gICAgaWYgKHNycyA9PT0gJzkwMDkxMycpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udmVydChiYm94LCAnOTAwOTEzJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGJib3g7XG4gICAgfVxufTtcblxuLy8gQ29udmVydCBiYm94IHRvIHh5eCBib3VuZHNcbi8vXG4vLyAtIGBiYm94YCB7TnVtYmVyfSBiYm94IGluIHRoZSBmb3JtIGBbdywgcywgZSwgbl1gLlxuLy8gLSBgem9vbWAge051bWJlcn0gem9vbS5cbi8vIC0gYHRtc19zdHlsZWAge0Jvb2xlYW59IHdoZXRoZXIgdG8gY29tcHV0ZSB1c2luZyB0bXMtc3R5bGUuXG4vLyAtIGBzcnNgIHtTdHJpbmd9IHByb2plY3Rpb24gb2YgaW5wdXQgYmJveCAoV0dTODR8OTAwOTEzKS5cbi8vIC0gYEByZXR1cm5gIHtPYmplY3R9IFhZWiBib3VuZHMgY29udGFpbmluZyBtaW5YLCBtYXhYLCBtaW5ZLCBtYXhZIHByb3BlcnRpZXMuXG5TcGhlcmljYWxNZXJjYXRvci5wcm90b3R5cGUueHl6ID0gZnVuY3Rpb24oYmJveCwgem9vbSwgdG1zX3N0eWxlLCBzcnMpIHtcbiAgICAvLyBJZiB3ZWIgbWVyY2F0b3IgcHJvdmlkZWQgcmVwcm9qZWN0IHRvIFdHUzg0LlxuICAgIGlmIChzcnMgPT09ICc5MDA5MTMnKSB7XG4gICAgICAgIGJib3ggPSB0aGlzLmNvbnZlcnQoYmJveCwgJ1dHUzg0Jyk7XG4gICAgfVxuXG4gICAgdmFyIGxsID0gW2Jib3hbMF0sIGJib3hbMV1dOyAvLyBsb3dlciBsZWZ0XG4gICAgdmFyIHVyID0gW2Jib3hbMl0sIGJib3hbM11dOyAvLyB1cHBlciByaWdodFxuICAgIHZhciBweF9sbCA9IHRoaXMucHgobGwsIHpvb20pO1xuICAgIHZhciBweF91ciA9IHRoaXMucHgodXIsIHpvb20pO1xuICAgIC8vIFkgPSAwIGZvciBYWVogaXMgdGhlIHRvcCBoZW5jZSBtaW5ZIHVzZXMgcHhfdXJbMV0uXG4gICAgdmFyIHggPSBbIE1hdGguZmxvb3IocHhfbGxbMF0gLyB0aGlzLnNpemUpLCBNYXRoLmZsb29yKChweF91clswXSAtIDEpIC8gdGhpcy5zaXplKSBdO1xuICAgIHZhciB5ID0gWyBNYXRoLmZsb29yKHB4X3VyWzFdIC8gdGhpcy5zaXplKSwgTWF0aC5mbG9vcigocHhfbGxbMV0gLSAxKSAvIHRoaXMuc2l6ZSkgXTtcbiAgICB2YXIgYm91bmRzID0ge1xuICAgICAgICBtaW5YOiBNYXRoLm1pbi5hcHBseShNYXRoLCB4KSA8IDAgPyAwIDogTWF0aC5taW4uYXBwbHkoTWF0aCwgeCksXG4gICAgICAgIG1pblk6IE1hdGgubWluLmFwcGx5KE1hdGgsIHkpIDwgMCA/IDAgOiBNYXRoLm1pbi5hcHBseShNYXRoLCB5KSxcbiAgICAgICAgbWF4WDogTWF0aC5tYXguYXBwbHkoTWF0aCwgeCksXG4gICAgICAgIG1heFk6IE1hdGgubWF4LmFwcGx5KE1hdGgsIHkpXG4gICAgfTtcbiAgICBpZiAodG1zX3N0eWxlKSB7XG4gICAgICAgIHZhciB0bXMgPSB7XG4gICAgICAgICAgICBtaW5ZOiAoTWF0aC5wb3coMiwgem9vbSkgLSAxKSAtIGJvdW5kcy5tYXhZLFxuICAgICAgICAgICAgbWF4WTogKE1hdGgucG93KDIsIHpvb20pIC0gMSkgLSBib3VuZHMubWluWVxuICAgICAgICB9O1xuICAgICAgICBib3VuZHMubWluWSA9IHRtcy5taW5ZO1xuICAgICAgICBib3VuZHMubWF4WSA9IHRtcy5tYXhZO1xuICAgIH1cbiAgICByZXR1cm4gYm91bmRzO1xufTtcblxuLy8gQ29udmVydCBwcm9qZWN0aW9uIG9mIGdpdmVuIGJib3guXG4vL1xuLy8gLSBgYmJveGAge051bWJlcn0gYmJveCBpbiB0aGUgZm9ybSBgW3csIHMsIGUsIG5dYC5cbi8vIC0gYHRvYCB7U3RyaW5nfSBwcm9qZWN0aW9uIG9mIG91dHB1dCBiYm94IChXR1M4NHw5MDA5MTMpLiBJbnB1dCBiYm94XG4vLyAgIGFzc3VtZWQgdG8gYmUgdGhlIFwib3RoZXJcIiBwcm9qZWN0aW9uLlxuLy8gLSBgQHJldHVybmAge09iamVjdH0gYmJveCB3aXRoIHJlcHJvamVjdGVkIGNvb3JkaW5hdGVzLlxuU3BoZXJpY2FsTWVyY2F0b3IucHJvdG90eXBlLmNvbnZlcnQgPSBmdW5jdGlvbihiYm94LCB0bykge1xuICAgIGlmICh0byA9PT0gJzkwMDkxMycpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZm9yd2FyZChiYm94LnNsaWNlKDAsIDIpKS5jb25jYXQodGhpcy5mb3J3YXJkKGJib3guc2xpY2UoMiw0KSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLmludmVyc2UoYmJveC5zbGljZSgwLCAyKSkuY29uY2F0KHRoaXMuaW52ZXJzZShiYm94LnNsaWNlKDIsNCkpKTtcbiAgICB9XG59O1xuXG4vLyBDb252ZXJ0IGxvbi9sYXQgdmFsdWVzIHRvIDkwMDkxMyB4L3kuXG5TcGhlcmljYWxNZXJjYXRvci5wcm90b3R5cGUuZm9yd2FyZCA9IGZ1bmN0aW9uKGxsKSB7XG4gICAgdmFyIHh5ID0gW1xuICAgICAgICBBICogbGxbMF0gKiBEMlIsXG4gICAgICAgIEEgKiBNYXRoLmxvZyhNYXRoLnRhbigoTWF0aC5QSSowLjI1KSArICgwLjUgKiBsbFsxXSAqIEQyUikpKVxuICAgIF07XG4gICAgLy8gaWYgeHkgdmFsdWUgaXMgYmV5b25kIG1heGV4dGVudCAoZS5nLiBwb2xlcyksIHJldHVybiBtYXhleHRlbnQuXG4gICAgKHh5WzBdID4gTUFYRVhURU5UKSAmJiAoeHlbMF0gPSBNQVhFWFRFTlQpO1xuICAgICh4eVswXSA8IC1NQVhFWFRFTlQpICYmICh4eVswXSA9IC1NQVhFWFRFTlQpO1xuICAgICh4eVsxXSA+IE1BWEVYVEVOVCkgJiYgKHh5WzFdID0gTUFYRVhURU5UKTtcbiAgICAoeHlbMV0gPCAtTUFYRVhURU5UKSAmJiAoeHlbMV0gPSAtTUFYRVhURU5UKTtcbiAgICByZXR1cm4geHk7XG59O1xuXG4vLyBDb252ZXJ0IDkwMDkxMyB4L3kgdmFsdWVzIHRvIGxvbi9sYXQuXG5TcGhlcmljYWxNZXJjYXRvci5wcm90b3R5cGUuaW52ZXJzZSA9IGZ1bmN0aW9uKHh5KSB7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgKHh5WzBdICogUjJEIC8gQSksXG4gICAgICAgICgoTWF0aC5QSSowLjUpIC0gMi4wICogTWF0aC5hdGFuKE1hdGguZXhwKC14eVsxXSAvIEEpKSkgKiBSMkRcbiAgICBdO1xufTtcblxucmV0dXJuIFNwaGVyaWNhbE1lcmNhdG9yO1xuXG59KSgpO1xuXG5pZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gU3BoZXJpY2FsTWVyY2F0b3I7XG59XG4iLCJpbXBvcnQgeyBwaWNrIH0gZnJvbSAnbWFwYm94LWdsL3NyYy91dGlsL3V0aWwnO1xuaW1wb3J0IHsgZ2V0SlNPTiB9IGZyb20gJ21hcGJveC1nbC9zcmMvdXRpbC9hamF4JztcbmltcG9ydCBicm93c2VyIGZyb20gJ21hcGJveC1nbC9zcmMvdXRpbC9icm93c2VyJztcbmltcG9ydCBTcGhlcmljYWxNZXJjYXRvciBmcm9tICdAbWFwYm94L3NwaGVyaWNhbG1lcmNhdG9yJztcblxuLy9Db250YWlucyBjb2RlIGZyb20gZXNyaS1sZWFmbGV0IGh0dHBzOi8vZ2l0aHViLmNvbS9Fc3JpL2VzcmktbGVhZmxldFxuY29uc3QgTWVyY2F0b3Jab29tTGV2ZWxzID0ge1xuICAgICcwJzogMTU2NTQzLjAzMzkyNzk5OTk5LFxuICAgICcxJzogNzgyNzEuNTE2OTYzOTk5ODkzLFxuICAgICcyJzogMzkxMzUuNzU4NDgyMDAwMDk5LFxuICAgICczJzogMTk1NjcuODc5MjQwOTk5OTAxLFxuICAgICc0JzogOTc4My45Mzk2MjA0OTk5NTkzLFxuICAgICc1JzogNDg5MS45Njk4MTAyNDk5Nzk3LFxuICAgICc2JzogMjQ0NS45ODQ5MDUxMjQ5ODk4LFxuICAgICc3JzogMTIyMi45OTI0NTI1NjI0ODk5LFxuICAgICc4JzogNjExLjQ5NjIyNjI4MTM4MDAyLFxuICAgICc5JzogMzA1Ljc0ODExMzE0MDU1ODAyLFxuICAgICcxMCc6IDE1Mi44NzQwNTY1NzA0MTEsXG4gICAgJzExJzogNzYuNDM3MDI4Mjg1MDczMTk3LFxuICAgICcxMic6IDM4LjIxODUxNDE0MjUzNjU5OCxcbiAgICAnMTMnOiAxOS4xMDkyNTcwNzEyNjgyOTksXG4gICAgJzE0JzogOS41NTQ2Mjg1MzU2MzQxNDk2LFxuICAgICcxNSc6IDQuNzc3MzE0MjY3OTQ5MzY5OSxcbiAgICAnMTYnOiAyLjM4ODY1NzEzMzk3NDY4LFxuICAgICcxNyc6IDEuMTk0MzI4NTY2ODU1MDUwMSxcbiAgICAnMTgnOiAwLjU5NzE2NDI4MzU1OTgxNjk5LFxuICAgICcxOSc6IDAuMjk4NTgyMTQxNjQ3NjE2OTgsXG4gICAgJzIwJzogMC4xNDkyOTEwNzA4MjM4MSxcbiAgICAnMjEnOiAwLjA3NDY0NTUzNTQxMTkxLFxuICAgICcyMic6IDAuMDM3MzIyNzY3NzA1OTUyNSxcbiAgICAnMjMnOiAwLjAxODY2MTM4Mzg1Mjk3NjNcbn07XG5cbmNvbnN0IF93aXRoaW5QZXJjZW50YWdlID0gZnVuY3Rpb24gKGEsIGIsIHBlcmNlbnRhZ2UpIHtcbiAgICBjb25zdCBkaWZmID0gTWF0aC5hYnMoKGEgLyBiKSAtIDEpO1xuICAgIHJldHVybiBkaWZmIDwgcGVyY2VudGFnZTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gICAgY29uc3QgbG9hZGVkID0gZnVuY3Rpb24oZXJyLCBtZXRhZGF0YSkge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHBpY2sobWV0YWRhdGEsXG4gICAgICAgICAgICBbJ3RpbGVJbmZvJywgJ2luaXRpYWxFeHRlbnQnLCAnZnVsbEV4dGVudCcsICdzcGF0aWFsUmVmZXJlbmNlJywgJ3RpbGVTZXJ2ZXJzJywgJ2RvY3VtZW50SW5mbyddKTtcblxuICAgICAgICByZXN1bHQuX2xvZE1hcCA9IHt9O1xuICAgICAgICBjb25zdCB6b29tT2Zmc2V0QWxsb3dhbmNlID0gMC4xO1xuICAgICAgICBjb25zdCBzciA9IG1ldGFkYXRhLnNwYXRpYWxSZWZlcmVuY2UubGF0ZXN0V2tpZCB8fCBtZXRhZGF0YS5zcGF0aWFsUmVmZXJlbmNlLndraWQ7XG4gICAgICAgIGlmIChzciA9PT0gMTAyMTAwIHx8IHNyID09PSAzODU3KSB7XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICBFeGFtcGxlIGV4dGVudCBmcm9tIEFyY0dJUyBSRVNUIEFQSVxuICAgICAgICAgICAgZnVsbEV4dGVudDoge1xuICAgICAgICAgICAgeG1pbjogLTkxNDQ3OTEuNjc5MjI2MTI3LFxuICAgICAgICAgICAgeW1pbjogLTIxOTUxOTAuOTYxNDM3NzI2LFxuICAgICAgICAgICAgeG1heDogLTQ2NTA5ODcuMDcyMDE5OTgzLFxuICAgICAgICAgICAgeW1heDogMTExODExMy4xMTAxNTU3NjYsXG4gICAgICAgICAgICBzcGF0aWFsUmVmZXJlbmNlOiB7XG4gICAgICAgICAgICB3a2lkOiAxMDIxMDAsXG4gICAgICAgICAgICB3a3Q6IG51bGxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgLy9jb252ZXJ0IEFyY0dJUyBleHRlbnQgdG8gYm91bmRzXG4gICAgICAgICAgICBjb25zdCBleHRlbnQgPSBtZXRhZGF0YS5mdWxsRXh0ZW50O1xuICAgICAgICAgICAgaWYgKGV4dGVudCAmJiBleHRlbnQuc3BhdGlhbFJlZmVyZW5jZSAmJiBleHRlbnQuc3BhdGlhbFJlZmVyZW5jZS53a2lkID09PSAgMTAyMTAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYm91bmRzV2ViTWVyY2F0b3IgPSBbZXh0ZW50LnhtaW4sIGV4dGVudC55bWluLCBleHRlbnQueG1heCwgZXh0ZW50LnltYXhdO1xuICAgICAgICAgICAgICAgIHZhciBtZXJjID0gbmV3IFNwaGVyaWNhbE1lcmNhdG9yKHtcbiAgICAgICAgICAgICAgICAgICAgc2l6ZTogMjU2XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgY29uc3QgYm91bmRzV0dTODQgPSBtZXJjLmNvbnZlcnQoYm91bmRzV2ViTWVyY2F0b3IpO1xuICAgICAgICAgICAgICAgIHJlc3VsdC5ib3VuZHMgPSBib3VuZHNXR1M4NDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gY3JlYXRlIHRoZSB6b29tIGxldmVsIGRhdGFcbiAgICAgICAgICAgIGNvbnN0IGFyY2dpc0xPRHMgPSBtZXRhZGF0YS50aWxlSW5mby5sb2RzO1xuICAgICAgICAgICAgY29uc3QgY29ycmVjdFJlc29sdXRpb25zID0gTWVyY2F0b3Jab29tTGV2ZWxzO1xuICAgICAgICAgICAgcmVzdWx0Lm1pbnpvb20gPSBhcmNnaXNMT0RzWzBdLmxldmVsO1xuICAgICAgICAgICAgcmVzdWx0Lm1heHpvb20gPSBhcmNnaXNMT0RzW2FyY2dpc0xPRHMubGVuZ3RoIC0gMV0ubGV2ZWw7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFyY2dpc0xPRHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhcmNnaXNMT0QgPSBhcmNnaXNMT0RzW2ldO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgY2kgaW4gY29ycmVjdFJlc29sdXRpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvcnJlY3RSZXMgPSBjb3JyZWN0UmVzb2x1dGlvbnNbY2ldO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChfd2l0aGluUGVyY2VudGFnZShhcmNnaXNMT0QucmVzb2x1dGlvbiwgY29ycmVjdFJlcywgem9vbU9mZnNldEFsbG93YW5jZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5fbG9kTWFwW2NpXSA9IGFyY2dpc0xPRC5sZXZlbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FsbGJhY2sobmV3IEVycm9yKCdub24tbWVyY2F0b3Igc3BhdGlhbCByZWZlcmVuY2UnKSk7XG4gICAgICAgIH1cblxuICAgICAgICBjYWxsYmFjayhudWxsLCByZXN1bHQpO1xuICAgIH07XG5cbiAgICBpZiAob3B0aW9ucy51cmwpIHtcbiAgICAgICAgZ2V0SlNPTih7dXJsOiBvcHRpb25zLnVybH0sIGxvYWRlZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYnJvd3Nlci5mcmFtZShsb2FkZWQuYmluZChudWxsLCBudWxsLCBvcHRpb25zKSk7XG4gICAgfVxufTtcbiIsIi8vIEBmbG93XG5cbmltcG9ydCB7IHdyYXAgfSBmcm9tICcuLi91dGlsL3V0aWwnO1xuaW1wb3J0IExuZ0xhdEJvdW5kcyBmcm9tICcuL2xuZ19sYXRfYm91bmRzJztcblxuLyoqXG4gKiBBIGBMbmdMYXRgIG9iamVjdCByZXByZXNlbnRzIGEgZ2l2ZW4gbG9uZ2l0dWRlIGFuZCBsYXRpdHVkZSBjb29yZGluYXRlLCBtZWFzdXJlZCBpbiBkZWdyZWVzLlxuICpcbiAqIE1hcGJveCBHTCB1c2VzIGxvbmdpdHVkZSwgbGF0aXR1ZGUgY29vcmRpbmF0ZSBvcmRlciAoYXMgb3Bwb3NlZCB0byBsYXRpdHVkZSwgbG9uZ2l0dWRlKSB0byBtYXRjaCBHZW9KU09OLlxuICpcbiAqIE5vdGUgdGhhdCBhbnkgTWFwYm94IEdMIG1ldGhvZCB0aGF0IGFjY2VwdHMgYSBgTG5nTGF0YCBvYmplY3QgYXMgYW4gYXJndW1lbnQgb3Igb3B0aW9uXG4gKiBjYW4gYWxzbyBhY2NlcHQgYW4gYEFycmF5YCBvZiB0d28gbnVtYmVycyBhbmQgd2lsbCBwZXJmb3JtIGFuIGltcGxpY2l0IGNvbnZlcnNpb24uXG4gKiBUaGlzIGZsZXhpYmxlIHR5cGUgaXMgZG9jdW1lbnRlZCBhcyB7QGxpbmsgTG5nTGF0TGlrZX0uXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IGxuZyBMb25naXR1ZGUsIG1lYXN1cmVkIGluIGRlZ3JlZXMuXG4gKiBAcGFyYW0ge251bWJlcn0gbGF0IExhdGl0dWRlLCBtZWFzdXJlZCBpbiBkZWdyZWVzLlxuICogQGV4YW1wbGVcbiAqIHZhciBsbCA9IG5ldyBtYXBib3hnbC5MbmdMYXQoLTczLjk3NDksIDQwLjc3MzYpO1xuICogQHNlZSBbR2V0IGNvb3JkaW5hdGVzIG9mIHRoZSBtb3VzZSBwb2ludGVyXShodHRwczovL3d3dy5tYXBib3guY29tL21hcGJveC1nbC1qcy9leGFtcGxlL21vdXNlLXBvc2l0aW9uLylcbiAqIEBzZWUgW0Rpc3BsYXkgYSBwb3B1cF0oaHR0cHM6Ly93d3cubWFwYm94LmNvbS9tYXBib3gtZ2wtanMvZXhhbXBsZS9wb3B1cC8pXG4gKiBAc2VlIFtIaWdobGlnaHQgZmVhdHVyZXMgd2l0aGluIGEgYm91bmRpbmcgYm94XShodHRwczovL3d3dy5tYXBib3guY29tL21hcGJveC1nbC1qcy9leGFtcGxlL3VzaW5nLWJveC1xdWVyeXJlbmRlcmVkZmVhdHVyZXMvKVxuICogQHNlZSBbQ3JlYXRlIGEgdGltZWxpbmUgYW5pbWF0aW9uXShodHRwczovL3d3dy5tYXBib3guY29tL21hcGJveC1nbC1qcy9leGFtcGxlL3RpbWVsaW5lLWFuaW1hdGlvbi8pXG4gKi9cbmNsYXNzIExuZ0xhdCB7XG4gICAgbG5nOiBudW1iZXI7XG4gICAgbGF0OiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3Rvcihsbmc6IG51bWJlciwgbGF0OiBudW1iZXIpIHtcbiAgICAgICAgaWYgKGlzTmFOKGxuZykgfHwgaXNOYU4obGF0KSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIExuZ0xhdCBvYmplY3Q6ICgke2xuZ30sICR7bGF0fSlgKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxuZyA9ICtsbmc7XG4gICAgICAgIHRoaXMubGF0ID0gK2xhdDtcbiAgICAgICAgaWYgKHRoaXMubGF0ID4gOTAgfHwgdGhpcy5sYXQgPCAtOTApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBMbmdMYXQgbGF0aXR1ZGUgdmFsdWU6IG11c3QgYmUgYmV0d2VlbiAtOTAgYW5kIDkwJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgbmV3IGBMbmdMYXRgIG9iamVjdCB3aG9zZSBsb25naXR1ZGUgaXMgd3JhcHBlZCB0byB0aGUgcmFuZ2UgKC0xODAsIDE4MCkuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7TG5nTGF0fSBUaGUgd3JhcHBlZCBgTG5nTGF0YCBvYmplY3QuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB2YXIgbGwgPSBuZXcgbWFwYm94Z2wuTG5nTGF0KDI4Ni4wMjUxLCA0MC43NzM2KTtcbiAgICAgKiB2YXIgd3JhcHBlZCA9IGxsLndyYXAoKTtcbiAgICAgKiB3cmFwcGVkLmxuZzsgLy8gPSAtNzMuOTc0OVxuICAgICAqL1xuICAgIHdyYXAoKSB7XG4gICAgICAgIHJldHVybiBuZXcgTG5nTGF0KHdyYXAodGhpcy5sbmcsIC0xODAsIDE4MCksIHRoaXMubGF0KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBjb29yZGluYXRlcyByZXByZXNlbnRlZCBhcyBhbiBhcnJheSBvZiB0d28gbnVtYmVycy5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtBcnJheTxudW1iZXI+fSBUaGUgY29vcmRpbmF0ZXMgcmVwcmVzZXRlZCBhcyBhbiBhcnJheSBvZiBsb25naXR1ZGUgYW5kIGxhdGl0dWRlLlxuICAgICAqIEBleGFtcGxlXG4gICAgICogdmFyIGxsID0gbmV3IG1hcGJveGdsLkxuZ0xhdCgtNzMuOTc0OSwgNDAuNzczNik7XG4gICAgICogbGwudG9BcnJheSgpOyAvLyA9IFstNzMuOTc0OSwgNDAuNzczNl1cbiAgICAgKi9cbiAgICB0b0FycmF5KCkge1xuICAgICAgICByZXR1cm4gW3RoaXMubG5nLCB0aGlzLmxhdF07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgY29vcmRpbmF0ZXMgcmVwcmVzZW50IGFzIGEgc3RyaW5nLlxuICAgICAqXG4gICAgICogQHJldHVybnMge3N0cmluZ30gVGhlIGNvb3JkaW5hdGVzIHJlcHJlc2VudGVkIGFzIGEgc3RyaW5nIG9mIHRoZSBmb3JtYXQgYCdMbmdMYXQobG5nLCBsYXQpJ2AuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB2YXIgbGwgPSBuZXcgbWFwYm94Z2wuTG5nTGF0KC03My45NzQ5LCA0MC43NzM2KTtcbiAgICAgKiBsbC50b1N0cmluZygpOyAvLyA9IFwiTG5nTGF0KC03My45NzQ5LCA0MC43NzM2KVwiXG4gICAgICovXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBgTG5nTGF0KCR7dGhpcy5sbmd9LCAke3RoaXMubGF0fSlgO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBgTG5nTGF0Qm91bmRzYCBmcm9tIHRoZSBjb29yZGluYXRlcyBleHRlbmRlZCBieSBhIGdpdmVuIGByYWRpdXNgLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtyYWRpdXM9MF0gRGlzdGFuY2UgaW4gbWV0ZXJzIGZyb20gdGhlIGNvb3JkaW5hdGVzIHRvIGV4dGVuZCB0aGUgYm91bmRzLlxuICAgICAqIEByZXR1cm5zIHtMbmdMYXRCb3VuZHN9IEEgbmV3IGBMbmdMYXRCb3VuZHNgIG9iamVjdCByZXByZXNlbnRpbmcgdGhlIGNvb3JkaW5hdGVzIGV4dGVuZGVkIGJ5IHRoZSBgcmFkaXVzYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHZhciBsbCA9IG5ldyBtYXBib3hnbC5MbmdMYXQoLTczLjk3NDksIDQwLjc3MzYpO1xuICAgICAqIGxsLnRvQm91bmRzKDEwMCkudG9BcnJheSgpOyAvLyA9IFtbLTczLjk3NTAxODYyMTQxMzI4LCA0MC43NzM1MTAxNjg0NzIyOV0sIFstNzMuOTc0NzgxMzc4NTg2NzMsIDQwLjc3MzY4OTgzMTUyNzcxXV1cbiAgICAgKi9cbiAgICB0b0JvdW5kcyhyYWRpdXM/OiBudW1iZXIgPSAwKSB7XG4gICAgICAgIGNvbnN0IGVhcnRoQ2lyY3VtZmVyZW5jZUluTWV0ZXJzQXRFcXVhdG9yID0gNDAwNzUwMTc7XG4gICAgICAgIGNvbnN0IGxhdEFjY3VyYWN5ID0gMzYwICogcmFkaXVzIC8gZWFydGhDaXJjdW1mZXJlbmNlSW5NZXRlcnNBdEVxdWF0b3IsXG4gICAgICAgICAgICBsbmdBY2N1cmFjeSA9IGxhdEFjY3VyYWN5IC8gTWF0aC5jb3MoKE1hdGguUEkgLyAxODApICogdGhpcy5sYXQpO1xuXG4gICAgICAgIHJldHVybiBuZXcgTG5nTGF0Qm91bmRzKG5ldyBMbmdMYXQodGhpcy5sbmcgLSBsbmdBY2N1cmFjeSwgdGhpcy5sYXQgLSBsYXRBY2N1cmFjeSksXG4gICAgICAgICAgICBuZXcgTG5nTGF0KHRoaXMubG5nICsgbG5nQWNjdXJhY3ksIHRoaXMubGF0ICsgbGF0QWNjdXJhY3kpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0cyBhbiBhcnJheSBvZiB0d28gbnVtYmVycyBvciBhbiBvYmplY3Qgd2l0aCBgbG5nYCBhbmQgYGxhdGAgb3IgYGxvbmAgYW5kIGBsYXRgIHByb3BlcnRpZXNcbiAgICAgKiB0byBhIGBMbmdMYXRgIG9iamVjdC5cbiAgICAgKlxuICAgICAqIElmIGEgYExuZ0xhdGAgb2JqZWN0IGlzIHBhc3NlZCBpbiwgdGhlIGZ1bmN0aW9uIHJldHVybnMgaXQgdW5jaGFuZ2VkLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtMbmdMYXRMaWtlfSBpbnB1dCBBbiBhcnJheSBvZiB0d28gbnVtYmVycyBvciBvYmplY3QgdG8gY29udmVydCwgb3IgYSBgTG5nTGF0YCBvYmplY3QgdG8gcmV0dXJuLlxuICAgICAqIEByZXR1cm5zIHtMbmdMYXR9IEEgbmV3IGBMbmdMYXRgIG9iamVjdCwgaWYgYSBjb252ZXJzaW9uIG9jY3VycmVkLCBvciB0aGUgb3JpZ2luYWwgYExuZ0xhdGAgb2JqZWN0LlxuICAgICAqIEBleGFtcGxlXG4gICAgICogdmFyIGFyciA9IFstNzMuOTc0OSwgNDAuNzczNl07XG4gICAgICogdmFyIGxsID0gbWFwYm94Z2wuTG5nTGF0LmNvbnZlcnQoYXJyKTtcbiAgICAgKiBsbDsgICAvLyA9IExuZ0xhdCB7bG5nOiAtNzMuOTc0OSwgbGF0OiA0MC43NzM2fVxuICAgICAqL1xuICAgIHN0YXRpYyBjb252ZXJ0KGlucHV0OiBMbmdMYXRMaWtlKTogTG5nTGF0IHtcbiAgICAgICAgaWYgKGlucHV0IGluc3RhbmNlb2YgTG5nTGF0KSB7XG4gICAgICAgICAgICByZXR1cm4gaW5wdXQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoaW5wdXQpICYmIChpbnB1dC5sZW5ndGggPT09IDIgfHwgaW5wdXQubGVuZ3RoID09PSAzKSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBMbmdMYXQoTnVtYmVyKGlucHV0WzBdKSwgTnVtYmVyKGlucHV0WzFdKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGlucHV0KSAmJiB0eXBlb2YgaW5wdXQgPT09ICdvYmplY3QnICYmIGlucHV0ICE9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IExuZ0xhdChcbiAgICAgICAgICAgICAgICAvLyBmbG93IGNhbid0IHJlZmluZSB0aGlzIHRvIGhhdmUgb25lIG9mIGxuZyBvciBsYXQsIHNvIHdlIGhhdmUgdG8gY2FzdCB0byBhbnlcbiAgICAgICAgICAgICAgICBOdW1iZXIoJ2xuZycgaW4gaW5wdXQgPyAoaW5wdXQ6IGFueSkubG5nIDogKGlucHV0OiBhbnkpLmxvbiksXG4gICAgICAgICAgICAgICAgTnVtYmVyKGlucHV0LmxhdClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiYExuZ0xhdExpa2VgIGFyZ3VtZW50IG11c3QgYmUgc3BlY2lmaWVkIGFzIGEgTG5nTGF0IGluc3RhbmNlLCBhbiBvYmplY3Qge2xuZzogPGxuZz4sIGxhdDogPGxhdD59LCBhbiBvYmplY3Qge2xvbjogPGxuZz4sIGxhdDogPGxhdD59LCBvciBhbiBhcnJheSBvZiBbPGxuZz4sIDxsYXQ+XVwiKTtcbiAgICB9XG59XG5cbi8qKlxuICogQSB7QGxpbmsgTG5nTGF0fSBvYmplY3QsIGFuIGFycmF5IG9mIHR3byBudW1iZXJzIHJlcHJlc2VudGluZyBsb25naXR1ZGUgYW5kIGxhdGl0dWRlLFxuICogb3IgYW4gb2JqZWN0IHdpdGggYGxuZ2AgYW5kIGBsYXRgIG9yIGBsb25gIGFuZCBgbGF0YCBwcm9wZXJ0aWVzLlxuICpcbiAqIEB0eXBlZGVmIHtMbmdMYXQgfCB7bG5nOiBudW1iZXIsIGxhdDogbnVtYmVyfSB8IHtsb246IG51bWJlciwgbGF0OiBudW1iZXJ9IHwgW251bWJlciwgbnVtYmVyXX0gTG5nTGF0TGlrZVxuICogQGV4YW1wbGVcbiAqIHZhciB2MSA9IG5ldyBtYXBib3hnbC5MbmdMYXQoLTEyMi40MjA2NzksIDM3Ljc3MjUzNyk7XG4gKiB2YXIgdjIgPSBbLTEyMi40MjA2NzksIDM3Ljc3MjUzN107XG4gKiB2YXIgdjMgPSB7bG9uOiAtMTIyLjQyMDY3OSwgbGF0OiAzNy43NzI1Mzd9O1xuICovXG5leHBvcnQgdHlwZSBMbmdMYXRMaWtlID0gTG5nTGF0IHwge2xuZzogbnVtYmVyLCBsYXQ6IG51bWJlcn0gfCB7bG9uOiBudW1iZXIsIGxhdDogbnVtYmVyfSB8IFtudW1iZXIsIG51bWJlcl07XG5cbmV4cG9ydCBkZWZhdWx0IExuZ0xhdDtcbiIsIi8vIEBmbG93XG5cbmltcG9ydCBMbmdMYXQgZnJvbSAnLi9sbmdfbGF0JztcblxuaW1wb3J0IHR5cGUge0xuZ0xhdExpa2V9IGZyb20gJy4vbG5nX2xhdCc7XG5cbi8qKlxuICogQSBgTG5nTGF0Qm91bmRzYCBvYmplY3QgcmVwcmVzZW50cyBhIGdlb2dyYXBoaWNhbCBib3VuZGluZyBib3gsXG4gKiBkZWZpbmVkIGJ5IGl0cyBzb3V0aHdlc3QgYW5kIG5vcnRoZWFzdCBwb2ludHMgaW4gbG9uZ2l0dWRlIGFuZCBsYXRpdHVkZS5cbiAqXG4gKiBJZiBubyBhcmd1bWVudHMgYXJlIHByb3ZpZGVkIHRvIHRoZSBjb25zdHJ1Y3RvciwgYSBgbnVsbGAgYm91bmRpbmcgYm94IGlzIGNyZWF0ZWQuXG4gKlxuICogTm90ZSB0aGF0IGFueSBNYXBib3ggR0wgbWV0aG9kIHRoYXQgYWNjZXB0cyBhIGBMbmdMYXRCb3VuZHNgIG9iamVjdCBhcyBhbiBhcmd1bWVudCBvciBvcHRpb25cbiAqIGNhbiBhbHNvIGFjY2VwdCBhbiBgQXJyYXlgIG9mIHR3byB7QGxpbmsgTG5nTGF0TGlrZX0gY29uc3RydWN0cyBhbmQgd2lsbCBwZXJmb3JtIGFuIGltcGxpY2l0IGNvbnZlcnNpb24uXG4gKiBUaGlzIGZsZXhpYmxlIHR5cGUgaXMgZG9jdW1lbnRlZCBhcyB7QGxpbmsgTG5nTGF0Qm91bmRzTGlrZX0uXG4gKlxuICogQHBhcmFtIHtMbmdMYXRMaWtlfSBbc3ddIFRoZSBzb3V0aHdlc3QgY29ybmVyIG9mIHRoZSBib3VuZGluZyBib3guXG4gKiBAcGFyYW0ge0xuZ0xhdExpa2V9IFtuZV0gVGhlIG5vcnRoZWFzdCBjb3JuZXIgb2YgdGhlIGJvdW5kaW5nIGJveC5cbiAqIEBleGFtcGxlXG4gKiB2YXIgc3cgPSBuZXcgbWFwYm94Z2wuTG5nTGF0KC03My45ODc2LCA0MC43NjYxKTtcbiAqIHZhciBuZSA9IG5ldyBtYXBib3hnbC5MbmdMYXQoLTczLjkzOTcsIDQwLjgwMDIpO1xuICogdmFyIGxsYiA9IG5ldyBtYXBib3hnbC5MbmdMYXRCb3VuZHMoc3csIG5lKTtcbiAqL1xuY2xhc3MgTG5nTGF0Qm91bmRzIHtcbiAgICBfbmU6IExuZ0xhdDtcbiAgICBfc3c6IExuZ0xhdDtcblxuICAgIC8vIFRoaXMgY29uc3RydWN0b3IgaXMgdG9vIGZsZXhpYmxlIHRvIHR5cGUuIEl0IHNob3VsZCBub3QgYmUgc28gZmxleGlibGUuXG4gICAgY29uc3RydWN0b3Ioc3c6IGFueSwgbmU6IGFueSkge1xuICAgICAgICBpZiAoIXN3KSB7XG4gICAgICAgICAgICAvLyBub29wXG4gICAgICAgIH0gZWxzZSBpZiAobmUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U291dGhXZXN0KHN3KS5zZXROb3J0aEVhc3QobmUpO1xuICAgICAgICB9IGVsc2UgaWYgKHN3Lmxlbmd0aCA9PT0gNCkge1xuICAgICAgICAgICAgdGhpcy5zZXRTb3V0aFdlc3QoW3N3WzBdLCBzd1sxXV0pLnNldE5vcnRoRWFzdChbc3dbMl0sIHN3WzNdXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldFNvdXRoV2VzdChzd1swXSkuc2V0Tm9ydGhFYXN0KHN3WzFdKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgbm9ydGhlYXN0IGNvcm5lciBvZiB0aGUgYm91bmRpbmcgYm94XG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0xuZ0xhdExpa2V9IG5lXG4gICAgICogQHJldHVybnMge0xuZ0xhdEJvdW5kc30gYHRoaXNgXG4gICAgICovXG4gICAgc2V0Tm9ydGhFYXN0KG5lOiBMbmdMYXRMaWtlKSB7XG4gICAgICAgIHRoaXMuX25lID0gbmUgaW5zdGFuY2VvZiBMbmdMYXQgPyBuZXcgTG5nTGF0KG5lLmxuZywgbmUubGF0KSA6IExuZ0xhdC5jb252ZXJ0KG5lKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IHRoZSBzb3V0aHdlc3QgY29ybmVyIG9mIHRoZSBib3VuZGluZyBib3hcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7TG5nTGF0TGlrZX0gc3dcbiAgICAgKiBAcmV0dXJucyB7TG5nTGF0Qm91bmRzfSBgdGhpc2BcbiAgICAgKi9cbiAgICBzZXRTb3V0aFdlc3Qoc3c6IExuZ0xhdExpa2UpIHtcbiAgICAgICAgdGhpcy5fc3cgPSBzdyBpbnN0YW5jZW9mIExuZ0xhdCA/IG5ldyBMbmdMYXQoc3cubG5nLCBzdy5sYXQpIDogTG5nTGF0LmNvbnZlcnQoc3cpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFeHRlbmQgdGhlIGJvdW5kcyB0byBpbmNsdWRlIGEgZ2l2ZW4gTG5nTGF0IG9yIExuZ0xhdEJvdW5kcy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7TG5nTGF0fExuZ0xhdEJvdW5kc30gb2JqIG9iamVjdCB0byBleHRlbmQgdG9cbiAgICAgKiBAcmV0dXJucyB7TG5nTGF0Qm91bmRzfSBgdGhpc2BcbiAgICAgKi9cbiAgICBleHRlbmQob2JqOiBMbmdMYXQgfCBMbmdMYXRCb3VuZHMpIHtcbiAgICAgICAgY29uc3Qgc3cgPSB0aGlzLl9zdyxcbiAgICAgICAgICAgIG5lID0gdGhpcy5fbmU7XG4gICAgICAgIGxldCBzdzIsIG5lMjtcblxuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgTG5nTGF0KSB7XG4gICAgICAgICAgICBzdzIgPSBvYmo7XG4gICAgICAgICAgICBuZTIgPSBvYmo7XG5cbiAgICAgICAgfSBlbHNlIGlmIChvYmogaW5zdGFuY2VvZiBMbmdMYXRCb3VuZHMpIHtcbiAgICAgICAgICAgIHN3MiA9IG9iai5fc3c7XG4gICAgICAgICAgICBuZTIgPSBvYmouX25lO1xuXG4gICAgICAgICAgICBpZiAoIXN3MiB8fCAhbmUyKSByZXR1cm4gdGhpcztcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkob2JqKSkge1xuICAgICAgICAgICAgICAgIGlmIChvYmouZXZlcnkoQXJyYXkuaXNBcnJheSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXh0ZW5kKExuZ0xhdEJvdW5kcy5jb252ZXJ0KG9iaikpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmV4dGVuZChMbmdMYXQuY29udmVydChvYmopKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghc3cgJiYgIW5lKSB7XG4gICAgICAgICAgICB0aGlzLl9zdyA9IG5ldyBMbmdMYXQoc3cyLmxuZywgc3cyLmxhdCk7XG4gICAgICAgICAgICB0aGlzLl9uZSA9IG5ldyBMbmdMYXQobmUyLmxuZywgbmUyLmxhdCk7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN3LmxuZyA9IE1hdGgubWluKHN3Mi5sbmcsIHN3LmxuZyk7XG4gICAgICAgICAgICBzdy5sYXQgPSBNYXRoLm1pbihzdzIubGF0LCBzdy5sYXQpO1xuICAgICAgICAgICAgbmUubG5nID0gTWF0aC5tYXgobmUyLmxuZywgbmUubG5nKTtcbiAgICAgICAgICAgIG5lLmxhdCA9IE1hdGgubWF4KG5lMi5sYXQsIG5lLmxhdCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBnZW9ncmFwaGljYWwgY29vcmRpbmF0ZSBlcXVpZGlzdGFudCBmcm9tIHRoZSBib3VuZGluZyBib3gncyBjb3JuZXJzLlxuICAgICAqXG4gICAgICogQHJldHVybnMge0xuZ0xhdH0gVGhlIGJvdW5kaW5nIGJveCdzIGNlbnRlci5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHZhciBsbGIgPSBuZXcgbWFwYm94Z2wuTG5nTGF0Qm91bmRzKFstNzMuOTg3NiwgNDAuNzY2MV0sIFstNzMuOTM5NywgNDAuODAwMl0pO1xuICAgICAqIGxsYi5nZXRDZW50ZXIoKTsgLy8gPSBMbmdMYXQge2xuZzogLTczLjk2MzY1LCBsYXQ6IDQwLjc4MzE1fVxuICAgICAqL1xuICAgIGdldENlbnRlcigpOiBMbmdMYXQge1xuICAgICAgICByZXR1cm4gbmV3IExuZ0xhdCgodGhpcy5fc3cubG5nICsgdGhpcy5fbmUubG5nKSAvIDIsICh0aGlzLl9zdy5sYXQgKyB0aGlzLl9uZS5sYXQpIC8gMik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgc291dGh3ZXN0IGNvcm5lciBvZiB0aGUgYm91bmRpbmcgYm94LlxuICAgICAqXG4gICAgICogQHJldHVybnMge0xuZ0xhdH0gVGhlIHNvdXRod2VzdCBjb3JuZXIgb2YgdGhlIGJvdW5kaW5nIGJveC5cbiAgICAgKi9cbiAgICBnZXRTb3V0aFdlc3QoKTogTG5nTGF0IHsgcmV0dXJuIHRoaXMuX3N3OyB9XG5cbiAgICAvKipcbiAgICAqIFJldHVybnMgdGhlIG5vcnRoZWFzdCBjb3JuZXIgb2YgdGhlIGJvdW5kaW5nIGJveC5cbiAgICAqXG4gICAgKiBAcmV0dXJucyB7TG5nTGF0fSBUaGUgbm9ydGhlYXN0IGNvcm5lciBvZiB0aGUgYm91bmRpbmcgYm94LlxuICAgICAqL1xuICAgIGdldE5vcnRoRWFzdCgpOiBMbmdMYXQgeyByZXR1cm4gdGhpcy5fbmU7IH1cblxuICAgIC8qKlxuICAgICogUmV0dXJucyB0aGUgbm9ydGh3ZXN0IGNvcm5lciBvZiB0aGUgYm91bmRpbmcgYm94LlxuICAgICpcbiAgICAqIEByZXR1cm5zIHtMbmdMYXR9IFRoZSBub3J0aHdlc3QgY29ybmVyIG9mIHRoZSBib3VuZGluZyBib3guXG4gICAgICovXG4gICAgZ2V0Tm9ydGhXZXN0KCk6IExuZ0xhdCB7IHJldHVybiBuZXcgTG5nTGF0KHRoaXMuZ2V0V2VzdCgpLCB0aGlzLmdldE5vcnRoKCkpOyB9XG5cbiAgICAvKipcbiAgICAqIFJldHVybnMgdGhlIHNvdXRoZWFzdCBjb3JuZXIgb2YgdGhlIGJvdW5kaW5nIGJveC5cbiAgICAqXG4gICAgKiBAcmV0dXJucyB7TG5nTGF0fSBUaGUgc291dGhlYXN0IGNvcm5lciBvZiB0aGUgYm91bmRpbmcgYm94LlxuICAgICAqL1xuICAgIGdldFNvdXRoRWFzdCgpOiBMbmdMYXQgeyByZXR1cm4gbmV3IExuZ0xhdCh0aGlzLmdldEVhc3QoKSwgdGhpcy5nZXRTb3V0aCgpKTsgfVxuXG4gICAgLyoqXG4gICAgKiBSZXR1cm5zIHRoZSB3ZXN0IGVkZ2Ugb2YgdGhlIGJvdW5kaW5nIGJveC5cbiAgICAqXG4gICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgd2VzdCBlZGdlIG9mIHRoZSBib3VuZGluZyBib3guXG4gICAgICovXG4gICAgZ2V0V2VzdCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fc3cubG5nOyB9XG5cbiAgICAvKipcbiAgICAqIFJldHVybnMgdGhlIHNvdXRoIGVkZ2Ugb2YgdGhlIGJvdW5kaW5nIGJveC5cbiAgICAqXG4gICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgc291dGggZWRnZSBvZiB0aGUgYm91bmRpbmcgYm94LlxuICAgICAqL1xuICAgIGdldFNvdXRoKCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9zdy5sYXQ7IH1cblxuICAgIC8qKlxuICAgICogUmV0dXJucyB0aGUgZWFzdCBlZGdlIG9mIHRoZSBib3VuZGluZyBib3guXG4gICAgKlxuICAgICogQHJldHVybnMge251bWJlcn0gVGhlIGVhc3QgZWRnZSBvZiB0aGUgYm91bmRpbmcgYm94LlxuICAgICAqL1xuICAgIGdldEVhc3QoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX25lLmxuZzsgfVxuXG4gICAgLyoqXG4gICAgKiBSZXR1cm5zIHRoZSBub3J0aCBlZGdlIG9mIHRoZSBib3VuZGluZyBib3guXG4gICAgKlxuICAgICogQHJldHVybnMge251bWJlcn0gVGhlIG5vcnRoIGVkZ2Ugb2YgdGhlIGJvdW5kaW5nIGJveC5cbiAgICAgKi9cbiAgICBnZXROb3J0aCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fbmUubGF0OyB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBib3VuZGluZyBib3ggcmVwcmVzZW50ZWQgYXMgYW4gYXJyYXkuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7QXJyYXk8QXJyYXk8bnVtYmVyPj59IFRoZSBib3VuZGluZyBib3ggcmVwcmVzZW50ZWQgYXMgYW4gYXJyYXksIGNvbnNpc3Rpbmcgb2YgdGhlXG4gICAgICogICBzb3V0aHdlc3QgYW5kIG5vcnRoZWFzdCBjb29yZGluYXRlcyBvZiB0aGUgYm91bmRpbmcgcmVwcmVzZW50ZWQgYXMgYXJyYXlzIG9mIG51bWJlcnMuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB2YXIgbGxiID0gbmV3IG1hcGJveGdsLkxuZ0xhdEJvdW5kcyhbLTczLjk4NzYsIDQwLjc2NjFdLCBbLTczLjkzOTcsIDQwLjgwMDJdKTtcbiAgICAgKiBsbGIudG9BcnJheSgpOyAvLyA9IFtbLTczLjk4NzYsIDQwLjc2NjFdLCBbLTczLjkzOTcsIDQwLjgwMDJdXVxuICAgICAqL1xuICAgIHRvQXJyYXkoKSB7XG4gICAgICAgIHJldHVybiBbdGhpcy5fc3cudG9BcnJheSgpLCB0aGlzLl9uZS50b0FycmF5KCldO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybiB0aGUgYm91bmRpbmcgYm94IHJlcHJlc2VudGVkIGFzIGEgc3RyaW5nLlxuICAgICAqXG4gICAgICogQHJldHVybnMge3N0cmluZ30gVGhlIGJvdW5kaW5nIGJveCByZXByZXNlbnRzIGFzIGEgc3RyaW5nIG9mIHRoZSBmb3JtYXRcbiAgICAgKiAgIGAnTG5nTGF0Qm91bmRzKExuZ0xhdChsbmcsIGxhdCksIExuZ0xhdChsbmcsIGxhdCkpJ2AuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB2YXIgbGxiID0gbmV3IG1hcGJveGdsLkxuZ0xhdEJvdW5kcyhbLTczLjk4NzYsIDQwLjc2NjFdLCBbLTczLjkzOTcsIDQwLjgwMDJdKTtcbiAgICAgKiBsbGIudG9TdHJpbmcoKTsgLy8gPSBcIkxuZ0xhdEJvdW5kcyhMbmdMYXQoLTczLjk4NzYsIDQwLjc2NjEpLCBMbmdMYXQoLTczLjkzOTcsIDQwLjgwMDIpKVwiXG4gICAgICovXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBgTG5nTGF0Qm91bmRzKCR7dGhpcy5fc3cudG9TdHJpbmcoKX0sICR7dGhpcy5fbmUudG9TdHJpbmcoKX0pYDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiB0aGUgYm91bmRpbmcgYm94IGlzIGFuIGVtcHR5L2BudWxsYC10eXBlIGJveC5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIGJvdW5kcyBoYXZlIGJlZW4gZGVmaW5lZCwgb3RoZXJ3aXNlIGZhbHNlLlxuICAgICAqL1xuICAgIGlzRW1wdHkoKSB7XG4gICAgICAgIHJldHVybiAhKHRoaXMuX3N3ICYmIHRoaXMuX25lKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0cyBhbiBhcnJheSB0byBhIGBMbmdMYXRCb3VuZHNgIG9iamVjdC5cbiAgICAgKlxuICAgICAqIElmIGEgYExuZ0xhdEJvdW5kc2Agb2JqZWN0IGlzIHBhc3NlZCBpbiwgdGhlIGZ1bmN0aW9uIHJldHVybnMgaXQgdW5jaGFuZ2VkLlxuICAgICAqXG4gICAgICogSW50ZXJuYWxseSwgdGhlIGZ1bmN0aW9uIGNhbGxzIGBMbmdMYXQjY29udmVydGAgdG8gY29udmVydCBhcnJheXMgdG8gYExuZ0xhdGAgdmFsdWVzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtMbmdMYXRCb3VuZHNMaWtlfSBpbnB1dCBBbiBhcnJheSBvZiB0d28gY29vcmRpbmF0ZXMgdG8gY29udmVydCwgb3IgYSBgTG5nTGF0Qm91bmRzYCBvYmplY3QgdG8gcmV0dXJuLlxuICAgICAqIEByZXR1cm5zIHtMbmdMYXRCb3VuZHN9IEEgbmV3IGBMbmdMYXRCb3VuZHNgIG9iamVjdCwgaWYgYSBjb252ZXJzaW9uIG9jY3VycmVkLCBvciB0aGUgb3JpZ2luYWwgYExuZ0xhdEJvdW5kc2Agb2JqZWN0LlxuICAgICAqIEBleGFtcGxlXG4gICAgICogdmFyIGFyciA9IFtbLTczLjk4NzYsIDQwLjc2NjFdLCBbLTczLjkzOTcsIDQwLjgwMDJdXTtcbiAgICAgKiB2YXIgbGxiID0gbWFwYm94Z2wuTG5nTGF0Qm91bmRzLmNvbnZlcnQoYXJyKTtcbiAgICAgKiBsbGI7ICAgLy8gPSBMbmdMYXRCb3VuZHMge19zdzogTG5nTGF0IHtsbmc6IC03My45ODc2LCBsYXQ6IDQwLjc2NjF9LCBfbmU6IExuZ0xhdCB7bG5nOiAtNzMuOTM5NywgbGF0OiA0MC44MDAyfX1cbiAgICAgKi9cbiAgICBzdGF0aWMgY29udmVydChpbnB1dDogTG5nTGF0Qm91bmRzTGlrZSk6IExuZ0xhdEJvdW5kcyB7XG4gICAgICAgIGlmICghaW5wdXQgfHwgaW5wdXQgaW5zdGFuY2VvZiBMbmdMYXRCb3VuZHMpIHJldHVybiBpbnB1dDtcbiAgICAgICAgcmV0dXJuIG5ldyBMbmdMYXRCb3VuZHMoaW5wdXQpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBBIHtAbGluayBMbmdMYXRCb3VuZHN9IG9iamVjdCwgYW4gYXJyYXkgb2Yge0BsaW5rIExuZ0xhdExpa2V9IG9iamVjdHMgaW4gW3N3LCBuZV0gb3JkZXIsXG4gKiBvciBhbiBhcnJheSBvZiBudW1iZXJzIGluIFt3ZXN0LCBzb3V0aCwgZWFzdCwgbm9ydGhdIG9yZGVyLlxuICpcbiAqIEB0eXBlZGVmIHtMbmdMYXRCb3VuZHMgfCBbTG5nTGF0TGlrZSwgTG5nTGF0TGlrZV0gfCBbbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyXX0gTG5nTGF0Qm91bmRzTGlrZVxuICogQGV4YW1wbGVcbiAqIHZhciB2MSA9IG5ldyBtYXBib3hnbC5MbmdMYXRCb3VuZHMoXG4gKiAgIG5ldyBtYXBib3hnbC5MbmdMYXQoLTczLjk4NzYsIDQwLjc2NjEpLFxuICogICBuZXcgbWFwYm94Z2wuTG5nTGF0KC03My45Mzk3LCA0MC44MDAyKVxuICogKTtcbiAqIHZhciB2MiA9IG5ldyBtYXBib3hnbC5MbmdMYXRCb3VuZHMoWy03My45ODc2LCA0MC43NjYxXSwgWy03My45Mzk3LCA0MC44MDAyXSlcbiAqIHZhciB2MyA9IFtbLTczLjk4NzYsIDQwLjc2NjFdLCBbLTczLjkzOTcsIDQwLjgwMDJdXTtcbiAqL1xuZXhwb3J0IHR5cGUgTG5nTGF0Qm91bmRzTGlrZSA9IExuZ0xhdEJvdW5kcyB8IFtMbmdMYXRMaWtlLCBMbmdMYXRMaWtlXSB8IFtudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXJdO1xuXG5leHBvcnQgZGVmYXVsdCBMbmdMYXRCb3VuZHM7XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgTG5nTGF0IGZyb20gJy4uL2dlby9sbmdfbGF0JztcbmltcG9ydCB0eXBlIHtMbmdMYXRMaWtlfSBmcm9tICcuLi9nZW8vbG5nX2xhdCc7XG5cbi8qXG4gKiBUaGUgY2lyY3VtZmVyZW5jZSBvZiB0aGUgd29ybGQgaW4gbWV0ZXJzIGF0IHRoZSBnaXZlbiBsYXRpdHVkZS5cbiAqL1xuZnVuY3Rpb24gY2lyY3VtZmVyZW5jZUF0TGF0aXR1ZGUobGF0aXR1ZGU6IG51bWJlcikge1xuICAgIGNvbnN0IGNpcmN1bWZlcmVuY2UgPSAyICogTWF0aC5QSSAqIDYzNzgxMzc7XG4gICAgcmV0dXJuIGNpcmN1bWZlcmVuY2UgKiBNYXRoLmNvcyhsYXRpdHVkZSAqIE1hdGguUEkgLyAxODApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWVyY2F0b3JYZnJvbUxuZyhsbmc6IG51bWJlcikge1xuICAgIHJldHVybiAoMTgwICsgbG5nKSAvIDM2MDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1lcmNhdG9yWWZyb21MYXQobGF0OiBudW1iZXIpIHtcbiAgICByZXR1cm4gKDE4MCAtICgxODAgLyBNYXRoLlBJICogTWF0aC5sb2coTWF0aC50YW4oTWF0aC5QSSAvIDQgKyBsYXQgKiBNYXRoLlBJIC8gMzYwKSkpKSAvIDM2MDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1lcmNhdG9yWmZyb21BbHRpdHVkZShhbHRpdHVkZTogbnVtYmVyLCBsYXQ6IG51bWJlcikge1xuICAgIHJldHVybiBhbHRpdHVkZSAvIGNpcmN1bWZlcmVuY2VBdExhdGl0dWRlKGxhdCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsbmdGcm9tTWVyY2F0b3JYKHg6IG51bWJlcikge1xuICAgIHJldHVybiB4ICogMzYwIC0gMTgwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbGF0RnJvbU1lcmNhdG9yWSh5OiBudW1iZXIpIHtcbiAgICBjb25zdCB5MiA9IDE4MCAtIHkgKiAzNjA7XG4gICAgcmV0dXJuIDM2MCAvIE1hdGguUEkgKiBNYXRoLmF0YW4oTWF0aC5leHAoeTIgKiBNYXRoLlBJIC8gMTgwKSkgLSA5MDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFsdGl0dWRlRnJvbU1lcmNhdG9yWih6OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgIHJldHVybiB6ICogY2lyY3VtZmVyZW5jZUF0TGF0aXR1ZGUobGF0RnJvbU1lcmNhdG9yWSh5KSk7XG59XG5cbi8qKlxuICogQSBgTWVyY2F0b3JDb29yZGluYXRlYCBvYmplY3QgcmVwcmVzZW50cyBhIHByb2plY3RlZCB0aHJlZSBkaW1lbnNpb25hbCBwb3NpdGlvbi5cbiAqXG4gKiBgTWVyY2F0b3JDb29yZGluYXRlYCB1c2VzIHRoZSB3ZWIgbWVyY2F0b3IgcHJvamVjdGlvbiAoW0VQU0c6Mzg1N10oaHR0cHM6Ly9lcHNnLmlvLzM4NTcpKSB3aXRoIHNsaWdodGx5IGRpZmZlcmVudCB1bml0czpcbiAqIC0gdGhlIHNpemUgb2YgMSB1bml0IGlzIHRoZSB3aWR0aCBvZiB0aGUgcHJvamVjdGVkIHdvcmxkIGluc3RlYWQgb2YgdGhlIFwibWVyY2F0b3IgbWV0ZXJcIlxuICogLSB0aGUgb3JpZ2luIG9mIHRoZSBjb29yZGluYXRlIHNwYWNlIGlzIGF0IHRoZSBub3J0aC13ZXN0IGNvcm5lciBpbnN0ZWFkIG9mIHRoZSBtaWRkbGVcbiAqXG4gKiBGb3IgZXhhbXBsZSwgYE1lcmNhdG9yQ29vcmRpbmF0ZSgwLCAwLCAwKWAgaXMgdGhlIG5vcnRoLXdlc3QgY29ybmVyIG9mIHRoZSBtZXJjYXRvciB3b3JsZCBhbmRcbiAqIGBNZXJjYXRvckNvb3JkaW5hdGUoMSwgMSwgMClgIGlzIHRoZSBzb3V0aC1lYXN0IGNvcm5lci4gSWYgeW91IGFyZSBmYW1pbGlhciB3aXRoXG4gKiBbdmVjdG9yIHRpbGVzXShodHRwczovL2dpdGh1Yi5jb20vbWFwYm94L3ZlY3Rvci10aWxlLXNwZWMpIGl0IG1heSBiZSBoZWxwZnVsIHRvIHRoaW5rXG4gKiBvZiB0aGUgY29vcmRpbmF0ZSBzcGFjZSBhcyB0aGUgYDAvMC8wYCB0aWxlIHdpdGggYW4gZXh0ZW50IG9mIGAxYC5cbiAqXG4gKiBUaGUgYHpgIGRpbWVuc2lvbiBvZiBgTWVyY2F0b3JDb29yZGluYXRlYCBpcyBjb25mb3JtYWwuIEEgY3ViZSBpbiB0aGUgbWVyY2F0b3IgY29vcmRpbmF0ZSBzcGFjZSB3b3VsZCBiZSByZW5kZXJlZCBhcyBhIGN1YmUuXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IHggVGhlIHggY29tcG9uZW50IG9mIHRoZSBwb3NpdGlvbi5cbiAqIEBwYXJhbSB7bnVtYmVyfSB5IFRoZSB5IGNvbXBvbmVudCBvZiB0aGUgcG9zaXRpb24uXG4gKiBAcGFyYW0ge251bWJlcn0geiBUaGUgeiBjb21wb25lbnQgb2YgdGhlIHBvc2l0aW9uLlxuICogQGV4YW1wbGVcbiAqIHZhciBudWxsSXNsYW5kID0gbmV3IG1hcGJveGdsLk1lcmNhdG9yQ29vcmRpbmF0ZSgwLjUsIDAuNSwgMCk7XG4gKlxuICogQHNlZSBbQWRkIGEgY3VzdG9tIHN0eWxlIGxheWVyXShodHRwczovL3d3dy5tYXBib3guY29tL21hcGJveC1nbC1qcy9leGFtcGxlL2N1c3RvbS1zdHlsZS1sYXllci8pXG4gKi9cbmNsYXNzIE1lcmNhdG9yQ29vcmRpbmF0ZSB7XG4gICAgeDogbnVtYmVyO1xuICAgIHk6IG51bWJlcjtcbiAgICB6OiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyID0gMCkge1xuICAgICAgICB0aGlzLnggPSAreDtcbiAgICAgICAgdGhpcy55ID0gK3k7XG4gICAgICAgIHRoaXMueiA9ICt6O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFByb2plY3QgYSBgTG5nTGF0YCB0byBhIGBNZXJjYXRvckNvb3JkaW5hdGVgLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtMbmdMYXRMaWtlfSBsbmdMYXRMaWtlIFRoZSBsb2NhdGlvbiB0byBwcm9qZWN0LlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBhbHRpdHVkZSBUaGUgYWx0aXR1ZGUgaW4gbWV0ZXJzIG9mIHRoZSBwb3NpdGlvbi5cbiAgICAgKiBAcmV0dXJucyB7TWVyY2F0b3JDb29yZGluYXRlfSBUaGUgcHJvamVjdGVkIG1lcmNhdG9yIGNvb3JkaW5hdGUuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB2YXIgY29vcmQgPSBtYXBib3hnbC5NZXJjYXRvckNvb3JkaW5hdGUuZnJvbUxuZ0xhdCh7IGxuZzogMCwgbGF0OiAwfSwgMCk7XG4gICAgICogY29vcmQ7IC8vIE1lcmNhdG9yQ29vcmRpbmF0ZSgwLjUsIDAuNSwgMClcbiAgICAgKi9cbiAgICBzdGF0aWMgZnJvbUxuZ0xhdChsbmdMYXRMaWtlOiBMbmdMYXRMaWtlLCBhbHRpdHVkZTogbnVtYmVyID0gMCkge1xuICAgICAgICBjb25zdCBsbmdMYXQgPSBMbmdMYXQuY29udmVydChsbmdMYXRMaWtlKTtcblxuICAgICAgICByZXR1cm4gbmV3IE1lcmNhdG9yQ29vcmRpbmF0ZShcbiAgICAgICAgICAgICAgICBtZXJjYXRvclhmcm9tTG5nKGxuZ0xhdC5sbmcpLFxuICAgICAgICAgICAgICAgIG1lcmNhdG9yWWZyb21MYXQobG5nTGF0LmxhdCksXG4gICAgICAgICAgICAgICAgbWVyY2F0b3JaZnJvbUFsdGl0dWRlKGFsdGl0dWRlLCBsbmdMYXQubGF0KSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgYExuZ0xhdGAgZm9yIHRoZSBjb29yZGluYXRlLlxuICAgICAqXG4gICAgICogQHJldHVybnMge0xuZ0xhdH0gVGhlIGBMbmdMYXRgIG9iamVjdC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHZhciBjb29yZCA9IG5ldyBtYXBib3hnbC5NZXJjYXRvckNvb3JkaW5hdGUoMC41LCAwLjUsIDApO1xuICAgICAqIHZhciBsYXRMbmcgPSBjb29yZC50b0xuZ0xhdCgpOyAvLyBMbmdMYXQoMCwgMClcbiAgICAgKi9cbiAgICB0b0xuZ0xhdCgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBMbmdMYXQoXG4gICAgICAgICAgICAgICAgbG5nRnJvbU1lcmNhdG9yWCh0aGlzLngpLFxuICAgICAgICAgICAgICAgIGxhdEZyb21NZXJjYXRvclkodGhpcy55KSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgYWx0aXR1ZGUgaW4gbWV0ZXJzIG9mIHRoZSBjb29yZGluYXRlLlxuICAgICAqXG4gICAgICogQHJldHVybnMge251bWJlcn0gVGhlIGFsdGl0dWRlIGluIG1ldGVycy5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHZhciBjb29yZCA9IG5ldyBtYXBib3hnbC5NZXJjYXRvckNvb3JkaW5hdGUoMCwgMCwgMC4wMik7XG4gICAgICogY29vcmQudG9BbHRpdHVkZSgpOyAvLyA2OTE0LjI4MTk1NjI5NTMzOVxuICAgICAqL1xuICAgIHRvQWx0aXR1ZGUoKSB7XG4gICAgICAgIHJldHVybiBhbHRpdHVkZUZyb21NZXJjYXRvcloodGhpcy56LCB0aGlzLnkpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTWVyY2F0b3JDb29yZGluYXRlO1xuIiwiLy8gQGZsb3dcblxuaW1wb3J0IExuZ0xhdEJvdW5kcyBmcm9tICcuLi9nZW8vbG5nX2xhdF9ib3VuZHMnO1xuaW1wb3J0IHttZXJjYXRvclhmcm9tTG5nLCBtZXJjYXRvcllmcm9tTGF0fSBmcm9tICcuLi9nZW8vbWVyY2F0b3JfY29vcmRpbmF0ZSc7XG5cbmltcG9ydCB0eXBlIHtDYW5vbmljYWxUaWxlSUR9IGZyb20gJy4vdGlsZV9pZCc7XG5cbmNsYXNzIFRpbGVCb3VuZHMge1xuICAgIGJvdW5kczogTG5nTGF0Qm91bmRzO1xuICAgIG1pbnpvb206IG51bWJlcjtcbiAgICBtYXh6b29tOiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3Rvcihib3VuZHM6IFtudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXJdLCBtaW56b29tOiA/bnVtYmVyLCBtYXh6b29tOiA/bnVtYmVyKSB7XG4gICAgICAgIHRoaXMuYm91bmRzID0gTG5nTGF0Qm91bmRzLmNvbnZlcnQodGhpcy52YWxpZGF0ZUJvdW5kcyhib3VuZHMpKTtcbiAgICAgICAgdGhpcy5taW56b29tID0gbWluem9vbSB8fCAwO1xuICAgICAgICB0aGlzLm1heHpvb20gPSBtYXh6b29tIHx8IDI0O1xuICAgIH1cblxuICAgIHZhbGlkYXRlQm91bmRzKGJvdW5kczogW251bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlcl0pIHtcbiAgICAgICAgLy8gbWFrZSBzdXJlIHRoZSBib3VuZHMgcHJvcGVydHkgY29udGFpbnMgdmFsaWQgbG9uZ2l0dWRlIGFuZCBsYXRpdHVkZXNcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGJvdW5kcykgfHwgYm91bmRzLmxlbmd0aCAhPT0gNCkgcmV0dXJuIFstMTgwLCAtOTAsIDE4MCwgOTBdO1xuICAgICAgICByZXR1cm4gW01hdGgubWF4KC0xODAsIGJvdW5kc1swXSksIE1hdGgubWF4KC05MCwgYm91bmRzWzFdKSwgTWF0aC5taW4oMTgwLCBib3VuZHNbMl0pLCBNYXRoLm1pbig5MCwgYm91bmRzWzNdKV07XG4gICAgfVxuXG4gICAgY29udGFpbnModGlsZUlEOiBDYW5vbmljYWxUaWxlSUQpIHtcbiAgICAgICAgY29uc3Qgd29ybGRTaXplID0gTWF0aC5wb3coMiwgdGlsZUlELnopO1xuICAgICAgICBjb25zdCBsZXZlbCA9IHtcbiAgICAgICAgICAgIG1pblg6IE1hdGguZmxvb3IobWVyY2F0b3JYZnJvbUxuZyh0aGlzLmJvdW5kcy5nZXRXZXN0KCkpICogd29ybGRTaXplKSxcbiAgICAgICAgICAgIG1pblk6IE1hdGguZmxvb3IobWVyY2F0b3JZZnJvbUxhdCh0aGlzLmJvdW5kcy5nZXROb3J0aCgpKSAqIHdvcmxkU2l6ZSksXG4gICAgICAgICAgICBtYXhYOiBNYXRoLmNlaWwobWVyY2F0b3JYZnJvbUxuZyh0aGlzLmJvdW5kcy5nZXRFYXN0KCkpICogd29ybGRTaXplKSxcbiAgICAgICAgICAgIG1heFk6IE1hdGguY2VpbChtZXJjYXRvcllmcm9tTGF0KHRoaXMuYm91bmRzLmdldFNvdXRoKCkpICogd29ybGRTaXplKVxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBoaXQgPSB0aWxlSUQueCA+PSBsZXZlbC5taW5YICYmIHRpbGVJRC54IDwgbGV2ZWwubWF4WCAmJiB0aWxlSUQueSA+PSBsZXZlbC5taW5ZICYmIHRpbGVJRC55IDwgbGV2ZWwubWF4WTtcbiAgICAgICAgcmV0dXJuIGhpdDtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRpbGVCb3VuZHM7XG4iLCJcbi8vRnJvbSBodHRwczovL2dpdGh1Yi5jb20vTGVhZmxldC9MZWFmbGV0L2Jsb2IvbWFzdGVyL3NyYy9jb3JlL1V0aWwuanNcbmNvbnN0IF90ZW1wbGF0ZVJlID0gL1xceyAqKFtcXHdfXSspICpcXH0vZztcbmNvbnN0IF90ZW1wbGF0ZSA9IGZ1bmN0aW9uIChzdHIsIGRhdGEpIHtcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UoX3RlbXBsYXRlUmUsIChzdHIsIGtleSkgPT4ge1xuICAgICAgICBsZXQgdmFsdWUgPSBkYXRhW2tleV07XG5cbiAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTm8gdmFsdWUgcHJvdmlkZWQgZm9yIHZhcmlhYmxlICR7c3RyfWApO1xuXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlKGRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9KTtcbn07XG5cbi8vRnJvbSBodHRwczovL2dpdGh1Yi5jb20vTGVhZmxldC9MZWFmbGV0L2Jsb2IvbWFzdGVyL3NyYy9sYXllci90aWxlL1RpbGVMYXllci5qc1xuY29uc3QgX2dldFN1YmRvbWFpbiA9IGZ1bmN0aW9uICh0aWxlUG9pbnQsIHN1YmRvbWFpbnMpIHtcbiAgICBpZiAoc3ViZG9tYWlucykge1xuICAgICAgICBjb25zdCBpbmRleCA9IE1hdGguYWJzKHRpbGVQb2ludC54ICsgdGlsZVBvaW50LnkpICUgc3ViZG9tYWlucy5sZW5ndGg7XG4gICAgICAgIHJldHVybiBzdWJkb21haW5zW2luZGV4XTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59O1xuXG5leHBvcnQge1xuICAgIF90ZW1wbGF0ZSxcbiAgICBfZ2V0U3ViZG9tYWluXG59O1xuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHdpbmRvdyBmcm9tICcuLi91dGlsL3dpbmRvdyc7XG5jb25zdCB7IEhUTUxJbWFnZUVsZW1lbnQsIEhUTUxDYW52YXNFbGVtZW50LCBIVE1MVmlkZW9FbGVtZW50LCBJbWFnZURhdGEgfSA9IHdpbmRvdztcblxuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tICcuLi9nbC9jb250ZXh0JztcbmltcG9ydCB0eXBlIHtSR0JBSW1hZ2UsIEFscGhhSW1hZ2V9IGZyb20gJy4uL3V0aWwvaW1hZ2UnO1xuXG5leHBvcnQgdHlwZSBUZXh0dXJlRm9ybWF0ID1cbiAgICB8ICRQcm9wZXJ0eVR5cGU8V2ViR0xSZW5kZXJpbmdDb250ZXh0LCAnUkdCQSc+XG4gICAgfCAkUHJvcGVydHlUeXBlPFdlYkdMUmVuZGVyaW5nQ29udGV4dCwgJ0FMUEhBJz47XG5leHBvcnQgdHlwZSBUZXh0dXJlRmlsdGVyID1cbiAgICB8ICRQcm9wZXJ0eVR5cGU8V2ViR0xSZW5kZXJpbmdDb250ZXh0LCAnTElORUFSJz5cbiAgICB8ICRQcm9wZXJ0eVR5cGU8V2ViR0xSZW5kZXJpbmdDb250ZXh0LCAnTElORUFSX01JUE1BUF9ORUFSRVNUJz5cbiAgICB8ICRQcm9wZXJ0eVR5cGU8V2ViR0xSZW5kZXJpbmdDb250ZXh0LCAnTkVBUkVTVCc+O1xuZXhwb3J0IHR5cGUgVGV4dHVyZVdyYXAgPVxuICAgIHwgJFByb3BlcnR5VHlwZTxXZWJHTFJlbmRlcmluZ0NvbnRleHQsICdSRVBFQVQnPlxuICAgIHwgJFByb3BlcnR5VHlwZTxXZWJHTFJlbmRlcmluZ0NvbnRleHQsICdDTEFNUF9UT19FREdFJz5cbiAgICB8ICRQcm9wZXJ0eVR5cGU8V2ViR0xSZW5kZXJpbmdDb250ZXh0LCAnTUlSUk9SRURfUkVQRUFUJz47XG5cbnR5cGUgRW1wdHlJbWFnZSA9IHtcbiAgICB3aWR0aDogbnVtYmVyLFxuICAgIGhlaWdodDogbnVtYmVyLFxuICAgIGRhdGE6IG51bGxcbn1cblxuZXhwb3J0IHR5cGUgVGV4dHVyZUltYWdlID1cbiAgICB8IFJHQkFJbWFnZVxuICAgIHwgQWxwaGFJbWFnZVxuICAgIHwgSFRNTEltYWdlRWxlbWVudFxuICAgIHwgSFRNTENhbnZhc0VsZW1lbnRcbiAgICB8IEhUTUxWaWRlb0VsZW1lbnRcbiAgICB8IEltYWdlRGF0YVxuICAgIHwgRW1wdHlJbWFnZTtcblxuY2xhc3MgVGV4dHVyZSB7XG4gICAgY29udGV4dDogQ29udGV4dDtcbiAgICBzaXplOiBbbnVtYmVyLCBudW1iZXJdO1xuICAgIHRleHR1cmU6IFdlYkdMVGV4dHVyZTtcbiAgICBmb3JtYXQ6IFRleHR1cmVGb3JtYXQ7XG4gICAgZmlsdGVyOiA/VGV4dHVyZUZpbHRlcjtcbiAgICB3cmFwOiA/VGV4dHVyZVdyYXA7XG4gICAgdXNlTWlwbWFwOiBib29sZWFuO1xuXG4gICAgY29uc3RydWN0b3IoY29udGV4dDogQ29udGV4dCwgaW1hZ2U6IFRleHR1cmVJbWFnZSwgZm9ybWF0OiBUZXh0dXJlRm9ybWF0LCBvcHRpb25zOiA/eyBwcmVtdWx0aXBseT86IGJvb2xlYW4sIHVzZU1pcG1hcD86IGJvb2xlYW4gfSkge1xuICAgICAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuICAgICAgICB0aGlzLmZvcm1hdCA9IGZvcm1hdDtcbiAgICAgICAgdGhpcy50ZXh0dXJlID0gY29udGV4dC5nbC5jcmVhdGVUZXh0dXJlKCk7XG4gICAgICAgIHRoaXMudXBkYXRlKGltYWdlLCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICB1cGRhdGUoaW1hZ2U6IFRleHR1cmVJbWFnZSwgb3B0aW9uczogP3twcmVtdWx0aXBseT86IGJvb2xlYW4sIHVzZU1pcG1hcD86IGJvb2xlYW59LCBwb3NpdGlvbj86IHsgeDogbnVtYmVyLCB5OiBudW1iZXIgfSkge1xuICAgICAgICBjb25zdCB7d2lkdGgsIGhlaWdodH0gPSBpbWFnZTtcbiAgICAgICAgY29uc3QgcmVzaXplID0gKCF0aGlzLnNpemUgfHwgdGhpcy5zaXplWzBdICE9PSB3aWR0aCB8fCB0aGlzLnNpemVbMV0gIT09IGhlaWdodCkgJiYgIXBvc2l0aW9uO1xuICAgICAgICBjb25zdCB7Y29udGV4dH0gPSB0aGlzO1xuICAgICAgICBjb25zdCB7Z2x9ID0gY29udGV4dDtcblxuICAgICAgICB0aGlzLnVzZU1pcG1hcCA9IEJvb2xlYW4ob3B0aW9ucyAmJiBvcHRpb25zLnVzZU1pcG1hcCk7XG4gICAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRoaXMudGV4dHVyZSk7XG5cbiAgICAgICAgY29udGV4dC5waXhlbFN0b3JlVW5wYWNrRmxpcFkuc2V0KGZhbHNlKTtcbiAgICAgICAgY29udGV4dC5waXhlbFN0b3JlVW5wYWNrLnNldCgxKTtcbiAgICAgICAgY29udGV4dC5waXhlbFN0b3JlVW5wYWNrUHJlbXVsdGlwbHlBbHBoYS5zZXQodGhpcy5mb3JtYXQgPT09IGdsLlJHQkEgJiYgKCFvcHRpb25zIHx8IG9wdGlvbnMucHJlbXVsdGlwbHkgIT09IGZhbHNlKSk7XG5cbiAgICAgICAgaWYgKHJlc2l6ZSkge1xuICAgICAgICAgICAgdGhpcy5zaXplID0gW3dpZHRoLCBoZWlnaHRdO1xuXG4gICAgICAgICAgICBpZiAoaW1hZ2UgaW5zdGFuY2VvZiBIVE1MSW1hZ2VFbGVtZW50IHx8IGltYWdlIGluc3RhbmNlb2YgSFRNTENhbnZhc0VsZW1lbnQgfHwgaW1hZ2UgaW5zdGFuY2VvZiBIVE1MVmlkZW9FbGVtZW50IHx8IGltYWdlIGluc3RhbmNlb2YgSW1hZ2VEYXRhKSB7XG4gICAgICAgICAgICAgICAgZ2wudGV4SW1hZ2UyRChnbC5URVhUVVJFXzJELCAwLCB0aGlzLmZvcm1hdCwgdGhpcy5mb3JtYXQsIGdsLlVOU0lHTkVEX0JZVEUsIGltYWdlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZ2wudGV4SW1hZ2UyRChnbC5URVhUVVJFXzJELCAwLCB0aGlzLmZvcm1hdCwgd2lkdGgsIGhlaWdodCwgMCwgdGhpcy5mb3JtYXQsIGdsLlVOU0lHTkVEX0JZVEUsIGltYWdlLmRhdGEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCB7eCwgeX0gPSBwb3NpdGlvbiB8fCB7IHg6IDAsIHk6IDB9O1xuICAgICAgICAgICAgaWYgKGltYWdlIGluc3RhbmNlb2YgSFRNTEltYWdlRWxlbWVudCB8fCBpbWFnZSBpbnN0YW5jZW9mIEhUTUxDYW52YXNFbGVtZW50IHx8IGltYWdlIGluc3RhbmNlb2YgSFRNTFZpZGVvRWxlbWVudCB8fCBpbWFnZSBpbnN0YW5jZW9mIEltYWdlRGF0YSkge1xuICAgICAgICAgICAgICAgIGdsLnRleFN1YkltYWdlMkQoZ2wuVEVYVFVSRV8yRCwgMCwgeCwgeSwgZ2wuUkdCQSwgZ2wuVU5TSUdORURfQllURSwgaW1hZ2UpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBnbC50ZXhTdWJJbWFnZTJEKGdsLlRFWFRVUkVfMkQsIDAsIHgsIHksIHdpZHRoLCBoZWlnaHQsIGdsLlJHQkEsIGdsLlVOU0lHTkVEX0JZVEUsIGltYWdlLmRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMudXNlTWlwbWFwICYmIHRoaXMuaXNTaXplUG93ZXJPZlR3bygpKSB7XG4gICAgICAgICAgICBnbC5nZW5lcmF0ZU1pcG1hcChnbC5URVhUVVJFXzJEKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGJpbmQoZmlsdGVyOiBUZXh0dXJlRmlsdGVyLCB3cmFwOiBUZXh0dXJlV3JhcCwgbWluRmlsdGVyOiA/VGV4dHVyZUZpbHRlcikge1xuICAgICAgICBjb25zdCB7Y29udGV4dH0gPSB0aGlzO1xuICAgICAgICBjb25zdCB7Z2x9ID0gY29udGV4dDtcbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGhpcy50ZXh0dXJlKTtcblxuICAgICAgICBpZiAobWluRmlsdGVyID09PSBnbC5MSU5FQVJfTUlQTUFQX05FQVJFU1QgJiYgIXRoaXMuaXNTaXplUG93ZXJPZlR3bygpKSB7XG4gICAgICAgICAgICBtaW5GaWx0ZXIgPSBnbC5MSU5FQVI7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZmlsdGVyICE9PSB0aGlzLmZpbHRlcikge1xuICAgICAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01BR19GSUxURVIsIGZpbHRlcik7XG4gICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgbWluRmlsdGVyIHx8IGZpbHRlcik7XG4gICAgICAgICAgICB0aGlzLmZpbHRlciA9IGZpbHRlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh3cmFwICE9PSB0aGlzLndyYXApIHtcbiAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1MsIHdyYXApO1xuICAgICAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfVCwgd3JhcCk7XG4gICAgICAgICAgICB0aGlzLndyYXAgPSB3cmFwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaXNTaXplUG93ZXJPZlR3bygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2l6ZVswXSA9PT0gdGhpcy5zaXplWzFdICYmIChNYXRoLmxvZyh0aGlzLnNpemVbMF0pIC8gTWF0aC5MTjIpICUgMSA9PT0gMDtcbiAgICB9XG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgICBjb25zdCB7Z2x9ID0gdGhpcy5jb250ZXh0O1xuICAgICAgICBnbC5kZWxldGVUZXh0dXJlKHRoaXMudGV4dHVyZSk7XG4gICAgICAgIHRoaXMudGV4dHVyZSA9IChudWxsOiBhbnkpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVGV4dHVyZTtcbiIsIi8vIEBmbG93XG5cbmltcG9ydCB7IGV4dGVuZCwgcGljayB9IGZyb20gJ21hcGJveC1nbC9zcmMvdXRpbC91dGlsJztcbmltcG9ydCB7IGdldEltYWdlLCBSZXNvdXJjZVR5cGUgfSBmcm9tICdtYXBib3gtZ2wvc3JjL3V0aWwvYWpheCc7XG5pbXBvcnQgeyBFdmVudCwgRXJyb3JFdmVudCwgRXZlbnRlZCB9IGZyb20gJ21hcGJveC1nbC9zcmMvdXRpbC9ldmVudGVkJztcbmltcG9ydCBsb2FkQXJjR0lTTWFwU2VydmVyIGZyb20gJy4vbG9hZF9hcmNnaXNfbWFwc2VydmVyJztcbmltcG9ydCBUaWxlQm91bmRzIGZyb20gJ21hcGJveC1nbC9zcmMvc291cmNlL3RpbGVfYm91bmRzJztcbmltcG9ydCB7X3RlbXBsYXRlLCBfZ2V0U3ViZG9tYWlufSBmcm9tICcuL2hlbHBlcnMnO1xuaW1wb3J0IFRleHR1cmUgZnJvbSAnbWFwYm94LWdsL3NyYy9yZW5kZXIvdGV4dHVyZSc7XG5pbXBvcnQgeyBjYWNoZUVudHJ5UG9zc2libHlBZGRlZCB9IGZyb20gJ21hcGJveC1nbC9zcmMvdXRpbC90aWxlX3JlcXVlc3RfY2FjaGUnO1xuXG5pbXBvcnQgdHlwZSB7U291cmNlfSBmcm9tICdtYXBib3gtZ2wvc3JjL3NvdXJjZS9zb3VyY2UnO1xuaW1wb3J0IHR5cGUge092ZXJzY2FsZWRUaWxlSUR9IGZyb20gJ21hcGJveC1nbC9zcmMvc291cmNlL3RpbGVfaWQnO1xuaW1wb3J0IHR5cGUgTWFwIGZyb20gJ21hcGJveC1nbC9zcmMvdWkvbWFwJztcbmltcG9ydCB0eXBlIERpc3BhdGNoZXIgZnJvbSAnbWFwYm94LWdsL3NyYy91dGlsL2Rpc3BhdGNoZXInO1xuaW1wb3J0IHR5cGUgVGlsZSBmcm9tICdtYXBib3gtZ2wvc3JjL3NvdXJjZS90aWxlJztcbmltcG9ydCB0eXBlIHtDYWxsYmFja30gZnJvbSAnbWFwYm94LWdsL3NyYy90eXBlcy9jYWxsYmFjayc7XG5cbmNsYXNzIEFyY0dJU1RpbGVkTWFwU2VydmljZVNvdXJjZSBleHRlbmRzIEV2ZW50ZWQgaW1wbGVtZW50cyBTb3VyY2Uge1xuXG4gICAgdHlwZTogJ3Jhc3RlcicgfCAncmFzdGVyLWRlbSc7XG4gICAgaWQ6IHN0cmluZztcbiAgICBtaW56b29tOiBudW1iZXI7XG4gICAgbWF4em9vbTogbnVtYmVyO1xuICAgIHVybDogc3RyaW5nO1xuICAgIHNjaGVtZTogc3RyaW5nO1xuICAgIHRpbGVTaXplOiBudW1iZXI7XG5cbiAgICBib3VuZHM6ID9bbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyXTtcbiAgICB0aWxlQm91bmRzOiBUaWxlQm91bmRzO1xuICAgIHJvdW5kWm9vbTogYm9vbGVhbjtcbiAgICBkaXNwYXRjaGVyOiBEaXNwYXRjaGVyO1xuICAgIG1hcDogTWFwO1xuICAgIHRpbGVzOiBBcnJheTxzdHJpbmc+O1xuXG4gICAgX2xvYWRlZDogYm9vbGVhbjtcbiAgICBfb3B0aW9uczogUmFzdGVyU291cmNlU3BlY2lmaWNhdGlvbiB8IFJhc3RlckRFTVNvdXJjZVNwZWNpZmljYXRpb247XG5cbiAgICBjb25zdHJ1Y3RvcihpZDogc3RyaW5nLCBvcHRpb25zOiBSYXN0ZXJTb3VyY2VTcGVjaWZpY2F0aW9uIHwgUmFzdGVyREVNU291cmNlU3BlY2lmaWNhdGlvbiwgZGlzcGF0Y2hlcjogRGlzcGF0Y2hlciwgZXZlbnRlZFBhcmVudDogRXZlbnRlZCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmlkID0gaWQ7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlciA9IGRpc3BhdGNoZXI7XG4gICAgICAgIHRoaXMuc2V0RXZlbnRlZFBhcmVudChldmVudGVkUGFyZW50KTtcblxuICAgICAgICB0aGlzLnR5cGUgPSAnYXJjZ2lzcmFzdGVyJztcbiAgICAgICAgdGhpcy5taW56b29tID0gMDtcbiAgICAgICAgdGhpcy5tYXh6b29tID0gMjI7XG4gICAgICAgIHRoaXMucm91bmRab29tID0gdHJ1ZTtcbiAgICAgICAgdGhpcy50aWxlU2l6ZSA9IDUxMjtcbiAgICAgICAgdGhpcy5fbG9hZGVkID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5fb3B0aW9ucyA9IGV4dGVuZCh7fSwgb3B0aW9ucyk7XG4gICAgICAgIGV4dGVuZCh0aGlzLCBwaWNrKG9wdGlvbnMsIFsndXJsJywgJ3NjaGVtZScsICd0aWxlU2l6ZSddKSk7XG4gICAgfVxuXG4gICAgbG9hZCgpIHtcbiAgICAgICAgdGhpcy5maXJlKG5ldyBFdmVudCgnZGF0YWxvYWRpbmcnLCB7ZGF0YVR5cGU6ICdzb3VyY2UnfSkpO1xuICAgICAgICBsb2FkQXJjR0lTTWFwU2VydmVyKHRoaXMuX29wdGlvbnMsIChlcnIsIG1ldGFkYXRhKSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5maXJlKG5ldyBFcnJvckV2ZW50KGVycikpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChtZXRhZGF0YSkge1xuICAgICAgICAgICAgICAgIGV4dGVuZCh0aGlzLCBtZXRhZGF0YSk7XG5cbiAgICAgICAgICAgICAgICBpZiAobWV0YWRhdGEuYm91bmRzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGlsZUJvdW5kcyA9IG5ldyBUaWxlQm91bmRzKG1ldGFkYXRhLmJvdW5kcywgdGhpcy5taW56b29tLCB0aGlzLm1heHpvb20pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gYGNvbnRlbnRgIGlzIGluY2x1ZGVkIGhlcmUgdG8gcHJldmVudCBhIHJhY2UgY29uZGl0aW9uIHdoZXJlIGBTdHlsZSNfdXBkYXRlU291cmNlc2AgaXMgY2FsbGVkXG4gICAgICAgICAgICAvLyBiZWZvcmUgdGhlIFRpbGVKU09OIGFycml2ZXMuIHRoaXMgbWFrZXMgc3VyZSB0aGUgdGlsZXMgbmVlZGVkIGFyZSBsb2FkZWQgb25jZSBUaWxlSlNPTiBhcnJpdmVzXG4gICAgICAgICAgICAvLyByZWY6IGh0dHBzOi8vZ2l0aHViLmNvbS9tYXBib3gvbWFwYm94LWdsLWpzL3B1bGwvNDM0NyNkaXNjdXNzaW9uX3IxMDQ0MTgwODhcbiAgICAgICAgICAgIHRoaXMuZmlyZShuZXcgRXZlbnQoJ2RhdGEnLCB7ZGF0YVR5cGU6ICdzb3VyY2UnLCBzb3VyY2VEYXRhVHlwZTogJ21ldGFkYXRhJ30pKTtcbiAgICAgICAgICAgIHRoaXMuZmlyZShuZXcgRXZlbnQoJ2RhdGEnLCB7ZGF0YVR5cGU6ICdzb3VyY2UnLCBzb3VyY2VEYXRhVHlwZTogJ2NvbnRlbnQnfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBvbkFkZChtYXA6IE1hcCkge1xuICAgICAgICAvLyBzZXQgdGhlIHVybHNcbiAgICAgICAgY29uc3QgYmFzZVVybCA9IHRoaXMudXJsLnNwbGl0KCc/JylbMF07XG4gICAgICAgIHRoaXMudGlsZVVybCA9IGAke2Jhc2VVcmx9L3RpbGUve3p9L3t5fS97eH1gO1xuXG4gICAgICAgIGNvbnN0IGFyY2dpc29ubGluZSA9IG5ldyBSZWdFeHAoL3RpbGVzLmFyY2dpcyhvbmxpbmUpP1xcLmNvbS9nKTtcbiAgICAgICAgaWYgKGFyY2dpc29ubGluZS50ZXN0KHRoaXMudXJsKSkge1xuICAgICAgICAgICAgdGhpcy50aWxlVXJsID0gdGhpcy50aWxlVXJsLnJlcGxhY2UoJzovL3RpbGVzJywgJzovL3RpbGVze3N9Jyk7XG4gICAgICAgICAgICB0aGlzLnN1YmRvbWFpbnMgPSBbJzEnLCAnMicsICczJywgJzQnXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnRva2VuKSB7XG4gICAgICAgICAgICB0aGlzLnRpbGVVcmwgKz0gKGA/dG9rZW49JHt0aGlzLnRva2VufWApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0aGlzLm1hcCA9IG1hcDtcbiAgICAgICAgdGhpcy5sb2FkKCk7XG4gICAgfVxuXG4gICAgb25SZW1vdmUoKSB7XG5cbiAgICB9XG5cbiAgICBzZXJpYWxpemUoKSB7XG4gICAgICAgIHJldHVybiBleHRlbmQoe30sIHRoaXMuX29wdGlvbnMpO1xuICAgIH1cblxuICAgIGhhc1RpbGUodGlsZUlEOiBPdmVyc2NhbGVkVGlsZUlEKSB7XG4gICAgICAgIHJldHVybiAhdGhpcy50aWxlQm91bmRzIHx8IHRoaXMudGlsZUJvdW5kcy5jb250YWlucyh0aWxlSUQuY2Fub25pY2FsKTtcbiAgICB9XG5cbiAgICBsb2FkVGlsZSh0aWxlOiBUaWxlLCBjYWxsYmFjazogQ2FsbGJhY2s8dm9pZD4pIHtcbiAgICAgICAgLy9jb252ZXJ0IHRvIGFncyBjb29yZHNcbiAgICAgICAgY29uc3QgdGlsZVBvaW50ID0geyB6OiB0aWxlLnRpbGVJRC5vdmVyc2NhbGVkWiwgeDogdGlsZS50aWxlSUQuY2Fub25pY2FsLngsIHk6IHRpbGUudGlsZUlELmNhbm9uaWNhbC55IH07XG5cbiAgICAgICAgY29uc3QgdXJsID0gIF90ZW1wbGF0ZSh0aGlzLnRpbGVVcmwsIGV4dGVuZCh7XG4gICAgICAgICAgICBzOiBfZ2V0U3ViZG9tYWluKHRpbGVQb2ludCwgdGhpcy5zdWJkb21haW5zKSxcbiAgICAgICAgICAgIHo6ICh0aGlzLl9sb2RNYXAgJiYgdGhpcy5fbG9kTWFwW3RpbGVQb2ludC56XSkgPyB0aGlzLl9sb2RNYXBbdGlsZVBvaW50LnpdIDogdGlsZVBvaW50LnosIC8vIHRyeSBsb2QgbWFwIGZpcnN0LCB0aGVuIGp1c3QgZGVmdWFsdCB0byB6b29tIGxldmVsXG4gICAgICAgICAgICB4OiB0aWxlUG9pbnQueCxcbiAgICAgICAgICAgIHk6IHRpbGVQb2ludC55XG4gICAgICAgIH0sIHRoaXMub3B0aW9ucykpO1xuICAgICAgICB0aWxlLnJlcXVlc3QgPSBnZXRJbWFnZSh7dXJsfSwgIChlcnIsIGltZykgPT4ge1xuICAgICAgICAgICAgZGVsZXRlIHRpbGUucmVxdWVzdDtcblxuICAgICAgICAgICAgaWYgKHRpbGUuYWJvcnRlZCkge1xuICAgICAgICAgICAgICAgIHRpbGUuc3RhdGUgPSAndW5sb2FkZWQnO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICB0aWxlLnN0YXRlID0gJ2Vycm9yZWQnO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGltZykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1hcC5fcmVmcmVzaEV4cGlyZWRUaWxlcykgdGlsZS5zZXRFeHBpcnlEYXRhKGltZyk7XG4gICAgICAgICAgICAgICAgZGVsZXRlIChpbWc6IGFueSkuY2FjaGVDb250cm9sO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSAoaW1nOiBhbnkpLmV4cGlyZXM7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBjb250ZXh0ID0gdGhpcy5tYXAucGFpbnRlci5jb250ZXh0O1xuICAgICAgICAgICAgICAgIGNvbnN0IGdsID0gY29udGV4dC5nbDtcbiAgICAgICAgICAgICAgICB0aWxlLnRleHR1cmUgPSB0aGlzLm1hcC5wYWludGVyLmdldFRpbGVUZXh0dXJlKGltZy53aWR0aCk7XG4gICAgICAgICAgICAgICAgaWYgKHRpbGUudGV4dHVyZSkge1xuICAgICAgICAgICAgICAgICAgICB0aWxlLnRleHR1cmUudXBkYXRlKGltZywgeyB1c2VNaXBtYXA6IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGlsZS50ZXh0dXJlID0gbmV3IFRleHR1cmUoY29udGV4dCwgaW1nLCBnbC5SR0JBLCB7IHVzZU1pcG1hcDogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgdGlsZS50ZXh0dXJlLmJpbmQoZ2wuTElORUFSLCBnbC5DTEFNUF9UT19FREdFLCBnbC5MSU5FQVJfTUlQTUFQX05FQVJFU1QpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChjb250ZXh0LmV4dFRleHR1cmVGaWx0ZXJBbmlzb3Ryb3BpYykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2wudGV4UGFyYW1ldGVyZihnbC5URVhUVVJFXzJELCBjb250ZXh0LmV4dFRleHR1cmVGaWx0ZXJBbmlzb3Ryb3BpYy5URVhUVVJFX01BWF9BTklTT1RST1BZX0VYVCwgY29udGV4dC5leHRUZXh0dXJlRmlsdGVyQW5pc290cm9waWNNYXgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGlsZS5zdGF0ZSA9ICdsb2FkZWQnO1xuICAgICAgICAgICAgICAgIGNhY2hlRW50cnlQb3NzaWJseUFkZGVkKHRoaXMuZGlzcGF0Y2hlcik7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFib3J0VGlsZSh0aWxlOiBUaWxlLCBjYWxsYmFjazogQ2FsbGJhY2s8dm9pZD4pIHtcbiAgICAgICAgaWYgKHRpbGUucmVxdWVzdCkge1xuICAgICAgICAgICAgdGlsZS5yZXF1ZXN0LmNhbmNlbCgpO1xuICAgICAgICAgICAgZGVsZXRlIHRpbGUucmVxdWVzdDtcbiAgICAgICAgfVxuICAgICAgICBjYWxsYmFjaygpO1xuICAgIH1cblxuICAgIHVubG9hZFRpbGUodGlsZTogVGlsZSwgY2FsbGJhY2s6IENhbGxiYWNrPHZvaWQ+KSB7XG4gICAgICAgIGlmICh0aWxlLnRleHR1cmUpIHRoaXMubWFwLnBhaW50ZXIuc2F2ZVRpbGVUZXh0dXJlKHRpbGUudGV4dHVyZSk7XG4gICAgICAgIGNhbGxiYWNrKCk7XG4gICAgfVxuXG4gICAgaGFzVHJhbnNpdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQXJjR0lTVGlsZWRNYXBTZXJ2aWNlU291cmNlOyJdLCJuYW1lcyI6WyJsZXQiLCJjb25zdCIsIlVuaXRCZXppZXIiLCJ3aW5kb3ciLCJleHBvcnRlZCIsImJyb3dzZXIiLCJ3ZWJwU3VwcG9ydGVkIiwidmVyc2lvbiIsInV1aWQiLCJzZGtWZXJzaW9uIiwidGhpcyIsInN1cGVyIiwibGlzdGVuZXIiLCJTcGhlcmljYWxNZXJjYXRvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTRCQSxjQUFjLEdBQUcsVUFBVSxDQUFDOztBQUU1QixTQUFTLFVBQVUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUU7O0lBRXBDLElBQUksQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztJQUNwQixJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztJQUN0QyxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7O0lBRWxDLElBQUksQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztJQUNwQixJQUFJLENBQUMsRUFB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QU8sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDdkQ7Ozs7Ozs7O0lBUUQsTUFBTSxFQUFFLFNBQVMsS0FBSyxFQUFFO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQztlQUNsQixJQUFJLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUM7S0FDN0I7Ozs7Ozs7SUFPRCxJQUFJLEVBQUUsU0FBUyxDQUFDLEVBQUU7UUFDZCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ3JDOzs7Ozs7Ozs7SUFTRCxPQUFPLEVBQUUsU0FBUyxDQUFDLEVBQUU7UUFDakIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztZQUNqQixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3RCLE9BQU8sRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0tBQzVCOzs7Ozs7O0lBT0QsS0FBSyxFQUFFLFdBQVc7UUFDZCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDckM7Ozs7Ozs7SUFPRCxPQUFPLEVBQUUsU0FBUyxDQUFDLEVBQUU7UUFDakIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNqRDs7Ozs7OztJQU9ELFNBQVMsRUFBRSxTQUFTLENBQUMsRUFBRTtRQUNuQixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMs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QUNkLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ25FLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ3ZCLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7SUFDcEQsQ0FBQyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUNyQixDQUFDLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDOzs7SUFHckIsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztHQUNmLE1BQU07SUFDTCxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3RCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ25FLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDOUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsR0FBRyxH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LENBQUM7O0lBRTlCLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO0lBQ3JGLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO0lBQ3JGLElBQUksTUFBTSxHQUFHO1FBQ1QsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7UUFDL0QsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7UUFDL0QsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7UUFDN0IsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7S0FDaEMsQ0FBQztJQUNGLElBQUksU0FBUyxFQUFFO1FBQ1gsSUFBSSxHQUFHLEdBQUc7WUFDTixJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxD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
