module.exports = class Collection {
  constructor() {
    this.items = [];
  }

  add(item) {
    this.items.push(item);
  }
  remove(item) {
    this.items.filter(value => item !== value);
  }
}
