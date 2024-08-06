import path from 'node:path';
import { replaceEsm, reset } from 'testdouble';

export const mockWixHttpFunctionsModule = async () => {
  class WixHttpFunctionResponseMock {
    constructor(readonly opts: unknown) {}
  }

  const response = (opts: unknown) => new WixHttpFunctionResponseMock(opts);

  await replaceEsm(path.resolve('./src/runtime/wix-http-functions'), {
    response,
  });

  return {
    response,
    [Symbol.dispose]() {
      reset();
    },
  };
};
