export class TaskOutput {
  //
  public matchingPattern: string;
  public value: string;
  public computed: boolean = false;

  constructor() {
    this.matchingPattern = '';
    this.value = '';
  }
}
