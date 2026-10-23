import { apiClient } from './apiClient';

export { apiClient };
export default apiClient;

export const authService = apiClient.auth;
export const coursesService = apiClient.courses;
export const booksService = apiClient.books;
export const streamService = apiClient.stream;
export const cartService = apiClient.cart;
export const couponsService = apiClient.coupons;
export const ordersService = apiClient.orders;
export const paymentService = apiClient.payment;
export const notesService = apiClient.notes;
export const qaService = apiClient.qa;
export const adminService = apiClient.admin;
export const aiService = apiClient.ai;
export const certificateService = apiClient.certificates;
