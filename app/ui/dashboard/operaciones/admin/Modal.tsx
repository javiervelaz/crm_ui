import { ReactNode } from 'react';

const Modal = ({ onClose, children }: { onClose: () => void; children: ReactNode }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-start sm:items-center z-50 p-3 sm:p-4">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg max-w-4xl w-full relative max-h-[95vh] overflow-y-auto mt-4 sm:mt-0">
        <button
          className="absolute top-0 right-0 mt-2 mr-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          X
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
