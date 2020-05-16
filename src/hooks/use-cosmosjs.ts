import { ChainInfo } from "../chain-info";
import { WalletProvider } from "@everett-protocol/cosmosjs/core/walletProvider";
import { Context } from "@everett-protocol/cosmosjs/core/context";
import { GaiaRest } from "@everett-protocol/cosmosjs/gaia/rest";
import { Codec } from "@node-a-team/ts-amino";
import * as CmnCdc from "@everett-protocol/cosmosjs/common/codec";
import * as Crypto from "@everett-protocol/cosmosjs/crypto";
import * as Bank from "@everett-protocol/cosmosjs/x/bank";
import * as Distr from "@everett-protocol/cosmosjs/x/distribution";
import * as Staking from "@everett-protocol/cosmosjs/x/staking";
import * as Slashing from "@everett-protocol/cosmosjs/x/slashing";
import * as Gov from "@everett-protocol/cosmosjs/x/gov";
import { Rest } from "@everett-protocol/cosmosjs/core/rest";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Msg } from "@everett-protocol/cosmosjs/core/tx";
import { TxBuilderConfig } from "@everett-protocol/cosmosjs/core/txBuilder";
import { Api } from "@everett-protocol/cosmosjs/core/api";
import { defaultTxEncoder } from "@everett-protocol/cosmosjs/common/stdTx";
import { stdTxBuilder } from "@everett-protocol/cosmosjs/common/stdTxBuilder";
import { Account } from "@everett-protocol/cosmosjs/core/account";
import { queryAccount as methodQueryAccount } from "@everett-protocol/cosmosjs/core/query";
import { RequestBackgroundTxMsg } from "../background/tx";
import { sendMessage } from "../common/message";
import { BACKGROUND_PORT } from "../common/message/constant";
import { AsyncWaitGroup } from "../common/async-wait-group";

import * as Canvas from "../x/canvas";
import { BIP44 } from "@everett-protocol/cosmosjs/core/bip44";

const Buffer = require("buffer/").Buffer;

export type SendMsgs = (
  msgs: Msg[],
  config: TxBuilderConfig,
  onSuccess?: () => void,
  onFail?: (e: Error) => void,
  mode?: "commit" | "sync" | "async"
) => Promise<void>;

export interface CosmosJsHook {
  loading: boolean;
  error?: Error;
  addresses: string[];
  sendMsgs?: SendMsgs;
  queryAccount?: (address: string | Uint8Array) => Promise<Account>;
}

// This is used to manage the flow of cosmosjs enabling when multiple cosmosjs enabling is requested.
// Without this, if cosmosjs enablings are requested, only the last request will be succeded and others will be failed
// because keplr only supports the only one cosmosjs request at a time.
const enableWaitGroup = new AsyncWaitGroup();

/**
 * useCosmosJS hook returns the object related to cosmosjs api.
 * sendMsgs in returned value can send msgs asynchronously safely.
 * sendMsgs will not make state transition after component unmounted.
 * Make sure to pass the wallet provider as state to avoid re-rendering unnecessarily.
 * You can override rest factory or register codec.
 * Also, make sure that you pass rest factory and register codec by using useCallback to avoid unnecessary re-rendering.
 */
