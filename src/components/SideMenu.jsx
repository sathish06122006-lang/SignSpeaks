import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./SideMenu.css";

const FEATURES = [
  { label: "Home", path: "/", icon: "🏠" },
  { label: "Live Detection", path: "/live-detection", icon: "🎥" },
  { label: "Collect Data", path: "/collect-data", icon: "🗂️" },
  { label: "Learn ISL", path: "/learn", icon: "📖" },
  { label: "Tutorials", path: "/tutorials", icon: "🎬" },
  { label: "Dashboard", path: "/dashboard", icon: "📊" },
  { label: "About", path: "/about", icon: "ℹ️" },
  { label: "Contact", path: "/contact", icon: "📞" },
];

export default function SideMenu() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location?.pathname]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    function handleEscape(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleSelect = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <>
      {open && <div className="sm-overlay" />}
      <button
        className="sm-trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="All features menu"
      >
        ⋮
      </button>
      <div className={sm-panel } ref={panelRef}>
        <div className="sm-panel-header">Sign Speaks</div>
        {FEATURES.map((feature) => (
          <button
            key={feature.path}
            className="sm-item"
            onClick={() => handleSelect(feature.path)}
          >
            <span className="sm-icon">{feature.icon}</span>
            <span className="sm-label">{feature.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}
