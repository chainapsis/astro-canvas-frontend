import { Codec } from "@node-a-team/ts-amino";
import { MsgRegister, MsgDelegate } from "./msgs";

export function registerCodec(codec: Codec) {
  codec.registerConcrete("interstaking/MsgRegister", MsgRegister.prototype);
  codec.registerConcrete("interstaking/MsgDelegate", MsgDelegate.prototype);
}
