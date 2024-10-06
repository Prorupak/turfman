import { AxiosInstance, AxiosRequestConfig } from "axios";

const httpRequest = (req: AxiosRequestConfig) => {
  return <T>(instance: AxiosInstance): Promise<T> => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      try {
        const { data } = await instance<T>(req);
        resolve({ ...data });
      } catch (error: any) {
        reject(error?.response?.data);
      }
    });
  };
};

export default httpRequest;
