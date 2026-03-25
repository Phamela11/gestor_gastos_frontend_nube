interface BudgetWarningProps {
  isOpen: boolean;
  onCancel: () => void;
  onAccept: () => void;
  mensaje: string;
}

const BudgetWarning = ({
  isOpen,
  onCancel,
  onAccept,
  mensaje,
}: BudgetWarningProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md border border-gray-200 shadow-lg">
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100">
            <svg
              className="w-6 h-6 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4v2m0-4v2m0 0a9 9 0 110-18 9 9 0 010 18z"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-xl font-bold text-center text-gray-900 mb-4">
          Advertencia de Presupuesto
        </h2>

        <p className="text-center text-gray-700 mb-6">{mensaje}</p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="flex-1 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetWarning;
