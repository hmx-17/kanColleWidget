import { Client } from "chomex/lib/Client";
import CaptureService from "../../../../Services/Capture";
import Rectangle from "../../../../Services/Rectangle";
import TempStorage from "../../../../Services/TempStorage";
import TrimService from "../../../../Services/Trim";
import WindowService from "../../../../Services/Window";
import { sleep } from "../../../../utils";
import Config from "../../../Models/Config";
import DamageSnapshotFrame, { DamageSnapshotType } from "../../../Models/DamageSnapshotFrame";

export async function DamageSnapshotCapture(message: {after: number}) {
  const ws = WindowService.getInstance();
  const tab = await ws.find();
  await sleep(message.after || 1000); // 艦隊の描画が止まるのを待つ
  const cs = new CaptureService();
  const original = await cs.base64(tab.windowId, {});
  const ts = await TrimService.init(original);
  const rect = Rectangle.new(ts.img.width, ts.img.height);
  const trimmed = ts.trim(rect.damagesnapshot());

  switch (DamageSnapshotFrame.get().value) {
  case DamageSnapshotType.InApp:
    Client.for(chrome.tabs, tab.id, false).message("/snapshot/show", {uri: trimmed});
  case DamageSnapshotType.Separate:
    (new TempStorage()).store("damagesnapshot", trimmed);
  }
  return {status: 202, tabId: tab.id};
}
