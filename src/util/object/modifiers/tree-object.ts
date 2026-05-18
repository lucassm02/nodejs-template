const lowercaseFirstCharacter = (string: string) => {
  return string.charAt(0).toLowerCase() + string.slice(1);
};

type Options = {
  child: string;
  exception: string;
};

export const treeObject = (object: object, options: Options) => {
  const allEntries = Object.entries(object);
  const objectEntries = allEntries.filter(([key]) => key !== options.exception);

  const childEntries: [string, unknown][] = [];
  const rest: [string, unknown][] = [];

  for (const entry of objectEntries) {
    if (entry[0].includes(options.child)) {
      childEntries.push(entry);
    } else {
      rest.push(entry);
    }
  }

  const parsedChildEntries = childEntries.map(([key, value]) => {
    const newKey = key.replace(options.child, '');
    return [lowercaseFirstCharacter(newKey), value];
  });

  const child = Object.fromEntries(parsedChildEntries);

  // TODO: .filter when many
  const [exceptionKey, exceptionValue] = allEntries.find(
    ([key]) => key === options.exception
  ) as [string, unknown];

  return {
    ...Object.fromEntries(rest),
    [exceptionKey]: exceptionValue,
    [options.child]: child
  };
};
