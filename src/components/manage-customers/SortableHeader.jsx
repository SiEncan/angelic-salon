import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline"

const SortableHeader = ({ display, label, onSort, sortOrder }) => {
  const toggleSort = () => {
    onSort(label)
  }

  return (
    <th className="px-4 py-3 text-left cursor-pointer" onClick={toggleSort}>
      <div className="flex items-center text-gray-600 font-medium space-x-1 hover:text-purple-600 transition-colors">
        <span>{display}</span>
        {sortOrder === "asc" ? (
          <ChevronUpIcon className="w-4 h-4 text-purple-600" />
        ) : sortOrder === "desc" ? (
          <ChevronDownIcon className="w-4 h-4 text-purple-600" />
        ) : (
          <ChevronDownIcon className="w-4 h-4 text-gray-400" />
        )}
      </div>
    </th>
  )
}

export default SortableHeader
