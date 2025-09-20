"use client"
import { createContext, useContext, useState } from 'react';

interface ModalContextProps {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

// Inicializar el contexto con un valor por defecto
const ModalContext = createContext<ModalContextProps>({
  isOpen: false,
  openModal: () => {}, // Funciones vacías
  closeModal: () => {}, // Funciones vacías
});

export const ModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <ModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);
