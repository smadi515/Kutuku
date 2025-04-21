export default function buildUrlWithQueryParams(
  apiUrl: string,
  queryParams: any,
) {
  if (!queryParams) return '';

  const queryString = Object.keys(queryParams)
    .map(key => `${key}=${queryParams[key] == null ? '' : queryParams[key]}`)
    .join('&');

  return `${apiUrl}?${queryString}`;
}

export const login = async (username: string, password: string) => {
  const apiUrl =
    'https://mqj.auj.mybluehost.me/harir/wp-json/jwt-auth/v1/token';
  const params = {
    username,
    password,
  };
  const urlWithParams = buildUrlWithQueryParams(apiUrl, params);
  console.log('URL with parameters:', urlWithParams); // Debugging line
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({username, password}),
  });
  const res = await response.json();
  return res;
};
