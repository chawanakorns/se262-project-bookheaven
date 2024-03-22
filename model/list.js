const BaseSQLModel = require("./baseSQLModel");

// Create a new class for a specific table
class TodoItemsModel extends BaseSQLModel {
  constructor(tableName) {
    super(tableName); //table 'products'
  }

  speak() {
    console.log("Hello!");
  }

  //check if there is a record of todoItems in the database?
  // if there is no todoItems record, call setinitialItems() to define intial


  async getTodoItemsName(){
    const results =  await this.findByColumn('name');
    return results;

  }

  async getListItems() {
      const results = await this.findAll();
      return results;
  }
}

const TodoItemsDB = new TodoItemsModel();

module.exports = TodoItemsModel;
