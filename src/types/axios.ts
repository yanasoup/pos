export type ApiError = {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
};
