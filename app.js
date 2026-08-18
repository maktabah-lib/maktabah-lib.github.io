// TIC Library Catalog - Application Logic
// This file will be populated with functionality for search, filtering, and sorting

document.addEventListener('DOMContentLoaded', function() {
    // Initialize application
    const catalog = new Catalog();
    
    // Load initial data
    catalog.loadBooks();
    
    // Handle route based on query parameters
    catalog.handleRoute();
    
    // Add search event listener (only when search container is visible)
    if (catalog.searchContainer.style.display !== 'none') {
        catalog.searchInput.addEventListener('input', () => catalog.updateSearch());
    }
});

class Catalog {
    constructor() {
        this.books = [];
        
        // DOM Elements
        this.bookList = document.getElementById('bookList');
        this.bookDetail = document.getElementById('bookDetail');
        this.searchInput = document.getElementById('searchInput');
        this.searchContainer = document.getElementById('searchContainer');
    }

    loadBooks() {
        // Read books from TIC-Library-catalog.csv using Papa Parse to load as JSON
        fetch('./TIC-Library-catalog.csv')
            .then(response => response.text())
            .then(csvText => {
                const results = Papa.parse(csvText, { header: true });
                this.books = results.data;
                this.handleRoute();
            })
            .catch(error => {
                console.error('Error loading CSV:', error);
                // Fallback to placeholder data if file doesn't exist
                this.books = [
                    { ID: '9780140449136', Title: 'The Great Gatsby', Author: 'F. Scott Fitzgerald', Publisher: 'Scribner', Year: 1925, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9780060935467', Title: 'To Kill a Mockingbird', Author: 'Harper Lee', Publisher: 'Harper Perennial', Year: 1960, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9780451526849', Title: '1984', Author: 'George Orwell', Publisher: 'Signet Classic', Year: 1949, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9780316769488', Title: 'The Catcher in the Rye', Author: 'J. D. Salinger', Publisher: 'Little, Brown', Year: 1951, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                    { ID: '9780743273565', Title: 'Pride and Prejudice', Author: 'Jane Austen', Publisher: 'Penguin Classics', Year: 1813, 'Volume #': null, Translator: null, '# of Copies': null, 'Shelf ID': null },
                ];
                this.handleRoute();
            });
    }

    handleRoute() {
        const urlParams = new URLSearchParams(window.location.search);
        const bookId = urlParams.get('id');
        
        if (bookId) {
            const book = this.books.find(b => b.ID === bookId);
            if (book) {
                this.renderBookDetail(book);
            } else {
                this.bookDetail.innerHTML = '<p>Book not found.</p>';
                this.bookDetail.style.display = 'block';
            }
        } else {
            this.renderBooks();
            this.bookDetail.style.display = 'none';
        }
    }

    renderBooks() {
        this.bookList.innerHTML = '';
        
        if (this.books.length === 0) {
            this.bookList.innerHTML = '<p class="no-results">No books found.</p>';
            return;
        }

        // Get search query from input
        const searchTerm = this.searchInput.value.toLowerCase().trim();
        
        // Filter books based on search term
        const filteredBooks = this.books.filter(book => {
            const title = (book.Title || '').toLowerCase();
            const author = (book.Author || '').toLowerCase();
            const isbn = (book.ID || '').toLowerCase();
            
            return title.includes(searchTerm) || 
                   author.includes(searchTerm) || 
                   isbn.includes(searchTerm);
        });

        filteredBooks.forEach(book => {
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
            // Add click event to navigate to book detail
            bookCard.addEventListener('click', () => {
                window.location.href = `./index.html?id=${book.ID}`;
            });
            this.bookList.appendChild(bookCard);
        });
    }

    renderBookDetail(book) {
        this.bookList.style.display = 'none';
        this.bookDetail.style.display = 'block';
        
        // Hide search bar when viewing book detail
        this.searchContainer.style.display = 'none';
        
        const fields = [
            { label: 'ID', value: book.ID },
            { label: 'Title', value: book.Title },
            { label: 'Volume #', value: book['Volume #'] },
            { label: 'Author', value: book.Author },
            { label: 'Translator', value: book.Translator },
            { label: 'Publisher', value: book.Publisher },
            { label: '# of Copies', value: book['# of Copies'] },
            { label: 'Shelf ID', value: book['Shelf ID'] },
        ];
        
        let detailHTML = '<h2>Book Details</h2><div class="detail-content">';
        fields.forEach(field => {
            const displayValue = field.value !== null && field.value !== undefined ? field.value : '(none)';
            detailHTML += `<p><strong>${field.label}:</strong> ${displayValue}</p>`;
        });
        detailHTML += '</div>';
        
        // Add a back button to return to list
        detailHTML += '<button id="backToList">Back to Catalog</button>';
        
        this.bookDetail.innerHTML = detailHTML;
        
        // Attach event listener to back button
        document.getElementById('backToList').addEventListener('click', () => {
            window.location.href = './index.html';
        });
    }

    updateSearch() {
        // Search functionality - filter books based on input
        this.renderBooks();
    }

    updateSort() {
        // Sort functionality removed as requested
    }
}
