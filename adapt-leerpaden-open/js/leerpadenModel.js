import QuestionModel from 'core/js/models/questionModel';

class LeerpadenModel extends QuestionModel {

  init() {
    super.init();

    this.set('_genericAnswerIndexOffset', LeerpadenModel.genericAnswerIndexOffset);
    this.set('_canReset', true);

    this.setupQuestionItemIndexes();
    this.checkCanSubmit();
  }

  /**
   * @param {string} [type] 'hard' resets _isComplete and _isInteractionComplete, 'soft' resets _isInteractionComplete only.
   * @param {boolean} [canReset] Defaults to this.get('_canReset')
   * @returns {boolean}
   */
  reset(type = 'hard') {
    const wasReset = super.reset(type, true);
    if (!wasReset) return false;
    this.set({
      _isAtLeastOneCorrectSelection: false,
      _isCorrect: null
    });
    return true;
  }

  setupQuestionItemIndexes() {
    this.get('_items').forEach((item, index) => {
      if (item._index === undefined) item._index = index;
      if (item._answerIndex === undefined) item._answerIndex = -1;
    });
  }

  restoreUserAnswers() {
    if (!this.get('_isSubmitted')) return;

    const userAnswer = this.get('_userAnswer');
    const genericAnswers = this.get('_answers');
    this.get('_items').forEach(item => {
      const answerIndex = userAnswer[item._index];
      if (answerIndex >= LeerpadenModel.genericAnswerIndexOffset) {
        item.userAnswer = genericAnswers[answerIndex - LeerpadenModel.genericAnswerIndexOffset];
        item._answerIndex = answerIndex;
      } else if (answerIndex > -1) {
        item.userAnswer = item._answers[answerIndex];
        item._answerIndex = answerIndex;
      } else {
        if (item.userAnswer === undefined) item.userAnswer = '******';
        item._answerIndex = -1;
      }
      if (item.userAnswer instanceof Array) item.userAnswer = item.userAnswer[0];
    });

    this.setQuestionAsSubmitted();
    this.markQuestion();
    this.setScore();
    this.setupFeedback();
  }

  setupRandomisation() {
    //this.set('_items', this.get('answer'));
  }

  // Use to check if the user is allowed to submit the question
  canSubmit() {
    // can submit if every item has user input
    return this.get('_items').every(({ userAnswer }) => userAnswer);
  }

  setItemUserAnswer(itemIndex, userAnswer) {
    const item = this.get('_items')[itemIndex];
    item.userAnswer = userAnswer;
    this.checkCanSubmit();
  }


  onSubmitted() {
    // Stores the current attempt state
    if (!this.get('_isCorrect'))
    {
      this.resetUserAnswer();
      this.reset();
    }
    this.set('_shouldShowMarking', this.shouldShowMarking);
  }

  // Preserves the state for returning or showing the user's answers
  storeUserAnswer() {
    const items = this.get('_items');

    this.isCorrect();

    const userAnswer = new Array(items.length);
    items.forEach(({ _index, _answerIndex }) => (userAnswer[_index] = _answerIndex));
    this.set('_userAnswer', userAnswer);
  }

