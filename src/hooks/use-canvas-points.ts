import { useState, useEffect } from "react";
import { useFetch } from "./use-fetch";

export interface Point {
  x: string;
  y: string;
  color: string;
}

interface Result {
  height: string;
  result: Point[];
}

/**
 * @param baseUrl Url of rest endpoint
 */
export const useCanvasPoints = (baseUrl: string, id: string) => {
  const [url, setUrl] = useState("");

  const [points, setPoints] = useState<Point[]>([]);

  const fetch = useFetch<Result>(url, "get");

  useEffect(() => {
    // Clear the informations of reward if id is changed.
    setPoints([]);

    if (id) {
      setUrl(baseUrl + `/canvas/${id}/points`);
    }
  }, [baseUrl, id]);

  useEffect(() => {
    if (fetch.data && fetch.data.result) {
      const result = fetch.data.result;

      setPoints(result);
    }
  }, [fetch.data]);

  return {
    url: fetch.url,
    id,
    refresh: fetch.refresh,
    fetching: fetch.fetching,
    points
  };
};
