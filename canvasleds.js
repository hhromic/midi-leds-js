/**
 * CanvasLeds v1.0 - A very simple LEDs display based on HTML5 canvas.
 * Hugo Hromic - http://github.com/hhromic
 * MIT license
 */
/*jslint nomen: true*/

(function () {
    'use strict';

    // Constructor (provide Uint32Array 'leds' for better performance)
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
    }

    // Prototype shortcut
    var proto = CanvasLeds.prototype;

    // Convert HSV (8-bits) to RGB
    // Taken (& adapted) from: http://stackoverflow.com/a/17243070
    proto._hsv8ToRgb = function (hsv8) {
        var h, s, v, r, g, b, i, f, p, q, t;
        h = hsv8[0] / 0xFF, s = hsv8[1] / 0xFF, v = hsv8[2] / 0xFF;
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
        return [Math.floor(r * 0xFF), Math.floor(g * 0xFF), Math.floor(b * 0xFF)];
    }

    // Paint LEDs state into the canvas
    proto.show = function () {
        for (var i=this._leds.length; i--;) {
            var led = this._leds[i];
            if (((led >> 24) & 0xFF) == 0x00) { // led should be painted?
                var rgb = this._hsv8ToRgb([(led >> 16) & 0xFF, (led >> 8) & 0xFF, led & 0xFF]);
                this._canvas.ctx.fillStyle = 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
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
