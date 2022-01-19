import { SuperpoweredWebAudio } from '../superpowered/SuperpoweredWebAudio.js';

// Define our parameters to be rendered, allows us to keep all code required for audio processing and UI drawing in one space
const uiDefinitions = {
    title: 'Reverb',
    parameters: [{
            id: 'mix',
            label: 'Mix',
            valueType: "float",
            template: "vertical-slider",
            step: 0.01,
            defaultValue: 0.2,
            min: 0,
            max: 1
        },
        {
            id: 'width',
            label: 'Width',
            valueType: "float",
            template: "vertical-slider",
            step: 0.01,
            defaultValue: 0.5,
            min: 0,
            max: 1
        },
        {
            id: 'damp',
            label: 'Dampening',
            valueType: "float",
            template: "vertical-slider",
            step: 0.01,
            defaultValue: 0.5,
            min: 0,
            max: 1
        },
        {
            id: 'roomSize',
            label: 'Room Size',
            valueType: "float",
            template: "vertical-slider",
            step: 0.01,
            defaultValue: 0.5,
            min: 0,
            max: 1
        },
        {
            id: 'predelayMs',
            label: 'Predelay (ms)',
            valueType: "float",
            template: "vertical-slider",
            step: 1,
            defaultValue: 9,
            min: 0,
            max: 500
        },
        {
            id: 'lowCutHz',
            label: 'Low Cut (hz)',
            valueType: "float",
            template: "vertical-slider",
            step: 1,
            defaultValue: 100,
            min: 20,
            max: 500
        },
        {
            id: 'outputGain',
            label: 'Output Gain',
            valueType: "float",
            template: "vertical-slider",
            step: 0.01,
            defaultValue: 0.2,
            min: 0,
            max: 1
        }

    ]
};

class SuperpoweredReverbStageProcessor extends SuperpoweredWebAudio.AudioWorkletProcessor {

    onReady() {
        this.reverb = new this.Superpowered.Reverb(
            this.samplerate, // The initial sample rate in Hz.
            this.samplerate  // Maximum sample rate (affects memory usage, the lower the smaller).
        );
        this.reverb.enabled = true;
        this.outputGain = 0.2;
    }

    // messages are received from the main scope through this method.
    onMessageFromMainScope(message) {
        if (message.command === 'requestUiDefinitions') {
            this.sendMessageToMainScope({ uiDefinitions: uiDefinitions });
        }
        if (message.command === 'destruct') {
            console.log('destructuring reverb');
            this.reverb.destruct();
            
        }
        if (typeof message.dry !== 'undefined') this.revberb.dry = message.dry;
        if (typeof message.wet !== 'undefined') this.reverb.wet = message.wet;
        if (typeof message.mix !== 'undefined') this.reverb.mix = message.mix;
        if (typeof message.width !== 'undefined') this.reverb.width = message.width;
        if (typeof message.damp !== 'undefined') this.reverb.damp = message.damp;
        if (typeof message.roomSize !== 'undefined') this.reverb.roomSize = message.roomSize;
        if (typeof message.predelayMs !== 'undefined') this.reverb.predelayMs = message.predelayMs;
        if (typeof message.lowCutHz !== 'undefined') this.reverb.lowCutHz = message.lowCutHz;
        if (typeof message.outputGain !== 'undefined') this.outputGain = message.outputGain;

    }

    processAudio(inputBuffer, outputBuffer, buffersize, parameters) {
        // Ensure the samplerate is in sync on every audio processing callback
        this.reverb.samplerate = this.samplerate;

	    // Render the output buffers
        if (this.reverb.process) this.reverb.process(inputBuffer.pointer, outputBuffer.pointer, buffersize);
        this.Superpowered.Volume(
            outputBuffer.pointer,
            outputBuffer.pointer,
            this.outputGain,
            this.outputGain,
            buffersize
        )
    }
}

if (typeof AudioWorkletProcessor === 'function') registerProcessor('SuperpoweredReverbStageProcessor', SuperpoweredReverbStageProcessor);
export default SuperpoweredReverbStageProcessor;


