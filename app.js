// TIC Library Catalog - Application Logic
// This file will be populated with functionality for search, filtering, sorting, and pagination

document.addEventListener('DOMContentLoaded', function() {
    // Initialize application
    const catalog = new Catalog();
    
    // Load initial data
    catalog.loadBooks();
});

class Catalog {
    constructor() {
        this.books = [];
        this.filteredBooks = [];
        this.currentPage = 1;
        this.itemsPerPage = 8;
        this.searchTerm = '';
        this.sortOption = 'title-asc';
        
        // DOM Elements
        this.bookList = document.getElementById('bookList');
        this.pagination = document.getElementById('pagination');
        this.searchInput = document.getElementById('searchInput');
        this.sortSelect = document.getElementById('sortSelect');
    }

    loadBooks() {
        // TODO: Load books from TIC-Library-catalog.csv
        // For now, we'll use placeholder data
        this.books = [
            { id: '9780140449136', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', publisher: 'Scribner', year: 1925 },
            { id: '9780060935467', title: 'To Kill a Mockingbird', author: 'Harper Lee', publisher: 'Harper Perennial', year: 1960 },
            { id: '9780451526849', title: '1984', author: 'George Orwell', publisher: 'Signet Classic', year: 1949 },
            { id: '9780316769488', title: 'The Catcher in the Rye', author: 'J.D. Salinger', publisher: 'Little, Brown', year: 1951 },
            { id: '9780743273565', title: 'Pride and Prejudice', author: 'Jane Austen', publisher: 'Penguin Classics', year: 1813 },
        ];

        this.renderBooks();
    }

    renderBooks() {
        this.bookList.innerHTML = '';
        
        if (this.filteredBooks.length === 0) {
            this.bookList.innerHTML = '<p class="no-results">No books found matching your criteria.</p>';
            return;
        }

        this.filteredBooks.forEach(book => {
            const bookCard = document.createElement('div');
            bookCard.className = 'book-card';
            bookCard.innerHTML = `
                <h3>${book.title}</h3>
                <p class="author">${book.author}</p>
                <p class="publisher">${book.publisher} (${book.year})</p>
                <p class="isbn">ISBN: ${book.id}</p>
                <div class="book-images">
                    <a href="catalog-imgs/${book.id}/index.html" target="_blank">
                        <img src="catalog-imgs/${book.id}/cover.jpg" alt="${book.title} cover" onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'">
                    </a>
                </div>
            `;
            this.bookList.appendChild(bookCard);
        });

        this.renderPagination();
    }

    renderPagination() {
        const totalPages = Math.ceil(this.filteredBooks.length / this.itemsPerPage);
        
        if (totalPages <= 1) return;

        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `<button ${this.currentPage === 1 ? 'disabled' : ''} onclick="catalog.changePage(-1)">Previous</button>`;
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `<button ${i === this.currentPage ? 'class="active"' : ''} onclick="catalog.changePage(${i})">${i}</button>`;
        }
        
        // Next button
        paginationHTML += `<button ${this.currentPage === totalPages ? 'disabled' : ''} onclick="catalog.changePage(1)">Next</button>`;

        this.pagination.innerHTML = paginationHTML;
    }

    changePage(direction) {
        const totalPages = Math.ceil(this.filteredBooks.length / this.itemsPerPage);
        
        if (direction === -1 && this.currentPage > 1) {
            this.currentPage--;
        } else if (direction === 1 && this.currentPage < totalPages) {
            this.currentPage++;
        }

        this.renderBooks();
    }

    filterAndSort() {
        let filtered = [...this.books];

        // Apply search filter
        if (this.searchTerm.trim()) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(book => 
                book.title.toLowerCase().includes(term) ||
                book.author.toLowerCase().includes(term) ||
                book.publisher.toLowerCase().includes(term)
            );
        }

        // Apply sort
        switch (this.sortOption) {
            case 'title-asc':
                filtered.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'title-desc':
                filtered.sort((a, b) => b.title.localeCompare(a.title));
                break;
            case 'author-asc':
                filtered.sort((a, b) => a.author.localeCompare(b.author));
                break;
            case 'author-desc':
                filtered.sort((a, b) => b.author.localeCompare(a.author));
                break;
        }

        this.filteredBooks = filtered;
        this.currentPage = 1;
        this.renderBooks();
    }

    updateSearch() {
        this.searchTerm = this.searchInput.value.trim();
        this.filterAndSort();
    }

    updateSort() {
        this.sortOption = this.sortSelect.value;
        this.filterAndSort();
    }
}

// Initialize search suggestions
const catalog = new Catalog();

catalog.searchInput.addEventListener('input', function(e) {
    const term = e.target.value.trim();
    
    // Show/hide suggestions based on input
    const suggestionsContainer = document.getElementById('searchSuggestions');
    
    if (term.length > 0) {
        // Get matching books for suggestions
        const matches = catalog.books.filter(book => 
            book.title.toLowerCase().includes(term.toLowerCase()) ||
            book.author.toLowerCase().includes(term.toLowerCase())
        );

        suggestionsContainer.innerHTML = '';
        
        if (matches.length > 0) {
            matches.forEach(match => {
                const suggestion = document.createElement('li');
                suggestion.textContent = `${match.title} by ${match.author}`;
                suggestion.addEventListener('click', function() {
                    catalog.searchInput.value = match.title;
                    catalog.filterAndSort();
                    suggestionsContainer.style.display = 'none';
                });
                suggestionsContainer.appendChild(suggestion);
            });
        } else {
            const noMatch = document.createElement('li');
            noMatch.textContent = 'No matches found';
            suggestionsContainer.appendChild(noMatch);
        }
        
        suggestionsContainer.style.display = 'block';
    } else {
        suggestionsContainer.style.display = 'none';
    }
});

catalog.searchInput.addEventListener('click', function() {
    document.getElementById('searchSuggestions').style.display = 'none';
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    catalog.loadBooks();
});
