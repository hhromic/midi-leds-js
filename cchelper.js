/**
 * CCHelper v1.0 - https://github.com/hhromic/midi-leds-js
 * A MIDI Control Change (CC) helper for the MidiLeds and MidiColors classes.
 * MIT license
 * Hugo Hromic - http://github.com/hhromic
/*jslint nomen: true*/

;(function () {
    'use strict';

    /**
     * Represents a MIDI CC helper.
     *
     * @public
     * @constructor
     * @param {object} midiLeds - the MidiLeds class instance to manipulate.
     * @param {object} midiColors - the MidiColors class instance to manipulate.
     */
    function CCHelper(midiLeds, midiColors) {
        this._midiLeds = midiLeds;
        this._midiColors = midiColors;
        this._timeRange = 5000;
    }

    // Shortcuts to improve speed and size
    var proto = CCHelper.prototype;

    /**
     * Gets the current time range to use for scaling times.
     *
     * @public
     * @returns {number} - the current time range.
     */
    proto.getTimeRange = function () {
        return this._timeRange;
    }

    /**
     * Sets the time range to use for scaling times.
     *
     * @public
     * @param {number} timeRange - the time range to set.
     */
    proto.setTimeRange = function (timeRange) {
        this._timeRange = timeRange;
    }

    /**
     * Processes a MIDI Control Change (CC) message.
     *
     * @param {number} channel - the channel of the CC message.
     * @param {number} control - the control number of the CC message.
     * @param {number} value - the control value of the CC message.
     */
    proto.controlChange = function (channel, control, value) {
        var _channel = channel & 0xF;
        var _value = value & 0x7F;
        switch (control & 0x7F) {
            case 0x14: // Change Palette
                this._midiColors.setPalette(_channel, _value);
                return;
            case 0x15: // Change Color Map
                this._midiColors.setColorMap(_channel, _value);
                return;
            case 0x16: // Change Fixed Hue
                this._midiColors.setFixedHue(_channel, Math.round(0xFF * (_value / 0x7F)));
                return;
            case 0x17: // Change Attack Time
                this._midiLeds.setAttackTime(_channel, Math.round(this._timeRange * (_value / 0x7F)));
                return;
            case 0x18: // Change Decay Time
                this._midiLeds.setDecayTime(_channel, Math.round(this._timeRange * (_value / 0x7F)));
                return;
            case 0x19: // Change Sustain Level
                this._midiLeds.setSustainLevel(_channel, 1.0 * (_value / 0x7F));
                return;
            case 0x1A: // Change Release Time
                this._midiLeds.setReleaseTime(_channel, Math.round(this._timeRange * (_value / 0x7F)));
                return;
            case 0x1B: // Change Ignore Velocity
                this._midiColors.setIgnoreVelocity(_channel, _value < 0x40 ? false : true);
                return;
            case 0x1C: // Change Base Brightness
                this._midiLeds.setBaseBrightness(_channel, _value);
                return;
            case 0x1D: // Change Enabled State
                this._midiLeds.setEnabled(_channel, _value < 0x40 ? false : true);
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
