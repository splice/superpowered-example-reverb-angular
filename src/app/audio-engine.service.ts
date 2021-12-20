import { Injectable } from '@angular/core';

// @ts-ignore
import { SuperpoweredGlue } from '../lib/superpowered/SuperpoweredGlueModule';
// @ts-ignore
import { SuperpoweredWebAudio } from '../lib/superpowered/SuperpoweredWebAudio';

const minimumSampleRate = 48000;

@Injectable({
  providedIn: 'root',
})
export class AudioEngineService {
  // @ts-ignore
  superpowered;
  initted = false;
  // @ts-ignore
  webaudioManager;
  // @ts-ignore
  userInputStream;
  // @ts-ignore
  audioInputNode;
  // @ts-ignore
  inputStageConnectedListener;
  // @ts-ignore
  inputStageNode;
  inputStageUiDefinitions = null;

  loadSuperpoweredLibrary = async (wasmPublicLocation: any) => {
    this.superpowered = await SuperpoweredGlue.fetch(wasmPublicLocation);
    this.superpowered.Initialize({
      licenseKey: 'ExampleLicenseKey-WillExpire-OnNextUpdate',
      enableAudioAnalysis: true,
      enableFFTAndFrequencyDomain: true,
      enableAudioTimeStretching: true,
      enableAudioEffects: true,
      enableAudioPlayerAndDecoder: true,
      enableCryptographics: false,
      enableNetworking: false,
    });
    this.initted = true;
    this.webaudioManager = new SuperpoweredWebAudio(
      minimumSampleRate,
      this.superpowered
    );
  };

  startUserInputStream = async () => {
    if (this.initted && !this.userInputStream) {
      this.userInputStream =
        await this.webaudioManager.getUserMediaForAudioAsync({
          fastAndTransparentAudio: true,
        });
      if (!this.userInputStream) return;

      this.audioInputNode =
        this.webaudioManager.audioContext.createMediaStreamSource(
          this.userInputStream
        );
    }
  };

  getSampleRate() {
    return this.webaudioManager.audioContext.sampleRate;
  }

  getEstimatedLatency() {
    return this.webaudioManager.audioContext.baseLatency;
  }

  onMessageFromInputStageAudioScope = (message: any) => {
    if (message.loaded) {
    } else if (message.uiDefinitions) {
      this.inputStageUiDefinitions = message.uiDefinitions;
      this.inputStageConnectedListener({
        uiDefinitions: this.inputStageUiDefinitions,
      });
    }
  };

  //setup input stage, pull in inputstage Processor

  async setupInputStage() {
    this.inputStageNode = await this.webaudioManager.createAudioNodeAsync(
      'assets/superpoweredProcessors/inputStage.js',
      'SuperpoweredInputStageProcessor',
      this.onMessageFromInputStageAudioScope
    );
    // this.inputStageNode.connect(this.webaudioManager.audioContext.destination);
  }

  switchInputStage() {
    //mic, osc, sampler
  }

  addInputStageConnectedListener(f: any) {
    this.inputStageConnectedListener = f;
  }

  loadInputStageSamplerUrl() {}

  startInputStageSampler() {}

  stopInputStageSampler() {}

  setInputStageOscillatorWaveType() {}

  setInputStageOscillatorFrequency() {}

  setInputStageOscillatorGain() {}
}
