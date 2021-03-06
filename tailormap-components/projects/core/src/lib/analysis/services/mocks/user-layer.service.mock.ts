import { createSpyObject } from '@ngneat/spectator';
import { UserLayerService } from '../user-layer.service';
import { CreateUserLayerParams } from '../user-layer-api.service';

export const createUserLayerServiceMockProvider = () => {
  return createSpyObject(UserLayerService, {
    createUserLayer() {},
    createUserLayerFromParams$(params: CreateUserLayerParams) {},
  });
};

export const getUserLayerServiceMockProvider = () => {
  return { provide: UserLayerService, useValue: createUserLayerServiceMockProvider() };
};
