import QuestionView from 'core/js/views/questionView';
class LeerpadenView extends QuestionView {

  events() {
    return {
      'focus .js-textinput-textbox': 'clearValidationError',
      'change .js-textinput-textbox': 'onInputChanged',
      'keyup .js-textinput-textbox': 'onInputChanged'
    };
  }

  setupQuestion() {
    this.model.setupRandomisation();
  }

  disableQuestion() {
    this.setAllItemsEnabled(false);
  }

  enableQuestion() {
    this.setAllItemsEnabled(true);
  }

  setAllItemsEnabled(isEnabled) {
    this.model.get('_items').forEach((item, index) => {
      const $itemInput = this.$('.js-textinput-textbox').eq(index);

      $itemInput.prop('disabled', !isEnabled);
    });
  }

  onQuestionRendered() {
    this.setReadyStatus();
  }

  clearValidationError() {
    this.$('.js-textinput-textbox').removeClass('has-error');
  }

  // Blank method for question to fill out when the question cannot be submitted
  onCannotSubmit() {
    this.showValidationError();
  }

  showValidationError() {
    this.$('.js-textinput-textbox').addClass('has-error');
  }

  // This is important and should give the user feedback on how they answered the question
  // Normally done through ticks and crosses by adding classes
  showMarking() {
    if (!this.model.get('_canShowMarking')) return;

    this.model.get('_items').forEach((item, i) => {
      const $item = this.$('.js-textinput-item').eq(i);
      $item.removeClass('is-correct is-incorrect').addClass(item._isCorrect ? 'is-correct' : 'is-incorrect');
    });
  }

  // Used by the question view to reset the look and feel of the component.
  resetQuestion() {
    this.$('.js-textinput-textbox').prop('disabled', !this.model.get('_isEnabled')).val('');

    this.model.set({
      _isAtLeastOneCorrectSelection: false,
      _isCorrect: undefined
    });
  }

  onInputChanged(e) {
    const $input = $(e.target);
    this.model.setItemUserAnswer($input.parents('.js-textinput-item').index(), $input.val());
  }




}











LeerpadenView.template = 'leerpaden.jsx';

export default LeerpadenView;
