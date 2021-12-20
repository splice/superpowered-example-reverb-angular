import { Component, OnInit, Input, ChangeDetectionStrategy, NgZone } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { AudioEngineService } from './audio-engine.service';

// Statically served SP WASM library
const publicWasmLibraryUrl = "/assets/superpowered/superpowered.wasm";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ AudioEngineService ],
  changeDetection: ChangeDetectionStrategy.Default
})
export class AppComponent implements OnInit{

  constructor(
    private _ngZone: NgZone,
    private audioEngineService: AudioEngineService
    ) { }
  @Input() booted = false;
  uiDefinitions:any = {};
  processorNode:any;
  engineStats:any;

  // On page load, build the load Superpowered and start our AudioContext 
  // within the Audio Engine Service
  async ngOnInit() {
    await this.audioEngineService.loadSuperpoweredLibrary(publicWasmLibraryUrl);
    this.engineStats = {
      sampleRate: this.audioEngineService.getSampleRate(),
      estimatedLatency: this.audioEngineService.getEstimatedLatency()
    }
  }

  // We first resume the audio context (within the AudioEngine Service) on 
  // the mouse interaction, enable the microphone stream, then load the reverb.
  async boot() {
    this.audioEngineService.webaudioManager.audioContext.resume();
    await this.audioEngineService.startUserInputStream();
    await this.loadReverb();
  }

  // Load the external Audioworklet Processor file for the reverb.
  // Connect up the audio graph.
  // Request the UI definitions to draw the UI from the worklet.
  async loadReverb() {
    this.processorNode = await this.audioEngineService.webaudioManager.createAudioNodeAsync(`/assets/superpoweredProcessors/reverbStage.js`, 'SuperpoweredReverbStageProcessor', this.onMessageFromAudioScope);
    this.audioEngineService.audioInputNode.connect(this.processorNode);
    this.processorNode.connect(this.audioEngineService.webaudioManager.audioContext.destination);
    this.processorNode.sendMessageToAudioScope({command:'requestUiDefinitions'});
  }

  // As this callback orignates from outside of the angualr scope, we need to 
  // wrap the updates in ngZone so that the changes are refected in the template.
  onMessageFromAudioScope = (message:any) => {
    this._ngZone.run(() => {
      // save the uiDefnitions provided to the component
      // toggle booted state.
      if (message.uiDefinitions) {
        this.uiDefinitions = message.uiDefinitions;
        this.booted = true;
      }
    });
  }

  // We take the slider event with the paramter id and pass the update over 
  // to the AudioWorklet which in turn applies it to the Webassembly module.
  onParameterChange(event: MatSliderChange, id:string) {
    this.processorNode.sendMessageToAudioScope({ [id]: Number(event.value) });
  }

  getAudioEngineStats() {
    return {
      
    }
  }

}