export const useCosmosJS = <R extends Rest = Rest>(
  chainInfo: ChainInfo,
  walletProvider: WalletProvider | undefined,
  opts: {
    onEnableFailed?: (e: Error) => void;
    restFactory?: (context: Context) => R;
    registerCodec?: (codec: Codec) => void;
    useBackgroundTx?: boolean;
  } = {}
): CosmosJsHook => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  const memorizedRestFactory = useCallback<(context: Context) => R>(
    opts?.restFactory ||
      ((context: Context) => (new GaiaRest(context) as unknown) as R),
    [opts?.restFactory]
  );

  const memorizedRegisterCodec = useCallback<(codec: Codec) => void>(
    opts?.registerCodec ||
      ((codec: Codec) => {
        CmnCdc.registerCodec(codec);
        Crypto.registerCodec(codec);
        Bank.registerCodec(codec);
        Distr.registerCodec(codec);
        Staking.registerCodec(codec);
        Slashing.registerCodec(codec);
        Gov.registerCodec(codec);
        Canvas.registerCodec(codec);
      }),
    [opts?.registerCodec]
  );

  const [addresses, setAddresses] = useState<string[]>([]);
  const [sendMsgs, setSendMsgs] = useState<SendMsgs | undefined>(undefined);
  const [queryAccount, setQueryAccount] = useState<
    ((address: string | Uint8Array) => Promise<Account>) | undefined
  >(undefined);

  useEffect(() => {
    setLoading(false);
    let isSubscribed = true;

    if (!walletProvider) {
      if (isSubscribed) {
        setError(new Error("their is no wallet"));
      }
      return;
    }

    const api = new Api<R>(
      {
        chainId: chainInfo.chainId,
        walletProvider: walletProvider,
        rpc: chainInfo.rpc,
        rest: chainInfo.rest
      },
      {
        txEncoder: defaultTxEncoder,
        txBuilder: stdTxBuilder,
        restFactory: memorizedRestFactory,
        queryAccount: (
          context: Context,
          address: string | Uint8Array
        ): Promise<Account> => {
          return methodQueryAccount(
            context.get("rpcInstance"),
            address,
            context.get("bech32Config").bech32PrefixAccAddr
          );
        },
        bech32Config: chainInfo.bech32Config,
        bip44: new BIP44(44, 118, 0),
        registerCodec: memorizedRegisterCodec
      }
    );

    if (!api.wallet) {
      if (isSubscribed) {
        setError(new Error("their is no wallet"));
      }
    } else {
      (async () => {
        try {
          if (enableWaitGroup.isLocked) {
            await enableWaitGroup.wait();
          }
          enableWaitGroup.add(1);
          await api.enable();
        } catch (e) {
          if (opts.onEnableFailed) {
            opts.onEnableFailed(e);
          }
        } finally {
          enableWaitGroup.done();
        }
        const keys = await api.getKeys();
        const addresses: string[] = [];
        for (const key of keys) {
          addresses.push(key.bech32Address);
        }
        if (isSubscribed) {
          setError(undefined);
          setAddresses(addresses);
        }
      })();
    }

    const _sendMsgs: SendMsgs = async (
      msgs: Msg[],
      config: TxBuilderConfig,
      onSuccess?: () => void,
      onFail?: (e: Error) => void,
      mode: "commit" | "sync" | "async" = "commit"
    ) => {
      if (isSubscribed) {
        setLoading(true);
      }
      try {
        if (api.wallet) {
          await api.enable();

          if (!opts?.useBackgroundTx) {
            const result = await api.sendMsgs(msgs, config, mode);

            if (result.mode === "sync" || result.mode === "async") {
              if (result.code !== 0) {
                throw new Error(result.log);
              }
            } else if (result.mode === "commit") {
              if (
                result.checkTx.code !== undefined &&
                result.checkTx.code !== 0
              ) {
                throw new Error(result.checkTx.log);
              }
              if (
                result.deliverTx.code !== undefined &&
                result.deliverTx.code !== 0
              ) {
                throw new Error(result.deliverTx.log);
              }
            }
          } else {
            const tx = await api.context.get("txBuilder")(
              api.context,
              msgs,
              config
            );
            const bz = api.context.get("txEncoder")(api.context, tx);

            const msg = RequestBackgroundTxMsg.create(
              api.context.get("chainId"),
              Buffer.from(bz).toString("hex"),
              mode,
              window.location.origin
            );
            await sendMessage(BACKGROUND_PORT, msg);
          }

          if (onSuccess) {
            onSuccess();
          }
        } else {
          throw new Error("their is no wallet");
        }
      } catch (e) {
        if (isSubscribed) {
          setError(e);
        }
        if (onFail) {
          onFail(e);
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    setSendMsgs(() => _sendMsgs);
    setQueryAccount(() => {
      return (address: string | Uint8Array) => {
        return api.context.get("queryAccount")(api.context, address);
      };
    });

    return () => {
      isSubscribed = false;
    };
  }, [
    chainInfo,
    walletProvider,
    memorizedRestFactory,
    memorizedRegisterCodec,
    opts.useBackgroundTx
  ]);

  return useMemo(() => {
    return { loading, error, addresses, sendMsgs, queryAccount };
  }, [addresses, error, loading, queryAccount, sendMsgs]);
};
