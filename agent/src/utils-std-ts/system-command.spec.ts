import * as childProcess from 'child_process';
import { SystemCommand } from './system-command';
import { sandbox } from './test-utils';

describe('SystemCommand', () => {
  //
  test('should execute simple command', () => {
    sandbox.stub(childProcess, 'exec').callsFake((command, callback) => {
      callback(null, 'file1', null);
    });
    return SystemCommand.execute('ls');
  });

  test('should reject of if there is an error', done => {
    sandbox.stub(childProcess, 'exec').callsFake((command, callback) => {
      callback(new Error('test'), 'an error', null);
    });
    SystemCommand.execute('ls')
      .then(() => {
        done('Should not have resolved');
      })
      .catch(error => {
        done();
      });
  });
});
