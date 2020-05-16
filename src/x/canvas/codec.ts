import { Codec } from "@node-a-team/ts-amino";
import { MsgPaint } from "./msgs";

export function registerCodec(codec: Codec) {
  codec.registerConcrete("canvas/MsgPaint", MsgPaint.prototype);
}
