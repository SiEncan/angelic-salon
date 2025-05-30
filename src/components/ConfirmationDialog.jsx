// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const ConfirmationDialog = ({ message, onConfirm, onCancel, condition }) => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black z-[200]"
        onClick={onCancel}
      />

      <div className="fixed inset-0 flex items-center justify-center z-[201] px-4">
        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.7, opacity: 0, y: 20 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20,
            duration: 0.3,
          }}
          className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            Confirm Action
          </h3>
          <p className="text-gray-600 mb-6 leading-relaxed whitespace-pre-wrap">
            {message.split(/\s{20,}/).join('\n')}
          </p>

          <div className="flex justify-end gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCancel}
              className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onConfirm}
              className={`px-5 py-2 text-white rounded-lg font-medium transition-colors duration-200 ${
                condition === 'status'
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              Confirm
            </motion.button>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ConfirmationDialog;