import { WalletProvider } from "@everett-protocol/cosmosjs/core/walletProvider";
import { useEffect, useState } from "react";

export const useWalletProvider: () => WalletProvider | undefined = () => {
  const [walletProvider, setWalletProvider] = useState<
    WalletProvider | undefined
  >();

  if (!walletProvider && window.cosmosJSWalletProvider) {
    setWalletProvider(window.cosmosJSWalletProvider);
  }

  useEffect(() => {
    const onLoad = () => {
      if (!walletProvider && window.cosmosJSWalletProvider) {
        setWalletProvider(window.cosmosJSWalletProvider);
        removeEventListener("load", onLoad);
      }
    };

    if (!walletProvider) {
      addEventListener("load", onLoad);
    }

    return () => {
      removeEventListener("load", onLoad);
    };
  }, [walletProvider]);

  return walletProvider;
};
