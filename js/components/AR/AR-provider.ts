export default abstract class ARProvider {
  public readonly onSessionStarted: Array<(event: any) => void> = [];
  public readonly onSessionEnded: Array<(event: any) => void> = [];

  public loaded = false;

  abstract startSession(...args: any[]): Promise<void>;

  abstract endSession(): Promise<void>;
  
  abstract load(): Promise<void>;
}