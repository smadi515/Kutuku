import AsyncStorage from '@react-native-async-storage/async-storage';

// ================= AUTH =================
export const login = async (email: string, password: string) => {
  const apiUrl = 'https://api.sareh-nomow.website/api/auth/login';

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
  const apiUrl = 'https://api.sareh-nomow.website/api/auth/register';

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
  const apiUrl = 'https://api.sareh-nomow.website/api/auth/verify-otp';

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
export const getProducts = async (categoryId?: number, brandId?: number) => {
  try {
    let query = [];
    if (categoryId) query.push(`categoryId=${categoryId}`);
    if (brandId) query.push(`brandId=${brandId}`);

    const queryString = query.length > 0 ? `?${query.join('&')}` : '';
    const response = await fetch(
      `https://api.sareh-nomow.xyz/api/products${queryString}`,
    );
    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error('getProducts error:', error);
    throw error;
  }
};

export const getProductById = async (productId: number) => {
  try {
    const response = await fetch(
      `https://api.sareh-nomow.xyz/api/products/${productId}`,
    );
    const json = await response.json();
    return json;
  } catch (error) {
    console.error('getProductById error:', error);
    throw error;
  }
};

// ================= CATEGORIES =================
export const getParentCategories = async () => {
  try {
    const response = await fetch(
      'https://api.sareh-nomow.website/api/categories?parentId=null',
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
      `https://api.sareh-nomow.website/api/categories?parentId=${parentId}`,
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
    const response = await fetch('https://api.sareh-nomow.website/api/brands');
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
  const apiUrl = 'https://api.sareh-nomow.website/api/addresses';

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
      'https://api.sareh-nomow.website/api/carts/customer',
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
        'https://api.sareh-nomow.website/api/carts',
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
export const createCart = async (token: string) => {
  try {
    const response = await fetch('https://api.sareh-nomow.website/api/carts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json', // <-- Add this
      },
    });
    console.log('Token passed to createCart:', token);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('createCart API error response:', errorData);
      throw new Error('Failed to create cart');
    }

    const data = await response.json();
    console.log('Cart created successfully:', data);
    return data;
  } catch (error) {
    console.error('createCart error:', error);
    return null;
  }
};

export const addItemToCart = async (
  token: string,
  cartId: number,
  productId: string | number,
  quantity: number,
) => {
  try {
    const response = await fetch(
      `https://api.sareh-nomow.website/api/carts/${cartId}/items`,
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
      'https://api.sareh-nomow.website/api/carts/customer',
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
      `https://api.sareh-nomow.website/api/carts/${cart_id}/items/${cart_item_id}`,
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
  console.log(
    `PUT https://api.sareh-nomow.website/api/carts/${cartId}/items/${cartItemId}`,
    {
      qty: quantity,
    },
  );

  const response = await fetch(
    `https://api.sareh-nomow.website/api/carts/${cartId}/items/${cartItemId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({qty: quantity}),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to update cart item:', errorText);
    throw new Error(`Failed to update cart item. Status: ${response.status}`);
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
      `https://api.sareh-nomow.website/api/carts/${cart_id}/items`,
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

export const applyCoupon = async (
  cartId: number,
  couponCode: string,
  token: string,
) => {
  try {
    const response = await fetch(
      `https://api.sareh-nomow.website/api/coupons/apply`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cart_id: cartId,
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
      `https://api.sareh-nomow.xyz/api/auth/verify-token`,
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
