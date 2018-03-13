/**
 * @description Provider a transformer that can be used in .map
 * @param {Object} resource
 * @param {string[]} fields
 * @returns {Object}
 */
exports.filteredAttributesTransformer = function(fields) {
  return function(rawObject) {
    return Object.keys(rawObject)
      .filter(field => fields.includes(field))
      .reduce((filteredObject, field) => {
        filteredObject[field] = rawObject[field];
        return filteredObject;
      }, {});
  };
};
