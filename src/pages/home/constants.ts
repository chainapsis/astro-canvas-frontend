import { ChainInfo } from "../../chain-info";
import { defaultBech32Config } from "@everett-protocol/cosmosjs/core/bech32Config";

export type Point = {
  x: number;
  y: number;
  color: string;
};

export type Color = {
  denom: string;
  color: string;
};

export const DenomToColor: {
  [denom: string]: string;
} = {
  uastro: "#ABCDEF",
  test: "#BFABDE"
};

export const AstroHubInfo: ChainInfo = {
  rpc: "http://127.0.0.1:80/rpc",
  rest: "http://127.0.0.1:80/rest",
  chainId: "test",
  chainName: "Astro Hub",
  nativeCurrency: {
    coinDenom: "ASTRO",
    coinMinimalDenom: "uastro",
    coinDecimals: 6
  },
  bech32Config: defaultBech32Config("cosmos")
};

export const AstroZoneInfo: ChainInfo = {
  rpc: "http://127.0.0.1:81/rpc",
  rest: "http://127.0.0.1:81/rest",
  chainId: "test2",
  chainName: "Astro Zone",
  nativeCurrency: {
    coinDenom: "ASTRO",
    coinMinimalDenom: "uastro",
    coinDecimals: 6
  },
  bech32Config: defaultBech32Config("cosmos")
};
