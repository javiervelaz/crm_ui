import { useState } from 'react';

const SalidaCajaForm = () => {
  const [monto, setMonto] = useState(0);
  const [descripcion, setDescripcion] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Aquí llamamos al endpoint para registrar salida
    await fetch('/api/operaciones/registrar-salida-caja', {
      method: 'POST',
      body: JSON.stringify({ monto, descripcion }),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Monto</label>
      <input
        type="number"
        value={monto}
        onChange={(e) => setMonto(e.target.value)}
        className="p-2 border rounded"
      />
      <label>Descripción</label>
      <input
        type="text"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        className="p-2 border rounded"
      />
      <button type="submit" className="mt-2 bg-blue-500 text-white p-2 rounded">Registrar</button>
    </form>
  );
};

export default SalidaCajaForm;
