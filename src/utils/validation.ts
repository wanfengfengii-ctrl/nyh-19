import dayjs from 'dayjs';
import type {
  ObjectiveFormData,
  MaintenanceFormData,
  DamageDetail,
} from '../types';

export const validateTestDate = (date: Date | null): string | null => {
  if (!date) return '请选择测试日期';
  if (dayjs(date).isAfter(dayjs(), 'day')) {
    return '测试日期不能晚于当前日期';
  }
  return null;
};

export const validateClarityScore = (score: number): string | null => {
  if (score === undefined || score === null || isNaN(score))
    return '请输入清晰度评分';
  if (score < 0 || score > 100) return '评分范围为 0-100';
  if (!Number.isInteger(score)) return '评分必须为整数';
  return null;
};

export const validateTreatmentAdvice = (
  advice: string,
  hasMold: boolean,
  hasScratch: boolean,
  hasCoatingDamage: boolean
): string | null => {
  if (
    (hasMold || hasScratch || hasCoatingDamage) &&
    (!advice || advice.trim() === '')
  ) {
    return '存在损伤时必须填写处理建议';
  }
  return null;
};

export const validateSerialNumber = (
  sn: string,
  isUnique: boolean
): string | null => {
  if (!sn || sn.trim() === '') return '请输入物镜编号';
  if (!isUnique) return '物镜编号已存在';
  if (sn.length > 50) return '物镜编号长度不能超过 50 个字符';
  return null;
};

export const validateMagnification = (mag: number | string): string | null => {
  const num = typeof mag === 'string' ? Number(mag) : mag;
  if (!num || isNaN(num)) return '请输入倍率';
  if (!Number.isInteger(num)) return '倍率必须为整数';
  if (num <= 0) return '倍率必须大于 0';
  if (num > 1000) return '倍率通常不超过 1000';
  return null;
};

export const validateNumericalAperture = (
  na: number | string
): string | null => {
  const num = typeof na === 'string' ? Number(na) : na;
  if (num === undefined || num === null || isNaN(num))
    return '请输入数值孔径';
  if (num <= 0) return '数值孔径必须大于 0';
  if (num > 1.65) return '数值孔径通常不超过 1.65';
  return null;
};

export const validateBrand = (brand: string): string | null => {
  if (!brand || brand.trim() === '') return '请选择品牌';
  return null;
};

export const validateInterfaceSpec = (spec: string): string | null => {
  if (!spec || spec.trim() === '') return '请选择接口规格';
  return null;
};

export const validateCoatingStatus = (status: string): string | null => {
  if (!status || status.trim() === '') return '请选择镀膜状态';
  return null;
};

export const validateStorageLocation = (location: string): string | null => {
  if (!location || location.trim() === '') return '请输入保存位置';
  if (location.length > 50) return '保存位置长度不能超过 50 个字符';
  return null;
};

export const validateDamageDetail = (
  damage: DamageDetail
): string | null => {
  if (!damage.type) return '请选择损伤类型';
  if (!damage.severity) return '请选择损伤程度';
  if (!damage.description || damage.description.trim() === '') {
    return '请输入损伤描述';
  }
  return null;
};

export const validateObjectiveForm = (
  data: Partial<ObjectiveFormData>,
  isSerialNumberUnique: boolean
): Record<string, string | null> => {
  return {
    serialNumber: validateSerialNumber(
      data.serialNumber || '',
      isSerialNumberUnique
    ),
    brand: validateBrand(data.brand || ''),
    magnification: validateMagnification(data.magnification || 0),
    numericalAperture: validateNumericalAperture(data.numericalAperture || 0),
    interfaceSpec: validateInterfaceSpec(data.interfaceSpec || ''),
    coatingStatus: validateCoatingStatus(data.coatingStatus || ''),
    storageLocation: validateStorageLocation(data.storageLocation || ''),
  };
};

export const validateMaintenanceForm = (
  data: MaintenanceFormData
): Record<string, string | null> => {
  const errors: Record<string, string | null> = {
    testDate: validateTestDate(data.testDate),
    clarityScore: validateClarityScore(data.clarityScore),
    treatmentAdvice: validateTreatmentAdvice(
      data.treatmentAdvice,
      data.hasMold,
      data.hasScratch,
      data.hasCoatingDamage
    ),
  };

  data.damages.forEach((damage, index) => {
    const damageError = validateDamageDetail(damage);
    if (damageError) {
      errors[`damage_${index}`] = damageError;
    }
  });

  return errors;
};

export const validateBatchImportItem = (
  item: Partial<ObjectiveFormData>,
  index: number
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!item.serialNumber || item.serialNumber.trim() === '') {
    errors.push(`第 ${index + 1} 行 - 编号: 请输入物镜编号`);
  } else if (item.serialNumber.length > 50) {
    errors.push(`第 ${index + 1} 行 - 编号: 物镜编号长度不能超过 50 个字符`);
  }

  const brandError = validateBrand(item.brand || '');
  if (brandError) errors.push(`第 ${index + 1} 行 - 品牌: ${brandError}`);

  const magnificationError = validateMagnification(item.magnification || 0);
  if (magnificationError)
    errors.push(`第 ${index + 1} 行 - 倍率: ${magnificationError}`);

  const naError = validateNumericalAperture(item.numericalAperture || 0);
  if (naError) errors.push(`第 ${index + 1} 行 - 数值孔径: ${naError}`);

  const interfaceError = validateInterfaceSpec(item.interfaceSpec || '');
  if (interfaceError) errors.push(`第 ${index + 1} 行 - 接口: ${interfaceError}`);

  const coatingError = validateCoatingStatus(item.coatingStatus || '');
  if (coatingError) errors.push(`第 ${index + 1} 行 - 镀膜: ${coatingError}`);

  const locationError = validateStorageLocation(item.storageLocation || '');
  if (locationError)
    errors.push(`第 ${index + 1} 行 - 位置: ${locationError}`);

  return { valid: errors.length === 0, errors };
};
