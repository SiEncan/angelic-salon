// eslint-disable-next-line no-unused-vars
import { X, CheckCircle, XCircle } from "lucide-react"
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion"

// const FeedbackModal = ({ isOpen, type, title, description, onClose, onSuccess }) => {
//   return (
//     <AnimatePresence> 
//       {isOpen && (
//         <>
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.2 }}
//             className="fixed inset-0 bg-black bg-opacity-50 z-50"
//             onClick={onClose}
//           />

//           <motion.div
//             initial={{ opacity: 0, scale: 0.9, y: 20 }}
//             animate={{ opacity: 1, scale: 1, y: 0 }}
//             exit={{ opacity: 0, scale: 0.9, y: 20 }}
//             transition={{ duration: 0.2, ease: "easeInOut" }}
//             className="fixed inset-0 flex justify-center items-center z-50 px-4"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm relative">
//               <div className={`absolute top-0 left-0 right-0 h-3 rounded-t-xl ${type === "success" ? "bg-green-600" : "bg-red-500"}`}/>
//               <div className="text-center">
//                 <div
//                   className={`mx-auto w-16 h-16 flex items-center justify-center rounded-full mt-3 mb-4 ${
//                     type === "success" ? "bg-green-100" : "bg-red-100"
//                   }`}
//                 >
//                   {type === "success" ? (
//                     <CheckCircle className="w-8 h-8 text-green-600" />
//                   ) : (
//                     <XCircle className="w-8 h-8 text-red-600" />
//                   )}
//                 </div>

//                 <h3 className={`text-xl font-bold mb-2 ${type === "success" ? "text-green-700" : "text-red-700"}`}>
//                   {title}
//                 </h3>

//                 <p className="text-gray-600 mb-6">{description}</p>

//                 <button
//                   onClick={() => {
//                     onClose()
//                     if (type === "success" && onSuccess) {
//                       onSuccess()
//                     }
//                   }}
//                   className={`px-6 py-2 rounded-lg font-medium ${
//                     type === "success"
//                       ? "bg-green-600 hover:bg-green-700 text-white"
//                       : "bg-red-600 hover:bg-red-700 text-white"
//                   }`}
//                 >
//                   {type === "success" ? "Ok" : "Coba Lagi"}
//                 </button>
//               </div>
//             </div>
//           </motion.div>
//         </>
//       )}
//     </AnimatePresence>
//   )
// }

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

const FeedbackModal = ({ isOpen, type, title, description, onClose, onSuccess }) => {

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className={`absolute top-0 left-0 right-0 h-2 ${type === "success" ? "bg-green-500" : "bg-red-500"}`}/>

                <div className="mt-4 text-center">
                  <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${type === "success" ? "bg-green-100" : "bg-red-100"}`}>
                    {type === "success" ? <CheckCircle className="h-6 w-6 text-green-600" /> : <XCircle className="h-6 w-6 text-red-600" />}
                  </div>
                  <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                    {title}
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-center space-x-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    onClick={() => {
                    onClose()
                    if (type === "success" && onSuccess) {
                      onSuccess()
                    }
                  }}
                  >
                    Okey
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default FeedbackModal