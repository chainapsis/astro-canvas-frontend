import { Amino } from "@node-a-team/ts-amino";
const { Field, DefineStruct } = Amino;
import { Msg } from "@everett-protocol/cosmosjs/core/tx";
import { Coin } from "@everett-protocol/cosmosjs/common/coin";
import {
  AccAddress,
  ValAddress
} from "@everett-protocol/cosmosjs/common/address";

/*
type MsgRegister struct {
	// the port on which the packet will be sent
	SourcePort string `protobuf:"bytes,1,opt,name=source_port,json=sourcePort,proto3" json:"source_port,omitempty" yaml:"source_port"`
	// the channel by which the packet will be sent
	SourceChannel string                                        `protobuf:"bytes,2,opt,name=source_channel,json=sourceChannel,proto3" json:"source_channel,omitempty" yaml:"source_channel"`
	Sender        github_com_cosmos_cosmos_sdk_types.AccAddress `protobuf:"bytes,3,opt,name=sender,proto3,casttype=github.com/cosmos/cosmos-sdk/types.AccAddress" json:"sender,omitempty"`
}
 */

@DefineStruct()
export class MsgRegister extends Msg {
  @Field.String(0, {
    jsonName: "source_port"
  })
  public sourcePort: string;

  @Field.String(1, {
    jsonName: "source_channel"
  })
  public sourceChannel: string;

  @Field.Defined(2, {
    jsonName: "sender"
  })
  public sender: AccAddress;

  constructor(sourcePort: string, sourceChannel: string, sender: AccAddress) {
    super();

    this.sourcePort = sourcePort;
    this.sourceChannel = sourceChannel;
    this.sender = sender;
  }

  public getSigners(): AccAddress[] {
    return [this.sender];
  }

  public validateBasic(): void {
    // noop
  }
}

/*
type MsgDelegate struct {
	// the port on which the packet will be sent
	TransferSourcePort string `protobuf:"bytes,1,opt,name=transfer_source_port,json=transferSourcePort,proto3" json:"transfer_source_port,omitempty" yaml:"transfer_source_port"`
	// the channel by which the packet will be sent
	TransferSourceChannel          string                                        `protobuf:"bytes,2,opt,name=transfer_source_channel,json=transferSourceChannel,proto3" json:"transfer_source_channel,omitempty" yaml:"transfer_source_channel"`
	InterchainAccountSourcePort    string                                        `protobuf:"bytes,3,opt,name=interchain_account_source_port,json=interchainAccountSourcePort,proto3" json:"interchain_account_source_port,omitempty" yaml:"interchain_account_source_port"`
	InterchainAccountSourceChannel string                                        `protobuf:"bytes,4,opt,name=interchain_account_source_channel,json=interchainAccountSourceChannel,proto3" json:"interchain_account_source_channel,omitempty" yaml:"interchain_account_source_channel"`
	CounterpartyBech32Addr         string                                        `protobuf:"bytes,5,opt,name=counterparty_bech32_addr,json=counterpartyBech32Addr,proto3" json:"counterparty_bech32_addr,omitempty" yaml:"counterparty_bech32_addr"`
	DelegatorAddress               github_com_cosmos_cosmos_sdk_types.AccAddress `protobuf:"bytes,6,opt,name=delegator_address,json=delegatorAddress,proto3,casttype=github.com/cosmos/cosmos-sdk/types.AccAddress" json:"delegator_address,omitempty" yaml:"delegator_address"`
	ValidatorAddress               github_com_cosmos_cosmos_sdk_types.ValAddress `protobuf:"bytes,7,opt,name=validator_address,json=validatorAddress,proto3,casttype=github.com/cosmos/cosmos-sdk/types.ValAddress" json:"validator_address,omitempty" yaml:"validator_address"`
	Amount                         types.Coin                                    `protobuf:"bytes,8,opt,name=amount,proto3" json:"amount"`
}
 */

@DefineStruct()
export class MsgDelegate extends Msg {
  @Field.String(0, {
    jsonName: "transfer_source_port"
  })
  public transferSourcePort: string;

  @Field.String(1, {
    jsonName: "transfer_source_channel"
  })
  public transferSourceChannel: string;

  @Field.String(2, {
    jsonName: "interchain_account_source_port"
  })
  public interchainAccountSourcePort: string;

  @Field.String(3, {
    jsonName: "interchain_account_source_channel"
  })
  public interchainAccountSourceChannel: string;

  @Field.String(4, {
    jsonName: "counterparty_bech32_addr"
  })
  public counterpartyBech32Addr: string;

  @Field.Defined(5, {
    jsonName: "delegator_address"
  })
  public delegatorAddress: AccAddress;

  @Field.Defined(6, {
    jsonName: "validator_address"
  })
  public validatorAddress: ValAddress;

  @Field.Defined(7, {
    jsonName: "amount"
  })
  public amount: Coin;

  constructor(
    transferSourcePort: string,
    transferSourceChannel: string,
    interchainAccountSourcePort: string,
    interchainAccountSourceChannel: string,
    counterpartyBech32Addr: string,
    delegatorAddress: AccAddress,
    validatorAddress: ValAddress,
    amount: Coin
  ) {
    super();

    this.transferSourcePort = transferSourcePort;
    this.transferSourceChannel = transferSourceChannel;
    this.interchainAccountSourcePort = interchainAccountSourcePort;
    this.interchainAccountSourceChannel = interchainAccountSourceChannel;
    this.counterpartyBech32Addr = counterpartyBech32Addr;
    this.delegatorAddress = delegatorAddress;
    this.validatorAddress = validatorAddress;
    this.amount = amount;
  }

  public getSigners(): AccAddress[] {
    return [this.delegatorAddress];
  }

  public validateBasic(): void {
    // noop
  }
}
