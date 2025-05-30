"use client"

import { useState, useRef, useEffect } from "react"
import { EllipsisVerticalIcon, PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline"

const CustomerActions = ({ customer, onEdit, onDelete, onView }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const handleView = (e) => {
    e.stopPropagation()
    onView(customer)
    setIsOpen(false)
  }

  const handleEdit = (e) => {
    e.stopPropagation()
    onEdit(customer)
    setIsOpen(false)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    onDelete(customer)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
        type="button"
      >
        <EllipsisVerticalIcon className="h-5 w-5 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
          <div className="py-1">
            <button
              onClick={handleView}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 w-full text-left"
              type="button"
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              View Details
            </button>
            <button
              onClick={handleEdit}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 w-full text-left"
              type="button"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit Customer
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
              type="button"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete Customer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerActions
