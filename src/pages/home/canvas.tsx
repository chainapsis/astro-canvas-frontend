import React, {
  FunctionComponent,
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";

import { GithubPicker } from "react-color";
import { CanvasUtils } from "./utils";
import { Color, Point, DenomToColor, AstroZoneInfo } from "./constants";
import { Button } from "reactstrap";
import { useCosmosJS } from "../../hooks/use-cosmosjs";
import { useWalletProvider } from "../../hooks/use-wallet-provider";
import { MsgPaint } from "../../x/canvas";
import { AccAddress } from "@everett-protocol/cosmosjs/common/address";
import { Coin } from "@everett-protocol/cosmosjs/common/coin";
import { useCanvasPoints } from "../../hooks/use-canvas-points";

// Doesn't have a definition.
const PinchZoomPan = require("react-responsive-pinch-zoom-pan").default;

export const CanvasTools: FunctionComponent<{
  onColorChange: (c: Color) => void;
  onPaint: () => void;
}> = ({ onColorChange, onPaint }) => {
  const colors = Object.values(DenomToColor);

  const onColorChangeCallback = useCallback(
    e => {
      for (const denom of Object.keys(DenomToColor)) {
        if (DenomToColor[denom].toLowerCase() === e.hex.toLowerCase()) {
          onColorChange({
            denom,
            color: e.hex
          });
          break;
        }
      }
    },
    [onColorChange]
  );

  return (
    <div>
      <GithubPicker colors={colors} onChangeComplete={onColorChangeCallback} />
      <Button size="sm" color="primary" onClick={onPaint}>
        Paint
      </Button>
    </div>
  );
};

export const Canvas: FunctionComponent<{
  canvasId: string;
  restEndpoint: string;
  width: number;
  height: number;
}> = ({ canvasId, restEndpoint, width, height }) => {
  const [scale] = useState(10);

  const canvasPoints = useCanvasPoints(restEndpoint, canvasId);

  const [mousePosition, setMousePosition] = useState<{
    x: number;
    y: number;
  }>({
    x: -1,
    y: -1
  });

  const [pointsToFill, setPointsToFill] = useState<Point[]>([]);

  const [colorToFill, setColorToFill] = useState<Color | undefined>(undefined);

  const cosmosJS = useCosmosJS(AstroZoneInfo, useWalletProvider(), {
    useBackgroundTx: true
  });

  const backLayer = useRef<HTMLCanvasElement>(null);
  const frontLayer = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (backLayer.current) {
      const ctx = backLayer.current.getContext("2d");
      if (ctx) {
        CanvasUtils.clear(ctx, width, height, scale);

        CanvasUtils.drawRect(ctx, 0, 0, width, height, scale, "white");

        for (const point of canvasPoints.points) {
          let fill = DenomToColor[point.color];
          if (!fill) {
            fill = "#000000";
          }
          CanvasUtils.drawRect(
            ctx,
            parseFloat(point.x),
            parseFloat(point.y),
            1,
            1,
            scale,
            fill
          );
        }
      }
    }
  }, [backLayer.current, width, height, scale, canvasPoints.points]);

  useEffect(() => {
    if (frontLayer.current) {
      const ctx = frontLayer.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, width * scale, height * scale);

        for (const point of pointsToFill) {
          CanvasUtils.drawOutlinedRect(
            ctx,
            point.x,
            point.y,
            1,
            1,
            scale,
            DenomToColor[point.color] ? DenomToColor[point.color] : "black",
            "black",
            0.1
          );
        }

        if (colorToFill && mousePosition.x >= 0 && mousePosition.y >= 0) {
          CanvasUtils.drawOutlinedRect(
            ctx,
            mousePosition.x,
            mousePosition.y,
            1,
            1,
            scale,
            colorToFill.color,
            "black",
            0.1
          );
        }
      }
    }
  }, [frontLayer.current, mousePosition, scale, colorToFill, pointsToFill]);

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (frontLayer.current) {
        const rect = frontLayer.current.getBoundingClientRect();
        const scaleX = frontLayer.current.width / rect.width;
        const scaleY = frontLayer.current.height / rect.height;

        setMousePosition({
          x: Math.floor(((e.clientX - rect.left) * scaleX) / scale),
          y: Math.floor(((e.clientY - rect.top) * scaleY) / scale)
        });
      }
    },
    [frontLayer.current]
  );

  const onClick = useCallback(() => {
    if (colorToFill && mousePosition.x >= 0 && mousePosition.y >= 0) {
      const _pointsToFill = pointsToFill.slice();
      _pointsToFill.push({
        x: mousePosition.x,
        y: mousePosition.y,
        color: colorToFill.denom
      });
      setPointsToFill(_pointsToFill);
    }
  }, [mousePosition, pointsToFill]);

  const [mouseDown, setMouseDown] = useState<
    | {
        x: number;
        y: number;
      }
    | undefined
  >();
  const onMouseDown = useCallback((e: MouseEvent) => {
    setMouseDown({
      x: e.clientX,
      y: e.clientY
    });
  }, []);

  const onMouseUp = useCallback(
    (e: MouseEvent) => {
      if (mouseDown) {
        if (
          Math.abs(mouseDown.x - e.clientX) < 10 &&
          Math.abs(mouseDown.y - e.clientY) < 10
        ) {
          onClick();
        }
      }
      setMouseDown(undefined);
    },
    [mouseDown, onClick]
  );

  const onPaint = useCallback(() => {
    if (
      cosmosJS.sendMsgs &&
      cosmosJS.addresses.length > 0 &&
      pointsToFill.length > 0
    ) {
      const msgs: MsgPaint[] = [];
      for (const point of pointsToFill) {
        const msg = new MsgPaint(
          "genesis",
          point.x,
          point.y,
          new Coin(point.color, 1000000),
          AccAddress.fromBech32(cosmosJS.addresses[0])
        );

        msgs.push(msg);
      }

      if (msgs.length > 0) {
        const gas = 50000 + msgs.length * 30000;
        cosmosJS.sendMsgs(msgs, {
          gas: gas,
          memo: "",
          fee: new Coin("uastro", gas * 0.025)
        });
      }
    }
  }, [cosmosJS, pointsToFill]);

  return (
    <div
      style={{
        position: "relative",
        width: `${width}px`,
        height: `${height}px`
      }}
    >
      <div
        style={{
          position: "absolute",
          width: `${width}px`,
          height: `${height}px`,
          overflow: "hidden"
        }}
      >
        <PinchZoomPan initialScale={2} minScale={1} maxScale={16}>
          <div>
            <canvas
              ref={backLayer}
              style={{
                position: "absolute",
                zIndex: -1,
                transformOrigin: "top left",
                transform: `scale(${1 / scale})`
              }}
              width={width * scale}
              height={height * scale}
            />
            <canvas
              ref={frontLayer}
              style={{
                transformOrigin: "top left",
                transform: `scale(${1 / scale})`
              }}
              width={width * scale}
              height={height * scale}
              onMouseMove={onMouseMove}
              onMouseDown={onMouseDown}
              onMouseUp={onMouseUp}
            />
          </div>
        </PinchZoomPan>
      </div>
      <div style={{ position: "absolute", right: 0 }}>
        <CanvasTools onColorChange={setColorToFill} onPaint={onPaint} />
      </div>
    </div>
  );
};
