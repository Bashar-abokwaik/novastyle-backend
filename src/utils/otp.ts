// This file is responsible for generating a One-Time Password (OTP) for user authentication or verification purposes.

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
