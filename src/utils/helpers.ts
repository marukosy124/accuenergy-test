// Get local time by the offset
export const getLocalTimeByOffset = (rawOffset: number, dstOffset: number) => {
  const timeZoneOffset = (rawOffset + dstOffset) * 1000; // Total offset in milliseconds
  return new Date(Date.now() + timeZoneOffset);
};
