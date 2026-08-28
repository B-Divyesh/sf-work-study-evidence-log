import { describe, expect, it, vi } from 'vitest';
import { watchForServiceWorkerUpdate, type UpdateRegistration } from '../src/service-worker-update';

class FakeWorker extends EventTarget {
  state: ServiceWorkerState = 'installing';
}

class FakeRegistration extends EventTarget implements UpdateRegistration {
  installing: ServiceWorker | null = null;
  waiting: ServiceWorker | null = null;
}

describe('service-worker update notification', () => {
  it('announces a worker that was already waiting', () => {
    const registration = new FakeRegistration();
    const worker = new FakeWorker() as unknown as ServiceWorker;
    registration.waiting = worker;
    const announce = vi.fn();
    watchForServiceWorkerUpdate(registration, () => true, announce);
    expect(announce).toHaveBeenCalledOnce();
    expect(announce).toHaveBeenCalledWith(worker);
  });

  it('@claim:update-notice announces the first installing worker when it reaches installed', () => {
    const registration = new FakeRegistration();
    const worker = new FakeWorker();
    registration.installing = worker as unknown as ServiceWorker;
    const announce = vi.fn();
    watchForServiceWorkerUpdate(registration, () => true, announce);
    registration.dispatchEvent(new Event('updatefound'));
    worker.state = 'installed';
    worker.dispatchEvent(new Event('statechange'));
    expect(announce).toHaveBeenCalledOnce();
    expect(announce).toHaveBeenCalledWith(worker);
  });
});
