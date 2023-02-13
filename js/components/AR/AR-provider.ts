export default abstract class ARProvider {
  public readonly onSessionStarted: Array<(event: any) => void> = [];
  public readonly onSessionEnded: Array<(event: any) => void> = [];

  public loaded = false;

  abstract startSession(...args: any[]);

  abstract endSession() 
  
  abstract load();
}