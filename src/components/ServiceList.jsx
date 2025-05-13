import { Check, Clock } from "lucide-react";

const ServiceList = ({ serviceOptions, services, handleServiceChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Select Services
      </label>

      <div className="relative">
        {/* Scrollable content */}
        <div className="max-h-[240px] overflow-y-auto pr-1 space-y-2" style={{ overscrollBehaviorY: "contain" }}>
          {serviceOptions.map((service) => (
            <button
              key={service.id}
              onClick={() => handleServiceChange(service.name)}
              className={`px-4 py-3 w-full text-left rounded-lg transition-all ${
                services.includes(service.name)
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
              >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {services.includes(service.name) && (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{service.name}</span>
                </div>
                <span className="font-medium">
                  Rp{Number(service.price).toLocaleString("id-ID")}
                </span>
              </div>
              {service.duration && (
                <div className="text-xs mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{service.duration} min</span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Gradient overlay */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
      </div>
    </div>
  );
};

export default ServiceList;
