import { useLocation, useNavigate } from "react-router";
import { QRCodeSVG } from "qrcode.react";
import { X, Info } from "lucide-react";

interface CardState {
  P_Date: string;
  P_time: string;
  P_tracking: string;
  P_hash: string;
  timeWithAddition: string;
  qrString: string;
}

export default function PrivilegeCard() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Try to get state from navigation or sessionStorage
  let state = location.state as CardState | null;
  
  if (!state) {
    const savedData = sessionStorage.getItem("privilegeCardData");
    if (savedData) {
      state = JSON.parse(savedData);
    }
  }

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F5F6F8" }}>
        <div className="text-center">
          <p className="text-gray-600 mb-4">No card data found</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string): string => {
    // Convert YYYYMMDD to "DD MMM YYYY"
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    
    const monthIndex = parseInt(month) - 1;
    return `${day} ${monthNames[monthIndex]} ${year}`;
  };

  const formatTime = (timeStr: string): string => {
    // Convert HHMM to "HH:MM"
    const hours = timeStr.substring(0, 2);
    const minutes = timeStr.substring(2, 4);
    return `${hours}:${minutes}`;
  };

  const handleCancel = () => {
    // Clear sessionStorage when canceling
    sessionStorage.removeItem("privilegeCardData");
    navigate("/");
  };

  return (
    <div className="min-h-screen relative bg-white md:bg-[#F5F6F8]">
      {/* Top gradient section */}
      <div 
        className="absolute top-0 left-0 right-0 hidden md:block"
        style={{
          height: "35vh",
          background: "linear-gradient(to bottom, #CFEED6, #E9F7EC)",
        }}
      />
      
      {/* Close button */}
      <button
        onClick={handleCancel}
        className="absolute top-2 right-6 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors md:top-6"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Main card container */}
      <div className="relative flex min-h-screen items-start justify-center px-0 pt-10 pb-4 md:items-center md:p-4 md:pt-24 md:pb-24">
        <div 
          className="w-full max-w-none bg-white p-8 shadow-none rounded-none md:max-w-[420px] md:shadow-xl md:rounded-[28px] md:min-h-0"
        >
          {/* Date and Time */}
          <div className="text-center mb-6">
            <div className="text-[22px] mb-1">{formatDate(state.P_Date)}</div>
            <div className="text-[26px]">{formatTime(state.P_time)}</div>
          </div>

          {/* Yellow QR Container */}
          <div 
            className="p-4 mb-6 relative"
            style={{ borderRadius: "14px" }}
          >
            {/* QR Code */}
            <div className="bg-white p-4 flex items-center justify-center" style={{ borderRadius: "8px" }}>
              <QRCodeSVG
                value={state.qrString}
                size={176}
                level="M"
                includeMargin={false}
              />
            </div>
          </div>

          {/* Tracking Number */}
          <div className="text-center text-[21px] font-medium mt-3 mb-6" style={{ letterSpacing: "0.5px" }}>
            {state.P_tracking}
          </div>

          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-6">
            <div 
              className="w-12 h-12 rounded-full bg-gray-200 mb-2 flex items-center justify-center"
            >
              <span className="text-lg font-semibold text-gray-700">م</span>
            </div>
            <span className="text-[15px] font-medium text-gray-500">You</span>
          </div>

          {/* Message */}
          <div className="text-center text-gray-700 mb-6">
            <div>⏳ It's time for your blessed visit.</div>
            <div>Please proceed.</div>
          </div>

          {/* Cancel Button */}
          <div className="text-center">
            <button
              onClick={handleCancel}
              className="text-red-600 hover:text-red-700 transition-colors"
            >
              Cancel booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