  isCorrect() {
    if (this.get('_answers')) {
      this.markGenericAnswers();
    } else {
      this.markSpecificAnswers();
    }
    var correct = this.get('_items').every(({ _isCorrect }) => _isCorrect);


    if (correct){
    	var divsToShow = document.getElementsByClassName(this.get('correctUnlock')); //divsToHide is an array
    	for(var i = 0; i < divsToShow.length; i++){
        	divsToShow[i].classList.remove("u-display-none"); // depending on what you're doing
    	}
    }
    else {
    	var divsToShow = document.getElementsByClassName(this.get('incorrectUnlock')); //divsToHide is an array
    	for(var i = 0; i < divsToShow.length; i++){
        	divsToShow[i].classList.remove("u-display-none"); // depending on what you're doing
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

  isPartlyCorrect() {
    return this.get('_isAtLeastOneCorrectSelection');
  }

  // Allows the learner to give answers into any input, ignoring the order.
  // (this excludes any inputs which have their own specific answers).
  markGenericAnswers() {
    let numberOfCorrectAnswers = 0;
    const correctAnswers = this.get('_answers').slice();
    const usedAnswerIndexes = [];

    this.get('_items').forEach(item => {
      correctAnswers.forEach((answerGroup, answerIndex) => {
        if (usedAnswerIndexes.includes(answerIndex)) return;

        if (this.checkAnswerIsCorrect(answerGroup, item.userAnswer) === false) return;

        usedAnswerIndexes.push(answerIndex);
        item._isCorrect = true;
        item._answerIndex = answerIndex + LeerpadenModel.genericAnswerIndexOffset;

        this.set({
          _numberOfCorrectAnswers: ++numberOfCorrectAnswers,
          _isAtLeastOneCorrectSelection: true
        });

      });
      if (!item._isCorrect) item._isCorrect = false;
    });
  }

  // Marks any items which have answers specific to it
  // (i.e. item has a _answers array)
  markSpecificAnswers() {
    let numberOfCorrectAnswers = 0;
    this.get('_items').forEach(item => {
      const answers = item._answers;
      if (!answers) return;
      const userAnswer = item.userAnswer || '';
      const isCorrect = this.checkAnswerIsCorrect(answers, userAnswer);
      item._isCorrect = isCorrect;
      item._answerIndex = answers.indexOf(this.cleanupUserAnswer(userAnswer));
      if (!isCorrect) return;
      this.set({
        _numberOfCorrectAnswers: ++numberOfCorrectAnswers,
        _isAtLeastOneCorrectSelection: true
      });
    });
  }

  checkAnswerIsCorrect(possibleAnswers, userAnswer) {
    const uAnswer = this.cleanupUserAnswer(userAnswer);

    const answerIsCorrect = possibleAnswers.some(cAnswer => {
      return this.cleanupUserAnswer(cAnswer) === uAnswer;
    });
    return answerIsCorrect;
  }

  cleanupUserAnswer(userAnswer) {
    if (this.get('_allowsAnyCase')) {
      userAnswer = userAnswer.toLowerCase();
    }
    if (this.get('_allowsPunctuation')) {
      userAnswer = userAnswer.replace(/[.,-/#!$£%^&*;:{}=\-_`~()]/g, '');
      // remove any rphan double spaces and replace with single space (B & Q)->(B  Q)->(B Q)
      userAnswer = userAnswer.replace(/(  +)+/g, ' ');
    }
    // removes whitespace from beginning/end (leave any in the middle)
    return userAnswer.trim();
  }

  // Used to set the score based upon the _questionWeight
  setScore() {
    const numberOfCorrectAnswers = this.get('_numberOfCorrectAnswers');
    const questionWeight = this.get('_questionWeight');
    const itemLength = this.get('_items').length;

    const score = questionWeight * numberOfCorrectAnswers / itemLength;
    this.set('_score', score);
  }

  resetUserAnswer() {
    this.get('_items').forEach(item => {
      item._isCorrect = false;
      item.userAnswer = '';
    });
  }

  /**
  * used by adapt-contrib-spoor to get the user's answers in the format required by the cmi.interactions.n.student_response data field
  * returns the user's answers as a string in the format 'answer1[,]answer2[,]answer3'
  * the use of [,] as an answer delimiter is from the SCORM 2004 specification for the fill-in interaction type
  */
  getResponse() {
    return this.get('_items').map(({ userAnswer }) => userAnswer).join('[,]');
  }

  /**
  * used by adapt-contrib-spoor to get the type of this question in the format required by the cmi.interactions.n.type data field
  */
  getResponseType() {
    return 'fill-in';
  }

}

LeerpadenModel.genericAnswerIndexOffset = 65536;

export default LeerpadenModel;
