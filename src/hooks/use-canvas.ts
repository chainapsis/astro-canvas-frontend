import { useState, useEffect } from "react";
import { useFetch } from "./use-fetch";

export interface Canvas {
  id: string;
  width: string;
  height: string;
  refund_duration: string;
  priceForPoint: string;
}

interface Result {
  height: string;
  result: Canvas;
}

/**
 * @param baseUrl Url of rest endpoint
 */
export const useCanvas = (baseUrl: string, id: string) => {
  const [url, setUrl] = useState("");

  const [canvas, setCanvas] = useState<Canvas | undefined>(undefined);

  const fetch = useFetch<Result>(url, "get");

  useEffect(() => {
    // Clear the informations of reward if id is changed.
    setCanvas(undefined);

    if (id) {
      setUrl(baseUrl + `/canvas/${id}`);
    }
  }, [baseUrl, id]);

  useEffect(() => {
    if (fetch.data && fetch.data.result) {
      const result = fetch.data.result;

      setCanvas(result);
    }
  }, [fetch.data]);

  return {
    url: fetch.url,
    id,
    refresh: fetch.refresh,
    fetching: fetch.fetching,
    canvas
  };
};
