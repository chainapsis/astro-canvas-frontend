import React, {
  FunctionComponent,
  MouseEvent,
  useCallback,
  useEffect,
  useState
} from "react";
import { useCosmosJS } from "../../hooks/use-cosmosjs";
import {
  AstroHubInfo,
  AstroZoneInfo,
  DenomToColor,
  ZoneToHub
} from "./constants";
import { useWalletProvider } from "../../hooks/use-wallet-provider";
import { Coin } from "@everett-protocol/cosmosjs/common/coin";
import { useValidator, Validator } from "../../hooks/use-validator";
import {
  Button,
  Form,
  FormGroup,
  Input,
  InputGroupAddon,
  Label,
  Modal,
  InputGroupText,
  Container,
  Row,
  Col
} from "reactstrap";
import { MsgDelegate, MsgRegister } from "../../x/inter-staking";
import {
  AccAddress,
  ValAddress
} from "@everett-protocol/cosmosjs/common/address";
import { useInterstaking } from "../../hooks/use-inter-staking";
import { Dec } from "@everett-protocol/cosmosjs/common/decimal";
import { DecUtils } from "../../common/dec-utils";
import { useForm } from "react-hook-form";
import InputGroup from "reactstrap/lib/InputGroup";

import { ToastContainer, toast } from "react-toastify";

import style from "./info.module.scss";

const Buffer = require("buffer/").Buffer;

export const DelegateModal: FunctionComponent<{
  validator: string;
  balance?: Coin;
  closeModal: () => void;
}> = ({ validator, balance, closeModal }) => {
  const cosmosJS = useCosmosJS(AstroZoneInfo, useWalletProvider());

  const form = useForm<{
    amount: string;
  }>({
    defaultValues: {
      amount: ""
    }
  });

  return (
    <div className="px-3 py-3">
      <Form
        onSubmit={form.handleSubmit(data => {
          if (cosmosJS.sendMsgs && cosmosJS.addresses.length > 0) {
            const valAddress = ValAddress.fromBech32(validator);
            // @ts-ignore
            valAddress.bech32Prefix =
              AstroZoneInfo.bech32Config.bech32PrefixValAddr;

            const msg = new MsgDelegate(
              ZoneToHub.transfer.portId,
              ZoneToHub.transfer.channelId,
              ZoneToHub.interchainAccount.portId,
              ZoneToHub.interchainAccount.channelId,
              AstroHubInfo.bech32Config.bech32PrefixAccAddr,
              AccAddress.fromBech32(cosmosJS.addresses[0]),
              valAddress,
              new Coin(
                `${ZoneToHub.transfer.portId}/${ZoneToHub.transfer.channelId}/${AstroHubInfo.nativeCurrency.coinMinimalDenom}`,
                new Dec(data.amount)
                  .mul(
                    DecUtils.getPrecisionDec(
                      AstroHubInfo.nativeCurrency.coinDecimals
                    )
                  )
                  .truncate()
              )
            );

            const toastId = toast.info("Waiting for tx to be committed", {
              autoClose: false
            });
            cosmosJS.sendMsgs(
              [msg],
              {
                gas: 400000,
                memo: "",
                fee: new Coin(AstroZoneInfo.nativeCurrency.coinMinimalDenom, 1)
              },
              () => {
                toast.update(toastId, {
                  type: "success",
                  render: "Success!",
                  autoClose: 3000
                });
                closeModal();
              },
              e => {
                toast.update(toastId, {
                  type: "error",
                  render: `Failed to send tx: ${e.message}`,
                  autoClose: 3000
                });
              }
            );
          }
        })}
      >
        <FormGroup>
          <Label for="amount">
            Amount
            <b>{` (Available: ${
              balance
                ? DecUtils.decToStrWithoutTrailingZeros(
                    new Dec(balance.amount).quo(
                      DecUtils.getPrecisionDec(
                        AstroHubInfo.nativeCurrency.coinDecimals
                      )
                    )
                  )
                : "?"
            } ${AstroHubInfo.nativeCurrency.coinDenom})`}</b>
          </Label>
          <InputGroup>
            <Input
              id="amount"
              name="amount"
              innerRef={form.register({
                required: "Amount is required"
              })}
              invalid={form.errors?.amount !== undefined}
            />
            <InputGroupAddon addonType="append">
              <InputGroupText>
                {AstroHubInfo.nativeCurrency.coinDenom}
              </InputGroupText>
            </InputGroupAddon>
            {form.errors?.amount ? (
              <div className="invalid-feedback">
                {form.errors.amount.message}
              </div>
            ) : null}
          </InputGroup>
        </FormGroup>
        <Button
          type="submit"
          color="primary"
          style={{ float: "right" }}
          data-loading={cosmosJS.loading}
        >
          Delegate
        </Button>
      </Form>
      <ToastContainer hideProgressBar={false} draggable />
    </div>
  );
};

