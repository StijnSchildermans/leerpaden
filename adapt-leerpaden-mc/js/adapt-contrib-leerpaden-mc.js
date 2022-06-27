import components from 'core/js/components';
import LeerpadenMcView from './LeerpadenMcView';
import LeerpadenMcModel from './LeerpadenMcModel';

export default components.register('leerpaden-mc', {
  model: LeerpadenMcModel,
  view: LeerpadenMcView
});
