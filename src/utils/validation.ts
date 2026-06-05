import dayjs from 'dayjs';

export const validateTestDate = (date: Date | null): string | null => {
  if (!date) return '请选择测试日期';
  if (dayjs(date).isAfter(dayjs(), 'day')) {
    return '测试日期不能晚于当前日期';
  }
  return null;
};

export const validateClarityScore = (score: number): string | null => {
  if (score === undefined || score === null) return '请输入清晰度评分';
  if (score < 0 || score > 100) return '评分范围为 0-100';
  if (!Number.isInteger(score)) return '评分必须为整数';
  return null;
};

export const validateTreatmentAdvice = (
  advice: string,
  hasMold: boolean,
  hasScratch: boolean
): string | null => {
  if ((hasMold || hasScratch) && (!advice || advice.trim() === '')) {
    return '存在霉斑或划痕时必须填写处理建议';
  }
  return null;
};

export const validateSerialNumber = (
  sn: string,
  isUnique: boolean
): string | null => {
  if (!sn || sn.trim() === '') return '请输入物镜编号';
  if (!isUnique) return '物镜编号已存在';
  return null;
};

export const validateMagnification = (mag: number | string): string | null => {
  const num = typeof mag === 'string' ? parseFloat(mag) : mag;
  if (!num || isNaN(num)) return '请输入倍率';
  if (num <= 0) return '倍率必须大于 0';
  return null;
};

export const validateNumericalAperture = (na: number | string): string | null => {
  const num = typeof na === 'string' ? parseFloat(na) : na;
  if (num === undefined || num === null || isNaN(num)) return '请输入数值孔径';
  if (num <= 0) return '数值孔径必须大于 0';
  if (num > 1.5) return '数值孔径通常不超过 1.5';
  return null;
};
