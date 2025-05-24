import { Gender } from "./../../database/model/User";

export const validateCIC = (
  cic: string,
  dob: string | Date,
  gender: Gender
) => {
  const CCCD_LENGTH = 12;
  const PROVINCE_MIN = 1;
  const PROVINCE_MAX = 96;

  if (cic.length !== CCCD_LENGTH) return false;

  const dobDate = new Date(dob);
  if (isNaN(dobDate.getTime())) return false;

  const provinceCode = parseInt(cic.slice(0, 3));
  const genderCenturyCode = parseInt(cic[3]);
  const birthYear = parseInt(cic.slice(4, 6));

  if (provinceCode < PROVINCE_MIN || provinceCode > PROVINCE_MAX) return false;
  if (
    isNaN(genderCenturyCode) ||
    genderCenturyCode < 0 ||
    genderCenturyCode > 9
  )
    return false;
  if (isNaN(birthYear) || birthYear < 0 || birthYear > 99) return false;

  const fullBirthYear =
    1900 + Math.floor(genderCenturyCode / 2) * 100 + birthYear;
  const yearDob = dobDate.getUTCFullYear();
  if (fullBirthYear > new Date().getFullYear() || yearDob !== fullBirthYear)
    return false;
  if (gender === "other") {
  } else if (
    (genderCenturyCode % 2 === 0 && gender !== "male") ||
    (genderCenturyCode % 2 !== 0 && gender !== "female")
  ) {
    return false;
  }
  return true;
};
