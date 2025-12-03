'use client';

import { useEffect, useState } from 'react';
import {
  listProductoImages,
  uploadProductoImage,
  deleteProductoImage,
  ProductoImagen,
} from '@/app/lib/productoImg.api';
import { notifyError, notifySuccess } from '@/app/lib/notificationService';

interface Props {
  productoId: number;
}

export function ProductoImagenesManager({ productoId }: Props) {
  const [imagenes, setImagenes] = useState<ProductoImagen[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadImages() {
    try {
      setLoading(true);
      const data = await listProductoImages(productoId);
      setImagenes(data);
    } catch (err: any) {
      console.error(err);
      notifyError(err.message ?? 'Error cargando imágenes');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadImages();
  }, [productoId]);

  const handleUpload = async () => {
    if (!file) {
      notifyError('Seleccioná un archivo primero');
      return;
    }
    try {
      setLoading(true);
      await uploadProductoImage(productoId, file);
      notifySuccess('Imagen subida correctamente');
      setFile(null);
      await loadImages();
    } catch (err: any) {
      console.error(err);
      notifyError(err.message ?? 'Error subiendo imagen');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (imgId: number) => {
    try {
      setLoading(true);
      await deleteProductoImage(imgId);
      notifySuccess('Imagen eliminada');
      await loadImages();
    } catch (err: any) {
      console.error(err);
      notifyError(err.message ?? 'Error eliminando imagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 space-y-3 rounded-2xl border bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-900">
        Imágenes del producto
      </h2>

      <div className="flex items-center gap-2">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0] || null;
            setFile(f);
          }}
        />
        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || loading}
          className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
        >
          {loading ? 'Subiendo...' : 'Subir imagen'}
        </button>
      </div>

      {loading && (
        <p className="text-xs text-slate-500">
          Procesando...
        </p>
      )}

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {imagenes.map((img) => (
          <div
            key={img.id}
            className="relative overflow-hidden rounded-xl border bg-slate-50"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={img.descripcion || img.nombre}
              className="h-32 w-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleDelete(img.id)}
              className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-1 text-[10px] font-medium text-white"
            >
              Borrar
            </button>
          </div>
        ))}
        {imagenes.length === 0 && !loading && (
          <p className="col-span-full text-xs text-slate-500">
            Este producto todavía no tiene imágenes.
          </p>
        )}
      </div>
    </div>
  );
}
