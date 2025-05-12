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
  return res; // تأكد أن البيانات تحتوي على full_name
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
export const getProducts = async (categoryId?: number, brandId?: number) => {
  try {
    let query = [];
    if (categoryId) query.push(`categoryId=${categoryId}`);
    if (brandId) query.push(`brandId=${brandId}`);

    const queryString = query.length > 0 ? `?${query.join('&')}` : '';
    const response = await fetch(
      `http://192.168.100.13:3250/api/products${queryString}`,
    );
    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error('getProducts error:', error);
    throw error;
  }
};

export const getParentCategories = async () => {
  try {
    const response = await fetch(
      'http://192.168.100.13:3250/api/categories?parentId=null',
    );
    const json = await response.json();

    const categories = json.data;

    return categories.map((cat: any) => ({
      id: cat.id,
      name: cat.description?.name || 'No name',
      image: cat.description?.image || '', // Fallback if image is missing
    }));
  } catch (error) {
    console.error('getParentCategories error:', error);
    return [];
  }
};

export const getSubcategories = async (parentId: number) => {
  try {
    const response = await fetch(
      `http://192.168.100.13:3250/api/categories?parentId=${parentId}`,
    );
    const json = await response.json();

    return json.data.map((cat: any) => ({
      id: cat.id,
      name: cat.description?.name || 'No name',
      image: cat.description?.image || '',
    }));
  } catch (error) {
    console.error('getSubcategories error:', error);
    return [];
  }
};

export const getBrands = async () => {
  try {
    const response = await fetch('http://192.168.100.13:3250/api/brands');
    const json = await response.json();

    return json.data.map((brand: any) => ({
      id: brand.id,
      name: brand.name || 'Unnamed Brand',
      image: brand.image || '',
    }));
  } catch (error) {
    console.error('getBrands error:', error);
    return [];
  }
};

export const getProductById = async (productId: number) => {
  try {
    const response = await fetch(
      `http://192.168.100.13:3250/api/products/${productId}`,
    );
    const json = await response.json();
    return json;
  } catch (error) {
    console.error('getProductById error:', error);
    throw error;
  }
};

export const getProductDetails = async (productId: number | string) => {
  try {
    const response = await fetch(
      `http://192.168.100.13:3250/api/products/${productId}`,
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch product details: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching product details:', error);
    throw error;
  }
};
