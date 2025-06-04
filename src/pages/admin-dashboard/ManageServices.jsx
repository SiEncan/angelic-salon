import { useState, useEffect } from "react";
import {
  ScissorsIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../../firebase";
import {
  doc,
  updateDoc,
  addDoc,
  collection,
  deleteDoc,
  onSnapshot,
  query,
  where,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import FeedbackModal from "../../components/BookingFeedbackModal"

const ManageServices = () => {
  // Modal states
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteType, setDeleteType] = useState(null); // "service" or "category"
  const [itemToDelete, setItemToDelete] = useState(null);

  // Data states
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentService, setCurrentService] = useState({
    name: "",
    price: 0,
    duration: 0,
    description: "",
    categoryId: "",
  });
  const [currentCategory, setCurrentCategory] = useState({
    title: "",
    description: "",
    color: "",
  });
  const [editingService, setEditingService] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [viewingCategory, setViewingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCards, setExpandedCards] = useState({});
  const [activeTab, setActiveTab] = useState("categories"); // "categories" or "services"

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackModalType, setFeedbackModalType] = useState("");  // "success" or "failed"
  const [feedbackModalTitle, setFeedbackModalTitle] = useState("");
  const [feedbackModalDescription, setFeedbackModalDescription] = useState("");

  // Predefined color options for consistency
  const colorOptions = [
    "from-purple-500 to-pink-400",
    "from-blue-500 to-purple-400",
    "from-pink-500 to-red-400",
    "from-green-500 to-teal-400",
    "from-yellow-500 to-amber-400",
    "from-indigo-500 to-blue-400",
    "from-red-500 to-pink-400",
    "from-teal-500 to-green-400",
  ];

  // Fetch categories and services
  useEffect(() => {
    const unsubscribeCategories = onSnapshot(
      collection(db, "serviceCategories"),
      (snapshot) => {
        setCategories(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      }
    );

    const unsubscribeServices = onSnapshot(
      collection(db, "services"),
      (snapshot) => {
        setServices(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      }
    );

    return () => {
      unsubscribeCategories();
      unsubscribeServices();
    };
  }, []);

  // Handle category save
  const handleCategorySave = async () => {
    if (
      !currentCategory.title ||
      !currentCategory.description ||
      !currentCategory.color
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      if (editingCategory) {
        await updateDoc(
          doc(db, "serviceCategories", editingCategory.id),
          currentCategory
        );
      } else {
        await addDoc(collection(db, "serviceCategories"), currentCategory);
      }
      setIsCategoryModalOpen(false);
      resetCategoryForm();

      setFeedbackModalTitle(
        editingCategory ? "Category Updated" : "Category Added"
      );
      setFeedbackModalDescription(
        editingCategory
          ? `${currentCategory.title} has been successfully updated.`
          : `${currentCategory.title} has been successfully added.`
      );
      setFeedbackModalType("success");
      setIsFeedbackModalOpen(true);

    } catch (error) {
      console.error("Error saving category:", error);
      setFeedbackModalTitle("Failed to save category");
      setFeedbackModalDescription("Failed to save category. Please try again.");
      setFeedbackModalType("failed");
      setIsFeedbackModalOpen(true);
    }
  };

  // Handle service save
  const handleServiceSave = async () => {
    if (
      !currentService.name ||
      !currentService.price ||
      !currentService.duration ||
      !currentService.categoryId
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      if (editingService) {
        await updateDoc(doc(db, "services", editingService.id), currentService);
      } else {
        await addDoc(collection(db, "services"), currentService);
      }
      setIsServiceModalOpen(false);
      resetServiceForm();

      if(isViewOpen) {
        setIsViewOpen(false);
      }

      setFeedbackModalTitle(
        editingService ? "Service Updated" : "Service Added"
      );
      setFeedbackModalDescription(
        editingService
          ? `${currentService.name} has been successfully updated.`
          : `${currentService.name} has been successfully added.`
      );
      setFeedbackModalType("success");
      setIsFeedbackModalOpen(true);

    } catch (error) {
      console.error("Error saving service:", error);

      if(isViewOpen) {
        setIsViewOpen(false);
      }

      setFeedbackModalTitle("Failed to save service");
      setFeedbackModalDescription("Failed to save service. Please try again.");
      setFeedbackModalType("failed");
      setIsFeedbackModalOpen(true);
    }
  };

  // Reset forms
  const resetCategoryForm = () => {
    setCurrentCategory({
      title: "",
      description: "",
      color: "",
    });
    setEditingCategory(null);
  };

  const resetServiceForm = () => {
    setCurrentService({
      name: "",
      price: 0,
      duration: 0,
      description: "",
      categoryId: "",
    });
    setEditingService(null);
  };

  // Confirm delete
  const confirmDelete = (type, id) => {
    setDeleteType(type);
    setItemToDelete(id);
    setIsConfirmOpen(true);
  };

  // Handle delete
  const handleDelete = async () => {
    let itemName = "";
    try {
      if (deleteType === "category") {

        const categoryDocRef = doc(db, "serviceCategories", itemToDelete);
        const categoryDoc = await getDoc(categoryDocRef);
        itemName = categoryDoc.data().title;

        // First, delete all services in this category
        const servicesQuery = query(
          collection(db, "services"),
          where("categoryId", "==", itemToDelete)
        );
        const querySnapshot = await getDocs(servicesQuery);

        const deletePromises = querySnapshot.docs.map((doc) =>
          deleteDoc(doc.ref)
        );
        await Promise.all(deletePromises);

        // Then delete the category
        await deleteDoc(doc(db, "serviceCategories", itemToDelete));
      } else if (deleteType === "service") {
        // Delete the service
        const serviceDocRef = doc(db, "services", itemToDelete);
        const serviceDoc = await getDoc(serviceDocRef);
        itemName = serviceDoc.data().name;
        
        await deleteDoc(doc(db, "services", itemToDelete));
      }
      setIsConfirmOpen(false);
      
      if(isViewOpen) {
        setIsViewOpen(false);
      }

      setFeedbackModalTitle(deleteType === "category" ? "Category Deleted" : "Service Deleted");
      setFeedbackModalDescription(`${itemName} has been successfully deleted.`);
      setFeedbackModalType("success");
      setIsFeedbackModalOpen(true);

    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item");

      if(isViewOpen) {
        setIsViewOpen(false);
      }
      setFeedbackModalTitle("Failed to delete item");
      setFeedbackModalDescription(`Failed to ${itemName}. Please try again.`);
      setFeedbackModalType("failed");
      setIsFeedbackModalOpen(true);
      
    }
  };

  // Toggle expanded state for category cards
  const toggleExpanded = (categoryId) => {
    setExpandedCards((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Filter categories and services based on search term
  const filteredCategories = categories.filter((category) =>
    category.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.description &&
        service.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get category by ID (helper function)
  const getCategoryById = (categoryId) => {
    return categories.find((category) => category.id === categoryId);
  };

  return (
    <>
      <div className="mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Service Management
              </h2>
              <p className="text-gray-500">
                Manage salon's service categories and offerings
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400 md:mt-[-20px] lg:mt-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg shadow-md transition duration-300 flex items-center justify-center gap-2"
                  onClick={() => {
                    resetCategoryForm();
                    setIsCategoryModalOpen(true);
                  }}
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Add Category</span>
                </button>
                <button
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 py-2 rounded-lg shadow-md transition duration-300 flex items-center justify-center gap-2"
                  onClick={() => {
                    resetServiceForm();
                    setIsServiceModalOpen(true);
                  }}
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Add Service</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
          <div className="flex">
            <button
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === "categories"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("categories")}
            >
              Categories
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === "services"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("services")}
            >
              Services
            </button>
          </div>
        </div>

        {/* Categories View */}
        {activeTab === "categories" && (
          <>
            {filteredCategories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCategories.map((category) => {
                  const categoryServices = services.filter(
                    (service) => service.categoryId === category.id
                  );
                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white rounded-3xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    >
                      {/* Header */}
                      <div
                        className={`bg-gradient-to-r ${category.color} p-6 text-white`}
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="text-xl font-bold">
                            {category.title}
                          </h3>
                          <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-gray-500 text-xs font-medium">
                            {categoryServices.length} service
                            {categoryServices.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <p className="mt-2 text-white text-opacity-90">
                          {category.description}
                        </p>
                      </div>

                      {/* Expandable Content */}
                      <div className="p-6">
                        <div className="overflow-hidden">
                          <AnimatePresence mode="wait">
                            {expandedCards[category.id] ? (
                              <motion.div
                                key="expanded"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{
                                  duration: 0.3,
                                  ease: "easeInOut",
                                }}
                                className="space-y-3"
                              >
                                {categoryServices.length > 0 ? (
                                  categoryServices.map((service, index) => (
                                    <motion.div
                                      key={service.id}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: index * 0.05 }}
                                      className="border border-gray-100 rounded-lg p-3"
                                    >
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                          <h4 className="font-medium text-gray-900">
                                            {service.name}
                                          </h4>
                                          <p className="text-sm text-gray-600 mt-1">
                                            {service.description}
                                          </p>
                                        </div>
                                        <div className="text-right ml-3">
                                          <p className="font-semibold text-purple-600">
                                            Rp{" "}
                                            {service.price?.toLocaleString(
                                              "id-ID"
                                            )}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                            {service.duration} min
                                          </p>
                                        </div>
                                      </div>
                                    </motion.div>
                                  ))
                                ) : (
                                  <div className="text-center py-4 text-gray-500">
                                    <p>No services in this category</p>
                                    <button
                                      onClick={() => {
                                        setCurrentService({
                                          ...currentService,
                                          categoryId: category.id,
                                        });
                                        setIsServiceModalOpen(true);
                                      }}
                                      className="mt-2 text-purple-600 hover:text-purple-700 font-medium"
                                    >
                                      Add a service
                                    </button>
                                  </div>
                                )}
                              </motion.div>
                            ) : (
                              <>

                                {categoryServices.length > 0 ? (
                                <motion.div
                                  key="collapsed"
                                  initial={{ height: "auto", opacity: 1 }}
                                  animate={{ height: 80, opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{
                                    duration: 0.3,
                                    ease: "easeInOut",
                                  }}
                                  className="relative overflow-hidden"
                                >
                                  <div className="space-y-2">
                                    {categoryServices
                                      .slice(0, 2)
                                      .map((service) => (
                                        <div
                                          key={service.id}
                                          className="flex justify-between items-center"
                                        >
                                          <span className="text-sm font-medium text-gray-700">
                                            {service.name}
                                          </span>
                                          <span className="text-sm text-purple-600">
                                            Rp{" "}
                                            {service.price?.toLocaleString(
                                              "id-ID"
                                            )}
                                          </span>
                                        </div>
                                      ))}
                                  </div>
                                  {categoryServices.length > 2 && (
                                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                                  )}
                                </motion.div>
                                ) : (
                                  <div className="text-center py-4 text-gray-500">
                                    <p>No services in this category</p>
                                    <button
                                      onClick={() => {
                                        setCurrentService({
                                          ...currentService,
                                          categoryId: category.id,
                                        });
                                        setIsServiceModalOpen(true);
                                      }}
                                      className="mt-2 text-purple-600 hover:text-purple-700 font-medium"
                                    >
                                      Add a service
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Expand/Collapse Button */}
                        {categoryServices.length > 0 && (
                          <motion.button
                            onClick={() => toggleExpanded(category.id)}
                            className={`mt-${expandedCards[category.id] ? 4 : 0} text-purple-600 font-medium text-sm flex items-center hover:text-purple-700 transition-colors w-full justify-center`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {expandedCards[category.id]
                              ? "Show less"
                              : "Show more"}
                            <motion.div
                              animate={{
                                rotate: expandedCards[category.id] ? 180 : 0,
                              }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                            >
                              <ChevronDownIcon className="ml-1 h-4 w-4" />
                            </motion.div>
                          </motion.button>
                        )}

                        {/* Action Buttons */}
                        <div className="flex space-x-2 mt-4">
                          <button
                            className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg transition duration-200 flex items-center justify-center gap-1 text-sm"
                            onClick={() => {
                              setViewingCategory({
                                ...category,
                                services: categoryServices,
                              });
                              setIsViewOpen(true);
                            }}
                          >
                            <EyeIcon className="h-4 w-4" />
                            View
                          </button>
                          <button
                            className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-lg transition duration-200 flex items-center justify-center gap-1 text-sm"
                            onClick={() => {
                              setCurrentCategory(category);
                              setEditingCategory(category);
                              setIsCategoryModalOpen(true);
                            }}
                          >
                            <PencilIcon className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg transition duration-200 flex items-center justify-center gap-1 text-sm"
                            onClick={() =>
                              confirmDelete("category", category.id)
                            }
                          >
                            <TrashIcon className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                {searchTerm ? (
                  <>
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <ScissorsIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No categories found
                    </h3>
                    <p className="text-gray-500 mb-6">
                      No categories match your search for "{searchTerm}"
                    </p>
                    <button
                      onClick={() => setSearchTerm("")}
                      className="text-purple-600 hover:text-purple-800 font-medium"
                    >
                      Clear search
                    </button>
                  </>
                ) : (
                  <>
                    <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                      <ScissorsIcon className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No service categories yet
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Get started by adding your first service category
                    </p>
                    <button
                      onClick={() => {
                        resetCategoryForm();
                        setIsCategoryModalOpen(true);
                      }}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg shadow-md transition duration-300 inline-flex items-center gap-2"
                    >
                      <PlusIcon className="h-5 w-5" />
                      <span>Add Category</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {/* Services View */}
        {activeTab === "services" && (
          <>
            {filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredServices.map((service) => {
                  const category = getCategoryById(service.categoryId);
                  return (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    >
                      {category && (
                        <div
                          className={`bg-gradient-to-r ${category.color} h-3`}
                        ></div>
                      )}
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-bold text-gray-800">
                            {service.name}
                          </h3>
                          <div className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                            {service.duration} min
                          </div>
                        </div>

                        {service.description && (
                          <p className="text-gray-600 text-sm mb-4">
                            {service.description}
                          </p>
                        )}

                        <div className="mb-4">
                          <p className="text-2xl font-bold text-pink-600">
                            Rp {service.price?.toLocaleString("id-ID")}
                          </p>
                          {category && (
                            <p className="text-xs text-gray-500 mt-1">
                              Category: {category.title}
                            </p>
                          )}
                        </div>

                        <div className="flex space-x-3">
                          <button
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition duration-200 flex items-center justify-center gap-1"
                            onClick={() => {
                              setCurrentService(service);
                              setEditingService(service);
                              setIsServiceModalOpen(true);
                            }}
                          >
                            <PencilIcon className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg transition duration-200 flex items-center justify-center gap-1"
                            onClick={() => confirmDelete("service", service.id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                {searchTerm ? (
                  <>
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <ScissorsIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No services found
                    </h3>
                    <p className="text-gray-500 mb-6">
                      No services match your search for "{searchTerm}"
                    </p>
                    <button
                      onClick={() => setSearchTerm("")}
                      className="text-purple-600 hover:text-purple-800 font-medium"
                    >
                      Clear search
                    </button>
                  </>
                ) : (
                  <>
                    <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                      <ScissorsIcon className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No services yet
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Get started by adding your first service
                    </p>
                    <button
                      onClick={() => {
                        resetServiceForm();
                        setIsServiceModalOpen(true);
                      }}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg shadow-md transition duration-300 inline-flex items-center gap-2"
                    >
                      <PlusIcon className="h-5 w-5" />
                      <span>Add Service</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Category Modal */}
      <Transition appear show={isCategoryModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-20"
          onClose={() => setIsCategoryModalOpen(false)}
        >
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
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>

                  <Dialog.Title
                    as="h3"
                    className="text-lg font-bold text-gray-900 mt-4 text-center"
                  >
                    {editingCategory
                      ? "Edit Service Category"
                      : "Add New Service Category"}
                  </Dialog.Title>

                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category Title *
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="e.g. Facial, Treatment"
                        value={currentCategory.title}
                        onChange={(e) =>
                          setCurrentCategory({
                            ...currentCategory,
                            title: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        rows={3}
                        placeholder="Brief description of this service category"
                        value={currentCategory.description}
                        onChange={(e) =>
                          setCurrentCategory({
                            ...currentCategory,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Color Theme *
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {colorOptions.map((color) => (
                          <button
                            key={color}
                            type="button"
                            className={`h-10 rounded-md bg-gradient-to-r ${color} border-2 ${
                              currentCategory.color === color
                                ? "border-gray-800"
                                : "border-gray-300"
                            }`}
                            onClick={() =>
                              setCurrentCategory({ ...currentCategory, color })
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      onClick={() => setIsCategoryModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-medium text-white hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      onClick={handleCategorySave}
                    >
                      {editingCategory ? "Update Category" : "Add Category"}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Add/Edit Service Modal */}
      <Transition appear show={isServiceModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-30"
          onClose={() => setIsServiceModalOpen(false)}
        >
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
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>

                  <Dialog.Title
                    as="h3"
                    className="text-lg font-bold text-gray-900 mt-4 text-center"
                  >
                    {editingService ? "Edit Service" : "Add New Service"}
                  </Dialog.Title>

                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Service Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="e.g. Haircut, Manicure"
                        value={currentService.name}
                        onChange={(e) =>
                          setCurrentService({
                            ...currentService,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        rows={2}
                        placeholder="Brief description of this service"
                        value={currentService.description || ""}
                        onChange={(e) =>
                          setCurrentService({
                            ...currentService,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price (Rp) *
                        </label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="e.g. 150000"
                          value={currentService.price}
                          onChange={(e) =>
                            setCurrentService({
                              ...currentService,
                              price: Number.parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duration (minutes) *
                        </label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="e.g. 30, 60, 90"
                          value={currentService.duration}
                          onChange={(e) =>
                            setCurrentService({
                              ...currentService,
                              duration: Number.parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        value={currentService.categoryId}
                        onChange={(e) =>
                          setCurrentService({
                            ...currentService,
                            categoryId: e.target.value,
                          })
                        }
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.title}
                          </option>
                        ))}
                      </select>
                      {categories.length === 0 && (
                        <p className="text-sm text-red-500 mt-1">
                          Please create a category first before adding services.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      onClick={() => {
                        setIsServiceModalOpen(false);
                        resetServiceForm();
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-medium text-white hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      onClick={handleServiceSave}
                      disabled={categories.length === 0}
                    >
                      {editingService ? "Update Service" : "Add Service"}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* View Category Modal */}
      <Transition appear show={isViewOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-20"
          onClose={() => setIsViewOpen(false)}
        >
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
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                  {viewingCategory && (
                    <>
                      {/* Header */}
                      <div
                        className={`bg-gradient-to-r ${viewingCategory.color} p-6 text-white`}
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="text-xl font-bold">
                            {viewingCategory.title}
                          </h3>
                          <span className="bg-white bg-opacity-20 text-gray-500 px-2 py-1 rounded-full text-xs font-medium">
                            {viewingCategory.services.length} service
                            {viewingCategory.services.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <p className="mt-2 text-white text-opacity-90">
                          {viewingCategory.description}
                        </p>
                      </div>

                      {/* Services */}
                      <div className="p-6">
                        <h4 className="font-semibold text-gray-900 mb-4">
                          Services
                        </h4>
                        <div className="space-y-4 max-h-80 overflow-y-auto">
                          {viewingCategory.services.length > 0 ? (
                            <>
                              {viewingCategory.services.map((service) => (
                                <div
                                  key={service.id}
                                  className="border border-gray-100 rounded-lg py-4 pl-4 pr-4 flex justify-between items-start"
                                >
                                  <div className="flex-1">
                                    <h5 className="font-medium text-gray-900">{service.name}</h5>
                                    <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                                  </div>

                                  <div className="flex items-center ml-4">
                                    <div className="text-right mr-6">
                                      <p className="font-semibold text-purple-600">
                                        Rp {service.price?.toLocaleString("id-ID")}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {service.duration} minutes
                                      </p>
                                    </div>

                                    <div className="flex flex-col space-y-2">
                                      <button
                                        onClick={() => {
                                          setCurrentService(service);
                                          setEditingService(service);
                                          setIsServiceModalOpen(true);
                                        }}
                                        className="text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 hover:bg-blue-100 rounded-lg p-2 flex items-center justify-center h-full"
                                      >
                                        <PencilIcon className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => confirmDelete("service", service.id)}
                                        className="text-red-600 hover:text-red-700 transition-colors bg-red-50 hover:bg-red-100 rounded-lg p-2 flex items-center justify-center h-full"
                                      >
                                        <TrashIcon className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {/* Align right */}
                              <div className="flex justify-center">
                                <button
                                  onClick={() => {
                                    setCurrentService({
                                      ...currentService,
                                      categoryId: viewingCategory.id,
                                    });
                                    setIsServiceModalOpen(true);
                                  }}
                                  className="border border-gray-100 rounded-lg w-full px-4 py-2 mt-0 text-sm text-purple-600 hover:text-purple-700 font-medium"
                                >
                                  + Add a service
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <p>No services in this category</p>
                              <button
                                onClick={() => {
                                  setCurrentService({
                                    ...currentService,
                                    categoryId: viewingCategory.id,
                                  });
                                  setIsServiceModalOpen(true);
                                }}
                                className="mt-2 text-purple-600 hover:text-purple-700 font-medium"
                              >
                                Add a service
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="mt-6 flex justify-end">
                          <button
                            type="button"
                            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            onClick={() => setIsViewOpen(false)}
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Confirmation Dialog */}
      <Transition appear show={isConfirmOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-30"
          onClose={() => setIsConfirmOpen(false)}
        >
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
                  <div className="absolute top-0 left-0 right-0 h-2 bg-red-500"></div>

                  <div className="mt-4 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                      <TrashIcon className="h-6 w-6 text-red-600" />
                    </div>
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium text-gray-900"
                    >
                      Delete{" "}
                      {deleteType === "category"
                        ? "Service Category"
                        : "Service"}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {deleteType === "category"
                          ? "Are you sure you want to delete this service category? All services in this category will also be deleted. This action cannot be undone."
                          : "Are you sure you want to delete this service? This action cannot be undone."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-center space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      onClick={() => setIsConfirmOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                      onClick={handleDelete}
                    >
                      Delete
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        type={feedbackModalType}
        title={feedbackModalTitle}
        description={feedbackModalDescription}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
      
    </>
  );
};

export default ManageServices;
