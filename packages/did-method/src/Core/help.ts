export const waitSeconds = async (seconds: number) => {
    return new Promise((resolve)=> {
        setTimeout(resolve, seconds * 1000);
    });
  
}