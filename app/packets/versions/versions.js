const versions = {
  defaultVersion: 575,
  supportedVersions: [ 575 ],

  // id, name
  575: "1.15.1",
  573: "1.15",
  498: "1.14.4",
  490: "1.14.3",
  485: "1.14.2",
  480: "1.14.1",
  477: "1.14",
  404: "1.13.2",
  401: "1.13.1",
  393: "1.13",
  340: "1.12.2",
  338: "1.12.1",
  335: "1.12",
  316: "1.11.2",
  315: "1.11",
  210: "1.10.2",
  110: "1.9.4",
  109: "1.9.2",
  108: "1.9.1",
  107: "1.9",
  47: "1.8.9",
  5: "1.7.10",
  4: "1.7.5",

  // name, id
  "1.15.1": 575,
  "1.15": 573,
  "1.14.4": 498,
  "1.14.3": 490,
  "1.14.2": 485,
  "1.14.1": 480,
  "1.14": 477,
  "1.13.2": 404,
  "1.13.1": 401,
  "1.13": 393,
  "1.12.2": 340,
  "1.12.1": 338,
  "1.12": 335,
  "1.11.2": 316,
  "1.11.1": 316,
  "1.11": 315,
  "1.10.2": 210,
  "1.10.1": 210,
  "1.10": 210,
  "1.9.4": 110,
  "1.9.3": 110,
  "1.9.2": 109,
  "1.9.1": 108,
  "1.9": 107,
  "1.8.9": 47,
  "1.8.8": 47,
  "1.8.7": 47,
  "1.8.6": 47,
  "1.8.5": 47,
  "1.8.4": 47,
  "1.8.3": 47,
  "1.8.2": 47,
  "1.8.1": 47,
  "1.7.10": 5,
  "1.7.9": 5,
  "1.7.8": 5,
  "1.7.7": 5,
  "1.7.6": 5,
  "1.7.5": 4,
  "1.7.3": 4,
  "1.7.2": 4,

  /**
   * Get the version number from a version name or number
   * 
   * @param {(string|number)} version string or number
   * @return {number} Protocol version number
   * @throws {Error} Will throw if version name or number is not found
   */
  getVersonNumber: (version) => {
    if (!version) return versions.defaultVersion;
    if (!(version in versions)) throw new Error("Version not found");
    if (typeof version === "number") return version;
    return versions[version];
  }
}

module.exports = versions;