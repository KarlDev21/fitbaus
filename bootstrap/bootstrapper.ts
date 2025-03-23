import {addDeepLinking} from '../helpers/AppHelper';
import {initRemoteConfig} from '../services/RemoteConfigService';

const instructionsAsync: BootstrapperInstructionAsync[] = [
  {func: initRemoteConfig, key: 'RemoteConfig'},
];

const instructions: BootstrapperInstruction[] = [
  {func: addDeepLinking, key: 'DeepLinking'},
];

export async function initBootstrapper(): Promise<boolean> {
  try {
    await Promise.all(
      instructionsAsync.map(async item => {
        await item.func();
      }),
    );

    instructions.map(item => {
      item.func();
      console.debug(`Bootstrapper executed: ${item.key}`);
    });
  } catch (error: any) {
    console.error(`Bootstrapper error: ${error.message}`);
    return false;
  }

  return true;
}

export type BootstrapperInstructionAsync = {
  func: (...args: any[]) => Promise<unknown | any>;
  key?: string;
};

export type BootstrapperInstruction = {
  func: (...args: any[]) => unknown | any;
  key?: string;
};
