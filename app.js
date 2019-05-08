//BUDGET CONTROLLER
var budgetController = (function(){
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if (totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }


    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;

        })
        data.totals[type] = sum;
    }

    var data = {
       allItems: {
           exp: [],
           inc: []
       },
       totals: {
           exp: 0,
           inc: 0
       },
       budget: 0,
       percentage: -1

    }

    return {
        addItem: function(type, des, val){
            var newItem, ID;
           
            // ID = lastID + 1
            //New ID
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;

            }else {
                ID = 0;
            }
            

            //Creating new item
            if (type === 'exp'){
                newItem = new Expense(ID, des, val);

            }else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            //Push item into the array
            data.allItems[type].push(newItem);

            //Expose the new item for public use.
            return newItem;
            

        },

        deleteItem: function(type, id){
            var ids, index;
            ids = data.allItems[type].map(function(current){
                return current.id;

            })

            index = ids.indexOf(id);

            if (index !== -1){
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function(){
            //1. Calculate total income and expensive
            calculateTotal('inc');
            calculateTotal('exp');
            
            //2. Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //3. Calculate percentages
            if (data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else {
                data.percentage = -1;
            }
            

        },

        calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            })

        },

        getPercentages: function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function (){
            return{
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function(){
            console.log(data);
        }
    }
    
})();


//USER INTERFACE CONTROLLER
var UIController = (function(){
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage'

    }
    return {
        getInput: function(){
            return{
                type: document.querySelector(DOMstrings.inputType).value, //may be inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)

            };
            
        },

        addListItem: function(obj, type){
            //HTML string with placeholder text
            var html, newHtml, element;
            if (type === 'inc'){
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if(type === 'exp'){
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            //Replace the HTML string with real data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            //Insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
            

            
        },

        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearfields: function(){
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array){
                //Set to empty string
                current.value = "";

            })

            fieldsArr[0].focus();

        },

        displayBudget: function(obj){
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            

            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '--';
            }

        },

        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            var nodeListForEach = function(list, callback){
                for (var i = 0; i < list.length; i++){
                    callback(list[i], i);
                }
            }

            nodeListForEach(fields, function(current, index){
                if (percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                }else {
                    current.textContent = "--"
                }
                

            });

        },
        
        formatNumber: function(num, type){
            var numSplit, int, dec;
            /*
             + or - before the number
             exactly 2 decimal points
             comma sepaating the thousands
            */
           num = Math.abs(num);
           num = num.toFixed(2);

           numSplit = num.split('.');
           
           int = numSplit[0];
           if (int.length > 3){
               int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3,3);
           }

           dec = numSplit[1];
           
        },

        getDOMstrings: function(){
            return DOMstrings;
        },


        
    };
})();


//MAIN APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl){
    var setupEventListeners = function(){
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
    
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);



    };
    
    

    var updateBudget = function(){
        //1. Calculate the budget
        budgetCtrl.calculateBudget();
        //2. Return the budget
        var budget = budgetCtrl.getBudget();
        //3. Display the budget on user interface
        UICtrl.displayBudget(budget);

    };

    var updatePercentages = function(){
        //1. Calculate percentages
        budgetCtrl.calculatePercentages();
        //2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        //3. Update the new percentages on the user interface 
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function(){
        var input, newItem;
      //1. Get inputted data
        input = UICtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
        //2. Add the data to the budget controller area
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);

        //3. Add the item to the user interface
        UICtrl.addListItem(newItem, input.type);

        //4. Clear fields
        UICtrl.clearfields();

        //5. Calculate and update the budget
        updateBudget();

        //6. Calculate and update percentages
        updatePercentages();

        }
      
        
        

    };

    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id; 
        
        if (itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. Delete item from data structure
            budgetCtrl.deleteItem(type, ID);

            //2. Delete item from user interface
            UICtrl.deleteListItem(itemID);

            //3. Update the budget
            updateBudget();

            //4. Calculate and update percentages
            updatePercentages();

        }
    }

    return {
        init: function(){
            console.log('application is working fine');
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();

        }
    };

   
 

})(budgetController, UIController);

controller.init();