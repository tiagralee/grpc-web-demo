import {grpc} from "@improbable-eng/grpc-web";
import {BookService} from "../_proto/examplecom/library/book_service_pb_service";
import {QueryBooksRequest, Book, GetBookRequest} from "../_proto/examplecom/library/book_service_pb";

declare const USE_TLS: boolean;
const host = USE_TLS ? "https://localhost:9091" : "http://localhost:9090";

function getBook() {
  clearCurrentList('bookListUnary')
  const getBookRequest = new GetBookRequest();
  getBookRequest.setIsbn(60929871);
  grpc.unary(BookService.GetBook, {
    request: getBookRequest,
    host: host,
    onEnd: res => {
      const { status, statusMessage, headers, message, trailers } = res;
      console.log("getBook.onEnd.status", status, statusMessage);
      console.log("getBook.onEnd.headers", headers);
      if (status === grpc.Code.OK && message) {
        let book = <Book> message;
        renderToList(book.toObject().author, 'bookListUnary');
        console.log("getBook.onEnd.message", message.toObject());
      }
      console.log("getBook.onEnd.trailers", trailers);
      //queryBooks();
    }
  });
}


function queryBooks() {
  clearCurrentList('bookList')
  const queryBooksRequest = new QueryBooksRequest();
  let searchBox : any = document.getElementById('searchBox')
  let searchText = searchBox.value;

  queryBooksRequest.setAuthorPrefix(searchText);
  const client = grpc.client(BookService.QueryBooks, {
    host: host,
  });
  client.onHeaders((headers: grpc.Metadata) => {
    console.log("queryBooks.onHeaders", headers);
  });
  client.onMessage((message: Book) => {
    renderToList(message.toObject().author, 'bookList');
    console.log("queryBooks.onMessage", message.toObject());
  });
  client.onEnd((code: grpc.Code, msg: string, trailers: grpc.Metadata) => {
    console.log("queryBooks.onEnd", code, msg, trailers);
  });
  client.start();
  client.send(queryBooksRequest);
}

function clearCurrentList(listName: string){
  let bookListElement: HTMLElement | null = document.getElementById(listName)
  if(bookListElement!=null){
    bookListElement.innerHTML = '';
  }
}

function renderToList(value: string, listName: string) {
  var innerLi = `<li>${value}</li>`;
  let bookListElement: HTMLElement | null = document.getElementById(listName)
  if(bookListElement!=null){
    bookListElement.insertAdjacentHTML('beforeend', innerLi);
  }
}

function init() {
  let searchButton: HTMLElement| null = document.getElementById('btnSearch')
  if(searchButton!=null){
    searchButton.addEventListener('click', queryBooks);
  }

  let searchButtonUnary: HTMLElement| null = document.getElementById('btnSearchUnary')
  if(searchButtonUnary!=null){
    searchButtonUnary.addEventListener('click', getBook);
  }
}

init()
