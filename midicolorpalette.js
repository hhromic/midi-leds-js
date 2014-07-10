/**
 * MidiColorPalette v1.0 - A very simple MIDI notes color palette for JavaScript.
 * Hugo Hromic - http://github.com/hhromic
 * MIT license
 */
/*jslint nomen: true*/

(function () {
    'use strict';

    // Available palettes
    var Palettes = {
        COLOR_MAP: 0,
        RAINBOW: 1,
        FIXED_HUE: 2,
    };

    // Available note color maps
    var Maps = {
        AEPPLI_1940: 0,
        BELMONT_1944: 1,
        BERTRAND_1734: 2,
        BISHOP_1893: 3,
        FIELD_1816: 4,
        HELMHOLTZ_1910: 5,
        JAMESON_1844: 6,
        KLEIN_1930: 7,
        NEWTON_1704: 8,
        RIMINGTON_1893: 9,
        SCRIABIN_1911: 10,
        SEEMANN_1881: 11,
        ZIEVERINK_2004: 12,
    };

    // Note color maps data for (13 color maps x 12 notes)
    var _colorData = [
        [[0, 245, 250], [10, 240, 250], [20, 238, 248], [32, 209, 248], [42, 192, 245], [69, 232, 220], [96, 220, 143], [122, 207, 145], [136, 209, 156], [150, 209, 161], [194, 227, 125], [214, 240, 125]], // aeppli1940
        [[0, 245, 250], [9, 238, 245], [20, 238, 248], [35, 235, 248], [42, 192, 245], [51, 192, 225], [96, 220, 143], [122, 207, 145], [176, 230, 130], [222, 225, 168], [231, 232, 217], [240, 235, 174]], // belmont1944
        [[176, 230, 130], [122, 207, 145], [96, 220, 143], [56, 189, 145], [42, 192, 245], [34, 192, 245], [20, 238, 248], [0, 245, 250], [0, 240, 158], [231, 232, 217], [194, 227, 125], [214, 240, 125]], // bertrand1734
        [[0, 245, 250], [0, 240, 158], [20, 238, 248], [35, 235, 248], [42, 192, 245], [51, 192, 225], [96, 220, 143], [115, 197, 166], [214, 240, 125], [231, 232, 217], [243, 225, 215], [0, 245, 250]], // bishop1893
        [[176, 230, 130], [196, 235, 133], [214, 240, 125], [236, 245, 192], [0, 245, 250], [20, 238, 248], [32, 209, 248], [42, 192, 245], [49, 220, 220], [56, 189, 145], [76, 207, 151], [96, 220, 143]], // field1816
        [[42, 192, 245], [96, 220, 143], [122, 207, 145], [150, 209, 161], [214, 240, 125], [231, 232, 217], [234, 232, 161], [0, 245, 250], [7, 243, 209], [7, 243, 209], [5, 240, 248], [19, 240, 243]], // helmholtz1910
        [[0, 245, 250], [9, 238, 245], [20, 238, 248], [34, 192, 245], [42, 192, 245], [96, 220, 143], [122, 207, 145], [176, 230, 130], [194, 227, 125], [214, 240, 125], [222, 225, 168], [231, 232, 217]], // jameson1844
        [[0, 243, 194], [0, 245, 250], [9, 238, 245], [20, 238, 248], [42, 192, 245], [51, 192, 225], [96, 220, 143], [122, 207, 145], [176, 230, 130], [207, 209, 135], [231, 232, 217], [234, 232, 161]], // klein1930
        [[0, 245, 250], [10, 240, 250], [20, 238, 248], [32, 209, 248], [42, 192, 245], [96, 220, 143], [136, 227, 143], [176, 230, 130], [196, 235, 133], [214, 240, 125], [223, 238, 176], [231, 232, 217]], // newton1704
        [[0, 245, 250], [0, 240, 158], [9, 238, 245], [20, 238, 248], [42, 192, 245], [56, 189, 145], [96, 220, 143], [115, 197, 166], [122, 207, 145], [214, 240, 125], [176, 230, 130], [231, 232, 217]], // rimington1893
        [[0, 245, 250], [231, 232, 217], [42, 192, 245], [174, 89, 133], [150, 209, 161], [0, 240, 158], [176, 230, 130], [20, 238, 248], [214, 240, 125], [96, 220, 143], [174, 89, 133], [150, 209, 161]], // scriabin1911
        [[0, 186, 104], [0, 245, 250], [20, 238, 248], [34, 192, 245], [42, 192, 245], [96, 220, 143], [122, 207, 145], [176, 230, 130], [214, 240, 125], [231, 232, 217], [0, 186, 104], [0, 0, 7]], // seemann1881
        [[51, 192, 225], [96, 220, 143], [122, 207, 145], [176, 230, 130], [214, 240, 125], [231, 232, 217], [231, 225, 110], [0, 240, 158], [0, 245, 250], [20, 238, 248], [44, 110, 240], [42, 192, 245]], // zieverink2004
    ];

    // Default parameters per MIDI channel
    var _defaults = {
        noteMin: 0x00, // 0x00..0x7F
        noteMax: 0x7F, // 0x00..0x7F
        palette: Palettes.COLOR_MAP,
        map: Maps.NEWTON_1704,
        fixedHue: 0x00, // 0x00..0xFF
        ignoreVelocity: true,
    };

    // Constructor
    function MidiColorPalette() {
        this._parameters = new Array(16);
        for (var i=16; i--;)
            this.reset(i);
    }

    // Prototype shortcut
    var proto = MidiColorPalette.prototype;

    // Get the minimum note value for a MIDI channel
    proto.getNoteMin = function (channel) {
        return this._parameters[channel & 0xF].noteMin;
    }

    // Set the minimum note value for a MIDI channel
    proto.setNoteMin = function (channel, noteMin) {
        this._parameters[channel & 0xF].noteMin = noteMin & 0x7F;
    }

    // Get the maximum note value for a MIDI channel
    proto.getNoteMax = function (channel) {
        return this._parameters[channel & 0xF].noteMax;
    }

    // Set the maximum note value for a MIDI channel
    proto.setNoteMax = function (channel, noteMax) {
        this._parameters[channel & 0xF].noteMax = noteMax & 0x7F;
    }

    // Get the active color palette for a MIDI channel
    proto.getPalette = function (channel) {
        return this._parameters[channel & 0xF].palette;
    }

    // Set the active color palette to use for a MIDI channel
    proto.setPalette = function (channel, palette) {
        this._parameters[channel & 0xF].palette = palette;
    }

    // Get the active note color map for a MIDI channel
    proto.getMap = function (channel) {
        return this._parameters[channel & 0xF].map;
    }

    // Set the active note color map to use for a MIDI channel
    proto.setMap = function (channel, map) {
        this._parameters[channel & 0xF].map = map;
    }

    // Get the active fixed color hue for a MIDI channel
    proto.getFixedHue = function (channel) {
        return this._parameters[channel & 0xF].fixedHue;
    }

    // Set the active fixed color hue to use for a MIDI channel
    proto.setFixedHue = function (channel, fixedHue) {
        this._parameters[channel & 0xF].fixedHue = fixedHue & 0xFF;
    }

    // Get the active velocity ignoring state for a MIDI channel
    proto.isIgnoreVelocity = function (channel) {
        return this._parameters[channel & 0xF].ignoreVelocity;
    }

    // Set the active velocity ignoring state for a MIDI channel
    proto.setIgnoreVelocity = function (channel, state) {
        this._parameters[channel & 0xF].ignoreVelocity = state;
    }

    // Get color for MIDI channel, note and velocity using active palette
    proto.get = function (channel, note, velocity) {
        var p = this._parameters[channel & 0xF];
        if (note < p.noteMin || note > p.noteMax)
            return undefined;
        var _velocity = p.ignoreVelocity ? 0x7F : velocity & 0x7F;
        switch (p.palette) {
            case Palettes.COLOR_MAP:
                var noteColor = _colorData[p.map][(note & 0x7F) % 12];
                return [
                    noteColor[0],
                    noteColor[1],
                    Math.round((_velocity / 0x7F) * noteColor[2])
                ];
            case Palettes.RAINBOW:
                return [
                    Math.round(((note & 0x7F) - p.noteMin) * (0xFF / (p.noteMax - p.noteMin + 1))),
                    0xFF,
                    Math.round((_velocity / 0x7F) * 0xFF)
                ];
            case Palettes.FIXED_HUE:
                return [
                    p.fixedHue,
                    0xFF,
                    Math.round((_velocity / 0x7F) * 0xFF)
                ];
        }
        return undefined;
    }

    // Reset parameters values to defaults for a MIDI channel
    proto.reset = function (channel) {
        this._parameters[channel & 0xF] = Object.create(_defaults);
    }

    // Expose palettes
    MidiColorPalette.Palettes = Palettes;

    // Expose color maps
    MidiColorPalette.Maps = Maps;

    // Expose either via AMD, CommonJS or the global object
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return MidiColorPalette;
        });
    }
    else if (typeof module === 'object' && module.exports) {
        module.exports = MidiColorPalette;
    }
    else {
        this.MidiColorPalette = MidiColorPalette;
    }
}.call(this));
