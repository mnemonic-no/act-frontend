import { Record, List } from 'immutable';

/**
 * assertHasField asserts that a given record has the supplied field, throwing an error if it don't
 * Useful to catch typo's early on.
 * @param field
 * @param record
 */
export const assertHasField = (field, record) => {
  if (!record.has(field)) {
    throw new Error(`Field: ${field} not in form record: ${record.keySeq().toString()}`);
  }
};

/**
 * keysToKeyValue converts a list of keys to a key value object, where the values are set to the supplied defaultValue
 *
 * keysToKeyValue(["age", "name", "formMessages"], null)
 * =>
 * {
 *   age: null,
 *   name null,
 *   formMessages: null,
 * }
 * @param keys A list of keys
 * @param defaultValue The default value
 */
export const keysToKeyValue = (keys, defaultValue) =>
  keys.reduce((obj, key) => Object.assign({}, obj, { [key]: defaultValue }), {});

/**
 * errorsRecordFromFormFields creates a new Record class to hold error fields, based on the keys from a form fields record
 * Also adds the reserved "formMessages" field.
 * The default values are empty immutable Lists
 *
 * {
 *   age: 24,
 *   name: "Ola Nordmann",
 * }
 * =>
 * Record {
 *   age: List([]),
 *   name: List([]),
 *   formMessages: List([]),
 * }
 *
 * @param fields A form fields record
 */
export const errorsRecordFromFormFields = fields =>
  Record(keysToKeyValue(fields.keySeq().concat('formMessages'), List()));

/**
 * flattenErrors flattens a list of errors to a single object
 * [
 *   { field: "age", error: "to old" },
 *   { field: "age", error: "you are to old" },
 *   { field: "height", error: "to short" },
 * ]
 * =>
 * {
 *   age: ["to old", "you are to old"],
 *   height: ["to short"]
 * }
 */
export const flattenErrors = errorsList =>
  errorsList.reduce((errors, { field, error }) => {
    if (errors[field]) {
      return Object.assign({}, errors, { [field]: errors[field].push(error) });
    } else return Object.assign({}, errors, { [field]: List.of(error) });
  }, {});
