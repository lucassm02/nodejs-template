const lowercaseFirstCharacter = (string: string) => {
  return string.charAt(0).toLowerCase() + string.slice(1);
};

type Options = {
  child: string;
  exception: string;
};

export const treeObject = (object: object, options: Options) => {
  const objectEntries = Object.entries(object).filter(
    ([key]) => key !== options.exception
  );

  const childEntries = objectEntries.filter(([key]) =>
    key.includes(options.child)
  );

  const parsedChildEntries = childEntries.map(([key, value]) => {
    const newKey = key.replace(options.child, '');
    return [lowercaseFirstCharacter(newKey), value];
  });

  const child = Object.fromEntries(parsedChildEntries);

  const rest = objectEntries.filter(([key]) => !key.includes(options.child));

  // TODO: .filter when many
  const [exceptionKey, exceptionValue] = Object.entries(object).find(
    ([key]) => key === options.exception
  ) as [string, any];

  return {
    ...Object.fromEntries(rest),
    [exceptionKey]: exceptionValue,
    [options.child]: child,
  };
};
