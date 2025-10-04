// Modern JavaScript Features Demo

// Optional Chaining (Widely Available)
const user = {
    profile: {
        name: 'John Doe',
        settings: {
            theme: 'dark'
        }
    }
};

// Safe property access
const theme = user?.profile?.settings?.theme ?? 'light';
console.log('User theme:', theme);

// Nullish Coalescing (Widely Available)
const apiUrl = process.env.API_URL ?? 'https://api.example.com';
const timeout = process.env.TIMEOUT ?? 5000;

// Async/Await (Widely Available)
async function fetchUserData(userId) {
    try {
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
}

// Destructuring Assignment (Widely Available)
const { name, email, age } = user.profile;
const [first, second, ...rest] = [1, 2, 3, 4, 5];

// Spread Operator (Widely Available)
const numbers = [1, 2, 3];
const moreNumbers = [...numbers, 4, 5, 6];

const userInfo = {
    ...user.profile,
    lastLogin: new Date().toISOString()
};

// Arrow Functions (Widely Available)
const add = (a, b) => a + b;
const multiply = (x, y) => {
    return x * y;
};

// ES6 Classes (Widely Available)
class UserManager {
    constructor(users = []) {
        this.users = users;
    }

    addUser(user) {
        this.users.push(user);
    }

    findUser(id) {
        return this.users.find(user => user.id === id);
    }

    async saveToStorage() {
        try {
            await localStorage.setItem('users', JSON.stringify(this.users));
        } catch (error) {
            console.error('Failed to save users:', error);
        }
    }
}

// ES6 Modules (Widely Available)
export const API_BASE_URL = 'https://api.example.com';
export const DEFAULT_TIMEOUT = 5000;

export class ApiClient {
    constructor(baseUrl = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    async get(endpoint) {
        const response = await fetch(`${this.baseUrl}${endpoint}`);
        return response.json();
    }

    async post(endpoint, data) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        return response.json();
    }
}

// Promises (Widely Available)
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Fetch API (Widely Available)
async function loadData() {
    try {
        const [users, posts, comments] = await Promise.all([
            fetch('/api/users').then(res => res.json()),
            fetch('/api/posts').then(res => res.json()),
            fetch('/api/comments').then(res => res.json())
        ]);

        return { users, posts, comments };
    } catch (error) {
        console.error('Failed to load data:', error);
        return { users: [], posts: [], comments: [] };
    }
}

// Local Storage (Widely Available)
function saveUserPreferences(preferences) {
    try {
        localStorage.setItem('userPreferences', JSON.stringify(preferences));
    } catch (error) {
        console.error('Failed to save preferences:', error);
    }
}

function loadUserPreferences() {
    try {
        const stored = localStorage.getItem('userPreferences');
        return stored ? JSON.parse(stored) : {};
    } catch (error) {
        console.error('Failed to load preferences:', error);
        return {};
    }
}

// Session Storage (Widely Available)
function saveSessionData(data) {
    try {
        sessionStorage.setItem('sessionData', JSON.stringify(data));
    } catch (error) {
        console.error('Failed to save session data:', error);
    }
}

// Event Listeners (Widely Available)
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    
    // Dialog functionality
    const dialogButton = document.getElementById('dialog-button');
    const dialog = document.getElementById('demo-dialog');
    const closeDialog = document.getElementById('close-dialog');

    if (dialogButton && dialog) {
        dialogButton.addEventListener('click', () => {
            dialog.showModal();
        });
    }

    if (closeDialog && dialog) {
        closeDialog.addEventListener('click', () => {
            dialog.close();
        });
    }

    // Query Selector (Widely Available)
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.addEventListener('click', () => {
            console.log(`Card ${index + 1} clicked`);
        });
    });

    // Add some interactive features
    const gridItems = document.querySelectorAll('.grid-item');
    gridItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'scale(1.05)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'scale(1)';
        });
    });
});

// Modern array methods
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Array methods (Widely Available)
const doubled = numbers.map(n => n * 2);
const evens = numbers.filter(n => n % 2 === 0);
const sum = numbers.reduce((acc, n) => acc + n, 0);
const hasEven = numbers.some(n => n % 2 === 0);
const allPositive = numbers.every(n => n > 0);

console.log('Doubled:', doubled);
console.log('Evens:', evens);
console.log('Sum:', sum);
console.log('Has even:', hasEven);
console.log('All positive:', allPositive);

// Template Literals (Widely Available)
const userName = 'John';
const userAge = 30;
const message = `Hello, ${userName}! You are ${userAge} years old.`;

// Default Parameters (Widely Available)
function greet(name = 'World', greeting = 'Hello') {
    return `${greeting}, ${name}!`;
}

// Rest Parameters (Widely Available)
function sumAll(...numbers) {
    return numbers.reduce((acc, num) => acc + num, 0);
}

// Export for module usage
export {
    UserManager,
    ApiClient,
    loadData,
    saveUserPreferences,
    loadUserPreferences,
    saveSessionData,
    greet,
    sumAll
};
