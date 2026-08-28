export interface UpdateRegistration {
  installing: ServiceWorker | null;
  waiting: ServiceWorker | null;
  addEventListener(type: 'updatefound', listener: () => void): void;
}

export function watchForServiceWorkerUpdate(
  registration: UpdateRegistration,
  hasController: () => boolean,
  onUpdate: (worker: ServiceWorker) => void
): void {
  if (registration.waiting) onUpdate(registration.waiting);
  registration.addEventListener('updatefound', () => {
    const installingWorker = registration.installing;
    if (!installingWorker) return;
    installingWorker.addEventListener('statechange', () => {
      if (installingWorker.state === 'installed' && hasController()) onUpdate(installingWorker);
    });
  });
}
