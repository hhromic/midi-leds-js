/**
 * MidiColorMapper v1.0 - A very simple MIDI notes color mapper for JavaScript.
 * Hugo Hromic - http://github.com/hhromic
 * MIT license
 *
 * Depends: midinotecolors.js
 */
/*jslint nomen: true*/

(function () {
    'use strict';

    // Available color mappers
    var Mappers = {
        COLOR_MAP: 0,
        RAINBOW: 1,
        FIXED_COLOR: 2,
    };

    // Default parameters
    var _defaults = {
        mapper: Mappers.COLOR_MAP,
        noteColorMap: MidiNoteColors.Maps.NEWTON_1704,
        fixedHue: 0x00,
        ignoreVelocity: true,
    };

    // Constructor
    function MidiColorMapper(noteMin, noteMax) {
        this._noteMin = noteMin;
        this._noteMax = noteMax;
        this._parameters = new Array(16);
        for (var i=16; i--;)
            this.reset(i);
    }

    // Prototype shortcut
    var proto = MidiColorMapper.prototype;

    // Set the active color mapper to use
    proto.setMapper = function (channel, mapper) {
        this._parameters[channel & 0xF].mapper = mapper;
    }

    // Get the active color mapper
    proto.getMapper = function (channel) {
        return this._parameters[channel & 0xF].mapper;
    }

    // Set the active note color map to use
    proto.setNoteColorMap = function (channel, noteColorMap) {
        this._parameters[channel & 0xF].noteColorMap = noteColorMap;
    }

    // Get the active note color map
    proto.getNoteColorMap = function (channel) {
        return this._parameters[channel & 0xF].noteColorMap;
    }

    // Set the active fixed color hue to use
    proto.setFixedHue = function (channel, fixedHue) {
        this._parameters[channel & 0xF].fixedHue = fixedHue;
    }

    // Get the active fixed color hue
    proto.getFixedHue = function (channel) {
        return this._parameters[channel & 0xF].fixedHue;
    }

    // Set the active velocity ignoring state
    proto.setIgnoreVelocity = function (channel, state) {
        this._parameters[channel & 0xF].ignoreVelocity = state;
    }

    // Get the active velocity ignoring state
    proto.isIgnoreVelocity = function (channel) {
        return this._parameters[channel & 0xF].ignoreVelocity;
    }

    // Map a MIDI note to an HSV color
    proto.map = function (channel, note, velocity) {
        var parameters = this._parameters[channel & 0xF];
        var _velocity = parameters.ignoreVelocity ? 0x7F : velocity;
        switch (parameters.mapper) {
            case Mappers.COLOR_MAP: // Use Midi Note Color maps
                var noteColor = MidiNoteColors.get(parameters.noteColorMap, note);
                return [noteColor[0], noteColor[1], Math.round((_velocity / 0x7F) * noteColor[2])];
            case Mappers.RAINBOW: // Generate rainbow-like colors
                return [
                    Math.round((note - this._noteMin) * (0xFF / (this._noteMax - this._noteMin + 1))),
                    0xFF, Math.round((_velocity / 0x7F) * 0xFF)
                ];
                break;
            case Mappers.FIXED_COLOR: // Fixed color mapping
                return [parameters.fixedHue, 0xFF, Math.round((_velocity / 0x7F) * 0xFF)];
        }
        return undefined;
    }

    // Reset parameters values to defaults
    proto.reset = function (channel) {
        this._parameters[channel & 0xF] = Object.create(_defaults);
    }

    // Expose color mappers
    MidiColorMapper.Mappers = Mappers;

    // Expose either via AMD, CommonJS or the global object
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return MidiColorMapper;
        });
    }
    else if (typeof module === 'object' && module.exports) {
        module.exports = MidiColorMapper;
    }
    else {
        this.MidiColorMapper = MidiColorMapper;
    }
}.call(this));
