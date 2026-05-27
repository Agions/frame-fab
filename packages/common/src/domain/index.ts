/**
 * Package exports manifest
 * 子域校验器统一导出入口
 */

export type { ValidationResult, EntityValidationResult } from './shared/types';

export {
  validateScriptTitle,
  validateScriptContent,
  validateSceneDescription,
  validateDialogue,
  validateCharacterName,
  validateScript,
  ScriptTitle,
  CharacterName,
  scriptEntity,
} from './script/validators';

export {
  validateCharacterDescription,
  validateCharacterAppearance,
} from './character/validators';

export {
  validateSceneNumber,
} from './scene/validators';