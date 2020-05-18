import React, { FunctionComponent } from "react";

import { Container, Row, Col } from "reactstrap";

import { Canvas } from "./canvas";
import { InfoView } from "./info";
import { AstroZoneInfo, CanvasId } from "./constants";

export const PageHome: FunctionComponent = () => {
  return (
    <Container fluid>
      <Row>
        <Col lg="6">
          <Canvas
            canvasId={CanvasId}
            restEndpoint={AstroZoneInfo.rest}
            width={500}
            height={500}
          />
        </Col>
        <Col lg="6">
          <InfoView />
        </Col>
      </Row>
    </Container>
  );
};
