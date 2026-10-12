import {challenges}from '../game/Challenge';import {railLengthMultiplier}from './RailCourse';
export function railTargetCount(stage:number,challenge:number){const original=Math.ceil([10,14,18][stage]*railLengthMultiplier*challenges[challenge].count);return challenge===1||challenge===2?Math.min(90,original):original;}
