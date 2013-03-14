/*
* jQuery Simply Countable plugin
* Provides a character counter for any text input or textarea
* 
* @version  0.4.2
* @homepage http://github.com/aaronrussell/jquery-simply-countable/
* @author   Aaron Russell (http://www.aaronrussell.co.uk)
*
* Copyright (c) 2009-2010 Aaron Russell (aaron@gc4.co.uk)
* Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
* and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
*/

// #TODO - Fix Calculations of words when using contentEditable
// #TODO - Fix select all (ctrl + a) when using contentEditable

(function($){

  $.fn.simplyCountable = function(options){
    
    options = $.extend({
      counter:            '#counter',
      countType:          'characters',
      wordSeparator:      ' ',
      maxCount:           140,
      alertCount:         20,
      warnCount:          10,
      strictMax:          false,
      showDescription:    false,
      descriptionText:    'remaining.',
      countDirection:     'down',
      safeClass:          'safe',
      alertClass:         'alert',
      warnClass:          'warn',
      overClass:          'over',
      thousandSeparator:  ',',
      onOverCount:        function(){},
      onSafeCount:        function(){},
      onMaxCount:         function(){}
    }, options);
    
    var countable = this;
    var counter = $(options.counter);
    if (!counter.length) { return false; }
    regex = new RegExp('['+options.wordSeparator+']+');
    
    var countCheck = function(){
           
      var count, revCount, countval, contentEditable;
      
      var reverseCount = function(ct){
        return ct - (ct*2) + options.maxCount;
      }
      
      var countInt = function(){
        return (options.countDirection === 'up') ? revCount : count;
      }
      
      var numberFormat = function(ct){
        var prefix = '';
        if (options.thousandSeparator){
          ct = ct.toString();          
          // Handle large negative numbers
          if (ct.match(/^-/)) { 
            ct = ct.substr(1);
            prefix = '-';
          }
          for (var i = ct.length-3; i > 0; i -= 3){
            ct = ct.substr(0,i) + options.thousandSeparator + ct.substr(i);
          }
        }
        return prefix + ct;
      }
      
      /* Check to see if target is using contentEditable */
      if ($(countable).attr('contentEditable')){
          contentEditable = true;
          countval = countable.text();
      }
      else{ countval = countable.val(); }

      /* Calculates count for either words or characters */
      if (options.countType === 'words'){
        count = options.maxCount - $.trim(countval).split(regex).length;
        if (countval === ''){ count += 1; }
      }
      else { count = options.maxCount - countval.length; }
      revCount = reverseCount(count);

      /* If strictMax set restrict further characters */
      
      if (options.strictMax && count <= 0){
        var content = countval;
        if (count < 0 || content.match(new RegExp('['+options.wordSeparator+']$'))) {
          options.onMaxCount(countInt(), countable, counter);
        }

        if (contentEditable === true) {
          if (options.countType === 'words') {
            countable.text(content.split(regex).slice(0, options.maxCount).join(options.wordSeparator));             
          }
          else { 
            countable.text(content.substring(0, options.maxCount));
          }
        }
        else {
          if (options.countType === 'words') {
            countable.val(content.split(regex).slice(0, options.maxCount).join(options.wordSeparator));    
          }
          else { 
            countable.val(content.substring(0, options.maxCount));  
          }
        }

        count = 0, revCount = options.maxCount;
      }
      
      /* If showDescription is set to true, show description */
      if (options.showDescription) {
          counter.text(numberFormat(countInt()) + ' ' + options.countType + ' ' + options.descriptionText);     
      }
      else { counter.text(numberFormat(countInt())); }
 
      /* Set CSS class rules and API callbacks */
      if (!counter.hasClass(options.safeClass) && !counter.hasClass(options.warnClass) && !counter.hasClass(options.alertClass) && !counter.hasClass(options.overClass)) {
          if (count < 0) { counter.addClass(options.overClass); }
          else { counter.addClass(options.safeClass); }
      }
      else if ((count <= options.warnCount) && !(count < 0) && !counter.hasClass(options.warnClass)) {
          counter.removeClass(options.safeClass).removeClass(options.alertClass).removeClass(options.overClass).addClass(options.warnClass);
      }
      else if ((count <= options.alertCount) && !(count <= options.warnCount) && !counter.hasClass(options.alertClass)) {
          counter.removeClass(options.safeClass).removeClass(options.warnClass).removeClass(options.overClass).addClass(options.alertClass);
      }
      else if ((count < 0) && !counter.hasClass(options.overClass)) {
          counter.removeClass(options.safeClass).removeClass(options.alertClass).removeClass(options.warnClass).addClass(options.overClass)
          options.onOverCount(countInt(), countable, counter);
      }
      else if (count > 0 && !(count <= options.alertCount) && !counter.hasClass(options.safeClass)) {
          counter.removeClass(options.alertClass).removeClass(options.warnClass).removeClass(options.overClass).addClass(options.safeClass);
          options.onSafeCount(countInt(), countable, counter);
      }
      
    };
    
    countCheck();
    var navKeys = [33,34,35,36,37,38,39,40];
    countable.keyup(function(evt) {
      if ($.inArray(evt.which, navKeys) < 0)
        countCheck();
    });
    countable.blur(countCheck);
    countable.bind('paste', function(){
      // Wait a few miliseconds for the pasting
      setTimeout(countCheck, 5);
    });
    
  };

})(jQuery);