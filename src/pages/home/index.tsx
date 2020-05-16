import React, { FunctionComponent } from "react";

import { Container, Row, Col } from "reactstrap";

import { Canvas } from "./canvas";
import { AstroHubInfo } from "./constants";

export const PageHome: FunctionComponent = () => {
  return (
    <Container fluid>
      <Row>
        <Col lg="6">
          <div style={{ display: "flex", width: "100%" }}>
            <div style={{ flex: 1 }} />
            <Canvas
              canvasId="genesis"
              restEndpoint={AstroHubInfo.rest}
              width={500}
              height={500}
            />
            <div style={{ flex: 1 }} />
          </div>
        </Col>
        <Col lg="6">Col2</Col>
      </Row>
    </Container>
  );
};
