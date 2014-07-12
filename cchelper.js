/**
 * CCHelper v1.0 - A MIDI Control Change (CC) helper for the MidiLeds and MidiColors classes.
 * Hugo Hromic - http://github.com/hhromic
 * MIT license
 *
 * Depends: midileds.js, midicolors.js
 */
/*jslint nomen: true*/

(function () {
    'use strict';

    // Constructor
    function CCHelper(midiLeds, midiColors) {
        this._midiLeds = midiLeds;
        this._midiColors = midiColors;
        this._timeRange = 5000;
    }

    // Prototype shortcut
    var proto = CCHelper.prototype;

    // Get the time range to use for scaling times
    proto.getTimeRange = function () {
        return this._timeRange;
    }

    // Set the time range to use for scaling times
    proto.setTimeRange = function (timeRange) {
        this._timeRange = timeRange;
    }

    // Process a MIDI Control Change (CC) message
    proto.controlChange = function (channel, control, value) {
        switch (control) {
            case 0x14: // Change Palette
                this._midiColors.setPalette(channel, value);
                return;
            case 0x15: // Change Color Map
                this._midiColors.setColorMap(channel, value);
                return;
            case 0x16: // Change Fixed Hue
                this._midiColors.setFixedHue(channel, Math.round(0xFF * (value / 0x7F)));
                return;
            case 0x17: // Change Attack Time
                this._midiLeds.setAttackTime(channel, Math.round(this._timeRange * (value / 0x7F)));
                return;
            case 0x18: // Change Decay Time
                this._midiLeds.setDecayTime(channel, Math.round(this._timeRange * (value / 0x7F)));
                return;
            case 0x19: // Change Sustain Level
                this._midiLeds.setSustainLevel(channel, 1.0 * (value / 0x7F));
                return;
            case 0x1A: // Change Release Time
                this._midiLeds.setReleaseTime(channel, Math.round(this._timeRange * (value / 0x7F)));
                return;
            case 0x1B: // Change Ignore Velocity
                this._midiColors.setIgnoreVelocity(channel, value < 0x40 ? false : true);
                return;
            case 0x1C: // Change Base Brightness
                this._midiLeds.setBaseBrightness(channel, value);
                return;
            case 0x1D: // Change Enabled State
                this._midiLeds.setEnabled(channel, value < 0x40 ? false : true);
                return;
        }
    }

    // Expose either via AMD, CommonJS or the global object
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return CCHelper;
        });
    }
    else if (typeof module === 'object' && module.exports) {
        module.exports = CCHelper;
    }
    else {
        this.CCHelper = CCHelper;
    }
}.call(this));
