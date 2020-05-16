import { Amino } from "@node-a-team/ts-amino";
const { Field, DefineStruct } = Amino;
import { Msg } from "@everett-protocol/cosmosjs/core/tx";
import bigInteger from "big-integer";
import { Coin } from "@everett-protocol/cosmosjs/common/coin";
import { AccAddress } from "@everett-protocol/cosmosjs/common/address";

/*
type MsgPaint struct {
	Id     string                                        `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty"`
	X      uint64                                        `protobuf:"varint,2,opt,name=x,proto3" json:"x,omitempty"`
	Y      uint64                                        `protobuf:"varint,3,opt,name=y,proto3" json:"y,omitempty"`
	Amount types.Coin                                    `protobuf:"bytes,4,opt,name=amount,proto3" json:"amount"`
	Sender github_com_cosmos_cosmos_sdk_types.AccAddress `protobuf:"bytes,5,opt,name=sender,proto3,casttype=github.com/cosmos/cosmos-sdk/types.AccAddress" json:"sender,omitempty" yaml:"sender"`
}
 */

@DefineStruct()
export class MsgPaint extends Msg {
  @Field.String(0, {
    jsonName: "id"
  })
  public id: string;

  @Field.Uint64(1, {
    jsonName: "x"
  })
  public x: bigInteger.BigInteger;

  @Field.Uint64(2, {
    jsonName: "y"
  })
  public y: bigInteger.BigInteger;

  @Field.Defined(3, {
    jsonName: "amount"
  })
  public amount: Coin;

  @Field.Defined(4, {
    jsonName: "sender"
  })
  public sender: AccAddress;

  constructor(
    id: string,
    x: bigInteger.BigNumber,
    y: bigInteger.BigNumber,
    amount: Coin,
    sender: AccAddress
  ) {
    super();

    this.id = id;

    if (typeof x === "string") {
      this.x = bigInteger(x);
    } else if (typeof x === "number") {
      this.x = bigInteger(x);
    } else {
      this.x = bigInteger(x as any);
    }

    if (typeof y === "string") {
      this.y = bigInteger(y);
    } else if (typeof y === "number") {
      this.y = bigInteger(y);
    } else {
      this.y = bigInteger(y as any);
    }

    this.amount = amount;
    this.sender = sender;
  }

  public getSigners(): AccAddress[] {
    return [this.sender];
  }

  public validateBasic(): void {
    // noop
  }
}
