import AsyncStorage from '@react-native-async-storage/async-storage';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import Toast from 'react-native-toast-message';

// ================= AUTH =================
export const login = async (email: string, password: string) => {
  const apiUrl = 'https://api.sareh-nomow.website/api/client/v1/auth/login';

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
  const apiUrl = 'https://api.sareh-nomow.website/api/client/v1/auth/register';

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
  const apiUrl =
    'https://api.sareh-nomow.website/api/client/v1/auth/verify-otp';

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

// ================= PRODUCTS =================

export const getProducts = async (
  lang: string,
  categoryId?: number,
  brandId?: number,
  page: number = 1,
  limit?: number,
) => {
  try {
    let query = [];

    if (categoryId) query.push(`categoryId=${categoryId}`);
    if (brandId) query.push(`brandId=${brandId}`);
    if (lang) query.push(`lang=${lang}`);
    if (page) query.push(`page=${page}`);
    if (limit) query.push(`limit=${limit}`);

    const queryString = query.length ? `?${query.join('&')}` : '';
    const response = await fetch(
      `https://api.sareh-nomow.website/api/client/v1/products${queryString}`,
    );
    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error('getProducts error:', error);
    throw error;
  }
};

export const getProductByUrlKey = async (urlKey: string, lang: string) => {
  console.log(`Fetching product with url_key: ${urlKey} and lang: ${lang}`);

  try {
    const response = await fetch(
      `https://api.sareh-nomow.website/api/client/v1/products/by-url/${urlKey}?lang=${lang}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': lang,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch product (status: ${response.status})`);
    }

    const json = await response.json();
    const product = json?.data?.[0];

    if (!product) {
      throw new Error('Product not found in response');
    }

    console.log('Fetched product by url_key:', product);
    return product;
  } catch (error) {
    console.error('getProductByUrlKey error:', error);
    throw error;
  }
};
export const getProductById = async (productId: number, lang: string) => {
  try {
    const response = await fetch(
      `https://api.sareh-nomow.website/api/client/v1/products/${productId}?lang=${lang}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': lang,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch product (status: ${response.status})`);
    }

    const json = await response.json();
    const product = json?.data; // <-- FIXED

    if (!product) {
      console.warn('Product response missing or empty:', json);
      throw new Error('Product not found in response');
    }

    console.log('Fetched product:', product);
    return product;
  } catch (error) {
    console.error('getProductById error:', error);
    throw error;
  }
};

// ================= CATEGORIES =================
export const getParentCategories = async () => {
  try {
    const response = await fetch(
      'https://api.sareh-nomow.website/api/client/v1/categories?parentId=null',
    );
    const json = await response.json();

    return json.data.map((cat: any) => ({
      id: cat.id,
      name: cat.description?.name || 'No name',
      image: cat.description?.image || '',
    }));
  } catch (error) {
    console.error('getParentCategories error:', error);
    return [];
  }
};

