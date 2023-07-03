import type { Request } from "express";

enum FandomStatus {
  SUCCESS = "success",
  PROCESSING = "processing",
  ERROR_MALFORMED_REQUEST = "error_malformed_request",
  ERROR_INVALID_WIKI = "error_invalid_wiki",
  ERROR_INVALID_PAGE = "error_invalid_page",
  ERROR_NOT_FOUND = "error_not_found",
  ERROR_ALREADY_EXISTS = "error_already_exists",
  ERROR_UNKNOWN = "error_unknown",
}

interface FandomRequest extends Request {
  body: {
    wiki: string;
    page: string;
  };
}

interface FandomResponse {
  content: string;
  status: FandomStatus;
}

export { FandomRequest, FandomResponse, FandomStatus };
