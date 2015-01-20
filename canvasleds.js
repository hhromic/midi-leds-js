/**
 * CanvasLeds v1.0 - https://github.com/hhromic/midi-leds-js
 * A very simple LEDs display based on HTML5 canvas.
 * Hugo Hromic - http://github.com/hhromic
 * MIT license
 */
/*jslint nomen: true*/

;(function () {
    'use strict';

    /**
     * Represents a canvas LEDs display.
     *
     * A DOM container is needed to place the canvas element, a 'div' element is recommended.
     * Each LED in the buffer array is represented in HSV (Hue-Saturation-Value) format.
     * The buffer array for the LEDs HSV data uses the first 24 bits (3 bits for each channel).
     * The canvas is sized according to the number of LEDs in the buffer array and the container.
     *
     * @public
     * @constructor
     * @param {object} container - a DOM container to append the canvas element into.
     * @param {Uint32Array} leds - an array with the LEDs HSV data buffer to display.
     */
    function CanvasLeds(container, leds) {
        var canvas = document.createElement('canvas');
        canvas.setAttribute('width', Math.floor(container.offsetWidth / leds.length) * leds.length);
        canvas.setAttribute('height', container.offsetHeight);
        container.appendChild(canvas);
        this._canvas = {
            ledWidth: canvas.getAttribute('width') / leds.length,
            ledHeight: canvas.getAttribute('height') / 1,
            ctx: canvas.getContext('2d')
        };
        this._leds = leds;

        // Buffer variables for computing HSV->RGB conversion
        this._hsv8 = new Uint8Array(3);
        this._rgb8 = new Uint8Array(3);
    }

    // Shortcuts to improve speed and size
    var proto = CanvasLeds.prototype;

    /**
     * Converts HSV values to RGB values (8 bits/channel) using internal buffer variables.
     * Taken (& adapted) from: http://stackoverflow.com/a/17243070
     *
     * @private
     */
    proto._hsv8ToRgb8 = function () {
        var h, s, v, r, g, b, i, f, p, q, t;
        h = this._hsv8[0] / 0xFF, s = this._hsv8[1] / 0xFF, v = this._hsv8[2] / 0xFF;
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }
        this._rgb8[0] = Math.floor(r * 0xFF);
        this._rgb8[1] = Math.floor(g * 0xFF);
        this._rgb8[2] = Math.floor(b * 0xFF);
    }

    /**
     * Paints the state of the LEDs buffer array into the canvas.
     *
     * @public
     */
    proto.show = function () {
        for (var i=this._leds.length; i--;) {
            var led = this._leds[i];
            if (((led >> 24) & 0xFF) == 0x00) { // led should be painted?
                this._hsv8[0] = (led >> 16) & 0xFF;
                this._hsv8[1] = (led >> 8) & 0xFF;
                this._hsv8[2] = led & 0xFF;
                this._hsv8ToRgb8();
                this._canvas.ctx.fillStyle = 'rgb(' + this._rgb8[0] + ',' +
                    this._rgb8[1] + ',' + this._rgb8[2] + ')';
                this._canvas.ctx.fillRect(this._canvas.ledWidth * i, 0,
                    this._canvas.ledWidth - 1, this._canvas.ledHeight);
                this._leds[i] |= 0xFF000000; // mark led as painted
            }
        }
    }

    // Expose either via AMD, CommonJS or the global object
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return CanvasLeds;
        });
    }
    else if (typeof module === 'object' && module.exports) {
        module.exports = CanvasLeds;
    }
    else {
        this.CanvasLeds = CanvasLeds;
    }
}.call(this));
