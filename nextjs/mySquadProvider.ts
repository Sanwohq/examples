import type { SanwoProviderDefinition } from "@sanwohq/types";

export const mySquadProvider: SanwoProviderDefinition = {
  id: "squad",
  name: "Squad",
  displayName: "Squad Checkout",
  template: "",
  amountInMinorUnit: true,
  supportedCurrencies: ["NGN"],
};