export const InfoView: FunctionComponent = () => {
  const zoneCosmosJS = useCosmosJS(AstroZoneInfo, useWalletProvider());
  const zoneInterstaking = useInterstaking(
    AstroZoneInfo.rest,
    ZoneToHub.interchainAccount.portId,
    ZoneToHub.interchainAccount.channelId,
    zoneCosmosJS.addresses[0]
  );
  const hubValidators = useValidator(AstroHubInfo.rest);

  const [zoneBalances, setZoneBalances] = useState<Coin[]>([]);
  const [availableBalanceToDelegate, setAvailableBalanceToDelegate] = useState<
    Coin | undefined
  >(undefined);

  useEffect(() => {
    const expectedDenom = `${ZoneToHub.transfer.portId}/${ZoneToHub.transfer.channelId}/${AstroHubInfo.nativeCurrency.coinMinimalDenom}`;
    for (const bal of zoneBalances) {
      if (bal.denom === expectedDenom) {
        setAvailableBalanceToDelegate(bal);
        return;
      }
    }
    setAvailableBalanceToDelegate(new Coin(expectedDenom, 0));
  }, [zoneBalances]);

  useEffect(() => {
    if (zoneCosmosJS.addresses.length > 0 && zoneCosmosJS.queryAccount) {
      zoneCosmosJS.queryAccount(zoneCosmosJS.addresses[0]).then(account => {
        setZoneBalances(account.getCoins());
      });
    }
  }, [zoneCosmosJS.addresses, zoneCosmosJS.queryAccount]);

  const register = useCallback(() => {
    if (zoneCosmosJS.addresses.length > 0 && zoneCosmosJS.sendMsgs) {
      const msg = new MsgRegister(
        ZoneToHub.interchainAccount.portId,
        ZoneToHub.interchainAccount.channelId,
        AccAddress.fromBech32(zoneCosmosJS.addresses[0])
      );

      const toastId = toast.info("Waiting for tx to be committed", {
        autoClose: false
      });
      zoneCosmosJS.sendMsgs(
        [msg],
        {
          gas: 200000,
          memo: "",
          fee: [new Coin(AstroZoneInfo.nativeCurrency.coinMinimalDenom, 1)]
        },
        () => {
          toast.update(toastId, {
            type: "success",
            render: "Success!",
            autoClose: 3000
          });
          if (zoneInterstaking.refresh) {
            zoneInterstaking.refresh();
          }
        },
        e => {
          toast.update(toastId, {
            type: "error",
            render: `Failed to send tx: ${e.message}`,
            autoClose: 3000
          });
        }
      );
    }
  }, [zoneCosmosJS.addresses, zoneCosmosJS.sendMsgs]);

  const [delegateModal, setDelegateModal] = useState<string | undefined>();
  const openDelegateModal = useCallback((val: string) => {
    setDelegateModal(val);
  }, []);
  const closeDelegateModal = useCallback(() => {
    setDelegateModal(undefined);
  }, []);

  return (
    <div>
      <Modal
        isOpen={delegateModal != null}
        toggle={closeDelegateModal}
        centered
      >
        <DelegateModal
          validator={delegateModal!}
          balance={availableBalanceToDelegate}
          closeModal={closeDelegateModal}
        />
      </Modal>
      <p>
        {`Address: ${
          zoneCosmosJS.addresses.length > 0
            ? zoneCosmosJS.addresses[0]
            : "unknown"
        }`}
      </p>
      <h1>Your Colors</h1>
      <ColorBalance balances={zoneBalances} />
      {zoneInterstaking.registered.length === 0 ? (
        <Button onClick={register} data-loading={zoneCosmosJS.loading}>
          Register
        </Button>
      ) : null}
      <h1>Delegate to get Colors</h1>
      <p>{`Available balance to delegate: ${
        availableBalanceToDelegate
          ? DecUtils.decToStrWithoutTrailingZeros(
              new Dec(availableBalanceToDelegate.amount).quoTruncate(
                DecUtils.getPrecisionDec(
                  AstroHubInfo.nativeCurrency.coinDecimals
                )
              )
            )
          : "?"
      } ${AstroHubInfo.nativeCurrency.coinDenom}`}</p>
      <ColorValidators
        validators={hubValidators.validators}
        delegateFn={openDelegateModal}
      />
      <ToastContainer hideProgressBar={false} draggable />
    </div>
  );
};

