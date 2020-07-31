import React from "react";

import { Scanned } from "../../Models/Queue/Queue";
import Mission from "../../Models/Queue/Mission";
import Recovery from "../../Models/Queue/Recovery";
import Shipbuilding from "../../Models/Queue/Shipbuilding";
import ClockView from "./ClockView";
import MatrixView from "./QueuesView/MatrixView";
import Tiredness from "../../Models/Queue/Tiredness";
import TirednessView from "./QueuesView/TirednessView";
import DashboardFrame from "../../Models/DashboardFrame";
import QuestProgressView from "./QuestProgressView";
import { QuestProgress } from "../../Models/Quest";
import { resizeToAdjustAero } from "../../../Services/Window";

export default class DashboardView extends React.Component<Record<string, any>, {
  missions: Scanned<Mission>;
  recoveries: Scanned<Recovery>;
  shipbuildings: Scanned<Shipbuilding>;
  tiredness: Scanned<Tiredness>;
  now: Date;
}> {

  private timerId: number;

  constructor(props) {
    super(props);
    this.state = {
      ...this.getQueues(),
      now: new Date(),
    };
  }

  componentDidMount() {
    this.timerId = setInterval(() => this.tick(), 1000);
    resizeToAdjustAero(window);
  }

  componentWillUnmount() {
    clearTimeout(this.timerId);
  }

  private getQueues() {
    return {
      missions: Mission.scan(false),
      recoveries: Recovery.scan(false),
      shipbuildings: Shipbuilding.scan(false),
      tiredness: Tiredness.scan(false),
    };
  }
  private tick() {
    const now = new Date();
    this.setState({
      ...this.getQueues(),
      now,
    });
    if (now.getSeconds() % 10 == 0) {
      // FIXME: ほんとはmessage使うべきだけどめんどくさいので直でmodelいじる
      DashboardFrame.user().update({
        position: { top: window.screenY, left: window.screenX },
        size: { width: window.innerWidth, height: window.innerHeight },
      });
    }
  }

  render() {
    return (
      <div className="container">
        <ClockView now={this.state.now} />
        <MatrixView {...this.state} />
        <TirednessView {...this.state.tiredness} now={this.state.now} />
        <QuestProgressView progress={QuestProgress.user()} />
      </div>
    );
  }
}