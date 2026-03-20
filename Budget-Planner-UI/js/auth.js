export function getToken() {
    return localStorage.getItem('budgetToken');
}

export function setToken(token) {
    localStorage.setItem('budgetToken', token);
}

export function clearToken() {
    localStorage.removeItem('budgetToken');
    localStorage.removeItem('budgetUser');
}

export function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
    };
}