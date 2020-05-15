import React, {
  FunctionComponent,
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";

import { Container, Row, Col } from "reactstrap";

import { GithubPicker } from "react-color";
import { CanvasUtils } from "./utils";

// Doesn't have a definition.
const PinchZoomPan = require("react-responsive-pinch-zoom-pan").default;

export type Point = {
  x: number;
  y: number;
  color: string;
};

export type Color = {
  denom: string;
  color: string;
};

export const DenomToColor: {
  [denom: string]: string;
} = {
  uastro: "#ABCDEF",
  test: "#BFABDE"
};

export const CanvasTools: FunctionComponent<{
  onColorChange: (c: Color) => void;
}> = ({ onColorChange }) => {
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
    </div>
  );
};

export const Canvas: FunctionComponent<{
  width: number;
  height: number;
}> = ({ width, height }) => {
  const [scale] = useState(10);

  const [mousePosition, setMousePosition] = useState<{
    x: number;
    y: number;
  }>({
    x: -1,
    y: -1
  });

  const [pointsToFill, setPointsToFill] = useState<Point[]>([]);

  const [colorToFill, setColorToFill] = useState<Color>({
    denom: "uastro",
    color: DenomToColor["uastro"]
  });

  const backLayer = useRef<HTMLCanvasElement>(null);
  const frontLayer = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (backLayer.current) {
      const ctx = backLayer.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, width * scale, height * scale);

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, width * scale, height * scale);
      }
    }
  }, [backLayer.current, width, height, scale]);

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

        if (mousePosition.x >= 0 && mousePosition.y >= 0) {
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
    if (mousePosition.x >= 0 && mousePosition.y >= 0) {
      const _pointsToFill = pointsToFill.slice();
      _pointsToFill.push({
        x: mousePosition.x,
        y: mousePosition.y,
        color: colorToFill.denom
      });
      setPointsToFill(_pointsToFill);
    }
  }, [mousePosition, pointsToFill]);

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
              onClick={onClick}
            />
          </div>
        </PinchZoomPan>
      </div>
      <div style={{ position: "absolute", right: 0 }}>
        <CanvasTools onColorChange={setColorToFill} />
      </div>
    </div>
  );
};

export const PageHome: FunctionComponent = () => {
  return (
    <Container fluid>
      <Row>
        <Col lg="6">
          <div style={{ display: "flex", width: "100%" }}>
            <div style={{ flex: 1 }} />
            <Canvas width={500} height={500} />
            <div style={{ flex: 1 }} />
          </div>
        </Col>
        <Col lg="6">Col2</Col>
      </Row>
    </Container>
  );
};
