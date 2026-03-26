const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const api = {
  get: async (url: string) => {
    const res = await fetch(`${BASE_URL}${url}`, {
      credentials: 'include'
    });
    return res.json();
  },
  post: async (url: string, data: any) => {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    return res.json();
  },
  postForm: async (url: string, formData: FormData) => {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: "POST",
      credentials: 'include',
      body: formData
    });
    return res.json();
  },
  patch: async (url: string, data: any) => {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    return res.json();
  },
  put: async (url: string, data: any) => {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    return res.json();
  },
  putForm: async (url: string, formData: FormData) => {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: "PUT",
      credentials: 'include',
      body: formData
    });
    return res.json();
  },
  delete: async (url: string) => {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: "DELETE",
      credentials: 'include'
    });
    return res.json();
  }
};
