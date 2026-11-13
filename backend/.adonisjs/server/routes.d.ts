import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'auth.login': { paramsTuple?: []; params?: {} }
    'entries.index': { paramsTuple?: []; params?: {} }
    'entries.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'images.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'memoire.show': { paramsTuple?: []; params?: {} }
    'auth.me': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'entries.store': { paramsTuple?: []; params?: {} }
    'entries.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'entries.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'entries.move': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'images.store': { paramsTuple?: []; params?: {} }
    'memoire.update': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'entries.index': { paramsTuple?: []; params?: {} }
    'entries.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'images.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'memoire.show': { paramsTuple?: []; params?: {} }
    'auth.me': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'entries.index': { paramsTuple?: []; params?: {} }
    'entries.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'images.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'memoire.show': { paramsTuple?: []; params?: {} }
    'auth.me': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'entries.store': { paramsTuple?: []; params?: {} }
    'images.store': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'entries.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'memoire.update': { paramsTuple?: []; params?: {} }
  }
  DELETE: {
    'entries.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PATCH: {
    'entries.move': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}