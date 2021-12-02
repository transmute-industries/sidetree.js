const registerService = (name: any, initFn: any) => {
  if (process.env.NODE_ENV === 'development') {
    if (!(name in global)) {
      (global as any)[name] = initFn();
    }
    return (global as any)[name];
  }
  return initFn();
};

export default registerService;
