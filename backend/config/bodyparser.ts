import { defineConfig } from '@adonisjs/core/bodyparser'

const bodyParserConfig = defineConfig({
  /**
   * Parse request bodies for these HTTP methods.
   * Keep this aligned with methods that receive payloads in your routes.
   */
  allowedMethods: ['POST', 'PUT', 'PATCH', 'DELETE'],

  /**
   * Config for the "application/x-www-form-urlencoded"
   * content-type parser.
   */
  form: {
    /**
     * Normalize empty string values to null.
     */
    convertEmptyStringsToNull: true,

    /**
     * Content types handled by the form parser.
     */
    types: ['application/x-www-form-urlencoded'],
  },

  /**
   * Config for the JSON parser.
   */
  json: {
    /**
     * Keep empty strings: entries default `content` to ''.
     */
    convertEmptyStringsToNull: false,

    /**
     * Keep whitespace as sent: the mémoire stores text runs whose leading and trailing
     * spaces separate words. Validators trim the fields that need it.
     */
    trimWhitespaces: false,

    /**
     * The mémoire is saved as one JSON document; the API caps it at 2 MB, so the
     * parser must accept slightly more than that to report a 422 instead of a 413.
     */
    limit: '3mb',

    /**
     * Content types handled by the JSON parser.
     */
    types: [
      'application/json',
      'application/json-patch+json',
      'application/vnd.api+json',
      'application/csp-report',
    ],
  },

  /**
   * Config for the "multipart/form-data" content-type parser.
   * File uploads are handled by the multipart parser.
   */
  multipart: {
    /**
     * Automatically process uploaded files into the system tmp directory.
     */
    autoProcess: true,

    /**
     * Normalize empty string values to null.
     */
    convertEmptyStringsToNull: true,

    /**
     * Routes where multipart processing is handled manually.
     */
    processManually: [],

    /**
     * Images are capped at 5 MB; the extra headroom covers multipart framing.
     */
    limit: '6mb',

    /**
     * Content types handled by the multipart parser.
     */
    types: ['multipart/form-data'],
  },
})

export default bodyParserConfig
