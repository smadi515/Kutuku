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

export const login = async (email: string, password: string) => {
  const apiUrl = 'http://192.168.100.13:3250/api/auth/login';
  const params = {
    email,
    password,
  };
  const urlWithParams = buildUrlWithQueryParams(apiUrl, params);
  console.log('URL with parameters:', urlWithParams); // Debugging line
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({email, password}),
  });
  const res = await response.json();
  return res;
};

export const register = async (
  email: string,
  password: string,
  name: string,
  phoneNumber: string,
) => {
  const apiUrl = 'http://192.168.100.13:3250/api/auth/register';

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        full_name: name,
        phone_number: phoneNumber,
      }),
    });

    const res = await response.json();
    return res;
  } catch (error) {
    console.error('Register API error:', error);
    throw error;
  }
};

export const verifyOtp = async (email: string, otp: string) => {
  const apiUrl = 'http://192.168.100.13:3250/api/auth/verify-otp'; // adjust endpoint if needed
  console.log('Sending OTP verification payload:', {email, otp}); // ✅ Add this line

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({email, otp}),
  });

  const res = await response.json();
  return res;
};
