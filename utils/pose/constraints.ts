import type { Pose } from './types';
import { validateWristsAtShoulderHeight, validateElbowsExtended, validateArmsRaised, validateRightArmRaised, validateLeftArmRaised, validateRightArmLowered, validateLeftArmLowered, validateWristsBelowShoulders, validateChestClap } from './validators/arms';
import { validateUprightTorso } from './validators/posture';
import { validateFeetWide, validateFeetTogether } from './validators/legs';

export function validateConstraint(pose: Pose, constraintType: string, params: any, isFrontCamera: boolean = true): boolean {
  console.log('[Debug] Validating constraint:', constraintType, 'params:', params, 'frontCamera:', isFrontCamera);
  switch (constraintType) {
    case 'wristsAtShoulderHeight':
      return validateWristsAtShoulderHeight(pose, params.toleranceX ?? params.toleranceY);
    case 'elbowsExtended':
      return validateElbowsExtended(pose, params.minAngleDeg);
    case 'armsRaised':
      return validateArmsRaised(pose, params.minShoulderHeightX ?? params.minShoulderHeightY);
    case 'rightArmRaised':
      return validateRightArmRaised(pose, params.minHeightX || params.minHeightY || 0.4, isFrontCamera);
    case 'leftArmRaised':
      return validateLeftArmRaised(pose, params.minHeightX || params.minHeightY || 0.4, isFrontCamera);
    case 'rightArmLowered':
      return validateRightArmLowered(pose, params.maxHeightX || 0.8, isFrontCamera);
    case 'leftArmLowered':
      return validateLeftArmLowered(pose, params.maxHeightX || 0.8, isFrontCamera);
    case 'uprightTorso':
      return validateUprightTorso(pose, params.maxLeanDeg);
    case 'wristsBelowShoulders':
      return validateWristsBelowShoulders(pose, params.minDeltaX ?? 0.05);
    case 'feetWide':
      return validateFeetWide(pose, params.minDeltaY ?? 0.25);
    case 'feetTogether':
      return validateFeetTogether(pose, params.maxDeltaY ?? 0.12);
    case 'chestClap':
      return validateChestClap(pose, {
        minChestX: params.minChestX ?? 0.50,
        maxChestX: params.maxChestX ?? 0.65,
        maxDeltaY: params.maxDeltaY ?? 0.08,
      });
    default:
      console.warn(`[PoseUtils] Unknown constraint type: ${constraintType}`);
      return false;
  }
}


