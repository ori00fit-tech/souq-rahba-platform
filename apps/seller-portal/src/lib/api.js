import {
  apiGet as sharedGet,
  apiPost as sharedPost,
  apiPut as sharedPut,
  apiPatch as sharedPatch,
  apiDelete as sharedDelete,
  apiUpload as sharedUpload,
} from "@rahba/shared";

const tokenKey = "seller_auth_token";
const uploadPath = "/upload";

export const apiGet = (path, options = {}) => sharedGet(path, { ...options, tokenKey });
export const apiPost = (path, payload, options = {}) => sharedPost(path, payload, { ...options, tokenKey });
export const apiPut = (path, payload, options = {}) => sharedPut(path, payload, { ...options, tokenKey });
export const apiPatch = (path, payload, options = {}) => sharedPatch(path, payload, { ...options, tokenKey });
export const apiDelete = (path, options = {}) => sharedDelete(path, { ...options, tokenKey });
export const apiUpload = (path, formData, options = {}) => sharedUpload(path, formData, { ...options, tokenKey });

export async function apiUploadFile(file, options = {}) {
  const formData = new FormData();
  formData.append("file", file);
  return sharedUpload(uploadPath, formData, { ...options, tokenKey });
}
