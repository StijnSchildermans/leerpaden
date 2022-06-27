import ItemsQuestionModel from 'core/js/models/itemsQuestionModel';

class LeerpadenMcModel extends ItemsQuestionModel {


  isCorrect() {
    const allChildren = this.getChildren();
    const activeChildren = allChildren.filter(itemModel => itemModel.get('_isActive'));

    const isItemCorrect = itemModel => itemModel.get('_shouldBeSelected') && !itemModel.get('_isPartlyCorrect');
    const isItemPartlyCorrect = itemModel => itemModel.get('_isPartlyCorrect');
    const isItemIncorrect = itemModel => !itemModel.get('_shouldBeSelected') && !itemModel.get('_isPartlyCorrect');

    const sum = (list, predicate) => list.reduce((sum, item) => sum + (predicate(item) ? 1 : 0), 0);

    const props = {
      _numberOfRequiredAnswers: sum(allChildren, isItemCorrect),
      _numberOfCorrectAnswers: sum(activeChildren, isItemCorrect),
      _numberOfPartlyCorrectAnswers: sum(activeChildren, isItemPartlyCorrect),
      _numberOfIncorrectAnswers: sum(activeChildren, isItemIncorrect)
    };

    activeChildren.forEach(itemModel => itemModel.set('_isCorrect', itemModel.get('_shouldBeSelected')));

    props._isAtLeastOneCorrectSelection = (props._numberOfCorrectAnswers || props._numberOfPartlyCorrectAnswers);

    const numberOfSelectableAnswers = this.get('_selectable');
    const hasSelectableCorrectAnswers = (props._numberOfCorrectAnswers === numberOfSelectableAnswers);
    const hasAllCorrectAnswers = (props._numberOfCorrectAnswers === props._numberOfRequiredAnswers);
    const hasCorrectAnswers = (hasSelectableCorrectAnswers || hasAllCorrectAnswers);
    const hasIncorrectAnswers = props._numberOfIncorrectAnswers;
    const hasPartlyCorrectAnswers = props._numberOfPartlyCorrectAnswers;

    this.set(props);

    var correct = hasCorrectAnswers && !hasIncorrectAnswers && !hasPartlyCorrectAnswers;

    if (correct){
        //divsToHide is an array
        var divsToShow = document.getElementsByClassName(this.get('correctUnlock')); 
        for(var i = 0; i < divsToShow.length; i++){
                divsToShow[i].classList.remove("u-display-none"); 
        }
    }
    else {
	//divsToHide is an array
        var divsToShow = document.getElementsByClassName(this.get('incorrectUnlock')); 
        for(var i = 0; i < divsToShow.length; i++){
                divsToShow[i].classList.remove("u-display-none"); 
        }
    }

    return correct;
  }


  setupIncorrectFeedback() {
    const body = this.get('_feedback').incorrect;
    this.set({
      feedbackTitle: this.getFeedbackTitle(),
      feedbackMessage: Handlebars.compile(body)(this.toJSON())
    });
  }

  setupFeedback() {
    if (!this.has('_feedback')) return;

    if (this.get('_isCorrect')) {
      this.setupCorrectFeedback();
      return;
    }

    // apply individual item feedback
    const activeItem = this.getActiveItem();
    if (this.isSingleSelect() && activeItem.get('feedback')) {
      this.setupIndividualFeedback(activeItem);
      return;
    }

    this.setupIncorrectFeedback();
  }

}


export default LeerpadenMcModel; 
