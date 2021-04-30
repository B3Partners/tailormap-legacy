import { SubType } from './generic.types';

export const selectOrDefault = <ObjectType, ObjectKeyType>(
  list: ObjectType[],
  findBy: (item: ObjectType) => boolean,
  prop: keyof SubType<ObjectType, ObjectKeyType>,
  defaultValue: ObjectKeyType,
): ObjectKeyType => {
  const item = list.find(findBy);
  if (item) {
    return item[prop] as unknown as ObjectKeyType;
  }
  return defaultValue;
};
