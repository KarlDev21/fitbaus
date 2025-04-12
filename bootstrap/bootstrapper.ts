const instructionsAsync: BootstrapperInstructionAsync[] = [];

export async function initBootstrapper(): Promise<boolean> {
  try {
    await Promise.all(
      instructionsAsync.map(async item => {
        await item.func();
      }),
    );
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
