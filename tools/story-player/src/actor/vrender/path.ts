import type { IPath, IPathGraphicAttribute } from '@visactor/vrender';
import { createPath } from '@visactor/vrender';
import { VRenderActor } from './base';
import { ActorType } from '../interface';

export class VRenderPathActor extends VRenderActor<IPath, IPathGraphicAttribute> {
  type = ActorType.vrenderPath;
  createFunc = createPath;
}
