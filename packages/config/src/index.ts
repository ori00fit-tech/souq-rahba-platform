export const appConfig = {
  appName: "Souq Ma Zellige",
  defaultCurrency: "MAD",
  supportedLocales: ["ar", "fr", "en"] as const,
  marketplace: {
    codEnabled: true,
    sellerKycRequired: true,
    invoicePrefix: "SMZ"
  }
};
