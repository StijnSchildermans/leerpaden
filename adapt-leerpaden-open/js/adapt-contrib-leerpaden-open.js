import Adapt from 'core/js/adapt';
import LeerpadenView from './leerpadenView';
import LeerpadenModel from './leerpadenModel';

export default Adapt.register('leerpaden-open', {
  view: LeerpadenView,
  model: LeerpadenModel
});
