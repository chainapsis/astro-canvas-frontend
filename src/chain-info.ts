import { Bech32Config } from "@everett-protocol/cosmosjs/core/bech32Config";

export interface ChainInfo {
  readonly rpc: string;
  readonly rest: string;
  readonly chainId: string;
  readonly chainName: string;
  readonly nativeCurrency: {
    coinDenom: string;
    coinMinimalDenom: string;
    coinDecimals: number;
  };
  readonly bech32Config: Bech32Config;
}
