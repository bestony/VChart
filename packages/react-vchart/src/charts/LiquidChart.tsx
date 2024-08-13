import type React from 'react';
import type { ILiquidChartSpec, IVChartConstructor } from '@visactor/vchart';
import { VChart, registerLiquidChart } from '@visactor/vchart';
import type { BaseChartProps } from './BaseChart';
import { createChart } from './BaseChart';
import { simpleComponentsRegisters } from './register';

export interface LiquidChartProps
  extends Omit<BaseChartProps, 'spec' | 'container' | 'type' | 'data' | 'data'>,
    Omit<Partial<ILiquidChartSpec>, 'type'> {}

export const LiquidChart = createChart<React.PropsWithChildren<LiquidChartProps> & { type?: 'liquid' }>(
  'LiquidChart',
  {
    type: 'liquid',
    vchartConstrouctor: VChart as IVChartConstructor
  },
  [registerLiquidChart, ...simpleComponentsRegisters]
);
