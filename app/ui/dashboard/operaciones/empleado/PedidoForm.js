import { useState } from 'react';

const PedidoForm = () => {
  const [montoTotal, setMontoTotal] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Aquí llamamos al endpoint para registrar pedido
    await fetch('/api/operaciones/crear-pedido', {
      method: 'POST',
      body: JSON.stringify({ montoTotal }),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Monto Total</label>
      <input
        type="number"
        value={montoTotal}
        onChange={(e) => setMontoTotal(e.target.value)}
        className="p-2 border rounded"
      />
      <button type="submit" className="mt-2 bg-blue-500 text-white p-2 rounded">Registrar</button>
    </form>
  );
};

export default PedidoForm;
