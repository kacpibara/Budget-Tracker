import { getAuthHeaders, clearToken } from './auth.js';

export const API_URL = 'https://budget-tracker-njeb.onrender.com/expenses';
export const AUTH_URL = 'https://budget-tracker-njeb.onrender.com/auth';

export function handleApiError(response, logoutCallback) {
    if (response.status === 401 || response.status === 403) { 
        alert("Your session has expired or is invalid. Please log in again.");
        clearToken();
        logoutCallback(); 
        return true;
    }
    return false;
}

export async function fetchTransactionsApi(logoutCallback) {
    const response = await fetch(API_URL, { headers: getAuthHeaders() });
    if (handleApiError(response, logoutCallback)) return null;
    return response.json();
}

export async function addTransactionApi(transactionData, logoutCallback) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(transactionData)
    });
    if (handleApiError(response, logoutCallback)) return null;
    return response;
}

export async function deleteTransactionApi(id, logoutCallback) {
    const response = await fetch(`${API_URL}/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders() 
    });
    if (handleApiError(response, logoutCallback)) return null;
    return response;
}

export async function deleteAllTransactionsApi(logoutCallback) {
    const response = await fetch(API_URL, { 
        method: 'DELETE',
        headers: getAuthHeaders() 
    });
    if (handleApiError(response, logoutCallback)) return null;
    return response;
}

export async function updateTransactionApi(id, updatedData, logoutCallback) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedData)
    });
    if (handleApiError(response, logoutCallback)) return null;
    return response;
}