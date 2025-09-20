export const createOrder = async (orderDetails: any) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    // Aquí enviarás los datos a tu API
    const response = await fetch(`${apiUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderDetails),
    });
    if (!response.ok) {
      throw new Error('Failed to create order');
    }
    return await response.json();
  };
  
  // Otras funciones relacionadas con la API, como obtener órdenes, actualizar órdenes, etc.
  