const BASE_URL = import.meta.env.VITE_API_URL || (
  window.location.hostname === "localhost"
    ? "http://localhost:4000"
    : "https://caffelinodashboardd.onrender.com"
);

const getHeaders = (isFormData = false) => {
  const token = localStorage.getItem('eventToken') || localStorage.getItem('token');
  const headers: Record<string, string> = {};
  
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
};

export const api = {
  get: async (url: string) => {
    const res = await fetch(`${BASE_URL}${url}`, {
      headers: getHeaders(),
      credentials: 'include'
    });
    return res.json();
  },
  post: async (url: string, data: any) => {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: "POST",
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data)
    });
    return res.json();
  },
  postForm: async (url: string, formData: FormData) => {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: "POST",
      headers: getHeaders(true),
      credentials: 'include',
      body: formData
    });
    return res.json();
  },
  patch: async (url: string, data: any) => {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: "PATCH",
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data)
    });
    return res.json();
  },
  put: async (url: string, data: any) => {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: "PUT",
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data)
    });
    return res.json();
  },
  putForm: async (url: string, formData: FormData) => {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: "PUT",
      headers: getHeaders(true),
      credentials: 'include',
      body: formData
    });
    return res.json();
  },
  delete: async (url: string) => {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: "DELETE",
      headers: getHeaders(),
      credentials: 'include'
    });
    return res.json();
  }
};
