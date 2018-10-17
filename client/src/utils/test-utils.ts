import * as sinon from 'sinon';

export let sandbox: sinon.SinonSandbox;

beforeEach(() => {
  sandbox = sinon.sandbox.create();
});

afterEach(() => {
  sandbox.restore();
});
