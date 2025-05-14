const ConfirmationDialog = ({ message, onConfirm, onCancel }) => {
  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[200]"
        onClick={onCancel}
      />
      <div className="fixed inset-0 flex items-center justify-center z-[201]">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
          <h3 className="text-lg font-medium mb-4">Confirm Action</h3>
          <p className="text-gray-600 mb-6 whitespace-pre-wrap">
            {message.split(/\s{20,}/).join("\n")}
          </p>

          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmationDialog;
