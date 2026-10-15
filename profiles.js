// Helpers for namespacing data.json/health.json by profile (email).
// A "whole" object is the full file content: { [emailKey]: { ...per-profile data } }.

// True if `obj`'s top-level keys look like dates (YYYY-MM-DD) rather than
// emails — i.e. it's data saved before multi-profile support existed.
function isLegacyFlatObject(obj) {
  return Object.keys(obj || {}).some((k) => /^\d{4}-\d{2}-\d{2}$/.test(k));
}

function getProfileSlice(wholeObj, profileKey) {
  return (wholeObj && wholeObj[profileKey]) || {};
}

function setProfileSlice(wholeObj, profileKey, sliceObj) {
  return Object.assign({}, wholeObj, { [profileKey]: sliceObj });
}
