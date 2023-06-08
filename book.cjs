class book {
    constructor() {
      this.url = '';
      this.image = '';
      this.author = '';
      this.name = '';
      this.price = '';
    }
  
    setUrl(url) {
      this.url = url;
    }
  
    setImage(image) {
      this.image = image;
    }
  
    setAuthor(author) {
      this.author = author;
    }
  
    setName(name) {
      this.name = name;
    }
  
    setPrice(price) {
      this.price = price;
    }
  
    toString() {
      return `{
    "url": "${this.url}",
    "image": "${this.image}",
    "author": "${this.author}",
    "name": "${this.name}",
    "price": "${this.price}"
  }`;
    }
  }
  
  module.exports = Book;
  