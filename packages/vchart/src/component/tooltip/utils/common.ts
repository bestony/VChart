import { isArray, isFunction, isNil, isValid, TimeUtil } from '@visactor/vutils';
import type {
  Datum,
  ITooltipActual,
  ITooltipLineActual,
  ITooltipLinePattern,
  MaybeArray,
  TooltipActiveType,
  TooltipContentProperty,
  TooltipData,
  TooltipPatternCallback,
  TooltipPatternProperty
} from '../../../typings';
import type { ISeriesTooltipSpec, ITooltipActiveTypeAsKeys, ITooltipSpec, TooltipHandlerParams } from '../interface';
import type { BaseEventParams } from '../../../event/interface';
import { getTooltipContentValue } from './get-value';

export const getTooltipActualActiveType = (spec?: ITooltipSpec): TooltipActiveType[] => {
  if (spec?.visible === false) {
    return [];
  }

  const activeTypeMap: ITooltipActiveTypeAsKeys<boolean, boolean, boolean> = {
    mark: spec?.mark?.visible !== false,
    dimension: spec?.dimension?.visible !== false,
    group: spec?.group?.visible !== false
  };

  if (isValid(spec?.activeType)) {
    Object.keys(activeTypeMap).forEach(t => {
      activeTypeMap[t as TooltipActiveType] = spec?.activeType?.includes(t as TooltipActiveType);
    });
  }

  return Object.keys(activeTypeMap).filter(t => activeTypeMap[t as TooltipActiveType]) as TooltipActiveType[];
};

export const isActiveTypeVisible = (type: TooltipActiveType, spec?: ISeriesTooltipSpec) => {
  if (!spec) {
    return true;
  }

  if (spec.visible === false) {
    return false;
  }

  if (spec[type] && spec[type].visible === false) {
    return false;
  }

  if (spec.activeType && (isArray(spec.activeType) ? !spec.activeType.includes(type) : spec.activeType !== type)) {
    return false;
  }

  return true;
};

export function isEmptyPos(params: BaseEventParams): boolean {
  return isNil(params.mark) && isNil(params.model) && isNil(params.datum);
}

function addContentLine(
  result: ITooltipLineActual[],
  contentSpec: MaybeArray<ITooltipLinePattern>,
  shapeAttrs: Record<string, TooltipContentProperty<any>>,
  datum: Datum,
  params?: TooltipHandlerParams
) {
  const addByDatum = (spec: ITooltipLinePattern) => {
    if (spec) {
      const res: ITooltipLineActual = {};
      const finalSpec: ITooltipLinePattern = { ...shapeAttrs, ...spec };

      Object.keys(finalSpec).forEach(k => {
        if (k === 'key') {
          res.key = getTimeString(
            getTooltipContentValue(finalSpec.key, datum, params, finalSpec.keyFormatter),
            finalSpec.keyTimeFormat,
            finalSpec.keyTimeFormatMode
          );
        } else if (k === 'value') {
          res.value = getTimeString(
            getTooltipContentValue(finalSpec.value, datum, params, finalSpec.valueFormatter),
            finalSpec.valueTimeFormat,
            finalSpec.valueTimeFormatMode
          );
        } else {
          (res as any)[k] = getTooltipContentValue((finalSpec as any)[k], datum, params);
        }
      });
      if (res.visible !== false && (isValid(res.key) || isValid(res.value))) {
        result.push(res);
      }
    }
  };

  if (isArray(contentSpec)) {
    (contentSpec as ITooltipLinePattern[]).forEach(spec => {
      addByDatum(spec);
    });
  } else {
    addByDatum(contentSpec as ITooltipLinePattern);
  }
}

function parseContentFunction(
  result: ITooltipLineActual[],
  contentSpec: TooltipPatternProperty<MaybeArray<ITooltipLinePattern>>,
  shapeAttrs: Record<string, TooltipContentProperty<any>>,
  data?: TooltipData,
  datum?: Datum,
  params?: TooltipHandlerParams
) {
  if (isFunction(contentSpec)) {
    const specs = (contentSpec as TooltipPatternCallback<MaybeArray<ITooltipLinePattern>>)(data, params);

    addContentLine(result, specs, shapeAttrs, datum, params);
  } else if (contentSpec) {
    addContentLine(result, contentSpec as MaybeArray<ITooltipLinePattern>, shapeAttrs, datum, params);
  }
}

export function parseContent(
  contentSpec: MaybeArray<TooltipPatternProperty<MaybeArray<ITooltipLinePattern>>>,
  shapeAttrs: Record<string, TooltipContentProperty<any>>,
  data?: TooltipData,
  datum?: Datum[],
  params?: TooltipHandlerParams
): ITooltipLineActual[] {
  if (datum && datum.length) {
    const contents: ITooltipLineActual[] = [];

    datum.forEach(d => {
      if (isArray(contentSpec)) {
        (contentSpec as TooltipPatternProperty<MaybeArray<ITooltipLinePattern>>[]).forEach(spec => {
          parseContentFunction(contents, spec, shapeAttrs, data, d, params);
        });
      } else if (isFunction(contentSpec)) {
        parseContentFunction(
          contents,
          contentSpec as TooltipPatternCallback<MaybeArray<ITooltipLinePattern>>,
          shapeAttrs,
          data,
          d,
          params
        );
      } else if (contentSpec) {
        addContentLine(contents, contentSpec as MaybeArray<ITooltipLinePattern>, shapeAttrs, d, params);
      }
    });

    return contents;
  }

  return null;
}

export function combineContents(patternList: ITooltipActual[]) {
  if (!patternList || !patternList.length) {
    return null;
  }

  // 拼接默认 tooltip content
  const defaultPatternContent: ITooltipLineActual[] = [];
  patternList.forEach(({ content }) => {
    if (content) {
      (content as ITooltipLineActual[]).forEach(c => {
        defaultPatternContent.push(c);
      });
    }
  });

  if (defaultPatternContent.length) {
    return {
      ...patternList[0],
      content: defaultPatternContent
    };
  }

  return patternList[0];
}

export const getTimeString = (value: any, timeFormat?: string, timeFormatMode?: 'local' | 'utc') => {
  if (!timeFormat && !timeFormatMode) {
    if (typeof value !== 'object') {
      return value?.toString();
    }
    return value;
  }

  const timeUtil = TimeUtil.getInstance();
  timeFormat = timeFormat || '%Y%m%d';
  timeFormatMode = timeFormatMode || 'local';
  const timeFormatter = timeFormatMode === 'local' ? timeUtil.timeFormat : timeUtil.timeUTCFormat;
  return timeFormatter(timeFormat, value);
};
