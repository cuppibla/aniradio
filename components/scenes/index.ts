import type { ComponentType } from "react";
import { BedroomPopScene } from "./BedroomPopScene";
import { LofiStudyScene } from "./LofiStudyScene";
import { ForestScene } from "./ForestScene";
import { LateDriveScene } from "./LateDriveScene";
import { SundayKitchenScene } from "./SundayKitchenScene";
import { GoldenHourScene } from "./GoldenHourScene";
import type { SceneProps } from "./types";

export const SCENES: Record<string, ComponentType<SceneProps>> = {
  "bedroom-pop": BedroomPopScene,
  "lofi-study": LofiStudyScene,
  "forest-at-dusk": ForestScene,
  "late-drive": LateDriveScene,
  "sunday-kitchen": SundayKitchenScene,
  "golden-hour": GoldenHourScene,
};
