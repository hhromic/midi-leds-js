/**
 * MidiLeds v1.0 - An ADSR-based polyphonic MIDI LEDs display for JavaScript.
 * Hugo Hromic - http://github.com/hhromic
 * MIT license
 *
 * Depends: adsrenvelope.js, midicolormapper.js
 */
/*jslint nomen: true*/

(function () {
    'use strict';

    // Default parameters
    var _defaults = {
        attackTime: 80, // in milliseconds
        decayTime: 3000, // in milliseconds
        sustainLevel: 0.0, // 0..1 (float)
        releaseTime: 400, // in milliseconds
        baseBrightness: 0x00, // 0x00..0xFF
    };

    // Get a voice to use for new note
    function _getVoice (instance, channel, note) {
        var oldest = undefined;
        var idle = undefined;
        for (var i=instance._numVoices; i--;) {
            var voice = instance._voices[i];
            if (voice.channel == channel && voice.note == note)
                return voice;
            if (idle === undefined && voice.adsrEnvelope.isIdle())
                idle = voice;
            if (oldest === undefined || voice.age > oldest.age)
                oldest = voice;
        }
        return idle !== undefined ? idle : oldest;
    }

    // Find a running voice corresponding to the given channel and note, undefined if not found
    function _findVoice (instance, channel, note) {
        for (var i=instance._numVoices; i--;) {
            var voice = instance._voices[i];
            if (voice.channel == channel && voice.note == note && !voice.adsrEnvelope.isIdle())
                return voice;
        }
        return undefined;
    }

    // Constructor (provide Uint32Array leds for better performance)
    function MidiLeds (leds, noteMin, noteMax, numVoices, midiColorMapper) {
        this._leds = leds;
        this._noteMin = noteMin & 0x7F;
        this._noteMax = noteMax & 0x7F;
        this._numVoices = numVoices;
        this._midiColorMapper = midiColorMapper;

        // Initialise voices
        this._voices = new Array(numVoices);
        for (var i=numVoices; i--;)
            this._voices[i] = {
                channel: 0x0,
                note: 0x0,
                hsv8: [0x00, 0x00, 0x00],
                adsrEnvelope: new AdsrEnvelope(),
                age: 0,
            };
        this._activeVoices = 0;

        // Initialise parameters
        this._parameters = new Array(16);
        for (var i=16; i--;)
            this.reset(i);
    }

    // Prototype shortcut
    var proto = MidiLeds.prototype;

    // Set attack time of a given channel
    proto.setAttackTime = function (channel, attackTime) {
        this._parameters[channel & 0xF].attackTime = attackTime;
    }

    // Get attack time of a given channel
    proto.getAttackTime = function (channel) {
        return this._parameters[channel & 0xF].attackTime;
    }

    // Set decay time of a given channel
    proto.setDecayTime = function (channel, decayTime) {
        this._parameters[channel & 0xF].decayTime = decayTime;
    }

    // Get decay time of a given channel
    proto.getDecayTime = function (channel) {
        return this._parameters[channel & 0xF].decayTime;
    }

    // Set sustain level of a given channel
    proto.setSustainLevel = function (channel, sustainLevel) {
        this._parameters[channel & 0xF].sustainLevel = sustainLevel;
    }

    // Get sustain level of a given channel
    proto.getSustainLevel = function (channel) {
        return this._parameters[channel & 0xF].sustainLevel;
    }

    // Set release time of a given channel
    proto.setReleaseTime = function (channel, releaseTime) {
        this._parameters[channel & 0xF].releaseTime = releaseTime;
    }

    // Get release time of a given channel
    proto.getReleaseTime = function (channel) {
        return this._parameters[channel & 0xF].releaseTime;
    }

    // Set base brightness
    proto.setBaseBrightness = function (channel, baseBrightness) {
        this._parameters[channel & 0xF].baseBrightness = baseBrightness;
    }

    // Get base brightness
    proto.getBaseBrightness = function (channel) {
        return this._parameters[channel & 0xF].baseBrightness;
    }

    // Get number of current active voices
    proto.getActiveVoices = function () {
        return this._activeVoices;
    }

    // Process a Note-On event
    proto.noteOn = function (channel, note, velocity) {
        if (note >= this._noteMin && note <= this._noteMax) {
            var p = this._parameters[channel & 0xF];
            var voice = _getVoice(this, channel & 0xF, note & 0x7F);
            voice.channel = channel & 0xF;
            voice.note = note & 0x7F;
            voice.hsv8 = this._midiColorMapper.map(channel & 0xF, note & 0x7F, velocity & 0x7F);
            voice.adsrEnvelope.noteOn(p.attackTime, p.decayTime, p.sustainLevel, p.releaseTime);
            voice.age = 0;
            this._voices.sort(function (a, b) { // Sort voices by age
                return a.age - b.age;
            });
        }
    }

    // Process a Note-Off event
    proto.noteOff = function (channel, note) {
        if (note >= this._noteMin && note <= this._noteMax) {
            var voice = _findVoice(this, channel & 0xF, note & 0x7F);
            if (voice !== undefined)
                voice.adsrEnvelope.noteOff();
        }
    }

    // Turn all Leds off
    proto.allLedsOff = function (channel) {
        for (var i=this._numVoices; i--;) {
            var voice = this._voices[i];
            if (voice.channel == (channel & 0xF) && !voice.adsrEnvelope.isIdle())
                voice.adsrEnvelope.noteOff();
        };
    }

    // Reset parameters values to defaults
    proto.reset = function (channel) {
        this._parameters[channel & 0xF] = Object.create(_defaults);
    }

    // Process a clock tick signal
    proto.tick = function (time) {
        this._activeVoices = 0;
        for (var i=this._numVoices; i--;) {
            var voice = this._voices[i];
            if (!voice.adsrEnvelope.isIdle()) {
                voice.adsrEnvelope.tick(time);
                voice.age++;
                var brightness = Math.round(voice.hsv8[2] * voice.adsrEnvelope.getOutput());
                if (brightness < this._parameters[voice.channel].baseBrightness)
                    brightness = this._parameters[voice.channel].baseBrightness;
                this._leds[voice.note - this._noteMin] =
                    (voice.hsv8[0] << 16) + (voice.hsv8[1] << 8) + brightness;
                this._activeVoices++;
            }
        }
    }

    // Expose either via AMD, CommonJS or the global object
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return MidiLeds;
        });
    }
    else if (typeof module === 'object' && module.exports) {
        module.exports = MidiLeds;
    }
    else {
        this.MidiLeds = MidiLeds;
    }
}.call(this));
