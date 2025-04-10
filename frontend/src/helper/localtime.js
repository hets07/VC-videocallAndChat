export const convertToLocalTime = (utcTime) => {
    if (!utcTime) return "";
    const date = new Date(utcTime);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };