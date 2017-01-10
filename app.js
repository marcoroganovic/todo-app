(function() {
  var COLLECTION;
  var $root = document.querySelector(".container");

  ajaxify.get({
    url: "data.json",

    success: function(data) {
      COLLECTION = JSON.parse(data);
      jsHTML.dispatcher.dispatch("render", COLLECTION);
    },

    failure: function(status, data) {
      $root.innerHTML = "Loading...";
    },

    doSend: true
  });


  var Input = ()  => {
    return jsHTML.input({type: "text", placeholder: "Task name"}, null);
  }

  var Button = () => {
    return jsHTML.button({className: "button-primary"}, "Add task");
  }

  var Form = (props) => {
    
    function pushTask(val) {
      COLLECTION.push({
        id: COLLECTION.length + 1,
        name: val,
        completed: false
      });
    }

    function handleAddTask(e) {
      e.preventDefault();
      var value = e.target[0].value;
      if(value) {
        pushTask(value);
        jsHTML.dispatcher.dispatch("render", COLLECTION);
      }
    }

    var componentEvents = {
      "submit": handleAddTask
    };

    var form = jsHTML.form({}, [Input(), Button()]);
    jsHTML.addEvents(form, componentEvents);

    return form;
  }

  var StateButton = (props) => {
    return jsHTML.button({
      className: props.cssClass, 
      "data-id": props.id
    }, props.symbol);
  }

  var Task = (props) => {
    var buttonsData = [
      { cssClass: "complete", symbol: "✓", id: props.id },
      { cssClass: "remove", symbol: "x", id: props.id }
    ];

    var list = buttonsData.map(data => StateButton(data));
    list.unshift(jsHTML.text(props.name + " "));

    return jsHTML.li({className: props.completed ? "completed" : "false"}, list);
  }

  var TaskList = (props) => {
    var list = props.collection.map(task => {
      return Task(task);
    });

    function removeElement(id) {
      COLLECTION = COLLECTION.filter(task => {
        if(task.id !== id) return task;
      });
    }

    function handleRemoveElement(e) {
      var id = +e.target.dataset.id;
      removeElement(id);
      jsHTML.dispatcher.dispatch("render", COLLECTION);
    }

    function completeTask(id) {
      COLLECTION = COLLECTION.map((task) => {
        if(task.id === id) {
          task.completed = true;
        }
        return task;
      });
    }

    function handleCompletedTask(e) {
      var id = +e.target.dataset.id;
      completeTask(id);
      jsHTML.dispatcher.dispatch("render", COLLECTION);
    }

    function handleTaskChange(e) {
      var name = e.target.className;
      switch(name) {
        case "complete":
          handleCompletedTask(e);
          break;
        case "remove":
          handleRemoveElement(e);
          break;
      }
    }
    
    var componentEvents = {
      "click": handleTaskChange
    };

    var ul = jsHTML.ul({}, list);
    jsHTML.addEvents(ul, componentEvents);

    return ul;
  }

  var DetailSpan = (props) => {
    return jsHTML.span({}, props.name + ": " + props.status);
  }

  var TaskDetails = (props) => {

    function getStats(arr) {
      var output = {
        total: arr.length,
        complete: 0,
        uncomplete: 0
      };

      arr.forEach(item => {
        output[item.completed ? "complete" : "uncomplete"] += 1;
      });
      
      return output;
    }

    var stats = getStats(props.collection);

    var buttonContent = [
      { name: "Total", status: stats.total },
      { name: "Completed", status: stats.complete },
      { name: "Uncompleted", status: stats.uncomplete }
    ];
    
    var list = buttonContent.map((button) => {
      return DetailSpan(button);
    });

    return jsHTML.div({className: "details"}, list);
  }

  var App = (props) => {
    return (
        jsHTML.div({}, [
          Form(), 
          TaskList({collection: props.collection}),
          TaskDetails({ collection: props.collection })
        ])
    );
  }

  jsHTML.dispatcher.subscribe("render", function(collection) {
    jsHTML.render(App({ collection }), $root);
  });

})();
