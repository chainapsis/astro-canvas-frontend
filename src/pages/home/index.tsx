import React, { FunctionComponent, useCallback, useState } from "react";

import { Container, Row, Col, Modal, ModalBody, Button } from "reactstrap";

import { Canvas } from "./canvas";
import { InfoView } from "./info";
import { AstroZoneInfo, CanvasId } from "./constants";

export const PageHome: FunctionComponent = () => {
  const isFirstView = localStorage.getItem("seen-tutorial") == null;

  const [isTutorialOpen, setIsTutorialOpen] = useState(isFirstView);
  const openTutorial = useCallback(() => {
    setIsTutorialOpen(true);
  }, []);
  const closeTutorial = useCallback(() => {
    // When the user sees the guide for the first time, the guide will not appear automatically from the next time.
    localStorage.setItem("seen-tutorial", "true");
    setIsTutorialOpen(false);
  }, []);

  return (
    <Container fluid>
      <Modal isOpen={isTutorialOpen} centered style={{ maxWidth: "700px" }}>
        <ModalBody>
          <h3>How to install Keplr IBC</h3>
          <ol>
            <li>
              Download{" "}
              <a
                href="https://github.com/chainapsis/keplr-extension/releases/tag/v0.6.0-hackathon"
                target="_blank"
              >
                Keplr IBC (Hackathon Release)
              </a>{" "}
              and unzip/extract the files
            </li>
            <li>
              Open Chrome and click on the menu bar (the three dots on the top
              right corner of the browser). Go to 'More tools' -> 'Extensions'
            </li>
            <li>Turn 'Developer Mode' on (top right corner of the page)</li>
            <li>
              Click on 'Load Unpacked', and choose the Keplr IBC folder you
              downloaded in step 1.
            </li>
            <li>Open Keplr Extension and create/import an account.</li>
          </ol>
          <h3>How to use AstroCanvas</h3>
          <ol>
            <li>
              Get some tokens from the Astro Hub and Astro Zone faucet (50
              tokens per 5 minutes)
            </li>
            <li>
              Send the Astro Hub tokens to Astro Zone via IBC send (Note: Astro
              Hub token is the staking token that's used to generate the
              colorTokens from within the Astro Zone. Astro Zone's tokens are
              only used as gas tokens)
            </li>
            <li>
              Delegate to validators and receive specific colorTokens{" "}
              <b>
                (Note: Your color token balance regenerate every 5 mins. i.e. if
                you have spent all 50 whiteTokens that you initially received,
                your whiteTokens be 50 again after 5 minutes since you've last
                used the whiteToken on the canvas)
              </b>
            </li>
            <li>
              Place pixels on the canvas, and create your drawing! (We suggest
              you don't place more than 30 pixels at a time as too many pixels
              can cause issues with transactions failing)
            </li>
          </ol>
          <Button
            color="link"
            style={{ float: "right" }}
            onClick={closeTutorial}
          >
            I understand
          </Button>
        </ModalBody>
      </Modal>
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
          <Button
            style={{ float: "right", fontSize: "1rem" }}
            color="link"
            onClick={openTutorial}
          >
            Show tutorial
          </Button>
          <InfoView />
        </Col>
      </Row>
    </Container>
  );
};
