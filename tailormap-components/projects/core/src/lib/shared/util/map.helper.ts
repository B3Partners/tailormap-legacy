import { SubType } from './generic.types';

export const selectOrDefault = <ObjectType, IndexType, ObjectKeyType>(
  tabs: Map<IndexType, ObjectType>,
  layerId: IndexType,
  prop: keyof SubType<ObjectType, ObjectKeyType>,
  defaultValue: ObjectKeyType,
): ObjectKeyType => {
  const tab = tabs.get(layerId);
  if (tab) {
    return tab[prop] as unknown as ObjectKeyType;
  }
  return defaultValue;
}
