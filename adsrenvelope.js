/**
 * AdsrEnvelope v1.0 - A very simple ADSR envelope implementation for JavaScript.
 * Hugo Hromic - http://github.com/hhromic
 * MIT license
 *
 * Taken (& adapted) from: https://github.com/thestk/stk/blob/master/src/ADSR.cpp
 */
/*jslint nomen: true*/

(function () {
    'use strict';

    // ADSR envelope states
    var States = {
        IDLE: 0,
        ATTACK: 1,
        DECAY: 2,
        SUSTAIN: 3,
        RELEASE: 4
    };

    // Constructor
    function AdsrEnvelope() {
        this._state = States.IDLE;
        this._output = 0.0;
        this._lastTime = 0;
        this._target = 0.0;
        this._attackRate = 0.0;
        this._decayStart = 0.0;
        this._decayRate = 0.0;
        this._sustainLevel = 0.0;
        this._releaseStart = 0.0;
        this._releaseRate = 0.0;
        this._releaseTime = 0;
    }

    // Prototype shortcut
    var proto = AdsrEnvelope.prototype;

    // Start the ADSR envelope with given parameters
    proto.noteOn = function (attackTime, decayTime, sustainLevel, releaseTime) {
        this._state = States.ATTACK;
        this._output = 0.0;
        this._lastTime = 0;
        this._target = 1.0;
        this._attackRate = 1.0 / attackTime;
        this._decayRate = (1.0 - sustainLevel) / decayTime;
        this._sustainLevel = sustainLevel;
        this._releaseTime = releaseTime;
    }

    // Trigger the release phase of the ADSR envelope
    proto.noteOff = function () {
        if (this._state != States.IDLE) {
            this._state = States.RELEASE;
            this._lastTime = 0;
            this._target = 0.0;
            this._releaseStart = this._output;
            this._releaseRate = this._releaseStart / this._releaseTime;
        }
    }

    // Update the ADSR envelope phase and output value (assumes monotonically increasing time)
    proto.tick = function (time) {
        // Do nothing if the envelope is idle
        if (this._state == States.IDLE)
            return;

        // Handle envelope relative time
        if (this._lastTime == 0)
            this._lastTime = time;
        var relativeTime = time - this._lastTime;

        // Update envelope state and output
        switch (this._state) {
            case States.ATTACK: // Attack phase
                this._output = isFinite(this._attackRate) ?
                    relativeTime * this._attackRate : this._target;
                if (this._output >= this._target) { // Change to decay phase?
                    this._state = States.DECAY;
                    this._output = this._target;
                    this._lastTime = 0;
                    this._decayStart = this._target;
                    this._target = this._sustainLevel;
                }
                break;
            case States.DECAY: // Decay phase
                this._output = isFinite(this._decayRate) ?
                    this._decayStart - (relativeTime * this._decayRate) : this._target;
                if (this._output <= this._target) { // Change to sustain phase?
                    this._state = States.SUSTAIN;
                    this._output = this._target;
                    this._lastTime = 0;
                }
                break;
            case States.SUSTAIN: // Sustain phase
                this._lastTime = 0;
                if (this._output == 0.0) // Skip to idle phase?
                    this._state = States.IDLE;
                break;
            case States.RELEASE: // Release phase
                this._output = isFinite(this._releaseRate) ?
                    this._releaseStart - (relativeTime * this._releaseRate) : this._target;
                if (this._output <= this._target) { // Change to idle phase?
                    this._state = States.IDLE;
                    this._output = this._target;
                    this._lastTime = 0;
                }
                break;
        }
    }

    // Get the ADSR envelope output value
    proto.getOutput = function () {
        return this._output;
    }

    // Test if the ADSR envelope is in idle state
    proto.isIdle = function () {
        return this._state == States.IDLE;
    }

    // Expose either via AMD, CommonJS or the global object
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return AdsrEnvelope;
        });
    }
    else if (typeof module === 'object' && module.exports) {
        module.exports = AdsrEnvelope;
    }
    else {
        this.AdsrEnvelope = AdsrEnvelope;
    }
}.call(this));
