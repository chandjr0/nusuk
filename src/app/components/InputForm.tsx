import { useState } from "react";
import { useNavigate } from "react-router";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon, Clock } from "lucide-react";

export default function InputForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    P_Date: "",
    P_time: "",
    P_tracking: "1142418259",
  });

  const [errors, setErrors] = useState({
    P_Date: "",
    P_time: "",
    P_tracking: "",
  });

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const validateField = (name: string, value: string) => {
    switch (name) {
      case "P_Date":
        if (value.length !== 8 || !/^\d{8}$/.test(value)) {
          return "Must be exactly 8 numeric digits (YYYYMMDD)";
        }
        break;
      case "P_time":
        if (value.length !== 4 || !/^\d{4}$/.test(value)) {
          return "Must be exactly 4 numeric digits (HHMM)";
        }
        const hours = parseInt(value.substring(0, 2));
        const minutes = parseInt(value.substring(2, 4));
        if (hours > 23 || minutes > 59) {
          return "Invalid time format";
        }
        break;
      case "P_tracking":
        if (value.length !== 10 || !/^\d{10}$/.test(value)) {
          return "Must be exactly 10 numeric digits";
        }
        break;
    }
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      // Format date as YYYYMMDD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}${month}${day}`;
      setFormData((prev) => ({ ...prev, P_Date: dateStr }));
      setErrors((prev) => ({ ...prev, P_Date: "" }));
      setIsDatePickerOpen(false);
    }
  };

  const addMinutesToTime = (time: string, minutesToAdd: number): string => {
    const hours = parseInt(time.substring(0, 2));
    const minutes = parseInt(time.substring(2, 4));
    
    let totalMinutes = hours * 60 + minutes + minutesToAdd;
    
    // Handle day rollover
    if (totalMinutes >= 24 * 60) {
      totalMinutes = totalMinutes % (24 * 60);
    }
    
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    
    return String(newHours).padStart(2, "0") + String(newMinutes).padStart(2, "0");
  };

  const isValidDate = (date: string): boolean => /^\d{8}$/.test(date);

  const isValidTime = (time: string): boolean => {
    if (!/^\d{4}$/.test(time)) {
      return false;
    }
    const hours = parseInt(time.substring(0, 2));
    const minutes = parseInt(time.substring(2, 4));
    return hours <= 23 && minutes <= 59;
  };

  const getComputedHash = (tracking: string, date: string, time: string): string => {
    if (!/^\d{10}$/.test(tracking) || !isValidDate(date) || !isValidTime(time)) {
      return "";
    }
    const timeWithAddition = addMinutesToTime(time, 20);
    return `${tracking}AF${date}${time}${date}${timeWithAddition}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {
      P_Date: validateField("P_Date", formData.P_Date),
      P_time: validateField("P_time", formData.P_time),
      P_tracking: validateField("P_tracking", formData.P_tracking),
    };
    
    setErrors(newErrors);
    
    // Check if there are any errors
    if (Object.values(newErrors).some((error) => error !== "")) {
      return;
    }
    
    // Calculate time + 20 minutes
    const timeWithAddition = addMinutesToTime(formData.P_time, 20);
    const computedHash = getComputedHash(formData.P_tracking, formData.P_Date, formData.P_time);
    
    // P_hash formula: P_tracking + AF + P_Date + P_time + P_Date + (P_time + 20)
    const qrString = computedHash;
    
    const cardData = {
      ...formData,
      P_hash: computedHash,
      timeWithAddition,
      qrString,
    };
    
    // Save to sessionStorage
    sessionStorage.setItem("privilegeCardData", JSON.stringify(cardData));
    
    // Navigate to card page with data
    navigate("/card", {
      state: cardData,
    });
  };

  const computedHash = getComputedHash(formData.P_tracking, formData.P_Date, formData.P_time);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#F5F6F8" }}>
      <div 
        className="w-full max-w-[420px] bg-white p-8 shadow-lg"
        style={{ borderRadius: "24px" }}
      >
        <h1 className="text-2xl mb-6 text-center">Generate Privilege Card</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="P_Date" className="block text-sm mb-1.5">
              P_Date
            </label>
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 flex items-center justify-between text-left"
                >
                  <span className={formData.P_Date ? "" : "text-gray-400"}>
                    {formData.P_Date || "20260304"}
                  </span>
                  <CalendarIcon className="w-4 h-4 text-gray-500" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.P_Date && (
              <p className="text-red-500 text-xs mt-1">{errors.P_Date}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Format: YYYYMMDD (8 digits)</p>
          </div>

          <div>
            <label htmlFor="P_time" className="block text-sm mb-1.5">
              P_time
            </label>
            <div className="relative">
              <input
                type="text"
                id="P_time"
                name="P_time"
                value={formData.P_time}
                onChange={handleChange}
                placeholder="1620"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 pr-10"
              />
              <Clock className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
            {errors.P_time && (
              <p className="text-red-500 text-xs mt-1">{errors.P_time}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Format: HHMM 24-hour (4 digits)</p>
          </div>

          <div>
            <label htmlFor="P_tracking" className="block text-sm mb-1.5">
              P_tracking
            </label>
            <input
              type="text"
              id="P_tracking"
              name="P_tracking"
              value={formData.P_tracking}
              onChange={handleChange}
              placeholder="1142418259"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
            {errors.P_tracking && (
              <p className="text-red-500 text-xs mt-1">{errors.P_tracking}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">10 digits required</p>
          </div>

          <div>
            <label htmlFor="P_hash" className="block text-sm mb-1.5">
              P_hash
            </label>
            <input
              type="text"
              id="P_hash"
              name="P_hash"
              value={computedHash}
              placeholder="Auto-generated from P_tracking + AF + P_Date + P_time + P_Date + (P_time+20)"
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Auto formula: P_tracking + AF + P_Date + P_time + P_Date + (P_time + 20)</p>
          </div>

          <button
            type="submit"
            className="w-full text-black py-4 rounded-xl mt-6 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#F4B400", borderRadius: "14px", height: "52px" }}
          >
            Generate Privilege Card
          </button>
        </form>
      </div>
    </div>
  );
}