export const getSubcategories = async (parentId: number) => {
  try {
    const response = await fetch(
      `https://api.sareh-nomow.website/api/client/v1/categories?parentId=${parentId}`,
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

// ================= BRANDS =================
export const getBrands = async () => {
  try {
    const response = await fetch(
      'https://api.sareh-nomow.website/api/client/v1/brands',
    );
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

// ================= ADDRESS =================
export const createAddress = async (addressData: any, token: string) => {
  const apiUrl = 'https://api.sareh-nomow.website/api/client/v1/addresses';

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(addressData),
    });

    const res = await response.json();
    if (!response.ok) {
      throw new Error(res.message || 'Failed to create address');
    }

    return res;
  } catch (error) {
    console.error('Error creating address:', error);
    throw error;
  }
};

// ================= CART =================
export const getCustomerCart = async (token: string) => {
  try {
    const response = await fetch(
      'https://api.sareh-nomow.website/api/client/v1/carts/customer',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    let cart = null;

    if (response.ok) {
      cart = await response.json();
    }

    if (!cart) {
      const createResponse = await fetch(
        'https://api.sareh-nomow.website/api/client/v1/carts',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!createResponse.ok) {
        throw new Error('Failed to create cart');
      }

      cart = await createResponse.json();
    }

    if (cart?._id) {
      await AsyncStorage.setItem('cartId', cart._id);
      console.log('Cart ID stored:', cart._id);
    }

    return cart;
  } catch (error) {
    console.error('getCustomerCart error:', error);
    return null;
  }
};

export const addItemToCart = async (
  token: string,
  productId: string | number,
  quantity: number,
) => {
  try {
    const response = await fetch(
      `https://api.sareh-nomow.website/api/client/v1/carts/add-items`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: Number(productId),
          qty: quantity,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to add item to cart: ${JSON.stringify(errorData)}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error('addItemToCart error:', error);
    return null;
  }
};

export const getCartItems = async (token: string) => {
  try {
    const response = await fetch(
      'https://api.sareh-nomow.website/api/client/v1/carts/customer',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error('Failed to fetch cart items');
    }

    const cart = await response.json();
    return cart;
  } catch (error) {
    console.error('getCartItems error:', error);
    return null;
  }
};
export const deleteCartItem = async (
  token: string,
  cart_id: number,
  cart_item_id: number,
) => {
  try {
    const response = await fetch(
      `https://api.sareh-nomow.website/api/client/v1/carts/items/${cart_item_id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('🔴 Backend error on delete:', errorData);
      throw new Error('Failed to delete cart item');
    }

    return true; // Successfully deleted
  } catch (error) {
    console.error('🔥 deleteCartItem failed:', error);
    throw error;
  }
};
export const updateCartItemQuantity = async (
  token: string,
  cartItemId: number,
  cartId: number,
  quantity: number,
) => {
  const qty = Number(quantity); // force convert to number

  console.log(
    `PUT https://api.sareh-nomow.website/api/client/v1/carts/items/${cartItemId}`,
    {
      qty,
      type: typeof qty,
    },
  );

  const response = await fetch(
    `https://api.sareh-nomow.website/api/client/v1/carts/items/${cartItemId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({qty}), // always number
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to update cart item:', errorText);
    Toast.show({
      type: 'error',
      text1: 'Quantity is not available',
      text2: 'The quantity must not be greater',
      position: 'top',
    });
  }

  return await response.json();
};

// ================= HELPER =================

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

export const addOrUpdateCartItem = async (
  token: string,
  cart_id: number,
  product_id: number,
  quantity: number,
) => {
  const cart = await getCustomerCart(token);
  const existingItem = cart.items.find(
    (item: any) => item.product_id === product_id,
  );

  if (existingItem) {
    const newQty = existingItem.qty + quantity;
    return updateCartItemQuantity(
      token,
      existingItem.cart_item_id,
      cart_id,
      newQty,
    );
  } else {
    const response = await fetch(
      `https://api.sareh-nomow.website/api/client/v1/carts/${cart_id}/items`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({product_id, qty: quantity}),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('🔴 Add item error:', errorData);
      throw new Error('Failed to add item to cart');
    }

    return response.json();
  }
};

export const applyCoupon = async (couponCode: string, token: string) => {
  try {
    const response = await fetch(
      `https://api.sareh-nomow.website/api/client/v1/coupons/apply`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          coupon_code: couponCode,
        }),
      },
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to apply coupon');
    }
    return data; // Assumes data contains updated cart with total
  } catch (error) {
    throw error;
  }
};

export const fetchUserProfile = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('Token not found');

    const response = await fetch(
      `https://api.sareh-nomow.website/api/client/v1/auth/verify-token`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const data = await response.json();

    if (data.valid && data.user) {
      return data.user;
    } else {
      throw new Error('Invalid token or user not found');
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const signInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices(); // Ensure device has Google Play Services
    const userInfo = await GoogleSignin.signIn();
    console.log('Google user info:', userInfo);

    // 👉 Send userInfo.idToken to your backend API for verification or login
  } catch (error) {
    console.error('Google Sign-In error:', error);
  }
};

export const searchProducts = async (lang: string, query: string) => {
  try {
    const response = await fetch(
      `https://api.sareh-nomow.website/api/client/v1/products/search?lang=${lang}&q=${encodeURIComponent(
        query,
      )}`,
    );
    if (!response.ok) throw new Error('Failed to search');
    const json = await response.json();
    console.log('✅ Fixed response:', json);
    return json.data || [];
  } catch (error) {
    console.error('Search API error:', error);
    return [];
  }
};

export const fetchSocialMediaLinks = async () => {
  try {
    const response = await fetch(
      'https://api.sareh-nomow.website/api/client/v1/settings',
    );
    const data = await response.json();

    const socialMediaSetting = data.find(
      (item: any) => item.name === 'social_media_links',
    );

    if (socialMediaSetting && socialMediaSetting.is_json) {
      return socialMediaSetting.value;
    }

    return null;
  } catch (error) {
    console.error('Failed to fetch social media links:', error);
    return null;
  }
};

export const getAvailableCurrencies = async () => {
  const res = await fetch(
    'https://api.sareh-nomow.website/api/client/v1/settings',
  );
  const data = await res.json();

  const currencySetting = data.find(
    (item: any) => item.name === 'available_currencies',
  );

  if (currencySetting?.is_json) {
    return currencySetting.value; // Already parsed as array
  }

  try {
    return JSON.parse(currencySetting?.value || '[]'); // Just in case it's a stringified array
  } catch (e) {
    console.error('Failed to parse currencies', e);
    return [];
  }
};
