import axios, { AxiosRequestConfig, AxiosResponse, isAxiosError } from "axios";
import {
  QueryClient,
  defaultShouldDehydrateQuery,
  isServer,
} from "@tanstack/react-query";
import qs from "qs";
import { getAccessToken } from "./utils";

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:9050",
});

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export const restClient = {
  post: <TResponse = unknown, RRequest = unknown>(
    url: string,
    data: RRequest,
    config?: AxiosRequestConfig<RRequest>,
  ): Promise<AxiosResponse<TResponse, RRequest>> => {
    return axiosClient.post<TResponse, AxiosResponse<TResponse>, RRequest>(
      url,
      data,
      config,
    );
  },

  get: <TResponse = unknown, TQueryParams = unknown>(
    url: string,
    params?: TQueryParams,
    config?: AxiosRequestConfig<TQueryParams>,
  ): Promise<AxiosResponse<TResponse, TQueryParams>> => {
    return axiosClient.get<TResponse, AxiosResponse<TResponse, TQueryParams>>(
      url,
      {
        params,
        paramsSerializer: (params) => qs.stringify(params),
        ...config,
      },
    );
  },

  put: <TResponse = unknown, RRequest = unknown>(
    url: string,
    data: RRequest,
    config?: AxiosRequestConfig<RRequest>,
  ): Promise<AxiosResponse<TResponse, RRequest>> => {
    return axiosClient.put<TResponse, AxiosResponse<TResponse>, RRequest>(
      url,
      data,
      config,
    );
  },

  delete: <TResponse = unknown, TQueryParams = unknown>(
    url: string,
    params?: TQueryParams,
    config?: AxiosRequestConfig<TQueryParams>,
  ): Promise<AxiosResponse<TResponse, TQueryParams>> => {
    return axiosClient.delete<
      TResponse,
      AxiosResponse<TResponse, TQueryParams>
    >(url, {
      params,
      ...config,
    });
  },
};

axiosClient.interceptors.request.use(
  async (config) => {
    config.headers["Accept-Language"] = "en";
    const accessToken = await getAccessToken();
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  null,
  {
    runWhen: (request) => !request.headers["No-Auth"],
  },
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isAxiosError(error)) {
      if (error.code === "ERR_NETWORK") {
        throw {
          type: "NetworkError",
          message: "Failed to connect to the server",
        };
      }
      throw error.response?.data;
    }
    throw {
      type: "UnknownError",
      message: "An unknown error occurred",
    };
  },
);

export default axiosClient;
