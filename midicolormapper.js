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

    // Default parameters per MIDI channel
    var _defaults = {
        noteMin: 0x00, // 0x00..0x7F
        noteMax: 0x7F, // 0x00..0x7F
        mapper: Mappers.COLOR_MAP,
        noteColorMap: MidiNoteColors.Maps.NEWTON_1704,
        fixedHue: 0x00, // 0x00..0xFF
        ignoreVelocity: true,
    };

    // Constructor
    function MidiColorMapper() {
        this._parameters = new Array(16);
        for (var i=16; i--;)
            this.reset(i);
    }

    // Prototype shortcut
    var proto = MidiColorMapper.prototype;

    // Get the minimum note value for a MIDI channel
    proto.getNoteMin = function (channel) {
        return this._parameters[channel & 0xF].noteMin;
    }

    // Set the minimum note value for a MIDI channel
    proto.setNoteMin = function (channel, noteMin) {
        this._parameters[channel & 0xF].noteMin = noteMin;
    }

    // Get the maximum note value for a MIDI channel
    proto.getNoteMax = function (channel) {
        return this._parameters[channel & 0xF].noteMax;
    }

    // Set the maximum note value for a MIDI channel
    proto.setNoteMax = function (channel, noteMax) {
        this._parameters[channel & 0xF].noteMax = noteMax;
    }

    // Get the active color mapper for a MIDI channel
    proto.getMapper = function (channel) {
        return this._parameters[channel & 0xF].mapper;
    }

    // Set the active color mapper to use for a MIDI channel
    proto.setMapper = function (channel, mapper) {
        this._parameters[channel & 0xF].mapper = mapper;
    }

    // Get the active note color map for a MIDI channel
    proto.getNoteColorMap = function (channel) {
        return this._parameters[channel & 0xF].noteColorMap;
    }

    // Set the active note color map to use for a MIDI channel
    proto.setNoteColorMap = function (channel, noteColorMap) {
        this._parameters[channel & 0xF].noteColorMap = noteColorMap;
    }

    // Get the active fixed color hue for a MIDI channel
    proto.getFixedHue = function (channel) {
        return this._parameters[channel & 0xF].fixedHue;
    }

    // Set the active fixed color hue to use for a MIDI channel
    proto.setFixedHue = function (channel, fixedHue) {
        this._parameters[channel & 0xF].fixedHue = fixedHue;
    }

    // Get the active velocity ignoring state for a MIDI channel
    proto.isIgnoreVelocity = function (channel) {
        return this._parameters[channel & 0xF].ignoreVelocity;
    }

    // Set the active velocity ignoring state for a MIDI channel
    proto.setIgnoreVelocity = function (channel, state) {
        this._parameters[channel & 0xF].ignoreVelocity = state;
    }

    // Map a MIDI note message to an HSV color
    proto.map = function (channel, note, velocity) {
        var p = this._parameters[channel & 0xF];
        var _velocity = p.ignoreVelocity ? 0x7F : velocity;
        switch (p.mapper) {
            case Mappers.COLOR_MAP: // Use Midi Note Color maps
                var noteColor = MidiNoteColors.get(p.noteColorMap, note);
                return [noteColor[0], noteColor[1], Math.round((_velocity / 0x7F) * noteColor[2])];
            case Mappers.RAINBOW: // Generate rainbow-like colors
                return [
                    Math.round((note - p.noteMin) * (0xFF / (p.noteMax - p.noteMin + 1))),
                    0xFF, Math.round((_velocity / 0x7F) * 0xFF)
                ];
                break;
            case Mappers.FIXED_COLOR: // Fixed color mapping
                return [p.fixedHue, 0xFF, Math.round((_velocity / 0x7F) * 0xFF)];
        }
        return undefined;
    }

    // Reset parameters values to defaults for a MIDI channel
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
