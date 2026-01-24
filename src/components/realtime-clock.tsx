"use client";

import { useState, useEffect } from "react";

export function RealtimeClock() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    // Function to format time in GMT-3
    const updateTime = () => {
      const now = new Date();
      
      // Convert to GMT-3 (UTC-3)
      const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
      const gmt3Time = new Date(utcTime + (-3 * 3600000));
      
      // Format as hh:mm:ss AM/PM
      const hours = gmt3Time.getHours();
      const minutes = gmt3Time.getMinutes();
      const seconds = gmt3Time.getSeconds();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      
      const formattedTime = `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm} GMT-3`;
      
      setTime(formattedTime);
    };

    // Update immediately
    updateTime();
    
    // Update every second
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <p className="text-sm tracking-tight">
      {time || "Loading..."}
    </p>
  );
}
