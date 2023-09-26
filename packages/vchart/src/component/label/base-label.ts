import { BaseComponent } from '../base';
import type { IComponentOption } from '../interface';
// eslint-disable-next-line no-duplicate-imports
import { ComponentTypeEnum } from '../interface';
import type { IRegion } from '../../region/interface';
import type { IModelRenderOption } from '../../model/interface';
import type { LayoutItem } from '../../model/layout-item';
import { LayoutZIndex } from '../../constant';
import type { ILabelSpec } from './interface';
import type { IHoverSpec, ISelectSpec } from '../../interaction/interface';
import { isEqual } from '@visactor/vutils';
import type { IGroup } from '@visactor/vrender';

export abstract class BaseLabelComponent<T extends ILabelSpec = ILabelSpec> extends BaseComponent<T> {
  static type = ComponentTypeEnum.label;
  type = ComponentTypeEnum.label;
  name: string = ComponentTypeEnum.label;

  layoutType: LayoutItem['layoutType'] = 'absolute';
  layoutZIndex: LayoutItem['layoutZIndex'] = LayoutZIndex.Label;

  constructor(spec: T, options: IComponentOption) {
    super(spec, options);
    this._regions = options.getRegionsInIndex([options.specIndex]);
    this.layoutBindRegionID = this._regions.map(x => x.id);
  }

  protected _interactiveConfig(labelSpec: ILabelSpec) {
    const { interactive } = labelSpec;
    if (interactive !== true) {
      return { hover: false, select: false };
    }
    const result = { hover: false, select: false, state: labelSpec.state };

    const { hover, select } = this._option.getChart().getSpec();
    if (hover !== false || (hover as unknown as IHoverSpec).enable !== false) {
      result.hover = true;
    }
    if (select !== false || (select as unknown as ISelectSpec).enable !== false) {
      result.select = true;
    }
    return result;
  }

  setLayoutStartPosition() {
    // do nothing
  }

  /** Update API **/
  _compareSpec() {
    const result = super._compareSpec();
    result.reRender = true;
    if (!isEqual(this._originalSpec, this._spec)) {
      result.reMake = true;
    }

    return result;
  }

  onRender(ctx: IModelRenderOption): void {
    // do nothing
  }
  changeRegions(regions: IRegion[]): void {
    // do nothing
  }
  getVRenderComponents(): IGroup[] {
    return [];
  }
}
