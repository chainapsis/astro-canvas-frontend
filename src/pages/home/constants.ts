import { ChainInfo } from "../../chain-info";
import { defaultBech32Config } from "@everett-protocol/cosmosjs/core/bech32Config";

export const AstroHubInfo: ChainInfo = {
  rpc: "http://34.94.36.216:80/rpc",
  rest: "http://34.94.36.216:80/rest",
  chainId: "astrohub-1",
  chainName: "Astro Hub",
  nativeCurrency: {
    coinDenom: "HUB",
    coinMinimalDenom: "uhub",
    coinDecimals: 6
  },
  bech32Config: defaultBech32Config("hub")
};

export const AstroZoneInfo: ChainInfo = {
  rpc: "http://35.235.73.59:80/rpc",
  rest: "http://35.235.73.59:80/rest",
  chainId: "astrocanvas-1",
  chainName: "Astro Zone",
  nativeCurrency: {
    coinDenom: "ASTRO",
    coinMinimalDenom: "uastro",
    coinDecimals: 6
  },
  bech32Config: defaultBech32Config("astro")
};

export const HubToZone = {
  transfer: {
    channelId: "amqggnvske",
    portId: "transfer"
  },
  interchainAccount: {
    channelId: "amqggnvska",
    portId: "interchainaccount"
  }
};

export const ZoneToHub = {
  transfer: {
    channelId: "cljcoxvqrm",
    portId: "transfer"
  },
  interchainAccount: {
    channelId: "cljcoxvqra",
    portId: "interchainaccount"
  }
};

export const CanvasId = "genesis";

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
  // validator1
  [`${ZoneToHub.interchainAccount.portId}/${ZoneToHub.interchainAccount.channelId}/ccadac5f/stake`]: "#E23EFF",
  // validator2
  [`${ZoneToHub.interchainAccount.portId}/${ZoneToHub.interchainAccount.channelId}/b39a40ab/stake`]: "#92E233",
  // validator3
  [`${ZoneToHub.interchainAccount.portId}/${ZoneToHub.interchainAccount.channelId}/87578850/stake`]: "#A16A3F",
  // validator4
  [`${ZoneToHub.interchainAccount.portId}/${ZoneToHub.interchainAccount.channelId}/729a464b/stake`]: "#820281",
  // validator5
  [`${ZoneToHub.interchainAccount.portId}/${ZoneToHub.interchainAccount.channelId}/d68b66dc/stake`]: "#888789",
  // validator6
  [`${ZoneToHub.interchainAccount.portId}/${ZoneToHub.interchainAccount.channelId}/502d096c/stake`]: "#E4E4E4",
  // validator7
  [`${ZoneToHub.interchainAccount.portId}/${ZoneToHub.interchainAccount.channelId}/1ed1caa4/stake`]: "#FFA6D1",
  // validator8
  [`${ZoneToHub.interchainAccount.portId}/${ZoneToHub.interchainAccount.channelId}/061aaaac/stake`]: "#01E5F2",
  // validator9
  [`${ZoneToHub.interchainAccount.portId}/${ZoneToHub.interchainAccount.channelId}/6bdad30e/stake`]: "#0082CA",
  // validator10
  [`${ZoneToHub.interchainAccount.portId}/${ZoneToHub.interchainAccount.channelId}/820fa0b7/stake`]: "#00C000",
  // validator11
  [`${ZoneToHub.interchainAccount.portId}/${ZoneToHub.interchainAccount.channelId}/aec5285b/stake`]: "#E79700",
  // validator12
  [`${ZoneToHub.interchainAccount.portId}/${ZoneToHub.interchainAccount.channelId}/7e286333/stake`]: "#E6DB00",
  // validator13
  [`${ZoneToHub.interchainAccount.portId}/${ZoneToHub.interchainAccount.channelId}/ca750c28/stake`]: "#0600EE",
  // validator14
  [`${ZoneToHub.interchainAccount.portId}/${ZoneToHub.interchainAccount.channelId}/8fae1290/stake`]: "#E80000",
  // validator15
  [`${ZoneToHub.interchainAccount.portId}/${ZoneToHub.interchainAccount.channelId}/3f802ab6/stake`]: "#FFFFFF",
  // validator16
  [`${ZoneToHub.interchainAccount.portId}/${ZoneToHub.interchainAccount.channelId}/0052d56e/stake`]: "#000000"
};
