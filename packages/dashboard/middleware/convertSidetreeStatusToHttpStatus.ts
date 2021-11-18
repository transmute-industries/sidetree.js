export const convertSidetreeStatusToHttpStatus = (status: string) => {
  if (status === 'succeeded') {
    return 200;
  }
  return 500;
};
