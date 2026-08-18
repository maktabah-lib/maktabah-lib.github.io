// TIC Library Catalog - Application Logic
// This file will be populated with functionality for search, filtering, and sorting

document.addEventListener('DOMContentLoaded', function() {
    // Initialize application
    const catalog = new Catalog();
    
    // Load initial data
    catalog.loadBooks();
});

class Catalog {
    constructor() {
        this.books = [];
        
        // DOM Elements
        this.bookList = document.getElementById('bookList');
    }

    loadBooks() {
        // Read books from TIC-Library-catalog.csv using Papa Parse to load as JSON
        fetch('./TIC-Library-catalog.csv')
            .then(response => response.text())
            .then(csvText => {
                const results = Papa.parse(csvText, { header: true });
                this.books = results.data;
                this.renderBooks();
            })
            .catch(error => {
                console.error('Error loading CSV:', error);
                // Fallback to placeholder data if file doesn't exist
                this.books = [
                    { id: '9780140449136', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', publisher: 'Scribner', year: 1925 },
                    { id: '9780060935467', title: 'To Kill a Mockingbird', author: 'Harper Lee', publisher: 'Harper Perennial', year: 1960 },
                    { id: '9780451526849', title: '1984', author: 'George Orwell', publisher: 'Signet Classic', year: 1949 },
                    { id: '9780316769488', title: 'The Catcher in the Rye', author: 'J.D. Salinger', publisher: 'Little, Brown', year: 1951 },
                    { id: '9780743273565', title: 'Pride and Prejudice', author: 'Jane Austen', publisher: 'Penguin Classics', year: 1813 },
                ];
                this.renderBooks();
            });
    }

    // parseCSV method removed as we now use Papa Parse to load CSV as JSON
    // parseCSV(csvText) { ... }

    renderBooks() {
        this.bookList.innerHTML = '';
        
        if (this.books.length === 0) {
            this.bookList.innerHTML = '<p class="no-results">No books found.</p>';
            return;
        }

        this.books.forEach(book => {
            const title = book.Title || '(none)';
            const author = book.Author || '(none)';
            const isbn = book.ID || '(none)';
            
            const bookCard = document.createElement('div');
            bookCard.className = 'book-card';
            bookCard.innerHTML = `
                <h3>${title}</h3>
                <p class="author">${author}</p>
                <p class="isbn">ISBN: ${isbn}</p>
            `;
            this.bookList.appendChild(bookCard);
        });
    }

    updateSearch() {
        // Search functionality removed as requested
    }

    updateSort() {
        // Sort functionality removed as requested
    }
}
