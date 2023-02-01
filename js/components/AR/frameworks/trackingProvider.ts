import { Component } from "@wonderlandengine/api";

export interface ITrackingProvider {
  readonly component: Component;
  update?: (delta: number) => void;
  startARSession: () => void;
  stopARSession: () => void;
}

export abstract class TrackingProvider implements ITrackingProvider {
  readonly component: Component;

  constructor(component: Component) {
    this.component = component;
  }
  abstract startARSession (): void;
  abstract stopARSession (): void;
}

