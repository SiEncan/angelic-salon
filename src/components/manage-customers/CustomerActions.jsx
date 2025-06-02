import { useState, useRef, useEffect } from "react"
import { EllipsisVerticalIcon, PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline"

const CustomerActions = ({ customer, onEdit, onDelete, onView }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const dropdownRef = useRef(null)
  const buttonRef = useRef(null)

  // Handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
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

  // Calculate dropdown position
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const scrollY = window.scrollY || window.pageYOffset
      const scrollX = window.scrollX || window.pageXOffset
      const dropdownHeight = 120 // estimation for 3 menu items
      const dropdownWidth = 192 // w-48 = 12rem = 192px

      const viewportHeight = window.innerHeight
      const viewportWidth = window.innerWidth
      const spaceBelow = viewportHeight - rect.bottom
      const spaceRight = viewportWidth - rect.right

      // Determine if dropdown should show above or below
      const showAbove = spaceBelow < dropdownHeight

      // Determine if dropdown should align to left or right
      const alignLeft = spaceRight < dropdownWidth

      const topPosition = showAbove ? rect.top + scrollY - dropdownHeight - 4 : rect.bottom + scrollY + 4

      const leftPosition = alignLeft
        ? rect.left + scrollX - dropdownWidth + rect.width
        : rect.right + scrollX - dropdownWidth

      setDropdownPosition({
        top: Math.max(8, topPosition),
        left: Math.max(8, Math.min(leftPosition, viewportWidth - dropdownWidth - 8)),
      })
    }
  }, [isOpen])

  const toggleDropdown = (e) => {
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  const handleView = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(false)
    onView(customer)
  }

  const handleEdit = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(false)
    onEdit(customer)
  }

  const handleDelete = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(false)
    onDelete(customer)
  }

  return (
    <>
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={toggleDropdown}
          className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-colors"
          type="button"
        >
          <EllipsisVerticalIcon className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {/* Portal-style dropdown positioned absolutely to body */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="fixed w-48 bg-white rounded-md shadow-xl border border-gray-200 z-[9999]"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="py-1">
            <button
              onClick={handleView}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 w-full text-left transition-colors"
              type="button"
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              View Details
            </button>
            <button
              onClick={handleEdit}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 w-full text-left transition-colors"
              type="button"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit Customer
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
              type="button"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete Customer
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default CustomerActions
