const fetchApi = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const baseUrl = 'https://devapi.mmenu.io/v1';
const getApiResponse = async ({ url, method, body, sessionData , queryParams}) => {
  const option = {
    method,
    body,
    headers: {
      'Content-Type': 'application/json',
      appid: 'mmenu-customer',
      authorization: `Bearer ${sessionData.token}`,
    },
  };
  let query;
  if(queryParams) {
    query = '?' + Object.keys(queryParams).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(queryParams [k])).join('&');
  }
  const urlWithBase = [`${baseUrl}${url}`,query].join("");
  const fetchResult = await fetchApi(urlWithBase, option);
  const result = await fetchResult.json();
  return result;
};

const getApiResponseWithQuery = async ({
  url, method, body, sessionData, queryParams
}) => {
  const option = {
    method,
    body,
    headers: {
      'Content-Type': 'application/json',
      appid: 'mmenu-customer',
      authorization: `Bearer ${sessionData.token}`,
    },
  };
  let query;
  if(queryParams){
    query = '?' + Object.keys(queryParams).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(queryParams [k])).join('&');
  }
  const urlWithBase = [`${baseUrl}${url}`, query].join();
  const fetchResult = await fetchApi(urlWithBase, option);
  const result = await fetchResult.json();
  return result;
};

const postApiResponse = async ({
  url, method, body, sessionData,
}) => {
  const option = {
    method,
    body,
    headers: {
      'Content-Type': 'application/json',
      appid: 'mmenu-customer',
      authorization: `Bearer ${sessionData.token}`,
    },
  };
  const urlWithBase = `${baseUrl}${url}`;
  const fetchResult = await fetchApi(urlWithBase, option);
  const result = await fetchResult.json();
  return result;
};

module.exports = {
  getApiResponse,
  postApiResponse,
};
