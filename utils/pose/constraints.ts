import type { Pose } from './types';
import { validateWristsAtShoulderHeight, validateElbowsExtended, validateArmsRaised, validateRightArmRaised, validateLeftArmRaised, validateRightArmLowered, validateLeftArmLowered } from './validators/arms';
import { validateUprightTorso } from './validators/posture';

export function validateConstraint(pose: Pose, constraintType: string, params: any, isFrontCamera: boolean = true): boolean {
  console.log('[Debug] Validating constraint:', constraintType, 'params:', params, 'frontCamera:', isFrontCamera);
  switch (constraintType) {
    case 'wristsAtShoulderHeight':
      return validateWristsAtShoulderHeight(pose, params.toleranceY);
    case 'elbowsExtended':
      return validateElbowsExtended(pose, params.minAngleDeg);
    case 'armsRaised':
      return validateArmsRaised(pose, params.minShoulderHeightY);
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
    default:
      console.warn(`[PoseUtils] Unknown constraint type: ${constraintType}`);
      return false;
  }
}


