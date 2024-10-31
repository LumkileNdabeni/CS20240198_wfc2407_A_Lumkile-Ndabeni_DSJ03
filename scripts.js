// Import necessary data from external module
import { books, authors, genres, BOOKS_PER_PAGE } from './data.js';

// Application object to encapsulate functionalities
const BookApp = {
    page: 1,  // Current page of book previews
    matches: books,  // Books that match the current filters

    // Initialize the application
    init() {
        // Display the first page of book previews
        this.populateBookPreviews(this.matches.slice(0, BOOKS_PER_PAGE));
        // Populate dropdowns for genres and authors
        this.populateDropdowns();
        // Set the theme based on user preference
        this.setTheme();
        // Update the "Show more" button state
        this.updateShowMoreButton();
        // Set up event listeners for user interactions
        this.setupEventListeners();
    },

    // Function to create and return a book preview element
    createBookPreviewElement({ author, id, image, title }) {
        const element = document.createElement('button');  // Create a button for the book preview
        element.classList.add('preview');  // Add a class for styling
        element.setAttribute('data-preview', id);  // Set a data attribute for identification
        
        // Set the inner HTML of the button with book details
        element.innerHTML = `
            <img class="preview__image" src="${image}" />
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `;
        return element;  // Return the created element
    },

    // Function to populate book previews on the page
    populateBookPreviews(bookList) {
        const fragment = document.createDocumentFragment();  // Create a document fragment for performance
        // Create and append each book preview element to the fragment
        bookList.forEach(book => fragment.appendChild(this.createBookPreviewElement(book)));
        
        const listContainer = document.querySelector('[data-list-items]');  // Select the list container
        listContainer.innerHTML = '';  // Clear previous items
        listContainer.appendChild(fragment);  // Append the new book previews
    },

    // Function to populate dropdown menus for genres and authors
    populateDropdowns() {
        // Populate the genres dropdown
        this.populateDropdown('[data-search-genres]', {
            firstOptionText: 'All Genres',
            items: genres,
        });
        // Populate the authors dropdown
        this.populateDropdown('[data-search-authors]', {
            firstOptionText: 'All Authors',
            items: authors,
        });
    },

    // Function to populate a single dropdown
    populateDropdown(elementSelector, options) {
        const dropdownFragment = document.createDocumentFragment();  // Create a fragment for dropdown options
        const firstElement = document.createElement('option');  // Create the first option element
        firstElement.value = 'any';  // Set value to 'any'
        firstElement.innerText = options.firstOptionText;  // Set the text for the first option
        dropdownFragment.appendChild(firstElement);  // Append to fragment

        // Create an option for each item in the dropdown
        Object.entries(options.items).forEach(([id, name]) => {
            const element = document.createElement('option');
            element.value = id;  // Set value to the item's id
            element.innerText = name;  // Set the display name
            dropdownFragment.appendChild(element);  // Append to fragment
        });

        document.querySelector(elementSelector).appendChild(dropdownFragment);  // Append all options to the dropdown
    },

    // Function to set the theme based on user preference
    setTheme() {
        const themeInput = document.querySelector('[data-settings-theme]');  // Select the theme input element
        const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;  // Check for dark mode preference

        // Set the theme input value based on preference
        themeInput.value = isDarkMode ? 'night' : 'day';
        // Update CSS variables for theme colors
        document.documentElement.style.setProperty('--color-dark', isDarkMode ? '255, 255, 255' : '10, 10, 20');
        document.documentElement.style.setProperty('--color-light', isDarkMode ? '10, 10, 20' : '255, 255, 255');
    },

    // Function to update the "Show more" button
    updateShowMoreButton() {
        const showMoreButton = document.querySelector('[data-list-button]');  // Select the button element
        const remainingBooks = this.matches.length - (this.page * BOOKS_PER_PAGE);  // Calculate remaining books
        // Update the button text and state
        showMoreButton.innerHTML = `
            <span>Show more</span>
            <span class="list__remaining"> (${remainingBooks > 0 ? remainingBooks : 0})</span>`;
        showMoreButton.disabled = remainingBooks <= 0;  // Disable button if no more books
    },

    // Function to handle search form submission
    handleSearchSubmit(event) {
        event.preventDefault();  // Prevent default form submission
        const formData = new FormData(event.target);  // Get form data
        const filters = Object.fromEntries(formData);  // Convert form data to an object
        // Filter books based on the filters applied
        const result = books.filter(book => this.filterBooks(book, filters));

        this.matches = result;  // Update matches with the filtered result
        this.page = 1;  // Reset page to 1

        // Show or hide message based on the result
        document.querySelector('[data-list-message]').classList.toggle('list__message_show', result.length < 1);
        // Populate the book previews with the filtered results
        this.populateBookPreviews(result.slice(0, BOOKS_PER_PAGE));
        this.updateShowMoreButton();  // Update the "Show more" button
        window.scrollTo({ top: 0, behavior: 'smooth' });  // Smooth scroll to top
        document.querySelector('[data-search-overlay]').open = false;  // Close search overlay
    },

    // Function to filter books based on given filters
    filterBooks(book, filters) {
        // Check for genre, title, and author matches
        const genreMatch = filters.genre === 'any' || book.genres.includes(filters.genre);
        const titleMatch = filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase());
        const authorMatch = filters.author === 'any' || book.author === filters.author;

        // Return true if all matches are found
        return titleMatch && authorMatch && genreMatch;
    },

    // Function to handle the "Show more" button click
    handleShowMoreClick() {
        // Get the next set of books based on the current page
        const nextBooks = this.matches.slice(this.page * BOOKS_PER_PAGE, (this.page + 1) * BOOKS_PER_PAGE);
        this.populateBookPreviews(nextBooks);  // Populate with the next books
        this.page++;  // Increment the page count
        this.updateShowMoreButton();  // Update the button state
    },

    // Function to handle individual book preview clicks
    handleBookPreviewClick(event) {
        const pathArray = Array.from(event.composedPath());  // Get the event path
        const activeNode = pathArray.find(node => node?.dataset?.preview);  // Find the clicked node with a data-preview attribute
        
        if (activeNode) {
            const activeBook = books.find(book => book.id === activeNode.dataset.preview);  // Find the corresponding book
            if (activeBook) {
                this.displayBookDetails(activeBook);  // Display the book's details
            }
        }
    },

    // Function to display details of the selected book
    displayBookDetails(activeBook) {
        document.querySelector('[data-list-active]').open = true;  // Open the book details overlay
        document.querySelector('[data-list-blur]').src = activeBook.image;  // Set the blurred background image
        document.querySelector('[data-list-image]').src = activeBook.image;  // Set the main book image
        document.querySelector('[data-list-title]').innerText = activeBook.title;  // Set the book title
        document.querySelector('[data-list-subtitle]').innerText = `${authors[activeBook.author]} (${new Date(activeBook.published).getFullYear()})`;  // Set the author and publication year
        document.querySelector('[data-list-description]').innerText = activeBook.description;  // Set the book description
    },

    // Function to set up event listeners
    setupEventListeners() {
        // Event listener for canceling the search overlay
        document.querySelector('[data-search-cancel]').addEventListener('click', () => {
            document.querySelector('[data-search-overlay]').open = false;  // Close the search overlay
        });

        // Event listener for canceling the settings overlay
        document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
            document.querySelector('[data-settings-overlay]').open = false;  // Close the settings overlay
        });

        // Event listener for opening the search overlay
        document.querySelector('[data-header-search]').addEventListener('click', () => {
            document.querySelector('[data-search-overlay]').open = true;  // Open the search overlay
            document.querySelector('[data-search-title]').focus();  // Focus on the search input
        });

        // Event listener for opening the settings overlay
        document.querySelector('[data-header-settings]').addEventListener('click', () => {
            document.querySelector('[data-settings-overlay]').open = true;  // Open the settings overlay
        });

        // Event listener for closing the book details overlay
        document.querySelector('[data-list-close]').addEventListener('click', () => {
            document.querySelector('[data-list-active]').open = false;  // Close the details overlay
        });

        // Event listener for applying theme settings
        document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
            event.preventDefault();  // Prevent default form submission
            const formData = new FormData(event.target);  // Get form data
            const { theme } = Object.fromEntries(formData);  // Extract theme from form data
            this.applyTheme(theme);  // Apply the selected theme
            document.querySelector('[data-settings-overlay]').open = false;  // Close the settings overlay
        });

        // Event listeners for search form and "Show more" button
        document.querySelector('[data-search-form]').addEventListener('submit', this.handleSearchSubmit.bind(this));
        document.querySelector('[data-list-button]').addEventListener('click', this.handleShowMoreClick.bind(this));
        document.querySelector('[data-list-items]').addEventListener('click', this.handleBookPreviewClick.bind(this));
    },

    // Function to apply the selected theme
    applyTheme(theme) {
        const isNight = theme === 'night';  // Check if the selected theme is night mode
        // Update CSS variables for theme colors
        document.documentElement.style.setProperty('--color-dark', isNight ? '255, 255, 255' : '10, 10, 20');
        document.documentElement.style.setProperty('--color-light', isNight ? '10, 10, 20' : '255, 255, 255');
    }
};

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => { BookApp.init(); });
