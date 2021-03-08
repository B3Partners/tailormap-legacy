import { createSpyObject } from '@ngneat/spectator';
import { ApplicationService } from '../application.service';


export const createApplicationServiceMock = (template?: Partial<Record<keyof ApplicationService, any>>) => {
  return createSpyObject(ApplicationService, {
    getId(): number {
      return 1;
    },
    ...template,
  });
};

export const getApplicationServiceMockProvider = (template?: Partial<Record<keyof ApplicationService, any>>) => {
  return { provide: ApplicationService, useValue: createApplicationServiceMock(template) };
};
