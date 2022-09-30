export const skipMiddleware = (
  reprocessingState: any,
  middleware: string
): boolean => {
  return (
    reprocessingState &&
    reprocessingState.middleware &&
    reprocessingState.middleware !== middleware
  );
};