export const ColorBalance: FunctionComponent<{
  balances: Coin[];
}> = ({ balances }) => {
  const colorDenoms = Object.keys(DenomToColor);

  const getBalanceByDenom = (denom: string) => {
    return balances.find(b => b.denom === denom);
  };

  return (
    <Container fluid>
      <Row>
        <Col size={6}>
          {colorDenoms
            .slice(0, Math.floor(colorDenoms.length / 2))
            .map(denom => {
              const bal = getBalanceByDenom(denom);

              return (
                <div className={style.colorBalance} key={denom}>
                  <ColorRect fill={DenomToColor[denom]} />
                  <p>
                    {bal
                      ? new Dec(bal.amount)
                          .quoTruncate(
                            DecUtils.getPrecisionDec(
                              AstroZoneInfo.nativeCurrency.coinDecimals
                            )
                          )
                          .truncate()
                          .toString()
                      : "0"}
                  </p>
                </div>
              );
            })}
        </Col>
        <Col size={6}>
          {colorDenoms.slice(Math.floor(colorDenoms.length / 2)).map(denom => {
            const bal = getBalanceByDenom(denom);

            return (
              <div className={style.colorBalance} key={denom}>
                <ColorRect fill={DenomToColor[denom]} />
                <p>
                  {bal
                    ? new Dec(bal.amount)
                        .quoTruncate(
                          DecUtils.getPrecisionDec(
                            AstroZoneInfo.nativeCurrency.coinDecimals
                          )
                        )
                        .truncate()
                        .toString()
                    : "0"}
                </p>
              </div>
            );
          })}
        </Col>
      </Row>
    </Container>
  );
};

export const ColorRect: FunctionComponent<{
  fill: string;
}> = ({ fill }) => {
  return (
    <div
      className={style.colorRect}
      style={{
        backgroundColor: fill
      }}
    />
  );
};

export const ColorValidators: FunctionComponent<{
  validators: Validator[];
  delegateFn: (val: string) => void;
}> = props => {
  const getValidatorDenom = (validator: Validator) => {
    const valAddress = ValAddress.fromBech32(validator.operator_address);
    const buf = Buffer.from(valAddress.toBytes());
    return `${ZoneToHub.interchainAccount.portId}/${
      ZoneToHub.interchainAccount.channelId
    }/${buf.slice(0, 4).toString("hex")}/stake`;
  };

  const validators = props.validators
    .filter(val => {
      return Object.keys(DenomToColor).includes(getValidatorDenom(val));
    })
    .sort((v1, v2) =>
      v1.description.moniker.localeCompare(v2.description.moniker)
    );

  const delegate = useCallback(
    (e: MouseEvent) => {
      const validator = e.currentTarget.getAttribute("data-validator");
      if (validator) {
        props.delegateFn(validator);
      }
    },
    [props.delegateFn]
  );

  return (
    <Container fluid>
      <Row>
        <Col size={6}>
          {validators.slice(0, Math.floor(validators.length / 2)).map(val => {
            const denom = getValidatorDenom(val);

            return (
              <div className={style.colorBalance} key={denom}>
                <ColorRect fill={DenomToColor[denom]} />
                <p>{val.description.moniker}</p>
                <p>
                  {new Dec(val.tokens)
                    .quoTruncate(
                      DecUtils.getPrecisionDec(
                        AstroHubInfo.nativeCurrency.coinDecimals
                      )
                    )
                    .truncate()
                    .toString()}
                </p>
                <Button
                  size="sm"
                  color="primary"
                  data-validator={val.operator_address}
                  onClick={delegate}
                >
                  Delegate
                </Button>
              </div>
            );
          })}
        </Col>
        <Col size={6}>
          {validators.slice(Math.floor(validators.length / 2)).map(val => {
            const denom = getValidatorDenom(val);

            return (
              <div className={style.colorBalance} key={denom}>
                <ColorRect fill={DenomToColor[denom]} />
                <p>{val.description.moniker}</p>
                <p>
                  {new Dec(val.tokens)
                    .quoTruncate(
                      DecUtils.getPrecisionDec(
                        AstroHubInfo.nativeCurrency.coinDecimals
                      )
                    )
                    .truncate()
                    .toString()}
                </p>
                <Button
                  size="sm"
                  color="primary"
                  data-validator={val.operator_address}
                  onClick={delegate}
                >
                  Delegate
                </Button>
              </div>
            );
          })}
        </Col>
      </Row>
    </Container>
  );
};
