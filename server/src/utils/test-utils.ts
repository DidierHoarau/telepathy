import * as chai from 'chai';
import 'chai/register-expect';
import 'chai/register-should';
import * as sinon from 'sinon';

declare var Promise: any;

export let sandbox: sinon.SinonSandbox;

beforeEach(() => {
  sandbox = sinon.sandbox.create();
});

afterEach(() => {
  sandbox.restore();
});
