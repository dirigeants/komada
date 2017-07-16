module.exports = {
  Client: require("./classes/client"),
  PermLevels: require("./classes/permLevels"),
  ArgResolver: require("./classes/argResolver"),
  Resolver: require("./classes/Resolver"),
  Loader: require("./classes/loader"),
  parsedUsage: require("./classes/parsedUsage"),
  version: require("./package").version,
  SettingsGateway: require("./classes/settingGateway"),
  CacheManager: require("./classes/cacheManager"),
  SchemaManager: require("./classes/schemaManager"),
  SQL: require("./classes/sql"),
  settingResolver: require("./classes/settingResolver"),
};
