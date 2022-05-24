type Skip = [unknown, unknown, Function];

export const skip = (...[, , next]: Skip) => {
  return next();
};
