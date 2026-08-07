import { wakeupServer } from './api';

const DEFAULT_WAKEUP_TIMEOUT = 60000;
const DEFAULT_WAKEUP_INTERVAL = 5000;

export const waitForServerWakeup = async (statusCallback?: (message: string) => void): Promise<boolean> => {
  const start = Date.now();
  let attempt = 0;

  while (Date.now() - start < DEFAULT_WAKEUP_TIMEOUT) {
    attempt += 1;
    statusCallback?.(`Connecting, this usually takes 1 minute... (${attempt})`);

    try {
      const response = await wakeupServer();
      if (response.data?.isAlive) {
        statusCallback?.('Connected to server.');
        return true;
      }
    } catch (error) {
      console.warn('Wakeup request failed', error);
    }

    await new Promise((resolve) => setTimeout(resolve, DEFAULT_WAKEUP_INTERVAL));
  }

  statusCallback?.('Unable to connect. Please try again.');
  return false;
};
