'use client';


const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export interface ProductoImagen {
  id: number;
  producto_id: number;
  nombre: string;
  descripcion: string;
  url: string;
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}

export async function uploadProductoImage(
  productId: number,
  file: File,
): Promise<ProductoImagen> {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${apiUrl}/producto/${productId}/images`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      // NO poner Content-Type, fetch lo setea solo para formData
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Error subiendo imagen');
  }
  return res.json();
}

export async function listProductoImages(
  productId: number,
): Promise<ProductoImagen[]> {
  const res = await fetch(`${apiUrl}/producto/${productId}/images`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Error obteniendo imágenes');
  }

  return res.json();
}

export async function deleteProductoImage(imgId: number): Promise<void> {
  const res = await fetch(`${apiUrl}/producto/images/${imgId}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) {
    throw new Error('Error eliminando imagen');
  }
}
