import { useState, useEffect } from "react";
import { useFetch } from "./use-fetch";
import { AccAddress } from "@everett-protocol/cosmosjs/common/address";

const Buffer = require("buffer/").Buffer;

interface Result {
  height: string;
  result: string;
}

/**
 * @param baseUrl Url of rest endpoint
 */
export const useInterstaking = (
  baseUrl: string,
  sourcePort?: string,
  sourceChannel?: string,
  address: string
) => {
  const [url, setUrl] = useState("");

  const [registered, setRegistered] = useState<Buffer>(Buffer.from([]));

  const fetch = useFetch<Result>(url, "get");

  useEffect(() => {
    setRegistered(Buffer.from([]));

    if (sourcePort && sourceChannel && address) {
      setUrl(baseUrl + `/registered/${sourcePort}/${sourceChannel}/${address}`);
    }
  }, [baseUrl, sourcePort, sourceChannel, address]);

  useEffect(() => {
    if (fetch.data && fetch.data.result) {
      const result = fetch.data.result;

      setRegistered(Buffer.from(result, "base64"));
    }
  }, [fetch.data]);

  return {
    url: fetch.url,
    registered,
    refresh: fetch.refresh,
    fetching: fetch.fetching
  };
};
