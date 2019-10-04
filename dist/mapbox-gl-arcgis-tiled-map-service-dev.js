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

var reducedMotionQuery                ;

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
        return {cancel: function () { return cancel(frame); }};
    },

    getImageData: function getImageData(img                   , padding)            {
        if ( padding === void 0 ) padding          = 0;

        var canvas = self.document.createElement('canvas');
        var context = canvas.getContext('2d');
        if (!context) {
            throw new Error('failed to create canvas 2d context');
        }
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0, img.width, img.height);
        return context.getImageData(-padding, -padding, img.width + 2 * padding, img.height + 2 * padding);
    },

    resolveURL: function resolveURL(path        ) {
        if (!linkEl) { linkEl = self.document.createElement('a'); }
        linkEl.href = path;
        return linkEl.href;
    },

    hardwareConcurrency: self.navigator.hardwareConcurrency || 4,

    get devicePixelRatio() { return self.devicePixelRatio; },
    get prefersReducedMotion()          {
        if (!self.matchMedia) { return false; }
        //Lazily initialize media query
        if (reducedMotionQuery == null) {
            reducedMotionQuery = self.matchMedia('(prefers-reduced-motion: reduce)');
        }
        return reducedMotionQuery.matches;
    },
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

    return {token: token, tokenExpiresAt: tokenExpiresAt};
}

/***** END WARNING - REMOVAL OR MODIFICATION OF THE
PRECEDING CODE VIOLATES THE MAPBOX TERMS OF SERVICE  ******/

var _from = "mapbox-gl@1.4.0";
var _id = "mapbox-gl@1.4.0";
var _inBundle = false;
var _integrity = "sha512-4nXRXanISou8oWLU7DH1ZetKvCJR9XtnMlQQ4Ia80wjghIHc5ljmAV/loNCI2UAGyuKINc7QcTiwUXrjE+Kv4w==";
var _location = "/mapbox-gl";
var _phantomChildren = {
};
var _requested = {
	type: "version",
	registry: true,
	raw: "mapbox-gl@1.4.0",
	name: "mapbox-gl",
	escapedName: "mapbox-gl",
	rawSpec: "1.4.0",
	saveSpec: null,
	fetchSpec: "1.4.0"
};
var _requiredBy = [
	"#DEV:/",
	"#USER"
];
var _resolved = "https://registry.npmjs.org/mapbox-gl/-/mapbox-gl-1.4.0.tgz";
var _shasum = "6ec3c3a8f07b7ca632e99e2ea6458cef89fa776c";
var _spec = "mapbox-gl@1.4.0";
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
	earcut: "^2.2.0",
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
	"@mapbox/flow-remove-types": "^1.3.0-await.upstream.2",
	"@mapbox/gazetteer": "^3.1.2",
	"@mapbox/mapbox-gl-rtl-text": "^0.2.1",
	"@mapbox/mapbox-gl-test-suite": "file:test/integration",
	"@octokit/rest": "^15.15.1",
	"babel-eslint": "^10.0.1",
	browserify: "^16.2.3",
	d3: "^4.12.0",
	documentation: "~12.1.1",
	ejs: "^2.5.7",
	eslint: "^5.15.3",
	"eslint-config-mourner": "^3.0.0",
	"eslint-plugin-flowtype": "^3.9.1",
	"eslint-plugin-html": "^5.0.5",
	"eslint-plugin-import": "^2.16.0",
	"eslint-plugin-react": "^7.12.4",
	esm: "~3.0.84",
	"flow-bin": "^0.100.0",
	gl: "~4.3.3",
	glob: "^7.1.4",
	"is-builtin-module": "^3.0.0",
	jsdom: "^13.0.0",
	"json-stringify-pretty-compact": "^2.0.0",
	jsonwebtoken: "^8.3.0",
	"mock-geolocation": "^1.0.11",
	"npm-run-all": "^4.1.5",
	nyc: "^13.3.0",
	pirates: "^4.0.1",
	pngjs: "^3.4.0",
	"postcss-cli": "^6.1.2",
	"postcss-inline-svg": "^3.1.1",
	"pretty-bytes": "^5.1.0",
	puppeteer: "^1.18.0",
	react: "^16.8.6",
	"react-dom": "^16.8.6",
	request: "^2.88.0",
	rollup: "^1.16.4",
	"rollup-plugin-buble": "^0.19.8",
	"rollup-plugin-commonjs": "^10.0.1",
	"rollup-plugin-json": "^4.0.0",
	"rollup-plugin-node-resolve": "^5.2.0",
	"rollup-plugin-replace": "^2.2.0",
	"rollup-plugin-sourcemaps": "^0.4.2",
	"rollup-plugin-terser": "^5.0.0",
	"rollup-plugin-unassert": "^0.3.0",
	sinon: "^7.3.2",
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
	"build-benchmarks": "BENCHMARK_VERSION=${BENCHMARK_VERSION:-\"$(git rev-parse --abbrev-ref HEAD) $(git rev-parse --short=7 HEAD)\"} rollup -c bench/versions/rollup_config_benchmarks.js",
	"build-csp": "rollup -c rollup.config.csp.js",
	"build-css": "postcss -o dist/mapbox-gl.css src/css/mapbox-gl.css",
	"build-dev": "rollup -c --environment BUILD:dev",
	"build-flow-types": "cp build/mapbox-gl.js.flow dist/mapbox-gl.js.flow && cp build/mapbox-gl.js.flow dist/mapbox-gl-dev.js.flow",
	"build-prod": "rollup -c --environment BUILD:production",
	"build-prod-min": "rollup -c --environment BUILD:production,MINIFY:true",
	"build-style-spec": "cd src/style-spec && npm run build && cd ../.. && mkdir -p dist/style-spec && cp src/style-spec/dist/* dist/style-spec",
	"build-token": "node build/generate-access-token-script.js",
	codegen: "build/run-node build/generate-style-code.js && build/run-node build/generate-struct-arrays.js",
	lint: "eslint --cache --ignore-path .gitignore src test bench debug/*.html",
	"lint-css": "stylelint 'src/css/mapbox-gl.css'",
	"lint-docs": "documentation lint src/index.js",
	prepublishOnly: "run-s build-flow-types build-dev build-prod-min build-prod build-csp build-css build-style-spec test-build",
	start: "run-p build-token watch-css watch-dev watch-benchmarks start-server",
	"start-bench": "run-p build-token watch-benchmarks start-server",
	"start-debug": "run-p build-token watch-css watch-dev start-server",
	"start-docs": "run-s build-prod-min build-css build-docs && NODE_OPTIONS=\"--max_old_space_size=2048\" DEPLOY_ENV=local batfish start",
	"start-server": "st --no-cache -H 0.0.0.0 --port 9966 --index index.html .",
	test: "run-s lint lint-css lint-docs test-flow test-unit",
	"test-build": "build/run-tap --no-coverage test/build/**/*.test.js",
	"test-cov": "nyc --require=@mapbox/flow-remove-types/register --reporter=text-summary --reporter=lcov --cache run-s test-unit test-expressions test-query test-render",
	"test-expressions": "build/run-node test/expression.test.js",
	"test-flow": "build/run-node build/generate-flow-typed-style-spec && flow .",
	"test-query": "node test/query.test.js",
	"test-render": "node --max-old-space-size=2048 test/render.test.js",
	"test-suite": "run-s test-render test-query test-expressions",
	"test-suite-clean": "find test/integration/{render,query, expressions}-tests -mindepth 2 -type d -exec test -e \"{}/actual.png\" \\; -not \\( -exec test -e \"{}/style.json\" \\; \\) -print | xargs -t rm -r",
	"test-unit": "build/run-tap --reporter classic --no-coverage test/unit",
	"watch-benchmarks": "BENCHMARK_VERSION=${BENCHMARK_VERSION:-\"$(git rev-parse --abbrev-ref HEAD) $(git rev-parse --short=7 HEAD)\"} rollup -c bench/rollup_config_benchmarks.js -w",
	"watch-css": "postcss --watch -o dist/mapbox-gl.css src/css/mapbox-gl.css",
	"watch-dev": "rollup -c --environment BUILD:dev --watch"
};
var style = "dist/mapbox-gl.css";
var version = "1.4.0";
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

                                              
                                                    
                                                

                                                   
                                                                                                           

                   
                     
                      
                 
                         
   

var RequestManager = function RequestManager(transformRequestFn                        , customAccessToken      ) {
     this._transformRequestFn = transformRequestFn;
     this._customAccessToken = customAccessToken;
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

 RequestManager.prototype.normalizeStyleURL = function normalizeStyleURL (url     , accessToken      )      {
     if (!isMapboxURL(url)) { return url; }
     var urlObject = parseUrl(url);
     urlObject.path = "/styles/v1" + (urlObject.path);
     return this._makeAPIURL(urlObject, this._customAccessToken || accessToken);
 };

 RequestManager.prototype.normalizeGlyphsURL = function normalizeGlyphsURL (url     , accessToken      )      {
     if (!isMapboxURL(url)) { return url; }
     var urlObject = parseUrl(url);
     urlObject.path = "/fonts/v1" + (urlObject.path);
     return this._makeAPIURL(urlObject, this._customAccessToken || accessToken);
 };

 RequestManager.prototype.normalizeSourceURL = function normalizeSourceURL (url     , accessToken      )      {
     if (!isMapboxURL(url)) { return url; }
     var urlObject = parseUrl(url);
     urlObject.path = "/v4/" + (urlObject.authority) + ".json";
     // TileJSON requests need a secure flag appended to their URLs so
     // that the server knows to send SSL-ified resource references.
     urlObject.params.push('secure');
     return this._makeAPIURL(urlObject, this._customAccessToken || accessToken);
 };

 RequestManager.prototype.normalizeSpriteURL = function normalizeSpriteURL (url     , format     , extension     , accessToken      )      {
     var urlObject = parseUrl(url);
     if (!isMapboxURL(url)) {
         urlObject.path += "" + format + extension;
         return formatUrl(urlObject);
     }
     urlObject.path = "/styles/v1" + (urlObject.path) + "/sprite" + format + extension;
     return this._makeAPIURL(urlObject, this._customAccessToken || accessToken);
 };

 RequestManager.prototype.normalizeTileURL = function normalizeTileURL (tileURL     , sourceURL       , tileSize       )      {
     if (this._isSkuTokenExpired()) {
         this._createSkuToken();
     }

     if (!sourceURL || !isMapboxURL(sourceURL)) { return tileURL; }

     var urlObject = parseUrl(tileURL);
     var imageExtensionRe = /(\.(png|jpg)\d*)(?=$)/;
     var tileURLAPIPrefixRe = /^.+\/v4\//;

     // The v4 mapbox tile API supports 512x512 image tiles only when @2x
     // is appended to the tile URL. If `tileSize: 512` is specified for
     // a Mapbox raster source force the @2x suffix even if a non hidpi device.
     var suffix = exported.devicePixelRatio >= 2 || tileSize === 512 ? '@2x' : '';
     var extension = exported$1.supported ? '.webp' : '$1';
     urlObject.path = urlObject.path.replace(imageExtensionRe, ("" + suffix + extension));
     urlObject.path = urlObject.path.replace(tileURLAPIPrefixRe, '/');
     urlObject.path = "/v4" + (urlObject.path);

     if (config.REQUIRE_ACCESS_TOKEN && (config.ACCESS_TOKEN || this._customAccessToken) && this._skuToken) {
         urlObject.params.push(("sku=" + (this._skuToken)));
     }

     return this._makeAPIURL(urlObject, this._customAccessToken);
 };

 RequestManager.prototype.canonicalizeTileURL = function canonicalizeTileURL (url     ) {
     var version$$1 = "/v4/";
     // matches any file extension specified by a dot and one or more alphanumeric characters
     var extensionRe = /\.[\w]+$/;

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

 RequestManager.prototype.canonicalizeTileset = function canonicalizeTileset (tileJSON       , sourceURL     ) {
     if (!isMapboxURL(sourceURL)) { return tileJSON.tiles || []; }
     var canonical = [];
     for (var i = 0, list = tileJSON.tiles; i < list.length; i += 1) {
         var url = list[i];

           var canonicalUrl = this.canonicalizeTileURL(url);
         canonical.push(canonicalUrl);
     }
     return canonical;
 };

 RequestManager.prototype._makeAPIURL = function _makeAPIURL (urlObject        , accessToken                   )      {
     var help = 'See https://www.mapbox.com/api-documentation/#access-tokens-and-token-scopes';
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

     urlObject.params = urlObject.params.filter(function (d) { return d.indexOf('access_token') === -1; });
     urlObject.params.push(("access_token=" + accessToken));
     return formatUrl(urlObject);
 };

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

 TelemetryEvent.prototype.processRequests = function processRequests (_      ) {};

 /*
 * If any event data should be persisted after the POST request, the callback should modify eventData`
 * to the values that should be saved. For this reason, the callback should be invoked prior to the call
 * to TelemetryEvent#saveData
 */
 TelemetryEvent.prototype.postEvent = function postEvent (timestamp     , additionalPayload              , callback                    , customAccessToken       ) {
        var this$1 = this;

     if (!config.EVENTS_URL) { return; }
     var eventsUrlObject         = parseUrl(config.EVENTS_URL);
     eventsUrlObject.params.push(("access_token=" + (customAccessToken || config.ACCESS_TOKEN || '')));

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
         this$1.processRequests(customAccessToken);
     });
 };

 TelemetryEvent.prototype.queueRequest = function queueRequest (event                                       , customAccessToken       ) {
     this.queue.push(event);
     this.processRequests(customAccessToken);
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

    MapLoadEvent.prototype.postMapLoadEvent = function postMapLoadEvent (tileUrls               , mapId        , skuToken        , customAccessToken        ) {
        //Enabled only when Mapbox Access Token is set and a source uses
        // mapbox tiles.
        this.skuToken = skuToken;

        if (config.EVENTS_URL &&
            customAccessToken || config.ACCESS_TOKEN &&
            Array.isArray(tileUrls) &&
            tileUrls.some(function (url) { return isMapboxURL(url) || isMapboxHTTPURL(url); })) {
            this.queueRequest({id: mapId, timestamp: Date.now()}, customAccessToken);
        }
    };

    MapLoadEvent.prototype.processRequests = function processRequests (customAccessToken          ) {
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
        }, customAccessToken);
    };

   return MapLoadEvent;
}(TelemetryEvent));

var TurnstileEvent = /*@__PURE__*/(function (TelemetryEvent) {
   function TurnstileEvent(customAccessToken          ) {
        TelemetryEvent.call(this, 'appUserTurnstile');
        this._customAccessToken = customAccessToken;
    }

   if ( TelemetryEvent ) TurnstileEvent.__proto__ = TelemetryEvent;
   TurnstileEvent.prototype = Object.create( TelemetryEvent && TelemetryEvent.prototype );
   TurnstileEvent.prototype.constructor = TurnstileEvent;

    TurnstileEvent.prototype.postTurnstileEvent = function postTurnstileEvent (tileUrls               , customAccessToken          ) {
        //Enabled only when Mapbox Access Token is set and a source uses
        // mapbox tiles.
        if (config.EVENTS_URL &&
            config.ACCESS_TOKEN &&
            Array.isArray(tileUrls) &&
            tileUrls.some(function (url) { return isMapboxURL(url) || isMapboxHTTPURL(url); })) {
            this.queueRequest(Date.now(), customAccessToken);
        }
    };

    TurnstileEvent.prototype.processRequests = function processRequests (customAccessToken          ) {
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
        }, customAccessToken);
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

        self.caches.open(CACHE_NAME)
            .then(function (cache) { return cache.put(stripQueryParameters(request.url), clonedResponse); })
            .catch(function (e) { return warnOnce(e.message); });
    });
}

function stripQueryParameters(url        ) {
    var start = url.indexOf('?');
    return start < 0 ? url : url.slice(0, start);
}

function cacheGet(request         , callback                                                             ) {
    if (!self.caches) { return callback(null); }

    var strippedURL = stripQueryParameters(request.url);

    self.caches.open(CACHE_NAME)
        .then(function (cache) {
            // manually strip URL instead of `ignoreSearch: true` because of a known
            // performance issue in Chrome https://github.com/mapbox/mapbox-gl-js/issues/8431
            cache.match(strippedURL)
                .catch(callback)
                .then(function (response) {
                    var fresh = isFresh(response);

                    // Reinsert into cache so that order of keys in the cache is the order of access.
                    // This line makes the cache a LRU instead of a FIFO cache.
                    cache.delete(strippedURL);
                    if (fresh) {
                        cache.put(strippedURL, response.clone());
                    }

                    callback(null, response, fresh);
                });
        })
        .catch(callback);

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
        dispatcher.getActor().send('enforceCacheSizeLimit', cacheLimit);
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
    function () { return (self.location.protocol === 'blob:' ? self.parent : self).location.href; };

// Determines whether a URL is a file:// URL. This is obviously the case if it begins
// with file://. Relative URLs are also file:// URLs iff the original document was loaded
// via a file:// URL.
var isFileURL = function (url) { return /^file:/.test(url) || (/^file:/.test(getReferrer()) && !/^\w+:/.test(url)); };

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
    var aborted = false;

    var cacheIgnoringSearch = hasCacheDefeatingSku(request.url);

    if (requestParameters.type === 'json') {
        request.headers.set('Accept', 'application/json');
    }

    var validateOrFetch = function (err, cachedResponse, responseIsFresh) {
        if (aborted) { return; }

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
            if (aborted) { return; }
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

    return {cancel: function () {
        aborted = true;
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
        xhr.responseType = 'text';
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
    return {cancel: function () { return xhr.abort(); }};
}

var makeRequest = function(requestParameters                   , callback                       )             {
    // We're trying to use the Fetch API if possible. However, in some situations we can't use it:
    // - IE11 doesn't support it at all. In this case, we dispatch the request to the main thread so
    //   that we can get an accruate referrer header.
    // - Safari exposes window.AbortController, but it doesn't work actually abort any requests in
    //   some versions (see https://bugs.webkit.org/show_bug.cgi?id=174980#c2)
    // - Requests for resources with the file:// URI scheme don't work with the Fetch API either. In
    //   this case we unconditionally use XHR on the current thread since referrers don't matter.
    if (!isFileURL(requestParameters.url)) {
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
    return makeRequest(extend(requestParameters, {type: 'json'}), callback);
};

var getArrayBuffer = function(requestParameters                   , callback                               )             {
    return makeRequest(extend(requestParameters, {type: 'arrayBuffer'}), callback);
};

var postData = function(requestParameters                   , callback                          )             {
    return makeRequest(extend(requestParameters, {method: 'POST'}), callback);
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
            var blob       = new self.Blob([new Uint8Array(data)], {type: 'image/png'});
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
    return {cancel: function () {}};
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
 * The circumference of the world in meters at the equator.
 */
var circumferenceAtEquator = 2 * Math.PI * 6378137;

/*
 * The circumference of the world in meters at the given latitude.
 */
function circumferenceAtLatitude(latitude        ) {
    return circumferenceAtEquator * Math.cos(latitude * Math.PI / 180);
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
 * Determine the Mercator scale factor for a given latitude, see
 * https://en.wikipedia.org/wiki/Mercator_projection#Scale_factor
 *
 * At the equator the scale factor will be 1, which increases at higher latitudes.
 *
 * @param {number} lat Latitude
 * @returns {number} scale factor
 */
function mercatorScale(lat        ) {
    return 1 / Math.cos(lat * Math.PI / 180);
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

/**
 * Returns the distance of 1 meter in `MercatorCoordinate` units at this latitude.
 *
 * For coordinates in real world units using meters, this naturally provides the scale
 * to transform into `MercatorCoordinate`s.
 *
 * @returns {number} Distance of 1 meter in `MercatorCoordinate` units.
 */
MercatorCoordinate.prototype.meterInMercatorCoordinateUnits = function meterInMercatorCoordinateUnits () {
    // 1 meter / circumference at equator in meters * Mercator projection scale factor at this latitude
    return 1 / circumferenceAtEquator * mercatorScale(latFromMercatorY(this.y));
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
        var ref$1 = position || {x: 0, y: 0};
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

                                                        
                                                                   
                                            
                                                            
                                                  
                                                           
// import type {Cancelable} from 'mapbox-gl/src/types/cancelable';
             
                              
                                
                                        

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

        this._options = extend({type: 'arcgisraster'}, options);
        extend(this, pick(options, ['url', 'scheme', 'tileSize']));
    }

    if ( Evented$$1 ) ArcGISTiledMapServiceSource.__proto__ = Evented$$1;
    ArcGISTiledMapServiceSource.prototype = Object.create( Evented$$1 && Evented$$1.prototype );
    ArcGISTiledMapServiceSource.prototype.constructor = ArcGISTiledMapServiceSource;

    ArcGISTiledMapServiceSource.prototype.load = function load () {
        var this$1 = this;

        this._loaded = false;
        this.fire(new Event('dataloading', {dataType: 'source'}));
        loadArcGISMapServer(this._options, function (err, metadata) {
            this$1._loaded = true;
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

    ArcGISTiledMapServiceSource.prototype.loaded = function loaded ()          {
        return this._loaded;
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
                    tile.texture.update(img, {useMipmap: true});
                } else {
                    tile.texture = new Texture(context, img, gl.RGBA, {useMipmap: true});
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwYm94LWdsLWFyY2dpcy10aWxlZC1tYXAtc2VydmljZS1kZXYuanMiLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9AbWFwYm94L3VuaXRiZXppZXIvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvQG1hcGJveC9wb2ludC1nZW9tZXRyeS9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9tYXBib3gtZ2wvc3JjL3V0aWwvYnJvd3Nlci93aW5kb3cuanMiLCIuLi9ub2RlX21vZHVsZXMvbWFwYm94LWdsL3NyYy9zdHlsZS1zcGVjL3V0aWwvZGVlcF9lcXVhbC5qcyIsIi4uL25vZGVfbW9kdWxlcy9tYXBib3gtZ2wvc3JjL3V0aWwvdXRpbC5qcyIsIi4uL25vZGVfbW9kdWxlcy9tYXBib3gtZ2wvc3JjL3V0aWwvY29uZmlnLmpzIiwiLi4vbm9kZV9tb2R1bGVzL21hcGJveC1nbC9zcmMvdXRpbC9icm93c2VyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL21hcGJveC1nbC9zcmMvdXRpbC93ZWJwX3N1cHBvcnRlZC5qcyIsIi4uL25vZGVfbW9kdWxlcy9tYXBib3gtZ2wvc3JjL3V0aWwvc2t1X3Rva2VuLmpzIiwiLi4vbm9kZV9tb2R1bGVzL21hcGJveC1nbC9zcmMvdXRpbC9tYXBib3guanMiLCIuLi9ub2RlX21vZHVsZXMvbWFwYm94LWdsL3NyYy91dGlsL3RpbGVfcmVxdWVzdF9jYWNoZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9tYXBib3gtZ2wvc3JjL3V0aWwvYWpheC5qcyIsIi4uL25vZGVfbW9kdWxlcy9tYXBib3gtZ2wvc3JjL3V0aWwvZXZlbnRlZC5qcyIsIi4uL25vZGVfbW9kdWxlcy9AbWFwYm94L3NwaGVyaWNhbG1lcmNhdG9yL3NwaGVyaWNhbG1lcmNhdG9yLmpzIiwiLi4vc3JjL2xvYWRfYXJjZ2lzX21hcHNlcnZlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9tYXBib3gtZ2wvc3JjL2dlby9sbmdfbGF0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL21hcGJveC1nbC9zcmMvZ2VvL2xuZ19sYXRfYm91bmRzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL21hcGJveC1nbC9zcmMvZ2VvL21lcmNhdG9yX2Nvb3JkaW5hdGUuanMiLCIuLi9ub2RlX21vZHVsZXMvbWFwYm94LWdsL3NyYy9zb3VyY2UvdGlsZV9ib3VuZHMuanMiLCIuLi9zcmMvaGVscGVycy5qcyIsIi4uL25vZGVfbW9kdWxlcy9tYXBib3gtZ2wvc3JjL3JlbmRlci90ZXh0dXJlLmpzIiwiLi4vc3JjL2FyY2dpc190aWxlZF9tYXBfc2VydmljZV9zb3VyY2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIENvcHlyaWdodCAoQykgMjAwOCBBcHBsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0XG4gKiBtb2RpZmljYXRpb24sIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnNcbiAqIGFyZSBtZXQ6XG4gKiAxLiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodFxuICogICAgbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICogMi4gUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHRcbiAqICAgIG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGVcbiAqICAgIGRvY3VtZW50YXRpb24gYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG4gKlxuICogVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBBUFBMRSBJTkMuIGBgQVMgSVMnJyBBTkQgQU5ZXG4gKiBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRVxuICogSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSXG4gKiBQVVJQT1NFIEFSRSBESVNDTEFJTUVELiAgSU4gTk8gRVZFTlQgU0hBTEwgQVBQTEUgSU5DLiBPUlxuICogQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsXG4gKiBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sXG4gKiBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSwgREFUQSwgT1JcbiAqIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUllcbiAqIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuICogKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFXG4gKiBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuICpcbiAqIFBvcnRlZCBmcm9tIFdlYmtpdFxuICogaHR0cDovL3N2bi53ZWJraXQub3JnL3JlcG9zaXRvcnkvd2Via2l0L3RydW5rL1NvdXJjZS9XZWJDb3JlL3BsYXRmb3JtL2dyYXBoaWNzL1VuaXRCZXppZXIuaFxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gVW5pdEJlemllcjtcblxuZnVuY3Rpb24gVW5pdEJlemllcihwMXgsIHAxeSwgcDJ4LCBwMnkpIHtcbiAgICAvLyBDYWxjdWxhdGUgdGhlIHBvbHlub21pYWwgY29lZmZpY2llbnRzLCBpbXBsaWNpdCBmaXJzdCBhbmQgbGFzdCBjb250cm9sIHBvaW50cyBhcmUgKDAsMCkgYW5kICgxLDEpLlxuICAgIHRoaXMuY3ggPSAzLjAgKiBwMXg7XG4gICAgdGhpcy5ieCA9IDMuMCAqIChwMnggLSBwMXgpIC0gdGhpcy5jeDtcbiAgICB0aGlzLmF4ID0gMS4wIC0gdGhpcy5jeCAtIHRoaXMuYng7XG5cbiAgICB0aGlzLmN5ID0gMy4wICogcDF5O1xuICAgIHRoaXMuYnkgPSAzLjAgKiAocDJ5IC0gcDF5KSAtIHRoaXMuY3k7XG4gICAgdGhpcy5heSA9IDEuMCAtIHRoaXMuY3kgLSB0aGlzLmJ5O1xuXG4gICAgdGhpcy5wMXggPSBwMXg7XG4gICAgdGhpcy5wMXkgPSBwMnk7XG4gICAgdGhpcy5wMnggPSBwMng7XG4gICAgdGhpcy5wMnkgPSBwMnk7XG59XG5cblVuaXRCZXppZXIucHJvdG90eXBlLnNhbXBsZUN1cnZlWCA9IGZ1bmN0aW9uKHQpIHtcbiAgICAvLyBgYXggdF4zICsgYnggdF4yICsgY3ggdCcgZXhwYW5kZWQgdXNpbmcgSG9ybmVyJ3MgcnVsZS5cbiAgICByZXR1cm4gKCh0aGlzLmF4ICogdCArIHRoaXMuYngpICogdCArIHRoaXMuY3gpICogdDtcbn07XG5cblVuaXRCZXppZXIucHJvdG90eXBlLnNhbXBsZUN1cnZlWSA9IGZ1bmN0aW9uKHQpIHtcbiAgICByZXR1cm4gKCh0aGlzLmF5ICogdCArIHRoaXMuYnkpICogdCArIHRoaXMuY3kpICogdDtcbn07XG5cblVuaXRCZXppZXIucHJvdG90eXBlLnNhbXBsZUN1cnZlRGVyaXZhdGl2ZVggPSBmdW5jdGlvbih0KSB7XG4gICAgcmV0dXJuICgzLjAgKiB0aGlzLmF4ICogdCArIDIuMCAqIHRoaXMuYngpICogdCArIHRoaXMuY3g7XG59O1xuXG5Vbml0QmV6aWVyLnByb3RvdHlwZS5zb2x2ZUN1cnZlWCA9IGZ1bmN0aW9uKHgsIGVwc2lsb24pIHtcbiAgICBpZiAodHlwZW9mIGVwc2lsb24gPT09ICd1bmRlZmluZWQnKSBlcHNpbG9uID0gMWUtNjtcblxuICAgIHZhciB0MCwgdDEsIHQyLCB4MiwgaTtcblxuICAgIC8vIEZpcnN0IHRyeSBhIGZldyBpdGVyYXRpb25zIG9mIE5ld3RvbidzIG1ldGhvZCAtLSBub3JtYWxseSB2ZXJ5IGZhc3QuXG4gICAgZm9yICh0MiA9IHgsIGkgPSAwOyBpIDwgODsgaSsrKSB7XG5cbiAgICAgICAgeDIgPSB0aGlzLnNhbXBsZUN1cnZlWCh0MikgLSB4O1xuICAgICAgICBpZiAoTWF0aC5hYnMoeDIpIDwgZXBzaWxvbikgcmV0dXJuIHQyO1xuXG4gICAgICAgIHZhciBkMiA9IHRoaXMuc2FtcGxlQ3VydmVEZXJpdmF0aXZlWCh0Mik7XG4gICAgICAgIGlmIChNYXRoLmFicyhkMikgPCAxZS02KSBicmVhaztcblxuICAgICAgICB0MiA9IHQyIC0geDIgLyBkMjtcbiAgICB9XG5cbiAgICAvLyBGYWxsIGJhY2sgdG8gdGhlIGJpc2VjdGlvbiBtZXRob2QgZm9yIHJlbGlhYmlsaXR5LlxuICAgIHQwID0gMC4wO1xuICAgIHQxID0gMS4wO1xuICAgIHQyID0geDtcblxuICAgIGlmICh0MiA8IHQwKSByZXR1cm4gdDA7XG4gICAgaWYgKHQyID4gdDEpIHJldHVybiB0MTtcblxuICAgIHdoaWxlICh0MCA8IHQxKSB7XG5cbiAgICAgICAgeDIgPSB0aGlzLnNhbXBsZUN1cnZlWCh0Mik7XG4gICAgICAgIGlmIChNYXRoLmFicyh4MiAtIHgpIDwgZXBzaWxvbikgcmV0dXJuIHQyO1xuXG4gICAgICAgIGlmICh4ID4geDIpIHtcbiAgICAgICAgICAgIHQwID0gdDI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0MSA9IHQyO1xuICAgICAgICB9XG5cbiAgICAgICAgdDIgPSAodDEgLSB0MCkgKiAwLjUgKyB0MDtcbiAgICB9XG5cbiAgICAvLyBGYWlsdXJlLlxuICAgIHJldHVybiB0Mjtcbn07XG5cblVuaXRCZXppZXIucHJvdG90eXBlLnNvbHZlID0gZnVuY3Rpb24oeCwgZXBzaWxvbikge1xuICAgIHJldHVybiB0aGlzLnNhbXBsZUN1cnZlWSh0aGlzLnNvbHZlQ3VydmVYKHgsIGVwc2lsb24pKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gUG9pbnQ7XG5cbi8qKlxuICogQSBzdGFuZGFsb25lIHBvaW50IGdlb21ldHJ5IHdpdGggdXNlZnVsIGFjY2Vzc29yLCBjb21wYXJpc29uLCBhbmRcbiAqIG1vZGlmaWNhdGlvbiBtZXRob2RzLlxuICpcbiAqIEBjbGFzcyBQb2ludFxuICogQHBhcmFtIHtOdW1iZXJ9IHggdGhlIHgtY29vcmRpbmF0ZS4gdGhpcyBjb3VsZCBiZSBsb25naXR1ZGUgb3Igc2NyZWVuXG4gKiBwaXhlbHMsIG9yIGFueSBvdGhlciBzb3J0IG9mIHVuaXQuXG4gKiBAcGFyYW0ge051bWJlcn0geSB0aGUgeS1jb29yZGluYXRlLiB0aGlzIGNvdWxkIGJlIGxhdGl0dWRlIG9yIHNjcmVlblxuICogcGl4ZWxzLCBvciBhbnkgb3RoZXIgc29ydCBvZiB1bml0LlxuICogQGV4YW1wbGVcbiAqIHZhciBwb2ludCA9IG5ldyBQb2ludCgtNzcsIDM4KTtcbiAqL1xuZnVuY3Rpb24gUG9pbnQoeCwgeSkge1xuICAgIHRoaXMueCA9IHg7XG4gICAgdGhpcy55ID0geTtcbn1cblxuUG9pbnQucHJvdG90eXBlID0ge1xuXG4gICAgLyoqXG4gICAgICogQ2xvbmUgdGhpcyBwb2ludCwgcmV0dXJuaW5nIGEgbmV3IHBvaW50IHRoYXQgY2FuIGJlIG1vZGlmaWVkXG4gICAgICogd2l0aG91dCBhZmZlY3RpbmcgdGhlIG9sZCBvbmUuXG4gICAgICogQHJldHVybiB7UG9pbnR9IHRoZSBjbG9uZVxuICAgICAqL1xuICAgIGNsb25lOiBmdW5jdGlvbigpIHsgcmV0dXJuIG5ldyBQb2ludCh0aGlzLngsIHRoaXMueSk7IH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgdGhpcyBwb2ludCdzIHggJiB5IGNvb3JkaW5hdGVzIHRvIGFub3RoZXIgcG9pbnQsXG4gICAgICogeWllbGRpbmcgYSBuZXcgcG9pbnQuXG4gICAgICogQHBhcmFtIHtQb2ludH0gcCB0aGUgb3RoZXIgcG9pbnRcbiAgICAgKiBAcmV0dXJuIHtQb2ludH0gb3V0cHV0IHBvaW50XG4gICAgICovXG4gICAgYWRkOiAgICAgZnVuY3Rpb24ocCkgeyByZXR1cm4gdGhpcy5jbG9uZSgpLl9hZGQocCk7IH0sXG5cbiAgICAvKipcbiAgICAgKiBTdWJ0cmFjdCB0aGlzIHBvaW50J3MgeCAmIHkgY29vcmRpbmF0ZXMgdG8gZnJvbSBwb2ludCxcbiAgICAgKiB5aWVsZGluZyBhIG5ldyBwb2ludC5cbiAgICAgKiBAcGFyYW0ge1BvaW50fSBwIHRoZSBvdGhlciBwb2ludFxuICAgICAqIEByZXR1cm4ge1BvaW50fSBvdXRwdXQgcG9pbnRcbiAgICAgKi9cbiAgICBzdWI6ICAgICBmdW5jdGlvbihwKSB7IHJldHVybiB0aGlzLmNsb25lKCkuX3N1YihwKTsgfSxcblxuICAgIC8qKlxuICAgICAqIE11bHRpcGx5IHRoaXMgcG9pbnQncyB4ICYgeSBjb29yZGluYXRlcyBieSBwb2ludCxcbiAgICAgKiB5aWVsZGluZyBhIG5ldyBwb2ludC5cbiAgICAgKiBAcGFyYW0ge1BvaW50fSBwIHRoZSBvdGhlciBwb2ludFxuICAgICAqIEByZXR1cm4ge1BvaW50fSBvdXRwdXQgcG9pbnRcbiAgICAgKi9cbiAgICBtdWx0QnlQb2ludDogICAgZnVuY3Rpb24ocCkgeyByZXR1cm4gdGhpcy5jbG9uZSgpLl9tdWx0QnlQb2ludChwKTsgfSxcblxuICAgIC8qKlxuICAgICAqIERpdmlkZSB0aGlzIHBvaW50J3MgeCAmIHkgY29vcmRpbmF0ZXMgYnkgcG9pbnQsXG4gICAgICogeWllbGRpbmcgYSBuZXcgcG9pbnQuXG4gICAgICogQHBhcmFtIHtQb2ludH0gcCB0aGUgb3RoZXIgcG9pbnRcbiAgICAgKiBAcmV0dXJuIHtQb2ludH0gb3V0cHV0IHBvaW50XG4gICAgICovXG4gICAgZGl2QnlQb2ludDogICAgIGZ1bmN0aW9uKHApIHsgcmV0dXJuIHRoaXMuY2xvbmUoKS5fZGl2QnlQb2ludChwKTsgfSxcblxuICAgIC8qKlxuICAgICAqIE11bHRpcGx5IHRoaXMgcG9pbnQncyB4ICYgeSBjb29yZGluYXRlcyBieSBhIGZhY3RvcixcbiAgICAgKiB5aWVsZGluZyBhIG5ldyBwb2ludC5cbiAgICAgKiBAcGFyYW0ge1BvaW50fSBrIGZhY3RvclxuICAgICAqIEByZXR1cm4ge1BvaW50fSBvdXRwdXQgcG9pbnRcbiAgICAgKi9cbiAgICBtdWx0OiAgICBmdW5jdGlvbihrKSB7IHJldHVybiB0aGlzLmNsb25lKCkuX211bHQoayk7IH0sXG5cbiAgICAvKipcbiAgICAgKiBEaXZpZGUgdGhpcyBwb2ludCdzIHggJiB5IGNvb3JkaW5hdGVzIGJ5IGEgZmFjdG9yLFxuICAgICAqIHlpZWxkaW5nIGEgbmV3IHBvaW50LlxuICAgICAqIEBwYXJhbSB7UG9pbnR9IGsgZmFjdG9yXG4gICAgICogQHJldHVybiB7UG9pbnR9IG91dHB1dCBwb2ludFxuICAgICAqL1xuICAgIGRpdjogICAgIGZ1bmN0aW9uKGspIHsgcmV0dXJuIHRoaXMuY2xvbmUoKS5fZGl2KGspOyB9LFxuXG4gICAgLyoqXG4gICAgICogUm90YXRlIHRoaXMgcG9pbnQgYXJvdW5kIHRoZSAwLCAwIG9yaWdpbiBieSBhbiBhbmdsZSBhLFxuICAgICAqIGdpdmVuIGluIHJhZGlhbnNcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gYSBhbmdsZSB0byByb3RhdGUgYXJvdW5kLCBpbiByYWRpYW5zXG4gICAgICogQHJldHVybiB7UG9pbnR9IG91dHB1dCBwb2ludFxuICAgICAqL1xuICAgIHJvdGF0ZTogIGZ1bmN0aW9uKGEpIHsgcmV0dXJuIHRoaXMuY2xvbmUoKS5fcm90YXRlKGEpOyB9LFxuXG4gICAgLyoqXG4gICAgICogUm90YXRlIHRoaXMgcG9pbnQgYXJvdW5kIHAgcG9pbnQgYnkgYW4gYW5nbGUgYSxcbiAgICAgKiBnaXZlbiBpbiByYWRpYW5zXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGEgYW5nbGUgdG8gcm90YXRlIGFyb3VuZCwgaW4gcmFkaWFuc1xuICAgICAqIEBwYXJhbSB7UG9pbnR9IHAgUG9pbnQgdG8gcm90YXRlIGFyb3VuZFxuICAgICAqIEByZXR1cm4ge1BvaW50fSBvdXRwdXQgcG9pbnRcbiAgICAgKi9cbiAgICByb3RhdGVBcm91bmQ6ICBmdW5jdGlvbihhLHApIHsgcmV0dXJuIHRoaXMuY2xvbmUoKS5fcm90YXRlQXJvdW5kKGEscCk7IH0sXG5cbiAgICAvKipcbiAgICAgKiBNdWx0aXBseSB0aGlzIHBvaW50IGJ5IGEgNHgxIHRyYW5zZm9ybWF0aW9uIG1hdHJpeFxuICAgICAqIEBwYXJhbSB7QXJyYXk8TnVtYmVyPn0gbSB0cmFuc2Zvcm1hdGlvbiBtYXRyaXhcbiAgICAgKiBAcmV0dXJuIHtQb2ludH0gb3V0cHV0IHBvaW50XG4gICAgICovXG4gICAgbWF0TXVsdDogZnVuY3Rpb24obSkgeyByZXR1cm4gdGhpcy5jbG9uZSgpLl9tYXRNdWx0KG0pOyB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlIHRoaXMgcG9pbnQgYnV0IGFzIGEgdW5pdCB2ZWN0b3IgZnJvbSAwLCAwLCBtZWFuaW5nXG4gICAgICogdGhhdCB0aGUgZGlzdGFuY2UgZnJvbSB0aGUgcmVzdWx0aW5nIHBvaW50IHRvIHRoZSAwLCAwXG4gICAgICogY29vcmRpbmF0ZSB3aWxsIGJlIGVxdWFsIHRvIDEgYW5kIHRoZSBhbmdsZSBmcm9tIHRoZSByZXN1bHRpbmdcbiAgICAgKiBwb2ludCB0byB0aGUgMCwgMCBjb29yZGluYXRlIHdpbGwgYmUgdGhlIHNhbWUgYXMgYmVmb3JlLlxuICAgICAqIEByZXR1cm4ge1BvaW50fSB1bml0IHZlY3RvciBwb2ludFxuICAgICAqL1xuICAgIHVuaXQ6ICAgIGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5jbG9uZSgpLl91bml0KCk7IH0sXG5cbiAgICAvKipcbiAgICAgKiBDb21wdXRlIGEgcGVycGVuZGljdWxhciBwb2ludCwgd2hlcmUgdGhlIG5ldyB5IGNvb3JkaW5hdGVcbiAgICAgKiBpcyB0aGUgb2xkIHggY29vcmRpbmF0ZSBhbmQgdGhlIG5ldyB4IGNvb3JkaW5hdGUgaXMgdGhlIG9sZCB5XG4gICAgICogY29vcmRpbmF0ZSBtdWx0aXBsaWVkIGJ5IC0xXG4gICAgICogQHJldHVybiB7UG9pbnR9IHBlcnBlbmRpY3VsYXIgcG9pbnRcbiAgICAgKi9cbiAgICBwZXJwOiAgICBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuY2xvbmUoKS5fcGVycCgpOyB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIGEgdmVyc2lvbiBvZiB0aGlzIHBvaW50IHdpdGggdGhlIHggJiB5IGNvb3JkaW5hdGVzXG4gICAgICogcm91bmRlZCB0byBpbnRlZ2Vycy5cbiAgICAgKiBAcmV0dXJuIHtQb2ludH0gcm91bmRlZCBwb2ludFxuICAgICAqL1xuICAgIHJvdW5kOiAgIGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5jbG9uZSgpLl9yb3VuZCgpOyB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRoZSBtYWdpdHVkZSBvZiB0aGlzIHBvaW50OiB0aGlzIGlzIHRoZSBFdWNsaWRlYW5cbiAgICAgKiBkaXN0YW5jZSBmcm9tIHRoZSAwLCAwIGNvb3JkaW5hdGUgdG8gdGhpcyBwb2ludCdzIHggYW5kIHlcbiAgICAgKiBjb29yZGluYXRlcy5cbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IG1hZ25pdHVkZVxuICAgICAqL1xuICAgIG1hZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQodGhpcy54ICogdGhpcy54ICsgdGhpcy55ICogdGhpcy55KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSnVkZ2Ugd2hldGhlciB0aGlzIHBvaW50IGlzIGVxdWFsIHRvIGFub3RoZXIgcG9pbnQsIHJldHVybmluZ1xuICAgICAqIHRydWUgb3IgZmFsc2UuXG4gICAgICogQHBhcmFtIHtQb2ludH0gb3RoZXIgdGhlIG90aGVyIHBvaW50XG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gd2hldGhlciB0aGUgcG9pbnRzIGFyZSBlcXVhbFxuICAgICAqL1xuICAgIGVxdWFsczogZnVuY3Rpb24ob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMueCA9PT0gb3RoZXIueCAmJlxuICAgICAgICAgICAgICAgdGhpcy55ID09PSBvdGhlci55O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGUgdGhlIGRpc3RhbmNlIGZyb20gdGhpcyBwb2ludCB0byBhbm90aGVyIHBvaW50XG4gICAgICogQHBhcmFtIHtQb2ludH0gcCB0aGUgb3RoZXIgcG9pbnRcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGRpc3RhbmNlXG4gICAgICovXG4gICAgZGlzdDogZnVuY3Rpb24ocCkge1xuICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KHRoaXMuZGlzdFNxcihwKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGN1bGF0ZSB0aGUgZGlzdGFuY2UgZnJvbSB0aGlzIHBvaW50IHRvIGFub3RoZXIgcG9pbnQsXG4gICAgICogd2l0aG91dCB0aGUgc3F1YXJlIHJvb3Qgc3RlcC4gVXNlZnVsIGlmIHlvdSdyZSBjb21wYXJpbmdcbiAgICAgKiByZWxhdGl2ZSBkaXN0YW5jZXMuXG4gICAgICogQHBhcmFtIHtQb2ludH0gcCB0aGUgb3RoZXIgcG9pbnRcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGRpc3RhbmNlXG4gICAgICovXG4gICAgZGlzdFNxcjogZnVuY3Rpb24ocCkge1xuICAgICAgICB2YXIgZHggPSBwLnggLSB0aGlzLngsXG4gICAgICAgICAgICBkeSA9IHAueSAtIHRoaXMueTtcbiAgICAgICAgcmV0dXJuIGR4ICogZHggKyBkeSAqIGR5O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGFuZ2xlIGZyb20gdGhlIDAsIDAgY29vcmRpbmF0ZSB0byB0aGlzIHBvaW50LCBpbiByYWRpYW5zXG4gICAgICogY29vcmRpbmF0ZXMuXG4gICAgICogQHJldHVybiB7TnVtYmVyfSBhbmdsZVxuICAgICAqL1xuICAgIGFuZ2xlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguYXRhbjIodGhpcy55LCB0aGlzLngpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGFuZ2xlIGZyb20gdGhpcyBwb2ludCB0byBhbm90aGVyIHBvaW50LCBpbiByYWRpYW5zXG4gICAgICogQHBhcmFtIHtQb2ludH0gYiB0aGUgb3RoZXIgcG9pbnRcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGFuZ2xlXG4gICAgICovXG4gICAgYW5nbGVUbzogZnVuY3Rpb24oYikge1xuICAgICAgICByZXR1cm4gTWF0aC5hdGFuMih0aGlzLnkgLSBiLnksIHRoaXMueCAtIGIueCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgYW5nbGUgYmV0d2VlbiB0aGlzIHBvaW50IGFuZCBhbm90aGVyIHBvaW50LCBpbiByYWRpYW5zXG4gICAgICogQHBhcmFtIHtQb2ludH0gYiB0aGUgb3RoZXIgcG9pbnRcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGFuZ2xlXG4gICAgICovXG4gICAgYW5nbGVXaXRoOiBmdW5jdGlvbihiKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFuZ2xlV2l0aFNlcChiLngsIGIueSk7XG4gICAgfSxcblxuICAgIC8qXG4gICAgICogRmluZCB0aGUgYW5nbGUgb2YgdGhlIHR3byB2ZWN0b3JzLCBzb2x2aW5nIHRoZSBmb3JtdWxhIGZvclxuICAgICAqIHRoZSBjcm9zcyBwcm9kdWN0IGEgeCBiID0gfGF8fGJ8c2luKM64KSBmb3IgzrguXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHggdGhlIHgtY29vcmRpbmF0ZVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB5IHRoZSB5LWNvb3JkaW5hdGVcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IHRoZSBhbmdsZSBpbiByYWRpYW5zXG4gICAgICovXG4gICAgYW5nbGVXaXRoU2VwOiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgIHJldHVybiBNYXRoLmF0YW4yKFxuICAgICAgICAgICAgdGhpcy54ICogeSAtIHRoaXMueSAqIHgsXG4gICAgICAgICAgICB0aGlzLnggKiB4ICsgdGhpcy55ICogeSk7XG4gICAgfSxcblxuICAgIF9tYXRNdWx0OiBmdW5jdGlvbihtKSB7XG4gICAgICAgIHZhciB4ID0gbVswXSAqIHRoaXMueCArIG1bMV0gKiB0aGlzLnksXG4gICAgICAgICAgICB5ID0gbVsyXSAqIHRoaXMueCArIG1bM10gKiB0aGlzLnk7XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBfYWRkOiBmdW5jdGlvbihwKSB7XG4gICAgICAgIHRoaXMueCArPSBwLng7XG4gICAgICAgIHRoaXMueSArPSBwLnk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBfc3ViOiBmdW5jdGlvbihwKSB7XG4gICAgICAgIHRoaXMueCAtPSBwLng7XG4gICAgICAgIHRoaXMueSAtPSBwLnk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBfbXVsdDogZnVuY3Rpb24oaykge1xuICAgICAgICB0aGlzLnggKj0gaztcbiAgICAgICAgdGhpcy55ICo9IGs7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBfZGl2OiBmdW5jdGlvbihrKSB7XG4gICAgICAgIHRoaXMueCAvPSBrO1xuICAgICAgICB0aGlzLnkgLz0gaztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIF9tdWx0QnlQb2ludDogZnVuY3Rpb24ocCkge1xuICAgICAgICB0aGlzLnggKj0gcC54O1xuICAgICAgICB0aGlzLnkgKj0gcC55O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgX2RpdkJ5UG9pbnQ6IGZ1bmN0aW9uKHApIHtcbiAgICAgICAgdGhpcy54IC89IHAueDtcbiAgICAgICAgdGhpcy55IC89IHAueTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIF91bml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fZGl2KHRoaXMubWFnKCkpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgX3BlcnA6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgeSA9IHRoaXMueTtcbiAgICAgICAgdGhpcy55ID0gdGhpcy54O1xuICAgICAgICB0aGlzLnggPSAteTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIF9yb3RhdGU6IGZ1bmN0aW9uKGFuZ2xlKSB7XG4gICAgICAgIHZhciBjb3MgPSBNYXRoLmNvcyhhbmdsZSksXG4gICAgICAgICAgICBzaW4gPSBNYXRoLnNpbihhbmdsZSksXG4gICAgICAgICAgICB4ID0gY29zICogdGhpcy54IC0gc2luICogdGhpcy55LFxuICAgICAgICAgICAgeSA9IHNpbiAqIHRoaXMueCArIGNvcyAqIHRoaXMueTtcbiAgICAgICAgdGhpcy54ID0geDtcbiAgICAgICAgdGhpcy55ID0geTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIF9yb3RhdGVBcm91bmQ6IGZ1bmN0aW9uKGFuZ2xlLCBwKSB7XG4gICAgICAgIHZhciBjb3MgPSBNYXRoLmNvcyhhbmdsZSksXG4gICAgICAgICAgICBzaW4gPSBNYXRoLnNpbihhbmdsZSksXG4gICAgICAgICAgICB4ID0gcC54ICsgY29zICogKHRoaXMueCAtIHAueCkgLSBzaW4gKiAodGhpcy55IC0gcC55KSxcbiAgICAgICAgICAgIHkgPSBwLnkgKyBzaW4gKiAodGhpcy54IC0gcC54KSArIGNvcyAqICh0aGlzLnkgLSBwLnkpO1xuICAgICAgICB0aGlzLnggPSB4O1xuICAgICAgICB0aGlzLnkgPSB5O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgX3JvdW5kOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy54ID0gTWF0aC5yb3VuZCh0aGlzLngpO1xuICAgICAgICB0aGlzLnkgPSBNYXRoLnJvdW5kKHRoaXMueSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn07XG5cbi8qKlxuICogQ29uc3RydWN0IGEgcG9pbnQgZnJvbSBhbiBhcnJheSBpZiBuZWNlc3NhcnksIG90aGVyd2lzZSBpZiB0aGUgaW5wdXRcbiAqIGlzIGFscmVhZHkgYSBQb2ludCwgb3IgYW4gdW5rbm93biB0eXBlLCByZXR1cm4gaXQgdW5jaGFuZ2VkXG4gKiBAcGFyYW0ge0FycmF5PE51bWJlcj58UG9pbnR8Kn0gYSBhbnkga2luZCBvZiBpbnB1dCB2YWx1ZVxuICogQHJldHVybiB7UG9pbnR9IGNvbnN0cnVjdGVkIHBvaW50LCBvciBwYXNzZWQtdGhyb3VnaCB2YWx1ZS5cbiAqIEBleGFtcGxlXG4gKiAvLyB0aGlzXG4gKiB2YXIgcG9pbnQgPSBQb2ludC5jb252ZXJ0KFswLCAxXSk7XG4gKiAvLyBpcyBlcXVpdmFsZW50IHRvXG4gKiB2YXIgcG9pbnQgPSBuZXcgUG9pbnQoMCwgMSk7XG4gKi9cblBvaW50LmNvbnZlcnQgPSBmdW5jdGlvbiAoYSkge1xuICAgIGlmIChhIGluc3RhbmNlb2YgUG9pbnQpIHtcbiAgICAgICAgcmV0dXJuIGE7XG4gICAgfVxuICAgIGlmIChBcnJheS5pc0FycmF5KGEpKSB7XG4gICAgICAgIHJldHVybiBuZXcgUG9pbnQoYVswXSwgYVsxXSk7XG4gICAgfVxuICAgIHJldHVybiBhO1xufTtcbiIsIi8vIEBmbG93XG4vKiBlc2xpbnQtZW52IGJyb3dzZXIgKi9cbmltcG9ydCB0eXBlIHtXaW5kb3d9IGZyb20gJy4uLy4uL3R5cGVzL3dpbmRvdyc7XG5cbmV4cG9ydCBkZWZhdWx0IChzZWxmOiBXaW5kb3cpO1xuIiwiLy8gQGZsb3dcblxuLyoqXG4gKiBEZWVwbHkgY29tcGFyZXMgdHdvIG9iamVjdCBsaXRlcmFscy5cbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBkZWVwRXF1YWwoYTogP21peGVkLCBiOiA/bWl4ZWQpOiBib29sZWFuIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShhKSkge1xuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoYikgfHwgYS5sZW5ndGggIT09IGIubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKCFkZWVwRXF1YWwoYVtpXSwgYltpXSkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBhID09PSAnb2JqZWN0JyAmJiBhICE9PSBudWxsICYmIGIgIT09IG51bGwpIHtcbiAgICAgICAgaWYgKCEodHlwZW9mIGIgPT09ICdvYmplY3QnKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMoYSk7XG4gICAgICAgIGlmIChrZXlzLmxlbmd0aCAhPT0gT2JqZWN0LmtleXMoYikubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIGEpIHtcbiAgICAgICAgICAgIGlmICghZGVlcEVxdWFsKGFba2V5XSwgYltrZXldKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gYSA9PT0gYjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZGVlcEVxdWFsO1xuIiwiLy8gQGZsb3dcblxuaW1wb3J0IFVuaXRCZXppZXIgZnJvbSAnQG1hcGJveC91bml0YmV6aWVyJztcblxuaW1wb3J0IFBvaW50IGZyb20gJ0BtYXBib3gvcG9pbnQtZ2VvbWV0cnknO1xuaW1wb3J0IHdpbmRvdyBmcm9tICcuL3dpbmRvdyc7XG5cbmltcG9ydCB0eXBlIHtDYWxsYmFja30gZnJvbSAnLi4vdHlwZXMvY2FsbGJhY2snO1xuXG4vKipcbiAqIEBtb2R1bGUgdXRpbFxuICogQHByaXZhdGVcbiAqL1xuXG4vKipcbiAqIEdpdmVuIGEgdmFsdWUgYHRgIHRoYXQgdmFyaWVzIGJldHdlZW4gMCBhbmQgMSwgcmV0dXJuXG4gKiBhbiBpbnRlcnBvbGF0aW9uIGZ1bmN0aW9uIHRoYXQgZWFzZXMgYmV0d2VlbiAwIGFuZCAxIGluIGEgcGxlYXNpbmdcbiAqIGN1YmljIGluLW91dCBmYXNoaW9uLlxuICpcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlYXNlQ3ViaWNJbk91dCh0OiBudW1iZXIpOiBudW1iZXIge1xuICAgIGlmICh0IDw9IDApIHJldHVybiAwO1xuICAgIGlmICh0ID49IDEpIHJldHVybiAxO1xuICAgIGNvbnN0IHQyID0gdCAqIHQsXG4gICAgICAgIHQzID0gdDIgKiB0O1xuICAgIHJldHVybiA0ICogKHQgPCAwLjUgPyB0MyA6IDMgKiAodCAtIHQyKSArIHQzIC0gMC43NSk7XG59XG5cbi8qKlxuICogR2l2ZW4gZ2l2ZW4gKHgsIHkpLCAoeDEsIHkxKSBjb250cm9sIHBvaW50cyBmb3IgYSBiZXppZXIgY3VydmUsXG4gKiByZXR1cm4gYSBmdW5jdGlvbiB0aGF0IGludGVycG9sYXRlcyBhbG9uZyB0aGF0IGN1cnZlLlxuICpcbiAqIEBwYXJhbSBwMXggY29udHJvbCBwb2ludCAxIHggY29vcmRpbmF0ZVxuICogQHBhcmFtIHAxeSBjb250cm9sIHBvaW50IDEgeSBjb29yZGluYXRlXG4gKiBAcGFyYW0gcDJ4IGNvbnRyb2wgcG9pbnQgMiB4IGNvb3JkaW5hdGVcbiAqIEBwYXJhbSBwMnkgY29udHJvbCBwb2ludCAyIHkgY29vcmRpbmF0ZVxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJlemllcihwMXg6IG51bWJlciwgcDF5OiBudW1iZXIsIHAyeDogbnVtYmVyLCBwMnk6IG51bWJlcik6ICh0OiBudW1iZXIpID0+IG51bWJlciB7XG4gICAgY29uc3QgYmV6aWVyID0gbmV3IFVuaXRCZXppZXIocDF4LCBwMXksIHAyeCwgcDJ5KTtcbiAgICByZXR1cm4gZnVuY3Rpb24odDogbnVtYmVyKSB7XG4gICAgICAgIHJldHVybiBiZXppZXIuc29sdmUodCk7XG4gICAgfTtcbn1cblxuLyoqXG4gKiBBIGRlZmF1bHQgYmV6aWVyLWN1cnZlIHBvd2VyZWQgZWFzaW5nIGZ1bmN0aW9uIHdpdGhcbiAqIGNvbnRyb2wgcG9pbnRzICgwLjI1LCAwLjEpIGFuZCAoMC4yNSwgMSlcbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgY29uc3QgZWFzZSA9IGJlemllcigwLjI1LCAwLjEsIDAuMjUsIDEpO1xuXG4vKipcbiAqIGNvbnN0cmFpbiBuIHRvIHRoZSBnaXZlbiByYW5nZSB2aWEgbWluICsgbWF4XG4gKlxuICogQHBhcmFtIG4gdmFsdWVcbiAqIEBwYXJhbSBtaW4gdGhlIG1pbmltdW0gdmFsdWUgdG8gYmUgcmV0dXJuZWRcbiAqIEBwYXJhbSBtYXggdGhlIG1heGltdW0gdmFsdWUgdG8gYmUgcmV0dXJuZWRcbiAqIEByZXR1cm5zIHRoZSBjbGFtcGVkIHZhbHVlXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY2xhbXAobjogbnVtYmVyLCBtaW46IG51bWJlciwgbWF4OiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiBNYXRoLm1pbihtYXgsIE1hdGgubWF4KG1pbiwgbikpO1xufVxuXG4vKipcbiAqIGNvbnN0cmFpbiBuIHRvIHRoZSBnaXZlbiByYW5nZSwgZXhjbHVkaW5nIHRoZSBtaW5pbXVtLCB2aWEgbW9kdWxhciBhcml0aG1ldGljXG4gKlxuICogQHBhcmFtIG4gdmFsdWVcbiAqIEBwYXJhbSBtaW4gdGhlIG1pbmltdW0gdmFsdWUgdG8gYmUgcmV0dXJuZWQsIGV4Y2x1c2l2ZVxuICogQHBhcmFtIG1heCB0aGUgbWF4aW11bSB2YWx1ZSB0byBiZSByZXR1cm5lZCwgaW5jbHVzaXZlXG4gKiBAcmV0dXJucyBjb25zdHJhaW5lZCBudW1iZXJcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3cmFwKG46IG51bWJlciwgbWluOiBudW1iZXIsIG1heDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICBjb25zdCBkID0gbWF4IC0gbWluO1xuICAgIGNvbnN0IHcgPSAoKG4gLSBtaW4pICUgZCArIGQpICUgZCArIG1pbjtcbiAgICByZXR1cm4gKHcgPT09IG1pbikgPyBtYXggOiB3O1xufVxuXG4vKlxuICogQ2FsbCBhbiBhc3luY2hyb25vdXMgZnVuY3Rpb24gb24gYW4gYXJyYXkgb2YgYXJndW1lbnRzLFxuICogY2FsbGluZyBgY2FsbGJhY2tgIHdpdGggdGhlIGNvbXBsZXRlZCByZXN1bHRzIG9mIGFsbCBjYWxscy5cbiAqXG4gKiBAcGFyYW0gYXJyYXkgaW5wdXQgdG8gZWFjaCBjYWxsIG9mIHRoZSBhc3luYyBmdW5jdGlvbi5cbiAqIEBwYXJhbSBmbiBhbiBhc3luYyBmdW5jdGlvbiB3aXRoIHNpZ25hdHVyZSAoZGF0YSwgY2FsbGJhY2spXG4gKiBAcGFyYW0gY2FsbGJhY2sgYSBjYWxsYmFjayBydW4gYWZ0ZXIgYWxsIGFzeW5jIHdvcmsgaXMgZG9uZS5cbiAqIGNhbGxlZCB3aXRoIGFuIGFycmF5LCBjb250YWluaW5nIHRoZSByZXN1bHRzIG9mIGVhY2ggYXN5bmMgY2FsbC5cbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3luY0FsbDxJdGVtLCBSZXN1bHQ+KFxuICAgIGFycmF5OiBBcnJheTxJdGVtPixcbiAgICBmbjogKGl0ZW06IEl0ZW0sIGZuQ2FsbGJhY2s6IENhbGxiYWNrPFJlc3VsdD4pID0+IHZvaWQsXG4gICAgY2FsbGJhY2s6IENhbGxiYWNrPEFycmF5PFJlc3VsdD4+XG4pIHtcbiAgICBpZiAoIWFycmF5Lmxlbmd0aCkgeyByZXR1cm4gY2FsbGJhY2sobnVsbCwgW10pOyB9XG4gICAgbGV0IHJlbWFpbmluZyA9IGFycmF5Lmxlbmd0aDtcbiAgICBjb25zdCByZXN1bHRzID0gbmV3IEFycmF5KGFycmF5Lmxlbmd0aCk7XG4gICAgbGV0IGVycm9yID0gbnVsbDtcbiAgICBhcnJheS5mb3JFYWNoKChpdGVtLCBpKSA9PiB7XG4gICAgICAgIGZuKGl0ZW0sIChlcnIsIHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgaWYgKGVycikgZXJyb3IgPSBlcnI7XG4gICAgICAgICAgICByZXN1bHRzW2ldID0gKChyZXN1bHQ6IGFueSk6IFJlc3VsdCk7IC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9mbG93L2lzc3Vlcy8yMTIzXG4gICAgICAgICAgICBpZiAoLS1yZW1haW5pbmcgPT09IDApIGNhbGxiYWNrKGVycm9yLCByZXN1bHRzKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbi8qXG4gKiBQb2x5ZmlsbCBmb3IgT2JqZWN0LnZhbHVlcy4gTm90IGZ1bGx5IHNwZWMgY29tcGxpYW50LCBidXQgd2UgZG9uJ3RcbiAqIG5lZWQgaXQgdG8gYmUuXG4gKlxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbHVlczxUPihvYmo6IHtba2V5OiBzdHJpbmddOiBUfSk6IEFycmF5PFQ+IHtcbiAgICBjb25zdCByZXN1bHQgPSBbXTtcbiAgICBmb3IgKGNvbnN0IGsgaW4gb2JqKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKG9ialtrXSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbi8qXG4gKiBDb21wdXRlIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gdGhlIGtleXMgaW4gb25lIG9iamVjdCBhbmQgdGhlIGtleXNcbiAqIGluIGFub3RoZXIgb2JqZWN0LlxuICpcbiAqIEByZXR1cm5zIGtleXMgZGlmZmVyZW5jZVxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGtleXNEaWZmZXJlbmNlPFMsIFQ+KG9iajoge1trZXk6IHN0cmluZ106IFN9LCBvdGhlcjoge1trZXk6IHN0cmluZ106IFR9KTogQXJyYXk8c3RyaW5nPiB7XG4gICAgY29uc3QgZGlmZmVyZW5jZSA9IFtdO1xuICAgIGZvciAoY29uc3QgaSBpbiBvYmopIHtcbiAgICAgICAgaWYgKCEoaSBpbiBvdGhlcikpIHtcbiAgICAgICAgICAgIGRpZmZlcmVuY2UucHVzaChpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGlmZmVyZW5jZTtcbn1cblxuLyoqXG4gKiBHaXZlbiBhIGRlc3RpbmF0aW9uIG9iamVjdCBhbmQgb3B0aW9uYWxseSBtYW55IHNvdXJjZSBvYmplY3RzLFxuICogY29weSBhbGwgcHJvcGVydGllcyBmcm9tIHRoZSBzb3VyY2Ugb2JqZWN0cyBpbnRvIHRoZSBkZXN0aW5hdGlvbi5cbiAqIFRoZSBsYXN0IHNvdXJjZSBvYmplY3QgZ2l2ZW4gb3ZlcnJpZGVzIHByb3BlcnRpZXMgZnJvbSBwcmV2aW91c1xuICogc291cmNlIG9iamVjdHMuXG4gKlxuICogQHBhcmFtIGRlc3QgZGVzdGluYXRpb24gb2JqZWN0XG4gKiBAcGFyYW0gc291cmNlcyBzb3VyY2VzIGZyb20gd2hpY2ggcHJvcGVydGllcyBhcmUgcHVsbGVkXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZXh0ZW5kKGRlc3Q6IE9iamVjdCwgLi4uc291cmNlczogQXJyYXk8P09iamVjdD4pOiBPYmplY3Qge1xuICAgIGZvciAoY29uc3Qgc3JjIG9mIHNvdXJjZXMpIHtcbiAgICAgICAgZm9yIChjb25zdCBrIGluIHNyYykge1xuICAgICAgICAgICAgZGVzdFtrXSA9IHNyY1trXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGVzdDtcbn1cblxuLyoqXG4gKiBHaXZlbiBhbiBvYmplY3QgYW5kIGEgbnVtYmVyIG9mIHByb3BlcnRpZXMgYXMgc3RyaW5ncywgcmV0dXJuIHZlcnNpb25cbiAqIG9mIHRoYXQgb2JqZWN0IHdpdGggb25seSB0aG9zZSBwcm9wZXJ0aWVzLlxuICpcbiAqIEBwYXJhbSBzcmMgdGhlIG9iamVjdFxuICogQHBhcmFtIHByb3BlcnRpZXMgYW4gYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMgY2hvc2VuXG4gKiB0byBhcHBlYXIgb24gdGhlIHJlc3VsdGluZyBvYmplY3QuXG4gKiBAcmV0dXJucyBvYmplY3Qgd2l0aCBsaW1pdGVkIHByb3BlcnRpZXMuXG4gKiBAZXhhbXBsZVxuICogdmFyIGZvbyA9IHsgbmFtZTogJ0NoYXJsaWUnLCBhZ2U6IDEwIH07XG4gKiB2YXIganVzdE5hbWUgPSBwaWNrKGZvbywgWyduYW1lJ10pO1xuICogLy8ganVzdE5hbWUgPSB7IG5hbWU6ICdDaGFybGllJyB9XG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gcGljayhzcmM6IE9iamVjdCwgcHJvcGVydGllczogQXJyYXk8c3RyaW5nPik6IE9iamVjdCB7XG4gICAgY29uc3QgcmVzdWx0ID0ge307XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcm9wZXJ0aWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGsgPSBwcm9wZXJ0aWVzW2ldO1xuICAgICAgICBpZiAoayBpbiBzcmMpIHtcbiAgICAgICAgICAgIHJlc3VsdFtrXSA9IHNyY1trXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5sZXQgaWQgPSAxO1xuXG4vKipcbiAqIFJldHVybiBhIHVuaXF1ZSBudW1lcmljIGlkLCBzdGFydGluZyBhdCAxIGFuZCBpbmNyZW1lbnRpbmcgd2l0aFxuICogZWFjaCBjYWxsLlxuICpcbiAqIEByZXR1cm5zIHVuaXF1ZSBudW1lcmljIGlkLlxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVuaXF1ZUlkKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIGlkKys7XG59XG5cbi8qKlxuICogUmV0dXJuIGEgcmFuZG9tIFVVSUQgKHY0KS4gVGFrZW4gZnJvbTogaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vamVkLzk4Mjg4M1xuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHV1aWQoKTogc3RyaW5nIHtcbiAgICBmdW5jdGlvbiBiKGEpIHtcbiAgICAgICAgcmV0dXJuIGEgPyAoYSBeIE1hdGgucmFuZG9tKCkgKiAxNiA+PiBhIC8gNCkudG9TdHJpbmcoMTYpIDpcbiAgICAgICAgLy8kRmxvd0ZpeE1lOiBGbG93IGRvZXNuJ3QgbGlrZSB0aGUgaW1wbGllZCBhcnJheSBsaXRlcmFsIGNvbnZlcnNpb24gaGVyZVxuICAgICAgICAgICAgKFsxZTddICsgLVsxZTNdICsgLTRlMyArIC04ZTMgKyAtMWUxMSkucmVwbGFjZSgvWzAxOF0vZywgYik7XG4gICAgfVxuICAgIHJldHVybiBiKCk7XG59XG5cbi8qKlxuICogVmFsaWRhdGUgYSBzdHJpbmcgdG8gbWF0Y2ggVVVJRCh2NCkgb2YgdGhlXG4gKiBmb3JtOiB4eHh4eHh4eC14eHh4LTR4eHgtWzg5YWJdeHh4LXh4eHh4eHh4eHh4eFxuICogQHBhcmFtIHN0ciBzdHJpbmcgdG8gdmFsaWRhdGUuXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVVdWlkKHN0cjogP3N0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBzdHIgPyAvXlswLTlhLWZdezh9LVswLTlhLWZdezR9LVs0XVswLTlhLWZdezN9LVs4OWFiXVswLTlhLWZdezN9LVswLTlhLWZdezEyfSQvaS50ZXN0KHN0cikgOiBmYWxzZTtcbn1cblxuLyoqXG4gKiBHaXZlbiBhbiBhcnJheSBvZiBtZW1iZXIgZnVuY3Rpb24gbmFtZXMgYXMgc3RyaW5ncywgcmVwbGFjZSBhbGwgb2YgdGhlbVxuICogd2l0aCBib3VuZCB2ZXJzaW9ucyB0aGF0IHdpbGwgYWx3YXlzIHJlZmVyIHRvIGBjb250ZXh0YCBhcyBgdGhpc2AuIFRoaXNcbiAqIGlzIHVzZWZ1bCBmb3IgY2xhc3NlcyB3aGVyZSBvdGhlcndpc2UgZXZlbnQgYmluZGluZ3Mgd291bGQgcmVhc3NpZ25cbiAqIGB0aGlzYCB0byB0aGUgZXZlbnRlZCBvYmplY3Qgb3Igc29tZSBvdGhlciB2YWx1ZTogdGhpcyBsZXRzIHlvdSBlbnN1cmVcbiAqIHRoZSBgdGhpc2AgdmFsdWUgYWx3YXlzLlxuICpcbiAqIEBwYXJhbSBmbnMgbGlzdCBvZiBtZW1iZXIgZnVuY3Rpb24gbmFtZXNcbiAqIEBwYXJhbSBjb250ZXh0IHRoZSBjb250ZXh0IHZhbHVlXG4gKiBAZXhhbXBsZVxuICogZnVuY3Rpb24gTXlDbGFzcygpIHtcbiAqICAgYmluZEFsbChbJ29udGltZXInXSwgdGhpcyk7XG4gKiAgIHRoaXMubmFtZSA9ICdUb20nO1xuICogfVxuICogTXlDbGFzcy5wcm90b3R5cGUub250aW1lciA9IGZ1bmN0aW9uKCkge1xuICogICBhbGVydCh0aGlzLm5hbWUpO1xuICogfTtcbiAqIHZhciBteUNsYXNzID0gbmV3IE15Q2xhc3MoKTtcbiAqIHNldFRpbWVvdXQobXlDbGFzcy5vbnRpbWVyLCAxMDApO1xuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJpbmRBbGwoZm5zOiBBcnJheTxzdHJpbmc+LCBjb250ZXh0OiBPYmplY3QpOiB2b2lkIHtcbiAgICBmbnMuZm9yRWFjaCgoZm4pID0+IHtcbiAgICAgICAgaWYgKCFjb250ZXh0W2ZuXSkgeyByZXR1cm47IH1cbiAgICAgICAgY29udGV4dFtmbl0gPSBjb250ZXh0W2ZuXS5iaW5kKGNvbnRleHQpO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHN0cmluZyBlbmRzIHdpdGggYSBwYXJ0aWN1bGFyIHN1YnN0cmluZ1xuICpcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbmRzV2l0aChzdHJpbmc6IHN0cmluZywgc3VmZml4OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gc3RyaW5nLmluZGV4T2Yoc3VmZml4LCBzdHJpbmcubGVuZ3RoIC0gc3VmZml4Lmxlbmd0aCkgIT09IC0xO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhbiBvYmplY3QgYnkgbWFwcGluZyBhbGwgdGhlIHZhbHVlcyBvZiBhbiBleGlzdGluZyBvYmplY3Qgd2hpbGVcbiAqIHByZXNlcnZpbmcgdGhlaXIga2V5cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFwT2JqZWN0KGlucHV0OiBPYmplY3QsIGl0ZXJhdG9yOiBGdW5jdGlvbiwgY29udGV4dD86IE9iamVjdCk6IE9iamVjdCB7XG4gICAgY29uc3Qgb3V0cHV0ID0ge307XG4gICAgZm9yIChjb25zdCBrZXkgaW4gaW5wdXQpIHtcbiAgICAgICAgb3V0cHV0W2tleV0gPSBpdGVyYXRvci5jYWxsKGNvbnRleHQgfHwgdGhpcywgaW5wdXRba2V5XSwga2V5LCBpbnB1dCk7XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG59XG5cbi8qKlxuICogQ3JlYXRlIGFuIG9iamVjdCBieSBmaWx0ZXJpbmcgb3V0IHZhbHVlcyBvZiBhbiBleGlzdGluZyBvYmplY3QuXG4gKlxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpbHRlck9iamVjdChpbnB1dDogT2JqZWN0LCBpdGVyYXRvcjogRnVuY3Rpb24sIGNvbnRleHQ/OiBPYmplY3QpOiBPYmplY3Qge1xuICAgIGNvbnN0IG91dHB1dCA9IHt9O1xuICAgIGZvciAoY29uc3Qga2V5IGluIGlucHV0KSB7XG4gICAgICAgIGlmIChpdGVyYXRvci5jYWxsKGNvbnRleHQgfHwgdGhpcywgaW5wdXRba2V5XSwga2V5LCBpbnB1dCkpIHtcbiAgICAgICAgICAgIG91dHB1dFtrZXldID0gaW5wdXRba2V5XTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0O1xufVxuXG5pbXBvcnQgZGVlcEVxdWFsIGZyb20gJy4uL3N0eWxlLXNwZWMvdXRpbC9kZWVwX2VxdWFsJztcbmV4cG9ydCB7ZGVlcEVxdWFsfTtcblxuLyoqXG4gKiBEZWVwbHkgY2xvbmVzIHR3byBvYmplY3RzLlxuICpcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbG9uZTxUPihpbnB1dDogVCk6IFQge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGlucHV0KSkge1xuICAgICAgICByZXR1cm4gaW5wdXQubWFwKGNsb25lKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBpbnB1dCA9PT0gJ29iamVjdCcgJiYgaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuICgobWFwT2JqZWN0KGlucHV0LCBjbG9uZSk6IGFueSk6IFQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBpbnB1dDtcbiAgICB9XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgdHdvIGFycmF5cyBoYXZlIGF0IGxlYXN0IG9uZSBjb21tb24gZWxlbWVudC5cbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gYXJyYXlzSW50ZXJzZWN0PFQ+KGE6IEFycmF5PFQ+LCBiOiBBcnJheTxUPik6IGJvb2xlYW4ge1xuICAgIGZvciAobGV0IGwgPSAwOyBsIDwgYS5sZW5ndGg7IGwrKykge1xuICAgICAgICBpZiAoYi5pbmRleE9mKGFbbF0pID49IDApIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogUHJpbnQgYSB3YXJuaW5nIG1lc3NhZ2UgdG8gdGhlIGNvbnNvbGUgYW5kIGVuc3VyZSBkdXBsaWNhdGUgd2FybmluZyBtZXNzYWdlc1xuICogYXJlIG5vdCBwcmludGVkLlxuICpcbiAqIEBwcml2YXRlXG4gKi9cbmNvbnN0IHdhcm5PbmNlSGlzdG9yeToge1trZXk6IHN0cmluZ106IGJvb2xlYW59ID0ge307XG5cbmV4cG9ydCBmdW5jdGlvbiB3YXJuT25jZShtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIXdhcm5PbmNlSGlzdG9yeVttZXNzYWdlXSkge1xuICAgICAgICAvLyBjb25zb2xlIGlzbid0IGRlZmluZWQgaW4gc29tZSBXZWJXb3JrZXJzLCBzZWUgIzI1NThcbiAgICAgICAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSBcInVuZGVmaW5lZFwiKSBjb25zb2xlLndhcm4obWVzc2FnZSk7XG4gICAgICAgIHdhcm5PbmNlSGlzdG9yeVttZXNzYWdlXSA9IHRydWU7XG4gICAgfVxufVxuXG4vKipcbiAqIEluZGljYXRlcyBpZiB0aGUgcHJvdmlkZWQgUG9pbnRzIGFyZSBpbiBhIGNvdW50ZXIgY2xvY2t3aXNlICh0cnVlKSBvciBjbG9ja3dpc2UgKGZhbHNlKSBvcmRlclxuICpcbiAqIEBwcml2YXRlXG4gKiBAcmV0dXJucyB0cnVlIGZvciBhIGNvdW50ZXIgY2xvY2t3aXNlIHNldCBvZiBwb2ludHNcbiAqL1xuLy8gaHR0cDovL2JyeWNlYm9lLmNvbS8yMDA2LzEwLzIzL2xpbmUtc2VnbWVudC1pbnRlcnNlY3Rpb24tYWxnb3JpdGhtL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQ291bnRlckNsb2Nrd2lzZShhOiBQb2ludCwgYjogUG9pbnQsIGM6IFBvaW50KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIChjLnkgLSBhLnkpICogKGIueCAtIGEueCkgPiAoYi55IC0gYS55KSAqIChjLnggLSBhLngpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHNpZ25lZCBhcmVhIGZvciB0aGUgcG9seWdvbiByaW5nLiAgUG9zdGl2ZSBhcmVhcyBhcmUgZXh0ZXJpb3IgcmluZ3MgYW5kXG4gKiBoYXZlIGEgY2xvY2t3aXNlIHdpbmRpbmcuICBOZWdhdGl2ZSBhcmVhcyBhcmUgaW50ZXJpb3IgcmluZ3MgYW5kIGhhdmUgYSBjb3VudGVyIGNsb2Nrd2lzZVxuICogb3JkZXJpbmcuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSByaW5nIEV4dGVyaW9yIG9yIGludGVyaW9yIHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhbGN1bGF0ZVNpZ25lZEFyZWEocmluZzogQXJyYXk8UG9pbnQ+KTogbnVtYmVyIHtcbiAgICBsZXQgc3VtID0gMDtcbiAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gcmluZy5sZW5ndGgsIGogPSBsZW4gLSAxLCBwMSwgcDI7IGkgPCBsZW47IGogPSBpKyspIHtcbiAgICAgICAgcDEgPSByaW5nW2ldO1xuICAgICAgICBwMiA9IHJpbmdbal07XG4gICAgICAgIHN1bSArPSAocDIueCAtIHAxLngpICogKHAxLnkgKyBwMi55KTtcbiAgICB9XG4gICAgcmV0dXJuIHN1bTtcbn1cblxuLyoqXG4gKiBEZXRlY3RzIGNsb3NlZCBwb2x5Z29ucywgZmlyc3QgKyBsYXN0IHBvaW50IGFyZSBlcXVhbFxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0gcG9pbnRzIGFycmF5IG9mIHBvaW50c1xuICogQHJldHVybiB0cnVlIGlmIHRoZSBwb2ludHMgYXJlIGEgY2xvc2VkIHBvbHlnb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQ2xvc2VkUG9seWdvbihwb2ludHM6IEFycmF5PFBvaW50Pik6IGJvb2xlYW4ge1xuICAgIC8vIElmIGl0IGlzIDIgcG9pbnRzIHRoYXQgYXJlIHRoZSBzYW1lIHRoZW4gaXQgaXMgYSBwb2ludFxuICAgIC8vIElmIGl0IGlzIDMgcG9pbnRzIHdpdGggc3RhcnQgYW5kIGVuZCB0aGUgc2FtZSB0aGVuIGl0IGlzIGEgbGluZVxuICAgIGlmIChwb2ludHMubGVuZ3RoIDwgNClcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgY29uc3QgcDEgPSBwb2ludHNbMF07XG4gICAgY29uc3QgcDIgPSBwb2ludHNbcG9pbnRzLmxlbmd0aCAtIDFdO1xuXG4gICAgaWYgKE1hdGguYWJzKHAxLnggLSBwMi54KSA+IDAgfHxcbiAgICAgICAgTWF0aC5hYnMocDEueSAtIHAyLnkpID4gMCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gcG9seWdvbiBzaW1wbGlmaWNhdGlvbiBjYW4gcHJvZHVjZSBwb2x5Z29ucyB3aXRoIHplcm8gYXJlYSBhbmQgbW9yZSB0aGFuIDMgcG9pbnRzXG4gICAgcmV0dXJuIE1hdGguYWJzKGNhbGN1bGF0ZVNpZ25lZEFyZWEocG9pbnRzKSkgPiAwLjAxO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIHNwaGVyaWNhbCBjb29yZGluYXRlcyB0byBjYXJ0ZXNpYW4gY29vcmRpbmF0ZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSBzcGhlcmljYWwgU3BoZXJpY2FsIGNvb3JkaW5hdGVzLCBpbiBbcmFkaWFsLCBhemltdXRoYWwsIHBvbGFyXVxuICogQHJldHVybiBjYXJ0ZXNpYW4gY29vcmRpbmF0ZXMgaW4gW3gsIHksIHpdXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHNwaGVyaWNhbFRvQ2FydGVzaWFuKFtyLCBhemltdXRoYWwsIHBvbGFyXTogW251bWJlciwgbnVtYmVyLCBudW1iZXJdKToge3g6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXJ9IHtcbiAgICAvLyBXZSBhYnN0cmFjdCBcIm5vcnRoXCIvXCJ1cFwiIChjb21wYXNzLXdpc2UpIHRvIGJlIDDCsCB3aGVuIHJlYWxseSB0aGlzIGlzIDkwwrAgKM+ALzIpOlxuICAgIC8vIGNvcnJlY3QgZm9yIHRoYXQgaGVyZVxuICAgIGF6aW11dGhhbCArPSA5MDtcblxuICAgIC8vIENvbnZlcnQgYXppbXV0aGFsIGFuZCBwb2xhciBhbmdsZXMgdG8gcmFkaWFuc1xuICAgIGF6aW11dGhhbCAqPSBNYXRoLlBJIC8gMTgwO1xuICAgIHBvbGFyICo9IE1hdGguUEkgLyAxODA7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICB4OiByICogTWF0aC5jb3MoYXppbXV0aGFsKSAqIE1hdGguc2luKHBvbGFyKSxcbiAgICAgICAgeTogciAqIE1hdGguc2luKGF6aW11dGhhbCkgKiBNYXRoLnNpbihwb2xhciksXG4gICAgICAgIHo6IHIgKiBNYXRoLmNvcyhwb2xhcilcbiAgICB9O1xufVxuXG4vKipcbiAqIFBhcnNlcyBkYXRhIGZyb20gJ0NhY2hlLUNvbnRyb2wnIGhlYWRlcnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSBjYWNoZUNvbnRyb2wgVmFsdWUgb2YgJ0NhY2hlLUNvbnRyb2wnIGhlYWRlclxuICogQHJldHVybiBvYmplY3QgY29udGFpbmluZyBwYXJzZWQgaGVhZGVyIGluZm8uXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQ2FjaGVDb250cm9sKGNhY2hlQ29udHJvbDogc3RyaW5nKTogT2JqZWN0IHtcbiAgICAvLyBUYWtlbiBmcm9tIFtXcmVja10oaHR0cHM6Ly9naXRodWIuY29tL2hhcGlqcy93cmVjaylcbiAgICBjb25zdCByZSA9IC8oPzpefCg/OlxccypcXCxcXHMqKSkoW15cXHgwMC1cXHgyMFxcKFxcKTw+QFxcLDtcXDpcXFxcXCJcXC9cXFtcXF1cXD9cXD1cXHtcXH1cXHg3Rl0rKSg/OlxcPSg/OihbXlxceDAwLVxceDIwXFwoXFwpPD5AXFwsO1xcOlxcXFxcIlxcL1xcW1xcXVxcP1xcPVxce1xcfVxceDdGXSspfCg/OlxcXCIoKD86W15cIlxcXFxdfFxcXFwuKSopXFxcIikpKT8vZztcblxuICAgIGNvbnN0IGhlYWRlciA9IHt9O1xuICAgIGNhY2hlQ29udHJvbC5yZXBsYWNlKHJlLCAoJDAsICQxLCAkMiwgJDMpID0+IHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSAkMiB8fCAkMztcbiAgICAgICAgaGVhZGVyWyQxXSA9IHZhbHVlID8gdmFsdWUudG9Mb3dlckNhc2UoKSA6IHRydWU7XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9KTtcblxuICAgIGlmIChoZWFkZXJbJ21heC1hZ2UnXSkge1xuICAgICAgICBjb25zdCBtYXhBZ2UgPSBwYXJzZUludChoZWFkZXJbJ21heC1hZ2UnXSwgMTApO1xuICAgICAgICBpZiAoaXNOYU4obWF4QWdlKSkgZGVsZXRlIGhlYWRlclsnbWF4LWFnZSddO1xuICAgICAgICBlbHNlIGhlYWRlclsnbWF4LWFnZSddID0gbWF4QWdlO1xuICAgIH1cblxuICAgIHJldHVybiBoZWFkZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdG9yYWdlQXZhaWxhYmxlKHR5cGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHN0b3JhZ2UgPSB3aW5kb3dbdHlwZV07XG4gICAgICAgIHN0b3JhZ2Uuc2V0SXRlbSgnX21hcGJveF90ZXN0XycsIDEpO1xuICAgICAgICBzdG9yYWdlLnJlbW92ZUl0ZW0oJ19tYXBib3hfdGVzdF8nKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG4vLyBUaGUgZm9sbG93aW5nIG1ldGhvZHMgYXJlIGZyb20gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1dpbmRvd0Jhc2U2NC9CYXNlNjRfZW5jb2RpbmdfYW5kX2RlY29kaW5nI1RoZV9Vbmljb2RlX1Byb2JsZW1cbi8vVW5pY29kZSBjb21wbGlhbnQgYmFzZTY0IGVuY29kZXIgZm9yIHN0cmluZ3NcbmV4cG9ydCBmdW5jdGlvbiBiNjRFbmNvZGVVbmljb2RlKHN0cjogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5idG9hKFxuICAgICAgICBlbmNvZGVVUklDb21wb25lbnQoc3RyKS5yZXBsYWNlKC8lKFswLTlBLUZdezJ9KS9nLFxuICAgICAgICAgICAgKG1hdGNoLCBwMSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKE51bWJlcignMHgnICsgcDEpKTsgLy9lc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgICAgICAgICB9XG4gICAgICAgIClcbiAgICApO1xufVxuXG4vLyBVbmljb2RlIGNvbXBsaWFudCBkZWNvZGVyIGZvciBiYXNlNjQtZW5jb2RlZCBzdHJpbmdzXG5leHBvcnQgZnVuY3Rpb24gYjY0RGVjb2RlVW5pY29kZShzdHI6IHN0cmluZykge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQod2luZG93LmF0b2Ioc3RyKS5zcGxpdCgnJykubWFwKChjKSA9PiB7XG4gICAgICAgIHJldHVybiAnJScgKyAoJzAwJyArIGMuY2hhckNvZGVBdCgwKS50b1N0cmluZygxNikpLnNsaWNlKC0yKTsgLy9lc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgfSkuam9pbignJykpO1xufVxuIiwiLy8gQGZsb3cgc3RyaWN0XG5cbnR5cGUgQ29uZmlnID0ge3xcbiAgQVBJX1VSTDogc3RyaW5nLFxuICBFVkVOVFNfVVJMOiA/c3RyaW5nLFxuICBGRUVEQkFDS19VUkw6IHN0cmluZyxcbiAgUkVRVUlSRV9BQ0NFU1NfVE9LRU46IGJvb2xlYW4sXG4gIEFDQ0VTU19UT0tFTjogP3N0cmluZyxcbiAgTUFYX1BBUkFMTEVMX0lNQUdFX1JFUVVFU1RTOiBudW1iZXJcbnx9O1xuXG5jb25zdCBjb25maWc6IENvbmZpZyA9IHtcbiAgICBBUElfVVJMOiAnaHR0cHM6Ly9hcGkubWFwYm94LmNvbScsXG4gICAgZ2V0IEVWRU5UU19VUkwoKSB7XG4gICAgICAgIGlmICghdGhpcy5BUElfVVJMKSB7IHJldHVybiBudWxsOyB9XG4gICAgICAgIGlmICh0aGlzLkFQSV9VUkwuaW5kZXhPZignaHR0cHM6Ly9hcGkubWFwYm94LmNuJykgPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiAnaHR0cHM6Ly9ldmVudHMubWFwYm94LmNuL2V2ZW50cy92Mic7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5BUElfVVJMLmluZGV4T2YoJ2h0dHBzOi8vYXBpLm1hcGJveC5jb20nKSA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuICdodHRwczovL2V2ZW50cy5tYXBib3guY29tL2V2ZW50cy92Mic7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgRkVFREJBQ0tfVVJMOiAnaHR0cHM6Ly9hcHBzLm1hcGJveC5jb20vZmVlZGJhY2snLFxuICAgIFJFUVVJUkVfQUNDRVNTX1RPS0VOOiB0cnVlLFxuICAgIEFDQ0VTU19UT0tFTjogbnVsbCxcbiAgICBNQVhfUEFSQUxMRUxfSU1BR0VfUkVRVUVTVFM6IDE2XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjb25maWc7XG4iLCIvLyBAZmxvdyBzdHJpY3RcblxuaW1wb3J0IHdpbmRvdyBmcm9tICcuL3dpbmRvdyc7XG5pbXBvcnQgdHlwZSB7Q2FuY2VsYWJsZX0gZnJvbSAnLi4vdHlwZXMvY2FuY2VsYWJsZSc7XG5cbmNvbnN0IG5vdyA9IHdpbmRvdy5wZXJmb3JtYW5jZSAmJiB3aW5kb3cucGVyZm9ybWFuY2Uubm93ID9cbiAgICB3aW5kb3cucGVyZm9ybWFuY2Uubm93LmJpbmQod2luZG93LnBlcmZvcm1hbmNlKSA6XG4gICAgRGF0ZS5ub3cuYmluZChEYXRlKTtcblxuY29uc3QgcmFmID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgIHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgd2luZG93Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuXG5jb25zdCBjYW5jZWwgPSB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgfHxcbiAgICB3aW5kb3cubW96Q2FuY2VsQW5pbWF0aW9uRnJhbWUgfHxcbiAgICB3aW5kb3cud2Via2l0Q2FuY2VsQW5pbWF0aW9uRnJhbWUgfHxcbiAgICB3aW5kb3cubXNDYW5jZWxBbmltYXRpb25GcmFtZTtcblxubGV0IGxpbmtFbDtcblxubGV0IHJlZHVjZWRNb3Rpb25RdWVyeTogTWVkaWFRdWVyeUxpc3Q7XG5cbi8qKlxuICogQHByaXZhdGVcbiAqL1xuY29uc3QgZXhwb3J0ZWQgPSB7XG4gICAgLyoqXG4gICAgICogUHJvdmlkZXMgYSBmdW5jdGlvbiB0aGF0IG91dHB1dHMgbWlsbGlzZWNvbmRzOiBlaXRoZXIgcGVyZm9ybWFuY2Uubm93KClcbiAgICAgKiBvciBhIGZhbGxiYWNrIHRvIERhdGUubm93KClcbiAgICAgKi9cbiAgICBub3csXG5cbiAgICBmcmFtZShmbjogKCkgPT4gdm9pZCk6IENhbmNlbGFibGUge1xuICAgICAgICBjb25zdCBmcmFtZSA9IHJhZihmbik7XG4gICAgICAgIHJldHVybiB7Y2FuY2VsOiAoKSA9PiBjYW5jZWwoZnJhbWUpfTtcbiAgICB9LFxuXG4gICAgZ2V0SW1hZ2VEYXRhKGltZzogQ2FudmFzSW1hZ2VTb3VyY2UsIHBhZGRpbmc/OiBudW1iZXIgPSAwKTogSW1hZ2VEYXRhIHtcbiAgICAgICAgY29uc3QgY2FudmFzID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICBjb25zdCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIGlmICghY29udGV4dCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdmYWlsZWQgdG8gY3JlYXRlIGNhbnZhcyAyZCBjb250ZXh0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgY2FudmFzLndpZHRoID0gaW1nLndpZHRoO1xuICAgICAgICBjYW52YXMuaGVpZ2h0ID0gaW1nLmhlaWdodDtcbiAgICAgICAgY29udGV4dC5kcmF3SW1hZ2UoaW1nLCAwLCAwLCBpbWcud2lkdGgsIGltZy5oZWlnaHQpO1xuICAgICAgICByZXR1cm4gY29udGV4dC5nZXRJbWFnZURhdGEoLXBhZGRpbmcsIC1wYWRkaW5nLCBpbWcud2lkdGggKyAyICogcGFkZGluZywgaW1nLmhlaWdodCArIDIgKiBwYWRkaW5nKTtcbiAgICB9LFxuXG4gICAgcmVzb2x2ZVVSTChwYXRoOiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKCFsaW5rRWwpIGxpbmtFbCA9IHdpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgIGxpbmtFbC5ocmVmID0gcGF0aDtcbiAgICAgICAgcmV0dXJuIGxpbmtFbC5ocmVmO1xuICAgIH0sXG5cbiAgICBoYXJkd2FyZUNvbmN1cnJlbmN5OiB3aW5kb3cubmF2aWdhdG9yLmhhcmR3YXJlQ29uY3VycmVuY3kgfHwgNCxcblxuICAgIGdldCBkZXZpY2VQaXhlbFJhdGlvKCkgeyByZXR1cm4gd2luZG93LmRldmljZVBpeGVsUmF0aW87IH0sXG4gICAgZ2V0IHByZWZlcnNSZWR1Y2VkTW90aW9uKCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIXdpbmRvdy5tYXRjaE1lZGlhKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIC8vTGF6aWx5IGluaXRpYWxpemUgbWVkaWEgcXVlcnlcbiAgICAgICAgaWYgKHJlZHVjZWRNb3Rpb25RdWVyeSA9PSBudWxsKSB7XG4gICAgICAgICAgICByZWR1Y2VkTW90aW9uUXVlcnkgPSB3aW5kb3cubWF0Y2hNZWRpYSgnKHByZWZlcnMtcmVkdWNlZC1tb3Rpb246IHJlZHVjZSknKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVkdWNlZE1vdGlvblF1ZXJ5Lm1hdGNoZXM7XG4gICAgfSxcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGV4cG9ydGVkO1xuIiwiLy8gQGZsb3cgc3RyaWN0XG5cbmltcG9ydCB3aW5kb3cgZnJvbSAnLi93aW5kb3cnO1xuXG5jb25zdCBleHBvcnRlZCA9IHtcbiAgICBzdXBwb3J0ZWQ6IGZhbHNlLFxuICAgIHRlc3RTdXBwb3J0XG59O1xuXG5leHBvcnQgZGVmYXVsdCBleHBvcnRlZDtcblxubGV0IGdsRm9yVGVzdGluZztcbmxldCB3ZWJwQ2hlY2tDb21wbGV0ZSA9IGZhbHNlO1xubGV0IHdlYnBJbWdUZXN0O1xubGV0IHdlYnBJbWdUZXN0T25sb2FkQ29tcGxldGUgPSBmYWxzZTtcblxuaWYgKHdpbmRvdy5kb2N1bWVudCkge1xuICAgIHdlYnBJbWdUZXN0ID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuICAgIHdlYnBJbWdUZXN0Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoZ2xGb3JUZXN0aW5nKSB0ZXN0V2VicFRleHR1cmVVcGxvYWQoZ2xGb3JUZXN0aW5nKTtcbiAgICAgICAgZ2xGb3JUZXN0aW5nID0gbnVsbDtcbiAgICAgICAgd2VicEltZ1Rlc3RPbmxvYWRDb21wbGV0ZSA9IHRydWU7XG4gICAgfTtcbiAgICB3ZWJwSW1nVGVzdC5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHdlYnBDaGVja0NvbXBsZXRlID0gdHJ1ZTtcbiAgICAgICAgZ2xGb3JUZXN0aW5nID0gbnVsbDtcbiAgICB9O1xuICAgIHdlYnBJbWdUZXN0LnNyYyA9ICdkYXRhOmltYWdlL3dlYnA7YmFzZTY0LFVrbEdSaDRBQUFCWFJVSlFWbEE0VEJFQUFBQXZBUUFBQUFmUS8vNzN2LytCaU9oL0FBQT0nO1xufVxuXG5mdW5jdGlvbiB0ZXN0U3VwcG9ydChnbDogV2ViR0xSZW5kZXJpbmdDb250ZXh0KSB7XG4gICAgaWYgKHdlYnBDaGVja0NvbXBsZXRlIHx8ICF3ZWJwSW1nVGVzdCkgcmV0dXJuO1xuXG4gICAgLy8gSFRNTEltYWdlRWxlbWVudC5jb21wbGV0ZSBpcyBzZXQgd2hlbiBhbiBpbWFnZSBpcyBkb25lIGxvYWRpbmcgaXQncyBzb3VyY2VcbiAgICAvLyByZWdhcmRsZXNzIG9mIHdoZXRoZXIgdGhlIGxvYWQgd2FzIHN1Y2Nlc3NmdWwgb3Igbm90LlxuICAgIC8vIEl0J3MgcG9zc2libGUgZm9yIGFuIGVycm9yIHRvIHNldCBIVE1MSW1hZ2VFbGVtZW50LmNvbXBsZXRlIHRvIHRydWUgd2hpY2ggd291bGQgdHJpZ2dlclxuICAgIC8vIHRlc3RXZWJwVGV4dHVyZVVwbG9hZCBhbmQgbWlzdGFrZW5seSBzZXQgZXhwb3J0ZWQuc3VwcG9ydGVkIHRvIHRydWUgaW4gYnJvd3NlcnMgd2hpY2ggZG9uJ3Qgc3VwcG9ydCB3ZWJwXG4gICAgLy8gVG8gYXZvaWQgdGhpcywgd2Ugc2V0IGEgZmxhZyBpbiB0aGUgaW1hZ2UncyBvbmxvYWQgaGFuZGxlciBhbmQgb25seSBjYWxsIHRlc3RXZWJwVGV4dHVyZVVwbG9hZFxuICAgIC8vIGFmdGVyIGEgc3VjY2Vzc2Z1bCBpbWFnZSBsb2FkIGV2ZW50LlxuICAgIGlmICh3ZWJwSW1nVGVzdE9ubG9hZENvbXBsZXRlKSB7XG4gICAgICAgIHRlc3RXZWJwVGV4dHVyZVVwbG9hZChnbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZ2xGb3JUZXN0aW5nID0gZ2w7XG5cbiAgICB9XG59XG5cbmZ1bmN0aW9uIHRlc3RXZWJwVGV4dHVyZVVwbG9hZChnbDogV2ViR0xSZW5kZXJpbmdDb250ZXh0KSB7XG4gICAgLy8gRWRnZSAxOCBzdXBwb3J0cyBXZWJQIGJ1dCBub3QgdXBsb2FkaW5nIGEgV2ViUCBpbWFnZSB0byBhIGdsIHRleHR1cmVcbiAgICAvLyBUZXN0IHN1cHBvcnQgZm9yIHRoaXMgYmVmb3JlIGFsbG93aW5nIFdlYlAgaW1hZ2VzLlxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXBib3gvbWFwYm94LWdsLWpzL2lzc3Vlcy83NjcxXG4gICAgY29uc3QgdGV4dHVyZSA9IGdsLmNyZWF0ZVRleHR1cmUoKTtcbiAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0ZXh0dXJlKTtcblxuICAgIHRyeSB7XG4gICAgICAgIGdsLnRleEltYWdlMkQoZ2wuVEVYVFVSRV8yRCwgMCwgZ2wuUkdCQSwgZ2wuUkdCQSwgZ2wuVU5TSUdORURfQllURSwgd2VicEltZ1Rlc3QpO1xuXG4gICAgICAgIC8vIFRoZSBlcnJvciBkb2VzIG5vdCBnZXQgdHJpZ2dlcmVkIGluIEVkZ2UgaWYgdGhlIGNvbnRleHQgaXMgbG9zdFxuICAgICAgICBpZiAoZ2wuaXNDb250ZXh0TG9zdCgpKSByZXR1cm47XG5cbiAgICAgICAgZXhwb3J0ZWQuc3VwcG9ydGVkID0gdHJ1ZTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIENhdGNoIFwiVW5zcGVjaWZpZWQgRXJyb3IuXCIgaW4gRWRnZSAxOC5cbiAgICB9XG5cbiAgICBnbC5kZWxldGVUZXh0dXJlKHRleHR1cmUpO1xuXG4gICAgd2VicENoZWNrQ29tcGxldGUgPSB0cnVlO1xufVxuIiwiLy8gQGZsb3dcblxuLyoqKioqIFNUQVJUIFdBUk5JTkcgLSBJRiBZT1UgVVNFIFRISVMgQ09ERSBXSVRIIE1BUEJPWCBNQVBQSU5HIEFQSVMsIFJFTU9WQUwgT1JcbiogTU9ESUZJQ0FUSU9OIE9GIFRIRSBGT0xMT1dJTkcgQ09ERSBWSU9MQVRFUyBUSEUgTUFQQk9YIFRFUk1TIE9GIFNFUlZJQ0UgICoqKioqKlxuKiBUaGUgZm9sbG93aW5nIGNvZGUgaXMgdXNlZCB0byBhY2Nlc3MgTWFwYm94J3MgTWFwcGluZyBBUElzLiBSZW1vdmFsIG9yIG1vZGlmaWNhdGlvblxuKiBvZiB0aGlzIGNvZGUgd2hlbiB1c2VkIHdpdGggTWFwYm94J3MgTWFwcGluZyBBUElzIGNhbiByZXN1bHQgaW4gaGlnaGVyIGZlZXMgYW5kL29yXG4qIHRlcm1pbmF0aW9uIG9mIHlvdXIgYWNjb3VudCB3aXRoIE1hcGJveC5cbipcbiogVW5kZXIgdGhlIE1hcGJveCBUZXJtcyBvZiBTZXJ2aWNlLCB5b3UgbWF5IG5vdCB1c2UgdGhpcyBjb2RlIHRvIGFjY2VzcyBNYXBib3hcbiogTWFwcGluZyBBUElzIG90aGVyIHRoYW4gdGhyb3VnaCBNYXBib3ggU0RLcy5cbipcbiogVGhlIE1hcHBpbmcgQVBJcyBkb2N1bWVudGF0aW9uIGlzIGF2YWlsYWJsZSBhdCBodHRwczovL2RvY3MubWFwYm94LmNvbS9hcGkvbWFwcy8jbWFwc1xuKiBhbmQgdGhlIE1hcGJveCBUZXJtcyBvZiBTZXJ2aWNlIGFyZSBhdmFpbGFibGUgYXQgaHR0cHM6Ly93d3cubWFwYm94LmNvbS90b3MvXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbnR5cGUgU2t1VG9rZW5PYmplY3QgPSB7fFxuICAgIHRva2VuOiBzdHJpbmcsXG4gICAgdG9rZW5FeHBpcmVzQXQ6IG51bWJlclxufH07XG5cbmNvbnN0IFNLVV9JRCA9ICcwMSc7XG5cbmZ1bmN0aW9uIGNyZWF0ZVNrdVRva2VuKCk6IFNrdVRva2VuT2JqZWN0IHtcbiAgICAvLyBTS1VfSUQgYW5kIFRPS0VOX1ZFUlNJT04gYXJlIHNwZWNpZmllZCBieSBhbiBpbnRlcm5hbCBzY2hlbWEgYW5kIHNob3VsZCBub3QgY2hhbmdlXG4gICAgY29uc3QgVE9LRU5fVkVSU0lPTiA9ICcxJztcbiAgICBjb25zdCBiYXNlNjJjaGFycyA9ICcwMTIzNDU2Nzg5YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWic7XG4gICAgLy8gc2Vzc2lvblJhbmRvbWl6ZXIgaXMgYSByYW5kb21pemVkIDEwLWRpZ2l0IGJhc2UtNjIgbnVtYmVyXG4gICAgbGV0IHNlc3Npb25SYW5kb21pemVyID0gJyc7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG4gICAgICAgIHNlc3Npb25SYW5kb21pemVyICs9IGJhc2U2MmNoYXJzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDYyKV07XG4gICAgfVxuICAgIGNvbnN0IGV4cGlyYXRpb24gPSAxMiAqIDYwICogNjAgKiAxMDAwOyAvLyAxMiBob3Vyc1xuICAgIGNvbnN0IHRva2VuID0gW1RPS0VOX1ZFUlNJT04sIFNLVV9JRCwgc2Vzc2lvblJhbmRvbWl6ZXJdLmpvaW4oJycpO1xuICAgIGNvbnN0IHRva2VuRXhwaXJlc0F0ID0gRGF0ZS5ub3coKSArIGV4cGlyYXRpb247XG5cbiAgICByZXR1cm4ge3Rva2VuLCB0b2tlbkV4cGlyZXNBdH07XG59XG5cbmV4cG9ydCB7Y3JlYXRlU2t1VG9rZW4sIFNLVV9JRH07XG5cbi8qKioqKiBFTkQgV0FSTklORyAtIFJFTU9WQUwgT1IgTU9ESUZJQ0FUSU9OIE9GIFRIRVxuUFJFQ0VESU5HIENPREUgVklPTEFURVMgVEhFIE1BUEJPWCBURVJNUyBPRiBTRVJWSUNFICAqKioqKiovXG4iLCIvLyBAZmxvd1xuXG4vKioqKiogU1RBUlQgV0FSTklORyAtIElGIFlPVSBVU0UgVEhJUyBDT0RFIFdJVEggTUFQQk9YIE1BUFBJTkcgQVBJUywgUkVNT1ZBTCBPUlxuKiBNT0RJRklDQVRJT04gT0YgVEhFIEZPTExPV0lORyBDT0RFIFZJT0xBVEVTIFRIRSBNQVBCT1ggVEVSTVMgT0YgU0VSVklDRSAgKioqKioqXG4qIFRoZSBmb2xsb3dpbmcgY29kZSBpcyB1c2VkIHRvIGFjY2VzcyBNYXBib3gncyBNYXBwaW5nIEFQSXMuIFJlbW92YWwgb3IgbW9kaWZpY2F0aW9uXG4qIG9mIHRoaXMgY29kZSB3aGVuIHVzZWQgd2l0aCBNYXBib3gncyBNYXBwaW5nIEFQSXMgY2FuIHJlc3VsdCBpbiBoaWdoZXIgZmVlcyBhbmQvb3JcbiogdGVybWluYXRpb24gb2YgeW91ciBhY2NvdW50IHdpdGggTWFwYm94LlxuKlxuKiBVbmRlciB0aGUgTWFwYm94IFRlcm1zIG9mIFNlcnZpY2UsIHlvdSBtYXkgbm90IHVzZSB0aGlzIGNvZGUgdG8gYWNjZXNzIE1hcGJveFxuKiBNYXBwaW5nIEFQSXMgb3RoZXIgdGhhbiB0aHJvdWdoIE1hcGJveCBTREtzLlxuKlxuKiBUaGUgTWFwcGluZyBBUElzIGRvY3VtZW50YXRpb24gaXMgYXZhaWxhYmxlIGF0IGh0dHBzOi8vZG9jcy5tYXBib3guY29tL2FwaS9tYXBzLyNtYXBzXG4qIGFuZCB0aGUgTWFwYm94IFRlcm1zIG9mIFNlcnZpY2UgYXJlIGF2YWlsYWJsZSBhdCBodHRwczovL3d3dy5tYXBib3guY29tL3Rvcy9cbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuaW1wb3J0IGNvbmZpZyBmcm9tICcuL2NvbmZpZyc7XG5cbmltcG9ydCBicm93c2VyIGZyb20gJy4vYnJvd3Nlcic7XG5pbXBvcnQgd2luZG93IGZyb20gJy4vd2luZG93JztcbmltcG9ydCB3ZWJwU3VwcG9ydGVkIGZyb20gJy4vd2VicF9zdXBwb3J0ZWQnO1xuaW1wb3J0IHtjcmVhdGVTa3VUb2tlbiwgU0tVX0lEfSBmcm9tICcuL3NrdV90b2tlbic7XG5pbXBvcnQge3ZlcnNpb24gYXMgc2RrVmVyc2lvbn0gZnJvbSAnLi4vLi4vcGFja2FnZS5qc29uJztcbmltcG9ydCB7dXVpZCwgdmFsaWRhdGVVdWlkLCBzdG9yYWdlQXZhaWxhYmxlLCBiNjREZWNvZGVVbmljb2RlLCBiNjRFbmNvZGVVbmljb2RlLCB3YXJuT25jZSwgZXh0ZW5kfSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHtwb3N0RGF0YSwgUmVzb3VyY2VUeXBlfSBmcm9tICcuL2FqYXgnO1xuXG5pbXBvcnQgdHlwZSB7UmVxdWVzdFBhcmFtZXRlcnN9IGZyb20gJy4vYWpheCc7XG5pbXBvcnQgdHlwZSB7Q2FuY2VsYWJsZX0gZnJvbSAnLi4vdHlwZXMvY2FuY2VsYWJsZSc7XG5pbXBvcnQgdHlwZSB7VGlsZUpTT059IGZyb20gJy4uL3R5cGVzL3RpbGVqc29uJztcblxudHlwZSBSZXNvdXJjZVR5cGVFbnVtID0gJEtleXM8dHlwZW9mIFJlc291cmNlVHlwZT47XG5leHBvcnQgdHlwZSBSZXF1ZXN0VHJhbnNmb3JtRnVuY3Rpb24gPSAodXJsOiBzdHJpbmcsIHJlc291cmNlVHlwZT86IFJlc291cmNlVHlwZUVudW0pID0+IFJlcXVlc3RQYXJhbWV0ZXJzO1xuXG50eXBlIFVybE9iamVjdCA9IHt8XG4gICAgcHJvdG9jb2w6IHN0cmluZyxcbiAgICBhdXRob3JpdHk6IHN0cmluZyxcbiAgICBwYXRoOiBzdHJpbmcsXG4gICAgcGFyYW1zOiBBcnJheTxzdHJpbmc+XG58fTtcblxuZXhwb3J0IGNsYXNzIFJlcXVlc3RNYW5hZ2VyIHtcbiAgICBfc2t1VG9rZW46IHN0cmluZztcbiAgICBfc2t1VG9rZW5FeHBpcmVzQXQ6IG51bWJlcjtcbiAgICBfdHJhbnNmb3JtUmVxdWVzdEZuOiA/UmVxdWVzdFRyYW5zZm9ybUZ1bmN0aW9uO1xuICAgIF9jdXN0b21BY2Nlc3NUb2tlbjogP3N0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKHRyYW5zZm9ybVJlcXVlc3RGbj86IFJlcXVlc3RUcmFuc2Zvcm1GdW5jdGlvbiwgY3VzdG9tQWNjZXNzVG9rZW4/OiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5fdHJhbnNmb3JtUmVxdWVzdEZuID0gdHJhbnNmb3JtUmVxdWVzdEZuO1xuICAgICAgICB0aGlzLl9jdXN0b21BY2Nlc3NUb2tlbiA9IGN1c3RvbUFjY2Vzc1Rva2VuO1xuICAgICAgICB0aGlzLl9jcmVhdGVTa3VUb2tlbigpO1xuICAgIH1cblxuICAgIF9jcmVhdGVTa3VUb2tlbigpIHtcbiAgICAgICAgY29uc3Qgc2t1VG9rZW4gPSBjcmVhdGVTa3VUb2tlbigpO1xuICAgICAgICB0aGlzLl9za3VUb2tlbiA9IHNrdVRva2VuLnRva2VuO1xuICAgICAgICB0aGlzLl9za3VUb2tlbkV4cGlyZXNBdCA9IHNrdVRva2VuLnRva2VuRXhwaXJlc0F0O1xuICAgIH1cblxuICAgIF9pc1NrdVRva2VuRXhwaXJlZCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIERhdGUubm93KCkgPiB0aGlzLl9za3VUb2tlbkV4cGlyZXNBdDtcbiAgICB9XG5cbiAgICB0cmFuc2Zvcm1SZXF1ZXN0KHVybDogc3RyaW5nLCB0eXBlOiBSZXNvdXJjZVR5cGVFbnVtKSB7XG4gICAgICAgIGlmICh0aGlzLl90cmFuc2Zvcm1SZXF1ZXN0Rm4pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl90cmFuc2Zvcm1SZXF1ZXN0Rm4odXJsLCB0eXBlKSB8fCB7dXJsfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7dXJsfTtcbiAgICB9XG5cbiAgICBub3JtYWxpemVTdHlsZVVSTCh1cmw6IHN0cmluZywgYWNjZXNzVG9rZW4/OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICBpZiAoIWlzTWFwYm94VVJMKHVybCkpIHJldHVybiB1cmw7XG4gICAgICAgIGNvbnN0IHVybE9iamVjdCA9IHBhcnNlVXJsKHVybCk7XG4gICAgICAgIHVybE9iamVjdC5wYXRoID0gYC9zdHlsZXMvdjEke3VybE9iamVjdC5wYXRofWA7XG4gICAgICAgIHJldHVybiB0aGlzLl9tYWtlQVBJVVJMKHVybE9iamVjdCwgdGhpcy5fY3VzdG9tQWNjZXNzVG9rZW4gfHwgYWNjZXNzVG9rZW4pO1xuICAgIH1cblxuICAgIG5vcm1hbGl6ZUdseXBoc1VSTCh1cmw6IHN0cmluZywgYWNjZXNzVG9rZW4/OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICBpZiAoIWlzTWFwYm94VVJMKHVybCkpIHJldHVybiB1cmw7XG4gICAgICAgIGNvbnN0IHVybE9iamVjdCA9IHBhcnNlVXJsKHVybCk7XG4gICAgICAgIHVybE9iamVjdC5wYXRoID0gYC9mb250cy92MSR7dXJsT2JqZWN0LnBhdGh9YDtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21ha2VBUElVUkwodXJsT2JqZWN0LCB0aGlzLl9jdXN0b21BY2Nlc3NUb2tlbiB8fCBhY2Nlc3NUb2tlbik7XG4gICAgfVxuXG4gICAgbm9ybWFsaXplU291cmNlVVJMKHVybDogc3RyaW5nLCBhY2Nlc3NUb2tlbj86IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIGlmICghaXNNYXBib3hVUkwodXJsKSkgcmV0dXJuIHVybDtcbiAgICAgICAgY29uc3QgdXJsT2JqZWN0ID0gcGFyc2VVcmwodXJsKTtcbiAgICAgICAgdXJsT2JqZWN0LnBhdGggPSBgL3Y0LyR7dXJsT2JqZWN0LmF1dGhvcml0eX0uanNvbmA7XG4gICAgICAgIC8vIFRpbGVKU09OIHJlcXVlc3RzIG5lZWQgYSBzZWN1cmUgZmxhZyBhcHBlbmRlZCB0byB0aGVpciBVUkxzIHNvXG4gICAgICAgIC8vIHRoYXQgdGhlIHNlcnZlciBrbm93cyB0byBzZW5kIFNTTC1pZmllZCByZXNvdXJjZSByZWZlcmVuY2VzLlxuICAgICAgICB1cmxPYmplY3QucGFyYW1zLnB1c2goJ3NlY3VyZScpO1xuICAgICAgICByZXR1cm4gdGhpcy5fbWFrZUFQSVVSTCh1cmxPYmplY3QsIHRoaXMuX2N1c3RvbUFjY2Vzc1Rva2VuIHx8IGFjY2Vzc1Rva2VuKTtcbiAgICB9XG5cbiAgICBub3JtYWxpemVTcHJpdGVVUkwodXJsOiBzdHJpbmcsIGZvcm1hdDogc3RyaW5nLCBleHRlbnNpb246IHN0cmluZywgYWNjZXNzVG9rZW4/OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCB1cmxPYmplY3QgPSBwYXJzZVVybCh1cmwpO1xuICAgICAgICBpZiAoIWlzTWFwYm94VVJMKHVybCkpIHtcbiAgICAgICAgICAgIHVybE9iamVjdC5wYXRoICs9IGAke2Zvcm1hdH0ke2V4dGVuc2lvbn1gO1xuICAgICAgICAgICAgcmV0dXJuIGZvcm1hdFVybCh1cmxPYmplY3QpO1xuICAgICAgICB9XG4gICAgICAgIHVybE9iamVjdC5wYXRoID0gYC9zdHlsZXMvdjEke3VybE9iamVjdC5wYXRofS9zcHJpdGUke2Zvcm1hdH0ke2V4dGVuc2lvbn1gO1xuICAgICAgICByZXR1cm4gdGhpcy5fbWFrZUFQSVVSTCh1cmxPYmplY3QsIHRoaXMuX2N1c3RvbUFjY2Vzc1Rva2VuIHx8IGFjY2Vzc1Rva2VuKTtcbiAgICB9XG5cbiAgICBub3JtYWxpemVUaWxlVVJMKHRpbGVVUkw6IHN0cmluZywgc291cmNlVVJMPzogP3N0cmluZywgdGlsZVNpemU/OiA/bnVtYmVyKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKHRoaXMuX2lzU2t1VG9rZW5FeHBpcmVkKCkpIHtcbiAgICAgICAgICAgIHRoaXMuX2NyZWF0ZVNrdVRva2VuKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXNvdXJjZVVSTCB8fCAhaXNNYXBib3hVUkwoc291cmNlVVJMKSkgcmV0dXJuIHRpbGVVUkw7XG5cbiAgICAgICAgY29uc3QgdXJsT2JqZWN0ID0gcGFyc2VVcmwodGlsZVVSTCk7XG4gICAgICAgIGNvbnN0IGltYWdlRXh0ZW5zaW9uUmUgPSAvKFxcLihwbmd8anBnKVxcZCopKD89JCkvO1xuICAgICAgICBjb25zdCB0aWxlVVJMQVBJUHJlZml4UmUgPSAvXi4rXFwvdjRcXC8vO1xuXG4gICAgICAgIC8vIFRoZSB2NCBtYXBib3ggdGlsZSBBUEkgc3VwcG9ydHMgNTEyeDUxMiBpbWFnZSB0aWxlcyBvbmx5IHdoZW4gQDJ4XG4gICAgICAgIC8vIGlzIGFwcGVuZGVkIHRvIHRoZSB0aWxlIFVSTC4gSWYgYHRpbGVTaXplOiA1MTJgIGlzIHNwZWNpZmllZCBmb3JcbiAgICAgICAgLy8gYSBNYXBib3ggcmFzdGVyIHNvdXJjZSBmb3JjZSB0aGUgQDJ4IHN1ZmZpeCBldmVuIGlmIGEgbm9uIGhpZHBpIGRldmljZS5cbiAgICAgICAgY29uc3Qgc3VmZml4ID0gYnJvd3Nlci5kZXZpY2VQaXhlbFJhdGlvID49IDIgfHwgdGlsZVNpemUgPT09IDUxMiA/ICdAMngnIDogJyc7XG4gICAgICAgIGNvbnN0IGV4dGVuc2lvbiA9IHdlYnBTdXBwb3J0ZWQuc3VwcG9ydGVkID8gJy53ZWJwJyA6ICckMSc7XG4gICAgICAgIHVybE9iamVjdC5wYXRoID0gdXJsT2JqZWN0LnBhdGgucmVwbGFjZShpbWFnZUV4dGVuc2lvblJlLCBgJHtzdWZmaXh9JHtleHRlbnNpb259YCk7XG4gICAgICAgIHVybE9iamVjdC5wYXRoID0gdXJsT2JqZWN0LnBhdGgucmVwbGFjZSh0aWxlVVJMQVBJUHJlZml4UmUsICcvJyk7XG4gICAgICAgIHVybE9iamVjdC5wYXRoID0gYC92NCR7dXJsT2JqZWN0LnBhdGh9YDtcblxuICAgICAgICBpZiAoY29uZmlnLlJFUVVJUkVfQUNDRVNTX1RPS0VOICYmIChjb25maWcuQUNDRVNTX1RPS0VOIHx8IHRoaXMuX2N1c3RvbUFjY2Vzc1Rva2VuKSAmJiB0aGlzLl9za3VUb2tlbikge1xuICAgICAgICAgICAgdXJsT2JqZWN0LnBhcmFtcy5wdXNoKGBza3U9JHt0aGlzLl9za3VUb2tlbn1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLl9tYWtlQVBJVVJMKHVybE9iamVjdCwgdGhpcy5fY3VzdG9tQWNjZXNzVG9rZW4pO1xuICAgIH1cblxuICAgIGNhbm9uaWNhbGl6ZVRpbGVVUkwodXJsOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgdmVyc2lvbiA9IFwiL3Y0L1wiO1xuICAgICAgICAvLyBtYXRjaGVzIGFueSBmaWxlIGV4dGVuc2lvbiBzcGVjaWZpZWQgYnkgYSBkb3QgYW5kIG9uZSBvciBtb3JlIGFscGhhbnVtZXJpYyBjaGFyYWN0ZXJzXG4gICAgICAgIGNvbnN0IGV4dGVuc2lvblJlID0gL1xcLltcXHddKyQvO1xuXG4gICAgICAgIGNvbnN0IHVybE9iamVjdCA9IHBhcnNlVXJsKHVybCk7XG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0aGF0IHdlIGFyZSBkZWFsaW5nIHdpdGggYSB2YWxpZCBNYXBib3ggdGlsZSBVUkwuXG4gICAgICAgIC8vIEhhcyB0byBiZWdpbiB3aXRoIC92NC8sIHdpdGggYSB2YWxpZCBmaWxlbmFtZSArIGV4dGVuc2lvblxuICAgICAgICBpZiAoIXVybE9iamVjdC5wYXRoLm1hdGNoKC8oXlxcL3Y0XFwvKS8pIHx8ICF1cmxPYmplY3QucGF0aC5tYXRjaChleHRlbnNpb25SZSkpIHtcbiAgICAgICAgICAgIC8vIE5vdCBhIHByb3BlciBNYXBib3ggdGlsZSBVUkwuXG4gICAgICAgICAgICByZXR1cm4gdXJsO1xuICAgICAgICB9XG4gICAgICAgIC8vIFJlYXNzZW1ibGUgdGhlIGNhbm9uaWNhbCBVUkwgZnJvbSB0aGUgcGFydHMgd2UndmUgcGFyc2VkIGJlZm9yZS5cbiAgICAgICAgbGV0IHJlc3VsdCA9IFwibWFwYm94Oi8vdGlsZXMvXCI7XG4gICAgICAgIHJlc3VsdCArPSAgdXJsT2JqZWN0LnBhdGgucmVwbGFjZSh2ZXJzaW9uLCAnJyk7XG5cbiAgICAgICAgLy8gQXBwZW5kIHRoZSBxdWVyeSBzdHJpbmcsIG1pbnVzIHRoZSBhY2Nlc3MgdG9rZW4gcGFyYW1ldGVyLlxuICAgICAgICBjb25zdCBwYXJhbXMgPSB1cmxPYmplY3QucGFyYW1zLmZpbHRlcihwID0+ICFwLm1hdGNoKC9eYWNjZXNzX3Rva2VuPS8pKTtcbiAgICAgICAgaWYgKHBhcmFtcy5sZW5ndGgpIHJlc3VsdCArPSBgPyR7cGFyYW1zLmpvaW4oJyYnKX1gO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIGNhbm9uaWNhbGl6ZVRpbGVzZXQodGlsZUpTT046IFRpbGVKU09OLCBzb3VyY2VVUkw6IHN0cmluZykge1xuICAgICAgICBpZiAoIWlzTWFwYm94VVJMKHNvdXJjZVVSTCkpIHJldHVybiB0aWxlSlNPTi50aWxlcyB8fCBbXTtcbiAgICAgICAgY29uc3QgY2Fub25pY2FsID0gW107XG4gICAgICAgIGZvciAoY29uc3QgdXJsIG9mIHRpbGVKU09OLnRpbGVzKSB7XG4gICAgICAgICAgICBjb25zdCBjYW5vbmljYWxVcmwgPSB0aGlzLmNhbm9uaWNhbGl6ZVRpbGVVUkwodXJsKTtcbiAgICAgICAgICAgIGNhbm9uaWNhbC5wdXNoKGNhbm9uaWNhbFVybCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhbm9uaWNhbDtcbiAgICB9XG5cbiAgICBfbWFrZUFQSVVSTCh1cmxPYmplY3Q6IFVybE9iamVjdCwgYWNjZXNzVG9rZW46IHN0cmluZyB8IG51bGwgfCB2b2lkKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgaGVscCA9ICdTZWUgaHR0cHM6Ly93d3cubWFwYm94LmNvbS9hcGktZG9jdW1lbnRhdGlvbi8jYWNjZXNzLXRva2Vucy1hbmQtdG9rZW4tc2NvcGVzJztcbiAgICAgICAgY29uc3QgYXBpVXJsT2JqZWN0ID0gcGFyc2VVcmwoY29uZmlnLkFQSV9VUkwpO1xuICAgICAgICB1cmxPYmplY3QucHJvdG9jb2wgPSBhcGlVcmxPYmplY3QucHJvdG9jb2w7XG4gICAgICAgIHVybE9iamVjdC5hdXRob3JpdHkgPSBhcGlVcmxPYmplY3QuYXV0aG9yaXR5O1xuXG4gICAgICAgIGlmIChhcGlVcmxPYmplY3QucGF0aCAhPT0gJy8nKSB7XG4gICAgICAgICAgICB1cmxPYmplY3QucGF0aCA9IGAke2FwaVVybE9iamVjdC5wYXRofSR7dXJsT2JqZWN0LnBhdGh9YDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghY29uZmlnLlJFUVVJUkVfQUNDRVNTX1RPS0VOKSByZXR1cm4gZm9ybWF0VXJsKHVybE9iamVjdCk7XG5cbiAgICAgICAgYWNjZXNzVG9rZW4gPSBhY2Nlc3NUb2tlbiB8fCBjb25maWcuQUNDRVNTX1RPS0VOO1xuICAgICAgICBpZiAoIWFjY2Vzc1Rva2VuKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBBbiBBUEkgYWNjZXNzIHRva2VuIGlzIHJlcXVpcmVkIHRvIHVzZSBNYXBib3ggR0wuICR7aGVscH1gKTtcbiAgICAgICAgaWYgKGFjY2Vzc1Rva2VuWzBdID09PSAncycpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVzZSBhIHB1YmxpYyBhY2Nlc3MgdG9rZW4gKHBrLiopIHdpdGggTWFwYm94IEdMLCBub3QgYSBzZWNyZXQgYWNjZXNzIHRva2VuIChzay4qKS4gJHtoZWxwfWApO1xuXG4gICAgICAgIHVybE9iamVjdC5wYXJhbXMgPSB1cmxPYmplY3QucGFyYW1zLmZpbHRlcigoZCkgPT4gZC5pbmRleE9mKCdhY2Nlc3NfdG9rZW4nKSA9PT0gLTEpO1xuICAgICAgICB1cmxPYmplY3QucGFyYW1zLnB1c2goYGFjY2Vzc190b2tlbj0ke2FjY2Vzc1Rva2VufWApO1xuICAgICAgICByZXR1cm4gZm9ybWF0VXJsKHVybE9iamVjdCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBpc01hcGJveFVSTCh1cmw6IHN0cmluZykge1xuICAgIHJldHVybiB1cmwuaW5kZXhPZignbWFwYm94OicpID09PSAwO1xufVxuXG5jb25zdCBtYXBib3hIVFRQVVJMUmUgPSAvXigoaHR0cHM/Oik/XFwvXFwvKT8oW15cXC9dK1xcLik/bWFwYm94XFwuYyhufG9tKShcXC98XFw/fCQpL2k7XG5mdW5jdGlvbiBpc01hcGJveEhUVFBVUkwodXJsOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gbWFwYm94SFRUUFVSTFJlLnRlc3QodXJsKTtcbn1cblxuZnVuY3Rpb24gaGFzQ2FjaGVEZWZlYXRpbmdTa3UodXJsOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdXJsLmluZGV4T2YoJ3NrdT0nKSA+IDAgJiYgaXNNYXBib3hIVFRQVVJMKHVybCk7XG59XG5cbmNvbnN0IHVybFJlID0gL14oXFx3Kyk6XFwvXFwvKFteLz9dKikoXFwvW14/XSspP1xcPz8oLispPy87XG5cbmZ1bmN0aW9uIHBhcnNlVXJsKHVybDogc3RyaW5nKTogVXJsT2JqZWN0IHtcbiAgICBjb25zdCBwYXJ0cyA9IHVybC5tYXRjaCh1cmxSZSk7XG4gICAgaWYgKCFwYXJ0cykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuYWJsZSB0byBwYXJzZSBVUkwgb2JqZWN0Jyk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIHByb3RvY29sOiBwYXJ0c1sxXSxcbiAgICAgICAgYXV0aG9yaXR5OiBwYXJ0c1syXSxcbiAgICAgICAgcGF0aDogcGFydHNbM10gfHwgJy8nLFxuICAgICAgICBwYXJhbXM6IHBhcnRzWzRdID8gcGFydHNbNF0uc3BsaXQoJyYnKSA6IFtdXG4gICAgfTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VXJsKG9iajogVXJsT2JqZWN0KTogc3RyaW5nIHtcbiAgICBjb25zdCBwYXJhbXMgPSBvYmoucGFyYW1zLmxlbmd0aCA/IGA/JHtvYmoucGFyYW1zLmpvaW4oJyYnKX1gIDogJyc7XG4gICAgcmV0dXJuIGAke29iai5wcm90b2NvbH06Ly8ke29iai5hdXRob3JpdHl9JHtvYmoucGF0aH0ke3BhcmFtc31gO1xufVxuXG5leHBvcnQge2lzTWFwYm94VVJMLCBpc01hcGJveEhUVFBVUkwsIGhhc0NhY2hlRGVmZWF0aW5nU2t1fTtcblxuY29uc3QgdGVsZW1FdmVudEtleSA9ICdtYXBib3guZXZlbnREYXRhJztcblxuZnVuY3Rpb24gcGFyc2VBY2Nlc3NUb2tlbihhY2Nlc3NUb2tlbjogP3N0cmluZykge1xuICAgIGlmICghYWNjZXNzVG9rZW4pIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgcGFydHMgPSBhY2Nlc3NUb2tlbi5zcGxpdCgnLicpO1xuICAgIGlmICghcGFydHMgfHwgcGFydHMubGVuZ3RoICE9PSAzKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGpzb25EYXRhID0gSlNPTi5wYXJzZShiNjREZWNvZGVVbmljb2RlKHBhcnRzWzFdKSk7XG4gICAgICAgIHJldHVybiBqc29uRGF0YTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cblxudHlwZSBUZWxlbWV0cnlFdmVudFR5cGUgPSAnYXBwVXNlclR1cm5zdGlsZScgfCAnbWFwLmxvYWQnO1xuXG5jbGFzcyBUZWxlbWV0cnlFdmVudCB7XG4gICAgZXZlbnREYXRhOiBhbnk7XG4gICAgYW5vbklkOiA/c3RyaW5nO1xuICAgIHF1ZXVlOiBBcnJheTxhbnk+O1xuICAgIHR5cGU6IFRlbGVtZXRyeUV2ZW50VHlwZTtcbiAgICBwZW5kaW5nUmVxdWVzdDogP0NhbmNlbGFibGU7XG4gICAgX2N1c3RvbUFjY2Vzc1Rva2VuOiA/c3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IodHlwZTogVGVsZW1ldHJ5RXZlbnRUeXBlKSB7XG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgICAgIHRoaXMuYW5vbklkID0gbnVsbDtcbiAgICAgICAgdGhpcy5ldmVudERhdGEgPSB7fTtcbiAgICAgICAgdGhpcy5xdWV1ZSA9IFtdO1xuICAgICAgICB0aGlzLnBlbmRpbmdSZXF1ZXN0ID0gbnVsbDtcbiAgICB9XG5cbiAgICBnZXRTdG9yYWdlS2V5KGRvbWFpbjogP3N0cmluZykge1xuICAgICAgICBjb25zdCB0b2tlbkRhdGEgPSBwYXJzZUFjY2Vzc1Rva2VuKGNvbmZpZy5BQ0NFU1NfVE9LRU4pO1xuICAgICAgICBsZXQgdSA9ICcnO1xuICAgICAgICBpZiAodG9rZW5EYXRhICYmIHRva2VuRGF0YVsndSddKSB7XG4gICAgICAgICAgICB1ID0gYjY0RW5jb2RlVW5pY29kZSh0b2tlbkRhdGFbJ3UnXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB1ID0gY29uZmlnLkFDQ0VTU19UT0tFTiB8fCAnJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZG9tYWluID9cbiAgICAgICAgICAgIGAke3RlbGVtRXZlbnRLZXl9LiR7ZG9tYWlufToke3V9YCA6XG4gICAgICAgICAgICBgJHt0ZWxlbUV2ZW50S2V5fToke3V9YDtcbiAgICB9XG5cbiAgICBmZXRjaEV2ZW50RGF0YSgpIHtcbiAgICAgICAgY29uc3QgaXNMb2NhbFN0b3JhZ2VBdmFpbGFibGUgPSBzdG9yYWdlQXZhaWxhYmxlKCdsb2NhbFN0b3JhZ2UnKTtcbiAgICAgICAgY29uc3Qgc3RvcmFnZUtleSA9IHRoaXMuZ2V0U3RvcmFnZUtleSgpO1xuICAgICAgICBjb25zdCB1dWlkS2V5ID0gdGhpcy5nZXRTdG9yYWdlS2V5KCd1dWlkJyk7XG5cbiAgICAgICAgaWYgKGlzTG9jYWxTdG9yYWdlQXZhaWxhYmxlKSB7XG4gICAgICAgICAgICAvL1JldHJpZXZlIGNhY2hlZCBkYXRhXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oc3RvcmFnZUtleSk7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ldmVudERhdGEgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IHV1aWQgPSB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0odXVpZEtleSk7XG4gICAgICAgICAgICAgICAgaWYgKHV1aWQpIHRoaXMuYW5vbklkID0gdXVpZDtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICB3YXJuT25jZSgnVW5hYmxlIHRvIHJlYWQgZnJvbSBMb2NhbFN0b3JhZ2UnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNhdmVFdmVudERhdGEoKSB7XG4gICAgICAgIGNvbnN0IGlzTG9jYWxTdG9yYWdlQXZhaWxhYmxlID0gc3RvcmFnZUF2YWlsYWJsZSgnbG9jYWxTdG9yYWdlJyk7XG4gICAgICAgIGNvbnN0IHN0b3JhZ2VLZXkgPSAgdGhpcy5nZXRTdG9yYWdlS2V5KCk7XG4gICAgICAgIGNvbnN0IHV1aWRLZXkgPSB0aGlzLmdldFN0b3JhZ2VLZXkoJ3V1aWQnKTtcbiAgICAgICAgaWYgKGlzTG9jYWxTdG9yYWdlQXZhaWxhYmxlKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSh1dWlkS2V5LCB0aGlzLmFub25JZCk7XG4gICAgICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKHRoaXMuZXZlbnREYXRhKS5sZW5ndGggPj0gMSkge1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oc3RvcmFnZUtleSwgSlNPTi5zdHJpbmdpZnkodGhpcy5ldmVudERhdGEpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgd2Fybk9uY2UoJ1VuYWJsZSB0byB3cml0ZSB0byBMb2NhbFN0b3JhZ2UnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgcHJvY2Vzc1JlcXVlc3RzKF86ID9zdHJpbmcpIHt9XG5cbiAgICAvKlxuICAgICogSWYgYW55IGV2ZW50IGRhdGEgc2hvdWxkIGJlIHBlcnNpc3RlZCBhZnRlciB0aGUgUE9TVCByZXF1ZXN0LCB0aGUgY2FsbGJhY2sgc2hvdWxkIG1vZGlmeSBldmVudERhdGFgXG4gICAgKiB0byB0aGUgdmFsdWVzIHRoYXQgc2hvdWxkIGJlIHNhdmVkLiBGb3IgdGhpcyByZWFzb24sIHRoZSBjYWxsYmFjayBzaG91bGQgYmUgaW52b2tlZCBwcmlvciB0byB0aGUgY2FsbFxuICAgICogdG8gVGVsZW1ldHJ5RXZlbnQjc2F2ZURhdGFcbiAgICAqL1xuICAgIHBvc3RFdmVudCh0aW1lc3RhbXA6IG51bWJlciwgYWRkaXRpb25hbFBheWxvYWQ6IHtbc3RyaW5nXTogYW55fSwgY2FsbGJhY2s6IChlcnI6ID9FcnJvcikgPT4gdm9pZCwgY3VzdG9tQWNjZXNzVG9rZW4/OiA/c3RyaW5nKSB7XG4gICAgICAgIGlmICghY29uZmlnLkVWRU5UU19VUkwpIHJldHVybjtcbiAgICAgICAgY29uc3QgZXZlbnRzVXJsT2JqZWN0OiBVcmxPYmplY3QgPSBwYXJzZVVybChjb25maWcuRVZFTlRTX1VSTCk7XG4gICAgICAgIGV2ZW50c1VybE9iamVjdC5wYXJhbXMucHVzaChgYWNjZXNzX3Rva2VuPSR7Y3VzdG9tQWNjZXNzVG9rZW4gfHwgY29uZmlnLkFDQ0VTU19UT0tFTiB8fCAnJ31gKTtcblxuICAgICAgICBjb25zdCBwYXlsb2FkOiBPYmplY3QgPSB7XG4gICAgICAgICAgICBldmVudDogdGhpcy50eXBlLFxuICAgICAgICAgICAgY3JlYXRlZDogbmV3IERhdGUodGltZXN0YW1wKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgc2RrSWRlbnRpZmllcjogJ21hcGJveC1nbC1qcycsXG4gICAgICAgICAgICBzZGtWZXJzaW9uLFxuICAgICAgICAgICAgc2t1SWQ6IFNLVV9JRCxcbiAgICAgICAgICAgIHVzZXJJZDogdGhpcy5hbm9uSWRcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBmaW5hbFBheWxvYWQgPSBhZGRpdGlvbmFsUGF5bG9hZCA/IGV4dGVuZChwYXlsb2FkLCBhZGRpdGlvbmFsUGF5bG9hZCkgOiBwYXlsb2FkO1xuICAgICAgICBjb25zdCByZXF1ZXN0OiBSZXF1ZXN0UGFyYW1ldGVycyA9IHtcbiAgICAgICAgICAgIHVybDogZm9ybWF0VXJsKGV2ZW50c1VybE9iamVjdCksXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICd0ZXh0L3BsYWluJyAvL1NraXAgdGhlIHByZS1mbGlnaHQgT1BUSU9OUyByZXF1ZXN0XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoW2ZpbmFsUGF5bG9hZF0pXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5wZW5kaW5nUmVxdWVzdCA9IHBvc3REYXRhKHJlcXVlc3QsIChlcnJvcikgPT4ge1xuICAgICAgICAgICAgdGhpcy5wZW5kaW5nUmVxdWVzdCA9IG51bGw7XG4gICAgICAgICAgICBjYWxsYmFjayhlcnJvcik7XG4gICAgICAgICAgICB0aGlzLnNhdmVFdmVudERhdGEoKTtcbiAgICAgICAgICAgIHRoaXMucHJvY2Vzc1JlcXVlc3RzKGN1c3RvbUFjY2Vzc1Rva2VuKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcXVldWVSZXF1ZXN0KGV2ZW50OiBudW1iZXIgfCB7aWQ6IG51bWJlciwgdGltZXN0YW1wOiBudW1iZXJ9LCBjdXN0b21BY2Nlc3NUb2tlbj86ID9zdHJpbmcpIHtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKGV2ZW50KTtcbiAgICAgICAgdGhpcy5wcm9jZXNzUmVxdWVzdHMoY3VzdG9tQWNjZXNzVG9rZW4pO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIE1hcExvYWRFdmVudCBleHRlbmRzIFRlbGVtZXRyeUV2ZW50IHtcbiAgICArc3VjY2Vzczoge1tudW1iZXJdOiBib29sZWFufTtcbiAgICBza3VUb2tlbjogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCdtYXAubG9hZCcpO1xuICAgICAgICB0aGlzLnN1Y2Nlc3MgPSB7fTtcbiAgICAgICAgdGhpcy5za3VUb2tlbiA9ICcnO1xuICAgIH1cblxuICAgIHBvc3RNYXBMb2FkRXZlbnQodGlsZVVybHM6IEFycmF5PHN0cmluZz4sIG1hcElkOiBudW1iZXIsIHNrdVRva2VuOiBzdHJpbmcsIGN1c3RvbUFjY2Vzc1Rva2VuOiBzdHJpbmcpIHtcbiAgICAgICAgLy9FbmFibGVkIG9ubHkgd2hlbiBNYXBib3ggQWNjZXNzIFRva2VuIGlzIHNldCBhbmQgYSBzb3VyY2UgdXNlc1xuICAgICAgICAvLyBtYXBib3ggdGlsZXMuXG4gICAgICAgIHRoaXMuc2t1VG9rZW4gPSBza3VUb2tlbjtcblxuICAgICAgICBpZiAoY29uZmlnLkVWRU5UU19VUkwgJiZcbiAgICAgICAgICAgIGN1c3RvbUFjY2Vzc1Rva2VuIHx8IGNvbmZpZy5BQ0NFU1NfVE9LRU4gJiZcbiAgICAgICAgICAgIEFycmF5LmlzQXJyYXkodGlsZVVybHMpICYmXG4gICAgICAgICAgICB0aWxlVXJscy5zb21lKHVybCA9PiBpc01hcGJveFVSTCh1cmwpIHx8IGlzTWFwYm94SFRUUFVSTCh1cmwpKSkge1xuICAgICAgICAgICAgdGhpcy5xdWV1ZVJlcXVlc3Qoe2lkOiBtYXBJZCwgdGltZXN0YW1wOiBEYXRlLm5vdygpfSwgY3VzdG9tQWNjZXNzVG9rZW4pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvY2Vzc1JlcXVlc3RzKGN1c3RvbUFjY2Vzc1Rva2VuPzogP3N0cmluZykge1xuICAgICAgICBpZiAodGhpcy5wZW5kaW5nUmVxdWVzdCB8fCB0aGlzLnF1ZXVlLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuICAgICAgICBjb25zdCB7aWQsIHRpbWVzdGFtcH0gPSB0aGlzLnF1ZXVlLnNoaWZ0KCk7XG5cbiAgICAgICAgLy8gT25seSBvbmUgbG9hZCBldmVudCBzaG91bGQgZmlyZSBwZXIgbWFwXG4gICAgICAgIGlmIChpZCAmJiB0aGlzLnN1Y2Nlc3NbaWRdKSByZXR1cm47XG5cbiAgICAgICAgaWYgKCF0aGlzLmFub25JZCkge1xuICAgICAgICAgICAgdGhpcy5mZXRjaEV2ZW50RGF0YSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF2YWxpZGF0ZVV1aWQodGhpcy5hbm9uSWQpKSB7XG4gICAgICAgICAgICB0aGlzLmFub25JZCA9IHV1aWQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucG9zdEV2ZW50KHRpbWVzdGFtcCwge3NrdVRva2VuOiB0aGlzLnNrdVRva2VufSwgKGVycikgPT4ge1xuICAgICAgICAgICAgaWYgKCFlcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAoaWQpIHRoaXMuc3VjY2Vzc1tpZF0gPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBjdXN0b21BY2Nlc3NUb2tlbik7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgVHVybnN0aWxlRXZlbnQgZXh0ZW5kcyBUZWxlbWV0cnlFdmVudCB7XG4gICAgY29uc3RydWN0b3IoY3VzdG9tQWNjZXNzVG9rZW4/OiA/c3RyaW5nKSB7XG4gICAgICAgIHN1cGVyKCdhcHBVc2VyVHVybnN0aWxlJyk7XG4gICAgICAgIHRoaXMuX2N1c3RvbUFjY2Vzc1Rva2VuID0gY3VzdG9tQWNjZXNzVG9rZW47XG4gICAgfVxuXG4gICAgcG9zdFR1cm5zdGlsZUV2ZW50KHRpbGVVcmxzOiBBcnJheTxzdHJpbmc+LCBjdXN0b21BY2Nlc3NUb2tlbj86ID9zdHJpbmcpIHtcbiAgICAgICAgLy9FbmFibGVkIG9ubHkgd2hlbiBNYXBib3ggQWNjZXNzIFRva2VuIGlzIHNldCBhbmQgYSBzb3VyY2UgdXNlc1xuICAgICAgICAvLyBtYXBib3ggdGlsZXMuXG4gICAgICAgIGlmIChjb25maWcuRVZFTlRTX1VSTCAmJlxuICAgICAgICAgICAgY29uZmlnLkFDQ0VTU19UT0tFTiAmJlxuICAgICAgICAgICAgQXJyYXkuaXNBcnJheSh0aWxlVXJscykgJiZcbiAgICAgICAgICAgIHRpbGVVcmxzLnNvbWUodXJsID0+IGlzTWFwYm94VVJMKHVybCkgfHwgaXNNYXBib3hIVFRQVVJMKHVybCkpKSB7XG4gICAgICAgICAgICB0aGlzLnF1ZXVlUmVxdWVzdChEYXRlLm5vdygpLCBjdXN0b21BY2Nlc3NUb2tlbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm9jZXNzUmVxdWVzdHMoY3VzdG9tQWNjZXNzVG9rZW4/OiA/c3RyaW5nKSB7XG4gICAgICAgIGlmICh0aGlzLnBlbmRpbmdSZXF1ZXN0IHx8IHRoaXMucXVldWUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuYW5vbklkIHx8ICF0aGlzLmV2ZW50RGF0YS5sYXN0U3VjY2VzcyB8fCAhdGhpcy5ldmVudERhdGEudG9rZW5VKSB7XG4gICAgICAgICAgICAvL1JldHJpZXZlIGNhY2hlZCBkYXRhXG4gICAgICAgICAgICB0aGlzLmZldGNoRXZlbnREYXRhKCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0b2tlbkRhdGEgPSBwYXJzZUFjY2Vzc1Rva2VuKGNvbmZpZy5BQ0NFU1NfVE9LRU4pO1xuICAgICAgICBjb25zdCB0b2tlblUgPSB0b2tlbkRhdGEgPyB0b2tlbkRhdGFbJ3UnXSA6IGNvbmZpZy5BQ0NFU1NfVE9LRU47XG4gICAgICAgIC8vUmVzZXQgZXZlbnQgZGF0YSBjYWNoZSBpZiB0aGUgYWNjZXNzIHRva2VuIG93bmVyIGNoYW5nZWQuXG4gICAgICAgIGxldCBkdWVGb3JFdmVudCA9IHRva2VuVSAhPT0gdGhpcy5ldmVudERhdGEudG9rZW5VO1xuXG4gICAgICAgIGlmICghdmFsaWRhdGVVdWlkKHRoaXMuYW5vbklkKSkge1xuICAgICAgICAgICAgdGhpcy5hbm9uSWQgPSB1dWlkKCk7XG4gICAgICAgICAgICBkdWVGb3JFdmVudCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBuZXh0VXBkYXRlID0gdGhpcy5xdWV1ZS5zaGlmdCgpO1xuICAgICAgICAvLyBSZWNvcmQgdHVybnN0aWxlIGV2ZW50IG9uY2UgcGVyIGNhbGVuZGFyIGRheS5cbiAgICAgICAgaWYgKHRoaXMuZXZlbnREYXRhLmxhc3RTdWNjZXNzKSB7XG4gICAgICAgICAgICBjb25zdCBsYXN0VXBkYXRlID0gbmV3IERhdGUodGhpcy5ldmVudERhdGEubGFzdFN1Y2Nlc3MpO1xuICAgICAgICAgICAgY29uc3QgbmV4dERhdGUgPSBuZXcgRGF0ZShuZXh0VXBkYXRlKTtcbiAgICAgICAgICAgIGNvbnN0IGRheXNFbGFwc2VkID0gKG5leHRVcGRhdGUgLSB0aGlzLmV2ZW50RGF0YS5sYXN0U3VjY2VzcykgLyAoMjQgKiA2MCAqIDYwICogMTAwMCk7XG4gICAgICAgICAgICBkdWVGb3JFdmVudCA9IGR1ZUZvckV2ZW50IHx8IGRheXNFbGFwc2VkID49IDEgfHwgZGF5c0VsYXBzZWQgPCAtMSB8fCBsYXN0VXBkYXRlLmdldERhdGUoKSAhPT0gbmV4dERhdGUuZ2V0RGF0ZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZHVlRm9yRXZlbnQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFkdWVGb3JFdmVudCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvY2Vzc1JlcXVlc3RzKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnBvc3RFdmVudChuZXh0VXBkYXRlLCB7XCJlbmFibGVkLnRlbGVtZXRyeVwiOiBmYWxzZX0sIChlcnIpID0+IHtcbiAgICAgICAgICAgIGlmICghZXJyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ldmVudERhdGEubGFzdFN1Y2Nlc3MgPSBuZXh0VXBkYXRlO1xuICAgICAgICAgICAgICAgIHRoaXMuZXZlbnREYXRhLnRva2VuVSA9IHRva2VuVTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgY3VzdG9tQWNjZXNzVG9rZW4pO1xuICAgIH1cbn1cblxuY29uc3QgdHVybnN0aWxlRXZlbnRfID0gbmV3IFR1cm5zdGlsZUV2ZW50KCk7XG5leHBvcnQgY29uc3QgcG9zdFR1cm5zdGlsZUV2ZW50ID0gdHVybnN0aWxlRXZlbnRfLnBvc3RUdXJuc3RpbGVFdmVudC5iaW5kKHR1cm5zdGlsZUV2ZW50Xyk7XG5cbmNvbnN0IG1hcExvYWRFdmVudF8gPSBuZXcgTWFwTG9hZEV2ZW50KCk7XG5leHBvcnQgY29uc3QgcG9zdE1hcExvYWRFdmVudCA9IG1hcExvYWRFdmVudF8ucG9zdE1hcExvYWRFdmVudC5iaW5kKG1hcExvYWRFdmVudF8pO1xuXG4vKioqKiogRU5EIFdBUk5JTkcgLSBSRU1PVkFMIE9SIE1PRElGSUNBVElPTiBPRiBUSEVcblBSRUNFRElORyBDT0RFIFZJT0xBVEVTIFRIRSBNQVBCT1ggVEVSTVMgT0YgU0VSVklDRSAgKioqKioqL1xuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHt3YXJuT25jZSwgcGFyc2VDYWNoZUNvbnRyb2x9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQgd2luZG93IGZyb20gJy4vd2luZG93JztcblxuaW1wb3J0IHR5cGUgRGlzcGF0Y2hlciBmcm9tICcuL2Rpc3BhdGNoZXInO1xuXG5jb25zdCBDQUNIRV9OQU1FID0gJ21hcGJveC10aWxlcyc7XG5sZXQgY2FjaGVMaW1pdCA9IDUwMDsgLy8gNTBNQiAvICgxMDBLQi90aWxlKSB+PSA1MDAgdGlsZXNcbmxldCBjYWNoZUNoZWNrVGhyZXNob2xkID0gNTA7XG5cbmNvbnN0IE1JTl9USU1FX1VOVElMX0VYUElSWSA9IDEwMDAgKiA2MCAqIDc7IC8vIDcgbWludXRlcy4gU2tpcCBjYWNoaW5nIHRpbGVzIHdpdGggYSBzaG9ydCBlbm91Z2ggbWF4IGFnZS5cblxuZXhwb3J0IHR5cGUgUmVzcG9uc2VPcHRpb25zID0ge1xuICAgIHN0YXR1czogbnVtYmVyLFxuICAgIHN0YXR1c1RleHQ6IHN0cmluZyxcbiAgICBoZWFkZXJzOiB3aW5kb3cuSGVhZGVyc1xufTtcblxubGV0IHJlc3BvbnNlQ29uc3RydWN0b3JTdXBwb3J0c1JlYWRhYmxlU3RyZWFtO1xuZnVuY3Rpb24gcHJlcGFyZUJvZHkocmVzcG9uc2U6IFJlc3BvbnNlLCBjYWxsYmFjaykge1xuICAgIGlmIChyZXNwb25zZUNvbnN0cnVjdG9yU3VwcG9ydHNSZWFkYWJsZVN0cmVhbSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBuZXcgUmVzcG9uc2UobmV3IFJlYWRhYmxlU3RyZWFtKCkpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVuZGVmXG4gICAgICAgICAgICByZXNwb25zZUNvbnN0cnVjdG9yU3VwcG9ydHNSZWFkYWJsZVN0cmVhbSA9IHRydWU7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIC8vIEVkZ2VcbiAgICAgICAgICAgIHJlc3BvbnNlQ29uc3RydWN0b3JTdXBwb3J0c1JlYWRhYmxlU3RyZWFtID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocmVzcG9uc2VDb25zdHJ1Y3RvclN1cHBvcnRzUmVhZGFibGVTdHJlYW0pIHtcbiAgICAgICAgY2FsbGJhY2socmVzcG9uc2UuYm9keSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmVzcG9uc2UuYmxvYigpLnRoZW4oY2FsbGJhY2spO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhY2hlUHV0KHJlcXVlc3Q6IFJlcXVlc3QsIHJlc3BvbnNlOiBSZXNwb25zZSwgcmVxdWVzdFRpbWU6IG51bWJlcikge1xuICAgIGlmICghd2luZG93LmNhY2hlcykgcmV0dXJuO1xuXG4gICAgY29uc3Qgb3B0aW9uczogUmVzcG9uc2VPcHRpb25zID0ge1xuICAgICAgICBzdGF0dXM6IHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgICAgc3RhdHVzVGV4dDogcmVzcG9uc2Uuc3RhdHVzVGV4dCxcbiAgICAgICAgaGVhZGVyczogbmV3IHdpbmRvdy5IZWFkZXJzKClcbiAgICB9O1xuICAgIHJlc3BvbnNlLmhlYWRlcnMuZm9yRWFjaCgodiwgaykgPT4gb3B0aW9ucy5oZWFkZXJzLnNldChrLCB2KSk7XG5cbiAgICBjb25zdCBjYWNoZUNvbnRyb2wgPSBwYXJzZUNhY2hlQ29udHJvbChyZXNwb25zZS5oZWFkZXJzLmdldCgnQ2FjaGUtQ29udHJvbCcpIHx8ICcnKTtcbiAgICBpZiAoY2FjaGVDb250cm9sWyduby1zdG9yZSddKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGNhY2hlQ29udHJvbFsnbWF4LWFnZSddKSB7XG4gICAgICAgIG9wdGlvbnMuaGVhZGVycy5zZXQoJ0V4cGlyZXMnLCBuZXcgRGF0ZShyZXF1ZXN0VGltZSArIGNhY2hlQ29udHJvbFsnbWF4LWFnZSddICogMTAwMCkudG9VVENTdHJpbmcoKSk7XG4gICAgfVxuXG4gICAgY29uc3QgdGltZVVudGlsRXhwaXJ5ID0gbmV3IERhdGUob3B0aW9ucy5oZWFkZXJzLmdldCgnRXhwaXJlcycpKS5nZXRUaW1lKCkgLSByZXF1ZXN0VGltZTtcbiAgICBpZiAodGltZVVudGlsRXhwaXJ5IDwgTUlOX1RJTUVfVU5USUxfRVhQSVJZKSByZXR1cm47XG5cbiAgICBwcmVwYXJlQm9keShyZXNwb25zZSwgYm9keSA9PiB7XG4gICAgICAgIGNvbnN0IGNsb25lZFJlc3BvbnNlID0gbmV3IHdpbmRvdy5SZXNwb25zZShib2R5LCBvcHRpb25zKTtcblxuICAgICAgICB3aW5kb3cuY2FjaGVzLm9wZW4oQ0FDSEVfTkFNRSlcbiAgICAgICAgICAgIC50aGVuKGNhY2hlID0+IGNhY2hlLnB1dChzdHJpcFF1ZXJ5UGFyYW1ldGVycyhyZXF1ZXN0LnVybCksIGNsb25lZFJlc3BvbnNlKSlcbiAgICAgICAgICAgIC5jYXRjaChlID0+IHdhcm5PbmNlKGUubWVzc2FnZSkpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBzdHJpcFF1ZXJ5UGFyYW1ldGVycyh1cmw6IHN0cmluZykge1xuICAgIGNvbnN0IHN0YXJ0ID0gdXJsLmluZGV4T2YoJz8nKTtcbiAgICByZXR1cm4gc3RhcnQgPCAwID8gdXJsIDogdXJsLnNsaWNlKDAsIHN0YXJ0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhY2hlR2V0KHJlcXVlc3Q6IFJlcXVlc3QsIGNhbGxiYWNrOiAoZXJyb3I6ID9hbnksIHJlc3BvbnNlOiA/UmVzcG9uc2UsIGZyZXNoOiA/Ym9vbGVhbikgPT4gdm9pZCkge1xuICAgIGlmICghd2luZG93LmNhY2hlcykgcmV0dXJuIGNhbGxiYWNrKG51bGwpO1xuXG4gICAgY29uc3Qgc3RyaXBwZWRVUkwgPSBzdHJpcFF1ZXJ5UGFyYW1ldGVycyhyZXF1ZXN0LnVybCk7XG5cbiAgICB3aW5kb3cuY2FjaGVzLm9wZW4oQ0FDSEVfTkFNRSlcbiAgICAgICAgLnRoZW4oY2FjaGUgPT4ge1xuICAgICAgICAgICAgLy8gbWFudWFsbHkgc3RyaXAgVVJMIGluc3RlYWQgb2YgYGlnbm9yZVNlYXJjaDogdHJ1ZWAgYmVjYXVzZSBvZiBhIGtub3duXG4gICAgICAgICAgICAvLyBwZXJmb3JtYW5jZSBpc3N1ZSBpbiBDaHJvbWUgaHR0cHM6Ly9naXRodWIuY29tL21hcGJveC9tYXBib3gtZ2wtanMvaXNzdWVzLzg0MzFcbiAgICAgICAgICAgIGNhY2hlLm1hdGNoKHN0cmlwcGVkVVJMKVxuICAgICAgICAgICAgICAgIC5jYXRjaChjYWxsYmFjaylcbiAgICAgICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZyZXNoID0gaXNGcmVzaChyZXNwb25zZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gUmVpbnNlcnQgaW50byBjYWNoZSBzbyB0aGF0IG9yZGVyIG9mIGtleXMgaW4gdGhlIGNhY2hlIGlzIHRoZSBvcmRlciBvZiBhY2Nlc3MuXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgbGluZSBtYWtlcyB0aGUgY2FjaGUgYSBMUlUgaW5zdGVhZCBvZiBhIEZJRk8gY2FjaGUuXG4gICAgICAgICAgICAgICAgICAgIGNhY2hlLmRlbGV0ZShzdHJpcHBlZFVSTCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmcmVzaCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGUucHV0KHN0cmlwcGVkVVJMLCByZXNwb25zZS5jbG9uZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHJlc3BvbnNlLCBmcmVzaCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChjYWxsYmFjayk7XG5cbn1cblxuZnVuY3Rpb24gaXNGcmVzaChyZXNwb25zZSkge1xuICAgIGlmICghcmVzcG9uc2UpIHJldHVybiBmYWxzZTtcbiAgICBjb25zdCBleHBpcmVzID0gbmV3IERhdGUocmVzcG9uc2UuaGVhZGVycy5nZXQoJ0V4cGlyZXMnKSk7XG4gICAgY29uc3QgY2FjaGVDb250cm9sID0gcGFyc2VDYWNoZUNvbnRyb2wocmVzcG9uc2UuaGVhZGVycy5nZXQoJ0NhY2hlLUNvbnRyb2wnKSB8fCAnJyk7XG4gICAgcmV0dXJuIGV4cGlyZXMgPiBEYXRlLm5vdygpICYmICFjYWNoZUNvbnRyb2xbJ25vLWNhY2hlJ107XG59XG5cbi8vIGBJbmZpbml0eWAgdHJpZ2dlcnMgYSBjYWNoZSBjaGVjayBhZnRlciB0aGUgZmlyc3QgdGlsZSBpcyBsb2FkZWRcbi8vIHNvIHRoYXQgYSBjaGVjayBpcyBydW4gYXQgbGVhc3Qgb25jZSBvbiBlYWNoIHBhZ2UgbG9hZC5cbmxldCBnbG9iYWxFbnRyeUNvdW50ZXIgPSBJbmZpbml0eTtcblxuLy8gVGhlIGNhY2hlIGNoZWNrIGdldHMgcnVuIG9uIGEgd29ya2VyLiBUaGUgcmVhc29uIGZvciB0aGlzIGlzIHRoYXRcbi8vIHByb2ZpbGluZyBzb21ldGltZXMgc2hvd3MgdGhpcyBhcyB0YWtpbmcgdXAgc2lnbmlmaWNhbnQgdGltZSBvbiB0aGVcbi8vIHRocmVhZCBpdCBnZXRzIGNhbGxlZCBmcm9tLiBBbmQgc29tZXRpbWVzIGl0IGRvZXNuJ3QuIEl0ICptYXkqIGJlXG4vLyBmaW5lIHRvIHJ1biB0aGlzIG9uIHRoZSBtYWluIHRocmVhZCBidXQgb3V0IG9mIGNhdXRpb24gdGhpcyBpcyBiZWluZ1xuLy8gZGlzcGF0Y2hlZCBvbiBhIHdvcmtlci4gVGhpcyBjYW4gYmUgaW52ZXN0aWdhdGVkIGZ1cnRoZXIgaW4gdGhlIGZ1dHVyZS5cbmV4cG9ydCBmdW5jdGlvbiBjYWNoZUVudHJ5UG9zc2libHlBZGRlZChkaXNwYXRjaGVyOiBEaXNwYXRjaGVyKSB7XG4gICAgZ2xvYmFsRW50cnlDb3VudGVyKys7XG4gICAgaWYgKGdsb2JhbEVudHJ5Q291bnRlciA+IGNhY2hlQ2hlY2tUaHJlc2hvbGQpIHtcbiAgICAgICAgZGlzcGF0Y2hlci5nZXRBY3RvcigpLnNlbmQoJ2VuZm9yY2VDYWNoZVNpemVMaW1pdCcsIGNhY2hlTGltaXQpO1xuICAgICAgICBnbG9iYWxFbnRyeUNvdW50ZXIgPSAwO1xuICAgIH1cbn1cblxuLy8gcnVucyBvbiB3b3JrZXIsIHNlZSBhYm92ZSBjb21tZW50XG5leHBvcnQgZnVuY3Rpb24gZW5mb3JjZUNhY2hlU2l6ZUxpbWl0KGxpbWl0OiBudW1iZXIpIHtcbiAgICBpZiAoIXdpbmRvdy5jYWNoZXMpIHJldHVybjtcbiAgICB3aW5kb3cuY2FjaGVzLm9wZW4oQ0FDSEVfTkFNRSlcbiAgICAgICAgLnRoZW4oY2FjaGUgPT4ge1xuICAgICAgICAgICAgY2FjaGUua2V5cygpLnRoZW4oa2V5cyA9PiB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aCAtIGxpbWl0OyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgY2FjaGUuZGVsZXRlKGtleXNbaV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFyVGlsZUNhY2hlKGNhbGxiYWNrPzogKGVycjogP0Vycm9yKSA9PiB2b2lkKSB7XG4gICAgY29uc3QgcHJvbWlzZSA9IHdpbmRvdy5jYWNoZXMuZGVsZXRlKENBQ0hFX05BTUUpO1xuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICBwcm9taXNlLmNhdGNoKGNhbGxiYWNrKS50aGVuKCgpID0+IGNhbGxiYWNrKCkpO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldENhY2hlTGltaXRzKGxpbWl0OiBudW1iZXIsIGNoZWNrVGhyZXNob2xkOiBudW1iZXIpIHtcbiAgICBjYWNoZUxpbWl0ID0gbGltaXQ7XG4gICAgY2FjaGVDaGVja1RocmVzaG9sZCA9IGNoZWNrVGhyZXNob2xkO1xufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHdpbmRvdyBmcm9tICcuL3dpbmRvdyc7XG5pbXBvcnQge2V4dGVuZCwgd2Fybk9uY2V9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQge2lzTWFwYm94SFRUUFVSTCwgaGFzQ2FjaGVEZWZlYXRpbmdTa3V9IGZyb20gJy4vbWFwYm94JztcbmltcG9ydCBjb25maWcgZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtjYWNoZUdldCwgY2FjaGVQdXR9IGZyb20gJy4vdGlsZV9yZXF1ZXN0X2NhY2hlJztcblxuaW1wb3J0IHR5cGUge0NhbGxiYWNrfSBmcm9tICcuLi90eXBlcy9jYWxsYmFjayc7XG5pbXBvcnQgdHlwZSB7Q2FuY2VsYWJsZX0gZnJvbSAnLi4vdHlwZXMvY2FuY2VsYWJsZSc7XG5cbi8qKlxuICogVGhlIHR5cGUgb2YgYSByZXNvdXJjZS5cbiAqIEBwcml2YXRlXG4gKiBAcmVhZG9ubHlcbiAqIEBlbnVtIHtzdHJpbmd9XG4gKi9cbmNvbnN0IFJlc291cmNlVHlwZSA9IHtcbiAgICBVbmtub3duOiAnVW5rbm93bicsXG4gICAgU3R5bGU6ICdTdHlsZScsXG4gICAgU291cmNlOiAnU291cmNlJyxcbiAgICBUaWxlOiAnVGlsZScsXG4gICAgR2x5cGhzOiAnR2x5cGhzJyxcbiAgICBTcHJpdGVJbWFnZTogJ1Nwcml0ZUltYWdlJyxcbiAgICBTcHJpdGVKU09OOiAnU3ByaXRlSlNPTicsXG4gICAgSW1hZ2U6ICdJbWFnZSdcbn07XG5leHBvcnQge1Jlc291cmNlVHlwZX07XG5cbmlmICh0eXBlb2YgT2JqZWN0LmZyZWV6ZSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgT2JqZWN0LmZyZWV6ZShSZXNvdXJjZVR5cGUpO1xufVxuXG4vKipcbiAqIEEgYFJlcXVlc3RQYXJhbWV0ZXJzYCBvYmplY3QgdG8gYmUgcmV0dXJuZWQgZnJvbSBNYXAub3B0aW9ucy50cmFuc2Zvcm1SZXF1ZXN0IGNhbGxiYWNrcy5cbiAqIEB0eXBlZGVmIHtPYmplY3R9IFJlcXVlc3RQYXJhbWV0ZXJzXG4gKiBAcHJvcGVydHkge3N0cmluZ30gdXJsIFRoZSBVUkwgdG8gYmUgcmVxdWVzdGVkLlxuICogQHByb3BlcnR5IHtPYmplY3R9IGhlYWRlcnMgVGhlIGhlYWRlcnMgdG8gYmUgc2VudCB3aXRoIHRoZSByZXF1ZXN0LlxuICogQHByb3BlcnR5IHtzdHJpbmd9IGNyZWRlbnRpYWxzIGAnc2FtZS1vcmlnaW4nfCdpbmNsdWRlJ2AgVXNlICdpbmNsdWRlJyB0byBzZW5kIGNvb2tpZXMgd2l0aCBjcm9zcy1vcmlnaW4gcmVxdWVzdHMuXG4gKi9cbmV4cG9ydCB0eXBlIFJlcXVlc3RQYXJhbWV0ZXJzID0ge1xuICAgIHVybDogc3RyaW5nLFxuICAgIGhlYWRlcnM/OiBPYmplY3QsXG4gICAgbWV0aG9kPzogJ0dFVCcgfCAnUE9TVCcgfCAnUFVUJyxcbiAgICBib2R5Pzogc3RyaW5nLFxuICAgIHR5cGU/OiAnc3RyaW5nJyB8ICdqc29uJyB8ICdhcnJheUJ1ZmZlcicsXG4gICAgY3JlZGVudGlhbHM/OiAnc2FtZS1vcmlnaW4nIHwgJ2luY2x1ZGUnLFxuICAgIGNvbGxlY3RSZXNvdXJjZVRpbWluZz86IGJvb2xlYW5cbn07XG5cbmV4cG9ydCB0eXBlIFJlc3BvbnNlQ2FsbGJhY2s8VD4gPSAoZXJyb3I6ID9FcnJvciwgZGF0YTogP1QsIGNhY2hlQ29udHJvbDogP3N0cmluZywgZXhwaXJlczogP3N0cmluZykgPT4gdm9pZDtcblxuY2xhc3MgQUpBWEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICAgIHN0YXR1czogbnVtYmVyO1xuICAgIHVybDogc3RyaW5nO1xuICAgIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZywgc3RhdHVzOiBudW1iZXIsIHVybDogc3RyaW5nKSB7XG4gICAgICAgIGlmIChzdGF0dXMgPT09IDQwMSAmJiBpc01hcGJveEhUVFBVUkwodXJsKSkge1xuICAgICAgICAgICAgbWVzc2FnZSArPSAnOiB5b3UgbWF5IGhhdmUgcHJvdmlkZWQgYW4gaW52YWxpZCBNYXBib3ggYWNjZXNzIHRva2VuLiBTZWUgaHR0cHM6Ly93d3cubWFwYm94LmNvbS9hcGktZG9jdW1lbnRhdGlvbi8jYWNjZXNzLXRva2Vucy1hbmQtdG9rZW4tc2NvcGVzJztcbiAgICAgICAgfVxuICAgICAgICBzdXBlcihtZXNzYWdlKTtcbiAgICAgICAgdGhpcy5zdGF0dXMgPSBzdGF0dXM7XG4gICAgICAgIHRoaXMudXJsID0gdXJsO1xuXG4gICAgICAgIC8vIHdvcmsgYXJvdW5kIGZvciBodHRwczovL2dpdGh1Yi5jb20vUmljaC1IYXJyaXMvYnVibGUvaXNzdWVzLzQwXG4gICAgICAgIHRoaXMubmFtZSA9IHRoaXMuY29uc3RydWN0b3IubmFtZTtcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIGAke3RoaXMubmFtZX06ICR7dGhpcy5tZXNzYWdlfSAoJHt0aGlzLnN0YXR1c30pOiAke3RoaXMudXJsfWA7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBpc1dvcmtlcigpIHtcbiAgICByZXR1cm4gdHlwZW9mIFdvcmtlckdsb2JhbFNjb3BlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgICAgICAgc2VsZiBpbnN0YW5jZW9mIFdvcmtlckdsb2JhbFNjb3BlO1xufVxuXG4vLyBFbnN1cmUgdGhhdCB3ZSdyZSBzZW5kaW5nIHRoZSBjb3JyZWN0IHJlZmVycmVyIGZyb20gYmxvYiBVUkwgd29ya2VyIGJ1bmRsZXMuXG4vLyBGb3IgZmlsZXMgbG9hZGVkIGZyb20gdGhlIGxvY2FsIGZpbGUgc3lzdGVtLCBgbG9jYXRpb24ub3JpZ2luYCB3aWxsIGJlIHNldFxuLy8gdG8gdGhlIHN0cmluZyghKSBcIm51bGxcIiAoRmlyZWZveCksIG9yIFwiZmlsZTovL1wiIChDaHJvbWUsIFNhZmFyaSwgRWRnZSwgSUUpLFxuLy8gYW5kIHdlIHdpbGwgc2V0IGFuIGVtcHR5IHJlZmVycmVyLiBPdGhlcndpc2UsIHdlJ3JlIHVzaW5nIHRoZSBkb2N1bWVudCdzIFVSTC5cbi8qIGdsb2JhbCBzZWxmLCBXb3JrZXJHbG9iYWxTY29wZSAqL1xuZXhwb3J0IGNvbnN0IGdldFJlZmVycmVyID0gaXNXb3JrZXIoKSA/XG4gICAgKCkgPT4gc2VsZi53b3JrZXIgJiYgc2VsZi53b3JrZXIucmVmZXJyZXIgOlxuICAgICgpID0+ICh3aW5kb3cubG9jYXRpb24ucHJvdG9jb2wgPT09ICdibG9iOicgPyB3aW5kb3cucGFyZW50IDogd2luZG93KS5sb2NhdGlvbi5ocmVmO1xuXG4vLyBEZXRlcm1pbmVzIHdoZXRoZXIgYSBVUkwgaXMgYSBmaWxlOi8vIFVSTC4gVGhpcyBpcyBvYnZpb3VzbHkgdGhlIGNhc2UgaWYgaXQgYmVnaW5zXG4vLyB3aXRoIGZpbGU6Ly8uIFJlbGF0aXZlIFVSTHMgYXJlIGFsc28gZmlsZTovLyBVUkxzIGlmZiB0aGUgb3JpZ2luYWwgZG9jdW1lbnQgd2FzIGxvYWRlZFxuLy8gdmlhIGEgZmlsZTovLyBVUkwuXG5jb25zdCBpc0ZpbGVVUkwgPSB1cmwgPT4gL15maWxlOi8udGVzdCh1cmwpIHx8ICgvXmZpbGU6Ly50ZXN0KGdldFJlZmVycmVyKCkpICYmICEvXlxcdys6Ly50ZXN0KHVybCkpO1xuXG5mdW5jdGlvbiBtYWtlRmV0Y2hSZXF1ZXN0KHJlcXVlc3RQYXJhbWV0ZXJzOiBSZXF1ZXN0UGFyYW1ldGVycywgY2FsbGJhY2s6IFJlc3BvbnNlQ2FsbGJhY2s8YW55Pik6IENhbmNlbGFibGUge1xuICAgIGNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgd2luZG93LkFib3J0Q29udHJvbGxlcigpO1xuICAgIGNvbnN0IHJlcXVlc3QgPSBuZXcgd2luZG93LlJlcXVlc3QocmVxdWVzdFBhcmFtZXRlcnMudXJsLCB7XG4gICAgICAgIG1ldGhvZDogcmVxdWVzdFBhcmFtZXRlcnMubWV0aG9kIHx8ICdHRVQnLFxuICAgICAgICBib2R5OiByZXF1ZXN0UGFyYW1ldGVycy5ib2R5LFxuICAgICAgICBjcmVkZW50aWFsczogcmVxdWVzdFBhcmFtZXRlcnMuY3JlZGVudGlhbHMsXG4gICAgICAgIGhlYWRlcnM6IHJlcXVlc3RQYXJhbWV0ZXJzLmhlYWRlcnMsXG4gICAgICAgIHJlZmVycmVyOiBnZXRSZWZlcnJlcigpLFxuICAgICAgICBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsXG4gICAgfSk7XG4gICAgbGV0IGNvbXBsZXRlID0gZmFsc2U7XG4gICAgbGV0IGFib3J0ZWQgPSBmYWxzZTtcblxuICAgIGNvbnN0IGNhY2hlSWdub3JpbmdTZWFyY2ggPSBoYXNDYWNoZURlZmVhdGluZ1NrdShyZXF1ZXN0LnVybCk7XG5cbiAgICBpZiAocmVxdWVzdFBhcmFtZXRlcnMudHlwZSA9PT0gJ2pzb24nKSB7XG4gICAgICAgIHJlcXVlc3QuaGVhZGVycy5zZXQoJ0FjY2VwdCcsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgfVxuXG4gICAgY29uc3QgdmFsaWRhdGVPckZldGNoID0gKGVyciwgY2FjaGVkUmVzcG9uc2UsIHJlc3BvbnNlSXNGcmVzaCkgPT4ge1xuICAgICAgICBpZiAoYWJvcnRlZCkgcmV0dXJuO1xuXG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIC8vIERvIGZldGNoIGluIGNhc2Ugb2YgY2FjaGUgZXJyb3IuXG4gICAgICAgICAgICAvLyBIVFRQIHBhZ2VzIGluIEVkZ2UgdHJpZ2dlciBhIHNlY3VyaXR5IGVycm9yIHRoYXQgY2FuIGJlIGlnbm9yZWQuXG4gICAgICAgICAgICBpZiAoZXJyLm1lc3NhZ2UgIT09ICdTZWN1cml0eUVycm9yJykge1xuICAgICAgICAgICAgICAgIHdhcm5PbmNlKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2FjaGVkUmVzcG9uc2UgJiYgcmVzcG9uc2VJc0ZyZXNoKSB7XG4gICAgICAgICAgICByZXR1cm4gZmluaXNoUmVxdWVzdChjYWNoZWRSZXNwb25zZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2FjaGVkUmVzcG9uc2UpIHtcbiAgICAgICAgICAgIC8vIFdlIGNhbid0IGRvIHJldmFsaWRhdGlvbiB3aXRoICdJZi1Ob25lLU1hdGNoJyBiZWNhdXNlIHRoZW4gdGhlXG4gICAgICAgICAgICAvLyByZXF1ZXN0IGRvZXNuJ3QgaGF2ZSBzaW1wbGUgY29ycyBoZWFkZXJzLlxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcmVxdWVzdFRpbWUgPSBEYXRlLm5vdygpO1xuXG4gICAgICAgIHdpbmRvdy5mZXRjaChyZXF1ZXN0KS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5vaykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNhY2hlYWJsZVJlc3BvbnNlID0gY2FjaGVJZ25vcmluZ1NlYXJjaCA/IHJlc3BvbnNlLmNsb25lKCkgOiBudWxsO1xuICAgICAgICAgICAgICAgIHJldHVybiBmaW5pc2hSZXF1ZXN0KHJlc3BvbnNlLCBjYWNoZWFibGVSZXNwb25zZSwgcmVxdWVzdFRpbWUpO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhuZXcgQUpBWEVycm9yKHJlc3BvbnNlLnN0YXR1c1RleHQsIHJlc3BvbnNlLnN0YXR1cywgcmVxdWVzdFBhcmFtZXRlcnMudXJsKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgIGlmIChlcnJvci5jb2RlID09PSAyMCkge1xuICAgICAgICAgICAgICAgIC8vIHNpbGVuY2UgZXhwZWN0ZWQgQWJvcnRFcnJvclxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhbGxiYWNrKG5ldyBFcnJvcihlcnJvci5tZXNzYWdlKSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBjb25zdCBmaW5pc2hSZXF1ZXN0ID0gKHJlc3BvbnNlLCBjYWNoZWFibGVSZXNwb25zZSwgcmVxdWVzdFRpbWUpID0+IHtcbiAgICAgICAgKFxuICAgICAgICAgICAgcmVxdWVzdFBhcmFtZXRlcnMudHlwZSA9PT0gJ2FycmF5QnVmZmVyJyA/IHJlc3BvbnNlLmFycmF5QnVmZmVyKCkgOlxuICAgICAgICAgICAgcmVxdWVzdFBhcmFtZXRlcnMudHlwZSA9PT0gJ2pzb24nID8gcmVzcG9uc2UuanNvbigpIDpcbiAgICAgICAgICAgIHJlc3BvbnNlLnRleHQoKVxuICAgICAgICApLnRoZW4ocmVzdWx0ID0+IHtcbiAgICAgICAgICAgIGlmIChhYm9ydGVkKSByZXR1cm47XG4gICAgICAgICAgICBpZiAoY2FjaGVhYmxlUmVzcG9uc2UgJiYgcmVxdWVzdFRpbWUpIHtcbiAgICAgICAgICAgICAgICAvLyBUaGUgcmVzcG9uc2UgbmVlZHMgdG8gYmUgaW5zZXJ0ZWQgaW50byB0aGUgY2FjaGUgYWZ0ZXIgaXQgaGFzIGNvbXBsZXRlbHkgbG9hZGVkLlxuICAgICAgICAgICAgICAgIC8vIFVudGlsIGl0IGlzIGZ1bGx5IGxvYWRlZCB0aGVyZSBpcyBhIGNoYW5jZSBpdCB3aWxsIGJlIGFib3J0ZWQuIEFib3J0aW5nIHdoaWxlXG4gICAgICAgICAgICAgICAgLy8gcmVhZGluZyB0aGUgYm9keSBjYW4gY2F1c2UgdGhlIGNhY2hlIGluc2VydGlvbiB0byBlcnJvci4gV2UgY291bGQgY2F0Y2ggdGhpcyBlcnJvclxuICAgICAgICAgICAgICAgIC8vIGluIG1vc3QgYnJvd3NlcnMgYnV0IGluIEZpcmVmb3ggaXQgc2VlbXMgdG8gc29tZXRpbWVzIGNyYXNoIHRoZSB0YWIuIEFkZGluZ1xuICAgICAgICAgICAgICAgIC8vIGl0IHRvIHRoZSBjYWNoZSBoZXJlIGF2b2lkcyB0aGF0IGVycm9yLlxuICAgICAgICAgICAgICAgIGNhY2hlUHV0KHJlcXVlc3QsIGNhY2hlYWJsZVJlc3BvbnNlLCByZXF1ZXN0VGltZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb21wbGV0ZSA9IHRydWU7XG4gICAgICAgICAgICBjYWxsYmFjayhudWxsLCByZXN1bHQsIHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdDYWNoZS1Db250cm9sJyksIHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdFeHBpcmVzJykpO1xuICAgICAgICB9KS5jYXRjaChlcnIgPT4gY2FsbGJhY2sobmV3IEVycm9yKGVyci5tZXNzYWdlKSkpO1xuICAgIH07XG5cbiAgICBpZiAoY2FjaGVJZ25vcmluZ1NlYXJjaCkge1xuICAgICAgICBjYWNoZUdldChyZXF1ZXN0LCB2YWxpZGF0ZU9yRmV0Y2gpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbGlkYXRlT3JGZXRjaChudWxsLCBudWxsKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge2NhbmNlbDogKCkgPT4ge1xuICAgICAgICBhYm9ydGVkID0gdHJ1ZTtcbiAgICAgICAgaWYgKCFjb21wbGV0ZSkgY29udHJvbGxlci5hYm9ydCgpO1xuICAgIH19O1xufVxuXG5mdW5jdGlvbiBtYWtlWE1MSHR0cFJlcXVlc3QocmVxdWVzdFBhcmFtZXRlcnM6IFJlcXVlc3RQYXJhbWV0ZXJzLCBjYWxsYmFjazogUmVzcG9uc2VDYWxsYmFjazxhbnk+KTogQ2FuY2VsYWJsZSB7XG4gICAgY29uc3QgeGhyOiBYTUxIdHRwUmVxdWVzdCA9IG5ldyB3aW5kb3cuWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgIHhoci5vcGVuKHJlcXVlc3RQYXJhbWV0ZXJzLm1ldGhvZCB8fCAnR0VUJywgcmVxdWVzdFBhcmFtZXRlcnMudXJsLCB0cnVlKTtcbiAgICBpZiAocmVxdWVzdFBhcmFtZXRlcnMudHlwZSA9PT0gJ2FycmF5QnVmZmVyJykge1xuICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2FycmF5YnVmZmVyJztcbiAgICB9XG4gICAgZm9yIChjb25zdCBrIGluIHJlcXVlc3RQYXJhbWV0ZXJzLmhlYWRlcnMpIHtcbiAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoaywgcmVxdWVzdFBhcmFtZXRlcnMuaGVhZGVyc1trXSk7XG4gICAgfVxuICAgIGlmIChyZXF1ZXN0UGFyYW1ldGVycy50eXBlID09PSAnanNvbicpIHtcbiAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICd0ZXh0JztcbiAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0FjY2VwdCcsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgfVxuICAgIHhoci53aXRoQ3JlZGVudGlhbHMgPSByZXF1ZXN0UGFyYW1ldGVycy5jcmVkZW50aWFscyA9PT0gJ2luY2x1ZGUnO1xuICAgIHhoci5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgICBjYWxsYmFjayhuZXcgRXJyb3IoeGhyLnN0YXR1c1RleHQpKTtcbiAgICB9O1xuICAgIHhoci5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgIGlmICgoKHhoci5zdGF0dXMgPj0gMjAwICYmIHhoci5zdGF0dXMgPCAzMDApIHx8IHhoci5zdGF0dXMgPT09IDApICYmIHhoci5yZXNwb25zZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgbGV0IGRhdGE6IG1peGVkID0geGhyLnJlc3BvbnNlO1xuICAgICAgICAgICAgaWYgKHJlcXVlc3RQYXJhbWV0ZXJzLnR5cGUgPT09ICdqc29uJykge1xuICAgICAgICAgICAgICAgIC8vIFdlJ3JlIG1hbnVhbGx5IHBhcnNpbmcgSlNPTiBoZXJlIHRvIGdldCBiZXR0ZXIgZXJyb3IgbWVzc2FnZXMuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YSA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgZGF0YSwgeGhyLmdldFJlc3BvbnNlSGVhZGVyKCdDYWNoZS1Db250cm9sJyksIHhoci5nZXRSZXNwb25zZUhlYWRlcignRXhwaXJlcycpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKG5ldyBBSkFYRXJyb3IoeGhyLnN0YXR1c1RleHQsIHhoci5zdGF0dXMsIHJlcXVlc3RQYXJhbWV0ZXJzLnVybCkpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICB4aHIuc2VuZChyZXF1ZXN0UGFyYW1ldGVycy5ib2R5KTtcbiAgICByZXR1cm4ge2NhbmNlbDogKCkgPT4geGhyLmFib3J0KCl9O1xufVxuXG5leHBvcnQgY29uc3QgbWFrZVJlcXVlc3QgPSBmdW5jdGlvbihyZXF1ZXN0UGFyYW1ldGVyczogUmVxdWVzdFBhcmFtZXRlcnMsIGNhbGxiYWNrOiBSZXNwb25zZUNhbGxiYWNrPGFueT4pOiBDYW5jZWxhYmxlIHtcbiAgICAvLyBXZSdyZSB0cnlpbmcgdG8gdXNlIHRoZSBGZXRjaCBBUEkgaWYgcG9zc2libGUuIEhvd2V2ZXIsIGluIHNvbWUgc2l0dWF0aW9ucyB3ZSBjYW4ndCB1c2UgaXQ6XG4gICAgLy8gLSBJRTExIGRvZXNuJ3Qgc3VwcG9ydCBpdCBhdCBhbGwuIEluIHRoaXMgY2FzZSwgd2UgZGlzcGF0Y2ggdGhlIHJlcXVlc3QgdG8gdGhlIG1haW4gdGhyZWFkIHNvXG4gICAgLy8gICB0aGF0IHdlIGNhbiBnZXQgYW4gYWNjcnVhdGUgcmVmZXJyZXIgaGVhZGVyLlxuICAgIC8vIC0gU2FmYXJpIGV4cG9zZXMgd2luZG93LkFib3J0Q29udHJvbGxlciwgYnV0IGl0IGRvZXNuJ3Qgd29yayBhY3R1YWxseSBhYm9ydCBhbnkgcmVxdWVzdHMgaW5cbiAgICAvLyAgIHNvbWUgdmVyc2lvbnMgKHNlZSBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTc0OTgwI2MyKVxuICAgIC8vIC0gUmVxdWVzdHMgZm9yIHJlc291cmNlcyB3aXRoIHRoZSBmaWxlOi8vIFVSSSBzY2hlbWUgZG9uJ3Qgd29yayB3aXRoIHRoZSBGZXRjaCBBUEkgZWl0aGVyLiBJblxuICAgIC8vICAgdGhpcyBjYXNlIHdlIHVuY29uZGl0aW9uYWxseSB1c2UgWEhSIG9uIHRoZSBjdXJyZW50IHRocmVhZCBzaW5jZSByZWZlcnJlcnMgZG9uJ3QgbWF0dGVyLlxuICAgIGlmICghaXNGaWxlVVJMKHJlcXVlc3RQYXJhbWV0ZXJzLnVybCkpIHtcbiAgICAgICAgaWYgKHdpbmRvdy5mZXRjaCAmJiB3aW5kb3cuUmVxdWVzdCAmJiB3aW5kb3cuQWJvcnRDb250cm9sbGVyICYmIHdpbmRvdy5SZXF1ZXN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSgnc2lnbmFsJykpIHtcbiAgICAgICAgICAgIHJldHVybiBtYWtlRmV0Y2hSZXF1ZXN0KHJlcXVlc3RQYXJhbWV0ZXJzLCBjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzV29ya2VyKCkgJiYgc2VsZi53b3JrZXIgJiYgc2VsZi53b3JrZXIuYWN0b3IpIHtcbiAgICAgICAgICAgIHJldHVybiBzZWxmLndvcmtlci5hY3Rvci5zZW5kKCdnZXRSZXNvdXJjZScsIHJlcXVlc3RQYXJhbWV0ZXJzLCBjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1ha2VYTUxIdHRwUmVxdWVzdChyZXF1ZXN0UGFyYW1ldGVycywgY2FsbGJhY2spO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldEpTT04gPSBmdW5jdGlvbihyZXF1ZXN0UGFyYW1ldGVyczogUmVxdWVzdFBhcmFtZXRlcnMsIGNhbGxiYWNrOiBSZXNwb25zZUNhbGxiYWNrPE9iamVjdD4pOiBDYW5jZWxhYmxlIHtcbiAgICByZXR1cm4gbWFrZVJlcXVlc3QoZXh0ZW5kKHJlcXVlc3RQYXJhbWV0ZXJzLCB7dHlwZTogJ2pzb24nfSksIGNhbGxiYWNrKTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRBcnJheUJ1ZmZlciA9IGZ1bmN0aW9uKHJlcXVlc3RQYXJhbWV0ZXJzOiBSZXF1ZXN0UGFyYW1ldGVycywgY2FsbGJhY2s6IFJlc3BvbnNlQ2FsbGJhY2s8QXJyYXlCdWZmZXI+KTogQ2FuY2VsYWJsZSB7XG4gICAgcmV0dXJuIG1ha2VSZXF1ZXN0KGV4dGVuZChyZXF1ZXN0UGFyYW1ldGVycywge3R5cGU6ICdhcnJheUJ1ZmZlcid9KSwgY2FsbGJhY2spO1xufTtcblxuZXhwb3J0IGNvbnN0IHBvc3REYXRhID0gZnVuY3Rpb24ocmVxdWVzdFBhcmFtZXRlcnM6IFJlcXVlc3RQYXJhbWV0ZXJzLCBjYWxsYmFjazogUmVzcG9uc2VDYWxsYmFjazxzdHJpbmc+KTogQ2FuY2VsYWJsZSB7XG4gICAgcmV0dXJuIG1ha2VSZXF1ZXN0KGV4dGVuZChyZXF1ZXN0UGFyYW1ldGVycywge21ldGhvZDogJ1BPU1QnfSksIGNhbGxiYWNrKTtcbn07XG5cbmZ1bmN0aW9uIHNhbWVPcmlnaW4odXJsKSB7XG4gICAgY29uc3QgYTogSFRNTEFuY2hvckVsZW1lbnQgPSB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgIGEuaHJlZiA9IHVybDtcbiAgICByZXR1cm4gYS5wcm90b2NvbCA9PT0gd2luZG93LmRvY3VtZW50LmxvY2F0aW9uLnByb3RvY29sICYmIGEuaG9zdCA9PT0gd2luZG93LmRvY3VtZW50LmxvY2F0aW9uLmhvc3Q7XG59XG5cbmNvbnN0IHRyYW5zcGFyZW50UG5nVXJsID0gJ2RhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQUVBQUFBQkNBWUFBQUFmRmNTSkFBQUFDMGxFUVZRWVYyTmdBQUlBQUFVQUFhclZ5RkVBQUFBQVNVVk9SSzVDWUlJPSc7XG5cbmxldCBpbWFnZVF1ZXVlLCBudW1JbWFnZVJlcXVlc3RzO1xuZXhwb3J0IGNvbnN0IHJlc2V0SW1hZ2VSZXF1ZXN0UXVldWUgPSAoKSA9PiB7XG4gICAgaW1hZ2VRdWV1ZSA9IFtdO1xuICAgIG51bUltYWdlUmVxdWVzdHMgPSAwO1xufTtcbnJlc2V0SW1hZ2VSZXF1ZXN0UXVldWUoKTtcblxuZXhwb3J0IGNvbnN0IGdldEltYWdlID0gZnVuY3Rpb24ocmVxdWVzdFBhcmFtZXRlcnM6IFJlcXVlc3RQYXJhbWV0ZXJzLCBjYWxsYmFjazogQ2FsbGJhY2s8SFRNTEltYWdlRWxlbWVudD4pOiBDYW5jZWxhYmxlIHtcbiAgICAvLyBsaW1pdCBjb25jdXJyZW50IGltYWdlIGxvYWRzIHRvIGhlbHAgd2l0aCByYXN0ZXIgc291cmNlcyBwZXJmb3JtYW5jZSBvbiBiaWcgc2NyZWVuc1xuICAgIGlmIChudW1JbWFnZVJlcXVlc3RzID49IGNvbmZpZy5NQVhfUEFSQUxMRUxfSU1BR0VfUkVRVUVTVFMpIHtcbiAgICAgICAgY29uc3QgcXVldWVkID0ge1xuICAgICAgICAgICAgcmVxdWVzdFBhcmFtZXRlcnMsXG4gICAgICAgICAgICBjYWxsYmFjayxcbiAgICAgICAgICAgIGNhbmNlbGxlZDogZmFsc2UsXG4gICAgICAgICAgICBjYW5jZWwoKSB7IHRoaXMuY2FuY2VsbGVkID0gdHJ1ZTsgfVxuICAgICAgICB9O1xuICAgICAgICBpbWFnZVF1ZXVlLnB1c2gocXVldWVkKTtcbiAgICAgICAgcmV0dXJuIHF1ZXVlZDtcbiAgICB9XG4gICAgbnVtSW1hZ2VSZXF1ZXN0cysrO1xuXG4gICAgbGV0IGFkdmFuY2VkID0gZmFsc2U7XG4gICAgY29uc3QgYWR2YW5jZUltYWdlUmVxdWVzdFF1ZXVlID0gKCkgPT4ge1xuICAgICAgICBpZiAoYWR2YW5jZWQpIHJldHVybjtcbiAgICAgICAgYWR2YW5jZWQgPSB0cnVlO1xuICAgICAgICBudW1JbWFnZVJlcXVlc3RzLS07XG4gICAgICAgIGFzc2VydChudW1JbWFnZVJlcXVlc3RzID49IDApO1xuICAgICAgICB3aGlsZSAoaW1hZ2VRdWV1ZS5sZW5ndGggJiYgbnVtSW1hZ2VSZXF1ZXN0cyA8IGNvbmZpZy5NQVhfUEFSQUxMRUxfSU1BR0VfUkVRVUVTVFMpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgICAgICAgICAgY29uc3QgcmVxdWVzdCA9IGltYWdlUXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgIGNvbnN0IHtyZXF1ZXN0UGFyYW1ldGVycywgY2FsbGJhY2ssIGNhbmNlbGxlZH0gPSByZXF1ZXN0O1xuICAgICAgICAgICAgaWYgKCFjYW5jZWxsZWQpIHtcbiAgICAgICAgICAgICAgICByZXF1ZXN0LmNhbmNlbCA9IGdldEltYWdlKHJlcXVlc3RQYXJhbWV0ZXJzLCBjYWxsYmFjaykuY2FuY2VsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIHJlcXVlc3QgdGhlIGltYWdlIHdpdGggWEhSIHRvIHdvcmsgYXJvdW5kIGNhY2hpbmcgaXNzdWVzXG4gICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXBib3gvbWFwYm94LWdsLWpzL2lzc3Vlcy8xNDcwXG4gICAgY29uc3QgcmVxdWVzdCA9IGdldEFycmF5QnVmZmVyKHJlcXVlc3RQYXJhbWV0ZXJzLCAoZXJyOiA/RXJyb3IsIGRhdGE6ID9BcnJheUJ1ZmZlciwgY2FjaGVDb250cm9sOiA/c3RyaW5nLCBleHBpcmVzOiA/c3RyaW5nKSA9PiB7XG5cbiAgICAgICAgYWR2YW5jZUltYWdlUmVxdWVzdFF1ZXVlKCk7XG5cbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgfSBlbHNlIGlmIChkYXRhKSB7XG4gICAgICAgICAgICBjb25zdCBpbWc6IEhUTUxJbWFnZUVsZW1lbnQgPSBuZXcgd2luZG93LkltYWdlKCk7XG4gICAgICAgICAgICBjb25zdCBVUkwgPSB3aW5kb3cuVVJMIHx8IHdpbmRvdy53ZWJraXRVUkw7XG4gICAgICAgICAgICBpbWcub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIGltZyk7XG4gICAgICAgICAgICAgICAgVVJMLnJldm9rZU9iamVjdFVSTChpbWcuc3JjKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpbWcub25lcnJvciA9ICgpID0+IGNhbGxiYWNrKG5ldyBFcnJvcignQ291bGQgbm90IGxvYWQgaW1hZ2UuIFBsZWFzZSBtYWtlIHN1cmUgdG8gdXNlIGEgc3VwcG9ydGVkIGltYWdlIHR5cGUgc3VjaCBhcyBQTkcgb3IgSlBFRy4gTm90ZSB0aGF0IFNWR3MgYXJlIG5vdCBzdXBwb3J0ZWQuJykpO1xuICAgICAgICAgICAgY29uc3QgYmxvYjogQmxvYiA9IG5ldyB3aW5kb3cuQmxvYihbbmV3IFVpbnQ4QXJyYXkoZGF0YSldLCB7dHlwZTogJ2ltYWdlL3BuZyd9KTtcbiAgICAgICAgICAgIChpbWc6IGFueSkuY2FjaGVDb250cm9sID0gY2FjaGVDb250cm9sO1xuICAgICAgICAgICAgKGltZzogYW55KS5leHBpcmVzID0gZXhwaXJlcztcbiAgICAgICAgICAgIGltZy5zcmMgPSBkYXRhLmJ5dGVMZW5ndGggPyBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpIDogdHJhbnNwYXJlbnRQbmdVcmw7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGNhbmNlbDogKCkgPT4ge1xuICAgICAgICAgICAgcmVxdWVzdC5jYW5jZWwoKTtcbiAgICAgICAgICAgIGFkdmFuY2VJbWFnZVJlcXVlc3RRdWV1ZSgpO1xuICAgICAgICB9XG4gICAgfTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRWaWRlbyA9IGZ1bmN0aW9uKHVybHM6IEFycmF5PHN0cmluZz4sIGNhbGxiYWNrOiBDYWxsYmFjazxIVE1MVmlkZW9FbGVtZW50Pik6IENhbmNlbGFibGUge1xuICAgIGNvbnN0IHZpZGVvOiBIVE1MVmlkZW9FbGVtZW50ID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3ZpZGVvJyk7XG4gICAgdmlkZW8ubXV0ZWQgPSB0cnVlO1xuICAgIHZpZGVvLm9ubG9hZHN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHZpZGVvKTtcbiAgICB9O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdXJscy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBzOiBIVE1MU291cmNlRWxlbWVudCA9IHdpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzb3VyY2UnKTtcbiAgICAgICAgaWYgKCFzYW1lT3JpZ2luKHVybHNbaV0pKSB7XG4gICAgICAgICAgICB2aWRlby5jcm9zc09yaWdpbiA9ICdBbm9ueW1vdXMnO1xuICAgICAgICB9XG4gICAgICAgIHMuc3JjID0gdXJsc1tpXTtcbiAgICAgICAgdmlkZW8uYXBwZW5kQ2hpbGQocyk7XG4gICAgfVxuICAgIHJldHVybiB7Y2FuY2VsOiAoKSA9PiB7fX07XG59O1xuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHtleHRlbmR9IGZyb20gJy4vdXRpbCc7XG5cbnR5cGUgTGlzdGVuZXIgPSAoT2JqZWN0KSA9PiBhbnk7XG50eXBlIExpc3RlbmVycyA9IHsgW3N0cmluZ106IEFycmF5PExpc3RlbmVyPiB9O1xuXG5mdW5jdGlvbiBfYWRkRXZlbnRMaXN0ZW5lcih0eXBlOiBzdHJpbmcsIGxpc3RlbmVyOiBMaXN0ZW5lciwgbGlzdGVuZXJMaXN0OiBMaXN0ZW5lcnMpIHtcbiAgICBjb25zdCBsaXN0ZW5lckV4aXN0cyA9IGxpc3RlbmVyTGlzdFt0eXBlXSAmJiBsaXN0ZW5lckxpc3RbdHlwZV0uaW5kZXhPZihsaXN0ZW5lcikgIT09IC0xO1xuICAgIGlmICghbGlzdGVuZXJFeGlzdHMpIHtcbiAgICAgICAgbGlzdGVuZXJMaXN0W3R5cGVdID0gbGlzdGVuZXJMaXN0W3R5cGVdIHx8IFtdO1xuICAgICAgICBsaXN0ZW5lckxpc3RbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBfcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlOiBzdHJpbmcsIGxpc3RlbmVyOiBMaXN0ZW5lciwgbGlzdGVuZXJMaXN0OiBMaXN0ZW5lcnMpIHtcbiAgICBpZiAobGlzdGVuZXJMaXN0ICYmIGxpc3RlbmVyTGlzdFt0eXBlXSkge1xuICAgICAgICBjb25zdCBpbmRleCA9IGxpc3RlbmVyTGlzdFt0eXBlXS5pbmRleE9mKGxpc3RlbmVyKTtcbiAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgbGlzdGVuZXJMaXN0W3R5cGVdLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBFdmVudCB7XG4gICAgK3R5cGU6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKHR5cGU6IHN0cmluZywgZGF0YTogT2JqZWN0ID0ge30pIHtcbiAgICAgICAgZXh0ZW5kKHRoaXMsIGRhdGEpO1xuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEVycm9yRXZlbnQgZXh0ZW5kcyBFdmVudCB7XG4gICAgZXJyb3I6IEVycm9yO1xuXG4gICAgY29uc3RydWN0b3IoZXJyb3I6IEVycm9yLCBkYXRhOiBPYmplY3QgPSB7fSkge1xuICAgICAgICBzdXBlcignZXJyb3InLCBleHRlbmQoe2Vycm9yfSwgZGF0YSkpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBNZXRob2RzIG1peGVkIGluIHRvIG90aGVyIGNsYXNzZXMgZm9yIGV2ZW50IGNhcGFiaWxpdGllcy5cbiAqXG4gKiBAbWl4aW4gRXZlbnRlZFxuICovXG5leHBvcnQgY2xhc3MgRXZlbnRlZCB7XG4gICAgX2xpc3RlbmVyczogTGlzdGVuZXJzO1xuICAgIF9vbmVUaW1lTGlzdGVuZXJzOiBMaXN0ZW5lcnM7XG4gICAgX2V2ZW50ZWRQYXJlbnQ6ID9FdmVudGVkO1xuICAgIF9ldmVudGVkUGFyZW50RGF0YTogPyhPYmplY3QgfCAoKSA9PiBPYmplY3QpO1xuXG4gICAgLyoqXG4gICAgICogQWRkcyBhIGxpc3RlbmVyIHRvIGEgc3BlY2lmaWVkIGV2ZW50IHR5cGUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBUaGUgZXZlbnQgdHlwZSB0byBhZGQgYSBsaXN0ZW4gZm9yLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyIFRoZSBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiB0aGUgZXZlbnQgaXMgZmlyZWQuXG4gICAgICogICBUaGUgbGlzdGVuZXIgZnVuY3Rpb24gaXMgY2FsbGVkIHdpdGggdGhlIGRhdGEgb2JqZWN0IHBhc3NlZCB0byBgZmlyZWAsXG4gICAgICogICBleHRlbmRlZCB3aXRoIGB0YXJnZXRgIGFuZCBgdHlwZWAgcHJvcGVydGllcy5cbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBgdGhpc2BcbiAgICAgKi9cbiAgICBvbih0eXBlOiAqLCBsaXN0ZW5lcjogTGlzdGVuZXIpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5fbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzIHx8IHt9O1xuICAgICAgICBfYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgdGhpcy5fbGlzdGVuZXJzKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGEgcHJldmlvdXNseSByZWdpc3RlcmVkIGV2ZW50IGxpc3RlbmVyLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgVGhlIGV2ZW50IHR5cGUgdG8gcmVtb3ZlIGxpc3RlbmVycyBmb3IuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXIgVGhlIGxpc3RlbmVyIGZ1bmN0aW9uIHRvIHJlbW92ZS5cbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBgdGhpc2BcbiAgICAgKi9cbiAgICBvZmYodHlwZTogKiwgbGlzdGVuZXI6IExpc3RlbmVyKSB7XG4gICAgICAgIF9yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCB0aGlzLl9saXN0ZW5lcnMpO1xuICAgICAgICBfcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgdGhpcy5fb25lVGltZUxpc3RlbmVycyk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBhIGxpc3RlbmVyIHRoYXQgd2lsbCBiZSBjYWxsZWQgb25seSBvbmNlIHRvIGEgc3BlY2lmaWVkIGV2ZW50IHR5cGUuXG4gICAgICpcbiAgICAgKiBUaGUgbGlzdGVuZXIgd2lsbCBiZSBjYWxsZWQgZmlyc3QgdGltZSB0aGUgZXZlbnQgZmlyZXMgYWZ0ZXIgdGhlIGxpc3RlbmVyIGlzIHJlZ2lzdGVyZWQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBUaGUgZXZlbnQgdHlwZSB0byBsaXN0ZW4gZm9yLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyIFRoZSBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiB0aGUgZXZlbnQgaXMgZmlyZWQgdGhlIGZpcnN0IHRpbWUuXG4gICAgICogQHJldHVybnMge09iamVjdH0gYHRoaXNgXG4gICAgICovXG4gICAgb25jZSh0eXBlOiBzdHJpbmcsIGxpc3RlbmVyOiBMaXN0ZW5lcikge1xuICAgICAgICB0aGlzLl9vbmVUaW1lTGlzdGVuZXJzID0gdGhpcy5fb25lVGltZUxpc3RlbmVycyB8fCB7fTtcbiAgICAgICAgX2FkZEV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIHRoaXMuX29uZVRpbWVMaXN0ZW5lcnMpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZpcmUoZXZlbnQ6IEV2ZW50LCBwcm9wZXJ0aWVzPzogT2JqZWN0KSB7XG4gICAgICAgIC8vIENvbXBhdGliaWxpdHkgd2l0aCAodHlwZTogc3RyaW5nLCBwcm9wZXJ0aWVzOiBPYmplY3QpIHNpZ25hdHVyZSBmcm9tIHByZXZpb3VzIHZlcnNpb25zLlxuICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL21hcGJveC9tYXBib3gtZ2wtanMvaXNzdWVzLzY1MjIsXG4gICAgICAgIC8vICAgICBodHRwczovL2dpdGh1Yi5jb20vbWFwYm94L21hcGJveC1nbC1kcmF3L2lzc3Vlcy83NjZcbiAgICAgICAgaWYgKHR5cGVvZiBldmVudCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGV2ZW50ID0gbmV3IEV2ZW50KGV2ZW50LCBwcm9wZXJ0aWVzIHx8IHt9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHR5cGUgPSBldmVudC50eXBlO1xuXG4gICAgICAgIGlmICh0aGlzLmxpc3RlbnModHlwZSkpIHtcbiAgICAgICAgICAgIChldmVudDogYW55KS50YXJnZXQgPSB0aGlzO1xuXG4gICAgICAgICAgICAvLyBtYWtlIHN1cmUgYWRkaW5nIG9yIHJlbW92aW5nIGxpc3RlbmVycyBpbnNpZGUgb3RoZXIgbGlzdGVuZXJzIHdvbid0IGNhdXNlIGFuIGluZmluaXRlIGxvb3BcbiAgICAgICAgICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycyAmJiB0aGlzLl9saXN0ZW5lcnNbdHlwZV0gPyB0aGlzLl9saXN0ZW5lcnNbdHlwZV0uc2xpY2UoKSA6IFtdO1xuICAgICAgICAgICAgZm9yIChjb25zdCBsaXN0ZW5lciBvZiBsaXN0ZW5lcnMpIHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lci5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3Qgb25lVGltZUxpc3RlbmVycyA9IHRoaXMuX29uZVRpbWVMaXN0ZW5lcnMgJiYgdGhpcy5fb25lVGltZUxpc3RlbmVyc1t0eXBlXSA/IHRoaXMuX29uZVRpbWVMaXN0ZW5lcnNbdHlwZV0uc2xpY2UoKSA6IFtdO1xuICAgICAgICAgICAgZm9yIChjb25zdCBsaXN0ZW5lciBvZiBvbmVUaW1lTGlzdGVuZXJzKSB7XG4gICAgICAgICAgICAgICAgX3JlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIHRoaXMuX29uZVRpbWVMaXN0ZW5lcnMpO1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyLmNhbGwodGhpcywgZXZlbnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBwYXJlbnQgPSB0aGlzLl9ldmVudGVkUGFyZW50O1xuICAgICAgICAgICAgaWYgKHBhcmVudCkge1xuICAgICAgICAgICAgICAgIGV4dGVuZChcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQsXG4gICAgICAgICAgICAgICAgICAgIHR5cGVvZiB0aGlzLl9ldmVudGVkUGFyZW50RGF0YSA9PT0gJ2Z1bmN0aW9uJyA/IHRoaXMuX2V2ZW50ZWRQYXJlbnREYXRhKCkgOiB0aGlzLl9ldmVudGVkUGFyZW50RGF0YVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgcGFyZW50LmZpcmUoZXZlbnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIC8vIFRvIGVuc3VyZSB0aGF0IG5vIGVycm9yIGV2ZW50cyBhcmUgZHJvcHBlZCwgcHJpbnQgdGhlbSB0byB0aGVcbiAgICAgICAgLy8gY29uc29sZSBpZiB0aGV5IGhhdmUgbm8gbGlzdGVuZXJzLlxuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50IGluc3RhbmNlb2YgRXJyb3JFdmVudCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihldmVudC5lcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgdHJ1ZSBpZiB0aGlzIGluc3RhbmNlIG9mIEV2ZW50ZWQgb3IgYW55IGZvcndhcmRlZWQgaW5zdGFuY2VzIG9mIEV2ZW50ZWQgaGF2ZSBhIGxpc3RlbmVyIGZvciB0aGUgc3BlY2lmaWVkIHR5cGUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBUaGUgZXZlbnQgdHlwZVxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBgdHJ1ZWAgaWYgdGhlcmUgaXMgYXQgbGVhc3Qgb25lIHJlZ2lzdGVyZWQgbGlzdGVuZXIgZm9yIHNwZWNpZmllZCBldmVudCB0eXBlLCBgZmFsc2VgIG90aGVyd2lzZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgbGlzdGVucyh0eXBlOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICh0aGlzLl9saXN0ZW5lcnMgJiYgdGhpcy5fbGlzdGVuZXJzW3R5cGVdICYmIHRoaXMuX2xpc3RlbmVyc1t0eXBlXS5sZW5ndGggPiAwKSB8fFxuICAgICAgICAgICAgKHRoaXMuX29uZVRpbWVMaXN0ZW5lcnMgJiYgdGhpcy5fb25lVGltZUxpc3RlbmVyc1t0eXBlXSAmJiB0aGlzLl9vbmVUaW1lTGlzdGVuZXJzW3R5cGVdLmxlbmd0aCA+IDApIHx8XG4gICAgICAgICAgICAodGhpcy5fZXZlbnRlZFBhcmVudCAmJiB0aGlzLl9ldmVudGVkUGFyZW50Lmxpc3RlbnModHlwZSkpXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQnViYmxlIGFsbCBldmVudHMgZmlyZWQgYnkgdGhpcyBpbnN0YW5jZSBvZiBFdmVudGVkIHRvIHRoaXMgcGFyZW50IGluc3RhbmNlIG9mIEV2ZW50ZWQuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IGB0aGlzYFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgc2V0RXZlbnRlZFBhcmVudChwYXJlbnQ6ID9FdmVudGVkLCBkYXRhPzogT2JqZWN0IHwgKCkgPT4gT2JqZWN0KSB7XG4gICAgICAgIHRoaXMuX2V2ZW50ZWRQYXJlbnQgPSBwYXJlbnQ7XG4gICAgICAgIHRoaXMuX2V2ZW50ZWRQYXJlbnREYXRhID0gZGF0YTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59XG4iLCJ2YXIgU3BoZXJpY2FsTWVyY2F0b3IgPSAoZnVuY3Rpb24oKXtcblxuLy8gQ2xvc3VyZXMgaW5jbHVkaW5nIGNvbnN0YW50cyBhbmQgb3RoZXIgcHJlY2FsY3VsYXRlZCB2YWx1ZXMuXG52YXIgY2FjaGUgPSB7fSxcbiAgICBFUFNMTiA9IDEuMGUtMTAsXG4gICAgRDJSID0gTWF0aC5QSSAvIDE4MCxcbiAgICBSMkQgPSAxODAgLyBNYXRoLlBJLFxuICAgIC8vIDkwMDkxMyBwcm9wZXJ0aWVzLlxuICAgIEEgPSA2Mzc4MTM3LjAsXG4gICAgTUFYRVhURU5UID0gMjAwMzc1MDguMzQyNzg5MjQ0O1xuXG5mdW5jdGlvbiBpc0Zsb2F0KG4pe1xuICAgIHJldHVybiBOdW1iZXIobikgPT09IG4gJiYgbiAlIDEgIT09IDA7XG59XG5cbi8vIFNwaGVyaWNhbE1lcmNhdG9yIGNvbnN0cnVjdG9yOiBwcmVjYWNoZXMgY2FsY3VsYXRpb25zXG4vLyBmb3IgZmFzdCB0aWxlIGxvb2t1cHMuXG5mdW5jdGlvbiBTcGhlcmljYWxNZXJjYXRvcihvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdGhpcy5zaXplID0gb3B0aW9ucy5zaXplIHx8IDI1NjtcbiAgICBpZiAoIWNhY2hlW3RoaXMuc2l6ZV0pIHtcbiAgICAgICAgdmFyIHNpemUgPSB0aGlzLnNpemU7XG4gICAgICAgIHZhciBjID0gY2FjaGVbdGhpcy5zaXplXSA9IHt9O1xuICAgICAgICBjLkJjID0gW107XG4gICAgICAgIGMuQ2MgPSBbXTtcbiAgICAgICAgYy56YyA9IFtdO1xuICAgICAgICBjLkFjID0gW107XG4gICAgICAgIGZvciAodmFyIGQgPSAwOyBkIDwgMzA7IGQrKykge1xuICAgICAgICAgICAgYy5CYy5wdXNoKHNpemUgLyAzNjApO1xuICAgICAgICAgICAgYy5DYy5wdXNoKHNpemUgLyAoMiAqIE1hdGguUEkpKTtcbiAgICAgICAgICAgIGMuemMucHVzaChzaXplIC8gMik7XG4gICAgICAgICAgICBjLkFjLnB1c2goc2l6ZSk7XG4gICAgICAgICAgICBzaXplICo9IDI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5CYyA9IGNhY2hlW3RoaXMuc2l6ZV0uQmM7XG4gICAgdGhpcy5DYyA9IGNhY2hlW3RoaXMuc2l6ZV0uQ2M7XG4gICAgdGhpcy56YyA9IGNhY2hlW3RoaXMuc2l6ZV0uemM7XG4gICAgdGhpcy5BYyA9IGNhY2hlW3RoaXMuc2l6ZV0uQWM7XG59O1xuXG4vLyBDb252ZXJ0IGxvbiBsYXQgdG8gc2NyZWVuIHBpeGVsIHZhbHVlXG4vL1xuLy8gLSBgbGxgIHtBcnJheX0gYFtsb24sIGxhdF1gIGFycmF5IG9mIGdlb2dyYXBoaWMgY29vcmRpbmF0ZXMuXG4vLyAtIGB6b29tYCB7TnVtYmVyfSB6b29tIGxldmVsLlxuU3BoZXJpY2FsTWVyY2F0b3IucHJvdG90eXBlLnB4ID0gZnVuY3Rpb24obGwsIHpvb20pIHtcbiAgaWYgKGlzRmxvYXQoem9vbSkpIHtcbiAgICB2YXIgc2l6ZSA9IHRoaXMuc2l6ZSAqIE1hdGgucG93KDIsIHpvb20pO1xuICAgIHZhciBkID0gc2l6ZSAvIDI7XG4gICAgdmFyIGJjID0gKHNpemUgLyAzNjApO1xuICAgIHZhciBjYyA9IChzaXplIC8gKDIgKiBNYXRoLlBJKSk7XG4gICAgdmFyIGFjID0gc2l6ZTtcbiAgICB2YXIgZiA9IE1hdGgubWluKE1hdGgubWF4KE1hdGguc2luKEQyUiAqIGxsWzFdKSwgLTAuOTk5OSksIDAuOTk5OSk7XG4gICAgdmFyIHggPSBkICsgbGxbMF0gKiBiYztcbiAgICB2YXIgeSA9IGQgKyAwLjUgKiBNYXRoLmxvZygoMSArIGYpIC8gKDEgLSBmKSkgKiAtY2M7XG4gICAgKHggPiBhYykgJiYgKHggPSBhYyk7XG4gICAgKHkgPiBhYykgJiYgKHkgPSBhYyk7XG4gICAgLy8oeCA8IDApICYmICh4ID0gMCk7XG4gICAgLy8oeSA8IDApICYmICh5ID0gMCk7XG4gICAgcmV0dXJuIFt4LCB5XTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgZCA9IHRoaXMuemNbem9vbV07XG4gICAgdmFyIGYgPSBNYXRoLm1pbihNYXRoLm1heChNYXRoLnNpbihEMlIgKiBsbFsxXSksIC0wLjk5OTkpLCAwLjk5OTkpO1xuICAgIHZhciB4ID0gTWF0aC5yb3VuZChkICsgbGxbMF0gKiB0aGlzLkJjW3pvb21dKTtcbiAgICB2YXIgeSA9IE1hdGgucm91bmQoZCArIDAuNSAqIE1hdGgubG9nKCgxICsgZikgLyAoMSAtIGYpKSAqICgtdGhpcy5DY1t6b29tXSkpO1xuICAgICh4ID4gdGhpcy5BY1t6b29tXSkgJiYgKHggPSB0aGlzLkFjW3pvb21dKTtcbiAgICAoeSA+IHRoaXMuQWNbem9vbV0pICYmICh5ID0gdGhpcy5BY1t6b29tXSk7XG4gICAgLy8oeCA8IDApICYmICh4ID0gMCk7XG4gICAgLy8oeSA8IDApICYmICh5ID0gMCk7XG4gICAgcmV0dXJuIFt4LCB5XTtcbiAgfVxufTtcblxuLy8gQ29udmVydCBzY3JlZW4gcGl4ZWwgdmFsdWUgdG8gbG9uIGxhdFxuLy9cbi8vIC0gYHB4YCB7QXJyYXl9IGBbeCwgeV1gIGFycmF5IG9mIGdlb2dyYXBoaWMgY29vcmRpbmF0ZXMuXG4vLyAtIGB6b29tYCB7TnVtYmVyfSB6b29tIGxldmVsLlxuU3BoZXJpY2FsTWVyY2F0b3IucHJvdG90eXBlLmxsID0gZnVuY3Rpb24ocHgsIHpvb20pIHtcbiAgaWYgKGlzRmxvYXQoem9vbSkpIHtcbiAgICB2YXIgc2l6ZSA9IHRoaXMuc2l6ZSAqIE1hdGgucG93KDIsIHpvb20pO1xuICAgIHZhciBiYyA9IChzaXplIC8gMzYwKTtcbiAgICB2YXIgY2MgPSAoc2l6ZSAvICgyICogTWF0aC5QSSkpO1xuICAgIHZhciB6YyA9IHNpemUgLyAyO1xuICAgIHZhciBnID0gKHB4WzFdIC0gemMpIC8gLWNjO1xuICAgIHZhciBsb24gPSAocHhbMF0gLSB6YykgLyBiYztcbiAgICB2YXIgbGF0ID0gUjJEICogKDIgKiBNYXRoLmF0YW4oTWF0aC5leHAoZykpIC0gMC41ICogTWF0aC5QSSk7XG4gICAgcmV0dXJuIFtsb24sIGxhdF07XG4gIH0gZWxzZSB7XG4gICAgdmFyIGcgPSAocHhbMV0gLSB0aGlzLnpjW3pvb21dKSAvICgtdGhpcy5DY1t6b29tXSk7XG4gICAgdmFyIGxvbiA9IChweFswXSAtIHRoaXMuemNbem9vbV0pIC8gdGhpcy5CY1t6b29tXTtcbiAgICB2YXIgbGF0ID0gUjJEICogKDIgKiBNYXRoLmF0YW4oTWF0aC5leHAoZykpIC0gMC41ICogTWF0aC5QSSk7XG4gICAgcmV0dXJuIFtsb24sIGxhdF07XG4gIH1cbn07XG5cbi8vIENvbnZlcnQgdGlsZSB4eXogdmFsdWUgdG8gYmJveCBvZiB0aGUgZm9ybSBgW3csIHMsIGUsIG5dYFxuLy9cbi8vIC0gYHhgIHtOdW1iZXJ9IHggKGxvbmdpdHVkZSkgbnVtYmVyLlxuLy8gLSBgeWAge051bWJlcn0geSAobGF0aXR1ZGUpIG51bWJlci5cbi8vIC0gYHpvb21gIHtOdW1iZXJ9IHpvb20uXG4vLyAtIGB0bXNfc3R5bGVgIHtCb29sZWFufSB3aGV0aGVyIHRvIGNvbXB1dGUgdXNpbmcgdG1zLXN0eWxlLlxuLy8gLSBgc3JzYCB7U3RyaW5nfSBwcm9qZWN0aW9uIGZvciByZXN1bHRpbmcgYmJveCAoV0dTODR8OTAwOTEzKS5cbi8vIC0gYHJldHVybmAge0FycmF5fSBiYm94IGFycmF5IG9mIHZhbHVlcyBpbiBmb3JtIGBbdywgcywgZSwgbl1gLlxuU3BoZXJpY2FsTWVyY2F0b3IucHJvdG90eXBlLmJib3ggPSBmdW5jdGlvbih4LCB5LCB6b29tLCB0bXNfc3R5bGUsIHNycykge1xuICAgIC8vIENvbnZlcnQgeHl6IGludG8gYmJveCB3aXRoIHNycyBXR1M4NFxuICAgIGlmICh0bXNfc3R5bGUpIHtcbiAgICAgICAgeSA9IChNYXRoLnBvdygyLCB6b29tKSAtIDEpIC0geTtcbiAgICB9XG4gICAgLy8gVXNlICt5IHRvIG1ha2Ugc3VyZSBpdCdzIGEgbnVtYmVyIHRvIGF2b2lkIGluYWR2ZXJ0ZW50IGNvbmNhdGVuYXRpb24uXG4gICAgdmFyIGxsID0gW3ggKiB0aGlzLnNpemUsICgreSArIDEpICogdGhpcy5zaXplXTsgLy8gbG93ZXIgbGVmdFxuICAgIC8vIFVzZSAreCB0byBtYWtlIHN1cmUgaXQncyBhIG51bWJlciB0byBhdm9pZCBpbmFkdmVydGVudCBjb25jYXRlbmF0aW9uLlxuICAgIHZhciB1ciA9IFsoK3ggKyAxKSAqIHRoaXMuc2l6ZSwgeSAqIHRoaXMuc2l6ZV07IC8vIHVwcGVyIHJpZ2h0XG4gICAgdmFyIGJib3ggPSB0aGlzLmxsKGxsLCB6b29tKS5jb25jYXQodGhpcy5sbCh1ciwgem9vbSkpO1xuXG4gICAgLy8gSWYgd2ViIG1lcmNhdG9yIHJlcXVlc3RlZCByZXByb2plY3QgdG8gOTAwOTEzLlxuICAgIGlmIChzcnMgPT09ICc5MDA5MTMnKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnZlcnQoYmJveCwgJzkwMDkxMycpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBiYm94O1xuICAgIH1cbn07XG5cbi8vIENvbnZlcnQgYmJveCB0byB4eXggYm91bmRzXG4vL1xuLy8gLSBgYmJveGAge051bWJlcn0gYmJveCBpbiB0aGUgZm9ybSBgW3csIHMsIGUsIG5dYC5cbi8vIC0gYHpvb21gIHtOdW1iZXJ9IHpvb20uXG4vLyAtIGB0bXNfc3R5bGVgIHtCb29sZWFufSB3aGV0aGVyIHRvIGNvbXB1dGUgdXNpbmcgdG1zLXN0eWxlLlxuLy8gLSBgc3JzYCB7U3RyaW5nfSBwcm9qZWN0aW9uIG9mIGlucHV0IGJib3ggKFdHUzg0fDkwMDkxMykuXG4vLyAtIGBAcmV0dXJuYCB7T2JqZWN0fSBYWVogYm91bmRzIGNvbnRhaW5pbmcgbWluWCwgbWF4WCwgbWluWSwgbWF4WSBwcm9wZXJ0aWVzLlxuU3BoZXJpY2FsTWVyY2F0b3IucHJvdG90eXBlLnh5eiA9IGZ1bmN0aW9uKGJib3gsIHpvb20sIHRtc19zdHlsZSwgc3JzKSB7XG4gICAgLy8gSWYgd2ViIG1lcmNhdG9yIHByb3ZpZGVkIHJlcHJvamVjdCB0byBXR1M4NC5cbiAgICBpZiAoc3JzID09PSAnOTAwOTEzJykge1xuICAgICAgICBiYm94ID0gdGhpcy5jb252ZXJ0KGJib3gsICdXR1M4NCcpO1xuICAgIH1cblxuICAgIHZhciBsbCA9IFtiYm94WzBdLCBiYm94WzFdXTsgLy8gbG93ZXIgbGVmdFxuICAgIHZhciB1ciA9IFtiYm94WzJdLCBiYm94WzNdXTsgLy8gdXBwZXIgcmlnaHRcbiAgICB2YXIgcHhfbGwgPSB0aGlzLnB4KGxsLCB6b29tKTtcbiAgICB2YXIgcHhfdXIgPSB0aGlzLnB4KHVyLCB6b29tKTtcbiAgICAvLyBZID0gMCBmb3IgWFlaIGlzIHRoZSB0b3AgaGVuY2UgbWluWSB1c2VzIHB4X3VyWzFdLlxuICAgIHZhciB4ID0gWyBNYXRoLmZsb29yKHB4X2xsWzBdIC8gdGhpcy5zaXplKSwgTWF0aC5mbG9vcigocHhfdXJbMF0gLSAxKSAvIHRoaXMuc2l6ZSkgXTtcbiAgICB2YXIgeSA9IFsgTWF0aC5mbG9vcihweF91clsxXSAvIHRoaXMuc2l6ZSksIE1hdGguZmxvb3IoKHB4X2xsWzFdIC0gMSkgLyB0aGlzLnNpemUpIF07XG4gICAgdmFyIGJvdW5kcyA9IHtcbiAgICAgICAgbWluWDogTWF0aC5taW4uYXBwbHkoTWF0aCwgeCkgPCAwID8gMCA6IE1hdGgubWluLmFwcGx5KE1hdGgsIHgpLFxuICAgICAgICBtaW5ZOiBNYXRoLm1pbi5hcHBseShNYXRoLCB5KSA8IDAgPyAwIDogTWF0aC5taW4uYXBwbHkoTWF0aCwgeSksXG4gICAgICAgIG1heFg6IE1hdGgubWF4LmFwcGx5KE1hdGgsIHgpLFxuICAgICAgICBtYXhZOiBNYXRoLm1heC5hcHBseShNYXRoLCB5KVxuICAgIH07XG4gICAgaWYgKHRtc19zdHlsZSkge1xuICAgICAgICB2YXIgdG1zID0ge1xuICAgICAgICAgICAgbWluWTogKE1hdGgucG93KDIsIHpvb20pIC0gMSkgLSBib3VuZHMubWF4WSxcbiAgICAgICAgICAgIG1heFk6IChNYXRoLnBvdygyLCB6b29tKSAtIDEpIC0gYm91bmRzLm1pbllcbiAgICAgICAgfTtcbiAgICAgICAgYm91bmRzLm1pblkgPSB0bXMubWluWTtcbiAgICAgICAgYm91bmRzLm1heFkgPSB0bXMubWF4WTtcbiAgICB9XG4gICAgcmV0dXJuIGJvdW5kcztcbn07XG5cbi8vIENvbnZlcnQgcHJvamVjdGlvbiBvZiBnaXZlbiBiYm94LlxuLy9cbi8vIC0gYGJib3hgIHtOdW1iZXJ9IGJib3ggaW4gdGhlIGZvcm0gYFt3LCBzLCBlLCBuXWAuXG4vLyAtIGB0b2Age1N0cmluZ30gcHJvamVjdGlvbiBvZiBvdXRwdXQgYmJveCAoV0dTODR8OTAwOTEzKS4gSW5wdXQgYmJveFxuLy8gICBhc3N1bWVkIHRvIGJlIHRoZSBcIm90aGVyXCIgcHJvamVjdGlvbi5cbi8vIC0gYEByZXR1cm5gIHtPYmplY3R9IGJib3ggd2l0aCByZXByb2plY3RlZCBjb29yZGluYXRlcy5cblNwaGVyaWNhbE1lcmNhdG9yLnByb3RvdHlwZS5jb252ZXJ0ID0gZnVuY3Rpb24oYmJveCwgdG8pIHtcbiAgICBpZiAodG8gPT09ICc5MDA5MTMnKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZvcndhcmQoYmJveC5zbGljZSgwLCAyKSkuY29uY2F0KHRoaXMuZm9yd2FyZChiYm94LnNsaWNlKDIsNCkpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnZlcnNlKGJib3guc2xpY2UoMCwgMikpLmNvbmNhdCh0aGlzLmludmVyc2UoYmJveC5zbGljZSgyLDQpKSk7XG4gICAgfVxufTtcblxuLy8gQ29udmVydCBsb24vbGF0IHZhbHVlcyB0byA5MDA5MTMgeC95LlxuU3BoZXJpY2FsTWVyY2F0b3IucHJvdG90eXBlLmZvcndhcmQgPSBmdW5jdGlvbihsbCkge1xuICAgIHZhciB4eSA9IFtcbiAgICAgICAgQSAqIGxsWzBdICogRDJSLFxuICAgICAgICBBICogTWF0aC5sb2coTWF0aC50YW4oKE1hdGguUEkqMC4yNSkgKyAoMC41ICogbGxbMV0gKiBEMlIpKSlcbiAgICBdO1xuICAgIC8vIGlmIHh5IHZhbHVlIGlzIGJleW9uZCBtYXhleHRlbnQgKGUuZy4gcG9sZXMpLCByZXR1cm4gbWF4ZXh0ZW50LlxuICAgICh4eVswXSA+IE1BWEVYVEVOVCkgJiYgKHh5WzBdID0gTUFYRVhURU5UKTtcbiAgICAoeHlbMF0gPCAtTUFYRVhURU5UKSAmJiAoeHlbMF0gPSAtTUFYRVhURU5UKTtcbiAgICAoeHlbMV0gPiBNQVhFWFRFTlQpICYmICh4eVsxXSA9IE1BWEVYVEVOVCk7XG4gICAgKHh5WzFdIDwgLU1BWEVYVEVOVCkgJiYgKHh5WzFdID0gLU1BWEVYVEVOVCk7XG4gICAgcmV0dXJuIHh5O1xufTtcblxuLy8gQ29udmVydCA5MDA5MTMgeC95IHZhbHVlcyB0byBsb24vbGF0LlxuU3BoZXJpY2FsTWVyY2F0b3IucHJvdG90eXBlLmludmVyc2UgPSBmdW5jdGlvbih4eSkge1xuICAgIHJldHVybiBbXG4gICAgICAgICh4eVswXSAqIFIyRCAvIEEpLFxuICAgICAgICAoKE1hdGguUEkqMC41KSAtIDIuMCAqIE1hdGguYXRhbihNYXRoLmV4cCgteHlbMV0gLyBBKSkpICogUjJEXG4gICAgXTtcbn07XG5cbnJldHVybiBTcGhlcmljYWxNZXJjYXRvcjtcblxufSkoKTtcblxuaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IFNwaGVyaWNhbE1lcmNhdG9yO1xufVxuIiwiaW1wb3J0IHsgcGljayB9IGZyb20gJ21hcGJveC1nbC9zcmMvdXRpbC91dGlsJztcbmltcG9ydCB7IGdldEpTT04gfSBmcm9tICdtYXBib3gtZ2wvc3JjL3V0aWwvYWpheCc7XG5pbXBvcnQgYnJvd3NlciBmcm9tICdtYXBib3gtZ2wvc3JjL3V0aWwvYnJvd3Nlcic7XG5pbXBvcnQgU3BoZXJpY2FsTWVyY2F0b3IgZnJvbSAnQG1hcGJveC9zcGhlcmljYWxtZXJjYXRvcic7XG5cbi8vQ29udGFpbnMgY29kZSBmcm9tIGVzcmktbGVhZmxldCBodHRwczovL2dpdGh1Yi5jb20vRXNyaS9lc3JpLWxlYWZsZXRcbmNvbnN0IE1lcmNhdG9yWm9vbUxldmVscyA9IHtcbiAgICAnMCc6IDE1NjU0My4wMzM5Mjc5OTk5OSxcbiAgICAnMSc6IDc4MjcxLjUxNjk2Mzk5OTg5MyxcbiAgICAnMic6IDM5MTM1Ljc1ODQ4MjAwMDA5OSxcbiAgICAnMyc6IDE5NTY3Ljg3OTI0MDk5OTkwMSxcbiAgICAnNCc6IDk3ODMuOTM5NjIwNDk5OTU5MyxcbiAgICAnNSc6IDQ4OTEuOTY5ODEwMjQ5OTc5NyxcbiAgICAnNic6IDI0NDUuOTg0OTA1MTI0OTg5OCxcbiAgICAnNyc6IDEyMjIuOTkyNDUyNTYyNDg5OSxcbiAgICAnOCc6IDYxMS40OTYyMjYyODEzODAwMixcbiAgICAnOSc6IDMwNS43NDgxMTMxNDA1NTgwMixcbiAgICAnMTAnOiAxNTIuODc0MDU2NTcwNDExLFxuICAgICcxMSc6IDc2LjQzNzAyODI4NTA3MzE5NyxcbiAgICAnMTInOiAzOC4yMTg1MTQxNDI1MzY1OTgsXG4gICAgJzEzJzogMTkuMTA5MjU3MDcxMjY4Mjk5LFxuICAgICcxNCc6IDkuNTU0NjI4NTM1NjM0MTQ5NixcbiAgICAnMTUnOiA0Ljc3NzMxNDI2Nzk0OTM2OTksXG4gICAgJzE2JzogMi4zODg2NTcxMzM5NzQ2OCxcbiAgICAnMTcnOiAxLjE5NDMyODU2Njg1NTA1MDEsXG4gICAgJzE4JzogMC41OTcxNjQyODM1NTk4MTY5OSxcbiAgICAnMTknOiAwLjI5ODU4MjE0MTY0NzYxNjk4LFxuICAgICcyMCc6IDAuMTQ5MjkxMDcwODIzODEsXG4gICAgJzIxJzogMC4wNzQ2NDU1MzU0MTE5MSxcbiAgICAnMjInOiAwLjAzNzMyMjc2NzcwNTk1MjUsXG4gICAgJzIzJzogMC4wMTg2NjEzODM4NTI5NzYzXG59O1xuXG5jb25zdCBfd2l0aGluUGVyY2VudGFnZSA9IGZ1bmN0aW9uIChhLCBiLCBwZXJjZW50YWdlKSB7XG4gICAgY29uc3QgZGlmZiA9IE1hdGguYWJzKChhIC8gYikgLSAxKTtcbiAgICByZXR1cm4gZGlmZiA8IHBlcmNlbnRhZ2U7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihvcHRpb25zLCBjYWxsYmFjaykge1xuICAgIGNvbnN0IGxvYWRlZCA9IGZ1bmN0aW9uKGVyciwgbWV0YWRhdGEpIHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByZXN1bHQgPSBwaWNrKG1ldGFkYXRhLFxuICAgICAgICAgICAgWyd0aWxlSW5mbycsICdpbml0aWFsRXh0ZW50JywgJ2Z1bGxFeHRlbnQnLCAnc3BhdGlhbFJlZmVyZW5jZScsICd0aWxlU2VydmVycycsICdkb2N1bWVudEluZm8nXSk7XG5cbiAgICAgICAgcmVzdWx0Ll9sb2RNYXAgPSB7fTtcbiAgICAgICAgY29uc3Qgem9vbU9mZnNldEFsbG93YW5jZSA9IDAuMTtcbiAgICAgICAgY29uc3Qgc3IgPSBtZXRhZGF0YS5zcGF0aWFsUmVmZXJlbmNlLmxhdGVzdFdraWQgfHwgbWV0YWRhdGEuc3BhdGlhbFJlZmVyZW5jZS53a2lkO1xuICAgICAgICBpZiAoc3IgPT09IDEwMjEwMCB8fCBzciA9PT0gMzg1Nykge1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgRXhhbXBsZSBleHRlbnQgZnJvbSBBcmNHSVMgUkVTVCBBUElcbiAgICAgICAgICAgIGZ1bGxFeHRlbnQ6IHtcbiAgICAgICAgICAgIHhtaW46IC05MTQ0NzkxLjY3OTIyNjEyNyxcbiAgICAgICAgICAgIHltaW46IC0yMTk1MTkwLjk2MTQzNzcyNixcbiAgICAgICAgICAgIHhtYXg6IC00NjUwOTg3LjA3MjAxOTk4MyxcbiAgICAgICAgICAgIHltYXg6IDExMTgxMTMuMTEwMTU1NzY2LFxuICAgICAgICAgICAgc3BhdGlhbFJlZmVyZW5jZToge1xuICAgICAgICAgICAgd2tpZDogMTAyMTAwLFxuICAgICAgICAgICAgd2t0OiBudWxsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIC8vY29udmVydCBBcmNHSVMgZXh0ZW50IHRvIGJvdW5kc1xuICAgICAgICAgICAgY29uc3QgZXh0ZW50ID0gbWV0YWRhdGEuZnVsbEV4dGVudDtcbiAgICAgICAgICAgIGlmIChleHRlbnQgJiYgZXh0ZW50LnNwYXRpYWxSZWZlcmVuY2UgJiYgZXh0ZW50LnNwYXRpYWxSZWZlcmVuY2Uud2tpZCA9PT0gIDEwMjEwMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJvdW5kc1dlYk1lcmNhdG9yID0gW2V4dGVudC54bWluLCBleHRlbnQueW1pbiwgZXh0ZW50LnhtYXgsIGV4dGVudC55bWF4XTtcbiAgICAgICAgICAgICAgICB2YXIgbWVyYyA9IG5ldyBTcGhlcmljYWxNZXJjYXRvcih7XG4gICAgICAgICAgICAgICAgICAgIHNpemU6IDI1NlxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNvbnN0IGJvdW5kc1dHUzg0ID0gbWVyYy5jb252ZXJ0KGJvdW5kc1dlYk1lcmNhdG9yKTtcbiAgICAgICAgICAgICAgICByZXN1bHQuYm91bmRzID0gYm91bmRzV0dTODQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGNyZWF0ZSB0aGUgem9vbSBsZXZlbCBkYXRhXG4gICAgICAgICAgICBjb25zdCBhcmNnaXNMT0RzID0gbWV0YWRhdGEudGlsZUluZm8ubG9kcztcbiAgICAgICAgICAgIGNvbnN0IGNvcnJlY3RSZXNvbHV0aW9ucyA9IE1lcmNhdG9yWm9vbUxldmVscztcbiAgICAgICAgICAgIHJlc3VsdC5taW56b29tID0gYXJjZ2lzTE9Ec1swXS5sZXZlbDtcbiAgICAgICAgICAgIHJlc3VsdC5tYXh6b29tID0gYXJjZ2lzTE9Ec1thcmNnaXNMT0RzLmxlbmd0aCAtIDFdLmxldmVsO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcmNnaXNMT0RzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYXJjZ2lzTE9EID0gYXJjZ2lzTE9Ec1tpXTtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGNpIGluIGNvcnJlY3RSZXNvbHV0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb3JyZWN0UmVzID0gY29ycmVjdFJlc29sdXRpb25zW2NpXTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoX3dpdGhpblBlcmNlbnRhZ2UoYXJjZ2lzTE9ELnJlc29sdXRpb24sIGNvcnJlY3RSZXMsIHpvb21PZmZzZXRBbGxvd2FuY2UpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuX2xvZE1hcFtjaV0gPSBhcmNnaXNMT0QubGV2ZWw7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKG5ldyBFcnJvcignbm9uLW1lcmNhdG9yIHNwYXRpYWwgcmVmZXJlbmNlJykpO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzdWx0KTtcbiAgICB9O1xuXG4gICAgaWYgKG9wdGlvbnMudXJsKSB7XG4gICAgICAgIGdldEpTT04oe3VybDogb3B0aW9ucy51cmx9LCBsb2FkZWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGJyb3dzZXIuZnJhbWUobG9hZGVkLmJpbmQobnVsbCwgbnVsbCwgb3B0aW9ucykpO1xuICAgIH1cbn07XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQge3dyYXB9IGZyb20gJy4uL3V0aWwvdXRpbCc7XG5pbXBvcnQgTG5nTGF0Qm91bmRzIGZyb20gJy4vbG5nX2xhdF9ib3VuZHMnO1xuXG4vKipcbiAqIEEgYExuZ0xhdGAgb2JqZWN0IHJlcHJlc2VudHMgYSBnaXZlbiBsb25naXR1ZGUgYW5kIGxhdGl0dWRlIGNvb3JkaW5hdGUsIG1lYXN1cmVkIGluIGRlZ3JlZXMuXG4gKlxuICogTWFwYm94IEdMIHVzZXMgbG9uZ2l0dWRlLCBsYXRpdHVkZSBjb29yZGluYXRlIG9yZGVyIChhcyBvcHBvc2VkIHRvIGxhdGl0dWRlLCBsb25naXR1ZGUpIHRvIG1hdGNoIEdlb0pTT04uXG4gKlxuICogTm90ZSB0aGF0IGFueSBNYXBib3ggR0wgbWV0aG9kIHRoYXQgYWNjZXB0cyBhIGBMbmdMYXRgIG9iamVjdCBhcyBhbiBhcmd1bWVudCBvciBvcHRpb25cbiAqIGNhbiBhbHNvIGFjY2VwdCBhbiBgQXJyYXlgIG9mIHR3byBudW1iZXJzIGFuZCB3aWxsIHBlcmZvcm0gYW4gaW1wbGljaXQgY29udmVyc2lvbi5cbiAqIFRoaXMgZmxleGlibGUgdHlwZSBpcyBkb2N1bWVudGVkIGFzIHtAbGluayBMbmdMYXRMaWtlfS5cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gbG5nIExvbmdpdHVkZSwgbWVhc3VyZWQgaW4gZGVncmVlcy5cbiAqIEBwYXJhbSB7bnVtYmVyfSBsYXQgTGF0aXR1ZGUsIG1lYXN1cmVkIGluIGRlZ3JlZXMuXG4gKiBAZXhhbXBsZVxuICogdmFyIGxsID0gbmV3IG1hcGJveGdsLkxuZ0xhdCgtNzMuOTc0OSwgNDAuNzczNik7XG4gKiBAc2VlIFtHZXQgY29vcmRpbmF0ZXMgb2YgdGhlIG1vdXNlIHBvaW50ZXJdKGh0dHBzOi8vd3d3Lm1hcGJveC5jb20vbWFwYm94LWdsLWpzL2V4YW1wbGUvbW91c2UtcG9zaXRpb24vKVxuICogQHNlZSBbRGlzcGxheSBhIHBvcHVwXShodHRwczovL3d3dy5tYXBib3guY29tL21hcGJveC1nbC1qcy9leGFtcGxlL3BvcHVwLylcbiAqIEBzZWUgW0hpZ2hsaWdodCBmZWF0dXJlcyB3aXRoaW4gYSBib3VuZGluZyBib3hdKGh0dHBzOi8vd3d3Lm1hcGJveC5jb20vbWFwYm94LWdsLWpzL2V4YW1wbGUvdXNpbmctYm94LXF1ZXJ5cmVuZGVyZWRmZWF0dXJlcy8pXG4gKiBAc2VlIFtDcmVhdGUgYSB0aW1lbGluZSBhbmltYXRpb25dKGh0dHBzOi8vd3d3Lm1hcGJveC5jb20vbWFwYm94LWdsLWpzL2V4YW1wbGUvdGltZWxpbmUtYW5pbWF0aW9uLylcbiAqL1xuY2xhc3MgTG5nTGF0IHtcbiAgICBsbmc6IG51bWJlcjtcbiAgICBsYXQ6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKGxuZzogbnVtYmVyLCBsYXQ6IG51bWJlcikge1xuICAgICAgICBpZiAoaXNOYU4obG5nKSB8fCBpc05hTihsYXQpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgTG5nTGF0IG9iamVjdDogKCR7bG5nfSwgJHtsYXR9KWApO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubG5nID0gK2xuZztcbiAgICAgICAgdGhpcy5sYXQgPSArbGF0O1xuICAgICAgICBpZiAodGhpcy5sYXQgPiA5MCB8fCB0aGlzLmxhdCA8IC05MCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIExuZ0xhdCBsYXRpdHVkZSB2YWx1ZTogbXVzdCBiZSBiZXR3ZWVuIC05MCBhbmQgOTAnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBuZXcgYExuZ0xhdGAgb2JqZWN0IHdob3NlIGxvbmdpdHVkZSBpcyB3cmFwcGVkIHRvIHRoZSByYW5nZSAoLTE4MCwgMTgwKS5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtMbmdMYXR9IFRoZSB3cmFwcGVkIGBMbmdMYXRgIG9iamVjdC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHZhciBsbCA9IG5ldyBtYXBib3hnbC5MbmdMYXQoMjg2LjAyNTEsIDQwLjc3MzYpO1xuICAgICAqIHZhciB3cmFwcGVkID0gbGwud3JhcCgpO1xuICAgICAqIHdyYXBwZWQubG5nOyAvLyA9IC03My45NzQ5XG4gICAgICovXG4gICAgd3JhcCgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBMbmdMYXQod3JhcCh0aGlzLmxuZywgLTE4MCwgMTgwKSwgdGhpcy5sYXQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGNvb3JkaW5hdGVzIHJlcHJlc2VudGVkIGFzIGFuIGFycmF5IG9mIHR3byBudW1iZXJzLlxuICAgICAqXG4gICAgICogQHJldHVybnMge0FycmF5PG51bWJlcj59IFRoZSBjb29yZGluYXRlcyByZXByZXNldGVkIGFzIGFuIGFycmF5IG9mIGxvbmdpdHVkZSBhbmQgbGF0aXR1ZGUuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB2YXIgbGwgPSBuZXcgbWFwYm94Z2wuTG5nTGF0KC03My45NzQ5LCA0MC43NzM2KTtcbiAgICAgKiBsbC50b0FycmF5KCk7IC8vID0gWy03My45NzQ5LCA0MC43NzM2XVxuICAgICAqL1xuICAgIHRvQXJyYXkoKSB7XG4gICAgICAgIHJldHVybiBbdGhpcy5sbmcsIHRoaXMubGF0XTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBjb29yZGluYXRlcyByZXByZXNlbnQgYXMgYSBzdHJpbmcuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgY29vcmRpbmF0ZXMgcmVwcmVzZW50ZWQgYXMgYSBzdHJpbmcgb2YgdGhlIGZvcm1hdCBgJ0xuZ0xhdChsbmcsIGxhdCknYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHZhciBsbCA9IG5ldyBtYXBib3hnbC5MbmdMYXQoLTczLjk3NDksIDQwLjc3MzYpO1xuICAgICAqIGxsLnRvU3RyaW5nKCk7IC8vID0gXCJMbmdMYXQoLTczLjk3NDksIDQwLjc3MzYpXCJcbiAgICAgKi9cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIGBMbmdMYXQoJHt0aGlzLmxuZ30sICR7dGhpcy5sYXR9KWA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIGBMbmdMYXRCb3VuZHNgIGZyb20gdGhlIGNvb3JkaW5hdGVzIGV4dGVuZGVkIGJ5IGEgZ2l2ZW4gYHJhZGl1c2AuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3JhZGl1cz0wXSBEaXN0YW5jZSBpbiBtZXRlcnMgZnJvbSB0aGUgY29vcmRpbmF0ZXMgdG8gZXh0ZW5kIHRoZSBib3VuZHMuXG4gICAgICogQHJldHVybnMge0xuZ0xhdEJvdW5kc30gQSBuZXcgYExuZ0xhdEJvdW5kc2Agb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgY29vcmRpbmF0ZXMgZXh0ZW5kZWQgYnkgdGhlIGByYWRpdXNgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICogdmFyIGxsID0gbmV3IG1hcGJveGdsLkxuZ0xhdCgtNzMuOTc0OSwgNDAuNzczNik7XG4gICAgICogbGwudG9Cb3VuZHMoMTAwKS50b0FycmF5KCk7IC8vID0gW1stNzMuOTc1MDE4NjIxNDEzMjgsIDQwLjc3MzUxMDE2ODQ3MjI5XSwgWy03My45NzQ3ODEzNzg1ODY3MywgNDAuNzczNjg5ODMxNTI3NzFdXVxuICAgICAqL1xuICAgIHRvQm91bmRzKHJhZGl1cz86IG51bWJlciA9IDApIHtcbiAgICAgICAgY29uc3QgZWFydGhDaXJjdW1mZXJlbmNlSW5NZXRlcnNBdEVxdWF0b3IgPSA0MDA3NTAxNztcbiAgICAgICAgY29uc3QgbGF0QWNjdXJhY3kgPSAzNjAgKiByYWRpdXMgLyBlYXJ0aENpcmN1bWZlcmVuY2VJbk1ldGVyc0F0RXF1YXRvcixcbiAgICAgICAgICAgIGxuZ0FjY3VyYWN5ID0gbGF0QWNjdXJhY3kgLyBNYXRoLmNvcygoTWF0aC5QSSAvIDE4MCkgKiB0aGlzLmxhdCk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBMbmdMYXRCb3VuZHMobmV3IExuZ0xhdCh0aGlzLmxuZyAtIGxuZ0FjY3VyYWN5LCB0aGlzLmxhdCAtIGxhdEFjY3VyYWN5KSxcbiAgICAgICAgICAgIG5ldyBMbmdMYXQodGhpcy5sbmcgKyBsbmdBY2N1cmFjeSwgdGhpcy5sYXQgKyBsYXRBY2N1cmFjeSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIGFuIGFycmF5IG9mIHR3byBudW1iZXJzIG9yIGFuIG9iamVjdCB3aXRoIGBsbmdgIGFuZCBgbGF0YCBvciBgbG9uYCBhbmQgYGxhdGAgcHJvcGVydGllc1xuICAgICAqIHRvIGEgYExuZ0xhdGAgb2JqZWN0LlxuICAgICAqXG4gICAgICogSWYgYSBgTG5nTGF0YCBvYmplY3QgaXMgcGFzc2VkIGluLCB0aGUgZnVuY3Rpb24gcmV0dXJucyBpdCB1bmNoYW5nZWQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0xuZ0xhdExpa2V9IGlucHV0IEFuIGFycmF5IG9mIHR3byBudW1iZXJzIG9yIG9iamVjdCB0byBjb252ZXJ0LCBvciBhIGBMbmdMYXRgIG9iamVjdCB0byByZXR1cm4uXG4gICAgICogQHJldHVybnMge0xuZ0xhdH0gQSBuZXcgYExuZ0xhdGAgb2JqZWN0LCBpZiBhIGNvbnZlcnNpb24gb2NjdXJyZWQsIG9yIHRoZSBvcmlnaW5hbCBgTG5nTGF0YCBvYmplY3QuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB2YXIgYXJyID0gWy03My45NzQ5LCA0MC43NzM2XTtcbiAgICAgKiB2YXIgbGwgPSBtYXBib3hnbC5MbmdMYXQuY29udmVydChhcnIpO1xuICAgICAqIGxsOyAgIC8vID0gTG5nTGF0IHtsbmc6IC03My45NzQ5LCBsYXQ6IDQwLjc3MzZ9XG4gICAgICovXG4gICAgc3RhdGljIGNvbnZlcnQoaW5wdXQ6IExuZ0xhdExpa2UpOiBMbmdMYXQge1xuICAgICAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBMbmdMYXQpIHtcbiAgICAgICAgICAgIHJldHVybiBpbnB1dDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShpbnB1dCkgJiYgKGlucHV0Lmxlbmd0aCA9PT0gMiB8fCBpbnB1dC5sZW5ndGggPT09IDMpKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IExuZ0xhdChOdW1iZXIoaW5wdXRbMF0pLCBOdW1iZXIoaW5wdXRbMV0pKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoaW5wdXQpICYmIHR5cGVvZiBpbnB1dCA9PT0gJ29iamVjdCcgJiYgaW5wdXQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgTG5nTGF0KFxuICAgICAgICAgICAgICAgIC8vIGZsb3cgY2FuJ3QgcmVmaW5lIHRoaXMgdG8gaGF2ZSBvbmUgb2YgbG5nIG9yIGxhdCwgc28gd2UgaGF2ZSB0byBjYXN0IHRvIGFueVxuICAgICAgICAgICAgICAgIE51bWJlcignbG5nJyBpbiBpbnB1dCA/IChpbnB1dDogYW55KS5sbmcgOiAoaW5wdXQ6IGFueSkubG9uKSxcbiAgICAgICAgICAgICAgICBOdW1iZXIoaW5wdXQubGF0KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJgTG5nTGF0TGlrZWAgYXJndW1lbnQgbXVzdCBiZSBzcGVjaWZpZWQgYXMgYSBMbmdMYXQgaW5zdGFuY2UsIGFuIG9iamVjdCB7bG5nOiA8bG5nPiwgbGF0OiA8bGF0Pn0sIGFuIG9iamVjdCB7bG9uOiA8bG5nPiwgbGF0OiA8bGF0Pn0sIG9yIGFuIGFycmF5IG9mIFs8bG5nPiwgPGxhdD5dXCIpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBBIHtAbGluayBMbmdMYXR9IG9iamVjdCwgYW4gYXJyYXkgb2YgdHdvIG51bWJlcnMgcmVwcmVzZW50aW5nIGxvbmdpdHVkZSBhbmQgbGF0aXR1ZGUsXG4gKiBvciBhbiBvYmplY3Qgd2l0aCBgbG5nYCBhbmQgYGxhdGAgb3IgYGxvbmAgYW5kIGBsYXRgIHByb3BlcnRpZXMuXG4gKlxuICogQHR5cGVkZWYge0xuZ0xhdCB8IHtsbmc6IG51bWJlciwgbGF0OiBudW1iZXJ9IHwge2xvbjogbnVtYmVyLCBsYXQ6IG51bWJlcn0gfCBbbnVtYmVyLCBudW1iZXJdfSBMbmdMYXRMaWtlXG4gKiBAZXhhbXBsZVxuICogdmFyIHYxID0gbmV3IG1hcGJveGdsLkxuZ0xhdCgtMTIyLjQyMDY3OSwgMzcuNzcyNTM3KTtcbiAqIHZhciB2MiA9IFstMTIyLjQyMDY3OSwgMzcuNzcyNTM3XTtcbiAqIHZhciB2MyA9IHtsb246IC0xMjIuNDIwNjc5LCBsYXQ6IDM3Ljc3MjUzN307XG4gKi9cbmV4cG9ydCB0eXBlIExuZ0xhdExpa2UgPSBMbmdMYXQgfCB7bG5nOiBudW1iZXIsIGxhdDogbnVtYmVyfSB8IHtsb246IG51bWJlciwgbGF0OiBudW1iZXJ9IHwgW251bWJlciwgbnVtYmVyXTtcblxuZXhwb3J0IGRlZmF1bHQgTG5nTGF0O1xuIiwiLy8gQGZsb3dcblxuaW1wb3J0IExuZ0xhdCBmcm9tICcuL2xuZ19sYXQnO1xuXG5pbXBvcnQgdHlwZSB7TG5nTGF0TGlrZX0gZnJvbSAnLi9sbmdfbGF0JztcblxuLyoqXG4gKiBBIGBMbmdMYXRCb3VuZHNgIG9iamVjdCByZXByZXNlbnRzIGEgZ2VvZ3JhcGhpY2FsIGJvdW5kaW5nIGJveCxcbiAqIGRlZmluZWQgYnkgaXRzIHNvdXRod2VzdCBhbmQgbm9ydGhlYXN0IHBvaW50cyBpbiBsb25naXR1ZGUgYW5kIGxhdGl0dWRlLlxuICpcbiAqIElmIG5vIGFyZ3VtZW50cyBhcmUgcHJvdmlkZWQgdG8gdGhlIGNvbnN0cnVjdG9yLCBhIGBudWxsYCBib3VuZGluZyBib3ggaXMgY3JlYXRlZC5cbiAqXG4gKiBOb3RlIHRoYXQgYW55IE1hcGJveCBHTCBtZXRob2QgdGhhdCBhY2NlcHRzIGEgYExuZ0xhdEJvdW5kc2Agb2JqZWN0IGFzIGFuIGFyZ3VtZW50IG9yIG9wdGlvblxuICogY2FuIGFsc28gYWNjZXB0IGFuIGBBcnJheWAgb2YgdHdvIHtAbGluayBMbmdMYXRMaWtlfSBjb25zdHJ1Y3RzIGFuZCB3aWxsIHBlcmZvcm0gYW4gaW1wbGljaXQgY29udmVyc2lvbi5cbiAqIFRoaXMgZmxleGlibGUgdHlwZSBpcyBkb2N1bWVudGVkIGFzIHtAbGluayBMbmdMYXRCb3VuZHNMaWtlfS5cbiAqXG4gKiBAcGFyYW0ge0xuZ0xhdExpa2V9IFtzd10gVGhlIHNvdXRod2VzdCBjb3JuZXIgb2YgdGhlIGJvdW5kaW5nIGJveC5cbiAqIEBwYXJhbSB7TG5nTGF0TGlrZX0gW25lXSBUaGUgbm9ydGhlYXN0IGNvcm5lciBvZiB0aGUgYm91bmRpbmcgYm94LlxuICogQGV4YW1wbGVcbiAqIHZhciBzdyA9IG5ldyBtYXBib3hnbC5MbmdMYXQoLTczLjk4NzYsIDQwLjc2NjEpO1xuICogdmFyIG5lID0gbmV3IG1hcGJveGdsLkxuZ0xhdCgtNzMuOTM5NywgNDAuODAwMik7XG4gKiB2YXIgbGxiID0gbmV3IG1hcGJveGdsLkxuZ0xhdEJvdW5kcyhzdywgbmUpO1xuICovXG5jbGFzcyBMbmdMYXRCb3VuZHMge1xuICAgIF9uZTogTG5nTGF0O1xuICAgIF9zdzogTG5nTGF0O1xuXG4gICAgLy8gVGhpcyBjb25zdHJ1Y3RvciBpcyB0b28gZmxleGlibGUgdG8gdHlwZS4gSXQgc2hvdWxkIG5vdCBiZSBzbyBmbGV4aWJsZS5cbiAgICBjb25zdHJ1Y3RvcihzdzogYW55LCBuZTogYW55KSB7XG4gICAgICAgIGlmICghc3cpIHtcbiAgICAgICAgICAgIC8vIG5vb3BcbiAgICAgICAgfSBlbHNlIGlmIChuZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTb3V0aFdlc3Qoc3cpLnNldE5vcnRoRWFzdChuZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoc3cubGVuZ3RoID09PSA0KSB7XG4gICAgICAgICAgICB0aGlzLnNldFNvdXRoV2VzdChbc3dbMF0sIHN3WzFdXSkuc2V0Tm9ydGhFYXN0KFtzd1syXSwgc3dbM11dKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U291dGhXZXN0KHN3WzBdKS5zZXROb3J0aEVhc3Qoc3dbMV0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IHRoZSBub3J0aGVhc3QgY29ybmVyIG9mIHRoZSBib3VuZGluZyBib3hcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7TG5nTGF0TGlrZX0gbmVcbiAgICAgKiBAcmV0dXJucyB7TG5nTGF0Qm91bmRzfSBgdGhpc2BcbiAgICAgKi9cbiAgICBzZXROb3J0aEVhc3QobmU6IExuZ0xhdExpa2UpIHtcbiAgICAgICAgdGhpcy5fbmUgPSBuZSBpbnN0YW5jZW9mIExuZ0xhdCA/IG5ldyBMbmdMYXQobmUubG5nLCBuZS5sYXQpIDogTG5nTGF0LmNvbnZlcnQobmUpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIHNvdXRod2VzdCBjb3JuZXIgb2YgdGhlIGJvdW5kaW5nIGJveFxuICAgICAqXG4gICAgICogQHBhcmFtIHtMbmdMYXRMaWtlfSBzd1xuICAgICAqIEByZXR1cm5zIHtMbmdMYXRCb3VuZHN9IGB0aGlzYFxuICAgICAqL1xuICAgIHNldFNvdXRoV2VzdChzdzogTG5nTGF0TGlrZSkge1xuICAgICAgICB0aGlzLl9zdyA9IHN3IGluc3RhbmNlb2YgTG5nTGF0ID8gbmV3IExuZ0xhdChzdy5sbmcsIHN3LmxhdCkgOiBMbmdMYXQuY29udmVydChzdyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEV4dGVuZCB0aGUgYm91bmRzIHRvIGluY2x1ZGUgYSBnaXZlbiBMbmdMYXQgb3IgTG5nTGF0Qm91bmRzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtMbmdMYXR8TG5nTGF0Qm91bmRzfSBvYmogb2JqZWN0IHRvIGV4dGVuZCB0b1xuICAgICAqIEByZXR1cm5zIHtMbmdMYXRCb3VuZHN9IGB0aGlzYFxuICAgICAqL1xuICAgIGV4dGVuZChvYmo6IExuZ0xhdCB8IExuZ0xhdEJvdW5kcykge1xuICAgICAgICBjb25zdCBzdyA9IHRoaXMuX3N3LFxuICAgICAgICAgICAgbmUgPSB0aGlzLl9uZTtcbiAgICAgICAgbGV0IHN3MiwgbmUyO1xuXG4gICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBMbmdMYXQpIHtcbiAgICAgICAgICAgIHN3MiA9IG9iajtcbiAgICAgICAgICAgIG5lMiA9IG9iajtcblxuICAgICAgICB9IGVsc2UgaWYgKG9iaiBpbnN0YW5jZW9mIExuZ0xhdEJvdW5kcykge1xuICAgICAgICAgICAgc3cyID0gb2JqLl9zdztcbiAgICAgICAgICAgIG5lMiA9IG9iai5fbmU7XG5cbiAgICAgICAgICAgIGlmICghc3cyIHx8ICFuZTIpIHJldHVybiB0aGlzO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShvYmopKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9iai5ldmVyeShBcnJheS5pc0FycmF5KSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5leHRlbmQoTG5nTGF0Qm91bmRzLmNvbnZlcnQob2JqKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXh0ZW5kKExuZ0xhdC5jb252ZXJ0KG9iaikpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFzdyAmJiAhbmUpIHtcbiAgICAgICAgICAgIHRoaXMuX3N3ID0gbmV3IExuZ0xhdChzdzIubG5nLCBzdzIubGF0KTtcbiAgICAgICAgICAgIHRoaXMuX25lID0gbmV3IExuZ0xhdChuZTIubG5nLCBuZTIubGF0KTtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3cubG5nID0gTWF0aC5taW4oc3cyLmxuZywgc3cubG5nKTtcbiAgICAgICAgICAgIHN3LmxhdCA9IE1hdGgubWluKHN3Mi5sYXQsIHN3LmxhdCk7XG4gICAgICAgICAgICBuZS5sbmcgPSBNYXRoLm1heChuZTIubG5nLCBuZS5sbmcpO1xuICAgICAgICAgICAgbmUubGF0ID0gTWF0aC5tYXgobmUyLmxhdCwgbmUubGF0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGdlb2dyYXBoaWNhbCBjb29yZGluYXRlIGVxdWlkaXN0YW50IGZyb20gdGhlIGJvdW5kaW5nIGJveCdzIGNvcm5lcnMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7TG5nTGF0fSBUaGUgYm91bmRpbmcgYm94J3MgY2VudGVyLlxuICAgICAqIEBleGFtcGxlXG4gICAgICogdmFyIGxsYiA9IG5ldyBtYXBib3hnbC5MbmdMYXRCb3VuZHMoWy03My45ODc2LCA0MC43NjYxXSwgWy03My45Mzk3LCA0MC44MDAyXSk7XG4gICAgICogbGxiLmdldENlbnRlcigpOyAvLyA9IExuZ0xhdCB7bG5nOiAtNzMuOTYzNjUsIGxhdDogNDAuNzgzMTV9XG4gICAgICovXG4gICAgZ2V0Q2VudGVyKCk6IExuZ0xhdCB7XG4gICAgICAgIHJldHVybiBuZXcgTG5nTGF0KCh0aGlzLl9zdy5sbmcgKyB0aGlzLl9uZS5sbmcpIC8gMiwgKHRoaXMuX3N3LmxhdCArIHRoaXMuX25lLmxhdCkgLyAyKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBzb3V0aHdlc3QgY29ybmVyIG9mIHRoZSBib3VuZGluZyBib3guXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7TG5nTGF0fSBUaGUgc291dGh3ZXN0IGNvcm5lciBvZiB0aGUgYm91bmRpbmcgYm94LlxuICAgICAqL1xuICAgIGdldFNvdXRoV2VzdCgpOiBMbmdMYXQgeyByZXR1cm4gdGhpcy5fc3c7IH1cblxuICAgIC8qKlxuICAgICogUmV0dXJucyB0aGUgbm9ydGhlYXN0IGNvcm5lciBvZiB0aGUgYm91bmRpbmcgYm94LlxuICAgICpcbiAgICAqIEByZXR1cm5zIHtMbmdMYXR9IFRoZSBub3J0aGVhc3QgY29ybmVyIG9mIHRoZSBib3VuZGluZyBib3guXG4gICAgICovXG4gICAgZ2V0Tm9ydGhFYXN0KCk6IExuZ0xhdCB7IHJldHVybiB0aGlzLl9uZTsgfVxuXG4gICAgLyoqXG4gICAgKiBSZXR1cm5zIHRoZSBub3J0aHdlc3QgY29ybmVyIG9mIHRoZSBib3VuZGluZyBib3guXG4gICAgKlxuICAgICogQHJldHVybnMge0xuZ0xhdH0gVGhlIG5vcnRod2VzdCBjb3JuZXIgb2YgdGhlIGJvdW5kaW5nIGJveC5cbiAgICAgKi9cbiAgICBnZXROb3J0aFdlc3QoKTogTG5nTGF0IHsgcmV0dXJuIG5ldyBMbmdMYXQodGhpcy5nZXRXZXN0KCksIHRoaXMuZ2V0Tm9ydGgoKSk7IH1cblxuICAgIC8qKlxuICAgICogUmV0dXJucyB0aGUgc291dGhlYXN0IGNvcm5lciBvZiB0aGUgYm91bmRpbmcgYm94LlxuICAgICpcbiAgICAqIEByZXR1cm5zIHtMbmdMYXR9IFRoZSBzb3V0aGVhc3QgY29ybmVyIG9mIHRoZSBib3VuZGluZyBib3guXG4gICAgICovXG4gICAgZ2V0U291dGhFYXN0KCk6IExuZ0xhdCB7IHJldHVybiBuZXcgTG5nTGF0KHRoaXMuZ2V0RWFzdCgpLCB0aGlzLmdldFNvdXRoKCkpOyB9XG5cbiAgICAvKipcbiAgICAqIFJldHVybnMgdGhlIHdlc3QgZWRnZSBvZiB0aGUgYm91bmRpbmcgYm94LlxuICAgICpcbiAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSB3ZXN0IGVkZ2Ugb2YgdGhlIGJvdW5kaW5nIGJveC5cbiAgICAgKi9cbiAgICBnZXRXZXN0KCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9zdy5sbmc7IH1cblxuICAgIC8qKlxuICAgICogUmV0dXJucyB0aGUgc291dGggZWRnZSBvZiB0aGUgYm91bmRpbmcgYm94LlxuICAgICpcbiAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSBzb3V0aCBlZGdlIG9mIHRoZSBib3VuZGluZyBib3guXG4gICAgICovXG4gICAgZ2V0U291dGgoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX3N3LmxhdDsgfVxuXG4gICAgLyoqXG4gICAgKiBSZXR1cm5zIHRoZSBlYXN0IGVkZ2Ugb2YgdGhlIGJvdW5kaW5nIGJveC5cbiAgICAqXG4gICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgZWFzdCBlZGdlIG9mIHRoZSBib3VuZGluZyBib3guXG4gICAgICovXG4gICAgZ2V0RWFzdCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fbmUubG5nOyB9XG5cbiAgICAvKipcbiAgICAqIFJldHVybnMgdGhlIG5vcnRoIGVkZ2Ugb2YgdGhlIGJvdW5kaW5nIGJveC5cbiAgICAqXG4gICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgbm9ydGggZWRnZSBvZiB0aGUgYm91bmRpbmcgYm94LlxuICAgICAqL1xuICAgIGdldE5vcnRoKCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9uZS5sYXQ7IH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGJvdW5kaW5nIGJveCByZXByZXNlbnRlZCBhcyBhbiBhcnJheS5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtBcnJheTxBcnJheTxudW1iZXI+Pn0gVGhlIGJvdW5kaW5nIGJveCByZXByZXNlbnRlZCBhcyBhbiBhcnJheSwgY29uc2lzdGluZyBvZiB0aGVcbiAgICAgKiAgIHNvdXRod2VzdCBhbmQgbm9ydGhlYXN0IGNvb3JkaW5hdGVzIG9mIHRoZSBib3VuZGluZyByZXByZXNlbnRlZCBhcyBhcnJheXMgb2YgbnVtYmVycy5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHZhciBsbGIgPSBuZXcgbWFwYm94Z2wuTG5nTGF0Qm91bmRzKFstNzMuOTg3NiwgNDAuNzY2MV0sIFstNzMuOTM5NywgNDAuODAwMl0pO1xuICAgICAqIGxsYi50b0FycmF5KCk7IC8vID0gW1stNzMuOTg3NiwgNDAuNzY2MV0sIFstNzMuOTM5NywgNDAuODAwMl1dXG4gICAgICovXG4gICAgdG9BcnJheSgpIHtcbiAgICAgICAgcmV0dXJuIFt0aGlzLl9zdy50b0FycmF5KCksIHRoaXMuX25lLnRvQXJyYXkoKV07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRoZSBib3VuZGluZyBib3ggcmVwcmVzZW50ZWQgYXMgYSBzdHJpbmcuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgYm91bmRpbmcgYm94IHJlcHJlc2VudHMgYXMgYSBzdHJpbmcgb2YgdGhlIGZvcm1hdFxuICAgICAqICAgYCdMbmdMYXRCb3VuZHMoTG5nTGF0KGxuZywgbGF0KSwgTG5nTGF0KGxuZywgbGF0KSknYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHZhciBsbGIgPSBuZXcgbWFwYm94Z2wuTG5nTGF0Qm91bmRzKFstNzMuOTg3NiwgNDAuNzY2MV0sIFstNzMuOTM5NywgNDAuODAwMl0pO1xuICAgICAqIGxsYi50b1N0cmluZygpOyAvLyA9IFwiTG5nTGF0Qm91bmRzKExuZ0xhdCgtNzMuOTg3NiwgNDAuNzY2MSksIExuZ0xhdCgtNzMuOTM5NywgNDAuODAwMikpXCJcbiAgICAgKi9cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIGBMbmdMYXRCb3VuZHMoJHt0aGlzLl9zdy50b1N0cmluZygpfSwgJHt0aGlzLl9uZS50b1N0cmluZygpfSlgO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIHRoZSBib3VuZGluZyBib3ggaXMgYW4gZW1wdHkvYG51bGxgLXR5cGUgYm94LlxuICAgICAqXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgYm91bmRzIGhhdmUgYmVlbiBkZWZpbmVkLCBvdGhlcndpc2UgZmFsc2UuXG4gICAgICovXG4gICAgaXNFbXB0eSgpIHtcbiAgICAgICAgcmV0dXJuICEodGhpcy5fc3cgJiYgdGhpcy5fbmUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIGFuIGFycmF5IHRvIGEgYExuZ0xhdEJvdW5kc2Agb2JqZWN0LlxuICAgICAqXG4gICAgICogSWYgYSBgTG5nTGF0Qm91bmRzYCBvYmplY3QgaXMgcGFzc2VkIGluLCB0aGUgZnVuY3Rpb24gcmV0dXJucyBpdCB1bmNoYW5nZWQuXG4gICAgICpcbiAgICAgKiBJbnRlcm5hbGx5LCB0aGUgZnVuY3Rpb24gY2FsbHMgYExuZ0xhdCNjb252ZXJ0YCB0byBjb252ZXJ0IGFycmF5cyB0byBgTG5nTGF0YCB2YWx1ZXMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0xuZ0xhdEJvdW5kc0xpa2V9IGlucHV0IEFuIGFycmF5IG9mIHR3byBjb29yZGluYXRlcyB0byBjb252ZXJ0LCBvciBhIGBMbmdMYXRCb3VuZHNgIG9iamVjdCB0byByZXR1cm4uXG4gICAgICogQHJldHVybnMge0xuZ0xhdEJvdW5kc30gQSBuZXcgYExuZ0xhdEJvdW5kc2Agb2JqZWN0LCBpZiBhIGNvbnZlcnNpb24gb2NjdXJyZWQsIG9yIHRoZSBvcmlnaW5hbCBgTG5nTGF0Qm91bmRzYCBvYmplY3QuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB2YXIgYXJyID0gW1stNzMuOTg3NiwgNDAuNzY2MV0sIFstNzMuOTM5NywgNDAuODAwMl1dO1xuICAgICAqIHZhciBsbGIgPSBtYXBib3hnbC5MbmdMYXRCb3VuZHMuY29udmVydChhcnIpO1xuICAgICAqIGxsYjsgICAvLyA9IExuZ0xhdEJvdW5kcyB7X3N3OiBMbmdMYXQge2xuZzogLTczLjk4NzYsIGxhdDogNDAuNzY2MX0sIF9uZTogTG5nTGF0IHtsbmc6IC03My45Mzk3LCBsYXQ6IDQwLjgwMDJ9fVxuICAgICAqL1xuICAgIHN0YXRpYyBjb252ZXJ0KGlucHV0OiBMbmdMYXRCb3VuZHNMaWtlKTogTG5nTGF0Qm91bmRzIHtcbiAgICAgICAgaWYgKCFpbnB1dCB8fCBpbnB1dCBpbnN0YW5jZW9mIExuZ0xhdEJvdW5kcykgcmV0dXJuIGlucHV0O1xuICAgICAgICByZXR1cm4gbmV3IExuZ0xhdEJvdW5kcyhpbnB1dCk7XG4gICAgfVxufVxuXG4vKipcbiAqIEEge0BsaW5rIExuZ0xhdEJvdW5kc30gb2JqZWN0LCBhbiBhcnJheSBvZiB7QGxpbmsgTG5nTGF0TGlrZX0gb2JqZWN0cyBpbiBbc3csIG5lXSBvcmRlcixcbiAqIG9yIGFuIGFycmF5IG9mIG51bWJlcnMgaW4gW3dlc3QsIHNvdXRoLCBlYXN0LCBub3J0aF0gb3JkZXIuXG4gKlxuICogQHR5cGVkZWYge0xuZ0xhdEJvdW5kcyB8IFtMbmdMYXRMaWtlLCBMbmdMYXRMaWtlXSB8IFtudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXJdfSBMbmdMYXRCb3VuZHNMaWtlXG4gKiBAZXhhbXBsZVxuICogdmFyIHYxID0gbmV3IG1hcGJveGdsLkxuZ0xhdEJvdW5kcyhcbiAqICAgbmV3IG1hcGJveGdsLkxuZ0xhdCgtNzMuOTg3NiwgNDAuNzY2MSksXG4gKiAgIG5ldyBtYXBib3hnbC5MbmdMYXQoLTczLjkzOTcsIDQwLjgwMDIpXG4gKiApO1xuICogdmFyIHYyID0gbmV3IG1hcGJveGdsLkxuZ0xhdEJvdW5kcyhbLTczLjk4NzYsIDQwLjc2NjFdLCBbLTczLjkzOTcsIDQwLjgwMDJdKVxuICogdmFyIHYzID0gW1stNzMuOTg3NiwgNDAuNzY2MV0sIFstNzMuOTM5NywgNDAuODAwMl1dO1xuICovXG5leHBvcnQgdHlwZSBMbmdMYXRCb3VuZHNMaWtlID0gTG5nTGF0Qm91bmRzIHwgW0xuZ0xhdExpa2UsIExuZ0xhdExpa2VdIHwgW251bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlcl07XG5cbmV4cG9ydCBkZWZhdWx0IExuZ0xhdEJvdW5kcztcbiIsIi8vIEBmbG93XG5cbmltcG9ydCBMbmdMYXQgZnJvbSAnLi4vZ2VvL2xuZ19sYXQnO1xuaW1wb3J0IHR5cGUge0xuZ0xhdExpa2V9IGZyb20gJy4uL2dlby9sbmdfbGF0JztcblxuLypcbiAqIFRoZSBjaXJjdW1mZXJlbmNlIG9mIHRoZSB3b3JsZCBpbiBtZXRlcnMgYXQgdGhlIGVxdWF0b3IuXG4gKi9cbmNvbnN0IGNpcmN1bWZlcmVuY2VBdEVxdWF0b3IgPSAyICogTWF0aC5QSSAqIDYzNzgxMzc7XG5cbi8qXG4gKiBUaGUgY2lyY3VtZmVyZW5jZSBvZiB0aGUgd29ybGQgaW4gbWV0ZXJzIGF0IHRoZSBnaXZlbiBsYXRpdHVkZS5cbiAqL1xuZnVuY3Rpb24gY2lyY3VtZmVyZW5jZUF0TGF0aXR1ZGUobGF0aXR1ZGU6IG51bWJlcikge1xuICAgIHJldHVybiBjaXJjdW1mZXJlbmNlQXRFcXVhdG9yICogTWF0aC5jb3MobGF0aXR1ZGUgKiBNYXRoLlBJIC8gMTgwKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1lcmNhdG9yWGZyb21MbmcobG5nOiBudW1iZXIpIHtcbiAgICByZXR1cm4gKDE4MCArIGxuZykgLyAzNjA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtZXJjYXRvcllmcm9tTGF0KGxhdDogbnVtYmVyKSB7XG4gICAgcmV0dXJuICgxODAgLSAoMTgwIC8gTWF0aC5QSSAqIE1hdGgubG9nKE1hdGgudGFuKE1hdGguUEkgLyA0ICsgbGF0ICogTWF0aC5QSSAvIDM2MCkpKSkgLyAzNjA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtZXJjYXRvclpmcm9tQWx0aXR1ZGUoYWx0aXR1ZGU6IG51bWJlciwgbGF0OiBudW1iZXIpIHtcbiAgICByZXR1cm4gYWx0aXR1ZGUgLyBjaXJjdW1mZXJlbmNlQXRMYXRpdHVkZShsYXQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbG5nRnJvbU1lcmNhdG9yWCh4OiBudW1iZXIpIHtcbiAgICByZXR1cm4geCAqIDM2MCAtIDE4MDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxhdEZyb21NZXJjYXRvclkoeTogbnVtYmVyKSB7XG4gICAgY29uc3QgeTIgPSAxODAgLSB5ICogMzYwO1xuICAgIHJldHVybiAzNjAgLyBNYXRoLlBJICogTWF0aC5hdGFuKE1hdGguZXhwKHkyICogTWF0aC5QSSAvIDE4MCkpIC0gOTA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbHRpdHVkZUZyb21NZXJjYXRvclooejogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICByZXR1cm4geiAqIGNpcmN1bWZlcmVuY2VBdExhdGl0dWRlKGxhdEZyb21NZXJjYXRvclkoeSkpO1xufVxuXG4vKipcbiAqIERldGVybWluZSB0aGUgTWVyY2F0b3Igc2NhbGUgZmFjdG9yIGZvciBhIGdpdmVuIGxhdGl0dWRlLCBzZWVcbiAqIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL01lcmNhdG9yX3Byb2plY3Rpb24jU2NhbGVfZmFjdG9yXG4gKlxuICogQXQgdGhlIGVxdWF0b3IgdGhlIHNjYWxlIGZhY3RvciB3aWxsIGJlIDEsIHdoaWNoIGluY3JlYXNlcyBhdCBoaWdoZXIgbGF0aXR1ZGVzLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBsYXQgTGF0aXR1ZGVcbiAqIEByZXR1cm5zIHtudW1iZXJ9IHNjYWxlIGZhY3RvclxuICovXG5leHBvcnQgZnVuY3Rpb24gbWVyY2F0b3JTY2FsZShsYXQ6IG51bWJlcikge1xuICAgIHJldHVybiAxIC8gTWF0aC5jb3MobGF0ICogTWF0aC5QSSAvIDE4MCk7XG59XG5cbi8qKlxuICogQSBgTWVyY2F0b3JDb29yZGluYXRlYCBvYmplY3QgcmVwcmVzZW50cyBhIHByb2plY3RlZCB0aHJlZSBkaW1lbnNpb25hbCBwb3NpdGlvbi5cbiAqXG4gKiBgTWVyY2F0b3JDb29yZGluYXRlYCB1c2VzIHRoZSB3ZWIgbWVyY2F0b3IgcHJvamVjdGlvbiAoW0VQU0c6Mzg1N10oaHR0cHM6Ly9lcHNnLmlvLzM4NTcpKSB3aXRoIHNsaWdodGx5IGRpZmZlcmVudCB1bml0czpcbiAqIC0gdGhlIHNpemUgb2YgMSB1bml0IGlzIHRoZSB3aWR0aCBvZiB0aGUgcHJvamVjdGVkIHdvcmxkIGluc3RlYWQgb2YgdGhlIFwibWVyY2F0b3IgbWV0ZXJcIlxuICogLSB0aGUgb3JpZ2luIG9mIHRoZSBjb29yZGluYXRlIHNwYWNlIGlzIGF0IHRoZSBub3J0aC13ZXN0IGNvcm5lciBpbnN0ZWFkIG9mIHRoZSBtaWRkbGVcbiAqXG4gKiBGb3IgZXhhbXBsZSwgYE1lcmNhdG9yQ29vcmRpbmF0ZSgwLCAwLCAwKWAgaXMgdGhlIG5vcnRoLXdlc3QgY29ybmVyIG9mIHRoZSBtZXJjYXRvciB3b3JsZCBhbmRcbiAqIGBNZXJjYXRvckNvb3JkaW5hdGUoMSwgMSwgMClgIGlzIHRoZSBzb3V0aC1lYXN0IGNvcm5lci4gSWYgeW91IGFyZSBmYW1pbGlhciB3aXRoXG4gKiBbdmVjdG9yIHRpbGVzXShodHRwczovL2dpdGh1Yi5jb20vbWFwYm94L3ZlY3Rvci10aWxlLXNwZWMpIGl0IG1heSBiZSBoZWxwZnVsIHRvIHRoaW5rXG4gKiBvZiB0aGUgY29vcmRpbmF0ZSBzcGFjZSBhcyB0aGUgYDAvMC8wYCB0aWxlIHdpdGggYW4gZXh0ZW50IG9mIGAxYC5cbiAqXG4gKiBUaGUgYHpgIGRpbWVuc2lvbiBvZiBgTWVyY2F0b3JDb29yZGluYXRlYCBpcyBjb25mb3JtYWwuIEEgY3ViZSBpbiB0aGUgbWVyY2F0b3IgY29vcmRpbmF0ZSBzcGFjZSB3b3VsZCBiZSByZW5kZXJlZCBhcyBhIGN1YmUuXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IHggVGhlIHggY29tcG9uZW50IG9mIHRoZSBwb3NpdGlvbi5cbiAqIEBwYXJhbSB7bnVtYmVyfSB5IFRoZSB5IGNvbXBvbmVudCBvZiB0aGUgcG9zaXRpb24uXG4gKiBAcGFyYW0ge251bWJlcn0geiBUaGUgeiBjb21wb25lbnQgb2YgdGhlIHBvc2l0aW9uLlxuICogQGV4YW1wbGVcbiAqIHZhciBudWxsSXNsYW5kID0gbmV3IG1hcGJveGdsLk1lcmNhdG9yQ29vcmRpbmF0ZSgwLjUsIDAuNSwgMCk7XG4gKlxuICogQHNlZSBbQWRkIGEgY3VzdG9tIHN0eWxlIGxheWVyXShodHRwczovL3d3dy5tYXBib3guY29tL21hcGJveC1nbC1qcy9leGFtcGxlL2N1c3RvbS1zdHlsZS1sYXllci8pXG4gKi9cbmNsYXNzIE1lcmNhdG9yQ29vcmRpbmF0ZSB7XG4gICAgeDogbnVtYmVyO1xuICAgIHk6IG51bWJlcjtcbiAgICB6OiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyID0gMCkge1xuICAgICAgICB0aGlzLnggPSAreDtcbiAgICAgICAgdGhpcy55ID0gK3k7XG4gICAgICAgIHRoaXMueiA9ICt6O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFByb2plY3QgYSBgTG5nTGF0YCB0byBhIGBNZXJjYXRvckNvb3JkaW5hdGVgLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtMbmdMYXRMaWtlfSBsbmdMYXRMaWtlIFRoZSBsb2NhdGlvbiB0byBwcm9qZWN0LlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBhbHRpdHVkZSBUaGUgYWx0aXR1ZGUgaW4gbWV0ZXJzIG9mIHRoZSBwb3NpdGlvbi5cbiAgICAgKiBAcmV0dXJucyB7TWVyY2F0b3JDb29yZGluYXRlfSBUaGUgcHJvamVjdGVkIG1lcmNhdG9yIGNvb3JkaW5hdGUuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB2YXIgY29vcmQgPSBtYXBib3hnbC5NZXJjYXRvckNvb3JkaW5hdGUuZnJvbUxuZ0xhdCh7IGxuZzogMCwgbGF0OiAwfSwgMCk7XG4gICAgICogY29vcmQ7IC8vIE1lcmNhdG9yQ29vcmRpbmF0ZSgwLjUsIDAuNSwgMClcbiAgICAgKi9cbiAgICBzdGF0aWMgZnJvbUxuZ0xhdChsbmdMYXRMaWtlOiBMbmdMYXRMaWtlLCBhbHRpdHVkZTogbnVtYmVyID0gMCkge1xuICAgICAgICBjb25zdCBsbmdMYXQgPSBMbmdMYXQuY29udmVydChsbmdMYXRMaWtlKTtcblxuICAgICAgICByZXR1cm4gbmV3IE1lcmNhdG9yQ29vcmRpbmF0ZShcbiAgICAgICAgICAgICAgICBtZXJjYXRvclhmcm9tTG5nKGxuZ0xhdC5sbmcpLFxuICAgICAgICAgICAgICAgIG1lcmNhdG9yWWZyb21MYXQobG5nTGF0LmxhdCksXG4gICAgICAgICAgICAgICAgbWVyY2F0b3JaZnJvbUFsdGl0dWRlKGFsdGl0dWRlLCBsbmdMYXQubGF0KSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgYExuZ0xhdGAgZm9yIHRoZSBjb29yZGluYXRlLlxuICAgICAqXG4gICAgICogQHJldHVybnMge0xuZ0xhdH0gVGhlIGBMbmdMYXRgIG9iamVjdC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHZhciBjb29yZCA9IG5ldyBtYXBib3hnbC5NZXJjYXRvckNvb3JkaW5hdGUoMC41LCAwLjUsIDApO1xuICAgICAqIHZhciBsYXRMbmcgPSBjb29yZC50b0xuZ0xhdCgpOyAvLyBMbmdMYXQoMCwgMClcbiAgICAgKi9cbiAgICB0b0xuZ0xhdCgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBMbmdMYXQoXG4gICAgICAgICAgICAgICAgbG5nRnJvbU1lcmNhdG9yWCh0aGlzLngpLFxuICAgICAgICAgICAgICAgIGxhdEZyb21NZXJjYXRvclkodGhpcy55KSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgYWx0aXR1ZGUgaW4gbWV0ZXJzIG9mIHRoZSBjb29yZGluYXRlLlxuICAgICAqXG4gICAgICogQHJldHVybnMge251bWJlcn0gVGhlIGFsdGl0dWRlIGluIG1ldGVycy5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHZhciBjb29yZCA9IG5ldyBtYXBib3hnbC5NZXJjYXRvckNvb3JkaW5hdGUoMCwgMCwgMC4wMik7XG4gICAgICogY29vcmQudG9BbHRpdHVkZSgpOyAvLyA2OTE0LjI4MTk1NjI5NTMzOVxuICAgICAqL1xuICAgIHRvQWx0aXR1ZGUoKSB7XG4gICAgICAgIHJldHVybiBhbHRpdHVkZUZyb21NZXJjYXRvcloodGhpcy56LCB0aGlzLnkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGRpc3RhbmNlIG9mIDEgbWV0ZXIgaW4gYE1lcmNhdG9yQ29vcmRpbmF0ZWAgdW5pdHMgYXQgdGhpcyBsYXRpdHVkZS5cbiAgICAgKlxuICAgICAqIEZvciBjb29yZGluYXRlcyBpbiByZWFsIHdvcmxkIHVuaXRzIHVzaW5nIG1ldGVycywgdGhpcyBuYXR1cmFsbHkgcHJvdmlkZXMgdGhlIHNjYWxlXG4gICAgICogdG8gdHJhbnNmb3JtIGludG8gYE1lcmNhdG9yQ29vcmRpbmF0ZWBzLlxuICAgICAqXG4gICAgICogQHJldHVybnMge251bWJlcn0gRGlzdGFuY2Ugb2YgMSBtZXRlciBpbiBgTWVyY2F0b3JDb29yZGluYXRlYCB1bml0cy5cbiAgICAgKi9cbiAgICBtZXRlckluTWVyY2F0b3JDb29yZGluYXRlVW5pdHMoKSB7XG4gICAgICAgIC8vIDEgbWV0ZXIgLyBjaXJjdW1mZXJlbmNlIGF0IGVxdWF0b3IgaW4gbWV0ZXJzICogTWVyY2F0b3IgcHJvamVjdGlvbiBzY2FsZSBmYWN0b3IgYXQgdGhpcyBsYXRpdHVkZVxuICAgICAgICByZXR1cm4gMSAvIGNpcmN1bWZlcmVuY2VBdEVxdWF0b3IgKiBtZXJjYXRvclNjYWxlKGxhdEZyb21NZXJjYXRvclkodGhpcy55KSk7XG4gICAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IE1lcmNhdG9yQ29vcmRpbmF0ZTtcbiIsIi8vIEBmbG93XG5cbmltcG9ydCBMbmdMYXRCb3VuZHMgZnJvbSAnLi4vZ2VvL2xuZ19sYXRfYm91bmRzJztcbmltcG9ydCB7bWVyY2F0b3JYZnJvbUxuZywgbWVyY2F0b3JZZnJvbUxhdH0gZnJvbSAnLi4vZ2VvL21lcmNhdG9yX2Nvb3JkaW5hdGUnO1xuXG5pbXBvcnQgdHlwZSB7Q2Fub25pY2FsVGlsZUlEfSBmcm9tICcuL3RpbGVfaWQnO1xuXG5jbGFzcyBUaWxlQm91bmRzIHtcbiAgICBib3VuZHM6IExuZ0xhdEJvdW5kcztcbiAgICBtaW56b29tOiBudW1iZXI7XG4gICAgbWF4em9vbTogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IoYm91bmRzOiBbbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyXSwgbWluem9vbTogP251bWJlciwgbWF4em9vbTogP251bWJlcikge1xuICAgICAgICB0aGlzLmJvdW5kcyA9IExuZ0xhdEJvdW5kcy5jb252ZXJ0KHRoaXMudmFsaWRhdGVCb3VuZHMoYm91bmRzKSk7XG4gICAgICAgIHRoaXMubWluem9vbSA9IG1pbnpvb20gfHwgMDtcbiAgICAgICAgdGhpcy5tYXh6b29tID0gbWF4em9vbSB8fCAyNDtcbiAgICB9XG5cbiAgICB2YWxpZGF0ZUJvdW5kcyhib3VuZHM6IFtudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXJdKSB7XG4gICAgICAgIC8vIG1ha2Ugc3VyZSB0aGUgYm91bmRzIHByb3BlcnR5IGNvbnRhaW5zIHZhbGlkIGxvbmdpdHVkZSBhbmQgbGF0aXR1ZGVzXG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShib3VuZHMpIHx8IGJvdW5kcy5sZW5ndGggIT09IDQpIHJldHVybiBbLTE4MCwgLTkwLCAxODAsIDkwXTtcbiAgICAgICAgcmV0dXJuIFtNYXRoLm1heCgtMTgwLCBib3VuZHNbMF0pLCBNYXRoLm1heCgtOTAsIGJvdW5kc1sxXSksIE1hdGgubWluKDE4MCwgYm91bmRzWzJdKSwgTWF0aC5taW4oOTAsIGJvdW5kc1szXSldO1xuICAgIH1cblxuICAgIGNvbnRhaW5zKHRpbGVJRDogQ2Fub25pY2FsVGlsZUlEKSB7XG4gICAgICAgIGNvbnN0IHdvcmxkU2l6ZSA9IE1hdGgucG93KDIsIHRpbGVJRC56KTtcbiAgICAgICAgY29uc3QgbGV2ZWwgPSB7XG4gICAgICAgICAgICBtaW5YOiBNYXRoLmZsb29yKG1lcmNhdG9yWGZyb21MbmcodGhpcy5ib3VuZHMuZ2V0V2VzdCgpKSAqIHdvcmxkU2l6ZSksXG4gICAgICAgICAgICBtaW5ZOiBNYXRoLmZsb29yKG1lcmNhdG9yWWZyb21MYXQodGhpcy5ib3VuZHMuZ2V0Tm9ydGgoKSkgKiB3b3JsZFNpemUpLFxuICAgICAgICAgICAgbWF4WDogTWF0aC5jZWlsKG1lcmNhdG9yWGZyb21MbmcodGhpcy5ib3VuZHMuZ2V0RWFzdCgpKSAqIHdvcmxkU2l6ZSksXG4gICAgICAgICAgICBtYXhZOiBNYXRoLmNlaWwobWVyY2F0b3JZZnJvbUxhdCh0aGlzLmJvdW5kcy5nZXRTb3V0aCgpKSAqIHdvcmxkU2l6ZSlcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgaGl0ID0gdGlsZUlELnggPj0gbGV2ZWwubWluWCAmJiB0aWxlSUQueCA8IGxldmVsLm1heFggJiYgdGlsZUlELnkgPj0gbGV2ZWwubWluWSAmJiB0aWxlSUQueSA8IGxldmVsLm1heFk7XG4gICAgICAgIHJldHVybiBoaXQ7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUaWxlQm91bmRzO1xuIiwiXG4vL0Zyb20gaHR0cHM6Ly9naXRodWIuY29tL0xlYWZsZXQvTGVhZmxldC9ibG9iL21hc3Rlci9zcmMvY29yZS9VdGlsLmpzXG5jb25zdCBfdGVtcGxhdGVSZSA9IC9cXHsgKihbXFx3X10rKSAqXFx9L2c7XG5jb25zdCBfdGVtcGxhdGUgPSBmdW5jdGlvbiAoc3RyLCBkYXRhKSB7XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKF90ZW1wbGF0ZVJlLCAoc3RyLCBrZXkpID0+IHtcbiAgICAgICAgbGV0IHZhbHVlID0gZGF0YVtrZXldO1xuXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIHZhbHVlIHByb3ZpZGVkIGZvciB2YXJpYWJsZSAke3N0cn1gKTtcblxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZShkYXRhKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSk7XG59O1xuXG4vL0Zyb20gaHR0cHM6Ly9naXRodWIuY29tL0xlYWZsZXQvTGVhZmxldC9ibG9iL21hc3Rlci9zcmMvbGF5ZXIvdGlsZS9UaWxlTGF5ZXIuanNcbmNvbnN0IF9nZXRTdWJkb21haW4gPSBmdW5jdGlvbiAodGlsZVBvaW50LCBzdWJkb21haW5zKSB7XG4gICAgaWYgKHN1YmRvbWFpbnMpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBNYXRoLmFicyh0aWxlUG9pbnQueCArIHRpbGVQb2ludC55KSAlIHN1YmRvbWFpbnMubGVuZ3RoO1xuICAgICAgICByZXR1cm4gc3ViZG9tYWluc1tpbmRleF07XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufTtcblxuZXhwb3J0IHtcbiAgICBfdGVtcGxhdGUsXG4gICAgX2dldFN1YmRvbWFpblxufTtcbiIsIi8vIEBmbG93XG5cbmltcG9ydCB3aW5kb3cgZnJvbSAnLi4vdXRpbC93aW5kb3cnO1xuY29uc3Qge0hUTUxJbWFnZUVsZW1lbnQsIEhUTUxDYW52YXNFbGVtZW50LCBIVE1MVmlkZW9FbGVtZW50LCBJbWFnZURhdGF9ID0gd2luZG93O1xuXG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gJy4uL2dsL2NvbnRleHQnO1xuaW1wb3J0IHR5cGUge1JHQkFJbWFnZSwgQWxwaGFJbWFnZX0gZnJvbSAnLi4vdXRpbC9pbWFnZSc7XG5cbmV4cG9ydCB0eXBlIFRleHR1cmVGb3JtYXQgPVxuICAgIHwgJFByb3BlcnR5VHlwZTxXZWJHTFJlbmRlcmluZ0NvbnRleHQsICdSR0JBJz5cbiAgICB8ICRQcm9wZXJ0eVR5cGU8V2ViR0xSZW5kZXJpbmdDb250ZXh0LCAnQUxQSEEnPjtcbmV4cG9ydCB0eXBlIFRleHR1cmVGaWx0ZXIgPVxuICAgIHwgJFByb3BlcnR5VHlwZTxXZWJHTFJlbmRlcmluZ0NvbnRleHQsICdMSU5FQVInPlxuICAgIHwgJFByb3BlcnR5VHlwZTxXZWJHTFJlbmRlcmluZ0NvbnRleHQsICdMSU5FQVJfTUlQTUFQX05FQVJFU1QnPlxuICAgIHwgJFByb3BlcnR5VHlwZTxXZWJHTFJlbmRlcmluZ0NvbnRleHQsICdORUFSRVNUJz47XG5leHBvcnQgdHlwZSBUZXh0dXJlV3JhcCA9XG4gICAgfCAkUHJvcGVydHlUeXBlPFdlYkdMUmVuZGVyaW5nQ29udGV4dCwgJ1JFUEVBVCc+XG4gICAgfCAkUHJvcGVydHlUeXBlPFdlYkdMUmVuZGVyaW5nQ29udGV4dCwgJ0NMQU1QX1RPX0VER0UnPlxuICAgIHwgJFByb3BlcnR5VHlwZTxXZWJHTFJlbmRlcmluZ0NvbnRleHQsICdNSVJST1JFRF9SRVBFQVQnPjtcblxudHlwZSBFbXB0eUltYWdlID0ge1xuICAgIHdpZHRoOiBudW1iZXIsXG4gICAgaGVpZ2h0OiBudW1iZXIsXG4gICAgZGF0YTogbnVsbFxufVxuXG5leHBvcnQgdHlwZSBUZXh0dXJlSW1hZ2UgPVxuICAgIHwgUkdCQUltYWdlXG4gICAgfCBBbHBoYUltYWdlXG4gICAgfCBIVE1MSW1hZ2VFbGVtZW50XG4gICAgfCBIVE1MQ2FudmFzRWxlbWVudFxuICAgIHwgSFRNTFZpZGVvRWxlbWVudFxuICAgIHwgSW1hZ2VEYXRhXG4gICAgfCBFbXB0eUltYWdlO1xuXG5jbGFzcyBUZXh0dXJlIHtcbiAgICBjb250ZXh0OiBDb250ZXh0O1xuICAgIHNpemU6IFtudW1iZXIsIG51bWJlcl07XG4gICAgdGV4dHVyZTogV2ViR0xUZXh0dXJlO1xuICAgIGZvcm1hdDogVGV4dHVyZUZvcm1hdDtcbiAgICBmaWx0ZXI6ID9UZXh0dXJlRmlsdGVyO1xuICAgIHdyYXA6ID9UZXh0dXJlV3JhcDtcbiAgICB1c2VNaXBtYXA6IGJvb2xlYW47XG5cbiAgICBjb25zdHJ1Y3Rvcihjb250ZXh0OiBDb250ZXh0LCBpbWFnZTogVGV4dHVyZUltYWdlLCBmb3JtYXQ6IFRleHR1cmVGb3JtYXQsIG9wdGlvbnM6ID97IHByZW11bHRpcGx5PzogYm9vbGVhbiwgdXNlTWlwbWFwPzogYm9vbGVhbiB9KSB7XG4gICAgICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG4gICAgICAgIHRoaXMuZm9ybWF0ID0gZm9ybWF0O1xuICAgICAgICB0aGlzLnRleHR1cmUgPSBjb250ZXh0LmdsLmNyZWF0ZVRleHR1cmUoKTtcbiAgICAgICAgdGhpcy51cGRhdGUoaW1hZ2UsIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIHVwZGF0ZShpbWFnZTogVGV4dHVyZUltYWdlLCBvcHRpb25zOiA/e3ByZW11bHRpcGx5PzogYm9vbGVhbiwgdXNlTWlwbWFwPzogYm9vbGVhbn0sIHBvc2l0aW9uPzogeyB4OiBudW1iZXIsIHk6IG51bWJlciB9KSB7XG4gICAgICAgIGNvbnN0IHt3aWR0aCwgaGVpZ2h0fSA9IGltYWdlO1xuICAgICAgICBjb25zdCByZXNpemUgPSAoIXRoaXMuc2l6ZSB8fCB0aGlzLnNpemVbMF0gIT09IHdpZHRoIHx8IHRoaXMuc2l6ZVsxXSAhPT0gaGVpZ2h0KSAmJiAhcG9zaXRpb247XG4gICAgICAgIGNvbnN0IHtjb250ZXh0fSA9IHRoaXM7XG4gICAgICAgIGNvbnN0IHtnbH0gPSBjb250ZXh0O1xuXG4gICAgICAgIHRoaXMudXNlTWlwbWFwID0gQm9vbGVhbihvcHRpb25zICYmIG9wdGlvbnMudXNlTWlwbWFwKTtcbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGhpcy50ZXh0dXJlKTtcblxuICAgICAgICBjb250ZXh0LnBpeGVsU3RvcmVVbnBhY2tGbGlwWS5zZXQoZmFsc2UpO1xuICAgICAgICBjb250ZXh0LnBpeGVsU3RvcmVVbnBhY2suc2V0KDEpO1xuICAgICAgICBjb250ZXh0LnBpeGVsU3RvcmVVbnBhY2tQcmVtdWx0aXBseUFscGhhLnNldCh0aGlzLmZvcm1hdCA9PT0gZ2wuUkdCQSAmJiAoIW9wdGlvbnMgfHwgb3B0aW9ucy5wcmVtdWx0aXBseSAhPT0gZmFsc2UpKTtcblxuICAgICAgICBpZiAocmVzaXplKSB7XG4gICAgICAgICAgICB0aGlzLnNpemUgPSBbd2lkdGgsIGhlaWdodF07XG5cbiAgICAgICAgICAgIGlmIChpbWFnZSBpbnN0YW5jZW9mIEhUTUxJbWFnZUVsZW1lbnQgfHwgaW1hZ2UgaW5zdGFuY2VvZiBIVE1MQ2FudmFzRWxlbWVudCB8fCBpbWFnZSBpbnN0YW5jZW9mIEhUTUxWaWRlb0VsZW1lbnQgfHwgaW1hZ2UgaW5zdGFuY2VvZiBJbWFnZURhdGEpIHtcbiAgICAgICAgICAgICAgICBnbC50ZXhJbWFnZTJEKGdsLlRFWFRVUkVfMkQsIDAsIHRoaXMuZm9ybWF0LCB0aGlzLmZvcm1hdCwgZ2wuVU5TSUdORURfQllURSwgaW1hZ2UpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBnbC50ZXhJbWFnZTJEKGdsLlRFWFRVUkVfMkQsIDAsIHRoaXMuZm9ybWF0LCB3aWR0aCwgaGVpZ2h0LCAwLCB0aGlzLmZvcm1hdCwgZ2wuVU5TSUdORURfQllURSwgaW1hZ2UuZGF0YSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHt4LCB5fSA9IHBvc2l0aW9uIHx8IHt4OiAwLCB5OiAwfTtcbiAgICAgICAgICAgIGlmIChpbWFnZSBpbnN0YW5jZW9mIEhUTUxJbWFnZUVsZW1lbnQgfHwgaW1hZ2UgaW5zdGFuY2VvZiBIVE1MQ2FudmFzRWxlbWVudCB8fCBpbWFnZSBpbnN0YW5jZW9mIEhUTUxWaWRlb0VsZW1lbnQgfHwgaW1hZ2UgaW5zdGFuY2VvZiBJbWFnZURhdGEpIHtcbiAgICAgICAgICAgICAgICBnbC50ZXhTdWJJbWFnZTJEKGdsLlRFWFRVUkVfMkQsIDAsIHgsIHksIGdsLlJHQkEsIGdsLlVOU0lHTkVEX0JZVEUsIGltYWdlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZ2wudGV4U3ViSW1hZ2UyRChnbC5URVhUVVJFXzJELCAwLCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCBnbC5SR0JBLCBnbC5VTlNJR05FRF9CWVRFLCBpbWFnZS5kYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnVzZU1pcG1hcCAmJiB0aGlzLmlzU2l6ZVBvd2VyT2ZUd28oKSkge1xuICAgICAgICAgICAgZ2wuZ2VuZXJhdGVNaXBtYXAoZ2wuVEVYVFVSRV8yRCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBiaW5kKGZpbHRlcjogVGV4dHVyZUZpbHRlciwgd3JhcDogVGV4dHVyZVdyYXAsIG1pbkZpbHRlcjogP1RleHR1cmVGaWx0ZXIpIHtcbiAgICAgICAgY29uc3Qge2NvbnRleHR9ID0gdGhpcztcbiAgICAgICAgY29uc3Qge2dsfSA9IGNvbnRleHQ7XG4gICAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRoaXMudGV4dHVyZSk7XG5cbiAgICAgICAgaWYgKG1pbkZpbHRlciA9PT0gZ2wuTElORUFSX01JUE1BUF9ORUFSRVNUICYmICF0aGlzLmlzU2l6ZVBvd2VyT2ZUd28oKSkge1xuICAgICAgICAgICAgbWluRmlsdGVyID0gZ2wuTElORUFSO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZpbHRlciAhPT0gdGhpcy5maWx0ZXIpIHtcbiAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBmaWx0ZXIpO1xuICAgICAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01JTl9GSUxURVIsIG1pbkZpbHRlciB8fCBmaWx0ZXIpO1xuICAgICAgICAgICAgdGhpcy5maWx0ZXIgPSBmaWx0ZXI7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAod3JhcCAhPT0gdGhpcy53cmFwKSB7XG4gICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9TLCB3cmFwKTtcbiAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1QsIHdyYXApO1xuICAgICAgICAgICAgdGhpcy53cmFwID0gd3JhcDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlzU2l6ZVBvd2VyT2ZUd28oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNpemVbMF0gPT09IHRoaXMuc2l6ZVsxXSAmJiAoTWF0aC5sb2codGhpcy5zaXplWzBdKSAvIE1hdGguTE4yKSAlIDEgPT09IDA7XG4gICAgfVxuXG4gICAgZGVzdHJveSgpIHtcbiAgICAgICAgY29uc3Qge2dsfSA9IHRoaXMuY29udGV4dDtcbiAgICAgICAgZ2wuZGVsZXRlVGV4dHVyZSh0aGlzLnRleHR1cmUpO1xuICAgICAgICB0aGlzLnRleHR1cmUgPSAobnVsbDogYW55KTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRleHR1cmU7XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQge2V4dGVuZCwgcGlja30gZnJvbSAnbWFwYm94LWdsL3NyYy91dGlsL3V0aWwnO1xuXG5pbXBvcnQge2dldEltYWdlfSBmcm9tICdtYXBib3gtZ2wvc3JjL3V0aWwvYWpheCc7XG5pbXBvcnQge0V2ZW50LCBFcnJvckV2ZW50LCBFdmVudGVkfSBmcm9tICdtYXBib3gtZ2wvc3JjL3V0aWwvZXZlbnRlZCc7XG5pbXBvcnQgbG9hZEFyY0dJU01hcFNlcnZlciBmcm9tICcuL2xvYWRfYXJjZ2lzX21hcHNlcnZlcic7XG4vLyBpbXBvcnQge3Bvc3RUdXJuc3RpbGVFdmVudCwgcG9zdE1hcExvYWRFdmVudH0gZnJvbSAnbWFwYm94LWdsL3NyYy91dGlsL21hcGJveCc7XG5pbXBvcnQgVGlsZUJvdW5kcyBmcm9tICdtYXBib3gtZ2wvc3JjL3NvdXJjZS90aWxlX2JvdW5kcyc7XG5pbXBvcnQge190ZW1wbGF0ZSwgX2dldFN1YmRvbWFpbn0gZnJvbSAnLi9oZWxwZXJzJztcbmltcG9ydCBUZXh0dXJlIGZyb20gJ21hcGJveC1nbC9zcmMvcmVuZGVyL3RleHR1cmUnO1xuaW1wb3J0IHtjYWNoZUVudHJ5UG9zc2libHlBZGRlZH0gZnJvbSAnbWFwYm94LWdsL3NyYy91dGlsL3RpbGVfcmVxdWVzdF9jYWNoZSc7XG5cbmltcG9ydCB0eXBlIHtTb3VyY2V9IGZyb20gJ21hcGJveC1nbC9zcmMvc291cmNlL3NvdXJjZSc7XG5pbXBvcnQgdHlwZSB7T3ZlcnNjYWxlZFRpbGVJRH0gZnJvbSAnbWFwYm94LWdsL3NyYy9zb3VyY2UvdGlsZV9pZCc7XG5pbXBvcnQgdHlwZSBNYXAgZnJvbSAnbWFwYm94LWdsL3NyYy91aS9tYXAnO1xuaW1wb3J0IHR5cGUgRGlzcGF0Y2hlciBmcm9tICdtYXBib3gtZ2wvc3JjL3V0aWwvZGlzcGF0Y2hlcic7XG5pbXBvcnQgdHlwZSBUaWxlIGZyb20gJ21hcGJveC1nbC9zcmMvc291cmNlL3RpbGUnO1xuaW1wb3J0IHR5cGUge0NhbGxiYWNrfSBmcm9tICdtYXBib3gtZ2wvc3JjL3R5cGVzL2NhbGxiYWNrJztcbi8vIGltcG9ydCB0eXBlIHtDYW5jZWxhYmxlfSBmcm9tICdtYXBib3gtZ2wvc3JjL3R5cGVzL2NhbmNlbGFibGUnO1xuaW1wb3J0IHR5cGUge1xuICAgIFJhc3RlclNvdXJjZVNwZWNpZmljYXRpb24sXG4gICAgUmFzdGVyREVNU291cmNlU3BlY2lmaWNhdGlvblxufSBmcm9tICdtYXBib3gtZ2wvc3JjL3N0eWxlLXNwZWMvdHlwZXMnO1xuXG5jbGFzcyBBcmNHSVNUaWxlZE1hcFNlcnZpY2VTb3VyY2UgZXh0ZW5kcyBFdmVudGVkIGltcGxlbWVudHMgU291cmNlIHtcblxuICAgIHR5cGU6ICdyYXN0ZXInIHwgJ3Jhc3Rlci1kZW0nO1xuICAgIGlkOiBzdHJpbmc7XG4gICAgbWluem9vbTogbnVtYmVyO1xuICAgIG1heHpvb206IG51bWJlcjtcbiAgICB1cmw6IHN0cmluZztcbiAgICBzY2hlbWU6IHN0cmluZztcbiAgICB0aWxlU2l6ZTogbnVtYmVyO1xuXG4gICAgYm91bmRzOiA/W251bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlcl07XG4gICAgdGlsZUJvdW5kczogVGlsZUJvdW5kcztcbiAgICByb3VuZFpvb206IGJvb2xlYW47XG4gICAgZGlzcGF0Y2hlcjogRGlzcGF0Y2hlcjtcbiAgICBtYXA6IE1hcDtcbiAgICB0aWxlczogQXJyYXk8c3RyaW5nPjtcblxuICAgIF9sb2FkZWQ6IGJvb2xlYW47XG4gICAgX29wdGlvbnM6IFJhc3RlclNvdXJjZVNwZWNpZmljYXRpb24gfCBSYXN0ZXJERU1Tb3VyY2VTcGVjaWZpY2F0aW9uO1xuXG4gICAgY29uc3RydWN0b3IoaWQ6IHN0cmluZywgb3B0aW9uczogUmFzdGVyU291cmNlU3BlY2lmaWNhdGlvbiB8IFJhc3RlckRFTVNvdXJjZVNwZWNpZmljYXRpb24sIGRpc3BhdGNoZXI6IERpc3BhdGNoZXIsIGV2ZW50ZWRQYXJlbnQ6IEV2ZW50ZWQpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xuICAgICAgICB0aGlzLmRpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xuICAgICAgICB0aGlzLnNldEV2ZW50ZWRQYXJlbnQoZXZlbnRlZFBhcmVudCk7XG5cbiAgICAgICAgdGhpcy50eXBlID0gJ2FyY2dpc3Jhc3Rlcic7XG4gICAgICAgIHRoaXMubWluem9vbSA9IDA7XG4gICAgICAgIHRoaXMubWF4em9vbSA9IDIyO1xuICAgICAgICB0aGlzLnJvdW5kWm9vbSA9IHRydWU7XG4gICAgICAgIHRoaXMudGlsZVNpemUgPSA1MTI7XG4gICAgICAgIHRoaXMuX2xvYWRlZCA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuX29wdGlvbnMgPSBleHRlbmQoe3R5cGU6ICdhcmNnaXNyYXN0ZXInfSwgb3B0aW9ucyk7XG4gICAgICAgIGV4dGVuZCh0aGlzLCBwaWNrKG9wdGlvbnMsIFsndXJsJywgJ3NjaGVtZScsICd0aWxlU2l6ZSddKSk7XG4gICAgfVxuXG4gICAgbG9hZCgpIHtcbiAgICAgICAgdGhpcy5fbG9hZGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZmlyZShuZXcgRXZlbnQoJ2RhdGFsb2FkaW5nJywge2RhdGFUeXBlOiAnc291cmNlJ30pKTtcbiAgICAgICAgbG9hZEFyY0dJU01hcFNlcnZlcih0aGlzLl9vcHRpb25zLCAoZXJyLCBtZXRhZGF0YSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fbG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZpcmUobmV3IEVycm9yRXZlbnQoZXJyKSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG1ldGFkYXRhKSB7XG4gICAgICAgICAgICAgICAgZXh0ZW5kKHRoaXMsIG1ldGFkYXRhKTtcblxuICAgICAgICAgICAgICAgIGlmIChtZXRhZGF0YS5ib3VuZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50aWxlQm91bmRzID0gbmV3IFRpbGVCb3VuZHMobWV0YWRhdGEuYm91bmRzLCB0aGlzLm1pbnpvb20sIHRoaXMubWF4em9vbSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gYGNvbnRlbnRgIGlzIGluY2x1ZGVkIGhlcmUgdG8gcHJldmVudCBhIHJhY2UgY29uZGl0aW9uIHdoZXJlIGBTdHlsZSNfdXBkYXRlU291cmNlc2AgaXMgY2FsbGVkXG4gICAgICAgICAgICAgICAgLy8gYmVmb3JlIHRoZSBUaWxlSlNPTiBhcnJpdmVzLiB0aGlzIG1ha2VzIHN1cmUgdGhlIHRpbGVzIG5lZWRlZCBhcmUgbG9hZGVkIG9uY2UgVGlsZUpTT04gYXJyaXZlc1xuICAgICAgICAgICAgICAgIC8vIHJlZjogaHR0cHM6Ly9naXRodWIuY29tL21hcGJveC9tYXBib3gtZ2wtanMvcHVsbC80MzQ3I2Rpc2N1c3Npb25fcjEwNDQxODA4OFxuICAgICAgICAgICAgICAgIHRoaXMuZmlyZShuZXcgRXZlbnQoJ2RhdGEnLCB7ZGF0YVR5cGU6ICdzb3VyY2UnLCBzb3VyY2VEYXRhVHlwZTogJ21ldGFkYXRhJ30pKTtcbiAgICAgICAgICAgICAgICB0aGlzLmZpcmUobmV3IEV2ZW50KCdkYXRhJywge2RhdGFUeXBlOiAnc291cmNlJywgc291cmNlRGF0YVR5cGU6ICdjb250ZW50J30pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgbG9hZGVkKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fbG9hZGVkO1xuICAgIH1cblxuICAgIG9uQWRkKG1hcDogTWFwKSB7XG4gICAgICAgIC8vIHNldCB0aGUgdXJsc1xuICAgICAgICBjb25zdCBiYXNlVXJsID0gdGhpcy51cmwuc3BsaXQoJz8nKVswXTtcbiAgICAgICAgdGhpcy50aWxlVXJsID0gYCR7YmFzZVVybH0vdGlsZS97en0ve3l9L3t4fWA7XG5cbiAgICAgICAgY29uc3QgYXJjZ2lzb25saW5lID0gbmV3IFJlZ0V4cCgvdGlsZXMuYXJjZ2lzKG9ubGluZSk/XFwuY29tL2cpO1xuICAgICAgICBpZiAoYXJjZ2lzb25saW5lLnRlc3QodGhpcy51cmwpKSB7XG4gICAgICAgICAgICB0aGlzLnRpbGVVcmwgPSB0aGlzLnRpbGVVcmwucmVwbGFjZSgnOi8vdGlsZXMnLCAnOi8vdGlsZXN7c30nKTtcbiAgICAgICAgICAgIHRoaXMuc3ViZG9tYWlucyA9IFsnMScsICcyJywgJzMnLCAnNCddO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMudG9rZW4pIHtcbiAgICAgICAgICAgIHRoaXMudGlsZVVybCArPSAoYD90b2tlbj0ke3RoaXMudG9rZW59YCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm1hcCA9IG1hcDtcbiAgICAgICAgdGhpcy5sb2FkKCk7XG4gICAgfVxuXG4gICAgb25SZW1vdmUoKSB7XG5cbiAgICB9XG5cbiAgICBzZXJpYWxpemUoKSB7XG4gICAgICAgIHJldHVybiBleHRlbmQoe30sIHRoaXMuX29wdGlvbnMpO1xuICAgIH1cblxuICAgIGhhc1RpbGUodGlsZUlEOiBPdmVyc2NhbGVkVGlsZUlEKSB7XG4gICAgICAgIHJldHVybiAhdGhpcy50aWxlQm91bmRzIHx8IHRoaXMudGlsZUJvdW5kcy5jb250YWlucyh0aWxlSUQuY2Fub25pY2FsKTtcbiAgICB9XG5cbiAgICBsb2FkVGlsZSh0aWxlOiBUaWxlLCBjYWxsYmFjazogQ2FsbGJhY2s8dm9pZD4pIHtcbiAgICAgICAgLy9jb252ZXJ0IHRvIGFncyBjb29yZHNcbiAgICAgICAgY29uc3QgdGlsZVBvaW50ID0geyB6OiB0aWxlLnRpbGVJRC5vdmVyc2NhbGVkWiwgeDogdGlsZS50aWxlSUQuY2Fub25pY2FsLngsIHk6IHRpbGUudGlsZUlELmNhbm9uaWNhbC55IH07XG5cbiAgICAgICAgY29uc3QgdXJsID0gIF90ZW1wbGF0ZSh0aGlzLnRpbGVVcmwsIGV4dGVuZCh7XG4gICAgICAgICAgICBzOiBfZ2V0U3ViZG9tYWluKHRpbGVQb2ludCwgdGhpcy5zdWJkb21haW5zKSxcbiAgICAgICAgICAgIHo6ICh0aGlzLl9sb2RNYXAgJiYgdGhpcy5fbG9kTWFwW3RpbGVQb2ludC56XSkgPyB0aGlzLl9sb2RNYXBbdGlsZVBvaW50LnpdIDogdGlsZVBvaW50LnosIC8vIHRyeSBsb2QgbWFwIGZpcnN0LCB0aGVuIGp1c3QgZGVmdWFsdCB0byB6b29tIGxldmVsXG4gICAgICAgICAgICB4OiB0aWxlUG9pbnQueCxcbiAgICAgICAgICAgIHk6IHRpbGVQb2ludC55XG4gICAgICAgIH0sIHRoaXMub3B0aW9ucykpO1xuICAgICAgICB0aWxlLnJlcXVlc3QgPSBnZXRJbWFnZSh7dXJsfSwgIChlcnIsIGltZykgPT4ge1xuICAgICAgICAgICAgZGVsZXRlIHRpbGUucmVxdWVzdDtcblxuICAgICAgICAgICAgaWYgKHRpbGUuYWJvcnRlZCkge1xuICAgICAgICAgICAgICAgIHRpbGUuc3RhdGUgPSAndW5sb2FkZWQnO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICB0aWxlLnN0YXRlID0gJ2Vycm9yZWQnO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGltZykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1hcC5fcmVmcmVzaEV4cGlyZWRUaWxlcykgdGlsZS5zZXRFeHBpcnlEYXRhKGltZyk7XG4gICAgICAgICAgICAgICAgZGVsZXRlIChpbWc6IGFueSkuY2FjaGVDb250cm9sO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSAoaW1nOiBhbnkpLmV4cGlyZXM7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBjb250ZXh0ID0gdGhpcy5tYXAucGFpbnRlci5jb250ZXh0O1xuICAgICAgICAgICAgICAgIGNvbnN0IGdsID0gY29udGV4dC5nbDtcbiAgICAgICAgICAgICAgICB0aWxlLnRleHR1cmUgPSB0aGlzLm1hcC5wYWludGVyLmdldFRpbGVUZXh0dXJlKGltZy53aWR0aCk7XG4gICAgICAgICAgICAgICAgaWYgKHRpbGUudGV4dHVyZSkge1xuICAgICAgICAgICAgICAgICAgICB0aWxlLnRleHR1cmUudXBkYXRlKGltZywge3VzZU1pcG1hcDogdHJ1ZX0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRpbGUudGV4dHVyZSA9IG5ldyBUZXh0dXJlKGNvbnRleHQsIGltZywgZ2wuUkdCQSwge3VzZU1pcG1hcDogdHJ1ZX0pO1xuICAgICAgICAgICAgICAgICAgICB0aWxlLnRleHR1cmUuYmluZChnbC5MSU5FQVIsIGdsLkNMQU1QX1RPX0VER0UsIGdsLkxJTkVBUl9NSVBNQVBfTkVBUkVTVCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnRleHQuZXh0VGV4dHVyZUZpbHRlckFuaXNvdHJvcGljKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJmKGdsLlRFWFRVUkVfMkQsIGNvbnRleHQuZXh0VGV4dHVyZUZpbHRlckFuaXNvdHJvcGljLlRFWFRVUkVfTUFYX0FOSVNPVFJPUFlfRVhULCBjb250ZXh0LmV4dFRleHR1cmVGaWx0ZXJBbmlzb3Ryb3BpY01heCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aWxlLnN0YXRlID0gJ2xvYWRlZCc7XG5cbiAgICAgICAgICAgICAgICBjYWNoZUVudHJ5UG9zc2libHlBZGRlZCh0aGlzLmRpc3BhdGNoZXIpO1xuXG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFib3J0VGlsZSh0aWxlOiBUaWxlLCBjYWxsYmFjazogQ2FsbGJhY2s8dm9pZD4pIHtcbiAgICAgICAgaWYgKHRpbGUucmVxdWVzdCkge1xuICAgICAgICAgICAgdGlsZS5yZXF1ZXN0LmNhbmNlbCgpO1xuICAgICAgICAgICAgZGVsZXRlIHRpbGUucmVxdWVzdDtcbiAgICAgICAgfVxuICAgICAgICBjYWxsYmFjaygpO1xuICAgIH1cblxuICAgIHVubG9hZFRpbGUodGlsZTogVGlsZSwgY2FsbGJhY2s6IENhbGxiYWNrPHZvaWQ+KSB7XG4gICAgICAgIGlmICh0aWxlLnRleHR1cmUpIHRoaXMubWFwLnBhaW50ZXIuc2F2ZVRpbGVUZXh0dXJlKHRpbGUudGV4dHVyZSk7XG4gICAgICAgIGNhbGxiYWNrKCk7XG4gICAgfVxuXG4gICAgaGFzVHJhbnNpdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQXJjR0lTVGlsZWRNYXBTZXJ2aWNlU291cmNlO1xuIl0sIm5hbWVzIjpbImxldCIsImNvbnN0IiwiVW5pdEJlemllciIsIndpbmRvdyIsImV4cG9ydGVkIiwiYnJvd3NlciIsIndlYnBTdXBwb3J0ZWQiLCJ2ZXJzaW9uIiwidXVpZCIsInNka1ZlcnNpb24iLCJ0aGlzIiwic3VwZXIiLCJsaXN0ZW5lciIsIlNwaGVyaWNhbE1lcmNhdG9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBNEJBLGNBQWMsR0FBRyxVQUFVLENBQUM7O0FBRTVCLFNBQVMsVUFBVSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRTs7SUFFcEMsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0lBQ3BCLElBQUksQ0FBQyxFQUFFLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO0lBQ3RDLElBQUksQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQzs7SUFFbEMsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0lBQ3BCLElBQUksQ0FBQyxFQUFFLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxJ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QUUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTs7Ozs7Ozs7SUFRbkUsSUFBSSxLQUFLLFNBQVMsQ0FBQyxFQUFFLEVBQUUsT0FBTyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7Ozs7Ozs7O0lBUXRELEdBQUcsTUFBTSxTQUFTLENBQUMsRUFBRSxFQUFFLE9BQU8sSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFOzs7Ozs7OztJQVFyRCxNQUFNLEdBQUcsU0FBUyxDQUFDLEVBQUUsRUFBRSxPQUFPLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTs7Ozs7Ozs7O0lBU3hELFlBQVksR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxPQUFPLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7Ozs7Ozs7SUFPeEUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxFQUFFLEVBQUUsT0FBTyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7Ozs7Ozs7OztJQVN6RCxJQUFJLEtBQUssV0FBVyxFQUFFLE9BQU8sSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUU7Ozs7Ozs7O0lBUXBELElBQUksS0FBSyxXQUFXLEVBQUUsT0FBTyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRTs7Ozs7OztJQU9wRCxLQUFLLElBQUksV0FBVyxFQUFFLE9BQU8sSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUU7Ozs7Ozs7O0lBUXJELEdBQUcsRUFBRSxXQUFXO1FBQ1osT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcs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LElBQUksQ0FBQyxDQUFDO1FBQ1osSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDWixPQUFPLElBQUksQ0FBQztLQUNmOztJQUVELElBQUksRUFBRSxTQUFTLENBQUMsRUFBRTtRQUNkLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ1osSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDWixPQUFPLElBQUksQ0FBQztLQUNmOztJQUVELFlBQVksRUFBRSxTQUFTLENBQUMsRUFBRTtRQUN0QixJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDZCxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDZCxPQUFPLElBQUksQ0FBQztLQUNmOztJQUVELFdBQVcsRUFBRSxTQUFTLENBQUMsRUFBRTtRQUNyQixJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDZCxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDZCxPQUFPLElBQUksQ0FBQztLQUNmOztJQUVELEtBQUssRUFBRSxXQUFXO1FBQ2QsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUN0QixPQUFPLElBQUksQ0FBQztLQUNmOztJQUVELEtBQUssRUFBRSxXQUFXO1FBQ2QsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNmLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNoQixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ1osT0FBTyxJQUFJLENBQUM7S0FDZjs7SUFFRCxPQUFPLEVBQUUsU0FBUyxLQUFLLEVBQUU7UUFDckIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUM7WUFDckIsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDO1lB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QUksQ0FBQyxFQUFFO0lBQ2pCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDekMsSUFBSSxFQUFFLElBQUksSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDO0lBQ3RCLElBQUksRUFBRSxJQUFJLElBQUksSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDaEMsSUFBSSxFQUFFLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQztJQUNsQixJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUM7SUFDM0IsSUFBSSxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQztJQUM1QixJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDN0QsT0FBTyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztHQUNuQixNQUFNO0lBQ0wsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNuRCxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbEQsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzdELE9BQU8sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7R0FDbkI7Q0FDRixDQUFDOzs7Ozs7Ozs7O0FBVUYsaUJBQWlCLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxTQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUU7O0lBRXBFLElBQUksU0FBUyxFQUFFO1FBQ1gsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNuQzs7SUFFRCxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzs7SUFFL0MsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDL0MsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7OztJQUd2RCxJQUFJLEdBQUcsS0FBSyxRQUFRLEVBQUU7UUFDbEIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztLQUN2QyxNQUFNO1FBQ0gsT0FBTyxJQUFJLENBQUM7S0FDZjtDQUNKLENBQUM7Ozs7Ozs7OztBQVNGLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUcsU0FBUyxJQUFJLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUU7O0lBRW5FLElBQUksR0FBRyxLQUFLLFFBQVEsRUFBRTtRQUNsQixJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDdEM7O0lBRUQsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDNUIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDNUIsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDOUIsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7O0lBRTlCLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO0lBQ3JGLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO0lBQ3JGLElBQUksTUFBTSxHQUFHO1FBQ1QsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7UUFDL0QsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7UUFDL0QsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7UUFDN0IsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7S0FDaEMsQ0FBQztJQUNGLElBQUksU0FBUyxFQUFFO1FBQ1gsSUFBSSxHQUFHLEdBQUc7WUFDTixJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksTUFBTSxDQUFDLElBQUk7WUFDM0MsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJO1NBQzlDLENBQUM7UUFDRixNQUFNLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7UUFDdkIsTUFBTSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO0tBQzFCO0lBQ0QsT0FBTyxNQUFNLENBQUM7Q0FDakIsQ0FBQzs7Ozs7Ozs7QUFRRixpQkFBaUIsQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFNBQVMsSUFBSSxFQUFFLEVBQUUsRUFBRTtJQUNyRCxJQUFJLEVBQUUsS0FBSyxRQUFRLEVBQUU7UUFDakIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFP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
